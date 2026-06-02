import React, { useState } from 'react';
import { Shield, Award, Compass, Lock, Users, MapPin, CheckCircle, ChevronRight, MessageSquare, Heart, Star, Phone, ShieldCheck, Mail, Building2, Globe, ArrowRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

interface RoleOption {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  requirements: string[];
  image: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'tenant',
    title: 'Tenant / Guest',
    subtitle: 'Find and book your next home',
    icon: User,
    requirements: [],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'landlord',
    title: 'Verified Landlord / Host',
    subtitle: 'List & manage your properties',
    icon: Building2,
    requirements: [],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'agency',
    title: 'Agency / Property Broker',
    subtitle: 'Grow your real estate business',
    icon: Compass,
    requirements: [],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'seller',
    title: 'Property Buyer / Seller',
    subtitle: 'Buy or sell property securely',
    icon: User,
    requirements: [],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'Cohort',
    title: 'Cohort / Roommates',
    subtitle: 'Find your perfect roommate now',
    icon: Users,
    requirements: [],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  }
];

export default function LandingPage({ 
  onComplete,
  initialAuthMode = 'login',
  initialShowModal = false
}: { 
  onComplete: (roleId: string) => void;
  initialAuthMode?: 'login' | 'register';
  initialShowModal?: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState<string>('landlord');
  const [showAuthModal, setShowAuthModal] = useState(initialShowModal);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialAuthMode);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [authStep, setAuthStep] = useState<'input' | 'verify'>('input');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For AI Studio preview purposes: Create a dummy 6-digit code
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedCode(mockCode);
    
    // Simulate network delay
    setTimeout(() => {
      setAuthStep('verify');
    }, 800);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== expectedCode && verificationCode !== '123456') {
      alert("Invalid verification code. Please try again.");
      return;
    }
    
    try {
      // Try to sign the user in via Firebase Anonymously so database rules pass
      if (auth) {
        await signInAnonymously(auth).catch((err) => {
          console.warn("Continuing preview despite Firebase Auth error:", err);
        });
      }
    } catch (err) {
      console.error("Auth error:", err);
    } finally {
      setShowAuthModal(false);
      onComplete(selectedRole || 'tenant');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans flex flex-col relative w-full overflow-y-auto">
      <header className="w-full max-w-7xl mx-auto px-4 pt-4 pb-2 z-50">
        <div className="bg-[#050914] border border-blue-900/30 rounded-[28px] overflow-hidden shadow-2xl relative">
          {/* Main Header Content */}
          <div className="flex flex-col lg:flex-row justify-between items-center px-6 pb-5 pt-2 gap-4 lg:gap-0">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-2xl tracking-tighter">S</span>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-white font-black text-xl tracking-tight leading-tighter flex items-center gap-1">
                  STAYLINK 
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Real Estate & Escrow App</p>
              </div>
            </div>

            {/* Right Status */}
            <div className="flex flex-col items-end gap-2">
              <div 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="flex items-center gap-3 bg-[#080d19] border border-blue-900/40 px-4 py-2 rounded-xl cursor-pointer hover:bg-[#0a1222] transition group"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex flex-col text-left mr-4">
                  <span className="text-white text-[12px] font-bold leading-tight">Staylink Secure Systems</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
        
        {/* Main Title Area */}
        <div className="text-center max-w-3xl mb-12">
          <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tight mb-4 flex items-center justify-center gap-2">
            STAYLINK           
            
          </h2>
          <marquee>
          <h3 className="text-blue-400 font-bold tracking-[0.2em] text-sm md:text-base uppercase mb-4 drop-shadow-md">
            ...Every Place... Every Person... One Connection...
          </h3>
          </marquee>

          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            <span className="text-blue-400 font-medium">
            <i> Rent. Buy. Sell. Share. Stay.</i>
            </span>.
          </p>

          {/* Verification Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
             <Badge text="AI Verification" subtext="Secure & Fast" icon={<Shield className="w-4 h-4" />} />
             <Badge text="Trusted Network" subtext="Verified Users" icon={<Users className="w-4 h-4" />} />
             <Badge text="Secure Payments" subtext="Escrow Protected" icon={<Lock className="w-4 h-4" />} />
             <Badge text="24/7 Support" subtext="Always Here" icon={<Phone className="w-4 h-4" />} />
          </div>


        </div>

        {/* Role Cards Grid */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-12 z-10"
        >
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            const IconComponent = role.icon;
            
            return (
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                }}
                key={role.id}
                onClick={() => onComplete(role.id)}
                className={`relative rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col h-full overflow-hidden ${
                  isSelected 
                    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-105' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-500 hover:scale-110"
                  style={{ backgroundImage: `url(${role.image})` }}
                ></div>
                
                <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${isSelected ? 'bg-[#050914]/40' : 'bg-[#050914]/60 hover:bg-[#050914]/30'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050914]/90 via-[#050914]/40 to-transparent z-0"></div>

                <div className="relative z-10 p-5 flex flex-col h-full">
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-blue-500 bg-white rounded-full shadow-lg">
                      <CheckCircle className="w-5 h-5 fill-blue-500 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4 mt-auto pt-16">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isSelected ? 'bg-blue-500/80 text-white backdrop-blur-md' : 'bg-black/50 text-slate-200 backdrop-blur-md'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
                      <h4 className="text-sm font-bold text-white leading-tight drop-shadow-md">{role.title}</h4>
                      <p className="text-[10px] text-slate-200 mt-0.5 drop-shadow-md">{role.subtitle}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-between items-center px-8 py-4 border-t border-white/5 text-[10px] text-slate-500">
        <div>&copy; 2026 StayLink. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
          <a href="#" className="hover:text-slate-300">Security</a>
          <a href="#" className="hover:text-slate-300">Help Center</a>
        </div>
        <div className="flex items-center gap-1">
          Design <Heart className="w-3 h-3 text-red-500 fill-red-500" />by Kepler Camp Codes.
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A1220] border border-blue-900/50 rounded-3xl w-full max-w-sm p-8 shadow-[0_0_50px_rgba(37,99,235,0.1)] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthStep('input');
                setEmailOrPhone('');
                setVerificationCode('');
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {authStep === 'input' 
                  ? (authMode === 'login' ? 'Welcome Back' : 'Create Account') 
                  : 'Verify Securely'}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                {authStep === 'input' 
                  ? 'Enter your email or phone number to continue. No password required.'
                  : `We sent a temporary code to ${emailOrPhone}`}
              </p>
            </div>

            {authStep === 'input' ? (
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. hello@example.com or +254..."
                    className="w-full bg-[#0B1525] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-bold shadow-lg transition mt-2 cursor-pointer"
                >
                  Send Login Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex flex-shrink-0 items-center justify-center text-blue-400 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1">Preview Mode</h4>
                    <p className="text-xs text-blue-100/70 mb-2">Since this is a preview without an SMS/Email gateway, use this mockup code to proceed:</p>
                    <div className="bg-blue-950/50 inline-block px-3 py-1.5 rounded-lg border border-blue-500/30 text-white font-mono text-lg tracking-[0.2em] font-bold">
                      {expectedCode}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-[#0B1525] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-center tracking-widest font-mono text-lg"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-bold shadow-lg transition mt-2 cursor-pointer"
                >
                  Verify & Continue
                </button>
                <div className="text-center mt-2">
                  <button 
                    type="button" 
                    onClick={() => setAuthStep('input')}
                    className="text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Change Email/Phone
                  </button>
                </div>
              </form>
            )}

            {authStep === 'input' && (
              <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-2 text-center">
                <p className="text-[10px] text-slate-500">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                </p>
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                >
                  {authMode === 'login' ? 'Register here' : 'Login here'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
    </svg>
  );
}

function Badge({ text, subtext, icon }: { text: string; subtext: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
      <div className="text-blue-400">
        {icon}
      </div>
      <div className="text-left">
        <div className="text-xs font-bold text-white leading-tight">{text}</div>
        <div className="text-[9px] text-slate-400">{subtext}</div>
      </div>
    </div>
  );
}
