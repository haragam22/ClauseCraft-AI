import React, { useState } from 'react';

interface FileUploadProps {
  onProcess: (input: File | string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onProcess, isProcessing }) => {
  const [textInput, setTextInput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Pass the File object directly; contractParser will handle reading/parsing
      onProcess(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Secure Contract Analysis</h2>
        <p className="text-slate-400">Upload a contract (PDF/TXT) or paste text to begin. All processing happens in a secure, ephemeral session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paste Area */}
        <div className="col-span-1 md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">Paste Contract Text</label>
          <textarea
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            placeholder="Paste your legal agreement here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            onClick={() => onProcess(textInput)}
            disabled={!textInput.trim() || isProcessing}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isProcessing ? (
              <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : "Analyze Text"}
          </button>
        </div>

        {/* Upload Area */}
        <div className="col-span-1 md:col-span-2">
            <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-all bg-slate-900/50">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".txt,.md,.json,.pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <div className="space-y-2 pointer-events-none">
                 <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path d="M24 8l-8 8h6v16h4V16h6l-8-8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                    <path d="M8 32v8h32v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                 </svg>
                 <p className="text-slate-400 font-medium">Click to upload .pdf or .txt</p>
                 <p className="text-xs text-slate-600">Max size 5MB • PDF or Plain Text</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;