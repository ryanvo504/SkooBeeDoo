import pandas as pd

"df = pd.read_csv('imputed_data.csv')"

def calculate_livability_score(row, weights):
    return 100 * (
        weights['Education'] * row['Education'] +
        weights['Income'] * row['Income'] +
        weights['ChronicHealth'] * (1 - row['ChronicHealth']) +
        weights['RacialSegregation'] * (1 - row['RacialSegregation']) +
        weights['MentalHealth'] * row['MentalHealth'] +
        weights['BuiltEnvironment'] * row['BuiltEnvironment'] +
        weights['Demographics'] * row['Demographics'] +
        weights['MaternalChildHealth'] * row['MaternalChildHealth'] +
        weights['InfectiousDisease'] * (1 - row['InfectiousDisease']+
        weights['Social and Economic Factors'] * row['Social and Economic Factors']))

weights = {
    'Chronic Health Conditions': 0.15,
    'Life Expectancy and Deaths': 0.15,
    'Violence and Injury': 0.10,
    'Access to Health Services': 0.10,
    'Demographics': 0.15,
    'Infectious Diseases': 0.10,
    'Maternal and Child Health': 0.10,
    'Mental Health and Substance Use': 0.10,
    'Climate and Built Environment': 0.05,
    'Social and Economic Factors': 0.10,
}

weights2 = {
    'Chronic Health Conditions': 0.15,
    'Life Expectancy and Deaths': 0.15,
    'Violence and Injury': 0.10,
    'Access to Health Services': 0.10,
    'Demographics': 0.15,
    'Infectious Diseases': 0.10,
    'Maternal and Child Health': 0.10,
    'Mental Health and Substance Use': 0.10,
    'Climate and Built Environment': 0.05, 
    'Social and Economic Factors': 0.10,
}