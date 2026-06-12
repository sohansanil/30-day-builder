
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

# Load the trained model
model = joblib.load("blackjack_model.pkl")

# Load the dataset
df = pd.read_csv("../clean_blackjack.csv")  # Adjust path if needed

# Split the data into features and labels
X = df.drop(columns=["decision"])  # Assuming "decision" is the target column
y = df["decision"]

# Split into training and testing sets (same 80-20 split used during training)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Make predictions
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print(f"Model Accuracy: {accuracy:.2%}")

