# Mutual Fund AI System

AI-powered mutual fund prediction and recommendation platform designed for middle-class investors, combining **machine learning** with **live market intelligence**.


## Key Features

- **AI-Driven Recommendations** with **96.7% R² score**
- **789 Mutual Funds** analyzed across **39 AMCs**
- **Live Market Prediction Engine** using current market conditions
- **What-If Investment Simulation** (invest now vs wait 3 / 6 months)
- **Professional Web Dashboard** with interactive charts & analytics
- **End-to-End Analysis** including correlations, risk, and diversification


## System Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js + TypeScript
- **Data Source**: Cleaned CSV dataset (789 funds)
- **ML Algorithms**:
  - Gradient Boosting (GBM)
  - Extra Trees Regressor


##  Machine Learning Approach

### Models Used

- **Gradient Boosting Regressor**
  - Best for **1-Year and 3-Year** investment horizons
  - Captures non-linear relationships in fund performance

- **Extra Trees Regressor**
  - Best for **5+ Year** long-term investments
  - Improves stability and reduces overfitting

### Model Performance

- **R² Score Achieved**: **96.7%**
- Trained on historical returns, volatility, expense ratio, fund size, AMC strength, and risk metrics
- Final models are serialized and served via FastAPI for real-time inference


## Live Market Prediction Engine

- Adapts predictions using **current market regimes**
  - Bullish / Sideways / Volatile
- Enhances recommendations with:
  - Market trend signals
  - Volatility indicators
  - Momentum-based adjustments
- Ensures predictions are **context-aware**, not purely historical


## “What If I Wait?” Simulation (Unique Feature)

A decision-intelligence module that answers:

> *Should I invest now, or wait 3–6 months?*

### How It Works

- Simulates delayed investment scenarios:
  - **Wait 3 months**
  - **Wait 6 months**
- Uses:
  - Historical rolling-window analysis
  - Current market conditions
  - ML-based future return projections

### Output

- Expected return difference (invest now vs wait)
- Risk-adjusted recommendation
- Optimal investment timing suggestion


## System Capabilities

- **Personalized Recommendations**
  - Based on AMC, fund category, investment amount, tenure, and risk tolerance
- **Market Dashboards**
  - Performance trends and AMC comparisons
- **Fund Comparison**
  - Side-by-side return and risk metrics
- **Portfolio Insights**
  - Diversification and risk assessment
- **Statistical Analysis**
  - Correlation matrices and analytical insights


## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Frontend
```
cd frontend
npm install
npm run dev
```
