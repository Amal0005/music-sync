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
    onSend(text);
    setText('');
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.length === 0 && (
          <p className="text-center text-white/20 text-sm mt-4">No messages yet. Say hi!</p>
        )}
        {messages.map(msg => {
          const isMe = msg.userId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {!isMe && (
                <span className="text-xs text-white/30 mb-0.5 ml-1">{msg.username}</span>
              )}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm break-words ${
                  isMe
                    ? 'bg-purple-700 text-white rounded-br-sm'
                    : 'bg-white/8 text-white/90 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          maxLength={200}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-3 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl transition-colors"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
