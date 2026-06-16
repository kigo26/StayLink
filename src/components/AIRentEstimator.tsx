import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';
import { Sparkles, Loader2, DollarSign, Calculator, ChevronDown, ChevronUp, PiggyBank } from 'lucide-react';

interface AIRentEstimatorProps {
  property: Property;
}

export const AIRentEstimator: React.FC<AIRentEstimatorProps> = ({ property }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<{
    suggestedRent: number;
    range: string;
    rationale: string;
  } | null>(null);

  const fetchEstimation = async () => {
    setIsOpen(true);
    if (estimation || loading) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/estimate-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: property.location,
          propertyType: property.type,
          bedrooms: property.bedrooms
        })
      });
      const data = await res.json();
      if (data.success && data.estimation) {
        setEstimation(data.estimation);
      }
    } catch (err) {
      console.error("Failed to fetch rent estimation", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnnualSavings = () => {
    if (!estimation) return 0;
    const monthlyDiff = estimation.suggestedRent - property.price;
    return monthlyDiff > 0 ? monthlyDiff * 12 : 0;
  };

  const annualSavings = calculateAnnualSavings();

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl overflow-hidden shadow-sm mt-4">
      <button 
        onClick={isOpen ? () => setIsOpen(false) : fetchEstimation}
        className="w-full flex items-center justify-between p-4 bg-white/50 hover:bg-white/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
            <Calculator size={18} />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              AI Rent Estimator <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">Get a fair-market analysis instantly</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2 border-t border-indigo-100/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 text-indigo-500">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[11px] font-semibold tracking-wider uppercase">Calculating Value...</p>
                </div>
              ) : estimation ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 border border-indigo-50 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Rent</p>
                      <p className="text-xl font-black text-indigo-700 flex items-center">
                        <span className="text-xs mr-1 text-indigo-400">KSh</span>
                        {estimation.suggestedRent.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Range</p>
                      <p className="text-sm font-bold text-slate-700">{estimation.range}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-900/5 rounded-xl p-3 border border-indigo-100/50">
                    <p className="text-[11px] leading-relaxed text-indigo-900 font-medium">{estimation.rationale}</p>
                  </div>
                  
                  {annualSavings > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-start gap-3"
                    >
                      <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600 mt-0.5">
                        <PiggyBank size={16} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
                          Great Deal Detected
                        </h4>
                        <p className="text-xs font-medium text-emerald-700">
                          Priced below market value. You could save <span className="font-extrabold text-emerald-900">KSh {annualSavings.toLocaleString()}</span> annually by renting this property!
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {annualSavings <= 0 && Math.abs(estimation.suggestedRent - property.price) > estimation.suggestedRent * 0.2 && (
                    <div className="text-[10px] p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-medium">
                      ⚠️ Current listing price is significantly different from the AI estimate. Proceed carefully.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-500">
                  Analysis currently unavailable.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
