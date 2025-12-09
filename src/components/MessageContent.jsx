import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock';
import 'highlight.js/styles/atom-one-dark.css';

const MessageContent = ({ message, onRun }) => {
  // Ensure message is a string, not an object
  const messageText = typeof message === 'string' 
    ? message 
    : typeof message === 'object' 
      ? JSON.stringify(message, null, 2)
      : String(message);
      
  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");
            
            if (!inline && match) {
              return (
                <CodeBlock 
                  code={code} 
                  language={match[1]} 
                  onRun={onRun}
                />
              );
            }
            return (
              <code className={`${className} bg-gray-800 rounded px-1 py-0.5`} {...props}>
                {children}
              </code>
            );
          },
          img({ node, ...props }) {
            return (
              <img 
                {...props} 
                className="rounded-lg max-w-full h-auto my-2 border border-gray-700 shadow-md" 
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML += '<span class="text-red-400 text-sm">(Image failed to load)</span>';
                }}
              />
            );
          },
        }}
      >
        {messageText}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;
