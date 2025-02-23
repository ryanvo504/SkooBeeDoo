from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import pandas as pd
import groq

# Import custom modules
from forecast.livability_forecast_class import LivabilityForecast
from score.generalscore import calculate_general_scores

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:3001",
            "http://localhost:3000",
            "http://localhost:5001",
            "https://skoo-bee-doo.vercel.app"
        ]
    }
})

# Load JSON data
def load_json_data():
    json_filepath = 'Data/categorized_data_0_1.json'
    try:
        with open(json_filepath, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return None

CITY_DATA = load_json_data()

# Initialize Groq

@app.route('/api/city-data', methods=['GET'])
def get_city_data():
    if CITY_DATA is None:
        return jsonify({'error': 'City data not loaded'}), 500
    return jsonify(CITY_DATA)

@app.route('/api/city-scores', methods=['POST'])
def calculate_city_scores():
    try:
        # Get user weights from the request
        user_weights = request.json.get('weights', None)
        
        # Use the calculate_general_scores function
        city_scores = calculate_general_scores(user_weights)
        
        return jsonify(city_scores)

    except Exception as error:
        print(f'Error calculating city scores: {error}')
        return jsonify({'error': 'Failed to calculate city scores'}), 500

@app.route('/api/city-scores', methods=['GET'])
def get_city_scores():
    try:
        # Load pre-calculated scores from JSON
        json_filepath = 'Data/categorized_data_0_1.json'
        try:
            with open(json_filepath, 'r') as f:
                city_scores = json.load(f)
            return jsonify(city_scores)
        except Exception as e:
            print(f"Error loading scores: {e}")
            return jsonify({'error': 'Failed to load city scores'}), 500

    except Exception as error:
        print(f'Error fetching city scores: {error}')
        return jsonify({'error': 'Failed to fetch city scores'}), 500

@app.route('/api/city-forecast', methods=['GET'])
def get_city_forecast():
    try:
        # Use CSV for forecasting
        csv_filepath = 'Data/categorized_data_0_1.csv'
        
        # Instantiate the forecast model
        forecast_obj = LivabilityForecast(csv_filepath)
        
        # Generate 5-year forecasts
        predictions = forecast_obj.forecast(periods=5)
        
        # Convert forecasts to a more JSON-friendly format
        forecast_results = {}
        for city, forecast_df in predictions.items():
            forecast_results[city] = {
                'years': forecast_df['ds'].dt.year.tolist(),
                'forecast': forecast_df['yhat'].tolist(),
                'lower_bound': forecast_df['yhat_lower'].tolist(),
                'upper_bound': forecast_df['yhat_upper'].tolist()
            }
        
        return jsonify(forecast_results)

    except Exception as error:
        print(f'Error fetching city forecasts: {error}')
        return jsonify({'error': 'Failed to fetch city forecasts'}), 500



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)