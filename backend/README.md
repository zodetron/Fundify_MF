# Mutual Fund AI Backend

AI-powered mutual fund recommendation system with 96.4% accuracy.

## Quick Start

```bash
pip install -r requirements.txt
python run.py
```

Server runs on http://localhost:8000

## Features

- AI recommendations based on AMC, category, amount, and tenure
- 789 mutual funds from 39 AMCs
- Machine learning models with high accuracy
- RESTful API with 10+ endpoints

## API Endpoints

- `POST /api/recommend` - Get AI recommendations
- `GET /api/dashboard-data` - Market overview
- `GET /api/market-trends` - Market analysis
- `POST /api/funds` - Search funds
- `GET /api/top-performers` - Top funds

## Tech Stack

- FastAPI
- Scikit-learn
- Pandas
- Gradient Boosting & Extra Trees models