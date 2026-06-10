import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface DashboardEmptyStateProps {
  onAction: () => void;
  actionText: string;
  message: string;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ onAction, actionText, message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#0f172a] border border-blue-900/50 rounded-2xl text-center shadow-2xl">
      <div className="bg-blue-500/10 p-4 rounded-full mb-6">
        <LayoutGrid className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-white text-2xl font-bold mb-3">Your dashboard is feeling quiet</h2>
      <p className="text-slate-400 mb-8 max-w-md text-lg">
        {message}
      </p>
      <button 
        onClick={onAction}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
      >
        {actionText}
      </button>
    </div>
  );
};
