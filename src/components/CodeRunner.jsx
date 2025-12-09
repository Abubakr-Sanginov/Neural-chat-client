import { useState } from 'react';
import { Play, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function CodeRunner({ code, language }) {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runJavaScript = () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // Create a safe console
      const logs = [];
      const safeConsole = {
        log: (...args) => logs.push(args.map(a => String(a)).join(' ')),
        error: (...args) => logs.push('ERROR: ' + args.map(a => String(a)).join(' ')),
        warn: (...args) => logs.push('WARN: ' + args.map(a => String(a)).join(' '))
      };

      // Create a function from the code
      const fn = new Function('console', code);
      fn(safeConsole);

      setOutput(logs.join('\n') || 'Code executed successfully (no output)');
    } catch (err) {
      setError(err.message);
    }

    setIsRunning(false);
  };

  const runPython = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // Check if Pyodide is loaded
      if (typeof window.pyodide === 'undefined') {
        setOutput('Loading Python environment...\n');
        
        // Load Pyodide
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = async () => {
          window.pyodide = await loadPyodide();
          await executePython();
        };
        document.head.appendChild(script);
      } else {
        await executePython();
      }
    } catch (err) {
      setError(err.message);
      setIsRunning(false);
    }
  };

  const executePython = async () => {
    try {
      // Redirect stdout
      await window.pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run the code
      await window.pyodide.runPythonAsync(code);

      // Get output
      const stdout = await window.pyodide.runPythonAsync('sys.stdout.getvalue()');
      setOutput(stdout || 'Code executed successfully (no output)');
    } catch (err) {
      setError(err.message);
    }
    setIsRunning(false);
  };

  const handleRun = () => {
    if (language === 'javascript' || language === 'js') {
      runJavaScript();
    } else if (language === 'python' || language === 'py') {
      runPython();
    } else {
      setError(`Code execution not supported for ${language}`);
    }
  };

  const supportedLanguages = ['javascript', 'js', 'python', 'py'];
  const canRun = supportedLanguages.includes(language?.toLowerCase());

  if (!canRun) return null;

  return (
    <div className="mt-2 space-y-2">
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors disabled:opacity-50"
      >
        <Play size={14} />
        {isRunning ? 'Running...' : 'Run Code'}
      </button>

      {(output || error) && (
        <div className={`p-3 rounded-lg ${error ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <div className="flex items-start gap-2 mb-2">
            {error ? (
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1">{error ? 'Error' : 'Output'}</p>
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {error || output}
              </pre>
            </div>
            <button
              onClick={() => {
                setOutput('');
                setError('');
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
