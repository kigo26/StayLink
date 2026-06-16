import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function PropertyDocumentUpload({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    setLoading(true);
    setSuccess(false);
    setFileName(file.name);

    // Upload
    setTimeout(async () => {
        // Mock categorization
        try {
            const resp = await fetch('/api/categorize-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name })
            });
            const data = await resp.json();
            setCategory(data.category);
        } catch (e) {
            console.error('Categorization failed', e);
        }
        setLoading(false);
        setSuccess(true);
    }, 1500);
  };

  return (
    <div className="p-4 bg-slate-800 rounded-xl space-y-2 border border-slate-700">
      <h4 className="text-xs font-semibold text-slate-400">Upload Documents</h4>
      <input type="file" id={`doc-upload-${propertyId}`} className="hidden" onChange={handleFile} accept=".pdf,.doc,.docx" />
      <label htmlFor={`doc-upload-${propertyId}`} className="cursor-pointer block border border-dashed border-slate-600 rounded-lg p-3 text-center">
        {loading ? (
           <p className="text-xs text-blue-400">Uploading...</p>
        ) : success ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-16 bg-slate-900 border border-slate-700 rounded flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-xs text-slate-300 truncate max-w-[100px]">{fileName}</p>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={12} />
              <p className="text-[10px]">Uploaded</p>
            </div>
            {category && (
                <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">{category}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-5 h-5 text-slate-400" />
            <p className="text-xs font-semibold text-slate-300">Lease/Deed PDF</p>
          </div>
        )}
      </label>
    </div>
  );
}
