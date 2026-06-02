import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, Navigation, Compass, Shield, Crosshair, Sparkles, Sliders, 
  Play, Pause, Eye, Bus, Activity, Wifi, Check, Route, RefreshCw, Layers,
  AlertTriangle, School, Train, Info
} from 'lucide-react';
import { Property, UserProfile } from '../types';

interface MapTrackerProps {
  properties: Property[];
  onViewProperty: (prop: Property) => void;
  onBookProperty?: (prop: Property) => void;
  currentUser: UserProfile;
}

// Haversine distance calculator in kilometers
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const SCHOOL_DISTRICTS = [
  { name: 'Westlands SD', lat: -1.2650, lng: 36.8000, radius: 1500 },
  { name: 'Kilimani SD', lat: -1.2850, lng: 36.7900, radius: 1200 },
];

const COMMERCIAL_HUBS = [
  { name: 'Westlands Hub', lat: -1.2670, lng: 36.8080, radius: 800 },
  { name: 'Kilimani CBD', lat: -1.2890, lng: 36.7950, radius: 1000 },
  { name: 'Nairobi CBD', lat: -1.2833, lng: 36.8167, radius: 1500 },
];

const PUBLIC_TRANSPORT_HUBS = [
  { name: 'Nairobi Terminus', lat: -1.3323, lng: 36.8643, radius: 800 },
  { name: 'Kencom Stage', lat: -1.2840, lng: 36.8228, radius: 500 },
];

const CRIME_ZONES = [
  { name: 'Red Zone: CBD High Risk', lat: -1.2833, lng: 36.8219, radius: 600 },
  { name: 'Red Zone: Eastleigh Night', lat: -1.2783, lng: 36.8480, radius: 1000 },
];

export default function MapTracker({ properties, onViewProperty, onBookProperty, currentUser }: MapTrackerProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'light' | 'dark'>('light');
  
  // Nairobi core default location (near Kilimani/Westlands junction)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ 
    lat: -1.2750, 
    lng: 36.8020 
  }); 

  const [simulationMode, setSimulationMode] = useState<'stationary' | 'walking' | 'driving'>('stationary');
  const [searchRadius, setSearchRadius] = useState<number>(4); // km radius
  const [nearbyList, setNearbyList] = useState<{ property: Property; distance: number }[]>([]);
  const [sortBy, setSortBy] = useState<'proximity' | 'price_asc' | 'price_desc'>('proximity');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [showSchoolDistricts, setShowSchoolDistricts] = useState(false);
  const [showCommercialHubs, setShowCommercialHubs] = useState(false);
  const [showPublicTransport, setShowPublicTransport] = useState(false);
  const [showCrimeZones, setShowCrimeZones] = useState(false);
  const [showCommute, setShowCommute] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const userMarkerRef = useRef<any>(null);
  const propertyMarkersRef = useRef<any>(null);
  const searchCircleRef = useRef<any>(null);
  const simulationIntervalRef = useRef<any>(null);
  const layerMarkersRef = useRef<any[]>([]);
  const commutePolylineRef = useRef<any>(null);

  // Dynamic Leaflet Loader
  useEffect(() => {
    // Check if Leaflet is already loaded globally
    const existingScript = document.getElementById('leaflet-js');
    const existingCss = document.getElementById('leaflet-css');
    
    const initLeaflet = () => {
      setIsMapLoaded(true);
    };

    if ((window as any).L && (window as any).L.markerClusterGroup) {
      initLeaflet();
      return;
    }

    const loadClusterPlugin = () => {
      if ((window as any).L && (window as any).L.markerClusterGroup) {
        initLeaflet();
        return;
      }
      if (!document.getElementById('leaflet-cluster-css')) {
        const clusterCss1 = document.createElement('link');
        clusterCss1.id = 'leaflet-cluster-css';
        clusterCss1.rel = 'stylesheet';
        clusterCss1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
        document.head.appendChild(clusterCss1);
        
        const clusterCss2 = document.createElement('link');
        clusterCss2.rel = 'stylesheet';
        clusterCss2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
        document.head.appendChild(clusterCss2);
        
        const clusterJs = document.createElement('script');
        clusterJs.id = 'leaflet-cluster-js';
        clusterJs.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
        clusterJs.async = true;
        clusterJs.onload = () => {
          initLeaflet();
        };
        document.body.appendChild(clusterJs);
      }
    };

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
        loadClusterPlugin();
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', loadClusterPlugin);
    }

    return () => {
      if (existingScript) {
        existingScript.removeEventListener('load', loadClusterPlugin);
      }
    };
  }, []);

  // Map Initialization & Theme Handling
  useEffect(() => {
    if (!isMapLoaded || !mapElementRef.current || !(window as any).L) return;
    const L = (window as any).L;

    // Remove existing map instance safely
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([userLocation.lat, userLocation.lng], 13);
    
    mapInstanceRef.current = map;

    // CartoDB High-Contrast Maps Theme
    const tileUrl = mapStyle === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      
    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

    // Zoom buttons in a clean position
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dynamic user locator icon (Pulsing GPRS beacon)
    const userIcon = L.divIcon({
      className: 'custom-user-marker-div',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-blue-500/25 rounded-full animate-ping"></div>
          <div class="absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-lg flex items-center justify-center">
            <div class="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
    userMarkerRef.current = userMarker;

    // Search accuracy radius outline circle
    const searchCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: searchRadius * 1000,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(map);
    searchCircleRef.current = searchCircle;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapLoaded, mapStyle]);

  // Handle Radar Proximity Distance updates
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerRef.current || !(window as any).L) return;
    
    userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    
    if (searchCircleRef.current) {
      searchCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      searchCircleRef.current.setRadius(searchRadius * 1000);
    }
    
    // Slowly glide map center during simulations
    if (simulationMode !== 'stationary') {
      mapInstanceRef.current.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 1 });
    }
  }, [userLocation, searchRadius, simulationMode]);

  // Synchronize Properties Pinning on Map based on Radius Range
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L || !(window as any).L.markerClusterGroup) return;
    const L = (window as any).L;

    // Clear old listing hooks
    if (propertyMarkersRef.current) {
      if (Array.isArray(propertyMarkersRef.current)) {
         propertyMarkersRef.current.forEach(m => m.remove());
      } else {
         mapInstanceRef.current.removeLayer(propertyMarkersRef.current);
      }
    }

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: function(cluster: any) {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="bg-blue-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold shadow-lg border-2 border-white text-xs">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
      }
    });

    propertyMarkersRef.current = clusterGroup;

    const tempList: { property: Property; distance: number }[] = [];

    properties.forEach(prop => {
      if (!prop.coordinates) return;

      const dist = getHaversineDistance(
        userLocation.lat, 
        userLocation.lng, 
        prop.coordinates.lat, 
        prop.coordinates.lng
      );

      // Save list distance
      tempList.push({ property: prop, distance: dist });

      // Only display properties on map that fall in our radar range or standard nearby views
      const typeIcons: Record<string, string> = {
        apartment: '🏢',
        airbnb: '✨',
        roommate: '🤝',
        sale: '🏡',
        hotel: '🌴'
      };
      
      const typeColors: Record<string, string> = {
        apartment: '#2563eb',
        airbnb: '#d97706',
        roommate: '#7c3aed',
        sale: '#059669',
        hotel: '#db2777'
      };

      const color = typeColors[prop.type] || '#3b82f6';
      const iconLogo = typeIcons[prop.type] || '📍';

      const isInsideRadar = dist <= searchRadius;

      // Render custom pins for listings
      const isSelected = selectedProperty?.id === prop.id;
      const customPinElement = L.divIcon({
        className: 'custom-prop-pin-node',
        html: `
          <div class="group relative flex flex-col items-center select-none transition-transform duration-300 ${isSelected ? 'scale-150 z-50' : 'hover:scale-125'}">
            <div class="absolute -top-8 px-2 py-0.5 rounded-md text-[9px] font-extrabold whitespace-nowrap shadow-md mb-0.5 border flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isInsideRadar 
                ? 'bg-blue-600 border-blue-400 text-white animate-pulse' 
                : 'bg-white border-neutral-300 text-neutral-800'
            }">
              KSh ${prop.price >= 1000000 ? `${(prop.price/1000000).toFixed(1)}M` : prop.price >= 1000 ? `${(prop.price/1000).toFixed(0)}k` : prop.price}
            </div>
            <div class="w-8 h-8 rounded-full border-2 border-white text-white flex items-center justify-center shadow-lg relative ${isSelected ? 'ring-4 ring-blue-500/50 shadow-2xl' : ''}" style="background-color: ${color}">
              <span class="text-xs leading-none">${iconLogo}</span>
              <div class="absolute -bottom-1 left-2.5 w-2.5 h-2.5 rotate-45" style="background-color: ${color}"></div>
            </div>
          </div>
        `,
        iconSize: [50, 52],
        iconAnchor: [25, 48]
      });

      const pinMarker = L.marker([prop.coordinates.lat, prop.coordinates.lng], { icon: customPinElement });
      
      pinMarker.on('click', () => {
        setSelectedProperty(prop);
        mapInstanceRef.current.flyTo([prop.coordinates.lat, prop.coordinates.lng], 15, { animate: true, duration: 1.5 });
      });

      clusterGroup.addLayer(pinMarker);
    });

    mapInstanceRef.current.addLayer(clusterGroup);

    // Proximity listings sorted ascending by distance
    tempList.sort((a, b) => a.distance - b.distance);
    setNearbyList(tempList);

  }, [properties, userLocation, searchRadius, isMapLoaded, mapStyle, selectedProperty?.id]);

  // Map Layers logic (Schools & Commercial hubs)
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L || !isMapLoaded) return;
    const L = (window as any).L;

    layerMarkersRef.current.forEach(m => m.remove());
    layerMarkersRef.current = [];

    if (showSchoolDistricts) {
      SCHOOL_DISTRICTS.forEach(school => {
        const circle = L.circle([school.lat, school.lng], {
          color: '#f59e0b',
          fillColor: '#fbbf24',
          fillOpacity: 0.15,
          radius: school.radius,
          weight: 2,
          dashArray: '5, 5'
        }).addTo(mapInstanceRef.current);
        circle.bindTooltip(`🏫 ${school.name}`, { permanent: true, direction: 'center', className: 'bg-transparent border-none text-amber-600 font-bold shadow-none text-[10px] uppercase font-mono' });
        layerMarkersRef.current.push(circle);
      });
    }

    if (showCommercialHubs) {
      COMMERCIAL_HUBS.forEach(hub => {
        const circle = L.circle([hub.lat, hub.lng], {
          color: '#8b5cf6',
          fillColor: '#a78bfa',
          fillOpacity: 0.15,
          radius: hub.radius,
          weight: 2
        }).addTo(mapInstanceRef.current);
        circle.bindTooltip(`💼 ${hub.name}`, { permanent: true, direction: 'center', className: 'bg-transparent border-none text-purple-600 font-bold shadow-none text-[10px] uppercase font-mono' });
        layerMarkersRef.current.push(circle);
      });
    }

    if (showPublicTransport) {
      PUBLIC_TRANSPORT_HUBS.forEach(hub => {
        const circle = L.circle([hub.lat, hub.lng], {
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.15,
          radius: hub.radius,
          weight: 2
        }).addTo(mapInstanceRef.current);
        circle.bindTooltip(`🚆 ${hub.name}`, { permanent: true, direction: 'center', className: 'bg-transparent border-none text-blue-600 font-bold shadow-none text-[10px] uppercase font-mono' });
        layerMarkersRef.current.push(circle);
      });
    }

    if (showCrimeZones) {
      CRIME_ZONES.forEach(zone => {
        const circle = L.circle([zone.lat, zone.lng], {
          color: '#ef4444',
          fillColor: '#f87171',
          fillOpacity: 0.2,
          radius: zone.radius,
          weight: 2,
          dashArray: '8, 8'
        }).addTo(mapInstanceRef.current);
        circle.bindTooltip(`⚠️ ${zone.name}`, { permanent: true, direction: 'center', className: 'bg-transparent border-none text-red-600 font-bold shadow-none text-[10px] uppercase font-mono' });
        layerMarkersRef.current.push(circle);
      });
    }
  }, [showSchoolDistricts, showCommercialHubs, showPublicTransport, showCrimeZones, isMapLoaded]);

  // Commute visualizer logic
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L || !isMapLoaded) return;
    const L = (window as any).L;

    if (commutePolylineRef.current) {
      commutePolylineRef.current.remove();
      commutePolylineRef.current = null;
    }

    if (showCommute && selectedProperty && selectedProperty.coordinates) {
      const latlngs = [
        [userLocation.lat, userLocation.lng],
        [selectedProperty.coordinates.lat, selectedProperty.coordinates.lng]
      ];
      
      const polyline = L.polyline(latlngs, {
        color: '#10b981', // Emerald green
        weight: 4,
        dashArray: '10, 10',
        className: 'custom-dash-anim'
      }).addTo(mapInstanceRef.current);
      
      commutePolylineRef.current = polyline;
      
      const bounds = L.latLngBounds(latlngs);
      // Smoothly zoom/pan to fit the polyline
      mapInstanceRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [showCommute, selectedProperty, userLocation, isMapLoaded]);

  // Telemetry Simulation Clock (Movement loops)
  useEffect(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    if (simulationMode === 'stationary') return;

    // Movement angle vectors
    let walkVector = 0;
    const incrementStep = simulationMode === 'walking' ? 0.00010 : 0.00045; // loop step size

    simulationIntervalRef.current = setInterval(() => {
      walkVector += 0.08;
      setUserLocation(prev => {
        // Glide smoothly along waves to simulate walking towards Westlands/Kilimani listings
        const dLat = Math.sin(walkVector) * incrementStep * 0.45;
        const dLng = Math.cos(walkVector) * incrementStep;
        return {
          lat: prev.lat + dLat,
          lng: prev.lng + dLng
        };
      });
    }, 1000);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [simulationMode]);

  // Request high fidelity HTML5 Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Host device browser does not support physical GPS integration.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Verify in range of Nairobi first or set directly
        setUserLocation({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn("Browser GPS sandbox denied, simulating local GPRS beacon.", err);
        // Pan back to core Nairobi coordinates
        setUserLocation({ lat: -1.2750, lng: 36.8020 });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([-1.2750, 36.8020], 13, { animate: true });
        }
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-100 text-neutral-800 relative select-none">
      
      <style>
        {`
          @keyframes dashOffsetAnim {
            to { stroke-dashoffset: -20; }
          }
          .custom-dash-anim {
            animation: dashOffsetAnim 1s linear infinite;
          }
          /* Override leaflet tooltip background issues */
          .leaflet-tooltip.bg-transparent {
            background: transparent;
            border: none;
            box-shadow: none;
            text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
          }
        `}
      </style>

      {/* Top GPS Telemetry Banner */}
      <div className="absolute top-12 left-4 right-4 z-40 bg-neutral-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2.5xl shadow-lg border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#cecece] font-mono leading-none block">StayLink GPRS Signal</span>
              <span className="text-[11px] font-semibold text-white leading-tight flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Nairobi Proximity Telemetry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMapStyle(prev => prev === 'light' ? 'dark' : 'light')}
              className="px-2.5 py-1 text-[9px] font-bold tracking-wider rounded-lg uppercase transition-all bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/5 cursor-pointer"
              title="Toggle theme style mapping"
            >
              {mapStyle === 'light' ? '🕶️ Dark Map' : '☀️ Light Map'}
            </button>
          </div>
        </div>

        {/* Readout stats bar */}
        <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-1.5 text-left font-mono">
          <div>
            <span className="text-[8px] text-white/50 block leading-tight uppercase font-bold">POS LATITUDE</span>
            <span className="text-[10px] text-blue-400 font-extrabold">{userLocation.lat.toFixed(5)}</span>
          </div>
          <div>
            <span className="text-[8px] text-white/50 block leading-tight uppercase font-bold">POS LONGITUDE</span>
            <span className="text-[10px] text-blue-400 font-extrabold">{userLocation.lng.toFixed(5)}</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas block */}
      <div className="flex-1 w-full h-full relative z-0">
        <div ref={mapElementRef} className="w-full h-full" style={{ minHeight: '100%' }} />

        {/* Dynamic Scan Radar Rings Backdrop */}
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-6 text-center text-white/80 z-50">
            <Activity className="w-10 h-10 text-blue-400 animate-spin mb-3" />
            <p className="text-sm font-bold tracking-wide uppercase font-mono">Booting StayLink Mapping Node...</p>
            <p className="text-xs text-white/50 mt-1">Acquiring real-time GPRS satellite feeds</p>
          </div>
        )}

        {/* Map control widgets */}
        <div className="absolute right-4 bottom-56 z-30 flex flex-col gap-2">
          {/* Map Layer Control FAB */}
          <div className="relative flex flex-col items-center gap-2">
            {showLayersMenu && (
              <div className="flex flex-col gap-2 mb-2 animate-slide-up bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-neutral-200/50 shadow-xl">
                <button
                  onClick={() => setShowPublicTransport(!showPublicTransport)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    showPublicTransport ? 'bg-blue-500 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-blue-500'
                  }`}
                  title="Public Transport"
                >
                  <Train className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowCrimeZones(!showCrimeZones)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    showCrimeZones ? 'bg-red-500 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-red-500'
                  }`}
                  title="Crime Zones"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowSchoolDistricts(!showSchoolDistricts)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    showSchoolDistricts ? 'bg-amber-500 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-amber-500'
                  }`}
                  title="School Districts"
                >
                  <School className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowCommercialHubs(!showCommercialHubs)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    showCommercialHubs ? 'bg-purple-500 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-purple-500'
                  }`}
                  title="Commercial Hubs"
                >
                  <Compass className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowLayersMenu(!showLayersMenu)}
              className={`w-10 h-10 rounded-xl shadow-lg border border-neutral-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer z-10 
                ${showLayersMenu ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-800 hover:bg-neutral-50'}`}
              title="Toggle Map Layers"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* Locate me button */}
          <button
            onClick={handleLocateMe}
            className="w-10 h-10 bg-white hover:bg-neutral-50 text-neutral-800 rounded-xl shadow-lg border border-neutral-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Calibrate GPS location"
          >
            <Crosshair className={`w-5 h-5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute left-4 bottom-56 z-30 flex flex-col items-start gap-2">
          {showLegend && (
            <div className="flex flex-col gap-3 mb-2 animate-slide-up bg-white/95 backdrop-blur-md p-4 rounded-xl border border-neutral-200 shadow-xl max-w-[200px] pointer-events-auto">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider border-b border-neutral-100 pb-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" /> Map Legend
              </span>
              
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-black text-neutral-800 uppercase tracking-widest text-opacity-50">Property Types</span>
                <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[10px] font-bold text-neutral-700">
                  <div className="flex items-center gap-1.5"><span>🏢</span> Appt.</div>
                  <div className="flex items-center gap-1.5"><span>✨</span> Airbnb</div>
                  <div className="flex items-center gap-1.5"><span>🏡</span> Sale</div>
                  <div className="flex items-center gap-1.5"><span>🤝</span> Share</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
                <span className="text-[8px] font-black text-neutral-800 uppercase tracking-widest text-opacity-50">Map Overlays</span>
                <div className="flex flex-col gap-1.5 text-[10px] font-bold text-neutral-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 opacity-80" />
                    School Districts
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400 border border-purple-500 opacity-80" />
                    Commercial Hubs
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400 border border-blue-500 opacity-80" />
                    Public Transport
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500 opacity-80 border-dashed" />
                    Crime Zones
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0 border-t-2 border-dashed border-emerald-500" />
                    Commute Path
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`w-10 h-10 rounded-xl shadow-lg border border-neutral-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer z-10 
              ${showLegend ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-800 hover:bg-neutral-50'}`}
            title="Toggle Map Legend"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom sliding info card drawers */}
      <div className="absolute bottom-16 left-4 right-4 z-40 space-y-2 pointer-events-none">
        
        {/* Proximity Scanning Controller widgets */}
        <div className="bg-white/95 backdrop-blur-md rounded-2.5xl p-3 border border-neutral-200/90 shadow-lg flex flex-col gap-2 pointer-events-auto">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-left">
              <Sliders className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-tight">Telemetry Radar Range</span>
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 font-mono">
              Proximity: {searchRadius} KM
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input 
              type="range"
              min="1"
              max="15"
              step="1"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer focus:outline-none"
            />
          </div>

          {/* Real-time simulation trigger buttons */}
          <div className="grid grid-cols-3 gap-1.5 border-t border-neutral-100 pt-2 font-sans">
            <button
              onClick={() => setSimulationMode('stationary')}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
                simulationMode === 'stationary' 
                  ? 'bg-neutral-900 text-white shadow-inner' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              <Pause className="w-3 h-3" /> Still
            </button>
            <button
              onClick={() => setSimulationMode('walking')}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
                simulationMode === 'walking' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
              title="Calibrate walk loop around properties"
            >
              <Navigation className="w-3 h-3 animate-pulse" /> Walk
            </button>
            <button
              onClick={() => setSimulationMode('driving')}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
                simulationMode === 'driving' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
              title="Calibrate fast driving loop simulation"
            >
              <Bus className="w-3 h-3 animate-bounce" /> Ride
            </button>
          </div>
        </div>

        {/* Selected Pin Details card */}
        <div className="pointer-events-auto">
          {selectedProperty ? (
            <div className="bg-white border-2 border-blue-500 rounded-2.5xl p-3 flex gap-3 shadow-xl relative overflow-hidden animate-slide-up">
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-2 right-2.5 text-neutral-400 hover:text-neutral-700 font-bold text-xs p-1"
              >
                ✕
              </button>
              
              <img 
                src={selectedProperty.images[0]} 
                className="w-20 h-20 object-cover rounded-xl border border-neutral-100 shrink-0" 
              />
              <div className="flex-1 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8px] bg-blue-100 text-blue-700 font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                      {selectedProperty.type}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-neutral-400">
                      Inside Radar Range
                    </span>
                    {(selectedProperty.verifiedByAdmin || selectedProperty.verificationStatus === 'verified') && (
                      <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-emerald-250 shadow-3xs">
                        <Check className="w-2.5 h-2.5 text-emerald-600 fill-current" /> Verified Host
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-xs text-neutral-900 tracking-tight leading-tight mt-1 line-clamp-1">
                    {selectedProperty.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 flex items-center gap-0.5 mt-0.5 font-medium">
                    📍 {selectedProperty.location}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-sm text-blue-600 font-mono">
                    KSh {selectedProperty.price.toLocaleString()}
                  </span>
                  
                  <button
                    onClick={() => onViewProperty(selectedProperty)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer border-none"
                  >
                    <Eye className="w-3 h-3" /> View Detail
                  </button>
                </div>
              </div>
              
              {/* Commute visualizer toggle button placed absolutely at bottom of card */}
              <div className="absolute top-2 left-2.5">
                <button
                  onClick={() => {
                    setShowCommute(!showCommute);
                    // trigger an immediate 'Book' action when clicked in specific modes
                    if (simulationMode !== 'stationary' && onBookProperty) {
                      onBookProperty(selectedProperty);
                    }
                  }}
                  className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all flex items-center gap-1 cursor-pointer border-none shadow-sm ${showCommute ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'}`}
                  title={simulationMode !== 'stationary' ? "Visualize and Book Commute" : "Visualize Path & Dash Animation"}
                >
                  <Route className="w-2.5 h-2.5" /> CommuteVisualizer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Radar scanning summary card */}
              <div className="bg-neutral-900 border border-white/10 rounded-2.5xl p-3 shadow-lg flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 animate-pulse">
                    <RadarAnimation />
                  </div>
                  <div>
                    <span className="text-[8px] text-white/50 block font-mono">SATELLITE POSITION VERIFIED</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                      Radar Found: {nearbyList.filter(n => n.distance <= searchRadius).length} listing matches
                    </span>
                  </div>
                </div>

                {nearbyList.length > 0 && (
                  <div className="text-right">
                    <span className="text-[8px] text-white/50 block font-mono">CLOSEST DESTINATION</span>
                    <span className="text-[10px] font-black text-teal-400 font-mono uppercase tracking-wide">
                      {nearbyList[0].property.title.split(' ')[0]} ({nearbyList[0].distance.toFixed(1)} km)
                    </span>
                  </div>
                )}
              </div>

              {/* View of Nearby List with Sorting UI Component */}
              {nearbyList.filter(n => n.distance <= searchRadius).length > 0 && (
                <div className="bg-white/95 backdrop-blur-md rounded-2.5xl shadow-lg border border-neutral-200 p-3 max-h-56 overflow-y-auto pointer-events-auto">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-100 sticky top-0 bg-white/95 z-10 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Live Results</span>
                    <select 
                      className="text-[9px] font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-2 py-1.5 outline-none border border-neutral-200 cursor-pointer transition"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'proximity' | 'price_asc' | 'price_desc')}
                    >
                      <option value="proximity">Distance</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {nearbyList
                      .filter(n => n.distance <= searchRadius)
                      .sort((a, b) => {
                        if (sortBy === 'proximity') return a.distance - b.distance;
                        if (sortBy === 'price_asc') return a.property.price - b.property.price;
                        if (sortBy === 'price_desc') return b.property.price - a.property.price;
                        return 0;
                      })
                      .map((item) => (
                        <div 
                          key={item.property.id} 
                          onClick={() => {
                            setSelectedProperty(item.property);
                            if (mapInstanceRef.current && item.property.coordinates) {
                              mapInstanceRef.current.flyTo([item.property.coordinates.lat, item.property.coordinates.lng], 15, { animate: true, duration: 1.5 });
                            }
                          }}
                          className="flex items-center gap-3 p-1.5 hover:bg-neutral-50 active:bg-neutral-100 rounded-xl cursor-pointer transition border border-transparent hover:border-neutral-100"
                        >
                          <img src={item.property.images[0]} className="w-12 h-12 rounded-lg object-cover bg-neutral-200" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-[11px] font-extrabold text-neutral-800 line-clamp-1 flex items-center gap-1">
                              {item.property.title}
                              {(item.property.verifiedByAdmin || item.property.verificationStatus === 'verified') && (
                                <Check className="w-3 h-3 text-emerald-500 shrink-0 fill-current" title="Verified Landlord Host" />
                              )}
                            </div>
                            <div className="text-[9px] text-neutral-500 font-medium">📍 {item.distance.toFixed(1)} km away • {item.property.type}</div>
                          </div>
                          <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            KSh {item.property.price >= 1000000 ? `${(item.property.price / 1000000).toFixed(1)}M` : item.property.price >= 1000 ? `${(item.property.price / 1000).toFixed(0)}k` : item.property.price}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Simple Radar scanning animation component
function RadarAnimation() {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <div className="absolute w-5 h-5 border border-blue-400 rounded-full animate-ping opacity-75"></div>
      <div className="absolute w-2.5 h-2.5 border-2 border-blue-400 rounded-full"></div>
      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
    </div>
  );
}
