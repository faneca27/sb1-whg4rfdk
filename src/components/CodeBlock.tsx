import React, { useState } from 'react';
import { X, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { Block } from './BlockLibrary';

export interface CodeBlockInstance {
  id: string;
  block: Block;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  indent: number;
  children: CodeBlockInstance[];
  isCollapsed: boolean;
  parentId?: string;
}

interface CodeBlockProps {
  instance: CodeBlockInstance;
  allBlocks: CodeBlockInstance[];
  onUpdate: (instance: CodeBlockInstance) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, instance: CodeBlockInstance) => void;
  onGroupBlocks: (parentId: string, childId: string) => void;
  onUngroupBlock: (childId: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  instance, 
  allBlocks,
  onUpdate, 
  onDelete, 
  onDragStart,
  onGroupBlocks,
  onUngroupBlock
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempParameters, setTempParameters] = useState(instance.parameters);
  const [isDragOver, setIsDragOver] = useState(false);

  const getDisplayLabel = () => {
    const block = instance.block;
    const params = instance.parameters;
    
    switch (block.id) {
      case 'import':
        const library = params.library || 'math';
        const alias = params.alias || '';
        if (alias.trim()) {
          return `import ${library} as ${alias}`;
        }
        return `import ${library}`;
      
      case 'variable':
        const varName = params.name || 'my_var';
        const varValue = params.value || '0';
        return `${varName} = ${varValue}`;
      
      case 'print':
        const message = params.message || 'Hello, World!';
        // Remove quotes if they exist to avoid double quotes in display
        const cleanMessage = message.replace(/^["']|["']$/g, '');
        return `print("${cleanMessage}")`;
      
      case 'if':
        const ifCondition = params.condition || 'True';
        return `if ${ifCondition}`;
      
      case 'elif':
        const elifCondition = params.condition || 'True';
        return `elif ${elifCondition}`;
      
      case 'for':
        const forVar = params.variable || 'i';
        const forRange = params.range || 'range(5)';
        return `for ${forVar} in ${forRange}`;
      
      case 'while':
        const whileCondition = params.condition || 'True';
        return `while ${whileCondition}`;
      
      case 'function':
        const funcName = params.name || 'my_function';
        const funcParams = params.params || '';
        return `def ${funcName}(${funcParams})`;
      
      case 'class':
        const className = params.name || 'MyClass';
        const parent = params.parent || '';
        if (parent.trim()) {
          return `class ${className}(${parent.trim()})`;
        }
        return `class ${className}`;
      
      case 'method':
        const methodName = params.name || '__init__';
        const methodParams = params.params || 'self';
        return `def ${methodName}(${methodParams})`;
      
      case 'attribute':
        const attrObject = params.object || 'self';
        const attrName = params.name || 'attribute';
        const attrValue = params.value || 'None';
        return `${attrObject}.${attrName} = ${attrValue}`;
      
      case 'instantiate':
        const instVar = params.variable || 'obj';
        const instClass = params.class_name || 'MyClass';
        const instArgs = params.args || '';
        return `${instVar} = ${instClass}(${instArgs})`;
      
      case 'method_call':
        const callObject = params.object || 'obj';
        const callMethod = params.method || 'method_name';
        const callArgs = params.args || '';
        return `${callObject}.${callMethod}(${callArgs})`;
      
      case 'match':
        const matchValue = params.value || 'variable';
        return `match ${matchValue}`;
      
      case 'case':
        const casePattern = params.pattern || '1';
        return `case ${casePattern}`;
      
      case 'case_default':
        return 'case _';
      
      case 'try':
        return 'try';
      
      case 'except':
        const exception = params.exception || 'Exception';
        const variable = params.variable || '';
        if (variable.trim()) {
          return `except ${exception} as ${variable.trim()}`;
        }
        return `except ${exception}`;
      
      case 'finally':
        return 'finally';
      
      case 'raise':
        const raiseException = params.exception || 'ValueError("Error message")';
        return `raise ${raiseException}`;
      
      case 'return':
        const returnValue = params.value || 'None';
        return `return ${returnValue}`;
      
      case 'break':
        return 'break';
      
      case 'continue':
        return 'continue';
      
      case 'input':
        const inputVar = params.variable || 'user_input';
        const inputPrompt = params.prompt || 'Enter value: ';
        return `${inputVar} = input("${inputPrompt}")`;
      
      case 'list':
        const listName = params.name || 'my_list';
        const listItems = params.items || '1, 2, 3';
        return `${listName} = [${listItems}]`;
      
      case 'dict':
        const dictName = params.name || 'my_dict';
        const dictItems = params.items || '"key": "value"';
        return `${dictName} = {${dictItems}}`;
      
      case 'comment':
        const commentText = params.text || 'This is a comment';
        return `# ${commentText}`;
      
      case 'len':
        const lenVar = params.variable || 'result';
        const lenObject = params.object || 'my_list';
        return `${lenVar} = len(${lenObject})`;
      
      case 'range':
        const rangeVar = params.variable || 'numbers';
        const rangeStart = params.start || '0';
        const rangeStop = params.stop || '10';
        const rangeStep = params.step || '1';
        if (rangeStep === '1') {
          return `${rangeVar} = range(${rangeStart}, ${rangeStop})`;
        }
        return `${rangeVar} = range(${rangeStart}, ${rangeStop}, ${rangeStep})`;
      
      default:
        return block.label;
    }
  };
  const handleParameterChange = (paramName: string, value: any) => {
    setTempParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSaveSettings = () => {
    onUpdate({
      ...instance,
      parameters: tempParameters
    });
    setShowSettings(false);
  };

  const handleSettingsToggle = () => {
    if (!showSettings) {
      // Reset temp parameters to current instance parameters when opening settings
      setTempParameters(instance.parameters);
    }
    setShowSettings(!showSettings);
  };
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      type: 'existing-block',
      id: instance.id 
    }));
    onDragStart(e, instance);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canAcceptChildren()) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're actually leaving this element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (dragData.type === 'existing-block' && dragData.id !== instance.id && canAcceptChildren()) {
        onGroupBlocks(instance.id, dragData.id);
      }
    } catch (error) {
      // Handle case where drag data is not JSON (e.g., from library)
      console.log('Non-JSON drag data, ignoring for grouping');
    }
  };

  const canAcceptChildren = () => {
    return ['control', 'function', 'class', 'method'].includes(instance.block.type);
  };

  const toggleCollapse = () => {
    onUpdate({
      ...instance,
      isCollapsed: !instance.isCollapsed
    });
  };

  const handleUngroupChild = (childId: string) => {
    onUngroupBlock(childId);
  };

  return (
    <div className="absolute group" style={{ left: instance.position.x, top: instance.position.y }}>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${instance.block.color} p-4 rounded-lg shadow-lg cursor-move hover:shadow-xl transition-all duration-200 min-w-48 neon-glow border border-cyan-400/30 ${
          isDragOver && canAcceptChildren() ? 'ring-2 ring-cyan-400 ring-opacity-70 scale-105 neon-glow' : ''
        } ${instance.parentId ? 'ml-6 border-l-4 border-cyan-400 border-opacity-60' : ''} glitch mobile-block mobile-touch`}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {canAcceptChildren() && instance.children.length > 0 && (
              <button
                onClick={toggleCollapse}
                className="p-1 hover:bg-cyan-400/20 rounded neon-glow"
              >
                {instance.isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-cyan-400" />
                )}
              </button>
            )}
            <instance.block.icon className="w-4 h-4 pulse-neon" />
            <span className="font-medium text-xs sm:text-sm neon-text truncate max-w-32 sm:max-w-none">{getDisplayLabel()}</span>
            {instance.children.length > 0 && (
              <span className="text-xs bg-cyan-400/20 px-1 sm:px-2 py-1 rounded border border-cyan-400/30 neon-glow">
                {instance.children.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {instance.parentId && (
              <button
                onClick={() => handleUngroupChild(instance.id)}
                className="p-1 hover:bg-cyan-400/20 rounded text-xs neon-glow text-yellow-400"
                title="Ungroup"
              >
                ↗
              </button>
            )}
            <button
              onClick={handleSettingsToggle}
              className="p-1 hover:bg-cyan-400/20 rounded neon-glow mobile-touch"
            >
              <Settings className="w-3 h-3 text-purple-400" />
            </button>
            <button
              onClick={() => onDelete(instance.id)}
              className="p-1 hover:bg-red-400/20 rounded neon-glow mobile-touch"
            >
              <X className="w-3 h-3 text-red-400" />
            </button>
          </div>
        </div>
        
        {canAcceptChildren() && !isDragOver && instance.children.length === 0 && (
          <div className="mt-2 p-2 border-2 border-dashed border-cyan-400/30 rounded text-center text-xs text-cyan-400/60 hologram">
            ◊ Neural Link Zone ◊
          </div>
        )}
        
        {showSettings && (
          <div className="mt-3 space-y-2 hologram p-3 rounded border border-cyan-400/30">
            {instance.block.parameters?.map(param => (
              <div key={param.name}>
                <label className="block text-xs text-cyan-400 mb-1 neon-text">
                  ◊ {param.name.toUpperCase()} ◊
                </label>
                <input
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={tempParameters[param.name] ?? param.default ?? ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-black/40 border border-cyan-400/50 rounded text-cyan-300 placeholder-cyan-500/50 neon-glow focus:border-purple-400 focus:outline-none"
                />
              </div>
            ))}
            <button
              onClick={handleSaveSettings}
              className="w-full mt-2 px-3 py-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-purple-600 hover:to-cyan-600 rounded text-xs text-white transition-all duration-300 neon-glow glitch"
            >
              ◊ SYNC DATA ◊
            </button>
          </div>
        )}
      </div>
      
      {/* Render children */}
      {!instance.isCollapsed && instance.children.map((child, index) => (
        <div key={child.id} style={{ marginTop: `${60 + (index * 80)}px` }}>
          <CodeBlock
            instance={child}
            allBlocks={allBlocks}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onGroupBlocks={onGroupBlocks}
            onUngroupBlock={onUngroupBlock}
          />
        </div>
      ))}
    </div>
  );
};