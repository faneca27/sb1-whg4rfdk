import React from 'react';
import { Variable, Play, RotateCw, GitBranch, Repeat, Code, Package, ArrowRight, ArrowLeft, Hash, Type, List, FileText, Calculator } from 'lucide-react';

export interface Block {
  id: string;
  type: string;
  category: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  parameters?: Parameter[];
  template: string;
}

export interface Parameter {
  name: string;
  type: 'text' | 'number' | 'boolean';
  default?: any;
}

export const blockTypes: Block[] = [
  {
    id: 'import',
    type: 'import',
    category: 'Libraries',
    label: 'Import Library',
    icon: Package,
    color: 'bg-gradient-to-r from-indigo-600 to-blue-500',
    parameters: [
      { name: 'library', type: 'text', default: 'math' },
      { name: 'alias', type: 'text', default: '' }
    ],
    template: 'import {library}{alias}'
  },
  {
    id: 'variable',
    type: 'variable',
    category: 'Variables',
    label: 'Create Variable',
    icon: Variable,
    color: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    parameters: [
      { name: 'name', type: 'text', default: 'my_var' },
      { name: 'value', type: 'text', default: '0' }
    ],
    template: '{name} = {value}'
  },
  {
    id: 'print',
    type: 'output',
    category: 'Output',
    label: 'Print',
    icon: Play,
    color: 'bg-gradient-to-r from-purple-600 to-pink-500',
    parameters: [
      { name: 'message', type: 'text', default: 'Hello, World!' }
    ],
    template: 'print({message})'
  },
  {
    id: 'if',
    type: 'control',
    category: 'Control',
    label: 'If Statement',
    icon: GitBranch,
    color: 'bg-gradient-to-r from-orange-600 to-red-500',
    parameters: [
      { name: 'condition', type: 'text', default: 'True' }
    ],
    template: 'if {condition}:'
  },
  {
    id: 'elif',
    type: 'control',
    category: 'Control',
    label: 'Elif Statement',
    icon: GitBranch,
    color: 'bg-gradient-to-r from-orange-500 to-yellow-500',
    parameters: [
      { name: 'condition', type: 'text', default: 'True' }
    ],
    template: 'elif {condition}:'
  },
  {
    id: 'else',
    type: 'control',
    category: 'Control',
    label: 'Else Statement',
    icon: GitBranch,
    color: 'bg-gradient-to-r from-yellow-500 to-orange-400',
    parameters: [],
    template: 'else:'
  },
  {
    id: 'for',
    type: 'control',
    category: 'Control',
    label: 'For Loop',
    icon: Repeat,
    color: 'bg-gradient-to-r from-green-600 to-teal-500',
    parameters: [
      { name: 'variable', type: 'text', default: 'i' },
      { name: 'range', type: 'text', default: 'range(5)' }
    ],
    template: 'for {variable} in {range}:'
  },
  {
    id: 'while',
    type: 'control',
    category: 'Control',
    label: 'While Loop',
    icon: RotateCw,
    color: 'bg-gradient-to-r from-teal-600 to-blue-500',
    parameters: [
      { name: 'condition', type: 'text', default: 'True' }
    ],
    template: 'while {condition}:'
  },
  {
    id: 'function',
    type: 'function',
    category: 'Functions',
    label: 'Define Function',
    icon: Code,
    color: 'bg-gradient-to-r from-emerald-600 to-green-500',
    parameters: [
      { name: 'name', type: 'text', default: 'my_function' },
      { name: 'params', type: 'text', default: '' }
    ],
    template: 'def {name}({params}):'
  },
  {
    id: 'class',
    type: 'class',
    category: 'Classes',
    label: 'Define Class',
    icon: Code,
    color: 'bg-gradient-to-r from-violet-600 to-indigo-500',
    parameters: [
      { name: 'name', type: 'text', default: 'MyClass' },
      { name: 'parent', type: 'text', default: '' }
    ],
    template: 'class {name}{parent}:'
  },
  {
    id: 'method',
    type: 'method',
    category: 'Classes',
    label: 'Define Method',
    icon: Code,
    color: 'bg-gradient-to-r from-indigo-600 to-purple-500',
    parameters: [
      { name: 'name', type: 'text', default: '__init__' },
      { name: 'params', type: 'text', default: 'self' }
    ],
    template: 'def {name}({params}):'
  },
  {
    id: 'attribute',
    type: 'attribute',
    category: 'Classes',
    label: 'Set Attribute',
    icon: Variable,
    color: 'bg-gradient-to-r from-purple-600 to-pink-500',
    parameters: [
      { name: 'object', type: 'text', default: 'self' },
      { name: 'name', type: 'text', default: 'attribute' },
      { name: 'value', type: 'text', default: 'None' }
    ],
    template: '{object}.{name} = {value}'
  },
  {
    id: 'instantiate',
    type: 'instantiate',
    category: 'Classes',
    label: 'Create Instance',
    icon: Package,
    color: 'bg-gradient-to-r from-pink-600 to-red-500',
    parameters: [
      { name: 'variable', type: 'text', default: 'obj' },
      { name: 'class_name', type: 'text', default: 'MyClass' },
      { name: 'args', type: 'text', default: '' }
    ],
    template: '{variable} = {class_name}({args})'
  },
  {
    id: 'method_call',
    type: 'method_call',
    category: 'Classes',
    label: 'Call Method',
    icon: Play,
    color: 'bg-gradient-to-r from-red-600 to-orange-500',
    parameters: [
      { name: 'object', type: 'text', default: 'obj' },
      { name: 'method', type: 'text', default: 'method_name' },
      { name: 'args', type: 'text', default: '' }
    ],
    template: '{object}.{method}({args})'
  },
  {
    id: 'match',
    type: 'control',
    category: 'Control',
    label: 'Match Statement',
    icon: GitBranch,
    color: 'bg-gradient-to-r from-cyan-600 to-blue-500',
    parameters: [
      { name: 'value', type: 'text', default: 'variable' }
    ],
    template: 'match {value}:'
  },
  {
    id: 'case',
    type: 'control',
    category: 'Control',
    label: 'Case',
    icon: GitBranch,
    color: 'bg-gradient-to-r from-blue-600 to-indigo-500',
    parameters: [
      { name: 'pattern', type: 'text', default: '1' }
    ],
    template: 'case {pattern}:'
  },
  {
    id: 'case_default',
    type: 'control',
    category: 'Control',
    label: 'Case Default',
    icon: GitBranch,
    color: 'bg-gradient-to-r from-indigo-600 to-purple-500',
    parameters: [],
    template: 'case _:'
  },
  {
    id: 'try',
    type: 'control',
    category: 'Error Handling',
    label: 'Try Block',
    icon: RotateCw,
    color: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    parameters: [],
    template: 'try:'
  },
  {
    id: 'except',
    type: 'control',
    category: 'Error Handling',
    label: 'Except Block',
    icon: RotateCw,
    color: 'bg-gradient-to-r from-red-600 to-pink-500',
    parameters: [
      { name: 'exception', type: 'text', default: 'Exception' },
      { name: 'variable', type: 'text', default: '' }
    ],
    template: 'except {exception}{variable}:'
  },
  {
    id: 'finally',
    type: 'control',
    category: 'Error Handling',
    label: 'Finally Block',
    icon: RotateCw,
    color: 'bg-gradient-to-r from-purple-600 to-indigo-500',
    parameters: [],
    template: 'finally:'
  },
  {
    id: 'raise',
    type: 'control',
    category: 'Error Handling',
    label: 'Raise Exception',
    icon: Play,
    color: 'bg-gradient-to-r from-orange-600 to-red-500',
    parameters: [
      { name: 'exception', type: 'text', default: 'ValueError("Error message")' }
    ],
    template: 'raise {exception}'
  },
  {
    id: 'return',
    type: 'control',
    category: 'Functions',
    label: 'Return Value',
    icon: ArrowRight,
    color: 'bg-gradient-to-r from-green-600 to-emerald-500',
    parameters: [
      { name: 'value', type: 'text', default: 'None' }
    ],
    template: 'return {value}'
  },
  {
    id: 'break',
    type: 'control',
    category: 'Control',
    label: 'Break Loop',
    icon: ArrowLeft,
    color: 'bg-gradient-to-r from-red-600 to-orange-500',
    parameters: [],
    template: 'break'
  },
  {
    id: 'continue',
    type: 'control',
    category: 'Control',
    label: 'Continue Loop',
    icon: ArrowRight,
    color: 'bg-gradient-to-r from-orange-600 to-yellow-500',
    parameters: [],
    template: 'continue'
  },
  {
    id: 'input',
    type: 'input',
    category: 'Input/Output',
    label: 'Get Input',
    icon: Type,
    color: 'bg-gradient-to-r from-teal-600 to-cyan-500',
    parameters: [
      { name: 'variable', type: 'text', default: 'user_input' },
      { name: 'prompt', type: 'text', default: 'Enter value: ' }
    ],
    template: '{variable} = input("{prompt}")'
  },
  {
    id: 'list',
    type: 'data',
    category: 'Data Structures',
    label: 'Create List',
    icon: List,
    color: 'bg-gradient-to-r from-indigo-600 to-purple-500',
    parameters: [
      { name: 'name', type: 'text', default: 'my_list' },
      { name: 'items', type: 'text', default: '1, 2, 3' }
    ],
    template: '{name} = [{items}]'
  },
  {
    id: 'dict',
    type: 'data',
    category: 'Data Structures',
    label: 'Create Dictionary',
    icon: Hash,
    color: 'bg-gradient-to-r from-purple-600 to-pink-500',
    parameters: [
      { name: 'name', type: 'text', default: 'my_dict' },
      { name: 'items', type: 'text', default: '"key": "value"' }
    ],
    template: '{name} = {{{items}}}'
  },
  {
    id: 'comment',
    type: 'documentation',
    category: 'Documentation',
    label: 'Add Comment',
    icon: FileText,
    color: 'bg-gradient-to-r from-gray-600 to-slate-500',
    parameters: [
      { name: 'text', type: 'text', default: 'This is a comment' }
    ],
    template: '# {text}'
  },
  {
    id: 'len',
    type: 'builtin',
    category: 'Built-in Functions',
    label: 'Get Length',
    icon: Calculator,
    color: 'bg-gradient-to-r from-blue-600 to-indigo-500',
    parameters: [
      { name: 'variable', type: 'text', default: 'result' },
      { name: 'object', type: 'text', default: 'my_list' }
    ],
    template: '{variable} = len({object})'
  },
  {
    id: 'range',
    type: 'builtin',
    category: 'Built-in Functions',
    label: 'Create Range',
    icon: Hash,
    color: 'bg-gradient-to-r from-cyan-600 to-teal-500',
    parameters: [
      { name: 'variable', type: 'text', default: 'numbers' },
      { name: 'start', type: 'text', default: '0' },
      { name: 'stop', type: 'text', default: '10' },
      { name: 'step', type: 'text', default: '1' }
    ],
    template: '{variable} = range({start}, {stop}, {step})'
  }
];

interface BlockLibraryProps {
  onDragStart: (block: Block) => void;
}

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ onDragStart }) => {
  const handleDragStart = (e: React.DragEvent, block: Block) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      type: 'new-block',
      id: block.id 
    }));
    onDragStart(block);
  };

  const categories = Array.from(new Set(blockTypes.map(block => block.category)));

  return (
    <div className="w-64 hologram border-r border-cyan-400 p-4 overflow-y-auto relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-purple-500/5"></div>
      <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2 neon-text relative z-10">
        <Code className="w-5 h-5 pulse-neon" />
        QUANTUM BLOCKS
      </h2>
      
      {categories.map(category => (
        <div key={category} className="mb-6 relative z-10">
          <h3 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wide neon-text">
            ◊ {category} ◊
          </h3>
          <div className="space-y-2">
            {blockTypes.filter(block => block.category === category).map(block => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block)}
                className={`${block.color} p-3 rounded-lg cursor-move hover:scale-105 transition-all duration-200 shadow-lg neon-glow hover:shadow-2xl glitch border border-cyan-400/30`}
              >
                <div className="flex items-center gap-2 text-white">
                  <block.icon className="w-4 h-4 pulse-neon" />
                  <span className="text-sm font-medium neon-text">{block.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};