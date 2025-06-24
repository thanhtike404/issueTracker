import React from 'react'
import CreateChat from './create-chat'
import { Input } from '../ui/input'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '../ui/badge'

import { ChatSidebarProps } from '@/types/chat'

function ChatSidebar(
  {
    showCreateChat,
    setShowCreateChat,
    newChatName,
    setNewChatName,
    newChatType,
    setNewChatType,
    handleCreateChat,
    searchQuery,
    setSearchQuery,
    loading,
    filteredChats,
    activeChat,
    handleChatSelect,
    getChatAvatar,
    isUserOnline,
    getChatName,
    getLastMessage,
    session
  }:ChatSidebarProps
) {
  return (
    <div className="w-80 border-r bg-background">
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <CreateChat showCreateChat={showCreateChat} setShowCreateChat={setShowCreateChat} newChatName={newChatName} setNewChatName={setNewChatName} newChatType={newChatType} setNewChatType={setNewChatType} handleCreateChat={handleCreateChat} />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>

    <div className="overflow-y-auto h-[calc(100vh-120px)]">
      {loading ? (
        <div className="p-4 text-center text-muted-foreground">Loading chats...</div>
      ) : filteredChats.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          {searchQuery ? "No chats found" : "No chats yet"}
        </div>
      ) : (
        filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatSelect(chat)}
            className={`flex items-center p-4 border-b cursor-pointer hover:bg-accent/10 ${
              activeChat?.id === chat.chat.id ? "bg-accent/10" : ""
            }`}
          >
            <div className="relative">
              <Image
                height={40}
                width={40}
                src={getChatAvatar(chat)}
                alt={getChatName(chat)}
                className="w-10 h-10 rounded-full"
              />
              {chat.unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {chat.unreadCount}
                </Badge>
              )}
              {/* Online indicator for private chats */}
              {chat.chat.type === 'PRIVATE' && (() => {
                const otherUser = chat.chat.userChats.find((uc: any) => uc.userId !== session?.user?.id)
                if (otherUser?.user?.id) {
                  return (
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                      isUserOnline(otherUser.user.id) ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  )
                }
                return null
              })()}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">{getChatName(chat)}</h3>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.chat.updatedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {getLastMessage(chat)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
  )
}

export default ChatSidebar