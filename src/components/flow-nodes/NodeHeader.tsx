import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { NodeTypeDropdown } from './NodeTypeDropdown';

interface NodeHeaderProps {
  icon: React.ReactNode;
  title: string;
  nodeType: string;
  nodeId: string;
  className?: string;
}

export function NodeHeader({ icon, title, nodeType, nodeId, className = "" }: NodeHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`flex items-center gap-2 text-xs font-medium ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left side: Icon that becomes drag handle on hover */}
      {isHovered ? (
        <GripVertical className="h-3 w-3 text-gray-600 cursor-move" />
      ) : (
        <div className="flex-shrink-0">{icon}</div>
      )}
      
      {/* Right side: Text with dropdown functionality */}
      <NodeTypeDropdown
        currentType={nodeType}
        currentTitle={title}
        nodeId={nodeId}
        isHovered={isHovered}
      />
    </div>
  );
}