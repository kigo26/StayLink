import React, { useEffect, useState } from 'react';
import { Property } from '../types';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyMapPlaceholderProps {
  properties: Property[];
}

export const PropertyMapPlaceholder: React.FC<PropertyMapPlaceholderProps> = ({ properties }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setError('Location access denied. Centering on default map.');
        }
      );
    } else {
      setError('Geolocation not supported by this browser.');
    }
  }, []);

  // Calculate bounding box for properties to scale their visual placement
  const allCoordinates = properties
    .filter(p => p.coordinates)
    .map(p => p.coordinates);

  const defaultCenter = { lat: -1.2921, lng: 36.8219 }; // Nairobi fallback
  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Compass className="text-blue-400" size={20} />
          Network Map
        </h2>
        {error && <span className="text-amber-500 text-xs">{error}</span>}
        {!error && !userLocation && <span className="text-slate-400 text-xs flex items-center gap-1"><Navigation size={12} className="animate-spin" /> Locating...</span>}
      </div>

      <div className="relative flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} 
        />
        
        {/* Radar sweep effect */}
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20"
          style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #3b82f6 90deg, transparent 90deg)' }}
        />

        {/* User Location */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
            <span className="text-xs font-semibold text-white mt-1 drop-shadow-md">You</span>
          </div>
        )}

        {/* Simulated property clusters (using randomized offsets for the placeholder visual effect) */}
        {properties.map((p, idx) => {
          // For a cool placeholder effect, we generate a pseudo-random placement based on property ID
          // instead of real geographic math, to guarantee they fit beautifully on the placeholder.
          const seed = Array.from(p.id).reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          const topPercent: number = 20 + ((seed as number) % 60); // stay within 20% - 80%
          const leftPercent: number = 10 + (((seed as number) * 7) % 80); // stay within 10% - 90%
          
          return (
            <motion.div 
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
              className="absolute group z-20"
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
            >
              <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">
                <div className="w-7 h-7 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin size={14} className="text-emerald-400" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center whitespace-nowrap bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none transition-all">
                  <span className="font-bold">{p.title}</span>
                  <span className="text-slate-400">KSh {p.price.toLocaleString()}</span>
                  <div className="w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45 absolute -bottom-1" />
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Placeholder label */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
          <div className="bg-slate-800/80 backdrop-blur text-slate-400 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-slate-700/50">
            Simulated Area View
          </div>
        </div>
      </div>
    </div>
  );
};
