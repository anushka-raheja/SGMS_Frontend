import React, { useState } from 'react';
import axios from '../utils/axios';

const GroupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: 'Mathematics',
    isPublic: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/groups', formData);
      
      alert('Group created successfully!');
      window.location.reload();
    } catch (err) {
      console.error("Error creating group:", err); // Log the full error
  
      if (!err.response) {
        alert("Network error: Please check your internet connection.");
        return;
      }
  
      const { status, data } = err.response;
      console.log(`Error Status: ${status}, Response Data:`, data); // Log error details
  
      let errorMessage = "Group creation failed. Please try again.";
  
      if (status === 400) {
        errorMessage = data?.error || "Invalid input. Please check your data.";
      } else if (status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (status === 500) {
        errorMessage = "Server error. Try again later.";
      }
  
      alert(errorMessage);
    }
  };

  return (
    <div className="group-form">
      <h3>Create New Study Group</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Group Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Subject:</label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
            />
            Public Group
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Create Group
        </button>
      </form>
    </div>
  );
};

export default GroupForm;
