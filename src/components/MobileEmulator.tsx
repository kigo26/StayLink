/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Shield, MapPin, Sparkles, User, Users, Heart, MessageSquare, 
  ChevronLeft, Play, Pause, Compass, Share2, DollarSign, Wallet, Phone, 
  Video, Check, AlertTriangle, Menu, Send, Mic, BadgePercent, Lock, 
  Award, QrCode, Globe, CheckCircle2, RotateCcw, Flame, Bus, LogOut,
  Smartphone, ShieldCheck, RefreshCw, Plus, Image as ImageIcon, Camera,
  Mail, Map, List, Star, ChevronRight
} from 'lucide-react';
import { Property, RoommateProfile, UserProfile, Message, ChatSession, Booking, Transaction, PlatformStats } from '../types';
import AdminConsole from './AdminConsole';
import MapTracker from './MapTracker';
import AddPropertyScreen from './AddPropertyScreen';
import CohortPreferencesScreen from './CohortPreferencesScreen';
import ExploreInlineMap from './ExploreInlineMap';
import PropertyComparer from './PropertyComparer';
import PropertyReviewSection from './PropertyReviewSection';
import VirtualTourOverlay from './VirtualTourOverlay';
import { ErrorBoundary } from './ErrorBoundary';
import { useSystemRecovery } from '../hooks/useSystemRecovery';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

interface EmulatorProps {
  properties: Property[];
  roommates: RoommateProfile[];
  currentUser: UserProfile;
  chats: ChatSession[];
  messagesList: Record<string, Message[]>;
  onStateUpdate: (data: {
    properties?: Property[];
    roommates?: RoommateProfile[];
    chats?: ChatSession[];
    messagesList?: Record<string, Message[]>;
    transactions?: Transaction[];
  }) => void;
  transactions: Transaction[];
  onAddTransaction: (trx: Transaction) => void;
  onAddBooking: (booking: Booking) => void;
  stats: PlatformStats;
  bookings: Booking[];
  onUpdateBookings: (bookings: Booking[]) => void;
}

const pageTransitions = {
  initial: { opacity: 0, x: 25 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -25 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

const REGISTRATION_ROLES = [
  {
    id: 'tenant',
    title: 'Tenant Student/Guest',
    level: 'REQUIREMENTS:',
    description: 'National ID, M-Pesa Number, Next of Kin docs.',
    icon: Shield,
    bgIcon: 'bg-rose-50',
    textIcon: 'text-rose-500',
    textColor: 'text-rose-400',
    glow: 'shadow-rose-500/20 border-rose-500/40 focus:border-rose-500/60',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    profile: {
      uid: 'user_john_doe',
      name: 'Tenant Protocol',
      email: 'tenant@staylink.co.ke',
      phone: '+254 712 345 678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      role: 'tenant' as const,
      isVerified: false,
      verificationBadges: [] as any,
      walletBalance: 0,
      referralCode: 'TENANT1',
      referralsCount: 0,
      referralPoints: 0,
      level: 1,
      currentStreak: 0,
      createdAt: '2026-05-01T12:00:00Z',
      language: 'en' as const
    }
  },
  {
    id: 'landlord',
    title: 'Verified Landlord/Host',
    level: 'REQUIREMENTS:',
    description: 'Title Deed, KRA Pin, Personal ID, Bank Details.',
    icon: Award,
    bgIcon: 'bg-blue-50',
    textIcon: 'text-blue-500',
    textColor: 'text-blue-400',
    glow: 'shadow-blue-500/20 border-blue-500/40 focus:border-blue-500/60',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop',
    profile: {
      uid: 'landlord_amina',
      name: 'Landlord Node',
      email: 'host@staylink.co.ke',
      phone: '+254 722 987 654',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop',
      role: 'landlord' as const,
      isVerified: false,
      verificationBadges: [] as any,
      walletBalance: 0,
      referralCode: 'HOSTAMI',
      referralsCount: 0,
      referralPoints: 0,
      level: 1,
      currentStreak: 0,
      createdAt: '2026-04-10T08:00:00Z',
      language: 'en' as const
    }
  },
  {
    id: 'agency',
    title: 'Agency / Property Broker',
    level: 'REQUIREMENTS:',
    description: 'Certificate of Incorporation, Broker License, Directors ID.',
    icon: Compass,
    bgIcon: 'bg-emerald-50',
    textIcon: 'text-emerald-500',
    textColor: 'text-emerald-400',
    glow: 'shadow-emerald-500/20 border-emerald-500/40 focus:border-emerald-500/60',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
    profile: {
      uid: 'agency_mwangi_k',
      name: 'Agency Director',
      email: 'agency@staylink.co.ke',
      phone: '+254 701 555 444',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
      role: 'landlord' as const,
      isVerified: false,
      verificationBadges: [] as any,
      walletBalance: 0,
      referralCode: 'AGENCYKN',
      referralsCount: 0,
      referralPoints: 0,
      level: 1,
      currentStreak: 0,
      createdAt: '2026-02-01T08:00:00Z',
      language: 'en' as const
    }
  },
  {
    id: 'seller',
    title: 'Property Buyer / Seller',
    level: 'REQUIREMENTS:',
    description: 'Proof of Funds, Identity Card, KRA Pin.',
    icon: Lock,
    bgIcon: 'bg-amber-50',
    textIcon: 'text-amber-500',
    textColor: 'text-amber-400',
    glow: 'shadow-amber-500/20 border-amber-500/40 focus:border-amber-500/60',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
    profile: {
      uid: 'seller_auditor',
      name: 'Seller Account',
      email: 'sales@staylink.co.ke',
      phone: '+254 799 111 222',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
      role: 'tenant' as const,
      isVerified: false,
      verificationBadges: [] as any,
      walletBalance: 0,
      referralCode: 'SALE77',
      referralsCount: 0,
      referralPoints: 0,
      level: 1,
      currentStreak: 0,
      createdAt: '2025-01-01T00:00:00Z',
      language: 'en' as const
    }
  },
  {
    id: 'cohort',
    title: 'Joint Cohort / Group',
    level: 'REQUIREMENTS:',
    description: 'School IDs for all members, guarantor forms.',
    icon: Users,
    bgIcon: 'bg-slate-50',
    textIcon: 'text-slate-500',
    textColor: 'text-slate-400',
    glow: 'shadow-neutral-500/20 border-neutral-500/40 focus:border-neutral-500/60',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=300&auto=format&fit=crop',
    profile: {
      uid: 'cohort_wanjiku',
      name: 'Cohort Member',
      email: 'cohort@staylink.co.ke',
      phone: '+254 718 222 333',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=300&auto=format&fit=crop',
      role: 'tenant' as const,
      isVerified: false,
      verificationBadges: [] as any,
      walletBalance: 0,
      referralCode: 'TEAMW',
      referralsCount: 0,
      referralPoints: 0,
      level: 1,
      currentStreak: 0,
      createdAt: '2026-03-15T10:00:00Z',
      language: 'en' as const
    }
  }
];

function PropertyImageCarousel({ images, qualityScore }: { images: string[], qualityScore: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="relative h-64 w-full bg-neutral-200 overflow-hidden shadow-xs group">
      <div 
        id="property-image-carousel"
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
      >
        {images.map((img, idx) => (
          <div key={idx} className="h-full min-w-full flex-shrink-0 snap-center relative">
            <img src={img} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows for mouse users (visible on hover) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={() => {
              const el = document.getElementById('property-image-carousel');
              if (el && currentIndex > 0) el.scrollTo({ left: (currentIndex - 1) * el.clientWidth, behavior: 'smooth' });
            }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${currentIndex === 0 ? 'hidden' : 'block'}`}
            title="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('property-image-carousel');
              if (el && currentIndex < images.length - 1) el.scrollTo({ left: (currentIndex + 1) * el.clientWidth, behavior: 'smooth' });
            }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${currentIndex === images.length - 1 ? 'hidden' : 'block'}`}
            title="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Top Counter Badge */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest uppercase shadow-sm pointer-events-none z-10 border border-white/10">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Quality Score overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end">
        <div className="mb-4 ml-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white tracking-widest uppercase font-mono pointer-events-auto border border-white/10">
          📊 QUALITY SCORE: {qualityScore}%
        </div>
      </div>
      
      {/* Visual dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5 pointer-events-none">
          {images.map((_, idx) => (
            <div 
              key={`dot-${idx}`} 
              className={`h-1.5 rounded-full shadow-sm transition-all duration-300 ${
                currentIndex === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'
              }`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileEmulator({
  properties,
  roommates,
  currentUser,
  chats,
  messagesList,
  onStateUpdate,
  transactions,
  onAddTransaction,
  onAddBooking,
  stats,
  bookings,
  onUpdateBookings
}: EmulatorProps) {
  // Mobile UI Navigation State
  // 'welcome' | 'face_scan' | 'explore' | 'tiktok_feed' | 'roommate' | 'details' | 'chat' | 'checkout' | 'receipt' | 'profile'
  const [activeScreen, setActiveScreen] = useState<string>('explore');
  const [faceScanOrigin, setFaceScanOrigin] = useState<string>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>(currentUser);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('tenant');

  // OTP Auth States
  const [authTab, setAuthTab] = useState<'register' | 'otp_login'>('register');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginInput, setLoginInput] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [otpTimerActive, setOtpTimerActive] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);

  // OTP Countdown Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (otpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setOtpTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [otpTimer, otpTimerActive]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiSearchRapport, setAiSearchRapport] = useState('');

  const getAvailableProps = (props: Property[], typeFilter: string = 'all') => {
    return props.filter(p => 
      !p.isFlagged && 
      (p.verificationStatus === 'verified' || p.verifiedByAdmin || p.verificationStatus === undefined) &&
      p.availabilityStatus !== 'booked' && 
      p.availabilityStatus !== 'sold' && 
      p.availabilityStatus !== 'rented' &&
      (typeFilter === 'all' || p.type === typeFilter)
    );
  };

  const [filteredProperties, setFilteredProperties] = useState<Property[]>(getAvailableProps(properties));
  const [selectedType, setSelectedType] = useState<string>('all');
  const [exploreViewMode, setExploreViewMode] = useState<'grid' | 'map'>('grid');

  // Property Comparison states
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isVirtualTourOpen, setIsVirtualTourOpen] = useState(false);

  const handleToggleCompare = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparedProperties((prev) => {
      const alreadyAdded = prev.some((p) => p.id === property.id);
      if (alreadyAdded) {
        const cleaned = prev.filter((p) => p.id !== property.id);
        setRefreshNotification(`Removed "${property.title}" from comparison.`);
        setTimeout(() => setRefreshNotification(null), 3000);
        return cleaned;
      }
      if (prev.length >= 3) {
        setRefreshNotification('⚠️ Limit reached: You can compare up to 3 properties side-by-side.');
        setTimeout(() => setRefreshNotification(null), 4500);
        return prev;
      }
      const updated = [...prev, property];
      setRefreshNotification(`✨ Added "${property.title}" to compare list.`);
      setTimeout(() => setRefreshNotification(null), 3000);
      return updated;
    });
  };

  const handleRemoveComparedProperty = (id: string) => {
    setComparedProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAllCompared = () => {
    setComparedProperties([]);
  };

  // Interactive details state
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [showTransportHubs, setShowTransportHubs] = useState<boolean>(false);
  const [showCrimeZones, setShowCrimeZones] = useState<boolean>(false);
  
  // Interactive Roommate Matching State
  const [activePartner, setActivePartner] = useState<RoommateProfile | null>(null);
  const [roommateMatchScore, setRoommateMatchScore] = useState<number | null>(null);
  const [roommateMatchReport, setRoommateMatchReport] = useState<string>('');
  const [roommateMatchedCategories, setRoommateMatchedCategories] = useState<any>(null);
  const [isLoadingRoommateAI, setIsLoadingRoommateAI] = useState(false);

  // Live Chat state
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [simulatedRecording, setSimulatedRecording] = useState(false);

  // Checkout and Fintech M-Pesa state
  const [stkPushActive, setStkPushActive] = useState(false);
  const [stkPin, setStkPin] = useState('');
  const [stkPushError, setStkPushError] = useState('');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // Gamification state
  const [streakSaved, setStreakSaved] = useState(false);

  // Face Scan State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [faceScanningState, setFaceScanningState] = useState<'idle' | 'seeking' | 'analyzing' | 'done'>('idle');

  // Document Scan State
  const docVideoRef = useRef<HTMLVideoElement | null>(null);
  const docCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [docCameraStream, setDocCameraStream] = useState<MediaStream | null>(null);
  const [docScanningState, setDocScanningState] = useState<'idle' | 'seeking' | 'analyzing' | 'done'>('idle');
  const [capturedDocImage, setCapturedDocImage] = useState<string | null>(null);

  // TikTok feed state
  const [tiktokIndex, setTiktokIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);

  // Pull-to-refresh integration state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState(0); // For pull progress visual indicator

  // System Recovery Hook integration
  const { isRecovering, triggerRecovery, retryCount, maxRetries } = useSystemRecovery({
    onRetry: async () => {
      // Execute the pull to refresh logic as the recovery mechanism
      await handlePullToRefresh();
    },
    baseDelayMs: 1500
  });

  // Handle pull-to-refresh and fetch listings from Firebase
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    setPullProgress(100);
    setRefreshNotification(null);

    try {
      // Sign in anonymously if not already signed in to bypass firestore.rules permission guard safely
      if (!auth.currentUser) {
        console.log('[StayLink Auth] Authenticating anonymously to enable authorized database queries...');
        try {
          await signInAnonymously(auth);
        } catch (authErr: any) {
          console.warn('[StayLink Auth] Anonymous auth failed:', authErr.message);
        }
      }

      // Query real properties collection in Firestore
      const propertiesCol = collection(db, 'properties');
      const qSnapshot = await getDocs(propertiesCol);
      
      let fetchedListings: Property[] = [];
      qSnapshot.forEach((docSnap) => {
        fetchedListings.push(docSnap.data() as Property);
      });

      if (fetchedListings.length === 0) {
        // If Firestore brand-new sandbox database is current empty, bootstrap it with existing list!
        console.log('[StayLink Sync] No properties in Firestore. Bootstrapping initial database...');
        for (const prop of properties) {
          await setDoc(doc(db, 'properties', prop.id), prop);
        }
        fetchedListings = [...properties];
        setRefreshNotification('🎉 Database bootstrapped & compiled nicely in Firestore!');
      } else {
        // Update App Global state using onStateUpdate
        onStateUpdate({ properties: fetchedListings });
        const unflagged = fetchedListings.filter(p => !p.isFlagged);
        setRefreshNotification(`✅ Loaded ${unflagged.length} verified listings from Firebase Firestore!`);
      }
    } catch (err: any) {
      console.warn('[StayLink Sync] Firestore offline/auth fallback:', err);
      // Fallback: Simulate fetching premium listings from database, adding a new premium listing to showcase loading dynamic updates!
      const animatedNewProperty: Property = {
        id: `prop_refreshed_${Date.now()}`,
        title: 'Premium Sky-Garden Studio Westlands',
        description: 'Spectacular brand-new Nairobi Central executive residence featuring fully fitted kitchen, superfast fiber, gym room, security guard, & instant M-Pesa.',
        price: 32000,
        location: 'Westlands, Nairobi',
        coordinates: { lat: -1.2618, lng: 36.8049 },
        type: 'apartment',
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop'],
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['Fiber WiFi', 'Escrow Guard', 'Gym', 'Balcony'],
        landlordId: 'user_amina',
        landlordName: 'Amina Cherono',
        landlordAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
        aiQualityScore: 98,
        neighborhoodMetrics: {
          safety: 92,
          transit: 87,
          noise: 25,
          hospitalsNear: 3,
          schoolsNear: 4,
          mallsNear: 2,
          commuteToCBD: '10 mins driving'
        },
        responseSpeedMinutes: 4,
        bookingSuccessRate: 97,
        isPromoted: true,
        isFlagged: false,
        createdAt: new Date().toISOString(),
        likesCount: 12,
        commentsCount: 3
      };

      // Append new stay at the top (remove duplicative names if any)
      const mergedList = [animatedNewProperty, ...properties];
      const uniqueListSet = Array.from(new Map(mergedList.map(p => [p.title, p])).values()) as Property[];
      onStateUpdate({ properties: uniqueListSet });
      setRefreshNotification('💫 Local index re-aligned. Added new Elite Stay in Westlands!');
    } finally {
      setIsRefreshing(false);
      setPullProgress(0);
      // Hide notification bar after 4 seconds
      setTimeout(() => setRefreshNotification(null), 4000);
    }
  };

  // Synchronize listing changes
  useEffect(() => {
    setFilteredProperties(getAvailableProps(properties, selectedType));
  }, [properties, selectedType]);

  // Handle Search using server API
  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredProperties(getAvailableProps(properties, selectedType));
      setAiSearchRapport('');
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, properties })
      });
      const data = await response.json();
      if (data.success) {
        setFilteredProperties(getAvailableProps(data.results, selectedType));
        setAiSearchRapport(data.aiResponse);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Start Camera for facial verification
  const startCameraScan = async () => {
    setFaceScanningState('seeking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setFaceScanningState('analyzing');
      
      // Simulate face analysis
      setTimeout(() => {
        setFaceScanningState('done');
        // Add facial_verified badge
        const updatedBadges = [...userProfile.verificationBadges];
        if (!updatedBadges.includes('facial_verified')) {
          updatedBadges.push('facial_verified');
        }
        setUserProfile(prev => ({
          ...prev,
          isVerified: true,
          verificationBadges: updatedBadges
        }));
        
        // Stop stream
        stream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }, 3500);
    } catch (err) {
      // In case iframe has camera blocked or no camera, simulate elegantly!
      console.warn('Camera blocked or not available, simulating biometric scanning:', err);
      setFaceScanningState('analyzing');
      setTimeout(() => {
        setFaceScanningState('done');
        const updatedBadges = [...userProfile.verificationBadges];
        if (!updatedBadges.includes('facial_verified')) {
          updatedBadges.push('facial_verified');
        }
        setUserProfile(prev => ({
          ...prev,
          isVerified: true,
          verificationBadges: updatedBadges
        }));
      }, 3500);
    }
  };

  const startDocScan = async () => {
    setDocScanningState('seeking');
    setCapturedDocImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setDocCameraStream(stream);
      if (docVideoRef.current) {
        docVideoRef.current.srcObject = stream;
      }
      setDocScanningState('analyzing');
    } catch (err) {
      console.warn('Camera for doc scan failed or blocked:', err);
      // fallback simulation
      setDocScanningState('analyzing');
      setTimeout(() => {
        setCapturedDocImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=');
        setDocScanningState('done');
        const updatedBadges = [...userProfile.verificationBadges];
        if (!updatedBadges.includes('lease_verified')) {
          updatedBadges.push('lease_verified');
        }
        setUserProfile(prev => ({
          ...prev,
          verificationBadges: updatedBadges
        }));
      }, 2500);
    }
  };

  const captureDocument = () => {
    if (docVideoRef.current && docCanvasRef.current) {
      const video = docVideoRef.current;
      const canvas = docCanvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedDocImage(dataUrl);
      }
      
      docCameraStream?.getTracks().forEach(track => track.stop());
      setDocCameraStream(null);
      setDocScanningState('done');

      const updatedBadges = [...userProfile.verificationBadges];
      if (!updatedBadges.includes('lease_verified')) {
        updatedBadges.push('lease_verified');
      }
      setUserProfile(prev => ({
        ...prev,
        verificationBadges: updatedBadges
      }));
    }
  };

  // Run roommate compatibility match with server AI
  const triggerRoommateMatch = async (partner: RoommateProfile) => {
    setActivePartner(partner);
    setIsLoadingRoommateAI(true);
    setRoommateMatchScore(null);
    setRoommateMatchReport('');
    setActiveScreen('roommate');

    try {
      const response = await fetch('/api/roommate-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myProfile: {
            uid: userProfile.uid,
            name: userProfile.name,
            avatar: userProfile.avatar,
            age: 26,
            gender: 'Male',
            occupation: 'Business Analyst',
            budget: 20000,
            lifestyle: ['Quiet', 'Early Bird', 'Coffee addict'],
            cleanliness: 'High',
            sleepSchedule: 'Early Bird',
            hobbies: ['Gym', 'Cycling', 'Podcasts']
          },
          partnerProfile: partner
        })
      });
      const data = await response.json();
      if (data.success) {
        setRoommateMatchScore(data.score);
        setRoommateMatchReport(data.analysis);
        setRoommateMatchedCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRoommateAI(false);
    }
  };

  // Trigger property details screen (and trigger AI Fraud Check)
  const viewPropertyDetails = (property: Property) => {
    setActiveProperty(property);
    setActiveScreen('details');
  };

  // Open active chat or create dynamic session
  const openChatWithLandlord = (property: Property) => {
    let existing = chats.find(c => c.propertyId === property.id);
    if (!existing) {
      const newSession: ChatSession = {
        id: `chat_${Date.now()}`,
        propertyId: property.id,
        propertyTitle: property.title,
        participantA: { uid: userProfile.uid, name: userProfile.name, avatar: userProfile.avatar, role: 'tenant' },
        participantB: { uid: property.landlordId, name: property.landlordName, avatar: property.landlordAvatar, role: 'landlord' },
        lastMessageText: `Hi ${property.landlordName}, I would like to query about ${property.title}`,
        lastMessageTimestamp: new Date().toISOString(),
        hasUnread: false
      };
      // Append message list
      const initialMsgs: Message[] = [
        {
          id: `msg_init_${Date.now()}`,
          chatSessionId: newSession.id,
          senderId: property.landlordId,
          senderName: property.landlordName,
          senderAvatar: property.landlordAvatar,
          text: `Karibu sana! I am ${property.landlordName}, the landlord. Ask me anything about ${property.title}, amenities or key viewing!`,
          timestamp: new Date().toISOString(),
          isRead: true
        }
      ];
      onStateUpdate({
        chats: [newSession, ...chats],
        messagesList: { ...messagesList, [newSession.id]: initialMsgs }
      });
      setActiveChat(newSession);
      setChatMessages(initialMsgs);
    } else {
      setActiveChat(existing);
      setChatMessages(messagesList[existing.id] || []);
    }
    setActiveScreen('chat');
  };

  // Reply message and invoke landlord chatbot auto reply
  const sendChatMessage = async (textToSend?: string) => {
    const finalMsg = textToSend || replyInput.trim();
    if (!finalMsg || !activeChat) return;

    const tenantMsg: Message = {
      id: `msg_${Date.now()}`,
      chatSessionId: activeChat.id,
      senderId: userProfile.uid,
      senderName: userProfile.name,
      senderAvatar: userProfile.avatar,
      text: finalMsg,
      timestamp: new Date().toISOString(),
      isRead: true
    };

    const updatedHistory = [...chatMessages, tenantMsg];
    setChatMessages(updatedHistory);
    if (!textToSend) setReplyInput('');

    // Update global state
    const updatedMessagesList = { ...messagesList, [activeChat.id]: updatedHistory };
    const updatedChats = chats.map(c => 
      c.id === activeChat.id ? { ...c, lastMessageText: finalMsg, lastMessageTimestamp: new Date().toISOString() } : c
    );
    onStateUpdate({ chats: updatedChats, messagesList: updatedMessagesList });

    // AI Landlord Bot Response
    setIsTyping(true);
    try {
      const propertyCtx = properties.find(p => p.id === activeChat.propertyId) || properties[0];
      const botResponse = await fetch('/api/chat-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          contextProperty: propertyCtx
        })
      });
      const data = await botResponse.json();
      
      // Simulate real delay
      setTimeout(() => {
        setIsTyping(false);
        const landlordMsg: Message = {
          id: `msg_bot_${Date.now()}`,
          chatSessionId: activeChat.id,
          senderId: activeChat.participantB.uid,
          senderName: activeChat.participantB.name,
          senderAvatar: activeChat.participantB.avatar,
          text: data.reply,
          timestamp: new Date().toISOString(),
          isAI: true,
          isRead: false
        };

        const finalHistory = [...updatedHistory, landlordMsg];
        setChatMessages(finalHistory);

        // Update global state
        const updatedMessagesListBot = { ...messagesList, [activeChat.id]: finalHistory };
        const updatedChatsBot = chats.map(c => 
          c.id === activeChat.id ? { ...c, lastMessageText: data.reply, lastMessageTimestamp: new Date().toISOString() } : c
        );
        onStateUpdate({ chats: updatedChatsBot, messagesList: updatedMessagesListBot });
      }, 1800);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  // Simulate audio message recording
  const startRecordingVoice = () => {
    setSimulatedRecording(true);
    setTimeout(() => {
      setSimulatedRecording(false);
      const voiceText = "🎤 voice note (0:04s)";
      const voiceMsg: Message = {
        id: `msg_voice_${Date.now()}`,
        chatSessionId: activeChat?.id || '',
        senderId: userProfile.uid,
        senderName: userProfile.name,
        senderAvatar: userProfile.avatar,
        text: voiceText,
        timestamp: new Date().toISOString(),
        hasVoice: true,
        voiceDuration: 4,
        isRead: true
      };
      if (activeChat) {
        const nextHist = [...chatMessages, voiceMsg];
        setChatMessages(nextHist);
        sendChatMessage("Sent a voice message regarding physical viewing");
      }
    }, 4000);
  };

  // Initiate STK Checkout Flow
  const handleInitiateSTK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty) return;
    setStkPushError('');
    setStkPushActive(true);
  };

  // Simulate M-Pesa STK Pin verification and automatic 10% commission deduction
  const verifySTKPayment = () => {
    if (!stkPin || stkPin.length < 4) {
      setStkPushError('Pin must be at least 4 digits');
      return;
    }
    setIsPaying(true);
    setStkPushError('');

    setTimeout(() => {
      const rentAmount = activeProperty!.price;
      const commission = Math.round(rentAmount * 0.10);
      const hostPayout = rentAmount - commission;
      const transactionCode = `MPM${Math.floor(Math.random() * 900000 + 100000)}B9`;

      // 1. Create durable Transaction (Escrow deposit)
      const newPaymentTrx: Transaction = {
        id: `trx_booking_${Date.now()}`,
        userId: userProfile.uid,
        userName: userProfile.name,
        bookingId: `bk_${Date.now()}`,
        propertyTitle: activeProperty!.title,
        type: 'booking_payment',
        amount: rentAmount,
        commissionCalculated: commission,
        provider: 'mpesa',
        reference: transactionCode,
        status: 'success',
        timestamp: new Date().toISOString()
      };
      
      // 2. Create durable Autopayout to Host
      const newPayoutTrx: Transaction = {
        id: `trx_payout_${Date.now()}`,
        userId: activeProperty!.landlordId,
        userName: activeProperty!.landlordName,
        bookingId: `bk_${Date.now()}`,
        propertyTitle: activeProperty!.title,
        type: 'booking_payout',
        amount: hostPayout,
        provider: 'wallet',
        reference: `WLT${Math.floor(Math.random() * 900000 + 100000)}D3`,
        status: 'success',
        timestamp: new Date().toISOString()
      };

      // 3. Create durable platform Commission Transaction
      const newCommTrx: Transaction = {
        id: `trx_comm_${Date.now()}`,
        userId: 'admin_staylink',
        userName: 'StayLink Admin Portal',
        bookingId: `bk_${Date.now()}`,
        propertyTitle: activeProperty!.title,
        type: 'commission_payout',
        amount: commission,
        provider: 'wallet',
        reference: `COM${Math.floor(Math.random() * 900000 + 100000)}F1`,
        status: 'success',
        timestamp: new Date().toISOString()
      };

      // Create booking record
      const newBooking: Booking = {
        id: `bk_${Date.now()}`,
        propertyId: activeProperty!.id,
        propertyTitle: activeProperty!.title,
        propertyImage: activeProperty!.images[0],
        tenantId: userProfile.uid,
        tenantName: userProfile.name,
        landlordId: activeProperty!.landlordId,
        payoutAmount: hostPayout,
        commissionAmount: commission,
        amountPaid: rentAmount,
        status: 'active',
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mpesaTransactionCode: transactionCode,
        createdAt: new Date().toISOString(),
        escrowStatus: 'held'
      };

      // Add to parents state
      onAddBooking(newBooking);
      onAddTransaction(newPaymentTrx);
      onAddTransaction(newPayoutTrx);
      onAddTransaction(newCommTrx);

      // Update property availability status
      const updatedProperties = properties.map(p => {
        if (p.id === activeProperty!.id) {
          const availability: 'sold' | 'booked' | 'rented' | 'available' = p.type === 'sale' ? 'sold' : 'booked';
          return { ...p, availabilityStatus: availability };
        }
        return p;
      });
      onStateUpdate({ properties: updatedProperties });

      // Deduct wallet local or update references
      setUserProfile(prev => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance - rentAmount),
        referralPoints: prev.referralPoints + 50 // Loyalty reward
      }));

      setCreatedBooking(newBooking);
      setStkPushActive(false);
      setIsPaying(false);
      setActiveScreen('receipt');
    }, 2500);
  };

  const handleSendOtp = () => {
    if (!loginInput.trim()) {
      setOtpError(loginMethod === 'phone' ? 'Please enter a valid phone number.' : 'Please enter a valid email address.');
      return;
    }
    
    // Simple email or phone validations
    if (loginMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginInput.trim())) {
        setOtpError('Invalid email format. E.g. user@example.com');
        return;
      }
    } else {
      const cleanPhone = loginInput.trim().replace(/[\s+-]+/g, '');
      if (cleanPhone.length < 8) {
        setOtpError('Invalid phone number. Matches standard Kenyan formats like 0722987654.');
        return;
      }
    }

    setOtpError('');
    // Generate code
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(generatedCode);
    setEnteredOtp('');
    setOtpSent(true);
    setOtpTimer(60);
    setOtpTimerActive(true);

    // Trigger push notification simulation
    const notice = loginMethod === 'phone' 
      ? `💬 StayLink SMShub: Secret OTP authorization code is ${generatedCode}.`
      : `✉️ StayLink Auth: Private login OTP passcode is ${generatedCode}.`;
      
    setOtpNotification(notice);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== otpCode) {
      setOtpError('Invalid OTP code. Please enter the exact 4-digit code.');
      return;
    }

    setOtpError('');
    setOtpSent(false);
    
    // Match against preexisting profiles
    const formattedInput = loginInput.trim().toLowerCase();
    const matchedRole = REGISTRATION_ROLES.find(role => {
      if (loginMethod === 'email') {
        return role.profile.email.toLowerCase() === formattedInput;
      } else {
        const cleanInput = formattedInput.replace(/[\s+-]+/g, '');
        const rolePhoneClean = role.profile.phone.replace(/[\s+-]+/g, '');
        return rolePhoneClean.endsWith(cleanInput) || cleanInput.endsWith(rolePhoneClean);
      }
    });

    if (matchedRole) {
      setUserProfile(matchedRole.profile);
      setSelectedRoleId(matchedRole.id);
      setOtpNotification(`🔓 Credentials Correct: Welcome back, ${matchedRole.profile.name}!`);
    } else {
      const isNewEmail = loginMethod === 'email';
      const newUid = `user_otp_${Math.floor(Math.random() * 90000 + 10000)}`;
      const newProfile: UserProfile = {
        uid: newUid,
        name: isNewEmail ? loginInput.split('@')[0] : `Guest Resident`,
        email: isNewEmail ? loginInput : 'guest_otp@staylink.co.ke',
        phone: !isNewEmail ? loginInput : '+254 700 000 000',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop',
        role: 'tenant',
        isVerified: true,
        verificationBadges: ['id_uploaded', 'phone_verified'],
        walletBalance: 25000,
        referralCode: `STAY_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        referralsCount: 0,
        referralPoints: 0,
        level: 1,
        currentStreak: 2,
        createdAt: new Date().toISOString(),
        language: 'en'
      };
      
      setUserProfile(newProfile);
      setSelectedRoleId('tenant');
      setOtpNotification(`🆕 Secure ID Created: Welcomed as ${newProfile.name}!`);
    }

    setActiveScreen('explore');
    
    setTimeout(() => {
      setOtpNotification(null);
    }, 6000);
  };

  return (
    <div id="staylink-mobile-emulator" className="relative w-full h-full bg-neutral-950 overflow-hidden flex flex-col font-sans select-none">
      
      {/* Embedded Phone Screen Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-100 text-neutral-900 h-full relative animate-once">
        
        {/* Sim Push Notification Overlay */}
        <AnimatePresence>
          {otpNotification && (
            <motion.div
              initial={{ opacity: 0, y: -80, scale: 0.9 }}
              animate={{ opacity: 1, y: 16, scale: 1 }}
              exit={{ opacity: 0, y: -80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={() => setOtpNotification(null)}
              className="absolute left-3 right-3 top-0 z-50 bg-neutral-900/95 backdrop-blur-md border border-neutral-800 text-white p-3.5 rounded-2xl flex items-start gap-2.5 shadow-2xl cursor-pointer pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[9px] font-black tracking-widest text-[#94a3b8] font-mono uppercase">StayLink AI Multi-Factor Gateway</p>
                <p className="text-[11px] font-semibold text-neutral-100 mt-0.5 leading-relaxed">{otpNotification}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outer scrollable viewport for screens */}
        <div className={`flex-grow flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col pt-4 pb-6`}>
          <AnimatePresence mode="wait">
          
          {/* 1. WELCOME SCREEN */}
          {activeScreen === 'welcome' && (
            <motion.div 
              key="welcome"
              {...pageTransitions}
              className="flex-1 flex flex-col items-center justify-between p-5 bg-neutral-950 text-neutral-100"
            >
              {/* Sleek Header Section */}
              <div className="w-full text-center pt-3 pb-2 select-none">
                <div className="inline-flex p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-1">
                  <Sparkles className="w-4 h-4 text-blue-400 rotate-12" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                  STAYLINK <span className="bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent italic">AI</span>
                </h1>
                <p className="text-[9px] font-mono text-neutral-400 mt-0.5 uppercase tracking-widest font-extrabold">
                  {authTab === 'register' ? 'Register Legal Entity' : 'Secured OTP Access Node'}
                </p>
              </div>

              {/* AUTH MODES SWITCH */}
              <div className="w-full grid grid-cols-2 p-1 bg-neutral-900 border border-neutral-850 rounded-xl mb-3 mt-1 shadow-inner relative z-10 shrink-0">
                <button
                  onClick={() => {
                    setAuthTab('register');
                    setOtpError('');
                  }}
                  className={`py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Choose Role
                </button>
                <button
                  onClick={() => {
                    setAuthTab('otp_login');
                    setOtpError('');
                  }}
                  className={`py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer ${
                    authTab === 'otp_login'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Secured OTP
                </button>
              </div>

              {authTab === 'register' ? (
                <>
                  {/* Stacked Vertical Rosters to Register */}
                  <div className="w-full space-y-2.5 max-h-[300px] overflow-y-auto pr-1 my-2 scrollbar-none">
                    {REGISTRATION_ROLES.map((role) => {
                      const IconComponent = role.icon;
                      const isSelected = selectedRoleId === role.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => {
                            setSelectedRoleId(role.id);
                            setUserProfile(role.profile);
                          }}
                          className={`w-full p-3 rounded-2xl border transition-all duration-200 flex items-center gap-3 text-left cursor-pointer group relative overflow-hidden ${
                            isSelected
                              ? 'bg-neutral-900 border-neutral-700/80 shadow-lg ring-1 ring-neutral-800'
                              : 'bg-neutral-900/30 border-neutral-900/60 hover:bg-neutral-900/60 hover:border-neutral-800'
                          }`}
                        >
                          {/* Left color bar indicator */}
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-sky-400" />
                          )}

                          {/* Icon container */}
                          <div className={`w-11 h-11 rounded-1.5xl bg-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-102 ${role.bgIcon}`}>
                            <IconComponent className={`w-5.5 h-5.5 ${role.textIcon}`} />
                          </div>

                          {/* Text details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-1.5">
                              <p className="text-xs font-black text-neutral-100 group-hover:text-white transition-colors truncate">
                                {role.title}
                              </p>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-neutral-950 shrink-0" />
                              )}
                            </div>
                            <p className="text-[9px] font-mono font-bold tracking-wider uppercase text-neutral-400/90 mt-0.5">
                              <span className={role.textColor}>{role.level}</span>
                            </p>
                            <p className="text-[10px] text-neutral-550 group-hover:text-neutral-400 transition-colors font-medium truncate mt-0.5 leading-relaxed font-sans">
                              {role.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Profile Summary & Proceed Button */}
                  <div className="w-full flex flex-col gap-2.5 mt-2 shrink-0 text-left">
                    <div className="p-3 bg-neutral-900/40 border border-neutral-900 rounded-2xl flex items-center gap-3">
                      <img src={userProfile.avatar} className="w-8 h-8 rounded-full border border-neutral-700 object-cover shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[8px] font-extrabold text-neutral-500 uppercase tracking-widest font-mono">Entity Selected</p>
                        <p className="text-[11px] font-bold text-neutral-200 truncate">{userProfile.name}</p>
                      </div>
                      <span className="text-[8.5px] bg-neutral-800 text-neutral-300 font-mono font-black px-2 py-0.5 rounded-md uppercase border border-neutral-700/50 shrink-0">
                        {userProfile.role}
                      </span>
                    </div>

                    <button 
                      onClick={() => {
                        setFaceScanOrigin('welcome');
                        setActiveScreen('face_scan');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg shadow-blue-950/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20 animate-once"
                    >
                      <Shield className="w-4 h-4 text-sky-200" />
                      Proceed to Secure Registration
                    </button>
                  </div>
                </>
              ) : (
                /* OTP ACCESS PORTAL SCREEN */
                <div className="w-full flex-1 flex flex-col justify-between my-2 overflow-y-auto no-scrollbar">
                  {!otpSent ? (
                    /* Step 1: Input email or phone */
                    <div className="space-y-3 flex-1 flex flex-col justify-center animate-once">
                      <div className="space-y-1 text-center mb-1 select-none">
                        <h2 className="text-xs font-extrabold text-neutral-100 uppercase tracking-wider">Secure Account Access Gate</h2>
                        <p className="text-[9px] text-neutral-400">Authenticating via dynamic single-use token keypads</p>
                      </div>

                      {/* Selector Tabs */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setLoginMethod('phone');
                            setLoginInput('');
                            setOtpError('');
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${
                            loginMethod === 'phone'
                              ? 'bg-blue-600/10 border-blue-500/80 text-white shadow-sm'
                              : 'bg-neutral-900/40 border-neutral-900 text-neutral-400 hover:border-neutral-800'
                          }`}
                        >
                          <Smartphone className={`w-5 h-5 ${loginMethod === 'phone' ? 'text-blue-400' : 'text-neutral-500'}`} />
                          <span className="text-[9px] font-black uppercase tracking-wider">Phone Number</span>
                        </button>

                        <button
                          onClick={() => {
                            setLoginMethod('email');
                            setLoginInput('');
                            setOtpError('');
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${
                            loginMethod === 'email'
                              ? 'bg-blue-600/10 border-blue-500/80 text-white shadow-sm'
                              : 'bg-neutral-900/40 border-neutral-900 text-neutral-400 hover:border-neutral-800'
                          }`}
                        >
                          <Mail className={`w-5 h-5 ${loginMethod === 'email' ? 'text-blue-400' : 'text-neutral-500'}`} />
                          <span className="text-[9px] font-black uppercase tracking-wider">Email Address</span>
                        </button>
                      </div>

                      {/* Input field */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[8.5px] font-extrabold text-neutral-400 uppercase tracking-widest font-mono">
                          {loginMethod === 'phone' ? 'Phone Number' : 'Authorized Active Email'}
                        </label>
                        <motion.div 
                          className="relative"
                          animate={otpError && !otpSent ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <input
                            type={loginMethod === 'email' ? 'email' : 'text'}
                            value={loginInput}
                            onChange={(e) => {
                              setLoginInput(e.target.value);
                              if (otpError) setOtpError('');
                            }}
                            placeholder={
                              loginMethod === 'phone'
                                ? 'e.g. +254 722 987 654'
                                : 'e.g. host@staylink.co.ke'
                            }
                            className={`w-full py-3 px-4 bg-neutral-900 border ${otpError ? 'border-rose-500/50 focus:border-rose-500' : 'border-neutral-850 focus:border-blue-500'} rounded-xl text-xs text-white placeholder-neutral-550 focus:outline-none font-medium transition-colors`}
                          />
                        </motion.div>
                      </div>

                      {/* Informational Help Alert */}
                      <div className="p-3 bg-neutral-900/40 border border-neutral-900 rounded-xl text-left">
                        <p className="text-[10px] text-neutral-300 leading-normal flex items-start gap-1.5 font-medium">
                          <span className="text-blue-400 shrink-0 font-bold">💡</span> 
                          <span>
                            Tip: Matches like <strong className="text-blue-400">host@staylink.co.ke</strong> or <strong className="text-blue-400">+254 722 987 654</strong> load complete systems. Transient sessions register other inputs instantly.
                          </span>
                        </p>
                      </div>

                      {/* Error State */}
                      {otpError && (
                        <div className="text-[10px] text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-1.5 text-left leading-normal">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{otpError}</span>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        onClick={handleSendOtp}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20"
                      >
                        <Send className="w-4 h-4 text-sky-200" />
                        Send OTP to number via sms
                      </button>
                    </div>
                  ) : (
                    /* Step 2: Code Verification */
                    <div className="space-y-3.5 flex-1 flex flex-col justify-center animate-once">
                      <div className="space-y-1.5 text-center mb-1">
                        <h2 className="text-xs font-black text-neutral-100 uppercase tracking-widest flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-400" /> Enter Escrow OTP Key
                        </h2>
                        <p className="text-[9px] text-neutral-400 leading-tight">
                          Verification passcode routed to
                        </p>
                        <span className="inline-block px-2.5 py-0.5 bg-neutral-900 text-neutral-300 rounded-full font-mono text-[9.5px] font-extrabold border border-neutral-800">
                          {loginInput}
                        </span>
                      </div>

                        {/* Code inputs */}
                      <div className="flex flex-col items-center gap-2 text-left">
                        <motion.div 
                          className="flex justify-center gap-2"
                          animate={otpError && otpSent ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {[0, 1, 2, 3].map((numIndex) => {
                            const char = enteredOtp[numIndex] || '';
                            return (
                              <div
                                key={numIndex}
                                className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono text-sm font-black transition-all ${
                                  char
                                    ? otpError ? 'bg-rose-500/10 border-rose-500 text-rose-500 text-base scale-102 ring-1 ring-rose-500/30' : 'bg-neutral-900 border-blue-500 text-white text-base scale-102 ring-1 ring-blue-500/30'
                                    : otpError ? 'bg-rose-500/5 border-rose-500/50' : 'bg-neutral-900/60 border-neutral-850 text-neutral-500'
                                }`}
                              >
                                {char ? '•' : ''}
                              </div>
                            );
                          })}
                        </motion.div>

                        {/* Numeric Keyboard overlay */}
                        <div className="grid grid-cols-3 gap-1 w-full max-w-[200px] mt-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                            <button
                              key={val}
                              onClick={() => {
                                if (enteredOtp.length < 4) {
                                  setEnteredOtp((prev) => prev + val);
                                  if (otpError) setOtpError('');
                                }
                              }}
                              className="py-2 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              {val}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setEnteredOtp('');
                              if (otpError) setOtpError('');
                            }}
                            className="py-2 bg-neutral-950/20 text-neutral-500 hover:text-white rounded-lg text-[8px] uppercase font-bold cursor-pointer"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => {
                              if (enteredOtp.length < 4) {
                                setEnteredOtp((prev) => prev + '0');
                                if (otpError) setOtpError('');
                              }
                            }}
                            className="py-2 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            0
                          </button>
                          <button
                            onClick={() => {
                              if (enteredOtp.length > 0) {
                                setEnteredOtp((prev) => prev.slice(0, -1));
                                if (otpError) setOtpError('');
                              }
                            }}
                            className="py-2 bg-neutral-950/20 text-neutral-500 hover:text-white rounded-lg text-[8px] uppercase font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Display OTP on Dev/Sim (Helper) */}
                      <div className="py-1 px-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-center max-w-xs mx-auto animate-pulse flex items-center justify-center gap-1 select-none">
                        <span className="text-[9px] font-extrabold text-blue-400 font-mono tracking-wide">
                          Simulated code: {otpCode}
                        </span>
                      </div>

                      {/* Error or Timer section */}
                      {otpError ? (
                        <div className="text-[10px] text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg flex items-center gap-1.5 text-left leading-tight">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{otpError}</span>
                        </div>
                      ) : (
                        <div className="text-center select-none">
                          {otpTimer > 0 ? (
                            <span className="text-[9.5px] text-neutral-500 font-mono">
                              Resend code in: <strong className="text-neutral-300 font-bold">{otpTimer}s</strong>
                            </span>
                          ) : (
                            <button
                              onClick={handleSendOtp}
                              className="text-[9.5px] text-blue-400 hover:text-blue-300 font-bold underline uppercase tracking-wider cursor-pointer"
                            >
                              Resend Verification Code
                            </button>
                          )}
                        </div>
                      )}

                      {/* CTA Buttons */}
                      <div className="space-y-1.5 pt-1 text-left">
                        <button
                          onClick={handleVerifyOtp}
                          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/20"
                        >
                          <ShieldCheck className="w-4 h-4 text-teal-200" />
                          Verify & Log In
                        </button>

                        <button
                          onClick={() => {
                            setOtpSent(false);
                            setEnteredOtp('');
                            setOtpError('');
                          }}
                          className="w-full py-2 bg-transparent hover:bg-neutral-900/40 text-neutral-400 hover:text-neutral-300 rounded-xl text-[9px] uppercase tracking-wider transition cursor-pointer font-bold text-center"
                        >
                          ← Change Credentials
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between text-[9px] font-medium text-neutral-500 px-1 mt-1.5 w-full border-t border-neutral-900/50 pt-2 select-none shrink-0">
                <span>Language: English</span>
                <span>v24.2.0 (Verified Node)</span>
              </div>
            </motion.div>
          )}

          {/* 2. BIOMETRIC FACE SCANNER SCREEN */}
          {activeScreen === 'face_scan' && (
            <motion.div 
              key="face"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-neutral-950 text-white p-6 justify-between"
            >
              <div className="flex justify-between items-center top-2">
                <button onClick={() => setActiveScreen(faceScanOrigin)} className="p-2 text-neutral-400 bg-neutral-900 rounded-full cursor-pointer">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Biometrics Grid</span>
                <span className="w-8"></span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-lg font-semibold">Facial Verification</h2>
                <p className="text-xs text-neutral-400 max-w-[280px] mt-1">
                  Upload facial telemetry to check matching records with NIRA database registries. This reduces scam listings by 98%.
                </p>

                {/* Scan Frame */}
                <div className="relative w-64 h-64 border-2 border-dashed border-blue-500/40 rounded-full mt-8 overflow-hidden flex items-center justify-center bg-neutral-900">
                  {faceScanningState === 'idle' && (
                    <button 
                      onClick={startCameraScan}
                      className="p-5 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-full hover:scale-105 transition shadow-lg flex flex-col items-center gap-1"
                    >
                      <Video className="w-8 h-8 text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Start Feed</span>
                    </button>
                  )}

                  {faceScanningState === 'seeking' && (
                    <div className="text-xs text-neutral-400">Booting cameras...</div>
                  )}

                  {faceScanningState === 'analyzing' && (
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                      {/* Scanning overlay grid */}
                      <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-pulse flex items-center justify-center">
                        <div className="w-[120%] h-[2px] bg-blue-500/80 absolute top-1/2 left-0 transform -translate-y-1/2 animate-bounce"></div>
                      </div>
                      <div className="absolute bottom-4 bg-black/80 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider text-sky-400 animate-pulse">
                        ANALYZING TELEMETRY...
                      </div>
                    </div>
                  )}

                  {faceScanningState === 'done' && (
                    <motion.div 
                      initial={{ scale: 0.8 }} 
                      animate={{ scale: 1 }}
                      className="flex flex flex-col items-center justify-center"
                    >
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-2">Verified</span>
                    </motion.div>
                  )}
                </div>

                <p className="text-[10px] uppercase font-mono tracking-widest text-[#0ea5e9] mt-6">
                  {faceScanningState === 'analyzing' ? 'Verifying facial vectors with Safaricom ID node' : 'StayLink zero-trust gateway'}
                </p>
              </div>

              <div className="w-full flex flex-col gap-2">
                <button 
                  disabled={faceScanningState !== 'done'}
                  onClick={() => {
                    setUserProfile(prev => ({ ...prev, isVerified: true, verificationBadges: [...prev.verificationBadges, 'id_uploaded'] }));
                    setActiveScreen(faceScanOrigin === 'profile' ? 'profile' : 'explore');
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-800 disabled:text-neutral-500 active:scale-98 transition rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  Check In Secure Portal
                </button>
              </div>
            </motion.div>
          )}

          {/* DOCUMENT SCANNER SCREEN */}
          {activeScreen === 'document_scan' && (
            <motion.div 
              key="doc_scan"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-neutral-950 text-white p-6 justify-between"
            >
              <div className="flex justify-between items-center top-2">
                <button 
                  onClick={() => {
                    docCameraStream?.getTracks().forEach(track => track.stop());
                    setDocScanningState('idle');
                    setActiveScreen('profile');
                  }} 
                  className="p-2 text-neutral-400 bg-neutral-900 rounded-full cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Lease Scanner</span>
                <span className="w-8"></span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-lg font-semibold">Verify Lease Agreement</h2>
                <p className="text-xs text-neutral-400 max-w-[280px] mt-1">
                  Position your lease document in the frame to capture and extract information using our optical character recognition engine.
                </p>

                {/* Document Scan Frame */}
                <div className="relative w-64 h-80 border-2 border-dashed border-emerald-500/40 mt-8 overflow-hidden bg-neutral-900 rounded-lg">
                  {docScanningState === 'idle' && (
                    <button 
                      onClick={startDocScan}
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-neutral-900 hover:bg-neutral-800 transition"
                    >
                      <div className="p-5 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-full shadow-lg flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-3">Start Camera</span>
                    </button>
                  )}

                  {docScanningState === 'seeking' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-neutral-400">Booting cameras...</div>
                  )}

                  {docScanningState === 'analyzing' && capturedDocImage === null && (
                    <div className="absolute inset-0 w-full h-full">
                      <video ref={docVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                      <div className="absolute inset-0 border-[3px] border-emerald-500/80 rounded-lg pointer-events-none"></div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <button 
                          onClick={captureDocument}
                          className="w-12 h-12 bg-white rounded-full border-4 border-emerald-500 shadow-xl cursor-pointer hover:bg-neutral-200 transition"
                        />
                      </div>
                    </div>
                  )}

                  {docScanningState === 'done' && capturedDocImage && (
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/60">
                      <img src={capturedDocImage} alt="Scanned document" className="w-full h-full object-contain mb-2 opacity-60" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-2 bg-black/60 px-2 py-1 rounded">Document Extracted</span>
                      </div>
                    </div>
                  )}

                  {/* Hidden Canvas for capturing frames */}
                  <canvas ref={docCanvasRef} className="hidden" />
                </div>

                <p className="text-[10px] uppercase font-mono tracking-widest text-[#10b981] mt-6">
                  {docScanningState === 'analyzing' ? 'Align document edges within the frame' : 'Optical Recognition Ready'}
                </p>
              </div>

              <div className="w-full flex flex-col gap-2">
                <button 
                  disabled={docScanningState !== 'done'}
                  onClick={() => {
                    setDocScanningState('idle');
                    setActiveScreen('profile');
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-800 disabled:text-neutral-500 active:scale-98 transition rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  Confirm & Upload Verification
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. EXPLORE DASHBOARD */}
          {activeScreen === 'explore' && (
            <motion.div 
              key="explore"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-neutral-50 text-neutral-800"
            >
              {/* Verification Alert */}
              {!userProfile.isVerified && (
                <div className="mx-4 mt-4 mb-2 p-4 bg-white border border-amber-200/60 rounded-2xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                  
                  <div className="flex items-center gap-3.5 relative z-10 ml-1">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-neutral-900 tracking-tight leading-none mb-1 text-left">Verify Identity</h4>
                      <p className="text-[10px] text-neutral-500 font-medium text-left">Unlock bookings & direct chats</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setFaceScanOrigin('explore');
                      setActiveScreen('face_scan');
                    }}
                    className="relative z-10 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    Verify ID
                  </button>
                </div>
              )}

              {/* Natural Language Search Entry */}
              <div className="px-4 pt-3.5 pb-2.5 bg-white border-b border-neutral-200 flex flex-col">
                <form onSubmit={handleAISearch} className="relative flex items-center bg-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition">
                  <Search className="w-4.5 h-4.5 text-neutral-400 absolute left-4.5" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e.g. cheap airbnb in Westlands with wifi"
                    className="w-full pl-11 pr-14 py-3 text-xs bg-transparent outline-none border-none placeholder-neutral-400 font-medium text-neutral-800"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold uppercase transition"
                  >
                    AI
                  </button>
                </form>

                {isSearching && (
                  <div className="flex gap-2 items-center text-xs text-blue-600 mt-2 font-medium animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Analyzing semantic tags in Nairobi database...
                  </div>
                )}

                {aiSearchRapport && (
                  <div className="mt-2.5 p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-[11px] text-sky-800 leading-relaxed font-medium">
                    <span className="font-bold">StayLink Intelligent Assistant: </span>
                    {aiSearchRapport}
                  </div>
                )}
              </div>

              {/* Categories Banner Scroller */}
              <div className="px-4 py-2 bg-neutral-100 flex gap-2 overflow-x-auto scrollbar-none no-scrollbar">
                {[
                  { id: 'all', label: 'All', icon: Compass },
                  { id: 'apartment', label: 'Apartments', icon: MapPin },
                  { id: 'airbnb', label: 'Airbnbs', icon: Video },
                  { id: 'roommate', label: 'Roommates', icon: Users },
                  { id: 'hotel', label: 'Hotels', icon: Heart },
                  { id: 'sale', label: 'For Sale', icon: Shield },
                ].map(cat => {
                  const Icon = cat.icon;
                  const isSel = selectedType === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedType(cat.id);
                        setFilteredProperties(getAvailableProps(properties, cat.id));
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.8 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        isSel ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Main Feed Container */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                
                {/* Pull-To-Refresh Draggable Sync Widget */}
                <motion.div 
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 85 }}
                  dragElastic={0.4}
                  onDrag={(_, info) => {
                    const dragDist = Math.min(Math.round((info.offset.y / 85) * 100), 100);
                    setPullProgress(dragDist > 0 ? dragDist : 0);
                  }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 60) {
                      handlePullToRefresh();
                    } else {
                      setPullProgress(0);
                    }
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200/60 rounded-2.5xl border border-neutral-300/30 p-3 flex flex-col items-center justify-center cursor-row-resize relative overflow-hidden select-none active:scale-[0.99] transition-transform duration-100"
                >
                  {/* Progress background bar */}
                  {pullProgress > 0 && (
                    <div 
                      className="absolute inset-y-0 left-0 bg-blue-500/10 transition-all duration-75"
                      style={{ width: `${pullProgress}%` }}
                    />
                  )}

                  <div className="flex items-center gap-2 z-10 relative">
                    {isRefreshing ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-250 ${pullProgress >= 80 ? 'rotate-180 text-blue-600' : ''}`} />
                    )}
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                      {isRefreshing ? 'Syncing Firebase...' : (pullProgress >= 80 ? 'Release to Sync' : 'Pull down to refresh listings')}
                    </span>
                  </div>

                  {pullProgress > 0 && !isRefreshing && (
                    <div className="text-[9px] text-blue-600 font-extrabold mt-0.5 tracking-wider uppercase z-10 relative animate-pulse">
                      Pull-Force: {pullProgress}%
                    </div>
                  )}
                </motion.div>

                {/* Firestore fetch alerts/banners */}
                <AnimatePresence>
                  {refreshNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="p-3 bg-neutral-900 border border-neutral-800 text-white rounded-2.5xl flex items-center justify-between text-xs font-semibold shadow-xs"
                    >
                      <div className="flex items-center gap-2 text-left">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[11px] font-medium leading-relaxed">{refreshNotification}</span>
                      </div>
                      <button 
                        onClick={() => setRefreshNotification(null)}
                        className="text-white/40 hover:text-white px-2 font-bold text-[10px] shrink-0"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* TikTok style prompt banner */}
                <div 
                  onClick={() => setActiveScreen('tiktok_feed')}
                  className="p-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2.5xl flex items-center justify-between cursor-pointer group hover:opacity-95 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center animate-pulse">
                      <Play className="w-4 h-4 fill-current text-sky-300" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-400">Discover properties visually</p>
                      <p className="text-[11px] text-neutral-300">Vertical full-screen immersive property feed</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase animate-bounce">Live</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">Verified Listings</h4>
                    <span className="text-[10px] text-neutral-400 font-medium">({filteredProperties.length} active listings)</span>
                  </div>
                  
                  {/* View Mode & Map Tools */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      onClick={() => setExploreViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-[7px] font-extrabold text-[10px] rounded-xl transition uppercase tracking-wider cursor-pointer border-none whitespace-nowrap shrink-0 ${
                        exploreViewMode === 'grid'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" /> LIST VIEW
                    </button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, transition: { repeat: Infinity, duration: 1, repeatType: "reverse" } }}
                      onClick={() => setExploreViewMode('map')}
                      className={`flex items-center gap-1.5 px-3 py-[7px] font-extrabold text-[10px] rounded-xl transition uppercase tracking-wider cursor-pointer border-none whitespace-nowrap shrink-0 ${
                        exploreViewMode === 'map'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5" /> MAP VIEW
                    </motion.button>

                    <div className="flex-1 min-w-[8px]" />

                    <button
                      onClick={() => setActiveScreen('map_tracker')}
                      className="flex items-center gap-1.5 px-3 py-[7px] bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl transition uppercase tracking-wider cursor-pointer shadow-xs border-none whitespace-nowrap shrink-0"
                    >
                      <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} /> GPS Mapping
                    </button>
                  </div>
                </div>

                {filteredProperties.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-neutral-200 rounded-2.5xl flex flex-col items-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                    <p className="text-xs text-neutral-600 font-medium">Hapana! No listings matched your exact search filters.</p>
                    <button 
                      onClick={() => {
                        setFilteredProperties(getAvailableProps(properties, selectedType));
                        setSearchQuery('');
                        setAiSearchRapport('');
                      }} 
                      className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                    >
                      Clear Search Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                       <button
                         onClick={() => triggerRecovery(new Error('Simulated stream interrupt on properties'))}
                         className="text-[10px] bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 flex gap-1 items-center rounded-lg font-bold transition-colors cursor-pointer border border-red-200 shadow-xs"
                       >
                         <AlertTriangle className="w-3.5 h-3.5" /> Force Stream Disconnect Test
                       </button>
                    </div>

                    {isRecovering ? (
                      <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                           <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
                           <span className="text-sm font-bold uppercase tracking-wider">Syncing...</span>
                        </div>
                        <p className="text-[11px] text-sky-600/80 font-medium">Re-establishing secure property stream (Attempt {retryCount}/{maxRetries})</p>
                      </div>
                    ) : exploreViewMode === 'map' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="w-full pb-2"
                      >
                        <ExploreInlineMap 
                          properties={filteredProperties} 
                          onViewProperty={viewPropertyDetails} 
                          selectedType={selectedType}
                        />
                      </motion.div>
                    ) : (
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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-4"
                      >
                      {filteredProperties.map((prop, index) => (
                        <motion.div 
                          key={prop.id}
                          variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                          }}
                          onClick={() => viewPropertyDetails(prop)}
                          className="bg-white rounded-2.5xl border border-neutral-200 overflow-hidden shadow-xs cursor-pointer hover:shadow-md hover:scale-[1.01] transition duration-200 flex flex-col group h-full"
                        >
                      {/* Image Frame */}
                      <div className="relative h-44 w-full bg-neutral-200 overflow-hidden">
                        <img 
                          src={prop.images[0]} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                        {(prop.verifiedByAdmin || prop.verificationStatus === 'verified') && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600/95 backdrop-blur-xs text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20 shadow-xs">
                            <Check className="w-3.5 h-3.5 text-white fill-current" />
                            Verified Host
                          </div>
                        )}
                        {prop.isPromoted && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wide flex items-center gap-0.5 shadow-sm">
                            <Sparkles className="w-3 h-3 fill-current" />
                            Smart Pick
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-white/95 text-neutral-900 rounded-full py-1 px-3 text-sm font-black shadow-xs flex items-center">
                          KSh {prop.price >= 1000000 ? `${(prop.price/1000000).toFixed(1)}M` : prop.price.toLocaleString()}
                          <span className="text-[9px] text-neutral-500 font-normal ml-0.5">/{prop.type === 'airbnb' || prop.type === 'hotel' ? 'day' : 'month'}</span>
                        </div>
                        
                        {prop.averageRating && (
                          <div className="absolute top-3 right-3 bg-black/70 text-white rounded-full py-1 px-2 text-[10px] font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-amber-400" />
                            {prop.averageRating.toFixed(1)}
                          </div>
                        )}

                        {/* Compare toggle trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompare(prop, e);
                          }}
                          className={`absolute bottom-3 right-3 px-2.5 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1 transition-all border ${
                            comparedProperties.some(p => p.id === prop.id)
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-500/10'
                              : 'bg-white/95 border-neutral-200 text-neutral-700 hover:bg-white hover:text-neutral-900'
                          }`}
                        >
                          <Compass className={`w-3 h-3 ${comparedProperties.some(p => p.id === prop.id) ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                          {comparedProperties.some(p => p.id === prop.id) ? 'Compared' : 'Compare'}
                        </button>
                      </div>

                      {/* Content details */}
                      <div className="p-4 flex flex-col text-left">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-bold text-neutral-900 tracking-tight line-clamp-1">{prop.title}</h5>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 py-0.5 px-2 bg-neutral-100 rounded-sm">{prop.type}</span>
                        </div>
                        
                        <div className="flex gap-1 items-center text-xs text-neutral-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>{prop.location}</span>
                        </div>

                        {/* Badges parameters */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                          <div className="flex gap-3">
                            <span>🛏️ {prop.bedrooms} Bed</span>
                            <span>🛁 {prop.bathrooms} Bath</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                            <span className="font-extrabold text-[10px] text-neutral-700">AI Score: {prop.aiQualityScore}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </motion.div>
                )}
                  </>
                )}

                {/* Interactive Roommate Matching Block */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">Active Roommate Seeker matches</h4>
                  </div>
                  <div className="flex gap-3 overflow-x-auto scrollbar-none no-scrollbar py-2">
                    {roommates.filter(r => !r.partnerFound).map(seeker => (
                      <div 
                        key={seeker.uid}
                        onClick={() => triggerRoommateMatch(seeker)}
                        className="bg-white border border-neutral-200 rounded-2xl p-3 min-w-[200px] shadow-2xs hover:shadow-xs transition flex flex-col items-center cursor-pointer text-center"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 mb-2">
                          <img src={seeker.avatar} className="object-cover w-full h-full" />
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border border-white rounded-full flex items-center justify-center text-[8px] text-white">✓</div>
                        </div>
                        <h6 className="text-[12px] font-bold text-neutral-900">{seeker.name}</h6>
                        <span className="text-[10px] text-neutral-400 mt-0.5 font-medium">{seeker.occupation}</span>
                        
                        {/* Compatibility indicator match */}
                        <div className="mt-3.5 w-full bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded-full text-[10px] font-bold text-indigo-700 transition flex items-center justify-center gap-1 uppercase tracking-wider">
                          <BadgePercent className="w-3.5 h-3.5" />
                          Match Score
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Add Property FAB */}
              {['landlord', 'agency', 'Cohort', 'seller'].includes(userProfile.role) && (
                <button 
                  onClick={() => setActiveScreen('add_property')}
                  className="absolute bottom-20 right-4 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition cursor-pointer"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}

              {/* FLOATING PROPERTY COMPARISON ACTION BAR */}
              <AnimatePresence>
                {comparedProperties.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="bg-neutral-900 border-t border-neutral-800 p-3 flex items-center justify-between z-50 shadow-2xl relative shrink-0 text-white select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2 bg-neutral-950 p-1 rounded-xl overflow-hidden shrink-0">
                        {comparedProperties.map((p) => (
                          <div key={p.id} className="relative z-10 hover:z-20 group">
                            <img
                              src={p.images[0]}
                              className="w-10 h-10 rounded-xl border-2 border-neutral-900 object-cover shadow-md transition group-hover:scale-105"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveComparedProperty(p.id);
                              }}
                              className="absolute -top-1 -right-1 bg-black/80 hover:bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] border border-neutral-800 font-black transition cursor-pointer"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {Array.from({ length: 3 - comparedProperties.length }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-500 text-xs font-mono font-bold shrink-0 border-dashed"
                          >
                            +
                          </div>
                        ))}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase font-mono leading-none">StayLink Comparer</p>
                        <p className="text-[11px] font-extrabold text-neutral-200 mt-1 truncate">
                          {comparedProperties.length}/3 selected to compare
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsComparisonOpen(true)}
                        disabled={comparedProperties.length < 2}
                        className={`py-2 px-3.5 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-lg transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                          comparedProperties.length >= 2
                            ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 border-none'
                            : 'bg-neutral-800 text-neutral-500 border-none cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Compare Now
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comparison Overlay Fullscreen */}
              <AnimatePresence>
                {isComparisonOpen && (
                  <PropertyComparer
                    selectedProperties={comparedProperties}
                    onRemoveProperty={handleRemoveComparedProperty}
                    onClearAll={handleClearAllCompared}
                    onClose={() => setIsComparisonOpen(false)}
                    onViewDetails={(prop) => {
                      setIsComparisonOpen(false);
                      viewPropertyDetails(prop);
                    }}
                  />
                )}
                {isVirtualTourOpen && (
                  <VirtualTourOverlay
                    property={activeProperty}
                    onClose={() => setIsVirtualTourOpen(false)}
                  />
                )}
              </AnimatePresence>

              {/* FLOATING ACTION PREVIEW BAR */}
              <div className="h-16 bg-white border-t border-neutral-200 px-6 flex justify-between items-center z-40 sticky bottom-0 left-0 w-full shadow-md">
                <button 
                  onClick={() => setActiveScreen('explore')}
                  className="flex flex-col items-center gap-0.5 text-blue-600 transition cursor-pointer"
                >
                  <Compass className="w-5 h-5 fill-current" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Explore</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('map_tracker')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">GPS Map</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('tiktok_feed')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Swipe Reels</span>
                </button>
                <button 
                  onClick={() => {
                    let defaultChat = chats[0];
                    if (defaultChat) {
                      setActiveChat(defaultChat);
                      setChatMessages(messagesList[defaultChat.id] || []);
                      setActiveScreen('chat');
                    }
                  }}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition relative animate-pulse"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Chats</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center">1</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('profile')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Streaks</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('admin_console')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Admin</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 3.1 INTERACTIVE GPRS MAP MONITOR SCREEN */}
          {activeScreen === 'map_tracker' && (
            <motion.div 
              key="map-tracker"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-neutral-100 text-neutral-800 relative h-full justify-between"
            >
              {/* Back navigation Top Header */}
              <div className="absolute top-4 left-4 z-50 flex items-center gap-1 bg-black/70 backdrop-blur-xs px-2.5 py-1 text-white border border-white/10 hover:bg-black/85 transition-all rounded-full cursor-pointer text-[10px] font-bold uppercase tracking-wider select-none shadow-md" onClick={() => setActiveScreen('explore')}>
                <ChevronLeft className="w-4 h-4 text-white" />
                <span>Dashboard</span>
              </div>

              {/* Map Tracker body */}
              <div className="flex-1 w-full relative">
                <MapTracker 
                  properties={properties} 
                  onViewProperty={(prop) => {
                    setActiveProperty(prop);
                    setActiveScreen('details');
                  }} 
                  onBookProperty={(prop) => {
                    setActiveProperty(prop);
                    setActiveScreen('checkout');
                  }}
                  currentUser={userProfile} 
                />
              </div>

              {/* Bottom Navigation Bar */}
              <div className="h-16 bg-white border-t border-neutral-200 px-6 flex justify-between items-center z-40 relative w-full shadow-md">
                <button 
                  onClick={() => setActiveScreen('explore')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <Compass className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Explore</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('map_tracker')}
                  className="flex flex-col items-center gap-0.5 text-blue-600 transition cursor-pointer"
                >
                  <Globe className="w-5 h-5 fill-current" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">GPS Map</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('tiktok_feed')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Swipe Reels</span>
                </button>
                <button 
                  onClick={() => {
                    let defaultChat = chats[0];
                    if (defaultChat) {
                      setActiveChat(defaultChat);
                      setChatMessages(messagesList[defaultChat.id] || []);
                      setActiveScreen('chat');
                    }
                  }}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition relative cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Chats</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center">1</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('profile')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Streaks</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('admin_console')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Admin</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. TIKTOK-STYLE PROPERTY FEED SCREEN */}
          {activeScreen === 'tiktok_feed' && (
            <motion.div 
              key="tiktok"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-neutral-950 text-white relative h-full justify-between"
            >
              {/* Header inside feed */}
              <div className="absolute top-8 left-4 z-50 flex gap-2 items-center bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                <button onClick={() => setActiveScreen('explore')} className="p-1 hover:bg-white/20 rounded-full">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Discover Homes Visually</span>
              </div>

              {/* Full-Screen Simulated Media Loop */}
              <div className="flex-1 w-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                
                {/* Simulated video playback or moving houses details */}
                <div onClick={() => setIsPlayingVideo(!isPlayingVideo)} className="w-full h-full relative cursor-pointer">
                  {properties[tiktokIndex]?.videoUrl ? (
                    <video 
                      src={properties[tiktokIndex].videoUrl} 
                      autoPlay={isPlayingVideo} 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={properties[tiktokIndex]?.images[0]} className="w-full h-full object-cover" />
                  )}

                  {!isPlayingVideo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Pause className="w-16 h-16 text-white/70 bg-black/40 p-4 rounded-full" />
                    </div>
                  )}

                  {/* Sidebar quick control overlays */}
                  <div className="absolute right-4 bottom-32 flex flex-col gap-5 z-40 items-center">
                     {/* Landlord profile overlay */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full border-2 overflow-hidden shadow-md ${
                          (properties[tiktokIndex]?.verifiedByAdmin || properties[tiktokIndex]?.verificationStatus === 'verified') 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-blue-500'
                        }`}>
                          <img src={properties[tiktokIndex]?.landlordAvatar} className="w-full h-full object-cover" />
                        </div>
                        {(properties[tiktokIndex]?.verifiedByAdmin || properties[tiktokIndex]?.verificationStatus === 'verified') && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white shadow-xs" title="Verified Landlord Host">
                            <Check className="w-2.5 h-2.5 fill-current font-black" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-white/80 font-bold mt-1 max-w-[50px] truncate">{properties[tiktokIndex]?.landlordName}</span>
                    </div>

                    {/* Actions */}
                    <button className="flex flex-col items-center gap-1 focus:text-pink-500 hover:text-pink-400 transition">
                      <div className="p-2.5 bg-black/60 rounded-full">
                        <Heart className="w-6 h-6 fill-current text-white hover:text-pink-500" />
                      </div>
                      <span className="text-xs font-bold">{properties[tiktokIndex]?.likesCount || 10}</span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openChatWithLandlord(properties[tiktokIndex]);
                      }}
                      className="flex flex-col items-center gap-1 hover:text-blue-400 transition"
                    >
                      <div className="p-2.5 bg-black/60 rounded-full">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold">{properties[tiktokIndex]?.commentsCount || 4}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 hover:text-sky-400 transition">
                      <div className="p-2.5 bg-black/60 rounded-full">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-bold">Share</span>
                    </button>
                  </div>

                  {/* Lower Context details */}
                  <div className="absolute left-4 bottom-4 right-16 text-left z-30 p-3 bg-black/60 backdrop-blur-xs rounded-2xl border border-white/10 flex flex-col">
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase bg-indigo-500/10 self-start px-2 py-0.5 rounded-sm mb-1">{properties[tiktokIndex]?.type}</span>
                    <h3 className="text-sm font-black line-clamp-1 text-white">{properties[tiktokIndex]?.title}</h3>
                    <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed">{properties[tiktokIndex]?.description}</p>
                    <p className="text-[11px] text-neutral-400 mt-2 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" /> {properties[tiktokIndex]?.location}
                    </p>

                    <div className="flex gap-2.5 mt-3 pt-3 border-t border-white/10 justify-between items-center">
                      <div className="text-left">
                        <span className="text-[10px] text-neutral-400 block font-medium">Rent Price</span>
                        <span className="text-sm font-black text-emerald-400">KSh {properties[tiktokIndex]?.price?.toLocaleString()}</span>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          viewPropertyDetails(properties[tiktokIndex]);
                        }} 
                        className="py-1.8 px-4 bg-blue-600 hover:bg-blue-700 text-[11px] text-white font-extrabold rounded-lg flex items-center gap-1 transition uppercase tracking-wider"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Feed Pager Controller */}
              <div className="h-14 bg-neutral-900 border-t border-white/5 py-1.5 flex justify-between px-6 items-center">
                <button 
                  disabled={tiktokIndex === 0}
                  onClick={() => setTiktokIndex(i => Math.max(0, i - 1))}
                  className="px-3.5 py-1.5 bg-neutral-800 disabled:opacity-40 text-xs font-semibold rounded-lg text-white"
                >
                  ▲ Previous Reel
                </button>
                <span className="text-[11px] font-mono font-medium text-neutral-400">{tiktokIndex + 1} of {properties.length} Listings</span>
                <button 
                  disabled={tiktokIndex === properties.length - 1}
                  onClick={() => setTiktokIndex(i => Math.min(properties.length - 1, i + 1))}
                  className="px-3.5 py-1.5 bg-blue-600 disabled:opacity-40 text-xs font-semibold rounded-lg text-white"
                >
                  ▼ Next Reel
                </button>
              </div>

            </motion.div>
          )}

          {/* 5. SMART ROOMMATE MATCHING SCREEN */}
          {activeScreen === 'roommate' && activePartner && (
            <motion.div 
              key="roommate-details"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-[#faf5ff] text-neutral-900 p-6 justify-between"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => setActiveScreen('explore')} className="p-2 text-neutral-400 bg-white rounded-full border border-neutral-200">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Roommate Matcher AI</span>
                <span className="w-8"></span>
              </div>

              <div className="flex-1 overflow-y-auto py-4 text-left space-y-4">
                
                {/* Pairing Avatar block */}
                <div className="bg-white rounded-3xl p-5 border border-purple-100 flex items-center justify-around shadow-2xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  
                  <div className="flex flex-col items-center">
                    <img src={userProfile.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-sm" />
                    <span className="text-xs font-bold text-neutral-700 mt-1">Me</span>
                  </div>

                  <div className="flex flex-col items-center justify-center animate-pulse">
                    {/* Compatibility Score Circular Gauge */}
                    <div className="relative w-18 h-18 bg-purple-50 rounded-full border-4 border-dashed border-indigo-400 flex items-center justify-center shadow-xs">
                      {isLoadingRoommateAI ? (
                        <Sparkles className="w-6 h-6 text-indigo-600 animate-spin" />
                      ) : (
                        <div className="text-center">
                          <span className="text-xl font-black text-indigo-700">{roommateMatchScore}%</span>
                          <span className="text-[7px] block uppercase text-indigo-400 font-extrabold tracking-wider leading-none">Fit</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <img src={activePartner.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-sm" />
                    <span className="text-xs font-semibold text-neutral-700 mt-1">{activePartner.name.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Compatibility report breakdown */}
                <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-2xs">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-4 h-4 fill-current text-indigo-500" />
                    Neural Compatibility Rapport
                  </h4>

                  {isLoadingRoommateAI ? (
                    <div className="space-y-2 py-4">
                      <div className="h-3 w-3/4 bg-neutral-200 rounded-sm animate-pulse"></div>
                      <div className="h-3 w-full bg-neutral-200 rounded-sm animate-pulse"></div>
                      <div className="h-3 w-5/6 bg-neutral-200 rounded-sm animate-pulse"></div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                        {roommateMatchReport}
                      </p>

                      {/* Matching Categories breaks */}
                      {roommateMatchedCategories && (
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                            <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-wider">Cleanliness</span>
                            <span className="text-sm font-bold text-neutral-800">{roommateMatchedCategories.cleanliness}% Match</span>
                          </div>
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                            <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-wider">Sleep schedule</span>
                            <span className="text-sm font-bold text-neutral-800">{roommateMatchedCategories.sleep}% Match</span>
                          </div>
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                            <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-wider">Budget limit</span>
                            <span className="text-sm font-bold text-neutral-800">{roommateMatchedCategories.budget}% Match</span>
                          </div>
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                            <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-wider">Lifestyle Match</span>
                            <span className="text-sm font-bold text-neutral-800">{roommateMatchedCategories.lifestyle}% Match</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Partner Details */}
                <div className="bg-white rounded-3xl p-5 border border-neutral-100 flex flex-col gap-2 shadow-2xs text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Partner Bio & Attributes</span>
                  <div className="flex gap-2 flex-wrap mt-1">
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">Occupation: {activePartner.occupation}</span>
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">Budget Limit: KSh {activePartner.budget.toLocaleString()}/mo</span>
                    {activePartner.rentPercentage && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">Rent Split: {activePartner.rentPercentage}%</span>
                    )}
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">Sleep: {activePartner.sleepSchedule}</span>
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">Hygiene: {activePartner.cleanliness} Clean</span>
                  </div>
                  
                  {activePartner.terms && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Preferences & Terms</span>
                      <p className="text-xs text-neutral-700 leading-relaxed">{activePartner.terms}</p>
                    </div>
                  )}
                  
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-2">Shared Interests</span>
                  <div className="flex gap-2 flex-wrap mt-0.5">
                    {activePartner.hobbies.map((hb, idv) => (
                      <span key={idv} className="bg-purple-100/50 text-purple-700 py-1 px-3 text-xs font-bold rounded-full">{hb}</span>
                    ))}
                  </div>
                </div>

              </div>

              <div className="w-full flex flex-col gap-3">
                <div className="w-full flex gap-3">
                  <button 
                    onClick={() => setActiveScreen('explore')}
                    className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-600 rounded-2xl text-xs font-bold active:scale-98 transition uppercase"
                  >
                    Explore More
                  </button>
                  <button 
                    onClick={() => {
                      // Create simulated roommate partner properties for details and chatting
                      const mockRoommateProp: Property = {
                        id: `prop_roommate_${activePartner.uid}`,
                        title: `Shared Suite with ${activePartner.name}`,
                        description: `Perfect roommate flatting in Nairobi!`,
                        price: activePartner.budget,
                        location: 'Westlands, Nairobi',
                        coordinates: { lat: -1.2610, lng: 36.8090 },
                        type: 'roommate',
                        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop'],
                        bedrooms: 2,
                        bathrooms: 2,
                        amenities: ['Private Bathroom', 'High-speed internet', 'Shared Kitchen'],
                        landlordId: activePartner.uid,
                        landlordName: activePartner.name,
                        landlordAvatar: activePartner.avatar,
                        aiQualityScore: 92,
                        neighborhoodMetrics: { safety: 88, transit: 90, noise: 35, hospitalsNear: 2, schoolsNear: 3, mallsNear: 2, commuteToCBD: '15 mins via matatu' },
                        responseSpeedMinutes: 4,
                        bookingSuccessRate: 98,
                        isPromoted: false,
                        isFlagged: false,
                        createdAt: new Date().toISOString(),
                        likesCount: 12,
                        commentsCount: 2
                      };
                      openChatWithLandlord(mockRoommateProp);
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-2xl text-xs font-bold shadow-md active:scale-98 transition uppercase flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    Connect Instantly
                  </button>
                </div>
                <button
                  onClick={() => {
                    const updatedRoommates = roommates.map(r => 
                      r.uid === activePartner.uid ? { ...r, partnerFound: true } : r
                    );
                    onStateUpdate({ roommates: updatedRoommates });
                    setActiveScreen('explore');
                  }}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl text-xs font-bold shadow-md active:scale-98 transition uppercase flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Agree & Confirm Match
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. PROPERTY DETAILS SCREEN */}
          {activeScreen === 'details' && activeProperty && (
            <motion.div 
              key="details-screen"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-white text-neutral-800"
            >
              {/* Back navigation */}
              <div className="absolute top-4 left-4 z-50">
                <button 
                  onClick={() => setActiveScreen('explore')}
                  className="p-2.5 bg-black/60 backdrop-blur-xs text-white rounded-full border border-white/10 hover:bg-black/80 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Toggle Compare in Property Details */}
              <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                <button 
                  onClick={(e) => handleToggleCompare(activeProperty, e)}
                  className={`p-2.5 rounded-full border shadow-md transition flex items-center justify-center cursor-pointer ${
                    comparedProperties.some(p => p.id === activeProperty.id)
                      ? 'bg-blue-600 border-blue-550 text-white ring-2 ring-blue-500/10'
                      : 'bg-black/60 border-white/11 text-white hover:bg-black/80'
                  }`}
                  title={comparedProperties.some(p => p.id === activeProperty.id) ? 'Remove from Comparison' : 'Add to Comparison'}
                >
                  <Compass className={`w-5 h-5 ${comparedProperties.some(p => p.id === activeProperty.id) ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                </button>
                <button 
                  onClick={() => setIsVirtualTourOpen(true)}
                  className="p-2.5 rounded-full border shadow-md bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50 transition flex items-center justify-center cursor-pointer"
                  title="View Virtual Tour"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Main Images Scroller */}
              <PropertyImageCarousel images={activeProperty.images} qualityScore={activeProperty.aiQualityScore} />

              {/* Collapsible Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
                
                {activeProperty.isFlagged && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <p className="font-bold">AI Fraud Warning Block Activated</p>
                      <p className="mt-0.5 text-[11px] text-red-700">StayLink Cyber Scanner has auto-flagged this listing because price deviates heavily fromMuthaiga standard parameters. Viewing is highly restricted to avoid rental advance scams.</p>
                    </div>
                  </div>
                )}

                {/* Listing description */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-sm self-start tracking-wider">
                      {activeProperty.type}
                    </span>
                    {(activeProperty.verifiedByAdmin || activeProperty.verificationStatus === 'verified') && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-250 px-2.5 py-0.5 rounded-sm self-start tracking-wider shadow-3xs">
                        <Check className="w-3 h-3 text-emerald-600 fill-current" /> Verified Landlord Host
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-950 mt-1">{activeProperty.title}</h2>
                  
                  <div className="flex gap-1 items-center text-xs text-neutral-500 mt-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{activeProperty.location}</span>
                  </div>
                  
                  <p className="text-lg font-black text-blue-600 mt-2">
                    KSh {activeProperty.price.toLocaleString()} 
                    <span className="text-xs font-medium text-neutral-500 ml-1">
                      /{activeProperty.type === 'airbnb' || activeProperty.type === 'hotel' ? 'day' : 'month'}
                    </span>
                  </p>
                </div>

                {/* Bed / Bath parameters */}
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 flex justify-around text-center text-xs">
                  <div>
                    <span className="text-neutral-400 block">Bedrooms</span>
                    <span className="font-bold text-neutral-800">{activeProperty.bedrooms} rooms</span>
                  </div>
                  <div className="w-[1px] bg-neutral-200 h-8 self-center"></div>
                  <div>
                    <span className="text-neutral-400 block">Bathrooms</span>
                    <span className="font-bold text-neutral-800">{activeProperty.bathrooms} bath</span>
                  </div>
                  <div className="w-[1px] bg-neutral-200 h-8 self-center"></div>
                  <div>
                    <span className="text-neutral-400 block">Eco-Automation</span>
                    <span className="font-bold text-emerald-600">Smart verified</span>
                  </div>
                </div>

                {/* Listing Core summary bio */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">About listing</h4>
                  <p className="text-xs font-medium leading-relaxed text-neutral-600">{activeProperty.description}</p>
                </div>

                {/* Neighborhood Radar */}
                <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-3xl space-y-3">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-widest flex items-center gap-1">
                    <Compass className="w-4.5 h-4.5 text-blue-500" /> Neighborhood intelligence
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-[11px] text-neutral-600">
                        <span>Safe Area rating</span>
                        <span>{activeProperty.neighborhoodMetrics.safety}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 rounded-full mt-1 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeProperty.neighborhoodMetrics.safety}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-[11px] text-neutral-600">
                        <span>Transit & Commute Access</span>
                        <span>{activeProperty.neighborhoodMetrics.transit}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 rounded-full mt-1 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${activeProperty.neighborhoodMetrics.transit}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] mt-2 font-bold pt-2 border-t border-dashed border-neutral-200">
                      <div className="bg-white p-1.5 rounded-lg border border-neutral-200">
                        <span className="text-neutral-400 block text-[9px]">🛒 MALLS</span>
                        <span>{activeProperty.neighborhoodMetrics.mallsNear} nearby</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-neutral-200">
                        <span className="text-neutral-400 block text-[9px]">🏥 CLINICS</span>
                        <span>{activeProperty.neighborhoodMetrics.hospitalsNear} nearby</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-neutral-200">
                        <span className="text-neutral-400 block text-[9px]">🏫 SCHOOLS</span>
                        <span>{activeProperty.neighborhoodMetrics.schoolsNear} nearby</span>
                      </div>
                    </div>
                  </div>
                </div>

                <PropertyReviewSection property={activeProperty} />

                {/* Smart Vector Map Mocking */}
                <div className="p-4 bg-sky-50 border border-sky-100 rounded-3xl text-left space-y-2">
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-md font-extrabold uppercase">Live Vector Map</span>
                  <p className="text-xs font-bold text-sky-900 leading-tight">Commute to Nairobi CBD:</p>
                  <p className="text-xs font-bold text-neutral-600">{activeProperty.neighborhoodMetrics.commuteToCBD}</p>
                  
                  {/* Styled CSS vector map layout representing Nairobi streets */}
                  <div className="w-full aspect-video bg-blue-100 rounded-2xl relative border border-sky-200/50 mt-2 overflow-hidden shadow-2xs">
                    <span className="absolute text-[8px] font-bold text-sky-500/50 uppercase top-2 left-2">Nairobi Grid</span>
                    
                    {/* Layer Toggles Panel */}
                    <div className="absolute top-2 right-2 flex gap-1 z-20">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTransportHubs(!showTransportHubs);
                        }}
                        title="Toggle Public Transport Hubs"
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition flex items-center gap-0.5 border cursor-pointer ${
                          showTransportHubs 
                            ? 'bg-teal-600 text-white border-teal-500 shadow-xs' 
                            : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-900'
                        }`}
                      >
                        <Bus className="w-2.5 h-2.5" />
                        <span>Transit Hubs</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCrimeZones(!showCrimeZones);
                        }}
                        title="Toggle High Crime Zones"
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition flex items-center gap-0.5 border cursor-pointer ${
                          showCrimeZones 
                            ? 'bg-rose-600 text-white border-rose-500 shadow-xs' 
                            : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-900'
                        }`}
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Crime Zones</span>
                      </button>
                    </div>

                    {/* Streets */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white transform -translate-y-1/2"></div>
                    <div className="absolute left-1/3 top-0 w-1 h-full bg-white"></div>
                    <div className="absolute left-2/3 top-0 w-1 h-full bg-white"></div>

                    {/* High Crime Zone Layer Indicator */}
                    {showCrimeZones && (
                      <div className="absolute top-[65%] left-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="absolute -inset-4 bg-rose-600/30 border border-rose-500/40 rounded-full animate-ping pointer-events-none"></div>
                        <div className="relative flex flex-col items-center">
                          <div className="w-2.5 h-2.5 bg-rose-600 border border-white rounded-full"></div>
                          <span className="bg-rose-950/90 text-rose-200 border border-rose-500/30 text-[5.5px] font-extrabold px-1 py-0.5 rounded-sm mt-0.5 leading-none whitespace-nowrap shadow-md uppercase tracking-tight">
                            ⚠️ HIGH THEFT ZONE
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Public Transport Hub Layer Indicator */}
                    {showTransportHubs && (
                      <>
                        <div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="relative flex flex-col items-center">
                            <div className="w-2.5 h-2.5 bg-teal-500 border border-white rounded-full flex items-center justify-center text-white p-0.5">
                              <Bus className="w-1.5 h-1.5" />
                            </div>
                            <span className="bg-teal-950/90 text-teal-200 border border-teal-500/35 text-[6px] font-extrabold px-1 py-0.5 rounded-sm mt-0.5 leading-none whitespace-nowrap shadow-md uppercase tracking-wider">
                              🚌 {activeProperty.location.split(',')[0].trim().toUpperCase()} STAGE
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="relative flex flex-col items-center">
                            <div className="w-2.5 h-2.5 bg-teal-500 border border-white rounded-full flex items-center justify-center text-white p-0.5">
                              <Bus className="w-1.5 h-1.5" />
                            </div>
                            <span className="bg-teal-950/90 text-teal-200 border border-teal-500/35 text-[6px] font-extrabold px-1 py-0.5 rounded-sm mt-0.5 leading-none whitespace-nowrap shadow-md uppercase tracking-wider">
                              🚌 CBD EXPRESS
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Marker */}
                    <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-3 h-3 bg-red-600 border-2 border-white rounded-full animate-bounce"></div>
                      <span className="bg-black text-[7px] text-white py-0.5 px-1 rounded-sm mt-0.5 leading-none font-bold uppercase">{activeProperty.location.split(',')[0]}</span>
                    </div>
                  </div>
                </div>

                 {/* Host profile details */}
                <div className="p-4 bg-neutral-50 rounded-3xl border border-neutral-100 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={activeProperty.landlordAvatar} className={`w-12 h-12 rounded-full object-cover border shadow-xs ${
                        (activeProperty.verifiedByAdmin || activeProperty.verificationStatus === 'verified')
                          ? 'border-emerald-400'
                          : 'border-neutral-200'
                      }`} />
                      {(activeProperty.verifiedByAdmin || activeProperty.verificationStatus === 'verified') && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white">
                          <Check className="w-2.5 h-2.5 fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] text-neutral-400 block uppercase font-bold">Landlord</span>
                      <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                        {activeProperty.landlordName}
                        {(activeProperty.verifiedByAdmin || activeProperty.verificationStatus === 'verified') && (
                          <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shadow-3xs">
                            <Check className="w-2.5 h-2.5 fill-current" /> Verified Host
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-medium">Replies within {activeProperty.responseSpeedMinutes} mins</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openChatWithLandlord(activeProperty)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition"
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                  </button>
                </div>

              </div>

              {/* BOOKING PURCHASE BAR */}
              <div className="h-18 bg-white border-t border-neutral-200 px-4 flex justify-between items-center sticky bottom-0 left-0 w-full shadow-lg">
                <div className="text-left">
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Required deposit</span>
                  <span className="text-sm font-bold text-neutral-800">KSh {activeProperty.price.toLocaleString()}</span>
                </div>
                
                <button 
                  disabled={activeProperty.isFlagged}
                  onClick={() => setActiveScreen('checkout')}
                  className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-neutral-400 disabled:to-neutral-500 disabled:text-neutral-500 text-white rounded-2xl text-xs font-black shadow-md active:scale-98 transition flex items-center gap-1 uppercase tracking-wider"
                >
                  <Lock className="w-4 h-4 text-white" />
                  Book with Escrow
                </button>
              </div>
            </motion.div>
          )}

          {/* 7. LIVE CHAT PANEL */}
          {activeScreen === 'chat' && activeChat && (
            <motion.div 
              key="chat-screen"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-neutral-100 text-neutral-800 justify-between h-full"
            >
              {/* Chat Sub Header */}
              <div className="p-4 bg-white border-b border-neutral-200 flex justify-between items-center shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setActiveScreen('explore')} className="p-1 hover:bg-neutral-100 rounded-full">
                    <ChevronLeft className="w-5 h-5 text-neutral-500" />
                  </button>
                  <img src={activeChat.participantB.avatar} className="w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-xs" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-neutral-900">{activeChat.participantB.name}</p>
                    <span className="text-[9px] text-[#0ea5e9] font-bold uppercase tracking-wider">StayLink AI Assistant Co-Host</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500"><Phone className="w-4.5 h-4.5" /></button>
                </div>
              </div>

              {/* Chat history list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col text-left">
                <ErrorBoundary name="Chat Data Stream" onRetry={() => {}}>
                  <div className="text-center my-2">
                    <span className="bg-neutral-200 text-neutral-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Shield Escrow pay Active
                    </span>
                  </div>

                  {chatMessages.map((msg, idx) => {
                    const isMe = msg.senderId === userProfile.uid;
                    return (
                      <div 
                        key={idx}
                        className={`max-w-[80%] flex flex-col p-3 rounded-2.5xl text-xs leading-relaxed font-semibold ${
                          isMe ? 'bg-blue-600 text-white self-end rounded-br-xs' : 'bg-white text-neutral-900 self-start rounded-bl-xs border border-neutral-200'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2 mb-1 opacity-70 text-[9px]">
                          <span>{isMe ? 'Me' : msg.senderName}</span>
                          <span>02:04 PM</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="bg-white border border-neutral-200 p-3 rounded-2.5xl rounded-bl-xs max-w-[120px] self-start text-xs flex items-center gap-1.5 text-neutral-400 font-medium">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  )}
                </ErrorBoundary>
              </div>

              {/* Input Message panel */}
              <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 relative">
                
                {simulatedRecording && (
                  <div className="absolute inset-0 bg-neutral-900 text-white flex items-center justify-between px-6 text-xs font-bold animate-pulse">
                    <span>🛑 RECORDING VOICE TELEMETRY...</span>
                    <span className="text-red-500 animate-bounce">● LIVE</span>
                  </div>
                )}

                <button 
                  onClick={startRecordingVoice}
                  className="p-2.5 bg-neutral-100 text-neutral-500 hover:text-blue-500 active:scale-95 transition rounded-full"
                  title="Simulate Voice message"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>

                <input 
                  type="text" 
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type message, nzuri, details..."
                  className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-xs outline-none focus:outline-none placeholder-neutral-400 font-semibold"
                />

                <button 
                  onClick={() => sendChatMessage()}
                  disabled={!replyInput.trim()}
                  className="p-2.5 bg-blue-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          )}

          {/* 8. SECURE FINTECH M-PESA CHECKOUT OVERLAY */}
          {activeScreen === 'checkout' && activeProperty && (
            <motion.div 
              key="checkout"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-[#fafafc] text-neutral-900 p-6 justify-between"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => setActiveScreen('details')} className="p-2 text-neutral-400 bg-white rounded-full border border-neutral-200">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">FINTECH SECURE CHECKS</span>
                <span className="w-8"></span>
              </div>

              <div className="flex-1 overflow-y-auto py-4 text-left space-y-4">
                
                {/* Summary card */}
                <div className="bg-white rounded-2.5xl border border-neutral-200 p-4 shadow-2xs space-y-3">
                  <span className="text-[9px] bg-sky-100 text-sky-800 font-extrabold uppercase px-2 py-0.5 rounded-sm">StayLink Protected Escrow</span>
                  <h4 className="text-sm font-bold text-neutral-950 line-clamp-1">{activeProperty.title}</h4>
                  
                  <div className="w-full border-t border-neutral-100 my-2 pt-2 text-xs space-y-1.5 font-semibold text-neutral-600">
                    <div className="flex justify-between">
                      <span>Rent / Deposit amount</span>
                      <span>KSh {activeProperty.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span>StayLink Protection Fee</span>
                      <span>KSh 0 (Waived)</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 flex justify-between font-black text-sm text-neutral-900">
                    <span>Total due KSh</span>
                    <span className="text-blue-600">KSh {activeProperty.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Direct STK ST Push Form */}
                <form onSubmit={handleInitiateSTK} className="bg-white rounded-2.5xl border border-neutral-200 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3 bg-neutral-100 p-3 rounded-2xl border border-neutral-200">
                    {/* Simulated M-Pesa logo */}
                    <div className="w-10 h-10 bg-emerald-600 text-white font-extrabold flex items-center justify-center rounded-xl text-lg tracking-tighter">
                      M
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-800">Safaricom Sim STK Push</p>
                      <p className="text-[10px] text-neutral-400 font-medium">Automatic instant rent deposit</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-neutral-500">M-Pesa Mobile Number</label>
                    <input 
                      type="text" 
                      defaultValue={userProfile.phone}
                      className="w-full bg-neutral-100 border border-neutral-200 py-2.5 px-3 rounded-xl font-bold font-mono outline-none focus:border-blue-500" 
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md active:scale-98 transition uppercase flex items-center justify-center gap-1.5"
                  >
                    Send STK Push Request
                  </button>
                </form>

              </div>

              {/* Simulated M-Pesa phone Overlay prompt */}
              {stkPushActive && (
                <div className="absolute inset-0 bg-black/75 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }}
                    className="bg-neutral-900 text-white border border-neutral-800 rounded-3xl p-5 w-full text-center space-y-3 shadow-2xl"
                  >
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-full mx-auto flex items-center justify-center text-xl font-black">M</div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Safaricom Pay Utility</h3>
                    <p className="text-xs text-neutral-400">
                      Do you want to deposit <span className="font-bold text-white text-sm">KSh {activeProperty.price.toLocaleString()}</span> to <span className="font-bold text-white">StayLink AI Escrow Wallet</span> for booking approval?
                    </p>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] text-neutral-400 block font-bold uppercase font-mono">Enter secret 4 digit PIN</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="••••"
                        value={stkPin}
                        onChange={(e) => setStkPin(e.target.value)}
                        className="w-full bg-neutral-850 text-center py-3 rounded-xl border border-neutral-700 font-mono text-lg outline-none text-white tracking-widest"
                      />
                      {stkPushError && <p className="text-[10px] text-red-500 font-bold">{stkPushError}</p>}
                    </div>

                    {isPaying ? (
                      <div className="py-4 text-xs font-mono tracking-widest text-[#0ea5e9] animate-pulse flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin text-sky-400" />
                        PROCESSING SECURE GATEWAY...
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => setStkPushActive(false)}
                          className="flex-1 py-3 bg-neutral-850 text-xs font-bold rounded-xl text-neutral-400"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={verifySTKPayment}
                          className="flex-1 py-3 bg-emerald-600 text-xs font-bold rounded-xl text-white hover:bg-emerald-700"
                        >
                          Complete
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* 9. PRINTABLE RECEIPT SCREEN */}
          {activeScreen === 'receipt' && createdBooking && (
            <motion.div 
              key="receipt"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-[#eff6ff] p-6 justify-between text-neutral-950"
            >
              <div className="flex justify-between items-center text-xs">
                <span>Receipt Index: #ST{createdBooking.id.split('_')[1]}</span>
                <span className="font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 py-0.5 px-2 rounded-sm shadow-2xs">Paid</span>
              </div>

              {/* Printable Area styled like vintage receipt voucher */}
              <div className="flex-1 bg-white border border-neutral-300 rounded-3xl p-5 my-4 text-left font-mono text-xs flex flex-col justify-between relative shadow-xs">
                {/* Decorative cutouts */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl"></div>

                <div className="space-y-4 pt-2 flex-grow">
                  <div className="text-center">
                    <h3 className="text-sm font-black font-sans tracking-tight">StayLink AI</h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Nairobi Fintech node</p>
                  </div>

                  <div className="border-t border-dashed border-neutral-200 pt-3 space-y-1 text-[11px] font-semibold text-neutral-600">
                    <p>Tenant: {createdBooking.tenantName}</p>
                    <p>M-Pesa Code: {createdBooking.mpesaTransactionCode}</p>
                    <p>Created: {new Date(createdBooking.createdAt).toLocaleString()}</p>
                    <p className="text-neutral-900 line-clamp-1 mt-1 font-bold">Property: {createdBooking.propertyTitle}</p>
                  </div>

                  <div className="border-t border-dashed border-neutral-200 pt-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>Rent Paid:</span>
                      <span>KSh {createdBooking.amountPaid.toLocaleString()}</span>
                    </div>
                    {/* Automated Commission deduction visual */}
                    <div className="flex justify-between font-bold text-sky-700">
                      <span>StayLink (10% fee):</span>
                      <span>-KSh {createdBooking.commissionAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#16a34a] font-bold">
                      <span>Host Payout (90%):</span>
                      <span>KSh {createdBooking.payoutAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-200 pt-4 flex flex-col items-center gap-2">
                  <QrCode className="w-18 h-18 text-neutral-900" />
                  <p className="text-[9px] text-neutral-400 font-bold uppercase text-center tracking-widest">Scan to check Authenticity</p>
                </div>
              </div>

              <button 
                onClick={() => setActiveScreen('explore')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md active:scale-98 transition uppercase"
              >
                Return Explore
              </button>
            </motion.div>
          )}

          {/* 10. TENANT PROFILE SPACE & GAMIFICATION STREAKS */}
          {activeScreen === 'profile' && (
            <motion.div 
              key="profile"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-neutral-100 text-neutral-800 p-6 justify-between"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => setActiveScreen('explore')} className="p-2 text-neutral-400 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 transition cursor-pointer" title="Back to explore">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono font-bold">My Smart Board</span>
                <button 
                  onClick={() => setActiveScreen('welcome')} 
                  title="Sign Out"
                  className="p-2 text-neutral-400 bg-white hover:bg-red-50 hover:text-red-500 rounded-full border border-neutral-200 transition cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 text-left space-y-4">
                
                {/* Gamification Streak Section */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col">
                  {/* Background flare design */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" /> Active Hunting Streak
                    </span>
                    <span className="text-[10px] font-bold">Level {userProfile.level}</span>
                  </div>
                  
                  <h3 className="text-xl font-black mt-2">{userProfile.currentStreak} Day Search Streak!</h3>
                  <p className="text-[11px] text-amber-100 mt-1">Visit verified Nairobi listings daily to keep your 1.2x M-pesa loyalty point multiplier active!</p>

                  <div className="flex justify-between mt-4 bg-black/15 p-2 rounded-xl text-center text-xs font-bold gap-1">
                    <div>
                      <span className="text-[9px] block text-amber-200">Points Pool</span>
                      <span>{userProfile.referralPoints} pts</span>
                    </div>
                    <div className="w-[1px] bg-white/10 h-8 self-center"></div>
                    <div>
                      <span className="text-[19px] block text-amber-200">💼 VIP</span>
                      <span>Rank #4</span>
                    </div>
                  </div>
                </div>

                {/* Account details verified state */}
                <div className="bg-white rounded-3xl p-5 border border-neutral-100 flex flex-col gap-2.5 shadow-2xs">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Verified Badges & KYC</h4>
                  
                  <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">NIRA National ID Upload</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">✔ Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">M-Pesa Sim Match</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">✔ Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-neutral-100 flex-wrap">
                    <span className="text-neutral-500">Neural Face Telemetry Scan</span>
                    {userProfile.verificationBadges.includes('facial_verified') ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">✔ Verified</span>
                    ) : (
                      <button 
                        onClick={() => {
                          setFaceScanOrigin('profile');
                          setActiveScreen('face_scan');
                        }}
                        className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-3 rounded-full font-black uppercase transition"
                      >
                        Start Scan
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-neutral-100 flex-wrap">
                    <span className="text-neutral-500">Lease Agreement Document</span>
                    {userProfile.verificationBadges.includes('lease_verified') ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">✔ Verified</span>
                    ) : (
                      <button 
                        onClick={() => {
                          setActiveScreen('document_scan');
                        }}
                        className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-1 px-3 rounded-full font-black uppercase transition cursor-pointer"
                      >
                        Scan Document
                      </button>
                    )}
                  </div>
                </div>

                {/* Wallet engine */}
                <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-2xs flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Escrow Protected wallet</span>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-black text-neutral-900">KSh {userProfile.walletBalance.toLocaleString()}</span>
                      <span className="text-[10px] text-neutral-400 block font-medium">Auto-deducted payment cache</span>
                    </div>
                    <button className="py-2 px-4 bg-neutral-150 rounded-xl text-xs font-bold text-neutral-700 flex items-center gap-1 border border-neutral-200">
                      <Wallet className="w-4 h-4" /> Top Up
                    </button>
                  </div>
                </div>

                {/* Multilanguage Dictionary */}
                <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-2xs flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Settings: App Language</span>
                  <div className="flex gap-2">
                    {['en', 'sw'].map(lang => (
                      <button 
                        key={lang}
                        onClick={() => setUserProfile(prev => ({ ...prev, language: lang as 'en' | 'sw' }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition border ${
                          userProfile.language === lang 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {lang === 'en' ? '🇬🇧 English' : '🇰🇪 Kiswahili'}
                      </button>
                    ))}
                  </div>
                </div>

                {userProfile.role === 'Cohort' && (
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-50 rounded-3xl p-5 border border-purple-200 shadow-2xs flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Cohort Preferences</span>
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">Update your rent percentage share and terms. Once you find a match, you will be delisted automatically.</p>
                    <button 
                      onClick={() => setActiveScreen('cohort_preferences')}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase shadow-md active:scale-98 transition mt-2"
                    >
                      Update Preferences
                    </button>
                  </div>
                )}

              </div>

              <div className="flex gap-2.5 w-full mt-2">
                <button 
                  onClick={() => setActiveScreen('explore')}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md active:scale-98 transition uppercase cursor-pointer"
                >
                  Return Dashboard
                </button>
                <button 
                  onClick={() => setActiveScreen('welcome')}
                  className="px-4 py-4 bg-neutral-200 hover:bg-red-100 hover:text-red-650 text-neutral-700 rounded-2xl text-xs font-black shadow-md active:scale-98 transition uppercase flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-300"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}

          {/* COHORT PREFERENCES SCREEN */}
          {activeScreen === 'cohort_preferences' && (
            <motion.div key="cohort_preferences" {...pageTransitions} className="flex-1 flex flex-col w-full h-full">
              <CohortPreferencesScreen 
                currentUser={userProfile}
                onBack={() => setActiveScreen('profile')}
                onSubmit={(prefs) => {
                  const existing = roommates.find(r => r.uid === prefs.uid);
                  if (existing) {
                    const updated = roommates.map(r => r.uid === prefs.uid ? { ...r, ...prefs } : r);
                    onStateUpdate({ roommates: updated });
                  } else {
                    onStateUpdate({ roommates: [prefs as RoommateProfile, ...roommates] });
                  }
                  setActiveScreen('profile');
                }}
              />
            </motion.div>
          )}

          {/* LIST PROPERTY SCREEN */}
          {activeScreen === 'add_property' && (
            <motion.div key="add_property" {...pageTransitions} className="flex-1 flex flex-col w-full h-full">
              <AddPropertyScreen 
                currentUser={userProfile}
                onBack={() => setActiveScreen('explore')}
                onSubmit={(newProp) => {
                  const fullProp: Property = {
                    id: `prop_${Date.now()}`,
                    ...newProp
                  } as Property;
                  onStateUpdate({ properties: [fullProp, ...properties] });
                  setActiveScreen('explore');
                }}
              />
            </motion.div>
          )}

          {/* 11. EMBEDDED ADMIN CONSOLE SCREEN */}
          {activeScreen === 'admin_console' && (
            <motion.div 
              key="admin_console"
              {...pageTransitions}
              className="flex-1 flex flex-col bg-[#0b0f19] text-white relative h-full justify-between w-full"
            >
              <div className="flex-1 overflow-y-auto p-2">
                <AdminConsole 
                  properties={properties}
                  transactions={transactions}
                  stats={stats}
                  onUpdateProperties={(updatedList) => {
                    onStateUpdate({ properties: updatedList });
                  }}
                  onToggleVerification={() => {}}
                  bookings={bookings}
                  onUpdateBookings={onUpdateBookings}
                  roommates={roommates}
                  onStateUpdate={onStateUpdate}
                />
              </div>
              <div className="h-16 bg-white border-t border-neutral-200 px-6 flex justify-between items-center z-40 relative shadow-md">
                <button 
                  onClick={() => setActiveScreen('explore')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <Compass className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Explore</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('map_tracker')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">GPS Map</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('tiktok_feed')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Swipe Reels</span>
                </button>
                <button 
                  onClick={() => {
                    let defaultChat = chats[0];
                    if (defaultChat) {
                      setActiveChat(defaultChat);
                      setChatMessages(messagesList[defaultChat.id] || []);
                      setActiveScreen('chat');
                    }
                  }}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition relative cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Chats</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center">1</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('profile')}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Streaks</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('admin_console')}
                  className="flex flex-col items-center gap-0.5 text-blue-600 transition cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 fill-current" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Admin</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
