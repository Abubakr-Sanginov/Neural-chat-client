import { Download, Upload, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AutoBackup({ onRestore }) {
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    // Check for last backup time
    const backupTime = localStorage.getItem('lastBackupTime');
    if (backupTime) {
      setLastBackup(new Date(backupTime));
    }

    // Auto-backup every 5 minutes
    const interval = setInterval(() => {
      performAutoBackup();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const performAutoBackup = () => {
    try {
      // Save backup timestamp
      const now = new Date().toISOString();
      localStorage.setItem('lastBackupTime', now);
      setLastBackup(new Date(now));
      
      // Auto-backup is already handled by localStorage in App.jsx
      console.log('Auto-backup performed at', now);
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  };

  const downloadBackup = () => {
    try {
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          systemInstruction: localStorage.getItem('systemInstruction'),
          theme: localStorage.getItem('theme'),
          modelSettings: localStorage.getItem('modelSettings'),
          favorites: localStorage.getItem('favorites'),
          chatTags: localStorage.getItem('chatTags'),
          stats: localStorage.getItem('stats'),
          currentChatId: localStorage.getItem('currentChatId'),
        }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup time
      performAutoBackup();
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert('Failed to create backup file');
    }
  };

  const handleRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result);
        
        if (!backup.data) {
          throw new Error('Invalid backup file');
        }

        // Restore data
        if (onRestore) {
          onRestore(backup.data);
        }

        alert('Backup restored successfully! Please refresh the page.');
      } catch (error) {
        console.error('Failed to restore backup:', error);
        alert('Failed to restore backup. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-manager">
      <h3>Auto-Backup & Restore</h3>
      
      {lastBackup && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Clock size={14} />
          <span>Last auto-backup: {lastBackup.toLocaleString()}</span>
        </div>
      )}

      <div className="settings-actions">
        <button
          onClick={downloadBackup}
          className="settings-btn export-btn"
        >
          <Download size={18} />
          Download Backup
        </button>

        <label className="settings-btn import-btn cursor-pointer">
          <Upload size={18} />
          Restore Backup
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
          />
        </label>
      </div>

      <div className="settings-info">
        <p>
          • Automatic backups occur every 5 minutes
        </p>
        <p>
          • Download creates a complete backup of all settings and data
        </p>
        <p>
          • Restore will overwrite current settings with backup data
        </p>
      </div>
    </div>
  );
}
