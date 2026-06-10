import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save } from 'lucide-react';
import { RoommateProfile, UserProfile } from '../types';

interface CohortPreferencesScreenProps {
  onBack: () => void;
  onSubmit: (prefs: Partial<RoommateProfile>) => void;
  currentUser: UserProfile;
}

export default function CohortPreferencesScreen({ onBack, onSubmit, currentUser }: CohortPreferencesScreenProps) {
  const [rentPercentage, setRentPercentage] = useState('50');
  const [terms, setTerms] = useState('');
  const [budget, setBudget] = useState('20000');
  const [cleanliness, setCleanliness] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [sleepSchedule, setSleepSchedule] = useState<'Night Owl' | 'Early Bird' | 'Flexible'>('Flexible');
  const [profileDescription, setProfileDescription] = useState('');
  const [currentlyLive, setCurrentlyLive] = useState('');
  const [housingType, setHousingType] = useState<'Rented' | 'Owned'>('Rented');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      uid: currentUser.uid,
      name: currentUser.name,
      avatar: currentUser.avatar,
      age: 24, // default
      gender: 'Other', // default
      occupation: 'Professional',
      budget: Number(budget),
      lifestyle: ['Flexible'],
      cleanliness,
      sleepSchedule,
      hobbies: [],
      rentPercentage: Number(rentPercentage) || 50,
      terms: terms,
      partnerFound: false,
      profileDescription,
      currentlyLive,
      housingType
    });
  };

  return (
    <motion.div 
      key="cohort_preferences"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-neutral-50 text-neutral-800 relative h-full w-full"
    >
      <div className="bg-white border-b border-neutral-200 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition cursor-pointer">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Preferences & Terms</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-4">
            <p className="text-xs text-indigo-700 leading-relaxed font-semibold">
              These preferences will be displayed to potential matches. If you find a match and confirm, your profile will be automatically delisted.
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Rent Split Percentage (%)</label>
            <input 
              type="number" 
              value={rentPercentage}
              onChange={e => setRentPercentage(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition"
              placeholder="e.g. 50"
              min="0"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Monthly Budget (KSh)</label>
            <input 
              type="number" 
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition"
              placeholder="e.g. 20000"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Cleanliness Preference</label>
            <select 
              value={cleanliness}
              onChange={e => setCleanliness(e.target.value as any)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition"
            >
              <option value="High">High (Very Clean)</option>
              <option value="Medium">Medium (Normal)</option>
              <option value="Low">Low (Relaxed)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Sleep Schedule</label>
            <select 
              value={sleepSchedule}
              onChange={e => setSleepSchedule(e.target.value as any)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition"
            >
              <option value="Night Owl">Night Owl (Late to bed)</option>
              <option value="Early Bird">Early Bird (Early to bed)</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Specific Terms / Habits</label>
            <textarea 
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition min-h-[120px]"
              placeholder="E.g. Expecting 50% split on utilities, no loud music after 10 PM..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Profile Description</label>
            <textarea 
              value={profileDescription}
              onChange={e => setProfileDescription(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition min-h-[80px]"
              placeholder="Tell us about yourself..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Currently Live</label>
            <input 
              value={currentlyLive}
              onChange={e => setCurrentlyLive(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition"
              placeholder="E.g. Kilimani"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Housing Type</label>
            <select 
              value={housingType}
              onChange={e => setHousingType(e.target.value as 'Rented' | 'Owned')}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-indigo-500 outline-none transition"
            >
              <option value="Rented">Rented</option>
              <option value="Owned">Owned</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save & List Profile
          </button>
        </form>
      </div>
    </motion.div>
  );
}
