import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import GroupDocuments from './groupdocuments';

const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState({});

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setGroup(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    
    fetchGroup();
  }, [groupId]);

  // Add a conditional check to ensure group is populated
  if (!group || Object.keys(group).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="group-page">
      <h2>{group.name}</h2>
      <p>Subject: {group.subject}</p>
      
      {/* Or use explicit checks */}
      {group.members && (
        <p>Members: {group.members.length}</p>
      )}
      <GroupDocuments groupId={groupId} />
    </div>
  );
};

export default GroupPage;
