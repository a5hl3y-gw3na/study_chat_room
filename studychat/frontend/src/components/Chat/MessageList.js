import React, { useEffect, useRef } from 'react';
import { Clock, User } from 'lucide-react';

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const getUserInitials = (username) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (username) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-6">
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">
                {formatDate(dateMessages[0].timestamp)}
              </span>
            </div>
          </div>
          
          {/* Messages for this date */}
          {dateMessages.map((message, index) => {
            const isCurrentUser = message.username === currentUser?.username;
            const isSystem = message.isSystem;
            const showAvatar = index === 0 || 
              dateMessages[index - 1].username !== message.username ||
              new Date(message.timestamp).getTime() - new Date(dateMessages[index - 1].timestamp).getTime() > 300000; // 5 minutes
            
            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-xs text-gray-600">{message.message}</span>
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                  showAvatar ? 'mt-4' : 'mt-1'
                }`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {showAvatar && !isCurrentUser && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0 ${getUserColor(message.username)}`}>
                      {getUserInitials(message.username)}
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <div className={`${showAvatar && !isCurrentUser ? '' : 'ml-10'} ${isCurrentUser ? 'mr-0' : ''}`}>
                    {/* Username and Time */}
                    {showAvatar && (
                      <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-medium text-gray-700">
                          {isCurrentUser ? 'You' : message.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                      } shadow-sm`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                    
                    {/* Time for non-avatar messages */}
                    {!showAvatar && (
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-1`}>
                        <span className="text-xs text-gray-400">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
