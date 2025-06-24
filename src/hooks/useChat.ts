'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocketStore } from '@/stores/socketIo/socketStore';
import { useChatStore, type ChatMessage, type UserChat } from '@/stores/socketIo/chatStore';
import { toast } from 'react-toastify';

export const useChat = () => {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocketStore();
  const {
    chats,
    activeChat,
    messages,
    loading,
    error,
    setChats,
    setActiveChat,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    addChat,
    updateChat,
    setLoading,
    setError,
    clearError
  } = useChatStore();

  // Fetch user chats
  const fetchUserChats = useCallback(() => {
    if (!socket || !session?.user?.id) return;

    setLoading(true);
    socket.emit('get-user-chat', { userId: session.user.id }, (response: any) => {
      setLoading(false);
      if (response.success) {
        setChats(response.chats);
      } else {
        setError(response.error || 'Failed to fetch chats');
        toast.error(response.error || 'Failed to fetch chats');
      }
    });
  }, [socket, session?.user?.id, setChats, setLoading, setError]);

  // Send message
  const sendMessage = useCallback((content: string, chatId: string) => {
    if (!socket || !content.trim()) return;

    socket.emit('send-message', { content, chatId }, (response: any) => {
      if (response.success) {
        // Message will be added via socket event
      } else {
        toast.error(response.error || 'Failed to send message');
      }
    });
  }, [socket]);

  // Create new chat
  const createChat = useCallback((name: string, type: 'PRIVATE' | 'GROUP', memberIds: string[], avatar?: string) => {
    if (!socket || !name.trim() || memberIds.length === 0) return;

    socket.emit('create-chat', { name, type, memberIds, avatar }, (response: any) => {
      if (response.success) {
        // Chat will be added via socket event
        toast.success('Chat created successfully');
      } else {
        toast.error(response.error || 'Failed to create chat');
      }
    });
  }, [socket]);

  // Fetch chat messages
  const fetchChatMessages = useCallback((chatId: string) => {
    if (!socket || !chatId) return;

    setLoading(true);
    socket.emit('get-chat-messages', { chatId }, (response: any) => {
      setLoading(false);
      if (response.success) {
        setMessages(response.messages);
      } else {
        setError(response.error || 'Failed to fetch messages');
        toast.error(response.error || 'Failed to fetch messages');
      }
    });
  }, [socket, setMessages, setLoading, setError]);

  // Join chat room
  const joinChat = useCallback((chatId: string) => {
    if (!socket || !chatId) return;

    socket.emit('join-chat', { chatId }, (response: any) => {
      if (response.success) {
        console.log('Joined chat room:', chatId);
      } else {
        toast.error(response.error || 'Failed to join chat');
      }
    });
  }, [socket]);

  // Leave chat room
  const leaveChat = useCallback((chatId: string) => {
    if (!socket || !chatId) return;

    socket.emit('leave-chat', { chatId }, (response: any) => {
      if (response.success) {
        console.log('Left chat room:', chatId);
      } else {
        toast.error(response.error || 'Failed to leave chat');
      }
    });
  }, [socket]);

  // Update message
  const editMessage = useCallback((messageId: string, content: string) => {
    if (!socket || !content.trim()) return;

    socket.emit('update-message', { messageId, content }, (response: any) => {
      if (response.success) {
        // Message will be updated via socket event
        toast.success('Message updated');
      } else {
        toast.error(response.error || 'Failed to update message');
      }
    });
  }, [socket]);

  // Delete message
  const removeMessage = useCallback((messageId: string) => {
    if (!socket) return;

    socket.emit('delete-message', { messageId }, (response: any) => {
      if (response.success) {
        // Message will be deleted via socket event
        toast.success('Message deleted');
      } else {
        toast.error(response.error || 'Failed to delete message');
      }
    });
  }, [socket]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    if (!socket) return;

    socket.emit('get-unread-count', (response: any) => {
      if (response.success) {
        console.log('Unread count:', response.totalUnread);
        // You can store this in a separate state if needed
      } else {
        console.error('Failed to get unread count:', response.error);
      }
    });
  }, [socket]);

  const selectChat = useCallback((chat: any) => {
    setActiveChat(chat);
    if (chat) {
      fetchChatMessages(chat.id);
      joinChat(chat.id);
    }
  }, [setActiveChat, fetchChatMessages, joinChat]);

  useEffect(() => {
    if (!socket) return;

    // New message received
    const handleNewMessage = (data: { message: ChatMessage; chatId: string }) => {
      addMessage(data.message);
    };

    // Message updated
    const handleMessageUpdated = (data: { message: ChatMessage; chatId: string }) => {
      updateMessage(data.message.id, data.message.content);
    };

    // Message deleted
    const handleMessageDeleted = (data: { messageId: string; chatId: string }) => {
      deleteMessage(data.messageId);
    };


    const handleNewChat = (chat: any) => {
    
      const userChat: UserChat = {
        id: `uc_${Date.now()}`,
        userId: session?.user?.id || '',
        chatId: chat.id,
        unreadCount: 0,
        chat: chat
      };
      addChat(userChat);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-updated', handleMessageUpdated);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('new-chat', handleNewChat);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-updated', handleMessageUpdated);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('new-chat', handleNewChat);
    };
  }, [socket, addMessage, updateMessage, deleteMessage, addChat, session?.user?.id]);


  useEffect(() => {
    if (isConnected && session?.user?.id) {
      fetchUserChats();
      getUnreadCount();
    }
  }, [isConnected, session?.user?.id, fetchUserChats, getUnreadCount]);

  return {

    chats,
    activeChat,
    messages,
    loading,
    error,
    isConnected,


    fetchUserChats,
    sendMessage,
    createChat,
    fetchChatMessages,
    joinChat,
    leaveChat,
    editMessage,
    removeMessage,
    selectChat,
    getUnreadCount,
    clearError
  };
}; 