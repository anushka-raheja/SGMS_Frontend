import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GroupCard from './groupcard'; // Adjust import path as needed

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  
  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('userId');

  // Fetch groups on component mount
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/groups/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  // 2. Use it in useEffect
  useEffect(() => {
    fetchGroups();
  }, []);

  // Handle join group functionality
  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningId(groupId);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`/api/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the groups list with the new member
      setGroups(groups.map(group => 
        group._id === groupId ? response.data : group
      ));
    } catch (err) {
      setError({
        groupId,
        message: err.response?.data?.message || 'Failed to join group'
      });
    } finally {
      setJoiningId(null);
    }
  };

  const handleJoinRequest = async (groupId) => {
    try {
      await axios.post(`/api/groups/${groupId}/request`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Refresh groups list
      fetchGroups();
    } catch (err) {
      setError({
        groupId,
        message: err.response?.data?.error || 'Request failed'
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading groups...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="groups-list">
      <h2>Available Study Groups</h2>
      
      <div className="groups-grid">
        {groups.map(group => (
          <GroupCard
            key={group._id}
            group={group}
            currentUserId={currentUserId}
            onJoinGroup={handleJoinGroup}
            onJoinRequest={handleJoinRequest}
            joiningId={joiningId}
            error={error}
          />
        ))}
      </div>
      
      {groups.length === 0 && (
        <p className="no-groups">No study groups available to join.</p>
      )}
    </div>
  );
};

export default GroupsList;
