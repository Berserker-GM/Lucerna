import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Heart } from 'lucide-react';
import { getGeminiResponse } from '../lib/gemini';

interface ChatBotProps {
  onEmergency: () => void;
  currentMood?: string;
  soulNoteContent?: string;
}

interface Message {
  text: string;
  isBot: boolean;
}

type QuestionType = 'breakfast' | 'lunch' | 'dinner' | 'mood' | 'none';

export function ChatBot({ onEmergency, currentMood, soulNoteContent }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [lastQuestion, setLastQuestion] = useState<QuestionType>('none');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with time-based greeting
    const hour = new Date().getHours();
    let greeting = "Hi there, my sweet child! 💖 Mama Lucerna is here for you. ";
    let question: QuestionType = 'none';

    if (hour < 12) {
      greeting += "Good morning, sunshine! ☀️ Did you eat a good breakfast today? 🍳";
      question = 'breakfast';
    } else if (hour < 18) {
      greeting += "Good afternoon, darling! 🌼 Have you had a nutritious lunch yet? 🍽️";
      question = 'lunch';
    } else {
      greeting += "Good evening, my love! 🌙 Did you have a nice dinner? 🍲";
      question = 'dinner';
    }

    // If mood is low, acknowledge it first
    if (currentMood && ['Sad', 'Tired', 'Stressed', 'Anxious'].includes(currentMood)) {
      greeting = `Oh, my poor baby. I see you're feeling ${currentMood.toLowerCase()} today. 🥺 Come here, let Mama give you a virtual hug. 🫂 ` + greeting;
    }

    // If there's a recent soul note, acknowledge it gently
    if (soulNoteContent) {
      greeting = "I saw you writing in your journal, sweetheart. I'm so proud of you for expressing your feelings. 📔 " + greeting;
    }

    setMessages([{ text: greeting, isBot: true }]);
    setLastQuestion(question);
  }, [currentMood, soulNoteContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const responses: Record<string, string[]> = {
    breakfast: [
      "That's wonderful, honey! A good breakfast is like a warm hug for your tummy. 🥞",
      "I'm so glad you ate! You need that energy to shine bright today! ✨",
    ],
    nobreakfast: [
      "Oh, sweetie, you really shouldn't skip breakfast! 😟 It's the most important meal. Even a banana or some yogurt would be good. Please promise me you'll eat something small? 🍌",
      "My dear, your body needs fuel! Running on empty isn't good for you. Please grab a snack for Mama? 🥪",
    ],
    lunch: [
      "Good job, darling! Nourishing your body is so important. I hope it was delicious! 🥗",
      "That makes me happy! Eating well helps you stay strong and focused. 💪",
    ],
    nolunch: [
      "Oh no, honey bun! Skipping lunch can make you feel tired and grumpy. 🥺 Please go find something to eat, even if it's quick!",
      "You need to take care of yourself, my love! Please take a break and eat something. You deserve it! 🍎",
    ],
    dinner: [
      "Perfect! Now you can relax and have a peaceful evening. Sleep well later, okay? 😴",
      "I'm glad to hear that! A warm meal is the best way to end the day. 🍲",
    ],
    nodinner: [
      "Sweetheart, you can't go to bed hungry! 😟 It might disturb your sleep. Please have a light snack at least? 🥛",
      "My love, please eat something. Your body does all its repairing while you sleep, and it needs energy! 🌙",
    ],
    love: [
      "I love you so much, sweetie! You are precious to me. ❤️",
      "You are loved, you are enough, and you are doing great. Mama is proud of you! 💖",
      "Sending you all my love and a big, warm hug! 🫂",
    ],
    advice: [
      "My advice? Take a deep breath, drink some water, and remember that this too shall pass. You've got this! 💧",
      "Always be kind to yourself, darling. You're doing the best you can, and that's enough. 🌸",
      "Make sure you're getting enough sleep, honey. Everything looks better after a good night's rest. 😴",
    ],
    sad: [
      "Oh, my heart breaks to see you sad. 💔 It's okay to cry, let it all out. I'm right here with you.",
      "I'm sending you the biggest, warmest hug right now. 🫂 You are so strong, but you don't always have to be. Lean on me.",
      "Do you want to talk about it, or do you just need a distraction? Mama is here for whatever you need.",
    ],
    happy: [
      "Look at that smile! 😍 It lights up the whole room! I'm so happy for you, honey!",
      "That's music to my ears! Enjoy this moment, my love. You deserve all the happiness in the world! 🎉",
    ],
    stressed: [
      "Take a deep breath with me, darling. In... and out. 🌬️ Don't let the world weigh you down. One thing at a time.",
      "You're working so hard, sweetie. Remember to take breaks. Mama doesn't want you burning out! ☕",
    ],
    anxious: [
      "Shh, it's okay. You are safe. I'm right here. 🛡️ Let's focus on your breathing together.",
      "I know it feels scary right now, but this feeling will pass. You are stronger than your anxiety, my brave child. 💪",
    ],
    default: [
      "I'm listening, sweetheart. Tell Mama everything. 👂",
      "That's interesting, honey! Tell me more.",
      "I'm here for you, always. What else is on your mind, my love? 💖",
      "You can tell me anything. I won't judge you. I just want to help. 🤝",
    ],
    crisis: [
      "My precious child, I am so worried about you. 💔 Please, please reach out for help. You are so important to this world. I'm showing you emergency contacts now. Please call someone. Your life is a gift. 💙",
      "Oh honey, please don't say that. You matter so much. Please let someone help you. I'm opening the emergency resources for you. Please use them. I love you and I want you to be safe. 🫂",
    ],
  };

  const getFallbackResponse = (userMessage: string) => {
    const lowercaseMessage = userMessage.toLowerCase();

    // Context-aware responses for "yes" and "no"
    if (lastQuestion !== 'none') {
      if (['yes', 'yeah', 'yep', 'sure', 'i did'].some(w => lowercaseMessage.includes(w))) {
        const response = responses[lastQuestion][Math.floor(Math.random() * responses[lastQuestion].length)];
        setLastQuestion('none');
        return response;
      } else if (['no', 'nah', 'nope', 'not yet', 'i didn\'t'].some(w => lowercaseMessage.includes(w))) {
        const response = responses[`no${lastQuestion}`][Math.floor(Math.random() * responses[`no${lastQuestion}`].length)];
        setLastQuestion('none');
        return response;
      }
    }

    // General keyword matching
    if (lowercaseMessage.includes('love') || lowercaseMessage.includes('hug')) {
      return responses.love[Math.floor(Math.random() * responses.love.length)];
    } else if (lowercaseMessage.includes('advice') || lowercaseMessage.includes('help') || lowercaseMessage.includes('what do i do')) {
      return responses.advice[Math.floor(Math.random() * responses.advice.length)];
    } else if (lowercaseMessage.includes('sad') || lowercaseMessage.includes('cry') || lowercaseMessage.includes('depressed')) {
      return responses.sad[Math.floor(Math.random() * responses.sad.length)];
    } else if (lowercaseMessage.includes('happy') || lowercaseMessage.includes('good') || lowercaseMessage.includes('great') || lowercaseMessage.includes('excited')) {
      return responses.happy[Math.floor(Math.random() * responses.happy.length)];
    } else if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('tired') || lowercaseMessage.includes('busy')) {
      return responses.stressed[Math.floor(Math.random() * responses.stressed.length)];
    } else if (lowercaseMessage.includes('anxious') || lowercaseMessage.includes('scared') || lowercaseMessage.includes('worry') || lowercaseMessage.includes('panic')) {
      return responses.anxious[Math.floor(Math.random() * responses.anxious.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    const lowercaseMessage = input.toLowerCase();
    const crisisKeywords = [
      'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
      'die', 'death', 'dying', 'dead', 'harm myself', 'hurt myself',
      'no reason to live', 'better off dead', 'end it all'
    ];

    const hasCrisisKeyword = crisisKeywords.some(keyword => lowercaseMessage.includes(keyword));

    if (hasCrisisKeyword) {
      onEmergency();
      const crisisResponse = responses.crisis[Math.floor(Math.random() * responses.crisis.length)];
      setMessages((prev) => [...prev, { text: crisisResponse, isBot: true }]);
      setIsTyping(false);
      return;
    }

    try {
      // Try to get response from Gemini
      const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
      const geminiResponse = await getGeminiResponse(input, {
        currentMood,
        soulNoteContent,
        timeOfDay
      });

      if (geminiResponse) {
        setMessages((prev) => [...prev, { text: geminiResponse, isBot: true }]);
      } else {
        // Fallback if Gemini fails or no key
        const fallbackResponse = getFallbackResponse(input);
        setMessages((prev) => [...prev, { text: fallbackResponse, isBot: true }]);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      const fallbackResponse = getFallbackResponse(input);
      setMessages((prev) => [...prev, { text: fallbackResponse, isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce-slow"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border-2 border-pink-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Mama Lucerna</h3>
              <p className="text-xs opacity-90 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Always here for you
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/30">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${message.isBot
                    ? 'bg-white text-gray-800 rounded-tl-none'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none'
                    }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-pink-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Talk to Mama..."
                className="flex-1 px-4 py-3 border border-pink-200 rounded-full focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-pink-50/30"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
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