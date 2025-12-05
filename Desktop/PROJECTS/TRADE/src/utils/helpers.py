"""
Utility functions for the stock prediction system.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from pathlib import Path
import logging
from loguru import logger


def setup_logging(log_file: str = "logs/app.log", level: str = "INFO"):
    """
    Set up logging configuration.
    
    Args:
        log_file: Path to log file
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    # Create logs directory if it doesn't exist
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Configure loguru
    logger.add(
        log_file,
        rotation="1 day",
        retention="30 days",
        level=level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
    )
    
    return logger


def get_sp500_tickers() -> List[str]:
    """
    Get list of S&P 500 stock tickers.
    
    Returns:
        List of ticker symbols
    """
    try:
        # Read from Wikipedia
        url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
        tables = pd.read_html(url)
        df = tables[0]
        tickers = df['Symbol'].tolist()
        
        # Clean tickers (replace dots with dashes for Yahoo Finance)
        tickers = [ticker.replace('.', '-') for ticker in tickers]
        
        logger.info(f"Retrieved {len(tickers)} S&P 500 tickers")
        return tickers
    except Exception as e:
        logger.error(f"Error fetching S&P 500 tickers: {e}")
        # Return a fallback list of major stocks
        return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'JPM', 'V']


def get_nasdaq100_tickers() -> List[str]:
    """
    Get list of NASDAQ 100 stock tickers.
    
    Returns:
        List of ticker symbols
    """
    try:
        url = 'https://en.wikipedia.org/wiki/Nasdaq-100'
        tables = pd.read_html(url)
        df = tables[4]  # The ticker table is usually the 5th table
        tickers = df['Ticker'].tolist()
        
        logger.info(f"Retrieved {len(tickers)} NASDAQ 100 tickers")
        return tickers
    except Exception as e:
        logger.error(f"Error fetching NASDAQ 100 tickers: {e}")
        # Return a fallback list
        return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'ADBE', 'INTC']


def validate_ticker(ticker: str) -> bool:
    """
    Validate if a ticker symbol is valid.
    
    Args:
        ticker: Stock ticker symbol
        
    Returns:
        True if valid, False otherwise
    """
    # Basic validation
    if not ticker or not isinstance(ticker, str):
        return False
    
    # Check format (letters, numbers, and hyphens only)
    if not all(c.isalnum() or c == '-' for c in ticker):
        return False
    
    # Length check (most tickers are 1-5 characters)
    if len(ticker) < 1 or len(ticker) > 6:
        return False
    
    return True


def calculate_returns(prices: pd.Series, periods: int = 1) -> pd.Series:
    """
    Calculate returns for a price series.
    
    Args:
        prices: Price series
        periods: Number of periods for return calculation
        
    Returns:
        Returns series
    """
    return prices.pct_change(periods=periods)


def calculate_log_returns(prices: pd.Series, periods: int = 1) -> pd.Series:
    """
    Calculate log returns for a price series.
    
    Args:
        prices: Price series
        periods: Number of periods for return calculation
        
    Returns:
        Log returns series
    """
    return np.log(prices / prices.shift(periods))


def calculate_volatility(returns: pd.Series, window: int = 20) -> pd.Series:
    """
    Calculate rolling volatility (annualized).
    
    Args:
        returns: Returns series
        window: Rolling window size
        
    Returns:
        Volatility series
    """
    return returns.rolling(window=window).std() * np.sqrt(252)


def normalize_data(data: pd.DataFrame, method: str = 'zscore') -> pd.DataFrame:
    """
    Normalize data using specified method.
    
    Args:
        data: DataFrame to normalize
        method: Normalization method ('zscore', 'minmax', 'robust')
        
    Returns:
        Normalized DataFrame
    """
    if method == 'zscore':
        return (data - data.mean()) / data.std()
    elif method == 'minmax':
        return (data - data.min()) / (data.max() - data.min())
    elif method == 'robust':
        median = data.median()
        q75, q25 = data.quantile(0.75), data.quantile(0.25)
        iqr = q75 - q25
        return (data - median) / iqr
    else:
        raise ValueError(f"Unknown normalization method: {method}")


def create_sequences(data: np.ndarray, sequence_length: int, 
                     target_column: int = 0) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create sequences for time-series modeling.
    
    Args:
        data: Input data array (samples, features)
        sequence_length: Length of input sequences
        target_column: Index of target column
        
    Returns:
        Tuple of (X, y) arrays
    """
    X, y = [], []
    
    for i in range(len(data) - sequence_length):
        X.append(data[i:i + sequence_length])
        y.append(data[i + sequence_length, target_column])
    
    return np.array(X), np.array(y)


def train_val_test_split(data: pd.DataFrame, 
                         train_ratio: float = 0.7,
                         val_ratio: float = 0.15,
                         test_ratio: float = 0.15) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Split time-series data into train, validation, and test sets.
    
    Args:
        data: Input DataFrame
        train_ratio: Training set ratio
        val_ratio: Validation set ratio
        test_ratio: Test set ratio
        
    Returns:
        Tuple of (train, val, test) DataFrames
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-6, "Ratios must sum to 1.0"
    
    n = len(data)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))
    
    train = data.iloc[:train_end]
    val = data.iloc[train_end:val_end]
    test = data.iloc[val_end:]
    
    return train, val, test


def get_trading_days(start_date: str, end_date: Optional[str] = None) -> List[datetime]:
    """
    Get list of trading days between start and end dates.
    
    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD), defaults to today
        
    Returns:
        List of trading day dates
    """
    from pandas.tseries.offsets import BDay
    
    start = pd.to_datetime(start_date)
    end = pd.to_datetime(end_date) if end_date else pd.Timestamp.now()
    
    # Generate business days
    trading_days = pd.bdate_range(start=start, end=end)
    
    return trading_days.to_pydatetime().tolist()


def ensure_dir(path: str) -> Path:
    """
    Ensure directory exists, create if it doesn't.
    
    Args:
        path: Directory path
        
    Returns:
        Path object
    """
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def format_large_number(num: float) -> str:
    """
    Format large numbers with K, M, B suffixes.
    
    Args:
        num: Number to format
        
    Returns:
        Formatted string
    """
    if abs(num) >= 1e9:
        return f"{num/1e9:.2f}B"
    elif abs(num) >= 1e6:
        return f"{num/1e6:.2f}M"
    elif abs(num) >= 1e3:
        return f"{num/1e3:.2f}K"
    else:
        return f"{num:.2f}"


def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """
    Calculate Sharpe ratio.
    
    Args:
        returns: Returns series
        risk_free_rate: Annual risk-free rate
        
    Returns:
        Sharpe ratio
    """
    excess_returns = returns - risk_free_rate / 252  # Daily risk-free rate
    return np.sqrt(252) * excess_returns.mean() / excess_returns.std()


def calculate_max_drawdown(prices: pd.Series) -> float:
    """
    Calculate maximum drawdown.
    
    Args:
        prices: Price series
        
    Returns:
        Maximum drawdown (as decimal)
    """
    cumulative = (1 + prices.pct_change()).cumprod()
    running_max = cumulative.expanding().max()
    drawdown = (cumulative - running_max) / running_max
    return drawdown.min()
