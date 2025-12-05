"""
Technical indicators and feature engineering.
Implements 50+ technical indicators for stock price prediction.
"""

import pandas as pd
import numpy as np
from typing import Optional, List
from loguru import logger

try:
    import ta
    from ta.trend import SMAIndicator, EMAIndicator, MACD, ADXIndicator
    from ta.momentum import RSIIndicator, StochasticOscillator, WilliamsRIndicator
    from ta.volatility import BollingerBands, AverageTrueRange
    from ta.volume import OnBalanceVolumeIndicator, ChaikinMoneyFlowIndicator, MFIIndicator
    TA_AVAILABLE = True
except ImportError:
    logger.warning("ta library not available, some indicators will be computed manually")
    TA_AVAILABLE = False


class TechnicalIndicators:
    """Technical indicators calculator."""
    
    def __init__(self, data: pd.DataFrame):
        """
        Initialize with OHLCV data.
        
        Args:
            data: DataFrame with columns: open, high, low, close, volume
        """
        self.data = data.copy()
        self._validate_data()
    
    def _validate_data(self):
        """Validate required columns exist."""
        required = ['open', 'high', 'low', 'close', 'volume']
        missing = [col for col in required if col not in self.data.columns]
        
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
    
    # ==================== TREND INDICATORS ====================
    
    def add_sma(self, periods: List[int] = [5, 10, 20, 50, 100, 200]) -> pd.DataFrame:
        """
        Add Simple Moving Average indicators.
        
        Args:
            periods: List of periods for SMA calculation
            
        Returns:
            DataFrame with SMA columns added
        """
        for period in periods:
            if TA_AVAILABLE:
                indicator = SMAIndicator(close=self.data['close'], window=period)
                self.data[f'sma_{period}'] = indicator.sma_indicator()
            else:
                self.data[f'sma_{period}'] = self.data['close'].rolling(window=period).mean()
        
        return self.data
    
    def add_ema(self, periods: List[int] = [5, 10, 20, 50, 100, 200]) -> pd.DataFrame:
        """
        Add Exponential Moving Average indicators.
        
        Args:
            periods: List of periods for EMA calculation
            
        Returns:
            DataFrame with EMA columns added
        """
        for period in periods:
            if TA_AVAILABLE:
                indicator = EMAIndicator(close=self.data['close'], window=period)
                self.data[f'ema_{period}'] = indicator.ema_indicator()
            else:
                self.data[f'ema_{period}'] = self.data['close'].ewm(span=period, adjust=False).mean()
        
        return self.data
    
    def add_macd(self, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
        """
        Add MACD (Moving Average Convergence Divergence) indicator.
        
        Args:
            fast: Fast EMA period
            slow: Slow EMA period
            signal: Signal line period
            
        Returns:
            DataFrame with MACD columns added
        """
        if TA_AVAILABLE:
            indicator = MACD(close=self.data['close'], window_fast=fast, window_slow=slow, window_sign=signal)
            self.data['macd'] = indicator.macd()
            self.data['macd_signal'] = indicator.macd_signal()
            self.data['macd_diff'] = indicator.macd_diff()
        else:
            ema_fast = self.data['close'].ewm(span=fast, adjust=False).mean()
            ema_slow = self.data['close'].ewm(span=slow, adjust=False).mean()
            self.data['macd'] = ema_fast - ema_slow
            self.data['macd_signal'] = self.data['macd'].ewm(span=signal, adjust=False).mean()
            self.data['macd_diff'] = self.data['macd'] - self.data['macd_signal']
        
        return self.data
    
    def add_adx(self, period: int = 14) -> pd.DataFrame:
        """
        Add ADX (Average Directional Index) indicator.
        
        Args:
            period: ADX period
            
        Returns:
            DataFrame with ADX column added
        """
        if TA_AVAILABLE:
            indicator = ADXIndicator(high=self.data['high'], low=self.data['low'], 
                                    close=self.data['close'], window=period)
            self.data['adx'] = indicator.adx()
            self.data['adx_pos'] = indicator.adx_pos()
            self.data['adx_neg'] = indicator.adx_neg()
        else:
            # Simplified ADX calculation
            high_low = self.data['high'] - self.data['low']
            high_close = np.abs(self.data['high'] - self.data['close'].shift())
            low_close = np.abs(self.data['low'] - self.data['close'].shift())
            
            tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
            atr = tr.rolling(window=period).mean()
            
            self.data['adx'] = atr
        
        return self.data
    
    # ==================== MOMENTUM INDICATORS ====================
    
    def add_rsi(self, period: int = 14) -> pd.DataFrame:
        """
        Add RSI (Relative Strength Index) indicator.
        
        Args:
            period: RSI period
            
        Returns:
            DataFrame with RSI column added
        """
        if TA_AVAILABLE:
            indicator = RSIIndicator(close=self.data['close'], window=period)
            self.data['rsi'] = indicator.rsi()
        else:
            delta = self.data['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            self.data['rsi'] = 100 - (100 / (1 + rs))
        
        return self.data
    
    def add_stochastic(self, k_period: int = 14, d_period: int = 3) -> pd.DataFrame:
        """
        Add Stochastic Oscillator indicator.
        
        Args:
            k_period: %K period
            d_period: %D period
            
        Returns:
            DataFrame with Stochastic columns added
        """
        if TA_AVAILABLE:
            indicator = StochasticOscillator(high=self.data['high'], low=self.data['low'],
                                            close=self.data['close'], window=k_period, smooth_window=d_period)
            self.data['stoch_k'] = indicator.stoch()
            self.data['stoch_d'] = indicator.stoch_signal()
        else:
            low_min = self.data['low'].rolling(window=k_period).min()
            high_max = self.data['high'].rolling(window=k_period).max()
            self.data['stoch_k'] = 100 * (self.data['close'] - low_min) / (high_max - low_min)
            self.data['stoch_d'] = self.data['stoch_k'].rolling(window=d_period).mean()
        
        return self.data
    
    def add_williams_r(self, period: int = 14) -> pd.DataFrame:
        """
        Add Williams %R indicator.
        
        Args:
            period: Williams %R period
            
        Returns:
            DataFrame with Williams %R column added
        """
        if TA_AVAILABLE:
            indicator = WilliamsRIndicator(high=self.data['high'], low=self.data['low'],
                                          close=self.data['close'], lbp=period)
            self.data['williams_r'] = indicator.williams_r()
        else:
            high_max = self.data['high'].rolling(window=period).max()
            low_min = self.data['low'].rolling(window=period).min()
            self.data['williams_r'] = -100 * (high_max - self.data['close']) / (high_max - low_min)
        
        return self.data
    
    def add_mfi(self, period: int = 14) -> pd.DataFrame:
        """
        Add MFI (Money Flow Index) indicator.
        
        Args:
            period: MFI period
            
        Returns:
            DataFrame with MFI column added
        """
        if TA_AVAILABLE:
            indicator = MFIIndicator(high=self.data['high'], low=self.data['low'],
                                    close=self.data['close'], volume=self.data['volume'], window=period)
            self.data['mfi'] = indicator.money_flow_index()
        else:
            typical_price = (self.data['high'] + self.data['low'] + self.data['close']) / 3
            money_flow = typical_price * self.data['volume']
            
            positive_flow = money_flow.where(typical_price > typical_price.shift(), 0).rolling(window=period).sum()
            negative_flow = money_flow.where(typical_price < typical_price.shift(), 0).rolling(window=period).sum()
            
            mfi_ratio = positive_flow / negative_flow
            self.data['mfi'] = 100 - (100 / (1 + mfi_ratio))
        
        return self.data
    
    # ==================== VOLATILITY INDICATORS ====================
    
    def add_bollinger_bands(self, period: int = 20, std_dev: int = 2) -> pd.DataFrame:
        """
        Add Bollinger Bands indicator.
        
        Args:
            period: Moving average period
            std_dev: Number of standard deviations
            
        Returns:
            DataFrame with Bollinger Bands columns added
        """
        if TA_AVAILABLE:
            indicator = BollingerBands(close=self.data['close'], window=period, window_dev=std_dev)
            self.data['bb_high'] = indicator.bollinger_hband()
            self.data['bb_mid'] = indicator.bollinger_mavg()
            self.data['bb_low'] = indicator.bollinger_lband()
            self.data['bb_width'] = indicator.bollinger_wband()
        else:
            sma = self.data['close'].rolling(window=period).mean()
            std = self.data['close'].rolling(window=period).std()
            
            self.data['bb_mid'] = sma
            self.data['bb_high'] = sma + (std * std_dev)
            self.data['bb_low'] = sma - (std * std_dev)
            self.data['bb_width'] = (self.data['bb_high'] - self.data['bb_low']) / self.data['bb_mid']
        
        return self.data
    
    def add_atr(self, period: int = 14) -> pd.DataFrame:
        """
        Add ATR (Average True Range) indicator.
        
        Args:
            period: ATR period
            
        Returns:
            DataFrame with ATR column added
        """
        if TA_AVAILABLE:
            indicator = AverageTrueRange(high=self.data['high'], low=self.data['low'],
                                        close=self.data['close'], window=period)
            self.data['atr'] = indicator.average_true_range()
        else:
            high_low = self.data['high'] - self.data['low']
            high_close = np.abs(self.data['high'] - self.data['close'].shift())
            low_close = np.abs(self.data['low'] - self.data['close'].shift())
            
            tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
            self.data['atr'] = tr.rolling(window=period).mean()
        
        return self.data
    
    # ==================== VOLUME INDICATORS ====================
    
    def add_obv(self) -> pd.DataFrame:
        """
        Add OBV (On-Balance Volume) indicator.
        
        Returns:
            DataFrame with OBV column added
        """
        if TA_AVAILABLE:
            indicator = OnBalanceVolumeIndicator(close=self.data['close'], volume=self.data['volume'])
            self.data['obv'] = indicator.on_balance_volume()
        else:
            obv = [0]
            for i in range(1, len(self.data)):
                if self.data['close'].iloc[i] > self.data['close'].iloc[i-1]:
                    obv.append(obv[-1] + self.data['volume'].iloc[i])
                elif self.data['close'].iloc[i] < self.data['close'].iloc[i-1]:
                    obv.append(obv[-1] - self.data['volume'].iloc[i])
                else:
                    obv.append(obv[-1])
            
            self.data['obv'] = obv
        
        return self.data
    
    def add_vwap(self) -> pd.DataFrame:
        """
        Add VWAP (Volume Weighted Average Price) indicator.
        
        Returns:
            DataFrame with VWAP column added
        """
        typical_price = (self.data['high'] + self.data['low'] + self.data['close']) / 3
        self.data['vwap'] = (typical_price * self.data['volume']).cumsum() / self.data['volume'].cumsum()
        
        return self.data
    
    # ==================== PRICE-BASED FEATURES ====================
    
    def add_returns(self, periods: List[int] = [1, 5, 10, 20]) -> pd.DataFrame:
        """
        Add return features.
        
        Args:
            periods: List of periods for return calculation
            
        Returns:
            DataFrame with return columns added
        """
        for period in periods:
            self.data[f'return_{period}d'] = self.data['close'].pct_change(periods=period)
            self.data[f'log_return_{period}d'] = np.log(self.data['close'] / self.data['close'].shift(period))
        
        return self.data
    
    def add_price_momentum(self, periods: List[int] = [5, 10, 20]) -> pd.DataFrame:
        """
        Add price momentum features.
        
        Args:
            periods: List of periods for momentum calculation
            
        Returns:
            DataFrame with momentum columns added
        """
        for period in periods:
            self.data[f'momentum_{period}d'] = self.data['close'] - self.data['close'].shift(period)
            self.data[f'momentum_pct_{period}d'] = (self.data['close'] / self.data['close'].shift(period) - 1) * 100
        
        return self.data
    
    def add_volatility(self, windows: List[int] = [5, 10, 20, 30]) -> pd.DataFrame:
        """
        Add volatility features.
        
        Args:
            windows: List of windows for volatility calculation
            
        Returns:
            DataFrame with volatility columns added
        """
        returns = self.data['close'].pct_change()
        
        for window in windows:
            self.data[f'volatility_{window}d'] = returns.rolling(window=window).std() * np.sqrt(252)
        
        return self.data
    
    def add_all_indicators(self) -> pd.DataFrame:
        """
        Add all technical indicators.
        
        Returns:
            DataFrame with all indicators added
        """
        logger.info("Adding all technical indicators...")
        
        # Trend indicators
        self.add_sma()
        self.add_ema()
        self.add_macd()
        self.add_adx()
        
        # Momentum indicators
        self.add_rsi()
        self.add_stochastic()
        self.add_williams_r()
        self.add_mfi()
        
        # Volatility indicators
        self.add_bollinger_bands()
        self.add_atr()
        
        # Volume indicators
        self.add_obv()
        self.add_vwap()
        
        # Price-based features
        self.add_returns()
        self.add_price_momentum()
        self.add_volatility()
        
        logger.info(f"Added {len(self.data.columns)} total features")
        
        return self.data
