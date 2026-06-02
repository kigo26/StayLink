/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property, RoommateProfile, UserProfile, ChatSession, Message, PlatformStats } from './types';

export const CURRENT_USER: UserProfile = {
  uid: 'user_john_doe',
  name: 'John Mwangi',
  email: 'skigo5917@gmail.com', // Match the user's email from metadata
  phone: '+254 712 345 678',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
  role: 'tenant',
  isVerified: false,
  verificationBadges: ['phone_verified'],
  walletBalance: 45000, // KSh
  referralCode: 'STAYNW9',
  referralsCount: 4,
  referralPoints: 250,
  level: 1,
  currentStreak: 5,
  createdAt: '2026-05-01T12:00:00Z',
  language: 'en'
};

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop_kilimani_luxury',
    title: 'Executive 2BR Apartment in Kilimani',
    description: 'Fully furnished, state-of-the-art apartment located in the leafy suburbs of Kilimani. Features secure biometric access, reliable backup generator, high-speed fiber internet, and premium Swahili-themed interior decor. Perfect for young professionals or couples who value peace and high-class amenities. Extremely responsive landlord block.',
    price: 35000, // Monthly in KSh
    location: 'Kilimani, Nairobi',
    coordinates: { lat: -1.2912, lng: 36.7901 },
    type: 'apartment',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-kitchen-and-living-room-41979-large.mp4',
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['High-speed WiFi', '24/7 Security', 'Borehole', 'Lift', 'Gym', 'Balcony', 'DSTV', 'M-Pesa Rent-Enabled'],
    landlordId: 'landlord_amina',
    landlordName: 'Amina Cherono',
    landlordAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop',
    aiQualityScore: 94,
    neighborhoodMetrics: {
      safety: 92,
      transit: 85,
      noise: 40, // Quiet
      hospitalsNear: 3,
      schoolsNear: 5,
      mallsNear: 2,
      commuteToCBD: '12-15 mins driving (low traffic)'
    },
    responseSpeedMinutes: 4,
    bookingSuccessRate: 98,
    isPromoted: true,
    isFlagged: false,
    createdAt: '2026-05-15T08:00:00Z',
    likesCount: 145,
    commentsCount: 22,
    hasVirtualTour: true,
    verificationStatus: 'verified',
    verifiedByAdmin: true
  },
  {
    id: 'prop_westlands_studio',
    title: 'Cozy Smart Airbnb Studio in Westlands',
    description: 'Chic, industrial-style studio apartment inside a secure high-rise in Westlands, Nairobi. Comes equipped with Alexa voice commands, automated curtains, smart lockbox, and gorgeous views of the Nairobi skyline. Surrounded by the best cafes, malls, and restaurants Westlands has to offer. Fully serviced daily.',
    price: 4500, // Daily rate in KSh
    location: 'Westlands, Nairobi',
    coordinates: { lat: -1.2635, lng: 36.8048 },
    type: 'airbnb',
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-interior-design-of-a-living-room-41980-large.mp4',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Alexa Integration', 'Rooftop Pool', 'Rooftop Lounge', 'Parking', 'WiFi', 'Kitchen Utilities', 'Hot Shower'],
    landlordId: 'landlord_mwangi_k',
    landlordName: 'Kenneth Mwangi',
    landlordAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
    aiQualityScore: 89,
    neighborhoodMetrics: {
      safety: 88,
      transit: 95,
      noise: 75, // Energetic
      hospitalsNear: 2,
      schoolsNear: 2,
      mallsNear: 4,
      commuteToCBD: '10 mins driving, highly accessible'
    },
    responseSpeedMinutes: 10,
    bookingSuccessRate: 95,
    isPromoted: false,
    isFlagged: false,
    createdAt: '2026-05-20T10:30:00Z',
    likesCount: 88,
    commentsCount: 12,
    hasVirtualTour: false,
    verificationStatus: 'verified',
    verifiedByAdmin: true
  },
  {
    id: 'prop_roommate_westlands',
    title: 'Spacious Shared Suite near Westlands',
    description: 'Looking for a flatmate! I have a gorgeous 3-bedroom penthouse apartment right on the border of Westlands and Parklands. You will get your own private en-suite bedroom and shared access to the massive living room, fully equipped gourmet kitchen, and panoramic balcony. Ideal for a mature, respectful professional who likes cats.',
    price: 15000, // Monthly cost in KSh
    location: 'Westlands, Nairobi',
    coordinates: { lat: -1.2610, lng: 36.8090 },
    type: 'roommate',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cozy-apartment-design-revels-with-plants-and-books-41982-large.mp4',
    bedrooms: 3,
    bathrooms: 3,
    amenities: ['Shared Kitchen', 'Cat Friendly', 'High-speed internet', 'Washing Machine', 'Smart TV', 'Private Bathroom'],
    landlordId: 'user_wanjiku',
    landlordName: 'Wanjiku Kamau',
    landlordAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=300&auto=format&fit=crop',
    aiQualityScore: 96,
    neighborhoodMetrics: {
      safety: 90,
      transit: 92,
      noise: 45,
      hospitalsNear: 4,
      schoolsNear: 3,
      mallsNear: 3,
      commuteToCBD: '14 mins via public service transit'
    },
    responseSpeedMinutes: 2,
    bookingSuccessRate: 100,
    isPromoted: false,
    isFlagged: false,
    createdAt: '2026-05-22T14:00:00Z',
    likesCount: 210,
    commentsCount: 45,
    hasVirtualTour: true,
    verificationStatus: 'verified',
    verifiedByAdmin: true
  },
  {
    id: 'prop_karen_villa',
    title: 'Intelligent Smart Mansionette in Karen',
    description: 'Magnificent 5-bedroom luxury estate for sale nestled in the secure gated community of Karen. Built with ecological principles, intelligent solar harvesting grids, smart automated irrigation, private server closets, and state-of-the-art safety mechanisms. It includes separate quarters for support staff and a pristine swimming pool.',
    price: 135000000, // Purchase price in KSh
    location: 'Karen, Nairobi',
    coordinates: { lat: -1.3190, lng: 36.7120 },
    type: 'sale',
    images: [
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop'
    ],
    bedrooms: 5,
    bathrooms: 6,
    amenities: ['Private Pool', 'Solar Automation', 'Irrigation Grid', 'Staff Quarters', 'Gated Estate', 'Security Turrets', 'Biometrics'],
    landlordId: 'landlord_mwangi_k',
    landlordName: 'Kenneth Mwangi',
    landlordAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
    aiQualityScore: 91,
    neighborhoodMetrics: {
      safety: 98,
      transit: 60, // Low public transit, highly private
      noise: 15, // Extremely quiet
      hospitalsNear: 2,
      schoolsNear: 8,
      mallsNear: 3,
      commuteToCBD: '25-30 mins via Southern Bypass'
    },
    responseSpeedMinutes: 15,
    bookingSuccessRate: 92,
    isPromoted: true,
    isFlagged: false,
    createdAt: '2026-05-18T16:00:00Z',
    likesCount: 312,
    commentsCount: 19,
    hasVirtualTour: true,
    verificationStatus: 'verified',
    verifiedByAdmin: true
  },
  {
    id: 'prop_mombasa_resort',
    title: 'Serene Ocean-view Retreat in Nyali',
    description: 'Charming beach-adjacent resort hotel room available for short stays in Nyali, Mombasa. Enjoy immediate private beach access, custom hospitality services, and full sea views from your canopy bed balcony. StayLink AI secure payment fully integrated with automatic airport shuttle coordination.',
    price: 8500, // Daily in KSh
    location: 'Nyali, Mombasa',
    coordinates: { lat: -4.0298, lng: 39.7145 },
    type: 'hotel',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop'
    ],
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Beach Access', 'Free Breakfast', 'Ocean Balcony', 'AC Control', 'Marseille Linen', 'Shuttle Service', 'M-Pesa pay'],
    landlordId: 'landlord_chebet',
    landlordName: 'Chebet Koech',
    landlordAvatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=300&auto=format&fit=crop',
    aiQualityScore: 97,
    neighborhoodMetrics: {
      safety: 95,
      transit: 80,
      noise: 30, // Ocean sounds
      hospitalsNear: 1,
      schoolsNear: 1,
      mallsNear: 2,
      commuteToCBD: '20 mins to Mombasa Island'
    },
    responseSpeedMinutes: 3,
    bookingSuccessRate: 99,
    isPromoted: true,
    isFlagged: false,
    createdAt: '2026-05-19T09:00:00Z',
    likesCount: 190,
    commentsCount: 33,
    hasVirtualTour: false,
    verificationStatus: 'verified',
    verifiedByAdmin: true
  },
  {
    id: 'prop_fake_scam',
    title: 'UNBELIEVABLE 3BR Villa in Muthaiga (Cheap!)',
    description: 'Absolute bargain! Gorgeous 3-bedroom villa in the ultimate rich estate of Muthaiga. Renting for an extremely low price. Rent must be deposited immediately inside a personal number to secure. Quick booking highly recommended or you will miss. Landlord is out of country, self-booking required.',
    price: 8000, // Suspiciously cheap for Muthaiga (normally 250k+)
    location: 'Muthaiga, Nairobi',
    coordinates: { lat: -1.2500, lng: 36.8300 },
    type: 'apartment',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'
    ],
    bedrooms: 3,
    bathrooms: 3,
    amenities: ['Pool', 'Security', 'Quick deposit needed', 'No physical viewing before pay'],
    landlordId: 'landlord_scammer',
    landlordName: 'Steve Scammer',
    landlordAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop',
    aiQualityScore: 12, // Very low!
    neighborhoodMetrics: {
      safety: 99,
      transit: 40,
      noise: 10,
      hospitalsNear: 1,
      schoolsNear: 2,
      mallsNear: 1,
      commuteToCBD: '15 mins'
    },
    responseSpeedMinutes: 1,
    bookingSuccessRate: 20,
    isPromoted: false,
    isFlagged: true, // Auto-detected as potential scam listing
    createdAt: '2026-05-28T02:00:00Z',
    likesCount: 2,
    commentsCount: 41,
    hasVirtualTour: false,
    verificationStatus: 'rejected',
    verifiedByAdmin: false
  }
];

export const INITIAL_ROOMMATES: RoommateProfile[] = [
  {
    uid: 'user_wanjiku',
    name: 'Wanjiku Kamau',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=300&auto=format&fit=crop',
    age: 24,
    gender: 'Female',
    occupation: 'Creative Designer',
    budget: 20000,
    lifestyle: ['Non-smoker', 'Early Bird', 'Quiet', 'Gym lover', 'Vegan'],
    cleanliness: 'High',
    sleepSchedule: 'Early Bird',
    hobbies: ['Painting', 'Yoga', 'Cooking Swahili food', 'Photography'],
    compatibilityScore: 92,
    rentPercentage: 50,
    terms: 'I cover exactly 50% of the rent. Looking for long-term lease. Guests are fine, but no late parties.',
    partnerFound: false
  },
  {
    uid: 'user_mwangi_j',
    name: 'Mwangi Gathu',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
    age: 27,
    gender: 'Male',
    occupation: 'Software Engineer',
    budget: 25000,
    lifestyle: ['Working hard', 'Flexible', 'Gamer', 'Gym lover', 'Coffee addict'],
    cleanliness: 'Medium',
    sleepSchedule: 'Night Owl',
    hobbies: ['Coding', 'Gaming', 'Hiking Aberdares', 'Jazz Music'],
    compatibilityScore: 84,
    rentPercentage: 60,
    terms: 'I am willing to pay 60% if I get the master bedroom. Pets are fine but I need quiet hours during weekdays.',
    partnerFound: false
  },
  {
    uid: 'user_fatuma',
    name: 'Fatuma Hassan',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    age: 23,
    gender: 'Female',
    occupation: 'Fintech Analyst',
    budget: 18000,
    lifestyle: ['Studious', 'Quiet', 'No Pets', 'Friendly'],
    cleanliness: 'High',
    sleepSchedule: 'Flexible',
    hobbies: ['Reading novels', 'Sudoku', 'Cycling in Karura'],
    compatibilityScore: 78
  },
  {
    uid: 'user_chebet_room',
    name: 'Chebet K.',
    avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=300&auto=format&fit=crop',
    age: 26,
    gender: 'Female',
    occupation: 'Doctor at KNH',
    budget: 30000,
    lifestyle: ['Quiet', 'Clean', 'Frequent Nightshifts', 'No Smoking'],
    cleanliness: 'High',
    sleepSchedule: 'Flexible',
    hobbies: ['Tennis', 'Cooking', 'Podcasts'],
    compatibilityScore: 96
  }
];

export const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat_amina_john',
    propertyId: 'prop_kilimani_luxury',
    propertyTitle: 'Executive 2BR Apartment in Kilimani',
    participantA: { uid: 'user_john_doe', name: 'John Mwangi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', role: 'tenant' },
    participantB: { uid: 'landlord_amina', name: 'Amina Cherono', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop', role: 'landlord' },
    lastMessageText: 'Yes, the apartment is available for physical viewing starting tomorrow morning!',
    lastMessageTimestamp: '2026-05-29T11:45:00Z',
    hasUnread: true
  },
  {
    id: 'chat_wanjiku_john',
    propertyId: 'prop_roommate_westlands',
    propertyTitle: 'Spacious Shared Suite near Westlands',
    participantA: { uid: 'user_john_doe', name: 'John Mwangi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', role: 'tenant' },
    participantB: { uid: 'user_wanjiku', name: 'Wanjiku Kamau', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=300&auto=format&fit=crop', role: 'landlord' },
    lastMessageText: 'How old is your cat? I have a small grey kitten myself.',
    lastMessageTimestamp: '2026-05-28T09:15:00Z',
    hasUnread: false
  }
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  chat_amina_john: [
    {
      id: 'msg_1',
      chatSessionId: 'chat_amina_john',
      senderId: 'landlord_amina',
      senderName: 'Amina Cherono',
      senderAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop',
      text: 'Habari John, how can I assist you with the Kilimani property today?',
      timestamp: '2026-05-29T10:30:00Z',
      isRead: true
    },
    {
      id: 'msg_2',
      chatSessionId: 'chat_amina_john',
      senderId: 'user_john_doe',
      senderName: 'John Mwangi',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      text: 'Nzuri Amina! I am very interested in booking is the Executive 2BR still fully available?',
      timestamp: '2026-05-29T11:42:00Z',
      isRead: true
    },
    {
      id: 'msg_3',
      chatSessionId: 'chat_amina_john',
      senderId: 'landlord_amina',
      senderName: 'Amina Cherono',
      senderAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop',
      text: 'Yes, the apartment is available for physical viewing starting tomorrow morning!',
      timestamp: '2026-05-29T11:45:00Z',
      isRead: false
    }
  ],
  chat_wanjiku_john: [
    {
      id: 'msg_4',
      chatSessionId: 'chat_wanjiku_john',
      senderId: 'user_john_doe',
      senderName: 'John Mwangi',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      text: 'Hi Wanjiku, saw your roommate listing. I really love books and quiet places too!',
      timestamp: '2026-05-28T09:00:00Z',
      isRead: true
    },
    {
      id: 'msg_5',
      chatSessionId: 'chat_wanjiku_john',
      senderId: 'user_wanjiku',
      senderName: 'Wanjiku Kamau',
      senderAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=300&auto=format&fit=crop',
      text: 'Aww thank you! That is nice. How old is your cat? I have a small grey kitten myself.',
      timestamp: '2026-05-28T09:15:00Z',
      isRead: true
    }
  ]
};

export const INITIAL_STATS: PlatformStats = {
  totalUsers: 2478,
  totalProperties: 142,
  totalVolumeKsh: 4892000,
  commissionKsh: 489200, // 10% auto deduction
  escrowHeldKsh: 1250000,
  referralsClaimed: 312,
  flaggedCount: 1, // Muthaiga mock listing
  averageQualityScore: 92
};
