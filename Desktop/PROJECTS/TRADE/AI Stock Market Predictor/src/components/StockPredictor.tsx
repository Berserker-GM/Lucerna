import { useState } from 'react';
import { TrendingUp, Loader2, AlertCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface Prediction {
    day: number;
    date: string;
    price: number;
    lower: number;
    upper: number;
}

interface PredictionResponse {
    ticker: string;
    current_price: number;
    predictions: Prediction[];
    graph_url: string;
    confidence: number;
    accuracy: number;
}

export function StockPredictor() {
    const [ticker, setTicker] = useState('');
    const [horizon, setHorizon] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ticker.trim()) {
            setError('Please enter a stock ticker');
            return;
        }

        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const response = await fetch('http://localhost:8000/api/v1/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticker: ticker.toUpperCase(),
                    horizon: horizon,
                    confidence_level: 0.95,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get prediction: ${response.statusText}`);
            }

            const data = await response.json();
            setPrediction(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get prediction. Make sure the API server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {!isLoggedIn && (
                <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/50 rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-white/10">
                    <div className="bg-purple-500/20 p-4 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Premium Feature</h3>
                    <p className="text-gray-300 mb-6 max-w-md">
                        Sign in to access our advanced AI stock prediction engine and get real-time market insights.
                    </p>
                    <button
                        onClick={() => setIsLoggedIn(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                    >
                        Sign In / Sign Up
                    </button>
                </div>
            )}

            {/* Input Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${!isLoggedIn ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    Stock Price Predictor
                </h2>

                <form onSubmit={handlePredict} className="space-y-4">
                    <div>
                        <label className="text-white text-sm mb-2 block">
                            Stock Ticker Symbol
                        </label>
                        <input
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            placeholder="e.g., AAPL, GOOGL, MSFT"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="text-white text-sm mb-2 block">
                            Prediction Horizon (days): {horizon}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={horizon}
                            onChange={(e) => setHorizon(Number(e.target.value))}
                            className="w-full"
                            disabled={loading}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1 day</span>
                            <span>30 days</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="w-5 h-5" />
                                Predict Price
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-200 text-sm">{error}</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Prediction Results */}
            {prediction && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Summary Card */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm">Stock</p>
                                <p className="text-white text-2xl font-bold">{prediction.ticker}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Current Price</p>
                                <p className="text-white text-2xl font-bold">${prediction.current_price.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Predicted ({horizon}d)</p>
                                <p className="text-green-400 text-2xl font-bold">
                                    ${prediction.predictions[prediction.predictions.length - 1].price.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Model Accuracy</p>
                                <p className="text-purple-400 text-2xl font-bold">
                                    {(prediction.accuracy * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Prediction Graph */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-white text-xl font-bold mb-4">Price Prediction Chart</h3>
                        <img
                            src={`http://localhost:8000${prediction.graph_url}`}
                            alt="Prediction Graph"
                            className="w-full rounded-lg"
                        />
                    </div>

                    {/* Detailed Predictions */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-white text-xl font-bold mb-4">Detailed Predictions</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {prediction.predictions.slice(0, 10).map((pred) => (
                                <div
                                    key={pred.day}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <div>
                                        <p className="text-white font-medium">Day {pred.day}</p>
                                        <p className="text-gray-400 text-sm">{pred.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">${pred.price.toFixed(2)}</p>
                                        <p className="text-gray-400 text-xs">
                                            ${pred.lower.toFixed(2)} - ${pred.upper.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
