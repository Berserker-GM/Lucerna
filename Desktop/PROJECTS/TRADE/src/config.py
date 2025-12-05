"""
Configuration loader for the stock prediction system.
Loads settings from config.yaml and environment variables.
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration manager for the application."""
    
    def __init__(self, config_path: str = "config.yaml"):
        """
        Initialize configuration.
        
        Args:
            config_path: Path to YAML configuration file
        """
        self.config_path = Path(config_path)
        self._config = self._load_config()
        self._validate_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file."""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        
        with open(self.config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        return config
    
    def _validate_config(self):
        """Validate required configuration sections exist."""
        required_sections = ['data', 'features', 'models', 'prediction', 'training', 'storage', 'api']
        for section in required_sections:
            if section not in self._config:
                raise ValueError(f"Missing required configuration section: {section}")
    
    # Data Configuration
    @property
    def data_universe(self) -> List[str]:
        """Get stock universe configuration."""
        return self._config['data']['universe']
    
    @property
    def data_sources(self) -> Dict[str, str]:
        """Get data source configuration."""
        return self._config['data']['sources']
    
    @property
    def history_start_date(self) -> str:
        """Get historical data start date."""
        return self._config['data']['history']['start_date']
    
    @property
    def update_interval(self) -> str:
        """Get data update interval."""
        return self._config['data']['update']['interval']
    
    # Feature Configuration
    @property
    def technical_indicators(self) -> List[str]:
        """Get list of technical indicators to compute."""
        return self._config['features']['technical']
    
    @property
    def feature_timeframes(self) -> List[int]:
        """Get timeframes for multi-scale features."""
        return self._config['features']['timeframes']
    
    # Model Configuration
    @property
    def lstm_config(self) -> Dict[str, Any]:
        """Get LSTM model configuration."""
        return self._config['models']['lstm']
    
    @property
    def transformer_config(self) -> Dict[str, Any]:
        """Get Transformer model configuration."""
        return self._config['models']['transformer']
    
    @property
    def ensemble_config(self) -> Dict[str, Any]:
        """Get ensemble configuration."""
        return self._config['models']['ensemble']
    
    # Prediction Configuration
    @property
    def prediction_horizons(self) -> List[int]:
        """Get prediction horizons (days ahead)."""
        return self._config['prediction']['horizons']
    
    @property
    def confidence_levels(self) -> List[float]:
        """Get confidence levels for intervals."""
        return self._config['prediction']['confidence_levels']
    
    @property
    def monte_carlo_enabled(self) -> bool:
        """Check if Monte Carlo simulation is enabled."""
        return self._config['prediction']['monte_carlo']['enabled']
    
    @property
    def monte_carlo_simulations(self) -> int:
        """Get number of Monte Carlo simulations."""
        return self._config['prediction']['monte_carlo']['num_simulations']
    
    # Training Configuration
    @property
    def train_split(self) -> float:
        """Get training split ratio."""
        return self._config['training']['split']['train']
    
    @property
    def val_split(self) -> float:
        """Get validation split ratio."""
        return self._config['training']['split']['validation']
    
    @property
    def test_split(self) -> float:
        """Get test split ratio."""
        return self._config['training']['split']['test']
    
    @property
    def batch_size(self) -> int:
        """Get training batch size."""
        return self._config['training']['batch_size']
    
    @property
    def epochs(self) -> int:
        """Get number of training epochs."""
        return self._config['training']['epochs']
    
    @property
    def learning_rate(self) -> float:
        """Get learning rate."""
        return self._config['training']['learning_rate']
    
    @property
    def device(self) -> str:
        """Get training device (cuda/cpu)."""
        return self._config['training']['device']
    
    # Storage Configuration
    @property
    def database_type(self) -> str:
        """Get database type."""
        return self._config['storage']['database']['type']
    
    @property
    def database_path(self) -> str:
        """Get database path."""
        return self._config['storage']['database']['path']
    
    @property
    def timeseries_format(self) -> str:
        """Get time-series storage format."""
        return self._config['storage']['timeseries']['format']
    
    @property
    def timeseries_path(self) -> str:
        """Get time-series storage path."""
        return self._config['storage']['timeseries']['path']
    
    @property
    def models_path(self) -> str:
        """Get models checkpoint path."""
        return self._config['storage']['models']['path']
    
    # API Configuration
    @property
    def api_host(self) -> str:
        """Get API host."""
        return self._config['api']['host']
    
    @property
    def api_port(self) -> int:
        """Get API port."""
        return self._config['api']['port']
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS allowed origins."""
        return self._config['api']['cors']['origins']
    
    # Environment Variables
    @property
    def alpha_vantage_key(self) -> str:
        """Get Alpha Vantage API key from environment."""
        key = os.getenv('ALPHA_VANTAGE_API_KEY', '')
        if not key:
            raise ValueError("ALPHA_VANTAGE_API_KEY not set in environment")
        return key
    
    @property
    def polygon_key(self) -> str:
        """Get Polygon API key from environment."""
        return os.getenv('POLYGON_API_KEY', '')
    
    @property
    def news_api_key(self) -> str:
        """Get News API key from environment."""
        return os.getenv('NEWS_API_KEY', '')
    
    @property
    def mlflow_tracking_uri(self) -> str:
        """Get MLflow tracking URI."""
        return os.getenv('MLFLOW_TRACKING_URI', 'http://localhost:5000')
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value by key path.
        
        Args:
            key: Dot-separated key path (e.g., 'models.lstm.hidden_size')
            default: Default value if key not found
            
        Returns:
            Configuration value
        """
        keys = key.split('.')
        value = self._config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value


# Global configuration instance
config = Config()
