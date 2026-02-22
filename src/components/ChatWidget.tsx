import React from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, UserIcon } from '../icons';
import { GoogleGenAI } from '@google/genai';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Hello! I'm Sarah's AI assistant. How can I help you with your custom cake today?" }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const webhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;
      
      if (!webhookUrl) {
        // Fallback to Gemini if webhook not configured
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: userMsg,
          config: {
            systemInstruction: "You are a helpful AI assistant for Sweet Moments, a luxury artisan bakery. Sarah is the lead baker. You help customers with cake enquiries, flavour suggestions, and general bakery info. Keep responses elegant, warm, and concise."
          }
        });
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that. How else can I help?" }]);
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sessionId: 'user-session' })
      });

      if (!response.ok) throw new Error('Webhook failed');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.output || data.message || "I'm sorry, I couldn't process that. How else can I help?" }]);
    } catch (error) {
      console.error("Chat AI error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a bit of trouble connecting. Please try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white dark:bg-surface w-80 md:w-96 h-[500px] rounded-[2rem] shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
          <div className="p-6 bg-primary text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-serif italic font-bold">Sarah's Assistant</h4>
                <p className="text-[10px] uppercase tracking-widest opacity-80">AI Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-bg dark:bg-black/20 text-dark rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-bg dark:bg-black/20 p-4 rounded-2xl rounded-tl-none">
                  <Loader2 size={16} className="animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-bg/50 dark:bg-black/10">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about flavours, pricing..."
                className="w-full pl-6 pr-12 py-3 rounded-full bg-white dark:bg-surface border border-border focus:border-primary outline-none text-sm"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-full transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
        >
          <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full border-4 border-bg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </button>
      )}
    </div>
  );
};
