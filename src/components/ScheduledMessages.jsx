import { useState, useEffect } from 'react';
import { Clock, X, Trash2, Plus } from 'lucide-react';

export default function ScheduledMessages({ isOpen, onClose, onSchedule }) {
  const [scheduled, setScheduled] = useState(() => {
    const saved = localStorage.getItem('scheduledMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [newMessage, setNewMessage] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    localStorage.setItem('scheduledMessages', JSON.stringify(scheduled));
    
    // Check for messages to send
    const interval = setInterval(() => {
      const now = Date.now();
      scheduled.forEach(msg => {
        if (msg.time <= now && !msg.sent) {
          onSchedule(msg.message);
          setScheduled(prev => prev.map(m => 
            m.id === msg.id ? { ...m, sent: true } : m
          ));
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [scheduled, onSchedule]);

  const addScheduled = () => {
    if (!newMessage || !newTime) return;
    
    const scheduledTime = new Date(newTime).getTime();
    if (scheduledTime <= Date.now()) {
      alert('Please select a future time!');
      return;
    }

    setScheduled(prev => [...prev, {
      id: Date.now(),
      message: newMessage,
      time: scheduledTime,
      sent: false
    }]);
    
    setNewMessage('');
    setNewTime('');
  };

  const removeScheduled = (id) => {
    setScheduled(prev => prev.filter(m => m.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#1A232E] w-full max-w-2xl rounded-lg shadow-2xl border border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold">Scheduled Messages</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Add New */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold mb-3 text-gray-400">Schedule New Message</h3>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message text..."
              className="bg-[#0F1419] px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1 bg-[#0F1419] px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addScheduled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Scheduled List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-3 text-gray-400">
            Upcoming ({scheduled.filter(m => !m.sent).length})
          </h3>
          {scheduled.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No scheduled messages
            </div>
          ) : (
            <div className="space-y-2">
              {scheduled.map(msg => (
                <div 
                  key={msg.id} 
                  className={`p-3 rounded border ${
                    msg.sent 
                      ? 'border-green-700/50 bg-green-900/20' 
                      : 'border-gray-700 bg-[#0F1419]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.sent ? '✓ Sent' : new Date(msg.time).toLocaleString()}
                      </p>
                    </div>
                    {!msg.sent && (
                      <button
                        onClick={() => removeScheduled(msg.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
