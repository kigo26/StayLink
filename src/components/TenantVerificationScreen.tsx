import React, { useRef, useState } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function TenantVerificationScreen({ onBack, onComplete }: { onBack: () => void, onComplete: (img: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const img = canvas.toDataURL('image/jpeg');
      setCapturedImage(img);
      setIsCameraActive(false);
      // Stop camera stream
      (videoRef.current.srcObject as MediaStream)?.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full p-4 relative">
        <button onClick={onBack} className="absolute top-4 left-4 z-50 p-2 bg-black/60 text-white rounded-full"><X className="w-5 h-5"/></button>
        <h1 className="text-xl font-black mt-12 mb-6">Identity Verification</h1>
        
        {!capturedImage ? (
            <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="bg-neutral-100 rounded-3xl aspect-video flex-col flex items-center justify-center gap-4 overflow-hidden">
                    {isCameraActive ? (
                        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                    ) : (
                        <Camera className="w-16 h-16 text-neutral-400" />
                    )}
                </div>
                {!isCameraActive ? (
                    <button onClick={startCamera} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Open Camera</button>
                ) : (
                    <button onClick={captureImage} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold">Capture ID</button>
                )}
            </div>
        ) : (
            <div className="flex-1 flex flex-col justify-center gap-4">
                <img src={capturedImage} alt="Captured ID" className="rounded-3xl w-full aspect-video object-cover" />
                <button onClick={() => onComplete(capturedImage)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                    <Check /> Submit for verification
                </button>
                <button onClick={() => setCapturedImage(null)} className="w-full py-4 text-neutral-500 font-bold">Retake</button>
            </div>
        )}
    </div>
  );
}
