import React, { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, Heart } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EmergencyContactsProps {
  userId: string;
  onClose: () => void;
}

interface Contact {
  name: string;
  phone: string;
  relationship: string;
}

export function EmergencyContacts({ userId, onClose }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [isLoading, setIsLoading] = useState(false);

  const helplines = [
    { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
    { name: 'National Domestic Violence Hotline', number: '1-800-799-7233', available: '24/7' },
  ];

  useEffect(() => {
    loadContacts();
  }, [userId]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/contacts/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load contacts');
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async () => {
    if (!newContact.name || !newContact.phone) {
      alert('Please fill in name and phone number');
      return;
    }

    const updatedContacts = [...contacts, newContact];

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/contacts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            contacts: updatedContacts,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save contact');
      }

      setContacts(updatedContacts);
      setNewContact({ name: '', phone: '', relationship: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/contacts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            contacts: updatedContacts,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600" />
            <h2 className="text-3xl">Emergency Contacts</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* National Helplines */}
        <div className="mb-8">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            National Crisis Helplines
          </h3>
          <div className="space-y-3">
            {helplines.map((helpline, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-gray-800">{helpline.name}</h4>
                    <p className="text-sm text-gray-600">Available {helpline.available}</p>
                  </div>
                  <a
                    href={`tel:${helpline.number.replace(/[^0-9]/g, '')}`}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                </div>
                <p className="mt-2 text-lg text-gray-800">{helpline.number}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Contacts */}
        <div>
          <h3 className="text-xl mb-4">Your Support Network</h3>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Contact
            </button>
          )}

          {/* Add Contact Form */}
          {isAdding && (
            <div className="bg-blue-50 rounded-2xl p-6 mb-4 border border-blue-200">
              <h4 className="text-lg mb-4">Add New Contact</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Name *"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Phone Number *"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="Relationship (e.g., Best Friend, Mom)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewContact({ name: '', phone: '', relationship: '' });
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact List */}
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No personal contacts yet. Add someone you trust!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h4 className="text-lg text-gray-800">{contact.name}</h4>
                    <p className="text-gray-600">{contact.phone}</p>
                    {contact.relationship && (
                      <p className="text-sm text-gray-500">{contact.relationship}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                    <button
                      onClick={() => handleDeleteContact(index)}
                      disabled={isLoading}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
