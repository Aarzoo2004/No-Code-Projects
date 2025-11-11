const express = require('express');
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// POST / - Submit form data (field agents only)
router.post('/', auth, async (req, res) => {
  try {
    // Only field agents can submit forms
    if (req.userRole !== 'fieldAgent') {
      return res.status(403).json({ error: 'Only field agents can submit forms' });
    }

    const { formId, data } = req.body;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Form data is required' });
    }

    // Verify form exists and user has access
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check if user is assigned to this form
    if (!form.assignedTo || !form.assignedTo.includes(req.userId)) {
      return res.status(403).json({ error: 'You are not assigned to this form' });
    }

    const submission = new Submission({
      formId,
      submittedBy: req.userId,
      data,
      status: 'pending'
    });

    await submission.save();
    await submission.populate('formId', 'title description');
    await submission.populate('submittedBy', 'name email');

    console.log('✅ Submission created:', submission._id, 'by user:', req.userId);

    res.status(201).json({
      message: 'Submission created successfully',
      submission
    });
  } catch (error) {
    console.error('❌ Submission creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET / - List submissions (role-based)
router.get('/', auth, async (req, res) => {
  try {
    let submissions;

    console.log('📥 Fetching submissions for user:', req.userId, 'role:', req.userRole);

    if (req.userRole === 'admin') {
      // Admin sees all submissions
      submissions = await Submission.find()
        .sort({ createdAt: -1 })
        .populate('formId', 'title description')
        .populate('submittedBy', 'name email');
      
      console.log('👑 Admin - Total submissions:', submissions.length);
    } else if (req.userRole === 'manager') {
      // Manager sees submissions for their forms
      const forms = await Form.find({ createdBy: req.userId }).select('_id');
      const formIds = forms.map(f => f._id);
      
      console.log('👔 Manager - Forms created:', formIds.length, 'IDs:', formIds);
      
      submissions = await Submission.find({ formId: { $in: formIds } })
        .sort({ createdAt: -1 })
        .populate('formId', 'title description')
        .populate('submittedBy', 'name email');
      
      console.log('👔 Manager - Submissions found:', submissions.length);
    } else {
      // Field agents see only their own submissions
      submissions = await Submission.find({ submittedBy: req.userId })
        .sort({ createdAt: -1 })
        .populate('formId', 'title description')
        .populate('submittedBy', 'name email');
      
      console.log('👷 Field Agent - Own submissions:', submissions.length);
    }

    res.json({ 
      count: submissions.length,
      submissions 
    });
  } catch (error) {
    console.error('❌ Get submissions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /:id - Get single submission
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('📄 Fetching submission:', req.params.id, 'for user:', req.userId, 'role:', req.userRole);
    
    const submission = await Submission.findById(req.params.id)
      .populate('formId', 'title description fields createdBy')
      .populate('submittedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check access rights
    if (req.userRole === 'fieldAgent') {
      // Agents can only see their own submissions
      if (submission.submittedBy._id.toString() !== req.userId) {
        console.log('❌ Field agent access denied - not their submission');
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.userRole === 'manager') {
      // Manager can only see submissions for their forms
      const form = await Form.findById(submission.formId._id);
      if (!form || form.createdBy.toString() !== req.userId) {
        console.log('❌ Manager access denied - not their form. Form creator:', form?.createdBy, 'User:', req.userId);
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    // Admin can see all submissions (no check needed)

    console.log('✅ Submission access granted');
    res.json({ submission });
  } catch (error) {
    console.error('❌ Get submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id/status - Update submission status (manager/admin only)
router.put('/:id/status', auth, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    console.log('🔄 Status update request:', req.params.id, 'to', status, 'by user:', req.userId, 'role:', req.userRole);

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('formId', 'title createdBy');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if manager can update this submission
    if (req.userRole === 'manager') {
      const form = await Form.findById(submission.formId);
      console.log('Manager check - Form creator:', form?.createdBy?.toString(), 'User ID:', req.userId);
      
      if (!form || form.createdBy.toString() !== req.userId) {
        console.log('❌ Manager cannot update - not their form');
        return res.status(403).json({ error: 'You can only update submissions for your forms' });
      }
    }

    submission.status = status;
    await submission.save();

    console.log('✅ Status updated successfully to:', status);

    res.json({
      message: 'Submission status updated successfully',
      submission
    });
  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:id - Delete submission (admin only)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    await Submission.findByIdAndDelete(req.params.id);

    console.log('✅ Submission deleted:', req.params.id);

    res.json({ 
      message: 'Submission deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;