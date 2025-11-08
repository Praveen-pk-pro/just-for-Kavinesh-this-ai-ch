import React, { useState, useEffect } from 'react';

const quotes = [
  "The best way to predict the future is to invent it.",
  "AI is the new electricity.",
  "The measure of intelligence is the ability to change.",
  "Technology is best when it brings people together.",
  "Ask me anything you want to know."
];

export const WelcomeAnimation: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false); // Start fading out
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setIsVisible(true); // Start fading in
      }, 800); // Wait for fade out to complete
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 
          className={`text-3xl md:text-4xl font-semibold text-gray-500 max-w-2xl font-lora ${isVisible ? 'quote-visible' : 'quote-hidden'}`}
        >
          {quotes[currentQuoteIndex]}
        </h2>
      </div>
    </div>
  );
};