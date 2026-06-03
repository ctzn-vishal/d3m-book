from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from numbers import Integral, Real
from pathlib import Path

import duckdb


SOURCE_URL = "https://vishal.t3.tigrisfiles.io/sqlroom/by_firm_day_pickupzone.parquet"
OUTPUT_PATH = Path("public/studios/nyc-taxi-covid-emergency/data/taxi_covid_dashboard.json")

NYC_EMERGENCY_DATE = "2020-03-12"
WINDOWS = {
    "pre": {
        "label": "Before emergency",
        "start": "2020-02-01",
        "end": "2020-03-11",
    },
    "emergency_week": {
        "label": "Emergency week",
        "start": "2020-03-12",
        "end": "2020-03-18",
    },
    "late_april": {
        "label": "Late April floor",
        "start": "2020-04-24",
        "end": "2020-04-30",
    },
}

FIRMS = [
    {
        "code": "CORE",
        "name": "Uber + Lyft",
        "shortName": "Uber + Lyft",
        "color": "#22242A",
        "description": "Aggregate of HV0003 and HV0005.",
    },
    {
        "code": "HV0003",
        "name": "Uber",
        "shortName": "Uber",
        "color": "#2563A6",
        "description": "HV0003 in the TLC high-volume FHV data dictionary.",
    },
    {
        "code": "HV0005",
        "name": "Lyft",
        "shortName": "Lyft",
        "color": "#B83280",
        "description": "HV0005 in the TLC high-volume FHV data dictionary.",
    },
    {
        "code": "HV0004",
        "name": "Via",
        "shortName": "Via",
        "color": "#2F8F7B",
        "description": "HV0004 in the TLC high-volume FHV data dictionary.",
    },
]


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


def metric_select(prefix: str = "") -> str:
    rides = f"sum({prefix}total_rides)"
    miles = f"sum({prefix}total_miles)"
    fare = f"sum({prefix}total_fare)"
    tolls = f"sum({prefix}total_tolls)"
    tips = f"sum({prefix}total_tips)"
    tipped_trips = f"sum({prefix}proportion_with_tips * {prefix}total_rides)"
    return f"""
      {rides}::DOUBLE AS rides,
      {miles}::DOUBLE AS miles,
      {fare}::DOUBLE AS fare,
      {tolls}::DOUBLE AS tolls,
      {tips}::DOUBLE AS tips,
      {fare} / nullif({rides}, 0) AS fare_per_ride,
      {miles} / nullif({rides}, 0) AS miles_per_ride,
      {tips} / nullif({rides}, 0) AS tips_per_ride,
      {tips} / nullif({fare}, 0) AS tip_rate,
      {tipped_trips} / nullif({rides}, 0) AS tipped_trip_share,
      {tips} / nullif({tipped_trips}, 0) AS conditional_tip_per_tipped_trip
    """


def add_window_rates(rows: list[dict]) -> list[dict]:
    days_by_window = {
        key: (
            datetime.fromisoformat(value["end"]) - datetime.fromisoformat(value["start"])
        ).days
        + 1
        for key, value in WINDOWS.items()
    }
    for row in rows:
        days = days_by_window.get(row["window"], row.get("days") or 1)
        row["days"] = days
        for metric in ("rides", "miles", "fare", "tolls", "tips"):
            value = row.get(metric)
            row[f"{metric}_per_day"] = value / days if value is not None and days else None
    return rows


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect()
    con.execute("LOAD httpfs")
    rel = f"read_parquet('{SOURCE_URL}')"

    overview = fetch_records(
        con,
        f"""
        SELECT
          count(*) AS rows,
          min(ride_date) AS min_date,
          max(ride_date) AS max_date,
          count(DISTINCT ride_date) AS days,
          count(DISTINCT Zone) AS zones,
          count(DISTINCT Borough) AS boroughs,
          count(DISTINCT firm) AS firms,
          {metric_select()}
        FROM {rel}
        """,
    )[0]

    daily_firm = fetch_records(
        con,
        f"""
        SELECT
          ride_date AS date,
          firm AS group_code,
          {metric_select()}
        FROM {rel}
        GROUP BY 1, 2
        ORDER BY 1, 2
        """,
    )

    daily_groups = fetch_records(
        con,
        f"""
        WITH grouped AS (
          SELECT ride_date, firm AS group_code, * EXCLUDE (ride_date, firm)
          FROM {rel}
          UNION ALL
          SELECT ride_date, 'CORE' AS group_code, * EXCLUDE (ride_date, firm)
          FROM {rel}
          WHERE firm IN ('HV0003', 'HV0005')
          UNION ALL
          SELECT ride_date, 'ALL' AS group_code, * EXCLUDE (ride_date, firm)
          FROM {rel}
        )
        SELECT
          ride_date AS date,
          group_code,
          {metric_select()}
        FROM grouped
        GROUP BY 1, 2
        ORDER BY 1, 2
        """,
    )

    window_case = "CASE\n" + "\n".join(
        [
            (
                f"WHEN ride_date BETWEEN DATE '{window['start']}' "
                f"AND DATE '{window['end']}' THEN '{key}'"
            )
            for key, window in WINDOWS.items()
        ]
    ) + "\nEND"

    window_summary = add_window_rates(
        fetch_records(
            con,
            f"""
            WITH grouped AS (
              SELECT {window_case} AS period, firm AS group_code, * EXCLUDE (firm)
              FROM {rel}
              UNION ALL
              SELECT {window_case} AS period, 'CORE' AS group_code, * EXCLUDE (firm)
              FROM {rel}
              WHERE firm IN ('HV0003', 'HV0005')
              UNION ALL
              SELECT {window_case} AS period, 'ALL' AS group_code, * EXCLUDE (firm)
              FROM {rel}
            )
            SELECT
              period AS "window",
              group_code,
              count(DISTINCT ride_date) AS days,
              count(DISTINCT Zone) AS zones,
              {metric_select()}
            FROM grouped
            WHERE period IS NOT NULL
            GROUP BY 1, 2
            ORDER BY 1, 2
            """,
        )
    )

    firm_summary = fetch_records(
        con,
        f"""
        WITH grouped AS (
          SELECT firm AS group_code, * EXCLUDE (firm)
          FROM {rel}
          UNION ALL
          SELECT 'CORE' AS group_code, * EXCLUDE (firm)
          FROM {rel}
          WHERE firm IN ('HV0003', 'HV0005')
          UNION ALL
          SELECT 'ALL' AS group_code, * EXCLUDE (firm)
          FROM {rel}
        )
        SELECT
          group_code,
          count(*) AS rows,
          count(DISTINCT ride_date) AS days,
          count(DISTINCT Zone) AS zones,
          {metric_select()}
        FROM grouped
        GROUP BY 1
        ORDER BY rides DESC
        """,
    )

    daily_borough = fetch_records(
        con,
        f"""
        WITH grouped AS (
          SELECT ride_date, Borough, firm AS group_code, * EXCLUDE (ride_date, Borough, firm)
          FROM {rel}
          UNION ALL
          SELECT ride_date, Borough, 'CORE' AS group_code, * EXCLUDE (ride_date, Borough, firm)
          FROM {rel}
          WHERE firm IN ('HV0003', 'HV0005')
          UNION ALL
          SELECT ride_date, Borough, 'ALL' AS group_code, * EXCLUDE (ride_date, Borough, firm)
          FROM {rel}
        )
        SELECT
          ride_date AS date,
          group_code,
          Borough AS borough,
          {metric_select()}
        FROM grouped
        GROUP BY 1, 2, 3
        ORDER BY 1, 2, 3
        """,
    )

    borough_windows = add_window_rates(
        fetch_records(
            con,
            f"""
            WITH grouped AS (
              SELECT
                {window_case} AS period,
                Borough AS borough,
                firm AS group_code,
                * EXCLUDE (firm, Borough)
              FROM {rel}
              UNION ALL
              SELECT
                {window_case} AS period,
                Borough AS borough,
                'CORE' AS group_code,
                * EXCLUDE (firm, Borough)
              FROM {rel}
              WHERE firm IN ('HV0003', 'HV0005')
              UNION ALL
              SELECT
                {window_case} AS period,
                Borough AS borough,
                'ALL' AS group_code,
                * EXCLUDE (firm, Borough)
              FROM {rel}
            )
            SELECT
              period AS "window",
              group_code,
              borough,
              count(DISTINCT ride_date) AS days,
              count(DISTINCT Zone) AS zones,
              {metric_select()}
            FROM grouped
            WHERE period IS NOT NULL
            GROUP BY 1, 2, 3
            ORDER BY 1, 2, rides DESC
            """,
        )
    )

    zone_drops = fetch_records(
        con,
        f"""
        WITH grouped AS (
          SELECT
            {window_case} AS period,
            Zone AS zone,
            Borough AS borough,
            firm AS group_code,
            * EXCLUDE (firm, Zone, Borough)
          FROM {rel}
          UNION ALL
          SELECT
            {window_case} AS period,
            Zone AS zone,
            Borough AS borough,
            'CORE' AS group_code,
            * EXCLUDE (firm, Zone, Borough)
          FROM {rel}
          WHERE firm IN ('HV0003', 'HV0005')
          UNION ALL
          SELECT
            {window_case} AS period,
            Zone AS zone,
            Borough AS borough,
            'ALL' AS group_code,
            * EXCLUDE (firm, Zone, Borough)
          FROM {rel}
        ),
        by_window AS (
          SELECT
            group_code,
            zone,
            borough,
            period,
            sum(total_rides)::DOUBLE AS rides,
            sum(total_fare)::DOUBLE AS fare,
            count(DISTINCT ride_date) AS days
          FROM grouped
          WHERE period IS NOT NULL
          GROUP BY 1, 2, 3, 4
        ),
        pivoted AS (
          SELECT
            group_code,
            zone,
            borough,
            max(CASE WHEN period = 'pre' THEN rides / nullif(days, 0) END) AS pre_rides_per_day,
            max(CASE WHEN period = 'emergency_week' THEN rides / nullif(days, 0) END) AS emergency_rides_per_day,
            max(CASE WHEN period = 'late_april' THEN rides / nullif(days, 0) END) AS late_april_rides_per_day,
            max(CASE WHEN period = 'pre' THEN fare / nullif(rides, 0) END) AS pre_fare_per_ride,
            max(CASE WHEN period = 'late_april' THEN fare / nullif(rides, 0) END) AS late_april_fare_per_ride
          FROM by_window
          GROUP BY 1, 2, 3
        ),
        ranked AS (
          SELECT
            *,
            pre_rides_per_day - late_april_rides_per_day AS lost_rides_per_day,
            late_april_rides_per_day / nullif(pre_rides_per_day, 0) - 1 AS late_april_change,
            row_number() OVER (
              PARTITION BY group_code
              ORDER BY pre_rides_per_day - late_april_rides_per_day DESC,
                       pre_rides_per_day DESC
            ) AS loss_rank
          FROM pivoted
          WHERE pre_rides_per_day >= 100
        )
        SELECT *
        FROM ranked
        WHERE loss_rank <= 36
        ORDER BY group_code, loss_rank
        """,
    )

    window_lookup = {}
    for row in window_summary:
        window_lookup[(row["group_code"], row["window"])] = row

    for row in firm_summary:
        pre = window_lookup.get((row["group_code"], "pre"), {})
        emergency = window_lookup.get((row["group_code"], "emergency_week"), {})
        late = window_lookup.get((row["group_code"], "late_april"), {})
        row["pre_rides_per_day"] = pre.get("rides_per_day")
        row["emergency_rides_per_day"] = emergency.get("rides_per_day")
        row["late_april_rides_per_day"] = late.get("rides_per_day")
        if row["pre_rides_per_day"]:
            row["emergency_change"] = row["emergency_rides_per_day"] / row["pre_rides_per_day"] - 1
            row["late_april_change"] = row["late_april_rides_per_day"] / row["pre_rides_per_day"] - 1
        else:
            row["emergency_change"] = None
            row["late_april_change"] = None

    payload = {
        "meta": {
            "title": "NYC Taxi/Ride-Hail: COVID Emergency",
            "sourceUrl": SOURCE_URL,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "emergencyDate": NYC_EMERGENCY_DATE,
            "eventMarkers": [
                {
                    "date": "2020-03-07",
                    "label": "NY State emergency",
                    "source": "https://www.governor.ny.gov/news/novel-coronavirus-briefing-governor-cuomo-declares-state-emergency-contain-spread-virus",
                },
                {
                    "date": "2020-03-12",
                    "label": "NYC emergency",
                    "source": "https://www.nyc.gov/assets/home/downloads/pdf/executive-orders/2020/eeo-98.pdf",
                },
                {
                    "date": "2020-03-22",
                    "label": "NY PAUSE",
                    "source": "https://www.governor.ny.gov/news/governor-cuomo-signs-new-york-state-pause-executive-order",
                },
            ],
            "firmCodeSource": "https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_hvfhs.pdf",
            "firms": FIRMS,
            "windows": WINDOWS,
            "metricDefinitions": {
                "rides": "Sum of total_rides at pickup-zone by firm by day grain.",
                "fare_per_ride": "Total fare divided by total rides.",
                "miles_per_ride": "Total miles divided by total rides.",
                "tip_rate": "Total tips divided by total fare.",
                "tipped_trip_share": "Ride-weighted proportion of trips with tips.",
            },
        },
        "overview": overview,
        "firmSummary": firm_summary,
        "windowSummary": window_summary,
        "dailyFirm": daily_firm,
        "dailyGroups": daily_groups,
        "dailyBorough": daily_borough,
        "boroughWindows": borough_windows,
        "zoneDrops": zone_drops,
    }

    OUTPUT_PATH.write_text(json.dumps(clean_payload(payload), indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
