"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Menu, Send, Smile, Paperclip,  Users } from "lucide-react"
import { useConnectedUserStore } from "@/stores/socketIo/connectedUsers"
import { useChat } from "@/hooks/useChat"
import { useSession } from "next-auth/react"
import { useChatStore } from '@/stores/socketIo/chatStore'

import { Button } from "@/components/ui/button"

import { Card } from "@/components/ui/card"
import { toast } from "react-toastify"
import ChatSidebar from "@/components/chat/chat-sidebar"

import ChatHeader from '@/components/chat/ChatHeader'
import ChatMessages from '@/components/chat/ChatMessages'
import MessageInput from '@/components/chat/MessageInput'

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

  const { messagesLoading } = useChatStore()

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

  // Check if user is onlineSearch
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
 
      {sidebarVisible && (
        <ChatSidebar
          showCreateChat={showCreateChat}
          setShowCreateChat={setShowCreateChat}
          newChatName={newChatName}
          setNewChatName={setNewChatName}
          newChatType={newChatType}
          setNewChatType={setNewChatType}
          session={session}
          handleCreateChat={handleCreateChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
          filteredChats={filteredChats}
          activeChat={activeChat}
          handleChatSelect={handleChatSelect}
          getChatAvatar={getChatAvatar}
          isUserOnline={isUserOnline}
          getChatName={getChatName}
          getLastMessage={getLastMessage}
        />
      )}


      <div className="flex-1 flex flex-col">
  
        <ChatHeader
          activeChat={activeChat}
          getChatAvatar={getChatAvatar}
          getChatName={getChatName}
          getOtherUsers={getOtherUsers}
          isUserOnline={isUserOnline}
          setSidebarVisible={setSidebarVisible}
          sidebarVisible={sidebarVisible}
          session={session}
        />

   
        <main className="flex-1 overflow-auto p-4 bg-muted/50">
          <ChatMessages
            messages={messages}
            activeChat={activeChat}
            session={session}
            messagesLoading={messagesLoading}
          />
        </main>

        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          disabled={!activeChat || !isConnected}
        />
      </div>
    </div>
  )
}
