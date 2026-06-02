from __future__ import annotations

import json
import math
from numbers import Integral, Real
from datetime import datetime, timezone
from pathlib import Path

import duckdb


SOURCE_URL = "https://vishal.t3.tigrisfiles.io/sqlroom/Ad_data.parquet"
OUTPUT_PATH = Path("public/studios/ad-spend-explorer/data/ad_spend_dashboard.json")
CUTOFF_DATE = "2022-12-01"


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


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect()
    con.execute("LOAD httpfs")
    rel = f"read_parquet('{SOURCE_URL}')"
    complete = f"Date <= DATE '{CUTOFF_DATE}'"
    base = f"FROM {rel} WHERE {complete}"

    overview = fetch_records(
        con,
        f"""
        SELECT
          count(*) AS rows,
          min(Date) AS min_date,
          max(Date) AS max_date,
          count(DISTINCT Date) AS months,
          sum(dollar_spent) AS spend,
          count(DISTINCT Industry_Group) AS industry_groups,
          count(DISTINCT ADVERTISER) AS advertisers,
          count(DISTINCT BRAND) AS brands,
          count(DISTINCT PRODUCT) AS products
        {base}
        """,
    )[0]

    excluded = fetch_records(
        con,
        f"""
        SELECT
          count(*) AS rows,
          min(Date) AS min_date,
          max(Date) AS max_date,
          count(DISTINCT Date) AS months,
          sum(dollar_spent) AS spend
        FROM {rel}
        WHERE Date > DATE '{CUTOFF_DATE}'
        """,
    )[0]

    annual_totals = fetch_records(
        con,
        f"""
        SELECT
          date_part('year', Date)::INT AS year,
          sum(dollar_spent) AS spend,
          count(DISTINCT ADVERTISER) AS advertisers,
          count(DISTINCT BRAND) AS brands
        {base}
        GROUP BY 1
        ORDER BY 1
        """,
    )

    annual_media = fetch_records(
        con,
        f"""
        WITH x AS (
          SELECT
            date_part('year', Date)::INT AS year,
            Media_Group AS media,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2
        )
        SELECT
          year,
          media,
          spend,
          spend / sum(spend) OVER (PARTITION BY year) AS share
        FROM x
        ORDER BY year, spend DESC
        """,
    )

    industry_summary = fetch_records(
        con,
        f"""
        WITH source AS (
          SELECT
            Industry_Group AS industry,
            date_part('year', Date)::INT AS year,
            ADVERTISER AS advertiser,
            BRAND AS brand,
            PRODUCT AS product,
            Media_Group AS media,
            dollar_spent AS spend
          {base}
        ),
        totals AS (
          SELECT
            industry,
            sum(spend) AS spend,
            count(*) AS rows,
            count(DISTINCT advertiser) AS advertisers,
            count(DISTINCT brand) AS brands,
            count(DISTINCT product) AS products
          FROM source
          GROUP BY 1
        ),
        yearly AS (
          SELECT
            industry,
            sum(CASE WHEN year = 2019 THEN spend ELSE 0 END) AS spend_2019,
            sum(CASE WHEN year = 2020 THEN spend ELSE 0 END) AS spend_2020,
            sum(CASE WHEN year = 2022 THEN spend ELSE 0 END) AS spend_2022
          FROM source
          GROUP BY 1
        ),
        media_mix AS (
          SELECT
            industry,
            sum(CASE WHEN year = 2019 AND media = 'Digital' THEN spend ELSE 0 END)
              / nullif(sum(CASE WHEN year = 2019 THEN spend ELSE 0 END), 0) AS digital_share_2019,
            sum(CASE WHEN year = 2022 AND media = 'Digital' THEN spend ELSE 0 END)
              / nullif(sum(CASE WHEN year = 2022 THEN spend ELSE 0 END), 0) AS digital_share_2022,
            sum(CASE WHEN year = 2019 AND media = 'Television' THEN spend ELSE 0 END)
              / nullif(sum(CASE WHEN year = 2019 THEN spend ELSE 0 END), 0) AS tv_share_2019,
            sum(CASE WHEN year = 2022 AND media = 'Television' THEN spend ELSE 0 END)
              / nullif(sum(CASE WHEN year = 2022 THEN spend ELSE 0 END), 0) AS tv_share_2022
          FROM source
          GROUP BY 1
        ),
        advertiser_rank AS (
          SELECT
            industry,
            advertiser,
            sum(spend) AS advertiser_spend,
            row_number() OVER (PARTITION BY industry ORDER BY sum(spend) DESC) AS rn
          FROM source
          GROUP BY 1, 2
        ),
        concentration AS (
          SELECT
            industry,
            max(CASE WHEN rn = 1 THEN advertiser ELSE NULL END) AS top_advertiser,
            max(CASE WHEN rn = 1 THEN advertiser_spend ELSE NULL END) AS top_advertiser_spend,
            sum(CASE WHEN rn <= 5 THEN advertiser_spend ELSE 0 END) AS top5_spend
          FROM advertiser_rank
          GROUP BY 1
        )
        SELECT
          totals.industry,
          totals.spend,
          totals.rows,
          totals.advertisers,
          totals.brands,
          totals.products,
          yearly.spend_2019,
          yearly.spend_2020,
          yearly.spend_2022,
          yearly.spend_2020 / nullif(yearly.spend_2019, 0) - 1 AS pct_change_2019_2020,
          yearly.spend_2022 / nullif(yearly.spend_2019, 0) - 1 AS pct_change_2019_2022,
          media_mix.digital_share_2019,
          media_mix.digital_share_2022,
          media_mix.digital_share_2022 - media_mix.digital_share_2019 AS digital_share_delta,
          media_mix.tv_share_2019,
          media_mix.tv_share_2022,
          media_mix.tv_share_2022 - media_mix.tv_share_2019 AS tv_share_delta,
          concentration.top_advertiser,
          concentration.top_advertiser_spend / nullif(totals.spend, 0) AS top_advertiser_share,
          concentration.top5_spend / nullif(totals.spend, 0) AS top5_share
        FROM totals
        JOIN yearly USING (industry)
        JOIN media_mix USING (industry)
        JOIN concentration USING (industry)
        ORDER BY totals.spend DESC
        """,
    )

    monthly_media = fetch_records(
        con,
        f"""
        SELECT
          Industry_Group AS industry,
          strftime(Date, '%Y-%m') AS month,
          Media_Group AS media,
          sum(dollar_spent) AS spend
        {base}
        GROUP BY 1, 2, 3
        ORDER BY 1, 2, 3
        """,
    )

    industry_annual_media = fetch_records(
        con,
        f"""
        WITH x AS (
          SELECT
            Industry_Group AS industry,
            date_part('year', Date)::INT AS year,
            Media_Group AS media,
            sum(dollar_spent) AS spend
          {base}
          GROUP BY 1, 2, 3
        )
        SELECT
          industry,
          year,
          media,
          spend,
          spend / sum(spend) OVER (PARTITION BY industry, year) AS share
        FROM x
        ORDER BY industry, year, spend DESC
        """,
    )

    advertiser_summary = fetch_records(
        con,
        f"""
        WITH source AS (
          SELECT
            Industry_Group AS industry,
            date_part('year', Date)::INT AS year,
            ADVERTISER AS advertiser,
            BRAND AS brand,
            Media_Group AS media,
            Date,
            dollar_spent AS spend
          {base}
        ),
        adv AS (
          SELECT
            industry,
            advertiser,
            sum(spend) AS spend,
            count(DISTINCT Date) AS months_present,
            count(DISTINCT media) AS media_groups,
            count(DISTINCT brand) AS brands,
            sum(CASE WHEN year = 2019 THEN spend ELSE 0 END) AS spend_2019,
            sum(CASE WHEN year = 2020 THEN spend ELSE 0 END) AS spend_2020,
            sum(CASE WHEN year = 2022 THEN spend ELSE 0 END) AS spend_2022,
            sum(CASE WHEN media = 'Television' THEN spend ELSE 0 END) AS television_spend,
            sum(CASE WHEN media = 'Digital' THEN spend ELSE 0 END) AS digital_spend,
            sum(CASE WHEN media = 'Magazines' THEN spend ELSE 0 END) AS magazine_spend,
            sum(CASE WHEN media = 'Radio' THEN spend ELSE 0 END) AS radio_spend
          FROM source
          GROUP BY 1, 2
        ),
        ranked AS (
          SELECT
            *,
            row_number() OVER (PARTITION BY industry ORDER BY spend DESC) AS rank,
            spend / sum(spend) OVER (PARTITION BY industry) AS share
          FROM adv
        )
        SELECT
          industry,
          rank,
          advertiser,
          spend,
          share,
          months_present,
          media_groups,
          brands,
          spend_2019,
          spend_2020,
          spend_2022,
          spend_2020 / nullif(spend_2019, 0) - 1 AS pct_change_2019_2020,
          spend_2022 / nullif(spend_2019, 0) - 1 AS pct_change_2019_2022,
          television_spend / nullif(spend, 0) AS television_share,
          digital_spend / nullif(spend, 0) AS digital_share,
          magazine_spend / nullif(spend, 0) AS magazine_share,
          radio_spend / nullif(spend, 0) AS radio_share
        FROM ranked
        WHERE rank <= 30
        ORDER BY industry, rank
        """,
    )

    advertiser_monthly = fetch_records(
        con,
        f"""
        WITH top_adv AS (
          SELECT industry, advertiser
          FROM (
            SELECT
              Industry_Group AS industry,
              ADVERTISER AS advertiser,
              row_number() OVER (
                PARTITION BY Industry_Group
                ORDER BY sum(dollar_spent) DESC
              ) AS rn
            {base}
            GROUP BY 1, 2
          )
          WHERE rn <= 10
        )
        SELECT
          Industry_Group AS industry,
          ADVERTISER AS advertiser,
          strftime(Date, '%Y-%m') AS month,
          Media_Group AS media,
          sum(dollar_spent) AS spend
        FROM {rel}
        WHERE {complete}
          AND (Industry_Group, ADVERTISER) IN (SELECT industry, advertiser FROM top_adv)
        GROUP BY 1, 2, 3, 4
        ORDER BY 1, 2, 3, 4
        """,
    )

    mover_rows = fetch_records(
        con,
        f"""
        WITH source AS (
          SELECT
            Industry_Group AS industry,
            ADVERTISER AS advertiser,
            date_part('year', Date)::INT AS year,
            dollar_spent AS spend
          {base}
        ),
        yearly AS (
          SELECT
            industry,
            advertiser,
            sum(CASE WHEN year = 2019 THEN spend ELSE 0 END) AS spend_2019,
            sum(CASE WHEN year = 2020 THEN spend ELSE 0 END) AS spend_2020,
            sum(CASE WHEN year = 2022 THEN spend ELSE 0 END) AS spend_2022
          FROM source
          GROUP BY 1, 2
        ),
        filtered AS (
          SELECT
            *,
            spend_2020 - spend_2019 AS delta_2019_2020,
            spend_2022 - spend_2019 AS delta_2019_2022,
            spend_2020 / nullif(spend_2019, 0) - 1 AS pct_change_2019_2020,
            spend_2022 / nullif(spend_2019, 0) - 1 AS pct_change_2019_2022
          FROM yearly
          WHERE spend_2019 >= 1000000 OR spend_2020 >= 1000000 OR spend_2022 >= 1000000
        ),
        ranked AS (
          SELECT
            *,
            row_number() OVER (PARTITION BY industry ORDER BY delta_2019_2020 DESC) AS riser_rank,
            row_number() OVER (PARTITION BY industry ORDER BY delta_2019_2020 ASC) AS decliner_rank,
            row_number() OVER (PARTITION BY industry ORDER BY delta_2019_2022 DESC) AS recovery_rank
          FROM filtered
        )
        SELECT
          industry,
          advertiser,
          spend_2019,
          spend_2020,
          spend_2022,
          delta_2019_2020,
          pct_change_2019_2020,
          delta_2019_2022,
          pct_change_2019_2022,
          CASE
            WHEN riser_rank <= 8 THEN '2020 riser'
            WHEN decliner_rank <= 8 THEN '2020 decliner'
            WHEN recovery_rank <= 8 THEN '2022 recovery'
            ELSE NULL
          END AS mover_type
        FROM ranked
        WHERE riser_rank <= 8 OR decliner_rank <= 8 OR recovery_rank <= 8
        ORDER BY industry, mover_type, abs(delta_2019_2020) DESC
        """,
    )

    brand_examples = fetch_records(
        con,
        f"""
        WITH top_adv AS (
          SELECT industry, advertiser
          FROM (
            SELECT
              Industry_Group AS industry,
              ADVERTISER AS advertiser,
              row_number() OVER (
                PARTITION BY Industry_Group
                ORDER BY sum(dollar_spent) DESC
              ) AS rn
            {base}
            GROUP BY 1, 2
          )
          WHERE rn <= 12
        ),
        ranked AS (
          SELECT
            Industry_Group AS industry,
            ADVERTISER AS advertiser,
            BRAND AS brand,
            sum(dollar_spent) AS spend,
            row_number() OVER (
              PARTITION BY Industry_Group, ADVERTISER
              ORDER BY sum(dollar_spent) DESC
            ) AS rank
          FROM {rel}
          WHERE {complete}
            AND (Industry_Group, ADVERTISER) IN (SELECT industry, advertiser FROM top_adv)
          GROUP BY 1, 2, 3
        )
        SELECT industry, advertiser, rank, brand, spend
        FROM ranked
        WHERE rank <= 5
        ORDER BY industry, advertiser, rank
        """,
    )

    payload = {
        "meta": {
            "title": "Industry Ad Spend Explorer",
            "source": SOURCE_URL,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "cutoffDate": CUTOFF_DATE,
            "notes": [
                "Dashboard excludes Jan-Jun 2023 so the default view ends at the last complete calendar year, Dec 2022.",
                "Rows are closer to month + product + media group than month + advertiser + media group; advertiser views aggregate across product rows.",
            ],
        },
        "overview": overview,
        "excludedPartialPeriod": excluded,
        "annualTotals": annual_totals,
        "annualMedia": annual_media,
        "industries": industry_summary,
        "monthlyMedia": monthly_media,
        "industryAnnualMedia": industry_annual_media,
        "advertisers": advertiser_summary,
        "advertiserMonthly": advertiser_monthly,
        "movers": mover_rows,
        "brandExamples": brand_examples,
    }

    OUTPUT_PATH.write_text(json.dumps(clean_payload(payload), separators=(",", ":"), allow_nan=False), encoding="utf-8")
    size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(f"Wrote {OUTPUT_PATH} ({size_kb:,.1f} KB)")


if __name__ == "__main__":
    main()
