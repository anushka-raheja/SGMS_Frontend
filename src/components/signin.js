import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/signin', formData);
      alert('Login successful');
      navigate('/dashboard');
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('token', res.data.token); // Store the JWT token
    } catch (error) {
      console.error(error.response.data);
      alert('Error during sign-in');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" onChange={handleChange} placeholder="Email" required />
      <input type="password" name="password" onChange={handleChange} placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  );
};

export default SignIn;
