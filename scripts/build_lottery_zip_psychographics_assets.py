from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import FactorAnalysis, PCA
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[2]
APP_ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "case" / "part4" / "psych_zip_baseline.parquet"
OUT = APP_ROOT / "public" / "studios" / "lottery-zip-psychographics" / "data" / "case.json"


BEHAVIOR_FEATURES = [
    "pre_instant_share",
    "pre_quickdraw_share",
    "pre_daily_share",
    "pre_jackpot_share",
    "pre_jackpot_alt_share",
    "pre_rapid_resolution_share",
    "pre_social_channel_share",
    "pre_routine_checkout_share",
    "pre_incidental_share",
    "pre_chain_share",
    "pre_bar_share",
    "pre_liquor_share",
    "pre_convenience_share",
    "pre_grocery_share",
    "pre_pharmacy_share",
    "pre_newsstand_share",
    "pre_gas_share",
    "pre_megaplier_rate",
    "pre_powerplay_rate",
    "pre_jtj_rate",
    "pre_mm_depth_index",
    "pre_general_addon",
    "pre_scratch_payout_rate",
    "pre_draw_payout_rate",
    "pre_weekend_share",
    "pre_dow_entropy",
    "pre_mm_drawday_conc",
    "pre_pb_drawday_conc",
    "pre_portfolio_entropy",
    "pre_portfolio_hhi",
    "pre_channel_entropy",
    "pre_cv_total",
    "pre_autocorr_total",
    "pre_habit_index",
    "pre_speed_entropy",
]


FEATURE_LABELS = {
    "pre_instant_share": "Instant scratch share",
    "pre_quickdraw_share": "Quick Draw share",
    "pre_daily_share": "Daily Numbers share",
    "pre_jackpot_share": "Jackpot draw share",
    "pre_jackpot_alt_share": "Jackpot-alt share",
    "pre_rapid_resolution_share": "Rapid-resolution share",
    "pre_social_channel_share": "Social-channel share",
    "pre_routine_checkout_share": "Routine-checkout share",
    "pre_incidental_share": "Incidental share",
    "pre_chain_share": "Chain retailer context",
    "pre_bar_share": "Bar context",
    "pre_liquor_share": "Liquor-store context",
    "pre_convenience_share": "Convenience context",
    "pre_grocery_share": "Grocery context",
    "pre_pharmacy_share": "Pharmacy context",
    "pre_newsstand_share": "Newsstand context",
    "pre_gas_share": "Gas-station context",
    "pre_megaplier_rate": "Megaplier rate",
    "pre_powerplay_rate": "Power Play rate",
    "pre_jtj_rate": "Jackpot add-on rate",
    "pre_mm_depth_index": "Mega Millions depth",
    "pre_general_addon": "General add-on rate",
    "pre_scratch_payout_rate": "Scratch payout rate",
    "pre_draw_payout_rate": "Draw payout rate",
    "pre_weekend_share": "Weekend share",
    "pre_dow_entropy": "Day-of-week entropy",
    "pre_mm_drawday_conc": "Mega draw-day concentration",
    "pre_pb_drawday_conc": "Powerball draw-day concentration",
    "pre_portfolio_entropy": "Portfolio entropy",
    "pre_portfolio_hhi": "Portfolio HHI",
    "pre_channel_entropy": "Channel entropy",
    "pre_cv_total": "Sales volatility",
    "pre_autocorr_total": "Sales autocorrelation",
    "pre_habit_index": "Habit index",
    "pre_speed_entropy": "Speed entropy",
}


PROFILE_METRICS = {
    "Instant scratch share": "pre_instant_share",
    "Quick Draw share": "pre_quickdraw_share",
    "Daily Numbers share": "pre_daily_share",
    "Jackpot share": "jackpot_combined_share",
    "Add-on rate": "pre_general_addon",
    "Habit index": "pre_habit_index",
    "Portfolio entropy": "pre_portfolio_entropy",
    "Routine checkout": "pre_routine_checkout_share",
    "Social channel": "pre_social_channel_share",
    "Incidental play": "pre_incidental_share",
    "Lottery sales": "pre_total_lottery",
    "Retailer count": "pre_n_retailers",
    "Sales per resident": "sales_per_resident",
    "Median income": "median_income",
    "Poverty rate": "per_underpoverty",
    "College or above": "per_college_above",
    "Black share": "per_black",
    "Hispanic share": "per_hispanic",
    "Population": "total_pop",
}


SEGMENT_STORIES = {
    "daily": {
        "id": "daily",
        "label": "Routine Daily-Number ZIPs",
        "shortLabel": "Daily routine",
        "color": "#5B6068",
        "description": (
            "Daily Numbers, habit index, and social-channel context are high. "
            "The segment is behaviorally regular before it is demographically explained."
        ),
        "strategy": "Read these as routine play neighborhoods, not simply high-sales ZIPs.",
    },
    "convenience": {
        "id": "convenience",
        "label": "Convenience Scratch / Quickdraw ZIPs",
        "shortLabel": "Fast convenience",
        "color": "#2A9D8F",
        "description": (
            "Instant tickets, Quick Draw, retailer density, and routine checkout context "
            "make this the fast-resolution convenience segment."
        ),
        "strategy": "The behavioral signature is speed plus availability.",
    },
    "jackpot": {
        "id": "jackpot",
        "label": "Affluent Jackpot / Incidental ZIPs",
        "shortLabel": "Jackpot incidental",
        "color": "#C85B47",
        "description": (
            "More jackpot, add-on, and incidental play with higher income and education "
            "showing up only after the behavior model is fit."
        ),
        "strategy": "Use this as the contrast case: lottery play can look more episodic and jackpot-led.",
    },
}


BOROUGH_ORDER = ["Manhattan", "Bronx", "Brooklyn", "Queens", "Staten Island"]


def borough_for_zip(z: str) -> str | None:
    if z.startswith(("100", "101", "102")):
        return "Manhattan"
    if z.startswith("103"):
        return "Staten Island"
    if z.startswith("104"):
        return "Bronx"
    if z.startswith("112"):
        return "Brooklyn"
    if z.startswith(("111", "113", "114", "116")) or z in {"11004", "11005"}:
        return "Queens"
    return None


def as_number(value, digits: int | None = None):
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(f):
        return None
    if digits is None:
        return f
    return round(f, digits)


def corr(x: pd.Series, y: pd.Series) -> float | None:
    pair = pd.concat([x, y], axis=1).dropna()
    if len(pair) < 3:
        return None
    return as_number(pair.iloc[:, 0].corr(pair.iloc[:, 1]), 3)


def top_loadings(loadings: np.ndarray, feature_names: list[str], component: int, n: int = 7):
    rows = []
    vals = loadings[:, component]
    for i in np.argsort(vals)[-n:][::-1]:
        rows.append(
            {
                "feature": feature_names[i],
                "label": FEATURE_LABELS[feature_names[i]],
                "loading": as_number(vals[i], 3),
                "direction": "positive",
            }
        )
    for i in np.argsort(vals)[:n]:
        rows.append(
            {
                "feature": feature_names[i],
                "label": FEATURE_LABELS[feature_names[i]],
                "loading": as_number(vals[i], 3),
                "direction": "negative",
            }
        )
    return rows


def varimax(phi: np.ndarray, gamma: float = 1.0, q: int = 50, tol: float = 1e-6):
    p, k = phi.shape
    rotation = np.eye(k)
    d_old = 0
    for _ in range(q):
        loadings = phi @ rotation
        u, s, vh = np.linalg.svd(
            phi.T
            @ (
                loadings**3
                - (gamma / p) * loadings @ np.diag(np.diag(loadings.T @ loadings))
            )
        )
        rotation = u @ vh
        d_new = s.sum()
        if d_old and d_new / d_old < 1 + tol:
            break
        d_old = d_new
    return phi @ rotation, rotation


def clean_record(record: dict):
    out = {}
    for k, v in record.items():
        if isinstance(v, (np.integer,)):
            out[k] = int(v)
        elif isinstance(v, (np.floating, float)):
            out[k] = as_number(v, 6)
        elif pd.isna(v):
            out[k] = None
        else:
            out[k] = v
    return out


def main() -> None:
    df = pd.read_parquet(SOURCE).copy()
    df["zip"] = df["zip"].astype(str)
    df["zip5"] = df["zip"].str.extract(r"(\d+)")[0].str.zfill(5)
    df["borough"] = df["zip5"].map(borough_for_zip)
    df["jackpot_combined_share"] = df["pre_jackpot_share"] + df["pre_jackpot_alt_share"]
    df["sales_per_resident"] = df["pre_total_lottery"] / df["total_pop"].replace(0, np.nan)

    source_rows = len(df)
    duplicate_after_padding = int(df["zip5"].duplicated().sum())
    nyc = df[df["borough"].notna()].copy()
    active_mask = (
        (nyc["pre_total_lottery"] > 10_000)
        & (nyc["pre_n_retailers"] >= 2)
        & (nyc["total_pop"] > 1_000)
        & nyc[BEHAVIOR_FEATURES].notna().all(axis=1)
    )
    active = nyc[active_mask].copy().reset_index(drop=True)

    scaler = StandardScaler()
    x = scaler.fit_transform(active[BEHAVIOR_FEATURES])

    pca = PCA(n_components=6, random_state=7)
    scores = pca.fit_transform(x)
    components = pca.components_.copy()

    def flip(component_index: int, feature_name: str) -> None:
        idx = BEHAVIOR_FEATURES.index(feature_name)
        if components[component_index, idx] < 0:
            components[component_index, :] *= -1
            scores[:, component_index] *= -1

    flip(0, "pre_daily_share")
    flip(1, "pre_jackpot_share")
    flip(2, "pre_general_addon")

    active["pc1"] = scores[:, 0]
    active["pc2"] = scores[:, 1]
    active["pc3"] = scores[:, 2]
    active["pc4"] = scores[:, 3]

    k_scores = {}
    for k in [2, 3, 4, 5, 6]:
        labels = KMeans(n_clusters=k, random_state=7, n_init=50).fit_predict(scores[:, :4])
        k_scores[str(k)] = as_number(silhouette_score(scores[:, :4], labels), 3)

    km = KMeans(n_clusters=3, random_state=7, n_init=100)
    active["cluster_raw"] = km.fit_predict(scores[:, :4])

    raw_means = active.groupby("cluster_raw").mean(numeric_only=True)
    daily_raw = int(raw_means["pre_daily_share"].idxmax())
    remaining = [c for c in raw_means.index if c != daily_raw]
    jackpot_raw = int(raw_means.loc[remaining, "median_income"].idxmax())
    convenience_raw = int([c for c in raw_means.index if c not in {daily_raw, jackpot_raw}][0])
    raw_to_segment = {
        daily_raw: "daily",
        convenience_raw: "convenience",
        jackpot_raw: "jackpot",
    }
    active["segment"] = active["cluster_raw"].map(raw_to_segment)

    fa = FactorAnalysis(n_components=3, random_state=7)
    fa.fit(x)
    rotated, rotation = varimax(fa.components_.T)
    factor_scores = fa.transform(x) @ rotation

    factor_names = [None, None, None]
    addon_idx = int(np.argmax(np.abs(rotated[BEHAVIOR_FEATURES.index("pre_general_addon"), :])))
    factor_names[addon_idx] = "Jackpot add-on sophistication"
    remaining_idx = [i for i in range(3) if factor_names[i] is None]
    daily_idx = max(
        remaining_idx,
        key=lambda i: abs(rotated[BEHAVIOR_FEATURES.index("pre_daily_share"), i])
        + abs(rotated[BEHAVIOR_FEATURES.index("pre_habit_index"), i]),
    )
    factor_names[daily_idx] = "Daily habit versus rapid play"
    for i in range(3):
        if factor_names[i] is None:
            factor_names[i] = "Jackpot / incidental variation"

    oriented_factors = []
    for i, name in enumerate(factor_names):
        vals = rotated[:, i].copy()
        if name == "Jackpot add-on sophistication" and vals[BEHAVIOR_FEATURES.index("pre_general_addon")] < 0:
            vals *= -1
            factor_scores[:, i] *= -1
        if name == "Daily habit versus rapid play" and vals[BEHAVIOR_FEATURES.index("pre_daily_share")] < 0:
            vals *= -1
            factor_scores[:, i] *= -1
        if name == "Jackpot / incidental variation" and vals[BEHAVIOR_FEATURES.index("pre_jackpot_share")] < 0:
            vals *= -1
            factor_scores[:, i] *= -1
        oriented_factors.append((name, vals))

    factor_loadings = []
    for name, vals in oriented_factors:
        rows = []
        order = np.argsort(np.abs(vals))[::-1][:12]
        for idx in order:
            rows.append(
                {
                    "feature": BEHAVIOR_FEATURES[idx],
                    "label": FEATURE_LABELS[BEHAVIOR_FEATURES[idx]],
                    "loading": as_number(vals[idx], 3),
                }
            )
        factor_loadings.append({"name": name, "loadings": rows})

    active["factor_addon"] = factor_scores[:, factor_names.index("Jackpot add-on sophistication")]
    active["factor_daily"] = factor_scores[:, factor_names.index("Daily habit versus rapid play")]
    active["factor_incidental"] = factor_scores[:, factor_names.index("Jackpot / incidental variation")]

    city_means = active[list(PROFILE_METRICS.values())].mean(numeric_only=True).to_dict()
    borough_counts = active["borough"].value_counts().reindex(BOROUGH_ORDER, fill_value=0).to_dict()

    segments = []
    for segment_id in ["daily", "convenience", "jackpot"]:
        info = SEGMENT_STORIES[segment_id].copy()
        rows = active[active["segment"] == segment_id]
        means = {label: as_number(rows[col].mean(), 4) for label, col in PROFILE_METRICS.items()}
        deltas = {
            label: as_number(rows[col].mean() - city_means[col], 4)
            for label, col in PROFILE_METRICS.items()
        }
        profile = rows.sort_values("pre_total_lottery", ascending=False).head(6)
        info.update(
            {
                "n": int(len(rows)),
                "share": as_number(len(rows) / len(active), 4),
                "means": means,
                "deltas": deltas,
                "boroughCounts": rows["borough"].value_counts().reindex(BOROUGH_ORDER, fill_value=0).to_dict(),
                "topZips": [
                    {
                        "zip": r.zip5,
                        "borough": r.borough,
                        "sales": as_number(r.pre_total_lottery, 0),
                        "dailyShare": as_number(r.pre_daily_share, 3),
                        "instantShare": as_number(r.pre_instant_share, 3),
                        "jackpotShare": as_number(r.jackpot_combined_share, 3),
                        "income": as_number(r.median_income, 0),
                    }
                    for r in profile.itertuples()
                ],
            }
        )
        segments.append(info)

    active["boroughRank"] = active.groupby("borough")["pc1"].rank(method="first", ascending=False)
    active["segmentOrder"] = active["segment"].map({"daily": 0, "convenience": 1, "jackpot": 2})

    point_cols = [
        "zip5",
        "borough",
        "segment",
        "pc1",
        "pc2",
        "pc3",
        "factor_addon",
        "factor_daily",
        "factor_incidental",
        "pre_total_lottery",
        "pre_n_retailers",
        "sales_per_resident",
        "total_pop",
        "median_income",
        "per_underpoverty",
        "per_college_above",
        "per_black",
        "per_hispanic",
        "pre_instant_share",
        "pre_quickdraw_share",
        "pre_daily_share",
        "jackpot_combined_share",
        "pre_general_addon",
        "pre_habit_index",
        "pre_portfolio_entropy",
        "pre_routine_checkout_share",
        "pre_social_channel_share",
        "pre_incidental_share",
        "boroughRank",
    ]
    points = []
    for row in active[point_cols].sort_values(["borough", "zip5"]).to_dict("records"):
        record = clean_record(row)
        record["zip"] = record.pop("zip5")
        points.append(record)

    demo_metrics = {
        "Median income": "median_income",
        "Poverty rate": "per_underpoverty",
        "College or above": "per_college_above",
        "Black share": "per_black",
        "Hispanic share": "per_hispanic",
        "Population": "total_pop",
        "Retailer count": "pre_n_retailers",
    }
    score_correlations = []
    for label, col in demo_metrics.items():
        score_correlations.append(
            {
                "metric": label,
                "pc1": corr(active["pc1"], active[col]),
                "pc2": corr(active["pc2"], active[col]),
                "addonFactor": corr(active["factor_addon"], active[col]),
                "dailyFactor": corr(active["factor_daily"], active[col]),
            }
        )

    metric_correlations = [
        {
            "metric": "Population",
            "rawSales": corr(active["pre_total_lottery"], active["total_pop"]),
            "retailers": corr(active["pre_n_retailers"], active["total_pop"]),
            "salesPerResident": corr(active["sales_per_resident"], active["total_pop"]),
        },
        {
            "metric": "Retailer count",
            "rawSales": corr(active["pre_total_lottery"], active["pre_n_retailers"]),
            "retailers": None,
            "salesPerResident": corr(active["sales_per_resident"], active["pre_n_retailers"]),
        },
        {
            "metric": "Median income",
            "rawSales": corr(active["pre_total_lottery"], active["median_income"]),
            "retailers": corr(active["pre_n_retailers"], active["median_income"]),
            "salesPerResident": corr(active["sales_per_resident"], active["median_income"]),
        },
        {
            "metric": "College or above",
            "rawSales": corr(active["pre_total_lottery"], active["per_college_above"]),
            "retailers": corr(active["pre_n_retailers"], active["per_college_above"]),
            "salesPerResident": corr(active["sales_per_resident"], active["per_college_above"]),
        },
    ]

    spotlight_specs = [
        ("Most daily-routine", "pre_daily_share", False),
        ("Most jackpot-led", "jackpot_combined_share", False),
        ("Highest add-on rate", "pre_general_addon", False),
        ("Highest sales per resident", "sales_per_resident", False),
        ("Largest lottery volume", "pre_total_lottery", False),
    ]
    spotlights = []
    for label, col, ascending in spotlight_specs:
        r = active.sort_values(col, ascending=ascending).iloc[0]
        spotlights.append(
            {
                "label": label,
                "zip": r.zip5,
                "borough": r.borough,
                "segment": r.segment,
                "value": as_number(r[col], 4),
                "sales": as_number(r.pre_total_lottery, 0),
                "income": as_number(r.median_income, 0),
            }
        )

    payload = {
        "metadata": {
            "title": "Lottery ZIP Psychographics: How Neighborhoods Play",
            "source": str(SOURCE),
            "sourceRows": source_rows,
            "nycRows": int(len(nyc)),
            "analysisRows": int(len(active)),
            "behaviorFeatureCount": len(BEHAVIOR_FEATURES),
            "selectedK": 3,
            "duplicateZipAfterPadding": duplicate_after_padding,
            "filters": [
                "NYC ZIP prefixes: 100-104, 111-114, 116, plus 11004 and 11005",
                "total_pop > 1,000",
                "pre_total_lottery > 10,000",
                "pre_n_retailers >= 2",
                "complete behavior features",
            ],
            "caveats": [
                "The file does not include the original time-window metadata; pre_ fields are treated as a baseline period.",
                "Demographics are not used to fit PCA, factor analysis, or clusters.",
                "Channel-context shares can overlap and should not be read as mutually exclusive market shares.",
                "The gallery uses borough grouping rather than a precise ZIP polygon map because geometry is not in the file.",
            ],
        },
        "boroughOrder": BOROUGH_ORDER,
        "boroughCounts": borough_counts,
        "featureLabels": FEATURE_LABELS,
        "profileMetrics": list(PROFILE_METRICS.keys()),
        "pca": {
            "explainedVariance": [
                {
                    "component": f"PC{i + 1}",
                    "share": as_number(v, 4),
                    "cumulative": as_number(np.sum(pca.explained_variance_ratio_[: i + 1]), 4),
                }
                for i, v in enumerate(pca.explained_variance_ratio_)
            ],
            "loadings": [
                {
                    "component": "PC1",
                    "name": "Daily habit / social routine versus rapid-resolution play",
                    "top": top_loadings(components.T, BEHAVIOR_FEATURES, 0),
                },
                {
                    "component": "PC2",
                    "name": "Jackpot and add-on intensity",
                    "top": top_loadings(components.T, BEHAVIOR_FEATURES, 1),
                },
                {
                    "component": "PC3",
                    "name": "Portfolio depth and store-context variation",
                    "top": top_loadings(components.T, BEHAVIOR_FEATURES, 2),
                },
            ],
        },
        "factorAnalysis": {
            "loadings": factor_loadings,
            "scoreCorrelations": score_correlations,
        },
        "clusterDiagnostics": {
            "silhouette": k_scores,
            "chosen": "k=3 keeps the segment story operational; higher k mostly peels out small outlier groups.",
        },
        "rawMetricCorrelations": metric_correlations,
        "segments": segments,
        "points": points,
        "spotlights": spotlights,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUT} with {len(points)} ZIPs")


if __name__ == "__main__":
    main()
