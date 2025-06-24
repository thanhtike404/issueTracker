import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  timestamp: Date;
  read: boolean;
  user: ChatUser;
}

export interface Chat {
  id: string;
  name: string;
  type: 'PRIVATE' | 'GROUP';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  userChats: {
    id: string;
    userId: string;
    lastReadAt?: Date;
    unreadCount: number;
    user: ChatUser;
  }[];
  messages: ChatMessage[];
}

export interface UserChat {
  id: string;
  userId: string;
  chatId: string;
  lastReadAt?: Date;
  unreadCount: number;
  chat: Chat;
}

interface ChatStore {
  chats: UserChat[];
  activeChat: Chat | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setChats: (chats: UserChat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  addChat: (userChat: UserChat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      messages: [],
      loading: false,
      error: null,

      setChats: (chats) => set({ chats }),
      
      setActiveChat: (chat) => set({ activeChat: chat }),
      
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => {
        set((state) => {
          // Add message to messages array
          const newMessages = [...state.messages, message];
          
          // Update chat's last message
          const updatedChats = state.chats.map((userChat) => {
            if (userChat.chatId === message.chatId) {
              return {
                ...userChat,
                chat: {
                  ...userChat.chat,
                  updatedAt: message.timestamp,
                  messages: [message, ...userChat.chat.messages.slice(0, -1)] // Replace last message
                }
              };
            }
            return userChat;
          });

          // Update active chat if it's the current chat
          let updatedActiveChat = state.activeChat;
          if (state.activeChat?.id === message.chatId) {
            updatedActiveChat = {
              ...state.activeChat,
              updatedAt: message.timestamp,
              messages: [message, ...state.activeChat.messages.slice(0, -1)]
            };
          }

          return {
            messages: newMessages,
            chats: updatedChats,
            activeChat: updatedActiveChat
          };
        });
      },

      updateMessage: (messageId, content) => {
        set((state) => {
          const updatedMessages = state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg
          );

          // Update message in active chat
          let updatedActiveChat = state.activeChat;
          if (state.activeChat) {
            updatedActiveChat = {
              ...state.activeChat,
              messages: state.activeChat.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content } : msg
              )
            };
          }

          return {
            messages: updatedMessages,
            activeChat: updatedActiveChat
          };
        });
      },

      deleteMessage: (messageId) => {
        set((state) => {
          const updatedMessages = state.messages.filter((msg) => msg.id !== messageId);

          // Remove message from active chat
          let updatedActiveChat = state.activeChat;
          if (state.activeChat) {
            updatedActiveChat = {
              ...state.activeChat,
              messages: state.activeChat.messages.filter((msg) => msg.id !== messageId)
            };
          }

          return {
            messages: updatedMessages,
            activeChat: updatedActiveChat
          };
        });
      },

      addChat: (userChat) => {
        set((state) => ({
          chats: [userChat, ...state.chats]
        }));
      },

      updateChat: (chatId, updates) => {
        set((state) => ({
          chats: state.chats.map((userChat) =>
            userChat.chatId === chatId
              ? { ...userChat, chat: { ...userChat.chat, ...updates } }
              : userChat
          ),
          activeChat: state.activeChat?.id === chatId
            ? { ...state.activeChat, ...updates }
            : state.activeChat
        }));
      },

      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        chats: [],
        activeChat: null,
        messages: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        chats: state.chats,
        activeChat: state.activeChat
      })
    }
  )
);
