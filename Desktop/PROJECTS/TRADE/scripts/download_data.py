"""
Script to download historical stock data.
Downloads data for specified tickers or stock universe (S&P 500, NASDAQ 100).
"""

import sys
import argparse
from pathlib import Path
from datetime import datetime
from loguru import logger

# Add src to path
sys.path.append(str(Path(__file__).parent.parent))

from src.config import config
from src.data import MultiSourceCollector, TimeSeriesStorage, MetadataDatabase
from src.utils import get_sp500_tickers, get_nasdaq100_tickers, setup_logging


def download_data(tickers: list, start_date: str, end_date: str = None, interval: str = '1d'):
    """
    Download historical data for tickers.
    
    Args:
        tickers: List of ticker symbols
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD), defaults to today
        interval: Data interval
    """
    # Initialize components
    collector = MultiSourceCollector()
    storage = TimeSeriesStorage()
    db = MetadataDatabase()
    
    logger.info(f"Starting data download for {len(tickers)} tickers")
    logger.info(f"Date range: {start_date} to {end_date or 'today'}")
    
    success_count = 0
    failed_tickers = []
    
    for i, ticker in enumerate(tickers, 1):
        logger.info(f"[{i}/{len(tickers)}] Processing {ticker}...")
        
        try:
            # Fetch data
            df = collector.fetch_ohlcv(ticker, start_date, end_date, interval)
            
            if df is None or df.empty:
                logger.warning(f"No data found for {ticker}")
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
            
        except Exception as e:
            logger.error(f"✗ Error processing {ticker}: {e}")
            failed_tickers.append(ticker)
    
    # Summary
    logger.info("=" * 60)
    logger.info(f"Download complete!")
    logger.info(f"Successful: {success_count}/{len(tickers)}")
    logger.info(f"Failed: {len(failed_tickers)}/{len(tickers)}")
    
    if failed_tickers:
        logger.warning(f"Failed tickers: {', '.join(failed_tickers)}")


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description='Download historical stock data')
    
    parser.add_argument('--tickers', nargs='+', help='List of ticker symbols')
    parser.add_argument('--universe', choices=['sp500', 'nasdaq100'], 
                       help='Download entire stock universe')
    parser.add_argument('--start', required=True, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end', help='End date (YYYY-MM-DD), defaults to today')
    parser.add_argument('--interval', default='1d', 
                       choices=['1d', '1h', '15m', '5m', '1m'],
                       help='Data interval')
    parser.add_argument('--limit', type=int, help='Limit number of tickers (for testing)')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging()
    
    # Get tickers
    if args.universe:
        logger.info(f"Fetching {args.universe} tickers...")
        if args.universe == 'sp500':
            tickers = get_sp500_tickers()
        else:
            tickers = get_nasdaq100_tickers()
    elif args.tickers:
        tickers = args.tickers
    else:
        parser.error("Must specify either --tickers or --universe")
        return
    
    # Apply limit if specified
    if args.limit:
        tickers = tickers[:args.limit]
        logger.info(f"Limited to {args.limit} tickers")
    
    # Download data
    download_data(tickers, args.start, args.end, args.interval)


if __name__ == '__main__':
    main()
