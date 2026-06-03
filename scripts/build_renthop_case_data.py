"""Build compact data for the RentHop predictive-modeling case study."""

from __future__ import annotations

import json
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import chi2
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "1")

ROOT = Path(__file__).resolve().parents[2]
BOOK = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "case" / "renthop" / "RentHop.csv"
OUTPUT = BOOK / "app" / "renthop-hot-listings-case" / "data" / "renthop-case.json"

CLUSTERS = 18
RANDOM_STATE = 42

CLUSTER_LABELS = {
    0: "Lower Manhattan",
    1: "Astoria / northwest Queens",
    2: "Midtown West",
    3: "Upper Manhattan / Bronx",
    4: "Central Queens",
    5: "Upper Manhattan",
    6: "Central Brooklyn",
    7: "East Village / LES",
    8: "Southwest Brooklyn",
    9: "Upper West Side",
    10: "Midtown East / Gramercy",
    11: "Downtown Brooklyn",
    12: "Chelsea / West Village",
    13: "Sutton Place / east Midtown",
    14: "Williamsburg / Greenpoint",
    15: "Upper East Side",
    16: "Prospect-Lefferts / Crown Heights",
    17: "Far Rockaway / airport edge",
}


def parse_features(value: Any) -> list[str]:
    if pd.isna(value):
        return []
    return [x.lower().strip() for x in re.findall(r'"([^"]+)"', str(value))]


def clean_plus(value: Any) -> float:
    text = str(value).strip()
    if text.endswith("+"):
        return float(text[:-1]) + 1
    return float(text)


def safe_col(name: str) -> str:
    return "amenity_" + re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def clean_number(value: Any, digits: int = 4) -> Any:
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        if not np.isfinite(value):
            return None
        return round(float(value), digits)
    return value


def records(frame: pd.DataFrame, digits: int = 4) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for row in frame.to_dict(orient="records"):
        out.append({k: clean_number(v, digits) for k, v in row.items()})
    return out


def display_feature_name(raw: str) -> str:
    name = raw.replace("num__", "").replace("cat__", "")
    if name.startswith("amenity_"):
        return name.removeprefix("amenity_").replace("_", " ").title()
    if name.startswith("cluster_"):
        cluster = int(name.removeprefix("cluster_"))
        return f"Segment {cluster}: {CLUSTER_LABELS.get(cluster, 'listing zone')}"
    return {
        "log_price": "Monthly rent (log)",
        "price_per_room": "Price per room",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "bedrooms_clean": "Bedrooms",
        "bathrooms_clean": "Bathrooms",
    }.get(name, name.replace("_", " ").title())


def feature_family(raw: str) -> str:
    name = raw.replace("num__", "").replace("cat__", "")
    if name.startswith("amenity_"):
        return "Amenities"
    if name.startswith("cluster_") or name in {"latitude", "longitude"}:
        return "Location"
    if name in {"log_price", "price_per_room"}:
        return "Price"
    if name in {"bedrooms_clean", "bathrooms_clean"}:
        return "Unit mix"
    return "Other"


def sample_roc(points_fpr: np.ndarray, points_tpr: np.ndarray, max_points: int = 64) -> list[dict[str, float]]:
    if len(points_fpr) <= max_points:
        idx = np.arange(len(points_fpr))
    else:
        idx = np.unique(np.linspace(0, len(points_fpr) - 1, max_points).round().astype(int))
    return [
        {"fpr": round(float(points_fpr[i]), 4), "tpr": round(float(points_tpr[i]), 4)}
        for i in idx
    ]


def build() -> None:
    df = pd.read_csv(SOURCE)
    source_columns = int(df.shape[1])
    features_list = df["features"].apply(parse_features)
    target = df["Hot Apartments"].eq("Hot").astype(int)
    baseline_hot_rate = float(target.mean())

    amenity_counter = Counter(feature for row in features_list for feature in row)
    top_amenities = [name for name, _ in amenity_counter.most_common(25)]

    kmeans = KMeans(n_clusters=CLUSTERS, n_init=20, random_state=RANDOM_STATE)
    df["cluster"] = kmeans.fit_predict(df[["latitude", "longitude"]])
    df["bathrooms_clean"] = df["bathrooms"].apply(clean_plus)
    df["bedrooms_clean"] = df["bedrooms"].apply(clean_plus)
    df["log_price"] = np.log1p(df["price"])
    df["rooms"] = (df["bedrooms_clean"] + df["bathrooms_clean"]).clip(lower=1)
    df["price_per_room"] = df["price"] / df["rooms"]

    for amenity in top_amenities:
        df[safe_col(amenity)] = features_list.apply(lambda row, a=amenity: int(a in row))

    amenity_cols = [safe_col(a) for a in top_amenities]
    numeric_cols = [
        "bathrooms_clean",
        "bedrooms_clean",
        "log_price",
        "price_per_room",
        "latitude",
        "longitude",
        *amenity_cols,
    ]
    categorical_cols = ["cluster"]
    feature_cols = [*numeric_cols, *categorical_cols]

    model_frame = df[feature_cols].copy()
    model_frame["cluster"] = model_frame["cluster"].astype(str)

    x_train, x_test, y_train, y_test, idx_train, idx_test = train_test_split(
        model_frame,
        target,
        df.index,
        test_size=0.30,
        stratify=target,
        random_state=RANDOM_STATE,
    )

    scaled_preprocessor = ColumnTransformer(
        [
            ("num", StandardScaler(), numeric_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ]
    )
    tree_preprocessor = ColumnTransformer(
        [
            ("num", "passthrough", numeric_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ]
    )

    models: dict[str, Pipeline] = {
        "Logistic regression": Pipeline(
            [
                ("pre", scaled_preprocessor),
                (
                    "clf",
                    LogisticRegression(
                        max_iter=1000,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),
        "Decision tree": Pipeline(
            [
                ("pre", tree_preprocessor),
                (
                    "clf",
                    DecisionTreeClassifier(
                        max_depth=6,
                        min_samples_leaf=120,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),
        "Random forest": Pipeline(
            [
                ("pre", tree_preprocessor),
                (
                    "clf",
                    RandomForestClassifier(
                        n_estimators=220,
                        max_depth=12,
                        min_samples_leaf=80,
                        class_weight="balanced_subsample",
                        random_state=RANDOM_STATE,
                        n_jobs=1,
                    ),
                ),
            ]
        ),
    }

    model_metrics = []
    roc_curves = []
    model_probabilities: dict[str, np.ndarray] = {}

    for model_name, pipeline in models.items():
        pipeline.fit(x_train, y_train)
        probability = pipeline.predict_proba(x_test)[:, 1]
        prediction = (probability >= 0.5).astype(int)
        model_probabilities[model_name] = probability

        fpr, tpr, _ = roc_curve(y_test, probability)
        decile_cutoff = np.quantile(probability, 0.9)
        top_decile = probability >= decile_cutoff

        model_metrics.append(
            {
                "model": model_name,
                "auc": clean_number(roc_auc_score(y_test, probability), 3),
                "average_precision": clean_number(average_precision_score(y_test, probability), 3),
                "accuracy": clean_number(accuracy_score(y_test, prediction), 3),
                "precision": clean_number(precision_score(y_test, prediction), 3),
                "recall": clean_number(recall_score(y_test, prediction), 3),
                "f1": clean_number(f1_score(y_test, prediction), 3),
                "top_decile_hot_rate": clean_number(float(y_test[top_decile].mean()), 3),
                "top_decile_lift": clean_number(float(y_test[top_decile].mean() / baseline_hot_rate), 2),
            }
        )
        roc_curves.append(
            {
                "model": model_name,
                "points": sample_roc(fpr, tpr),
            }
        )

    best_model_name = max(model_metrics, key=lambda row: row["auc"])["model"]
    best_model = models[best_model_name]
    full_probability = best_model.predict_proba(model_frame)[:, 1]
    test_probability = model_probabilities[best_model_name]
    df["score"] = full_probability

    test_scored = df.loc[idx_test].copy()
    test_scored["score"] = test_probability
    test_scored["actual_hot"] = y_test.to_numpy()

    q = pd.qcut(test_scored["score"], 10, labels=False, duplicates="drop")
    decile_rows = []
    total_hot_test = int(test_scored["actual_hot"].sum())
    cumulative_hot = 0
    for decile in sorted(q.dropna().unique(), reverse=True):
        subset = test_scored[q == decile]
        hot_count = int(subset["actual_hot"].sum())
        cumulative_hot += hot_count
        rank = int(q.max() - decile + 1)
        decile_rows.append(
            {
                "rank": rank,
                "label": f"Top {rank * 10 - 9}-{rank * 10}%",
                "listings": int(len(subset)),
                "mean_score": float(subset["score"].mean()),
                "hot_rate": float(subset["actual_hot"].mean()),
                "lift": float(subset["actual_hot"].mean() / baseline_hot_rate),
                "captured_hot": hot_count,
                "cumulative_capture": float(cumulative_hot / total_hot_test),
            }
        )

    top_50 = test_scored.sort_values("score", ascending=False).head(50).copy()
    top_50["segment"] = top_50["cluster"].map(lambda c: f"Segment {int(c)}")
    top_50["segment_label"] = top_50["cluster"].map(lambda c: CLUSTER_LABELS.get(int(c), "Listing zone"))
    top_listing_rows = top_50.head(12).copy()
    top_listing_rows["rank"] = range(1, len(top_listing_rows) + 1)

    top_50_segment_mix = (
        top_50.groupby("cluster")
        .agg(listings=("id", "size"), hot_rate=("actual_hot", "mean"), median_price=("price", "median"))
        .reset_index()
        .sort_values(["listings", "hot_rate"], ascending=False)
    )
    top_50_segment_mix["segment"] = top_50_segment_mix["cluster"].map(lambda c: f"Segment {int(c)}")
    top_50_segment_mix["label"] = top_50_segment_mix["cluster"].map(lambda c: CLUSTER_LABELS.get(int(c), "Listing zone"))

    chi_values, p_values = chi2(df[amenity_cols], target)
    amenity_rows = []
    for amenity, col, chi_value, p_value in zip(top_amenities, amenity_cols, chi_values, p_values):
        present = df[col] == 1
        hot_with = float(target[present].mean())
        hot_without = float(target[~present].mean())
        amenity_rows.append(
            {
                "amenity": amenity.title(),
                "prevalence": float(present.mean()),
                "hot_rate_with": hot_with,
                "hot_rate_without": hot_without,
                "lift_pp": (hot_with - baseline_hot_rate) * 100,
                "chi2": float(chi_value),
                "p_value": float(p_value),
            }
        )
    amenity_rows = sorted(amenity_rows, key=lambda row: row["chi2"], reverse=True)[:12]

    cluster_summary = (
        df.groupby("cluster")
        .agg(
            listings=("id", "size"),
            hot_rate=("Hot Apartments", lambda s: s.eq("Hot").mean()),
            median_price=("price", "median"),
            mean_score=("score", "mean"),
            latitude=("latitude", "mean"),
            longitude=("longitude", "mean"),
            mean_bedrooms=("bedrooms_clean", "mean"),
            mean_bathrooms=("bathrooms_clean", "mean"),
        )
        .reset_index()
        .sort_values("hot_rate", ascending=False)
    )
    cluster_summary["segment"] = cluster_summary["cluster"].map(lambda c: f"Segment {int(c)}")
    cluster_summary["label"] = cluster_summary["cluster"].map(lambda c: CLUSTER_LABELS.get(int(c), "Listing zone"))
    cluster_summary["share"] = cluster_summary["listings"] / len(df)

    # Stratified sample keeps the map light while preserving every segment and class.
    map_parts = []
    sample_frame = df.assign(actual_hot=target)
    for (_, _), group in sample_frame.groupby(["cluster", "actual_hot"]):
        map_parts.append(group.sample(n=min(len(group), 38), random_state=RANDOM_STATE))
    map_sample = pd.concat(map_parts, ignore_index=True).sample(frac=1, random_state=RANDOM_STATE)
    map_sample["segment"] = map_sample["cluster"].map(lambda c: f"Segment {int(c)}")

    price_bins = pd.cut(
        df["price"],
        bins=[0, 2000, 2500, 3000, 3500, 4500, np.inf],
        labels=["<$2k", "$2k-2.5k", "$2.5k-3k", "$3k-3.5k", "$3.5k-4.5k", "$4.5k+"],
        right=False,
    )
    price_summary = (
        df.assign(price_band=price_bins, actual_hot=target)
        .groupby("price_band", observed=True)
        .agg(listings=("id", "size"), hot_rate=("actual_hot", "mean"), median_score=("score", "median"))
        .reset_index()
    )
    price_summary["share"] = price_summary["listings"] / len(df)

    transformed_names = best_model.named_steps["pre"].get_feature_names_out()
    importances = best_model.named_steps["clf"].feature_importances_
    importance_frame = pd.DataFrame(
        {
            "raw": transformed_names,
            "importance": importances,
        }
    )
    importance_frame["feature"] = importance_frame["raw"].map(display_feature_name)
    importance_frame["family"] = importance_frame["raw"].map(feature_family)
    top_importance = importance_frame.sort_values("importance", ascending=False).head(14)
    family_importance = (
        importance_frame.groupby("family", as_index=False)["importance"]
        .sum()
        .sort_values("importance", ascending=False)
    )

    target_rows = (
        df.assign(label=df["Hot Apartments"])
        .groupby("label")
        .size()
        .reset_index(name="count")
        .sort_values("label")
    )
    target_rows["share"] = target_rows["count"] / len(df)

    output = {
        "metadata": {
            "source": "case/renthop/RentHop.csv",
            "rows": int(len(df)),
            "columns": source_columns,
            "target": "Hot Apartments",
            "hot_count": int(target.sum()),
            "not_hot_count": int((1 - target).sum()),
            "hot_rate": baseline_hot_rate,
            "train_rows": int(len(x_train)),
            "test_rows": int(len(x_test)),
            "split": "70/30 stratified random split, seed 42",
            "clusters": CLUSTERS,
            "amenity_features": len(top_amenities),
            "best_model": best_model_name,
        },
        "targetDistribution": records(target_rows),
        "modelMetrics": model_metrics,
        "rocCurves": roc_curves,
        "scoreDeciles": records(pd.DataFrame(decile_rows)),
        "amenitySignals": records(pd.DataFrame(amenity_rows), digits=5),
        "clusterSummary": records(cluster_summary, digits=5),
        "mapSample": records(
            map_sample[
                [
                    "id",
                    "latitude",
                    "longitude",
                    "cluster",
                    "segment",
                    "actual_hot",
                    "score",
                    "price",
                ]
            ],
            digits=5,
        ),
        "priceBands": records(price_summary, digits=5),
        "featureImportance": records(top_importance[["feature", "family", "importance"]], digits=5),
        "featureFamilyImportance": records(family_importance, digits=5),
        "top50Summary": {
            "listings": 50,
            "actual_hot_rate": clean_number(float(top_50["actual_hot"].mean()), 3),
            "median_price": clean_number(float(top_50["price"].median()), 0),
            "mean_score": clean_number(float(top_50["score"].mean()), 3),
            "baseline_hot_rate": clean_number(baseline_hot_rate, 3),
        },
        "top50SegmentMix": records(top_50_segment_mix[["segment", "label", "listings", "hot_rate", "median_price"]]),
        "topListings": records(
            top_listing_rows[
                [
                    "rank",
                    "id",
                    "street_address",
                    "segment",
                    "segment_label",
                    "price",
                    "bedrooms",
                    "bathrooms",
                    "score",
                    "Hot Apartments",
                ]
            ],
            digits=4,
        ),
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    build()
