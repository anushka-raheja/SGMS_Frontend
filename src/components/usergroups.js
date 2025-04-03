import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

const UserGroups = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setError('Please sign in to view your groups');
          setLoading(false);
          return;
        }

        console.log('Fetching user groups...');
        const res = await axios.get('/api/groups/my-groups');
        console.log('User groups response:', res.data);
        setUserGroups(res.data);
      } catch (err) {
        console.error('Failed to fetch groups:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        setError(err.response?.data?.error || 'Failed to load your groups');
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-groups">
      <h3>My Groups</h3>
      {loading ? (
        <p>Loading your groups...</p>
      ) : userGroups.length > 0 ? (
        <div className="groups-list">
          {userGroups.map(group => (
            <div key={group._id} className="group-card">
              <div className="group-header">
                <h3 className="group-title">{group.name}</h3>
                <span className="privacy-badge">
                  {group.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              
              <div className="group-content">
                <div className="group-details">
                  <p className="group-subject">Subject: {group.subject}</p>
                  <p className="group-department">Department: {group.department || 'General'}</p>
                </div>
                <p className="group-description">{group.description}</p>
                
                <div className="group-meta">
                  <span className="members-count">
                    👥 {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  </span>
                  <span className="admin-info">
                    Admin: {group.admins[0]?.name || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="group-actions">
                <Link to={`/groups/${group._id}`} className="view-group-button">
                  View Group Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No groups found. Create or join a group!</p>
      )}
    </div>
  );
};

export default UserGroups;
