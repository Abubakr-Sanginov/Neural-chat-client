import React, { useState } from 'react';
import { X, Plus, Trash2, MessageSquare, Search } from 'lucide-react';

const DEFAULT_TEMPLATES = [
  {
    id: 'default_1',
    title: 'Explain Code',
    description: 'Explain a complex code snippet in simple terms',
    messages: [{ sender: 'user', message: 'Can you explain this code snippet to me step by step?' }]
  },
  {
    id: 'default_2',
    title: 'Debug Helper',
    description: 'Help find and fix bugs in code',
    messages: [{ sender: 'user', message: 'I have a bug in my code. Here is the error message and the code. Can you help me fix it?' }]
  },
  {
    id: 'default_3',
    title: 'React Component',
    description: 'Generate a functional React component',
    messages: [{ sender: 'user', message: 'Create a reusable React component for a [Component Name] with Tailwind CSS styling.' }]
  },
  {
    id: 'default_4',
    title: 'Email Drafter',
    description: 'Draft a professional email',
    messages: [{ sender: 'user', message: 'Draft a professional email to [Recipient] regarding [Subject]. Keep the tone [Tone].' }]
  },
  {
    id: 'default_5',
    title: 'Summary',
    description: 'Summarize a long text',
    messages: [{ sender: 'user', message: 'Please summarize the following text into key bullet points:' }]
  }
];

const Templates = ({ templates = [], onSelectTemplate, onCreateTemplate, onDeleteTemplate, onClose }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'custom', 'default'
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', description: '', message: '' });

  const allTemplates = [...DEFAULT_TEMPLATES, ...templates];
  
  const filteredTemplates = allTemplates.filter(t => {
    if (activeTab === 'custom' && DEFAULT_TEMPLATES.some(dt => dt.id === t.id)) return false;
    if (activeTab === 'default' && !DEFAULT_TEMPLATES.some(dt => dt.id === t.id)) return false;
    return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           t.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreate = () => {
    if (!newTemplate.title || !newTemplate.message) return;
    
    onCreateTemplate({
      id: `custom_${Date.now()}`,
      title: newTemplate.title,
      description: newTemplate.description,
      messages: [{ sender: 'user', message: newTemplate.message }]
    });
    
    setNewTemplate({ title: '', description: '', message: '' });
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A232E] w-full max-w-4xl max-h-[80vh] rounded-xl shadow-2xl flex flex-col border border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-blue-400" />
            Prompt Library
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Sidebar */}
          <div className="w-64 bg-[#0F1419] border-r border-gray-700 p-4 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1A232E]'}`}
            >
              All Templates
            </button>
            <button 
              onClick={() => setActiveTab('default')}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'default' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1A232E]'}`}
            >
              Default
            </button>
            <button 
              onClick={() => setActiveTab('custom')}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'custom' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1A232E]'}`}
            >
              My Templates
            </button>
            
            <div className="mt-auto">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} />
                New Template
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-[#1A232E]">
            {/* Search */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0F1419] text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {showCreateForm ? (
                <div className="max-w-xl mx-auto bg-[#0F1419] p-6 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Create New Template</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Title</label>
                      <input 
                        type="text" 
                        value={newTemplate.title}
                        onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                        className="w-full bg-[#1A232E] text-white px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., Bug Fixer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <input 
                        type="text" 
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                        className="w-full bg-[#1A232E] text-white px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Short description of what this prompt does"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Prompt Message</label>
                      <textarea 
                        value={newTemplate.message}
                        onChange={(e) => setNewTemplate({...newTemplate, message: e.target.value})}
                        className="w-full bg-[#1A232E] text-white px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 h-32 resize-none"
                        placeholder="Enter your prompt here..."
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-6">
                      <button 
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreate}
                        disabled={!newTemplate.title || !newTemplate.message}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Template
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <div 
                      key={template.id}
                      className="bg-[#0F1419] p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors group relative flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white truncate pr-6">{template.title}</h3>
                        {!DEFAULT_TEMPLATES.some(dt => dt.id === template.id) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTemplate(template.id);
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                        {template.description}
                      </p>
                      
                      <button 
                        onClick={() => onSelectTemplate(template)}
                        className="w-full bg-[#1A232E] hover:bg-blue-600 text-blue-400 hover:text-white py-2 rounded-lg transition-all text-sm font-medium mt-auto"
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                  
                  {filteredTemplates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No templates found matching your search.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
