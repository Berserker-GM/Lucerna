# 🚀 AI Stock Price Prediction System

An advanced AI/ML system that predicts future stock prices for **all stocks** with high accuracy, generates future price graphs, and provides confidence intervals.

## 🎯 Features

- **Multi-Stock Support**: Predict prices for any stock (S&P 500, NASDAQ, custom tickers)
- **Advanced AI Models**: LSTM, Transformers, CNN-LSTM hybrid, and ensemble methods
- **Future Price Graphs**: Generate visual predictions with confidence intervals
- **Multi-Horizon Forecasting**: Predict 1-30 days ahead
- **Large Dataset Handling**: Efficient storage and processing of historical data
- **REST API**: Ready-to-use API for frontend integration
- **Real-time Updates**: WebSocket support for live predictions
- **Automated Retraining**: Keep models fresh with latest data

## 🏗️ Architecture

```
├── src/
│   ├── data/              # Data collection and storage
│   ├── features/          # Feature engineering
│   ├── models/            # AI/ML models (LSTM, Transformer, etc.)
│   ├── prediction/        # Prediction engine and graph generation
│   ├── api/               # FastAPI REST API
│   ├── training/          # Model training pipeline
│   └── utils/             # Utilities and helpers
├── data/                  # Data storage
├── models/                # Trained model checkpoints
├── scripts/               # Utility scripts
├── notebooks/             # Jupyter notebooks for analysis
└── tests/                 # Unit and integration tests
```

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
cd TRADE

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
# (Alpha Vantage key is required for data collection)
```

### 3. Download Data

```bash
# Download historical data for S&P 500 stocks
python scripts/download_data.py --universe sp500 --start 2010-01-01

# Or download specific stocks
python scripts/download_data.py --tickers AAPL GOOGL MSFT --start 2015-01-01
```

### 4. Train Models

```bash
# Train all models (LSTM, Transformer, Ensemble)
python scripts/train_models.py

# Train specific model
python scripts/train_models.py --model lstm --ticker AAPL
```

### 5. Start API Server

```bash
# Start FastAPI server
python -m src.api.main

# API will be available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

## 📊 API Endpoints

### Predict Stock Price

```bash
POST /api/v1/predict
{
  "ticker": "AAPL",
  "horizon": 10,  // days ahead
  "confidence_level": 0.95
}

Response:
{
  "ticker": "AAPL",
  "current_price": 185.50,
  "predictions": [
    {"day": 1, "price": 186.20, "lower": 184.50, "upper": 188.00},
    {"day": 2, "price": 187.10, "lower": 184.80, "upper": 189.50},
    ...
  ],
  "graph_url": "/api/v1/graph/AAPL_prediction_20231204.png",
  "confidence": 0.95,
  "model_accuracy": 0.78
}
```

### Get Prediction Graph

```bash
GET /api/v1/graph/{ticker}?horizon=10&confidence=0.95

Returns: PNG image of prediction graph
```

### Batch Prediction

```bash
POST /api/v1/predict/batch
{
  "tickers": ["AAPL", "GOOGL", "MSFT"],
  "horizon": 5
}
```

### Model Performance

```bash
GET /api/v1/models/performance/{ticker}

Response:
{
  "ticker": "AAPL",
  "accuracy": 0.78,
  "mae": 2.34,
  "rmse": 3.12,
  "sharpe_ratio": 1.45,
  "last_updated": "2023-12-04T10:30:00Z"
}
```

## 🧠 Models

### 1. LSTM (Long Short-Term Memory)
- Best for capturing long-term dependencies
- 3-layer bidirectional LSTM
- Sequence length: 60 days

### 2. Transformer
- Attention-based architecture
- Captures complex patterns
- 4 layers, 8 attention heads

### 3. CNN-LSTM Hybrid
- Combines pattern recognition (CNN) with sequence modeling (LSTM)
- Multi-scale feature extraction

### 4. Ensemble
- Combines all models with weighted averaging
- Typically achieves best performance

## 📈 Performance Metrics

The system tracks multiple metrics:
- **Accuracy**: Direction prediction accuracy
- **MAE**: Mean Absolute Error
- **RMSE**: Root Mean Squared Error
- **Sharpe Ratio**: Risk-adjusted returns
- **Calibration**: Confidence interval accuracy

## 🔧 Advanced Usage

### Custom Stock Universe

Edit `config.yaml`:
```yaml
data:
  universe:
    - "sp500"
    - "nasdaq100"
    # Or specify custom tickers:
    custom_tickers:
      - "AAPL"
      - "GOOGL"
      - "TSLA"
```

### Hyperparameter Optimization

```bash
# Run HPO with Optuna
python scripts/optimize_hyperparameters.py --model lstm --trials 50
```

### Model Monitoring

```bash
# Start MLflow UI
mlflow ui --port 5000

# View at http://localhost:5000
```

## 📝 Configuration

All configuration is in `config.yaml`. Key sections:

- `data`: Data sources, update frequency
- `features`: Technical indicators, timeframes
- `models`: Model architectures and hyperparameters
- `prediction`: Forecast horizons, confidence levels
- `training`: Batch size, epochs, optimization
- `api`: Server settings, CORS, rate limiting

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/

# Run specific test
pytest tests/test_models.py
```

## 📚 Documentation

- [Data Collection Guide](docs/data_collection.md)
- [Model Architecture](docs/models.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## ⚠️ Disclaimer

This system is for **educational and research purposes only**. Stock market predictions are inherently uncertain. Past performance does not guarantee future results. Always do your own research and consult with financial advisors before making investment decisions.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## 📧 Support

For issues and questions, please open a GitHub issue or contact the maintainers.

---

**Built with ❤️ using PyTorch, TensorFlow, FastAPI, and modern ML best practices**
