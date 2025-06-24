import { useRef, useEffect } from 'react';

interface ChatMessagesProps {
  messages: any[];
  activeChat: any;
  session: any;
}

export default function ChatMessages({ messages, activeChat, session }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <span className="block mb-4">Select a chat to start messaging</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] rounded-lg px-4 py-2 ${
              msg.senderId === session?.user?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-background border'
            }`}
          >
            <p>{msg.content}</p>
            <p className="text-xs mt-1 text-muted-foreground text-right">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {msg.senderId === session?.user?.id && (
                <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
              )}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 