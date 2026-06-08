/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface VirtualTourOverlayProps {
  property: Property;
  onClose: () => void;
}

export default function VirtualTourOverlay({ property, onClose }: VirtualTourOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % property.images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
            <Camera className="w-4 h-4"/>
            Virtual Tour Showcase
        </div>

        <div className="relative aspect-video w-full flex items-center justify-center">
            <img 
              src={property.images[currentIndex]} 
              alt="Property" 
              className="w-full h-full object-cover"
            />
            
            <button 
              onClick={handlePrev}
              className="absolute left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <ChevronLeft />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <ChevronRight />
            </button>
        </div>

        <div className="p-4 text-center text-white">
          <p className="text-sm font-bold">{property.title}</p>
          <p className="text-xs text-neutral-400">Image {currentIndex + 1} of {property.images.length}</p>
        </div>
      </div>
    </motion.div>
  );
}
