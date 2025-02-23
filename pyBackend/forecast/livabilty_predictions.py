import pandas as pd
from livability_forecast_class import LivabilityForecast
import os
import sys 
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..')))
import utils

# Directories using the utils module
data_root = utils.get_data_root()
csv_filepath = os.path.join(data_root, 'categorized_data_0_1.csv')
csv_output_json = os.path.join(data_root, "5_year_predictions.json")
csv_output_csv = os.path.join(data_root, "5_year_predictions.csv")

def main():
    # Ensure the output directory exists.
    os.makedirs(data_root, exist_ok=True)
    
    # Instantiate the forecast model using the CSV file.
    forecast_obj = LivabilityForecast(csv_filepath)
    
    # Forecast for the next 5 years (only future predictions will be returned).
    predictions = forecast_obj.forecast(periods=5)
    
    # Combine predictions from all cities into one DataFrame.
    # Each row gets an additional column "geo_label_citystate" indicating the city.
    combined_df = pd.concat([df.assign(geo_label_citystate=city) for city, df in predictions.items()], ignore_index=True)
    
    # Export combined predictions to CSV and JSON files.
    combined_df.to_csv(csv_output_csv, index=False)
    combined_df.to_json(csv_output_json, orient="records", lines=True)
    
    print(f"5-year predictions have been saved to:\n  {csv_output_csv}\n  {csv_output_json}")

if __name__ == '__main__':
    main()


