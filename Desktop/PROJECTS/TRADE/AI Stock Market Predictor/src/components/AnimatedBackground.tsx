import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface StockTicker {
  id: number;
  symbol: string;
  value: number;
  change: number;
  x: number;
  y: number;
}

export function AnimatedBackground() {
  const [tickers, setTickers] = useState<StockTicker[]>([]);

  useEffect(() => {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'AMD'];
    const initialTickers: StockTicker[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      value: Math.random() * 500 + 100,
      change: Math.random() * 10 - 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setTickers(initialTickers);

    const interval = setInterval(() => {
      setTickers(prev => prev.map(ticker => ({
        ...ticker,
        value: ticker.value + (Math.random() * 2 - 0.5),
        change: ticker.change + (Math.random() * 0.5 - 0.25),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: '10%', left: '5%' }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: '40%', right: '10%' }}
      />
      <motion.div
        className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ bottom: '20%', left: '30%' }}
      />

      {/* Animated Stock Tickers */}
      {tickers.map((ticker) => (
        <motion.div
          key={ticker.id}
          className="absolute text-green-400/20 text-xs whitespace-nowrap"
          style={{
            left: `${ticker.x}%`,
            top: `${ticker.y}%`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="flex items-center gap-2">
            <span>{ticker.symbol}</span>
            <span className={ticker.change >= 0 ? 'text-green-400/30' : 'text-red-400/30'}>
              ${ticker.value.toFixed(2)}
            </span>
            <span className={ticker.change >= 0 ? 'text-green-400/30' : 'text-red-400/30'}>
              {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
            </span>
          </div>
        </motion.div>
      ))}

      {/* Animated Chart Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <motion.path
          d="M0,400 Q250,300 500,350 T1000,300 L1000,600 L0,600 Z"
          fill="url(#gradient1)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
