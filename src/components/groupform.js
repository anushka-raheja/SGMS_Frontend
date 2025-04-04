import React, { useState } from 'react';
import axios from '../utils/axios';

const GroupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    department: 'Computer Science & Engineering',
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
          <label>Department:</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
          >
            <option value="">Select Department</option>
            <option value="Multi Departmental">Multi Departmental</option>
            <option value="Aerospace Engineering">Aerospace Engineering</option>
            <option value="Agricultural & Food Engineering">Agricultural & Food Engineering</option>
            <option value="Architecture">Architecture</option>
            <option value="Biotechnology">Biotechnology</option>
            <option value="Chemical Engineering">Chemical Engineering</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Electronics & Electrical Communication Engineering">Electronics & Electrical Communication Engineering</option>
            <option value="Geology & Geophysics">Geology & Geophysics</option>
            <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
            <option value="Industrial Engineering">Industrial Engineering</option>
            <option value="Materials Science">Materials Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Medical Science & Technology">Medical Science & Technology</option>
            <option value="Metallurgical & Materials Engineering">Metallurgical & Materials Engineering</option>
            <option value="Mining Engineering">Mining Engineering</option>
            <option value="Ocean Engineering & Naval Architecture">Ocean Engineering & Naval Architecture</option>
          </select>
        </div>

        <div className="form-group">
          <label>Subject:</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="Enter the subject"
            required
          />
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
