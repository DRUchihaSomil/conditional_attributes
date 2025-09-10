import React from 'react';
import { useReactFlow } from 'reactflow';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Hash } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { EnhancedHandle } from './EnhancedHandle';

export function ValueNode({ data, id }: { data: any; id: string }) {
  const { setNodes } = useReactFlow();

  const updateNodeData = (value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, value },
          };
        }
        return node;
      })
    );
  };

  return (
    <Card className="card w-[180px] relative">
      <CardContent className="p-3 space-y-2">
        <NodeHeader
          icon={<Hash className="h-4 w-4 text-orange-600" />}
          title="Value"
          nodeType="value"
          nodeId={id}
        />
        <Input
          value={data.value || ''}
          onChange={(e) => updateNodeData(e.target.value)}
          placeholder="Enter value"
          className="h-8 text-xs"
        />
      </CardContent>
      <EnhancedHandle type="target" position="left" nodeId={id} nodeType="value" />
      <EnhancedHandle type="source" position="right" nodeId={id} nodeType="value" />
    </Card>
  );
}