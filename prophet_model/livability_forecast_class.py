import pandas as pd
from prophet import Prophet

class LivabilityForecast:
    """
    A class to forecast livability scores for multiple cities.
    
    Data Assumptions:
      - Each row represents a City/Year/demographic combination.
      - Only rows where strata_race_label == 'All' and strata_sex_label == 'Both'
        are used, providing an aggregated annual score.
      - The dataset includes 7 scaled factors (0-1): Housing, Transportation, Environment,
        Health, Neighborhood, Engagement, and Opportunity.
      - The LivabilityScore is computed on a 0-100 scale.
      - Additional features (year-over-year deltas) are computed for each factor.
    
    The forecast method produces 5-year predictions per city.
    """
    
    def __init__(self, csv_file):
        """
        Initializes the forecast model with the provided CSV data.
        
        Parameters:
            csv_file (str): Path to the CSV file.
        """
        self.csv_file = csv_file
        self.df = pd.read_csv(csv_file)
        self._preprocess_data()
    
    def _preprocess_data(self):
        """
        Preprocess the data:
          - Rename columns if necessary.
          - Create a 'Year' column if not present (using 'date_label').
          - Ensure key numeric columns are cast to floats.
          - Filter to aggregated rows (strata_race_label=="All" and strata_sex_label=="Both").
          - Compute LivabilityScore using weighted 7 factors.
          - Convert the Year column into a datetime column.
          - Sort and compute year-over-year delta for each factor.
        """
        # Use the actual city column name "geo_label_citystate"
        if 'geo_label_citystate' not in self.df.columns and 'City' in self.df.columns:
            self.df.rename(columns={'City': 'geo_label_citystate'}, inplace=True)
        
        # Create a 'Year' column if not present.
        if 'Year' not in self.df.columns:
            if 'date_label' in self.df.columns:
                try:
                    self.df['Year'] = self.df['date_label'].astype(int)
                except Exception:
                    self.df['Year'] = pd.to_datetime(self.df['date_label']).dt.year
        
        # Ensure factor columns are numeric.
        factor_cols = ['Housing', 'Transportation', 'Environment', 'Health', 'Neighborhood', 'Engagement', 'Opportunity']
        for col in factor_cols:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
        
        # Filter for aggregated rows (only rows where strata_race_label=="All" and strata_sex_label=="Both")
        self.df = self.df[(self.df['strata_race_label'] == 'All') & (self.df['strata_sex_label'] == 'Both')].copy()
        
        # Define weights for the 7 factors.
        self.weights = {
            'Housing': 0.12,
            'Transportation': 0.16,
            'Environment': 0.13,
            'Health': 0.19,
            'Neighborhood': 0.15,
            'Engagement': 0.12,
            'Opportunity': 0.13
        }
        
        # Compute LivabilityScore 
        self.df['LivabilityScore'] = (
            self.df['Housing'] * self.weights['Housing'] +
            self.df['Transportation'] * self.weights['Transportation'] +
            self.df['Environment'] * self.weights['Environment'] +
            self.df['Health'] * self.weights['Health'] +
            self.df['Neighborhood'] * self.weights['Neighborhood'] +
            self.df['Engagement'] * self.weights['Engagement'] +
            self.df['Opportunity'] * self.weights['Opportunity']
        )
        
        # Create a datetime column from Year (assume January 1st)
        self.df['ds'] = pd.to_datetime(self.df['Year'].astype(str) + '-01-01')
        self.df['y'] = self.df['LivabilityScore']
        
        # Sort data by city and year for consistency.
        self.df.sort_values(by=['geo_label_citystate', 'Year'], inplace=True)
        
        # Compute year-over-year delta features for each factor.
        for factor in factor_cols:
            self.df[f'{factor}_delta'] = self.df.groupby('geo_label_citystate')[factor].diff()
    
    def forecast(self, periods=5):
        """
        Forecast the livability score for each city for the next number of years.
        
        Parameters:
            periods (int): Number of years to forecast (default is 5).
        
        Returns:
            dict: A dictionary with each city's name (from "geo_label_citystate") as keys and 
                  forecast DataFrames (future predictions only) as values.
        """
        forecasts = {}
        
        # List of extra regressors.
        regressors = ['Housing', 'Transportation', 'Environment', 'Health', 
                      'Neighborhood', 'Engagement', 'Opportunity',
                      'Housing_delta', 'Transportation_delta', 'Environment_delta', 
                      'Health_delta', 'Neighborhood_delta', 'Engagement_delta', 'Opportunity_delta']
        
        for city in self.df['geo_label_citystate'].unique():
            city_data = self.df[self.df['geo_label_citystate'] == city].copy()
            city_data = city_data.dropna(subset=['Housing_delta'])
            
            model = Prophet()
            for reg in regressors:
                model.add_regressor(reg)
            
            model.fit(city_data[['ds', 'y'] + regressors])
            
            # Use "AS" (annual start) so that the predictions have dates like 2023-01-01, 2024-01-01, etc.
            future = model.make_future_dataframe(periods=periods, freq='YS')
            last_vals = city_data.iloc[-1]
            for reg in regressors:
                future[reg] = last_vals[reg]
            
            fcst = model.predict(future)
            # Filter to include only future predictions (dates after the last training date)
            last_date = city_data['ds'].max()
            fcst_future = fcst[fcst['ds'] > last_date]
            
            forecasts[city] = fcst_future[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        
        return forecasts

