import React, { useEffect, useState } from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';

interface ReactFlowWrapperProps {
  children: React.ReactNode;
}

export function ReactFlowWrapper({ children }: ReactFlowWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side before rendering React Flow
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a loading placeholder or similar during SSR
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      {children}
    </ReactFlowProvider>
  );
}