import React, { useState, useEffect } from 'react';
import { Target, Play, CheckCircle, Clock, Star, Trophy, Lightbulb } from 'lucide-react';
import { CodeBlockInstance } from './CodeBlock';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  instructions: string[];
  expectedOutput: string;
  hints: string[];
  solution: string;
  requiredBlocks: string[];
  points: number;
  timeLimit?: number; // in minutes
}

interface ChallengeSystemProps {
  blocks: CodeBlockInstance[];
  generatedCode: string;
  onClose: () => void;
  onRunCode: () => void;
  codeOutput: string;
}

const challenges: Challenge[] = [
  {
    id: 'hello-world',
    title: 'Hello, World!',
    description: 'Create your first Python program',
    difficulty: 'Beginner',
    category: 'Basics',
    instructions: [
      'Drag a Print block to the canvas',
      'Set the message to "Hello, World!"',
      'Run your code'
    ],
    expectedOutput: 'Hello, World!',
    hints: [
      'Use the Print block from the Output category',
      'Make sure to include the exclamation mark'
    ],
    solution: 'print("Hello, World!")',
    requiredBlocks: ['print'],
    points: 10
  },
  {
    id: 'variable-math',
    title: 'Variable Calculator',
    description: 'Create variables and perform calculations',
    difficulty: 'Beginner',
    category: 'Variables',
    instructions: [
      'Create a variable "a" with value 10',
      'Create a variable "b" with value 5',
      'Create a variable "result" that adds a and b',
      'Print the result'
    ],
    expectedOutput: '15',
    hints: [
      'Use Variable blocks to create a, b, and result',
      'For result, use "a + b" as the value',
      'Print the result variable'
    ],
    solution: 'a = 10\nb = 5\nresult = a + b\nprint(result)',
    requiredBlocks: ['variable', 'print'],
    points: 20
  },
  {
    id: 'age-checker',
    title: 'Age Checker',
    description: 'Check if someone can vote based on their age',
    difficulty: 'Intermediate',
    category: 'Control Flow',
    instructions: [
      'Create a variable "age" with value 18',
      'Use an if statement to check if age >= 18',
      'Print "Can vote" if true, "Too young" if false'
    ],
    expectedOutput: 'Can vote',
    hints: [
      'Use an If block with condition "age >= 18"',
      'Use an Else block for the alternative',
      'Nest Print blocks inside the if/else blocks'
    ],
    solution: 'age = 18\nif age >= 18:\n    print("Can vote")\nelse:\n    print("Too young")',
    requiredBlocks: ['variable', 'if', 'else', 'print'],
    points: 30
  },
  {
    id: 'countdown',
    title: 'Countdown Timer',
    description: 'Create a countdown from 5 to 1',
    difficulty: 'Intermediate',
    category: 'Loops',
    instructions: [
      'Use a for loop with range(5, 0, -1)',
      'Print each number in the countdown',
      'Print "Blast off!" after the loop'
    ],
    expectedOutput: '5\n4\n3\n2\n1\nBlast off!',
    hints: [
      'Use a For loop with variable "i"',
      'Set range to "range(5, 0, -1)" for countdown',
      'Print i inside the loop, then print "Blast off!" outside'
    ],
    solution: 'for i in range(5, 0, -1):\n    print(i)\nprint("Blast off!")',
    requiredBlocks: ['for', 'print'],
    points: 35
  },
  {
    id: 'greeting-function',
    title: 'Greeting Function',
    description: 'Create a function that greets people',
    difficulty: 'Advanced',
    category: 'Functions',
    instructions: [
      'Define a function called "greet" with parameter "name"',
      'Inside the function, print "Hello, " + name + "!"',
      'Call the function with "Alice" as the argument'
    ],
    expectedOutput: 'Hello, Alice!',
    hints: [
      'Use a Define Function block with name "greet" and params "name"',
      'Use a Print block inside the function',
      'Use f-string formatting: f"Hello, {name}!"',
      'Call the function: greet("Alice")'
    ],
    solution: 'def greet(name):\n    print(f"Hello, {name}!")\ngreet("Alice")',
    requiredBlocks: ['function', 'print'],
    points: 50
  },
  {
    id: 'number-guesser',
    title: 'Number Guesser',
    description: 'Create a simple number guessing game',
    difficulty: 'Advanced',
    category: 'Games',
    instructions: [
      'Import the random library',
      'Create a variable "secret" with random.randint(1, 10)',
      'Create a variable "guess" with value 5',
      'Use if/elif/else to check if guess is correct, too high, or too low'
    ],
    expectedOutput: 'varies based on random number',
    hints: [
      'Import random library first',
      'Use random.randint(1, 10) for secret number',
      'Compare guess with secret using if/elif/else',
      'Print appropriate messages for each case'
    ],
    solution: 'import random\nsecret = random.randint(1, 10)\nguess = 5\nif guess == secret:\n    print("Correct!")\nelif guess < secret:\n    print("Too low!")\nelse:\n    print("Too high!")',
    requiredBlocks: ['import', 'variable', 'if', 'elif', 'else', 'print'],
    points: 60,
    timeLimit: 10
  }
];

export const ChallengeSystem: React.FC<ChallengeSystemProps> = ({
  blocks,
  generatedCode,
  onClose,
  onRunCode,
  codeOutput
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('python-neural-completed-challenges');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [currentHint, setCurrentHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (selectedChallenge && selectedChallenge.timeLimit && !isTimerActive) {
      setTimeLeft(selectedChallenge.timeLimit * 60);
      setIsTimerActive(true);
    }
  }, [selectedChallenge]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const checkSolution = () => {
    if (!selectedChallenge) return false;
    
    // Check if required blocks are used
    const usedBlocks = new Set<string>();
    const countBlocks = (blockList: CodeBlockInstance[]) => {
      blockList.forEach(block => {
        usedBlocks.add(block.block.id);
        countBlocks(block.children);
      });
    };
    countBlocks(blocks);

    const hasRequiredBlocks = selectedChallenge.requiredBlocks.every(blockId => 
      usedBlocks.has(blockId)
    );

    // For simple challenges, check output match
    const outputMatches = selectedChallenge.expectedOutput === 'varies based on random number' || 
                         codeOutput.trim() === selectedChallenge.expectedOutput.trim();

    return hasRequiredBlocks && (outputMatches || selectedChallenge.id === 'number-guesser');
  };

  const completeChallenge = () => {
    if (!selectedChallenge) return;
    
    const newCompleted = new Set(completedChallenges);
    newCompleted.add(selectedChallenge.id);
    setCompletedChallenges(newCompleted);
    localStorage.setItem('python-neural-completed-challenges', JSON.stringify(Array.from(newCompleted)));
    
    // Update stats for achievements
    const stats = JSON.parse(localStorage.getItem('python-neural-stats') || '{}');
    stats.challengesCompleted = (stats.challengesCompleted || 0) + 1;
    localStorage.setItem('python-neural-stats', JSON.stringify(stats));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 border-green-400/50';
      case 'Intermediate': return 'text-yellow-400 border-yellow-400/50';
      case 'Advanced': return 'text-red-400 border-red-400/50';
      default: return 'text-cyan-400 border-cyan-400/50';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedChallenge) {
    const isCompleted = completedChallenges.has(selectedChallenge.id);
    const isSolved = checkSolution();

    return (
      <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedChallenge(null);
                setCurrentHint(0);
                setShowSolution(false);
                setTimeLeft(null);
                setIsTimerActive(false);
              }}
              className="p-2 hover:bg-cyan-400/20 rounded text-cyan-400 transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-bold text-cyan-400 neon-text">
                {selectedChallenge.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-1 rounded border ${getDifficultyColor(selectedChallenge.difficulty)}`}>
                  {selectedChallenge.difficulty}
                </span>
                <span className="text-sm text-purple-300">{selectedChallenge.category}</span>
                {selectedChallenge.timeLimit && timeLeft !== null && (
                  <span className={`text-sm px-2 py-1 rounded border ${
                    timeLeft < 60 ? 'text-red-400 border-red-400/50' : 'text-cyan-400 border-cyan-400/50'
                  }`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2 neon-text">
              ◊ MISSION BRIEFING ◊
            </h3>
            <p className="text-purple-300">{selectedChallenge.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2 neon-text">
              ◊ INSTRUCTIONS ◊
            </h3>
            <ol className="space-y-2">
              {selectedChallenge.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 text-green-300">
                  <span className="text-cyan-400 font-bold">{index + 1}.</span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2 neon-text">
              ◊ EXPECTED OUTPUT ◊
            </h3>
            <div className="bg-black/60 rounded-lg p-3 border border-yellow-400/30">
              <pre className="text-sm text-yellow-300 font-mono">
                {selectedChallenge.expectedOutput}
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRunCode}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 rounded text-white transition-all duration-300 neon-glow glitch"
            >
              <Play className="w-4 h-4 pulse-neon" />
              Test Solution
            </button>
            
            {isSolved && !isCompleted && (
              <button
                onClick={completeChallenge}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-orange-600 hover:to-yellow-500 rounded text-white transition-all duration-300 neon-glow glitch"
              >
                <Trophy className="w-4 h-4 pulse-neon" />
                Complete Challenge
              </button>
            )}

            <button
              onClick={() => setCurrentHint((prev) => (prev + 1) % selectedChallenge.hints.length)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-500 rounded text-white transition-all duration-300 neon-glow"
            >
              <Lightbulb className="w-4 h-4" />
              Hint ({currentHint + 1}/{selectedChallenge.hints.length})
            </button>

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-600 hover:to-purple-500 rounded text-white transition-all duration-300 neon-glow"
            >
              <Target className="w-4 h-4" />
              {showSolution ? 'Hide' : 'Show'} Solution
            </button>
          </div>

          {selectedChallenge.hints[currentHint] && (
            <div className="hologram p-4 rounded border border-blue-400/30">
              <h4 className="text-sm font-medium text-blue-400 mb-2 neon-text">
                ◊ HINT {currentHint + 1} ◊
              </h4>
              <p className="text-blue-300">{selectedChallenge.hints[currentHint]}</p>
            </div>
          )}

          {showSolution && (
            <div className="hologram p-4 rounded border border-purple-400/30">
              <h4 className="text-sm font-medium text-purple-400 mb-2 neon-text">
                ◊ SOLUTION ◊
              </h4>
              <div className="bg-black/60 rounded p-3">
                <pre className="text-sm text-purple-300 font-mono">
                  {selectedChallenge.solution}
                </pre>
              </div>
            </div>
          )}

          {isSolved && (
            <div className="hologram p-4 rounded border border-green-400/30 bg-green-400/10">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5 pulse-neon" />
                <span className="font-semibold neon-text">Challenge Solved!</span>
              </div>
              <p className="text-green-300 text-sm mt-1">
                Great job! You've successfully completed this challenge.
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="hologram p-4 rounded border border-yellow-400/30 bg-yellow-400/10">
              <div className="flex items-center gap-2 text-yellow-400">
                <Trophy className="w-5 h-5 pulse-neon" />
                <span className="font-semibold neon-text">Challenge Completed!</span>
              </div>
              <p className="text-yellow-300 text-sm mt-1">
                +{selectedChallenge.points} points earned!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-cyan-400 pulse-neon" />
          <div>
            <h2 className="text-xl font-bold text-cyan-400 neon-text">
              ◊ CODING CHALLENGES ◊
            </h2>
            <p className="text-sm text-purple-300">
              {completedChallenges.size}/{challenges.length} completed
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map(challenge => {
          const isCompleted = completedChallenges.has(challenge.id);
          return (
            <div
              key={challenge.id}
              onClick={() => setSelectedChallenge(challenge)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/50 neon-glow'
                  : 'bg-black/40 border-cyan-400/50 hover:bg-cyan-400/10 hover:border-cyan-400'
              } glitch`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-cyan-300 neon-text">
                  {challenge.title}
                </h3>
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-400 pulse-neon" />
                  )}
                  <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
              </div>
              
              <p className="text-purple-300 text-sm mb-3">
                {challenge.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400">{challenge.category}</span>
                <div className="flex items-center gap-2">
                  {challenge.timeLimit && (
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {challenge.timeLimit}m
                    </span>
                  )}
                  <span className="text-xs text-purple-400 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {challenge.points}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};