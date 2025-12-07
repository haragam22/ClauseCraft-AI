import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import { AnalysisResult } from './types';
import { contractParser } from './services/contractParser';
import { securityLayer } from './services/securityLayer';
import { riskAnalysis } from './services/riskAnalysis';
import { ttsGenerator } from './services/ttsGenerator';

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [contractText, setContractText] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize secure session on mount
  useEffect(() => {
    const id = securityLayer.initSession();
    setSessionId(id);
    
    // Cleanup on unmount (refresh/close)
    return () => {
      securityLayer.clearSession();
    };
  }, []);

  const handleProcess = useCallback(async (input: File | string) => {
    setIsProcessing(true);
    try {
      // 1. Parse (Clean & Extract if PDF)
      // contractParser now handles File reading (including PDF vision extraction) or string passthrough
      const text = await contractParser.parse(input);
      
      // 2. Redact PII locally for UI display state 
      // Note: The `secureExecute` inside riskAnalysis will do it again for the API call,
      // but we store the redacted version in UI state to be safe.
      const safeText = securityLayer.redactPII(text);
      setContractText(safeText);

      // 3. Analyze (Using Secure Wrapper implicitly via module)
      // We pass the raw text here because riskAnalysis.analyze calls secureExecute,
      // which handles redaction internally before sending to API.
      const result = await riskAnalysis.analyze(text);
      setAnalysis(result);
    } catch (error) {
      console.error("Processing failed", error);
      alert("Failed to analyze contract. Please check console for details.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleClearSession = useCallback(() => {
    securityLayer.clearSession();
    setContractText(null);
    setAnalysis(null);
    setIsProcessing(false);
    
    // Start a fresh session immediately
    const newId = securityLayer.initSession();
    setSessionId(newId);
  }, []);

  const handlePlaySummary = useCallback(async (text: string) => {
    const audioBuffer = await ttsGenerator.generate(text);
    if (audioBuffer) {
      ttsGenerator.play(audioBuffer);
    }
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
        </div>

        <div className="z-10 bg-slate-900/50 p-12 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4">
          <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Secure Access</h1>
          <p className="mb-8 text-slate-400 text-center text-sm">Enter your 4-digit PIN to unlock ClauseCraft AI<br/>Session memory is isolated and ephemeral.</p>
    
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-2xl tracking-[0.5em] p-4 rounded-xl text-center w-48 mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:tracking-normal"
            placeholder="••••"
          />
    
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            onClick={() => {
              if (pin === "1234") setAuthenticated(true);
            }}
          >
            Unlock Session
          </button>
    
          <p className="mt-8 text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Zero-Trust Architecture Active
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout onClearSession={handleClearSession}>
      {!analysis ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FileUpload onProcess={handleProcess} isProcessing={isProcessing} />
        </div>
      ) : (
        <Dashboard 
          analysis={analysis} 
          contractText={contractText || ""}
          onPlaySummary={handlePlaySummary} 
        />
      )}
    </Layout>
  );
};

export default App;