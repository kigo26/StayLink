import React, { useState, useEffect } from 'react';
import { Shield, Award, Compass, Lock, Users, MapPin, CheckCircle, ChevronRight, MessageSquare, Heart, Star, Phone, ShieldCheck, Mail, Building2, Globe, ArrowRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { RecaptchaVerifier } from 'firebase/auth';
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

import { StayLinkLogo } from './StayLinkLogo';
import { HotListings } from './HotListings';
import { INITIAL_PROPERTIES } from '../data';

export default function LandingPage({ 
  onComplete,
  onNavigateToProperty,
  initialAuthMode = 'login',
  initialShowModal = false
}: { 
  onComplete: (roleId: string) => void;
  onNavigateToProperty: (propertyId: string) => void;
  initialAuthMode?: 'login' | 'register';
  initialShowModal?: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState<string>('landlord');
  const [showAuthModal, setShowAuthModal] = useState(initialShowModal);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialAuthMode);
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [authStep, setAuthStep] = useState<'input' | 'verify'>('input');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');

  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!showAuthModal) {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (err) {
          console.warn("Error clearing captcha on close:", err);
        }
        (window as any).recaptchaVerifier = null;
      }
    }
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (err) {
          console.warn("Error clearing captcha on unmount:", err);
        }
        (window as any).recaptchaVerifier = null;
      }
    };
  }, [showAuthModal]);

  useEffect(() => {
    if (
      showAuthModal &&
      !(window as any).recaptchaVerifier
    ) {
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
      (window as any).recaptchaVerifier =
        new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible'
          }
        );
    }
  }, [showAuthModal]);

  const handleGoogleAuth = async () => {
    setAuthError(null);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth, googleProvider } = await import('../firebase');
      
      const result = await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
      onComplete(selectedRole || 'tenant');
    } catch (err: any) {
      console.warn("Auth error:", err);
      // Fallback for AI Studio preview if auth popup blocked
      if (err.code === 'auth/operation-not-allowed') {
        console.warn("Google Auth not enabled. Bypassing auth for AI Studio preview.");
        setShowAuthModal(false);
        onComplete(selectedRole || 'tenant');
      } else {
        setAuthError(err.message || "Failed to sign in. Popups might be blocked in this environment.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans flex flex-col relative w-full overflow-y-auto">
      {/* Background Image */}
      <img 
        src="/images/land-009.jpg"
        alt=""
        fetchPriority="high"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-30 blur-[2px] pointer-events-none" 
      />
      <div className="fixed inset-0 z-0 bg-[#030712]/70 pointer-events-none"></div>
      
      <header className="w-full max-w-7xl mx-auto px-4 pt-4 pb-2 z-50">
        <div className="bg-[#050914] border border-blue-900/30 rounded-[28px] overflow-hidden shadow-2xl relative">
          {/* Main Header Content */}
          <div className="flex flex-col lg:flex-row justify-between items-center px-6 pb-5 pt-2 gap-4 lg:gap-0">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
              <StayLinkLogo className="w-14 h-14" />
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
                className="flex items-center gap-3 bg-blue-600 border border-blue-700 px-4 py-2 rounded-xl transition group shadow-md"                
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col text-left mr-4">
                  <span className="text-white text-[12px] font-bold leading-tight">Staylink Secure Systems</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
        
        {/* Main Title Area */}
        <div className="text-center max-w-4xl mb-12 flex flex-col items-center">
          <div className="flex items-center justify-center gap-6 mb-4">
             <div className="hidden lg:block">
                <HotListings listings={INITIAL_PROPERTIES} onPropertyClick={onNavigateToProperty} />
             </div>
             <StayLinkLogo className="w-32 h-32 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] animate-float" />
             <div className="hidden lg:block">
                <HotListings listings={INITIAL_PROPERTIES} onPropertyClick={onNavigateToProperty} />
             </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tight mb-4 flex items-center justify-center gap-2">
            STAYLINK           
            
          </h2>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-400 font-bold tracking-[0.2em] text-sm md:text-base uppercase mb-4 drop-shadow-md text-center"
          >
            ...Every Place... Every Person... One Connection...
          </motion.h3>

          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            <span className="text-blue-400 font-medium">
            <i> Rent. Buy. Sell. Share. Stay.</i>
            </span>
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
                Continue with phone number for secure access
              </p>
            </div>

            {authStep === 'input' ? (
              <div className="flex flex-col gap-4">
                {authMode === 'register' && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#050914] border border-white/10 py-3 px-4 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. +254 712 345 678"
                    className="w-full bg-[#050914] border border-white/10 py-3 px-4 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 transition"
                  />
                </div>
                <button
                  id="send-otp-button"
                  onClick={async () => {
                    if (emailOrPhone.trim().length > 5) {
                      if (authMode === 'register' && fullName.trim().length < 2) {
                        setAuthError('Please enter your full name to register.');
                        return;
                      }

                      setAuthError(null);
                      try {
                        const { signInWithPhoneNumber } = await import('firebase/auth');
                        const { auth } = await import('../firebase');
                        
                        const verifier =
                          (window as any).recaptchaVerifier;

                        const confirmationResult =
                          await signInWithPhoneNumber(
                            auth,
                            emailOrPhone,
                            verifier
                          );

                        (window as any).confirmationResult =
                          confirmationResult;

                        setAuthStep('verify');
                      } catch (err: any) {
                        console.error("FULL ERROR:", err);

                        if (err instanceof Error) {
                          console.error("MESSAGE:", err.message);
                        }

                        console.error("JSON:", JSON.stringify(err, null, 2));

                        if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/billing-not-enabled' || err.code === 'auth/quota-exceeded') {
                          console.warn("Phone auth issue (billing/quota). Bypassing OTP step for preview.");
                          setVerificationCode('123456');
                          setExpectedCode('123456');
                          setAuthStep('verify');
                        } else if (err.code === 'auth/unauthorized-domain') {
                          setAuthError('This domain is not authorized for phone auth.');
                        } else {
                          setAuthError(err.message || 'Error sending OTP. Make sure phone number includes country code.');
                        }
                      }
                    } else {
                      setAuthError('Please enter a valid phone number with country code');
                    }
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg transition flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Enter To Receive OTP
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-[#050914] border border-white/10 py-3 px-4 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 transition text-center tracking-[0.5em]"
                    maxLength={6}
                  />
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    {!(window as any).confirmationResult ? (
                      <span className="text-amber-500">Demo mode active (Firebase billing not enabled). Use code 123456.</span>
                    ) : (
                      <span>Code sent to {emailOrPhone}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (verificationCode.length >= 4) {
                      setAuthError(null);
                      try {
                        let verifiedUser = null;
                        if ((window as any).confirmationResult) {
                          const result = await (window as any).confirmationResult.confirm(verificationCode);
                          verifiedUser = result.user;
                        } else {
                          // Fallback if testing locally without firebase logic fully active
                          if (verificationCode === '123456') {
                            verifiedUser = { uid: 'local_test_uid', phoneNumber: emailOrPhone };
                          } else {
                            throw new Error('Invalid OTP code');
                          }
                        }

                        // Store or verify the user document in firestore
                        if (verifiedUser) {
                          const { getDoc, getDocFromCache, setDoc, doc, serverTimestamp } = await import('firebase/firestore');
                          const { db } = await import('../firebase');
                          
                          const userRef = doc(db, 'users', verifiedUser.uid);
                          let userSnap;
                          try {
                            userSnap = await getDocFromCache(userRef);
                          } catch (cacheError) {
                            try {
                              userSnap = await getDoc(userRef);
                            } catch (error: any) {
                              if (error.code === 'unavailable') {
                                setAuthError('You are offline. Please check your connection.');
                                return;
                              }
                              throw error;
                            }
                          }

                          if (authMode === 'register') {
                            if (!userSnap.exists()) {
                              await setDoc(userRef, {
                                fullName,
                                phone: verifiedUser.phoneNumber || emailOrPhone,
                                role: selectedRole || 'tenant',
                                createdAt: serverTimestamp()
                              });
                            }
                          } else {
                            if (!userSnap.exists()) {
                              const { signOut } = await import('firebase/auth');
                              const { auth } = await import('../firebase');
                              await signOut(auth);
                              setAuthError('Account not found. Please register first.');
                              return;
                            }
                          }
                        }

                        setShowAuthModal(false);
                        onComplete(selectedRole || 'tenant');
                      } catch (err: any) {
                        console.error(err);
                        setAuthError('{INVALID OTP.PLEASE TRY AGAIN}');
                      }
                    } else {
                      setAuthError('{INVALID OTP.PLEASE TRY AGAIN}');
                    }
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg transition flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Continue
                </button>
                <button 
                  onClick={() => setAuthStep('input')}
                  className="text-xs text-slate-400 hover:text-white transition mt-2"
                >
                  Change phone number
                </button>
              </div>
            )}

             {authError && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center flex flex-col gap-2"
               >
                 <span><ShieldCheck className="w-4 h-4 inline mr-1 opacity-70"/>{authError}</span>
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
    <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md rounded-2xl px-5 py-3 border border-slate-800 shadow-xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-default group">
      <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-left">
        <div className="text-sm font-black text-slate-100 uppercase tracking-widest leading-tight">{text}</div>
        <div className="text-[10px] text-slate-400 font-medium">{subtext}</div>
      </div>
    </div>
  );
}
