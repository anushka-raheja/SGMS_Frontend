import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    courses: [],
    studyPreferences: {
      preferredTime: '',
      preferredEnvironment: '',
      learningStyle: '',
      groupSize: ''
    }
  });

  const [newCourse, setNewCourse] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile data...');
      const response = await axios.get('/api/users/profile');
      console.log('Profile data received:', response.data);
      
      // Ensure studyPreferences exists in the response
      const profileData = {
        ...response.data,
        studyPreferences: response.data.studyPreferences || {
          preferredTime: '',
          preferredEnvironment: '',
          learningStyle: '',
          groupSize: ''
        }
      };
      
      setProfile(profileData);
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setProfile(prev => ({
        ...prev,
        courses: [...prev.courses, newCourse.trim()]
      }));
      setNewCourse('');
    }
  };

  const handleRemoveCourse = (courseToRemove) => {
    setProfile(prev => ({
      ...prev,
      courses: prev.courses.filter(course => course !== courseToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await axios.put('/api/users/profile', profile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-container error-message">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h2>Student Profile</h2>
      {!isEditing ? (
        <div className="profile-view">
          <h3>{profile.name}'s Profile</h3>
          <div className="profile-section">
            <h4>Courses</h4>
            <ul>
              {profile.courses.map((course, index) => (
                <li key={index}>{course}</li>
              ))}
            </ul>
          </div>
          <div className="profile-section">
            <h4>Study Preferences</h4>
            <p>Preferred Time: {profile.studyPreferences.preferredTime || 'Not set'}</p>
            <p>Environment: {profile.studyPreferences.preferredEnvironment || 'Not set'}</p>
            <p>Learning Style: {profile.studyPreferences.learningStyle || 'Not set'}</p>
            <p>Preferred Group Size: {profile.studyPreferences.groupSize || 'Not set'}</p>
          </div>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Courses:</label>
            <div className="courses-input">
              <input
                type="text"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                placeholder="Add a course"
              />
              <button type="button" onClick={handleAddCourse}>Add</button>
            </div>
            <ul>
              {profile.courses.map((course, index) => (
                <li key={index}>
                  {course}
                  <button type="button" onClick={() => handleRemoveCourse(course)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="form-group">
            <label>Study Preferences</label>
            <select
              name="studyPreferences.preferredTime"
              value={profile.studyPreferences.preferredTime}
              onChange={handleInputChange}
            >
              <option value="">Select Preferred Time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>

            <select
              name="studyPreferences.preferredEnvironment"
              value={profile.studyPreferences.preferredEnvironment}
              onChange={handleInputChange}
            >
              <option value="">Select Study Environment</option>
              <option value="quiet">Quiet Space</option>
              <option value="moderate">Moderate Noise</option>
              <option value="busy">Busy Environment</option>
            </select>

            <select
              name="studyPreferences.learningStyle"
              value={profile.studyPreferences.learningStyle}
              onChange={handleInputChange}
            >
              <option value="">Select Learning Style</option>
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="reading">Reading/Writing</option>
              <option value="kinesthetic">Kinesthetic</option>
            </select>

            <select
              name="studyPreferences.groupSize"
              value={profile.studyPreferences.groupSize}
              onChange={handleInputChange}
            >
              <option value="">Select Preferred Group Size</option>
              <option value="small">Small (2-3)</option>
              <option value="medium">Medium (4-6)</option>
              <option value="large">Large (7+)</option>
            </select>
          </div>

          <div className="button-group">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile; 