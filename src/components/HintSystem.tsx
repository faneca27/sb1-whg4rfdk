import React, { useState, useEffect } from 'react';
import { Lightbulb, X, ChevronRight, HelpCircle, Target, Zap } from 'lucide-react';
import { CodeBlockInstance } from './CodeBlock';

interface Hint {
  id: string;
  trigger: string;
  title: string;
  message: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  priority: number;
}

const hints: Hint[] = [
  {
    id: 'first-block',
    trigger: 'no-blocks',
    title: 'Getting Started',
    message: 'Drag a block from the left panel to the canvas to start programming!',
    category: 'beginner',
    priority: 10
  },
  {
    id: 'print-first',
    trigger: 'has-blocks-no-print',
    title: 'See Your Output',
    message: 'Add a Print block to see the results of your code. It\'s in the Output category!',
    category: 'beginner',
    priority: 9
  },
  {
    id: 'run-code',
    trigger: 'has-print-not-run',
    title: 'Execute Your Code',
    message: 'Click the "Run" button in the code preview panel to execute your program!',
    category: 'beginner',
    priority: 8
  },
  {
    id: 'use-variables',
    trigger: 'multiple-prints-no-variables',
    title: 'Store Data with Variables',
    message: 'Use Variable blocks to store data and reuse it throughout your program!',
    category: 'beginner',
    priority: 7
  },
  {
    id: 'group-blocks',
    trigger: 'has-control-blocks',
    title: 'Nest Blocks for Logic',
    message: 'Drag blocks into control structures (if, for, while) to create complex logic!',
    category: 'intermediate',
    priority: 6
  },
  {
    id: 'use-functions',
    trigger: 'many-blocks-no-functions',
    title: 'Organize with Functions',
    message: 'When your code gets long, use Function blocks to organize and reuse code!',
    category: 'intermediate',
    priority: 5
  },
  {
    id: 'error-handling',
    trigger: 'has-functions-no-error-handling',
    title: 'Handle Errors Gracefully',
    message: 'Use Try-Except blocks to handle potential errors in your code!',
    category: 'advanced',
    priority: 4
  },
  {
    id: 'use-classes',
    trigger: 'advanced-user',
    title: 'Object-Oriented Programming',
    message: 'Try using Class blocks to create objects and organize your code better!',
    category: 'advanced',
    priority: 3
  },
  {
    id: 'save-project',
    trigger: 'large-project',
    title: 'Save Your Work',
    message: 'Don\'t forget to save your project! Click the Save/Load button in the toolbar.',
    category: 'beginner',
    priority: 2
  },
  {
    id: 'debug-code',
    trigger: 'complex-project',
    title: 'Debug Your Code',
    message: 'Use the Debug panel to step through your code and find issues!',
    category: 'intermediate',
    priority: 1
  }
];

interface HintSystemProps {
  blocks: CodeBlockInstance[];
  codeExecutions: number;
  isVisible: boolean;
  onClose: () => void;
}

export const HintSystem: React.FC<HintSystemProps> = ({
  blocks,
  codeExecutions,
  isVisible,
  onClose
}) => {
  const [currentHints, setCurrentHints] = useState<Hint[]>([]);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('python-neural-dismissed-hints');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showAllHints, setShowAllHints] = useState(false);

  useEffect(() => {
    const activeHints = getActiveHints();
    setCurrentHints(activeHints);
  }, [blocks, codeExecutions]);

  const getActiveHints = (): Hint[] => {
    const activeHints: Hint[] = [];
    
    // Analyze current state
    const blockTypes = new Set<string>();
    const countBlocks = (blockList: CodeBlockInstance[]) => {
      blockList.forEach(block => {
        blockTypes.add(block.block.id);
        countBlocks(block.children);
      });
    };
    countBlocks(blocks);

    const totalBlocks = blocks.length;
    const hasPrint = blockTypes.has('print');
    const hasVariables = blockTypes.has('variable');
    const hasControlBlocks = ['if', 'for', 'while', 'match'].some(type => blockTypes.has(type));
    const hasFunctions = blockTypes.has('function');
    const hasClasses = blockTypes.has('class');
    const hasErrorHandling = ['try', 'except'].some(type => blockTypes.has(type));

    // Check each hint condition
    hints.forEach(hint => {
      if (dismissedHints.has(hint.id)) return;

      let shouldShow = false;

      switch (hint.trigger) {
        case 'no-blocks':
          shouldShow = totalBlocks === 0;
          break;
        case 'has-blocks-no-print':
          shouldShow = totalBlocks > 0 && !hasPrint;
          break;
        case 'has-print-not-run':
          shouldShow = hasPrint && codeExecutions === 0;
          break;
        case 'multiple-prints-no-variables':
          shouldShow = Array.from(blockTypes).filter(type => type === 'print').length >= 2 && !hasVariables;
          break;
        case 'has-control-blocks':
          shouldShow = hasControlBlocks && totalBlocks >= 3;
          break;
        case 'many-blocks-no-functions':
          shouldShow = totalBlocks >= 8 && !hasFunctions;
          break;
        case 'has-functions-no-error-handling':
          shouldShow = hasFunctions && !hasErrorHandling;
          break;
        case 'advanced-user':
          shouldShow = hasFunctions && hasControlBlocks && !hasClasses;
          break;
        case 'large-project':
          shouldShow = totalBlocks >= 10;
          break;
        case 'complex-project':
          shouldShow = totalBlocks >= 15 && hasControlBlocks;
          break;
      }

      if (shouldShow) {
        activeHints.push(hint);
      }
    });

    // Sort by priority (higher number = higher priority)
    return activeHints.sort((a, b) => b.priority - a.priority).slice(0, 3);
  };

  const dismissHint = (hintId: string) => {
    const newDismissed = new Set(dismissedHints);
    newDismissed.add(hintId);
    setDismissedHints(newDismissed);
    localStorage.setItem('python-neural-dismissed-hints', JSON.stringify(Array.from(newDismissed)));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner': return Target;
      case 'intermediate': return Zap;
      case 'advanced': return HelpCircle;
      default: return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'from-green-600 to-emerald-500';
      case 'intermediate': return 'from-yellow-600 to-orange-500';
      case 'advanced': return 'from-red-600 to-pink-500';
      default: return 'from-blue-600 to-cyan-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {/* Active Hints */}
      {currentHints.length > 0 && !showAllHints && (
        <div className="space-y-2 mb-2">
          {currentHints.map((hint, index) => {
            const CategoryIcon = getCategoryIcon(hint.category);
            return (
              <div
                key={hint.id}
                className={`hologram p-4 rounded-lg border border-cyan-400/30 bg-gradient-to-r ${getCategoryColor(hint.category)} animate-pulse`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start gap-3">
                  <CategoryIcon className="w-5 h-5 text-white pulse-neon flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white neon-text text-sm">
                      {hint.title}
                    </h4>
                    <p className="text-white/90 text-xs mt-1">
                      {hint.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissHint(hint.id)}
                    className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hint System Toggle */}
      <div className="flex items-center gap-2">
        {currentHints.length > 0 && (
          <button
            onClick={() => setShowAllHints(!showAllHints)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-500 rounded text-white transition-all duration-300 neon-glow text-sm"
          >
            <Lightbulb className="w-4 h-4 pulse-neon" />
            {showAllHints ? 'Hide' : 'More'} Hints
            <ChevronRight className={`w-3 h-3 transition-transform ${showAllHints ? 'rotate-90' : ''}`} />
          </button>
        )}
        
        <button
          onClick={onClose}
          className="p-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded text-white transition-all duration-300 neon-glow"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* All Hints Panel */}
      {showAllHints && (
        <div className="mt-2 hologram p-4 rounded-lg border border-cyan-400/30 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold text-cyan-400 mb-3 neon-text">
            ◊ ALL HINTS ◊
          </h3>
          <div className="space-y-2">
            {hints.map(hint => {
              const CategoryIcon = getCategoryIcon(hint.category);
              const isDismissed = dismissedHints.has(hint.id);
              return (
                <div
                  key={hint.id}
                  className={`p-2 rounded border text-xs ${
                    isDismissed
                      ? 'border-gray-600/50 bg-gray-600/10 opacity-50'
                      : 'border-cyan-400/30 bg-cyan-400/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-medium">{hint.title}</span>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      hint.category === 'beginner' ? 'bg-green-600/20 text-green-300' :
                      hint.category === 'intermediate' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-red-600/20 text-red-300'
                    }`}>
                      {hint.category}
                    </span>
                  </div>
                  <p className="text-purple-300 mt-1">{hint.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};