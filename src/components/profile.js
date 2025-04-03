import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../App.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchUserGroups();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile data...');
      
      // Ensure token is in headers for authorization
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please sign in again.');
        setLoading(false);
        return;
      }
      
      // Make sure axios has the token in its headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get('/api/users/me');
      console.log('Profile data received:', response.data);
      
      const profileData = {
        name: response.data.name || '',
        email: response.data.email || '',
        department: response.data.department || 'Not specified'
      };
      
      setProfile(profileData);
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      if (err.response) {
        setError(err.response.data.message || 'Failed to load profile');
      } else if (err.request) {
        setError('No response received from server. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get('/api/groups/my-groups');
      setGroups(response.data);
    } catch (err) {
      console.error('Error fetching user groups:', err);
      // Do not set error state here as we still want to show profile even if groups fail
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
      <h2>User Profile</h2>
      <div className="profile-view">
        <h3>{profile.name}'s Profile</h3>
        
        <div className="profile-section">
          <h4>Contact Information</h4>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Department:</strong> {profile.department}</p>
        </div>
        
        <div className="profile-section">
          <h4>My Groups</h4>
          {groups.length > 0 ? (
            <ul className="groups-list">
              {groups.map(group => (
                <li key={group._id} className="group-item">
                  <strong>{group.name}</strong>
                  <span> ({group.subject})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not a member of any groups yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 