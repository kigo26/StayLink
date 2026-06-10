import React from 'react';
import { UserRole, Property, Booking } from '../types';
import { DashboardEmptyState } from './DashboardEmptyState';

interface DashboardProps {
  role: UserRole;
  properties: Property[];
  bookings: Booking[];
  userId: string;
  onAddProperty: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, properties, bookings, userId, onAddProperty }) => {
  const myProperties = properties.filter(p => p.landlordId === userId);
  const myBookings = bookings.filter(b => b.landlordId === userId);

  if (myProperties.length === 0 && myBookings.length === 0) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">{role.replace('_', ' ')} Dashboard</h1>
            <DashboardEmptyState 
                message="It looks like you haven't added any properties or have active bookings yet. Start by listing your first property."
                actionText="Add Property"
                onAction={onAddProperty} 
            />
        </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">{role.replace('_', ' ')} Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl">
          <h2 className="text-slate-400 text-sm font-semibold mb-2">My Properties</h2>
          <p className="text-white text-3xl font-bold">{myProperties.length}</p>
        </div>
        <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl">
          <h2 className="text-slate-400 text-sm font-semibold mb-2">Active Bookings</h2>
          <p className="text-white text-3xl font-bold">{myBookings.filter(b => b.status === 'active').length}</p>
        </div>
        <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl">
          <h2 className="text-slate-400 text-sm font-semibold mb-2">Total Earnings</h2>
          <p className="text-white text-3xl font-bold">KSh {myBookings.reduce((sum, b) => sum + b.payoutAmount, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Property Management */}
      <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl">
        <h2 className="text-white font-bold mb-4">Your Properties</h2>
        <div className="space-y-4">
          {myProperties.map(p => (
            <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
              <img src={p.images[0]} className="w-16 h-16 rounded-lg object-cover" alt={p.title} />
              <div>
                <h3 className="text-white font-semibold">{p.title}</h3>
                <p className="text-slate-400 text-sm">{p.location} • KSh {p.price.toLocaleString()}</p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded text-xs ${p.availabilityStatus === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {p.availabilityStatus || 'Available'}
                </span>
                <div className="flex gap-2">
                    <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px]">Edit</button>
                    <button className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px]">Booked</button>
                    <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px]">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
