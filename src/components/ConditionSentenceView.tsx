import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Plus, Trash2, X } from 'lucide-react';
import { Condition, Effect } from '../types/condition';

interface SentenceCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalConnector?: 'AND' | 'OR';
}

interface ConditionSentenceViewProps {
  condition: Condition | null;
  onConditionChange: (condition: Condition) => void;
}

const OPERATORS = [
  { value: '==', label: 'is equal to' },
  { value: '!=', label: 'is not equal to' },
  { value: '>', label: 'is greater than' },
  { value: '<', label: 'is less than' },
  { value: '>=', label: 'is greater than or equal to' },
  { value: '<=', label: 'is less than or equal to' },
];

const COMMON_FIELDS = [
  { value: 'applies_to_part', label: 'applies to part' },
  { value: 'custom_fields.issue_category_l1', label: 'issue category L1' },
  { value: 'custom_fields.issue_category_l2', label: 'issue category L2' },
  { value: 'custom_fields.issue_category_l3', label: 'issue category L3' },
  { value: 'user.role', label: 'user role' },
  { value: 'custom_fields.priority', label: 'priority' },
  { value: 'custom_fields.status', label: 'status' },
  { value: 'custom_fields.category', label: 'category' },
  { value: 'custom_fields.department', label: 'department' },
];

const TARGET_FIELDS = [
  { value: 'custom_fields.issue_category_l1', label: 'issue category L1' },
  { value: 'custom_fields.issue_category_l2', label: 'issue category L2' },
  { value: 'custom_fields.issue_category_l3', label: 'issue category L3' },
  { value: 'custom_fields.priority', label: 'priority' },
  { value: 'custom_fields.status', label: 'status' },
  { value: 'custom_fields.department', label: 'department' },
];

export function ConditionSentenceView({ condition, onConditionChange }: ConditionSentenceViewProps) {
  const [sentences, setSentences] = useState<SentenceCondition[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const lastConditionRef = useRef<Condition | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize only when condition actually changes (prevent loops)
  useEffect(() => {
    // Only update if condition actually changed (deep comparison on key properties)
    const conditionChanged = 
      lastConditionRef.current?.id !== condition?.id ||
      lastConditionRef.current?.expression !== condition?.expression;

    if (conditionChanged) {
      lastConditionRef.current = condition;
      
      if (condition && condition.expression) {
        // Parse existing condition
        const parsed = parseConditionToSentences(condition.expression);
        setSentences(parsed);
        setEffects(condition.effects || []);
      } else {
        // Create default empty sentence for new conditions
        setSentences([createEmptySentence()]);
        setEffects([createDefaultEffect()]);
      }
    }
  }, [condition?.id, condition?.expression]);

  // Debounced update function
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const expression = generateExpressionFromSentences(sentences);
      
      // Only update if we have valid content or if editing existing condition
      if (expression || condition) {
        const updatedCondition: Condition = {
          id: condition?.id || Date.now().toString(),
          name: condition?.name || 'Untitled',
          expression: expression || '',
          effects,
          expression_ast: []
        };
        
        // Only call onConditionChange if something actually changed
        if (
          !lastConditionRef.current ||
          lastConditionRef.current.expression !== updatedCondition.expression ||
          JSON.stringify(lastConditionRef.current.effects) !== JSON.stringify(updatedCondition.effects)
        ) {
          onConditionChange(updatedCondition);
        }
      }
    }, 500);
  }, [sentences, effects, condition, onConditionChange]);

  // Update parent when sentences or effects change
  useEffect(() => {
    debouncedUpdate();
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [debouncedUpdate]);

  const createEmptySentence = (): SentenceCondition => ({
    id: `sentence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    field: '',
    operator: '==',
    value: '',
  });

  const createDefaultEffect = (): Effect => ({
    allowed_values: [],
    fields: ['custom_fields.issue_category_l1'],
    show: true,
    default_values: [],
    mandatory: false,
  });

  const addSentence = () => {
    const newSentence = createEmptySentence();
    if (sentences.length > 0) {
      newSentence.logicalConnector = 'AND';
    }
    setSentences(prev => [...prev, newSentence]);
  };

  const removeSentence = (id: string) => {
    setSentences(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length > 0 && filtered[0].logicalConnector) {
        filtered[0] = { ...filtered[0], logicalConnector: undefined };
      }
      return filtered;
    });
  };

  const updateSentence = (id: string, updates: Partial<SentenceCondition>) => {
    setSentences(prev => 
      prev.map(sentence => 
        sentence.id === id ? { ...sentence, ...updates } : sentence
      )
    );
  };

  const addEffect = () => {
    setEffects(prev => [...prev, createDefaultEffect()]);
  };

  const removeEffect = (index: number) => {
    setEffects(prev => prev.filter((_, i) => i !== index));
  };

  const updateEffect = (index: number, updates: Partial<Effect>) => {
    setEffects(prev => 
      prev.map((effect, i) => 
        i === index ? { ...effect, ...updates } : effect
      )
    );
  };

  const addAllowedValue = (effectIndex: number, value: string) => {
    if (!value.trim()) return;
    
    updateEffect(effectIndex, {
      allowed_values: [...(effects[effectIndex].allowed_values || []), value.trim()]
    });
  };

  const removeAllowedValue = (effectIndex: number, valueIndex: number) => {
    const effect = effects[effectIndex];
    const newValues = [...(effect.allowed_values || [])];
    newValues.splice(valueIndex, 1);
    updateEffect(effectIndex, { allowed_values: newValues });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Condition Sentences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sentences.map((sentence, index) => (
            <div key={sentence.id} className="space-y-3 p-4 border border-gray-200 rounded-lg">
              {/* Logical Connector */}
              {sentence.logicalConnector && (
                <div className="flex items-center gap-2 mb-2">
                  <Select
                    value={sentence.logicalConnector}
                    onValueChange={(value: 'AND' | 'OR') => 
                      updateSentence(sentence.id, { logicalConnector: value })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Fill-in-the-blank Sentence */}
              <div className="flex items-center text-lg leading-relaxed whitespace-nowrap overflow-x-auto">
                {sentence.logicalConnector && (
                  <>
                    <div className="mx-2">
                      <Select
                        value={sentence.logicalConnector}
                        onValueChange={(value: 'AND' | 'OR') => 
                          updateSentence(sentence.id, { logicalConnector: value })
                        }
                      >
                        <SelectTrigger className="inline-flex h-auto px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto [&>svg]:w-3 [&>svg]:h-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-gray-500">then</span>
                  </>
                )}

                <span className="text-gray-500">If</span>

                <div className="mx-2">
                  <Select
                    value={sentence.field}
                    onValueChange={(value) => updateSentence(sentence.id, { field: value })}
                  >
                    <SelectTrigger className="inline-flex h-auto px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto [&>svg]:w-3 [&>svg]:h-3">
                      <SelectValue placeholder="field" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mx-2">
                  <Select
                    value={sentence.operator}
                    onValueChange={(value) => updateSentence(sentence.id, { operator: value })}
                  >
                    <SelectTrigger className="inline-flex h-auto px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto [&>svg]:w-3 [&>svg]:h-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mx-2">
                  <Input
                    value={sentence.value}
                    onChange={(e) => updateSentence(sentence.id, { value: e.target.value })}
                    placeholder="value"
                    className="inline-flex h-auto px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto"
                  />
                </div>

                {sentences.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSentence(sentence.id)}
                    className="ml-2 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button 
            variant="outline" 
            onClick={addSentence}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </CardContent>
      </Card>

      {/* Effects Section */}
      <Card>
        <CardHeader>
          <CardTitle>Then Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {effects.map((effect, effectIndex) => (
            <div key={effectIndex} className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-lg leading-relaxed whitespace-nowrap overflow-x-auto">
                  <span className="text-gray-500">Then set</span>
                  <div className="mx-2">
                    <Select
                      value={effect.fields[0] || ''}
                      onValueChange={(value) => updateEffect(effectIndex, { fields: [value] })}
                    >
                      <SelectTrigger className="inline-flex h-auto px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto [&>svg]:w-3 [&>svg]:h-3">
                        <SelectValue placeholder="field" />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="mx-2 inline-flex items-center gap-1 px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500">
                    <Switch
                      checked={effect.show !== false}
                      onCheckedChange={(checked) => updateEffect(effectIndex, { show: checked })}
                      className="scale-75"
                    />
                    <span className="text-lg">{effect.show !== false ? 'show' : 'hidden'}</span>
                  </div>
                  <span className="text-gray-500">as</span>
                  <div className="mx-2 inline-flex items-center gap-1 px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500">
                    <Switch
                      checked={effect.optional !== false}
                      onCheckedChange={(checked) => updateEffect(effectIndex, { optional: checked } as Partial<Effect>)}
                      className="scale-75"
                    />
                    <span className="text-lg">{effect.optional !== false ? 'optional' : 'required'}</span>
                  </div>
                  <span className="text-gray-500">with allowed options</span>
                </div>
                {effects.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEffect(effectIndex)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-lg leading-relaxed">
                  <span className="text-gray-500">and allowed options:</span>
                  <div className="mx-2">
                    {effect.allowed_values && effect.allowed_values.length > 0 ? (
                      <Select>
                        <SelectTrigger className="inline-flex h-auto px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto [&>svg]:w-3 [&>svg]:h-3">
                          <SelectValue>
                            {effect.allowed_values.length === 1 
                              ? effect.allowed_values[0]
                              : `${effect.allowed_values.length} options`
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {effect.allowed_values.map((value, valueIndex) => (
                            <SelectItem key={valueIndex} value={value} className="flex items-center justify-between">
                              <span>{value}</span>
                              <X 
                                className="h-3 w-3 cursor-pointer hover:text-red-500 ml-2" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAllowedValue(effectIndex, valueIndex);
                                }}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-400 text-lg">none</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Input
                    placeholder="Add allowed value"
                    className="h-auto px-0 py-0 text-lg border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addAllowedValue(effectIndex, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-lg"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addAllowedValue(effectIndex, input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex items-center text-lg leading-relaxed ml-4">
                  <span className="text-gray-500">and default values:</span>
                  <div className="mx-2">
                    {effect.default_values && effect.default_values.length > 0 ? (
                      <Select>
                        <SelectTrigger className="inline-flex h-auto px-0 py-0 text-lg font-normal border-0 border-b border-gray-300 bg-transparent rounded-none hover:border-gray-500 focus:ring-0 focus:border-gray-700 w-auto [&>svg]:w-3 [&>svg]:h-3">
                          <SelectValue>
                            {effect.default_values.length === 1 
                              ? effect.default_values[0]
                              : `${effect.default_values.length} options`
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {effect.default_values.map((value, valueIndex) => (
                            <SelectItem key={valueIndex} value={value} className="flex items-center justify-between">
                              <span>{value}</span>
                              <X 
                                className="h-3 w-3 cursor-pointer hover:text-red-500 ml-2" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newValues = [...(effect.default_values || [])];
                                  newValues.splice(valueIndex, 1);
                                  updateEffect(effectIndex, { default_values: newValues });
                                }}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-400 text-lg">none</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addEffect} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function parseConditionToSentences(expression: string): SentenceCondition[] {
  if (!expression) return [createEmptySentenceStatic()];

  if (expression.includes(' AND ') || expression.includes(' OR ')) {
    const sentences: SentenceCondition[] = [];
    const parts = expression.split(/\s+(AND|OR)\s+/);
    
    for (let i = 0; i < parts.length; i += 2) {
      const part = parts[i].trim();
      const connector = i > 0 ? parts[i - 1] as 'AND' | 'OR' : undefined;
      
      const match = part.replace(/[()]/g, '').match(/(.+?)\s*(==|!=|>|<|>=|<=)\s*(.+)/);
      if (match) {
        const [, field, operator, value] = match;
        sentences.push({
          id: `sentence_${Date.now()}_${i}`,
          field: field.trim(),
          operator: operator.trim(),
          value: value.trim().replace(/['\"]/g, ''),
          logicalConnector: connector,
        });
      }
    }
    
    return sentences.length > 0 ? sentences : [createEmptySentenceStatic()];
  }

  const match = expression.match(/(.+?)\s*(==|!=|>|<|>=|<=)\s*(.+)/);
  if (match) {
    const [, field, operator, value] = match;
    return [{
      id: `sentence_${Date.now()}`,
      field: field.trim(),
      operator: operator.trim(),
      value: value.trim().replace(/['\"]/g, ''),
    }];
  }

  return [createEmptySentenceStatic()];
}

function createEmptySentenceStatic(): SentenceCondition {
  return {
    id: `sentence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    field: '',
    operator: '==',
    value: '',
  };
}

function generateExpressionFromSentences(sentences: SentenceCondition[]): string {
  const validSentences = sentences.filter(s => s.field && s.operator && s.value);
  
  if (validSentences.length === 0) return '';
  
  if (validSentences.length === 1) {
    const sentence = validSentences[0];
    const quotedValue = /[\s']/.test(sentence.value) ? `'${sentence.value}'` : sentence.value;
    return `${sentence.field} ${sentence.operator} ${quotedValue}`;
  }
  
  const expressions = validSentences.map(sentence => {
    const quotedValue = /[\s']/.test(sentence.value) ? `'${sentence.value}'` : sentence.value;
    return `${sentence.field} ${sentence.operator} ${quotedValue}`;
  });
  
  let result = expressions[0];
  for (let i = 1; i < expressions.length; i++) {
    const connector = validSentences[i].logicalConnector || 'AND';
    result += ` ${connector} ${expressions[i]}`;
  }
  
  return validSentences.length > 1 ? `( ${result} )` : result;
}