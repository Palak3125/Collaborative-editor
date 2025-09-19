import React, { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';

const Chat = ({ documentId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('chat-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        socket.off('chat-message');
      };
    }
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('chat-message', {
        documentId,
        message: newMessage.trim(),
        user
      });
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : ''}`}>
      <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>💬 Chat</h3>
        <div className="chat-toggle">
          {messages.length > 0 && (
            <span className="message-count">{messages.length}</span>
          )}
          <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
        </div>
      </div>

      {isOpen && (
        <div className="chat-content">
          <div className="messages">
            {messages.map(message => (
              <div key={message.id} className="message">
                <div className="message-header">
                  <span 
                    className="message-user"
                    style={{ color: message.user.color }}
                  >
                    {message.user.name}
                  </span>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className="message-content">
                  {message.message}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="no-messages">
                💡 Start a conversation with your collaborators!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
            />
            <button type="submit" disabled={!newMessage.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;