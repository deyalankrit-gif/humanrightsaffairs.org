
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In a real dev environment, this triggers the Next.js error overlay
      // For now, we show a destructive toast for visibility
      toast({
        variant: "destructive",
        title: "Security Rule Denied",
        description: error.message || "You don't have permission to perform this action.",
      });
      
      // We throw the error so it can be caught by the development overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}
