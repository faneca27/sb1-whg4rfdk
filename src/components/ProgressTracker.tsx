import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Code, BookOpen, Zap } from 'lucide-react';
import { CodeBlockInstance } from './CodeBlock';

interface ProgressData {
  totalBlocks: number;
  uniqueBlockTypes: number;
  projectsCreated: number;
  codeExecutions: number;
  tutorialsCompleted: number;
  challengesCompleted: number;
  achievementsUnlocked: number;
  programmingLevel: string;
  skillPoints: number;
  streak: number;
  lastActiveDate: string;
}

interface Skill {
  name: string;
  level: number;
  maxLevel: number;
  experience: number;
  maxExperience: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface ProgressTrackerProps {
  blocks: CodeBlockInstance[];
  onClose: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ blocks, onClose }) => {
  const [progress, setProgress] = useState<ProgressData>(() => {
    const saved = localStorage.getItem('python-neural-progress');
    return saved ? JSON.parse(saved) : {
      totalBlocks: 0,
      uniqueBlockTypes: 0,
      projectsCreated: 0,
      codeExecutions: 0,
      tutorialsCompleted: 0,
      challengesCompleted: 0,
      achievementsUnlocked: 0,
      programmingLevel: 'Novice',
      skillPoints: 0,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
  });

  const [skills, setSkills] = useState<Skill[]>([
    {
      name: 'Basic Syntax',
      level: 1,
      maxLevel: 10,
      experience: 0,
      maxExperience: 100,
      icon: Code,
      color: 'from-blue-600 to-cyan-500'
    },
    {
      name: 'Control Flow',
      level: 1,
      maxLevel: 10,
      experience: 0,
      maxExperience: 150,
      icon: Target,
      color: 'from-green-600 to-emerald-500'
    },
    {
      name: 'Functions',
      level: 1,
      maxLevel: 10,
      experience: 0,
      maxExperience: 200,
      icon: Zap,
      color: 'from-yellow-600 to-orange-500'
    },
    {
      name: 'Object-Oriented',
      level: 1,
      maxLevel: 10,
      experience: 0,
      maxExperience: 300,
      icon: Award,
      color: 'from-purple-600 to-pink-500'
    },
    {
      name: 'Problem Solving',
      level: 1,
      maxLevel: 10,
      experience: 0,
      maxExperience: 250,
      icon: BookOpen,
      color: 'from-red-600 to-pink-500'
    }
  ]);

  useEffect(() => {
    updateProgress();
  }, [blocks]);

  const updateProgress = () => {
    const blockTypes = new Set<string>();
    let functionsUsed = 0;
    let classesUsed = 0;
    let controlFlowUsed = 0;

    const countBlocks = (blockList: CodeBlockInstance[]) => {
      blockList.forEach(block => {
        blockTypes.add(block.block.id);
        
        if (block.block.type === 'function') functionsUsed++;
        if (block.block.type === 'class') classesUsed++;
        if (['if', 'for', 'while', 'match'].includes(block.block.id)) controlFlowUsed++;
        
        countBlocks(block.children);
      });
    };

    countBlocks(blocks);

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = progress.lastActiveDate;
    const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = progress.streak;
    if (daysDiff === 1) {
      newStreak += 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    }

    // Calculate programming level
    const totalExperience = blocks.length * 5 + progress.codeExecutions * 2 + progress.challengesCompleted * 50;
    let level = 'Novice';
    if (totalExperience >= 1000) level = 'Expert';
    else if (totalExperience >= 500) level = 'Advanced';
    else if (totalExperience >= 200) level = 'Intermediate';
    else if (totalExperience >= 50) level = 'Beginner';

    const newProgress: ProgressData = {
      ...progress,
      totalBlocks: blocks.length,
      uniqueBlockTypes: blockTypes.size,
      programmingLevel: level,
      skillPoints: totalExperience,
      streak: newStreak,
      lastActiveDate: today
    };

    setProgress(newProgress);
    localStorage.setItem('python-neural-progress', JSON.stringify(newProgress));

    // Update skills
    updateSkills(blockTypes, functionsUsed, classesUsed, controlFlowUsed);
  };

  const updateSkills = (blockTypes: Set<string>, functionsUsed: number, classesUsed: number, controlFlowUsed: number) => {
    setSkills(prevSkills => prevSkills.map(skill => {
      let newExperience = skill.experience;
      
      switch (skill.name) {
        case 'Basic Syntax':
          newExperience = Math.min(blockTypes.size * 10, skill.maxExperience);
          break;
        case 'Control Flow':
          newExperience = Math.min(controlFlowUsed * 20, skill.maxExperience);
          break;
        case 'Functions':
          newExperience = Math.min(functionsUsed * 30, skill.maxExperience);
          break;
        case 'Object-Oriented':
          newExperience = Math.min(classesUsed * 40, skill.maxExperience);
          break;
        case 'Problem Solving':
          newExperience = Math.min(progress.challengesCompleted * 50, skill.maxExperience);
          break;
      }

      const newLevel = Math.min(Math.floor(newExperience / (skill.maxExperience / skill.maxLevel)) + 1, skill.maxLevel);

      return {
        ...skill,
        experience: newExperience,
        level: newLevel
      };
    }));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Novice': return 'text-gray-400';
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-orange-400';
      case 'Expert': return 'text-red-400';
      default: return 'text-cyan-400';
    }
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-cyan-400 pulse-neon" />
          <div>
            <h2 className="text-xl font-bold text-cyan-400 neon-text">
              ◊ PROGRESS MATRIX ◊
            </h2>
            <p className="text-sm text-purple-300">
              Track your programming journey
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

      {/* Overall Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="hologram p-4 rounded border border-cyan-400/30 text-center">
          <div className={`text-2xl font-bold neon-text ${getLevelColor(progress.programmingLevel)}`}>
            {progress.programmingLevel}
          </div>
          <div className="text-xs text-purple-300">Programming Level</div>
        </div>
        
        <div className="hologram p-4 rounded border border-cyan-400/30 text-center">
          <div className="text-2xl font-bold text-cyan-400 neon-text">{progress.skillPoints}</div>
          <div className="text-xs text-purple-300">Skill Points</div>
        </div>
        
        <div className="hologram p-4 rounded border border-cyan-400/30 text-center">
          <div className="text-2xl font-bold text-yellow-400 neon-text">{progress.streak}</div>
          <div className="text-xs text-purple-300">Day Streak</div>
        </div>
        
        <div className="hologram p-4 rounded border border-cyan-400/30 text-center">
          <div className="text-2xl font-bold text-green-400 neon-text">{progress.totalBlocks}</div>
          <div className="text-xs text-purple-300">Total Blocks</div>
        </div>
      </div>

      {/* Skills Progress */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 neon-text">
          ◊ SKILL DEVELOPMENT ◊
        </h3>
        <div className="space-y-3">
          {skills.map(skill => (
            <div key={skill.name} className="hologram p-4 rounded border border-cyan-400/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <skill.icon className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium text-cyan-300">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-300">Level {skill.level}</span>
                  <span className="text-xs text-cyan-400">{skill.experience}/{skill.maxExperience} XP</span>
                </div>
              </div>
              
              <div className="w-full bg-black/40 rounded-full h-2 border border-cyan-400/30">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${skill.color} transition-all duration-500`}
                  style={{ width: `${getProgressPercentage(skill.experience, skill.maxExperience)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hologram p-4 rounded border border-cyan-400/30">
          <h3 className="text-lg font-semibold text-green-400 mb-3 neon-text">
            ◊ CODING STATS ◊
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Unique Block Types:</span>
              <span className="text-cyan-300">{progress.uniqueBlockTypes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Code Executions:</span>
              <span className="text-cyan-300">{progress.codeExecutions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Projects Created:</span>
              <span className="text-cyan-300">{progress.projectsCreated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Tutorials Completed:</span>
              <span className="text-cyan-300">{progress.tutorialsCompleted}</span>
            </div>
          </div>
        </div>

        <div className="hologram p-4 rounded border border-cyan-400/30">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 neon-text">
            ◊ ACHIEVEMENTS ◊
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Challenges Completed:</span>
              <span className="text-cyan-300">{progress.challengesCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Achievements Unlocked:</span>
              <span className="text-cyan-300">{progress.achievementsUnlocked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Current Streak:</span>
              <span className="text-cyan-300">{progress.streak} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Last Active:</span>
              <span className="text-cyan-300">{progress.lastActiveDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Insights */}
      <div className="mt-6 hologram p-4 rounded border border-cyan-400/30">
        <h3 className="text-lg font-semibold text-purple-400 mb-3 neon-text">
          ◊ INSIGHTS ◊
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-cyan-400 font-medium mb-2">Strengths:</h4>
            <ul className="space-y-1 text-purple-300">
              {skills.filter(s => s.level >= 3).map(skill => (
                <li key={skill.name}>• {skill.name} (Level {skill.level})</li>
              ))}
              {skills.filter(s => s.level >= 3).length === 0 && (
                <li>• Keep practicing to develop strengths!</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-400 font-medium mb-2">Areas to Improve:</h4>
            <ul className="space-y-1 text-purple-300">
              {skills.filter(s => s.level < 3).map(skill => (
                <li key={skill.name}>• {skill.name} (Level {skill.level})</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};