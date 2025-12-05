import { AnimatedBackground } from './components/AnimatedBackground';
import { HeroSection } from './components/HeroSection';
import { ContactForm } from './components/ContactForm';
import { ChatBot } from './components/ChatBot';
import { StockPredictor } from './components/StockPredictor';

export default function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white">AI</span>
            </div>
            <span className="text-white text-xl">StockPredict AI</span>
          </div>
          <div className="hidden md:flex gap-8 text-white text-sm">
            <a href="#" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Pricing</a>
            <a href="#" className="hover:text-purple-400 transition-colors">About</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <HeroSection />
          <StockPredictor />
        </div>

        {/* Contact Form Section */}
        <div className="mt-16">
          <ContactForm />
        </div>
      </main>

      {/* ChatBot Popup */}
      <ChatBot />
    </div>
  );
}
