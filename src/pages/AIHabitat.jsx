import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Cpu, 
  Bot, 
  Hammer, 
  Plus, 
  Terminal, 
  Zap, 
  MessageSquare,
  Settings,
  User,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DynamicTool from '../components/DynamicTool';

const ROOMS = [
  { id: 'dev', name: 'Dev Studio', icon: Terminal, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'writing', name: 'Writers Room', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'data', name: 'Data Lab', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'creative', name: 'Creative Studio', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

import { BarChart3 } from 'lucide-react';

const AIHabitat = () => {
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState('dev');
  const [tools, setTools] = useState([]);
  const [clones, setClones] = useState([
    { id: 1, name: 'Dev Assistant', role: 'Coder', status: 'online' },
    { id: 2, name: 'Data Analyst', role: 'Analyst', status: 'idle' },
  ]);

  // Load tools from localStorage
  useEffect(() => {
    const savedTools = JSON.parse(localStorage.getItem('ai_tools') || '[]');
    setTools(savedTools);
  }, []);

  return (
    <div className="flex h-screen bg-[#0F1419] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#1A232E] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="text-blue-500" /> AI Habitat
          </h1>
          <p className="text-xs text-gray-500 mt-1">Self-Evolving Workspace</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Rooms */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rooms</h2>
            <div className="space-y-1">
              {ROOMS.map(room => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeRoom === room.id 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <room.icon size={18} />
                  <span className="text-sm font-medium">{room.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Clones */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Active Clones</h2>
            <div className="space-y-2">
              {clones.map(clone => (
                <div key={clone.id} className="flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{clone.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${clone.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {clone.status}
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-700 rounded-lg text-xs text-gray-500 hover:border-gray-600 hover:text-gray-400 transition-colors">
                <Plus size={14} /> Create Clone
              </button>
            </div>
          </div>
        </div>

        {/* User Controls */}
        <div className="p-4 border-t border-gray-800 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <div className="flex-1" />
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to {ROOMS.find(r => r.id === activeRoom)?.name}</h2>
              <p className="text-gray-400">Manage your AI tools and workflows in this space.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium">
              <Hammer size={18} />
              <span>Generate New Tool</span>
            </button>
          </header>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Tool Card */}
            <div className="bg-[#1A232E] border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Terminal size={24} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">JSON Cleaner</h3>
              <p className="text-sm text-gray-400 mb-4">Automatically removes null values and empty strings from JSON objects.</p>
              <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                Open Tool
              </button>
            </div>

            {/* Dynamic Tools */}
            {tools.map(tool => (
              <DynamicTool key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHabitat;
