const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getPendingListings,
  getAllListingsForAdmin,
  approveListing,
  rejectListing,
  batchApproveListing,
  getListingForReview,
  getAdminActivityLog
} = require('../controllers/adminController');

const router = express.Router();

// Admin middleware - ensures only admins can access these routes
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Dashboard and statistics
router.get('/dashboard/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/activity-log', authenticateToken, requireAdmin, getAdminActivityLog);

// Listing management
router.get('/listings/pending', authenticateToken, requireAdmin, getPendingListings);
router.get('/listings/all', authenticateToken, requireAdmin, getAllListingsForAdmin);
router.get('/listings/:phoneId/review', authenticateToken, requireAdmin, getListingForReview);

// Listing approval/rejection
router.put('/listings/:phoneId/approve', authenticateToken, requireAdmin, approveListing);
router.put('/listings/:phoneId/reject', authenticateToken, requireAdmin, rejectListing);
router.put('/listings/batch-approve', authenticateToken, requireAdmin, batchApproveListing);

module.exports = router;