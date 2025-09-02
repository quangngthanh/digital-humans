import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { useChatStore } from '../../stores/chatStore';

export function ChatContainer() {
  const { clearMessages, messages } = useChatStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-300">AI Chat</h3>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-xs text-gray-400 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700/50"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatHistory />
      </div>
      
      <div className="pt-3 border-t border-white/10">
        <ChatInput />
      </div>
    </div>
  );
}
