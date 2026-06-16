import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';
import { X, TrendingUp, MapPin, Loader2, Info } from 'lucide-react';
import PropertyDocumentUpload from './PropertyDocumentUpload';

interface PropertyInsightModalProps {
  property: Property;
  onClose: () => void;
}

interface InsightData {
  locationAdvantages: string[];
  estimatedROI: string;
  summary: string;
}

export const PropertyInsightModal: React.FC<PropertyInsightModalProps> = ({ property, onClose }) => {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/property-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property })
        });
        const data = await res.json();
        if (data.success && data.insight) {
          setInsight(data.insight);
        }
      } catch (err) {
        console.error("Failed to fetch property insight", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [property]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div 
          className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <span className="bg-blue-500/20 p-1.5 rounded-lg text-blue-400">
                  <TrendingUp size={20} />
                </span>
                Property AI Insight
              </h2>
              <p className="text-slate-400 text-sm">Smart analysis for {property.title}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-blue-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-slate-300 font-medium animate-pulse">Running Neural Market Analysis...</p>
              </div>
            ) : insight ? (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin size={16} /> Location Advantages
                    </h3>
                    <ul className="space-y-2">
                      {insight.locationAdvantages.map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-200 text-sm bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <TrendingUp size={16} /> Estimated ROI
                    </h3>
                    <p className="text-white font-medium">{insight.estimatedROI}</p>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Info size={16} /> Investment Summary
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{insight.summary}</p>
                  </div>

                  <PropertyDocumentUpload propertyId={property.id} />
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-400">
                Failed to load insights. Please try again.
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 text-center">
             <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
             >
                Close Analysis
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
