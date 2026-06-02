/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Check, Shield, Circle, Compass, Sparkles, MapPin, Eye } from 'lucide-react';
import { Property } from '../types';

interface PropertyComparerProps {
  selectedProperties: Property[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onViewDetails: (prop: Property) => void;
}

export default function PropertyComparer({
  selectedProperties,
  onRemoveProperty,
  onClearAll,
  onClose,
  onViewDetails
}: PropertyComparerProps) {
  
  // Extract all unique amenities across chosen properties
  const allUniqueAmenities = Array.from(
    new Set(selectedProperties.flatMap(p => p.amenities || []))
  ).sort();

  return (
    <motion.div
      id="property-comparer-overlay"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 280 }}
      className="absolute inset-0 bg-neutral-100 z-50 flex flex-col overflow-hidden"
    >
      {/* Compare Toolbar */}
      <div className="bg-neutral-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider">Side-by-Side Comparison</h3>
            <p className="text-[9.5px] text-neutral-400 font-medium">Comparing {selectedProperties.length} active listings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="text-[9.5px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition bg-neutral-800 hover:bg-neutral-700 py-1.5 px-2.5 rounded-lg border border-neutral-700"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-850 hover:bg-neutral-800 rounded-full border border-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Comparative Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
        {selectedProperties.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-neutral-800">No properties selected for comparison</p>
            <p className="text-[10px] text-neutral-500 max-w-xs mx-auto">Select up to 3 listings from the properties grid to map, inspect and compare features side-by-side.</p>
            <button
              onClick={onClose}
              className="mt-2 py-2 px-4 bg-blue-600 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider hover:bg-blue-700 transition"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header / Basic Specs Grid */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 shadow-xs">
              <h4 className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 mb-2.5 font-mono">1. Core Estimates & Specs</h4>
              <div className="grid" style={{ gridTemplateColumns: `80px repeat(${selectedProperties.length}, minmax(0, 1fr))` }}>
                {/* Visual Cards Row */}
                <span className="text-[10px] text-neutral-400 font-bold self-center">Overview</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 flex flex-col relative group">
                    <button
                      onClick={() => onRemoveProperty(prop.id)}
                      className="absolute top-1 right-2 w-5 h-5 bg-black/60 hover:bg-rose-600 rounded-full flex items-center justify-center text-white z-10 transition cursor-pointer border border-white/20"
                      title="Remove from comparison"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="h-20 rounded-xl overflow-hidden bg-neutral-100 relative mb-1.5 shrink-0 shadow-3xs">
                      <img src={prop.images[0]} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 bg-neutral-900/85 backdrop-blur-3xs text-white px-1 py-0.5 rounded text-[8.5px] font-extrabold uppercase font-mono">
                        {prop.type}
                      </div>
                    </div>
                    <h5 className="text-[10.5px] font-extrabold text-neutral-900 line-clamp-1 leading-snug">{prop.title}</h5>
                    <p className="text-[9.5px] text-neutral-500 font-medium line-clamp-1 flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                      {prop.location}
                    </p>
                  </div>
                ))}

                {/* Price Row */}
                <div className="col-span-full border-t border-neutral-100 my-2"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Price</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1 font-sans text-xs font-black text-blue-600">
                    KSh {prop.price.toLocaleString()}
                    <span className="text-[8.5px] text-neutral-400 font-medium block">
                      /{prop.type === 'airbnb' || prop.type === 'hotel' ? 'day' : 'month'}
                    </span>
                  </div>
                ))}

                {/* Configurations Row */}
                <div className="col-span-full border-t border-neutral-100 my-2"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Rooms</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1 text-[10.5px] text-neutral-700 font-semibold space-y-0.5">
                    <div>🛏️ {prop.bedrooms} {prop.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</div>
                    <div>🛁 {prop.bathrooms} {prop.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</div>
                  </div>
                ))}

                {/* Virtual Tour */}
                <div className="col-span-full border-t border-neutral-100 my-2"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Virtual Tour</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1 text-[10.5px] font-bold">
                    {prop.hasVirtualTour ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">Available</span>
                    ) : (
                      <span className="text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md text-[9px] uppercase">No Tour</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood Metrics */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 shadow-xs">
              <h4 className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 mb-2.5 font-mono">2. AI Neighborhood Safety & Commute</h4>
              <div className="grid text-left" style={{ gridTemplateColumns: `80px repeat(${selectedProperties.length}, minmax(0, 1fr))` }}>
                {/* Safety Score */}
                <span className="text-[10px] text-neutral-400 font-bold self-center">Safety Index</span>
                {selectedProperties.map(prop => {
                  const safety = prop.neighborhoodMetrics?.safety ?? 85;
                  const colorClass = safety >= 85 ? 'text-emerald-700' : safety >= 70 ? 'text-amber-700' : 'text-rose-700';
                  return (
                    <div key={prop.id} className="px-2 border-l border-neutral-100 py-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-black ${colorClass}`}>{safety}%</span>
                        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full ${safety >= 85 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${safety}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Transit / Commute */}
                <div className="col-span-full border-t border-neutral-100 my-1.5"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Transit Index</span>
                {selectedProperties.map(prop => {
                  const transit = prop.neighborhoodMetrics?.transit ?? 80;
                  return (
                    <div key={prop.id} className="px-2 border-l border-neutral-100 py-1">
                      <span className="text-xs font-black text-neutral-700">{transit}%</span>
                    </div>
                  );
                })}

                {/* Noise Metric */}
                <div className="col-span-full border-t border-neutral-100 my-1.5"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Noise Index</span>
                {selectedProperties.map(prop => {
                  const noise = prop.neighborhoodMetrics?.noise ?? 30;
                  const scoreLabel = noise < 30 ? 'Quiet' : noise < 60 ? 'Moderate' : 'Loud';
                  return (
                    <div key={prop.id} className="px-2 border-l border-neutral-100 py-1">
                      <span className="text-[10.5px] font-bold text-neutral-800">{noise}%</span>
                      <span className="text-[8px] text-neutral-400 block font-bold uppercase">{scoreLabel}</span>
                    </div>
                  );
                })}

                {/* Target CBD commute */}
                <div className="col-span-full border-t border-neutral-100 my-1.5"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">To CBD</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1 text-[10.5px] font-bold text-neutral-600 line-clamp-1">
                    {prop.neighborhoodMetrics?.commuteToCBD || '15 mins'}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Trust & Reliability */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 shadow-xs">
              <h4 className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 mb-2.5 font-mono">3. Trust and Host Statistics</h4>
              <div className="grid text-left" style={{ gridTemplateColumns: `80px repeat(${selectedProperties.length}, minmax(0, 1fr))` }}>
                
                {/* AI Score */}
                <span className="text-[10px] text-neutral-400 font-bold self-center">AI Quality</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1">
                    <span className="text-xs font-black text-neutral-800">{prop.aiQualityScore}%</span>
                    <span className="text-[8px] text-emerald-600 font-extrabold uppercase block tracking-wider">Verified Listing</span>
                  </div>
                ))}

                {/* Response speed */}
                <div className="col-span-full border-t border-neutral-100 my-1.5"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Resp. Speed</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1 text-[10.5px] font-semibold text-neutral-700">
                    ⚡ {prop.responseSpeedMinutes ? `Under ${prop.responseSpeedMinutes}m` : 'Rapid'}
                  </div>
                ))}

                {/* Landlord Trust */}
                <div className="col-span-full border-t border-neutral-100 my-1.5"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Landlord</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1 flex items-center gap-1.5 min-w-0">
                    <img src={prop.landlordAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop"} className="w-5 h-5 rounded-full object-cover shrink-0 border border-neutral-300" />
                    <span className="text-[10px] font-bold text-neutral-700 truncate">{prop.landlordName || "Owner Host"}</span>
                  </div>
                ))}

                {/* Booking success rate */}
                <div className="col-span-full border-t border-neutral-100 my-1.5"></div>
                <span className="text-[10px] text-neutral-400 font-bold self-center">Booking Success</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-2 border-l border-neutral-100 py-1 text-xs font-black text-emerald-600">
                    {prop.bookingSuccessRate || 95}%
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Grid matrix */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 shadow-xs">
              <h4 className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 mb-2.5 font-mono">4. Amenities Audit</h4>
              <div className="grid text-left" style={{ gridTemplateColumns: `80px repeat(${selectedProperties.length}, minmax(0, 1fr))` }}>
                {allUniqueAmenities.map((amenity, index) => (
                  <React.Fragment key={amenity}>
                    {index > 0 && <div className="col-span-full border-t border-neutral-100 my-1.5"></div>}
                    <span className="text-[10px] text-neutral-500 font-bold truncate pr-1" title={amenity}>{amenity}</span>
                    {selectedProperties.map(prop => {
                      const hasAmenity = (prop.amenities || []).some(a => a.toLowerCase() === amenity.toLowerCase());
                      return (
                        <div key={prop.id} className="px-2 border-l border-neutral-100 py-0.5 flex items-center justify-start text-[10px]">
                          {hasAmenity ? (
                            <div className="flex items-center gap-1 text-emerald-600 font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                              <span className="hidden sm:inline">Yes</span>
                            </div>
                          ) : (
                            <span className="text-neutral-300 font-mono font-bold">—</span>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* CTA row to jump directly into bookings */}
            <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="grid" style={{ gridTemplateColumns: `80px repeat(${selectedProperties.length}, minmax(0, 1fr))` }}>
                <span className="text-[10px] text-neutral-400 font-bold self-center uppercase">Action</span>
                {selectedProperties.map(prop => (
                  <div key={prop.id} className="px-1 border-l border-neutral-100 py-1">
                    <button
                      onClick={() => onViewDetails(prop)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-1 text-[10px] font-extrabold uppercase tracking-widest transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 border-none"
                    >
                      <Eye className="w-3 h-3 shrink-0" /> Inspect
                    </button>
                    <button
                      onClick={() => onRemoveProperty(prop.id)}
                      className="w-full mt-1.5 py-1 text-neutral-400 hover:text-rose-500 rounded-lg text-[8.5px] uppercase font-bold transition text-center hover:bg-neutral-55"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close and return info prompt banner */}
      <div className="bg-neutral-50 border-t border-neutral-200/80 p-3.5 text-center shrink-0">
        <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">
          Tip: You can change, add up to 3 properties, or toggle criteria dynamically.
          Compare to find the optimal combination of <strong>pricing</strong> and <strong>AI score rankings</strong> in Nairobi.
        </p>
      </div>
    </motion.div>
  );
}
