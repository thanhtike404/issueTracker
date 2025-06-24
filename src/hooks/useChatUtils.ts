

import { useConnectedUserStore } from "@/stores/socketIo/connectedUsers"

export const useChatUtils = () => {
  const { connectedUserIds } = useConnectedUserStore()

  const isUserOnline = (userId: string) => {
    return connectedUserIds.includes(userId)
  }

  return { isUserOnline }
}
