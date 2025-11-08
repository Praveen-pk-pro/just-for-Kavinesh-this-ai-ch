import React, { useState, useRef, KeyboardEvent } from 'react';
import { SendIcon } from './IconComponents';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      // Set height based on scroll height, but not more than 5 lines (approx)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset on send
      }
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200); // Corresponds to animation duration
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          disabled={isLoading}
          rows={1}
          className="w-full bg-black/20 text-gray-200 placeholder-gray-500 border border-white/10 rounded-2xl py-3 pl-4 pr-6 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 overflow-y-auto"
          style={{ maxHeight: '120px' }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading || !input.trim()}
        className={`flex-shrink-0 w-11 h-11 rounded-full bg-stone-200 text-gray-900 flex items-center justify-center hover:bg-stone-100 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200 ${isAnimating ? 'animate-trigger' : ''}`}
        aria-label="Send message"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </div>
  );
};