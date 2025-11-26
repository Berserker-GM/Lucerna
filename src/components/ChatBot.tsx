import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Hi there! 👋 I'm here to support you. How are you feeling today?", isBot: true },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const responses: Record<string, string[]> = {
    sad: [
      "I'm sorry you're feeling down. Remember, it's okay to have difficult days. Would you like to try a breathing exercise?",
      "Your feelings are valid. What's one small thing that might help you feel a bit better right now?",
    ],
    happy: [
      "That's wonderful! I'm so glad you're feeling good! What's bringing you joy today? 😊",
      "Awesome! It's great to hear you're in a positive space. Keep that energy flowing!",
    ],
    stressed: [
      "Stress can be tough. Remember to breathe. Have you tried the relaxing games in the app?",
      "Let's take it one step at a time. What's the main thing on your mind right now?",
    ],
    anxious: [
      "Anxiety is challenging, but you're not alone. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, out for 8.",
      "I hear you. Sometimes when we're anxious, grounding techniques help. Can you name 5 things you can see around you?",
    ],
    default: [
      "I'm here to listen. Tell me more about how you're feeling.",
      "Thank you for sharing. Your mental health matters. What can I help you with today?",
      "I appreciate you opening up. Would you like to explore the mood tracker or journal features?",
    ],
  };

  const getResponse = (userMessage: string) => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('sad') || lowercaseMessage.includes('down') || lowercaseMessage.includes('depressed')) {
      return responses.sad[Math.floor(Math.random() * responses.sad.length)];
    } else if (lowercaseMessage.includes('happy') || lowercaseMessage.includes('good') || lowercaseMessage.includes('great')) {
      return responses.happy[Math.floor(Math.random() * responses.happy.length)];
    } else if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('overwhelm')) {
      return responses.stressed[Math.floor(Math.random() * responses.stressed.length)];
    } else if (lowercaseMessage.includes('anxious') || lowercaseMessage.includes('anxiety') || lowercaseMessage.includes('worry')) {
      return responses.anxious[Math.floor(Math.random() * responses.anxious.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages([...messages, userMessage]);
    setInput('');

    setTimeout(() => {
      const botResponse = { text: getResponse(input), isBot: true };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">MoodGlow Support</h3>
              <p className="text-xs opacity-90">Always here for you</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:scale-110 transition-transform"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
