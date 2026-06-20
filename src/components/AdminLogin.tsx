import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';

interface AdminLoginProps {
  correctPin: string;
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ correctPin, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (error) setError(false);
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleBackspace = () => {
    if (error) setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, error]);

  // Check pin
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onSuccess();
      } else {
        // Trigger vibration/shake effect or error message
        setError(true);
        // Clear pin after a brief delay
        const timer = setTimeout(() => {
          setPin('');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, correctPin, onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className={`w-full max-w-sm bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl text-center transition-all duration-300 ${
        error ? 'ring-2 ring-red-500 animate-shake' : ''
      }`}>
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0B2545] text-[#F4D35E] font-bold text-2xl shadow-md border-4 border-[#F4D35E] mb-4">
          VS
        </div>
        <h2 className="text-xl font-extrabold text-[#0B2545]">Área Restrita</h2>
        <p className="text-xs text-neutral-400 mt-1 flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" />
          Digite o PIN de acesso de 4 dígitos
        </p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 my-8">
          {[0, 1, 2, 3].map(index => (
            <div
              key={index}
              className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-200 ${
                error
                  ? 'border-red-500 bg-red-100'
                  : index < pin.length
                  ? 'bg-[#0B2545] border-[#0B2545] scale-110'
                  : 'border-neutral-300 bg-neutral-50'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <div className="h-5 mb-4">
          {error && (
            <p className="text-xs font-bold text-red-500 animate-pulse">
              PIN Incorreto. Tente novamente!
            </p>
          )}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 w-14 rounded-full bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 text-lg font-bold text-neutral-700 transition-colors flex items-center justify-center border border-neutral-100"
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={handleClear}
            className="h-14 w-14 rounded-full text-xs font-bold text-neutral-400 hover:text-neutral-600 transition-colors flex items-center justify-center"
          >
            Limpar
          </button>
          
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 w-14 rounded-full bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 text-lg font-bold text-neutral-700 transition-colors flex items-center justify-center border border-neutral-100"
          >
            0
          </button>
          
          <button
            onClick={handleBackspace}
            className="h-14 w-14 rounded-full text-neutral-500 hover:text-neutral-700 active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
