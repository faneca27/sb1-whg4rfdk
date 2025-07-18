import React, { useState, useRef } from 'react';
import { CodeBlock, CodeBlockInstance } from './CodeBlock';
import { Block, blockTypes } from './BlockLibrary';

interface CodeCanvasProps {
  blocks: CodeBlockInstance[];
  onUpdateBlock: (block: CodeBlockInstance) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (block: Block, position: { x: number; y: number }) => void;
  onGroupBlocks: (parentId: string, childId: string) => void;
  onUngroupBlock: (childId: string) => void;
}

export const CodeCanvas: React.FC<CodeCanvasProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onGroupBlocks,
  onUngroupBlock
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedBlock, setDraggedBlock] = useState<CodeBlockInstance | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Filter to only show top-level blocks (blocks without parents)
  const topLevelBlocks = blocks.filter(block => !block.parentId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const blockData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (blockData.type === 'new-block' && blockData.id) {
        // New block from library
        const originalBlock = blockTypes.find(b => b.id === blockData.id);
        if (!originalBlock) return;
        
        const parameters: Record<string, any> = {};
        originalBlock.parameters?.forEach((param: any) => {
          parameters[param.name] = param.default;
        });
        
        onAddBlock(originalBlock, { x, y });
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const handleBlockDragStart = (e: React.DragEvent, instance: CodeBlockInstance) => {
    setDraggedBlock(instance);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleBlockDragEnd = (e: React.DragEvent) => {
    if (!draggedBlock || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    onUpdateBlock({
      ...draggedBlock,
      position: { x, y }
    });

    setDraggedBlock(null);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 matrix-bg relative overflow-hidden border-x border-cyan-400/30 mobile-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleBlockDragEnd}
    >
      <div className="absolute inset-0">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-grid-pattern"></div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Drop zone hint */}
        {topLevelBlocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-cyan-400 text-center hologram p-4 sm:p-8 rounded-lg mx-4">
              <div className="text-4xl mb-4 neon-text">⚡</div>
              <div className="text-lg sm:text-xl font-medium neon-text mb-2">NEURAL INTERFACE READY</div>
              <div className="text-xs sm:text-sm text-purple-300">Initialize quantum blocks to begin programming sequence</div>
              <div className="text-xs text-yellow-300 mt-2 hidden sm:block">◊ Drop blocks into control matrices for advanced operations ◊</div>
            </div>
          </div>
        )}
      </div>
      
      {topLevelBlocks.map(block => (
        <CodeBlock
          key={block.id}
          instance={block}
          allBlocks={blocks}
          onUpdate={onUpdateBlock}
          onDelete={onDeleteBlock}
          onDragStart={handleBlockDragStart}
          onGroupBlocks={onGroupBlocks}
          onUngroupBlock={onUngroupBlock}
        />
      ))}
    </div>
  );
};