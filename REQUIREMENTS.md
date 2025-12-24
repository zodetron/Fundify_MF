# TechNEX-HK17 Project Requirements

## Backend Requirements (Python)

### Core Dependencies
```bash
fastapi==0.104.1
uvicorn[standard]==0.24.0
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
xgboost==2.0.2
pydantic==2.5.0
python-multipart==0.0.6
matplotlib==3.7.2
seaborn==0.12.2
scipy==1.11.4
requests==2.31.0
yfinance==0.2.28
```

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Python Version
- **Python 3.8+** (recommended: Python 3.10 or 3.11)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended for ML model loading)
- **Disk Space**: ~500MB for dependencies + model files
- **OS**: Windows/Linux/macOS

### Data Files Required
- `backend/data/mutual_funds_cleaned.csv` - Mutual fund dataset
- `backend/models/complete_mutual_fund_system.pkl` - Main ML model
- `backend/models/mutual_fund_model_return_1yr.pkl` - 1-year return model
- `backend/models/mutual_fund_model_return_3yr.pkl` - 3-year return model
- `backend/models/mutual_fund_model_return_5yr.pkl` - 5-year return model

### Environment Variables
- `HOST` (optional, default: "0.0.0.0")
- `PORT` (optional, default: 8000)
- `RELOAD` (optional, default: "true")

### API Endpoints
- `GET /` - Health check
- `GET /api/amcs` - Get all AMC names
- `GET /api/categories` - Get all fund categories
- `POST /api/funds` - Filter funds
- `POST /api/recommend` - Get AI recommendations
- `POST /api/forecast` - Get fund forecast
- `POST /api/compare-funds` - Compare multiple funds
- `GET /api/market-trends` - Market trends analysis
- `GET /api/top-performers` - Top performing funds
- `GET /api/dashboard-data` - Dashboard summary
- `GET /api/descriptive-analysis` - Descriptive statistics
- `GET /api/enhanced-analysis` - Enhanced analysis with correlations
- `GET /api/market-condition` - Nifty 50 EMA analysis
- `POST /api/what-if-simulation` - What If I Wait simulation

### Running Backend
```bash
cd backend
python run.py
# Or
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Frontend Requirements (Next.js/React)

### Core Dependencies
```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "lucide-react": "^0.562.0",
    "next": "16.0.10",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "recharts": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.0.10",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### Installation
```bash
cd frontend
npm install
# Or
npm install --legacy-peer-deps  # If peer dependency issues occur
```

### Node.js Version
- **Node.js 18+** (recommended: Node.js 20 LTS)
- **npm 9+** or **yarn 1.22+** or **pnpm 8+**

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Disk Space**: ~500MB for node_modules
- **OS**: Windows/Linux/macOS

### Environment Variables
Create `.env.local` in `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Key Features & Pages
- `/` - Home page
- `/dashboard` - Market analytics dashboard
- `/recommend` - AI-powered fund recommendations
- `/analysis` - Advanced statistical analysis
- `/funds` - Fund explorer
- `/what-if` - What If I Wait simulation

### Running Frontend
```bash
cd frontend
npm run dev
# Server runs on http://localhost:3000
```

### Build for Production
```bash
cd frontend
npm run build
npm start
```

---

## Additional Setup Requirements

### shadcn/ui Configuration
- Already configured via `frontend/components.json`
- Components location: `frontend/src/components/ui/`
- Uses Tailwind CSS 4 with custom theme

### Tailwind CSS 4
- Configured in `frontend/src/app/globals.css`
- Uses `@import "tailwindcss"` syntax
- Custom theme variables defined
- Dark mode support via ThemeContext

### TypeScript Configuration
- TypeScript 5.x
- Strict mode enabled
- Path aliases configured (`@/*` → `./src/*`)

### Theme System
- Light/Dark theme toggle
- ThemeContext provider in layout
- Theme persisted in localStorage
- All components are theme-aware

---

## Development Workflow

### 1. Start Backend
```bash
cd backend
python run.py
# Backend runs on http://localhost:8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Access Application
- Open browser: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`

---

## Troubleshooting

### Backend Issues
- **Model loading errors**: Ensure all `.pkl` files are in `backend/models/`
- **yfinance errors**: Check internet connection for market data
- **Port conflicts**: Change PORT in environment or `run.py`

### Frontend Issues
- **API connection errors**: Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- **Build errors**: Clear `.next` folder and rebuild
- **Type errors**: Run `npm run lint` to check TypeScript issues

### Common Fixes
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Backend: Reinstall Python packages
cd backend
pip install --upgrade -r requirements.txt
```

---

## Project Structure

```
TechNEX-HK17/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── diversified_portfolio_system.py
│   │   └── model_loader_utility.py
│   ├── data/
│   │   └── mutual_funds_cleaned.csv
│   ├── models/
│   │   └── *.pkl files
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js app router pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utilities & API client
│   │   └── contexts/            # React contexts
│   ├── package.json
│   └── components.json          # shadcn config
└── README.md
```

---

## API Integration

### Frontend → Backend Communication
- Base URL: `http://localhost:8000` (development)
- All API calls via `frontend/src/lib/api.ts`
- CORS enabled for `localhost:3000`

### Authentication
- Currently no authentication required
- All endpoints are public

---

## Notes

- **Market Data**: Requires internet connection for yfinance API calls
- **ML Models**: Pre-trained models must be present in `backend/models/`
- **Data Updates**: CSV data file should be updated periodically for accuracy
- **Performance**: First API call may be slow due to model loading

