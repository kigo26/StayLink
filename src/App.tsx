/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_ROOMMATES, 
  INITIAL_CHAT_SESSIONS, 
  INITIAL_MESSAGES, 
  INITIAL_STATS, 
  CURRENT_USER 
} from './data';
import { Property, Message, ChatSession, Booking, Transaction, PlatformStats } from './types';
import MobileEmulator from './components/MobileEmulator';
import LandingPage from './components/LandingPage';

const INITIAL_BOOKINGS: Booking[] = [

  {
    id: 'bk_init_1',
    propertyId: 'prop_kilimani_luxury',
    propertyTitle: 'Executive 2BR Apartment in Kilimani',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop',
    tenantId: 'user_john_doe',
    tenantName: 'John Mwangi',
    landlordId: 'landlord_amina',
    payoutAmount: 45000,
    commissionAmount: 5000,
    amountPaid: 50000,
    status: 'active',
    checkIn: '2026-05-01',
    checkOut: '2026-05-31',
    mpesaTransactionCode: 'MPM891462B3',
    createdAt: '2026-05-01T10:00:00Z',
    escrowStatus: 'held'
  },
  {
    id: 'bk_init_2',
    propertyId: 'prop_westlands_studio',
    propertyTitle: 'Cozy Smart Airbnb Studio in Westlands',
    propertyImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop',
    tenantId: 'user_fatuma',
    tenantName: 'Fatuma Hassan',
    landlordId: 'landlord_wanjiku',
    payoutAmount: 27000,
    commissionAmount: 3000,
    amountPaid: 30000,
    status: 'completed',
    checkIn: '2026-04-10',
    checkOut: '2026-04-20',
    mpesaTransactionCode: 'MPK723145H8',
    createdAt: '2026-04-10T08:30:00Z',
    escrowStatus: 'released'
  },
  {
    id: 'bk_init_3',
    propertyId: 'prop_roommate_westlands',
    propertyTitle: 'Spacious Shared Suite near Westlands',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop',
    tenantId: 'user_chebet_room',
    tenantName: 'Chebet Koech',
    landlordId: 'landlord_joseph',
    payoutAmount: 22500,
    commissionAmount: 2500,
    amountPaid: 25000,
    status: 'pending',
    checkIn: '2026-06-01',
    checkOut: '2026-06-30',
    mpesaTransactionCode: 'MPA110294J5',
    createdAt: '2026-05-28T14:15:00Z',
    escrowStatus: 'held'
  },
  {
    id: 'bk_init_4',
    propertyId: 'prop_karen_villa',
    propertyTitle: 'Intelligent Smart Mansionette in Karen',
    propertyImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop',
    tenantId: 'user_mwangi_j',
    tenantName: 'Mwangi J.',
    landlordId: 'landlord_karen',
    payoutAmount: 108000,
    commissionAmount: 12000,
    amountPaid: 120000,
    status: 'cancelled',
    checkIn: '2026-05-15',
    checkOut: '2026-06-15',
    mpesaTransactionCode: 'MPC491024L2',
    createdAt: '2026-05-10T11:22:00Z',
    escrowStatus: 'refunded'
  }
];

export default function App() {
  // Global App States synced synchronously
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHAT_SESSIONS);
  const [messagesList, setMessagesList] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  
  // Transactions database matching Safaricom / Pesapal parameters
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'trx_init_1',
      userId: 'landlord_amina',
      userName: 'Amina Cherono',
      type: 'booking_payout',
      amount: 45000,
      provider: 'wallet',
      reference: 'WLT510204E',
      status: 'success',
      timestamp: '2026-05-20T10:00:00Z'
    },
    {
      id: 'trx_init_2',
      userId: 'user_john_doe',
      userName: 'John Mwangi',
      propertyTitle: 'Executive 2BR Apartment in Kilimani',
      type: 'booking_payment',
      amount: 50000,
      commissionCalculated: 5000,
      provider: 'mpesa',
      reference: 'MPM891462B3',
      status: 'success',
      timestamp: '2026-05-20T09:45:00Z'
    }
  ]);

  const [platformStats, setPlatformStats] = useState<PlatformStats>(INITIAL_STATS);
  const [landingState, setLandingState] = useState<{show: boolean; authMode?: 'login'|'register'; showModal?: boolean}>({show: true});
  const [selectedRole, setSelectedRole] = useState<string>('landlord');

  // States Handlers
  const handleAddTransaction = (newTrx: Transaction) => {
    setTransactions(prev => [newTrx, ...prev]);
    
    // Update top counts
    if (newTrx.type === 'booking_payment') {
      setPlatformStats(prev => ({
        ...prev,
        totalVolumeKsh: prev.totalVolumeKsh + newTrx.amount,
        commissionKsh: prev.commissionKsh + (newTrx.amount * 0.10)
      }));
    }
  };

  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    // Escrow held update
    setPlatformStats(prev => ({
      ...prev,
      escrowHeldKsh: prev.escrowHeldKsh + newBooking.amountPaid
    }));
  };

  return (
    <div className="relative w-screen h-screen bg-neutral-900 text-white overflow-hidden flex flex-col selection:bg-blue-600 selection:text-white">
      {landingState.show ? (
        <LandingPage 
          initialAuthMode={landingState.authMode || 'login'}
          initialShowModal={landingState.showModal || false}
          onComplete={(role) => {
            setSelectedRole(role);
            setLandingState({ show: false });
          }} 
        />
      ) : (
        <main className="w-full h-full flex-1 flex flex-col overflow-hidden bg-[#030712]">
          <header className="w-full px-6 pt-6 pb-4 shrink-0 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-md z-10 border-b border-white/5 relative">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center gap-4 w-full absolute top-6 px-6 left-0 right-0">
                <button onClick={() => setLandingState({ show: true })} className="text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors text-sm flex items-center gap-2">
                  &larr; Back
                </button>
                <div className="flex items-center gap-4">
                  <button onClick={() => setLandingState({ show: true, authMode: 'login', showModal: true })} className="text-blue-600 hover:text-blue-500 font-mono text-sm tracking-widest transition-colors cursor-pointer">Login</button>
                  <button onClick={() => setLandingState({ show: true, authMode: 'register', showModal: true })} className="text-blue-600 hover:text-blue-500 font-mono text-sm tracking-widest transition-colors cursor-pointer">Register</button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] bg-[#0ea5e9] flex items-center justify-center shadow-lg cursor-pointer" onClick={() => setLandingState({ show: true })}>
                  <span className="text-white font-black text-xl sm:text-2xl tracking-tighter">S</span>
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-white font-black text-lg sm:text-xl tracking-tight leading-tighter flex items-center gap-1 italic cursor-pointer" onClick={() => setLandingState({ show: true })}>
                    STAYLINK 
                    <span className="text-blue-500 text-[10px] sm:text-xs bg-[#0f172a] border border-[#1e293b] px-1.5 py-0.5 rounded ml-1 not-italic font-bold">AI</span>
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Real Estate & Escrow Super App</p>
                </div>
              </div>

              <div className="mt-2 flex w-full justify-between items-center">
                <div className="bg-[#0ea5e9] border border-white inline-block px-4 sm:px-6 py-2">
                  <span className="text-red-700 font-mono text-base sm:text-lg tracking-wider font-bold capitalize">
                    {selectedRole === 'agency' ? 'Agencies' : selectedRole === 'Cohorts' ? 'Cohorts' : selectedRole + 's'} Section
                  </span>
                </div>
                
                <div className="border border-white inline-flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-2 sm:py-3 min-w-[200px]">
                  <span className="text-white text-sm sm:text-sm font-sans tracking-wide">
                    Tenant Name
                  </span>
                  <span className="text-white text-sm sm:text-sm font-sans tracking-wide">
                    Tenant Avatar
                  </span>
                </div>
              </div>
            </div>
          </header>

          <MobileEmulator 
            properties={properties}
            roommates={INITIAL_ROOMMATES}
            currentUser={{...CURRENT_USER, role: selectedRole as any}}
            chats={chats}
            messagesList={messagesList}
            bookings={bookings}
            onUpdateBookings={setBookings}
            onStateUpdate={(data) => {
              if (data.properties) setProperties(data.properties);
              if (data.chats) setChats(data.chats);
              if (data.messagesList) setMessagesList(data.messagesList);
            }}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onAddBooking={handleAddBooking}
            stats={platformStats}
          />
        </main>
      )}
    </div>
  );
}
