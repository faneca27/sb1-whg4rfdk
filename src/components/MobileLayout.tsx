import React, { useState } from 'react';
import { Menu, X, Code, Play, Eye } from 'lucide-react';
import { BlockLibrary } from './BlockLibrary';
import { CodeCanvas } from './CodeCanvas';
import { CodePreview } from './CodePreview';
import { CodeBlockInstance } from './CodeBlock';
import { Block } from './BlockLibrary';

interface MobileLayoutProps {
  blocks: CodeBlockInstance[];
  onAddBlock: (block: Block, position: { x: number; y: number }) => void;
  onUpdateBlock: (block: CodeBlockInstance) => void;
  onDeleteBlock: (id: string) => void;
  onGroupBlocks: (parentId: string, childId: string) => void;
  onUngroupBlock: (childId: string) => void;
  onDragStart: (block: Block) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onGroupBlocks,
  onUngroupBlock,
  onDragStart
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'canvas' | 'preview'>('canvas');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile Navigation */}
      <div className="flex bg-black/80 border-b border-cyan-400/50 p-2">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-500 rounded text-white text-sm neon-glow mobile-touch"
        >
          <Code className="w-4 h-4" />
          Blocks
        </button>
        
        <div className="flex-1 flex justify-center">
          <div className="flex bg-black/40 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                activeTab === 'canvas' 
                  ? 'bg-cyan-600 text-white neon-glow' 
                  : 'text-cyan-400 hover:bg-cyan-400/20'
              }`}
            >
              Canvas
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded text-white text-sm neon-glow mobile-touch"
        >
          <Eye className="w-4 h-4" />
          Code
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Block Library Sidebar */}
        <div className={`fixed left-0 top-0 bottom-0 w-64 z-50 transform transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full bg-black/90 border-r border-cyan-400/50">
            <div className="flex items-center justify-between p-4 border-b border-cyan-400/50">
              <h2 className="text-lg font-bold text-cyan-400 neon-text">BLOCKS</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 text-cyan-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-full overflow-y-auto pb-20">
              <BlockLibrary onDragStart={onDragStart} />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="h-full">
          <CodeCanvas
            blocks={blocks}
            onAddBlock={onAddBlock}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onGroupBlocks={onGroupBlocks}
            onUngroupBlock={onUngroupBlock}
          />
        </div>

        {/* Preview Overlay */}
        {showPreview && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowPreview(false)}
          />
        )}
        
        {/* Code Preview Sidebar */}
        <div className={`fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 transform transition-transform duration-300 ${
          showPreview ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full bg-black/90 border-l border-cyan-400/50">
            <div className="flex items-center justify-between p-4 border-b border-cyan-400/50">
              <h2 className="text-lg font-bold text-cyan-400 neon-text">CODE</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-cyan-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-full overflow-y-auto pb-20">
              <CodePreview blocks={blocks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};