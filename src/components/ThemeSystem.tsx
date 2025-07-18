import React, { useState, useEffect } from 'react';
import { Palette, Monitor, Moon, Sun, Zap, Sparkles } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  effects: {
    glow: string;
    border: string;
    gradient: string;
  };
}

const themes: Theme[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neural',
    description: 'Neon-lit cyberpunk aesthetic with electric blues and magentas',
    icon: Zap,
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#0a0a0a',
      surface: '#1a1a2e',
      text: '#00ffff',
      textSecondary: '#a855f7'
    },
    effects: {
      glow: 'shadow-cyan-400/50',
      border: 'border-cyan-400',
      gradient: 'from-cyan-500/10 via-purple-500/10 to-yellow-500/10'
    }
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    description: 'Green matrix-style theme inspired by the digital rain',
    icon: Monitor,
    colors: {
      primary: '#00ff41',
      secondary: '#008f11',
      accent: '#39ff14',
      background: '#000000',
      surface: '#001100',
      text: '#00ff41',
      textSecondary: '#008f11'
    },
    effects: {
      glow: 'shadow-green-400/50',
      border: 'border-green-400',
      gradient: 'from-green-500/10 via-green-400/5 to-green-600/10'
    }
  },
  {
    id: 'dark',
    name: 'Dark Professional',
    description: 'Clean dark theme for focused coding sessions',
    icon: Moon,
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8'
    },
    effects: {
      glow: 'shadow-blue-400/30',
      border: 'border-blue-400',
      gradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10'
    }
  },
  {
    id: 'light',
    name: 'Light Modern',
    description: 'Clean light theme for daytime coding',
    icon: Sun,
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#dc2626',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    effects: {
      glow: 'shadow-blue-400/20',
      border: 'border-blue-300',
      gradient: 'from-blue-50 via-purple-50 to-red-50'
    }
  },
  {
    id: 'synthwave',
    name: 'Synthwave Retro',
    description: '80s retro synthwave with pink and purple neons',
    icon: Sparkles,
    colors: {
      primary: '#ff0080',
      secondary: '#8000ff',
      accent: '#00ffff',
      background: '#0a0a0a',
      surface: '#2a0845',
      text: '#ff0080',
      textSecondary: '#8000ff'
    },
    effects: {
      glow: 'shadow-pink-400/50',
      border: 'border-pink-400',
      gradient: 'from-pink-500/10 via-purple-500/10 to-cyan-500/10'
    }
  }
];

interface ThemeSystemProps {
  onClose: () => void;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSystem: React.FC<ThemeSystemProps> = ({ onClose, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('python-neural-theme') || 'cyberpunk';
  });

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.id);
    localStorage.setItem('python-neural-theme', theme.id);
    onThemeChange(theme);
    
    // Apply theme to document root
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  };

  useEffect(() => {
    // Apply saved theme on component mount
    const savedTheme = themes.find(t => t.id === selectedTheme);
    if (savedTheme) {
      handleThemeSelect(savedTheme);
    }
  }, []);

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-cyan-400 pulse-neon" />
          <div>
            <h2 className="text-xl font-bold text-cyan-400 neon-text">
              ◊ VISUAL INTERFACE THEMES ◊
            </h2>
            <p className="text-sm text-purple-300">
              Customize your neural programming environment
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map(theme => (
          <div
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedTheme === theme.id
                ? 'border-cyan-400 bg-cyan-400/10 neon-glow scale-105'
                : 'border-cyan-400/50 bg-black/40 hover:bg-cyan-400/5 hover:border-cyan-400'
            } glitch`}
          >
            {/* Theme Preview */}
            <div 
              className="h-24 rounded-lg mb-3 relative overflow-hidden border"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
                borderColor: theme.colors.primary
              }}
            >
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(45deg, ${theme.colors.primary}20, ${theme.colors.secondary}20, ${theme.colors.accent}20)`
                }}
              />
              <div className="absolute top-2 left-2 flex gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div 
                  className="h-1 rounded mb-1"
                  style={{ backgroundColor: theme.colors.primary, opacity: 0.6 }}
                />
                <div 
                  className="h-1 rounded w-3/4"
                  style={{ backgroundColor: theme.colors.secondary, opacity: 0.4 }}
                />
              </div>
            </div>

            {/* Theme Info */}
            <div className="flex items-center gap-2 mb-2">
              <theme.icon 
                className="w-5 h-5" 
                style={{ color: theme.colors.primary }}
              />
              <h3 
                className="font-semibold"
                style={{ color: theme.colors.text }}
              >
                {theme.name}
              </h3>
              {selectedTheme === theme.id && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            <p 
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              {theme.description}
            </p>

            {/* Color Palette */}
            <div className="flex gap-1 mt-3">
              <div 
                className="w-4 h-4 rounded border border-white/20"
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary"
              />
              <div 
                className="w-4 h-4 rounded border border-white/20"
                style={{ backgroundColor: theme.colors.secondary }}
                title="Secondary"
              />
              <div 
                className="w-4 h-4 rounded border border-white/20"
                style={{ backgroundColor: theme.colors.accent }}
                title="Accent"
              />
              <div 
                className="w-4 h-4 rounded border border-white/20"
                style={{ backgroundColor: theme.colors.surface }}
                title="Surface"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Theme Customization Preview */}
      <div className="mt-6 p-4 hologram rounded border border-cyan-400/30">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3 neon-text">
          ◊ PREVIEW ◊
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-purple-300">Block Example</div>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-lg border border-cyan-400/30 neon-glow">
              <div className="flex items-center gap-2 text-white">
                <Monitor className="w-4 h-4 pulse-neon" />
                <span className="text-sm font-medium neon-text">Print Block</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-purple-300">Code Preview</div>
            <div className="bg-black/60 rounded-lg p-3 border border-cyan-400/30">
              <pre className="text-sm text-cyan-300 font-mono neon-text">
                print("Hello!")
              </pre>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-purple-300">Interface Elements</div>
            <div className="space-y-1">
              <div className="text-cyan-400 neon-text text-sm">◊ Primary Text ◊</div>
              <div className="text-purple-300 text-sm">Secondary Text</div>
              <div className="text-yellow-400 text-sm">Accent Text</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-purple-300">
          Theme changes are automatically saved and will persist across sessions
        </p>
      </div>
    </div>
  );
};