'use client'

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TypingAnimationProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  isUser?: boolean;
}

export default function TypingAnimation({ 
  text, 
  speed = 20, 
  onComplete,
  isUser = false 
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      // Variable speed based on character type
      let currentSpeed = speed;
      const char = text[currentIndex];
      
      // Slower for punctuation, faster for letters
      if (char === '.' || char === '!' || char === '?') {
        currentSpeed = speed * 3;
      } else if (char === ',' || char === ';' || char === ':') {
        currentSpeed = speed * 2;
      } else if (char === ' ') {
        currentSpeed = speed * 0.5;
      }

      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, currentSpeed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <div className="relative">
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !className || !match;
            return !isInline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {displayedText}
      </ReactMarkdown>
      
      {/* Typing cursor */}
      {!isComplete && (
        <span className="inline-block w-[2px] h-4 bg-current ml-1 typing-cursor" />
      )}
    </div>
  );
}