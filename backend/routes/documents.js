const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');

const router = express.Router();

// Create new document
router.post('/create', async (req, res) => {
  try {
    const documentId = uuidv4();
    const document = new Document({
      _id: documentId,
      title: req.body.title || `Document ${documentId.slice(0, 8)}`,
      content: req.body.content || '// Welcome to your new document!\n\n',
      language: req.body.language || 'javascript'
    });
    
    await document.save();
    res.json({ documentId, document });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Get all documents (for listing)
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find()
      .select('_id title language createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;