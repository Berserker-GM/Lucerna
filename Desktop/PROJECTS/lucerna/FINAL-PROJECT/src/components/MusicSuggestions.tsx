import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Heart, Sparkles, Upload, Trash2, X } from 'lucide-react';

interface MusicSuggestionsProps {
  mood: string;
  onClose: () => void;
  onPlay: () => void;
}

interface Track {
  title: string;
  file: string;
}

interface Playlist {
  title: string;
  genre: string;
  color: string;
  tracks: Track[];
}

interface CustomTrack {
  id: string;
  title: string;
  file: string;
}

export function MusicSuggestions({ mood, onClose, onPlay }: MusicSuggestionsProps) {
  const [currentPlaylist, setCurrentPlaylist] = useState<number | null>(null);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load custom tracks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customMusicTracks');
    if (saved) {
      setCustomTracks(JSON.parse(saved));
    }
  }, []);

  // Save custom tracks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customMusicTracks', JSON.stringify(customTracks));
  }, [customTracks]);

  const playlists: Playlist[] = [
    {
      title: 'Mood Booster',
      genre: 'Mixed',
      color: 'from-purple-400 to-pink-400',
      tracks: [
        { title: 'Untitled', file: '/music/Untitled.mp3' },
        { title: 'Mood Booster', file: '/music/Mood Booster.mp3' },
      ],
    },
    {
      title: 'Chill Vibes',
      genre: 'Lo-Fi',
      color: 'from-blue-400 to-purple-400',
      tracks: [
        { title: 'Moonlight in My Room', file: '/music/Moonlight in My Room.mp3' },
        { title: 'Midnight Whispers', file: '/music/Midnight Whispers.mp3' },
        { title: 'Midnight Echoes', file: '/music/Midnight Echoes.mp3' },
      ],
    },
    {
      title: 'Focus Flow',
      genre: 'Instrumental',
      color: 'from-green-400 to-teal-400',
      tracks: [],
    },
  ];

  const handlePlayTrack = (playlistIndex: number, trackIndex: number) => {
    const track = playlists[playlistIndex].tracks[trackIndex];

    if (currentPlaylist === playlistIndex && currentTrack === trackIndex && isPlaying) {
      // Pause current track
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.src = track.file;
        audioRef.current.play();
        setCurrentPlaylist(playlistIndex);
        setCurrentTrack(trackIndex);
        setIsPlaying(true);
        onPlay();
      }
    }
  };

  const handlePlayCustomTrack = (trackId: string, trackFile: string) => {
    const trackIndex = customTracks.findIndex(t => t.id === trackId);

    if (currentPlaylist === -1 && currentTrack === trackIndex && isPlaying) {
      // Pause current track
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.src = trackFile;
        audioRef.current.play();
        setCurrentPlaylist(-1); // -1 indicates custom track
        setCurrentTrack(trackIndex);
        setIsPlaying(true);
        onPlay();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newTrack: CustomTrack = {
          id: Date.now().toString(),
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          file: e.target?.result as string,
        };
        setCustomTracks([...customTracks, newTrack]);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid audio file');
    }
    // Reset input
    event.target.value = '';
  };

  const handleDeleteCustomTrack = (trackId: string) => {
    setCustomTracks(customTracks.filter(t => t.id !== trackId));
    // Stop playback if this track is playing
    if (currentPlaylist === -1 && customTracks.findIndex(t => t.id === trackId) === currentTrack) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setCurrentPlaylist(null);
      setCurrentTrack(null);
    }
  };

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {playlists.map((playlist, playlistIndex) => (
            <div
              key={playlistIndex}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-xl overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${playlist.color} p-8 flex items-center justify-center relative`}>
                <Music className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-2 text-gray-800">{playlist.title}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>🎵 {playlist.genre}</p>
                  <p>📀 {playlist.tracks.length} tracks</p>
                </div>

                {/* Track List */}
                {playlist.tracks.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {playlist.tracks.map((track, trackIndex) => (
                      <button
                        key={trackIndex}
                        onClick={() => handlePlayTrack(playlistIndex, trackIndex)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${currentPlaylist === playlistIndex && currentTrack === trackIndex && isPlaying
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                      >
                        <span className="text-sm text-gray-700 truncate">{track.title}</span>
                        {currentPlaylist === playlistIndex && currentTrack === trackIndex && isPlaying ? (
                          <Pause className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No tracks available</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Music Section - Redesigned */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-8 text-center">
            <Music className="w-16 h-16 text-white mx-auto mb-2 opacity-90" />
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl text-gray-800 font-medium">My Music</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Music className="w-4 h-4" />
                <span>Custom</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{customTracks.length} tracks</span>
              </div>
            </div>

            {/* Track List */}
            <div className="space-y-2 mb-6">
              {customTracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${currentPlaylist === -1 && currentTrack === index && isPlaying
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className="text-gray-700 font-medium truncate flex-1 mr-4">{track.title}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayCustomTrack(track.id, track.file)}
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {currentPlaylist === -1 && currentTrack === index && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCustomTrack(track.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {customTracks.length === 0 && (
                <p className="text-center text-gray-400 py-4 italic">No songs added yet</p>
              )}
            </div>

            {/* Upload Button */}
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all text-center flex items-center justify-center gap-2 font-medium">
                <Upload className="w-5 h-5" />
                Add New Song
              </div>
            </label>
          </div>
        </div>

        {/* Listening Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="text-lg mb-2 text-gray-800">🎧 Listening Tips</h4>
          <ul className="space-y-2 text-gray-700">
            <li>• Find a comfortable, quiet space</li>
            <li>• Use headphones for the best experience</li>
            <li>• Take deep breaths and let the music guide you</li>
            <li>• It's okay to skip tracks that don't resonate with you</li>
          </ul>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setIsPlaying(false);
            alert('Error playing audio file. Please check if the file exists.');
          }}
        />
      </div>
    </div>
  );
}
