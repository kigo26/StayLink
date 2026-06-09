/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMMATES,
  INITIAL_CHAT_SESSIONS,
  INITIAL_MESSAGES,
  INITIAL_STATS,
  CURRENT_USER,
} from "./data";
import {
  Property,
  Message,
  ChatSession,
  Booking,
  Transaction,
  PlatformStats,
  UserProfile,
  RoommateProfile,
} from "./types";
import MobileEmulator from "./components/MobileEmulator";
import LandingPage from "./components/LandingPage";
import {
  NotificationsContainer,
  NotificationData,
} from "./components/Notification";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { StayLinkLogo } from "./components/StayLinkLogo";

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "bk_init_1",
    propertyId: "prop_kilimani_luxury",
    propertyTitle: "Executive 2BR Apartment in Kilimani",
    propertyImage:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop",
    tenantId: "user_john_doe",
    tenantName: "John Mwangi",
    landlordId: "landlord_amina",
    payoutAmount: 45000,
    commissionAmount: 5000,
    amountPaid: 50000,
    status: "active",
    checkIn: "2026-05-01",
    checkOut: "2026-05-31",
    mpesaTransactionCode: "MPM891462B3",
    createdAt: "2026-05-01T10:00:00Z",
    escrowStatus: "held",
  },
  {
    id: "bk_init_2",
    propertyId: "prop_westlands_studio",
    propertyTitle: "Cozy Smart Airbnb Studio in Westlands",
    propertyImage:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop",
    tenantId: "user_fatuma",
    tenantName: "Fatuma Hassan",
    landlordId: "landlord_wanjiku",
    payoutAmount: 27000,
    commissionAmount: 3000,
    amountPaid: 30000,
    status: "completed",
    checkIn: "2026-04-10",
    checkOut: "2026-04-20",
    mpesaTransactionCode: "MPK723145H8",
    createdAt: "2026-04-10T08:30:00Z",
    escrowStatus: "released",
  },
  {
    id: "bk_init_3",
    propertyId: "prop_roommate_westlands",
    propertyTitle: "Spacious Shared Suite near Westlands",
    propertyImage:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop",
    tenantId: "user_chebet_room",
    tenantName: "Chebet Koech",
    landlordId: "landlord_joseph",
    payoutAmount: 22500,
    commissionAmount: 2500,
    amountPaid: 25000,
    status: "pending",
    checkIn: "2026-06-01",
    checkOut: "2026-06-30",
    mpesaTransactionCode: "MPA110294J5",
    createdAt: "2026-05-28T14:15:00Z",
    escrowStatus: "held",
  },
  {
    id: "bk_init_4",
    propertyId: "prop_karen_villa",
    propertyTitle: "Intelligent Smart Mansionette in Karen",
    propertyImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop",
    tenantId: "user_mwangi_j",
    tenantName: "Mwangi J.",
    landlordId: "landlord_karen",
    payoutAmount: 108000,
    commissionAmount: 12000,
    amountPaid: 120000,
    status: "cancelled",
    checkIn: "2026-05-15",
    checkOut: "2026-06-15",
    mpesaTransactionCode: "MPC491024L2",
    createdAt: "2026-05-10T11:22:00Z",
    escrowStatus: "refunded",
  },
];

export default function App() {
  // Global App States synced synchronously
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [roommates, setRoommates] =
    useState<RoommateProfile[]>(INITIAL_ROOMMATES);
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHAT_SESSIONS);
  const [messagesList, setMessagesList] =
    useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  // Transactions database matching Safaricom / Pesapal parameters
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "trx_init_1",
      userId: "landlord_amina",
      userName: "Amina Cherono",
      type: "booking_payout",
      amount: 45000,
      provider: "wallet",
      reference: "WLT510204E",
      status: "success",
      timestamp: "2026-05-20T10:00:00Z",
    },
    {
      id: "trx_init_2",
      userId: "user_john_doe",
      userName: "John Mwangi",
      propertyTitle: "Executive 2BR Apartment in Kilimani",
      type: "booking_payment",
      amount: 50000,
      commissionCalculated: 5000,
      provider: "mpesa",
      reference: "MPM891462B3",
      status: "success",
      timestamp: "2026-05-20T09:45:00Z",
    },
  ]);

  const [platformStats, setPlatformStats] =
    useState<PlatformStats>(INITIAL_STATS);
  const [landingState, setLandingState] = useState<{
    show: boolean;
    authMode?: "login" | "register";
    showModal?: boolean;
  }>({ show: true });
  const [selectedRole, setSelectedRole] = useState<string>("landlord");
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [firebaseUserName, setFirebaseUserName] = useState<string>("");
  const [firebaseUserRole, setFirebaseUserRole] = useState<string>("tenant");
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Global Search Filters
  const [globalLocation, setGlobalLocation] = useState("");
  const [globalMaxPrice, setGlobalMaxPrice] = useState<number | "">("");
  const [globalPropertyType, setGlobalPropertyType] = useState<string>("all");

  const addNotification = (
    message: string,
    type: "success" | "info" | "warning" | "error" = "info",
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setFirebaseUserName(user.displayName || user.phoneNumber || "Guest User");
        try {
          const { getDoc, getDocFromCache, doc } = await import('firebase/firestore');
          const { db } = await import('./firebase');
          const userRef = doc(db, 'users', user.uid);
          let snap;
          try {
            snap = await getDocFromCache(userRef);
          } catch (e) {
            snap = await getDoc(userRef);
          }
          if (snap.exists()) {
            const data = snap.data();
            if (data.fullName) setFirebaseUserName(data.fullName);
            if (data.role) setFirebaseUserRole(data.role);
          }
        } catch (err) {
          console.warn("Error fetching user profile", err);
        }
      } else {
        setFirebaseUserName("");
        setFirebaseUserRole("tenant");
      }
    });
    return () => unsubscribe();
  }, []);

  const displayedAvatar =
    customAvatar ||
    firebaseUser?.photoURL ||
    (firebaseUser
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUserName || "User")}&background=0D8ABC&color=fff`
      : CURRENT_USER.avatar);

  const handleAvatarChange = () => {
    const url = window.prompt("Enter new Avatar Image URL:", displayedAvatar);
    if (url) {
      setCustomAvatar(url);
      addNotification("Avatar updated successfully", "success");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      addNotification("Logged out successfully", "success");
      setLandingState({ show: true });
    } catch (error) {
      addNotification("Error logging out", "error");
    }
  };

  // States Handlers
  const handleAddTransaction = (newTrx: Transaction) => {
    setTransactions((prev) => [newTrx, ...prev]);
    addNotification(
      `Transaction created: KSh ${newTrx.amount.toLocaleString()} via ${newTrx.provider.toUpperCase()}`,
      "info",
    );

    // Update top counts
    if (newTrx.type === "booking_payment") {
      setPlatformStats((prev) => ({
        ...prev,
        totalVolumeKsh: prev.totalVolumeKsh + newTrx.amount,
        commissionKsh: prev.commissionKsh + newTrx.amount * 0.1,
      }));
    }
  };

  const handleAddBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    addNotification(
      `New Booking Request: ${newBooking.propertyTitle}`,
      "success",
    );

    // Escrow held update
    setPlatformStats((prev) => ({
      ...prev,
      escrowHeldKsh: prev.escrowHeldKsh + newBooking.amountPaid,
    }));
  };

  const handleUpdateBookings = (newBookings: Booking[]) => {
    // Detect status changes to trigger notification
    if (newBookings.length === bookings.length) {
      newBookings.forEach((idxBooking) => {
        const oldBooking = bookings.find((b) => b.id === idxBooking.id);
        if (oldBooking && oldBooking.status !== idxBooking.status) {
          addNotification(
            `Booking status updated to ${idxBooking.status.toUpperCase()}`,
            "info",
          );
        }
      });
    }
    setBookings(newBookings);
  };

  const filteredGlobalProperties = properties.filter((p) => {
    if (
      globalLocation &&
      !p.location.toLowerCase().includes(globalLocation.toLowerCase()) &&
      !p.title.toLowerCase().includes(globalLocation.toLowerCase())
    )
      return false;
    if (globalPropertyType !== "all" && p.type !== globalPropertyType)
      return false;
    if (globalMaxPrice && p.price > Number(globalMaxPrice)) return false;
    return true;
  });

  return (
    <div className="relative w-screen h-screen bg-neutral-900 text-white overflow-hidden flex flex-col selection:bg-blue-600 selection:text-white">
      <NotificationsContainer
        notifications={notifications}
        onClose={removeNotification}
      />
      {landingState.show ? (
        <LandingPage
          initialAuthMode={landingState.authMode || "login"}
          initialShowModal={landingState.showModal || false}
          onComplete={(role) => {
            setSelectedRole(role);
            setFirebaseUserRole(role);
            setLandingState({ show: false });
          }}
        />
      ) : (
        <main className="w-full h-full flex-1 flex flex-col overflow-hidden bg-[#030712]">
          <header className="w-full px-6 pt-6 pb-4 shrink-0 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-md z-10 border-b border-white/5 relative">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center gap-4 w-full absolute top-6 px-6 left-0 right-0">
                <button
                  onClick={() => setLandingState({ show: true })}
                  className="text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors text-sm flex items-center gap-2"
                >
                  &larr; Back
                </button>
                <div className="flex items-center gap-4">
                  {firebaseUser ? (
                    <button
                      onClick={handleLogout}
                      className="px-5 py-2 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-400 font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setLandingState({
                            show: true,
                            authMode: "login",
                            showModal: true,
                          })
                        }
                        className="px-5 py-2 rounded-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                      >
                        Login
                      </button>
                      <button
                        onClick={() =>
                          setLandingState({
                            show: true,
                            authMode: "register",
                            showModal: true,
                          })
                        }
                        className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div
                  className="cursor-pointer group flex items-center"
                  onClick={() => setLandingState({ show: true })}
                >
                  <StayLinkLogo className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1
                    className="text-white font-black text-lg sm:text-xl tracking-tight leading-tighter flex items-center gap-1 italic cursor-pointer"
                    onClick={() => setLandingState({ show: true })}
                  >
                    STAYLINK
                    <span className="text-blue-500 text-[10px] sm:text-xs bg-[#0f172a] border border-[#1e293b] px-1.5 py-0.5 rounded ml-1 not-italic font-bold">
                      AI
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    Real Estate & Escrow Super App
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-col xl:flex-row w-full justify-start xl:justify-between items-start xl:items-center gap-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 sm:pb-0">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg inline-flex items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <span className="text-emerald-400 font-sans text-sm sm:text-base tracking-widest font-black uppercase truncate block">
                      {firebaseUserRole === "agency"
                        ? "Agencies"
                        : firebaseUserRole === "Cohort"
                          ? "Cohorts"
                          : firebaseUserRole + "s"}{" "}
                      Console
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                    <input
                      type="text"
                      placeholder="Location..."
                      value={globalLocation}
                      onChange={(e) => setGlobalLocation(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs sm:text-sm text-white placeholder-white/40 outline-none focus:border-blue-500 w-full sm:w-32 md:w-48"
                    />
                    <input
                      type="number"
                      placeholder="Max KSh"
                      value={globalMaxPrice}
                      onChange={(e) =>
                        setGlobalMaxPrice(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs sm:text-sm text-white placeholder-white/40 outline-none focus:border-blue-500 w-[100px] sm:w-[120px]"
                    />
                    <select
                      value={globalPropertyType}
                      onChange={(e) => setGlobalPropertyType(e.target.value)}
                      className="bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-1.5 text-xs sm:text-sm text-white outline-none focus:border-blue-500 w-full sm:w-[130px] shrink-0"
                    >
                      <option value="all">All Types</option>
                      <option value="rent">Rentals</option>
                      <option value="sale">Sales</option>
                      <option value="airbnb">Airbnb</option>
                      <option value="hostel">Hostels</option>
                      <option value="roommate">Roommates</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-xl inline-flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-4 py-1.5 sm:py-2.5 w-full sm:min-w-[200px] xl:w-auto overflow-hidden shrink-0 mt-2 xl:mt-0 shadow-lg">
                  <span className="text-white text-sm sm:text-sm font-sans tracking-wide truncate flex flex-col">
                    <span className="font-semibold">{firebaseUserName || "Guest User"}</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">{firebaseUserRole.replace('_', ' ')} Profile</span>
                  </span>
                  <img
                    src={displayedAvatar}
                    alt="Avatar"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500/50 cursor-pointer hover:border-emerald-400 hover:scale-105 transition-all object-cover shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    onClick={handleAvatarChange}
                    title="Click to change avatar"
                  />
                </div>
              </div>
            </div>
          </header>

          <MobileEmulator
            properties={filteredGlobalProperties}
            roommates={roommates}
            currentUser={{
              ...CURRENT_USER,
              role: firebaseUserRole as any,
              name: firebaseUserName || CURRENT_USER.name,
              avatar: displayedAvatar,
              uid: firebaseUser?.uid || CURRENT_USER.uid,
            }}
            chats={chats}
            messagesList={messagesList}
            bookings={bookings}
            onUpdateBookings={handleUpdateBookings}
            onStateUpdate={(data) => {
              if (data.properties) setProperties(data.properties);
              if (data.roommates) setRoommates(data.roommates);
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
