import React, { useState, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import { ChevronDown, Zap, GitCompare, Hash, Settings, GitBranch } from 'lucide-react';
import { getDefaultNodeData } from '../ConditionEditor';

interface NodeTypeDropdownProps {
  currentType: string;
  currentTitle: string;
  nodeId: string;
  isHovered: boolean;
}

const nodeTypeOptions = [
  { type: 'trigger', title: 'If', icon: Zap, color: 'text-blue-600' },
  { type: 'operator', title: 'Operator', icon: GitCompare, color: 'text-green-600' },
  { type: 'value', title: 'Value', icon: Hash, color: 'text-orange-600' },
  { type: 'action', title: 'Action', icon: Settings, color: 'text-purple-600' },
  { type: 'logical', title: 'Logic', icon: GitBranch, color: 'text-indigo-600' },
];

export function NodeTypeDropdown({ currentType, currentTitle, nodeId, isHovered }: NodeTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setNodes } = useReactFlow();

  const handleTypeChange = (newType: string) => {
    if (newType !== currentType) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              type: newType,
              data: getDefaultNodeData(newType), // Reset data for new type
            };
          }
          return node;
        })
      );
    }
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout to close the dropdown
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    // Clear any pending close timeout when entering dropdown
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    // Close immediately when leaving dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors duration-200"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="font-medium text-sm">{currentTitle}</span>
        {isHovered && <ChevronDown className="h-3 w-3 text-gray-500" />}
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 min-w-[140px] node-type-dropdown"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          {nodeTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.type}
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                  option.type === currentType ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => handleTypeChange(option.type)}
              >
                <Icon className={`h-4 w-4 ${option.color}`} />
                <span>{option.title}</span>
                {option.type === currentType && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}