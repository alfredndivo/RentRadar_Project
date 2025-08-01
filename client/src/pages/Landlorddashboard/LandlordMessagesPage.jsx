import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Phone, Video, Clock, ArrowLeft, MoreVertical, Paperclip, Smile, Image, File, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getChats, getChatMessages, sendChatMessage, markMessagesAsSeen, getCurrentUser } from '../../../api';
import DarkModeToggle from '../../components/DarkModeToggle';
import socketService from '../../utils/socket';

const LandlordMessagesPage = () => {
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
  
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '🏠', '💰', '📍', '✅', '❌'];

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
    }
  }, [selectedChat]);

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
      const messageData = {
        chatId: selectedChat._id,
        receiverId: selectedChat.participant._id,
        content: newMessage
      };

      // Handle file attachment
      if (selectedFile) {
        const formData = new FormData();
        formData.append('chatId', selectedChat._id);
        formData.append('receiverId', selectedChat.participant._id);
        formData.append('content', newMessage || '');
        formData.append('attachment', selectedFile);

        const response = await fetch('/api/chats/send', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to send message');
        const result = await response.json();
        setMessages(prev => [...prev, result]);
      } else {
        const response = await sendChatMessage(messageData);
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
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout to stop typing
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
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
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

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DarkModeToggle />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DarkModeToggle />
      <div className="p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/landlord/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
              <p className="text-gray-600 dark:text-gray-300">Communicate with potential tenants</p>
            </div>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm h-[calc(100vh-12rem)] flex border border-green-100 dark:border-gray-700">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300">No conversations yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Messages will appear here</p>
                </div>
              ) : (
                <div className="space-y-1 p-3">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 rounded-xl text-left transition-colors ${
                        selectedChat?._id === chat._id
                          ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center relative">
                          <span className="text-white font-semibold">
                            {chat.participant?.name?.charAt(0) || 'U'}
                          </span>
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
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedChat.participant?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedChat.participant?.name || selectedChat.participant?.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Tenant
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
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
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
                              
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}>
                                <p>{message.content}</p>
                                <div className={`flex items-center justify-between mt-1 ${
                                  isOwn ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  <span className="text-xs">
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {isOwn && (
                                    <span className="text-xs ml-2">
                                      {message.status === 'seen' ? '✓✓' : 
                                       message.status === 'delivered' ? '✓' : '○'}
                                    </span>
                                  )}
                                </div>
                    
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
                    
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={sendingMessage}
                    />
                    <button
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
                    className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />

                  {/* Emoji button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                      )}
                    </button>
                    disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                  <p className="text-gray-600 dark:text-gray-300">Choose a conversation from the sidebar to start messaging</p>
                </div>

                {/* File selection handlers */}
                <script>
                  {`
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
                  `}
                </script>
              </div>
            )}
          </div>
        </div>
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
                    <div className="grid grid-cols-8 gap-2">
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

      </div>
    </div>
  );
};

export default LandlordMessagesPage;