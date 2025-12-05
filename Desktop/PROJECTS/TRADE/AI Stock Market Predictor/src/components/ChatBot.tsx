import { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI Stock Market Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('predict') || lowerInput.includes('stock') || lowerInput.includes('ticker')) {
      return "I can help you predict any stock! Just enter the ticker symbol (like AAPL, GOOGL, TSLA, MSFT) in the Stock Predictor on the right. You can choose how many days ahead you want to predict (1-30 days). Try it now!";
    } else if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      return "We offer flexible pricing plans starting from $29/month for individual traders up to enterprise solutions. Would you like to schedule a demo?";
    } else if (lowerInput.includes('accuracy') || lowerInput.includes('how accurate')) {
      return "Our AI prediction model has achieved a 78% accuracy rate on average. The accuracy varies by stock and market conditions. Each prediction includes confidence intervals to show the range of possible outcomes.";
    } else if (lowerInput.includes('how') || lowerInput.includes('work')) {
      return "Our system analyzes real-time market data, historical patterns, and technical indicators using LSTM neural networks. Simply enter any stock ticker (e.g., AAPL, GOOGL, TSLA) and choose your prediction horizon!";
    } else if (lowerInput.includes('ticker') || lowerInput.includes('symbol')) {
      return "Popular tickers you can try: AAPL (Apple), GOOGL (Google), MSFT (Microsoft), TSLA (Tesla), NVDA (Nvidia), AMZN (Amazon), META (Meta/Facebook), NFLX (Netflix). Just type any ticker in the predictor!";
    } else if (lowerInput.includes('example') || lowerInput.includes('demo')) {
      return "Try predicting AAPL (Apple) or TSLA (Tesla) for 10 days! Just enter the ticker in the Stock Predictor, adjust the horizon slider, and click 'Predict Price'. You'll get a beautiful graph with confidence intervals!";
    } else {
      return "I can help you with stock predictions! Try asking: 'How do I predict a stock?' or 'What tickers can I use?' or just enter any stock ticker (like AAPL, GOOGL, TSLA) in the predictor on the right!";
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-purple-500/50 transition-shadow"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3>AI Stock Assistant</h3>
                  <p className="text-xs opacity-90">Online • Instant replies</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                      }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:shadow-lg transition-shadow"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
