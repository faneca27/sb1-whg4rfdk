import React, { useState, useEffect } from 'react';
import { Play, Copy, Download, Eye, EyeOff, Package } from 'lucide-react';
import { CodeBlockInstance } from './CodeBlock';
import { ImportHelper } from './ImportHelper';

// Declare pyodide as a global variable
declare global {
  interface Window {
    loadPyodide: any;
  }
}

interface CodePreviewProps {
  blocks: CodeBlockInstance[];
}

export const CodePreview: React.FC<CodePreviewProps> = ({ blocks }) => {
  const [output, setOutput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<string[]>([]);
  const [showImportHelper, setShowImportHelper] = useState(false);

  useEffect(() => {
    const initPyodide = async () => {
      setIsLoading(true);
      try {
        // Load Pyodide from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = async () => {
          const pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
          });
          
          // Redirect Python stdout to capture print statements
          pyodideInstance.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.output = StringIO()
        
    def write(self, text):
        self.output.write(text)
        
    def flush(self):
        pass
        
    def get_output(self):
        return self.output.getvalue()
        
    def clear(self):
        self.output = StringIO()

output_capture = OutputCapture()
          `);
          
          setPyodide(pyodideInstance);
          
          // Get list of available packages
          try {
            const packages = pyodideInstance.runPython(`
import sys
available_packages = []

# Standard library modules that are commonly available
standard_modules = [
    'math', 'random', 'datetime', 'json', 'os', 'sys', 're', 
    'collections', 'itertools', 'functools', 'operator',
    'string', 'time', 'calendar', 'decimal', 'fractions',
    'statistics', 'urllib', 'base64', 'hashlib', 'hmac',
    'uuid', 'csv', 'sqlite3', 'pickle', 'copy', 'pprint'
]

for module in standard_modules:
    try:
        __import__(module)
        available_packages.append(module)
    except ImportError:
        pass

available_packages
            `);
            setAvailablePackages(packages.toJs());
          } catch (error) {
            console.log('Could not get package list:', error);
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Pyodide:', error);
        setOutput('Error: Failed to load Python interpreter');
      } finally {
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  const generateCode = () => {
    const generateBlockCode = (block: CodeBlockInstance, indentLevel: number = 0): string => {
      let code = '';
      
      // Generate code for the current block
      let line = block.block.template;
      
      // Replace parameters in template
      if (block.block.parameters) {
        block.block.parameters.forEach(param => {
          const value = block.parameters[param.name] || param.default;
          let formattedValue = value;
          
          // Handle import block formatting
          if (block.block.id === 'import') {
            if (param.name === 'alias' && value.trim()) {
              formattedValue = ` as ${value.trim()}`;
            } else if (param.name === 'alias' && !value.trim()) {
              formattedValue = '';
            }
          }
          // Add quotes for string values in print statements
          else if (param.name === 'message' && block.block.type === 'output') {
            if (!value.startsWith('"') && !value.startsWith("'") && !value.includes('(')) {
              formattedValue = `"${value}"`;
            }
          }
          
          line = line.replace(`{${param.name}}`, formattedValue);
        });
      }
      
      // Add proper indentation
      const indent = '    '.repeat(indentLevel);
      code += indent + line + '\n';
      
      // Generate code for children (if not collapsed)
      if (!block.isCollapsed && block.children.length > 0) {
        // Sort children by position
        const sortedChildren = [...block.children].sort((a, b) => a.position.y - b.position.y);
        sortedChildren.forEach(child => {
          code += generateBlockCode(child, indentLevel + 1);
        });
      }
      
      return code;
    };

    // Get top-level blocks (blocks without parents) and separate imports
    const topLevelBlocks = blocks.filter(block => !block.parentId);
    const importBlocks = topLevelBlocks.filter(block => block.block.type === 'import');
    const classBlocks = topLevelBlocks.filter(block => block.block.type === 'class');
    const functionBlocks = topLevelBlocks.filter(block => block.block.type === 'function');
    const otherBlocks = topLevelBlocks.filter(block => 
      !['import', 'class', 'function'].includes(block.block.type)
    );
    
    // Sort import blocks by position (imports should come first)
    const sortedImports = importBlocks.sort((a, b) => {
      if (Math.abs(a.position.y - b.position.y) < 50) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });
    
    // Sort class blocks by position
    const sortedClasses = classBlocks.sort((a, b) => {
      if (Math.abs(a.position.y - b.position.y) < 50) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });
    
    // Sort function blocks by position
    const sortedFunctions = functionBlocks.sort((a, b) => {
      if (Math.abs(a.position.y - b.position.y) < 50) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });
    
    // Sort other blocks by position
    const sortedOthers = otherBlocks.sort((a, b) => {
      if (Math.abs(a.position.y - b.position.y) < 50) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });
    
    // Generate code: imports first, then classes, then functions, then other blocks
    let code = '';
    
    // Add imports first
    sortedImports.forEach(block => {
      code += generateBlockCode(block, 0);
    });
    
    // Add a blank line between imports and other code if both exist
    if (sortedImports.length > 0 && (sortedClasses.length > 0 || sortedFunctions.length > 0 || sortedOthers.length > 0)) {
      code += '\n';
    }
    
    // Add classes
    sortedClasses.forEach(block => {
      code += generateBlockCode(block, 0);
    });
    
    // Add blank line between classes and functions if both exist
    if (sortedClasses.length > 0 && (sortedFunctions.length > 0 || sortedOthers.length > 0)) {
      code += '\n';
    }
    
    // Add functions
    sortedFunctions.forEach(block => {
      code += generateBlockCode(block, 0);
    });
    
    // Add blank line between functions and other code if both exist
    if (sortedFunctions.length > 0 && sortedOthers.length > 0) {
      code += '\n';
    }
    
    // Add other blocks (main code)
    sortedOthers.forEach(block => {
      code += generateBlockCode(block, 0);
    });
    
    return code || '# Your generated Python code will appear here';
  };

  const executeCode = async () => {
    if (!pyodide) {
      setOutput('Error: Python interpreter not loaded yet. Please wait and try again.');
      return;
    }

    setIsExecuting(true);
    const code = generateCode();
    
    try {
      // Clear previous output
      pyodide.runPython('output_capture.clear()');
      
      // Redirect stdout to our capture object
      pyodide.runPython('sys.stdout = output_capture');
      
      // Execute the generated code
      pyodide.runPython(code);
      
      // Get the captured output
      const result = pyodide.runPython('output_capture.get_output()');
      
      // Restore stdout
      pyodide.runPython('sys.stdout = sys.__stdout__');
      
      setOutput(result || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Error executing code:\n${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
  };

  const downloadCode = () => {
    const code = generateCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_code.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectPackage = (packageName: string) => {
    // This could be enhanced to automatically add an import block to the canvas
    // For now, we'll just close the helper and let users know
    setShowImportHelper(false);
    setOutput(`◊ Library "${packageName}" selected. Create an Import block and set library to "${packageName}" ◊`);
  };

  const code = generateCode();

  return (
    <div className={`hologram border-l border-cyan-400 transition-all duration-300 relative ${
      isCollapsed ? 'w-12' : 'w-96'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-cyan-500/5"></div>
      <div className="p-4 border-b border-cyan-400/50 flex items-center justify-between relative z-10">
        <h3 className={`font-semibold text-white ${isCollapsed ? 'hidden' : ''}`}>
          <span className="neon-text text-cyan-400">◊ NEURAL CODE ◊</span>
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-cyan-400/20 rounded text-cyan-400 hover:text-white transition-colors neon-glow glitch"
        >
          {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="relative z-10">
          <div className="p-4 border-b border-cyan-400/50">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowImportHelper(!showImportHelper)}
                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-blue-600 hover:to-indigo-500 text-white rounded text-sm transition-all duration-300 neon-glow glitch"
              >
                <Package className="w-3 h-3 pulse-neon" />
                Libraries
              </button>
              <button
                onClick={executeCode}
                disabled={!pyodide || isExecuting || isLoading}
                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded text-sm transition-all duration-300 neon-glow glitch"
              >
                <Play className="w-3 h-3 pulse-neon" />
                {isExecuting ? 'Running...' : isLoading ? 'Loading...' : 'Run'}
              </button>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-500 text-white rounded text-sm transition-all duration-300 neon-glow glitch"
              >
                <Copy className="w-3 h-3 pulse-neon" />
                Copy
              </button>
              <button
                onClick={downloadCode}
                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-600 hover:to-purple-500 text-white rounded text-sm transition-all duration-300 neon-glow glitch"
              >
                <Download className="w-3 h-3 pulse-neon" />
                Download
              </button>
            </div>
            
            <div className="bg-black/60 rounded-lg p-3 max-h-64 overflow-y-auto border border-cyan-400/30 hologram">
              <pre className="text-sm text-cyan-300 font-mono whitespace-pre-wrap neon-text">
                {code}
              </pre>
            </div>
          </div>
          
          {showImportHelper && (
            <div className="p-4 border-b border-cyan-400/50">
              <ImportHelper
                availablePackages={availablePackages}
                onSelectPackage={handleSelectPackage}
              />
            </div>
          )}
          
          {(output || isLoading) && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-cyan-400 mb-2 neon-text">
                {isLoading ? '◊ Initializing Neural Network...' : '◊ SYSTEM OUTPUT ◊'}
              </h4>
              <div className="bg-black/60 rounded-lg p-3 max-h-32 overflow-y-auto border border-cyan-400/30 hologram">
                <pre className={`text-sm font-mono whitespace-pre-wrap ${
                  output.startsWith('Error') ? 'text-red-400 neon-text' : 'text-green-400 neon-text'
                } ${!output.startsWith('Error') ? 'pulse-neon' : ''}`}>
                  {isLoading ? '◊ Quantum processors online... ◊' : output}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};