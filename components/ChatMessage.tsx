import React from 'react';
import type { Message } from '../types';
import { UserIcon, WarningIcon } from './IconComponents';

interface ChatMessageProps {
  message: Message;
  isLoading: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const isModel = message.role === 'model';

  const LoadingIndicator = () => (
    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse"></div>
  );

  const bubbleStyles = isModel
    ? 'bg-black/20 rounded-bl-md'
    : 'bg-black/30 rounded-br-md';

  const errorBubbleStyles = message.isError ? 'border border-red-500/50' : '';
  const errorTextStyles = message.isError ? 'text-red-400' : 'text-gray-200';
  const errorIconBgStyles = message.isError ? 'bg-red-900/50' : 'bg-gray-800';

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
      <div className={`flex flex-col max-w-lg md:max-w-2xl items-start ${isModel ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-t-2xl rounded-b-2xl prose prose-invert prose-p:my-0 prose-headings:my-2 ${bubbleStyles} ${errorBubbleStyles}`}
        >
          {isLoading && !message.content ? (
            <LoadingIndicator />
          ) : (
            <p className={`whitespace-pre-wrap ${errorTextStyles}`}>{message.content}</p>
          )}
        </div>
        {message.timestamp && <p className="text-xs text-gray-500 mt-1.5 px-1">{message.timestamp}</p>}
      </div>
    </div>
  );
};
