import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';

export function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10), // Send last 10 messages
          activities: [], // Real app would fetch and pass activities
          profile: {}, // Real app would pass profile
        }),
      });

      if (!response.body) throw new Error('No stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let aiContent = '';
      const aiMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              aiContent += data.text;
              
              setMessages(prev => prev.map(m => 
                m.id === aiMessageId ? { ...m, content: aiContent } : m
              ));
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const starterQuestions = [
    "What's my biggest emission source?",
    "How can I cut 10% this month?",
    "Is my diet or transport worse?"
  ];

  return (
    <div className="glass-panel flex flex-col h-[600px] p-0 overflow-hidden" style={{ borderRadius: 24 }}>
      <div className="p-4 flex items-center border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3" style={{ background: 'var(--gradient-brand)', boxShadow: '0 4px 12px var(--accent-glow)' }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V24" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>EcoTrace AI Coach</h3>
          <p className="text-xs text-gray-600 font-medium">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-gray-600 font-medium mb-6">Ask me anything about your carbon footprint!</p>
            <div className="flex flex-wrap justify-center gap-2">
              {starterQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-sm py-1.5 px-3 rounded-full border transition-all"
                  style={{ 
                    borderColor: 'rgba(22,163,74,0.3)', 
                    color: 'var(--text-primary)', 
                    background: 'rgba(255,255,255,0.4)',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(22,163,74,0.3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'rounded-br-sm shadow-sm' 
                : 'rounded-bl-sm shadow-sm'
            }`}
            style={{
              background: msg.role === 'user' ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.7)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(22,163,74,0.1)'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-4 py-3 flex space-x-1.5 items-center shadow-sm"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(22,163,74,0.1)' }}>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--accent)' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s', background: 'var(--accent)' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s', background: 'var(--accent)' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'rgba(22,163,74,0.1)', background: 'rgba(255,255,255,0.3)' }}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your footprint..."
            className="input-field flex-1 !rounded-full !py-3"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
            style={{ background: 'var(--gradient-brand)', color: 'white' }}
          >
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
