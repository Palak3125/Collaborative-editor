import React, { useState, useEffect, useRef } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import useSocket from '../hooks/useSocket';

const Editor = ({ documentId, user }) => {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [users, setUsers] = useState([]);
  const editorRef = useRef(null);
  const socket = useSocket();
  
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
    'html', 'css', 'json', 'markdown', 'sql', 'php', 'go', 'rust'
  ];

  useEffect(() => {
    if (socket && documentId) {
      socket.emit('join-document', { documentId, user });

      socket.on('document-loaded', (data) => {
        setContent(data.content);
        setLanguage(data.language);
        setTitle(data.title);
      });

      socket.on('code-updated', (data) => {
        if (data.userId !== socket.id) {
          setContent(data.content);
        }
      });

      socket.on('users-updated', (userList) => {
        setUsers(userList.filter(u => u.id !== socket.id));
      });

      socket.on('user-joined', (userData) => {
        if (userData.id !== socket.id) {
          setUsers(prev => [...prev.filter(u => u.id !== userData.id), userData]);
        }
      });

      socket.on('user-left', (data) => {
        setUsers(prev => prev.filter(u => u.id !== data.userId));
      });

      socket.on('cursor-updated', (data) => {
        // Handle cursor updates from other users
        console.log('Cursor updated:', data);
      });

      socket.on('language-updated', (data) => {
        setLanguage(data.language);
      });

      return () => {
        socket.off('document-loaded');
        socket.off('code-updated');
        socket.off('users-updated');
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('cursor-updated');
        socket.off('language-updated');
      };
    }
  }, [socket, documentId, user]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorPosition((e) => {
      if (socket) {
        socket.emit('cursor-change', {
          documentId,
          position: {
            line: e.position.lineNumber,
            column: e.position.column
          }
        });
      }
    });
  };

  const handleEditorChange = (value) => {
    setContent(value || '');
    if (socket) {
      socket.emit('code-change', {
        documentId,
        content: value || ''
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (socket) {
      socket.emit('language-change', {
        documentId,
        language: newLanguage
      });
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="document-title"
            placeholder="Document title..."
          />
        </div>
        
        <div className="toolbar-right">
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-selector"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
          
          <span className="user-count">
            👥 {users.length + 1} user{users.length !== 0 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="editor-wrapper">
        <MonacoEditor
          height="100%"
          language={language}
          value={content}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            fontFamily: 'Fira Code, Monaco, Consolas, monospace',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
          }}
        />
        
        {/* User cursors overlay */}
        <div className="cursors-overlay">
          {users.map(user => (
            <div
              key={user.id}
              className="user-cursor"
              style={{
                borderColor: user.color,
                color: user.color
              }}
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Editor;