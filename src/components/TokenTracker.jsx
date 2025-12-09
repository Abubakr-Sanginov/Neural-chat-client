import { Coins, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

// Approximate token costs per 1M tokens (as of 2024)
const MODEL_COSTS = {
  'gemini-2.5-flash': { input: 0.075, output: 0.30 },
  'gemini-2.5-pro': { input: 1.25, output: 5.00 },
  'gemini-2.5-flash-lite': { input: 0.01, output: 0.04 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-2.0-flash-lite': { input: 0.02, output: 0.08 },
};

// Approximate token estimation (rough: 1 token ≈ 4 characters)
const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};

export default function TokenTracker({ chat, model }) {
  const [tokenCount, setTokenCount] = useState({ input: 0, output: 0 });
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    if (!chat || chat.length === 0) {
      setTokenCount({ input: 0, output: 0 });
      setEstimatedCost(0);
      return;
    }

    let inputTokens = 0;
    let outputTokens = 0;

    chat.forEach((msg) => {
      const tokens = estimateTokens(msg.message);
      if (msg.sender === 'user') {
        inputTokens += tokens;
      } else {
        outputTokens += tokens;
      }
    });

    setTokenCount({ input: inputTokens, output: outputTokens });

    // Calculate cost
    const costs = MODEL_COSTS[model] || MODEL_COSTS['gemini-2.5-flash'];
    const cost = (inputTokens / 1000000 * costs.input) + (outputTokens / 1000000 * costs.output);
    setEstimatedCost(cost);
  }, [chat, model]);

  const totalTokens = tokenCount.input + tokenCount.output;

  return (
    <div className="token-tracker bg-[#1A232E] bg-opacity-50 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Coins size={16} className="text-yellow-400" />
        <div className="text-xs">
          <div className="font-semibold text-white">{totalTokens.toLocaleString()}</div>
          <div className="text-gray-400">tokens</div>
        </div>
      </div>

      <div className="h-6 w-px bg-gray-700"></div>

      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-green-400" />
        <div className="text-xs">
          <div className="font-semibold text-white">${estimatedCost.toFixed(4)}</div>
          <div className="text-gray-400">est. cost</div>
        </div>
      </div>

      <div className="text-xs text-gray-500 ml-auto">
        ↑{tokenCount.input.toLocaleString()} ↓{tokenCount.output.toLocaleString()}
      </div>
    </div>
  );
}
