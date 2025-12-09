import React, { useState } from 'react';
import { ArrowLeft, Download, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProxyDownloader = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      // Use hidden form submission to support POST download without memory buffering
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3080";
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${API_URL}/api/proxy-download`;
      form.target = '_blank'; // Optional: open in new tab if needed, but for download usually not needed unless needed to prevent navigation
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'url';
      input.value = url;
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      setUrl('');
    } catch (err) {
      console.error(err);
      setError('Failed to initiate download.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-white flex flex-col font-['Eudoxus_Sans']">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-4 bg-[#1A232E]/50 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Download className="text-blue-500" /> Proxy Downloader
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#1A232E] rounded-2xl p-8 border border-gray-800 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon size={32} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Download via Proxy</h2>
            <p className="text-gray-400">
              Enter a file URL below. The server will fetch it for you, hiding your IP from the source (somewhat) and bypassing some CORS restrictions.
            </p>
          </div>

          <form onSubmit={handleDownload} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">File URL</label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/file.zip"
                  className="w-full bg-[#0F1419] border border-gray-700 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-gray-600"
                  required
                />
                <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !url}
              className={`w-full py-3.5 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all ${
                isLoading || !url
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download File
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
             <p className="text-xs text-gray-500">
               Note: The file is downloaded to the server's memory temporarily and streamed to you. Very large files might time out or consume server memory depending on implementation.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProxyDownloader;
