from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import pandas as pd
from groq import Groq


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
client = Groq(
            api_key="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"
        )
@app.route('/api/analyze-top-city', methods=['POST'])
def analyze_top_city():
    try:
        # Get the data from the request
        data = request.json
        city_scores = data.get('cityScores', [])
        user_data = data.get('userData', {})
        
        # Get user demographics
        gender = user_data.get('gender', '')
        ethnicity = user_data.get('ethnicity', '')
        
        # Convert to DataFrame
        df = pd.DataFrame(city_scores)
        
        # Filter for 2022 data
        df_2022 = df[df["date_label"] == 2022]
        
        # Get the top city
        top_city_series = df_2022.nlargest(1, "Average_General_Score")[["geo_label_citystate", "Average_General_Score"]]
        top_city = top_city_series["geo_label_citystate"].iloc[0]
        top_score = top_city_series["Average_General_Score"].iloc[0]
        
        considerations = {"economic opportunity, healthcare access, social & cultural fit, environment & infrastructure"}

        # Create the prompt
        prompt = f"""Using up to date data driven insights, dive into the {considerations} benefits of living in {top_city} for a {ethnicity} {gender}  individual,
Provide detailed statistical data and recent information on the factors listed above. Keep your response to three paragraphs at most,
you do not need a introduction or concluding sentence."""
        
        # Make the API call exactly as shown in documentation
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="gemma2-9b-it",
        )
        
        # Extract the response
        analysis = chat_completion.choices[0].message.content
        
        # Prepare response
        response_data = {
            "response": analysis,
            "top_city": top_city
        }
        
        # Save to file
        with open("groq_response.json", "w") as f:
            json.dump(response_data, f, indent=4)
        
        return jsonify(response_data)

    except Exception as error:
        print(f"Error in analyze_top_city: {error}")
        return jsonify({'error': str(error)}), 500


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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)