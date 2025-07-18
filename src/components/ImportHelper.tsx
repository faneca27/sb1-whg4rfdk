import React, { useState } from 'react';
import { Package, Search, Info } from 'lucide-react';

interface ImportHelperProps {
  availablePackages: string[];
  onSelectPackage: (packageName: string) => void;
}

export const ImportHelper: React.FC<ImportHelperProps> = ({ 
  availablePackages, 
  onSelectPackage 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packageDescriptions: Record<string, string> = {
    'math': 'Mathematical functions and constants',
    'random': 'Generate random numbers and make random choices',
    'datetime': 'Work with dates and times',
    'json': 'Parse and generate JSON data',
    'os': 'Operating system interface functions',
    'sys': 'System-specific parameters and functions',
    're': 'Regular expression operations',
    'collections': 'Specialized container datatypes',
    'itertools': 'Functions for creating iterators',
    'functools': 'Higher-order functions and operations on callable objects',
    'operator': 'Standard operators as functions',
    'string': 'String constants and classes',
    'time': 'Time-related functions',
    'calendar': 'Calendar-related functions',
    'decimal': 'Decimal fixed point and floating point arithmetic',
    'fractions': 'Rational numbers',
    'statistics': 'Statistical functions',
    'urllib': 'URL handling modules',
    'base64': 'Base64 encoding and decoding',
    'hashlib': 'Secure hash and message digest algorithms',
    'hmac': 'Keyed-Hashing for Message Authentication',
    'uuid': 'UUID objects according to RFC 4122',
    'csv': 'CSV file reading and writing',
    'sqlite3': 'SQLite database interface',
    'pickle': 'Python object serialization',
    'copy': 'Shallow and deep copy operations',
    'pprint': 'Data pretty printer'
  };

  const filteredPackages = availablePackages.filter(pkg =>
    pkg.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePackageClick = (packageName: string) => {
    setSelectedPackage(packageName);
  };

  const handleUsePackage = () => {
    if (selectedPackage) {
      onSelectPackage(selectedPackage);
      setSelectedPackage(null);
      setSearchTerm('');
    }
  };

  return (
    <div className="hologram p-4 rounded-lg border border-cyan-400/30 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-cyan-400 pulse-neon" />
        <h3 className="text-lg font-semibold text-cyan-400 neon-text">
          ◊ LIBRARY NEXUS ◊
        </h3>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search libraries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-cyan-400/50 rounded text-cyan-300 placeholder-cyan-500/50 neon-glow focus:border-purple-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
        {filteredPackages.map(pkg => (
          <div
            key={pkg}
            onClick={() => handlePackageClick(pkg)}
            className={`p-3 rounded cursor-pointer transition-all duration-200 border ${
              selectedPackage === pkg
                ? 'bg-cyan-400/20 border-cyan-400 neon-glow'
                : 'bg-black/20 border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-medium neon-text">{pkg}</span>
              <Info className="w-4 h-4 text-purple-400" />
            </div>
            {packageDescriptions[pkg] && (
              <p className="text-xs text-purple-300 mt-1">
                {packageDescriptions[pkg]}
              </p>
            )}
          </div>
        ))}
      </div>

      {selectedPackage && (
        <button
          onClick={handleUsePackage}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-purple-600 hover:to-cyan-600 rounded text-white transition-all duration-300 neon-glow glitch"
        >
          ◊ IMPORT {selectedPackage.toUpperCase()} ◊
        </button>
      )}

      {filteredPackages.length === 0 && (
        <div className="text-center text-purple-300 py-4">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No libraries found</p>
        </div>
      )}
    </div>
  );
};