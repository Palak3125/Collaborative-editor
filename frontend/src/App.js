import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Editor from './components/Editor';
import UserList from './components/UserList';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [documentId, setDocumentId] = useState('');
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('#FF6B6B');
  const [isJoined, setIsJoined] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Load available documents
    fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/api/documents`)
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(console.error);
  }, []);

  const createNewDocument = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/api/documents/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `New Document ${new Date().toLocaleString()}`,
        }),
      });
      
      const data = await response.json();
      setDocumentId(data.documentId);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const joinDocument = () => {
    if (userName.trim() && documentId.trim()) {
      setIsJoined(true);
    }
  };

  const generateRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!isJoined) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🚀 Collaborative Code Editor</h1>
          <p>Join a real-time collaborative coding session</p>
          
          <div className="form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>Your Color:</label>
            <div className="color-picker">
              <input
                type="color"
                value={userColor}
                onChange={(e) => setUserColor(e.target.value)}
              />
              <button onClick={() => setUserColor(generateRandomColor())}>
                🎲 Random
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Document ID:</label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="Enter document ID or create new"
            />
          </div>

          <div className="button-group">
            <button onClick={joinDocument} disabled={!userName.trim() || !documentId.trim()}>
              Join Document
            </button>
            <button onClick={createNewDocument}>
              Create New Document
            </button>
          </div>

          {documents.length > 0 && (
            <div className="recent-documents">
              <h3>Recent Documents:</h3>
              <ul>
                {documents.slice(0, 5).map(doc => (
                  <li key={doc._id}>
                    <button 
                      onClick={() => setDocumentId(doc._id)}
                      className="doc-button"
                    >
                      📄 {doc.title} ({doc.language})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>📝 Collaborative Editor</h1>
        <div className="document-info">
          <span>Document: {documentId.slice(0, 8)}...</span>
          <span>User: {userName}</span>
          <button onClick={() => setIsJoined(false)} className="leave-btn">
            Leave
          </button>
        </div>
      </div>
      
      <div className="app-body">
        <div className="editor-section">
          <Editor 
            documentId={documentId} 
            user={{ name: userName, color: userColor }} 
          />
        </div>
        
        <div className="sidebar">
          <UserList documentId={documentId} />
          <Chat documentId={documentId} user={{ name: userName, color: userColor }} />
        </div>
      </div>
    </div>
  );
}

export default App;