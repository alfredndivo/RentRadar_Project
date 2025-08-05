import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, Phone, Video, Clock, MoreVertical, Paperclip, Smile, Image, File, CheckCircle, Circle, X, User, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { getChats, getChatMessages, sendChatMessage, markMessagesAsSeen, getCurrentUser } from '../../../api';
import { MessageSkeleton } from '../../components/SkeletonLoader';
import socketService from '../../utils/socket';

const UserMessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messageReactions, setMessageReactions] = useState({});
  const [showMessageActions, setShowMessageActions] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '🏠', '💰', '📍', '✅', '❌', '🤝', '🙏', '💪', '⭐'];
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await getCurrentUser();
        const userId = response.data.profile.id || response.data.profile._id;
        setCurrentUserId(userId);
        
        // Connect socket
        socketService.connect(userId);
        
        // Set up socket listeners
        socketService.onReceiveMessage((message) => {
          if (selectedChat && message.chatId === selectedChat._id) {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          }
          
          // Update chat list
          fetchChats();
          
          // Show toast if chat is not open
          if (!selectedChat || message.chatId !== selectedChat._id) {
            toast.info(`New message from ${message.senderId.name}`);
          }
        });

        socketService.onUserTyping(({ userId: typingUserId, isTyping }) => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(typingUserId);
            } else {
              newSet.delete(typingUserId);
            }
            return newSet;
          });
        });

        // Listen for user online status
        if (socketService.socket) {
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

          socketService.socket.on('messageReaction', ({ messageId, reaction, userId }) => {
            setMessageReactions(prev => ({
              ...prev,
              [messageId]: {
                ...prev[messageId],
                [reaction]: [...(prev[messageId]?.[reaction] || []), userId]
              }
            }));
          });
        }

        await fetchChats();
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      socketService.joinChat(selectedChat._id);
      markMessagesAsSeen(selectedChat._id);
      
      // On mobile, hide sidebar when chat is selected
      if (isMobile) {
        setShowSidebar(false);
      }
    }
  }, [selectedChat, isMobile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await getChats();
      setChats(response.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await getChatMessages(chatId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedChat) return;

    setSendingMessage(true);
    try {
      let response;

      // Handle file attachment
      if (selectedFile) {
        const formData = new FormData();
        formData.append('chatId', selectedChat._id);
        formData.append('receiverId', selectedChat.participant._id);
        formData.append('content', newMessage || '');
        formData.append('attachment', selectedFile);

        response = await fetch('/api/chats/send', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to send message');
        const result = await response.json();
        setMessages(prev => [...prev, result]);
      } else {
        const messageData = {
          chatId: selectedChat._id,
          receiverId: selectedChat.participant._id,
          content: newMessage
        };

        response = await sendChatMessage(messageData);
        setMessages(prev => [...prev, response.data]);
      }

      setNewMessage('');
      setSelectedFile(null);
      setShowEmojiPicker(false);
      setShowAttachmentMenu(false);
      scrollToBottom();
      
      // Stop typing indicator
      handleTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (typing) => {
    if (selectedChat && currentUserId) {
      socketService.sendTyping(selectedChat._id, currentUserId, typing);
      setIsTyping(typing);
      
      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          handleTyping(false);
        }, 3000);
      }
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.trim() && !isTyping) {
      handleTyping(true);
    } else if (!e.target.value.trim() && isTyping) {
      handleTyping(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setShowAttachmentMenu(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const handleMessageReaction = (messageId, reaction) => {
    if (socketService.socket) {
      socketService.socket.emit('addReaction', { messageId, reaction, chatId: selectedChat._id });
    }
    
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [reaction]: [...(prev[messageId]?.[reaction] || []), currentUserId]
      }
    }));
  };

  const copyMessageText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Message copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy message');
    });
  };

  const filteredChats = chats.filter(chat =>
    chat.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm h-[calc(100vh-8rem)] flex border border-green-100 dark:border-gray-700">
        <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 p-3">
          {[...Array(5)].map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-green-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
            <p className="text-gray-600 dark:text-gray-300">Chat with landlords about properties</p>
          </div>
          {/* Mobile menu toggle */}
          {isMobile && selectedChat && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 bg-green-500 text-white rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm h-[calc(100vh-12rem)] flex border border-green-100 dark:border-gray-700 relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && showSidebar && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Chats Sidebar */}
        <div className={`${
          isMobile 
            ? `absolute left-0 top-0 bottom-0 w-80 z-50 transform transition-transform duration-300 ${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-1/3'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300">No conversations yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start by contacting a landlord</p>
              </div>
            ) : (
              <div className="space-y-1 p-3">
                {filteredChats.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      if (isMobile) setShowSidebar(false);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-colors ${
                      selectedChat?._id === chat._id
                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {chat.participant?.name?.charAt(0) || 'L'}
                          </span>
                        </div>
                        {/* Online indicator */}
                        {isUserOnline(chat.participant?._id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                        {/* Unread count */}
                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {chat.participant?.name || chat.participant?.email}
                          </p>
                          {chat.lastMessage?.createdAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(chat.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                          {isUserOnline(chat.participant?._id) && (
                            <span className="text-xs text-green-500 dark:text-green-400">Online</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${isMobile && showSidebar ? 'hidden' : 'flex'} flex-1 flex-col h-full`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  {isMobile && (
                    <button
                      onClick={() => {
                        setSelectedChat(null);
                        setShowSidebar(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
                    >
                      ←
                    </button>
                  )}
                  
                  <div className="relative">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedChat.participant?.name?.charAt(0) || 'L'}
                      </span>
                    </div>
                    {isUserOnline(selectedChat.participant?._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedChat.participant?.name || selectedChat.participant?.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Landlord
                      {isUserOnline(selectedChat.participant?._id) ? (
                        <span className="text-green-500 ml-2">Online</span>
                      ) : (
                        <span className="text-gray-400 ml-2">Offline</span>
                      )}
                      {typingUsers.size > 0 && (
                        <span className="text-green-500 ml-2">Typing...</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isOwn = message.senderId._id === currentUserId || message.senderId === currentUserId;
                      const showDate = index === 0 || 
                        formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                      
                      return (
                        <div key={message._id || index}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div 
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative group ${
                              isOwn
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}
                              onDoubleClick={() => message.content && copyMessageText(message.content)}
                            >
                              {/* Message actions menu */}
                              <button
                                onClick={() => setShowMessageActions(showMessageActions === message._id ? null : message._id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-black/10 transition-all"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </button>

                              {/* Message actions dropdown */}
                              {showMessageActions === message._id && (
                                <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-32">
                                  <button
                                    onClick={() => {
                                      copyMessageText(message.content);
                                      setShowMessageActions(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                                  >
                                    Copy
                                  </button>
                                  <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                                    <div className="flex gap-1">
                                      {reactionEmojis.map(emoji => (
                                        <button
                                          key={emoji}
                                          onClick={() => {
                                            handleMessageReaction(message._id, emoji);
                                            setShowMessageActions(null);
                                          }}
                                          className="text-lg hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Message content */}
                              {message.content && <p className="mb-1">{message.content}</p>}
                              
                              {/* File attachment */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2">
                                  {message.messageType === 'image' ? (
                                    <img
                                      src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/messages/${message.attachments[0]}`}
                                      alt="Shared image"
                                      className="max-w-full h-auto rounded-lg cursor-pointer"
                                      onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/messages/${message.attachments[0]}`, '_blank')}
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                      <File className="w-4 h-4" />
                                      <span className="text-sm">{message.attachments[0]}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Message reactions */}
                              {messageReactions[message._id] && Object.keys(messageReactions[message._id]).length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {Object.entries(messageReactions[message._id]).map(([reaction, users]) => (
                                    users.length > 0 && (
                                      <span
                                        key={reaction}
                                        className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1"
                                      >
                                        {reaction} {users.length}
                                      </span>
                                    )
                                  ))}
                                </div>
                              )}

                              <div className={`flex items-center justify-between mt-1 ${
                                isOwn ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <span className="text-xs">
                                  {formatTime(message.createdAt)}
                                </span>
                                {isOwn && (
                                  <span className="text-xs ml-2">
                                    {message.status === 'seen' ? (
                                      <div className="flex">
                                        <CheckCircle className="w-3 h-3" />
                                        <CheckCircle className="w-3 h-3 -ml-1" />
                                      </div>
                                    ) : message.status === 'delivered' ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <Circle className="w-3 h-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing indicator */}
                    {typingUsers.size > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                          <div className="flex items-center gap-1">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                {/* File preview */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedFile.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeSelectedFile}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className="mb-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
                    <div className="grid grid-cols-8 md:grid-cols-10 gap-2">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-xl hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachment menu */}
                {showAttachmentMenu && (
                  <div className="mb-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAttachmentMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Image className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-900 dark:text-white">Photo or Image</span>
                      </button>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAttachmentMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <File className="w-5 h-5 text-green-500" />
                        <span className="text-gray-900 dark:text-white">Document</span>
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Attachment button */}
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-2 md:p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                  </button>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={sendingMessage}
                  />

                  {/* Emoji button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 md:p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Smile className="w-4 h-4 md:w-5 md:h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
                    className="bg-green-500 text-white p-2 md:p-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-gray-600 dark:text-gray-300">Choose a conversation from the sidebar to start messaging</p>
                {isMobile && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    View Conversations
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessagesPage;