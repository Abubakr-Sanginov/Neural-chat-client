import {DollarSign, Hash } from 'lucide-react';

// Simple token estimation (rough approximation: 1 token ≈ 4 characters)
const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

// Cost estimation (based on Gemini pricing)
const estimateCost = (tokens, model = 'gemini-2.5-flash') => {
  const pricing = {
    'gemini-2.5-flash': { input: 0.075 / 1000000, output: 0.3 / 1000000 },
    'gemini-2.5-pro': { input: 1.25 / 1000000, output: 5.0 / 1000000 },
    'gemini-2.0-flash': { input: 0.1 / 1000000, output: 0.4 / 1000000 },
  };
  
  const rate = pricing[model] || pricing['gemini-2.5-flash'];
  return (tokens * rate.input).toFixed(6);
};

export default function TokenCounter({ text, model, className = '' }) {
  const tokens = estimateTokens(text);
  const cost = estimateCost(tokens, model);

  return (
    <div className={`flex items-center gap-3 text-xs text-gray-400 ${className}`}>
      <div className="flex items-center gap-1" title="Estimated tokens">
        <Hash size={14} />
        <span>{tokens.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1" title="Estimated cost">
        <DollarSign size={14} />
        <span>${cost}</span>
      </div>
    </div>
  );
}
