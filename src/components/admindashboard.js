import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/api/groups/admin/requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (groupId, userId) => {
    try {
      await axios.post(`/api/groups/${groupId}/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(requests.map(group => 
        group._id === groupId ? 
        { ...group, joinRequests: group.joinRequests.filter(u => u._id !== userId) } 
        : group
      ));
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Pending Join Requests</h2>
      {requests.map(group => (
        <div key={group._id} className="group-requests">
          <h3>{group.name}</h3>
          {group.joinRequests.map(user => (
            <div key={user._id} className="request-item">
              <span>{user.name} ({user.email})</span>
              <button onClick={() => handleApprove(group._id, user._id)}>
                Approve
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;