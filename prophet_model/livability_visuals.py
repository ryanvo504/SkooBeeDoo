import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from prophet import Prophet
from livability_forecast_class import LivabilityForecast
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..')))
import utils

def main():
    # Get the data root and point to the JSON file from utils.
    data_root = utils.get_data_root()
    json_filepath = os.path.join(data_root, 'categorized_data_0_1.json')
    
    # Instantiate the forecast model using the JSON file.
    forecast_obj = LivabilityForecast(json_filepath)
    
    # Forecast for the next 5 years.
    forecasts = forecast_obj.forecast(periods=5)
    
    # ---------------- Original Visuals ----------------
    # 1. Per-City Forecast Plots with confidence intervals.
    for city, fcst in forecasts.items():
        plt.figure(figsize=(10, 6))
        plt.plot(fcst['ds'], fcst['yhat'], 'b-', label='Forecast')
        plt.fill_between(fcst['ds'], fcst['yhat_lower'], fcst['yhat_upper'], color='lightblue', alpha=0.5,
                         label='Confidence Interval')
        plt.title(f'Livability Score Forecast for {city}')
        plt.xlabel('Year')
        plt.ylabel('Livability Score')
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(data_root, f'forecast_{city.replace(" ", "_")}.png'))
        plt.show()
    
    # 2. Multi-City Forecast Comparison.
    plt.figure(figsize=(12, 8))
    for city, fcst in forecasts.items():
        plt.plot(fcst['ds'], fcst['yhat'], label=city)
    plt.title('Livability Score Forecast Comparison Across Cities')
    plt.xlabel('Year')
    plt.ylabel('Livability Score')
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(os.path.join(data_root, 'forecast_comparison.png'))
    plt.show()
    
    # 3. Bar Chart for Final Forecast Year.
    final_year = max(fcst['ds'].max() for fcst in forecasts.values())
    final_scores = {city: fcst[fcst['ds'] == final_year]['yhat'].values[0] for city, fcst in forecasts.items()}
    plt.figure(figsize=(12, 8))
    cities = list(final_scores.keys())
    scores = list(final_scores.values())
    plt.bar(cities, scores)
    plt.xticks(rotation=90)
    plt.title(f'Forecasted Livability Score for {final_year.year}')
    plt.xlabel('City')
    plt.ylabel('Livability Score')
    plt.tight_layout()
    plt.savefig(os.path.join(data_root, 'forecast_final_year.png'))
    plt.show()
    
    # ---------------- Additional Visuals ----------------
    # Get preprocessed data from the forecast object.
    df = forecast_obj.df.copy()
    
    # Define extra regressors: raw factors and their year-over-year delta features.
    regressors = ['Housing', 'Transportation', 'Environment', 'Health', 
                  'Neighborhood', 'Engagement', 'Opportunity',
                  'Housing_delta', 'Transportation_delta', 'Environment_delta', 
                  'Health_delta', 'Neighborhood_delta', 'Engagement_delta', 'Opportunity_delta']
    
    # For visuals that require a fitted Prophet model, re-fit models per city using "geo_label_citystate".
    city_models = {}
    for city in df['geo_label_citystate'].unique():
        city_data = df[df['geo_label_citystate'] == city].copy().dropna(subset=['Housing_delta'])
        m = Prophet()
        for reg in regressors:
            m.add_regressor(reg)
        m.fit(city_data[['ds', 'y'] + regressors])
        city_models[city] = (m, city_data)
    
    # 4. Component Plots for each city.
    for city, (model, city_data) in city_models.items():
        future = model.make_future_dataframe(periods=5, freq='AS')
        last_vals = city_data.iloc[-1]
        for reg in regressors:
            future[reg] = last_vals[reg]
        fcst = model.predict(future)
        fig = model.plot_components(fcst)
        fig.suptitle(f'Component Plot for {city}', fontsize=14)
        plt.tight_layout()
        plt.savefig(os.path.join(data_root, f'component_{city.replace(" ", "_")}.png'))
        plt.show()
    
    # 5. Residual Analysis: Plot residuals (actual minus predicted) over time.
    for city, (model, city_data) in city_models.items():
        forecast_train = model.predict(city_data)
        city_data['residual'] = city_data['y'] - forecast_train['yhat']
        plt.figure(figsize=(10, 6))
        plt.scatter(city_data['ds'], city_data['residual'], alpha=0.7)
        plt.axhline(0, color='red', linestyle='--')
        plt.title(f'Residual Analysis for {city}', fontsize=14)
        plt.xlabel('Year')
        plt.ylabel('Residual (Actual - Predicted)')
        plt.tight_layout()
        plt.savefig(os.path.join(data_root, f'residual_{city.replace(" ", "_")}.png'))
        plt.show()
    
    # 6. Scatter Plots for each regressor vs LivabilityScore.
    for reg in regressors:
        plt.figure(figsize=(10, 6))
        sns.scatterplot(data=df, x=reg, y='y', alpha=0.6)
        plt.title(f'Scatter Plot: {reg} vs LivabilityScore', fontsize=14)
        plt.xlabel(reg)
        plt.ylabel('LivabilityScore')
        plt.tight_layout()
        plt.savefig(os.path.join(data_root, f'scatter_{reg}.png'))
        plt.show()
    
    # 7. Correlation Heatmap among LivabilityScore and regressors.
    corr_cols = ['y'] + regressors
    corr_matrix = df[corr_cols].corr()
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Correlation Heatmap: LivabilityScore & Regressors', fontsize=16)
    plt.tight_layout()
    plt.savefig(os.path.join(data_root, 'correlation_heatmap.png'))
    plt.show()
    
    # 8. Sensitivity Analysis for one demo city: vary each regressor by ±10%.
    demo_city = list(city_models.keys())[0]
    model, city_data = city_models[demo_city]
    future_base = model.make_future_dataframe(periods=5, freq='AS')
    base_vals = city_data.iloc[-1]
    for reg in regressors:
        future_base[reg] = base_vals[reg]
    
    sensitivity_results = {}
    for reg in regressors:
        values = []
        for factor in [0.9, 1.0, 1.1]:
            future_mod = future_base.copy()
            for r in regressors:
                future_mod[r] = base_vals[r]
            future_mod[reg] = base_vals[reg] * factor
            forecast_mod = model.predict(future_mod)
            avg_forecast = forecast_mod['yhat'].tail(5).mean()
            values.append(avg_forecast)
        sensitivity_results[reg] = values
    
    plt.figure(figsize=(12, 8))
    for reg, vals in sensitivity_results.items():
        plt.plot(['10% Lower', 'Baseline', '10% Higher'], vals, marker='o', label=reg)
    plt.title(f'Sensitivity Analysis for {demo_city}', fontsize=16)
    plt.xlabel('Regressor Value Change')
    plt.ylabel('Average Forecasted LivabilityScore')
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(os.path.join(data_root, f'sensitivity_{demo_city.replace(" ", "_")}.png'))
    plt.show()

if __name__ == '__main__':
    main()
