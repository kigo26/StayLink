import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): any {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error(`Uncaught error in ${(this as any).props.name || 'Component'}:`, error, errorInfo);
  }

  public render(): any {
    if ((this as any).state.hasError) {
      if ((this as any).props.fallback) {
        return (this as any).props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 bg-red-50/50 rounded-2.5xl border border-red-100 min-h-[200px] w-full">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 shadow-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full blur-md"></div>
            <AlertCircle className="w-6 h-6 relative z-10" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-red-900 uppercase tracking-widest">
              {(this as any).props.name ? `Connection Error: ${(this as any).props.name}` : 'Connection Interrupted'}
            </h3>
            <p className="text-[11px] text-red-600/80 mt-1 max-w-xs font-medium">
              {(this as any).state.error?.message || "Data stream disconnected. Please verify your connection or attempt to resync."}
            </p>
          </div>
          <button
            onClick={() => {
              (this as any).setState({ hasError: false });
              if ((this as any).props.onRetry) {
                (this as any).props.onRetry();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-xl text-[11px] font-bold text-red-700 hover:bg-red-50 transition-colors shadow-sm cursor-pointer uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Resync Connection
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
