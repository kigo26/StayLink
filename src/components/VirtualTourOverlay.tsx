/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface VirtualTourOverlayProps {
  property: Property;
  onClose: () => void;
}

export default function VirtualTourOverlay({ property, onClose }: VirtualTourOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // We'll use a wide placeholder generated image for the 360 view if possible, 
  // or tiling the primary image to simulate a 360 degree panoramic view.
  const panoImage = 'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?q=80&w=2000&auto=format&fit=crop';

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // scroll-fast
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Auto-scroll slightly to show it's a 360 view on load
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 50;
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-3xl bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10">
            <Compass className="w-4 h-4 animate-pulse text-blue-400"/>
            360° Virtual Walkthrough
        </div>

        <div className="absolute top-4 right-4 z-10 hidden sm:flex bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold items-center gap-1.5 border border-white/10">
            <Move className="w-3 h-3"/>
            Drag to pan around
        </div>

        <div 
          className="relative aspect-video w-full overflow-x-hidden overflow-y-hidden cursor-grab active:cursor-grabbing flex items-center bg-black select-none"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleMouseMove}
        >
            <div className="flex w-max shrink-0 h-full pointer-events-none">
              <img 
                src={panoImage} 
                alt="360 Panorama" 
                className="h-full w-auto object-cover max-w-none pointer-events-none"
                draggable={false}
              />
              {/* Duplicate for infinite feel or just an extended view */}
              <img 
                src={panoImage} 
                alt="360 Panorama" 
                className="h-full w-auto object-cover max-w-none pointer-events-none transform -scale-x-100"
                draggable={false}
              />
            </div>
            
            {/* Guide overlay */}
            {!isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium border border-white/20"
                >
                  <Move className="w-5 h-5" />
                  Drag to explore
                </motion.div>
              </div>
            )}
        </div>

        <div className="p-5 text-center text-white bg-black">
          <p className="text-lg font-bold tracking-tight">{property.title}</p>
          <p className="text-sm text-neutral-400 mt-1">Simulated 360° Environment • Swipe to look around</p>
        </div>
      </div>
    </motion.div>
  );
}
