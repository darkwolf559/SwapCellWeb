const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getPhones,
  getPhoneById,
  createPhone,
  updatePhone,
  deletePhone
} = require('../controllers/phoneController');

const router = express.Router();

router.get('/', getPhones);
router.get('/:id', getPhoneById);
router.post('/', authenticateToken, createPhone);
router.put('/:id', authenticateToken, updatePhone);
router.delete('/:id', authenticateToken, deletePhone);

module.exports = router;
