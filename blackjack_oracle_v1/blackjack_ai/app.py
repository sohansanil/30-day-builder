from flask import Flask, request, jsonify
import joblib


app = Flask(__name__)

@app.route("/")
def home():
    return "Flask API is running!"

if __name__ == "__main__":
    app.run(debug=True)


# Load trained model
model = joblib.load("blackjack_model.pkl")

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    player_sum = data["player_sum"]
    dealer_sum = data["dealer_sum"]

    # Predict
    prediction = model.predict([[player_sum, dealer_sum]])
    move = ["Stand", "Hit", "Push"][prediction[0]]  

    return jsonify({"best_move": move})

if __name__ == '__main__':
    app.run(debug=True, port=5001)

print("Received request:", request.json)
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    print("Received request:", data)  # Debugging print

    if not data or 'player_hand' not in data or 'dealer_card' not in data:
        return jsonify({"error": "Invalid input"}), 400

    return jsonify({"action": "hit"})
