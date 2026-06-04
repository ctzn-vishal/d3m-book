from __future__ import annotations

import json
import math
import random
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


BOOK_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BOOK_ROOT.parent
CASE_ROOT = REPO_ROOT / "case" / "nlp"

TRUMP_OUT = BOOK_ROOT / "app" / "trump-tweet-device-case" / "data" / "trump-tweet-case.json"
BEER_OUT = BOOK_ROOT / "app" / "goose-island-acquisition-sentiment-case" / "data" / "goose-island-case.json"

URL_RE = re.compile(r"https?://\S+|www\.\S+", re.I)
MENTION_RE = re.compile(r"@[A-Za-z0-9_]+")
HASHTAG_RE = re.compile(r"#[A-Za-z0-9_]+")
TOKEN_RE = re.compile(r"[a-z][a-z']+|#[a-z0-9_]+|\d+", re.I)

STOPWORDS = set(
    """
    a an the and or but if while with of for to in on at by from into over under
    is are was were be been being am it this that these those as do does did has
    have had i you he she they we my your our their his her its me him them us
    so just very really can will would should could may might about there here
    out up down more most much many some any all one two new via rt http https
    co amp said says get got make making made going tonight today tomorrow now
    last first next when where what who why how then than because also every ever
    """
    .split()
)


def clean_num(value: Any, digits: int | None = None) -> int | float | None:
    if value is None:
        return None
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        if math.isnan(float(value)) or math.isinf(float(value)):
            return None
        return round(float(value), digits) if digits is not None else float(value)
    return value


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")


def date_label(value: pd.Timestamp) -> str:
    return f"{value.strftime('%B')} {value.day}, {value.year}"


def tokenize(text: Any, keep_hashtags: bool = True, keep_mentions: bool = False) -> list[str]:
    value = URL_RE.sub(" URL ", str(text).lower())
    if not keep_mentions:
        value = MENTION_RE.sub(" ", value)
    tokens: list[str] = []
    for raw in TOKEN_RE.findall(value):
        token = raw.strip("'")
        if not token or len(token) < 2:
            continue
        if token == "url":
            tokens.append("URL")
            continue
        if token.startswith("@") and keep_mentions:
            tokens.append(token)
            continue
        if token.startswith("#"):
            if keep_hashtags:
                tokens.append(token)
            continue
        if token in STOPWORDS or re.fullmatch(r"\d+", token):
            continue
        tokens.append(token)
    return tokens


def ngram_features(tokens: list[str]) -> list[str]:
    bigrams = [tokens[i] + " " + tokens[i + 1] for i in range(len(tokens) - 1)]
    return tokens + bigrams


def top_log_odds(
    token_rows: list[list[str]],
    labels: list[str],
    positive_label: str,
    min_count: int = 8,
    topn: int = 14,
    allow_hashtags: bool = True,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    positive = Counter()
    other = Counter()

    for row_tokens, label in zip(token_rows, labels):
        feats = ngram_features(row_tokens)
        if label == positive_label:
            positive.update(feats)
        else:
            other.update(feats)

    vocab = []
    for feature in set(positive) | set(other):
        if positive[feature] + other[feature] < min_count:
            continue
        if not allow_hashtags and "#" in feature:
            continue
        if feature == "URL" or " URL" in feature or "URL " in feature:
            continue
        if any(part in STOPWORDS for part in feature.split()):
            continue
        vocab.append(feature)

    alpha = 0.1
    total_positive = sum(positive[feature] for feature in vocab)
    total_other = sum(other[feature] for feature in vocab)
    vocab_size = max(len(vocab), 1)
    scored = []
    for feature in vocab:
        p = (positive[feature] + alpha) / (total_positive + alpha * vocab_size)
        q = (other[feature] + alpha) / (total_other + alpha * vocab_size)
        scored.append(
            {
                "term": feature,
                "score": clean_num(math.log(p / q), 3),
                "positiveCount": int(positive[feature]),
                "otherCount": int(other[feature]),
            }
        )

    scored.sort(key=lambda row: row["score"], reverse=True)
    return scored[:topn], list(reversed(scored[-topn:]))


def simple_nb(texts: list[str], labels: list[str], seed: int = 11) -> dict[str, Any]:
    rng = random.Random(seed)
    by_label: dict[str, list[int]] = defaultdict(list)
    for idx, label in enumerate(labels):
        by_label[label].append(idx)

    train: set[int] = set()
    test: list[int] = []
    for label, indexes in by_label.items():
        shuffled = indexes[:]
        rng.shuffle(shuffled)
        cut = int(len(shuffled) * 0.75)
        train.update(shuffled[:cut])
        test.extend(shuffled[cut:])

    label_counts = Counter(labels[idx] for idx in train)
    term_counts: dict[str, Counter[str]] = {label: Counter() for label in label_counts}
    doc_frequency = Counter()

    for idx in train:
        feats = ngram_features(tokenize(texts[idx], keep_hashtags=True, keep_mentions=False))
        term_counts[labels[idx]].update(feats)
        doc_frequency.update(set(feats))

    vocab = [feature for feature, count in doc_frequency.items() if count >= 4]
    vocab_set = set(vocab)
    alpha = 0.5
    vocab_size = max(len(vocab), 1)
    totals = {label: sum(term_counts[label][feature] for feature in vocab) for label in label_counts}
    priors = {label: math.log(count / len(train)) for label, count in label_counts.items()}

    def predict(text: str) -> str:
        feats = [feature for feature in ngram_features(tokenize(text)) if feature in vocab_set]
        scores = {}
        for label in label_counts:
            score = priors[label]
            denom = totals[label] + alpha * vocab_size
            for feature in feats:
                score += math.log((term_counts[label][feature] + alpha) / denom)
            scores[label] = score
        return max(scores, key=scores.get)

    labels_sorted = sorted(label_counts)
    confusion = {(actual, predicted): 0 for actual in labels_sorted for predicted in labels_sorted}
    for idx in test:
        confusion[(labels[idx], predict(texts[idx]))] += 1

    correct = sum(confusion[(label, label)] for label in labels_sorted)
    baseline = max(Counter(labels[idx] for idx in test).values()) / len(test)

    metrics = []
    for label in labels_sorted:
        true_positive = confusion[(label, label)]
        predicted_total = sum(confusion[(actual, label)] for actual in labels_sorted)
        actual_total = sum(confusion[(label, predicted)] for predicted in labels_sorted)
        precision = true_positive / predicted_total if predicted_total else 0
        recall = true_positive / actual_total if actual_total else 0
        metrics.append(
            {
                "label": label,
                "precision": clean_num(precision, 3),
                "recall": clean_num(recall, 3),
                "actual": int(actual_total),
                "predicted": int(predicted_total),
            }
        )

    return {
        "model": "Laplace-smoothed multinomial Naive Bayes on unigram and bigram text features",
        "split": "75/25 stratified held-out split, seed 11",
        "trainRows": len(train),
        "testRows": len(test),
        "vocabTerms": len(vocab),
        "accuracy": clean_num(correct / len(test), 3),
        "baselineAccuracy": clean_num(baseline, 3),
        "labels": labels_sorted,
        "confusion": [
            {
                "actual": actual,
                "predicted": predicted,
                "count": int(confusion[(actual, predicted)]),
            }
            for actual in labels_sorted
            for predicted in labels_sorted
        ],
        "metrics": metrics,
    }


def term_rate(row_tokens: list[str], terms: set[str]) -> int:
    return sum(token in terms for token in row_tokens)


def feature_count(row_tokens: list[str], feature: str) -> int:
    return ngram_features(row_tokens).count(feature)


def build_trump_case() -> None:
    source_path = CASE_ROOT / "Tump_tweet_WP.csv"
    df = pd.read_csv(source_path)
    df["dt"] = pd.to_datetime(df["Date"], errors="coerce")
    df["device"] = df["iPhone or Android?"].str.extract(r"^(Android|iPhone)")
    df["tokens"] = df["Tweet"].map(lambda text: tokenize(text, keep_hashtags=True, keep_mentions=False))
    df["word_count"] = df["tokens"].map(len)
    df["has_url"] = df["Tweet"].str.contains(URL_RE)
    df["mentions"] = df["Tweet"].str.count(MENTION_RE)
    df["hashtags"] = df["Tweet"].str.count(HASHTAG_RE)
    df["exclaims"] = df["Tweet"].str.count("!")
    df["caps_words"] = df["Tweet"].map(lambda text: len(re.findall(r"\b[A-Z]{2,}\b", str(text))))
    df["late_night"] = df["dt"].dt.hour.isin([0, 1, 2, 3, 4, 5])
    df["workday"] = df["dt"].dt.hour.between(9, 17)

    attack_terms = set(
        "fake crooked failing dishonest weak dumb stupid loser losers corrupt rigged bad worst "
        "terrible disaster disgrace liar lies lying pathetic nasty cnn media hillary clinton "
        "rubio cruz lyin judgement judgement".split()
    )
    broadcast_terms = set(
        "thank thanks join live honor congratulations welcome happy proud support safe "
        "prayers tickets rally america maga hurricane responders".split()
    )
    df["attack_hits"] = df["tokens"].map(lambda row: term_rate(row, attack_terms))
    df["broadcast_hits"] = df["tokens"].map(lambda row: term_rate(row, broadcast_terms))

    campaign = df[df["dt"] < pd.Timestamp("2016-11-09")].copy()
    labels = campaign["device"].tolist()
    nb = simple_nb(campaign["Tweet"].tolist(), labels, seed=11)
    android_terms, iphone_terms = top_log_odds(
        campaign["tokens"].tolist(),
        labels,
        "Android",
        min_count=7,
        topn=16,
        allow_hashtags=True,
    )

    monthly = (
        df.groupby([df["dt"].dt.to_period("M").astype(str), "device"])
        .size()
        .unstack(fill_value=0)
        .reset_index()
        .rename(columns={"dt": "month"})
    )
    monthly_rows = []
    for _, row in monthly.iterrows():
        android = int(row.get("Android", 0))
        iphone = int(row.get("iPhone", 0))
        total = android + iphone
        monthly_rows.append(
            {
                "month": row["month"],
                "Android": android,
                "iPhone": iphone,
                "total": total,
                "androidShare": clean_num(android / total if total else 0, 3),
            }
        )

    def grouped_summary(frame: pd.DataFrame) -> list[dict[str, Any]]:
        rows = []
        total = len(frame)
        for device, sub in frame.groupby("device"):
            rows.append(
                {
                    "device": device,
                    "n": int(len(sub)),
                    "share": clean_num(len(sub) / total, 3),
                    "avgWords": clean_num(sub["word_count"].mean(), 2),
                    "urlShare": clean_num(sub["has_url"].mean(), 3),
                    "mentionRate": clean_num(sub["mentions"].mean(), 2),
                    "hashtagRate": clean_num(sub["hashtags"].mean(), 2),
                    "exclaimRate": clean_num(sub["exclaims"].mean(), 2),
                    "capsWordRate": clean_num(sub["caps_words"].mean(), 2),
                    "attackHits": clean_num(sub["attack_hits"].mean(), 2),
                    "broadcastHits": clean_num(sub["broadcast_hits"].mean(), 2),
                    "lateNightShare": clean_num(sub["late_night"].mean(), 3),
                    "workdayShare": clean_num(sub["workday"].mean(), 3),
                }
            )
        return sorted(rows, key=lambda row: row["device"])

    campaign_summary = grouped_summary(campaign)

    def signal(group: str, metric: str, key: str, unit: str, direction: str) -> dict[str, Any]:
        by_device = {row["device"]: row[key] for row in campaign_summary}
        return {
            "group": group,
            "metric": metric,
            "unit": unit,
            "direction": direction,
            "Android": by_device.get("Android", 0),
            "iPhone": by_device.get("iPhone", 0),
            "gap": clean_num((by_device.get("Android", 0) or 0) - (by_device.get("iPhone", 0) or 0), 3),
        }

    signal_groups = [
        {
            "id": "tone",
            "label": "Tone cues",
            "description": "Words and punctuation that make the Android-labelled tweets read more personally combative.",
            "metrics": [
                signal("tone", "Attack-word hits per tweet", "attackHits", "hits", "higher_android"),
                signal("tone", "Exclamation marks per tweet", "exclaimRate", "marks", "higher_android"),
                signal("tone", "Campaign/thanks hits per tweet", "broadcastHits", "hits", "higher_iphone"),
            ],
        },
        {
            "id": "distribution",
            "label": "Distribution cues",
            "description": "The iPhone-labelled source behaves more like a campaign broadcast channel.",
            "metrics": [
                signal("distribution", "Tweets with a URL", "urlShare", "share", "higher_iphone"),
                signal("distribution", "Hashtags per tweet", "hashtagRate", "tags", "higher_iphone"),
                signal("distribution", "Mentions per tweet", "mentionRate", "mentions", "higher_android"),
            ],
        },
        {
            "id": "timing",
            "label": "Timing cues",
            "description": "Time-of-day patterns are weaker than the text cues, but still show source routines.",
            "metrics": [
                signal("timing", "Late-night share", "lateNightShare", "share", "slightly_higher_android"),
                signal("timing", "Workday share", "workdayShare", "share", "higher_android"),
                signal("timing", "Average cleaned words", "avgWords", "words", "higher_android"),
            ],
        },
    ]

    selected_android_terms = [
        "lyin",
        "bad judgement",
        "crooked",
        "fake",
        "rubio cruz",
        "dishonest",
        "loser",
        "weak",
        "cnn",
        "media",
        "disaster",
        "poor",
    ]
    selected_iphone_terms = [
        "#draintheswamp",
        "#imwithyou",
        "#maga",
        "join live",
        "thank support",
        "thank america",
        "tickets",
        "rally",
        "safe great",
        "thoughts prayers",
        "#americafirst",
        "#trump2016",
    ]

    def selected_term_rows(terms: list[str]) -> list[dict[str, Any]]:
        rows = []
        for term in terms:
            android_count = int(campaign[campaign["device"] == "Android"]["tokens"].map(lambda row: feature_count(row, term)).sum())
            iphone_count = int(campaign[campaign["device"] == "iPhone"]["tokens"].map(lambda row: feature_count(row, term)).sum())
            android_rate = android_count / len(campaign[campaign["device"] == "Android"])
            iphone_rate = iphone_count / len(campaign[campaign["device"] == "iPhone"])
            rows.append(
                {
                    "term": term,
                    "Android": android_count,
                    "iPhone": iphone_count,
                    "androidRate": clean_num(android_rate, 4),
                    "iphoneRate": clean_num(iphone_rate, 4),
                    "gap": clean_num(android_rate - iphone_rate, 4),
                }
            )
        return rows

    def example_rows(device: str, sort_cols: list[str], ascending: list[bool], limit: int = 3) -> list[dict[str, Any]]:
        sub = campaign[campaign["device"] == device].copy()
        sub = sub.sort_values(sort_cols, ascending=ascending).head(limit)
        return [
            {
                "date": row["dt"].strftime("%Y-%m-%d %H:%M"),
                "device": row["device"],
                "tweet": str(row["Tweet"])[:240],
            }
            for _, row in sub.iterrows()
        ]

    payload = {
        "metadata": {
            "sourceFile": str(source_path.relative_to(REPO_ROOT)).replace("\\", "/"),
            "contextFile": str((CASE_ROOT / "case_context.docx").relative_to(REPO_ROOT)).replace("\\", "/"),
            "rows": int(len(df)),
            "startDate": date_label(df["dt"].min()),
            "endDate": date_label(df["dt"].max()),
            "campaignRows": int(len(campaign)),
            "campaignWindow": "January 1, 2016 through November 8, 2016",
            "deviceCounts": {key: int(value) for key, value in df["device"].value_counts().to_dict().items()},
            "note": "The full file continues into 2017; the classifier is trained on the 2016 campaign window to avoid the later all-iPhone source regime.",
        },
        "monthly": monthly_rows,
        "campaignSummary": campaign_summary,
        "signalGroups": signal_groups,
        "classifier": nb,
        "termContrast": {
            "Android": android_terms,
            "iPhone": iphone_terms,
        },
        "selectedTerms": {
            "Android": selected_term_rows(selected_android_terms),
            "iPhone": selected_term_rows(selected_iphone_terms),
        },
        "examples": {
            "Android": example_rows("Android", ["attack_hits", "exclaims", "dt"], [False, False, True]),
            "iPhone": example_rows("iPhone", ["has_url", "broadcast_hits", "dt"], [False, False, True]),
        },
    }
    write_json(TRUMP_OUT, payload)


POSITIVE_TERMS = set(
    """
    good great excellent love loved like liked delicious tasty mmmm amazing awesome beautiful
    best favorite favourite enjoy enjoying enjoyed nice perfect wonderful fresh happy cheers
    refreshing smooth fine solid excited excellent chill cold balanced special
    """
    .split()
)

NEGATIVE_TERMS = set(
    """
    bad awful terrible hate hated worst fail weak ruined ruin garbage disgusting sucks suck
    poor worse sad disappointed disappointing never bland nostalgia save typical delay
    corporate sellout no not fuck shit
    """
    .split()
)

ACQUISITION_TERMS = set(
    """
    ab inbev anheuser busch budweiser acquisition acquired bought buys buyout buy sold selling
    sellout corporate craft macro takeover merger nostalgia ruined save changes goodbye goodbye
    """
    .split()
)

PRODUCT_TERMS = set(
    """
    ipa matilda honkers honker ale 312 sofie bourbon stout pere jacques summertime fleur beer
    beers brewery brewpub clybourn wrigley county bcs pepe nero
    """
    .split()
)

CHECKIN_SOURCES = {"Foursquare", "Gowalla", "Untappd", "Instagram", "picplz", "Flickr", "Twitpic"}
PROMO_SOURCES = {"twitterfeed", "Hootsuite", "Facebook", "Twitter for Websites", "SharedBy"}


def build_beer_case() -> None:
    source_path = CASE_ROOT / "beer_sentiment.csv"
    df = pd.read_csv(source_path, encoding="latin1")
    df["dt"] = pd.to_datetime(df["created_at"], errors="coerce", utc=True)
    df["day"] = pd.to_datetime(df["date"], errors="coerce")
    df["tokens"] = df["text"].map(lambda text: tokenize(text, keep_hashtags=True, keep_mentions=False))
    df["positive_hits"] = df["tokens"].map(lambda row: term_rate(row, POSITIVE_TERMS))
    df["negative_hits"] = df["tokens"].map(lambda row: term_rate(row, NEGATIVE_TERMS))
    df["acquisition_hits"] = df["tokens"].map(lambda row: term_rate(row, ACQUISITION_TERMS))
    df["product_hits"] = df["tokens"].map(lambda row: term_rate(row, PRODUCT_TERMS))
    df["sentiment_score"] = df["positive_hits"] - df["negative_hits"]
    df["sentiment_label"] = np.select(
        [df["sentiment_score"] > 0, df["sentiment_score"] < 0],
        ["positive", "negative"],
        default="neutral",
    )
    df["acquisition_discussion"] = df["acquisition_hits"] > 0
    df["has_url"] = df["contains_url"].astype(bool)
    df["checkin_source"] = df["source"].isin(CHECKIN_SOURCES)
    df["promo_source"] = df["source"].isin(PROMO_SOURCES)
    df["evaluative"] = (df["positive_hits"] + df["negative_hits"] > 0) | df["acquisition_discussion"]

    period_order = ["Pre", "Acquisition", "Post"]

    period_rows = []
    for period in period_order:
        sub = df[df["Acquisition"] == period]
        period_rows.append(
            {
                "period": period,
                "n": int(len(sub)),
                "startDate": date_label(sub["day"].min()),
                "endDate": date_label(sub["day"].max()),
                "avgSentiment": clean_num(sub["sentiment_score"].mean(), 3),
                "positiveShare": clean_num((sub["sentiment_label"] == "positive").mean(), 3),
                "negativeShare": clean_num((sub["sentiment_label"] == "negative").mean(), 3),
                "neutralShare": clean_num((sub["sentiment_label"] == "neutral").mean(), 3),
                "acquisitionCueShare": clean_num(sub["acquisition_discussion"].mean(), 3),
                "urlShare": clean_num(sub["has_url"].mean(), 3),
                "checkinShare": clean_num(sub["checkin_source"].mean(), 3),
                "promoShare": clean_num(sub["promo_source"].mean(), 3),
                "evaluativeShare": clean_num(sub["evaluative"].mean(), 3),
                "productHits": clean_num(sub["product_hits"].mean(), 2),
            }
        )

    daily = []
    for day, sub in df.groupby("day"):
        period = sub["Acquisition"].mode().iat[0]
        daily.append(
            {
                "date": day.strftime("%Y-%m-%d"),
                "period": period,
                "n": int(len(sub)),
                "avgSentiment": clean_num(sub["sentiment_score"].mean(), 3),
                "positiveShare": clean_num((sub["sentiment_label"] == "positive").mean(), 3),
                "negativeShare": clean_num((sub["sentiment_label"] == "negative").mean(), 3),
                "acquisitionCueShare": clean_num(sub["acquisition_discussion"].mean(), 3),
                "urlShare": clean_num(sub["has_url"].mean(), 3),
            }
        )

    source_groups = []
    df["source_group"] = np.select(
        [df["checkin_source"], df["promo_source"], df["has_url"]],
        ["Check-in / beer app", "Promotional / feed", "Link-bearing chatter"],
        default="Native text tweet",
    )
    for source_group, sub in df.groupby("source_group"):
        row = {"sourceGroup": source_group}
        for period in period_order:
            period_count = len(df[df["Acquisition"] == period])
            row[period] = clean_num(len(sub[sub["Acquisition"] == period]) / period_count, 3)
        source_groups.append(row)
    source_groups.sort(key=lambda row: row["Post"], reverse=True)

    selected_period_terms = [
        "anheuser",
        "busch",
        "bought",
        "sold",
        "craft",
        "corporate",
        "sellout",
        "ruined",
        "goodbye",
        "nostalgia",
        "ipa",
        "matilda",
        "312",
        "stout",
        "sofie",
        "honkers",
        "bourbon",
        "clybourn",
    ]

    period_cue_terms = []
    for term in selected_period_terms:
        row = {"term": term}
        for period in period_order:
            sub = df[df["Acquisition"] == period]
            count = int(sub["tokens"].map(lambda tokens: feature_count(tokens, term)).sum())
            row[period] = count
            row[f"{period}Rate"] = clean_num(count / len(sub), 4)
        period_cue_terms.append(row)

    token_rows = df["tokens"].tolist()
    labels = df["Acquisition"].tolist()
    acquisition_terms, _ = top_log_odds(token_rows, ["Acquisition" if label == "Acquisition" else "Other" for label in labels], "Acquisition", min_count=15, topn=16)
    post_vs_pre = df[df["Acquisition"].isin(["Pre", "Post"])].copy()
    post_terms, pre_terms = top_log_odds(
        post_vs_pre["tokens"].tolist(),
        post_vs_pre["Acquisition"].tolist(),
        "Post",
        min_count=12,
        topn=14,
    )

    def examples(label: str, frame: pd.DataFrame, sort_cols: list[str], ascending: list[bool]) -> list[dict[str, Any]]:
        sub = frame.copy()
        sub["text_len"] = sub["text"].astype(str).str.len()
        sub = sub.sort_values(sort_cols + ["text_len"], ascending=ascending + [True]).head(3)
        return [
            {
                "label": label,
                "date": row["day"].strftime("%Y-%m-%d"),
                "source": str(row["source"]),
                "text": str(row["text"])[:240],
                "sentimentScore": clean_num(row["sentiment_score"], 2),
            }
            for _, row in sub.iterrows()
        ]

    example_payload = {
        "Pre": examples(
            "Positive product talk before the event",
            df[(df["Acquisition"] == "Pre") & (df["sentiment_score"] > 1) & (~df["has_url"])],
            ["sentiment_score", "product_hits"],
            [False, False],
        ),
        "Acquisition": examples(
            "Acquisition anxiety and news talk",
            df[(df["Acquisition"] == "Acquisition") & (df["acquisition_discussion"]) & (~df["has_url"])],
            ["acquisition_hits", "negative_hits"],
            [False, False],
        ),
        "Post": examples(
            "Post-event product conversation",
            df[(df["Acquisition"] == "Post") & (df["sentiment_score"] > 1) & (~df["has_url"])],
            ["sentiment_score", "product_hits"],
            [False, False],
        ),
    }

    payload = {
        "metadata": {
            "sourceFile": str(source_path.relative_to(REPO_ROOT)).replace("\\", "/"),
            "contextFile": str((CASE_ROOT / "case_context.docx").relative_to(REPO_ROOT)).replace("\\", "/"),
            "rows": int(len(df)),
            "startDate": date_label(df["day"].min()),
            "endDate": date_label(df["day"].max()),
            "acquisitionDate": "March 30, 2011",
            "periodNote": "The source labels March 28-29 as the acquisition-news window and March 30-June 30 as post-acquisition.",
            "sentimentMethod": "Transparent teaching lexicon: positive product words minus negative/friction words, plus a separate acquisition-cue dictionary.",
        },
        "periods": period_rows,
        "daily": daily,
        "sourceGroups": source_groups,
        "periodCueTerms": period_cue_terms,
        "termContrast": {
            "Acquisition": acquisition_terms,
            "Post": post_terms,
            "Pre": pre_terms,
        },
        "examples": example_payload,
        "lexicon": {
            "positive": sorted(POSITIVE_TERMS)[:80],
            "negative": sorted(NEGATIVE_TERMS)[:80],
            "acquisition": sorted(ACQUISITION_TERMS)[:80],
        },
    }
    write_json(BEER_OUT, payload)


def main() -> None:
    build_trump_case()
    build_beer_case()
    print(f"Wrote {TRUMP_OUT}")
    print(f"Wrote {BEER_OUT}")


if __name__ == "__main__":
    main()
