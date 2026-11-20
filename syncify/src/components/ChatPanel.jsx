import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

export default function ChatPanel({ messages, onSend, currentUserId }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text); setText('');
  }

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex-1 overflow-y-auto space-y-2 py-1">
        {messages.length === 0 && (
          <p className="text-center text-white/15 text-xs mt-6">No messages yet — say hi! 👋</p>
        )}
        {messages.map(msg => {
          const isMe = msg.userId === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && <span className="text-[10px] text-white/25 mb-1 ml-1">{msg.username}</span>}
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words leading-relaxed ${
                isMe
                  ? 'bg-gradient-to-br from-cyan-500/80 to-indigo-600/80 text-white rounded-br-sm'
                  : 'bg-white/6 text-white/80 rounded-bl-sm border border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)}
          placeholder="Say something…" maxLength={200}
          className="flex-1 bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-500/50 focus:bg-white/6 transition-all" />
        <button type="submit" disabled={!text.trim()}
          className="px-3 gradient-btn rounded-xl disabled:opacity-30 transition-all hover:opacity-90">
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
