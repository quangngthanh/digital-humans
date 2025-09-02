import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';

export function ChatHistory() {
  const { messages, error } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-sm">Start a conversation with your AI avatar!</p>
        <p className="text-xs mt-2 text-gray-500">Try saying: "Hello, how are you today?"</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-2">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
          <p className="font-medium">Error:</p>
          <p className="text-xs">{error}</p>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`chat-message ${message.role}`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs opacity-60 mb-1">
                {message.role === 'user' ? 'You' : 'AI Assistant'} • {message.timestamp.toLocaleTimeString()}
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
