import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Activity, UserProfile } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface AIChatProps {
  activities?: Activity[];
  profile?: UserProfile | null;
}

export function AIChat({ activities = [], profile }: AIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }]);

    try {
      const idToken = await user.getIdToken();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
          activities: activities.slice(0, 100),
          profile: {
            location: profile?.location || 'unknown',
            householdSize: profile?.householdSize || 1,
            carType: profile?.carType || 'none',
            dietType: profile?.dietType || 'omnivore',
            displayName: profile?.displayName || 'User',
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `Server error ${response.status}`);
      }
      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line === 'data: [DONE]') break;
          if (line.startsWith('data: ')) {
            try {
              const { text: chunk } = JSON.parse(line.slice(6));
              aiContent += chunk;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: aiContent } : m
              ));
            } catch { /* partial chunk */ }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const STARTERS = [
    "What's my biggest emission source?",
    "How can I cut 20% this month?",
    "Best low-carbon swaps for me?",
    "Compare my diet vs transport impact",
  ];

  return (
    <div
      className="glass-panel flex flex-col overflow-hidden"
      style={{ borderRadius: 24, height: 580 }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 border-b shrink-0"
        style={{ borderColor: 'rgba(22,163,74,0.1)', background: 'rgba(255,255,255,0.5)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--gradient-brand)', boxShadow: '0 4px 12px var(--accent-glow)' }}
        >
          <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            EcoTrace AI Coach
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Powered by Gemini · knows your data
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(22,163,74,0.08)' }}>
          <div className="glow-dot" style={{ width: 6, height: 6 }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(22,163,74,0.08)' }}
            >
              <svg className="w-7 h-7" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                Ask me anything!
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                I have full access to your carbon data.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {STARTERS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={isTyping}
                  className="text-xs py-1.5 px-3 rounded-full border transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    borderColor: 'rgba(22,163,74,0.25)',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-1"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
                </svg>
              </div>
            )}
            <div
              className="max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: msg.role === 'user'
                  ? 'var(--gradient-brand)'
                  : 'rgba(255,255,255,0.75)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(22,163,74,0.1)',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: '0 2px 8px rgba(15,36,25,0.06)',
              }}
            >
              {msg.content || (msg.role === 'assistant' && (
                <span className="opacity-50 italic text-xs">Thinking…</span>
              ))}
            </div>
          </div>
        ))}

        {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--gradient-brand)' }}>
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
              </svg>
            </div>
            <div className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
              style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(22,163,74,0.1)' }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--accent)', animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 inline-block">
              ⚠️ {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 border-t shrink-0"
        style={{ borderColor: 'rgba(22,163,74,0.1)', background: 'rgba(255,255,255,0.4)' }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your footprint…"
            disabled={isTyping}
            className="input-field flex-1"
            style={{ borderRadius: 999, paddingTop: 10, paddingBottom: 10 }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{ background: 'var(--gradient-brand)', color: 'white' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
