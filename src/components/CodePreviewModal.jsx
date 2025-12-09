import React, { useEffect, useRef, useState } from 'react';
import { X, Play, RefreshCw, Terminal } from 'lucide-react';

export default function CodePreviewModal({ isOpen, onClose, code, language }) {
  const [output, setOutput] = useState([]);
  const [key, setKey] = useState(0); // To force re-render of iframe
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setOutput([]);
      setKey(prev => prev + 1);
    }
  }, [isOpen, code]);

  if (!isOpen) return null;

  const isWeb = ['html', 'css', 'xml'].includes(language.toLowerCase());
  const isJS = ['javascript', 'js', 'jsx'].includes(language.toLowerCase());

  const runCode = () => {
    setOutput([]);
    setKey(prev => prev + 1);
    
    if (isJS && iframeRef.current) {
      // For JS, we'll inject a script that captures console.log
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              // Capture console.log and send to parent
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;
              
              function sendToParent(type, args) {
                window.parent.postMessage({
                  type: 'console',
                  level: type,
                  args: Array.from(args).map(arg => String(arg))
                }, '*');
              }

              console.log = (...args) => {
                sendToParent('log', args);
                originalLog.apply(console, args);
              };

              console.error = (...args) => {
                sendToParent('error', args);
                originalError.apply(console, args);
              };

              console.warn = (...args) => {
                sendToParent('warn', args);
                originalWarn.apply(console, args);
              };
              
              try {
                ${code}
              } catch (err) {
                console.error(err.toString());
              }
            </script>
          </body>
        </html>
      `);
      doc.close();
    } else if (isWeb && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (event) => {
      if (event.data && event.data.type === 'console') {
        setOutput(prev => [...prev, { level: event.data.level, args: event.data.args }]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Auto-run on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(runCode, 100);
    }
  }, [isOpen, key]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] w-full max-w-4xl h-[80vh] rounded-xl flex flex-col shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#252526]">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Play size={18} className="text-green-400" />
              Code Preview ({language})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={runCode}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
              title="Rerun"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Preview Area */}
          <div className={`flex-1 bg-white relative ${isJS ? 'h-1/2 md:h-full' : 'h-full'}`}>
            <iframe
              ref={iframeRef}
              key={key}
              title="preview"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-modals"
            />
          </div>

          {/* Console Output (for JS) */}
          {isJS && (
            <div className="h-1/2 md:h-full md:w-1/3 bg-[#1e1e1e] border-t md:border-t-0 md:border-l border-gray-700 flex flex-col">
              <div className="p-2 bg-[#252526] border-b border-gray-700 flex items-center gap-2 text-gray-400 text-sm">
                <Terminal size={14} />
                Console Output
              </div>
              <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-2">
                {output.length === 0 ? (
                  <div className="text-gray-500 italic">No output</div>
                ) : (
                  output.map((log, i) => (
                    <div key={i} className={`
                      ${log.level === 'error' ? 'text-red-400' : 
                        log.level === 'warn' ? 'text-yellow-400' : 'text-gray-300'}
                    `}>
                      <span className="opacity-50 mr-2">[{log.level}]</span>
                      {log.args.join(' ')}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
