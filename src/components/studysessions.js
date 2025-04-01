import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const StudySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    description: ''
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/study-sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching study sessions:', err);
    }
  };

  const handleChange = e => setNewSession({...newSession, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please sign in to create a study session');
        return;
      }

      const res = await axios.post('/api/study-sessions', newSession);
      setSessions(prevSessions => [...prevSessions, res.data]);
      setNewSession({
        title: '',
        subject: '',
        date: '',
        startTime: '',
        endTime: '',
        description: ''
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating study session:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please sign in again.');
        // You might want to redirect to login here
      } else if (err.response?.status === 404) {
        alert('Unable to create study session. Please try again.');
      } else {
        alert('An error occurred while creating the study session.');
      }
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`/api/study-sessions/${sessionId}`);
      setSessions(sessions.filter(session => session._id !== sessionId));
    } catch (err) {
      console.error('Error deleting study session:', err);
    }
  };

  return (
    <div className="study-sessions-section">
      {!showForm ? (
        <button 
          className="add-session-button" 
          onClick={() => setShowForm(true)}
        >
          Add New Study Session
        </button>
      ) : (
        <form className="session-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Session Title</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Enter session title"
              value={newSession.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              name="subject"
              value={newSession.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={newSession.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              id="startTime"
              type="time"
              name="startTime"
              value={newSession.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              id="endTime"
              type="time"
              name="endTime"
              value={newSession.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what you'll study"
              value={newSession.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="session-form-buttons">
            <button type="submit">Create Session</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="sessions-list">
        {sessions.map(session => (
          <div key={session._id} className="session-item">
            <div className="session-header">
              <h3 className="session-title">{session.title}</h3>
              <span className="session-subject">{session.subject}</span>
            </div>
            <p className="session-details">{session.description}</p>
            <div className="session-time">
              <span>Date: {new Date(session.date).toLocaleDateString()}</span>
              <span>Time: {session.startTime} - {session.endTime}</span>
            </div>
            <button 
              className="delete-session-button"
              onClick={() => deleteSession(session._id)}
            >
              Delete Session
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="no-sessions-message">No study sessions scheduled. Add your first session to get started!</p>
        )}
      </div>
    </div>
  );
};

export default StudySessions; 