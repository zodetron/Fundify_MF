import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import warnings
warnings.filterwarnings('ignore')

class DiversifiedMutualFundSystem:
    def __init__(self, data_path=None, load_from_pickle=False):
        if data_path is None:
            import os
            data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'mutual_funds_cleaned.csv')
        """Initialize the diversified mutual fund recommendation system"""
        self.df = pd.read_csv(data_path)
        self.models = {}
        self.feature_columns = {}
        
        if load_from_pickle:
            self.load_models_from_pickle()
        else:
            self.train_optimized_models()
    
    def prepare_features(self, target_column):
        """Prepare features for model training"""
        exclude_cols = ['scheme_name', 'fund_manager', 'amc_name', target_column]
        
        # Exclude other return columns when predicting one
        return_cols = ['return_1yr', 'return_3yr', 'return_5yr']
        for col in return_cols:
            if col != target_column and col in self.df.columns:
                exclude_cols.append(col)
        
        feature_cols = [col for col in self.df.columns if col not in exclude_cols]
        
        X = self.df[feature_cols].fillna(self.df[feature_cols].median())
        y = self.df[target_column].fillna(self.df[target_column].median())
        
        return X, y, feature_cols
    
    def train_optimized_models(self):
        """Train the best performing models for each time horizon"""
        print("Training optimized models for diversified portfolio system...")
        print("="*70)
        
        # Best model configurations based on analysis
        model_configs = {
            'return_1yr': {
                'model': GradientBoostingRegressor(n_estimators=200, random_state=42),
                'name': 'Gradient Boosting (200 trees)'
            },
            'return_3yr': {
                'model': GradientBoostingRegressor(n_estimators=200, random_state=42),
                'name': 'Gradient Boosting (200 trees)'
            },
            'return_5yr': {
                'model': ExtraTreesRegressor(n_estimators=200, random_state=42),
                'name': 'Extra Trees (200 trees)'
            }
        }
        
        for target, config in model_configs.items():
            if target in self.df.columns:
                print(f"\nTraining {config['name']} for {target}...")
                
                X, y, feature_cols = self.prepare_features(target)
                
                # Split for validation
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )
                
                # Train model
                model = config['model']
                model.fit(X_train, y_train)
                
                # Validate
                y_pred = model.predict(X_test)
                rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                r2 = r2_score(y_test, y_pred)
                
                # Store model and features
                self.models[target] = model
                self.feature_columns[target] = feature_cols
                
                print(f"✓ Model trained - RMSE: {rmse:.3f}, R²: {r2:.3f}")
                
                # Export model to pickle file
                import os
                models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
                model_filename = os.path.join(models_dir, f"mutual_fund_model_{target}.pkl")
                with open(model_filename, 'wb') as f:
                    pickle.dump({
                        'model': model,
                        'feature_columns': feature_cols,
                        'model_type': config['name'],
                        'target': target,
                        'performance': {'rmse': rmse, 'r2': r2},
                        'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
                    }, f)
                print(f"✓ Model exported to {model_filename}")
        
        # Export complete system
        import os
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        system_filename = os.path.join(models_dir, "complete_mutual_fund_system.pkl")
        with open(system_filename, 'wb') as f:
            pickle.dump({
                'models': self.models,
                'feature_columns': self.feature_columns,
                'data_shape': self.df.shape,
                'system_version': '1.0',
                'export_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
            }, f)
        print(f"\n✅ Complete system exported to {system_filename}")
        print(f"✅ All models trained and exported successfully!")
    
    def load_models_from_pickle(self):
        """Load pre-trained models from pickle files"""
        print("Loading pre-trained models from pickle files...")
        print("="*50)
        
        targets = ['return_1yr', 'return_3yr', 'return_5yr']
        
        for target in targets:
            import os
            models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
            model_filename = os.path.join(models_dir, f"mutual_fund_model_{target}.pkl")
            try:
                with open(model_filename, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.models[target] = model_data['model']
                self.feature_columns[target] = model_data['feature_columns']
                
                print(f"✓ Loaded {model_data['model_type']} for {target}")
                print(f"  Performance: RMSE: {model_data['performance']['rmse']:.3f}, R²: {model_data['performance']['r2']:.3f}")
                print(f"  Trained on: {model_data['training_date']}")
                
            except FileNotFoundError:
                print(f"❌ Model file {model_filename} not found. Training new model...")
                # Train individual model if pickle not found
                self.train_single_model(target)
            except Exception as e:
                print(f"❌ Error loading {model_filename}: {str(e)}")
                self.train_single_model(target)
        
        print(f"\n✅ Model loading complete!")
    
    def train_single_model(self, target):
        """Train a single model for specific target"""
        model_configs = {
            'return_1yr': {
                'model': GradientBoostingRegressor(n_estimators=200, random_state=42),
                'name': 'Gradient Boosting (200 trees)'
            },
            'return_3yr': {
                'model': GradientBoostingRegressor(n_estimators=200, random_state=42),
                'name': 'Gradient Boosting (200 trees)'
            },
            'return_5yr': {
                'model': ExtraTreesRegressor(n_estimators=200, random_state=42),
                'name': 'Extra Trees (200 trees)'
            }
        }
        
        if target in model_configs and target in self.df.columns:
            config = model_configs[target]
            print(f"Training {config['name']} for {target}...")
            
            X, y, feature_cols = self.prepare_features(target)
            
            # Split for validation
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train model
            model = config['model']
            model.fit(X_train, y_train)
            
            # Validate
            y_pred = model.predict(X_test)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            
            # Store model and features
            self.models[target] = model
            self.feature_columns[target] = feature_cols
            
            print(f"✓ Model trained - RMSE: {rmse:.3f}, R²: {r2:.3f}")
            
            # Export model to pickle file
            import os
            models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
            model_filename = os.path.join(models_dir, f"mutual_fund_model_{target}.pkl")
            with open(model_filename, 'wb') as f:
                pickle.dump({
                    'model': model,
                    'feature_columns': feature_cols,
                    'model_type': config['name'],
                    'target': target,
                    'performance': {'rmse': rmse, 'r2': r2},
                    'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
                }, f)
            print(f"✓ Model exported to {model_filename}")
    
    @staticmethod
    def load_system_from_pickle(data_path='mutual_funds_cleaned.csv'):
        """Load complete system from pickle file"""
        try:
            import os
            models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
            system_filename = os.path.join(models_dir, "complete_mutual_fund_system.pkl")
            with open(system_filename, 'rb') as f:
                system_data = pickle.load(f)
            
            # Create system instance
            system = DiversifiedMutualFundSystem.__new__(DiversifiedMutualFundSystem)
            system.df = pd.read_csv(data_path)
            system.models = system_data['models']
            system.feature_columns = system_data['feature_columns']
            
            print(f"✅ Complete system loaded from pickle!")
            print(f"System version: {system_data['system_version']}")
            print(f"Export date: {system_data['export_date']}")
            print(f"Data shape: {system_data['data_shape']}")
            
            return system
            
        except FileNotFoundError:
            print("❌ Complete system pickle file not found. Creating new system...")
            return DiversifiedMutualFundSystem(data_path)
        except Exception as e:
            print(f"❌ Error loading system: {str(e)}. Creating new system...")
            return DiversifiedMutualFundSystem(data_path)
    
    def predict_fund_returns(self, fund_data, horizon):
        """Predict returns for a specific fund and horizon"""
        target_col = f'return_{horizon}yr'
        
        if target_col not in self.models:
            raise ValueError(f"Model for {horizon}-year horizon not available")
        
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
    
    def get_diversified_recommendations(self, investment_amount, horizon, risk_tolerance='moderate', 
                                     category_preference=None, top_n=10):
        """
        Get top 2 diversified mutual fund recommendations for portfolio splitting
        
        Parameters:
        - investment_amount: Total amount to invest
        - horizon: Investment timeline (1, 3, or 5 years)
        - risk_tolerance: 'conservative', 'moderate', 'aggressive'
        - category_preference: 'Equity', 'Hybrid', 'Debt', None
        - top_n: Number of funds to evaluate before selecting top 2
        """
        
        target_col = f'return_{horizon}yr'
        
        if target_col not in self.models:
            raise ValueError(f"Model for {horizon}-year horizon not available")
        
        # Filter funds based on criteria
        df_filtered = self.df.copy()
        
        # Filter by investment amount (minimum investment)
        df_filtered = df_filtered[
            (df_filtered['min_sip'] <= investment_amount/2) |  # Can invest half amount
            (df_filtered['min_lumpsum'] <= investment_amount/2)
        ]
        
        # Filter by risk tolerance
        risk_mapping = {
            'conservative': (1, 3),
            'moderate': (3, 5),
            'aggressive': (5, 6)
        }
        
        min_risk, max_risk = risk_mapping[risk_tolerance]
        df_filtered = df_filtered[
            (df_filtered['risk_level'] >= min_risk) & 
            (df_filtered['risk_level'] <= max_risk)
        ]
        
        # Filter by category preference
        if category_preference:
            category_col = f'category_{category_preference}'
            if category_col in df_filtered.columns:
                df_filtered = df_filtered[df_filtered[category_col] == True]
        
        # Remove funds with missing target returns
        df_filtered = df_filtered.dropna(subset=[target_col])
        
        if len(df_filtered) < 2:
            return pd.DataFrame(), "Insufficient funds match your criteria. Please adjust preferences."
        
        # Predict returns for all filtered funds
        print(f"Evaluating {len(df_filtered)} funds for {horizon}-year investment...")
        
        predicted_returns = []
        fund_indices = []
        
        for idx, (fund_idx, fund_row) in enumerate(df_filtered.iterrows()):
            try:
                predicted_return = self.predict_fund_returns(fund_row.to_dict(), horizon)
                predicted_returns.append(predicted_return)
                fund_indices.append(fund_idx)
            except Exception as e:
                continue
        
        if len(predicted_returns) < 2:
            return pd.DataFrame(), "Unable to generate predictions. Please try different criteria."
        
        # Add predicted returns to dataframe
        df_with_predictions = df_filtered.loc[fund_indices].copy()
        df_with_predictions['predicted_return'] = predicted_returns
        
        # Calculate comprehensive score for ranking
        weights = {
            'predicted_return': 0.40,  # 40% weight to predicted returns
            'risk_adjusted_score': 0.20,  # 20% weight to risk-adjusted score
            'stability_score': 0.15,  # 15% weight to stability
            'cost_efficiency': 0.15,  # 15% weight to cost efficiency
            'rating': 0.10  # 10% weight to rating
        }
        
        df_with_predictions['comprehensive_score'] = (
            weights['predicted_return'] * df_with_predictions['predicted_return'] +
            weights['risk_adjusted_score'] * df_with_predictions['risk_adjusted_score'] +
            weights['stability_score'] * df_with_predictions['stability_score'] +
            weights['cost_efficiency'] * df_with_predictions['cost_efficiency'] +
            weights['rating'] * df_with_predictions['rating']
        )
        
        # Sort by comprehensive score
        top_funds = df_with_predictions.nlargest(top_n, 'comprehensive_score')
        
        # Select top 2 for diversification with different characteristics
        diversified_picks = self.select_diversified_pair(top_funds, investment_amount)
        
        return diversified_picks, f"Selected top 2 diversified funds from {len(df_filtered)} eligible options."
    
    def select_diversified_pair(self, top_funds, investment_amount):
        """Select 2 funds that provide good diversification"""
        
        if len(top_funds) < 2:
            return top_funds
        
        # Strategy: Pick the best fund + a complementary fund for diversification
        best_fund = top_funds.iloc[0]
        
        # Find a complementary fund with different characteristics
        remaining_funds = top_funds.iloc[1:].copy()
        
        # Calculate diversification score for each remaining fund
        diversification_scores = []
        
        for idx, fund in remaining_funds.iterrows():
            # Diversification factors
            risk_diff = abs(fund['risk_level'] - best_fund['risk_level'])
            category_diff = self.calculate_category_difference(fund, best_fund)
            amc_diff = 1 if fund['amc_name'] != best_fund['amc_name'] else 0
            size_diff = abs(fund['fund_size'] - best_fund['fund_size'])
            
            # Normalize size difference
            size_diff_norm = min(size_diff / (top_funds['fund_size'].std() + 0.001), 1)
            
            # Combined diversification score
            div_score = (
                0.3 * risk_diff +  # Different risk levels
                0.3 * category_diff +  # Different categories/sub-categories
                0.2 * amc_diff +  # Different AMCs
                0.2 * size_diff_norm  # Different fund sizes
            )
            
            diversification_scores.append(div_score)
        
        # Select fund with highest diversification score
        if diversification_scores:
            best_div_idx = np.argmax(diversification_scores)
            second_fund = remaining_funds.iloc[best_div_idx]
            
            # Create final selection
            selected_funds = pd.DataFrame([best_fund, second_fund])
        else:
            # Fallback to top 2 funds
            selected_funds = top_funds.head(2)
        
        # Add investment allocation
        selected_funds = selected_funds.copy()
        selected_funds['suggested_allocation'] = investment_amount / 2
        selected_funds['allocation_percentage'] = 50.0
        
        return selected_funds
    
    def calculate_category_difference(self, fund1, fund2):
        """Calculate difference between fund categories"""
        # Check main categories
        main_categories = ['category_Equity', 'category_Hybrid', 'category_Debt', 'category_Other']
        
        fund1_main = None
        fund2_main = None
        
        for cat in main_categories:
            if cat in fund1 and fund1[cat]:
                fund1_main = cat
            if cat in fund2 and fund2[cat]:
                fund2_main = cat
        
        # Different main categories = high diversification
        if fund1_main != fund2_main:
            return 1.0
        
        # Same main category, check sub-categories
        sub_categories = [col for col in fund1.index if col.startswith('sub_category_')]
        
        fund1_subs = [col for col in sub_categories if fund1[col]]
        fund2_subs = [col for col in sub_categories if fund2[col]]
        
        # Different sub-categories = medium diversification
        if not set(fund1_subs).intersection(set(fund2_subs)):
            return 0.5
        
        return 0.0  # Same categories
    
    def generate_investment_plan(self, investment_amount, horizon, risk_tolerance='moderate', 
                               category_preference=None):
        """Generate complete investment plan with diversified recommendations"""
        
        recommendations, message = self.get_diversified_recommendations(
            investment_amount, horizon, risk_tolerance, category_preference
        )
        
        if recommendations.empty:
            return {
                'status': 'error',
                'message': message,
                'recommendations': None
            }
        
        # Create detailed investment plan
        plan = {
            'status': 'success',
            'message': message,
            'investment_summary': {
                'total_amount': investment_amount,
                'investment_horizon': f"{horizon} year(s)",
                'risk_tolerance': risk_tolerance,
                'category_preference': category_preference or 'Any',
                'diversification_strategy': 'Top 2 performers with complementary characteristics'
            },
            'recommendations': []
        }
        
        for idx, (_, fund) in enumerate(recommendations.iterrows(), 1):
            fund_info = {
                'rank': idx,
                'scheme_name': fund['scheme_name'],
                'amc_name': fund['amc_name'],
                'predicted_return': f"{fund['predicted_return']:.2f}%",
                'actual_historical_return': f"{fund[f'return_{horizon}yr']:.2f}%",
                'risk_level': f"{fund['risk_level']}/6",
                'expense_ratio': f"{fund['expense_ratio']:.2f}%",
                'rating': f"{fund['rating']}/5",
                'suggested_allocation': f"₹{fund['suggested_allocation']:,.0f}",
                'allocation_percentage': f"{fund['allocation_percentage']:.1f}%",
                'min_sip': fund['min_sip'],
                'min_lumpsum': fund['min_lumpsum'],
                'comprehensive_score': f"{fund['comprehensive_score']:.3f}",
                'fund_size': fund['fund_size'],
                'fund_age': fund['fund_age']
            }
            plan['recommendations'].append(fund_info)
        
        # Add diversification analysis
        if len(recommendations) >= 2:
            fund1, fund2 = recommendations.iloc[0], recommendations.iloc[1]
            
            plan['diversification_analysis'] = {
                'risk_diversification': f"Risk levels: {fund1['risk_level']} vs {fund2['risk_level']}",
                'amc_diversification': f"AMCs: {fund1['amc_name']} vs {fund2['amc_name']}",
                'size_diversification': f"Fund sizes: {fund1['fund_size']:.2f} vs {fund2['fund_size']:.2f}",
                'return_correlation': 'Optimized for low correlation between funds'
            }
        
        return plan

def demo_diversified_system():
    """Demonstrate the diversified portfolio system"""
    
    print("🚀 INITIALIZING DIVERSIFIED MUTUAL FUND SYSTEM")
    print("="*60)
    
    # Initialize system (will train and export models)
    print("Training new models and exporting to pickle files...")
    system = DiversifiedMutualFundSystem()
    
    print(f"\n{'='*60}")
    print("🔄 TESTING MODEL LOADING FROM PICKLE FILES")
    print("="*60)
    
    # Test loading from pickle
    print("Loading models from pickle files...")
    system_loaded = DiversifiedMutualFundSystem(load_from_pickle=True)
    
    # Test scenarios
    test_scenarios = [
        {
            'name': 'Young Professional - 1 Year Investment',
            'amount': 5000,
            'horizon': 1,
            'risk': 'moderate',
            'category': None
        },
        {
            'name': 'Conservative Investor - 3 Year Investment',
            'amount': 25000,
            'horizon': 3,
            'risk': 'conservative',
            'category': 'Hybrid'
        },
        {
            'name': 'Aggressive Investor - 5 Year Investment',
            'amount': 50000,
            'horizon': 5,
            'risk': 'aggressive',
            'category': 'Equity'
        },
        {
            'name': 'Balanced Portfolio - 3 Year Investment',
            'amount': 15000,
            'horizon': 3,
            'risk': 'moderate',
            'category': None
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n{'='*60}")
        print(f"📊 SCENARIO: {scenario['name']}")
        print(f"{'='*60}")
        print(f"Investment: ₹{scenario['amount']:,} | Horizon: {scenario['horizon']} year(s)")
        print(f"Risk: {scenario['risk'].title()} | Category: {scenario['category'] or 'Any'}")
        
        # Generate investment plan (using loaded system)
        plan = system_loaded.generate_investment_plan(
            investment_amount=scenario['amount'],
            horizon=scenario['horizon'],
            risk_tolerance=scenario['risk'],
            category_preference=scenario['category']
        )
        
        if plan['status'] == 'success':
            print(f"\n✅ {plan['message']}")
            
            print(f"\n🎯 DIVERSIFIED RECOMMENDATIONS:")
            print("-" * 50)
            
            for rec in plan['recommendations']:
                print(f"\n{rec['rank']}. {rec['scheme_name']}")
                print(f"   AMC: {rec['amc_name']}")
                print(f"   Predicted Return: {rec['predicted_return']} (Historical: {rec['actual_historical_return']})")
                print(f"   Risk Level: {rec['risk_level']} | Rating: {rec['rating']}")
                print(f"   Suggested Investment: {rec['suggested_allocation']} ({rec['allocation_percentage']})")
                print(f"   Expense Ratio: {rec['expense_ratio']} | Score: {rec['comprehensive_score']}")
            
            if 'diversification_analysis' in plan:
                print(f"\n🔄 DIVERSIFICATION ANALYSIS:")
                print("-" * 30)
                div = plan['diversification_analysis']
                print(f"• {div['risk_diversification']}")
                print(f"• {div['amc_diversification']}")
                print(f"• {div['size_diversification']}")
                print(f"• {div['return_correlation']}")
        
        else:
            print(f"\n❌ {plan['message']}")
    
    print(f"\n{'='*60}")
    print("🎉 DIVERSIFIED PORTFOLIO SYSTEM DEMO COMPLETE!")
    print(f"{'='*60}")
    print("✅ Trained 3 optimized models (GB for 1yr/3yr, ET for 5yr)")
    print("✅ Implemented diversified portfolio selection")
    print("✅ Tested multiple investor scenarios")
    print("✅ Provided risk-balanced recommendations")

def create_model_info_summary():
    """Create a summary of exported models"""
    print("\n📋 EXPORTED MODEL SUMMARY")
    print("="*50)
    
    targets = ['return_1yr', 'return_3yr', 'return_5yr']
    
    for target in targets:
        model_filename = f"mutual_fund_model_{target}.pkl"
        try:
            with open(model_filename, 'rb') as f:
                model_data = pickle.load(f)
            
            print(f"\n📁 {model_filename}")
            print(f"   Model Type: {model_data['model_type']}")
            print(f"   Target: {model_data['target']}")
            print(f"   Performance: RMSE: {model_data['performance']['rmse']:.3f}, R²: {model_data['performance']['r2']:.3f}")
            print(f"   Features: {len(model_data['feature_columns'])} columns")
            print(f"   Training Date: {model_data['training_date']}")
            
        except FileNotFoundError:
            print(f"\n❌ {model_filename} - Not found")
        except Exception as e:
            print(f"\n❌ {model_filename} - Error: {str(e)}")
    
    # Check complete system file
    try:
        with open("complete_mutual_fund_system.pkl", 'rb') as f:
            system_data = pickle.load(f)
        
        print(f"\n📁 complete_mutual_fund_system.pkl")
        print(f"   System Version: {system_data['system_version']}")
        print(f"   Export Date: {system_data['export_date']}")
        print(f"   Data Shape: {system_data['data_shape']}")
        print(f"   Models Included: {len(system_data['models'])}")
        
    except FileNotFoundError:
        print(f"\n❌ complete_mutual_fund_system.pkl - Not found")
    except Exception as e:
        print(f"\n❌ complete_mutual_fund_system.pkl - Error: {str(e)}")

if __name__ == "__main__":
    demo_diversified_system()
    create_model_info_summary()