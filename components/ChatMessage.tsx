import React, { useState, useMemo } from 'react';
import type { Message } from '../types';
import { UserIcon, WarningIcon, CopyIcon, CheckIcon } from './IconComponents';

// Add declarations for window objects loaded from CDN
declare global {
  interface Window {
    marked: {
      parse(markdownString: string, options?: any): string;
    };
    DOMPurify: {
      sanitize(dirty: string | Node, config?: any): string;
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
    if (isModel && message.content) {
      navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
  
  const canCopy = isModel && !isLoading && message.content && !message.isError;
  
  const sanitizedHtml = useMemo(() => {
    if (isModel && message.content && !message.isError && window.marked && window.DOMPurify) {
      const rawHtml = window.marked.parse(message.content.trim(), { breaks: true, gfm: true });
      return window.DOMPurify.sanitize(rawHtml);
    }
    return null;
  }, [message.content, isModel, message.isError]);

  return (
    <div className={`group relative flex items-start gap-3.5 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
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
      <div className={`flex flex-col w-full max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-2xl ${isModel ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-t-2xl rounded-b-2xl prose prose-invert prose-p:my-0 prose-headings:my-2 ${bubbleStyles} ${errorBubbleStyles}`}
        >
          {isLoading && !message.content ? (
            <LoadingIndicator />
          ) : sanitizedHtml ? (
            <div className={`break-words ${errorTextStyles}`} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          ) : (
            <p className={`whitespace-pre-wrap break-words ${errorTextStyles}`}>{message.content}</p>
          )}
        </div>
        {message.timestamp && <p className="text-xs text-gray-500 mt-1.5 px-1">{message.timestamp}</p>}
      </div>

      {canCopy && (
        <button
          onClick={handleCopy}
          className="absolute bottom-1 -right-10 md:-right-12 p-1.5 rounded-full bg-gray-800/50 text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-gray-700/80"
          aria-label={isCopied ? 'Copied' : 'Copy message'}
        >
          {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};