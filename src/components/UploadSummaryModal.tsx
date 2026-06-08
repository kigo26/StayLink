/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadSummary {
  successCount: number;
  failureCount: number;
  failures: { index: number; reason: string }[];
}

interface UploadSummaryModalProps {
  summary: UploadSummary;
  onClose: () => void;
}

export default function UploadSummaryModal({ summary, onClose }: UploadSummaryModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Import Summary</h3>
            <button onClick={onClose}><X className="w-5 h-5"/></button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-black">{summary.successCount}</div>
                <div className="text-xs text-green-800">Success</div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-1" />
                <div className="text-2xl font-black">{summary.failureCount}</div>
                <div className="text-xs text-red-800">Failed</div>
            </div>
        </div>

        {summary.failures.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2">
                <p className="text-xs font-bold text-neutral-500 uppercase">Failure Details</p>
                {summary.failures.map((f, i) => (
                    <div key={i} className="text-[10px] p-2 bg-neutral-100 rounded-md">
                        Item {f.index}: {f.reason}
                    </div>
                ))}
            </div>
        )}

        <button 
            onClick={onClose}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm"
        >
            Dismiss
        </button>
      </div>
    </motion.div>
  );
}
