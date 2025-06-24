import { Session } from 'next-auth'
export type ChatSidebarProps = {
    showCreateChat: boolean,
    setShowCreateChat: (show: boolean) => void,
    newChatName: string,
    setNewChatName: (name: string) => void,
    newChatType: 'PRIVATE' | 'GROUP',
    setNewChatType: (type: 'PRIVATE' | 'GROUP') => void,
    handleCreateChat: () => void,
    searchQuery: string,
    setSearchQuery: (query: string) => void,
    loading: boolean,
    filteredChats: any[],
    activeChat: any,
    handleChatSelect: (chat: any) => void,
    getChatAvatar: (chat: any) => string,
    isUserOnline: (userId: string) => boolean,
    getChatName: (chat: any) => string,
    getLastMessage: (chat: any) => string,
    session: Session | null
  }