"""
Train AI model on downloaded stock data.
Simple training script that works with CSV data.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Check if PyTorch is installed
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not installed yet. Installing now...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "torch==2.1.2", "torchvision==0.16.2"])
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

print("=" * 60)
print("🚀 AI Stock Price Prediction - Model Training")
print("=" * 60)


def load_data(ticker):
    """Load stock data from CSV."""
    csv_path = Path(f'data/csv/{ticker}.csv')
    
    if not csv_path.exists():
        raise FileNotFoundError(f"Data not found for {ticker}. Run download_simple.py first.")
    
    df = pd.read_csv(csv_path)
    print(f"\n✓ Loaded {len(df)} rows for {ticker}")
    return df


def create_features(df):
    """Create simple features."""
    print("📊 Creating features...")
    
    # Price features
    df['return_1d'] = df['close'].pct_change()
    df['return_5d'] = df['close'].pct_change(5)
    df['return_10d'] = df['close'].pct_change(10)
    
    # Moving averages
    df['sma_5'] = df['close'].rolling(5).mean()
    df['sma_20'] = df['close'].rolling(20).mean()
    df['sma_50'] = df['close'].rolling(50).mean()
    
    # Volatility
    df['volatility_20'] = df['return_1d'].rolling(20).std()
    
    # Volume features
    df['volume_ratio'] = df['volume'] / df['volume'].rolling(20).mean()
    
    # Drop NaN
    df = df.dropna()
    
    print(f"✓ Created features, {len(df)} rows after cleaning")
    return df


def prepare_sequences(data, sequence_length=30):
    """Create sequences for LSTM."""
    X, y = [], []
    
    for i in range(len(data) - sequence_length):
        X.append(data[i:i + sequence_length])
        y.append(data[i + sequence_length, 0])  # Predict close price
    
    return np.array(X), np.array(y)


class SimpleLSTM(nn.Module):
    """Simple LSTM model."""
    
    def __init__(self, input_size, hidden_size=64, num_layers=2):
        super(SimpleLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        out = self.fc(lstm_out[:, -1, :])
        return out


def train_model(ticker='AAPL', epochs=20, sequence_length=30):
    """Train model for a ticker."""
    
    # Load data
    df = load_data(ticker)
    df = create_features(df)
    
    # Select features
    feature_cols = ['close', 'open', 'high', 'low', 'volume', 
                   'return_1d', 'return_5d', 'return_10d',
                   'sma_5', 'sma_20', 'sma_50', 'volatility_20', 'volume_ratio']
    
    features = df[feature_cols].values
    
    # Normalize
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # Create sequences
    print(f"🔄 Creating sequences (length={sequence_length})...")
    X, y = prepare_sequences(features_scaled, sequence_length)
    
    # Split data
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print(f"✓ Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Convert to tensors
    X_train = torch.FloatTensor(X_train)
    y_train = torch.FloatTensor(y_train).unsqueeze(1)
    X_test = torch.FloatTensor(X_test)
    y_test = torch.FloatTensor(y_test).unsqueeze(1)
    
    # Create model
    print(f"\n🤖 Building LSTM model...")
    model = SimpleLSTM(input_size=len(feature_cols), hidden_size=64, num_layers=2)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # Train
    print(f"\n🏋️  Training for {epochs} epochs...")
    print("-" * 60)
    
    train_losses = []
    test_losses = []
    
    for epoch in range(epochs):
        # Training
        model.train()
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()
        
        # Evaluation
        model.eval()
        with torch.no_grad():
            test_outputs = model(X_test)
            test_loss = criterion(test_outputs, y_test)
        
        train_losses.append(loss.item())
        test_losses.append(test_loss.item())
        
        if (epoch + 1) % 5 == 0:
            print(f"Epoch {epoch+1}/{epochs} - Train Loss: {loss.item():.6f}, Test Loss: {test_loss.item():.6f}")
    
    print("-" * 60)
    print(f"✓ Training complete!")
    
    # Calculate accuracy
    model.eval()
    with torch.no_grad():
        predictions = model(X_test).numpy()
        actual = y_test.numpy()
        
        mae = np.mean(np.abs(predictions - actual))
        rmse = np.sqrt(np.mean((predictions - actual) ** 2))
        
        print(f"\n📈 Model Performance:")
        print(f"   MAE: {mae:.6f}")
        print(f"   RMSE: {rmse:.6f}")
    
    # Save model
    model_dir = Path('models')
    model_dir.mkdir(exist_ok=True)
    model_path = model_dir / f'{ticker}_model.pth'
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'scaler': scaler,
        'feature_cols': feature_cols,
        'sequence_length': sequence_length
    }, model_path)
    
    print(f"\n💾 Model saved to: {model_path}")
    
    # Plot training history
    plt.figure(figsize=(10, 5))
    plt.plot(train_losses, label='Train Loss')
    plt.plot(test_losses, label='Test Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.title(f'{ticker} - Training History')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    graph_dir = Path('graphs')
    graph_dir.mkdir(exist_ok=True)
    graph_path = graph_dir / f'{ticker}_training.png'
    plt.savefig(graph_path, dpi=150, bbox_inches='tight')
    print(f"📊 Training graph saved to: {graph_path}")
    
    return model, scaler


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train AI model on stock data')
    parser.add_argument('--ticker', default='AAPL', help='Stock ticker to train on')
    parser.add_argument('--epochs', type=int, default=20, help='Number of training epochs')
    parser.add_argument('--sequence', type=int, default=30, help='Sequence length')
    
    args = parser.parse_args()
    
    print(f"\n🎯 Training model for: {args.ticker}")
    print(f"   Epochs: {args.epochs}")
    print(f"   Sequence Length: {args.sequence}")
    
    try:
        model, scaler = train_model(
            ticker=args.ticker,
            epochs=args.epochs,
            sequence_length=args.sequence
        )
        
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Model trained and saved.")
        print("=" * 60)
        print("\n🚀 Next steps:")
        print("   1. Start API: python -m src.api.main")
        print("   2. Test predictions at: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
