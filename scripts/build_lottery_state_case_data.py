from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.linear_model import RidgeCV
from sklearn.metrics import r2_score, silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


ROOT = Path(__file__).resolve().parents[2]
BOOK = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "case" / "part4" / "psych_zip_baseline.parquet"
OUTPUT = BOOK / "app" / "lottery-zip-psychographics-case" / "data" / "lottery-state-case.json"


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
    "retailers_per_10k",
    "log_sales_pc",
    "log_sales_per_retailer",
]


FEATURE_LABELS = {
    "pre_instant_share": "Instant scratch share",
    "pre_quickdraw_share": "Quick Draw share",
    "pre_daily_share": "Daily Numbers share",
    "pre_jackpot_share": "Jackpot draw share",
    "pre_jackpot_alt_share": "Other jackpot share",
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
    "pre_portfolio_hhi": "Portfolio concentration",
    "pre_channel_entropy": "Channel entropy",
    "pre_cv_total": "Sales volatility",
    "pre_autocorr_total": "Sales autocorrelation",
    "pre_habit_index": "Habit index",
    "pre_speed_entropy": "Speed entropy",
    "retailers_per_10k": "Retailers per 10k residents",
    "log_sales_pc": "Log sales per resident",
    "log_sales_per_retailer": "Log sales per retailer",
}


SEGMENT_INFO = {
    "urban_daily": {
        "label": "Dense Daily-Number Routines",
        "shortLabel": "Daily routine",
        "color": "#4E79A7",
        "description": (
            "Large, dense ZIPs where Daily Numbers share, portfolio entropy, and habit index are high."
        ),
    },
    "mixed_retail": {
        "label": "Mixed Retail Portfolios",
        "shortLabel": "Mixed retail",
        "color": "#2A9D8F",
        "description": (
            "Mid-sized ZIPs with broad instant-ticket retail, some Quick Draw, and a balanced product portfolio."
        ),
    },
    "quickdraw_venues": {
        "label": "Quick Draw Venue ZIPs",
        "shortLabel": "Venue Quick Draw",
        "color": "#C85B47",
        "description": (
            "Small ZIPs where the behavioral signature is almost entirely Quick Draw and bar/social-channel context."
        ),
    },
    "checkout_scratch": {
        "label": "Checkout Scratch Corridors",
        "shortLabel": "Checkout scratch",
        "color": "#8B6F47",
        "description": (
            "Small-population ZIPs where instant tickets, routine checkout, and incidental convenience-store play dominate."
        ),
    },
}


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


def clean_record(record: dict):
    out = {}
    for key, value in record.items():
        if isinstance(value, np.integer):
            out[key] = int(value)
        elif isinstance(value, (np.floating, float)):
            out[key] = as_number(value, 6)
        elif pd.isna(value):
            out[key] = None
        else:
            out[key] = value
    return out


def classify_region(zip_code: str) -> str:
    z = str(zip_code).zfill(5)
    try:
        prefix = int(z[:3])
    except ValueError:
        return "Other/edge ZIPs"
    if prefix in [100, 101, 102, 103, 104] or prefix in [111, 112, 113, 114, 116] or z in {"11004", "11005"}:
        return "NYC"
    if prefix in [105, 106, 107, 108, 109, 110, 115, 117, 118, 119]:
        return "Downstate suburbs"
    if 120 <= prefix <= 129:
        return "Capital/Hudson/North Country"
    if 130 <= prefix <= 139:
        return "Central/Southern Tier"
    if 140 <= prefix <= 149:
        return "Western/Finger Lakes"
    return "Other/edge ZIPs"


def pct_record(group: pd.Series) -> list[dict]:
    total = group.sum()
    return [
        {"label": str(idx), "share": as_number(val / total if total else 0, 4)}
        for idx, val in group.items()
    ]


def safe_corr(df: pd.DataFrame, left: str, right: str) -> float | None:
    pair = df[[left, right]].replace([np.inf, -np.inf], np.nan).dropna()
    if len(pair) < 20:
        return None
    return as_number(spearmanr(pair[left], pair[right]).correlation, 3)


def top_loadings(loadings: pd.DataFrame, component: str, n: int = 8) -> dict:
    values = loadings[component].sort_values()
    return {
        "component": component,
        "positive": [
            {
                "feature": feature,
                "label": FEATURE_LABELS.get(feature, feature),
                "loading": as_number(value, 3),
            }
            for feature, value in values.tail(n).sort_values(ascending=False).items()
        ],
        "negative": [
            {
                "feature": feature,
                "label": FEATURE_LABELS.get(feature, feature),
                "loading": as_number(value, 3),
            }
            for feature, value in values.head(n).items()
        ],
    }


def group_profile(df: pd.DataFrame, by: str, order: list[str] | None = None) -> list[dict]:
    rows = []
    grouped = df.groupby(by, observed=True)
    labels = order or list(grouped.size().index)
    for label in labels:
        if label not in grouped.groups:
            continue
        g = grouped.get_group(label)
        rows.append(
            {
                "label": str(label),
                "zips": int(len(g)),
                "medianPopulation": as_number(g["total_pop"].median(), 0),
                "medianIncome": as_number(g["median_income"].median(), 0),
                "povertyRate": as_number(g["per_underpoverty"].median(), 3),
                "salesPerCapita": as_number(g["sales_per_capita"].median(), 3),
                "retailersPer10k": as_number(g["retailers_per_10k"].median(), 3),
                "instantShare": as_number(g["pre_instant_share"].median(), 3),
                "dailyShare": as_number(g["pre_daily_share"].median(), 3),
                "jackpotShare": as_number(g["pre_jackpot_share"].median(), 3),
                "quickdrawShare": as_number(g["pre_quickdraw_share"].median(), 3),
                "portfolioEntropy": as_number(g["pre_portfolio_entropy"].median(), 3),
                "habitIndex": as_number(g["pre_habit_index"].median(), 3),
            }
        )
    return rows


def fit_controlled_models(active: pd.DataFrame) -> list[dict]:
    predictors = [
        "log_pop",
        "log_income",
        "per_underpoverty",
        "per_college_above",
        "per_black",
        "per_hispanic",
        "retailers_per_10k",
        "region",
    ]
    numeric = [p for p in predictors if p != "region"]
    metrics = {
        "Daily Numbers share": "pre_daily_share",
        "Instant scratch share": "pre_instant_share",
        "Jackpot share": "pre_jackpot_share",
        "Quick Draw share": "pre_quickdraw_share",
        "Habit index": "pre_habit_index",
        "Portfolio entropy": "pre_portfolio_entropy",
        "Log sales per resident": "log_sales_pc",
    }
    rows = []
    for label, outcome in metrics.items():
        tmp = active[predictors + [outcome]].replace([np.inf, -np.inf], np.nan).dropna()
        y = StandardScaler().fit_transform(tmp[[outcome]]).ravel()
        pre = ColumnTransformer(
            [
                ("numeric", StandardScaler(), numeric),
                ("region", OneHotEncoder(drop="first", sparse_output=False), ["region"]),
            ]
        )
        model = Pipeline(
            [
                ("pre", pre),
                ("reg", RidgeCV(alphas=[0.1, 1, 3, 10, 30, 100])),
            ]
        )
        model.fit(tmp[predictors], y)
        names = numeric + list(
            model.named_steps["pre"]
            .named_transformers_["region"]
            .get_feature_names_out(["region"])
        )
        coefs = pd.Series(model.named_steps["reg"].coef_, index=names)
        pred = model.predict(tmp[predictors])
        rows.append(
            {
                "outcome": label,
                "n": int(len(tmp)),
                "r2": as_number(r2_score(y, pred), 3),
                "alpha": as_number(model.named_steps["reg"].alpha_, 3),
                "coefficients": [
                    {
                        "term": str(term),
                        "label": {
                            "log_pop": "Population",
                            "log_income": "Income",
                            "per_underpoverty": "Poverty",
                            "per_college_above": "College+",
                            "per_black": "Black share",
                            "per_hispanic": "Hispanic share",
                            "retailers_per_10k": "Retailer density",
                        }.get(str(term), str(term).replace("region_", "Region: ")),
                        "coefficient": as_number(value, 3),
                    }
                    for term, value in coefs.sort_values(key=lambda s: s.abs(), ascending=False).head(8).items()
                ],
            }
        )
    return rows


def main() -> None:
    df = pd.read_parquet(SOURCE).copy()
    df["zip"] = df["zip"].astype(str).str.zfill(5)
    for column in df.columns:
        if column != "zip":
            df[column] = pd.to_numeric(df[column], errors="coerce")

    df["region"] = df["zip"].map(classify_region)
    df["sales_per_capita"] = df["pre_total_lottery"] / df["total_pop"].replace(0, np.nan)
    df["retailers_per_10k"] = df["pre_n_retailers"] / df["total_pop"].replace(0, np.nan) * 10000
    df["sales_per_retailer"] = df["pre_total_lottery"] / df["pre_n_retailers"].replace(0, np.nan)
    df["log_sales_pc"] = np.log1p(df["sales_per_capita"])
    df["log_sales_per_retailer"] = np.log1p(df["sales_per_retailer"])
    df["log_pop"] = np.log1p(df["total_pop"])
    df["log_income"] = np.log1p(df["median_income"])

    active = df[
        (df["pre_total_lottery"] > 0)
        & (df["pre_n_retailers"] > 0)
        & (df["total_pop"] >= 100)
    ].copy()

    feature_cols = [
        col
        for col in BEHAVIOR_FEATURES
        if col in active.columns and active[col].notna().sum() > 100 and active[col].std(skipna=True) > 1e-9
    ]
    x = active[feature_cols].replace([np.inf, -np.inf], np.nan)
    x = x.fillna(x.median())
    scaler = StandardScaler()
    xs = scaler.fit_transform(x)

    pca = PCA(n_components=6, random_state=0)
    pcs = pca.fit_transform(xs)
    for idx in range(pcs.shape[1]):
        active[f"pc{idx + 1}"] = pcs[:, idx]

    loadings = pd.DataFrame(
        pca.components_.T,
        index=feature_cols,
        columns=[f"PC{i + 1}" for i in range(pca.components_.shape[0])],
    )

    diagnostics = []
    for k in range(3, 8):
        labels = KMeans(n_clusters=k, random_state=12, n_init=100).fit_predict(xs)
        diagnostics.append(
            {
                "k": k,
                "silhouette": as_number(silhouette_score(xs, labels), 3),
                "sizes": {str(i): int((labels == i).sum()) for i in sorted(set(labels))},
            }
        )

    labels = KMeans(n_clusters=4, random_state=12, n_init=100).fit_predict(xs)
    active["cluster_raw"] = labels
    profile = active.groupby("cluster_raw").median(numeric_only=True)
    quickdraw_raw = int(profile["pre_quickdraw_share"].idxmax())
    daily_raw = int(profile.drop(index=quickdraw_raw)["pre_daily_share"].idxmax())
    remaining = [int(i) for i in profile.index if i not in {quickdraw_raw, daily_raw}]
    checkout_score = (
        profile.loc[remaining, "pre_instant_share"]
        + profile.loc[remaining, "pre_routine_checkout_share"]
        + profile.loc[remaining, "pre_incidental_share"]
        - profile.loc[remaining, "pre_quickdraw_share"]
    )
    checkout_raw = int(checkout_score.idxmax())
    mixed_raw = int([i for i in remaining if i != checkout_raw][0])
    raw_to_segment = {
        quickdraw_raw: "quickdraw_venues",
        daily_raw: "urban_daily",
        checkout_raw: "checkout_scratch",
        mixed_raw: "mixed_retail",
    }
    active["segment"] = active["cluster_raw"].map(raw_to_segment)

    segment_order = ["urban_daily", "mixed_retail", "quickdraw_venues", "checkout_scratch"]
    segments = []
    region_table = pd.crosstab(active["segment"], active["region"], normalize="index")
    for segment_id in segment_order:
        rows = active[active["segment"] == segment_id]
        info = SEGMENT_INFO[segment_id].copy()
        info.update(
            {
                "id": segment_id,
                "zips": int(len(rows)),
                "share": as_number(len(rows) / len(active), 4),
                "medianPopulation": as_number(rows["total_pop"].median(), 0),
                "medianIncome": as_number(rows["median_income"].median(), 0),
                "povertyRate": as_number(rows["per_underpoverty"].median(), 3),
                "collegeShare": as_number(rows["per_college_above"].median(), 3),
                "blackShare": as_number(rows["per_black"].median(), 3),
                "hispanicShare": as_number(rows["per_hispanic"].median(), 3),
                "salesPerCapita": as_number(rows["sales_per_capita"].median(), 3),
                "retailersPer10k": as_number(rows["retailers_per_10k"].median(), 3),
                "medianTotalSales": as_number(rows["pre_total_lottery"].median(), 0),
                "instantShare": as_number(rows["pre_instant_share"].median(), 3),
                "quickdrawShare": as_number(rows["pre_quickdraw_share"].median(), 3),
                "dailyShare": as_number(rows["pre_daily_share"].median(), 3),
                "jackpotShare": as_number(rows["pre_jackpot_share"].median(), 3),
                "routineCheckout": as_number(rows["pre_routine_checkout_share"].median(), 3),
                "incidentalShare": as_number(rows["pre_incidental_share"].median(), 3),
                "barShare": as_number(rows["pre_bar_share"].median(), 3),
                "convenienceShare": as_number(rows["pre_convenience_share"].median(), 3),
                "groceryShare": as_number(rows["pre_grocery_share"].median(), 3),
                "addonRate": as_number(rows["pre_general_addon"].median(), 3),
                "portfolioEntropy": as_number(rows["pre_portfolio_entropy"].median(), 3),
                "habitIndex": as_number(rows["pre_habit_index"].median(), 3),
                "pc1": as_number(rows["pc1"].median(), 3),
                "pc2": as_number(rows["pc2"].median(), 3),
                "pc3": as_number(rows["pc3"].median(), 3),
                "regionShares": [
                    {"label": region, "share": as_number(region_table.loc[segment_id].get(region, 0), 3)}
                    for region in region_table.columns
                ],
            }
        )
        segments.append(info)

    active["incomeQuartile"] = pd.qcut(
        active["median_income"],
        4,
        labels=["Q1 lower income", "Q2", "Q3", "Q4 higher income"],
        duplicates="drop",
    )
    active["povertyQuartile"] = pd.qcut(
        active["per_underpoverty"],
        4,
        labels=["Q1 lower poverty", "Q2", "Q3", "Q4 higher poverty"],
        duplicates="drop",
    )
    active["collegeQuartile"] = pd.qcut(
        active["per_college_above"],
        4,
        labels=["Q1 lower college", "Q2", "Q3", "Q4 higher college"],
        duplicates="drop",
    )
    active["hispanicQuartile"] = pd.qcut(
        active["per_hispanic"],
        4,
        labels=["Q1 lower Hispanic share", "Q2", "Q3", "Q4 higher Hispanic share"],
        duplicates="drop",
    )
    active["blackQuartile"] = pd.qcut(
        active["per_black"],
        4,
        labels=["Q1 lower Black share", "Q2", "Q3", "Q4 higher Black share"],
        duplicates="drop",
    )
    active["populationTercile"] = pd.qcut(
        active["total_pop"],
        3,
        labels=["Low population", "Middle population", "High population"],
        duplicates="drop",
    )
    active["incomeTercile"] = pd.qcut(
        active["median_income"],
        3,
        labels=["Lower income", "Middle income", "Higher income"],
        duplicates="drop",
    )
    active["hispanicTercile"] = pd.qcut(
        active["per_hispanic"],
        3,
        labels=["Lower Hispanic share", "Middle Hispanic share", "Higher Hispanic share"],
        duplicates="drop",
    )

    interaction_rows = []
    for (pop_label, hisp_label), g in active.groupby(["populationTercile", "hispanicTercile"], observed=True):
        interaction_rows.append(
            {
                "population": str(pop_label),
                "hispanic": str(hisp_label),
                "zips": int(len(g)),
                "dailyShare": as_number(g["pre_daily_share"].median(), 3),
                "habitIndex": as_number(g["pre_habit_index"].median(), 3),
                "salesPerCapita": as_number(g["sales_per_capita"].median(), 3),
                "instantShare": as_number(g["pre_instant_share"].median(), 3),
                "portfolioEntropy": as_number(g["pre_portfolio_entropy"].median(), 3),
            }
        )

    active_sorted = active.sort_values("pre_total_lottery", ascending=False)
    sales_concentration = []
    for pct in [0.05, 0.10, 0.20]:
        n = int(math.ceil(len(active_sorted) * pct))
        sales_concentration.append(
            {
                "label": f"Top {int(pct * 100)}% of ZIPs",
                "zips": n,
                "salesShare": as_number(active_sorted.head(n)["pre_total_lottery"].sum() / active_sorted["pre_total_lottery"].sum(), 3),
            }
        )
    sales_concentration.append(
        {
            "label": "Top 25 ZIPs",
            "zips": 25,
            "salesShare": as_number(active_sorted.head(25)["pre_total_lottery"].sum() / active_sorted["pre_total_lottery"].sum(), 3),
        }
    )

    demo_correlations = []
    metrics = [
        "sales_per_capita",
        "retailers_per_10k",
        "pre_instant_share",
        "pre_quickdraw_share",
        "pre_daily_share",
        "pre_jackpot_share",
        "pre_incidental_share",
        "pre_routine_checkout_share",
        "pre_bar_share",
        "pre_gas_share",
        "pre_portfolio_entropy",
        "pre_habit_index",
        "pre_general_addon",
        "pre_mm_depth_index",
    ]
    for demo in [
        "median_income",
        "per_underpoverty",
        "per_college_above",
        "per_black",
        "per_hispanic",
        "total_pop",
    ]:
        rows = [
            {
                "metric": metric,
                "label": FEATURE_LABELS.get(metric, metric.replace("_", " ")),
                "rho": safe_corr(active, demo, metric),
            }
            for metric in metrics
        ]
        rows = sorted(rows, key=lambda row: abs(row["rho"] or 0), reverse=True)[:8]
        demo_correlations.append({"demographic": demo, "rows": rows})

    top_cols = [
        "zip",
        "region",
        "segment",
        "sales_per_capita",
        "pre_total_lottery",
        "total_pop",
        "pre_n_retailers",
        "median_income",
        "per_underpoverty",
        "per_college_above",
        "pre_instant_share",
        "pre_quickdraw_share",
        "pre_daily_share",
        "pre_jackpot_share",
        "pre_habit_index",
    ]
    top_intensity = [
        clean_record(r)
        for r in active[active["total_pop"] >= 1000]
        .sort_values("sales_per_capita", ascending=False)
        .head(10)[top_cols]
        .to_dict("records")
    ]
    top_volume = [
        clean_record(r)
        for r in active.sort_values("pre_total_lottery", ascending=False).head(10)[top_cols].to_dict("records")
    ]

    points = [
        clean_record(r)
        for r in active[
            [
                "zip",
                "region",
                "segment",
                "pc1",
                "pc2",
                "pc3",
                "sales_per_capita",
                "total_pop",
                "median_income",
                "per_underpoverty",
                "per_college_above",
                "per_black",
                "per_hispanic",
                "pre_instant_share",
                "pre_quickdraw_share",
                "pre_daily_share",
                "pre_jackpot_share",
                "pre_habit_index",
            ]
        ].to_dict("records")
    ]

    payload = {
        "metadata": {
            "title": "Lottery ZIP Psychographics: How Neighborhoods Play",
            "source": str(SOURCE),
            "sourceRows": int(len(df)),
            "activeRows": int(len(active)),
            "excludedRows": int(len(df) - len(active)),
            "columns": int(len(pd.read_parquet(SOURCE, columns=None).columns)),
            "behaviorFeatureCount": int(len(feature_cols)),
            "selectedK": 4,
            "activeFilter": "pre_total_lottery > 0, pre_n_retailers > 0, total_pop >= 100",
            "missingDemographics": {
                key: int(value)
                for key, value in df[
                    [
                        "median_income",
                        "per_capita_income",
                        "per_underpoverty",
                        "per_college_above",
                        "per_black",
                        "per_hispanic",
                        "total_pop",
                    ]
                ]
                .isna()
                .sum()
                .items()
            },
            "caveats": [
                "The original time-window metadata is not available; pre_ fields are treated as a baseline cross-section.",
                "Clusters and PCA are fit on behavior and retailer-access variables, not demographics.",
                "ZIP-level demographic correlations are descriptive and should not be read as individual behavior or causal effects.",
                "Channel-context shares can overlap; they are retailer-context indicators, not mutually exclusive market shares.",
            ],
        },
        "featureLabels": FEATURE_LABELS,
        "segments": segments,
        "pca": {
            "explainedVariance": [
                {
                    "component": f"PC{i + 1}",
                    "share": as_number(value, 4),
                    "cumulative": as_number(pca.explained_variance_ratio_[: i + 1].sum(), 4),
                }
                for i, value in enumerate(pca.explained_variance_ratio_)
            ],
            "loadings": [
                {
                    **top_loadings(loadings, "PC1"),
                    "name": "Portfolio breadth and daily routine versus concentrated rapid play",
                },
                {
                    **top_loadings(loadings, "PC2"),
                    "name": "Checkout scratch retail versus social Quick Draw venues",
                },
                {
                    **top_loadings(loadings, "PC3"),
                    "name": "Jackpot add-on sophistication",
                },
            ],
            "points": points,
        },
        "clusterDiagnostics": {
            "silhouette": diagnostics,
            "choice": "k=4 separates the two dominant retail routines, the dense daily-number pattern, and a small venue Quick Draw group. k=5 mainly splits the scratch/check-out cluster.",
        },
        "groups": {
            "region": group_profile(active, "region"),
            "incomeQuartile": group_profile(
                active,
                "incomeQuartile",
                ["Q1 lower income", "Q2", "Q3", "Q4 higher income"],
            ),
            "povertyQuartile": group_profile(
                active,
                "povertyQuartile",
                ["Q1 lower poverty", "Q2", "Q3", "Q4 higher poverty"],
            ),
            "collegeQuartile": group_profile(
                active,
                "collegeQuartile",
                ["Q1 lower college", "Q2", "Q3", "Q4 higher college"],
            ),
            "hispanicQuartile": group_profile(
                active,
                "hispanicQuartile",
                ["Q1 lower Hispanic share", "Q2", "Q3", "Q4 higher Hispanic share"],
            ),
            "blackQuartile": group_profile(
                active,
                "blackQuartile",
                ["Q1 lower Black share", "Q2", "Q3", "Q4 higher Black share"],
            ),
            "populationHispanicInteraction": interaction_rows,
        },
        "associations": {
            "demoCorrelations": demo_correlations,
            "controlledModels": fit_controlled_models(active),
        },
        "salesConcentration": {
            "rows": sales_concentration,
            "regionSalesShare": pct_record(active.groupby("region")["pre_total_lottery"].sum().sort_values(ascending=False)),
            "regionZipShare": pct_record(active["region"].value_counts().sort_index()),
        },
        "topZips": {
            "highestIntensity": top_intensity,
            "largestVolume": top_volume,
        },
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT} with {len(points)} active ZIP points")


if __name__ == "__main__":
    main()
