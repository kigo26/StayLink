import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSystemRecoveryOptions {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  baseDelayMs?: number;
}

export function useSystemRecovery({ 
  onRetry, 
  maxRetries = 5, 
  baseDelayMs = 2000 
}: UseSystemRecoveryOptions) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const attemptRecovery = useCallback(async (currentRetry: number) => {
    if (currentRetry >= maxRetries) {
      setIsRecovering(false);
      return; 
    }

    const delay = baseDelayMs * Math.pow(2, currentRetry);
    
    timerRef.current = setTimeout(async () => {
      try {
        await onRetry();
        setIsRecovering(false);
        setRetryCount(0);
        setError(null);
      } catch (err: any) {
        if (err?.message?.toLowerCase().includes('disconnected') || err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('stream')) {
           setRetryCount(currentRetry + 1);
        } else {
           // Not a streaming error, stop recovering
           setIsRecovering(false);
           setError(err);
        }
      }
    }, delay);
  }, [onRetry, maxRetries, baseDelayMs]);

  useEffect(() => {
    if (isRecovering) {
      attemptRecovery(retryCount);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRecovering, retryCount, attemptRecovery]);

  const triggerRecovery = useCallback((err?: Error) => {
    setError(err || new Error("Streaming disconnected"));
    setIsRecovering(true);
    setRetryCount(0);
  }, []);

  return {
    isRecovering,
    retryCount,
    error,
    triggerRecovery,
    maxRetries
  };
}
