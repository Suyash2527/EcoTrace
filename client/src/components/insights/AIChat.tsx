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
    <Card className="flex flex-col h-[600px] p-0 overflow-hidden">
      <div className="bg-forest-900/80 p-4 border-b border-forest-400/20 flex items-center">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mr-3">
          🌱
        </div>
        <div>
          <h3 className="font-medium text-cream-100">EcoTrace AI Coach</h3>
          <p className="text-xs text-forest-300">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-forest-300 mb-6">Ask me anything about your carbon footprint!</p>
            <div className="flex flex-wrap justify-center gap-2">
              {starterQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="bg-forest-800 text-sm text-cream-200 py-1.5 px-3 rounded-full border border-forest-600 hover:border-amber-400 hover:text-amber-400 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-amber-400 text-forest-950 rounded-br-sm' 
                : 'bg-forest-700 text-cream-100 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-forest-700 text-cream-100 rounded-2xl rounded-bl-sm px-4 py-3 flex space-x-1 items-center">
              <div className="w-2 h-2 bg-forest-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-forest-900 border-t border-forest-400/20">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your footprint..."
            className="flex-1 bg-forest-800 border border-forest-600 rounded-full py-2.5 px-4 text-cream-100 placeholder-forest-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-full bg-amber-400 text-forest-950 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors shrink-0"
          >
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </Card>
  );
}
