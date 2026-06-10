import React, { useState, useRef, useEffect } from 'react';
import { Property, PropertyType, PropertyCategory } from '../types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: Property) => void;
  landlordId: string;
  landlordName: string;
  landlordAvatar: string;
  editProperty?: Property;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, onAddProperty, landlordId, landlordName, landlordAvatar, editProperty }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [category, setCategory] = useState<PropertyCategory>('Residential');
  const [type, setType] = useState<PropertyType>('apartment');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && editProperty) {
      setTitle(editProperty.title);
      setPrice(editProperty.price.toString());
      setLocation(editProperty.location);
      setSelectedImages(editProperty.images);
      setCategory(editProperty.category);
      setType(editProperty.type);
    } else if (isOpen) {
      setTitle('');
      setPrice('');
      setLocation('');
      setSelectedImages([]);
      setCategory('Residential');
      setType('apartment');
      setErrors({});
      setStep(1);
    }
  }, [isOpen, editProperty]);

  const PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-711776953457?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=600&auto=format&fit=crop"
  ];

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedImages.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages([...selectedImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    const newErrors: {[key: string]: string} = {};
    if (step === 1) {
      if (!title.trim()) newErrors.title = 'Title is required';
      if (!price || parseFloat(price) <= 0) newErrors.price = 'Valid price greater than 0 is required';
      if (!location.trim()) newErrors.location = 'Location is required';
    } else if (step === 2) {
      if (selectedImages.length === 0) newErrors.images = 'At least one image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = () => {
    if (!validateStep()) return;

    const updatedProperty: Property = {
        ...(editProperty || {} as Property),
        id: editProperty ? editProperty.id : `prop_${Math.random().toString(36).substring(2, 9)}`,
        title,
        description: `Stunning ${type} in ${location}`,
        price: Number(price),
        location,
        type,
        category,
        images: selectedImages,
        landlordId,
        landlordName,
        landlordAvatar,
        createdAt: editProperty ? editProperty.createdAt : new Date().toISOString(),
    } as Property;
    onAddProperty(updatedProperty);
    onClose();
    setTitle('');
    setPrice('');
    setLocation('');
    setSelectedImages([]);
    setCategory('Residential');
    setType('apartment');
    setErrors({});
    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#080d19] border border-blue-900/50 p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold">{editProperty ? 'Edit Property' : 'Add New Property'}</h2>
            <span className="text-blue-400 text-sm font-semibold">Step {step} of {totalSteps}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-1.5 rounded-full mb-6">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        {step === 1 && (
            <>
                <input className={`w-full bg-white/5 border ${errors.title ? 'border-red-500' : 'border-white/10'} p-2 rounded mb-1 text-white outline-none focus:border-blue-500`} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                {errors.title && <p className="text-red-400 text-xs mb-3">{errors.title}</p>}
                <input className={`w-full bg-white/5 border ${errors.price ? 'border-red-500' : 'border-white/10'} p-2 rounded mb-1 text-white outline-none focus:border-blue-500`} placeholder="Price (KSh)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                {errors.price && <p className="text-red-400 text-xs mb-3">{errors.price}</p>}
                <input className={`w-full bg-white/5 border ${errors.location ? 'border-red-500' : 'border-white/10'} p-2 rounded mb-1 text-white outline-none focus:border-blue-500`} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                {errors.location && <p className="text-red-400 text-xs mb-3">{errors.location}</p>}
            </>
        )}
        
        {step === 2 && (
            <div className="mb-4">
                <p className="text-white text-sm mb-2">Select Property Images (up to 3):</p>
                {errors.images && <p className="text-red-400 text-xs mb-2">{errors.images}</p>}
                
                {selectedImages.length > 0 && (
                    <div className="flex gap-2 mb-3">
                        {selectedImages.map((img, idx) => (
                            <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-500">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                    {PLACEHOLDER_IMAGES.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                if (selectedImages.includes(img)) {
                                    setSelectedImages(selectedImages.filter(i => i !== img));
                                } else if (selectedImages.length < 3) {
                                    setSelectedImages([...selectedImages, img]);
                                }
                            }}
                            className={`w-full aspect-square rounded-lg border-2 ${selectedImages.includes(img) ? 'border-emerald-500' : 'border-white/10'} overflow-hidden`}
                        >
                            <img src={img} alt="Property option" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 w-full border border-dashed border-white/20 text-white text-sm py-2 rounded-lg hover:border-white/40"
                >
                    Upload from local
                </button>
            </div>
        )}

        {step === 3 && (
            <>
                <select className="w-full bg-[#0f172a] border border-blue-900/50 p-2 rounded mb-3 text-white outline-none focus:border-blue-500" value={category} onChange={(e) => setCategory(e.target.value as PropertyCategory)}>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Agricultural">Agricultural</option>
                </select>
                <select className="w-full bg-[#0f172a] border border-blue-900/50 p-2 rounded mb-4 text-white outline-none focus:border-blue-500" value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
                    <option value="apartment">Apartment</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="roommate">Roommate</option>
                    <option value="sale">Sale</option>
                    <option value="hotel">Hotel</option>
                </select>
            </>
        )}

        <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-lg py-2" onClick={onClose}>Cancel</button>
            {step > 1 && <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2" onClick={() => setStep(step - 1)}>Back</button>}
            {step < totalSteps && <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2" onClick={() => { if (validateStep()) setStep(step + 1) }}>Next</button>}
            {step === totalSteps && <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2" onClick={handleSubmit}>Submit</button>}
        </div>
      </div>
    </div>
  );
};
