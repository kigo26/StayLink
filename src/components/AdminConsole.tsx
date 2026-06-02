/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, ShieldCheck, DollarSign, Users, AlertOctagon, 
  Settings, Bot, TrendingUp, BarChart4, PlusCircle, Trash, RefreshCw, Star, 
  MapPin, Check, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { Property, Transaction, PlatformStats, Booking } from '../types';

interface ConsoleProps {
  properties: Property[];
  transactions: Transaction[];
  stats: PlatformStats;
  onUpdateProperties: (props: Property[]) => void;
  onToggleVerification: () => void;
  bookings: Booking[];
  onUpdateBookings: (bookings: Booking[]) => void;
}

export default function AdminConsole({
  properties,
  transactions,
  stats,
  onUpdateProperties,
  onToggleVerification,
  bookings,
  onUpdateBookings
}: ConsoleProps) {
  // Mock listing model for landlord creations
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Westlands, Nairobi');
  const [newPrice, setNewPrice] = useState(25000);
  const [newType, setNewType] = useState<'apartment' | 'airbnb' | 'roommate' | 'sale' | 'hotel'>('apartment');
  const [newDescr, setNewDescr] = useState('Stunning premium listing located in high-end central Nairobi. Ready for secure booking.');
  
  // Fraud Scanning Results
  const [fraudDetectResult, setFraudDetectResult] = useState<any>(null);
  const [isScanningFraud, setIsScanningFraud] = useState(false);
  const [activePropertyScanId, setActivePropertyScanId] = useState<string | null>(null);

  // Status Filter for Bookings
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  // Auto-deducted financials tracker
  const totalDepositReceived = transactions
    .filter(t => t.type === 'booking_payment' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCommissionsDeducted = transactions
    .filter(t => t.type === 'booking_payment' && t.status === 'success')
    .reduce((sum, t) => sum + (t.commissionCalculated || (t.amount * 0.10)), 0);

  const totalPayoutMade = transactions
    .filter(t => t.type === 'booking_payout' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  // Core landlord handler: Submit new property
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProp: Property = {
      id: `prop_admin_${Date.now()}`,
      title: newTitle,
      description: newDescr,
      price: Number(newPrice),
      location: newLocation,
      coordinates: { lat: -1.2921, lng: 36.8219 },
      type: newType,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop'],
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Security', 'Fitted Kitchen'],
      landlordId: 'user_john_doe',
      landlordName: 'John Mwangi',
      landlordAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      aiQualityScore: Math.floor(Math.random() * 20 + 80),
      neighborhoodMetrics: {
        safety: 85,
        transit: 75,
        noise: 45,
        hospitalsNear: 2,
        schoolsNear: 4,
        mallsNear: 1,
        commuteToCBD: '18 mins driving'
      },
      responseSpeedMinutes: 5,
      bookingSuccessRate: 98,
      isPromoted: false,
      isFlagged: false,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0
    };

    onUpdateProperties([newProp, ...properties]);
    setNewTitle('');
    setNewDescr('Stunning premium listing located in high-end central Nairobi. Ready for secure booking.');
  };

  // Run AI Fraud Detection Model
  const runAIFraudScanner = async (prop: Property) => {
    setActivePropertyScanId(prop.id);
    setIsScanningFraud(true);
    setFraudDetectResult(null);

    try {
      const response = await fetch('/api/fraud-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property: prop })
      });
      const data = await response.json();
      if (data.success) {
        setFraudDetectResult(data);
        // Automatically set flagged status if High risk
        if (data.riskLevel === 'HIGH_RISK_SCAM') {
          const updated = properties.map(p => p.id === prop.id ? { ...p, isFlagged: true } : p);
          onUpdateProperties(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningFraud(false);
    }
  };

  return (
    <div className="flex-1 glass text-white p-6 rounded-[32px] border-white/10 flex flex-col gap-6 text-left shadow-2xl max-w-4xl">
      
      {/* Top Banner admin telemetry */}
      <div className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] bg-blue-500/10 text-teal-400 border border-blue-500/30 py-1 px-2.5 rounded-md font-extrabold uppercase tracking-widest font-mono">StayLink HQ</span>
          <h1 className="text-2xl font-black mt-1 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent italic">StayLink Admin Core</h1>
          <p className="text-xs text-white/50">Fintech reconciliation ledgers & smart anti-scam center</p>
        </div>
        <div className="h-10 w-10 bg-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 animate-pulse">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      {/* Grid Stats Telemetries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="glass bg-white/2 p-4 rounded-2xl border-white/5 flex flex-col justify-between shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-white/50 font-mono">Platform Nodes</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black">{stats.totalUsers + properties.length * 3}</span>
            <span className="text-[10px] text-teal-400 block font-semibold">✦ +14% active growth</span>
          </div>
        </div>

        {/* Total Rent Deposits processed */}
        <div className="glass bg-white/2 p-4 rounded-2xl border-white/5 flex flex-col justify-between shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-white/50 font-mono">Gross Volume Escrow</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-teal-400 font-mono">KSh {(stats.totalVolumeKsh + totalDepositReceived).toLocaleString()}</span>
            <span className="text-[10px] text-teal-500 block font-semibold">✔ Escrow locked securely</span>
          </div>
        </div>

        {/* 10% auto deduction platform earnings */}
        <div className="glass bg-white/2 p-4 rounded-2xl border-white/5 flex flex-col justify-between shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-white/50 font-mono">Comm Profit (10% Split)</span>
            <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-blue-400 font-mono font-bold">KSh {(stats.commissionKsh + totalCommissionsDeducted).toLocaleString()}</span>
            <span className="text-[10px] text-blue-400 block font-semibold">✦ StayLink automated cut</span>
          </div>
        </div>

        {/* Quality level */}
        <div className="glass bg-white/2 p-4 rounded-2xl border-white/5 flex flex-col justify-between shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-white/50 font-mono">Security Index</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400">{properties.filter(p => p.isFlagged).length} Flagged</span>
            <span className="text-[10px] text-white/45 block">AI neural scam watch</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LANDLORD PORTAL: List New Property */}
        <div className="glass bg-white/2 rounded-2.5xl p-5 border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <PlusCircle className="w-4.5 h-4.5" /> Submit Listing (Partner landlord portal)
            </h3>
          </div>

          <form onSubmit={handleCreateProperty} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-white/50 block">Listing Title Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Westside Studio Kilimani"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 py-2 px-3 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/50 block">Monthly Price (KSh)</label>
                <input 
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 py-2 px-3 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-white/50 block">Kenya Location District</label>
                <select 
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 py-2 px-3 rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Kilimani, Nairobi">Kilimani, Nairobi</option>
                  <option value="Westlands, Nairobi">Westlands, Nairobi</option>
                  <option value="Karen, Nairobi">Karen, Nairobi</option>
                  <option value="Nyali, Mombasa">Nyali, Mombasa</option>
                  <option value="Muthaiga, Nairobi">Muthaiga, Nairobi (Scam Check)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 block">Property Category</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 py-2 px-3 rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="apartment">Standard Rental</option>
                  <option value="airbnb">Airbnb (Daily)</option>
                  <option value="roommate">Roommate matching</option>
                  <option value="hotel">Boutique Hotel</option>
                  <option value="sale">Outright Sale</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-white/50 block">Description & deposit instructions</label>
              <textarea 
                rows={2}
                value={newDescr}
                onChange={(e) => setNewDescr(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 accent-gradient hover:opacity-90 active:scale-[0.98] text-white rounded-xl font-bold uppercase transition shadow-lg flex items-center justify-center gap-1 cursor-pointer"
            >
              <Building className="w-4 h-4" /> Deploy Listing live on Feed
            </button>
          </form>
        </div>

        {/* CYBERSECURITY: Interactive Scam and Fraud detector */}
        <div className="glass bg-white/2 rounded-2.5xl p-5 border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5" /> Cyber Scam Security Audit
            </h3>
          </div>

          <p className="text-[11px] text-white/50 leading-relaxed">
            StayLink AI leverages neural cyber scanning to automatically flag duplicate photos, suspiciously low rental rates inside elite Kenyan suburbs, and requests for off-platform deposit payments. Test on listing cards below:
          </p>

          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 no-scrollbar scrollbar-none">
            {properties.map(p => (
              <div 
                key={p.id}
                className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-bold text-white line-clamp-1">{p.title}</p>
                  <span className="text-[10px] text-white/50">{p.location} • KSh {p.price.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={() => runAIFraudScanner(p)}
                  disabled={isScanningFraud}
                  className="py-1 px-3 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[10px] font-bold border border-white/10 font-mono tracking-tight cursor-pointer"
                >
                  {isScanningFraud && activePropertyScanId === p.id ? 'SCANNING...' : 'SCAN CORE'}
                </button>
              </div>
            ))}
          </div>

          {/* Detailed results scan analysis */}
          {fraudDetectResult && (
            <div className={`p-4 rounded-xl border flex flex-col gap-1.5 text-xs text-left ${
              fraudDetectResult.riskLevel === 'HIGH_RISK_SCAM' 
                ? 'bg-rose-950/40 border-rose-900 text-rose-100' 
                : 'bg-slate-900/60 border-white/10 text-neutral-200'
            }`}>
              <div className="flex justify-between font-bold text-[11px] uppercase tracking-wider">
                <span>Scanner Result</span>
                <span className={fraudDetectResult.riskLevel === 'HIGH_RISK_SCAM' ? 'text-rose-400 font-extrabold' : 'text-teal-400 font-extrabold'}>
                  {fraudDetectResult.riskLevel}
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-medium">Scam Probability: <span className="font-bold text-white">{fraudDetectResult.scamProbability}%</span></p>
              
              <div className="space-y-1 mt-1">
                <span className="text-[10px] font-bold uppercase block text-neutral-400">Trigger warnings:</span>
                {fraudDetectResult.flags?.map((fl: string, x: number) => (
                  <p key={x} className="text-[10px] flex items-center gap-1 font-semibold text-neutral-300">⚠️ {fl}</p>
                ))}
              </div>
              <p className="text-[10px] text-neutral-300 leading-relaxed font-mono mt-1.5 italic">
                Rapport digest: {fraudDetectResult.rationale}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Bookings & Escrow Dispatch Registry */}
      <div className="glass bg-white/2 rounded-2.5xl p-5 border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 py-0.5 px-2 rounded-md font-extrabold uppercase tracking-widest font-mono">Registry Ledger</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-400 flex items-center gap-2 mt-1">
              <Building className="w-4.5 h-4.5" /> Platform Bookings & Escrow Registry
            </h3>
            <p className="text-[11px] text-white/50">Verify roommate check-ins, active durations and manage secure escrow releases</p>
          </div>
          
          {/* Dropdown status filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-white/60 uppercase font-mono tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 text-xs font-bold font-sans rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Bookings ({bookings.length})</option>
              <option value="pending">Pending ({bookings.filter(b => b.status === 'pending').length})</option>
              <option value="active">Active ({bookings.filter(b => b.status === 'active').length})</option>
              <option value="completed">Completed ({bookings.filter(b => b.status === 'completed').length})</option>
              <option value="cancelled">Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</option>
            </select>
          </div>
        </div>

        {/* Bookings Display */}
        <div className="text-xs">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-2xl bg-white/1">
              <p className="text-xs font-bold uppercase tracking-wider font-mono">No bookings found with status "{statusFilter}"</p>
              <p className="text-[10px] text-white/30 mt-1 leading-normal">Use the StayLink Mobile portal to initiate new guest checkout or search match roommates.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar scrollbar-none">
              {filteredBookings.map(booking => {
                let statusColor = 'bg-yellow-950 text-yellow-300 border-yellow-900';
                if (booking.status === 'active') statusColor = 'bg-emerald-950 text-emerald-300 border-emerald-900';
                if (booking.status === 'completed') statusColor = 'bg-blue-950 text-blue-300 border-blue-900';
                if (booking.status === 'cancelled') statusColor = 'bg-rose-950 text-rose-300 border-rose-900';

                return (
                  <div key={booking.id} className="p-3 bg-white/3 hover:bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition">
                    <div className="flex items-center gap-3">
                      <img 
                        src={booking.propertyImage} 
                        alt={booking.propertyTitle} 
                        className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-bold">{booking.id}</span>
                          <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider ${statusColor}`}>
                            {booking.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-white mt-1 leading-tight line-clamp-1">{booking.propertyTitle}</h4>
                        <p className="text-[10px] text-white/50 mt-0.5">
                          Tenant: <span className="text-neutral-200 font-semibold">{booking.tenantName}</span> • Landlord ID: <span className="text-neutral-200 font-semibold font-mono text-[9px]">{booking.landlordId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full md:w-auto items-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] text-white/40 block font-mono">Amount Paid / Escrow</span>
                        <span className="font-bold text-white font-mono text-sm">KSh {booking.amountPaid.toLocaleString()}</span>
                        <span className="text-[9px] text-teal-400 block font-medium">Split: Host KSh {booking.payoutAmount.toLocaleString()} / Platform KSh {booking.commissionAmount.toLocaleString()}</span>
                      </div>

                      {/* Escrow actions */}
                      <div className="flex gap-1.5 shrink-0">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => {
                              const updated = bookings.map(b => b.id === booking.id ? { ...b, status: 'active' as const } : b);
                              onUpdateBookings(updated);
                            }}
                            className="bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-[10px] font-sans px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider cursor-pointer border border-emerald-500/25"
                          >
                            Approve
                          </button>
                        )}
                        {booking.status === 'active' && (
                          <>
                            <button
                              onClick={() => {
                                const updated = bookings.map(b => b.id === booking.id ? { ...b, status: 'completed' as const, escrowStatus: 'released' as const } : b);
                                onUpdateBookings(updated);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] font-sans px-2 py-1 rounded-lg transition uppercase tracking-wider cursor-pointer"
                            >
                              Release
                            </button>
                            <button
                              onClick={() => {
                                const updated = bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' as const, escrowStatus: 'refunded' as const } : b);
                                onUpdateBookings(updated);
                              }}
                              className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[10px] font-sans px-2 py-1 rounded-lg transition uppercase tracking-wider cursor-pointer"
                            >
                              Refund
                            </button>
                          </>
                        )}
                        {booking.status === 'completed' && (
                          <div className="text-teal-400 text-[10px] font-bold font-mono py-1 px-2 bg-teal-950/40 border border-teal-900/35 rounded-lg shrink-0">
                            ✔ RELEASED
                          </div>
                        )}
                        {booking.status === 'cancelled' && (
                          <div className="text-neutral-400 text-[10px] font-bold font-mono py-1 px-2 bg-neutral-900/40 border border-white/5 rounded-lg shrink-0">
                            ✘ REFUNDED
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FINTECH Escrow ledger */}
      <div className="glass bg-white/2 rounded-2.5xl p-5 border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
            <BarChart4 className="w-4.5 h-4.5" /> Reconciled escrow logs & split transactions
          </h3>
          <span className="text-[10px] font-mono bg-white/5 text-white/55 px-2 py-0.5 rounded-sm border border-white/5 font-bold">10% profit split</span>
        </div>

        <div className="overflow-x-auto text-xs no-scrollbar">
          <table className="w-full text-left space-y-1">
            <thead>
              <tr className="text-white/50 border-b border-white/10 pb-2">
                <th className="py-2">Reference</th>
                <th>Target beneficiary</th>
                <th>Payment Node</th>
                <th>Type</th>
                <th>Commission Split</th>
                <th>Gross volume KSh</th>
                <th>Ledger State</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(trx => {
                const isComm = trx.type === 'commission_payout';
                const isPayout = trx.type === 'booking_payout';
                return (
                  <tr key={trx.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2.5 font-mono text-[10px]">{trx.reference}</td>
                    <td className="font-bold text-white">{trx.userName}</td>
                    <td className="uppercase font-mono text-[10px] tracking-widest">{trx.provider}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold ${
                        isComm ? 'bg-blue-950 text-blue-300 border border-blue-900' : (isPayout ? 'bg-purple-950 text-purple-300 border border-purple-900' : 'bg-teal-950 text-teal-300 border border-teal-900')
                      }`}>
                        {trx.type}
                      </span>
                    </td>
                    <td className="font-mono text-white/60">
                      {isComm ? '-' : (trx.commissionCalculated ? `KSh ${trx.commissionCalculated.toLocaleString()}` : `10% split`)}
                    </td>
                    <td className="font-bold text-right">KSh {trx.amount.toLocaleString()}</td>
                    <td>
                      <span className="text-teal-400 font-mono text-[10px] uppercase font-bold">✔ RECONCILED</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
