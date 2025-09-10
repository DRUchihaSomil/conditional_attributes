import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  OnConnectStart,
  OnConnectEnd,
  useReactFlow,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

import { ArrowLeft, Save, Play, FileText, Workflow } from 'lucide-react';
import { Condition } from '../types/condition';
import { TriggerNode } from './flow-nodes/TriggerNode';
import { OperatorNode } from './flow-nodes/OperatorNode';
import { ValueNode } from './flow-nodes/ValueNode';
import { ActionNode } from './flow-nodes/ActionNode';
import { LogicalNode } from './flow-nodes/LogicalNode';
import { ConditionSentenceView } from './ConditionSentenceView';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import FloatingActions from '../imports/FloatingActions-7-6560';

// Memoize node types to prevent re-creation on every render
const nodeTypes = {
  trigger: TriggerNode,
  operator: OperatorNode,
  value: ValueNode,
  action: ActionNode,
  logical: LogicalNode,
};

interface ConditionEditorProps {
  condition: Condition | null;
  onSave: (condition: Condition) => void;
  onBack: () => void;
}

export function ConditionEditor({ condition, onSave, onBack }: ConditionEditorProps) {
  const [conditionName, setConditionName] = useState(condition?.name || 'Untitled');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSourceNode, setDragSourceNode] = useState<Node | null>(null);
  const [ghostNode, setGhostNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'canvas' | 'sentence'>('canvas');
  const [currentCondition, setCurrentCondition] = useState<Condition | null>(condition);

  // Memoize nodeTypes to prevent re-renders
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);


  // Initialize flow from existing condition or create default flow
  useEffect(() => {
    // Add a small delay to ensure React Flow is fully initialized
    const initializeFlow = () => {
      if (condition) {
        setConditionName(condition.name);
        setCurrentCondition(condition);
        // Parse expression and create nodes
        const parsedNodes = parseExpressionToNodes(condition.expression, condition.effects);
        setNodes(parsedNodes.nodes);
        setEdges(parsedNodes.edges);
      } else {
        // Start with default flow layout
        const defaultFlow = createDefaultFlow();
        setNodes(defaultFlow.nodes);
        setEdges(defaultFlow.edges);
        setCurrentCondition(null);
      }
    };

    // Small delay to ensure React Flow is ready
    const timeoutId = setTimeout(initializeFlow, 100);
    return () => clearTimeout(timeoutId);
  }, [condition, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Creating connection:', params);
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
      };
      setEdges((eds) => {
        const newEdges = addEdge(edge, eds);
        console.log('New edges array:', newEdges);
        return newEdges;
      });
    },
    [setEdges]
  );



  const handleSave = () => {
    let finalCondition: Condition;
    
    if (viewMode === 'canvas') {
      const expression = generateExpressionFromFlow(nodes, edges);
      const effects = generateEffectsFromFlow(nodes);
      
      // Generate smart name if still "Untitled"
      let finalName = conditionName;
      if (conditionName === 'Untitled' && expression) {
        finalName = generateSmartName(nodes, expression);
      }
      
      finalCondition = {
        id: condition?.id || Date.now().toString(),
        name: finalName,
        expression,
        effects,
        expression_ast: [],
      };
    } else {
      // Save from sentence view
      finalCondition = {
        ...currentCondition!,
        name: conditionName,
      };
    }

    onSave(finalCondition);
  };

  const handleTest = () => {
    let expression: string;
    if (viewMode === 'canvas') {
      expression = generateExpressionFromFlow(nodes, edges);
    } else {
      expression = currentCondition?.expression || '';
    }
    
    // Create a readable sentence for the test
    const readableSentence = generateReadableSentence(expression, currentCondition?.effects || []);
    alert(`Generated Expression: ${expression}\n\nReadable Format: ${readableSentence}`);
  };

  const generateReadableSentence = (expression: string, effects: any[]): string => {
    if (!expression) return 'No condition defined';
    
    // Parse the expression into readable format
    let readable = expression;
    
    // Replace operators with readable text
    readable = readable.replace(/==/g, 'is equal to');
    readable = readable.replace(/!=/g, 'is not equal to');
    readable = readable.replace(/>=/g, 'is greater than or equal to');
    readable = readable.replace(/<=/g, 'is less than or equal to');
    readable = readable.replace(/>/g, 'is greater than');
    readable = readable.replace(/</g, 'is less than');
    
    // Clean up field names
    readable = readable.replace(/custom_fields\./g, '');
    readable = readable.replace(/_/g, ' ');
    
    // Add the then clause
    if (effects.length > 0) {
      const targetFields = effects.map(e => e.fields[0].replace('custom_fields.', '').replace(/_/g, ' ')).join(', ');
      readable += ` then set ${targetFields} options`;
    }
    
    return `If ${readable}`;
  };

  const handleAddNode = (nodeType: string) => {
    const newNodeId = `${nodeType}-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
      data: getDefaultNodeData(nodeType),
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleConditionChange = (updatedCondition: Condition) => {
    setCurrentCondition(updatedCondition);
    // If changing from sentence view, also update the canvas
    // But only if we have a valid expression to avoid clearing the canvas with empty nodes
    if (viewMode === 'sentence' && updatedCondition.expression && updatedCondition.expression.trim()) {
      const parsedNodes = parseExpressionToNodes(updatedCondition.expression, updatedCondition.effects);
      setNodes(parsedNodes.nodes);
      setEdges(parsedNodes.edges);
    }
  };

  const handleViewModeChange = (checked: boolean) => {
    const newMode = checked ? 'sentence' : 'canvas';
    setViewMode(newMode);
    
    if (newMode === 'sentence') {
      // When switching to sentence view, update current condition from canvas
      const expression = generateExpressionFromFlow(nodes, edges);
      const effects = generateEffectsFromFlow(nodes);
      const updatedCondition: Condition = {
        id: condition?.id || Date.now().toString(),
        name: conditionName,
        expression,
        effects,
        expression_ast: [],
      };
      setCurrentCondition(updatedCondition);
    }
  };

  return (
    <ReactFlowWrapper>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="condition-name">Condition Name:</Label>
                <Input
                  id="condition-name"
                  value={conditionName}
                  onChange={(e) => setConditionName(e.target.value)}
                  placeholder="Enter condition name"
                  className="w-64"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 ml-6 pl-6 border-l">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  <Label htmlFor="view-mode-toggle" className="text-sm font-medium">
                    Canvas
                  </Label>
                </div>
                <Switch
                  id="view-mode-toggle"
                  checked={viewMode === 'sentence'}
                  onCheckedChange={handleViewModeChange}
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="view-mode-toggle" className="text-sm font-medium">
                    Sentence
                  </Label>
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleTest}>
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 relative w-full">
          {viewMode === 'canvas' ? (
            <div className="w-full h-full">
              <FlowContent
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={memoizedNodeTypes}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                dragSourceNode={dragSourceNode}
                setDragSourceNode={setDragSourceNode}
                ghostNode={ghostNode}
                setGhostNode={setGhostNode}
                mousePosition={mousePosition}
                setMousePosition={setMousePosition}
                setNodes={setNodes}
                setEdges={setEdges}
              />
              
              {/* Floating Actions Toolbar */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                <FloatingActionsToolbar 
                  onAddStep={(nodeType) => handleAddNode(nodeType)}
                />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto bg-background">
              <ConditionSentenceView
                condition={currentCondition}
                onConditionChange={handleConditionChange}
              />
            </div>
          )}
        </div>
      </div>
    </ReactFlowWrapper>
  );
}



export function getDefaultNodeData(type: string) {
  switch (type) {
    case 'trigger':
      return { field: 'applies_to_part' };
    case 'logical':
      return { operator: 'AND' };
    case 'operator':
      return { operator: '==' };
    case 'value':
      return { value: '' };
    case 'action':
      return { field: 'custom_fields.issue_category_l1', allowedValues: [], show: true };
    default:
      return {};
  }
}

function createDefaultFlow(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: 'if-default',
      type: 'trigger',
      position: { x: 50, y: 150 },
      data: { field: 'applies_to_part' },
    },
    {
      id: 'operator-default',
      type: 'operator',
      position: { x: 280, y: 150 },
      data: { operator: '==' },
    },
    {
      id: 'value-default',
      type: 'value',
      position: { x: 480, y: 150 },
      data: { value: '' },
    },
    {
      id: 'action-default',
      type: 'action',
      position: { x: 700, y: 150 },
      data: { 
        field: 'custom_fields.issue_category_l1',
        allowedValues: [], 
        show: true 
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: 'if-operator',
      source: 'if-default',
      target: 'operator-default',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
    },
    {
      id: 'operator-value',
      source: 'operator-default',
      target: 'value-default',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
    },
    {
      id: 'value-action',
      source: 'value-default',
      target: 'action-default',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
    },
  ];

  return { nodes, edges };
}

function parseExpressionToNodes(expression: string, effects: any[]): { nodes: Node[]; edges: Edge[] } {
  // Simple parsing for expressions like "field == 'value'"
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Parse the expression
  const match = expression.match(/(.+?)\s*(==|!=|>|<|>=|<=)\s*(.+)/);
  if (match) {
    const [, field, operator, value] = match;
    
    // Create if node
    nodes.push({
      id: 'if-1',
      type: 'trigger',
      position: { x: 50, y: 150 },
      data: { field: field.trim() },
    });
    
    // Create operator node
    nodes.push({
      id: 'operator-1',
      type: 'operator',
      position: { x: 280, y: 150 },
      data: { operator: operator.trim() },
    });
    
    // Create value node
    nodes.push({
      id: 'value-1',
      type: 'value',
      position: { x: 480, y: 150 },
      data: { value: value.trim().replace(/['"]/g, '') },
    });
    
    // Create action nodes for each effect
    effects.forEach((effect, index) => {
      nodes.push({
        id: `action-${index + 1}`,
        type: 'action',
        position: { x: 700, y: 100 + index * 120 },
        data: {
          field: effect.fields[0] || '',
          allowedValues: effect.allowed_values || [],
          defaultValues: effect.default_values || [], // Include default values from sentence
          show: effect.show || true,
        },
      });
      
      // Connect value to action
      edges.push({
        id: `value-action-${index + 1}`,
        source: 'value-1',
        target: `action-${index + 1}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 2 }
      });
    });
    
    // Connect if to operator to value
    edges.push(
      {
        id: 'if-operator',
        source: 'if-1',
        target: 'operator-1',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 2 }
      },
      {
        id: 'operator-value',
        source: 'operator-1',
        target: 'value-1',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 2 }
      }
    );
  }
  
  return { nodes, edges };
}

function generateExpressionFromFlow(nodes: Node[], edges: Edge[]): string {
  // Find if, operator, and value nodes
  const triggerNodes = nodes.filter(n => n.type === 'trigger');
  const logicalNodes = nodes.filter(n => n.type === 'logical');
  
  if (logicalNodes.length === 0) {
    // Simple single condition
    const ifNode = nodes.find(n => n.type === 'trigger');
    const operatorNode = nodes.find(n => n.type === 'operator');
    const valueNode = nodes.find(n => n.type === 'value');
  
    if (!ifNode || !operatorNode || !valueNode) {
      return '';
    }
    
    const field = ifNode.data.field || '';
  const operator = operatorNode.data.operator || '';
  const value = valueNode.data.value || '';
  
  // Return empty if any required field is missing or set to "none"
  if (!field || !operator || !value || field === 'none' || operator === 'none') {
    return '';
  }
  
  // Add quotes if value contains spaces or special characters
  const quotedValue = /['\s]/.test(value) ? `'${value}'` : value;
  
    return `${field} ${operator} ${quotedValue}`;
  }
  
  // Complex case with logical operators
  const expressions: string[] = [];
  
  triggerNodes.forEach(ifNode => {
    const field = ifNode.data.field;
    if (!field || field === 'none') return;
    
    // Find connected operator
    const ifToOperator = edges.find(e => 
      e.source === ifNode.id && 
      nodes.find(n => n.id === e.target)?.type === 'operator'
    );
    
    if (!ifToOperator) return;
    
    const operatorNode = nodes.find(n => n.id === ifToOperator.target);
    if (!operatorNode) return;
    
    const operator = operatorNode.data.operator;
    if (!operator || operator === 'none') return;
    
    // Find connected value
    const operatorToValue = edges.find(e => 
      e.source === operatorNode.id && 
      nodes.find(n => n.id === e.target)?.type === 'value'
    );
    
    if (!operatorToValue) return;
    
    const valueNode = nodes.find(n => n.id === operatorToValue.target);
    if (!valueNode) return;
    
    const value = valueNode.data.value;
    if (!value) return;
    
    const quotedValue = /['\\s]/.test(value) ? `'${value}'` : value;
    expressions.push(`${field} ${operator} ${quotedValue}`);
  });
  
  if (expressions.length === 0) return '';
  if (expressions.length === 1) return expressions[0];
  
  const logicalOp = logicalNodes.length > 0 ? (logicalNodes[0].data.operator || 'AND') : 'AND';
  return `(${expressions.join(` ${logicalOp} `)})`;
}

function generateEffectsFromFlow(nodes: Node[]): any[] {
  const actionNodes = nodes.filter(n => n.type === 'action');
  
  return actionNodes
    .filter(node => node.data.field && node.data.field !== 'none') // Only include action nodes with valid fields
    .map(node => ({
      allowed_values: node.data.allowedValues || [],
      default_values: node.data.defaultValues || [], // Include default values from canvas
      fields: [node.data.field],
      show: node.data.show !== false,
    }));
}

function generateSmartName(nodes: Node[], expression: string): string {
  // Find the trigger field and action field to create a meaningful name
  const triggerNode = nodes.find(n => n.type === 'trigger');
  const actionNode = nodes.find(n => n.type === 'action');
  
  if (!triggerNode || !actionNode) {
    return 'Untitled Condition';
  }
  
  const triggerField = triggerNode.data.field;
  const actionField = actionNode.data.field;
  
  // Create descriptive names based on common patterns
  if (triggerField === 'applies_to_part') {
    const valueNode = nodes.find(n => n.type === 'value');
    const value = valueNode?.data.value || '';
    
    if (value.includes('product')) {
      return 'Product Condition';
    } else if (value.includes('capability')) {
      return 'Capability Condition';
    } else if (value.includes('bus')) {
      return 'Bus Condition';
    } else if (value.includes('ondc')) {
      return 'ONDC Condition';
    }
    return 'Part-based Condition';
  }
  
  if (triggerField.includes('issue_category')) {
    return 'Issue Category Condition';
  }
  
  if (triggerField.includes('user.role')) {
    return 'User Role Condition';
  }
  
  if (triggerField.includes('priority')) {
    return 'Priority Condition';
  }
  
  if (triggerField.includes('status')) {
    return 'Status Condition';
  }
  
  // Fallback to a generic but informative name
  const fieldName = triggerField.split('.').pop() || 'field';
  return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Condition`;
}

interface FlowContentProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: Connection) => void;
  nodeTypes: any;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  dragSourceNode: Node | null;
  setDragSourceNode: (node: Node | null) => void;
  ghostNode: Node | null;
  setGhostNode: (node: Node | null) => void;
  mousePosition: { x: number; y: number };
  setMousePosition: (position: { x: number; y: number }) => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
}

function FlowContent({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes,
  isDragging,
  setIsDragging,
  dragSourceNode,
  setDragSourceNode,
  ghostNode,
  setGhostNode,
  mousePosition,
  setMousePosition,
  setNodes,
  setEdges,
}: FlowContentProps) {
  const { screenToFlowPosition, getNode } = useReactFlow();

  // Get next node type based on current node type
  const getNextNodeType = (currentType: string): string => {
    const flowSequence = {
      'trigger': 'operator',
      'operator': 'value',
      'value': 'action', 
      'logical': 'operator',
      'action': 'trigger' // Can branch to new conditions
    };
    return flowSequence[currentType as keyof typeof flowSequence] || 'trigger';
  };

  // Check if mouse position is near any existing target handles
  const isNearExistingNode = (mousePos: { x: number; y: number }): boolean => {
    const threshold = 50; // pixels
    
    return nodes.some(node => {
      const nodeRect = {
        x: node.position.x,
        y: node.position.y,
        width: 200, // approximate node width
        height: 80   // approximate node height
      };
      
      const distance = Math.sqrt(
        Math.pow(mousePos.x - (nodeRect.x + nodeRect.width / 2), 2) +
        Math.pow(mousePos.y - (nodeRect.y + nodeRect.height / 2), 2)
      );
      
      return distance < threshold;
    });
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleType }) => {
    if (handleType === 'source' && nodeId) {
      const sourceNode = getNode(nodeId);
      if (sourceNode) {
        setIsDragging(true);
        setDragSourceNode(sourceNode);
      }
    }
  }, [getNode, setIsDragging, setDragSourceNode]);

  const onConnectEnd: OnConnectEnd = useCallback((event) => {
    if (!isDragging || !dragSourceNode) return;

    const targetIsPane = (event.target as Element)?.classList?.contains('react-flow__pane');
    
    if (targetIsPane) {
      // Get mouse position relative to the flow
      const flowPosition = screenToFlowPosition({
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY,
      });

      // Check if near existing node
      if (!isNearExistingNode(flowPosition)) {
        // Create new node
        const nextType = getNextNodeType(dragSourceNode.type || '');
        const newNodeId = `${nextType}-${Date.now()}`;
        
        const newNode: Node = {
          id: newNodeId,
          type: nextType,
          position: {
            x: flowPosition.x + 20, // Position to the right of cursor
            y: flowPosition.y - 40
          },
          data: getDefaultNodeData(nextType),
        };

        // Add the new node
        setNodes((nds) => [...nds, newNode]);

        // Create connection between source and new node
        setEdges((eds) => [
          ...eds,
          {
            id: `${dragSourceNode.id}-${newNodeId}`,
            source: dragSourceNode.id,
            target: newNodeId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#64748b', strokeWidth: 2 }
          }
        ]);
      }
    }

    // Clean up drag state
    setIsDragging(false);
    setDragSourceNode(null);
    setGhostNode(null);
  }, [isDragging, dragSourceNode, screenToFlowPosition, isNearExistingNode, getNextNodeType, setNodes, setEdges, setIsDragging, setDragSourceNode, setGhostNode]);

  // Handle mouse move during drag to update ghost node position
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging && dragSourceNode) {
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setMousePosition(flowPosition);

      // Only show ghost node if not near existing nodes
      if (!isNearExistingNode(flowPosition)) {
        const nextType = getNextNodeType(dragSourceNode.type || '');
        const ghostNodeData: Node = {
          id: 'ghost-node',
          type: nextType,
          position: {
            x: flowPosition.x + 20,
            y: flowPosition.y - 40
          },
          data: getDefaultNodeData(nextType),
          className: 'ghost-node',
        };
        setGhostNode(ghostNodeData);
      } else {
        setGhostNode(null);
      }
    }
  }, [isDragging, dragSourceNode, screenToFlowPosition, isNearExistingNode, getNextNodeType, setMousePosition, setGhostNode]);

  // Combine nodes with ghost node for rendering
  const displayNodes = ghostNode ? [...nodes, ghostNode] : nodes;

  return (
    <div className="w-full h-full relative" onMouseMove={handleMouseMove} style={{ minHeight: '400px' }}>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.3,
          includeHiddenNodes: false,
          minZoom: 0.8,
          maxZoom: 1.2,
          duration: 800,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { 
            stroke: '#94a3b8', 
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
            width: 12,
            height: 12,
            strokeWidth: 1,
          }
        }}
        connectionLineStyle={{ 
          stroke: '#3b82f6', 
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        connectionLineType="smoothstep"
        snapToGrid={true}
        snapGrid={[15, 15]}
        deleteKeyCode={['Backspace', 'Delete']}
        selectNodesOnDrag={false}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}

interface FloatingActionsToolbarProps {
  onAddStep: (nodeType: string) => void;
}

function FloatingActionsToolbar({ onAddStep }: FloatingActionsToolbarProps) {
  const [showNodeMenu, setShowNodeMenu] = useState(false);

  const nodeTypes = [
    { type: 'trigger', label: 'If', description: 'Start condition with field check' },
    { type: 'logical', label: 'AND/OR', description: 'Combine multiple conditions' },
    { type: 'operator', label: 'Operator', description: 'Comparison operator' },
    { type: 'value', label: 'Value', description: 'Value to compare against' },
    { type: 'action', label: 'Action', description: 'Action to execute' },
  ];

  const handleAddStep = () => {
    setShowNodeMenu(!showNodeMenu);
  };

  const handleNodeTypeSelect = (nodeType: string) => {
    onAddStep(nodeType);
    setShowNodeMenu(false);
  };

  return (
    <div className="relative">
      {/* Node Type Menu */}
      {showNodeMenu && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg border border-[#eeeff1] shadow-[0px_2px_12px_0px_rgba(19,19,22,0.12),0px_0px_6px_0px_rgba(19,19,22,0.05)] p-2 min-w-48 z-50">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => handleNodeTypeSelect(nodeType.type)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f8f8fa] transition-colors"
            >
              <div className="font-medium text-sm text-[#42434d]">{nodeType.label}</div>
              <div className="text-xs text-[#717182]">{nodeType.description}</div>
            </button>
          ))}
        </div>
      )}
      
      {/* Floating Actions Bar with exact Figma spacing */}
      <div className="bg-white rounded-[8px] border border-[#eeeff1] shadow-[0px_2px_12px_0px_rgba(19,19,22,0.12),0px_0px_6px_0px_rgba(19,19,22,0.05)]">
        <div className="flex flex-row items-center px-1 py-1 px-[8px] py-[6px]">
          
          {/* Undo and Redo Section */}
          <div className="flex gap-1.5 items-center px-0.5">
            {/* Undo Button */}
            <button className="flex items-center justify-center w-4 h-4 rounded-[8px] hover:bg-[#f8f8fa] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M5.33333 3.33333L3.33333 5.33333L5.33333 7.33333" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.33333 5.33333H9.33333C11.5427 5.33333 13.3333 6.97467 13.3333 9V9C13.3333 11.0253 11.5427 12.6667 9.33333 12.6667H4" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Redo Button */}
            <button className="flex items-center justify-center w-4 h-4 rounded-[8px] hover:bg-[#f8f8fa] transition-colors transform rotate-180 scale-y-[-1]">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M5.33333 3.33333L3.33333 5.33333L5.33333 7.33333" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.33333 5.33333H9.33333C11.5427 5.33333 13.3333 6.97467 13.3333 9V9C13.3333 11.0253 11.5427 12.6667 9.33333 12.6667H4" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* First Separator */}
          <div className="flex items-center justify-center h-6 w-0.5 px-0 py-1 mx-2">
            <div className="bg-[#eeeff1] w-px h-4 rounded-full" />
          </div>

          {/* Lock and Corner Icons */}
          <div className="flex gap-0.5 items-center">
            {/* Lock Button */}
            <button className="bg-transparent h-6 rounded-[6px] p-1 hover:bg-[#f8f8fa] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.3333 14H4.66667C3.93 14 3.33333 13.4033 3.33333 12.6667V8C3.33333 7.26333 3.93 6.66667 4.66667 6.66667H11.3333C12.07 6.66667 12.6667 7.26333 12.6667 8V12.6667C12.6667 13.4033 12.07 14 11.3333 14Z" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 4.66667C10.6667 3.194 9.47267 2 8 2C6.75333 2 5.71467 2.85933 5.42267 4.01533" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 6.66667V4.66667" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Corner Button */}
            <button className="bg-transparent h-6 rounded-[6px] p-1 hover:bg-[#f8f8fa] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.75V12.75H7.5M12.5 7.25V3.25L8.5 3.25" stroke="#545663" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Add Step Button */}
          <button 
            onClick={handleAddStep}
            className="bg-white h-6 rounded-[6px] border border-[#f4f4f6] shadow-[0px_1px_2px_0px_rgba(28,29,33,0.05)] px-1.5 py-1 ml-1 flex items-center gap-2.5 hover:bg-[#f8f8fa] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 7.85716H13M8.14286 3L8.14286 13" stroke="#42434d" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-medium text-xs leading-4 text-[#42434d] whitespace-nowrap">Step</span>
          </button>
        </div>
      </div>
    </div>
  );
}

