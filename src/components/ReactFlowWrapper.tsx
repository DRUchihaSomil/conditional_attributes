import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

interface ReactFlowWrapperProps {
  children: React.ReactNode;
}

export function ReactFlowWrapper({ children }: ReactFlowWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side before rendering React Flow
    setIsClient(true);
    
    // Additional delay to ensure all styles are loaded
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 200);

    return () => clearTimeout(readyTimer);
  }, []);

  if (!isClient || !isReady) {
    // Return a loading placeholder during initialization
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-muted-foreground">Loading condition editor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      {children}
    </ReactFlowProvider>
  );
}