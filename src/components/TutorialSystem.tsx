import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Play, Target } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
}

interface TutorialStep {
  title: string;
  description: string;
  blocks: string[];
  code: string;
  explanation: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'basics',
    title: 'Python Basics',
    description: 'Learn variables, printing, and basic operations',
    steps: [
      {
        title: 'Your First Program',
        description: 'Create a simple Hello World program',
        blocks: ['print'],
        code: 'print("Hello, World!")',
        explanation: 'The print() function displays text on the screen. This is your first Python program!'
      },
      {
        title: 'Working with Variables',
        description: 'Store and use data in variables',
        blocks: ['variable', 'print'],
        code: 'name = "Alice"\nprint(f"Hello, {name}!")',
        explanation: 'Variables store data. Use f-strings to include variables in text.'
      }
    ]
  },
  {
    id: 'control-flow',
    title: 'Control Flow',
    description: 'Learn if statements, loops, and decision making',
    steps: [
      {
        title: 'Making Decisions',
        description: 'Use if statements to make choices',
        blocks: ['variable', 'if', 'print', 'else'],
        code: 'age = 18\nif age >= 18:\n    print("You can vote!")\nelse:\n    print("Too young to vote")',
        explanation: 'If statements let your program make decisions based on conditions.'
      }
    ]
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Create reusable code with functions',
    steps: [
      {
        title: 'Your First Function',
        description: 'Create a function that greets people',
        blocks: ['function', 'print'],
        code: 'def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("World")',
        explanation: 'Functions are reusable blocks of code. Define once, use many times!'
      }
    ]
  }
];

interface TutorialSystemProps {
  onClose: () => void;
}

export const TutorialSystem: React.FC<TutorialSystemProps> = ({ onClose }) => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleTutorialSelect = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const backToTutorials = () => {
    setSelectedTutorial(null);
    setCurrentStep(0);
  };

  if (!selectedTutorial) {
    return (
      <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-400 pulse-neon" />
            <h2 className="text-xl font-bold text-cyan-400 neon-text">
              ◊ NEURAL LEARNING PROTOCOLS ◊
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4">
          {tutorials.map(tutorial => (
            <div
              key={tutorial.id}
              onClick={() => handleTutorialSelect(tutorial)}
              className="p-4 bg-black/40 border border-cyan-400/50 rounded-lg cursor-pointer hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-200 neon-glow glitch"
            >
              <h3 className="text-lg font-semibold text-cyan-300 neon-text mb-2">
                {tutorial.title}
              </h3>
              <p className="text-purple-300 text-sm">
                {tutorial.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Target className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-300">
                  {tutorial.steps.length} lessons
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const step = selectedTutorial.steps[currentStep];

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={backToTutorials}
            className="p-2 hover:bg-cyan-400/20 rounded text-cyan-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-cyan-400 neon-text">
              {selectedTutorial.title}
            </h2>
            <p className="text-sm text-purple-300">
              Step {currentStep + 1} of {selectedTutorial.steps.length}
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

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-cyan-300 neon-text mb-2">
            {step.title}
          </h3>
          <p className="text-purple-300">
            {step.description}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-yellow-400 mb-2 neon-text">
            ◊ REQUIRED BLOCKS ◊
          </h4>
          <div className="flex flex-wrap gap-2">
            {step.blocks.map(block => (
              <span
                key={block}
                className="px-3 py-1 bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border border-cyan-400/50 rounded text-sm text-cyan-300 neon-glow"
              >
                {block}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-green-400 mb-2 neon-text">
            ◊ EXPECTED CODE ◊
          </h4>
          <div className="bg-black/60 rounded-lg p-4 border border-cyan-400/30">
            <pre className="text-sm text-cyan-300 font-mono neon-text">
              {step.code}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-purple-400 mb-2 neon-text">
            ◊ EXPLANATION ◊
          </h4>
          <p className="text-purple-300 bg-black/40 p-3 rounded border border-purple-400/30">
            {step.explanation}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-500 hover:to-gray-400 rounded text-white transition-all duration-300 neon-glow"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === selectedTutorial.steps.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-cyan-600 rounded text-white transition-all duration-300 neon-glow glitch"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};