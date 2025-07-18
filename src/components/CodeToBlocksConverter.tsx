import React, { useState } from 'react';
import { Code2, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { Block, blockTypes } from './BlockLibrary';
import { CodeBlockInstance } from './CodeBlock';

interface CodeToBlocksConverterProps {
  onConvertToBlocks: (blocks: CodeBlockInstance[]) => void;
  onClose: () => void;
}

export const CodeToBlocksConverter: React.FC<CodeToBlocksConverterProps> = ({
  onConvertToBlocks,
  onClose
}) => {
  const [inputCode, setInputCode] = useState('');
  const [convertedBlocks, setConvertedBlocks] = useState<CodeBlockInstance[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const parseCodeToBlocks = (code: string): CodeBlockInstance[] => {
    const lines = code.split('\n').filter(line => line.trim());
    const blocks: CodeBlockInstance[] = [];
    const errors: string[] = [];
    let yPosition = 50;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const indent = line.length - line.trimStart().length;
      
      try {
        const block = parseLineToBlock(trimmed, index, yPosition, indent);
        if (block) {
          blocks.push(block);
          yPosition += 80;
        }
      } catch (error) {
        errors.push(`Line ${index + 1}: ${error}`);
      }
    });

    setErrors(errors);
    return blocks;
  };

  const parseLineToBlock = (line: string, index: number, yPos: number, indent: number): CodeBlockInstance | null => {
    const xPos = 50 + (indent * 30);

    // Import statements
    if (line.startsWith('import ') || line.startsWith('from ')) {
      const importBlock = blockTypes.find(b => b.id === 'import');
      if (!importBlock) return null;

      let library = '';
      let alias = '';

      if (line.startsWith('import ')) {
        const parts = line.replace('import ', '').split(' as ');
        library = parts[0].trim();
        alias = parts[1]?.trim() || '';
      } else if (line.startsWith('from ')) {
        const match = line.match(/from\s+(\w+)\s+import\s+(.+)/);
        if (match) {
          library = match[1];
          // For simplicity, we'll treat "from x import y" as "import x"
        }
      }

      return createBlockInstance(importBlock, { library, alias }, xPos, yPos, index);
    }

    // Variable assignments
    const varMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (varMatch) {
      const variableBlock = blockTypes.find(b => b.id === 'variable');
      if (!variableBlock) return null;

      return createBlockInstance(variableBlock, {
        name: varMatch[1],
        value: varMatch[2]
      }, xPos, yPos, index);
    }

    // Print statements
    if (line.startsWith('print(')) {
      const printBlock = blockTypes.find(b => b.id === 'print');
      if (!printBlock) return null;

      const messageMatch = line.match(/print\((.+)\)$/);
      const message = messageMatch ? messageMatch[1] : '"Hello, World!"';

      return createBlockInstance(printBlock, { message }, xPos, yPos, index);
    }

    // If statements
    if (line.startsWith('if ')) {
      const ifBlock = blockTypes.find(b => b.id === 'if');
      if (!ifBlock) return null;

      const condition = line.replace('if ', '').replace(':', '').trim();
      return createBlockInstance(ifBlock, { condition }, xPos, yPos, index);
    }

    // Elif statements
    if (line.startsWith('elif ')) {
      const elifBlock = blockTypes.find(b => b.id === 'elif');
      if (!elifBlock) return null;

      const condition = line.replace('elif ', '').replace(':', '').trim();
      return createBlockInstance(elifBlock, { condition }, xPos, yPos, index);
    }

    // Else statements
    if (line === 'else:') {
      const elseBlock = blockTypes.find(b => b.id === 'else');
      if (!elseBlock) return null;

      return createBlockInstance(elseBlock, {}, xPos, yPos, index);
    }

    // For loops
    if (line.startsWith('for ')) {
      const forBlock = blockTypes.find(b => b.id === 'for');
      if (!forBlock) return null;

      const match = line.match(/for\s+(\w+)\s+in\s+(.+):/);
      if (match) {
        return createBlockInstance(forBlock, {
          variable: match[1],
          range: match[2]
        }, xPos, yPos, index);
      }
    }

    // While loops
    if (line.startsWith('while ')) {
      const whileBlock = blockTypes.find(b => b.id === 'while');
      if (!whileBlock) return null;

      const condition = line.replace('while ', '').replace(':', '').trim();
      return createBlockInstance(whileBlock, { condition }, xPos, yPos, index);
    }

    // Function definitions
    if (line.startsWith('def ')) {
      const functionBlock = blockTypes.find(b => b.id === 'function');
      if (!functionBlock) return null;

      const match = line.match(/def\s+(\w+)\s*\(([^)]*)\):/);
      if (match) {
        return createBlockInstance(functionBlock, {
          name: match[1],
          params: match[2]
        }, xPos, yPos, index);
      }
    }

    // Class definitions
    if (line.startsWith('class ')) {
      const classBlock = blockTypes.find(b => b.id === 'class');
      if (!classBlock) return null;

      const match = line.match(/class\s+(\w+)(?:\(([^)]+)\))?:/);
      if (match) {
        return createBlockInstance(classBlock, {
          name: match[1],
          parent: match[2] || ''
        }, xPos, yPos, index);
      }
    }

    // Return statements
    if (line.startsWith('return ')) {
      const returnBlock = blockTypes.find(b => b.id === 'return');
      if (!returnBlock) return null;

      const value = line.replace('return ', '').trim();
      return createBlockInstance(returnBlock, { value }, xPos, yPos, index);
    }

    // Break statements
    if (line === 'break') {
      const breakBlock = blockTypes.find(b => b.id === 'break');
      if (!breakBlock) return null;

      return createBlockInstance(breakBlock, {}, xPos, yPos, index);
    }

    // Continue statements
    if (line === 'continue') {
      const continueBlock = blockTypes.find(b => b.id === 'continue');
      if (!continueBlock) return null;

      return createBlockInstance(continueBlock, {}, xPos, yPos, index);
    }

    // Comments
    if (line.startsWith('#')) {
      const commentBlock = blockTypes.find(b => b.id === 'comment');
      if (!commentBlock) return null;

      const text = line.replace('#', '').trim();
      return createBlockInstance(commentBlock, { text }, xPos, yPos, index);
    }

    // If we can't parse the line, create a comment block with the original line
    const commentBlock = blockTypes.find(b => b.id === 'comment');
    if (commentBlock) {
      return createBlockInstance(commentBlock, { 
        text: `Unparsed: ${line}` 
      }, xPos, yPos, index);
    }

    return null;
  };

  const createBlockInstance = (
    block: Block, 
    parameters: Record<string, any>, 
    x: number, 
    y: number, 
    index: number
  ): CodeBlockInstance => {
    const fullParameters: Record<string, any> = {};
    
    // Set default values for all parameters
    block.parameters?.forEach(param => {
      fullParameters[param.name] = parameters[param.name] ?? param.default;
    });

    return {
      id: `converted-${block.id}-${index}-${Date.now()}`,
      block,
      position: { x, y },
      parameters: fullParameters,
      indent: 0,
      children: [],
      isCollapsed: false
    };
  };

  const handleConvert = () => {
    if (!inputCode.trim()) return;

    setIsConverting(true);
    setErrors([]);

    try {
      const blocks = parseCodeToBlocks(inputCode);
      setConvertedBlocks(blocks);
    } catch (error) {
      setErrors([`Conversion error: ${error}`]);
    } finally {
      setIsConverting(false);
    }
  };

  const handleLoadBlocks = () => {
    onConvertToBlocks(convertedBlocks);
    onClose();
  };

  const exampleCode = `import math
import random as rand

name = "Alice"
age = 25

print(f"Hello, {name}!")

if age >= 18:
    print("You are an adult")
else:
    print("You are a minor")

for i in range(5):
    print(f"Count: {i}")

def greet(person):
    return f"Hello, {person}!"

# This is a comment
result = greet(name)
print(result)`;

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-6xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-cyan-400 pulse-neon" />
          <h2 className="text-xl font-bold text-cyan-400 neon-text">
            ◊ CODE TO BLOCKS CONVERTER ◊
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="hologram p-4 rounded border border-cyan-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-cyan-400 neon-text">
                ◊ PYTHON CODE INPUT ◊
              </h3>
              <button
                onClick={() => setInputCode(exampleCode)}
                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-600 hover:to-purple-500 rounded text-sm text-white transition-all duration-300 neon-glow"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your Python code here..."
              className="w-full h-64 px-3 py-2 bg-black/60 border border-cyan-400/50 rounded text-cyan-300 placeholder-cyan-500/50 neon-glow focus:border-purple-400 focus:outline-none font-mono text-sm resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleConvert}
                disabled={!inputCode.trim() || isConverting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-all duration-300 neon-glow glitch"
              >
                <Zap className="w-4 h-4 pulse-neon" />
                {isConverting ? 'Converting...' : 'Convert to Blocks'}
              </button>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="hologram p-4 rounded border border-red-400/30">
              <h3 className="text-lg font-semibold text-red-400 mb-3 neon-text">
                ◊ CONVERSION ISSUES ◊
              </h3>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-red-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="hologram p-4 rounded border border-cyan-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-400 neon-text">
                ◊ CONVERTED BLOCKS ◊
              </h3>
              {convertedBlocks.length > 0 && (
                <button
                  onClick={handleLoadBlocks}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-purple-600 hover:to-cyan-600 rounded text-white transition-all duration-300 neon-glow glitch"
                >
                  <ArrowRight className="w-4 h-4" />
                  Load to Canvas
                </button>
              )}
            </div>
            
            {convertedBlocks.length === 0 ? (
              <div className="text-center text-purple-300 py-8">
                <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No blocks converted yet</p>
                <p className="text-sm text-cyan-400">Enter Python code and click convert</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {convertedBlocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={`${block.block.color} p-3 rounded-lg shadow-lg border border-cyan-400/30 neon-glow`}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <block.block.icon className="w-4 h-4 pulse-neon" />
                      <span className="text-sm font-medium neon-text">
                        {block.block.label}
                      </span>
                    </div>
                    {Object.keys(block.parameters).length > 0 && (
                      <div className="mt-2 text-xs text-cyan-200">
                        {Object.entries(block.parameters).map(([key, value]) => (
                          <div key={key} className="truncate">
                            {key}: {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversion Stats */}
          {convertedBlocks.length > 0 && (
            <div className="hologram p-4 rounded border border-cyan-400/30">
              <h3 className="text-lg font-semibold text-green-400 mb-3 neon-text">
                ◊ CONVERSION STATS ◊
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-purple-300">
                  Total Blocks: <span className="text-cyan-300">{convertedBlocks.length}</span>
                </div>
                <div className="text-purple-300">
                  Errors: <span className="text-red-300">{errors.length}</span>
                </div>
                <div className="text-purple-300">
                  Success Rate: <span className="text-green-300">
                    {Math.round(((convertedBlocks.length - errors.length) / Math.max(convertedBlocks.length, 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};