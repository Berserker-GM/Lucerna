import React, { useState } from 'react';
import { Music, Play, Heart, Sparkles } from 'lucide-react';

interface MusicSuggestionsProps {
  mood: string;
  onClose: () => void;
}

export function MusicSuggestions({ mood, onClose }: MusicSuggestionsProps) {
  const [playing, setPlaying] = useState<number | null>(null);

  const moodPlaylists = {
    happy: [
      { title: 'Happy Vibes', genre: 'Pop', duration: '45 min', tracks: 12, color: 'from-yellow-400 to-orange-400' },
      { title: 'Feel Good Hits', genre: 'Indie', duration: '38 min', tracks: 10, color: 'from-pink-400 to-red-400' },
      { title: 'Uplifting Beats', genre: 'Electronic', duration: '52 min', tracks: 15, color: 'from-blue-400 to-purple-400' },
    ],
    sad: [
      { title: 'Healing Sounds', genre: 'Ambient', duration: '60 min', tracks: 8, color: 'from-blue-400 to-indigo-400' },
      { title: 'Soft Piano', genre: 'Classical', duration: '42 min', tracks: 10, color: 'from-purple-400 to-pink-400' },
      { title: 'Comforting Melodies', genre: 'Acoustic', duration: '35 min', tracks: 9, color: 'from-teal-400 to-cyan-400' },
    ],
    stressed: [
      { title: 'Deep Relaxation', genre: 'Meditation', duration: '30 min', tracks: 6, color: 'from-green-400 to-teal-400' },
      { title: 'Calm Waters', genre: 'Nature Sounds', duration: '45 min', tracks: 7, color: 'from-blue-300 to-green-300' },
      { title: 'Stress Relief', genre: 'Lo-Fi', duration: '55 min', tracks: 14, color: 'from-purple-300 to-pink-300' },
    ],
    anxious: [
      { title: 'Peaceful Mind', genre: 'Ambient', duration: '40 min', tracks: 8, color: 'from-indigo-400 to-purple-400' },
      { title: 'Breathing Easy', genre: 'Meditation', duration: '25 min', tracks: 5, color: 'from-cyan-400 to-blue-400' },
      { title: 'Gentle Waves', genre: 'Nature', duration: '50 min', tracks: 10, color: 'from-teal-300 to-blue-300' },
    ],
    default: [
      { title: 'Mood Booster', genre: 'Mixed', duration: '45 min', tracks: 12, color: 'from-purple-400 to-pink-400' },
      { title: 'Chill Vibes', genre: 'Lo-Fi', duration: '60 min', tracks: 18, color: 'from-blue-400 to-purple-400' },
      { title: 'Focus Flow', genre: 'Instrumental', duration: '38 min', tracks: 10, color: 'from-green-400 to-teal-400' },
    ],
  };

  const playlists = moodPlaylists[mood as keyof typeof moodPlaylists] || moodPlaylists.default;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl">Music for Your Mood</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl">Curated Just for You</h3>
          </div>
          <p className="text-gray-700">
            Based on your current mood, we've selected these playlists to help you feel better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-xl overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${playlist.color} p-8 flex items-center justify-center relative`}>
                <Music className="w-16 h-16 text-white opacity-80" />
                {playing === index && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-2 text-gray-800">{playlist.title}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>🎵 {playlist.genre}</p>
                  <p>⏱️ {playlist.duration}</p>
                  <p>📀 {playlist.tracks} tracks</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlaying(playing === index ? null : index)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {playing === index ? 'Playing...' : 'Play'}
                  </button>
                  <button className="p-2 border-2 border-gray-300 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-pink-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="text-lg mb-2 text-gray-800">🎧 Listening Tips</h4>
          <ul className="space-y-2 text-gray-700">
            <li>• Find a comfortable, quiet space</li>
            <li>• Use headphones for the best experience</li>
            <li>• Take deep breaths and let the music guide you</li>
            <li>• It's okay to skip tracks that don't resonate with you</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
