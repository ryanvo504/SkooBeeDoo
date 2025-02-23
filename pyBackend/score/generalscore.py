import pandas as pd
import json

def calculate_general_scores(weights=None):
    """
    Calculate general scores for cities based on provided weights.
    
    Args:
    weights (dict, optional): Weights for different categories. 
    Defaults to a standard set of weights if not provided.
    
    Returns:
    list: Calculated city scores
    """
    # Default weights matching the frontend
    default_weights = {
        'Housing': 0.2,
        'Transportation': 0.15,
        'Environment': 0.15,
        'Health': 0.2,
        'Neighborhood': 0.1,
        'Engagement': 0.1,
        'Opportunity': 0.1
    }
    
    # Use provided weights or default
    weights = weights or default_weights
    
    # Load the CSV file
    file_path = 'Data/categorized_data_0_1.csv'
    data = pd.read_csv(file_path)

    # Calculate the general score for each row
    data['General_Score'] = (
        data['Housing'] * weights['Housing'] +
        data['Transportation'] * weights['Transportation'] +
        data['Environment'] * weights['Environment'] +
        data['Health'] * weights['Health'] +
        data['Neighborhood'] * weights['Neighborhood'] +
        data['Engagement'] * weights['Engagement'] +
        data['Opportunity'] * weights['Opportunity']
    )

    # Group by city and year to get the average general score for each city in each year
    grouped_data = data.groupby(['geo_label_citystate', 'date_label'])['General_Score'].mean().reset_index()
    
    # Add a small buffer to the score (optional)
    grouped_data['General_Score'] += 0.1
    
    # Rename columns for clarity
    grouped_data.rename(columns={'General_Score': 'Average_General_Score'}, inplace=True)

    # Convert the DataFrame to a list of dictionaries for JSON serialization
    scores = grouped_data.to_dict(orient='records')

    # Optionally save to JSON file
    output_file_path = 'Data/general_scores_by_city_year.json'
    with open(output_file_path, 'w') as json_file:
        json.dump(scores, json_file, indent=4)

    return scores