import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import GroupCard from './groupcard'; // Adjust import path as needed

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    department: ''
  });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  
  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('userId');

  // Fetch groups on component mount
  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups/list');
      setGroups(response.data);
      
      // Extract unique subjects and departments for filter options
      const subjects = [...new Set(response.data.map(group => group.subject))];
      const departments = [...new Set(response.data.map(group => group.department || 'General'))];
      
      setSubjectOptions(subjects);
      setDepartmentOptions(departments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  // Use it in useEffect
  useEffect(() => {
    fetchGroups();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      department: ''
    });
  };

  // Apply filters to the groups
  const filteredGroups = groups.filter(group => {
    const matchesSubject = !filters.subject || group.subject === filters.subject;
    const matchesDepartment = !filters.department || (group.department || 'General') === filters.department;
    return matchesSubject && matchesDepartment;
  });

  // Handle join group functionality
  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningId(groupId);
      setError(null);
      
      const response = await axios.post(`/api/groups/${groupId}/join`);
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
      await axios.post(`/api/groups/${groupId}/request`);
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

  if (error && typeof error === 'string') {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="groups-list">
      <h2>Available Study Groups</h2>
      
      {groups.length > 0 && (
        <div className="filter-controls">
          <div className="filter-row">
            <div className="filter-item">
              <label htmlFor="subject-filter">Subject:</label>
              <select
                id="subject-filter"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
              >
                <option value="">All Subjects</option>
                {subjectOptions.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="department-filter">Department:</label>
              <select
                id="department-filter"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
              >
                <option value="">All Departments</option>
                {departmentOptions.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="reset-filter-btn"
              onClick={resetFilters}
              disabled={!filters.subject && !filters.department}
            >
              Reset Filters
            </button>
          </div>
          
          <div className="filter-results">
            Showing {filteredGroups.length} of {groups.length} groups
          </div>
        </div>
      )}
      
      <div className="groups-grid">
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <GroupCard
              key={group._id}
              group={group}
              currentUserId={currentUserId}
              onJoinGroup={handleJoinGroup}
              onJoinRequest={handleJoinRequest}
              joiningId={joiningId}
              error={error}
            />
          ))
        ) : (
          <p className="no-groups">
            {groups.length > 0 
              ? <>No groups match your filters. <button onClick={resetFilters}>Clear filters</button></>
              : 'No study groups available to join.'
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupsList;
