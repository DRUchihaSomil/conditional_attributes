import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Edit, Plus, Activity, Search, Filter } from 'lucide-react';
import { Condition } from '../types/condition';

interface ConditionDashboardProps {
  conditions: Condition[];
  onCreateCondition: () => void;
  onEditCondition: (condition: Condition) => void;
  onDeleteCondition: (id: string) => void;
}

// Helper function to parse condition expressions
function parseExpression(expression: string) {
  // Handle simple expressions like "field == 'value'"
  const simpleMatch = expression.match(/([^=!<>]+)\s*(==|!=|>|<|>=|<=)\s*'([^']+)'/);
  if (simpleMatch) {
    return {
      field: simpleMatch[1].trim(),
      operator: simpleMatch[2],
      value: simpleMatch[3]
    };
  }
  
  // Handle complex expressions with AND/OR
  const complexMatch = expression.match(/\(\s*([^=!<>]+)\s*(==|!=|>|<|>=|<=)\s*'([^']+)'\s*\)\s*&&\s*\(\s*([^=!<>]+)\s*(==|!=|>|<|>=|<=)\s*'([^']+)'\s*\)/);
  if (complexMatch) {
    return {
      field: `${complexMatch[1].trim()} AND ${complexMatch[4].trim()}`,
      operator: `${complexMatch[2]} AND ${complexMatch[5]}`,
      value: `${complexMatch[3]} AND ${complexMatch[6]}`
    };
  }

  // Fallback for other patterns
  if (expression.includes('applies_to_part')) {
    const match = expression.match(/applies_to_part\s*==\s*'([^']+)'/);
    return {
      field: 'applies_to_part',
      operator: '==',
      value: match ? match[1].split('/').pop() || match[1] : 'unknown'
    };
  }

  return {
    field: 'Unknown',
    operator: '==',
    value: 'Unknown'
  };
}

export function ConditionDashboard({
  conditions,
  onCreateCondition,
  onEditCondition,
  onDeleteCondition
}: ConditionDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ifFieldFilter, setIfFieldFilter] = useState('all');
  const [targetFieldFilter, setTargetFieldFilter] = useState('all');

  // Parse conditions and create filter options
  const parsedConditions = useMemo(() => {
    return conditions.map(condition => ({
      ...condition,
      parsed: parseExpression(condition.expression)
    }));
  }, [conditions]);

  // Get unique filter options
  const ifFieldOptions = useMemo(() => {
    const fields = new Set(parsedConditions.map(c => c.parsed?.field).filter(Boolean));
    return Array.from(fields).sort();
  }, [parsedConditions]);

  const targetFieldOptions = useMemo(() => {
    const fields = new Set(parsedConditions.flatMap(c => c.effects.flatMap(e => e.fields)));
    return Array.from(fields).sort();
  }, [parsedConditions]);

  // Filter conditions
  const filteredConditions = useMemo(() => {
    return parsedConditions.filter(condition => {
      const matchesSearch = condition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          condition.parsed?.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          condition.parsed?.value.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIfField = ifFieldFilter === 'all' || condition.parsed?.field === ifFieldFilter;
      
      const matchesTargetField = targetFieldFilter === 'all' || 
                                condition.effects.some(e => e.fields.includes(targetFieldFilter));

      return matchesSearch && matchesIfField && matchesTargetField;
    });
  }, [parsedConditions, searchQuery, ifFieldFilter, targetFieldFilter]);

  return (
    <div className="h-full p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Condition Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and configure conditional rules for your application
            </p>
          </div>
          <Button onClick={onCreateCondition} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Condition
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={ifFieldFilter} onValueChange={setIfFieldFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="If Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All If Fields</SelectItem>
                {ifFieldOptions.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetFieldFilter} onValueChange={setTargetFieldFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Target Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Target Fields</SelectItem>
                {targetFieldOptions.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conditions</p>
                  <p className="text-2xl font-bold">{filteredConditions.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Effects</p>
                  <p className="text-2xl font-bold">
                    {filteredConditions.reduce((acc, c) => acc + c.effects.length, 0)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Fields</p>
                  <p className="text-2xl font-bold">
                    {new Set(filteredConditions.flatMap(c => c.effects.flatMap(e => e.fields))).size}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conditions List */}
        <div className="space-y-4">
          {filteredConditions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3>No conditions found</h3>
                <p className="text-muted-foreground mb-4">
                  {conditions.length === 0 
                    ? "Get started by creating your first condition"
                    : "Try adjusting your search or filters"
                  }
                </p>
                {conditions.length === 0 && (
                  <Button onClick={onCreateCondition}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Condition
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredConditions.map((condition) => (
              <Card key={condition.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-3">{condition.name}</CardTitle>
                      <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                        <span className="font-medium">{condition.parsed?.field || 'Unknown'}</span>
                        <span className="mx-2 text-primary font-mono">{condition.parsed?.operator || '=='}</span>
                        <span className="font-medium">'{condition.parsed?.value || 'Unknown'}'</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditCondition(condition)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteCondition(condition.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {condition.effects.map((effect, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">Effect {index + 1}</p>
                          <Badge variant={effect.show ? "default" : "secondary"}>
                            {effect.show ? "Visible" : "Hidden"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Target Fields:</p>
                            <div className="flex flex-wrap gap-1">
                              {effect.fields.map((field, fieldIndex) => (
                                <Badge key={fieldIndex} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Allowed Values ({effect.allowed_values.length}):
                            </p>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                              {effect.allowed_values.slice(0, 4).map((value, valueIndex) => (
                                <Badge key={valueIndex} variant="secondary" className="text-xs">
                                  {value}
                                </Badge>
                              ))}
                              {effect.allowed_values.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{effect.allowed_values.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}