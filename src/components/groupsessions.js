import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../App.css';

const GroupSessions = ({ groupId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    date: '',
    duration: 60, // default 1 hour
    groupId: groupId
  });

  useEffect(() => {
    fetchSessions();
  }, [groupId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/study-sessions/group/${groupId}`);
      setSessions(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching group study sessions:', err);
      setError('Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setNewSession(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/study-sessions', newSession);
      setSessions(prev => [...prev, res.data]);
      setNewSession({
        title: '',
        description: '',
        date: '',
        duration: 60,
        groupId: groupId
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating study session:', err);
      setError('Failed to create study session');
    }
  };

  const handleAttendance = async (sessionId, attending) => {
    try {
      const res = await axios.patch(`/api/study-sessions/${sessionId}/attendance`, { attending });
      setSessions(prev => 
        prev.map(session => 
          session._id === sessionId ? res.data : session
        )
      );
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isAttending = (session) => {
    return session.attendees.some(attendee => 
      attendee._id === localStorage.getItem('userId') || 
      attendee === localStorage.getItem('userId')
    );
  };

  if (loading) return <div className="loading">Loading study sessions...</div>;
  
  return (
    <div className="group-sessions">
      <div className="sessions-header">
        <h3>Study Sessions</h3>
        <button 
          className="create-session-btn"
          onClick={() => setShowForm(true)}
        >
          Create Session
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="session-form-container">
          <form onSubmit={handleSubmit} className="session-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newSession.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newSession.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date & Time</label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={newSession.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="15"
                value={newSession.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">Create</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p className="no-sessions">No study sessions scheduled yet.</p>
        ) : (
          sessions.map(session => (
            <div key={session._id} className={`session-card ${session.status}`}>
              <div className="session-header">
                <h4>{session.title}</h4>
                <span className={`session-status ${session.status}`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>
              
              <div className="session-details">
                <p className="session-description">{session.description}</p>
                <p className="session-date"><strong>When:</strong> {formatDate(session.date)}</p>
                <p className="session-duration"><strong>Duration:</strong> {session.duration} minutes</p>
                <p className="session-creator"><strong>Created by:</strong> {session.createdBy.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupSessions; 