import pandas as pd

def process_workout_csv(input_csv: str = "garmin_workout_data.csv", output_csv: str = "garmin_workout_volume.csv") -> pd.DataFrame:
    """Reads workout data, calculates total volume (Reps * Weight_kg), and exports to CSV."""
    df = pd.read_csv(input_csv)

    # Calculate total volume for each set
    df["Total_Volume_kg"] = df["Reps"] * df["Weight_kg"]

    # Export to CSV
    df.to_csv(output_csv, index=False)
    print(f"Data successfully processed and exported to {output_csv}")
    print(f"Total Sets: {len(df)}")
    print(f"Total Reps: {df['Reps'].sum():,}")
    print(f"Total Volume: {df['Total_Volume_kg'].sum():,.1f} kg\n")
    return df

if __name__ == "__main__":
    df = process_workout_csv()
    print("Top exercises by total volume:")
    exercise_summary = (
        df.groupby("Exercise")["Total_Volume_kg"]
        .sum()
        .sort_values(ascending=False)
        .reset_index()
    )
    print(exercise_summary.head(10).to_string(index=False))
