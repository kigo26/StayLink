import React from 'react';
import { motion } from 'motion/react';
import { Property } from '../types';

interface HotListingsProps {
  listings: Property[];
  onPropertyClick: (propertyId: string) => void;
}

export const HotListings: React.FC<HotListingsProps> = ({ listings, onPropertyClick }) => {
  // Use first image of each listing, or a placeholder if none
  const displayItems = listings.map(l => ({
    id: l.id,
    image: l.images[0],
    title: l.title
  }));

  return (
    <div className="w-64 h-32 rounded-3xl overflow-hidden relative shadow-2xl cursor-pointer bg-slate-900/40 backdrop-blur-sm border border-white/10">
      <motion.div 
        className="flex h-full"
        animate={{ x: [0, -256 * displayItems.length] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...displayItems, ...displayItems].map((item, idx) => (
          <div key={idx} className="w-64 h-full flex-shrink-0 relative" onClick={() => onPropertyClick(item.id)}>
            <img src={item.image} alt="Hot Property" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-x-0 bottom-3 px-3">
        <p className="text-[11px] text-white/90 font-medium tracking-wide uppercase text-center bg-white/10 backdrop-blur-md rounded-full py-0.5 shadow-sm">Trending</p>
      </div>
    </div>
  );
};
