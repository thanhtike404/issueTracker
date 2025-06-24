"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Menu, Send, Smile, Paperclip, Plus, Users, Search } from "lucide-react"
import { useConnectedUserStore } from "@/stores/socketIo/connectedUsers"
import { useChat } from "@/hooks/useChat"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"



export default function ChatPage() {
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateChat, setShowCreateChat] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [newChatType, setNewChatType] = useState<'PRIVATE' | 'GROUP'>('PRIVATE')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [activeUserCount, setActiveUserCount] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { data: session } = useSession()
  const { connectedUserIds } = useConnectedUserStore()

  console.log(connectedUserIds.length)
  
  const {
    chats,
    activeChat,
    messages,
    loading,
    error,
    isConnected,
    sendMessage,
    createChat,
    selectChat,
    clearError
  } = useChat()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Memoize filtered chats to prevent unnecessary re-renders
  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [chats, searchQuery])

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return

    sendMessage(message, activeChat.id)
    setMessage("")
  }

  const handleCreateChat = () => {
    if (!newChatName.trim() || selectedUsers.length === 0) {
      toast.error("Please provide a chat name and select at least one user")
      return
    }

    createChat(newChatName, newChatType, selectedUsers)
    setShowCreateChat(false)
    setNewChatName("")
    setNewChatType('PRIVATE')
    setSelectedUsers([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Get other users in the chat (excluding current user)
  const getOtherUsers = () => {
    if (!activeChat || !session?.user?.id) return []
    return activeChat.userChats
      .filter(uc => uc.userId !== session.user.id)
      .map(uc => uc.user)
  }

  // Get last message preview
  const getLastMessage = (chat: any) => {
    if (chat.chat.messages.length === 0) return "No messages yet"
    const lastMessage = chat.chat.messages[0]
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + "..."
      : lastMessage.content
  }

  // Get chat avatar
  const getChatAvatar = (chat: any) => {
    if (chat.chat.avatar) return chat.chat.avatar
    if (chat.chat.type === 'PRIVATE') {
      const otherUser = chat.chat.userChats.find((uc: any) => uc.userId !== session?.user?.id)
      return otherUser?.user?.image || "/placeholder-user.jpg"
    }
    return "/placeholder-user.jpg"
  }

  // Get chat name
  const getChatName = (chat: any) => {
    if (chat.chat.type === 'PRIVATE') {
      const otherUser = chat.chat.userChats.find((uc: any) => uc.userId !== session?.user?.id)
      return otherUser?.user?.name || "Unknown User"
    }
    return chat.chat.name
  }

  // Check if user is online
  const isUserOnline = (userId: string) => {
    return connectedUserIds.includes((userId))
  }

  // Handle chat selection without refreshing
  const handleChatSelect = (chat: any) => {
    if (activeChat?.id === chat.chat.id) return // Don't re-select the same chat
    selectChat(chat.chat)
  }

  useEffect(() => {
    if (connectedUserIds) {
      setActiveUserCount(connectedUserIds)
    }
  }, [connectedUserIds])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={clearError}>Try Again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarVisible && (
        <div className="w-80 border-r bg-background">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chats</h2>
              <Dialog open={showCreateChat} onOpenChange={setShowCreateChat}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Chat name"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                    />
                    <Select value={newChatType} onValueChange={(value: 'PRIVATE' | 'GROUP') => setNewChatType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="GROUP">Group</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateChat} className="w-full">
                      Create Chat
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
      )}
      {/* {activeUserCount && (
        <div className="p-4">
          <h3 className="text-sm font-medium">Active User Count</h3>
          <p className="text-sm text-muted-foreground">{activeUserCount}</p>
        </div>
      )} */}
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
                  const otherUser = getOtherUsers()[0]
                  if (otherUser?.id) {
                    return (
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                        isUserOnline(otherUser.id) ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )
                  }
                  return null
                })()}
              </div>
              <div className="ml-3">
                <h2 className="text-sm font-medium">{getChatName({ chat: activeChat })}</h2>
                <p className="text-xs text-muted-foreground">
                  {activeChat.type === 'PRIVATE' 
                    ? (() => {
                        const otherUser = getOtherUsers()[0]
                        if (!otherUser?.id) return 'Offline'
                        return isUserOnline(otherUser.id) ? 'Online' : 'Offline'
                      })()
                    : `${activeChat.userChats.length} participants`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="ml-2">
              <h2 className="text-sm font-medium">Select a chat to start messaging</h2>
            </div>
          )}
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-auto p-4 bg-muted/50">
          {!activeChat ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          ) : (
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
                        minute: '2-digit' 
                      })}
                      {msg.senderId === session?.user?.id && (
                        <span className="ml-1">
                          {msg.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Message Input */}
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
              disabled={!activeChat || !isConnected}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!activeChat || !isConnected || !message.trim()}
              size="sm"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
