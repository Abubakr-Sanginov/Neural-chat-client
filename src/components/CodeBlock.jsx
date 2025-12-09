import { Copy, Check, Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';

export default function CodeBlock({ code, language, onRun }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      // Reset content to plain text before highlighting to avoid double-highlighting issues
      codeRef.current.textContent = code;
      // Remove data-highlighted attribute if present
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRunnable = ['html', 'css', 'javascript', 'js', 'jsx', 'xml', 'python', 'py'].includes((language || '').toLowerCase());

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'code'}</span>
        <div className="flex items-center gap-2">
          {onRun && (
            <button 
              className="copy-code-btn flex items-center gap-1.5 hover:text-green-400" 
              onClick={() => onRun(code, language)}
              title={isRunnable ? "Run code" : "Language not supported for browser execution"}
            >
              <Play size={14} />
              <span>Run</span>
            </button>
          )}
          <button className="copy-code-btn" onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre>
        <code ref={codeRef} className={`language-${language || 'plaintext'}`}>{code}</code>
      </pre>
    </div>
  );
}
