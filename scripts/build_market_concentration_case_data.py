from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from numbers import Integral, Real
from pathlib import Path

import duckdb


SOURCE_URL = "https://vishal.t3.tigrisfiles.io/sqlroom/Ad_data.parquet"
OUTPUT_PATH = Path("app/market-concentration-metrics-case/data/market-concentration.json")
CUTOFF_DATE = "2022-12-01"
DEFAULT_MARKET_FIELD = "INDUSTRY"
MARKET_FIELDS = ["Industry_Group", "INDUSTRY", "MAJOR", "CATEGORY", "SUBCATEGORY"]


def fetch_records(con: duckdb.DuckDBPyConnection, sql: str) -> list[dict]:
    return con.execute(sql).fetchdf().to_dict(orient="records")


def clean_value(value):
    if value is None or isinstance(value, bool):
        return value
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, Real):
        if math.isnan(float(value)) or math.isinf(float(value)):
            return None
        if isinstance(value, Integral):
            return int(value)
        if hasattr(value, "item"):
            return value.item()
        return value
    return value


def clean_payload(value):
    if isinstance(value, dict):
        return {key: clean_payload(item) for key, item in value.items()}
    if isinstance(value, list):
        return [clean_payload(item) for item in value]
    return clean_value(value)


def add_band(row: dict) -> dict:
    hhi = row.get("hhi")
    if hhi is None:
        row["hhi_band"] = "Missing"
    elif hhi > 1800:
        row["hhi_band"] = "Highly concentrated"
    elif hhi >= 1000:
        row["hhi_band"] = "Moderately concentrated"
    else:
        row["hhi_band"] = "Unconcentrated"
    return row


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect()
    con.execute("LOAD httpfs")

    rel = f"read_parquet('{SOURCE_URL}')"
    complete = f"Date <= DATE '{CUTOFF_DATE}' AND dollar_spent > 0"
    base = f"FROM {rel} WHERE {complete}"
    owner_expr = "CASE WHEN PARENT IS NULL OR PARENT = '' OR PARENT = 'PARENT UNKNOWN' THEN ADVERTISER ELSE PARENT END"
    thresholds_sql = "(VALUES (0), (10000), (100000), (1000000)) AS thresholds(min_entity_spend)"

    overview = fetch_records(
        con,
        f"""
        SELECT
          count(*) AS row_count,
          min(Date) AS min_date,
          max(Date) AS max_date,
          count(DISTINCT Date) AS months,
          sum(dollar_spent) AS spend,
          count(DISTINCT Industry_Group) AS industry_groups,
          count(DISTINCT INDUSTRY) AS industries,
          count(DISTINCT MAJOR) AS majors,
          count(DISTINCT CATEGORY) AS categories,
          count(DISTINCT SUBCATEGORY) AS subcategories,
          count(DISTINCT {owner_expr}) AS owner_entities,
          count(DISTINCT PARENT) AS raw_parent_entities,
          count(DISTINCT ADVERTISER) AS advertisers,
          count(DISTINCT BRAND) AS brands,
          count(DISTINCT PRODUCT) AS products,
          sum(CASE WHEN PARENT = 'PARENT UNKNOWN' THEN 1 ELSE 0 END) AS parent_unknown_rows,
          sum(CASE WHEN PARENT = 'PARENT UNKNOWN' THEN dollar_spent ELSE 0 END) AS parent_unknown_spend
        {base}
        """,
    )[0]

    schema = fetch_records(
        con,
        f"""
        SELECT
          column_name,
          column_type
        FROM (DESCRIBE SELECT * FROM {rel})
        """,
    )

    entity_spend_distribution = fetch_records(
        con,
        f"""
        WITH entity AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            {owner_expr} AS entity,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2
        )
        SELECT
          count(*) AS entity_industry_rows,
          quantile_cont(spend, 0.10) AS p10,
          quantile_cont(spend, 0.25) AS p25,
          quantile_cont(spend, 0.50) AS p50,
          quantile_cont(spend, 0.75) AS p75,
          quantile_cont(spend, 0.90) AS p90,
          quantile_cont(spend, 0.99) AS p99,
          max(spend) AS max_spend
        FROM entity
        """,
    )[0]

    industry_metrics = fetch_records(
        con,
        f"""
        WITH entity AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            {owner_expr} AS entity,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2
        ),
        shares AS (
          SELECT
            *,
            spend / sum(spend) OVER (PARTITION BY industry) AS market_share,
            row_number() OVER (PARTITION BY industry ORDER BY spend DESC) AS rn
          FROM entity
        )
        SELECT
          industry,
          count(*) AS owner_entities,
          sum(spend) AS spend,
          max(CASE WHEN rn = 1 THEN entity END) AS leader,
          sum(CASE WHEN rn = 1 THEN market_share ELSE 0 END) AS cr1,
          sum(CASE WHEN rn <= 4 THEN market_share ELSE 0 END) AS cr4,
          sum(CASE WHEN rn <= 8 THEN market_share ELSE 0 END) AS cr8,
          sum(market_share * market_share) * 10000 AS hhi,
          1 / sum(market_share * market_share) AS effective_entities
        FROM shares
        GROUP BY 1
        ORDER BY hhi DESC
        """,
    )
    industry_metrics = [add_band(row) for row in industry_metrics]

    market_definition_sensitivity: list[dict] = []
    for field in MARKET_FIELDS:
        market_definition_sensitivity.extend(
            fetch_records(
                con,
                f"""
                WITH entity AS (
                  SELECT
                    {field} AS market,
                    {owner_expr} AS entity,
                    sum(dollar_spent) AS spend
                  {base}
                  GROUP BY 1, 2
                ),
                shares AS (
                  SELECT
                    *,
                    spend / sum(spend) OVER (PARTITION BY market) AS market_share,
                    row_number() OVER (PARTITION BY market ORDER BY spend DESC) AS rn
                  FROM entity
                ),
                metrics AS (
                  SELECT
                    market,
                    count(*) AS entities,
                    sum(spend) AS spend,
                    max(CASE WHEN rn = 1 THEN entity END) AS leader,
                    sum(CASE WHEN rn = 1 THEN market_share ELSE 0 END) AS cr1,
                    sum(CASE WHEN rn <= 4 THEN market_share ELSE 0 END) AS cr4,
                    sum(market_share * market_share) * 10000 AS hhi,
                    1 / sum(market_share * market_share) AS effective_entities
                  FROM shares
                  GROUP BY 1
                )
                SELECT
                  '{field}' AS field,
                  count(*) AS markets,
                  sum(spend) AS spend,
                  sum(CASE WHEN hhi > 1800 THEN 1 ELSE 0 END) AS high_markets,
                  sum(CASE WHEN hhi BETWEEN 1000 AND 1800 THEN 1 ELSE 0 END) AS moderate_markets,
                  sum(CASE WHEN hhi < 1000 THEN 1 ELSE 0 END) AS unconcentrated_markets,
                  sum(CASE WHEN hhi > 1800 THEN spend ELSE 0 END) / sum(spend) AS high_spend_share,
                  sum(CASE WHEN hhi >= 1000 THEN spend ELSE 0 END) / sum(spend) AS concentrated_spend_share,
                  quantile_cont(spend, 0.5) AS median_spend,
                  quantile_cont(hhi, 0.5) AS median_hhi,
                  quantile_cont(hhi, 0.9) AS p90_hhi,
                  avg(hhi) AS avg_hhi,
                  quantile_cont(cr4, 0.5) AS median_cr4,
                  quantile_cont(entities, 0.5) AS median_entities
                FROM metrics
                """,
            )
        )

    level_comparison = fetch_records(
        con,
        f"""
        WITH source AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            {owner_expr} AS owner_entity,
            ADVERTISER AS advertiser,
            BRAND AS brand,
            dollar_spent AS spend
          {base}
        ),
        levels AS (
          SELECT 'Owner proxy' AS level, industry, owner_entity AS entity, spend FROM source
          UNION ALL
          SELECT 'Advertiser' AS level, industry, advertiser AS entity, spend FROM source
          UNION ALL
          SELECT 'Brand' AS level, industry, brand AS entity, spend FROM source
        ),
        entity AS (
          SELECT level, industry, entity, sum(spend) AS spend
          FROM levels
          GROUP BY 1, 2, 3
        ),
        shares AS (
          SELECT
            *,
            spend / sum(spend) OVER (PARTITION BY level, industry) AS market_share,
            row_number() OVER (PARTITION BY level, industry ORDER BY spend DESC) AS rn
          FROM entity
        ),
        metrics AS (
          SELECT
            level,
            industry,
            count(*) AS entities,
            sum(CASE WHEN rn = 1 THEN market_share ELSE 0 END) AS cr1,
            sum(CASE WHEN rn <= 4 THEN market_share ELSE 0 END) AS cr4,
            sum(market_share * market_share) * 10000 AS hhi
          FROM shares
          GROUP BY 1, 2
        )
        SELECT
          industry,
          max(CASE WHEN level = 'Owner proxy' THEN hhi END) AS owner_hhi,
          max(CASE WHEN level = 'Advertiser' THEN hhi END) AS advertiser_hhi,
          max(CASE WHEN level = 'Brand' THEN hhi END) AS brand_hhi,
          max(CASE WHEN level = 'Owner proxy' THEN cr4 END) AS owner_cr4,
          max(CASE WHEN level = 'Advertiser' THEN cr4 END) AS advertiser_cr4,
          max(CASE WHEN level = 'Owner proxy' THEN entities END) AS owner_entities,
          max(CASE WHEN level = 'Advertiser' THEN entities END) AS advertiser_entities
        FROM metrics
        GROUP BY 1
        ORDER BY owner_hhi DESC
        """,
    )

    annual_metrics = fetch_records(
        con,
        f"""
        WITH entity AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            date_part('year', Date)::INT AS year,
            {owner_expr} AS entity,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2, 3
        ),
        shares AS (
          SELECT
            *,
            spend / sum(spend) OVER (PARTITION BY industry, year) AS market_share,
            row_number() OVER (PARTITION BY industry, year ORDER BY spend DESC) AS rn
          FROM entity
        )
        SELECT
          industry,
          year,
          count(*) AS owner_entities,
          sum(spend) AS spend,
          max(CASE WHEN rn = 1 THEN entity END) AS leader,
          sum(CASE WHEN rn = 1 THEN market_share ELSE 0 END) AS cr1,
          sum(CASE WHEN rn <= 4 THEN market_share ELSE 0 END) AS cr4,
          sum(CASE WHEN rn <= 8 THEN market_share ELSE 0 END) AS cr8,
          sum(market_share * market_share) * 10000 AS hhi,
          1 / sum(market_share * market_share) AS effective_entities
        FROM shares
        GROUP BY 1, 2
        ORDER BY industry, year
        """,
    )
    annual_metrics = [add_band(row) for row in annual_metrics]

    annual_delta = fetch_records(
        con,
        f"""
        WITH entity AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            date_part('year', Date)::INT AS year,
            {owner_expr} AS entity,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2, 3
        ),
        shares AS (
          SELECT
            *,
            spend / sum(spend) OVER (PARTITION BY industry, year) AS market_share,
            row_number() OVER (PARTITION BY industry, year ORDER BY spend DESC) AS rn
          FROM entity
        ),
        metrics AS (
          SELECT
            industry,
            year,
            sum(spend) AS spend,
            max(CASE WHEN rn = 1 THEN entity END) AS leader,
            sum(CASE WHEN rn = 1 THEN market_share ELSE 0 END) AS cr1,
            sum(CASE WHEN rn <= 4 THEN market_share ELSE 0 END) AS cr4,
            sum(market_share * market_share) * 10000 AS hhi
          FROM shares
          GROUP BY 1, 2
        ),
        pvt AS (
          SELECT
            industry,
            max(CASE WHEN year = 2018 THEN hhi END) AS hhi_2018,
            max(CASE WHEN year = 2022 THEN hhi END) AS hhi_2022,
            max(CASE WHEN year = 2018 THEN cr4 END) AS cr4_2018,
            max(CASE WHEN year = 2022 THEN cr4 END) AS cr4_2022,
            max(CASE WHEN year = 2018 THEN leader END) AS leader_2018,
            max(CASE WHEN year = 2022 THEN leader END) AS leader_2022,
            max(CASE WHEN year = 2018 THEN spend END) AS spend_2018,
            max(CASE WHEN year = 2022 THEN spend END) AS spend_2022
          FROM metrics
          GROUP BY 1
        )
        SELECT
          *,
          hhi_2022 - hhi_2018 AS hhi_delta,
          cr4_2022 - cr4_2018 AS cr4_delta,
          spend_2022 / nullif(spend_2018, 0) - 1 AS spend_delta
        FROM pvt
        ORDER BY hhi_delta DESC
        """,
    )

    top_owners = fetch_records(
        con,
        f"""
        WITH entity AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            {owner_expr} AS entity,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2
        ),
        shares AS (
          SELECT
            *,
            spend / sum(spend) OVER (PARTITION BY industry) AS market_share,
            row_number() OVER (PARTITION BY industry ORDER BY spend DESC) AS rn
          FROM entity
        )
        SELECT
          industry,
          rn AS rank,
          entity,
          spend,
          market_share
        FROM shares
        WHERE rn <= 8
        ORDER BY industry, rn
        """,
    )

    media_concentration = fetch_records(
        con,
        f"""
        WITH entity AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            Media_Group AS media,
            {owner_expr} AS entity,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2, 3
        ),
        shares AS (
          SELECT
            *,
            spend / sum(spend) OVER (PARTITION BY industry, media) AS market_share,
            row_number() OVER (PARTITION BY industry, media ORDER BY spend DESC) AS rn
          FROM entity
        )
        SELECT
          industry,
          media,
          count(*) AS owner_entities,
          sum(spend) AS spend,
          max(CASE WHEN rn = 1 THEN entity END) AS leader,
          sum(CASE WHEN rn = 1 THEN market_share ELSE 0 END) AS cr1,
          sum(CASE WHEN rn <= 4 THEN market_share ELSE 0 END) AS cr4,
          sum(market_share * market_share) * 10000 AS hhi
        FROM shares
        GROUP BY 1, 2
        ORDER BY industry, hhi DESC
        """,
    )
    media_concentration = [add_band(row) for row in media_concentration]

    threshold_sensitivity = fetch_records(
        con,
        f"""
        WITH source AS (
          SELECT
            {DEFAULT_MARKET_FIELD} AS industry,
            {owner_expr} AS owner_entity,
            PARENT AS raw_parent,
            ADVERTISER AS advertiser,
            BRAND AS brand,
            dollar_spent AS spend
          {base}
        ),
        levels AS (
          SELECT 'Owner proxy' AS level, industry, owner_entity AS entity, spend FROM source
          UNION ALL
          SELECT 'Raw parent' AS level, industry, raw_parent AS entity, spend FROM source
          UNION ALL
          SELECT 'Advertiser' AS level, industry, advertiser AS entity, spend FROM source
          UNION ALL
          SELECT 'Brand' AS level, industry, brand AS entity, spend FROM source
        ),
        entity_all AS (
          SELECT
            level,
            industry,
            entity,
            sum(spend) AS spend
          FROM levels
          WHERE entity IS NOT NULL AND entity <> ''
          GROUP BY 1, 2, 3
        ),
        totals AS (
          SELECT
            level,
            industry,
            count(*) AS all_entities,
            sum(spend) AS all_spend
          FROM entity_all
          GROUP BY 1, 2
        ),
        retained AS (
          SELECT
            thresholds.min_entity_spend,
            entity_all.level,
            entity_all.industry,
            entity_all.entity,
            entity_all.spend
          FROM entity_all
          CROSS JOIN {thresholds_sql}
          WHERE entity_all.spend >= thresholds.min_entity_spend
        ),
        shares AS (
          SELECT
            retained.*,
            retained.spend / sum(retained.spend) OVER (
              PARTITION BY retained.min_entity_spend, retained.level, retained.industry
            ) AS retained_share,
            retained.spend / totals.all_spend AS full_denominator_share,
            row_number() OVER (
              PARTITION BY retained.min_entity_spend, retained.level, retained.industry
              ORDER BY retained.spend DESC
            ) AS rn
          FROM retained
          JOIN totals USING (level, industry)
        )
        SELECT
          shares.min_entity_spend,
          shares.level,
          shares.industry,
          totals.all_entities,
          count(*) AS retained_entities,
          sum(shares.spend) AS retained_spend,
          totals.all_spend,
          sum(shares.spend) / totals.all_spend AS retained_spend_share,
          max(CASE WHEN rn = 1 THEN entity END) AS leader,
          sum(CASE WHEN rn = 1 THEN retained_share ELSE 0 END) AS cr1,
          sum(CASE WHEN rn <= 4 THEN retained_share ELSE 0 END) AS cr4,
          sum(CASE WHEN rn <= 8 THEN retained_share ELSE 0 END) AS cr8,
          sum(retained_share * retained_share) * 10000 AS hhi,
          sum(full_denominator_share * full_denominator_share) * 10000 AS hhi_full_denominator,
          1 / sum(retained_share * retained_share) AS effective_entities
        FROM shares
        JOIN totals USING (level, industry)
        GROUP BY 1, 2, 3, totals.all_entities, totals.all_spend
        ORDER BY level, industry, min_entity_spend
        """,
    )
    threshold_sensitivity = [add_band(row) for row in threshold_sensitivity]

    pharma_market_drilldown: list[dict] = []
    for field in ["INDUSTRY", "CATEGORY", "SUBCATEGORY", "MICROCATEGORY"]:
        pharma_market_drilldown.extend(
            fetch_records(
                con,
                f"""
                WITH entity AS (
                  SELECT
                    {field} AS market,
                    {owner_expr} AS entity,
                    sum(dollar_spent) AS spend
                  {base}
                    AND Industry_Group = 'Pharmaceuticals'
                  GROUP BY 1, 2
                ),
                shares AS (
                  SELECT
                    *,
                    spend / sum(spend) OVER (PARTITION BY market) AS market_share,
                    row_number() OVER (PARTITION BY market ORDER BY spend DESC) AS rn
                  FROM entity
                )
                SELECT
                  '{field}' AS field,
                  market,
                  count(*) AS owner_entities,
                  sum(spend) AS spend,
                  max(CASE WHEN rn = 1 THEN entity END) AS leader,
                  sum(CASE WHEN rn = 1 THEN market_share ELSE 0 END) AS cr1,
                  sum(CASE WHEN rn <= 4 THEN market_share ELSE 0 END) AS cr4,
                  sum(market_share * market_share) * 10000 AS hhi,
                  1 / sum(market_share * market_share) AS effective_entities
                FROM shares
                GROUP BY 1, 2
                HAVING sum(spend) >= 100000000
                ORDER BY spend DESC, hhi DESC
                """,
            )
        )
    pharma_market_drilldown = [add_band(row) for row in pharma_market_drilldown]

    band_counts = {}
    for row in industry_metrics:
        band_counts[row["hhi_band"]] = band_counts.get(row["hhi_band"], 0) + 1

    payload = {
        "meta": {
            "title": "Market Concentration Metrics in Advertising Spend",
            "source": SOURCE_URL,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "cutoffDate": CUTOFF_DATE,
            "defaultMarketField": DEFAULT_MARKET_FIELD,
            "notes": [
                "The case excludes Jan-Jun 2023 so all trend comparisons end at the last complete calendar year, Dec 2022.",
                "The default market proxy is INDUSTRY. Industry_Group, MAJOR, CATEGORY, and SUBCATEGORY are included as market-definition sensitivity checks.",
                "The headline firm unit is an owner proxy: PARENT when available, otherwise ADVERTISER when PARENT is PARENT UNKNOWN.",
                "The metrics measure concentration of advertising spend within source-defined market buckets, not product-market sales concentration.",
            ],
        },
        "overview": overview,
        "schema": schema,
        "entitySpendDistribution": entity_spend_distribution,
        "bandCounts": band_counts,
        "industryMetrics": industry_metrics,
        "marketDefinitionSensitivity": market_definition_sensitivity,
        "levelComparison": level_comparison,
        "annualMetrics": annual_metrics,
        "annualDelta": annual_delta,
        "topOwners": top_owners,
        "mediaConcentration": media_concentration,
        "thresholdSensitivity": threshold_sensitivity,
        "pharmaMarketDrilldown": pharma_market_drilldown,
    }

    OUTPUT_PATH.write_text(json.dumps(clean_payload(payload), separators=(",", ":"), allow_nan=False), encoding="utf-8")
    size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(f"Wrote {OUTPUT_PATH} ({size_kb:,.1f} KB)")


if __name__ == "__main__":
    main()
