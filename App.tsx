import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeAnimation } from './components/WelcomeAnimation';
import { Message } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-flash-latest',
        config: {
          systemInstruction: 'You are SSEC AI, a helpful and friendly AI assistant. Use the acronym "SSEC" in general conversation. Only provide the full name, "Sree Sakthi Engineering College", when a user specifically asks what SSEC stands for. You were created by a talented team of students from SSEC: Kavinesh.A, Durai Murugan.J, Kabilan.M, Kannan.T, and Mariselvam.M. Their team leader is known as PK,S. When asked about your creation or creators, you should proudly share this information. Always format your responses using markdown where appropriate.',
        },
      });
      setError(null); // Clear error on success
    } catch (e) {
      console.error(e);
      setError('Failed to initialize the AI model. The API key might be invalid.');
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isLoading || !userInput.trim()) return;

    if (!navigator.onLine) {
        setError('You seem to be offline. Please check your connection and try again.');
        return;
    }

    setIsLoading(true);
    setError(null);
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { role: 'user', content: userInput, timestamp };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Add a placeholder for the model's response
    setMessages(prevMessages => [...prevMessages, { role: 'model', content: '', timestamp:'' }]);

    try {
      if (!chatRef.current) {
        throw new Error('Chat session not initialized.');
      }
      
      const stream = await chatRef.current.sendMessageStream({ message: userInput });

      let text = '';
      const responseTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content = text;
          lastMessage.timestamp = responseTimestamp;
          lastMessage.isError = false;
          return newMessages;
        });
      }
    } catch (e: any) {
      console.error(e);
      let friendlyErrorMessage = 'Sorry, an unexpected error occurred. Please try again.';
      if (e && e.message) {
        if (e.message.includes('API key not valid')) {
            friendlyErrorMessage = 'The AI service is not configured correctly. Please notify the site administrator.';
        } else if (e.message.toLowerCase().includes('fetch')) {
            friendlyErrorMessage = 'Failed to connect to the AI service. Please check your internet connection.';
        } else if (e.message.includes('429')) {
            friendlyErrorMessage = 'The service is busy, please try again in a moment.';
        } else {
             friendlyErrorMessage = 'An error occurred while getting a response from the AI.';
        }
      }
      // Update the placeholder message to be an error message
      setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content = friendlyErrorMessage;
          lastMessage.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          lastMessage.isError = true;
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="flex flex-col h-screen font-sans background-grid">
       <header className="py-4 px-4 md:px-6 sticky top-0 z-10 bg-black/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3">
            <span className="text-3xl" aria-hidden="true">🤖</span>
            <h1 className="text-2xl font-extrabold tracking-wide animated-gradient-text font-orbitron">
              AI CHAT BOT AT SSEC
            </h1>
        </div>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
        {messages.length === 0 ? (
          <WelcomeAnimation />
        ) : (
          <div className="max-w-4xl w-full mx-auto space-y-8">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} isLoading={isLoading && index === messages.length - 1} />
            ))}
          </div>
        )}
      </main>

      <footer className="p-4 md:p-6 border-t border-white/10 bg-black/20 backdrop-blur-lg sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-red-400 text-center text-sm mb-2">{error}</p>}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} disabled={!!error} />
          <div className="text-center text-xs text-gray-600 mt-3">
            <p>Project by: Kavinesh.A | Durai Murugan.J | Kabilan.M | Kannan.T | Mariselvam.M</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;