import pandas as pd
import numpy as np
import pickle
from datetime import datetime

class MutualFundModelLoader:
    """Utility class to load and use pre-trained mutual fund models"""
    
    def __init__(self, data_path=None):
        if data_path is None:
            import os
            data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'mutual_funds_cleaned.csv')
        """Initialize the model loader"""
        self.df = pd.read_csv(data_path)
        self.models = {}
        self.feature_columns = {}
        self.model_info = {}
        
    def load_individual_model(self, target):
        """Load a specific model for a target (return_1yr, return_3yr, return_5yr)"""
        import os
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        model_filename = os.path.join(models_dir, f"mutual_fund_model_{target}.pkl")
        
        try:
            with open(model_filename, 'rb') as f:
                model_data = pickle.load(f)
            
            self.models[target] = model_data['model']
            self.feature_columns[target] = model_data['feature_columns']
            self.model_info[target] = {
                'model_type': model_data['model_type'],
                'performance': model_data['performance'],
                'training_date': model_data['training_date']
            }
            
            print(f"✅ Loaded {model_data['model_type']} for {target}")
            print(f"   Performance: RMSE: {model_data['performance']['rmse']:.3f}, R²: {model_data['performance']['r2']:.3f}")
            
            return True
            
        except FileNotFoundError:
            print(f"❌ Model file {model_filename} not found")
            return False
        except Exception as e:
            print(f"❌ Error loading {model_filename}: {str(e)}")
            return False
    
    def load_all_models(self):
        """Load all available models"""
        print("Loading all mutual fund prediction models...")
        print("="*50)
        
        targets = ['return_1yr', 'return_3yr', 'return_5yr']
        loaded_count = 0
        
        for target in targets:
            if self.load_individual_model(target):
                loaded_count += 1
        
        print(f"\n✅ Successfully loaded {loaded_count}/3 models")
        return loaded_count == 3
    
    def predict_fund_return(self, fund_data, horizon):
        """Predict return for a specific fund and horizon"""
        target_col = f'return_{horizon}yr'
        
        if target_col not in self.models:
            raise ValueError(f"Model for {horizon}-year horizon not loaded")
        
        model = self.models[target_col]
        feature_cols = self.feature_columns[target_col]
        
        # Prepare fund features
        fund_features = []
        for col in feature_cols:
            if col in fund_data:
                fund_features.append(fund_data[col])
            else:
                # Use median value for missing features
                fund_features.append(self.df[col].median())
        
        prediction = model.predict([fund_features])[0]
        return prediction
    
    def get_model_info(self):
        """Get information about loaded models"""
        if not self.models:
            return "No models loaded"
        
        info = "📊 LOADED MODELS INFORMATION\n"
        info += "="*40 + "\n"
        
        for target, model_data in self.model_info.items():
            info += f"\n🎯 {target.upper()}:\n"
            info += f"   Model: {model_data['model_type']}\n"
            info += f"   RMSE: {model_data['performance']['rmse']:.3f}\n"
            info += f"   R²: {model_data['performance']['r2']:.3f}\n"
            info += f"   Trained: {model_data['training_date']}\n"
        
        return info
    
    def predict_top_funds(self, horizon, top_n=10, risk_tolerance='moderate'):
        """Predict and rank top funds for a specific horizon"""
        target_col = f'return_{horizon}yr'
        
        if target_col not in self.models:
            raise ValueError(f"Model for {horizon}-year horizon not loaded")
        
        # Filter by risk tolerance
        risk_mapping = {
            'conservative': (1, 3),
            'moderate': (3, 5),
            'aggressive': (5, 6)
        }
        
        min_risk, max_risk = risk_mapping[risk_tolerance]
        df_filtered = self.df[
            (self.df['risk_level'] >= min_risk) & 
            (self.df['risk_level'] <= max_risk)
        ].copy()
        
        # Remove funds with missing target returns
        df_filtered = df_filtered.dropna(subset=[target_col])
        
        # Predict returns for all funds
        predictions = []
        fund_indices = []
        
        for idx, (fund_idx, fund_row) in enumerate(df_filtered.iterrows()):
            try:
                predicted_return = self.predict_fund_return(fund_row.to_dict(), horizon)
                predictions.append(predicted_return)
                fund_indices.append(fund_idx)
            except Exception:
                continue
        
        if not predictions:
            return pd.DataFrame()
        
        # Create results dataframe
        results_df = df_filtered.loc[fund_indices].copy()
        results_df['predicted_return'] = predictions
        results_df['actual_return'] = results_df[target_col]
        results_df['prediction_error'] = abs(results_df['predicted_return'] - results_df['actual_return'])
        
        # Sort by predicted return
        top_funds = results_df.nlargest(top_n, 'predicted_return')
        
        return top_funds[['scheme_name', 'amc_name', 'predicted_return', 'actual_return', 
                         'prediction_error', 'risk_level', 'expense_ratio', 'rating']]

def demo_model_loader():
    """Demonstrate the model loader utility"""
    
    print("🔧 MUTUAL FUND MODEL LOADER UTILITY")
    print("="*50)
    
    # Initialize loader
    loader = MutualFundModelLoader()
    
    # Load all models
    success = loader.load_all_models()
    
    if not success:
        print("❌ Failed to load all models. Please ensure model files exist.")
        return
    
    # Show model information
    print(f"\n{loader.get_model_info()}")
    
    # Test predictions for different horizons
    horizons = [1, 3, 5]
    risk_levels = ['conservative', 'moderate', 'aggressive']
    
    for horizon in horizons:
        print(f"\n🎯 TOP 5 PREDICTED PERFORMERS - {horizon} YEAR HORIZON")
        print("-" * 60)
        
        for risk in risk_levels:
            try:
                top_funds = loader.predict_top_funds(horizon, top_n=5, risk_tolerance=risk)
                
                if not top_funds.empty:
                    print(f"\n{risk.upper()} RISK FUNDS:")
                    for idx, (_, fund) in enumerate(top_funds.iterrows(), 1):
                        print(f"{idx}. {fund['scheme_name'][:40]}")
                        print(f"   Predicted: {fund['predicted_return']:.2f}% | "
                              f"Actual: {fund['actual_return']:.2f}% | "
                              f"Error: {fund['prediction_error']:.2f}%")
                
            except Exception as e:
                print(f"❌ Error predicting for {risk} risk: {str(e)}")
    
    # Test individual fund prediction
    print(f"\n🔍 INDIVIDUAL FUND PREDICTION TEST")
    print("-" * 40)
    
    # Get a sample fund
    sample_fund = loader.df.iloc[0]
    
    print(f"Sample Fund: {sample_fund['scheme_name']}")
    print(f"AMC: {sample_fund['amc_name']}")
    
    for horizon in horizons:
        try:
            predicted = loader.predict_fund_return(sample_fund.to_dict(), horizon)
            actual = sample_fund[f'return_{horizon}yr']
            print(f"{horizon}-Year: Predicted {predicted:.2f}% | Actual {actual:.2f}%")
        except Exception as e:
            print(f"{horizon}-Year: Error - {str(e)}")

def quick_prediction_example():
    """Quick example of how to use the models for prediction"""
    
    print(f"\n{'='*60}")
    print("🚀 QUICK PREDICTION EXAMPLE")
    print("="*60)
    
    # Load models
    loader = MutualFundModelLoader()
    
    if not loader.load_all_models():
        print("❌ Cannot run example - models not available")
        return
    
    # Example: Get top 2 funds for ₹5000 investment, 1-year horizon, moderate risk
    print(f"\nScenario: ₹5,000 investment, 1-year horizon, moderate risk")
    print("-" * 50)
    
    try:
        top_funds = loader.predict_top_funds(horizon=1, top_n=2, risk_tolerance='moderate')
        
        if not top_funds.empty:
            investment_per_fund = 2500
            
            print(f"💡 RECOMMENDED DIVERSIFIED PORTFOLIO:")
            
            for idx, (_, fund) in enumerate(top_funds.iterrows(), 1):
                print(f"\n{idx}. {fund['scheme_name']}")
                print(f"   AMC: {fund['amc_name']}")
                print(f"   Predicted 1-Year Return: {fund['predicted_return']:.2f}%")
                print(f"   Risk Level: {fund['risk_level']}/6")
                print(f"   Expense Ratio: {fund['expense_ratio']:.2f}%")
                print(f"   Suggested Investment: ₹{investment_per_fund:,}")
                
                expected_return = investment_per_fund * (fund['predicted_return'] / 100)
                print(f"   Expected Return: ₹{expected_return:.0f}")
        
        else:
            print("❌ No suitable funds found")
            
    except Exception as e:
        print(f"❌ Error in prediction: {str(e)}")

if __name__ == "__main__":
    demo_model_loader()
    quick_prediction_example()
    
    print(f"\n{'='*60}")
    print("✅ MODEL LOADER UTILITY DEMO COMPLETE!")
    print("="*60)
    print("📁 Available model files:")
    print("   • mutual_fund_model_return_1yr.pkl")
    print("   • mutual_fund_model_return_3yr.pkl") 
    print("   • mutual_fund_model_return_5yr.pkl")
    print("   • complete_mutual_fund_system.pkl")
    print("\n💡 Usage:")
    print("   loader = MutualFundModelLoader()")
    print("   loader.load_all_models()")
    print("   prediction = loader.predict_fund_return(fund_data, horizon)")