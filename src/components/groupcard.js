import React from 'react';
import { Link } from 'react-router-dom';


const GroupCard = ({ 
  group: {
    _id,
    name,
    subject,
    department = 'General',
    members = [],
    admins = [],
    joinRequests = [],
    isPublic,
    description
  },
  currentUserId,
  onJoinGroup,
  onJoinRequest,
  joiningId,
  error
}) => {
    console.log('Current Group:', name);
    console.log('Current User ID:', currentUserId);
  console.log('Group Members:', members);
  const isMember = members.some(member => {
    if (typeof member === 'object') {
      return member._id?.toString() === currentUserId?.toString();
    }
    return member?.toString() === currentUserId?.toString();
  });
  console.log('Final isMember Result:', isMember);
  const isAdmin = admins.some(admin => {
    if (typeof admin === 'object') {
      return admin._id?.toString() === currentUserId?.toString();
    }
    return admin?.toString() === currentUserId?.toString();
  });

  const adminName = admins[0]?.name || 'Unknown';

  return (
    <div className={`group-card ${isPublic ? 'public' : 'private'}`}>
      <div className="group-header">
        <h3 className="group-title">{name}</h3>
        <span className="privacy-badge">
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      <div className="group-content">
        <div className="group-details">
          <p className="group-subject">Subject: {subject}</p>
          <p className="group-department">Department: {department}</p>
        </div>
        <p className="group-description">{isPublic ? description : 'Join to view details'}</p>
        
        <div className="group-meta">
          <span className="members-count">
            👥 {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
          <span className="admin-info">
            Admin: {adminName}
          </span>
        </div>
      </div>

      {!isMember && isPublic && (
        <div className="group-actions">
          <button 
            className="join-button"
            onClick={() => onJoinGroup(_id)}
            disabled={joiningId === _id}
          >
            {joiningId === _id ? 'Joining...' : 'Join Group'}
          </button>
          {error?.groupId === _id && (
            <p className="error-message">{error.message}</p>
          )}
        </div>
      )}

      {!isPublic && !isMember && (
        <div className="group-actions">
          <button 
            className="request-button"
            onClick={() => onJoinRequest(_id)}
            disabled={joinRequests.includes(currentUserId)}
          >
            {joinRequests.includes(currentUserId) 
              ? 'Request Pending' 
              : 'Request to Join'}
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="admin-badge">You are an admin</div>
      )}
      <Link to={`/groups/${_id}`}>
        View Group Page
      </Link>
    </div>
  );
};

export default React.memo(GroupCard);
