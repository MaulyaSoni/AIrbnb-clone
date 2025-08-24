import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaEllipsisV, FaArchive, FaBan, FaReply, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [showArchived]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await api.get(`/api/messages/conversations?archived=${showArchived}`);
      setConversations(response.data.conversations);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/messages/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setLoading(true);
      const response = await api.post(`/api/messages/conversations/${selectedConversation._id}/messages`, {
        content: newMessage.trim()
      });

      // Add new message to the list
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');

      // Update conversation in list
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, lastMessage: response.data.message, lastMessageAt: new Date() }
            : conv
        )
      );

      // Update selected conversation
      setSelectedConversation(prev => ({
        ...prev,
        lastMessage: response.data.message,
        lastMessageAt: new Date()
      }));

    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const archiveConversation = async (conversationId, archived) => {
    try {
      await api.put(`/api/messages/conversations/${conversationId}/archive`, { archived });
      toast.success(`Conversation ${archived ? 'archived' : 'unarchived'}`);
      fetchConversations();
    } catch (error) {
      toast.error('Failed to update conversation');
    }
  };

  const blockConversation = async (conversationId, blocked) => {
    try {
      await api.put(`/api/messages/conversations/${conversationId}/block`, { blocked });
      toast.success(`Conversation ${blocked ? 'blocked' : 'unblocked'}`);
      fetchConversations();
    } catch (error) {
      toast.error('Failed to update conversation');
    }
  };

  const getConversationTitle = (conversation) => {
    if (conversation.metadata?.title) return conversation.metadata.title;
    if (conversation.property?.title) return `About ${conversation.property.title}`;
    
    const otherParticipants = conversation.participants.filter(p => p._id !== user.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    }
    return `${otherParticipants.length} people`;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const content = conversation.lastMessage.content;
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  const getUnreadCount = (conversation) => {
    return conversation.unreadCount?.get(user.id) || 0;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airbnb-pink"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-airbnb h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <div className="flex items-center space-x-2 mt-2">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-3 py-1 text-sm rounded-lg ${
                !showArchived 
                  ? 'bg-airbnb-pink text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-3 py-1 text-sm rounded-lg ${
                showArchived 
                  ? 'bg-airbnb-pink text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {showArchived ? 'No archived conversations' : 'No conversations yet'}
            </div>
          ) : (
            conversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversation?._id === conversation._id;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-airbnb-pink' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getConversationTitle(conversation)}
                      </h3>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {getLastMessagePreview(conversation)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {conversation.lastMessageAt 
                          ? formatMessageTime(conversation.lastMessageAt)
                          : 'No messages'
                        }
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-airbnb-pink text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getConversationTitle(selectedConversation)}
                </h3>
                {selectedConversation.property && (
                  <p className="text-sm text-gray-600">
                    {selectedConversation.property.title}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => archiveConversation(selectedConversation._id, !showArchived)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title={showArchived ? 'Unarchive' : 'Archive'}
                >
                  <FaArchive />
                </button>
                <button
                  onClick={() => blockConversation(selectedConversation._id, true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Block"
                >
                  <FaBan />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender._id === user.id;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-airbnb-pink text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.sender.name}
                          </span>
                          <span className={`text-xs ${
                            isOwnMessage ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.isEdited && (
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            (edited)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent outline-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-airbnb-pink text-white rounded-lg hover:bg-airbnb-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
