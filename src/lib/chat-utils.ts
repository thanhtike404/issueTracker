

export function getChatName(chat: any, currentUserId: string) {
    if (chat.type === 'PRIVATE') {
      const otherUser = chat.userChats.find((uc: any) => uc.userId !== currentUserId)
      return otherUser?.user?.name || "Unknown User"
    }
    return chat.name
  }
  
  export function getChatAvatar(chat: any, currentUserId: string) {
    if (chat.avatar) return chat.avatar
  
    if (chat.type === 'PRIVATE') {
      const otherUser = chat.userChats.find((uc: any) => uc.userId !== currentUserId)
      return otherUser?.user?.image || "/placeholder-user.jpg"
    }
  
    return "/placeholder-user.jpg"
  }
  
  export function getLastMessage(chat: any) {
    if (chat.messages.length === 0) return "No messages yet"
    const last = chat.messages[0]
    return last.content.length > 50 ? last.content.substring(0, 50) + "..." : last.content
  }
  
  export function getOtherUsers(chat: any, currentUserId: string) {
    return chat.userChats.filter((uc: any) => uc.userId !== currentUserId).map((uc: any) => uc.user)
  }
  