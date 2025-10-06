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
// DELETE document
/*router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    console.log('🗑️ Document deleted:', req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});*/
router.delete('/:id', async (req, res) => {
  try {
    // Decode the ID in case it's URL encoded
    const docId = decodeURIComponent(req.params.id);
    console.log('🔍 Attempting to delete document:', docId);
    
    // Find and delete the document
    const document = await Document.findByIdAndDelete(docId);
    
    if (!document) {
      console.log('❌ Document not found:', docId);
      return res.status(404).json({ error: 'Document not found' });
    }
    
    console.log('✅ Document deleted successfully:', docId);
    res.json({ message: 'Document deleted successfully', documentId: docId });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }
    
    res.status(500).json({ error: 'Failed to delete document', details: error.message });
  }
});

module.exports = router;