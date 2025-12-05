"""
Simple stock data downloader - no dependencies on custom modules.
Run this directly to download stock data.
"""

import yfinance as yf
import pandas as pd
from pathlib import Path
from datetime import datetime
import time


def download_and_save(ticker, start_date, end_date=None):
    """Download and save stock data."""
    print(f"\n[{ticker}] Downloading data...")
    
    try:
        # Download data
        stock = yf.Ticker(ticker)
        df = stock.history(
            start=start_date,
            end=end_date or datetime.now().strftime('%Y-%m-%d'),
            interval='1d',
            auto_adjust=True
        )
        
        if df.empty:
            print(f"[{ticker}] ✗ No data found")
            return False
        
        # Prepare data
        df = df.rename(columns={
            'Open': 'open',
            'High': 'high',
            'Low': 'low',
            'Close': 'close',
            'Volume': 'volume'
        })
        df = df[['open', 'high', 'low', 'close', 'volume']]
        df['ticker'] = ticker
        df = df.reset_index()
        df = df.rename(columns={'Date': 'date'})
        
        # Save to CSV (simple format)
        output_dir = Path('data/csv')
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f'{ticker}.csv'
        df.to_csv(output_file, index=False)
        
        print(f"[{ticker}] ✓ Saved {len(df)} rows to {output_file}")
        return True
        
    except Exception as e:
        print(f"[{ticker}] ✗ Error: {e}")
        return False


def main():
    """Main function."""
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python download_simple.py TICKER1 TICKER2 ... START_DATE")
        print("Example: python download_simple.py AAPL GOOGL MSFT 2020-01-01")
        sys.exit(1)
    
    tickers = sys.argv[1:-1]
    start_date = sys.argv[-1]
    
    print(f"Downloading {len(tickers)} stocks from {start_date}")
    print("=" * 60)
    
    success = 0
    failed = []
    
    for ticker in tickers:
        if download_and_save(ticker, start_date):
            success += 1
        else:
            failed.append(ticker)
        time.sleep(0.5)  # Small delay between requests
    
    print("\n" + "=" * 60)
    print(f"Complete! Success: {success}/{len(tickers)}")
    if failed:
        print(f"Failed: {', '.join(failed)}")
    print(f"\nData saved to: data/csv/")


if __name__ == '__main__':
    main()
