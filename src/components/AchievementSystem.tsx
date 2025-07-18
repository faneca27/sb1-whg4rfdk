import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Code, Zap, Award, Lock } from 'lucide-react';
import { CodeBlockInstance } from './CodeBlock';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  condition: (stats: UserStats) => boolean;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'blocks' | 'concepts' | 'projects' | 'advanced';
  points: number;
}

interface UserStats {
  blocksUsed: Set<string>;
  projectsCreated: number;
  codeExecutions: number;
  tutorialsCompleted: number;
  challengesCompleted: number;
  totalBlocks: number;
  uniqueBlockTypes: number;
  functionsCreated: number;
  classesCreated: number;
  loopsUsed: number;
  conditionalsUsed: number;
  errorsHandled: number;
}

interface AchievementSystemProps {
  blocks: CodeBlockInstance[];
  onClose: () => void;
}

const achievements: Achievement[] = [
  {
    id: 'first-block',
    title: 'First Steps',
    description: 'Place your first block on the canvas',
    icon: Star,
    condition: (stats) => stats.totalBlocks >= 1,
    unlocked: false,
    category: 'blocks',
    points: 10
  },
  {
    id: 'hello-world',
    title: 'Hello, World!',
    description: 'Create your first print statement',
    icon: Code,
    condition: (stats) => stats.blocksUsed.has('print'),
    unlocked: false,
    category: 'concepts',
    points: 15
  },
  {
    id: 'variable-master',
    title: 'Variable Master',
    description: 'Create 5 different variables',
    icon: Target,
    condition: (stats) => Array.from(stats.blocksUsed).filter(id => id.includes('variable')).length >= 5,
    unlocked: false,
    category: 'concepts',
    points: 25
  },
  {
    id: 'control-flow',
    title: 'Flow Controller',
    description: 'Use if statements and loops',
    icon: Zap,
    condition: (stats) => stats.conditionalsUsed >= 1 && stats.loopsUsed >= 1,
    unlocked: false,
    category: 'concepts',
    points: 30
  },
  {
    id: 'function-creator',
    title: 'Function Creator',
    description: 'Define your first function',
    icon: Code,
    condition: (stats) => stats.functionsCreated >= 1,
    unlocked: false,
    category: 'advanced',
    points: 40
  },
  {
    id: 'class-architect',
    title: 'Class Architect',
    description: 'Create your first class',
    icon: Award,
    condition: (stats) => stats.classesCreated >= 1,
    unlocked: false,
    category: 'advanced',
    points: 50
  },
  {
    id: 'error-handler',
    title: 'Error Handler',
    description: 'Use try-except blocks',
    icon: Trophy,
    condition: (stats) => stats.errorsHandled >= 1,
    unlocked: false,
    category: 'advanced',
    points: 35
  },
  {
    id: 'block-collector',
    title: 'Block Collector',
    description: 'Use 10 different block types',
    icon: Star,
    condition: (stats) => stats.uniqueBlockTypes >= 10,
    unlocked: false,
    category: 'blocks',
    points: 45
  },
  {
    id: 'project-starter',
    title: 'Project Starter',
    description: 'Save your first project',
    icon: Target,
    condition: (stats) => stats.projectsCreated >= 1,
    unlocked: false,
    category: 'projects',
    points: 20
  },
  {
    id: 'code-runner',
    title: 'Code Runner',
    description: 'Execute code 10 times',
    icon: Zap,
    condition: (stats) => stats.codeExecutions >= 10,
    unlocked: false,
    category: 'concepts',
    points: 25
  }
];

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ blocks, onClose }) => {
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('python-neural-achievements');
    return saved ? JSON.parse(saved) : achievements;
  });
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('python-neural-stats');
    return saved ? JSON.parse(saved) : {
      blocksUsed: new Set(),
      projectsCreated: 0,
      codeExecutions: 0,
      tutorialsCompleted: 0,
      challengesCompleted: 0,
      totalBlocks: 0,
      uniqueBlockTypes: 0,
      functionsCreated: 0,
      classesCreated: 0,
      loopsUsed: 0,
      conditionalsUsed: 0,
      errorsHandled: 0
    };
  });
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    updateStats();
  }, [blocks]);

  const updateStats = () => {
    const blocksUsed = new Set<string>();
    let functionsCreated = 0;
    let classesCreated = 0;
    let loopsUsed = 0;
    let conditionalsUsed = 0;
    let errorsHandled = 0;

    const countBlocks = (blockList: CodeBlockInstance[]) => {
      blockList.forEach(block => {
        blocksUsed.add(block.block.id);
        
        if (block.block.type === 'function') functionsCreated++;
        if (block.block.type === 'class') classesCreated++;
        if (['for', 'while'].includes(block.block.id)) loopsUsed++;
        if (['if', 'elif', 'else', 'match', 'case'].includes(block.block.id)) conditionalsUsed++;
        if (['try', 'except', 'finally'].includes(block.block.id)) errorsHandled++;
        
        countBlocks(block.children);
      });
    };

    countBlocks(blocks);

    const newStats: UserStats = {
      ...userStats,
      blocksUsed,
      totalBlocks: blocks.length,
      uniqueBlockTypes: blocksUsed.size,
      functionsCreated,
      classesCreated,
      loopsUsed,
      conditionalsUsed,
      errorsHandled
    };

    setUserStats(newStats);
    localStorage.setItem('python-neural-stats', JSON.stringify({
      ...newStats,
      blocksUsed: Array.from(blocksUsed)
    }));

    checkAchievements(newStats);
  };

  const checkAchievements = (stats: UserStats) => {
    const updatedAchievements = userAchievements.map(achievement => {
      if (!achievement.unlocked && achievement.condition(stats)) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        setNewAchievements(prev => [...prev, unlockedAchievement]);
        return unlockedAchievement;
      }
      return achievement;
    });

    setUserAchievements(updatedAchievements);
    localStorage.setItem('python-neural-achievements', JSON.stringify(updatedAchievements));
  };

  const totalPoints = userAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const unlockedCount = userAchievements.filter(a => a.unlocked).length;
  const categories = ['blocks', 'concepts', 'projects', 'advanced'] as const;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blocks': return 'from-blue-600 to-cyan-500';
      case 'concepts': return 'from-green-600 to-emerald-500';
      case 'projects': return 'from-purple-600 to-pink-500';
      case 'advanced': return 'from-orange-600 to-red-500';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400 pulse-neon" />
          <div>
            <h2 className="text-xl font-bold text-cyan-400 neon-text">
              ◊ ACHIEVEMENT NEXUS ◊
            </h2>
            <p className="text-sm text-purple-300">
              {unlockedCount}/{achievements.length} unlocked • {totalPoints} points
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

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="hologram p-3 rounded border border-cyan-400/30 text-center">
          <div className="text-2xl font-bold text-cyan-400 neon-text">{userStats.totalBlocks}</div>
          <div className="text-xs text-purple-300">Total Blocks</div>
        </div>
        <div className="hologram p-3 rounded border border-cyan-400/30 text-center">
          <div className="text-2xl font-bold text-green-400 neon-text">{userStats.uniqueBlockTypes}</div>
          <div className="text-xs text-purple-300">Block Types</div>
        </div>
        <div className="hologram p-3 rounded border border-cyan-400/30 text-center">
          <div className="text-2xl font-bold text-yellow-400 neon-text">{totalPoints}</div>
          <div className="text-xs text-purple-300">Points</div>
        </div>
        <div className="hologram p-3 rounded border border-cyan-400/30 text-center">
          <div className="text-2xl font-bold text-purple-400 neon-text">{unlockedCount}</div>
          <div className="text-xs text-purple-300">Achievements</div>
        </div>
      </div>

      {/* Achievements by Category */}
      {categories.map(category => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3 neon-text capitalize">
            ◊ {category.toUpperCase()} ◊
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userAchievements
              .filter(achievement => achievement.category === category)
              .map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    achievement.unlocked
                      ? `bg-gradient-to-r ${getCategoryColor(category)} border-cyan-400/50 neon-glow`
                      : 'bg-black/40 border-gray-600/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${achievement.unlocked ? 'bg-white/20' : 'bg-gray-600/20'}`}>
                      {achievement.unlocked ? (
                        <achievement.icon className="w-5 h-5 text-white pulse-neon" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${achievement.unlocked ? 'text-white neon-text' : 'text-gray-400'}`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${achievement.unlocked ? 'text-cyan-200' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          achievement.unlocked ? 'bg-yellow-400/20 text-yellow-300' : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {achievement.points} pts
                        </span>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <span className="text-xs text-cyan-400">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* New Achievement Notifications */}
      {newAchievements.map((achievement, index) => (
        <div
          key={`new-${achievement.id}`}
          className="fixed top-4 right-4 bg-gradient-to-r from-yellow-600 to-orange-500 p-4 rounded-lg border border-yellow-400 neon-glow z-50 animate-bounce"
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-white pulse-neon" />
            <div>
              <div className="font-bold text-white neon-text">Achievement Unlocked!</div>
              <div className="text-sm text-yellow-200">{achievement.title}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};