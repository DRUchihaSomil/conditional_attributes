import React from 'react';
import { useReactFlow } from 'reactflow';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { GitCompare } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { EnhancedHandle } from './EnhancedHandle';

const operators = [
  { value: '==', label: 'Equals (==)' },
  { value: '!=', label: 'Not Equals (!=)' },
  { value: '>', label: 'Greater Than (>)' },
  { value: '<', label: 'Less Than (<)' },
  { value: '>=', label: 'Greater or Equal (>=)' },
  { value: '<=', label: 'Less or Equal (<=)' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
];

export function OperatorNode({ data, id }: { data: any; id: string }) {
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
    <Card className="card w-[160px] relative">
      <CardContent className="p-3 space-y-2">
        <NodeHeader
          icon={<GitCompare className="h-4 w-4 text-green-600" />}
          title="Operator"
          nodeType="operator"
          nodeId={id}
        />
        <Select value={data.operator || ''} onValueChange={updateNodeData}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value} className="text-xs">
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <EnhancedHandle type="target" position="left" nodeId={id} nodeType="operator" />
      <EnhancedHandle type="source" position="right" nodeId={id} nodeType="operator" />
    </Card>
  );
}