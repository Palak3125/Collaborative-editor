import React, { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';

const UserList = ({ documentId }) => {
  const [users, setUsers] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('users-updated', (userList) => {
        setUsers(userList);
      });

      socket.on('user-joined', (userData) => {
        setUsers(prev => {
          const filtered = prev.filter(u => u.id !== userData.id);
          return [...filtered, userData];
        });
      });

      socket.on('user-left', (data) => {
        setUsers(prev => prev.filter(u => u.id !== data.userId));
      });

      return () => {
        socket.off('users-updated');
        socket.off('user-joined');
        socket.off('user-left');
      };
    }
  }, [socket]);

  return (
    <div className="user-list">
      <h3>👥 Active Users ({users.length})</h3>
      <div className="users">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <div 
              className="user-avatar" 
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.name}</span>
            <div className="user-status online"></div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="no-users">No other users online</p>
        )}
      </div>
    </div>
  );
};

export default UserList;