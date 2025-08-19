import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MessageCircle, 
  Users, 
  Plus, 
  LogOut, 
  BookOpen, 
  Filter,
  Search,
  Wifi,
  WifiOff
} from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';
import CreateRoomModal from './CreateRoomModal';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  // Fetch rooms from API
  const fetchRooms = async (subject = '') => {
    try {
      setLoading(true);
      const url = subject ? `/get_rooms.php?subject=${encodeURIComponent(subject)}` : '/get_rooms.php';
      const response = await axios.get(url);
      
      if (response.data.success) {
        setRooms(response.data.rooms);
        setSubjects(response.data.subjects);
      } else {
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Load rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Filter rooms based on search term and selected subject
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || room.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
    fetchRooms(subject);
  };

  const handleJoinRoom = (room) => {
    navigate(`/room/${room.id}`, { 
      state: { 
        roomName: room.name,
        roomSubject: room.subject 
      } 
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
    setShowCreateModal(false);
    toast.success('Room created successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Study Chat</h1>
                <p className="text-sm text-gray-600">Academic Collaboration Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Disconnected</span>
                  </>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Subject Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectFilter(e.target.value)}
                  className="form-input pl-10 w-full sm:w-48"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Create Room Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <LoadingSpinner text="Loading rooms..." />
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedSubject 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Be the first to create a study room!'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <div key={room.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {room.name}
                    </h3>
                    <span className={`badge ${getSubjectColor(room.subject)} ml-2 flex-shrink-0`}>
                      {room.subject}
                    </span>
                  </div>
                  
                  {room.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {room.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Max {room.max_participants}</span>
                    </div>
                    <span>Created {formatDate(room.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      by {room.created_by_username}
                    </span>
                    <button
                      onClick={() => handleJoinRoom(room)}
                      className="btn btn-primary btn-sm"
                      disabled={!connected}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Join Room
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
          subjects={subjects}
        />
      )}
    </div>
  );
};

export default Dashboard;
