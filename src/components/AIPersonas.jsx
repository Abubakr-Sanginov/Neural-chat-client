import { User, Code, GraduationCap, Briefcase, Heart, Coffee, Brain } from 'lucide-react';
import { useState } from 'react';

const PERSONAS = [
  {
    id: 'default',
    name: 'По умолчанию',
    icon: User,
    instruction: 'You are a helpful AI assistant.'
  },
  {
    id: 'programmer',
    name: 'Программист',
    icon: Code,
    instruction: 'You are an expert programmer. Provide detailed code examples, explain best practices, and help debug issues. Use clear comments and follow clean code principles.'
  },
  {
    id: 'teacher',
    name: 'Учитель',
    icon: GraduationCap,
    instruction: 'You are a patient teacher. Explain concepts clearly with examples, break down complex topics, and encourage learning through questions.'
  },
  {
    id: 'business',
    name: 'Бизнес-консультант',
    icon: Briefcase,
    instruction: 'You are a business consultant. Provide strategic advice, analyze situations professionally, and focus on practical solutions and ROI.'
  },
  {
    id: 'creative',
    name: 'Креативный писатель',
    icon: Brain,
    instruction: 'You are a creative writer. Use vivid language, metaphors, and engaging storytelling to make responses interesting and memorable.'
  },
  {
    id: 'friend',
    name: 'Друг',
    icon: Heart,
    instruction: 'You are a supportive friend. Be warm, empathetic, and conversational. Show genuine interest and provide emotional support when needed.'
  },
  {
    id: 'casual',
    name: 'Непринужденный',
    icon: Coffee,
    instruction: 'You are casual and relaxed. Use informal language, be friendly, and keep responses conversational and easy to understand.'
  },
];

export default function AIPersonas({ currentPersona, onPersonaChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (persona) => {
    onPersonaChange(persona);
    setIsOpen(false);
  };

  const current = PERSONAS.find(p => p.id === currentPersona) || PERSONAS[0];
  const Icon = current.icon;

  return (
    <div className="ai-personas">
      <button 
        className="persona-toggle flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        title="Выбрать персону AI"
      >
        <Icon size={18} className="text-blue-400" />
        <span className="text-sm font-medium">{current.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-[#1A232E] border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-700">
              <h3 className="font-semibold text-sm">Выберите персону AI</h3>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {PERSONAS.map((persona) => {
                const PersonaIcon = persona.icon;
                return (
                  <button
                    key={persona.id}
                    className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors ${
                      currentPersona === persona.id ? 'bg-blue-600/20' : 'hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelect(persona.id)}
                  >
                    <div className={`mt-0.5 ${currentPersona === persona.id ? 'text-blue-400' : 'text-gray-400'}`}>
                      <PersonaIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${currentPersona === persona.id ? 'text-blue-400' : 'text-gray-200'}`}>
                          {persona.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {persona.instruction}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { PERSONAS };
