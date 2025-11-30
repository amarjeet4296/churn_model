import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
# import matplotlib.pyplot as plt
# import seaborn as sns

# Set random seed for reproducibility
np.random.seed(42)

def generate_travel_data(n_samples=1000):
    """
    Generates synthetic data for a travel agency churn model.
    Features based on blog insights: Recency, Frequency, Support Tickets, etc.
    """
    data = {
        'customer_id': range(1, n_samples + 1),
        'days_since_last_booking': np.random.randint(1, 730, n_samples), # Recency
        'bookings_last_12m': np.random.randint(0, 10, n_samples),        # Frequency
        'avg_booking_value': np.random.normal(1500, 500, n_samples),     # Monetary
        'support_tickets_last_6m': np.random.poisson(1, n_samples),      # Service Interaction
        'cancellations_last_12m': np.random.poisson(0.5, n_samples),     # Risk Factor
        'loyalty_program_member': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'email_open_rate': np.random.uniform(0, 1, n_samples),           # Engagement
        'mobile_app_user': np.random.choice([0, 1], n_samples, p=[0.4, 0.6]),
    }
    
    df = pd.DataFrame(data)
    
    # Logic to simulate churn (Target Variable)
    # High churn risk if: High recency, low frequency, high tickets, high cancellations
    
    churn_prob = (
        (df['days_since_last_booking'] > 365) * 0.4 +
        (df['bookings_last_12m'] == 0) * 0.3 +
        (df['support_tickets_last_6m'] > 2) * 0.2 +
        (df['cancellations_last_12m'] > 1) * 0.2 -
        (df['loyalty_program_member'] == 1) * 0.15 -
        (df['email_open_rate'] > 0.5) * 0.1
    )
    
    # Add some noise
    churn_prob += np.random.normal(0, 0.1, n_samples)
    
    # Convert to binary target (1 = Churned, 0 = Retained)
    df['churned'] = (churn_prob > 0.5).astype(int)
    
    return df

def train_model(df):
    """
    Trains a Random Forest Classifier to predict churn.
    """
    X = df.drop(['customer_id', 'churned'], axis=1)
    y = df['churned']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    print("\n--- Model Evaluation ---")
    print(classification_report(y_test, y_pred))
    
    print("\n--- Feature Importance ---")
    feature_imp = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
    print(feature_imp)
    
    return model, feature_imp

if __name__ == "__main__":
    print("Generating synthetic travel data...")
    df = generate_travel_data(2000)
    print(f"Data generated: {df.shape}")
    print(df.head())
    
    print("\nTraining Churn Prediction Model...")
    model, feature_imp = train_model(df)
    
    print("\nModel training complete.")
    print("This model can now be used to score current customers and identify high-risk segments.")
