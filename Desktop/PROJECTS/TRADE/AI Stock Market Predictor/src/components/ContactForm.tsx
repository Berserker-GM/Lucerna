import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    interest: '',
    captcha: '',
  });

  const [num1] = useState(Math.floor(Math.random() * 10));
  const [num2] = useState(Math.floor(Math.random() * 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(formData.captcha) === num1 + num2) {
      alert('Form submitted successfully!');
    } else {
      alert('Incorrect answer. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
    >
      <div className="text-center mb-6">
        <h3 className="text-gray-700 text-2xl mb-2">
          Get Started Today
        </h3>
        <p className="text-gray-500">
          Fill out the form, and we'll contact you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <select
          value={formData.interest}
          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
          required
        >
          <option value="">Area of Interest</option>
          <option value="stocks">Stock Predictions</option>
          <option value="crypto">Cryptocurrency</option>
          <option value="forex">Forex Trading</option>
          <option value="commodities">Commodities</option>
        </select>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <label className="text-gray-700">What is {num1} + {num2} ?</label>
            <button
              type="button"
              className="text-purple-500 hover:text-purple-600"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Type your answer"
            value={formData.captcha}
            onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
        >
          SUBMIT
        </button>
      </form>
    </motion.div>
  );
}
