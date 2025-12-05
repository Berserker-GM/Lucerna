"""
Model training module.
Handles training, validation, and model checkpointing.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from tqdm import tqdm
from loguru import logger

from ..config import config
from ..utils import ensure_dir


class ModelTrainer:
    """Model trainer with early stopping and checkpointing."""
    
    def __init__(self, model: nn.Module, device: str = 'cuda', learning_rate: float = 0.001,
                 checkpoint_dir: Optional[str] = None):
        """
        Initialize model trainer.
        
        Args:
            model: PyTorch model to train
            device: Device to train on ('cuda' or 'cpu')
            learning_rate: Learning rate
            checkpoint_dir: Directory to save checkpoints
        """
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        self.model = model.to(self.device)
        self.learning_rate = learning_rate
        
        # Optimizer and loss
        self.optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        self.criterion = nn.MSELoss()
        
        # Checkpointing
        self.checkpoint_dir = Path(checkpoint_dir or config.models_path)
        ensure_dir(self.checkpoint_dir)
        
        # Training history
        self.history = {
            'train_loss': [],
            'val_loss': [],
            'epochs': []
        }
        
        self.best_val_loss = float('inf')
        self.patience_counter = 0
        
        logger.info(f"Initialized trainer on device: {self.device}")
    
    def train_epoch(self, train_loader: DataLoader) -> float:
        """
        Train for one epoch.
        
        Args:
            train_loader: Training data loader
            
        Returns:
            Average training loss
        """
        self.model.train()
        total_loss = 0.0
        num_batches = 0
        
        for batch_x, batch_y in train_loader:
            batch_x = batch_x.to(self.device)
            batch_y = batch_y.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            outputs = self.model(batch_x)
            loss = self.criterion(outputs, batch_y)
            
            # Backward pass
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            num_batches += 1
        
        return total_loss / num_batches
    
    def validate(self, val_loader: DataLoader) -> float:
        """
        Validate model.
        
        Args:
            val_loader: Validation data loader
            
        Returns:
            Average validation loss
        """
        self.model.eval()
        total_loss = 0.0
        num_batches = 0
        
        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x = batch_x.to(self.device)
                batch_y = batch_y.to(self.device)
                
                outputs = self.model(batch_x)
                loss = self.criterion(outputs, batch_y)
                
                total_loss += loss.item()
                num_batches += 1
        
        return total_loss / num_batches
    
    def train(self, train_loader: DataLoader, val_loader: DataLoader,
              epochs: int = 100, patience: int = 10, min_delta: float = 0.0001,
              save_best_only: bool = True) -> Dict[str, Any]:
        """
        Train model with early stopping.
        
        Args:
            train_loader: Training data loader
            val_loader: Validation data loader
            epochs: Maximum number of epochs
            patience: Early stopping patience
            min_delta: Minimum improvement for early stopping
            save_best_only: Only save best model
            
        Returns:
            Training history dictionary
        """
        logger.info(f"Starting training for {epochs} epochs...")
        
        for epoch in range(epochs):
            # Train
            train_loss = self.train_epoch(train_loader)
            
            # Validate
            val_loss = self.validate(val_loader)
            
            # Update history
            self.history['train_loss'].append(train_loss)
            self.history['val_loss'].append(val_loss)
            self.history['epochs'].append(epoch + 1)
            
            # Log progress
            logger.info(f"Epoch {epoch+1}/{epochs} - Train Loss: {train_loss:.6f}, Val Loss: {val_loss:.6f}")
            
            # Check for improvement
            if val_loss < self.best_val_loss - min_delta:
                self.best_val_loss = val_loss
                self.patience_counter = 0
                
                if save_best_only:
                    self.save_checkpoint(epoch, val_loss, is_best=True)
            else:
                self.patience_counter += 1
            
            # Save checkpoint periodically
            if not save_best_only and (epoch + 1) % 5 == 0:
                self.save_checkpoint(epoch, val_loss, is_best=False)
            
            # Early stopping
            if self.patience_counter >= patience:
                logger.info(f"Early stopping triggered after {epoch+1} epochs")
                break
        
        logger.info(f"Training completed. Best val loss: {self.best_val_loss:.6f}")
        return self.history
    
    def save_checkpoint(self, epoch: int, val_loss: float, is_best: bool = False):
        """
        Save model checkpoint.
        
        Args:
            epoch: Current epoch
            val_loss: Validation loss
            is_best: Whether this is the best model so far
        """
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'val_loss': val_loss,
            'history': self.history
        }
        
        if is_best:
            path = self.checkpoint_dir / 'best_model.pth'
            logger.info(f"Saving best model to {path}")
        else:
            path = self.checkpoint_dir / f'checkpoint_epoch_{epoch+1}.pth'
        
        torch.save(checkpoint, path)
    
    def load_checkpoint(self, checkpoint_path: str):
        """
        Load model checkpoint.
        
        Args:
            checkpoint_path: Path to checkpoint file
        """
        checkpoint = torch.load(checkpoint_path, map_location=self.device)
        
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.history = checkpoint.get('history', self.history)
        
        logger.info(f"Loaded checkpoint from {checkpoint_path}")
    
    def predict(self, x: np.ndarray) -> np.ndarray:
        """
        Make predictions.
        
        Args:
            x: Input array of shape (samples, sequence_length, features)
            
        Returns:
            Predictions array
        """
        self.model.eval()
        
        # Convert to tensor
        x_tensor = torch.FloatTensor(x).to(self.device)
        
        with torch.no_grad():
            predictions = self.model(x_tensor)
        
        return predictions.cpu().numpy()


def create_data_loaders(X_train: np.ndarray, y_train: np.ndarray,
                       X_val: np.ndarray, y_val: np.ndarray,
                       batch_size: int = 64) -> Tuple[DataLoader, DataLoader]:
    """
    Create PyTorch data loaders.
    
    Args:
        X_train: Training features
        y_train: Training labels
        X_val: Validation features
        y_val: Validation labels
        batch_size: Batch size
        
    Returns:
        Tuple of (train_loader, val_loader)
    """
    # Convert to tensors
    X_train_tensor = torch.FloatTensor(X_train)
    y_train_tensor = torch.FloatTensor(y_train).unsqueeze(1)
    X_val_tensor = torch.FloatTensor(X_val)
    y_val_tensor = torch.FloatTensor(y_val).unsqueeze(1)
    
    # Create datasets
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    val_dataset = TensorDataset(X_val_tensor, y_val_tensor)
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader
