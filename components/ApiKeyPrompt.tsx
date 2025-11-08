
import React from 'react';

interface ApiKeyPromptProps {
  onSelectKey: () => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectKey }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center bg-black/20 p-6 sm:p-8 rounded-2xl border border-white/10 max-w-md w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 font-orbitron">API Key Required</h2>
        <p className="text-gray-400 mb-6 text-sm sm:text-base">
          Please select your Gemini API key to start chatting with the AI.
        </p>
        <button
          onClick={onSelectKey}
          className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Select API Key
        </button>
        <p className="text-xs text-gray-500 mt-4">
          For information on API keys and billing, please visit the{' '}
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-purple-400 hover:underline"
          >
            official documentation
          </a>.
        </p>
      </div>
    </div>
  );
};
