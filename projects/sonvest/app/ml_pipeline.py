#!/usr/bin/env python3
"""
SignalOS ML Pipeline
Reads S&P 500 CSV data, engineers features, trains multiple unsupervised models
for market regime detection, and outputs JSON files for the backend.
"""

import json
import os
import warnings
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, calinski_harabasz_score
from hmmlearn.hmm import GaussianHMM

warnings.filterwarnings('ignore')
np.random.seed(42)

OUTPUT_DIR = "/mnt/agents/output/app/api/ml_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================================
# 1. DATA INGESTION (from CSV files)
# ============================================================================
print("[1/5] Loading S&P 500 data...")

# Load both CSV files and merge
df1 = pd.read_csv("/mnt/agents/output/app/sp500_earlier.csv")
df2 = pd.read_csv("/mnt/agents/output/app/sp500_2y.csv")

# Combine
df = pd.concat([df1, df2], ignore_index=True)

# Parse dates and deduplicate
df['Date'] = pd.to_datetime(df['Date'])
df = df.drop_duplicates(subset=['Date'], keep='first')
df = df.sort_values('Date').reset_index(drop=True)

# Select only needed columns
df = df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']].copy()
df.columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']

print(f"      Loaded {len(df)} trading days from {df['Date'].min().date()} to {df['Date'].max().date()}")

# ============================================================================
# 2. FEATURE ENGINEERING
# ============================================================================
print("[2/5] Engineering features...")

df['Returns'] = df['Close'].pct_change()
df['Log_Returns'] = np.log(df['Close'] / df['Close'].shift(1))

# Volatility features
df['Volatility_10d'] = df['Returns'].rolling(window=10).std() * np.sqrt(252)
df['Volatility_20d'] = df['Returns'].rolling(window=20).std() * np.sqrt(252)
df['Volatility_60d'] = df['Returns'].rolling(window=60).std() * np.sqrt(252)

# Momentum features
df['Momentum_10d'] = df['Close'].pct_change(10)
df['Momentum_30d'] = df['Close'].pct_change(30)
df['Momentum_90d'] = df['Close'].pct_change(90)

# Moving average features
df['MA_20'] = df['Close'].rolling(window=20).mean()
df['MA_50'] = df['Close'].rolling(window=50).mean()
df['MA_200'] = df['Close'].rolling(window=200).mean()
df['MA_Ratio_20_50'] = df['MA_20'] / df['MA_50']
df['Price_to_MA20'] = df['Close'] / df['MA_20']

# Drawdown features
df['Cumulative_Returns'] = (1 + df['Returns']).cumprod()
df['Peak'] = df['Cumulative_Returns'].cummax()
df['Drawdown'] = (df['Cumulative_Returns'] / df['Peak']) - 1
df['Max_Drawdown_20d'] = df['Drawdown'].rolling(window=20).min()

# ATR (Average True Range)
df['High_Low'] = df['High'] - df['Low']
df['High_Close'] = np.abs(df['High'] - df['Close'].shift(1))
df['Low_Close'] = np.abs(df['Low'] - df['Close'].shift(1))
df['True_Range'] = df[['High_Low', 'High_Close', 'Low_Close']].max(axis=1)
df['ATR_14'] = df['True_Range'].rolling(window=14).mean()
df['ATR_Ratio'] = df['ATR_14'] / df['Close']

# Volume features
df['Volume_MA_20'] = df['Volume'].rolling(window=20).mean()
df['Volume_Ratio'] = df['Volume'] / df['Volume_MA_20']

# Return distribution features
df['Returns_Skew_20d'] = df['Returns'].rolling(window=20).skew()
df['Returns_Kurt_20d'] = df['Returns'].rolling(window=20).kurt()

# Trend strength
df['Trend_Strength'] = df['Close'] / df['MA_200']

# Drop NaN values
df = df.dropna().reset_index(drop=True)

FEATURE_COLS = [
    'Volatility_20d', 'Volatility_60d',
    'Momentum_10d', 'Momentum_30d', 'Momentum_90d',
    'MA_Ratio_20_50', 'Price_to_MA20',
    'Max_Drawdown_20d', 'ATR_Ratio',
    'Volume_Ratio', 'Returns_Skew_20d',
    'Trend_Strength'
]

# Standardize features
scaler = StandardScaler()
X = scaler.fit_transform(df[FEATURE_COLS])

print(f"      Engineered {len(FEATURE_COLS)} features across {len(df)} days")

# ============================================================================
# 3. MODEL TRAINING
# ============================================================================
print("[3/5] Training unsupervised models...")

N_REGIMES = 4

# --- Model 1: Hidden Markov Model ---
print("      Training HMM...")
hmm_model = GaussianHMM(n_components=N_REGIMES, covariance_type="full", n_iter=200, random_state=42)
hmm_model.fit(X)
hmm_labels = hmm_model.predict(X)
hmm_proba = hmm_model.predict_proba(X)

# --- Model 2: Gaussian Mixture Model ---
print("      Training GMM...")
gmm_model = GaussianMixture(n_components=N_REGIMES, covariance_type="full", n_init=10, random_state=42)
gmm_model.fit(X)
gmm_labels = gmm_model.predict(X)
gmm_proba = gmm_model.predict_proba(X)

# --- Model 3: K-Means Clustering ---
print("      Training KMeans...")
kmeans_model = KMeans(n_clusters=N_REGIMES, n_init=10, random_state=42)
kmeans_labels = kmeans_model.fit_predict(X)

# --- Model 4: PCA for visualization ---
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)

print("      All models trained successfully")

# ============================================================================
# 4. REGIME INTERPRETATION & METRICS
# ============================================================================
print("[4/5] Computing regime characteristics and metrics...")


def interpret_regimes(labels, model_name):
    """Interpret what each regime means based on feature averages."""
    regime_stats = []
    for r in range(N_REGIMES):
        mask = labels == r
        regime_data = df.loc[mask]
        if len(regime_data) == 0:
            continue

        avg_return = regime_data['Returns'].mean() * 252  # annualized
        avg_vol = regime_data['Volatility_20d'].mean()
        avg_drawdown = regime_data['Drawdown'].mean()
        avg_momentum = regime_data['Momentum_30d'].mean()
        count = len(regime_data)
        pct = count / len(df) * 100

        # Name the regime based on characteristics
        if avg_return > 0.05 and avg_vol < 0.15:
            name = "Bull Market"
            color = "#10B981"  # green
        elif avg_return < -0.05 and avg_vol < 0.20:
            name = "Bear Market"
            color = "#EF4444"  # red
        elif avg_vol > 0.20:
            name = "High Volatility"
            color = "#F59E0B"  # amber
        elif avg_return > 0 and avg_momentum > 0.02:
            name = "Recovery"
            color = "#3B82F6"  # blue
        else:
            name = "Transition"
            color = "#8B5CF6"  # purple

        regime_stats.append({
            "regime_id": int(r),
            "name": name,
            "color": color,
            "count": int(count),
            "percentage": round(pct, 1),
            "avg_annual_return": round(avg_return, 3),
            "avg_volatility": round(avg_vol, 3),
            "avg_drawdown": round(avg_drawdown, 3),
            "avg_momentum_30d": round(avg_momentum, 3)
        })

    return regime_stats


# Interpret regimes for each model
hmm_regimes = interpret_regimes(hmm_labels, "HMM")
gmm_regimes = interpret_regimes(gmm_labels, "GMM")
kmeans_regimes = interpret_regimes(kmeans_labels, "KMeans")

# Regime label mapping (use HMM as primary since it's most sophisticated)
regime_name_map = {r["regime_id"]: r["name"] for r in hmm_regimes}
regime_color_map = {r["regime_id"]: r["color"] for r in hmm_regimes}

# ============================================================================
# 5. FEATURE IMPORTANCE PER REGIME
# ============================================================================
print("[5/5] Computing feature importance and saving data...")

feature_importance = []
for r in range(N_REGIMES):
    mask = hmm_labels == r
    regime_mean = X[mask].mean(axis=0)
    overall_mean = X.mean(axis=0)
    overall_std = X.std(axis=0)
    z_scores = (regime_mean - overall_mean) / (overall_std + 1e-8)

    for i, feat in enumerate(FEATURE_COLS):
        feature_importance.append({
            "regime_id": int(r),
            "regime_name": regime_name_map.get(r, f"Regime {r}"),
            "feature": feat,
            "z_score": round(z_scores[i], 3),
            "importance": round(abs(z_scores[i]), 3)
        })

# ============================================================================
# 6. SAVE ALL OUTPUT
# ============================================================================

# 6a. Daily market data with regime labels
daily_data = []
for i, row in df.iterrows():
    daily_data.append({
        "date": row['Date'].strftime("%Y-%m-%d"),
        "close": round(float(row['Close']), 2),
        "returns": round(float(row['Returns']), 6) if not pd.isna(row['Returns']) else 0,
        "volume": int(row['Volume']),
        "volatility_20d": round(float(row['Volatility_20d']), 4) if not pd.isna(row['Volatility_20d']) else 0,
        "momentum_30d": round(float(row['Momentum_30d']), 4) if not pd.isna(row['Momentum_30d']) else 0,
        "drawdown": round(float(row['Drawdown']), 4) if not pd.isna(row['Drawdown']) else 0,
        "regime_hmm": int(hmm_labels[i]),
        "regime_hmm_name": regime_name_map.get(hmm_labels[i], "Unknown"),
        "regime_hmm_color": regime_color_map.get(hmm_labels[i], "#666"),
        "regime_gmm": int(gmm_labels[i]),
        "regime_kmeans": int(kmeans_labels[i]),
        "hmm_proba": [round(p, 4) for p in hmm_proba[i].tolist()],
        "pca_x": round(float(X_pca[i][0]), 4),
        "pca_y": round(float(X_pca[i][1]), 4),
    })

with open(f"{OUTPUT_DIR}/daily_data.json", "w") as f:
    json.dump(daily_data, f)

# 6b. Model comparison
model_comparison = {
    "models": [
        {
            "id": "hmm",
            "name": "Hidden Markov Model",
            "short_name": "HMM",
            "description": "Probabilistic model with latent states and Markov transition dynamics. Best for time-series with state persistence.",
            "strengths": ["Captures temporal persistence", "Probabilistic regime assignments", "Transition matrix interpretability"],
            "weaknesses": ["Assumes Gaussian emissions", "Sensitive to initialization", "Can get stuck in local optima"],
            "metrics": {
                "silhouette": round(silhouette_score(X, hmm_labels), 3),
                "calinski_harabasz": round(calinski_harabasz_score(X, hmm_labels), 1),
                "aic": round(hmm_model.aic(X), 1),
                "bic": round(hmm_model.bic(X), 1)
            },
            "regimes": hmm_regimes,
            "transition_matrix": hmm_model.transmat_.tolist()
        },
        {
            "id": "gmm",
            "name": "Gaussian Mixture Model",
            "short_name": "GMM",
            "description": "Soft clustering using multivariate Gaussian distributions. Each point has a probability of belonging to each regime.",
            "strengths": ["Soft assignments (probabilistic)", "Flexible covariance structures", "Well-established theory"],
            "weaknesses": ["No temporal modeling", "Assumes Gaussian components", "Can overfit with many parameters"],
            "metrics": {
                "silhouette": round(silhouette_score(X, gmm_labels), 3),
                "calinski_harabasz": round(calinski_harabasz_score(X, gmm_labels), 1),
                "aic": round(gmm_model.aic(X), 1),
                "bic": round(gmm_model.bic(X), 1)
            },
            "regimes": gmm_regimes
        },
        {
            "id": "kmeans",
            "name": "K-Means Clustering",
            "short_name": "KMeans",
            "description": "Partitions data into K clusters minimizing within-cluster variance. Fast and scalable for large datasets.",
            "strengths": ["Fast and scalable", "Simple to interpret", "Deterministic with fixed seed"],
            "weaknesses": ["Hard assignments only", "Assumes spherical clusters", "Sensitive to outliers", "No temporal awareness"],
            "metrics": {
                "silhouette": round(silhouette_score(X, kmeans_labels), 3),
                "calinski_harabasz": round(calinski_harabasz_score(X, kmeans_labels), 1),
                "aic": None,
                "bic": None
            },
            "regimes": kmeans_regimes
        }
    ],
    "features_used": FEATURE_COLS,
    "data_range": {
        "start": df['Date'].min().strftime("%Y-%m-%d"),
        "end": df['Date'].max().strftime("%Y-%m-%d"),
        "trading_days": len(df)
    }
}

with open(f"{OUTPUT_DIR}/model_comparison.json", "w") as f:
    json.dump(model_comparison, f)

# 6c. Feature importance
with open(f"{OUTPUT_DIR}/feature_importance.json", "w") as f:
    json.dump(feature_importance, f)

# 6d. Current state (latest data point)
latest = daily_data[-1]
current_regime_id = latest["regime_hmm"]
current_proba = latest["hmm_proba"]

# Find historical periods with similar regime
similar_periods = []
for i in range(len(daily_data) - 60):
    if daily_data[i]["regime_hmm"] == current_regime_id:
        similar_periods.append(daily_data[i]["date"])

step = max(1, len(similar_periods) // 5)
selected_similar = [similar_periods[i] for i in range(0, len(similar_periods), step)][:5]


def generate_explanation(regime_id, feature_importance_list):
    """Generate human-readable explanation for current regime."""
    regime_feats = [f for f in feature_importance_list if f["regime_id"] == regime_id]
    regime_feats.sort(key=lambda x: abs(x["z_score"]), reverse=True)

    explanations = []
    for feat in regime_feats[:5]:
        direction = "high" if feat["z_score"] > 0 else "low"
        feat_name = feat["feature"].replace("_", " ").title()
        explanations.append(f"{feat_name} is {direction} (z={feat['z_score']:+.2f})")

    return explanations


current_explanations = generate_explanation(current_regime_id, feature_importance)

current_state = {
    "date": latest["date"],
    "close": latest["close"],
    "regime_id": current_regime_id,
    "regime_name": latest["regime_hmm_name"],
    "regime_color": latest["regime_hmm_color"],
    "confidence": round(max(current_proba) * 100, 1),
    "regime_probabilities": [
        {"regime_id": i, "probability": round(p * 100, 1), "regime_name": regime_name_map.get(i, f"Regime {i}")}
        for i, p in enumerate(current_proba)
    ],
    "historical_similarities": selected_similar,
    "explanations": current_explanations,
    "volatility": latest["volatility_20d"],
    "momentum_30d": latest["momentum_30d"],
    "drawdown": latest["drawdown"]
}

with open(f"{OUTPUT_DIR}/current_state.json", "w") as f:
    json.dump(current_state, f)

# 6e. Summary statistics
summary = {
    "data_range": {
        "start": df['Date'].min().strftime("%Y-%m-%d"),
        "end": df['Date'].max().strftime("%Y-%m-%d"),
        "trading_days": len(df)
    },
    "latest_close": round(float(df['Close'].iloc[-1]), 2),
    "latest_date": df['Date'].iloc[-1].strftime("%Y-%m-%d"),
    "overall_return": round(float((df['Close'].iloc[-1] / df['Close'].iloc[0]) - 1) * 100, 1),
    "avg_annual_volatility": round(float(df['Volatility_20d'].mean()) * 100, 1),
    "max_drawdown": round(float(df['Drawdown'].min()) * 100, 1),
    "current_regime": current_state["regime_name"],
    "models_trained": ["HMM", "GMM", "KMeans"],
    "features_count": len(FEATURE_COLS)
}

with open(f"{OUTPUT_DIR}/summary.json", "w") as f:
    json.dump(summary, f)

print("\n✅ ML Pipeline Complete!")
print(f"   Output files saved to: {OUTPUT_DIR}")
print(f"   Current regime: {current_state['regime_name']} (confidence: {current_state['confidence']}%)")
print(f"   Trading days analyzed: {len(daily_data)}")
