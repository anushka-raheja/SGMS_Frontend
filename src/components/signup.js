import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/signup', formData);
      
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user._id);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        setError(error.response.data.message || 'Failed to sign up');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('An error occurred during sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>
        <div className="form-group">
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
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
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
