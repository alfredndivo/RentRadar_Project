import { useState, useEffect, useRef } from 'react';
import socketService from '../utils/socket';
import { toast } from 'sonner';

export const useRealTimeData = (userId, dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!userId) return;

    const connectAndListen = () => {
      try {
        socketService.connect(userId);
        
        // Listen for data updates
        socketService.socket?.on(`${dataType}Update`, (newData) => {
          setData(prevData => {
            // Merge or replace data based on type
            if (Array.isArray(newData)) {
              return newData;
            } else {
              // Update specific item in array
              return prevData.map(item => 
                item._id === newData._id ? newData : item
              );
            }
          });
          setLastUpdate(new Date());
        });

        // Listen for new items
        socketService.socket?.on(`new${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`, (newItem) => {
          setData(prevData => [newItem, ...prevData]);
          setLastUpdate(new Date());
          
          // Show notification for relevant updates
          if (dataType === 'listing') {
            toast.info(`New property: ${newItem.title}`, {
              action: {
                label: 'View',
                onClick: () => window.location.href = '/user/dashboard/browse'
              }
            });
          }
        });

        // Listen for deletions
        socketService.socket?.on(`delete${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`, (deletedId) => {
          setData(prevData => prevData.filter(item => item._id !== deletedId));
          setLastUpdate(new Date());
        });

        // Connection status
        socketService.socket?.on('connect', () => {
          setError(null);
          reconnectAttempts.current = 0;
          setLoading(false);
        });

        socketService.socket?.on('disconnect', () => {
          setError('Connection lost');
          attemptReconnect();
        });

        socketService.socket?.on('connect_error', (err) => {
          setError(`Connection error: ${err.message}`);
          attemptReconnect();
        });

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const attemptReconnect = () => {
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          console.log(`Reconnection attempt ${reconnectAttempts.current}`);
          connectAndListen();
        }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
      } else {
        setError('Failed to reconnect after multiple attempts');
        toast.error('Connection lost. Please refresh the page.');
      }
    };

    connectAndListen();

    return () => {
      socketService.socket?.off(`${dataType}Update`);
      socketService.socket?.off(`new${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`);
      socketService.socket?.off(`delete${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`);
    };
  }, [userId, dataType]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // Trigger data refetch through socket
    socketService.socket?.emit(`fetch${dataType.charAt(0).toUpperCase() + dataType.slice(1)}s`);
  };

  const updateItem = (itemId, updates) => {
    setData(prevData => 
      prevData.map(item => 
        item._id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const addItem = (newItem) => {
    setData(prevData => [newItem, ...prevData]);
  };

  const removeItem = (itemId) => {
    setData(prevData => prevData.filter(item => item._id !== itemId));
  };

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch,
    updateItem,
    addItem,
    removeItem,
    isConnected: socketService.isConnected
  };
};

export const useRealTimeNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId || !socketService.socket) return;

    socketService.socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(notification.message, {
        duration: 5000,
        action: notification.link ? {
          label: 'View',
          onClick: () => window.location.href = notification.link
        } : undefined
      });
    });

    socketService.socket.on('notificationRead', (notificationId) => {
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    return () => {
      socketService.socket?.off('newNotification');
      socketService.socket?.off('notificationRead');
    };
  }, [userId]);

  const markAsRead = (notificationId) => {
    socketService.socket?.emit('markNotificationRead', notificationId);
  };

  const markAllAsRead = () => {
    socketService.socket?.emit('markAllNotificationsRead');
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};

export const useRealTimeChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!chatId || !socketService.socket) return;

    socketService.joinChat(chatId);

    socketService.socket.on('receiveMessage', (message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketService.socket.on('userTyping', ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    socketService.socket.on('userOnline', (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    socketService.socket.on('userOffline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socketService.socket?.off('receiveMessage');
      socketService.socket?.off('userTyping');
      socketService.socket?.off('userOnline');
      socketService.socket?.off('userOffline');
    };
  }, [chatId]);

  const sendTyping = (isTyping) => {
    socketService.sendTyping(chatId, socketService.userId, isTyping);
  };

  return {
    messages,
    setMessages,
    typingUsers,
    onlineUsers,
    sendTyping
  };
};