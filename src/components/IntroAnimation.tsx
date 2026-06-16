import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StayLinkAnimated } from './StayLinkAnimated';

export const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
        className="fixed inset-0 z-[100] bg-[#030712] flex items-center justify-center"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
      <div className="relative">
        <StayLinkAnimated className="w-48 h-48" />
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-white text-4xl font-black mt-4"
        >
            Stay<span className="text-blue-500">Link</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
