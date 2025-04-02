import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/GroupDetails.css';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/groups/${groupId}`);
        setGroup(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load group details');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div className="group-details-container">
      <div className="group-header">
        <h1>{group.name}</h1>
        <span className={`privacy-badge ${group.isPublic ? 'public' : 'private'}`}>
          {group.isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      <div className="group-info">
        <p><strong>Subject:</strong> {group.subject}</p>
        <p><strong>Department:</strong> {group.department}</p>
        <p><strong>Description:</strong> {group.description}</p>
      </div>

      <div className="members-section">
        <h2>Group Members</h2>
        <div className="members-grid">
          {group.members.map(member => (
            <div key={member._id} className="member-card">
              <div className="member-name">{member.name}</div>
              <div className="member-email">{member.email}</div>
              {group.admins.includes(member._id) && (
                <span className="admin-badge">Admin</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;