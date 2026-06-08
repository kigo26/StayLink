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

  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setAuthError(null);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth, googleProvider } = await import('../firebase');
      
      const result = await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
      onComplete(selectedRole || 'tenant');
    } catch (err: any) {
      console.error("Auth error:", err);
      // Fallback for AI Studio preview if auth popup blocked
      setAuthError(err.message || "Failed to sign in. Popups might be blocked in this environment.");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans flex flex-col relative w-full overflow-y-auto">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30 blur-sm" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80')` }}
      ></div>
      <div className="absolute inset-0 z-0 bg-[#030712]/70"></div>
      
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
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Continue with Google for secure access
              </p>
            </div>

             <button
               onClick={handleGoogleAuth}
               className="w-full py-3 bg-white text-black hover:bg-slate-100 rounded-xl text-sm font-bold shadow-lg transition flex items-center justify-center gap-3 cursor-pointer"
             >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
               </svg>
               Continue with Google
             </button>

             {authError && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center flex flex-col gap-2"
               >
                 <span><ShieldCheck className="w-4 h-4 inline mr-1 opacity-70"/>{authError}</span>
                 <p className="text-[10px] text-slate-400">Previews might block popups. You can continue securely in emulator mode.</p>
                 <button
                   onClick={() => onComplete(selectedRole || 'tenant')}
                   className="mt-1 py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                 >
                   Continue in Emulator <ArrowRight className="w-3 h-3" />
                 </button>
               </motion.div>
             )}

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
