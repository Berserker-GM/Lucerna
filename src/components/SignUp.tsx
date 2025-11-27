import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SignUpProps {
  onComplete: (data: { userId: string; name: string; token: string }) => void;
  onSwitch: () => void;
}

export function SignUp({ onComplete, onSwitch }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);

      // Call backend to create user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Now sign in to get the access token
      const signinResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const signinData = await signinResponse.json();

      if (!signinResponse.ok) {
        throw new Error('Account created but failed to sign in. Please try signing in manually.');
      }

      // Success!
      onComplete({ userId: signinData.userId, name: signinData.name, token: signinData.accessToken });
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-16 h-16 text-purple-600" />
          </div>
          <h1 className="text-4xl mb-2 text-gray-800">Join MoodGlow</h1>
          <p className="text-gray-600">Create your account and start your wellness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Switch to Sign In */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitch}
              className="text-purple-600 hover:text-purple-700 font-medium"
              disabled={isLoading}
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 text-center">
            By creating an account, you agree to keep your mental health data private and secure. 
            We never share your information with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}