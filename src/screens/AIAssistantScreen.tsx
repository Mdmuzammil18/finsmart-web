import { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';

export default function AIAssistantScreen() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your AI financial assistant. How can I help you analyze your spending today?' },
    { id: 2, sender: 'user', text: 'How much did I spend on food this month?' },
    { id: 3, sender: 'ai', text: 'You spent $450 on food this month. This is 15% lower than last month. Great job keeping your dining out expenses low!' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Add user message
    const newChat = [...chat, { id: Date.now(), sender: 'user', text: message }];
    setChat(newChat);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChat(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: 'I am analyzing your request. Since I am a demo, I cannot connect to a real AI model yet, but I would show you insights here!' 
      }]);
    }, 1000);
  };

  return (
    <div className="flex-col" style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Sparkles size={24} />
            AI Assistant
          </h1>
          <p className="text-muted text-sm">Ask questions about your finances</p>
        </div>
      </header>

      {/* Chat Area */}
      <div className="card flex-1 flex-col" style={{ display: 'flex', overflow: 'hidden', padding: 0 }}>
        
        {/* Messages */}
        <div className="flex-1 p-6" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chat.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`} style={{ display: 'flex' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" 
                   style={{ backgroundColor: msg.sender === 'user' ? 'var(--secondary)' : 'var(--primary-light)', 
                            color: msg.sender === 'user' ? 'var(--foreground)' : 'var(--primary)' }}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div style={{ 
                backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--secondary)',
                color: msg.sender === 'user' ? 'white' : 'var(--foreground)',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                borderTopRightRadius: msg.sender === 'user' ? 0 : '1rem',
                borderTopLeftRadius: msg.sender === 'ai' ? 0 : '1rem',
                maxWidth: '80%'
              }}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your spending..." 
              className="flex-1 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--input-background)', border: 'none', outline: 'none', color: 'var(--foreground)' }}
            />
            <button 
              onClick={handleSend}
              className="btn btn-primary flex-shrink-0" 
              style={{ padding: '0.75rem', borderRadius: '0.5rem' }}>
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
