import { CheckCircle2, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export function HeroSection() {
  const features = [
    'AI-Powered Predictions',
    'Real-time Market Analysis',
    '95% Accuracy Rate',
    'Multi-Asset Support',
    'Risk Assessment Tools',
    'Portfolio Optimization',
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="inline-block">
          <span className="text-pink-400 text-sm tracking-wider uppercase">
            Next-Generation Stock Market Intelligence
          </span>
        </div>
        
        <h1 className="text-white text-5xl md:text-6xl leading-tight">
          Predict Market Trends with
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Advanced AI Technology
          </span>
        </h1>
        
        <p className="text-gray-300 text-lg max-w-xl">
          Harness the power of machine learning and deep neural networks to make informed investment decisions. Our AI analyzes millions of data points to predict stock movements with unprecedented accuracy.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-white">{feature}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
      >
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-shadow">
          Start Free Trial
        </button>
        
        <div className="flex items-center gap-3 text-white">
          <Phone className="w-5 h-5 text-purple-400" />
          <span>Call Now : +1 800 AI STOCK</span>
        </div>
      </motion.div>

      {/* Review Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex items-center gap-3 pt-4"
      >
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#4285F4"/>
          </svg>
          <span className="text-white text-sm">TrustPilot Reviews</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-yellow-400">★</span>
          ))}
        </div>
        <span className="text-gray-400 text-sm">4.9</span>
      </motion.div>
    </div>
  );
}
