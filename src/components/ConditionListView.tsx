import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { Condition } from '../types/condition';

interface ConditionListViewProps {
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

// Helper function to get operator label
function getOperatorLabel(operator: string): string {
  const operatorMap: { [key: string]: string } = {
    '==': 'is equal to',
    '!=': 'is not equal to',
    '>': 'is greater than',
    '<': 'is less than',
    '>=': 'is greater than or equal to',
    '<=': 'is less than or equal to'
  };
  return operatorMap[operator] || operator;
}

// Helper function to get field label
function getFieldLabel(field: string): string {
  const fieldMap: { [key: string]: string } = {
    'applies_to_part': 'applies to part',
    'custom_fields.issue_category_l1': 'issue category l1',
    'custom_fields.issue_category_l2': 'issue category l2',
    'custom_fields.issue_category_l3': 'issue category l3',
    'user.role': 'user role',
    'custom_fields.priority': 'priority',
    'custom_fields.status': 'status',
    'custom_fields.category': 'category',
    'custom_fields.department': 'department'
  };
  return fieldMap[field] || field;
}

export function ConditionListView({
  conditions,
  onCreateCondition,
  onEditCondition,
  onDeleteCondition
}: ConditionListViewProps) {
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

  const handleCardClick = (condition: Condition) => {
    onEditCondition(condition);
  };

  const handleDeleteClick = (e: React.MouseEvent, conditionId: string) => {
    e.stopPropagation();
    onDeleteCondition(conditionId);
  };

  return (
    <div className="h-full bg-background">
      <div className="flex h-full">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold">If Conditions</h1>
              </div>
              <Button 
                onClick={onCreateCondition} 
                className="flex items-center gap-2 bg-bblack text-white hover:bg-black/10 shadow-md border-0"
                style={{ backgroundColor: '#000000', color: 'white' }}
              >
                <Plus className="h-4 w-4" />
                Add Condition
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

            {/* Conditions List */}
            <div className="space-y-3">
              {filteredConditions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
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
                  <Card 
                    key={condition.id} 
                    className="hover:shadow-md transition-all duration-200 cursor-pointer group relative"
                    onClick={() => handleCardClick(condition)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Status Badge */}
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-2 py-1 text-xs">
                              Active
                            </Badge>
                          </div>

                          {/* Condition Name */}
                          <h3 className="font-medium text-base mb-3">{condition.name}</h3>

                          {/* If Statement */}
                          <div className="text-sm text-gray-400 mb-2">
                            <span className="font-semibold text-gray-700">If</span>{' '}
                            <span className="text-gray-400">{getFieldLabel(condition.parsed?.field || '')}</span>{' '}
                            <span className="text-gray-400">{getOperatorLabel(condition.parsed?.operator || '==')}</span>{' '}
                            <span className="text-gray-400">{condition.parsed?.value || ''}</span>
                          </div>

                          {/* Then Statement */}
                          <div className="text-sm text-gray-400 mb-3">
                            <span className="font-semibold text-gray-700">Then</span>{' '}
                            {condition.effects.map((effect, index) => (
                              <span key={index}>
                                {effect.show ? 'Sets' : 'Hides'}{' '}
                                <span className="text-gray-400">{effect.allowed_values.length}</span>{' '}
                                allowed values for{' '}
                                <span className="text-gray-400">
                                  {effect.fields.map(field => getFieldLabel(field)).join(', ')}
                                </span>
                                {index < condition.effects.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons - Only show on hover */}
                        <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, condition.id)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Placeholder for now */}
      
      </div>
    </div>
  );
}
