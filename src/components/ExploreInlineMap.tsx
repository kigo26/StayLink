/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Sparkles, ChevronRight, Home, Info, Crosshair } from 'lucide-react';
import { Property } from '../types';

interface ExploreInlineMapProps {
  properties: Property[];
  onViewProperty: (prop: Property) => void;
  selectedType: string;
}

export default function ExploreInlineMap({ properties, onViewProperty, selectedType }: ExploreInlineMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const markersRef = useRef<any[]>([]);

  // Dynamic Leaflet Loader
  useEffect(() => {
    // Check if Leaflet is already loaded globally
    const existingScript = document.getElementById('leaflet-js');
    const existingCss = document.getElementById('leaflet-css');
    
    const initLeaflet = () => {
      setIsMapLoaded(true);
    };

    if ((window as any).L) {
      initLeaflet();
      return;
    }

    if (!existingCss) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        initLeaflet();
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', initLeaflet);
    }

    return () => {
      if (existingScript) {
        existingScript.removeEventListener('load', initLeaflet);
      }
    };
  }, []);

  // Map Initialization & Marker Updates
  useEffect(() => {
    if (!isMapLoaded || !mapElementRef.current || !(window as any).L) return;
    const L = (window as any).L;

    // Remove existing map instance safely before recreating
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center to Nairobi core (Westlands/Kilimani region)
    const defaultCenter: [number, number] = [-1.2750, 36.8020];
    
    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(defaultCenter, 13);
    
    mapInstanceRef.current = map;

    // Beautiful Voyager Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Call invalidate size after rendering to ensure leaflet fills container properly
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapLoaded]);

  // Synchronize dynamic properties pinning
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (properties.length === 0) return;

    const bounds = L.latLngBounds([]);

    properties.forEach(prop => {
      if (!prop.coordinates || typeof prop.coordinates.lat !== 'number' || typeof prop.coordinates.lng !== 'number') return;
      
      const lat = prop.coordinates.lat;
      const lng = prop.coordinates.lng;
      bounds.extend([lat, lng]);

      // Create a gorgeous custom HTML bubble marker mirroring premium pricing maps
      const formattedPrice = prop.price >= 1000000 
        ? `${(prop.price / 1000000).toFixed(1)}M` 
        : `${Math.round(prop.price / 1000)}k`;
      const isSelected = selectedProperty?.id === prop.id;

      const markerHtml = `
        <button class="relative flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer">
          <div class="px-2.5 py-1.5 rounded-full border border-neutral-250 backdrop-blur-md font-sans text-[10.5px] font-extrabold flex items-center gap-1 shadow-lg transition-all ${
            isSelected 
              ? 'bg-neutral-900 border-neutral-950 text-white scale-110 z-50 ring-2 ring-blue-500 ring-offset-1 shadow-blue-500/10' 
              : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50 shadow-xs'
          }">
            <span class="text-[9px] text-blue-500 leading-none">KSh</span>
            <span>${formattedPrice}</span>
          </div>
          <!-- Tiny bottom triangle anchor -->
          <div class="w-1.5 h-1.5 rotate-45 border-r border-b -mt-0.5 z-40 ${
            isSelected 
              ? 'bg-neutral-900 border-neutral-950/20' 
              : 'bg-white border-neutral-200/20'
          }"></div>
        </button>
      `;

      const customIcon = L.divIcon({
        className: 'custom-explore-price-marker',
        html: markerHtml,
        iconSize: [60, 32],
        iconAnchor: [30, 16]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // On Marker Click
      marker.on('click', () => {
        setSelectedProperty(prop);
        map.setView([lat, lng], 14, { animate: true, duration: 0.8 });
      });

      markersRef.current.push(marker);
    });

    // Fit map view bounds dynamically to fit all properties nicely
    if (properties.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [properties, isMapLoaded, selectedProperty?.id]);

  // Command to manually center back to bounding box of all listings
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !(window as any).L || properties.length === 0) return;
    const L = (window as any).L;
    const bounds = L.latLngBounds([]);
    properties.forEach(prop => {
      if (prop.coordinates) {
        bounds.extend([prop.coordinates.lat, prop.coordinates.lng]);
      }
    });
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
  };

  return (
    <div id="staylink-inline-explorer-map-container" className="w-full rounded-2.5xl border border-neutral-200 bg-white overflow-hidden flex flex-col relative shadow-sm h-[420px]">
      
      {/* Map Element Viewport */}
      <div 
        ref={mapElementRef} 
        id="staylink-leaflet-inline-map" 
        className="w-full flex-1 relative z-0 h-full bg-neutral-150"
      />

      {/* Floating map tools */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white/95 backdrop-blur-xs hover:bg-neutral-50 text-neutral-800 rounded-xl shadow-md border border-neutral-200 transition-all flex items-center justify-center cursor-pointer active:scale-95"
          title="Center on properties"
        >
          <Crosshair className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Header Info Pill */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-auto bg-neutral-900/90 text-white rounded-full py-1.5 px-3 border border-neutral-800/80 backdrop-blur-md shadow-lg flex items-center gap-1.5 select-none hover:opacity-100 transition-opacity">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-[9.5px] font-semibold tracking-wide uppercase font-mono">Found {properties.length} Active Nodes</span>
      </div>

      {/* Popover/Detail Card overlay at bottom of Map */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute bottom-3 left-3 right-3 z-20 bg-white rounded-2xl border border-neutral-200 p-2.5 shadow-2xl flex gap-3 pointer-events-auto select-none"
          >
            {/* Left Image thumbnail with badge */}
            <div className="w-20 h-20 rounded-xl relative overflow-hidden bg-neutral-100 shrink-0">
              <img 
                src={selectedProperty.images[0]} 
                alt={selectedProperty.title} 
                className="w-full h-full object-cover"
              />
              {selectedProperty.isPromoted && (
                <div className="absolute top-1 left-1 bg-amber-500 text-[8px] font-black uppercase text-white px-1.5 py-0.5 rounded">
                  Promoted
                </div>
              )}
            </div>

            {/* Right core description details */}
            <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-1">
                  <h5 className="text-[12px] font-bold text-neutral-900 truncate tracking-tight">{selectedProperty.title}</h5>
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="text-neutral-400 hover:text-neutral-600 text-xs py-0.5 px-1.5 rounded-full hover:bg-neutral-100 transition duration-150 font-bold shrink-0"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex items-center gap-0.5 text-neutral-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="text-[10.5px] truncate">{selectedProperty.location}</span>
                </div>
              </div>

              {/* Price & CTA Action */}
              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-neutral-100">
                <p className="text-[11.5px] font-black text-neutral-900 leading-none">
                  KSh {selectedProperty.price >= 1000000 ? `${(selectedProperty.price/1000000).toFixed(1)}M` : selectedProperty.price.toLocaleString()}
                  <span className="text-[8.5px] text-neutral-400 font-normal">/{selectedProperty.type === 'airbnb' || selectedProperty.type === 'hotel' ? 'day' : 'month'}</span>
                </p>

                <button
                  onClick={() => onViewProperty(selectedProperty)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1 px-2.5 text-[10px] font-extrabold uppercase tracking-wide transition flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
