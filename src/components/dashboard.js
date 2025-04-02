// pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from "react-router-dom";
import GroupsList from './grouplist';
import UserGroups from '../components/usergroups';
import AdminDashboard from './admindashboard';
import GoalsDash from './goalsdash';
import DashboardSessions from './dashboardsessions';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('/api/users/me');
        setUser(userRes.data);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {user && (
        <div className="profile-section">
          <header className="profile-header">
            <h2>Welcome, {user.name}</h2>
            <p className="email">Email: {user.email}</p>
            <Link to="/profile" className="profile-link">View/Edit Profile</Link>
          </header>
        </div>
      )}
      
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="dashboard-left">
            <h2 className="section-title">My Study Groups</h2>
            <UserGroups />
            <Link to="/create-group" className="create-group-button">Create New Group</Link>
            
            <div className="all-groups-section">
              <h2 className="section-title">All Study Groups</h2>
              <GroupsList />
            </div>
          </div>

          <div className="dashboard-right">
            <h2 className="section-title">Study Goals</h2>
            <GoalsDash/>

            <DashboardSessions />

            <div className="admin-section">
              <h2 className="section-title">Admin Dashboard</h2>
              <AdminDashboard/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
