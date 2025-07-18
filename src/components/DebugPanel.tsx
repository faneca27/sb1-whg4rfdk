import React, { useState, useEffect } from 'react';
import { Bug, Play, Pause, SkipForward, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { CodeBlockInstance } from './CodeBlock';

interface DebugInfo {
  line: number;
  blockId: string;
  variables: Record<string, any>;
  output: string;
  error?: string;
}

interface DebugPanelProps {
  blocks: CodeBlockInstance[];
  code: string;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ blocks, code, onClose }) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [debugOutput, setDebugOutput] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [executionHistory, setExecutionHistory] = useState<DebugInfo[]>([]);

  const codeLines = code.split('\n').filter(line => line.trim());

  const analyzeCode = () => {
    const analysis = {
      totalLines: codeLines.length,
      functions: codeLines.filter(line => line.trim().startsWith('def ')).length,
      classes: codeLines.filter(line => line.trim().startsWith('class ')).length,
      loops: codeLines.filter(line => line.trim().startsWith('for ') || line.trim().startsWith('while ')).length,
      conditionals: codeLines.filter(line => line.trim().startsWith('if ') || line.trim().startsWith('elif ')).length,
      imports: codeLines.filter(line => line.trim().startsWith('import ') || line.trim().startsWith('from ')).length
    };
    return analysis;
  };

  const findPotentialIssues = () => {
    const issues = [];
    
    // Check for common issues
    codeLines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Infinite loop detection
      if (trimmed.startsWith('while True:') && !codeLines.slice(index + 1, index + 10).some(l => l.includes('break'))) {
        issues.push(`Line ${index + 1}: Potential infinite loop detected`);
      }
      
      // Division by zero
      if (trimmed.includes('/ 0') || trimmed.includes('/0')) {
        issues.push(`Line ${index + 1}: Division by zero detected`);
      }
      
      // Undefined variables (basic check)
      const varMatch = trimmed.match(/^(\w+)\s*=/);
      if (varMatch && !variables[varMatch[1]]) {
        // This is a new variable definition, it's okay
      }
    });
    
    return issues;
  };

  const toggleBreakpoint = (lineNumber: number) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(lineNumber)) {
      newBreakpoints.delete(lineNumber);
    } else {
      newBreakpoints.add(lineNumber);
    }
    setBreakpoints(newBreakpoints);
  };

  const startDebugging = () => {
    setIsDebugging(true);
    setCurrentLine(0);
    setVariables({});
    setDebugOutput([]);
    setErrors([]);
    setExecutionHistory([]);
  };

  const stepForward = () => {
    if (currentLine < codeLines.length - 1) {
      const nextLine = currentLine + 1;
      setCurrentLine(nextLine);
      
      // Simulate variable tracking (in a real debugger, this would be more sophisticated)
      const line = codeLines[nextLine];
      const varMatch = line.match(/(\w+)\s*=\s*(.+)/);
      if (varMatch) {
        const newVars = { ...variables };
        try {
          // Simple evaluation for demonstration
          newVars[varMatch[1]] = varMatch[2];
          setVariables(newVars);
        } catch (e) {
          // Handle evaluation errors
        }
      }
      
      // Add to execution history
      setExecutionHistory(prev => [...prev, {
        line: nextLine,
        blockId: `line-${nextLine}`,
        variables: { ...variables },
        output: line.includes('print') ? `Output from line ${nextLine}` : ''
      }]);
    }
  };

  const stopDebugging = () => {
    setIsDebugging(false);
    setCurrentLine(0);
  };

  const analysis = analyzeCode();
  const issues = findPotentialIssues();

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bug className="w-6 h-6 text-cyan-400 pulse-neon" />
          <h2 className="text-xl font-bold text-cyan-400 neon-text">
            ◊ DEBUG MATRIX ◊
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Debug Controls */}
      <div className="flex gap-3 mb-6">
        {!isDebugging ? (
          <button
            onClick={startDebugging}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 rounded text-white transition-all duration-300 neon-glow glitch"
          >
            <Play className="w-4 h-4 pulse-neon" />
            Start Debug
          </button>
        ) : (
          <>
            <button
              onClick={stepForward}
              disabled={currentLine >= codeLines.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-500 disabled:opacity-50 rounded text-white transition-all duration-300 neon-glow"
            >
              <SkipForward className="w-4 h-4" />
              Step
            </button>
            <button
              onClick={stopDebugging}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-500 hover:from-pink-600 hover:to-red-500 rounded text-white transition-all duration-300 neon-glow"
            >
              <Pause className="w-4 h-4" />
              Stop
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Analysis */}
        <div className="space-y-4">
          <div className="hologram p-4 rounded border border-cyan-400/30">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3 neon-text">
              ◊ CODE ANALYSIS ◊
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-purple-300">Total Lines: <span className="text-cyan-300">{analysis.totalLines}</span></div>
              <div className="text-purple-300">Functions: <span className="text-cyan-300">{analysis.functions}</span></div>
              <div className="text-purple-300">Classes: <span className="text-cyan-300">{analysis.classes}</span></div>
              <div className="text-purple-300">Loops: <span className="text-cyan-300">{analysis.loops}</span></div>
              <div className="text-purple-300">Conditionals: <span className="text-cyan-300">{analysis.conditionals}</span></div>
              <div className="text-purple-300">Imports: <span className="text-cyan-300">{analysis.imports}</span></div>
            </div>
          </div>

          {/* Issues */}
          <div className="hologram p-4 rounded border border-cyan-400/30">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 neon-text">
              ◊ POTENTIAL ISSUES ◊
            </h3>
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">No issues detected</span>
              </div>
            ) : (
              <div className="space-y-2">
                {issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 text-yellow-300">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Code with Breakpoints */}
          <div className="hologram p-4 rounded border border-cyan-400/30">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3 neon-text">
              ◊ CODE VIEW ◊
            </h3>
            <div className="bg-black/60 rounded p-3 max-h-64 overflow-y-auto">
              {codeLines.map((line, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 py-1 px-2 rounded ${
                    currentLine === index && isDebugging
                      ? 'bg-yellow-400/20 border border-yellow-400/50'
                      : breakpoints.has(index)
                      ? 'bg-red-400/20 border border-red-400/50'
                      : 'hover:bg-cyan-400/10'
                  }`}
                >
                  <button
                    onClick={() => toggleBreakpoint(index)}
                    className={`w-4 h-4 rounded-full border-2 ${
                      breakpoints.has(index)
                        ? 'bg-red-400 border-red-400'
                        : 'border-cyan-400/50 hover:border-cyan-400'
                    }`}
                  />
                  <span className="text-xs text-cyan-400 w-8">{index + 1}</span>
                  <code className="text-sm text-cyan-300 font-mono">{line}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="space-y-4">
          {/* Variables */}
          <div className="hologram p-4 rounded border border-cyan-400/30">
            <h3 className="text-lg font-semibold text-purple-400 mb-3 neon-text">
              ◊ VARIABLES ◊
            </h3>
            {Object.keys(variables).length === 0 ? (
              <p className="text-sm text-purple-300">No variables tracked yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(variables).map(([name, value]) => (
                  <div key={name} className="flex justify-between items-center text-sm">
                    <span className="text-cyan-300">{name}:</span>
                    <span className="text-purple-300">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Execution History */}
          <div className="hologram p-4 rounded border border-cyan-400/30">
            <h3 className="text-lg font-semibold text-green-400 mb-3 neon-text">
              ◊ EXECUTION TRACE ◊
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {executionHistory.length === 0 ? (
                <p className="text-sm text-green-300">Start debugging to see execution trace</p>
              ) : (
                executionHistory.map((step, index) => (
                  <div key={index} className="text-sm p-2 bg-black/40 rounded border border-green-400/30">
                    <div className="text-green-300">Line {step.line + 1}</div>
                    {step.output && (
                      <div className="text-cyan-300 text-xs mt-1">{step.output}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Status */}
          {isDebugging && (
            <div className="hologram p-4 rounded border border-cyan-400/30">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 neon-text">
                ◊ DEBUG STATUS ◊
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-purple-300">
                  Current Line: <span className="text-cyan-300">{currentLine + 1}</span>
                </div>
                <div className="text-purple-300">
                  Breakpoints: <span className="text-cyan-300">{breakpoints.size}</span>
                </div>
                <div className="text-purple-300">
                  Status: <span className="text-green-400">Running</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};