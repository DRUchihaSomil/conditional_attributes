import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { getDefaultNodeData } from '../ConditionEditor';

interface EnhancedHandleProps {
  type: 'source' | 'target';
  position: 'left' | 'right' | 'top' | 'bottom';
  nodeId: string;
  nodeType: string;
}

export function EnhancedHandle({ type, position, nodeId, nodeType }: EnhancedHandleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { setNodes, setEdges, getNode } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  // Determine the next node type based on current node type
  const getNextNodeType = (currentType: string): string => {
    const flowSequence = {
      'trigger': 'operator',
      'operator': 'value', 
      'value': 'action',
      'logical': 'operator',
      'action': 'trigger' // Can branch to new conditions
    };
    return flowSequence[currentType as keyof typeof flowSequence] || 'trigger';
  };

  const handleMouseEnter = () => {
    if (type === 'source') {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handlePlusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (type === 'source') {
      const sourceNode = getNode(nodeId);
      if (sourceNode) {
        const nextType = getNextNodeType(sourceNode.type || '');
        const newNodeId = `${nextType}-${Date.now()}`;
        
        // Calculate position for new node
        const newPosition = {
          x: sourceNode.position.x + 250, // Standard offset
          y: sourceNode.position.y
        };
        
        const newNode = {
          id: newNodeId,
          type: nextType,
          position: newPosition,
          data: getDefaultNodeData(nextType),
        };

        // Add the new node
        setNodes((nds) => [...nds, newNode]);

        // Create connection between current node and new node
        setEdges((eds) => [
          ...eds,
          {
            id: `${nodeId}-${newNodeId}`,
            source: nodeId,
            target: newNodeId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#64748b', strokeWidth: 2 }
          }
        ]);

        // Update internals for both nodes
        setTimeout(() => {
          updateNodeInternals(nodeId);
          updateNodeInternals(newNodeId);
        }, 0);
      }
    }
    setIsHovered(false);
  };

  return (
    <div
      className={`absolute z-10 ${
        position === 'right' ? 'right-[-8px]' : 
        position === 'left' ? 'left-[-8px]' :
        position === 'top' ? 'top-[-8px]' :
        'bottom-[-8px]'
      } ${
        position === 'right' || position === 'left' ? 'top-1/2 -translate-y-1/2' :
        'left-1/2 -translate-x-1/2'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle
        type={type}
        position={position === 'right' ? Position.Right : 
                 position === 'left' ? Position.Left :
                 position === 'top' ? Position.Top : Position.Bottom}
        className={`!w-3 !h-3 !border-2 !bg-white !transition-all !duration-200 !rounded-full !pointer-events-auto ${
          isHovered && type === 'source' 
            ? '!border-blue-500 !bg-blue-50 !cursor-pointer' 
            : '!border-gray-400 hover:!border-blue-500 hover:!bg-blue-50'
        }`}
        onClick={isHovered && type === 'source' ? handlePlusClick : undefined}
      />
    </div>
  );
}