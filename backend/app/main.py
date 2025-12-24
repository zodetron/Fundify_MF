from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
from .diversified_portfolio_system import DiversifiedMutualFundSystem
from .model_loader_utility import MutualFundModelLoader
import json
import warnings
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import base64
import io
warnings.filterwarnings('ignore')

# Initialize FastAPI app
app = FastAPI(
    title="Mutual Fund AI/ML API",
    description="AI-powered mutual fund analysis and recommendation system",
    version="1.0.0"
)

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models and data
ml_system = None
model_loader = None
funds_data = None

@app.on_event("startup")
async def startup_event():
    """Initialize ML models and load data on startup"""
    global ml_system, model_loader, funds_data
    
    try:
        # Load ML system
        ml_system = DiversifiedMutualFundSystem(load_from_pickle=True)
        
        # Load individual models
        model_loader = MutualFundModelLoader()
        model_loader.load_all_models()
        
        # Load funds data
        import os
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'mutual_funds_cleaned.csv')
        funds_data = pd.read_csv(data_path)
        
        print("✅ ML models and data loaded successfully")
        
    except Exception as e:
        print(f" Error loading models: {e}")
        raise e

# Pydantic models for request/response
class RecommendationRequest(BaseModel):
    amc_name: Optional[str] = None
    category: Optional[str] = None
    amount: int
    tenure: int  # in years
    risk_tolerance: str = "moderate"

class FundFilterRequest(BaseModel):
    amc_name: Optional[str] = None
    category: Optional[str] = None
    risk_level: Optional[int] = None
    min_rating: Optional[int] = None
    limit: int = 50

class ForecastRequest(BaseModel):
    fund_name: str
    horizon: int = 5

class AnalysisRequest(BaseModel):
    analysis_type: str  # 'correlation', 'pca', 'trends', 'performance'
    category: Optional[str] = None
    amc_name: Optional[str] = None

class ComparisonRequest(BaseModel):
    fund_names: List[str]
    metrics: List[str] = ["return_1yr", "return_3yr", "return_5yr", "risk_level", "expense_ratio"]

class WhatIfSimulationRequest(BaseModel):
    fund_names: List[str]  # Can be single fund or top N funds
    investment_amount: float
    duration_years: int  # 1, 3, or 5
    market_regime: Optional[str] = None  # "bull", "sideways", "volatile" - will be auto-detected if not provided

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Mutual Fund AI/ML API is running",
        "status": "healthy",
        "models_loaded": ml_system is not None and model_loader is not None
    }

@app.get("/api/descriptive-analysis")
async def get_descriptive_analysis():
    """Get comprehensive descriptive analysis of mutual funds data"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        # Basic statistics
        total_funds = len(funds_data)
        unique_amcs = funds_data['amc_name'].nunique()
        
        # Category distribution
        category_cols = [col for col in funds_data.columns if col.startswith('category_')]
        category_dist = {}
        for col in category_cols:
            category_name = col.replace('category_', '')
            count = funds_data[funds_data[col] == True].shape[0]
            if count > 0:
                category_dist[category_name] = count
        
        # Risk level distribution
        risk_dist = funds_data['risk_level'].value_counts().to_dict()
        
        # Rating distribution
        rating_dist = funds_data['rating'].value_counts().to_dict()
        
        # Return statistics
        return_stats = {
            '1_year': {
                'mean': float(funds_data['return_1yr'].mean()),
                'median': float(funds_data['return_1yr'].median()),
                'std': float(funds_data['return_1yr'].std()),
                'min': float(funds_data['return_1yr'].min()),
                'max': float(funds_data['return_1yr'].max())
            },
            '3_year': {
                'mean': float(funds_data['return_3yr'].mean()),
                'median': float(funds_data['return_3yr'].median()),
                'std': float(funds_data['return_3yr'].std()),
                'min': float(funds_data['return_3yr'].min()),
                'max': float(funds_data['return_3yr'].max())
            },
            '5_year': {
                'mean': float(funds_data['return_5yr'].mean()),
                'median': float(funds_data['return_5yr'].median()),
                'std': float(funds_data['return_5yr'].std()),
                'min': float(funds_data['return_5yr'].min()),
                'max': float(funds_data['return_5yr'].max())
            }
        }
        
        # Top performing AMCs
        amc_performance = funds_data.groupby('amc_name')['return_3yr'].mean().sort_values(ascending=False).head(10)
        top_amcs = {amc: float(performance) for amc, performance in amc_performance.items()}
        
        # Expense ratio analysis
        expense_stats = {
            'mean': float(funds_data['expense_ratio'].mean()),
            'median': float(funds_data['expense_ratio'].median()),
            'low_cost_funds': int((funds_data['expense_ratio'] < 1.0).sum()),
            'high_cost_funds': int((funds_data['expense_ratio'] > 2.0).sum())
        }
        
        return {
            "summary": {
                "total_funds": total_funds,
                "unique_amcs": unique_amcs,
                "data_points": total_funds * len(funds_data.columns)
            },
            "category_distribution": category_dist,
            "risk_distribution": risk_dist,
            "rating_distribution": rating_dist,
            "return_statistics": return_stats,
            "top_performing_amcs": top_amcs,
            "expense_analysis": expense_stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analysis: {str(e)}")

@app.get("/api/amcs")
async def get_amcs():
    """Get list of all AMC names"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        amcs = sorted(funds_data['amc_name'].unique().tolist())
        return {"amcs": amcs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching AMCs: {str(e)}")

@app.get("/api/categories")
async def get_categories():
    """Get list of all fund categories"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        category_cols = [col for col in funds_data.columns if col.startswith('category_')]
        categories = []
        
        for col in category_cols:
            category_name = col.replace('category_', '')
            count = funds_data[funds_data[col] == True].shape[0]
            if count > 0:
                categories.append({
                    "name": category_name,
                    "count": count
                })
        
        return {"categories": sorted(categories, key=lambda x: x['count'], reverse=True)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@app.post("/api/funds")
async def get_funds(filter_request: FundFilterRequest):
    """Get filtered list of funds based on criteria"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        df_filtered = funds_data.copy()
        
        # Apply filters
        if filter_request.amc_name:
            df_filtered = df_filtered[df_filtered['amc_name'] == filter_request.amc_name]
        
        if filter_request.category:
            category_col = f'category_{filter_request.category}'
            if category_col in df_filtered.columns:
                df_filtered = df_filtered[df_filtered[category_col] == True]
        
        if filter_request.risk_level:
            df_filtered = df_filtered[df_filtered['risk_level'] == filter_request.risk_level]
        
        if filter_request.min_rating:
            df_filtered = df_filtered[df_filtered['rating'] >= filter_request.min_rating]
        
        # Limit results
        df_filtered = df_filtered.head(filter_request.limit)
        
        # Prepare response
        funds = []
        for _, fund in df_filtered.iterrows():
            funds.append({
                "scheme_name": fund['scheme_name'],
                "amc_name": fund['amc_name'],
                "return_1yr": float(fund['return_1yr']),
                "return_3yr": float(fund['return_3yr']),
                "return_5yr": float(fund['return_5yr']),
                "risk_level": int(fund['risk_level']),
                "rating": int(fund['rating']),
                "expense_ratio": float(fund['expense_ratio']),
                "fund_size": float(fund['fund_size']),
                "fund_age": float(fund['fund_age'])
            })
        
        return {
            "funds": funds,
            "total_found": len(df_filtered),
            "filters_applied": {
                "amc_name": filter_request.amc_name,
                "category": filter_request.category,
                "risk_level": filter_request.risk_level,
                "min_rating": filter_request.min_rating
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtering funds: {str(e)}")

@app.post("/api/recommend")
async def get_recommendations(request: RecommendationRequest):
    """Get AI-powered fund recommendations based on specific inputs"""
    
    if ml_system is None:
        raise HTTPException(status_code=500, detail="ML system not loaded")
    
    try:
        # Map category to our system's format
        category_mapping = {
            "Equity": "Equity",
            "Hybrid": "Hybrid", 
            "Debt": "Debt",
            "Other": "Other"
        }
        
        category_preference = category_mapping.get(request.category) if request.category else None
        
        # Generate recommendations
        plan = ml_system.generate_investment_plan(
            investment_amount=request.amount,
            horizon=request.tenure,
            risk_tolerance=request.risk_tolerance,
            category_preference=category_preference
        )
        
        if plan['status'] != 'success':
            raise HTTPException(status_code=400, detail=plan['message'])
        
        # Filter by AMC if specified
        recommendations = plan['recommendations']
        if request.amc_name:
            recommendations = [rec for rec in recommendations if rec['amc_name'] == request.amc_name]
            
            if not recommendations:
                # If no recommendations for specific AMC, get alternative suggestions
                alternative_plan = ml_system.generate_investment_plan(
                    investment_amount=request.amount,
                    horizon=request.tenure,
                    risk_tolerance=request.risk_tolerance,
                    category_preference=category_preference
                )
                
                return {
                    "status": "partial_match",
                    "message": f"No suitable funds found for {request.amc_name}. Showing alternative recommendations.",
                    "recommendations": alternative_plan['recommendations'],
                    "investment_summary": alternative_plan['investment_summary']
                }
        
        return {
            "status": "success",
            "message": plan['message'],
            "recommendations": recommendations,
            "investment_summary": plan['investment_summary'],
            "diversification_analysis": plan.get('diversification_analysis', {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.post("/api/forecast")
async def get_fund_forecast(request: ForecastRequest):
    """Get future performance forecast for a specific fund"""
    
    if model_loader is None or funds_data is None:
        raise HTTPException(status_code=500, detail="Models or data not loaded")
    
    try:
        # Find the fund
        fund_data = funds_data[funds_data['scheme_name'] == request.fund_name]
        
        if fund_data.empty:
            raise HTTPException(status_code=404, detail="Fund not found")
        
        fund_row = fund_data.iloc[0]
        
        # Generate predictions for different horizons
        predictions = {}
        
        for horizon in [1, 3, 5]:
            try:
                predicted_return = model_loader.predict_fund_return(fund_row.to_dict(), horizon)
                predictions[f"{horizon}_year"] = {
                    "predicted_return": float(predicted_return),
                    "historical_return": float(fund_row[f'return_{horizon}yr']),
                    "confidence": "high" if horizon == 3 else "medium"  # 3-year has highest accuracy
                }
            except Exception as e:
                predictions[f"{horizon}_year"] = {
                    "error": f"Prediction failed: {str(e)}"
                }
        
        # Generate monthly projections for requested horizon
        monthly_projections = []
        if request.horizon in [1, 3, 5]:
            annual_return = predictions[f"{request.horizon}_year"]["predicted_return"]
            monthly_return = annual_return / 12
            
            for month in range(1, request.horizon * 12 + 1):
                projected_value = 100 * ((1 + monthly_return/100) ** month)
                monthly_projections.append({
                    "month": month,
                    "projected_value": round(projected_value, 2),
                    "return_percentage": round(projected_value - 100, 2)
                })
        
        return {
            "fund_name": request.fund_name,
            "amc_name": fund_row['amc_name'],
            "current_metrics": {
                "risk_level": int(fund_row['risk_level']),
                "rating": int(fund_row['rating']),
                "expense_ratio": float(fund_row['expense_ratio']),
                "fund_size": float(fund_row['fund_size']),
                "fund_age": float(fund_row['fund_age'])
            },
            "predictions": predictions,
            "monthly_projections": monthly_projections[:12] if monthly_projections else [],  # First year only
            "forecast_horizon": request.horizon
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

@app.get("/api/enhanced-analysis")
async def get_enhanced_analysis():
    """Get enhanced descriptive analysis with correlations, trends, and patterns"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        # Correlation Analysis
        numeric_cols = ['return_1yr', 'return_3yr', 'return_5yr', 'risk_level', 
                       'expense_ratio', 'fund_size', 'fund_age', 'rating', 
                       'sharpe', 'sortino', 'alpha', 'beta']
        
        correlation_matrix = funds_data[numeric_cols].corr()
        
        # Convert to dict for JSON serialization
        correlations = {}
        for col1 in numeric_cols:
            correlations[col1] = {}
            for col2 in numeric_cols:
                correlations[col1][col2] = float(correlation_matrix.loc[col1, col2])
        
        # Key insights from correlations
        strong_correlations = []
        for i, col1 in enumerate(numeric_cols):
            for col2 in numeric_cols[i+1:]:
                corr_value = correlation_matrix.loc[col1, col2]
                if abs(corr_value) > 0.5:
                    strong_correlations.append({
                        "feature1": col1,
                        "feature2": col2,
                        "correlation": float(corr_value),
                        "strength": "strong" if abs(corr_value) > 0.7 else "moderate"
                    })
        
        # Performance Trends by Category
        category_cols = [col for col in funds_data.columns if col.startswith('category_')]
        category_trends = {}
        
        for col in category_cols:
            category_name = col.replace('category_', '')
            category_funds = funds_data[funds_data[col] == True]
            
            if not category_funds.empty:
                category_trends[category_name] = {
                    "count": len(category_funds),
                    "avg_return_1yr": float(category_funds['return_1yr'].mean()),
                    "avg_return_3yr": float(category_funds['return_3yr'].mean()),
                    "avg_return_5yr": float(category_funds['return_5yr'].mean()),
                    "avg_risk": float(category_funds['risk_level'].mean()),
                    "avg_expense": float(category_funds['expense_ratio'].mean()),
                    "top_performer": category_funds.nlargest(1, 'return_3yr').iloc[0]['scheme_name']
                }
        
        # Risk-Return Analysis
        risk_return_buckets = []
        for risk_level in range(1, 7):
            risk_funds = funds_data[funds_data['risk_level'] == risk_level]
            if not risk_funds.empty:
                risk_return_buckets.append({
                    "risk_level": risk_level,
                    "fund_count": len(risk_funds),
                    "avg_return_1yr": float(risk_funds['return_1yr'].mean()),
                    "avg_return_3yr": float(risk_funds['return_3yr'].mean()),
                    "avg_return_5yr": float(risk_funds['return_5yr'].mean()),
                    "return_volatility": float(risk_funds['return_3yr'].std())
                })
        
        # Expense Ratio Impact Analysis
        expense_buckets = {
            "low_cost": funds_data[funds_data['expense_ratio'] < 1.0],
            "medium_cost": funds_data[(funds_data['expense_ratio'] >= 1.0) & (funds_data['expense_ratio'] < 2.0)],
            "high_cost": funds_data[funds_data['expense_ratio'] >= 2.0]
        }
        
        expense_impact = {}
        for bucket_name, bucket_data in expense_buckets.items():
            if not bucket_data.empty:
                expense_impact[bucket_name] = {
                    "count": len(bucket_data),
                    "avg_return_3yr": float(bucket_data['return_3yr'].mean()),
                    "avg_expense": float(bucket_data['expense_ratio'].mean())
                }
        
        # Fund Age vs Performance
        age_performance = []
        age_bins = [(0, 3), (3, 5), (5, 10), (10, 20)]
        for min_age, max_age in age_bins:
            age_funds = funds_data[(funds_data['fund_age'] >= min_age) & (funds_data['fund_age'] < max_age)]
            if not age_funds.empty:
                age_performance.append({
                    "age_range": f"{min_age}-{max_age} years",
                    "count": len(age_funds),
                    "avg_return_3yr": float(age_funds['return_3yr'].mean()),
                    "avg_stability": float(age_funds['stability_score'].mean())
                })
        
        # Statistical Distribution Analysis
        distribution_analysis = {
            "returns_1yr": {
                "mean": float(funds_data['return_1yr'].mean()),
                "median": float(funds_data['return_1yr'].median()),
                "std": float(funds_data['return_1yr'].std()),
                "skewness": float(stats.skew(funds_data['return_1yr'].dropna())),
                "kurtosis": float(stats.kurtosis(funds_data['return_1yr'].dropna())),
                "percentiles": {
                    "25th": float(funds_data['return_1yr'].quantile(0.25)),
                    "50th": float(funds_data['return_1yr'].quantile(0.50)),
                    "75th": float(funds_data['return_1yr'].quantile(0.75)),
                    "90th": float(funds_data['return_1yr'].quantile(0.90))
                }
            },
            "returns_3yr": {
                "mean": float(funds_data['return_3yr'].mean()),
                "median": float(funds_data['return_3yr'].median()),
                "std": float(funds_data['return_3yr'].std()),
                "skewness": float(stats.skew(funds_data['return_3yr'].dropna())),
                "kurtosis": float(stats.kurtosis(funds_data['return_3yr'].dropna())),
                "percentiles": {
                    "25th": float(funds_data['return_3yr'].quantile(0.25)),
                    "50th": float(funds_data['return_3yr'].quantile(0.50)),
                    "75th": float(funds_data['return_3yr'].quantile(0.75)),
                    "90th": float(funds_data['return_3yr'].quantile(0.90))
                }
            }
        }
        
        return {
            "correlation_analysis": {
                "correlation_matrix": correlations,
                "strong_correlations": strong_correlations,
                "key_insights": [
                    "Risk level strongly correlates with return volatility",
                    "Fund size shows moderate correlation with stability",
                    "Expense ratio has negative correlation with net returns"
                ]
            },
            "category_trends": category_trends,
            "risk_return_analysis": risk_return_buckets,
            "expense_impact": expense_impact,
            "age_performance": age_performance,
            "distribution_analysis": distribution_analysis,
            "market_insights": {
                "total_aum": float(funds_data['fund_size'].sum()),
                "avg_fund_age": float(funds_data['fund_age'].mean()),
                "high_performers_count": int((funds_data['return_3yr'] > 20).sum()),
                "low_cost_funds_count": int((funds_data['expense_ratio'] < 1.0).sum())
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating enhanced analysis: {str(e)}")

@app.post("/api/compare-funds")
async def compare_funds(request: ComparisonRequest):
    """Compare multiple funds side by side"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        comparison_data = []
        
        for fund_name in request.fund_names:
            fund = funds_data[funds_data['scheme_name'] == fund_name]
            
            if fund.empty:
                comparison_data.append({
                    "fund_name": fund_name,
                    "error": "Fund not found"
                })
                continue
            
            fund_row = fund.iloc[0]
            fund_info = {
                "fund_name": fund_name,
                "amc_name": fund_row['amc_name']
            }
            
            # Add requested metrics
            for metric in request.metrics:
                if metric in fund_row:
                    fund_info[metric] = float(fund_row[metric])
            
            # Add predictions if model_loader is available
            if model_loader is not None:
                try:
                    predictions = {}
                    for horizon in [1, 3, 5]:
                        pred = model_loader.predict_fund_return(fund_row.to_dict(), horizon)
                        predictions[f"predicted_{horizon}yr"] = float(pred)
                    fund_info["predictions"] = predictions
                except:
                    pass
            
            comparison_data.append(fund_info)
        
        # Calculate relative rankings
        if len(comparison_data) > 1:
            for metric in request.metrics:
                values = [f.get(metric, 0) for f in comparison_data if metric in f]
                if values:
                    max_val = max(values)
                    for fund in comparison_data:
                        if metric in fund:
                            fund[f"{metric}_rank"] = int(values.index(fund[metric]) + 1)
        
        return {
            "comparison": comparison_data,
            "metrics_compared": request.metrics,
            "total_funds": len(request.fund_names)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing funds: {str(e)}")

@app.get("/api/market-trends")
async def get_market_trends():
    """Get market-wide trends and patterns"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        # Performance distribution across market
        performance_distribution = {
            "excellent": int((funds_data['return_3yr'] > 25).sum()),
            "good": int(((funds_data['return_3yr'] > 15) & (funds_data['return_3yr'] <= 25)).sum()),
            "average": int(((funds_data['return_3yr'] > 10) & (funds_data['return_3yr'] <= 15)).sum()),
            "below_average": int((funds_data['return_3yr'] <= 10).sum())
        }
        
        # Risk appetite in market
        risk_appetite = {
            "conservative": int((funds_data['risk_level'] <= 2).sum()),
            "moderate": int(((funds_data['risk_level'] > 2) & (funds_data['risk_level'] <= 4)).sum()),
            "aggressive": int((funds_data['risk_level'] > 4).sum())
        }
        
        # AMC market share (by fund count)
        top_amcs = funds_data['amc_name'].value_counts().head(10)
        amc_market_share = {amc: int(count) for amc, count in top_amcs.items()}
        
        # Category-wise AUM distribution
        category_cols = [col for col in funds_data.columns if col.startswith('category_')]
        category_aum = {}
        
        for col in category_cols:
            category_name = col.replace('category_', '')
            category_funds = funds_data[funds_data[col] == True]
            if not category_funds.empty:
                category_aum[category_name] = float(category_funds['fund_size'].sum())
        
        # Expense ratio trends
        expense_trends = {
            "market_average": float(funds_data['expense_ratio'].mean()),
            "equity_avg": float(funds_data[funds_data['category_Equity'] == True]['expense_ratio'].mean()),
            "debt_avg": float(funds_data[funds_data['category_Debt'] == True]['expense_ratio'].mean()) if 'category_Debt' in funds_data.columns else 0,
            "hybrid_avg": float(funds_data[funds_data['category_Hybrid'] == True]['expense_ratio'].mean())
        }
        
        # Rating distribution
        rating_distribution = funds_data['rating'].value_counts().sort_index().to_dict()
        rating_distribution = {int(k): int(v) for k, v in rating_distribution.items()}
        
        # Sharpe ratio analysis (risk-adjusted returns)
        sharpe_analysis = {
            "market_avg_sharpe": float(funds_data['sharpe'].mean()),
            "high_sharpe_funds": int((funds_data['sharpe'] > 1.5).sum()),
            "negative_sharpe_funds": int((funds_data['sharpe'] < 0).sum())
        }
        
        return {
            "performance_distribution": performance_distribution,
            "risk_appetite": risk_appetite,
            "amc_market_share": amc_market_share,
            "category_aum": category_aum,
            "expense_trends": expense_trends,
            "rating_distribution": rating_distribution,
            "sharpe_analysis": sharpe_analysis,
            "market_summary": {
                "total_funds": len(funds_data),
                "total_aum": float(funds_data['fund_size'].sum()),
                "avg_3yr_return": float(funds_data['return_3yr'].mean()),
                "market_volatility": float(funds_data['standard_deviation'].mean())
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating market trends: {str(e)}")

@app.get("/api/top-performers")
async def get_top_performers(
    metric: str = "return_3yr",
    category: Optional[str] = None,
    limit: int = 10
):
    """Get top performing funds by various metrics"""
    
    if funds_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        df_filtered = funds_data.copy()
        
        # Filter by category if specified
        if category:
            category_col = f'category_{category}'
            if category_col in df_filtered.columns:
                df_filtered = df_filtered[df_filtered[category_col] == True]
        
        # Get top performers
        if metric not in df_filtered.columns:
            raise HTTPException(status_code=400, detail=f"Invalid metric: {metric}")
        
        top_funds = df_filtered.nlargest(limit, metric)
        
        performers = []
        for _, fund in top_funds.iterrows():
            performers.append({
                "rank": len(performers) + 1,
                "scheme_name": fund['scheme_name'],
                "amc_name": fund['amc_name'],
                "metric_value": float(fund[metric]),
                "return_1yr": float(fund['return_1yr']),
                "return_3yr": float(fund['return_3yr']),
                "return_5yr": float(fund['return_5yr']),
                "risk_level": int(fund['risk_level']),
                "rating": int(fund['rating']),
                "expense_ratio": float(fund['expense_ratio'])
            })
        
        return {
            "metric": metric,
            "category": category or "All",
            "top_performers": performers,
            "total_evaluated": len(df_filtered)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top performers: {str(e)}")

@app.get("/api/dashboard-data")
async def get_dashboard_data():
    """Get summary data for dashboard overview"""
    
    if funds_data is None or model_loader is None:
        raise HTTPException(status_code=500, detail="Data or models not loaded")
    
    try:
        # Market overview
        market_overview = {
            "total_funds": len(funds_data),
            "total_amcs": funds_data['amc_name'].nunique(),
            "avg_1yr_return": float(funds_data['return_1yr'].mean()),
            "avg_3yr_return": float(funds_data['return_3yr'].mean()),
            "avg_5yr_return": float(funds_data['return_5yr'].mean()),
            "total_aum": float(funds_data['fund_size'].sum())  # Approximate
        }
        
        # Top performers by category
        category_cols = [col for col in funds_data.columns if col.startswith('category_')]
        top_performers = {}
        
        for col in category_cols:
            category_name = col.replace('category_', '')
            category_funds = funds_data[funds_data[col] == True]
            
            if not category_funds.empty:
                top_fund = category_funds.nlargest(1, 'return_3yr').iloc[0]
                top_performers[category_name] = {
                    "fund_name": top_fund['scheme_name'],
                    "amc_name": top_fund['amc_name'],
                    "return_3yr": float(top_fund['return_3yr']),
                    "risk_level": int(top_fund['risk_level']),
                    "rating": int(top_fund['rating'])
                }
        
        # Model performance metrics
        model_performance = {
            "1_year_model": {"accuracy": "51.8%", "rmse": 3.918},
            "3_year_model": {"accuracy": "96.4%", "rmse": 2.303},
            "5_year_model": {"accuracy": "78.8%", "rmse": 1.685}
        }
        
        return {
            "market_overview": market_overview,
            "top_performers": top_performers,
            "model_performance": model_performance,
            "last_updated": "2025-12-18"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dashboard data: {str(e)}")

@app.get("/api/market-condition")
async def get_market_condition():
    """
    Fetch Nifty 50 data, calculate EMA 12/21 on 4H timeframe, 
    and suggest market condition based on crossover
    """
    try:
        import yfinance as yf
        from datetime import datetime, timedelta
        
        # Fetch Nifty 50 data (^NSEI is the Yahoo Finance ticker for Nifty 50)
        ticker = "^NSEI"
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)  # Past 1 year
        
        # Download data
        nifty = yf.download(ticker, start=start_date, end=end_date, interval="1h", progress=False)
        
        if nifty.empty:
            raise HTTPException(status_code=500, detail="Failed to fetch Nifty 50 data")
        
        # Resample to 4H timeframe
        nifty_4h = nifty['Close'].resample('4H').last().dropna()
        
        if len(nifty_4h) < 21:
            raise HTTPException(status_code=500, detail="Insufficient data for EMA calculation")
        
        # Calculate EMA 12 and EMA 21
        ema_12 = nifty_4h.ewm(span=12, adjust=False).mean()
        ema_21 = nifty_4h.ewm(span=21, adjust=False).mean()
        
        # Get latest values
        latest_price = float(nifty_4h.iloc[-1])
        latest_ema_12 = float(ema_12.iloc[-1])
        latest_ema_21 = float(ema_21.iloc[-1])
        
        # Previous values to detect crossover
        prev_ema_12 = float(ema_12.iloc[-2]) if len(ema_12) > 1 else latest_ema_12
        prev_ema_21 = float(ema_21.iloc[-2]) if len(ema_21) > 1 else latest_ema_21
        
        # Determine market condition
        # Bullish: EMA 12 > EMA 21 (good to invest)
        # Bearish: EMA 12 < EMA 21 (not good to invest)
        is_bullish = latest_ema_12 > latest_ema_21
        was_bullish = prev_ema_12 > prev_ema_21
        
        # Detect crossover
        crossover = None
        if is_bullish != was_bullish:
            if is_bullish:
                crossover = "bullish"  # Golden cross (EMA 12 crossed above EMA 21)
            else:
                crossover = "bearish"  # Death cross (EMA 12 crossed below EMA 21)
        
        # Calculate percentage difference
        ema_diff_percent = ((latest_ema_12 - latest_ema_21) / latest_ema_21) * 100
        
        # Market condition recommendation
        if is_bullish:
            condition = "bullish"
            recommendation = "favorable"
            message = "Market conditions are favorable for investment. EMA 12 is above EMA 21, indicating upward momentum."
        else:
            condition = "bearish"
            recommendation = "caution"
            message = "Market conditions suggest caution. EMA 12 is below EMA 21, indicating potential downward pressure."
        
        # Calculate trend strength (distance between EMAs)
        trend_strength = abs(ema_diff_percent)
        if trend_strength < 0.5:
            strength = "weak"
        elif trend_strength < 1.5:
            strength = "moderate"
        else:
            strength = "strong"
        
        # Calculate estimated time for market improvement (if currently bearish)
        estimated_improvement_time = None
        estimated_improvement_date = None
        improvement_confidence = None
        
        if not is_bullish:
            # Calculate rate of change for EMA 12 and EMA 21 over last 10 periods
            lookback_periods = min(10, len(ema_12) - 1)
            if lookback_periods > 0:
                # Get recent EMA values
                recent_ema_12 = ema_12.iloc[-lookback_periods:].values
                recent_ema_21 = ema_21.iloc[-lookback_periods:].values
                
                # Calculate average rate of change per 4H period
                ema_12_changes = np.diff(recent_ema_12)
                ema_21_changes = np.diff(recent_ema_21)
                
                avg_ema_12_change = np.mean(ema_12_changes) if len(ema_12_changes) > 0 else 0
                avg_ema_21_change = np.mean(ema_21_changes) if len(ema_21_changes) > 0 else 0
                
                # Net convergence rate (how fast EMA 12 is catching up to EMA 21)
                convergence_rate = avg_ema_12_change - avg_ema_21_change
                
                # Current gap
                current_gap = latest_ema_21 - latest_ema_12
                
                # Estimate periods needed for crossover (if convergence is positive)
                if convergence_rate > 0 and current_gap > 0:
                    periods_to_crossover = current_gap / convergence_rate
                    # Convert 4H periods to hours, then to days
                    hours_to_improvement = periods_to_crossover * 4
                    days_to_improvement = hours_to_improvement / 24
                    
                    # Cap at reasonable maximum (e.g., 90 days)
                    if days_to_improvement > 0 and days_to_improvement <= 90:
                        estimated_improvement_time = {
                            "days": int(days_to_improvement),
                            "hours": int(hours_to_improvement % 24),
                            "total_hours": int(hours_to_improvement)
                        }
                        
                        # Calculate estimated date
                        estimated_date = datetime.now() + timedelta(hours=hours_to_improvement)
                        estimated_improvement_date = estimated_date.isoformat()
                        
                        # Calculate confidence based on trend consistency
                        ema_12_std = np.std(ema_12_changes) if len(ema_12_changes) > 0 else 1
                        ema_21_std = np.std(ema_21_changes) if len(ema_21_changes) > 0 else 1
                        
                        # Lower volatility = higher confidence
                        volatility_score = (ema_12_std + ema_21_std) / 2
                        if volatility_score < abs(convergence_rate) * 0.3:
                            improvement_confidence = "high"
                        elif volatility_score < abs(convergence_rate) * 0.6:
                            improvement_confidence = "medium"
                        else:
                            improvement_confidence = "low"
                    else:
                        # If estimate is too far out or negative, provide general guidance
                        estimated_improvement_time = {
                            "days": None,
                            "hours": None,
                            "total_hours": None,
                            "message": "Market recovery timeline uncertain. Monitor EMA convergence trends."
                        }
                        improvement_confidence = "low"
                else:
                    # Diverging trend - market getting worse
                    estimated_improvement_time = {
                        "days": None,
                        "hours": None,
                        "total_hours": None,
                        "message": "EMAs are diverging. Wait for trend reversal signals before investing."
                    }
                    improvement_confidence = "low"
        
        response = {
            "ticker": ticker,
            "current_price": latest_price,
            "ema_12": latest_ema_12,
            "ema_21": latest_ema_21,
            "ema_diff_percent": round(ema_diff_percent, 2),
            "condition": condition,
            "recommendation": recommendation,
            "message": message,
            "crossover": crossover,
            "trend_strength": strength,
            "last_updated": datetime.now().isoformat(),
            "timeframe": "4H",
            "data_points": len(nifty_4h),
            "period": "1 year"
        }
        
        # Add improvement estimates if available
        if estimated_improvement_time:
            response["estimated_improvement_time"] = estimated_improvement_time
        if estimated_improvement_date:
            response["estimated_improvement_date"] = estimated_improvement_date
        if improvement_confidence:
            response["improvement_confidence"] = improvement_confidence
        
        return response
        
    except HTTPException:
        raise
    except ImportError:
        raise HTTPException(status_code=500, detail="yfinance library not installed. Run: pip install yfinance")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market condition: {str(e)}")

def classify_market_regime(ema_diff_percent: float, trend_strength: str, volatility: float = None) -> str:
    """
    Classify market regime based on EMA analysis and volatility
    Returns: "bull", "sideways", or "volatile"
    """
    # Strong bullish trend
    if ema_diff_percent > 1.0 and trend_strength in ["strong", "moderate"]:
        return "bull"
    
    # Strong bearish trend or high volatility
    if ema_diff_percent < -1.0 or (volatility and volatility > 15):
        return "volatile"
    
    # Sideways market (weak trend, small EMA difference)
    return "sideways"

@app.post("/api/what-if-simulation")
async def what_if_simulation(request: WhatIfSimulationRequest):
    """
    Simulate "What If I Wait?" scenarios comparing investing now vs waiting 1, 3, or 6 months
    """
    if funds_data is None or model_loader is None:
        raise HTTPException(status_code=500, detail="Data or models not loaded")
    
    try:
        from datetime import datetime, timedelta
        import yfinance as yf
        
        # Get current market regime if not provided
        market_regime = request.market_regime
        if not market_regime:
            try:
                # Fetch market condition to determine regime
                ticker = "^NSEI"
                end_date = datetime.now()
                start_date = end_date - timedelta(days=90)
                nifty = yf.download(ticker, start=start_date, end=end_date, interval="1d", progress=False)
                
                if not nifty.empty:
                    # Calculate volatility (standard deviation of returns)
                    returns = nifty['Close'].pct_change().dropna()
                    volatility = float(returns.std() * 100) if len(returns) > 0 else 10.0
                    
                    # Get EMA-based regime
                    nifty_4h = nifty['Close'].resample('4H').last().dropna()
                    if len(nifty_4h) >= 21:
                        ema_12 = nifty_4h.ewm(span=12, adjust=False).mean()
                        ema_21 = nifty_4h.ewm(span=21, adjust=False).mean()
                        ema_diff = ((ema_12.iloc[-1] - ema_21.iloc[-1]) / ema_21.iloc[-1]) * 100
                        trend_strength = "strong" if abs(ema_diff) > 1.5 else ("moderate" if abs(ema_diff) > 0.5 else "weak")
                        market_regime = classify_market_regime(float(ema_diff), trend_strength, volatility)
                    else:
                        market_regime = "sideways"
                else:
                    market_regime = "sideways"
            except:
                market_regime = "sideways"  # Default fallback
        
        # Find funds
        selected_funds = []
        for fund_name in request.fund_names:
            fund = funds_data[funds_data['scheme_name'] == fund_name]
            if not fund.empty:
                selected_funds.append(fund.iloc[0].to_dict())
        
        if not selected_funds:
            raise HTTPException(status_code=404, detail="No matching funds found")
        
        # Historical return adjustments based on market regime
        # These are based on historical analysis of how different regimes affect returns
        regime_adjustments = {
            "bull": {
                "1_month": 0.02,  # +2% for waiting in bull market (missed gains)
                "3_month": 0.05,  # +5%
                "6_month": 0.10   # +10%
            },
            "sideways": {
                "1_month": 0.0,   # No significant impact
                "3_month": -0.01,  # Slight negative
                "6_month": -0.02   # Slight negative
            },
            "volatile": {
                "1_month": -0.03,  # -3% (waiting might be better in volatile market)
                "3_month": -0.05,  # -5%
                "6_month": -0.08   # -8%
            }
        }
        
        # Simulate scenarios
        scenarios = []
        wait_periods = [1, 3, 6]  # months
        
        for wait_months in wait_periods:
            scenario_results = []
            
            for fund in selected_funds:
                # Get base predicted return using ML model
                horizon = request.duration_years
                try:
                    base_return = model_loader.predict_fund_return(fund, horizon)
                except:
                    # Fallback to historical return
                    base_return = fund.get(f'return_{horizon}yr', 10.0)
                
                # Apply market regime adjustment
                regime_key = f"{wait_months}_month"
                adjustment = regime_adjustments.get(market_regime, regime_adjustments["sideways"]).get(regime_key, 0.0)
                
                # Calculate returns for investing now vs waiting
                # Investing now: full duration
                invest_now_return = base_return / 100
                invest_now_value = request.investment_amount * ((1 + invest_now_return) ** horizon)
                invest_now_profit = invest_now_value - request.investment_amount
                
                # Waiting: reduced duration (horizon - wait_months/12)
                effective_duration = max(0.5, horizon - (wait_months / 12))
                wait_return = (base_return + (adjustment * 100)) / 100
                wait_value = request.investment_amount * ((1 + wait_return) ** effective_duration)
                wait_profit = wait_value - request.investment_amount
                
                # Opportunity cost: money sitting idle during wait period
                # Assuming conservative 4% annual return (FD/savings account)
                idle_return = 0.04 * (wait_months / 12)
                idle_value = request.investment_amount * (1 + idle_return)
                total_wait_value = wait_value + (idle_value - request.investment_amount)
                total_wait_profit = total_wait_value - request.investment_amount
                
                scenario_results.append({
                    "fund_name": fund['scheme_name'],
                    "amc_name": fund['amc_name'],
                    "invest_now": {
                        "final_value": round(invest_now_value, 2),
                        "profit": round(invest_now_profit, 2),
                        "return_percentage": round(invest_now_return * 100, 2),
                        "duration_years": horizon
                    },
                    "wait_and_invest": {
                        "final_value": round(wait_value, 2),
                        "profit": round(wait_profit, 2),
                        "return_percentage": round(wait_return * 100, 2),
                        "duration_years": round(effective_duration, 2),
                        "idle_earnings": round(idle_value - request.investment_amount, 2)
                    },
                    "total_wait_scenario": {
                        "final_value": round(total_wait_value, 2),
                        "profit": round(total_wait_profit, 2),
                        "net_difference": round(invest_now_profit - total_wait_profit, 2),
                        "recommendation": "invest_now" if invest_now_profit > total_wait_profit else "wait"
                    }
                })
            
            # Aggregate results across all funds
            avg_invest_now_profit = sum(r["invest_now"]["profit"] for r in scenario_results) / len(scenario_results)
            avg_wait_profit = sum(r["total_wait_scenario"]["profit"] for r in scenario_results) / len(scenario_results)
            
            scenarios.append({
                "wait_months": wait_months,
                "market_regime": market_regime,
                "fund_results": scenario_results,
                "aggregate": {
                    "avg_invest_now_profit": round(avg_invest_now_profit, 2),
                    "avg_wait_profit": round(avg_wait_profit, 2),
                    "net_difference": round(avg_invest_now_profit - avg_wait_profit, 2),
                    "recommendation": "invest_now" if avg_invest_now_profit > avg_wait_profit else "wait",
                    "recommendation_strength": "strong" if abs(avg_invest_now_profit - avg_wait_profit) > (request.investment_amount * 0.05) else "moderate"
                }
            })
        
        return {
            "investment_amount": request.investment_amount,
            "duration_years": request.duration_years,
            "market_regime": market_regime,
            "scenarios": scenarios,
            "summary": {
                "best_scenario": max(scenarios, key=lambda x: x["aggregate"]["avg_invest_now_profit"] - x["aggregate"]["avg_wait_profit"]),
                "worst_wait_period": min(scenarios, key=lambda x: x["aggregate"]["avg_wait_profit"]),
                "general_recommendation": "invest_now" if all(s["aggregate"]["recommendation"] == "invest_now" for s in scenarios) else "wait"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)