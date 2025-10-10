/*const express = require('express');

const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Document = require('./models/Document');
const documentRoutes = require('./routes/documents');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/documents', documentRoutes);

// Store active users and documents in memory
const activeUsers = new Map();
const activeDocuments = new Map();

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a document room
  socket.on('join-document', async ({ documentId, user }) => {
    socket.join(documentId);
    
    // Add user to active users
    const userData = {
      id: socket.id,
      name: user.name || `User ${socket.id.slice(0, 6)}`,
      color: user.color || getRandomColor(),
      cursor: { line: 0, column: 0 }
    };
    
    if (!activeUsers.has(documentId)) {
      activeUsers.set(documentId, new Map());
    }
    activeUsers.get(documentId).set(socket.id, userData);
    
    // Load document from database
    try {
      let document = await Document.findById(documentId);
      if (!document) {
        document = new Document({
          _id: documentId,
          title: `Document ${documentId.slice(0, 8)}`,
          content: '// Welcome to the collaborative editor!\n// Start typing and see real-time collaboration in action\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();',
          language: 'javascript'
        });
        await document.save();
      }
      
      // Send document content to user
      socket.emit('document-loaded', {
        content: document.content,
        language: document.language,
        title: document.title
      });
      
      // Send current users list
      const users = Array.from(activeUsers.get(documentId).values());
      socket.emit('users-updated', users);
      socket.to(documentId).emit('user-joined', userData);
      
    } catch (error) {
      console.error('Error loading document:', error);
      socket.emit('error', 'Failed to load document');
    }
  });

  // Handle code changes
  socket.on('code-change', async ({ documentId, content, changes }) => {
    try {
      // Update document in database
      await Document.findByIdAndUpdate(documentId, { content });
      
      // Broadcast changes to other users
      socket.to(documentId).emit('code-updated', {
        content,
        changes,
        userId: socket.id
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  });

  // Handle cursor position changes
  socket.on('cursor-change', ({ documentId, position }) => {
    const documentUsers = activeUsers.get(documentId);
    if (documentUsers && documentUsers.has(socket.id)) {
      const user = documentUsers.get(socket.id);
      user.cursor = position;
      
      socket.to(documentId).emit('cursor-updated', {
        userId: socket.id,
        position,
        user
      });
    }
  });

  // Handle language changes
  socket.on('language-change', async ({ documentId, language }) => {
    try {
      await Document.findByIdAndUpdate(documentId, { language });
      socket.to(documentId).emit('language-updated', { language });
    } catch (error) {
      console.error('Error updating language:', error);
    }
  });

  // Handle chat messages
  socket.on('chat-message', ({ documentId, message, user }) => {
    const chatMessage = {
      id: uuidv4(),
      user,
      message,
      timestamp: new Date()
    };
    
    io.to(documentId).emit('chat-message', chatMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all documents
    activeUsers.forEach((documentUsers, documentId) => {
      if (documentUsers.has(socket.id)) {
        const user = documentUsers.get(socket.id);
        documentUsers.delete(socket.id);
        
        socket.to(documentId).emit('user-left', {
          userId: socket.id,
          user
        });
        
        // Send updated users list
        const users = Array.from(documentUsers.values());
        socket.to(documentId).emit('users-updated', users);
      }
    });
  });
});

// Helper function to generate random colors
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/


const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL [
    'http://localhost:3000',
    'collaborative-editor-blush.vercel.app', // Update this after deploying frontend
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path}`);
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// MongoDB Connection with detailed logging
console.log('🔄 Connecting to MongoDB...');
console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Found in .env' : 'NOT FOUND in .env');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('📊 Database name:', mongoose.connection.db.databaseName);
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.log('⚠️  Server will continue without MongoDB');
});

// MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Import models and routes AFTER connection setup
let Document;
let documentRoutes;

try {
  Document = require('./models/Document');
  documentRoutes = require('./routes/documents');
  console.log('✅ Models and routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading models/routes:', error.message);
  console.log('⚠️  Creating fallback routes...');
  
  // Fallback in-memory storage
  let documents = {};
  
  // Create simple routes if files don't exist
  documentRoutes = express.Router();
  
  documentRoutes.post('/', (req, res) => {
    const { documentId, title } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    if (documents[documentId]) {
      return res.status(400).json({ error: 'Document already exists' });
    }

    documents[documentId] = {
      documentId,
      title: title || `Document-${documentId}`,
      content: '// Start coding here...',
      language: 'javascript',
      createdAt: new Date()
    };

    console.log('✅ Document created (in-memory):', documentId);
    res.json({ success: true, document: documents[documentId] });
  });

  documentRoutes.get('/:id', (req, res) => {
    const doc = documents[req.params.id];
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(doc);
  });
}

// Routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.use('/api/documents', documentRoutes);

// Test MongoDB connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };
    
    let result = {
      status: states[dbState],
      database: mongoose.connection.db?.databaseName || 'Not connected'
    };
    
    if (dbState === 1) {
      const count = await Document.countDocuments();
      result.documentCount = count;
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Test MongoDB connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };
    
    let result = {
      status: states[dbState],
      database: mongoose.connection.db?.databaseName || 'Not connected'
    };
    
    if (dbState === 1 && Document) {
      try {
        const count = await Document.countDocuments();
        result.documentCount = count;
      } catch (e) {
        result.documentCount = 'Error counting documents';
      }
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Store active users and documents in memory
const activeUsers = new Map();
const activeDocuments = new Map();

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join a document room
  socket.on('join-document', async ({ documentId, user }) => {
    console.log(`📝 User ${socket.id} joining document ${documentId}`);
    socket.join(documentId);
    
    // Add user to active users
    const userData = {
      id: socket.id,
      name: user?.name || `User ${socket.id.slice(0, 6)}`,
      color: user?.color || getRandomColor(),
      cursor: { line: 0, column: 0 }
    };
    
    if (!activeUsers.has(documentId)) {
      activeUsers.set(documentId, new Map());
    }
    activeUsers.get(documentId).set(socket.id, userData);
    
    // Load document from database or create new one
    try {
      let document;
      
      if (Document && mongoose.connection.readyState === 1) {
        // Try MongoDB first
        document = await Document.findById(documentId);
        if (!document) {
          document = new Document({
            _id: documentId,
            title: `Document ${documentId.slice(0, 8)}`,
            content: '// Welcome to the collaborative editor!\n// Start typing and see real-time collaboration in action\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();',
            language: 'javascript'
          });
          await document.save();
          console.log('✅ New document created in MongoDB:', documentId);
        }
      } else {
        // Fallback to memory
        console.log('⚠️  Using in-memory storage for document:', documentId);
        document = {
          _id: documentId,
          title: `Document ${documentId.slice(0, 8)}`,
          content: '// Welcome to the collaborative editor!\n// Start typing and see real-time collaboration in action\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();',
          language: 'javascript'
        };
      }
      
      // Send document content to user
      socket.emit('document-loaded', {
        content: document.content,
        language: document.language,
        title: document.title
      });
      
      // Send current users list
      const users = Array.from(activeUsers.get(documentId).values());
      socket.emit('users-updated', users);
      socket.to(documentId).emit('user-joined', userData);
      
    } catch (error) {
      console.error('❌ Error loading document:', error);
      socket.emit('error', 'Failed to load document: ' + error.message);
    }
  });

  // Handle code changes
  socket.on('code-change', async ({ documentId, content, changes }) => {
    try {
      if (Document && mongoose.connection.readyState === 1) {
        // Update document in database
        await Document.findByIdAndUpdate(documentId, { content });
        console.log('✅ Document updated in MongoDB:', documentId);
      } else {
        console.log('⚠️  Document updated in memory only:', documentId);
      }
      
      // Broadcast changes to other users
      socket.to(documentId).emit('code-updated', {
        content,
        changes,
        userId: socket.id
      });
    } catch (error) {
      console.error('❌ Error updating document:', error);
    }
  });

  // Handle cursor position changes
  socket.on('cursor-change', ({ documentId, position }) => {
    const documentUsers = activeUsers.get(documentId);
    if (documentUsers && documentUsers.has(socket.id)) {
      const user = documentUsers.get(socket.id);
      user.cursor = position;
      
      socket.to(documentId).emit('cursor-updated', {
        userId: socket.id,
        position,
        user
      });
    }
  });

  // Handle language changes
  socket.on('language-change', async ({ documentId, language }) => {
    try {
      if (Document && mongoose.connection.readyState === 1) {
        await Document.findByIdAndUpdate(documentId, { language });
      }
      socket.to(documentId).emit('language-updated', { language });
    } catch (error) {
      console.error('❌ Error updating language:', error);
    }
  });

  // Handle chat messages
  socket.on('chat-message', ({ documentId, message, user }) => {
    const chatMessage = {
      id: uuidv4(),
      user,
      message,
      timestamp: new Date()
    };
    
    io.to(documentId).emit('chat-message', chatMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
    
    // Remove user from all documents
    activeUsers.forEach((documentUsers, documentId) => {
      if (documentUsers.has(socket.id)) {
        const user = documentUsers.get(socket.id);
        documentUsers.delete(socket.id);
        
        socket.to(documentId).emit('user-left', {
          userId: socket.id,
          user
        });
        
        // Send updated users list
        const users = Array.from(documentUsers.values());
        socket.to(documentId).emit('users-updated', users);
      }
    });
  });
});

// Helper function to generate random colors
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /test',
      'GET /api/test-db',
      'POST /api/documents',
      'GET /api/documents/:id'
    ]
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test server: http://localhost:${PORT}/test`);
  console.log(`🗄️  Test database: http://localhost:${PORT}/api/test-db`);
});