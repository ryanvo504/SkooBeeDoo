from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import pandas as pd
from livability_forecast_class import LivabilityForecast
import groq

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

# Weights for city scoring
WEIGHTS = {
    'Housing': 0.2,
    'Transportation': 0.15,
    'Environment': 0.15,
    'Health': 0.2,
    'Neighborhood': 0.1,
    'Engagement': 0.1,
    'Opportunity': 0.1
}

# Load JSON data once when the app starts
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
groq_client = groq.Client(api_key=os.environ.get('GROQ_API_KEY'))

@app.route('/api/city-data', methods=['GET'])
def get_city_data():
    if CITY_DATA is None:
        return jsonify({'error': 'City data not loaded'}), 500
    return jsonify(CITY_DATA)

@app.route('/api/city-scores', methods=['GET'])
def get_city_scores():
    try:
        # If data is loaded from JSON
        if CITY_DATA:
            # Calculate scores based on existing data
            city_scores = []
            for entry in CITY_DATA:
                general_score = sum(
                    entry.get(category, 0) * weight 
                    for category, weight in WEIGHTS.items()
                )
                city_scores.append({
                    'geo_label_citystate': entry.get('geo_label_citystate', 'Unknown'),
                    'date_label': entry.get('date_label', 'Unknown'),
                    'Average_General_Score': general_score
                })
            
            return jsonify(city_scores)
        
        return jsonify({'error': 'No city data available'}), 404

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

@app.route('/api/generate-city-explanations', methods=['POST'])
def generate_city_explanations():
    try:
        # Get top cities from request
        top_cities = request.json.get('top_cities', [])
        
        city_explanations = {}
        for city, score in top_cities:
            # Generate AI explanation using Groq
            prompt = f"Explain why {city} is an excellent place to live based on its high livability score of {score}"
            
            response = groq_client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[
                    {"role": "system", "content": "You are a helpful city living advisor."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            city_explanations[city] = response.choices[0].message.content

        return jsonify(city_explanations)

    except Exception as error:
        print(f'Error generating city explanations: {error}')
        return jsonify({'error': 'Failed to generate city explanations'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)