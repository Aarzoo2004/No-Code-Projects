const express = require('express');
const Form = require('../models/Form');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');
const { generateFormSchema } = require('../services/aiService');

const router = express.Router();

// Generate form schema using AI
router.post('/generate', auth, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const schema = await generateFormSchema(description);

    res.json({
      message: 'Form schema generated successfully',
      schema
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Save form
router.post('/', auth, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { title, description, schema, assignedTo } = req.body;

    const form = new Form({
      title,
      description,
      fields: schema,
      createdBy: req.userId,
      assignedTo: assignedTo || []
    });

    await form.save();

    res.status(201).json({
      message: 'Form created successfully',
      form
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all forms (role-based)
router.get('/', auth, async (req, res) => {
  try {
    let forms;

    if (req.userRole === 'admin') {
      // Admin sees all forms
      forms = await Form.find().populate('createdBy', 'name email');
    } else if (req.userRole === 'manager') {
      // Manager sees only their created forms
      forms = await Form.find({ createdBy: req.userId }).populate('createdBy', 'name email');
    } else {
      // Field agents see only assigned forms
      forms = await Form.find({ assignedTo: req.userId }).populate('createdBy', 'name email');
    }

    res.json({ forms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single form
router.get('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate('createdBy', 'name email');

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check access rights
    if (req.userRole === 'fieldAgent' && !form.assignedTo.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ form });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update form
router.put('/:id', auth, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { title, description, schema, isActive } = req.body;

    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Manager can only update their own forms
    if (req.userRole === 'manager' && form.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (title) form.title = title;
    if (description) form.description = description;
    if (schema) form.fields = schema;
    if (typeof isActive !== 'undefined') form.isActive = isActive;

    await form.save();

    res.json({
      message: 'Form updated successfully',
      form
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign form to agents
router.put('/:id/assign', auth, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { agentIds } = req.body; // Array of user IDs

    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Manager can only assign their own forms
    if (req.userRole === 'manager' && form.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify all users are field agents
    const agents = await User.find({ _id: { $in: agentIds }, role: 'fieldAgent' });

    if (agents.length !== agentIds.length) {
      return res.status(400).json({ error: 'Some users are not field agents' });
    }

    form.assignedTo = agentIds;
    await form.save();

    res.json({
      message: 'Form assigned successfully',
      form
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete form
router.delete('/:id', auth, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Manager can only delete their own forms
    if (req.userRole === 'manager' && form.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Form.findByIdAndDelete(req.params.id);

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;