import React from 'react';
import { useReactFlow } from 'reactflow';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { GitBranch } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { EnhancedHandle } from './EnhancedHandle';

const logicalOperators = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
];

export function LogicalNode({ data, id }: { data: any; id: string }) {
  const { setNodes } = useReactFlow();

  const updateNodeData = (operator: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, operator },
          };
        }
        return node;
      })
    );
  };

  return (
    <Card className="card w-[120px] relative">
      <CardContent className="p-3 space-y-2">
        <NodeHeader
          icon={<GitBranch className="h-4 w-4 text-indigo-600" />}
          title="Logic"
          nodeType="logical"
          nodeId={id}
        />
        <Select value={data.operator || 'AND'} onValueChange={updateNodeData}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select logic" />
          </SelectTrigger>
          <SelectContent>
            {logicalOperators.map((op) => (
              <SelectItem key={op.value} value={op.value} className="text-xs">
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <EnhancedHandle type="target" position="left" nodeId={id} nodeType="logical" />
      <EnhancedHandle type="source" position="right" nodeId={id} nodeType="logical" />
    </Card>
  );
}