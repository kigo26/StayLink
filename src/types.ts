/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Roles in StayLink AI Ecosystem
export type UserRole = 'tenant' | 'landlord' | 'admin' | 'agency' | 'Cohort' | 'seller';

export type PropertyType = 'apartment' | 'airbnb' | 'roommate' | 'sale' | 'hotel';
export type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
  verificationBadges: ('id_uploaded' | 'facial_verified' | 'phone_verified' | 'owner_verified')[];
  walletBalance: number; // in KSh
  referralCode: string;
  referralsCount: number;
  referralPoints: number;
  level: number;
  currentStreak: number;
  createdAt: string;
  language: 'en' | 'sw';
}

// Neighborhood and Eco-system score
export interface NeighborhoodMetrics {
  safety: number; // scale 1-100
  transit: number; // scale 1-100
  noise: number; // scale 1-100
  hospitalsNear: number; // count
  schoolsNear: number; // count
  mallsNear: number; // count
  commuteToCBD: string; // duration estimate
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in KSh (Kenya Shilling)
  location: string; // e.g. Kilimani, Nairobi
  coordinates: {
    lat: number;
    lng: number;
  };
  type: PropertyType;
  category: PropertyCategory;
  images: string[];
  videoUrl?: string; // YouTube style or simulated vertical video
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  landlordId: string;
  landlordName: string;
  landlordAvatar: string;
  aiQualityScore: number; // calculated 1 to 100 based on reviews, responsiveness, etc.
  neighborhoodMetrics: NeighborhoodMetrics;
  responseSpeedMinutes: number;
  bookingSuccessRate: number;
  isPromoted: boolean;
  isFlagged: boolean;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  averageRating?: number;
  reviewsCount?: number;
  hasVirtualTour?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verifiedByAdmin?: boolean;
  availabilityStatus?: 'available' | 'booked' | 'sold' | 'rented';
}

export interface RoommateProfile {
  uid: string;
  name: string;
  avatar: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  occupation: string;
  budget: number; // max KSh per month
  lifestyle: string[]; // e.g. ["Non-smoker", "Quiet", "Early Bird", "Gym lover"]
  cleanliness: 'High' | 'Medium' | 'Low';
  sleepSchedule: 'Night Owl' | 'Early Bird' | 'Flexible';
  hobbies: string[];
  rentPercentage?: number; // Rent percentage sharing preference
  terms?: string; // Any specific terms/preferences
  partnerFound?: boolean; // If true, they are delisted
  compatibilityScore?: number; // Real-time calculation
  profileDescription?: string;
  currentlyLive?: string;
  housingType?: 'Rented' | 'Owned';
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  payoutAmount: number; // price - 10%
  commissionAmount: number; // 10%
  amountPaid: number; // Total KSh
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  checkIn: string;
  checkOut: string;
  mpesaTransactionCode?: string;
  createdAt: string;
  escrowStatus: 'held' | 'released' | 'refunded';
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  bookingId?: string;
  propertyTitle?: string;
  type: 'deposit' | 'booking_payment' | 'booking_payout' | 'commission_payout' | 'referral_bonus';
  amount: number;
  commissionCalculated?: number;
  provider: 'mpesa' | 'flutterwave' | 'pesapal' | 'wallet';
  reference: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
}

export interface Comment {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
}

export interface Message {
  id: string;
  chatSessionId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
  hasVoice?: boolean;
  voiceDuration?: number; // in seconds
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  participantA: { uid: string; name: string; avatar: string; role: string };
  participantB: { uid: string; name: string; avatar: string; role: string };
  lastMessageText: string;
  lastMessageTimestamp: string;
  hasUnread: boolean;
}

export interface VerificationRequest {
  uid: string;
  idNumber: string;
  selfieImage: string; // base64 / mock
  documentImage: string; // base64 / mock
  phoneVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalProperties: number;
  totalVolumeKsh: number;
  commissionKsh: number;
  escrowHeldKsh: number;
  referralsClaimed: number;
  flaggedCount: number;
  averageQualityScore: number;
}
