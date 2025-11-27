import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with time-based greeting
    const hour = new Date().getHours();
    let greeting = "Hi there! 👋 I'm here to support you. ";
    
    if (hour < 12) {
      greeting += "Good morning! Did you have breakfast today? 🍳";
    } else if (hour < 18) {
      greeting += "Good afternoon! Have you had lunch yet? 🍽️";
    } else {
      greeting += "Good evening! Did you have dinner? 🌙";
    }
    
    setMessages([{ text: greeting, isBot: true }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const responses: Record<string, string[]> = {
    breakfast: [
      "Great! A good breakfast fuels your day. What did you have? 😊",
      "Awesome! Starting the day with food is so important for your energy and mood!",
    ],
    nobreakfast: [
      "That's okay! Maybe grab a light snack? Even a banana or some nuts can help boost your energy! 🍌",
      "No worries! When you're ready, try to eat something small. Your brain needs fuel! 💪",
    ],
    lunch: [
      "Wonderful! Taking time to eat is an act of self-care. Hope it was tasty! 🍱",
      "That's great! Proper nutrition helps with mood regulation. What did you enjoy?",
    ],
    nolunch: [
      "It's important to nourish yourself! Can you take a quick break for a snack? 🥗",
      "I understand life gets busy. Try to grab something when you can - your body will thank you!",
    ],
    dinner: [
      "Perfect! Ending the day with a good meal. Hope you're relaxing now! 🌙",
      "That's wonderful! A good dinner can help you unwind from the day.",
    ],
    nodinner: [
      "It's getting late! Try to eat something before bed - even something light. Your body needs it! 🥪",
      "Don't forget to take care of yourself! A light meal can help you sleep better too.",
    ],
    funfact: [
      "Fun fact: Smiling, even when you don't feel like it, can actually improve your mood! 😊",
      "Did you know? Laughing for 10-15 minutes can burn approximately 40 calories! 😄",
      "Fun fact: Your brain uses 20% of your body's energy, even though it's only 2% of your body weight! 🧠",
      "Did you know? Chocolate releases endorphins - the same feel-good chemicals released when you're happy! 🍫",
      "Fun fact: Hugging for 20 seconds releases oxytocin, which can make you feel happier! 🤗",
      "Did you know? Listening to music can boost your immune system and reduce stress! 🎵",
      "Fun fact: Plants in your room can reduce stress levels by up to 60%! 🌱",
    ],
    yes: [
      "That's wonderful! I'm so glad to hear that! 😊",
      "Great! Keep up the good self-care! 💪",
    ],
    no: [
      "That's okay! What can I help you with? I'm here for you. 💙",
      "No worries! Would you like to talk about anything?",
    ],
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
    
    // Check for meal responses
    if (lowercaseMessage.includes('yes') && lowercaseMessage.includes('breakfast')) {
      return responses.breakfast[Math.floor(Math.random() * responses.breakfast.length)];
    } else if (lowercaseMessage.includes('no') && lowercaseMessage.includes('breakfast')) {
      return responses.nobreakfast[Math.floor(Math.random() * responses.nobreakfast.length)];
    } else if (lowercaseMessage.includes('yes') && lowercaseMessage.includes('lunch')) {
      return responses.lunch[Math.floor(Math.random() * responses.lunch.length)];
    } else if (lowercaseMessage.includes('no') && lowercaseMessage.includes('lunch')) {
      return responses.nolunch[Math.floor(Math.random() * responses.nolunch.length)];
    } else if (lowercaseMessage.includes('yes') && lowercaseMessage.includes('dinner')) {
      return responses.dinner[Math.floor(Math.random() * responses.dinner.length)];
    } else if (lowercaseMessage.includes('no') && lowercaseMessage.includes('dinner')) {
      return responses.nodinner[Math.floor(Math.random() * responses.nodinner.length)];
    } else if (lowercaseMessage.includes('fun fact') || lowercaseMessage.includes('fact') || lowercaseMessage.includes('tell me something')) {
      return responses.funfact[Math.floor(Math.random() * responses.funfact.length)];
    } else if (lowercaseMessage.includes('sad') || lowercaseMessage.includes('down') || lowercaseMessage.includes('depressed')) {
      return responses.sad[Math.floor(Math.random() * responses.sad.length)];
    } else if (lowercaseMessage.includes('happy') || lowercaseMessage.includes('good') || lowercaseMessage.includes('great')) {
      return responses.happy[Math.floor(Math.random() * responses.happy.length)];
    } else if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('overwhelm')) {
      return responses.stressed[Math.floor(Math.random() * responses.stressed.length)];
    } else if (lowercaseMessage.includes('anxious') || lowercaseMessage.includes('anxiety') || lowercaseMessage.includes('worry')) {
      return responses.anxious[Math.floor(Math.random() * responses.anxious.length)];
    } else if (lowercaseMessage === 'yes' || lowercaseMessage === 'yeah' || lowercaseMessage === 'yep') {
      return responses.yes[Math.floor(Math.random() * responses.yes.length)];
    } else if (lowercaseMessage === 'no' || lowercaseMessage === 'nah' || lowercaseMessage === 'nope') {
      return responses.no[Math.floor(Math.random() * responses.no.length)];
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