
import React, { useState, useMemo } from 'react';
import type { Message } from '../types';
import { UserIcon, WarningIcon, CopyIcon, CheckIcon } from './IconComponents';

// For using CDN-loaded libraries with TypeScript
declare global {
  interface Window {
    marked: {
      parse: (markdown: string, options?: object) => string;
    };
    DOMPurify: {
      sanitize: (html: string) => string;
    };
  }
}

interface ChatMessageProps {
  message: Message;
  isLoading: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isModel = message.role === 'model';

  const handleCopy = () => {
    if (!navigator.clipboard) return;
    if (isModel && message.content) {
      navigator.clipboard.writeText(message.content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  const LoadingIndicator = () => (
    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse"></div>
  );

  const bubbleStyles = isModel
    ? 'bg-black/20 rounded-bl-md'
    : 'bg-black/30 rounded-br-md';

  const errorBubbleStyles = message.isError ? 'border border-red-500/50' : '';
  const errorTextStyles = message.isError ? 'text-red-400' : 'text-gray-200';
  const errorIconBgStyles = message.isError ? 'bg-red-900/50' : 'bg-gray-800';
  
  // Memoize the parsed content to avoid re-parsing on every render
  const renderedContent = useMemo(() => {
    if (!isModel || !message.content) {
      return message.content;
    }
    
    // Check if libraries are loaded
    if (typeof window.marked?.parse === 'function' && typeof window.DOMPurify?.sanitize === 'function') {
      // The prose classes applied to the container will style the generated HTML.
      const rawHtml = window.marked.parse(message.content, { gfm: true, breaks: true });
      return window.DOMPurify.sanitize(rawHtml);
    }
    
    // Fallback to plain text if libraries are not available
    return message.content;
  }, [message.content, isModel]);


  return (
    <div className={`flex items-start gap-3.5 animate-fade-in ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
          isModel ? errorIconBgStyles : 'bg-gray-700'
        }`}
      >
        {isModel ? (
          message.isError ? (
            <WarningIcon className="w-5 h-5 text-red-400" />
          ) : (
            <span className="text-xl">🤖</span>
          )
        ) : (
          <UserIcon className="w-5 h-5 text-gray-300" />
        )}
      </div>
      <div className={`group relative flex flex-col max-w-[85%] sm:max-w-lg md:max-w-2xl items-start ${isModel ? 'items-start' : 'items-end'}`}>
        <div
          // Tailwind's `prose` classes are used here to style the rendered markdown
          className={`px-4 py-3 rounded-t-2xl rounded-b-2xl prose prose-invert prose-p:my-0 prose-headings:my-2 ${bubbleStyles} ${errorBubbleStyles}`}
        >
          {isLoading && !message.content ? (
            <LoadingIndicator />
          ) : isModel ? (
             <div className={`${errorTextStyles}`} dangerouslySetInnerHTML={{ __html: renderedContent }} />
          ) : (
            <p className={`whitespace-pre-wrap ${errorTextStyles}`}>{message.content}</p>
          )}
        </div>
        {message.timestamp && <p className="text-xs text-gray-500 mt-1.5 px-1">{message.timestamp}</p>}
        
        {isModel && !isLoading && !message.isError && message.content && (
           <button
            onClick={handleCopy}
            className="absolute top-0 -right-9 sm:-right-10 p-1.5 bg-gray-800/80 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={isCopied ? "Copied to clipboard" : "Copy message"}
            >
            {isCopied ? (
                <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
                <CopyIcon className="w-4 h-4" />
            )}
            </button>
        )}
      </div>
    </div>
  );
};
