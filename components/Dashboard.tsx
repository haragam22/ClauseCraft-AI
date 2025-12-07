import React, { useState } from 'react';
import { AnalysisResult, KeyClause, NormalityResult, SearchResult } from '../types';
import { normalityCheck } from '../services/normalityCheck';
import { enhancedSummary } from '../services/enhancedSummary';
import { nlSearch } from '../services/nlSearch';
import { ttsGenerator } from '../services/ttsGenerator';
import ChatInterface from './ChatInterface';

interface DashboardProps {
  analysis: AnalysisResult;
  contractText: string;
  onPlaySummary: (text: string) => void;
}

type TabKey = 'summary' | 'clauses' | 'search' | 'compare' | 'voice' | 'raw';

const Dashboard: React.FC<DashboardProps> = ({ analysis, contractText, onPlaySummary }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  
  // Phase 4: Enhanced Summary State
  const [enhancedSummaryText, setEnhancedSummaryText] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Phase 4: Normality State
  const [clauseNumberInput, setClauseNumberInput] = useState("1");
  const [normalityResultsJson, setNormalityResultsJson] = useState<NormalityResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Phase 3: Deep Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsJson, setSearchResultsJson] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Phase 5: Voice Studio State
  const [ttsInputText, setTtsInputText] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("studio");
  const [ttsAudioOutput, setTtsAudioOutput] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Phase 3: Run Search
  const handleSearchContract = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await nlSearch.searchContract(searchQuery, contractText, analysis);
      setSearchResultsJson(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Phase 4: Generate Improved Summary
  const handleImprovedSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const text = await enhancedSummary.generate(contractText, analysis);
      setEnhancedSummaryText(text);
    } catch (e) {
      console.error(e);
      setEnhancedSummaryText("Error generating summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Phase 4: Benchmark Normality
  const handleBenchmarkNormality = async () => {
    setIsBenchmarking(true);
    try {
      // Find clause text
      const idx = parseInt(clauseNumberInput) - 1;
      let clauseTextToAnalyze = "";
      
      if (analysis.key_clauses && analysis.key_clauses[idx]) {
        clauseTextToAnalyze = analysis.key_clauses[idx].text;
      } else {
         // Fallback search
         clauseTextToAnalyze = "Clause text not found directly. Please refer to contract context.";
      }

      const result = await normalityCheck.benchmarkClause(
        clauseNumberInput, 
        clauseTextToAnalyze, 
        contractText, 
        analysis
      );
      setNormalityResultsJson(result);
    } catch (e) {
      console.error(e);
      alert("Benchmarking failed. See console.");
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Phase 5: TTS Generation
  const handleGenerateAudio = async (text: string) => {
    if (!text.trim()) {
      alert("No text to speak!");
      return;
    }
    
    // Update local input state if triggered by automation button
    setTtsInputText(text); 
    
    setIsGeneratingAudio(true);
    setTtsAudioOutput(null); // Reset player
    
    try {
      const url = await ttsGenerator.generateAudioUrl(text, voiceStyle);
      setTtsAudioOutput(url);
    } catch (e) {
      console.error("TTS failed", e);
      alert("Failed to generate audio.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Phase 5: Button A - Speak Clause
  const handleSpeakClause = () => {
    const idx = parseInt(clauseNumberInput) - 1;
    if (analysis.key_clauses && analysis.key_clauses[idx]) {
      const explanation = analysis.key_clauses[idx].explanation;
      handleGenerateAudio(explanation);
    } else {
      alert(`Clause ${clauseNumberInput} not found in analysis.`);
    }
  };

  // Phase 5: Button B - Speak Improved Summary
  const handleSpeakSummary = () => {
    if (enhancedSummaryText) {
      handleGenerateAudio(enhancedSummaryText);
    } else {
      alert("Please generate the improved summary first.");
    }
  };

  // Phase 5: Button C - Speak Search Result
  const handleSpeakSearch = () => {
    if (searchResultsJson && searchResultsJson.matches.length > 0) {
      const explanation = searchResultsJson.matches[0].explanation;
      handleGenerateAudio(explanation);
    } else {
      alert("No search results found to read.");
    }
  };

  const tabs: {id: TabKey, label: string, icon: React.ReactNode}[] = [
    { id: 'summary', label: 'Overview & Risks', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'clauses', label: 'Clauses', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'search', label: 'Deep Search', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { id: 'compare', label: 'Industry Compare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg> },
    { id: 'voice', label: 'Voice Studio', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> },
    { id: 'raw', label: 'Raw JSON', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-2">
        {tabs.map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
               activeTab === tab.id 
                 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]' 
                 : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
             }`}
           >
             {tab.icon}
             {tab.label}
           </button>
        ))}
        
        {/* Quality Score Card */}
        <div className="mt-8 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
           <span className="text-xs text-slate-500 uppercase tracking-widest">Contract Score</span>
           <div className={`text-4xl font-bold mt-2 ${getScoreColor(analysis.contract_quality_score)}`}>
             {analysis.contract_quality_score}
           </div>
           <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-current h-full" 
                style={{ width: `${analysis.contract_quality_score}%`, color: 'inherit' }}
              ></div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-12 md:col-span-9 lg:col-span-10 bg-slate-900 rounded-2xl border border-slate-800 p-6 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-4 right-4">
           <span className="px-2 py-1 bg-green-700/20 text-green-400 border border-green-700/30 text-[10px] font-mono rounded uppercase tracking-wider">
              Secure View
           </span>
        </div>

        {/* Phase 2: Overview Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Executive Summary</h3>
                <button 
                  onClick={() => {
                    setActiveTab('voice');
                    setTtsInputText(enhancedSummaryText || analysis.summary);
                    handleGenerateAudio(enhancedSummaryText || analysis.summary);
                  }}
                  className="p-2 bg-indigo-500/10 text-indigo-400 rounded-full hover:bg-indigo-500/20 transition-colors flex items-center gap-2 px-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  <span className="text-xs font-semibold">Play Audio</span>
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg mb-6">{analysis.summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                   <h4 className="text-sm font-semibold text-red-400 mb-2 uppercase tracking-wide">Overall Risks</h4>
                   <p className="text-sm text-slate-300">{analysis.overall_risks}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                   <h4 className="text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wide">Missing Clauses</h4>
                   <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                      {analysis.missing_clauses?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                   </ul>
                </div>
              </div>

              {/* Improved Summary Section */}
              <div className="border-t border-slate-800 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-indigo-400">ContractGuard Summary+</h4>
                  <button 
                    onClick={handleImprovedSummary}
                    disabled={isGeneratingSummary}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {isGeneratingSummary ? "Generating..." : "Generate Improved Summary"}
                  </button>
                </div>
                {enhancedSummaryText && (
                  <div className="bg-slate-900/50 p-6 rounded-xl border border-indigo-500/30 animate-fade-in">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{enhancedSummaryText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Key Clauses Tab */}
        {activeTab === 'clauses' && (
          <div className="space-y-4 animate-fade-in">
             <h3 className="text-lg font-semibold text-white mb-4">Key Clauses & Analysis</h3>
             {analysis.key_clauses?.map((clause, idx) => (
               <div key={idx} className="bg-slate-950 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-white text-lg">
                      <span className="text-indigo-500 mr-2">#{clause.clause_number}</span>
                      {clause.title}
                    </h4>
                    {clause.is_unusual.toLowerCase().includes('yes') && (
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30">Unusual</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-400 mb-4 font-mono text-xs bg-black/30 p-4 rounded border border-white/5 leading-relaxed">
                    {clause.text}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                       <span className="text-slate-500 text-xs uppercase font-bold">Explanation</span>
                       <p className="text-slate-300">{clause.explanation}</p>
                    </div>
                    <div>
                       <span className="text-slate-500 text-xs uppercase font-bold">Risks</span>
                       <p className="text-red-300/80">{clause.risks}</p>
                    </div>
                  </div>

                  {clause.rewritten_safer_version && (
                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                       <span className="text-green-500 text-xs uppercase font-bold mb-1 block">Safer Rewrite Suggestion</span>
                       <p className="text-green-100/70 text-sm font-mono bg-green-900/10 p-3 rounded">{clause.rewritten_safer_version}</p>
                    </div>
                  )}
               </div>
             ))}
          </div>
        )}

        {/* Phase 3: Deep Search Tab */}
        {activeTab === 'search' && (
           <div className="h-full animate-fade-in flex flex-col space-y-6">
             <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
               <h3 className="text-xl font-bold text-white mb-2">Deep Contract Search</h3>
               <p className="text-slate-400 mb-6 text-sm">Semantic search across contract text and extracted risks.</p>
               
               <div className="flex gap-3">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSearchContract()}
                   placeholder="e.g. What is the termination notice period?"
                   className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <button 
                   onClick={handleSearchContract}
                   disabled={isSearching || !searchQuery.trim()}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                 >
                   {isSearching ? "Searching..." : "Search Contract"}
                 </button>
               </div>
             </div>

             {/* Search Results Area */}
             <div className="flex-grow overflow-y-auto">
               {searchResultsJson && (
                 <div className="space-y-4">
                    <h4 className="text-sm uppercase tracking-wide text-slate-500 font-semibold">Search Results</h4>
                    {searchResultsJson.matches.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 bg-slate-950/50 rounded-xl">No matches found for your query.</div>
                    ) : (
                      searchResultsJson.matches.map((match, idx) => (
                        <div key={idx} className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                           <div className="flex items-center gap-2 mb-3">
                              <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded font-mono">Clause {match.clause_number}</span>
                           </div>
                           <p className="text-slate-200 font-medium mb-3">{match.explanation}</p>
                           <div className="bg-black/30 p-3 rounded text-sm text-slate-400 font-mono mb-3 border border-white/5">
                             "{match.matched_text}"
                           </div>
                           <p className="text-xs text-slate-500">
                             <span className="font-bold">Reasoning:</span> {match.reasoning}
                           </p>
                        </div>
                      ))
                    )}
                 </div>
               )}
             </div>
           </div>
        )}

        {/* Phase 4: Normality Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-indigo-600 rounded-xl">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white">Clause Normality Benchmark</h3>
                   <p className="text-slate-400">Compare specific clauses against industry standards.</p>
                 </div>
               </div>

               <div className="flex gap-4 items-end bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8">
                 <div className="flex-grow">
                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clause Number</label>
                   <input 
                      type="text" 
                      value={clauseNumberInput}
                      onChange={(e) => setClauseNumberInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. 1, 3.2, or Termination"
                   />
                 </div>
                 <button 
                   onClick={handleBenchmarkNormality}
                   disabled={isBenchmarking}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                   {isBenchmarking ? "Analyzing..." : "Check Normality"}
                 </button>
               </div>

               {normalityResultsJson && (
                 <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden animate-fade-in-up">
                    <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                       <span className="font-semibold text-white">Normality Results</span>
                       <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${normalityResultsJson.is_normal?.toLowerCase().includes('yes') || normalityResultsJson.is_normal?.toLowerCase().includes('normal') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                         {normalityResultsJson.is_normal}
                       </span>
                    </div>
                    <div className="p-6 space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Industry Comparison</h5>
                            <p className="text-slate-300 text-sm leading-relaxed">{normalityResultsJson.industry_comparison}</p>
                          </div>
                          <div>
                            <h5 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Analysis</h5>
                            <p className="text-slate-300 text-sm leading-relaxed">{normalityResultsJson.why_normal_or_not}</p>
                          </div>
                       </div>
                       
                       <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                          <h5 className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Recommended Safer Rewrite</h5>
                          <p className="text-indigo-100/90 text-sm font-mono whitespace-pre-wrap">{normalityResultsJson.recommended_safer_rewrite}</p>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Phase 5: Voice Studio Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-purple-600 rounded-xl">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white">Voice Studio</h3>
                   <p className="text-slate-400">Generate professional audio explanations for clauses and risks.</p>
                 </div>
               </div>

               {/* Audio Player */}
               <div className="mb-8 p-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center">
                  <h4 className="text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wide">ContractGuard Voice Output</h4>
                  {ttsAudioOutput ? (
                     <audio controls className="w-full max-w-md" src={ttsAudioOutput} autoPlay />
                  ) : (
                     <div className="w-full max-w-md h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 text-xs">
                       {isGeneratingAudio ? "Generating Audio..." : "No audio generated yet."}
                     </div>
                  )}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Controls */}
                  <div className="lg:col-span-2 space-y-6">
                     <div>
                       <label className="block text-sm font-medium text-slate-300 mb-2">Text to convert to speech</label>
                       <textarea 
                         value={ttsInputText}
                         onChange={(e) => setTtsInputText(e.target.value)}
                         className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                         placeholder="Enter text or use the buttons to auto-fill..."
                       />
                     </div>
                     
                     <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-4">
                           <label className="text-sm text-slate-400">Voice Style:</label>
                           <select 
                             value={voiceStyle}
                             onChange={(e) => setVoiceStyle(e.target.value)}
                             className="bg-slate-950 text-white border border-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-purple-500"
                           >
                             <option value="studio">Studio</option>
                             <option value="warm">Warm</option>
                             <option value="professional">Professional</option>
                             <option value="conversational">Conversational</option>
                           </select>
                        </div>
                        <button 
                          onClick={() => handleGenerateAudio(ttsInputText)}
                          disabled={isGeneratingAudio || !ttsInputText.trim()}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {isGeneratingAudio ? "Generating..." : "Generate Audio"}
                        </button>
                     </div>
                  </div>

                  {/* Right Automation Buttons */}
                  <div className="space-y-4">
                     <h4 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Quick Actions</h4>
                     
                     <button 
                       onClick={handleSpeakClause}
                       className="w-full p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-all group"
                     >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white group-hover:text-purple-400 transition-colors">Speak Clause #{clauseNumberInput}</span>
                          <svg className="w-5 h-5 text-slate-600 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </div>
                        <p className="text-xs text-slate-500">Reads the explanation for the selected clause number.</p>
                     </button>

                     <button 
                       onClick={handleSpeakSummary}
                       className="w-full p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-all group"
                     >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white group-hover:text-purple-400 transition-colors">Speak Improved Summary</span>
                          <svg className="w-5 h-5 text-slate-600 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <p className="text-xs text-slate-500">Reads the executive summary generated in the Overview tab.</p>
                     </button>

                     <button 
                       onClick={handleSpeakSearch}
                       className="w-full p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-all group"
                     >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white group-hover:text-purple-400 transition-colors">Speak Search Result</span>
                          <svg className="w-5 h-5 text-slate-600 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <p className="text-xs text-slate-500">Reads the top result from your last search query.</p>
                     </button>
                  </div>
               </div>
             </div>
          </div>
        )}

        {/* Phase 2: Raw JSON Tab */}
        {activeTab === 'raw' && (
           <div className="animate-fade-in space-y-4">
              <h3 className="text-lg font-semibold text-white">Analysis JSON Output</h3>
              <textarea 
                readOnly
                className="w-full h-[600px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-green-400/80 focus:outline-none"
                value={JSON.stringify(analysis, null, 2)}
              />
           </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;