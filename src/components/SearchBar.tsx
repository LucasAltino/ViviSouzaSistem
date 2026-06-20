import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (value: string) => void;
  onClear: () => void;
  searchValue: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, searchValue }) => {
  const [input, setInput] = useState(searchValue);

  // Sincroniza estado interno caso o valor da busca externa seja limpo
  useEffect(() => {
    setInput(searchValue);
  }, [searchValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input.trim());
  };

  const handleClear = () => {
    setInput('');
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Buscar nó na árvore..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium glass-input text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300"
        />
        {input && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
};
