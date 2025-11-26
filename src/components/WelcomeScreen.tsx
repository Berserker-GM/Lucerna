import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Smile } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Generate random bubbles
    const newBubbles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setBubbles(newBubbles);

    // Show message after a short delay
    setTimeout(() => setShowMessage(true), 500);
  }, []);

  const jokes = [
    "Why did the smartphone need therapy? Too many issues! 📱",
    "What's a therapist's favorite exercise? Mental stretching! 🧘‍♀️",
    "Why don't feelings ever win at poker? They always show their hand! 🃏",
    "What did one brain cell say to the other? We make a great thought! 🧠",
    "Why did the anxiety go to the party? To feel less nervous! 🎉"
  ];

  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center relative overflow-hidden">
      {/* Floating Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-0 w-8 h-8 bg-white/20 rounded-full animate-float"
          style={{
            left: `${bubble.x}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Main Content */}
      <div className={`text-center z-10 px-6 transition-all duration-1000 ${showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mb-8 flex justify-center gap-4">
          <Heart className="w-16 h-16 text-pink-600 animate-bounce" style={{ animationDelay: '0s' }} />
          <Sparkles className="w-16 h-16 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <Smile className="w-16 h-16 text-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>

        <h1 className="text-6xl mb-6 text-white drop-shadow-lg">
          Welcome to MoodGlow! ✨
        </h1>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mb-8 max-w-2xl mx-auto shadow-2xl">
          <p className="text-2xl text-gray-800 mb-4">
            Before we begin...
          </p>
          <p className="text-xl text-gray-700 mb-6">
            Here's something to make you smile:
          </p>
          <p className="text-3xl mb-6">
            {randomJoke}
          </p>
          <div className="text-lg text-gray-600 italic">
            "Every day may not be good, but there's something good in every day."
          </div>
        </div>

        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl"
        >
          Let's Get Started! 🚀
        </button>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
