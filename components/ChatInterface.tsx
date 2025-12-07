import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { nlSearch } from '../services/nlSearch';

interface ChatInterfaceProps {
  contractText: string;
  embedded?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ contractText, embedded = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const answer = await nlSearch.query(userMsg.content, contractText);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: answer,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
       console.error(error);
       const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I encountered an error analyzing that request.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = embedded 
    ? "w-full h-full bg-transparent flex flex-col"
    : "fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-40";

  return (
    <div className={containerClasses}>
      {!embedded && (
        <div className="p-4 bg-slate-800 border-b border-slate-700 font-semibold text-white flex justify-between items-center">
          <span>Contract Assistant</span>
          <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded text-white">AI</span>
        </div>
      )}

      {embedded && messages.length === 0 && (
         <div className="flex-grow flex flex-col items-center justify-center text-slate-500 space-y-4">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             </div>
             <div className="text-center">
               <h3 className="text-lg font-medium text-white mb-2">Ask questions about your contract</h3>
               <p className="max-w-xs mx-auto text-sm">Our AI analyzes the redacted text securely. Try asking:</p>
             </div>
             <div className="flex flex-wrap gap-2 justify-center max-w-md">
                <button onClick={() => setInput("Is there a termination fee?")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-300 transition-colors">"Is there a termination fee?"</button>
                <button onClick={() => setInput("Explain the indemnity clause")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-300 transition-colors">"Explain indemnity"</button>
                <button onClick={() => setInput("Are the payment terms standard?")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-300 transition-colors">"Are payment terms standard?"</button>
             </div>
         </div>
      )}

      {(!embedded || messages.length > 0) && (
        <div className={`flex-grow p-4 overflow-y-auto space-y-4 ${embedded ? '' : 'bg-slate-900'}`} ref={scrollRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-bl-none p-4 text-sm flex gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`p-4 ${embedded ? 'bg-transparent' : 'bg-slate-800 border-t border-slate-700'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;