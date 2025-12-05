"""
Complete example: Train a model and make predictions for a stock.
This demonstrates the full pipeline from data loading to prediction.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
import torch
from loguru import logger

# Add src to path
sys.path.append(str(Path(__file__).parent.parent))

from src.config import config
from src.data import TimeSeriesStorage, MetadataDatabase
from src.features import TechnicalIndicators
from src.models import LSTMModel
from src.training import ModelTrainer, create_data_loaders
from src.prediction import PricePredictor, PredictionGraphGenerator
from src.utils import setup_logging, create_sequences, train_val_test_split


def prepare_data(ticker: str, sequence_length: int = 60):
    """
    Prepare data for training.
    
    Args:
        ticker: Stock ticker
        sequence_length: Sequence length for LSTM
        
    Returns:
        Tuple of (X_train, y_train, X_val, y_val, X_test, y_test, scaler, last_sequence, dates)
    """
    logger.info(f"Loading data for {ticker}...")
    
    # Load data
    storage = TimeSeriesStorage()
    df = storage.load(ticker)
    
    if df is None or df.empty:
        raise ValueError(f"No data found for {ticker}")
    
    logger.info(f"Loaded {len(df)} records")
    
    # Add technical indicators
    logger.info("Computing technical indicators...")
    tech_indicators = TechnicalIndicators(df)
    df = tech_indicators.add_all_indicators()
    
    # Drop NaN values
    df = df.dropna()
    logger.info(f"After dropping NaN: {len(df)} records")
    
    # Select features
    feature_cols = [col for col in df.columns if col not in ['date', 'ticker']]
    target_col = 'close'
    
    # Prepare features and target
    features = df[feature_cols].values
    target = df[target_col].values
    dates = df['date'].values
    
    # Normalize features
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # Create sequences
    X, y = create_sequences(features_scaled, sequence_length, target_column=feature_cols.index(target_col))
    
    logger.info(f"Created {len(X)} sequences of length {sequence_length}")
    
    # Split data
    train_size = int(len(X) * config.train_split)
    val_size = int(len(X) * config.val_split)
    
    X_train = X[:train_size]
    y_train = y[:train_size]
    X_val = X[train_size:train_size+val_size]
    y_val = y[train_size:train_size+val_size]
    X_test = X[train_size+val_size:]
    y_test = y[train_size+val_size:]
    
    # Get last sequence for prediction
    last_sequence = features_scaled[-sequence_length:]
    
    logger.info(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    return X_train, y_train, X_val, y_val, X_test, y_test, scaler, last_sequence, dates, df


def train_model(ticker: str, X_train, y_train, X_val, y_val):
    """
    Train LSTM model.
    
    Args:
        ticker: Stock ticker
        X_train: Training features
        y_train: Training labels
        X_val: Validation features
        y_val: Validation labels
        
    Returns:
        Trained model
    """
    logger.info("Initializing model...")
    
    # Model parameters
    input_size = X_train.shape[2]
    hidden_size = config.lstm_config['hidden_size']
    num_layers = config.lstm_config['num_layers']
    dropout = config.lstm_config['dropout']
    bidirectional = config.lstm_config['bidirectional']
    
    # Create model
    model = LSTMModel(
        input_size=input_size,
        hidden_size=hidden_size,
        num_layers=num_layers,
        dropout=dropout,
        bidirectional=bidirectional
    )
    
    # Create data loaders
    train_loader, val_loader = create_data_loaders(
        X_train, y_train, X_val, y_val,
        batch_size=config.batch_size
    )
    
    # Create trainer
    trainer = ModelTrainer(
        model=model,
        device=config.device,
        learning_rate=config.learning_rate,
        checkpoint_dir=f"models/{ticker}"
    )
    
    # Train
    logger.info("Starting training...")
    history = trainer.train(
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=config.epochs,
        patience=10,
        save_best_only=True
    )
    
    return trainer.model, trainer


def make_predictions(ticker: str, model, last_sequence, scaler, df):
    """
    Make future predictions.
    
    Args:
        ticker: Stock ticker
        model: Trained model
        last_sequence: Last sequence of features
        scaler: Feature scaler
        df: Original dataframe
        
    Returns:
        Prediction results and graph path
    """
    logger.info("Making predictions...")
    
    # Create predictor
    predictor = PricePredictor(model, scaler)
    
    # Predict future prices
    horizon = 30  # 30 days ahead
    predictions = predictor.predict_future(
        last_sequence=last_sequence,
        horizon=horizon,
        confidence_level=0.95
    )
    
    # Generate prediction dates
    last_date = df['date'].iloc[-1]
    prediction_dates = [last_date + timedelta(days=i+1) for i in range(horizon)]
    
    # Get historical data for plotting
    historical_dates = df['date'].tail(60).tolist()
    historical_prices = df['close'].tail(60).tolist()
    
    # Generate graph
    logger.info("Generating prediction graph...")
    graph_gen = PredictionGraphGenerator(output_dir="graphs")
    
    graph_path = graph_gen.plot_prediction(
        ticker=ticker,
        historical_dates=historical_dates,
        historical_prices=historical_prices,
        prediction_dates=prediction_dates,
        predictions=predictions['predictions'],
        lower_bounds=predictions['lower_bounds'],
        upper_bounds=predictions['upper_bounds'],
        confidence_level=predictions['confidence_level']
    )
    
    logger.info(f"Graph saved to: {graph_path}")
    
    # Print predictions
    print("\n" + "="*60)
    print(f"PREDICTIONS FOR {ticker}")
    print("="*60)
    print(f"Current Price: ${historical_prices[-1]:.2f}")
    print(f"\nPredictions for next {horizon} days:")
    print("-"*60)
    
    for i, (date, pred, lower, upper) in enumerate(zip(
        prediction_dates[:10],  # Show first 10 days
        predictions['predictions'][:10],
        predictions['lower_bounds'][:10],
        predictions['upper_bounds'][:10]
    ), 1):
        print(f"Day {i} ({date.strftime('%Y-%m-%d')}): ${pred:.2f} (${lower:.2f} - ${upper:.2f})")
    
    print("="*60)
    
    return predictions, graph_path


def main():
    """Main function."""
    setup_logging()
    
    # Example ticker
    ticker = "AAPL"  # Change this to any ticker you've downloaded
    
    logger.info(f"Starting complete example for {ticker}")
    
    try:
        # Step 1: Prepare data
        X_train, y_train, X_val, y_val, X_test, y_test, scaler, last_sequence, dates, df = prepare_data(ticker)
        
        # Step 2: Train model
        model, trainer = train_model(ticker, X_train, y_train, X_val, y_val)
        
        # Step 3: Evaluate on test set
        logger.info("Evaluating on test set...")
        test_predictions = trainer.predict(X_test)
        test_mae = np.mean(np.abs(test_predictions.flatten() - y_test))
        test_rmse = np.sqrt(np.mean((test_predictions.flatten() - y_test) ** 2))
        
        logger.info(f"Test MAE: {test_mae:.4f}")
        logger.info(f"Test RMSE: {test_rmse:.4f}")
        
        # Step 4: Make future predictions
        predictions, graph_path = make_predictions(ticker, model, last_sequence, scaler, df)
        
        logger.info("Example complete!")
        logger.info(f"Check the graph at: {graph_path}")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        raise


if __name__ == '__main__':
    main()
