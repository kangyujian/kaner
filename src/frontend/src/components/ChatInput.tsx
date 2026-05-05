import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative z-10 glass-effect border-t border-pink-100 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div
            className={`relative flex-1 rounded-3xl transition-all duration-300 ${
              isFocused ? 'ring-2 ring-pink-400 shadow-lg shadow-pink-200/50' : 'shadow-md'
            }`}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="输入消息..."
              disabled={disabled}
              className="w-full px-5 py-4 bg-white rounded-3xl resize-none focus:outline-none text-gray-800 placeholder-gray-400 border-2 border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {!input && !disabled && (
              <div className="absolute right-4 bottom-4 flex items-center gap-1 text-gray-400">
                <span className="text-sm">按 Enter 发送</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">↵</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className={`relative px-6 py-4 rounded-3xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              input.trim() && !disabled
                ? 'bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 text-white shadow-xl shadow-pink-300/50'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <span className="flex items-center gap-2">
              {disabled ? (
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-white/70 rounded-full typing-indicator" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 bg-white/70 rounded-full typing-indicator" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-white/70 rounded-full typing-indicator" style={{ animationDelay: '0.4s' }} />
                </span>
              ) : (
                <>
                  <span className="text-lg">💌</span>
                  <span>发送</span>
                </>
              )}
            </span>
            
            {input.trim() && !disabled && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs">💕</span>
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span>🌸</span>
            <span>温柔聊天中</span>
            <span>🌸</span>
          </span>
        </div>
      </div>
    </div>
  );
};