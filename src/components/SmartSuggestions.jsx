import { useState } from 'react';
import { Lightbulb, Zap } from 'lucide-react';

const SUGGESTION_CATEGORIES = {
  followUp: {
    name: 'Follow-up Questions',
    icon: '🤔',
    suggestions: [
      'Can you explain that in more detail?',
      'What are some examples?',
      'Are there any alternatives?',
      'What are the pros and cons?',
    ]
  },
  clarification: {
    name: 'Clarifications',
    icon: '❓',
    suggestions: [
      'Can you simplify this?',
      'What does that mean?',
      'How does this work?',
      'Why is that important?',
    ]
  },
  expansion: {
    name: 'Expand',
    icon: '📚',
    suggestions: [
      'Tell me more about this',
      'What are the best practices?',
      'Show me a code example',
      'What are common mistakes?',
    ]
  },
  action: {
    name: 'Actions',
    icon: '⚡',
    suggestions: [
      'Summarize this conversation',
      'Create a step-by-step guide',
      'Generate code for this',
      'Make a list of key points',
    ]
  }
};

export default function SmartSuggestions({ context, onSelectSuggestion }) {
  const [selectedCategory, setSelectedCategory] = useState('followUp');
  const [customSuggestions, setCustomSuggestions] = useState([]);

  // Generate context-aware suggestions based on last message
  const generateContextSuggestions = (lastMessage) => {
    const suggestions = [];
    
    if (lastMessage?.includes('code') || lastMessage?.includes('function')) {
      suggestions.push('Can you add comments to explain the code?');
      suggestions.push('Are there any edge cases I should consider?');
    }
    
    if (lastMessage?.includes('error') || lastMessage?.includes('bug')) {
      suggestions.push('How can I debug this?');
      suggestions.push('What are common causes of this error?');
    }
    
    if (lastMessage?.includes('implement') || lastMessage?.includes('create')) {
      suggestions.push('What dependencies do I need?');
      suggestions.push('Are there any security considerations?');
    }
    
    return suggestions;
  };

  const contextSuggestions = context?.lastMessage 
    ? generateContextSuggestions(context.lastMessage)
    : [];

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={18} className="text-yellow-400" />
        <h3 className="font-semibold text-sm">Smart Suggestions</h3>
      </div>

      {/* Context-aware suggestions */}
      {contextSuggestions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Zap size={12} />
            Based on context
          </p>
          <div className="space-y-1">
            {contextSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion(suggestion)}
                className="w-full text-left px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
        {Object.entries(SUGGESTION_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              selectedCategory === key
                ? 'bg-purple-600'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTION_CATEGORIES[selectedCategory].suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(suggestion)}
            className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
