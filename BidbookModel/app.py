from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

app = Flask(__name__)

# 🔹 Charger et entraîner le modèle dès le lancement
def train_model():
    df = pd.read_csv('bidbook.csv')

    X = df.drop("prix", axis=1)
    y = df["prix"]

    binary_cols = ['édition_originale', 'reliure_cuir', 'avec_dédicace']
    numeric_cols = ['année_édition', 'nombre_pages', 'pages_arrachées', 'nombre_exemplaires_connus']
    categorical_cols = ['titre', 'auteur', 'genre', 'langue', 'éditeur', 'état_général']

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), numeric_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("bin", 'passthrough', binary_cols)
    ])

    model = Pipeline(steps=[
        ("preprocessing", preprocessor),
        ("regressor", GradientBoostingRegressor(n_estimators=300, max_depth=6, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)

    # (optionnel) Afficher l’évaluation dans le terminal
    y_pred = model.predict(X_test)
    print("✅ MAE :", mean_absolute_error(y_test, y_pred))
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print("✅ RMSE :", rmse)

    print("✅ R² :", r2_score(y_test, y_pred))

    return model

# 🔹 Entraîner une seule fois au lancement
model = train_model()

@app.route('/predict', methods=['POST'])
def predict():
    input_data = request.get_json()

    input_df = pd.DataFrame([input_data])
    prediction = model.predict(input_df)[0]

    return jsonify({'prediction': round(prediction, 2)})

@app.route('/')
def home():
    return "✅ Modèle prêt à prédire ! Utilise POST /predict"

if __name__ == '__main__':
    app.run(debug=True)
