/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function PropertyUpload({ onUploadComplete }: { onUploadComplete: (summary: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setLoading(true);
    setProgress(0);
    setSuccess(false);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 200);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-property', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        onUploadComplete(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border border-dashed border-neutral-300 rounded-xl space-y-2 text-center">
      <input type="file" id="file-upload" className="hidden" onChange={handleFile} accept=".pdf,.doc,.docx,.xlsx,.csv" />
      <label htmlFor="file-upload" className="cursor-pointer block">
        {loading ? (
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-600">Processing File...</p>
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-1 text-green-600">
            <CheckCircle />
            <p className="text-xs">File parsed successfully!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-neutral-400" />
            <p className="text-xs font-bold">Upload Property Listing File</p>
            <p className="text-[10px] text-neutral-500">PDF, Excel, CSV, Word</p>
          </div>
        )}
      </label>
    </div>
  );
}
