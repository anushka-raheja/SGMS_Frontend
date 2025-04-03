import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchSessions = useCallback(async () => {
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
  }, [groupId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

  if (loading) return <div className="loading">Loading study sessions...</div>;

  return (
    <div className="group-sessions">
      <div className="sessions-header">
        <h3>Study Sessions</h3>
        <button 
          className="create-session-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Create New Session'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="session-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newSession.title}
              onChange={handleChange}
              required
              placeholder="Enter session title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newSession.description}
              onChange={handleChange}
              placeholder="Enter session description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date and Time</label>
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
              value={newSession.duration}
              onChange={handleChange}
              required
              min="15"
              max="480"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">Create Session</button>
          </div>
        </form>
      )}

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p className="no-sessions">No study sessions scheduled yet.</p>
        ) : (
          sessions.map(session => (
            <div key={session._id} className="session-card">
              <div className="session-info">
                <h4>{session.title}</h4>
                {session.description && (
                  <p className="description">{session.description}</p>
                )}
                <p className="date-time">{formatDate(session.date)}</p>
                <p className="duration">{session.duration} minutes</p>
                <p className="created-by">Created by: {session.createdBy.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupSessions; 