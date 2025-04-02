import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import '../App.css';

const DashboardSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/study-sessions');
      // Sort sessions by date - upcoming first
      const sortedSessions = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSessions(sortedSessions);
      setError(null);
    } catch (err) {
      console.error('Error fetching study sessions:', err);
      setError('Failed to load study sessions');
    } finally {
      setLoading(false);
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
      weekday: 'short', 
      month: 'short', 
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

  // Get upcoming sessions (scheduled and not in the past)
  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' && new Date(session.date) > new Date()
  );

  if (loading) return <div className="loading">Loading study sessions...</div>;
  
  return (
    <div className="dashboard-sessions">
      <h3 className="sessions-title">Upcoming Study Sessions</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="sessions-container">
        {upcomingSessions.length === 0 ? (
          <p className="no-sessions">No upcoming study sessions. Join a group to participate in study sessions!</p>
        ) : (
          upcomingSessions.slice(0, 5).map(session => (
            <div key={session._id} className="session-card">
              <div className="session-header">
                <h4>{session.title}</h4>
                <span className="session-group">
                  <Link to={`/groups/${session.group._id}`}>
                    {session.group.name}
                  </Link>
                </span>
              </div>
              
              <div className="session-details">
                <p className="session-date">{formatDate(session.date)}</p>
                <p className="session-duration">{session.duration} min</p>
                <p className="session-attendees">
                  {session.attendees.length} {session.attendees.length === 1 ? 'attendee' : 'attendees'}
                </p>
              </div>
              
              <div className="session-actions">
                <Link 
                  to={`/groups/${session.group._id}`} 
                  className="view-link"
                >
                  View Group
                </Link>
              </div>
            </div>
          ))
        )}
        
        {upcomingSessions.length > 5 && (
          <div className="more-sessions">
            <Link to="/sessions" className="view-all-link">
              View all {upcomingSessions.length} upcoming sessions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSessions; 