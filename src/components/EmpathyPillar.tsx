import React, { useState } from 'react';
import { Users, Video, MessageCircle, Phone, Heart } from 'lucide-react';

interface EmpathyPillarProps {
  onClose: () => void;
}

export function EmpathyPillar({ onClose }: EmpathyPillarProps) {
  const [activeTab, setActiveTab] = useState<'community' | 'therapists'>('community');

  const communityGroups = [
    {
      id: 1,
      name: 'Anxiety Support Circle',
      members: 234,
      description: 'A safe space for those dealing with anxiety',
      online: 45,
      topic: 'Anxiety',
    },
    {
      id: 2,
      name: 'Mindfulness & Meditation',
      members: 567,
      description: 'Share meditation experiences and tips',
      online: 89,
      topic: 'Meditation',
    },
    {
      id: 3,
      name: 'Daily Gratitude',
      members: 890,
      description: 'Share what you\'re grateful for',
      online: 123,
      topic: 'Positivity',
    },
    {
      id: 4,
      name: 'Work-Life Balance',
      members: 456,
      description: 'Navigate professional and personal life',
      online: 67,
      topic: 'Balance',
    },
  ];

  const therapists = [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      specialty: 'Anxiety & Depression',
      experience: '12 years',
      rating: 4.9,
      available: true,
      price: '$80/session',
    },
    {
      id: 2,
      name: 'Dr. James Chen',
      specialty: 'Cognitive Behavioral Therapy',
      experience: '8 years',
      rating: 4.8,
      available: true,
      price: '$75/session',
    },
    {
      id: 3,
      name: 'Dr. Maya Patel',
      specialty: 'Mindfulness & Stress',
      experience: '10 years',
      rating: 4.9,
      available: false,
      price: '$85/session',
    },
    {
      id: 4,
      name: 'Dr. Alex Rivera',
      specialty: 'Life Coaching & Wellness',
      experience: '6 years',
      rating: 4.7,
      available: true,
      price: '$70/session',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl">Empathy Pillar</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Connect with like-minded people and professional therapists who understand your journey.
        </p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('community')}
            className={`pb-3 px-4 transition-colors ${
              activeTab === 'community'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Pillar Peers</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('therapists')}
            className={`pb-3 px-4 transition-colors ${
              activeTab === 'therapists'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              <span>Therapists</span>
            </div>
          </button>
        </div>

        {/* Community Groups */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            {communityGroups.map((group) => (
              <div
                key={group.id}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl text-gray-800">{group.name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {group.topic}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{group.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>👥 {group.members} members</span>
                      <span>🟢 {group.online} online now</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Join Group
                  </button>
                  <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-gray-700">
                💡 <strong>Remember:</strong> Always be kind and respectful in community spaces. We're
                all here to support each other!
              </p>
            </div>
          </div>
        )}

        {/* Therapists */}
        {activeTab === 'therapists' && (
          <div className="space-y-4">
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
                        {therapist.name.split(' ')[1][0]}
                      </div>
                      <div>
                        <h3 className="text-xl text-gray-800">{therapist.name}</h3>
                        <p className="text-sm text-gray-600">{therapist.specialty}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span>⭐ {therapist.rating}/5.0</span>
                      <span>📅 {therapist.experience} experience</span>
                      <span>💰 {therapist.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          therapist.available ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm text-gray-600">
                        {therapist.available ? 'Available Now' : 'Busy'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!therapist.available}
                    className={`flex-1 py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                      therapist.available
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Book Session
                  </button>
                  <button className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h4 className="text-lg mb-2 text-gray-800">Need immediate help?</h4>
              <p className="text-gray-600 mb-3">
                If you're in crisis, please reach out to emergency services or call a helpline.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Crisis Helpline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
