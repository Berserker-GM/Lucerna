"""
Stock price prediction and graph generation.
Generates future price predictions with confidence intervals.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
from typing import List, Tuple, Optional, Dict, Any
from pathlib import Path
from loguru import logger
import torch

from ..config import config
from ..utils import ensure_dir


class PricePredictor:
    """Price prediction with confidence intervals."""
    
    def __init__(self, model, scaler=None):
        """
        Initialize price predictor.
        
        Args:
            model: Trained model
            scaler: Feature scaler (optional)
        """
        self.model = model
        self.scaler = scaler
    
    def predict_future(self, last_sequence: np.ndarray, horizon: int = 10,
                      confidence_level: float = 0.95) -> Dict[str, Any]:
        """
        Predict future prices with confidence intervals.
        
        Args:
            last_sequence: Last sequence of features (sequence_length, features)
            horizon: Number of days to predict ahead
            confidence_level: Confidence level for intervals
            
        Returns:
            Dictionary with predictions and confidence intervals
        """
        predictions = []
        lower_bounds = []
        upper_bounds = []
        
        # Current sequence
        current_seq = last_sequence.copy()
        
        for step in range(horizon):
            # Predict next value
            if isinstance(self.model, torch.nn.Module):
                self.model.eval()
                with torch.no_grad():
                    input_tensor = torch.FloatTensor(current_seq).unsqueeze(0)
                    pred = self.model(input_tensor).cpu().numpy()[0, 0]
            else:
                pred = self.model.predict(current_seq.reshape(1, -1))[0]
            
            predictions.append(pred)
            
            # Estimate uncertainty (simple approach: use historical volatility)
            # In production, use Monte Carlo or quantile regression
            std_dev = np.std(predictions) if len(predictions) > 1 else 0.02
            z_score = 1.96 if confidence_level == 0.95 else 2.58  # 95% or 99%
            
            lower_bounds.append(pred - z_score * std_dev)
            upper_bounds.append(pred + z_score * std_dev)
            
            # Update sequence for next prediction
            # Shift sequence and add new prediction
            current_seq = np.roll(current_seq, -1, axis=0)
            current_seq[-1, 0] = pred  # Assuming price is first feature
        
        return {
            'predictions': np.array(predictions),
            'lower_bounds': np.array(lower_bounds),
            'upper_bounds': np.array(upper_bounds),
            'confidence_level': confidence_level
        }
    
    def monte_carlo_simulation(self, last_sequence: np.ndarray, horizon: int = 10,
                              num_simulations: int = 1000) -> Dict[str, Any]:
        """
        Monte Carlo simulation for price paths.
        
        Args:
            last_sequence: Last sequence of features
            horizon: Number of days to predict ahead
            num_simulations: Number of simulation paths
            
        Returns:
            Dictionary with simulation results
        """
        all_paths = []
        
        for _ in range(num_simulations):
            path = []
            current_seq = last_sequence.copy()
            
            for step in range(horizon):
                # Add random noise to simulate uncertainty
                noise = np.random.normal(0, 0.01, current_seq.shape)
                noisy_seq = current_seq + noise
                
                # Predict
                if isinstance(self.model, torch.nn.Module):
                    self.model.eval()
                    with torch.no_grad():
                        input_tensor = torch.FloatTensor(noisy_seq).unsqueeze(0)
                        pred = self.model(input_tensor).cpu().numpy()[0, 0]
                else:
                    pred = self.model.predict(noisy_seq.reshape(1, -1))[0]
                
                path.append(pred)
                
                # Update sequence
                current_seq = np.roll(current_seq, -1, axis=0)
                current_seq[-1, 0] = pred
            
            all_paths.append(path)
        
        all_paths = np.array(all_paths)
        
        # Calculate statistics
        mean_path = np.mean(all_paths, axis=0)
        median_path = np.median(all_paths, axis=0)
        percentile_5 = np.percentile(all_paths, 5, axis=0)
        percentile_95 = np.percentile(all_paths, 95, axis=0)
        
        return {
            'mean': mean_path,
            'median': median_path,
            'percentile_5': percentile_5,
            'percentile_95': percentile_95,
            'all_paths': all_paths
        }


class PredictionGraphGenerator:
    """Generate prediction graphs."""
    
    def __init__(self, output_dir: str = "graphs"):
        """
        Initialize graph generator.
        
        Args:
            output_dir: Directory to save graphs
        """
        self.output_dir = Path(output_dir)
        ensure_dir(self.output_dir)
    
    def plot_prediction(self, ticker: str, historical_dates: List[datetime],
                       historical_prices: List[float], prediction_dates: List[datetime],
                       predictions: np.ndarray, lower_bounds: np.ndarray,
                       upper_bounds: np.ndarray, confidence_level: float = 0.95,
                       save_path: Optional[str] = None) -> str:
        """
        Plot price prediction with confidence intervals.
        
        Args:
            ticker: Stock ticker
            historical_dates: Historical dates
            historical_prices: Historical prices
            prediction_dates: Prediction dates
            predictions: Predicted prices
            lower_bounds: Lower confidence bounds
            upper_bounds: Upper confidence bounds
            confidence_level: Confidence level
            save_path: Path to save graph
            
        Returns:
            Path to saved graph
        """
        plt.figure(figsize=(14, 7))
        
        # Plot historical prices
        plt.plot(historical_dates, historical_prices, label='Historical Price', 
                color='#2E86DE', linewidth=2)
        
        # Plot predictions
        plt.plot(prediction_dates, predictions, label='Predicted Price',
                color='#EE5A6F', linewidth=2, linestyle='--')
        
        # Plot confidence interval
        plt.fill_between(prediction_dates, lower_bounds, upper_bounds,
                        alpha=0.3, color='#EE5A6F',
                        label=f'{int(confidence_level*100)}% Confidence Interval')
        
        # Formatting
        plt.xlabel('Date', fontsize=12, fontweight='bold')
        plt.ylabel('Price ($)', fontsize=12, fontweight='bold')
        plt.title(f'{ticker} - Price Prediction', fontsize=16, fontweight='bold')
        plt.legend(loc='best', fontsize=10)
        plt.grid(True, alpha=0.3)
        
        # Format x-axis
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator())
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        
        # Save
        if save_path is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            save_path = self.output_dir / f'{ticker}_prediction_{timestamp}.png'
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Saved prediction graph to {save_path}")
        return str(save_path)
    
    def plot_monte_carlo(self, ticker: str, historical_dates: List[datetime],
                        historical_prices: List[float], prediction_dates: List[datetime],
                        simulation_results: Dict[str, Any], num_paths_to_show: int = 100,
                        save_path: Optional[str] = None) -> str:
        """
        Plot Monte Carlo simulation results.
        
        Args:
            ticker: Stock ticker
            historical_dates: Historical dates
            historical_prices: Historical prices
            prediction_dates: Prediction dates
            simulation_results: Monte Carlo simulation results
            num_paths_to_show: Number of simulation paths to display
            save_path: Path to save graph
            
        Returns:
            Path to saved graph
        """
        plt.figure(figsize=(14, 7))
        
        # Plot historical prices
        plt.plot(historical_dates, historical_prices, label='Historical Price',
                color='#2E86DE', linewidth=2)
        
        # Plot sample simulation paths
        all_paths = simulation_results['all_paths']
        sample_indices = np.random.choice(len(all_paths), 
                                         min(num_paths_to_show, len(all_paths)),
                                         replace=False)
        
        for idx in sample_indices:
            plt.plot(prediction_dates, all_paths[idx], color='gray',
                    alpha=0.1, linewidth=0.5)
        
        # Plot mean and median
        plt.plot(prediction_dates, simulation_results['mean'],
                label='Mean Prediction', color='#EE5A6F', linewidth=2)
        plt.plot(prediction_dates, simulation_results['median'],
                label='Median Prediction', color='#10AC84', linewidth=2, linestyle='--')
        
        # Plot percentile range
        plt.fill_between(prediction_dates,
                        simulation_results['percentile_5'],
                        simulation_results['percentile_95'],
                        alpha=0.3, color='#EE5A6F',
                        label='90% Confidence Range')
        
        # Formatting
        plt.xlabel('Date', fontsize=12, fontweight='bold')
        plt.ylabel('Price ($)', fontsize=12, fontweight='bold')
        plt.title(f'{ticker} - Monte Carlo Price Simulation', fontsize=16, fontweight='bold')
        plt.legend(loc='best', fontsize=10)
        plt.grid(True, alpha=0.3)
        
        # Format x-axis
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator())
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        
        # Save
        if save_path is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            save_path = self.output_dir / f'{ticker}_monte_carlo_{timestamp}.png'
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Saved Monte Carlo graph to {save_path}")
        return str(save_path)
