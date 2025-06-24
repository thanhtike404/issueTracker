'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSocketStore } from '@/stores/socketIo/socketStore';
import useNotification from '@/hooks/useNotification';
import { User } from '@prisma/client';
import { useConnectedUserStore } from '@/stores/socketIo/connectedUsers';
export default function SocketSessionHandler() {
  const { data: session } = useSession();
  const { connect, disconnect, isConnected, socket } = useSocketStore();
  const { getNotifications } = useNotification();
  const {  setConnectedUserIds } = useConnectedUserStore();

  useEffect(() => {
    if (session && !isConnected) {
      connect(session.user.id);
    }
  }, [session, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected || !session) return;

    const handleConnectedUsers = (users: string[]) => {

      setConnectedUserIds(users);
    };
    const handleUserConnected = (user: User) => {
      // console.log('User connected:', user);
    };
    const handleUserDisconnected = (user: User) => {
      // console.log('User disconnected:', user);
    };
    const handleUpdateConnectedUsers = (users: string[]) => {
      console.log('Current online users:', users);
      setConnectedUserIds(users);

    };

    // Register event listeners
    socket.on('connected-users', handleConnectedUsers);
    socket.on('user-connected', handleUserConnected);
    socket.on('user-disconnected', handleUserDisconnected);
    socket.on('update-connected-users', handleUpdateConnectedUsers);

    getNotifications();

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off('connected-users', handleConnectedUsers);
      socket.off('user-connected', handleUserConnected);
      socket.off('user-disconnected', handleUserDisconnected);
      socket.off('update-connected-users', handleUpdateConnectedUsers);
    };
  }, [socket, isConnected, session]);

  useEffect(() => {
    return () => {
      if (isConnected) disconnect();
    };
  }, [isConnected, disconnect]);

  return null;
}
