import React, { useState } from 'react';
import { MobileLayout } from './components/MobileLayout';
import { BlockLibrary, Block } from './components/BlockLibrary';
import { CodeCanvas } from './components/CodeCanvas';
import { CodePreview } from './components/CodePreview';
import { CodeBlockInstance } from './components/CodeBlock';
import { TutorialSystem } from './components/TutorialSystem';
import { ExampleProjects } from './components/ExampleProjects';
import { ProjectManager } from './components/ProjectManager';
import { DebugPanel } from './components/DebugPanel';
import { CodeToBlocksConverter } from './components/CodeToBlocksConverter';
import { AchievementSystem } from './components/AchievementSystem';
import { ChallengeSystem } from './components/ChallengeSystem';
import { ThemeSystem } from './components/ThemeSystem';
import { HintSystem } from './components/HintSystem';
import { ProgressTracker } from './components/ProgressTracker';
import { Code2, BookOpen, Folder, Lightbulb } from 'lucide-react';
import { Trophy, Target, Palette, TrendingUp, HelpCircle } from 'lucide-react';

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

function App() {
  const isMobile = useIsMobile();
  const [blocks, setBlocks] = useState<CodeBlockInstance[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
  const [showTutorials, setShowTutorials] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showCodeConverter, setShowCodeConverter] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [codeExecutions, setCodeExecutions] = useState(0);
  const [codeOutput, setCodeOutput] = useState('');
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');

  const handleAddBlock = (block: Block, position: { x: number; y: number }) => {
    const parameters: Record<string, any> = {};
    block.parameters?.forEach(param => {
      parameters[param.name] = param.default;
    });


    const newBlock: CodeBlockInstance = {
      id: `${block.id}-${Date.now()}-${Math.random()}`,
      block,
      position: { x: position.x, y: position.y },
      parameters,
      indent: 0,
      children: [],
      isCollapsed: false
    };

    setBlocks(prev => [...prev, newBlock]);
  };

  const handleUpdateBlock = (updatedBlock: CodeBlockInstance) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === updatedBlock.id) {
        return updatedBlock;
      }
      // Also update children recursively
      return {
        ...block,
        children: updateBlockInChildren(block.children, updatedBlock)
      };
    }));
  };

  const updateBlockInChildren = (children: CodeBlockInstance[], updatedBlock: CodeBlockInstance): CodeBlockInstance[] => {
    return children.map(child => {
      if (child.id === updatedBlock.id) {
        return updatedBlock;
      }
      return {
        ...child,
        children: updateBlockInChildren(child.children, updatedBlock)
      };
    });
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => {
      // Remove from top level
      const filtered = prev.filter(block => block.id !== id);
      // Remove from children recursively
      return filtered.map(block => ({
        ...block,
        children: removeBlockFromChildren(block.children, id)
      }));
    });
  };

  const removeBlockFromChildren = (children: CodeBlockInstance[], id: string): CodeBlockInstance[] => {
    return children
      .filter(child => child.id !== id)
      .map(child => ({
        ...child,
        children: removeBlockFromChildren(child.children, id)
      }));
  };

  const handleGroupBlocks = (parentId: string, childId: string) => {
    setBlocks(prev => {
      // Find the child block
      const childBlock = findBlockById(prev, childId);
      if (!childBlock) return prev;

      // Remove child from its current location
      const withoutChild = prev.map(block => ({
        ...block,
        children: removeBlockFromChildren(block.children, childId)
      })).filter(block => block.id !== childId);

      // Add child to parent
      return withoutChild.map(block => {
        if (block.id === parentId) {
          return {
            ...block,
            children: [...block.children, { ...childBlock, parentId }]
          };
        }
        return {
          ...block,
          children: addBlockToChildren(block.children, parentId, { ...childBlock, parentId })
        };
      });
    });
  };

  const handleUngroupBlock = (childId: string) => {
    setBlocks(prev => {
      // Find the child block
      const childBlock = findBlockById(prev, childId);
      if (!childBlock) return prev;

      // Remove child from its parent
      const withoutChild = prev.map(block => ({
        ...block,
        children: removeBlockFromChildren(block.children, childId)
      }));

      // Add child as top-level block
      return [...withoutChild, { ...childBlock, parentId: undefined }];
    });
  };

  const findBlockById = (blocks: CodeBlockInstance[], id: string): CodeBlockInstance | null => {
    for (const block of blocks) {
      if (block.id === id) return block;
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
    return null;
  };

  const addBlockToChildren = (children: CodeBlockInstance[], parentId: string, childBlock: CodeBlockInstance): CodeBlockInstance[] => {
    return children.map(child => {
      if (child.id === parentId) {
        return {
          ...child,
          children: [...child.children, childBlock]
        };
      }
      return {
        ...child,
        children: addBlockToChildren(child.children, parentId, childBlock)
      };
    });
  };

  const handleDragStart = (block: Block) => {
    setDraggedBlock(block);
  };

  const handleLoadProject = (code: string) => {
    console.log('Loading project code:', code);
  };

  const handleLoadProjectBlocks = (projectBlocks: CodeBlockInstance[]) => {
    setBlocks(projectBlocks);
  };

  const handleConvertToBlocks = (convertedBlocks: CodeBlockInstance[]) => {
    setBlocks(convertedBlocks);
  };

  const handleRunCode = () => {
    setCodeExecutions(prev => prev + 1);
    // Update stats for achievements
    const stats = JSON.parse(localStorage.getItem('python-neural-stats') || '{}');
    stats.codeExecutions = (stats.codeExecutions || 0) + 1;
    localStorage.setItem('python-neural-stats', JSON.stringify(stats));
  };

  const handleThemeChange = (theme: any) => {
    setCurrentTheme(theme.id);
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-screen matrix-bg scan-lines flex flex-col font-mono" style={{ fontFamily: 'Orbitron, monospace' }}>
        {/* Mobile Header */}
        <header className="hologram border-b border-cyan-400 px-4 py-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-yellow-500/10 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-cyan-400 neon-glow pulse-neon" />
              <div>
                <h1 className="text-lg font-bold text-cyan-400 neon-text">PYTHON NEURAL</h1>
                <p className="text-xs text-purple-300">◊ Mobile Interface ◊</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowProjectManager(true)}
                className="p-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded text-white text-xs neon-glow mobile-touch"
              >
                <Folder className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowTutorials(true)}
                className="p-2 bg-gradient-to-r from-blue-600 to-indigo-500 rounded text-white text-xs neon-glow mobile-touch"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAchievements(true)}
                className="p-2 bg-gradient-to-r from-yellow-600 to-orange-500 rounded text-white text-xs neon-glow mobile-touch"
              >
                <Trophy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Main Content */}
        <MobileLayout
          blocks={blocks}
          onAddBlock={handleAddBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onGroupBlocks={handleGroupBlocks}
          onUngroupBlock={handleUngroupBlock}
          onDragStart={handleDragStart}
        />

        {/* Mobile Footer */}
        <footer className="hologram border-t border-cyan-400 px-4 py-2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5"></div>
          <div className="flex items-center justify-center text-xs text-cyan-300 relative z-10">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              NODES: {blocks.length}
            </span>
          </div>
        </footer>

        {/* Mobile Modals */}
        {showTutorials && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <TutorialSystem onClose={() => setShowTutorials(false)} />
            </div>
          </div>
        )}

        {showProjects && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <ExampleProjects 
                onClose={() => setShowProjects(false)}
                onLoadProject={handleLoadProject}
              />
            </div>
          </div>
        )}

        {showProjectManager && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <ProjectManager
                blocks={blocks}
                onLoadProject={handleLoadProjectBlocks}
                onClose={() => setShowProjectManager(false)}
              />
            </div>
          </div>
        )}

        {showDebugPanel && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <DebugPanel
                blocks={blocks}
                code={generateCodeFromBlocks(blocks)}
                onClose={() => setShowDebugPanel(false)}
              />
            </div>
          </div>
        )}

        {showCodeConverter && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <CodeToBlocksConverter
                onConvertToBlocks={handleConvertToBlocks}
                onClose={() => setShowCodeConverter(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen matrix-bg scan-lines flex flex-col font-mono" style={{ fontFamily: 'Orbitron, monospace' }}>
      {/* Header */}
      <header className="hologram border-b border-cyan-400 px-6 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-yellow-500/10 animate-pulse"></div>
        <div className="flex items-center gap-3">
          <Code2 className="w-8 h-8 text-cyan-400 neon-glow pulse-neon" />
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 neon-text glitch">PYTHON NEURAL INTERFACE</h1>
            <p className="text-sm text-purple-300">◊ Quantum Block Assembly System ◊</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowProjectManager(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <Folder className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Save/Load</span>
          </button>
          <button
            onClick={() => setShowDebugPanel(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-red-600 to-pink-500 hover:from-pink-600 hover:to-red-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <Code2 className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Debug</span>
          </button>
          <button
            onClick={() => setShowCodeConverter(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-blue-600 hover:to-cyan-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <Lightbulb className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Code→Blocks</span>
          </button>
          <button
            onClick={() => setShowTutorials(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-indigo-600 hover:to-blue-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <BookOpen className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Tutorials</span>
          </button>
          <button
            onClick={() => setShowProjects(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-600 hover:to-purple-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <Folder className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Projects</span>
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-orange-600 hover:to-yellow-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <Trophy className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Achievements</span>
          </button>
          <button
            onClick={() => setShowChallenges(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-green-600 to-teal-500 hover:from-teal-600 hover:to-green-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <Target className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Challenges</span>
          </button>
          <button
            onClick={() => setShowProgress(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-purple-600 hover:to-indigo-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <TrendingUp className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Progress</span>
          </button>
          <button
            onClick={() => setShowThemes(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-rose-600 hover:to-pink-500 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm"
          >
            <Palette className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Themes</span>
          </button>
          <button
            onClick={() => setShowHints(!showHints)}
            className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded text-white transition-all duration-300 neon-glow glitch text-xs sm:text-sm ${
              showHints 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-blue-600 hover:to-cyan-500'
                : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400'
            }`}
          >
            <HelpCircle className="w-4 h-4 pulse-neon" />
            <span className="hidden sm:inline">Hints</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <BlockLibrary onDragStart={handleDragStart} />
        <CodeCanvas
          blocks={blocks}
          onAddBlock={handleAddBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onGroupBlocks={handleGroupBlocks}
          onUngroupBlock={handleUngroupBlock}
        />
        <CodePreview blocks={blocks} />
      </div>

      {/* Footer */}
      <footer className="hologram border-t border-cyan-400 px-6 py-3 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5"></div>
        <div className="flex items-center justify-between text-sm text-cyan-300 relative z-10">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            ACTIVE NODES: {blocks.length}
          </span>
          <span>◊ Neural Link Active ◊ Drag quantum blocks into control matrices ◊</span>
        </div>
      </footer>

      {/* Tutorial Modal */}
      {showTutorials && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <TutorialSystem onClose={() => setShowTutorials(false)} />
        </div>
      )}

      {/* Projects Modal */}
      {showProjects && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ExampleProjects 
            onClose={() => setShowProjects(false)}
            onLoadProject={handleLoadProject}
          />
        </div>
      )}

      {/* Project Manager Modal */}
      {showProjectManager && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ProjectManager
            blocks={blocks}
            onLoadProject={handleLoadProjectBlocks}
            onClose={() => setShowProjectManager(false)}
          />
        </div>
      )}

      {/* Debug Panel Modal */}
      {showDebugPanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <DebugPanel
            blocks={blocks}
            code={generateCodeFromBlocks(blocks)}
            onClose={() => setShowDebugPanel(false)}
          />
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AchievementSystem
            blocks={blocks}
            onClose={() => setShowAchievements(false)}
          />
        </div>
      )}

      {/* Challenges Modal */}
      {showChallenges && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ChallengeSystem
            blocks={blocks}
            generatedCode={generateCodeFromBlocks(blocks)}
            onClose={() => setShowChallenges(false)}
            onRunCode={handleRunCode}
            codeOutput={codeOutput}
          />
        </div>
      )}

      {/* Themes Modal */}
      {showThemes && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ThemeSystem
            onClose={() => setShowThemes(false)}
            onThemeChange={handleThemeChange}
          />
        </div>
      )}

      {/* Progress Tracker Modal */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ProgressTracker
            blocks={blocks}
            onClose={() => setShowProgress(false)}
          />
        </div>
      )}

      {/* Hint System */}
      <HintSystem
        blocks={blocks}
        codeExecutions={codeExecutions}
        isVisible={showHints}
        onClose={() => setShowHints(false)}
      />

      {/* Code to Blocks Converter Modal */}
      {showCodeConverter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CodeToBlocksConverter
            onConvertToBlocks={handleConvertToBlocks}
            onClose={() => setShowCodeConverter(false)}
          />
        </div>
      )}
    </div>
  );

  // Helper function to generate code from blocks (for debugging)
  function generateCodeFromBlocks(blocks: CodeBlockInstance[]): string {
    const generateBlockCode = (block: CodeBlockInstance, indentLevel: number = 0): string => {
      let code = '';
      let line = block.block.template;
      
      if (block.block.parameters) {
        block.block.parameters.forEach(param => {
          const value = block.parameters[param.name] || param.default;
          let formattedValue = value;
          
          if (block.block.id === 'import') {
            if (param.name === 'alias' && value.trim()) {
              formattedValue = ` as ${value.trim()}`;
            } else if (param.name === 'alias' && !value.trim()) {
              formattedValue = '';
            }
          } else if (param.name === 'message' && block.block.type === 'output') {
            if (!value.startsWith('"') && !value.startsWith("'") && !value.includes('(')) {
              formattedValue = `"${value}"`;
            }
          }
          
          line = line.replace(`{${param.name}}`, formattedValue);
        });
      }
      
      const indent = '    '.repeat(indentLevel);
      code += indent + line + '\n';
      
      if (!block.isCollapsed && block.children.length > 0) {
        const sortedChildren = [...block.children].sort((a, b) => a.position.y - b.position.y);
        sortedChildren.forEach(child => {
          code += generateBlockCode(child, indentLevel + 1);
        });
      }
      
      return code;
    };

    const topLevelBlocks = blocks.filter(block => !block.parentId);
    const importBlocks = topLevelBlocks.filter(block => block.block.type === 'import');
    const classBlocks = topLevelBlocks.filter(block => block.block.type === 'class');
    const functionBlocks = topLevelBlocks.filter(block => block.block.type === 'function');
    const otherBlocks = topLevelBlocks.filter(block => 
      !['import', 'class', 'function'].includes(block.block.type)
    );
    
    let code = '';
    
    [...importBlocks, ...classBlocks, ...functionBlocks, ...otherBlocks].forEach(block => {
      code += generateBlockCode(block, 0);
    });
    
    return code || '# Your generated Python code will appear here';
  }
}

export default App;