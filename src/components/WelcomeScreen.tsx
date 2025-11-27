import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Smile } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; y: number; color: string; popped: boolean }>>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Generate 8 random balloons
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-cyan-400'];
    const newBalloons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + (i % 4) * 22 + Math.random() * 5,
      y: 20 + Math.floor(i / 4) * 35 + Math.random() * 10,
      color: colors[i],
      popped: false,
    }));
    setBalloons(newBalloons);
    setTimeout(() => setShowMessage(true), 500);
  }, []);

  const popBalloon = (id: number) => {
    setBalloons((prev) =>
      prev.map((balloon) =>
        balloon.id === id ? { ...balloon, popped: true } : balloon
      )
    );
    setPoppedCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (poppedCount >= 5) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [poppedCount, onComplete]);

  const jokes = [
    "Why did the smartphone need therapy? Too many issues! 📱",
    "What's a therapist's favorite exercise? Mental stretching! 🧘‍♀️",
    "Why don't feelings ever win at poker? They always show their hand! 🃏",
    "What did one brain cell say to the other? We make a great thought! 🧠",
    "Why did the anxiety go to the party? To feel less nervous! 🎉"
  ];

  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center relative overflow-hidden p-4">
      {/* Main Content */}
      <div className={`text-center z-10 px-6 transition-all duration-1000 max-w-4xl w-full ${showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mb-8 flex justify-center gap-4">
          <Heart className="w-16 h-16 text-pink-600 animate-bounce" style={{ animationDelay: '0s' }} />
          <Sparkles className="w-16 h-16 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <Smile className="w-16 h-16 text-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>

        <h1 className="text-6xl mb-6 text-white drop-shadow-lg">
          Welcome to MoodGlow! ✨
        </h1>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mb-8 mx-auto shadow-2xl">
          <p className="text-2xl text-gray-800 mb-4">
            Before we begin...
          </p>
          <p className="text-xl text-gray-700 mb-6">
            Here's something to make you smile:
          </p>
          <p className="text-3xl mb-6">
            {randomJoke}
          </p>
        </div>

        {/* Balloon Popping Game */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mx-auto shadow-2xl mb-6">
          <h2 className="text-3xl mb-4 text-gray-800">Pop 5 Balloons to Continue! 🎈</h2>
          <p className="text-xl text-gray-600 mb-6">
            Progress: {poppedCount}/5 balloons popped
          </p>
          
          <div className="relative h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border-4 border-white overflow-hidden">
            {balloons.map((balloon) => (
              <button
                key={balloon.id}
                onClick={() => !balloon.popped && popBalloon(balloon.id)}
                disabled={balloon.popped}
                className={`absolute transition-all duration-300 ${
                  balloon.popped ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'
                }`}
                style={{
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {!balloon.popped && (
                  <div className="relative animate-float-slow">
                    <div className={`w-20 h-24 ${balloon.color} rounded-full shadow-xl cursor-pointer`} />
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-400" />
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-white/30 rounded-full" />
                  </div>
                )}
                {balloon.popped && (
                  <div className="text-4xl animate-ping">💥</div>
                )}
              </button>
            ))}
            
            {poppedCount >= 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <p className="text-3xl text-gray-800">Great Job!</p>
                  <p className="text-xl text-gray-600">Loading MoodGlow...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}