import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal, Loader2 } from 'lucide-react';

// Pyodide loader script URL
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";

const PythonSandbox = ({ initialCode = "", onClose }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const pyodideRef = useRef(null);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (window.loadPyodide) {
          pyodideRef.current = await window.loadPyodide();
          setIsReady(true);
          return;
        }

        // Load script dynamically
        const script = document.createElement('script');
        script.src = PYODIDE_URL;
        script.async = true;
        script.onload = async () => {
          try {
            pyodideRef.current = await window.loadPyodide();
            setIsReady(true);
          } catch (e) {
            setError("Failed to initialize Python environment");
          }
        };
        script.onerror = () => setError("Failed to load Pyodide script");
        document.body.appendChild(script);
      } catch (e) {
        setError(e.message);
      }
    };

    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodideRef.current || isRunning) return;

    setIsRunning(true);
    setOutput([]); // Clear previous output

    try {
      // Redirect stdout
      pyodideRef.current.setStdout({
        batched: (msg) => setOutput(prev => [...prev, { type: 'stdout', text: msg }])
      });

      // Mock input() function for interactive input
      await pyodideRef.current.runPythonAsync(`
import sys
from js import prompt

def input(prompt_text=""):
    """Mock input function using browser prompt"""
    result = prompt(str(prompt_text))
    if result is None:
        raise KeyboardInterrupt("Input cancelled")
    return str(result)

# Override built-in input
__builtins__.input = input
      `);

      // Run code
      await pyodideRef.current.loadPackagesFromImports(code);
      const result = await pyodideRef.current.runPythonAsync(code);
      
      if (result !== undefined) {
        setOutput(prev => [...prev, { type: 'result', text: String(result) }]);
      }
    } catch (err) {
      setOutput(prev => [...prev, { type: 'error', text: String(err) }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#1A232E] w-full max-w-3xl h-[80vh] rounded-lg shadow-2xl border border-gray-700 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#0F1419]">
          <div className="flex items-center gap-2">
            <Terminal className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold">Python Sandbox</h2>
            {!isReady && !error && <span className="text-xs text-yellow-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Loading Pyodide...</span>}
            {isReady && <span className="text-xs text-green-500">● Ready</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-700">
            <div className="p-2 bg-[#1A232E] border-b border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-400">main.py</span>
              <button 
                onClick={runCode}
                disabled={!isReady || isRunning}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
              >
                {isRunning ? <Loader2 size={14} className="animate-spin"/> : <Play size={14} />}
                Run
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-[#0F1419] text-gray-300 p-4 font-mono text-sm outline-none resize-none"
              spellCheck="false"
            />
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-[#0d1117]">
            <div className="p-2 border-b border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-400">Output</span>
              <button 
                onClick={() => setOutput([])}
                className="p-1 hover:bg-white/10 rounded text-gray-400"
                title="Clear Output"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
              {output.length === 0 && <span className="text-gray-600 italic">Run code to see output...</span>}
              {output.map((line, idx) => (
                <div key={idx} className={`mb-1 whitespace-pre-wrap ${
                  line.type === 'error' ? 'text-red-400' : 
                  line.type === 'result' ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  {line.type === 'result' && <span className="opacity-50 select-none">{'=> '}</span>}
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonSandbox;
