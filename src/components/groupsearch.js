import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import GroupCard from './groupcard';

const GroupSearch = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    department: ''
  });

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.department) queryParams.append('department', filters.department);

      const response = await axios.get(`/api/groups/list?${queryParams.toString()}`);
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="group-search">
      <div className="search-filters">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Search groups..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Science">Science</option>
            <option value="Arts">Arts</option>
            <option value="Business">Business</option>
            <option value="Medicine">Medicine</option>
          </select>
        </div>
      </div>

      <div className="groups-grid">
        {groups.map(group => (
          <GroupCard
            key={group._id}
            group={group}
            currentUserId={localStorage.getItem('userId')}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupSearch; 