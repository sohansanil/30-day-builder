import pandas as pd

# Load dataset
df = pd.read_csv("blkjckhands.csv")

# Select relevant columns
df = df[["ply2cardsum", "sumofdeal", "blkjck", "winloss"]]  # Main player & dealer hand

# Convert categorical values to numerical
df["blkjck"] = df["blkjck"].map({"Win": 1, "nowin": 0})
df["winloss"] = df["winloss"].map({"Win": 1, "Loss": 0, "Push": 2})  # Push = Draw

# Save cleaned data
df.to_csv("clean_blackjack.csv", index=False)
print("✅ Data Preprocessed & Saved")
