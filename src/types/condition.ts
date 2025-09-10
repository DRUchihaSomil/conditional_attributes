export interface Effect {
  allowed_values: string[];
  fields: string[];
  show: boolean;
  optional?: boolean;
  default_values?: string[];
  mandatory?: boolean;
}

export interface ParsedCondition {
  field: string;
  operator: string;
  value: string;
}

export interface Condition {
  id: string;
  name: string;
  expression: string;
  effects: Effect[];
  expression_ast: any[];
  // Parsed components for cleaner display
  parsed?: ParsedCondition;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface ConditionFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}