import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RoommateProfile } from '../types';

interface QuestionnaireProps {
  onClose: () => void;
  onSubmit: (data: Partial<RoommateProfile>) => void;
}

export default function RoommateQuestionnaire({ onClose, onSubmit }: QuestionnaireProps) {
  const [cleanliness, setCleanliness] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [sleepSchedule, setSleepSchedule] = useState<'Night Owl' | 'Early Bird' | 'Flexible'>('Flexible');
  const [lifestyle, setLifestyle] = useState<string[]>([]);

  const lifestyleOptions = ['Non-smoker', 'Quiet', 'Gym lover', 'Pet friendly'];

  const handleSubmit = () => {
    onSubmit({ cleanliness, sleepSchedule, lifestyle });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Roommate Preferences</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-neutral-400"/></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-neutral-700">Cleanliness</label>
            <div className="flex gap-2 mt-1">
              {['High', 'Medium', 'Low'].map(option => (
                <button 
                  key={option}
                  onClick={() => setCleanliness(option as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${cleanliness === option ? 'bg-indigo-600 text-white' : 'bg-neutral-100'}`}
                >{option}</button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-neutral-700">Sleep Schedule</label>
            <div className="flex gap-2 mt-1">
              {['Night Owl', 'Early Bird', 'Flexible'].map(option => (
                <button 
                  key={option}
                  onClick={() => setSleepSchedule(option as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${sleepSchedule === option ? 'bg-indigo-600 text-white' : 'bg-neutral-100'}`}
                >{option}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">Lifestyle</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {lifestyleOptions.map(option => (
                <button 
                  key={option}
                  onClick={() => setLifestyle(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option])}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${lifestyle.includes(option) ? 'bg-indigo-600 text-white' : 'bg-neutral-100'}`}
                >{option}</button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4"/>
          Save Preferences
        </button>
      </motion.div>
    </div>
  );
}
