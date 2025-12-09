import React, { useState, useEffect } from 'react';
import { Send, Settings, Code, Copy, Check, Loader2, Key, RefreshCw } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', endpoint: 'https://api.openai.com/v1', modelsEndpoint: '/models' },
  { id: 'anthropic', name: 'Anthropic', endpoint: 'https://api.anthropic.com/v1', staticModels: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'] },
  { id: 'openrouter', name: 'OpenRouter', endpoint: 'https://openrouter.ai/api/v1', modelsEndpoint: '/models' },
  { id: 'gemini', name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1beta', staticModels: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'deepseek', name: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1', staticModels: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'groq', name: 'Groq', endpoint: 'https://api.groq.com/openai/v1', modelsEndpoint: '/models' },
];

const ApiPlayground = () => {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState([]);
  const [model, setModel] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState("You are a helpful AI assistant.");
  const [userMessage, setUserMessage] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [copied, setCopied] = useState(false);

  const currentProvider = PROVIDERS.find(p => p.id === provider);

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setModels([]);
    setModel('');
    setApiKey('');
  };

  const fetchModels = async () => {
    if (!apiKey.trim()) return;

    setLoadingModels(true);
    try {
      // Use static models if defined
      if (currentProvider.staticModels) {
        setModels(currentProvider.staticModels);
        setModel(currentProvider.staticModels[0]);
        setLoadingModels(false);
        return;
      }

      // Fetch models from API
      const headers = {
        'Content-Type': 'application/json',
      };

      if (currentProvider.id === 'openai' || currentProvider.id === 'groq') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (currentProvider.id === 'anthropic') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else if (currentProvider.id === 'openrouter') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${currentProvider.endpoint}${currentProvider.modelsEndpoint}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      
      let modelList = [];
      if (currentProvider.id === 'openai' || currentProvider.id === 'groq') {
        modelList = data.data
          .filter(m => !m.id.includes('whisper') && !m.id.includes('tts') && !m.id.includes('dall-e'))
          .map(m => m.id)
          .sort();
      } else if (currentProvider.id === 'openrouter') {
        modelList = data.data.map(m => m.id).sort();
      }

      setModels(modelList);
      if (modelList.length > 0) {
        setModel(modelList[0]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      alert('Failed to load models. Check your API key.');
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    if (apiKey.trim()) {
      fetchModels();
    }
  }, [apiKey, provider]);

  const callOpenAI = async () => {
    const res = await fetch(`${currentProvider.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userMessage }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true
      })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            fullText += content;
            setResponse(fullText);
          } catch (e) {}
        }
      }
    }

    return fullText;
  };

  const callAnthropic = async () => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemInstruction,
        messages: [{ role: 'user', content: userMessage }],
        stream: true
      })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const content = parsed.delta?.text || '';
              fullText += content;
              setResponse(fullText);
            }
          } catch (e) {}
        }
      }
    }

    return fullText;
  };

  const handleRun = async () => {
    if (!userMessage.trim() || !apiKey.trim() || !model) {
      alert('Please enter API key, select model and enter message');
      return;
    }

    setLoading(true);
    setResponse("");
    setJsonOutput(null);

    try {
      let fullText = '';

      if (currentProvider.id === 'anthropic') {
        fullText = await callAnthropic();
      } else {
        // OpenAI-compatible API (OpenAI, Groq, DeepSeek, OpenRouter)
        fullText = await callOpenAI();
      }

      setJsonOutput({
        provider,
        model,
        systemInstruction,
        temperature,
        maxTokens,
        request: { role: "user", content: userMessage },
        response: { role: "assistant", content: fullText }
      });

    } catch (error) {
      console.error("API Error:", error);
      setResponse("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0F1419] text-white overflow-hidden">
      {/* Sidebar / Config Panel */}
      <div className="w-80 border-r border-gray-800 bg-[#1A232E] p-4 overflow-y-auto flex flex-col gap-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Code className="text-blue-400" /> API Playground
        </h1>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Provider</label>
            <select 
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full bg-[#0F1419] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
              <Key size={14} /> API Key
            </label>
            <div className="flex gap-2">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter ${currentProvider.name} API key`}
                className="flex-1 bg-[#0F1419] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              />
              <button 
                onClick={copyApiKey}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Copy"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Stored locally, never sent to our servers</p>
          </div>

          {/* Model Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-400">Model</label>
              {apiKey && !loadingModels && (
                <button 
                  onClick={fetchModels}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  title="Refresh models"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              )}
            </div>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!apiKey || loadingModels || models.length === 0}
              className="w-full bg-[#0F1419] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingModels ? (
                <option>Loading models...</option>
              ) : models.length === 0 ? (
                <option>Enter API key first</option>
              ) : (
                models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))
              )}
            </select>
            {loadingModels && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                Fetching available models...
              </div>
            )}
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Temperature: {temperature}</label>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1" 
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Max Tokens: {maxTokens}</label>
            <input 
              type="range" 
              min="100" 
              max="4000" 
              step="100" 
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* System Instruction */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">System Instruction</label>
            <textarea 
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full h-32 bg-[#0F1419] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"
              placeholder="Enter system instructions..."
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* User Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">User Message</label>
            <div className="flex gap-2">
              <textarea 
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="flex-1 h-32 bg-[#1A232E] border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 outline-none resize-none"
                placeholder="Enter your message..."
              />
              <button 
                onClick={handleRun}
                disabled={loading || !userMessage.trim() || !apiKey.trim() || !model}
                className="px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex flex-col items-center justify-center gap-1"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                <span>Run</span>
              </button>
            </div>
          </div>

          {/* Response */}
          {(response || loading) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Response</label>
              <div className="bg-[#1A232E] border border-gray-700 rounded-lg p-4 min-h-[100px] whitespace-pre-wrap">
                {response}
                {loading && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"/>}
              </div>
            </div>
          )}

          {/* JSON Output */}
          {jsonOutput && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">JSON Output</label>
              <CodeBlock 
                code={JSON.stringify(jsonOutput, null, 2)} 
                language="json" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiPlayground;
