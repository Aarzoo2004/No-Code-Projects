// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateSchemaFromPrompt } = require('./ai');
const { validateAgainstSchema, checkNotifications } = require('./validation');
const {
  getAllSchemas,
  getSchemaById,
  saveSchema,
  getSubmissionsBySchemaId,
  saveSubmission,
  generateId
} = require('./utils');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  });
});

// Generate schema from natural language prompt
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, title } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Prompt is required and must be a non-empty string' 
      });
    }

    console.log('Generating schema for prompt:', prompt.substring(0, 100) + '...');

    // Generate schema using AI
    const schema = await generateSchemaFromPrompt(prompt, title);

    // Save schema with unique ID
    const id = generateId('schema');
    const saved = saveSchema(id, { 
      title: schema.title, 
      schema,
      prompt 
    });

    if (!saved) {
      return res.status(500).json({ error: 'Failed to save schema' });
    }

    console.log('Schema generated successfully:', id);

    res.json({ 
      success: true,
      id, 
      schema,
      message: 'Schema generated successfully'
    });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ 
      error: 'Failed to generate schema',
      details: error.message 
    });
  }
});

// Get all schemas
app.get('/api/schemas', (req, res) => {
  try {
    const schemas = getAllSchemas();
    const schemaList = Object.values(schemas).map(s => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      fieldCount: s.schema?.fields?.length || 0
    }));
    res.json({ success: true, schemas: schemaList });
  } catch (error) {
    console.error('Error in /api/schemas:', error);
    res.status(500).json({ error: 'Failed to fetch schemas' });
  }
});

// Get specific schema by ID
app.get('/api/schema/:id', (req, res) => {
  try {
    const { id } = req.params;
    const schemaData = getSchemaById(id);

    if (!schemaData) {
      return res.status(404).json({ error: 'Schema not found' });
    }

    res.json({ 
      success: true,
      id: schemaData.id,
      title: schemaData.title,
      schema: schemaData.schema,
      createdAt: schemaData.createdAt
    });

  } catch (error) {
    console.error('Error in /api/schema/:id:', error);
    res.status(500).json({ error: 'Failed to fetch schema' });
  }
});

// Submit form data for a specific schema
app.post('/api/submit/:id', (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Get schema
    const schemaData = getSchemaById(id);
    if (!schemaData) {
      return res.status(404).json({ error: 'Schema not found' });
    }

    const schema = schemaData.schema;

    // Validate data against schema
    const validationErrors = validateAgainstSchema(formData, schema);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        validationErrors 
      });
    }

    // Check for notification conditions
    const notifications = checkNotifications(schema, formData);

    // Save submission
    const saved = saveSubmission(id, {
      data: formData,
      notifications
    });

    if (!saved) {
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    console.log(`Submission saved for schema ${id}. Notifications:`, notifications.length);

    res.json({ 
      success: true,
      message: 'Form submitted successfully',
      notifications,
      hasNotifications: notifications.length > 0
    });

  } catch (error) {
    console.error('Error in /api/submit/:id:', error);
    res.status(500).json({ 
      error: 'Failed to submit form',
      details: error.message 
    });
  }
});

// Get submissions for a schema
app.get('/api/submissions/:schemaId', (req, res) => {
  try {
    const { schemaId } = req.params;
    const submissions = getSubmissionsBySchemaId(schemaId);
    
    res.json({ 
      success: true,
      schemaId,
      count: submissions.length,
      submissions 
    });

  } catch (error) {
    console.error('Error in /api/submissions/:schemaId:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║        FieldForm AI Backend Server             ║
╚════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🔗 API available at http://localhost:${PORT}
📊 Health check: http://localhost:${PORT}/health
${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' 
  ? '✅ Gemini API key detected' 
  : '⚠️  No Gemini API key - using mock data'}
  `);
});