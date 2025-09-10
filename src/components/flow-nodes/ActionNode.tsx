import React, { useState } from "react";
import { useReactFlow } from "reactflow";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Settings, Plus, X } from "lucide-react";
import { NodeHeader } from "./NodeHeader";
import { EnhancedHandle } from "./EnhancedHandle";

const actionFields = [
  "custom_fields.issue_category_l1",
  "custom_fields.issue_category_l2",
  "custom_fields.priority",
  "custom_fields.status",
  "custom_fields.assignee",
];

export function ActionNode({
  data,
  id,
}: {
  data: any;
  id: string;
}) {
  const [newValue, setNewValue] = useState("");
  const [newDefaultValue, setNewDefaultValue] = useState("");
  const { setNodes } = useReactFlow();

  const updateField = (field: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, field },
          };
        }
        return node;
      }),
    );
  };

  const updateShow = (show: boolean) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, show },
          };
        }
        return node;
      }),
    );
  };

  const addAllowedValue = () => {
    if (newValue.trim()) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const currentValues = node.data.allowedValues || [];
            return {
              ...node,
              data: {
                ...node.data,
                allowedValues: [
                  ...currentValues,
                  newValue.trim(),
                ],
              },
            };
          }
          return node;
        }),
      );
      setNewValue("");
    }
  };

  const removeAllowedValue = (index: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const currentValues = node.data.allowedValues || [];
          return {
            ...node,
            data: {
              ...node.data,
              allowedValues: currentValues.filter(
                (_: any, i: number) => i !== index,
              ),
            },
          };
        }
        return node;
      }),
    );
  };

  const addDefaultValue = () => {
    if (newDefaultValue.trim()) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const currentDefaults = node.data.defaultValues || [];
            return {
              ...node,
              data: {
                ...node.data,
                defaultValues: [
                  ...currentDefaults,
                  newDefaultValue.trim(),
                ],
              },
            };
          }
          return node;
        }),
      );
      setNewDefaultValue("");
    }
  };

  const removeDefaultValue = (index: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const currentDefaults = node.data.defaultValues || [];
          return {
            ...node,
            data: {
              ...node.data,
              defaultValues: currentDefaults.filter(
                (_: any, i: number) => i !== index,
              ),
            },
          };
        }
        return node;
      }),
    );
  };

  const allowedValues = data.allowedValues || [];
  const defaultValues = data.defaultValues || [];

  return (
    <Card className="card w-[240px] relative">
      <CardContent className="p-3 space-y-2">
        <NodeHeader
          icon={<Settings className="h-4 w-4 text-purple-600" />}
          title="Action"
          nodeType="action"
          nodeId={id}
        />
        {/* Target Field */}
        <div>
          <Label className="text-xs">Target Field</Label>
          <Select value={data.field || ""} onValueChange={updateField}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {actionFields.map((field) => (
                <SelectItem key={field} value={field} className="text-xs">
                  {field.replace('custom_fields.', '')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Show Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id={`show-${id}`}
            checked={data.show !== false}
            onCheckedChange={updateShow}
          />
          <Label htmlFor={`show-${id}`} className="text-xs">
            Show field
          </Label>
        </div>

        {/* Allowed Values */}
        <div>
          <Label className="text-xs">Allowed Values</Label>
          <div className="space-y-1">
            <div className="flex gap-1">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Add value"
                className="h-7 flex-1 text-xs"
                onKeyPress={(e) => e.key === "Enter" && addAllowedValue()}
              />
              <Button size="sm" onClick={addAllowedValue} className="h-7 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {allowedValues.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {allowedValues.slice(0, 3).map((value: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs flex items-center gap-1 badge"
                  >
                    {value.length > 12 ? `${value.slice(0, 12)}...` : value}
                    <X
                      className="h-2 w-2 cursor-pointer hover:text-destructive"
                      onClick={() => removeAllowedValue(index)}
                    />
                  </Badge>
                ))}
                {allowedValues.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{allowedValues.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <EnhancedHandle type="target" position="left" nodeId={id} nodeType="action" />
    </Card>
  );
}