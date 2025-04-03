import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useParams } from 'react-router-dom';
import GroupDocuments from './groupdocuments';
import GroupSessions from './groupsessions';
import '../App.css';

const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/groups/${groupId}`);
        
        // Check if response and response.data exist before setting state
        if (res && res.data) {
          setGroup(res.data);
          setError(null);
        } else {
          setError('No data received from server');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.error || 'Failed to load group data');
      } finally {
        setLoading(false);
      }
    };
    
    if (groupId) {
      fetchGroup();
    } else {
      setError('No group ID provided');
      setLoading(false);
    }
  }, [groupId]);

  if (loading) {
    return <div className="loading">Loading group information...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Add a conditional check to ensure group is populated
  if (!group) {
    return <div className="no-group">Group not found</div>;
  }

  return (
    <div className="group-page">
      <div className="group-header">
        <h2>{group.name}</h2>
        <div className="group-info">
          <p><strong>Subject:</strong> {group.subject}</p>
          <p><strong>Department:</strong> {group.department || 'General'}</p>
          {group.members && (
            <p><strong>Members:</strong> {group.members.length}</p>
          )}
        </div>
      </div>
      
      <div className="group-content">
        <div className="group-section">
          <GroupSessions groupId={groupId} />
        </div>
        
        <div className="group-section">
          <GroupDocuments groupId={groupId} />
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
