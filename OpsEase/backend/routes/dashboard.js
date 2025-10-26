const express = require('express');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateReport } = require('../services/aiService');

const router = express.Router();

// GET /stats - Returns role-based dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    let stats = {};

    if (req.userRole === 'admin') {
      // Admin sees everything
      const [totalForms, totalSubmissions, allSubmissions, users] = await Promise.all([
        Form.countDocuments(),
        Submission.countDocuments(),
        Submission.find().sort({ createdAt: -1 }).limit(5).populate('formId', 'title'),
        User.find().select('role name')
      ]);

      // Count submissions by status
      const pendingCount = await Submission.countDocuments({ status: 'pending' });
      const approvedCount = await Submission.countDocuments({ status: 'approved' });
      const rejectedCount = await Submission.countDocuments({ status: 'rejected' });

      // Users by role
      const usersByRole = {
        admin: users.filter(u => u.role === 'admin').length,
        manager: users.filter(u => u.role === 'manager').length,
        fieldAgent: users.filter(u => u.role === 'fieldAgent').length
      };

      stats = {
        role: 'admin',
        totalForms,
        totalSubmissions,
        pendingCount,
        approvedCount,
        rejectedCount,
        completionRate: totalSubmissions > 0 ? ((approvedCount / totalSubmissions) * 100).toFixed(2) : 0,
        recentSubmissions: allSubmissions,
        usersByRole
      };

    } else if (req.userRole === 'manager') {
      // Manager sees their forms and submissions for their forms
      const managerForms = await Form.find({ createdBy: req.userId }).select('_id');
      const formIds = managerForms.map(f => f._id);

      const [totalForms, totalSubmissions, allSubmissions] = await Promise.all([
        Form.countDocuments({ createdBy: req.userId }),
        Submission.countDocuments({ formId: { $in: formIds } }),
        Submission.find({ formId: { $in: formIds } })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('formId', 'title')
          .populate('submittedBy', 'name email')
      ]);

      // Count submissions by status for manager's forms
      const pendingCount = await Submission.countDocuments({ 
        formId: { $in: formIds },
        status: 'pending' 
      });
      const approvedCount = await Submission.countDocuments({ 
        formId: { $in: formIds },
        status: 'approved' 
      });
      const rejectedCount = await Submission.countDocuments({ 
        formId: { $in: formIds },
        status: 'rejected' 
      });

      stats = {
        role: 'manager',
        totalForms,
        totalSubmissions,
        pendingCount,
        approvedCount,
        rejectedCount,
        completionRate: totalSubmissions > 0 ? ((approvedCount / totalSubmissions) * 100).toFixed(2) : 0,
        recentSubmissions: allSubmissions
      };

    } else if (req.userRole === 'fieldAgent') {
      // Field agent sees assigned forms and their own submissions
      const [assignedForms, allSubmissions, totalSubmissions] = await Promise.all([
        Form.find({ assignedTo: req.userId }).select('_id'),
        Submission.find({ submittedBy: req.userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('formId', 'title')
          .populate('submittedBy', 'name email'),
        Submission.countDocuments({ submittedBy: req.userId })
      ]);

      const pendingCount = await Submission.countDocuments({ 
        submittedBy: req.userId,
        status: 'pending' 
      });
      const approvedCount = await Submission.countDocuments({ 
        submittedBy: req.userId,
        status: 'approved' 
      });
      const rejectedCount = await Submission.countDocuments({ 
        submittedBy: req.userId,
        status: 'rejected' 
      });

      stats = {
        role: 'fieldAgent',
        totalForms: assignedForms.length,
        totalSubmissions,
        pendingCount,
        approvedCount,
        rejectedCount,
        completionRate: totalSubmissions > 0 ? ((approvedCount / totalSubmissions) * 100).toFixed(2) : 0,
        recentSubmissions: allSubmissions
      };
    }

    res.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /report - Generate AI-powered report for submissions (manager/admin only)
router.post('/report', auth, async (req, res) => {
  try {
    // Check if user has permission (manager or admin only)
    if (req.userRole !== 'admin' && req.userRole !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Only managers and admins can generate reports.' });
    }

    const { dateFrom, dateTo, formId } = req.body;

    // Build query based on user role
    let query = {};

    if (req.userRole === 'manager') {
      // Manager can only see submissions for their forms
      const managerForms = await Form.find({ createdBy: req.userId }).select('_id');
      const formIds = managerForms.map(f => f._id);
      
      if (formIds.length === 0) {
        return res.status(404).json({ error: 'No forms found for this manager.' });
      }
      
      query.formId = { $in: formIds };
    }
    // Admin can see all submissions (no additional query restrictions)

    // Add date filters if provided
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Add form filter if provided
    if (formId) {
      if (req.userRole === 'manager') {
        // Verify manager owns this form
        const form = await Form.findOne({ _id: formId, createdBy: req.userId });
        if (!form) {
          return res.status(403).json({ error: 'Access denied. You can only generate reports for your own forms.' });
        }
      }
      query.formId = formId;
    }

    // Fetch submissions with populated data
    const submissions = await Submission.find(query)
      .populate('formId', 'title')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    if (submissions.length === 0) {
      return res.status(404).json({ error: 'No submissions found matching the criteria.' });
    }

    // Generate AI report
    const report = await generateReport(submissions);

    res.json({
      success: true,
      report,
      filters: {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        formId: formId || null,
        totalSubmissions: submissions.length
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    
    // Handle specific error types
    if (error.message.includes('No submissions provided')) {
      return res.status(400).json({ error: 'No submissions found for analysis.' });
    }
    
    if (error.message.includes('Failed to generate report')) {
      return res.status(500).json({ 
        error: 'AI report generation failed. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({ 
      error: 'Internal server error while generating report.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

