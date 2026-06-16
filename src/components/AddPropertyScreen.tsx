import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Camera, Image as ImageIcon } from 'lucide-react';
import { Property, UserProfile } from '../types';

import PropertyUpload from './PropertyUpload';
import UploadSummaryModal from './UploadSummaryModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AddPropertyScreenProps {
  onBack: () => void;
  onSubmit: (property: Partial<Property>) => void;
  currentUser: UserProfile;
}

export default function AddPropertyScreen({ onBack, onSubmit, currentUser }: AddPropertyScreenProps) {
  const [title, setTitle] = useLocalStorage('add_prop_title', '');
  const [price, setPrice] = useLocalStorage('add_prop_price', '');
  const [type, setType] = useLocalStorage<'apartment' | 'airbnb' | 'roommate' | 'sale' | 'hotel'>('add_prop_type', 'apartment');
  const [bedrooms, setBedrooms] = useLocalStorage('add_prop_bedrooms', '1');
  const [bathrooms, setBathrooms] = useLocalStorage('add_prop_bathrooms', '1');
  const [location, setLocation] = useLocalStorage('add_prop_location', '');
  const [description, setDescription] = useLocalStorage('add_prop_description', '');
  const [mainImage, setMainImage] = useLocalStorage('add_prop_main_image', '');
  const [uploadSummary, setUploadSummary] = useState<any>(null);

  const handleUpload = (summary: any) => {
    setUploadSummary(summary);
    // Optionally pre-fill with the first successful property
    if (summary.properties && summary.properties.length > 0) {
        const prop = summary.properties[0];
        setTitle(prop.title);
        setPrice(prop.price.toString());
        setType(prop.type);
        setLocation(prop.location);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !location) return;

    // Clear saved state
    localStorage.removeItem('add_prop_title');
    localStorage.removeItem('add_prop_price');
    localStorage.removeItem('add_prop_type');
    localStorage.removeItem('add_prop_bedrooms');
    localStorage.removeItem('add_prop_bathrooms');
    localStorage.removeItem('add_prop_location');
    localStorage.removeItem('add_prop_description');
    localStorage.removeItem('add_prop_main_image');

    onSubmit({
      title,
      description,
      price: Number(price),
      type,
      location,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      images: mainImage ? [mainImage] : ['https://images.unsplash.com/photo-15df8a5a4c522-a2707f59d571?auto=format&fit=crop&q=80'],
      landlordId: currentUser.uid,
      landlordName: currentUser.name,
      landlordAvatar: currentUser.avatar,
      aiQualityScore: 85,
      amenities: ['Wi-Fi', 'Parking'],
      isFlagged: false,
      verificationStatus: 'pending',
      verifiedByAdmin: false
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      key="add_property"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-neutral-50 text-neutral-800 relative h-full w-full"
    >
      <div className="bg-white border-b border-neutral-200 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight">List Property</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <PropertyUpload onUploadComplete={handleUpload} />

          <AnimatePresence>
            {uploadSummary && (
                <UploadSummaryModal summary={uploadSummary} onClose={() => setUploadSummary(null)} />
            )}
          </AnimatePresence>
          
          {/* Image Upload Area */}
          <div 
            onClick={() => document.getElementById('prop-upload')?.click()}
            className="w-full h-48 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-200 transition relative overflow-hidden"
          >
            <input 
              id="prop-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            {mainImage ? (
              <img src={mainImage} className="w-full h-full object-cover" alt="Property Cover" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-500">Add Cover Photo</span>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Property Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-blue-500 outline-none transition"
              placeholder="e.g. Modern Studio in Kilimani"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Property Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-blue-500 outline-none transition min-h-[100px] resize-y"
              placeholder="Describe the property, its amenities, rules, and nearby points of interest..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Price (KSh)</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-blue-500 outline-none transition"
                placeholder="45000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Type</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-blue-500 outline-none transition"
              >
                <option value="apartment">Apartment</option>
                <option value="airbnb">Airbnb</option>
                <option value="roommate">Roommate</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Location</label>
            <input 
              type="text" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-blue-500 outline-none transition"
              placeholder="e.g. Westlands, Nairobi"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Bedrooms</label>
              <input 
                type="number" 
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-blue-500 outline-none transition"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">Bathrooms</label>
              <input 
                type="number" 
                value={bathrooms}
                onChange={e => setBathrooms(e.target.value)}
                className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 focus:border-blue-500 outline-none transition"
                min="0"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            Publish Listing
          </button>
        </form>
      </div>
    </motion.div>
  );
}
