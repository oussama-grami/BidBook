from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

app = Flask(__name__)

def train_model():
    # Get the absolute path to the CSV file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "bidbook.csv")
    
    # Try alternative file if first one is not found
    if not os.path.exists(csv_path):
        csv_path = os.path.join(current_dir, "bidbook1.csv")
        
    print(f"Loading data from: {csv_path}")
    
    df = pd.read_csv(csv_path)

    X = df.drop("price", axis=1)
    y = df["price"]

    numeric_cols = ['edition', 'totalPages', 'damagedPages', 'age']
    categorical_cols = ['category', 'language']

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), numeric_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols)
    ])

    model = Pipeline(steps=[
        ("preprocessing", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print("Un Petit Cadeau , RIHAB")
    print("Model Evaluation:")
    print("MAE :", round(mean_absolute_error(y_test, y_pred), 2))
    print("RMSE :", round(np.sqrt(mean_squared_error(y_test, y_pred)), 2))
    print("R² :", round(r2_score(y_test, y_pred), 4))

    return model

model = train_model()

@app.route('/predict', methods=['POST'])
def predict():
    input_data = request.get_json()
    input_df = pd.DataFrame([input_data])
    prediction = model.predict(input_df)[0]
    return jsonify({'prediction': round(prediction, 2)})

@app.route('/')
def home():
    return "📘 AI Book Price Model Ready! Use POST /predict with JSON input."

if __name__ == '__main__':
    app.run(debug=True)