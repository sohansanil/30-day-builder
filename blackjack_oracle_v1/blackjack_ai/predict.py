import joblib

# Load trained model
model = joblib.load("blackjack_model.pkl")

# Example input: Player has 15, Dealer has 10
sample_hand = [[15, 10]]  # Change values for different tests

# Predict best move
prediction = model.predict(sample_hand)
move = ["Stand", "Hit", "Push"][prediction[0]]  # Mapping predictions to moves

print(f"🎲 Best Move: {move}")

