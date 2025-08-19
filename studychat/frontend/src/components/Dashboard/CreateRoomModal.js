import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Plus, BookOpen } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const CreateRoomModal = ({ onClose, onRoomCreated, subjects }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    max_participants: 50
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? parseInt(value) || '' : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Room name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Room name must be less than 100 characters';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (formData.max_participants < 2) {
      newErrors.max_participants = 'Minimum 2 participants required';
    } else if (formData.max_participants > 100) {
      newErrors.max_participants = 'Maximum 100 participants allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/create_room.php', formData);
      
      if (response.data.success) {
        onRoomCreated(response.data.room);
        toast.success('Room created successfully!');
      } else {
        toast.error(response.data.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create room';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="card w-full max-w-md fade-in">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create Study Room</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Room Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g., Calculus Study Group"
                disabled={isLoading}
                maxLength={100}
              />
              {errors.name && (
                <div className="form-error">{errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`form-input ${errors.subject ? 'error' : ''}`}
                disabled={isLoading}
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {errors.subject && (
                <div className="form-error">{errors.subject}</div>
              )}
            </div>

            {formData.subject === 'Other' && (
              <div className="form-group">
                <label htmlFor="custom_subject" className="form-label">
                  Custom Subject *
                </label>
                <input
                  type="text"
                  id="custom_subject"
                  name="subject"
                  value={formData.subject === 'Other' ? '' : formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="form-input"
                  placeholder="Enter custom subject"
                  disabled={isLoading}
                  maxLength={50}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Brief description of what this room is for..."
                disabled={isLoading}
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="max_participants" className="form-label">
                Maximum Participants
              </label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                className={`form-input ${errors.max_participants ? 'error' : ''}`}
                min="2"
                max="100"
                disabled={isLoading}
              />
              {errors.max_participants && (
                <div className="form-error">{errors.max_participants}</div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" text="" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Room
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
