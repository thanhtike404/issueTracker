import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Smile, Send } from 'lucide-react';

interface MessageInputProps {
  message: string;
  setMessage: (msg: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export default function MessageInput({
  message,
  setMessage,
  handleSendMessage,
  handleKeyPress,
  disabled
}: MessageInputProps) {
  return (
    <div className="sticky bottom-0 border-t bg-background p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm">
          <Smile className="h-5 w-5" />
        </Button>
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          size="sm"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 