import pandas as pd
import json

def categorize_and_save_to_json(input_file, output_file):
    """
    Categorizes the data from the input CSV file and saves the result as a JSON file.

    Parameters:
    - input_file (str): Path to the input CSV file.
    - output_file (str): Path to the output JSON file.
    """
    # Load the data
    data = pd.read_csv(input_file)

    # Define category-subcategory mappings
    categories = {
        'Housing': ['Vacant.Housing.Units', 'Single.Parent.Families', 'Owner.Occupied.Housing', 'Renters.vs..Owners', 'Housing.Lead.Risk'],
        'Transportation': ['Drives.Alone.to.Work', 'Walking.to.Work', 'Riding.Bike.to.Work', 'Public.Transportation.Use', 'Lack.of.Car'],
        'Environment': ['Climate.related..Disasters', 'Community.Social.Vulnerability.to.Climate.Disasters'],
        'Health': ['Adult.Binge.Drinking', 'Adult.Mental.Distress', 'Adult.Obesity', 'Adult.Physical.Inactivity', 'Adult.Smoking',
                   'All.Cancer.Deaths', 'Breast.Cancer.Deaths', 'Cardiovascular.Disease.Deaths', 'Colorectal.Cancer.Deaths', 
                   'Diabetes', 'Diabetes.Deaths', 'Drug.Overdose.Deaths', 'Flu.Vaccinations..Medicare', 'Gun.Deaths..Firearms.', 
                   'HIV.Related.Deaths', 'Heart.Disease.Deaths', 'High.Blood.Pressure', 'Homicides', 'Injury.Deaths', 
                   'Lung.Cancer.Deaths', 'Motor.Vehicle.Deaths', 'New.Tuberculosis.Cases', 'Pneumonia.or.Influenza.Deaths', 
                   'Prostate.Cancer.Deaths', 'Suicide', 'Syphilis..Newborns', 'Teen.Births'],
        'Neighborhood': ['Minority.Population', 'Service.Workers', 'Public.Assistance', 'Poverty.in.All.Ages', 
                         'Poverty.in.Children', 'Poverty.and.Near.Poverty.in.All.Ages'],
        'Engagement': ['Preschool.Enrollment', 'College.Graduates', 'Foreign.Born.Population'],
        'Opportunity': ['Household.Income.Inequality', 'Households.with.Higher.Incomes', 'Income.Inequality', 
                        'Per.capita.Household.Income', 'Unemployment']
    }

    # Create a new DataFrame to store the averaged values
    new_data = pd.DataFrame()

    # Iterate over each category and calculate the mean of its subcategories
    for category, subcategories in categories.items():
        # Select the columns that belong to the current category
        category_data = data[subcategories]
        
        # Calculate the mean across the subcategories
        new_data[category] = category_data.mean(axis=1)

    # Add the non-categorized columns to the new DataFrame
    non_categorized_columns = ['geo_label_citystate', 'date_label', 'strata_race_label', 'strata_sex_label']
    new_data[non_categorized_columns] = data[non_categorized_columns]

    # Convert the DataFrame to a JSON format
    json_data = new_data.to_json(orient='records', indent=4)

    # Save the JSON data to a file
    with open(output_file, 'w') as json_file:
        json_file.write(json_data)

    print(f"New categorized data saved to '{output_file}'")

# Example usage
input_file = 'Data/scaled_data_0_to_1.csv'
output_file = 'Data/categorized_data_0_1.json'
categorize_and_save_to_json(input_file, output_file)