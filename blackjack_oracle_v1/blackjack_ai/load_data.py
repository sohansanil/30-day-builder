import pandas as pd  

# Load dataset
df = pd.read_csv("blkjckhands.csv")  

# Show first few rows  
print(df.head())  

# Display dataset information
print("\nDataset Info:")
print(df.info())

# Check for missing values  
print("\nMissing Values:")
print(df.isnull().sum())
print(df.head(20)) 

print("\nUnique values per column:")
for column in df.columns:
    print(f"{column}: {df[column].unique()[:10]}")  # Show first 10 unique values

