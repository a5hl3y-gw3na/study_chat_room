import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  Smile,
  Wifi,
  WifiOff,
  MoreVertical
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import MessageList from './MessageList';
import UsersList from './UsersList';
import TypingIndicator from './TypingIndicator';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    connected, 
    currentRoom, 
    roomUsers, 
    messages, 
    typingUsers,
    joinRoom, 
    sendMessage, 
    startTyping, 
    stopTyping,
    leaveRoom
  } = useSocket();

  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const messageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Get room info from navigation state or use defaults
  const roomName = location.state?.roomName || `Room ${roomId}`;
  const roomSubject = location.state?.roomSubject || 'General';

  // Join room on component mount
  useEffect(() => {
    if (connected && roomId && user) {
      joinRoom(roomId, roomName);
    }
  }, [connected, roomId, roomName, user, joinRoom]);

  // Leave room on component unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  // Handle typing indicator
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        stopTyping();
      }, 3000);
      setTypingTimeout(timeout);
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [isTyping, stopTyping]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping();
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      stopTyping();
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) {
      return;
    }

    if (!connected) {
      toast.error('Not connected to chat server');
      return;
    }

    const success = sendMessage(messageInput.trim());
    
    if (success) {
      setMessageInput('');
      setIsTyping(false);
      stopTyping();
      messageInputRef.current?.focus();
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = messageInputRef.current?.selectionStart || messageInput.length;
    const newMessage = messageInput.slice(0, cursorPosition) + emoji + messageInput.slice(cursorPosition);
    
    setMessageInput(newMessage);
    setShowEmojiPicker(false);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      messageInputRef.current?.focus();
      messageInputRef.current?.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleBackToDashboard = () => {
    leaveRoom();
    navigate('/dashboard');
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'General': 'bg-gray-100 text-gray-800',
      'Mathematics': 'bg-blue-100 text-blue-800',
      'CS': 'bg-green-100 text-green-800',
      'Physics': 'bg-purple-100 text-purple-800',
      'Chemistry': 'bg-yellow-100 text-yellow-800',
      'Literature': 'bg-pink-100 text-pink-800',
      'History': 'bg-orange-100 text-orange-800'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Lost</h2>
          <p className="text-gray-600 mb-6">Unable to connect to chat server</p>
          <button
            onClick={handleBackToDashboard}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="btn btn-secondary btn-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-900">{roomName}</h1>
                  <span className={`badge ${getSubjectColor(roomSubject)}`}>
                    {roomSubject}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    {connected ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <span className="text-red-600">Disconnected</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{roomUsers.length} online</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUsersList(!showUsersList)}
                className="btn btn-secondary btn-sm"
                title="Toggle users list"
              >
                <Users className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary btn-sm">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages} currentUser={user} />
          </div>
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <TypingIndicator typingUsers={typingUsers} />
            </div>
          )}
          
          {/* Message Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="form-input resize-none pr-12"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  disabled={!connected}
                />
                
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={!connected}
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute bottom-full right-0 mb-2 z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={300}
                      height={400}
                    />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!messageInput.trim() || !connected}
                className="btn btn-primary"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        
        {/* Users Sidebar */}
        {showUsersList && (
          <div className="w-64 border-l bg-white flex-shrink-0">
            <UsersList users={roomUsers} currentUser={user} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
