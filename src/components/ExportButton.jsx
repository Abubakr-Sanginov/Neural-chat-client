import { Download, FileText, Code } from "lucide-react";
import { useState } from "react";

const ExportButton = ({ chat, chatTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToMarkdown = () => {
    let markdown = `# ${chatTitle || "Chat Export"}\\n\\n`;
    markdown += `Exported on: ${new Date().toLocaleString()}\\n\\n`;
    markdown += "---\\n\\n";

    chat.forEach((message, index) => {
      const sender = message.sender === "user" ? "👤 User" : "🤖 AI";
      markdown += `### ${sender}\\n\\n`;
      
      if (message.images && message.images.length > 0) {
        markdown += `*[${message.images.length} image(s) attached]*\\n\\n`;
      }
      
      markdown += `${message.message}\\n\\n`;
      markdown += "---\\n\\n";
    });

    downloadFile(markdown, `${chatTitle || "chat"}.md`, "text/markdown");
    setIsOpen(false);
  };

  const exportToText = () => {
    let text = `${chatTitle || "Chat Export"}\\n`;
    text += `Exported on: ${new Date().toLocaleString()}\\n\\n`;
    text += "=" .repeat(50) + "\\n\\n";

    chat.forEach((message) => {
      const sender = message.sender === "user" ? "User" : "AI";
      text += `[${sender}]\\n`;
      
      if (message.images && message.images.length > 0) {
        text += `[${message.images.length} image(s) attached]\\n`;
      }
      
      text += `${message.message}\\n\\n`;
      text += "-".repeat(50) + "\\n\\n";
    });

    downloadFile(text, `${chatTitle || "chat"}.txt`, "text/plain");
    setIsOpen(false);
  };

  const exportToJSON = () => {
    const data = {
      title: chatTitle || "Untitled Chat",
      exportedAt: new Date().toISOString(),
      messageCount: chat.length,
      messages: chat.map((msg, index) => ({
        index,
        sender: msg.sender,
        message: msg.message,
        hasImages: msg.images && msg.images.length > 0,
        imageCount: msg.images?.length || 0,
        timestamp: new Date().toISOString()
      }))
    };

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${chatTitle || "chat"}.json`, "application/json");
    setIsOpen(false);
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (chat.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all duration-200 group text-sm"
        title="Export chat"
      >
        <Download size={18} className="text-green-400 group-hover:text-white transition-colors" />
        <span className="font-medium group-hover:text-white">Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 bg-[#0F1419] border border-gray-700 rounded-lg shadow-xl z-[110] min-w-[150px]">
            <button
              onClick={exportToMarkdown}
              className="w-full text-left px-4 py-2 hover:bg-[#1A232E] transition-colors rounded-t-lg flex items-center gap-2"
            >
              <FileText size={16} />
              Markdown
            </button>
            <button
              onClick={exportToText}
              className="w-full text-left px-4 py-2 hover:bg-[#1A232E] transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              Text
            </button>
            <button
              onClick={exportToJSON}
              className="w-full text-left px-4 py-2 hover:bg-[#1A232E] transition-colors rounded-b-lg flex items-center gap-2"
            >
              <Code size={16} />
              JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
