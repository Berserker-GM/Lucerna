"""
Alternative data download script with better error handling.
Uses yfinance with improved retry logic and user agent headers.
"""

import sys
from pathlib import Path
import pandas as pd
from datetime import datetime
import time
from loguru import logger

# Add src to path
sys.path.append(str(Path(__file__).parent.parent))

from src.data import TimeSeriesStorage, MetadataDatabase
from src.utils import setup_logging, ensure_dir

# Import yfinance directly
import yfinance as yf


def download_stock_data(ticker: str, start_date: str, end_date: str = None):
    """
    Download stock data using yfinance with retry logic.
    
    Args:
        ticker: Stock ticker symbol
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD), defaults to today
        
    Returns:
        DataFrame with stock data or None
    """
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempt {attempt + 1}/{max_retries} for {ticker}")
            
            # Create ticker object with custom session
            stock = yf.Ticker(ticker)
            
            # Download historical data
            df = stock.history(
                start=start_date,
                end=end_date or datetime.now().strftime('%Y-%m-%d'),
                interval='1d',
                auto_adjust=True,  # Adjust for splits/dividends
                actions=False
            )
            
            if df.empty:
                logger.warning(f"No data returned for {ticker}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                return None
            
            # Standardize column names
            df = df.rename(columns={
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Volume': 'volume'
            })
            
            # Select relevant columns
            df = df[['open', 'high', 'low', 'close', 'volume']]
            
            # Add ticker column
            df['ticker'] = ticker
            
            # Reset index to make date a column
            df = df.reset_index()
            df = df.rename(columns={'Date': 'date'})
            
            # Ensure date is datetime
            df['date'] = pd.to_datetime(df['date'])
            
            logger.info(f"✓ Successfully fetched {len(df)} rows for {ticker}")
            return df
            
        except Exception as e:
            logger.error(f"Error on attempt {attempt + 1} for {ticker}: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                return None
    
    return None


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Download stock data (alternative method)')
    parser.add_argument('--tickers', nargs='+', required=True, help='List of ticker symbols')
    parser.add_argument('--start', required=True, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end', help='End date (YYYY-MM-DD), defaults to today')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging()
    
    # Initialize storage
    storage = TimeSeriesStorage()
    db = MetadataDatabase()
    
    logger.info(f"Starting data download for {len(args.tickers)} tickers")
    logger.info(f"Date range: {args.start} to {args.end or 'today'}")
    
    success_count = 0
    failed_tickers = []
    
    for i, ticker in enumerate(args.tickers, 1):
        logger.info(f"\n[{i}/{len(args.tickers)}] Processing {ticker}...")
        
        try:
            # Download data
            df = download_stock_data(ticker, args.start, args.end)
            
            if df is None or df.empty:
                logger.warning(f"✗ No data found for {ticker}")
                failed_tickers.append(ticker)
                continue
            
            # Save to storage
            storage.save(ticker, df)
            
            # Update metadata
            db.update_data_stats(
                ticker=ticker,
                start_date=df['date'].min().strftime('%Y-%m-%d'),
                end_date=df['date'].max().strftime('%Y-%m-%d'),
                num_records=len(df)
            )
            
            success_count += 1
            logger.info(f"✓ Successfully saved {len(df)} records for {ticker}")
            
            # Small delay between requests
            time.sleep(0.5)
            
        except Exception as e:
            logger.error(f"✗ Error processing {ticker}: {e}")
            failed_tickers.append(ticker)
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("Download complete!")
    logger.info(f"Successful: {success_count}/{len(args.tickers)}")
    logger.info(f"Failed: {len(failed_tickers)}/{len(args.tickers)}")
    
    if failed_tickers:
        logger.warning(f"Failed tickers: {', '.join(failed_tickers)}")
    
    if success_count > 0:
        logger.info(f"\nData saved to: data/timeseries/")
        logger.info("You can now run: python scripts/example_complete.py")


if __name__ == '__main__':
    main()
