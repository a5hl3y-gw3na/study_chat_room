import React from 'react';
import { Crown, User, Circle } from 'lucide-react';

const UsersList = ({ users, currentUser }) => {
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

  const formatJoinTime = (joinedAt) => {
    const joinTime = new Date(joinedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - joinTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just joined';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  // Sort users: current user first, then alphabetically
  const sortedUsers = [...users].sort((a, b) => {
    if (a.username === currentUser?.username) return -1;
    if (b.username === currentUser?.username) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Online Users ({users.length})
          </h3>
        </div>
      </div>
      
      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {sortedUsers.length === 0 ? (
          <div className="p-4 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No users online</p>
          </div>
        ) : (
          <div className="p-2">
            {sortedUsers.map((user) => {
              const isCurrentUser = user.username === currentUser?.username;
              
              return (
                <div
                  key={user.userId || user.username}
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    isCurrentUser ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getUserColor(user.username)}`}
                    >
                      {getUserInitials(user.username)}
                    </div>
                    
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1">
                      <Circle className="w-4 h-4 text-green-500 fill-current" />
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate ${
                        isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {isCurrentUser ? 'You' : user.username}
                      </p>
                      
                      {/* Crown icon for room creator (if we had that info) */}
                      {/* {user.isCreator && (
                        <Crown className="w-4 h-4 text-yellow-500" title="Room Creator" />
                      )} */}
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate">
                      {user.joinedAt ? formatJoinTime(user.joinedAt) : 'Online'}
                    </p>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Circle className="w-2 h-2 text-green-500 fill-current" />
          <span>All users are online</span>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
