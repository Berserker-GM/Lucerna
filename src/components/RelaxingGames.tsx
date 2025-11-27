import React, { useState } from 'react';
import { Gamepad2, Circle, Square, X as XIcon } from 'lucide-react';

interface RelaxingGamesProps {
  onClose: () => void;
}

export function RelaxingGames({ onClose }: RelaxingGamesProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [breathCount, setBreathCount] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [bubbleCount, setBubbleCount] = useState(0);

  const games = [
    {
      id: 'breathing',
      name: 'Breathing Circle',
      description: 'Follow the expanding circle to regulate your breath',
      icon: Circle,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      id: 'bubbles',
      name: 'Pop the Bubbles',
      description: 'A satisfying bubble-popping experience',
      icon: Circle,
      color: 'from-purple-400 to-pink-400',
    },
    {
      id: 'coloring',
      name: 'Mindful Coloring',
      description: 'Color patterns to calm your mind',
      icon: Square,
      color: 'from-green-400 to-teal-400',
    },
  ];

  const startBreathing = () => {
    setBreathing(true);
    setTimeout(() => {
      setBreathing(false);
      setBreathCount((prev) => prev + 1);
    }, 8000);
  };

  const renderGame = () => {
    if (selectedGame === 'breathing') {
      return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-8">
          <h3 className="text-2xl mb-8 text-gray-800">Breathing Exercise</h3>
          <div className="relative flex items-center justify-center mb-8">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white transition-all duration-8000 ${
                breathing ? 'scale-150' : 'scale-100'
              }`}
            >
              <span className="text-xl">{breathing ? 'Breathe In' : 'Breathe Out'}</span>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Completed: {breathCount} cycles</p>
          <button
            onClick={startBreathing}
            disabled={breathing}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {breathing ? 'Breathing...' : 'Start Breathing'}
          </button>
          <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
            Breathe in as the circle expands, breathe out as it contracts. Follow this rhythm to calm your mind.
          </p>
        </div>
      );
    }

    if (selectedGame === 'bubbles') {
      return (
        <div className="relative h-[500px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 overflow-hidden">
          <div className="text-center mb-4">
            <h3 className="text-2xl mb-2 text-gray-800">Pop the Bubbles</h3>
            <p className="text-lg text-purple-700">Bubbles Popped: {bubbleCount}</p>
          </div>
          <div className="relative h-full">
            {[...Array(10)].map((_, i) => (
              <button
                key={i}
                onClick={() => setBubbleCount((prev) => prev + 1)}
                className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-70 hover:opacity-100 hover:scale-110 transition-all shadow-lg"
                style={{
                  left: `${Math.random() * 80}%`,
                  top: `${Math.random() * 80}%`,
                  animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <Circle className="w-full h-full text-white p-2" />
              </button>
            ))}
          </div>
          <style jsx>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }
          `}</style>
        </div>
      );
    }

    if (selectedGame === 'coloring') {
      const [colors, setColors] = useState<Record<number, string>>({});
      const [selectedColor, setSelectedColor] = useState('#8B5CF6');

      const colorPalette = [
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
      ];

      return (
        <div className="h-[500px] bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-8">
          <h3 className="text-2xl mb-4 text-gray-800 text-center">Mindful Coloring</h3>
          <p className="text-center text-gray-600 mb-4">Click on squares to color them</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {colorPalette.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-lg transition-transform ${
                  selectedColor === color ? 'scale-125 ring-4 ring-white' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="grid grid-cols-8 gap-2 max-w-md mx-auto">
            {[...Array(64)].map((_, i) => (
              <button
                key={i}
                onClick={() => setColors({ ...colors, [i]: selectedColor })}
                className="aspect-square rounded border-2 border-gray-300 hover:border-gray-400 transition-all"
                style={{
                  backgroundColor: colors[i] || '#ffffff',
                }}
              />
            ))}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => setColors({})}
              className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Clear Canvas
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (selectedGame) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              ← Back to Games
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl">Relaxing Games</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Take a break with these calming activities designed to help you relax and refocus.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className="group text-left bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-xl overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${game.color} p-12 flex items-center justify-center`}>
                <game.icon className="w-20 h-20 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">
                  {game.name}
                </h3>
                <p className="text-gray-600">{game.description}</p>
                <div className="mt-4 text-purple-600 flex items-center gap-2">
                  Play Now →
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h4 className="text-lg mb-2 text-gray-800">✨ Benefits of Relaxing Games</h4>
          <ul className="space-y-2 text-gray-700">
            <li>• Reduces stress and anxiety</li>
            <li>• Improves focus and mindfulness</li>
            <li>• Provides a mental break from worries</li>
            <li>• Promotes emotional regulation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
