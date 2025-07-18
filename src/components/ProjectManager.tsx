import React, { useState } from 'react';
import { Save, FolderOpen, Download, Upload, Trash2, Calendar } from 'lucide-react';
import { CodeBlockInstance } from './CodeBlock';

interface SavedProject {
  id: string;
  name: string;
  description: string;
  blocks: CodeBlockInstance[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectManagerProps {
  blocks: CodeBlockInstance[];
  onLoadProject: (blocks: CodeBlockInstance[]) => void;
  onClose: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  blocks,
  onLoadProject,
  onClose
}) => {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    const saved = localStorage.getItem('python-neural-projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const saveProject = () => {
    if (!projectName.trim()) return;

    const project: SavedProject = {
      id: Date.now().toString(),
      name: projectName.trim(),
      description: projectDescription.trim(),
      blocks: blocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = [...savedProjects, project];
    setSavedProjects(updatedProjects);
    localStorage.setItem('python-neural-projects', JSON.stringify(updatedProjects));
    
    setShowSaveDialog(false);
    setProjectName('');
    setProjectDescription('');
  };

  const loadProject = (project: SavedProject) => {
    onLoadProject(project.blocks);
    onClose();
  };

  const deleteProject = (id: string) => {
    const updatedProjects = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updatedProjects);
    localStorage.setItem('python-neural-projects', JSON.stringify(updatedProjects));
  };

  const exportProject = (project: SavedProject) => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string);
        const updatedProjects = [...savedProjects, { ...project, id: Date.now().toString() }];
        setSavedProjects(updatedProjects);
        localStorage.setItem('python-neural-projects', JSON.stringify(updatedProjects));
      } catch (error) {
        alert('Invalid project file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-cyan-400 pulse-neon" />
          <h2 className="text-xl font-bold text-cyan-400 neon-text">
            ◊ PROJECT NEXUS ◊
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 rounded text-white transition-all duration-300 neon-glow glitch"
        >
          <Save className="w-4 h-4 pulse-neon" />
          Save Current
        </button>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-500 rounded text-white transition-all duration-300 neon-glow glitch cursor-pointer">
          <Upload className="w-4 h-4 pulse-neon" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={importProject}
            className="hidden"
          />
        </label>
      </div>

      {showSaveDialog && (
        <div className="mb-6 p-4 hologram rounded border border-cyan-400/30">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3 neon-text">
            ◊ SAVE PROJECT ◊
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-cyan-400/50 rounded text-cyan-300 placeholder-cyan-500/50 neon-glow focus:border-purple-400 focus:outline-none"
            />
            <textarea
              placeholder="Project description (optional)..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-cyan-400/50 rounded text-cyan-300 placeholder-cyan-500/50 neon-glow focus:border-purple-400 focus:outline-none h-20 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={saveProject}
                disabled={!projectName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-all duration-300 neon-glow"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded text-white transition-all duration-300 neon-glow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {savedProjects.length === 0 ? (
          <div className="text-center text-purple-300 py-8">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No saved projects yet</p>
            <p className="text-sm text-cyan-400">Create your first project and save it!</p>
          </div>
        ) : (
          savedProjects.map(project => (
            <div
              key={project.id}
              className="p-4 bg-black/40 border border-cyan-400/50 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-200 neon-glow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-cyan-300 neon-text mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-purple-300 text-sm mb-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-cyan-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span>{project.blocks.length} blocks</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadProject(project)}
                    className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 rounded text-sm text-white transition-all duration-300 neon-glow"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => exportProject(project)}
                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-500 rounded text-sm text-white transition-all duration-300 neon-glow"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="px-3 py-1 bg-gradient-to-r from-red-600 to-pink-500 hover:from-pink-600 hover:to-red-500 rounded text-sm text-white transition-all duration-300 neon-glow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};