import React from 'react';
import { useReactFlow } from 'reactflow';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Zap } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { EnhancedHandle } from './EnhancedHandle';

const triggerFields = [
  'applies_to_part',
  'custom_fields.issue_category_l1',
  'custom_fields.issue_category_l2',
  'user.role',
  'ticket.priority',
  'ticket.status',
];

export function TriggerNode({ data, id }: { data: any; id: string }) {
  const { setNodes } = useReactFlow();

  const updateNodeData = (field: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, field },
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
          icon={<Zap className="h-4 w-4 text-blue-600" />}
          title="If"
          nodeType="trigger"
          nodeId={id}
        />
        <Select value={data.field || ''} onValueChange={updateNodeData}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {triggerFields.map((field) => (
              <SelectItem key={field} value={field} className="text-xs">
                {field.replace('custom_fields.', '').replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <EnhancedHandle type="source" position="right" nodeId={id} nodeType="trigger" />
    </Card>
  );
}