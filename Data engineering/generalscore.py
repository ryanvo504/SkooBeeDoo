import pandas as pd
import json

# Load the CSV file
file_path = 'Data/categorized_data_0_1.csv'
data = pd.read_csv(file_path)

# Define weights for each category (you can adjust these weights based on importance)
weights = {
    'Housing': 0.2,
    'Transportation': 0.15,
    'Environment': 0.15,
    'Health': 0.2,
    'Neighborhood': 0.1,
    'Engagement': 0.1,
    'Opportunity': 0.1
}

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

# Rename columns for clarity
grouped_data.rename(columns={'General_Score': 'Average_General_Score'}, inplace=True)

# Convert the DataFrame to a JSON format
json_data = grouped_data.to_json(orient='records', indent=4)

# Save the JSON data to a file
output_file_path = 'Data/general_scores_by_city_year.json'
with open(output_file_path, 'w') as json_file:
    json_file.write(json_data)

print(f"JSON file saved to {output_file_path}")