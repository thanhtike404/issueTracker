import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface ChatHeaderProps {
  activeChat: any;
  getChatAvatar: (chat: any) => string;
  getChatName: (chat: any) => string;
  getOtherUsers: () => any[];
  isUserOnline: (userId: string) => boolean;
  setSidebarVisible: (v: boolean) => void;
  sidebarVisible: boolean;
  session: any;
}

export default function ChatHeader({
  activeChat,
  getChatAvatar,
  getChatName,
  getOtherUsers,
  isUserOnline,
  setSidebarVisible,
  sidebarVisible,
  session
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 flex items-center gap-2 border-b bg-background p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {activeChat ? (
        <div className="flex items-center ml-2">
          <div className="relative">
            <Image
              height={32}
              width={32}
              src={getChatAvatar({ chat: activeChat })}
              alt={getChatName({ chat: activeChat })}
              className="w-8 h-8 rounded-full"
            />
            {/* Online indicator in header */}
            {activeChat.type === 'PRIVATE' && (() => {
              const otherUser = getOtherUsers()[0];
              if (otherUser?.id) {
                return (
                  <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                    isUserOnline(otherUser.id) ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                );
              }
              return null;
            })()}
          </div>
          <div className="ml-3">
            <h2 className="text-sm font-medium">{getChatName({ chat: activeChat })}</h2>
            <p className="text-xs text-muted-foreground">
              {activeChat.type === 'PRIVATE'
                ? (() => {
                    const otherUser = getOtherUsers()[0];
                    if (!otherUser?.id) return 'Offline';
                    return isUserOnline(otherUser.id) ? 'Online' : 'Offline';
                  })()
                : `${activeChat.userChats.length} participants`}
            </p>
          </div>
        </div>
      ) : (
        <div className="ml-2">
          <h2 className="text-sm font-medium">Select a chat to start messaging</h2>
        </div>
      )}
    </header>
  );
} 