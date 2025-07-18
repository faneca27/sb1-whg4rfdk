import React, { useState } from 'react';
import { Folder, Play, Copy, Star } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  blocks: string[];
  code: string;
  concepts: string[];
}

const exampleProjects: Project[] = [
  {
    id: 'calculator',
    title: 'Simple Calculator',
    description: 'Create a basic calculator with functions for math operations',
    difficulty: 'Beginner',
    blocks: ['function', 'variable', 'print', 'if'],
    code: `def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

num1 = 10
num2 = 5
result = add(num1, num2)
print(f"{num1} + {num2} = {result}")`,
    concepts: ['Functions', 'Variables', 'Math Operations', 'Return Values']
  },
  {
    id: 'guessing-game',
    title: 'Number Guessing Game',
    description: 'Interactive game where user guesses a random number',
    difficulty: 'Intermediate',
    blocks: ['import', 'variable', 'while', 'if', 'elif', 'else', 'print'],
    code: `import random

secret_number = random.randint(1, 100)
guess = 0
attempts = 0

while guess != secret_number:
    guess = int(input("Guess a number (1-100): "))
    attempts += 1
    
    if guess < secret_number:
        print("Too low!")
    elif guess > secret_number:
        print("Too high!")
    else:
        print(f"Correct! You got it in {attempts} attempts!")`,
    concepts: ['Loops', 'Conditionals', 'Random Numbers', 'User Input']
  },
  {
    id: 'todo-list',
    title: 'Todo List Manager',
    description: 'Manage tasks with add, remove, and display functions',
    difficulty: 'Intermediate',
    blocks: ['class', 'method', 'attribute', 'for', 'if', 'print'],
    code: `class TodoList:
    def __init__(self):
        self.tasks = []
    
    def add_task(self, task):
        self.tasks.append(task)
        print(f"Added: {task}")
    
    def remove_task(self, task):
        if task in self.tasks:
            self.tasks.remove(task)
            print(f"Removed: {task}")
    
    def show_tasks(self):
        if self.tasks:
            for i, task in enumerate(self.tasks, 1):
                print(f"{i}. {task}")
        else:
            print("No tasks!")

todo = TodoList()
todo.add_task("Learn Python")
todo.add_task("Build an app")
todo.show_tasks()`,
    concepts: ['Classes', 'Methods', 'Lists', 'Object-Oriented Programming']
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    description: 'Generate secure passwords with customizable options',
    difficulty: 'Advanced',
    blocks: ['import', 'function', 'for', 'variable', 'if', 'print'],
    code: `import random
import string

def generate_password(length=12, include_symbols=True):
    characters = string.ascii_letters + string.digits
    if include_symbols:
        characters += string.punctuation
    
    password = ""
    for i in range(length):
        password += random.choice(characters)
    
    return password

def check_strength(password):
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_symbol = any(c in string.punctuation for c in password)
    
    strength = sum([has_upper, has_lower, has_digit, has_symbol])
    
    if strength >= 4 and len(password) >= 12:
        return "Strong"
    elif strength >= 3 and len(password) >= 8:
        return "Medium"
    else:
        return "Weak"

password = generate_password(16, True)
strength = check_strength(password)
print(f"Generated password: {password}")
print(f"Strength: {strength}")`,
    concepts: ['String Manipulation', 'Random Generation', 'Functions', 'Validation']
  }
];

interface ExampleProjectsProps {
  onClose: () => void;
  onLoadProject: (code: string) => void;
}

export const ExampleProjects: React.FC<ExampleProjectsProps> = ({ onClose, onLoadProject }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 border-green-400/50';
      case 'Intermediate': return 'text-yellow-400 border-yellow-400/50';
      case 'Advanced': return 'text-red-400 border-red-400/50';
      default: return 'text-cyan-400 border-cyan-400/50';
    }
  };

  const handleLoadProject = (project: Project) => {
    onLoadProject(project.code);
    onClose();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (selectedProject) {
    return (
      <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProject(null)}
              className="p-2 hover:bg-cyan-400/20 rounded text-cyan-400 transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-bold text-cyan-400 neon-text">
                {selectedProject.title}
              </h2>
              <span className={`text-sm px-2 py-1 rounded border ${getDifficultyColor(selectedProject.difficulty)}`}>
                {selectedProject.difficulty}
              </span>
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
          <p className="text-purple-300">{selectedProject.description}</p>

          <div>
            <h4 className="text-sm font-medium text-yellow-400 mb-2 neon-text">
              ◊ CONCEPTS LEARNED ◊
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject.concepts.map(concept => (
                <span
                  key={concept}
                  className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/50 rounded text-sm text-purple-300 neon-glow"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-cyan-400 mb-2 neon-text">
              ◊ REQUIRED BLOCKS ◊
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject.blocks.map(block => (
                <span
                  key={block}
                  className="px-3 py-1 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/50 rounded text-sm text-cyan-300 neon-glow"
                >
                  {block}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-400 neon-text">
                ◊ COMPLETE CODE ◊
              </h4>
              <button
                onClick={() => copyCode(selectedProject.code)}
                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-500 rounded text-sm text-white transition-all duration-300 neon-glow"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <div className="bg-black/60 rounded-lg p-4 border border-cyan-400/30 max-h-64 overflow-y-auto">
              <pre className="text-sm text-cyan-300 font-mono neon-text whitespace-pre-wrap">
                {selectedProject.code}
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleLoadProject(selectedProject)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 rounded text-white transition-all duration-300 neon-glow glitch"
            >
              <Play className="w-4 h-4" />
              Load Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hologram p-6 rounded-lg border border-cyan-400/30 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-cyan-400 pulse-neon" />
          <h2 className="text-xl font-bold text-cyan-400 neon-text">
            ◊ PROJECT TEMPLATES ◊
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exampleProjects.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="p-4 bg-black/40 border border-cyan-400/50 rounded-lg cursor-pointer hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-200 neon-glow glitch"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-cyan-300 neon-text">
                {project.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(project.difficulty)}`}>
                {project.difficulty}
              </span>
            </div>
            
            <p className="text-purple-300 text-sm mb-3">
              {project.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-300">
                {project.concepts.length} concepts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};