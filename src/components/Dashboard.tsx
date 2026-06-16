import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserRole, Property, Booking } from '../types';
import { DashboardEmptyState } from './DashboardEmptyState';
import { PropertyInsightModal } from './PropertyInsightModal';
import { PropertyMapPlaceholder } from './PropertyMapPlaceholder';
import { RefreshCw } from 'lucide-react';

interface DashboardProps {
  role: UserRole;
  properties: Property[];
  bookings: Booking[];
  userId: string;
  onAddProperty: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, properties, bookings, userId, onAddProperty }) => {
  const [selectedInsightProperty, setSelectedInsightProperty] = useState<Property | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate data fetch
    setTimeout(() => {
        setRefreshing(false);
    }, 1000);
  };

  const handleSelectProperty = (p: Property) => {
    setSelectedInsightProperty(p);
    setRecentlyViewed(prev => [p, ...prev.filter(x => x.id !== p.id)].slice(0, 5));
  };

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
      
      {recentlyViewed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white font-bold mb-4">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {recentlyViewed.map(p => (
              <div 
                key={p.id} 
                className="min-w-[150px] bg-[#0f172a] rounded-xl p-2 cursor-pointer border border-white/5 hover:border-white/10" 
                onClick={() => handleSelectProperty(p)}
              >
                <img src={p.images[0]} className="w-full h-20 rounded-lg object-cover mb-2" alt={p.title} />
                <h3 className="text-white text-xs font-semibold truncate">{p.title}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats and Map Container */}
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
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl flex flex-col justify-center">
            <h2 className="text-slate-400 text-sm font-semibold mb-2">My Properties</h2>
            <p className="text-white text-3xl font-bold">{myProperties.length}</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl flex flex-col justify-center">
            <h2 className="text-slate-400 text-sm font-semibold mb-2">Active Bookings</h2>
            <p className="text-white text-3xl font-bold">{myBookings.filter(b => b.status === 'active').length}</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl flex flex-col justify-center">
            <h2 className="text-slate-400 text-sm font-semibold mb-2">Total Earnings</h2>
            <p className="text-white text-3xl font-bold">KSh {myBookings.reduce((sum, b) => sum + b.payoutAmount, 0).toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Right Column: Map Placeholder */}
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} className="lg:col-span-2 flex flex-col">
          <PropertyMapPlaceholder properties={myProperties} />
        </motion.div>
      </motion.div>

      {/* Property Management */}
      <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Your Properties</h2>
          <button onClick={handleRefresh} className={`text-slate-400 hover:text-blue-400 transition-transform ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={18} />
          </button>
        </div>
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
          className="space-y-4"
        >
          {myProperties.map((p) => (
            <motion.div 
              key={p.id} 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
              className="flex items-center gap-4 bg-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleSelectProperty(p)}
            >
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
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px]"
                    >Edit</button>
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px]"
                    >Booked</button>
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px]"
                    >Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {selectedInsightProperty && (
        <PropertyInsightModal 
          property={selectedInsightProperty} 
          onClose={() => setSelectedInsightProperty(null)} 
        />
      )}
    </div>
  );
};
