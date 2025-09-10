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
import { getFieldOptions, hasPredefinedOptions } from "../../data/fieldOptions";

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
  const [searchTerm, setSearchTerm] = useState("");
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

  const addAllowedValue = (value?: string) => {
    const valueToAdd = value || newValue.trim();
    if (valueToAdd) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const currentValues = node.data.allowedValues || [];
            if (!currentValues.includes(valueToAdd)) {
              return {
                ...node,
                data: {
                  ...node.data,
                  allowedValues: [
                    ...currentValues,
                    valueToAdd,
                  ],
                },
              };
            }
          }
          return node;
        }),
      );
      if (!value) {
        setNewValue("");
      }
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
            {hasPredefinedOptions(data.field || '') ? (
              <Select onOpenChange={(open) => {
                if (!open) {
                  setSearchTerm('');
                }
              }}>
                <SelectTrigger className="h-8 text-xs">
                  <span className="text-xs">
                    {allowedValues.length === 1 
                      ? allowedValues[0]
                      : `${allowedValues.length} options`
                    }
                  </span>
                </SelectTrigger>
                <SelectContent className="w-[360px] max-w-[360px]">
                  <div className="p-3 border-b">
                    <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto">
                      {allowedValues.map((value: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs flex items-center gap-1 badge max-w-[150px] group"
                        >
                          <span className="truncate">{value}</span>
                          <button
                            type="button"
                            className="h-2 w-2 cursor-pointer hover:text-destructive flex-shrink-0 p-0 bg-transparent border-0 rounded-sm hover:bg-red-100"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeAllowedValue(index);
                            }}
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Search options..."
                      className="w-full h-7 text-xs"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {(() => {
                      const fieldOptions = getFieldOptions(data.field || '');
                      if (fieldOptions.length === 0) {
                        return (
                          <div className="px-2 py-1.5 text-xs text-gray-500">
                            No predefined options available for this field
                          </div>
                        );
                      }
                      
                      return fieldOptions
                        .filter(option => 
                          option.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((option) => {
                          const isSelected = allowedValues.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              className="w-full flex items-center justify-between px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 text-left"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isSelected) {
                                  const index = allowedValues.indexOf(option);
                                  removeAllowedValue(index);
                                } else {
                                  addAllowedValue(option);
                                }
                              }}
                            >
                              <span className="truncate">{option}</span>
                              {isSelected && (
                                <span className="text-green-500 text-xs flex-shrink-0">✓</span>
                              )}
                            </button>
                          );
                        });
                    })()}
                  </div>
                </SelectContent>
              </Select>
            ) : (
              <div className="text-xs text-gray-500">
                No predefined options available for this field
              </div>
            )}
          </div>
        </div>

        {/* Default Values */}
        <div>
          <Label className="text-xs">Default Values</Label>
          <div className="space-y-1">
            <Select
              value={defaultValues[0] || '__none__'}
              onValueChange={(value) => {
                setNodes((nds) =>
                  nds.map((node) => {
                    if (node.id === id) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          defaultValues: value === '__none__' ? [] : [value],
                        },
                      };
                    }
                    return node;
                  }),
                );
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="none">
                  {defaultValues[0] || 'none'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">none</SelectItem>
                {allowedValues.map((value) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional/Mandatory Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id={`optional-${id}`}
            checked={data.optional !== false}
            onCheckedChange={(checked) => {
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === id) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        optional: checked,
                      },
                    };
                  }
                  return node;
                }),
              );
            }}
          />
          <Label htmlFor={`optional-${id}`} className="text-xs">
            {data.optional !== false ? 'Optional' : 'Mandatory'}
          </Label>
        </div>
      </CardContent>
      <EnhancedHandle type="target" position="left" nodeId={id} nodeType="action" />
    </Card>
  );
}