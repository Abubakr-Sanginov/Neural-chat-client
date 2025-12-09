import React, { useEffect, useState } from 'react';
import { Lightbulb, X, Check } from 'lucide-react';

const InterfaceObserver = () => {
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    // Simulate observing user behavior
    const timer = setTimeout(() => {
      // Mock: Detect that user often asks for translations
      const shouldSuggest = Math.random() > 0.5;
      if (shouldSuggest) {
        setSuggestion({
          id: 'translator_tool',
          title: 'New Tool Suggestion',
          message: 'I noticed you translate text often. Shall I build a "Translator" widget for you?',
          action: 'Build Tool'
        });
      }
    }, 10000); // Trigger after 10 seconds for demo

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    // Logic to trigger tool generation would go here
    // For now, we just save a mock tool to localStorage
    const newTool = {
      id: 'translator_' + Date.now(),
      name: 'Translator',
      description: 'Translates text to English',
      code: `
import json
text = inputs.get('text', '')
# Mock translation logic
print(f"Translated: {text} (en)")
      `,
      schema: {
        inputs: [
          { key: 'text', label: 'Text to translate', type: 'textarea' }
        ]
      }
    };

    const tools = JSON.parse(localStorage.getItem('ai_tools') || '[]');
    localStorage.setItem('ai_tools', JSON.stringify([...tools, newTool]));
    
    alert('Tool "Translator" built and added to Habitat!');
    setSuggestion(null);
  };

  if (!suggestion) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-sm bg-[#1A232E] border border-blue-500/30 shadow-2xl rounded-xl p-4 animate-in slide-in-from-bottom-5 duration-500 z-50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
          <Lightbulb size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
          <p className="text-xs text-gray-400 mb-3">{suggestion.message}</p>
          <div className="flex gap-2">
            <button 
              onClick={handleAccept}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Check size={12} /> {suggestion.action}
            </button>
            <button 
              onClick={() => setSuggestion(null)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <X size={12} /> Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterfaceObserver;
