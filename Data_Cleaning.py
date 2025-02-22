##NEED TO ADD BigCitiesHealth.csv BC IT DOES NOT FIT IN THE GITHUB

import pandas as pd

def pivot_big_cities_health(csv_path, output_csv_path=None):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(csv_path)
    
    # Pivot the DataFrame:
    # - index: group by city, year, race, and sex.
    # - columns: unique values from metric_item_label become new columns.
    # - values: the value column fills the pivoted columns.
    # - aggfunc: if there are duplicate entries per group/metric, take the maximum value (adjust as needed).
    pivot_df = df.pivot_table(
        index=["geo_label_citystate", "date_label", "strata_race_label", "strata_sex_label"],
        columns="metric_item_label",
        values="value",
        aggfunc="max"
    ).reset_index()
    
    # Optionally save the pivoted DataFrame to a new CSV file.
    if output_csv_path:
        pivot_df.to_csv(output_csv_path, index=False)
    
    return pivot_df

if __name__ == "__main__":
    input_csv = "BigCitiesHealth.csv"       # Path to your input CSV file
    output_csv = "BigCitiesHealth_Pivoted.csv"  # Optional output file path
    pivoted_df = pivot_big_cities_health(input_csv, output_csv)
    print(pivoted_df.head())

pivoted_df.to_csv("BigCitiesHealth_Pivoted.csv", index=False)

# Define the grouping columns (adjust these if your column names differ)
group_cols = ["geo_label_citystate", "date_label", "strata_race_label", "strata_sex_label"]

# All remaining columns are assumed to be metric columns
metric_cols = [col for col in pivoted_df.columns if col not in group_cols]

# Create an aggregated dataframe: for each city and year,
# select the row where race == "All" and sex == "both".
# These rows will be used to impute missing values.
agg_df = pivoted_df[(pivoted_df["strata_race_label"] == "All") & (pivoted_df["strata_sex_label"] == "Both")].copy()

# We only need the keys (city, year) and the metric columns.
agg_df = agg_df[["geo_label_citystate", "date_label"] + metric_cols]

# Rename metric columns in the aggregated dataframe to have an '_agg' suffix.
agg_df = agg_df.rename(columns={col: f"{col}_agg" for col in metric_cols})

# Merge the aggregated values back into the original dataframe using city and year.
df_merged = pd.merge(pivoted_df, agg_df, on=["geo_label_citystate", "date_label"], how="left")

# For each metric column, fill missing values using the corresponding aggregated value.
for col in metric_cols:
    agg_col = f"{col}_agg"
    df_merged[col] = df_merged[col].fillna(df_merged[agg_col])

df_merged.to_csv("imputed_data.csv", index=False)