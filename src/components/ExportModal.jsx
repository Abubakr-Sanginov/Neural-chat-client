import { useState } from 'react';
import { Download, FileText, Code, Image as ImageIcon, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ExportModal({ chat, chatTitle, onClose }) {
  const [exportFormat, setExportFormat] = useState('markdown');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);

  const exportAsMarkdown = () => {
    let content = `# ${chatTitle}\n\n`;
    
    if (includeMetadata) {
      content += `**Exported:** ${new Date().toLocaleString()}\n`;
      content += `**Messages:** ${chat.length}\n\n`;
      content += `---\n\n`;
    }

    chat.forEach((msg, idx) => {
      const sender = msg.sender === 'user' ? '👤 User' : '🤖 AI';
      content += `## ${sender}\n\n`;
      content += `${msg.message}\n\n`;
      
      if (msg.images && msg.images.length > 0) {
        content += `*[${msg.images.length} attachment(s)]*\n\n`;
      }
      
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    downloadFile(blob, `${chatTitle}.md`);
  };

  const exportAsJSON = () => {
    const data = {
      title: chatTitle,
      exportedAt: new Date().toISOString(),
      messageCount: chat.length,
      messages: chat.map(msg => ({
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.timestamp || Date.now(),
        hasAttachments: msg.images && msg.images.length > 0
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `${chatTitle}.json`);
  };

  const exportAsHTML = () => {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chatTitle}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px;
            background: #0F1419;
            color: #fff;
        }
        .header { 
            border-bottom: 2px solid #3B82F6; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        h1 { color: #3B82F6; margin: 0; }
        .metadata { color: #9CA3AF; font-size: 14px; margin-top: 10px; }
        .message { 
            margin: 20px 0; 
            padding: 15px; 
            border-radius: 8px;
            background: #1A232E;
        }
        .user { border-left: 4px solid #3B82F6; }
        .ai { border-left: 4px solid #10B981; }
        .sender { 
            font-weight: bold; 
            margin-bottom: 10px;
            color: #3B82F6;
        }
        .ai .sender { color: #10B981; }
        .content { line-height: 1.6; white-space: pre-wrap; }
        code { 
            background: #374151; 
            padding: 2px 6px; 
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${chatTitle}</h1>
        ${includeMetadata ? `
        <div class="metadata">
            Exported: ${new Date().toLocaleString()}<br>
            Messages: ${chat.length}
        </div>
        ` : ''}
    </div>
    <div class="messages">
`;

    chat.forEach(msg => {
      const senderClass = msg.sender === 'user' ? 'user' : 'ai';
      const senderName = msg.sender === 'user' ? '👤 User' : '🤖 AI';
      
      html += `
        <div class="message ${senderClass}">
            <div class="sender">${senderName}</div>
            <div class="content">${escapeHtml(msg.message)}</div>
        </div>`;
    });

    html += `
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, `${chatTitle}.html`);
  };

  const exportAsPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      pdf.text(chatTitle, margin, yPosition);
      yPosition += 10;

      // Metadata
      if (includeMetadata) {
        pdf.setFontSize(10);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Exported: ${new Date().toLocaleString()}`, margin, yPosition);
        yPosition += 5;
        pdf.text(`Messages: ${chat.length}`, margin, yPosition);
        yPosition += 10;
      }

      // Messages
      pdf.setFontSize(11);
      chat.forEach((msg, idx) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        // Sender
        pdf.setTextColor(msg.sender === 'user' ? [59, 130, 246] : [16, 185, 129]);
        pdf.setFont(undefined, 'bold');
        pdf.text(msg.sender === 'user' ? 'User' : 'AI', margin, yPosition);
        yPosition += 7;

        // Message content
        pdf.setTextColor(255, 255, 255);
        pdf.setFont(undefined, 'normal');
        const lines = pdf.splitTextToSize(msg.message, pageWidth - 2 * margin);
        
        lines.forEach(line => {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });

        yPosition += 5;
      });

      pdf.save(`${chatTitle}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Try another format.');
    }
    setExporting(false);
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleExport = async () => {
    switch (exportFormat) {
      case 'markdown':
        exportAsMarkdown();
        break;
      case 'json':
        exportAsJSON();
        break;
      case 'html':
        exportAsHTML();
        break;
      case 'pdf':
        await exportAsPDF();
        break;
    }
    
    if (exportFormat !== 'pdf') {
      onClose();
    }
  };

  const formats = [
    { id: 'markdown', name: 'Markdown', icon: FileText, desc: 'Plain text with formatting' },
    { id: 'json', name: 'JSON', icon: Code, desc: 'Structured data format' },
    { id: 'html', name: 'HTML', icon: ImageIcon, desc: 'Standalone web page' },
    { id: 'pdf', name: 'PDF', icon: Download, desc: 'Portable document' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A232E] rounded-lg max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Download size={24} className="text-blue-400" />
            Export Chat
          </h2>

          {/* Format Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium mb-2">Select Format</label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setExportFormat(format.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    exportFormat === format.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <format.icon size={18} />
                    <span className="font-medium">{format.name}</span>
                    {exportFormat === format.id && <Check size={16} className="ml-auto text-blue-400" />}
                  </div>
                  <p className="text-xs text-gray-400">{format.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Include metadata (date, message count)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              disabled={exporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
