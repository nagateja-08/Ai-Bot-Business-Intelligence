import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  Cpu,
  BarChart2,
  Table,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, ChatResponse } from '../types';

interface ChatInterfaceProps {
  onQuestionAsked?: (q: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What is the total revenue?",
    "Which product generated the highest revenue?",
    "What is the monthly revenue trend?",
    "Which region generated the highest sales?",
    "How did revenue change between two months?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load suggestions from API on mount
  useEffect(() => {
    api.getSuggestions()
      .then((res) => {
        if (res && res.length > 0) setSuggestions(res);
      })
      .catch(() => {
        // Fallback default suggestions already present
      });

    // Add initial welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to SalesIQ AI!** I am your Business Intelligence Assistant powered by Groq and MySQL.\n\nAsk me any question regarding your sales performance, monthly trends, regional breakdown, product rankings, or month-over-month comparisons.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'groq_ai'
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build lightweight conversation history
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res: ChatResponse = await api.sendChatMessage(textToSend, history);

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: res.intent,
        visualType: res.visual_type as any,
        data: res.data,
        source: res.source as any,
        executionTimeMs: res.execution_time_ms
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Unable to process query**: ${
          err?.response?.data?.detail || err?.message || 'Server connection issue. Please check backend status.'
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: "Conversation history cleared. How can I help you analyze sales data today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>SalesIQ Natural Language Assistant</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Grounded Ground-Truth Mode
              </span>
            </h3>
            <p className="text-xs text-slate-400">Interprets queries via Groq • Executes safe queries • Synthesizes verified answers</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Clear Conversation"
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 transition flex items-center space-x-1.5 border border-slate-700/60"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-925 border-b border-slate-800/50 overflow-x-auto flex items-center space-x-2 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <HelpCircle className="w-3 h-3 text-brand-400" />
          <span>Suggestions:</span>
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            disabled={loading}
            className="text-xs shrink-0 px-3 py-1 rounded-full bg-slate-800/70 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 border border-slate-700/60 hover:border-brand-500/40 transition whitespace-nowrap shadow-sm disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-500/10'
                  : msg.isError
                  ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-tl-none'
                  : 'bg-slate-850/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              {/* Message text with bolding */}
              <div className="whitespace-pre-line">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-1.5 last:mb-0">
                    {line.includes('**') ? (
                      line.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                      )
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>

              {/* Dynamic Visual Add-ons */}
              {msg.visualType === 'metric' && msg.data && msg.data.total_net_revenue !== undefined && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Total Net Revenue</span>
                    <span className="text-base font-bold text-emerald-400">
                      ₹{msg.data.total_net_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Completed Orders</span>
                    <span className="text-base font-bold text-white">
                      {msg.data.completed_transactions}
                    </span>
                  </div>
                </div>
              )}

              {msg.data?.transaction && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="font-mono font-bold text-brand-300 text-sm">{msg.data.transaction.transaction_id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      msg.data.transaction.status === 'Completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {msg.data.transaction.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Product</span>
                      <span className="font-semibold text-white">{msg.data.transaction.product}</span>
                      <span className="text-[10px] text-slate-400 block">{msg.data.transaction.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Net Realized Revenue</span>
                      <span className="font-bold text-emerald-400 text-sm">₹{msg.data.transaction.net_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Date & Region</span>
                      <span className="text-slate-300">{msg.data.transaction.order_date} • {msg.data.transaction.region}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quantity & Price</span>
                      <span className="text-slate-300">{msg.data.transaction.quantity} units @ ₹{msg.data.transaction.unit_price?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {msg.visualType === 'comparison' && msg.data && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{msg.data.month1_name}:</span>
                    <span className="font-semibold text-white">₹{msg.data.month1_revenue?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{msg.data.month2_name}:</span>
                    <span className="font-semibold text-white">₹{msg.data.month2_revenue?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold">
                    <span>Change:</span>
                    <span className={msg.data.direction === 'increase' ? 'text-emerald-400' : 'text-rose-400'}>
                      {msg.data.direction === 'increase' ? '+' : ''}₹{msg.data.absolute_difference?.toLocaleString('en-IN')} ({msg.data.percentage_change}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Message Metadata Footer */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 inline mr-1 text-slate-500" />
                  {msg.timestamp}
                </span>

                {msg.source && (
                  <span className="flex items-center space-x-2">
                    {msg.executionTimeMs && (
                      <span className="text-slate-400">{msg.executionTimeMs}ms</span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      msg.source === 'groq_ai'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {msg.source === 'groq_ai' ? 'Groq AI' : 'Deterministic Engine'}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center space-x-2.5">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="font-medium text-slate-300">Interpreting query & querying MySQL database...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask about sales, revenue, top products, regions, or trends (e.g. 'What is the total revenue?')"
            className="flex-1 bg-slate-850 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
        <div className="mt-2 text-center text-[11px] text-slate-400">
          Grounded directly in MySQL database results • Zero hallucination
        </div>
      </div>
    </div>
  );
};
