import pandas as pd

def categorize_data(input_file, output_file):
    """
    Categorizes the data from the input CSV file, applies transformations based on weights,
    and saves the result to the output CSV file.

    Parameters:
    - input_file (str): Path to the input CSV file.
    - output_file (str): Path to the output CSV file.
    """
    # Load the data
    data = pd.read_csv(input_file)

    # Define category-subcategory mappings
    categories = {
        'Housing': [['Vacant.Housing.Units', 'Single.Parent.Families', 'Owner.Occupied.Housing', 'Renters.vs..Owners', 'Housing.Lead.Risk'], [1, 1, 0, 1, 1]],
        'Transportation': [['Drives.Alone.to.Work', 'Walking.to.Work', 'Riding.Bike.to.Work', 'Public.Transportation.Use', 'Lack.of.Car'], [1, 0, 0, 0, 0]],
        'Environment': [['Climate.related..Disasters', 'Community.Social.Vulnerability.to.Climate.Disasters'], [1, 1]],
        'Health': [['Adult.Binge.Drinking', 'Adult.Mental.Distress', 'Adult.Obesity', 'Adult.Physical.Inactivity', 'Adult.Smoking',
                   'All.Cancer.Deaths', 'Breast.Cancer.Deaths', 'Cardiovascular.Disease.Deaths', 'Colorectal.Cancer.Deaths', 
                   'Diabetes', 'Diabetes.Deaths', 'Drug.Overdose.Deaths', 'Flu.Vaccinations..Medicare', 'Gun.Deaths..Firearms.', 
                   'HIV.Related.Deaths', 'Heart.Disease.Deaths', 'High.Blood.Pressure', 'Homicides', 'Injury.Deaths', 
                   'Lung.Cancer.Deaths', 'Motor.Vehicle.Deaths', 'New.Tuberculosis.Cases', 'Pneumonia.or.Influenza.Deaths', 
                   'Prostate.Cancer.Deaths', 'Suicide', 'Syphilis..Newborns', 'Teen.Births'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
        'Neighborhood': [['Minority.Population', 'Service.Workers', 'Public.Assistance', 'Poverty.in.All.Ages', 
                         'Poverty.in.Children', 'Poverty.and.Near.Poverty.in.All.Ages'], [0, 0, 0, 1, 1, 1]],
        'Engagement': [['Preschool.Enrollment', 'College.Graduates', 'Foreign.Born.Population'], [0, 0, 0]],
        'Opportunity': [['Household.Income.Inequality', 'Households.with.Higher.Incomes', 'Income.Inequality', 
                        'Per.capita.Household.Income', 'Unemployment'], [1, 0, 1, 0, 1]]
    }

    # Create a new DataFrame to store the averaged values
    new_data = pd.DataFrame()

    # Iterate over each category and calculate the mean of its subcategories
    for category, (subcategories, weights) in categories.items():
        # Select the columns that belong to the current category
        category_data = data[subcategories].copy()
        
        # Apply the transformation: if weight is 1, use 1 - original value
        for i, weight in enumerate(weights):
            if weight == 1:
                category_data[subcategories[i]] = 1 - category_data[subcategories[i]]
        
        # Calculate the mean across the subcategories
        new_data[category] = category_data.mean(axis=1)

    # Add the non-categorized columns to the new DataFrame
    non_categorized_columns = ['geo_label_citystate', 'date_label', 'strata_race_label', 'strata_sex_label']
    new_data[non_categorized_columns] = data[non_categorized_columns]

    # Save the new DataFrame to a CSV file
    new_data.to_csv(output_file, index=False)

    print(f"New categorized data saved to '{output_file}'")

# Example usage
input_file = 'Data/scaled_data_0_to_1.csv'
output_file = 'Data/categorized_data_0_1.csv'
categorize_data(input_file, output_file)