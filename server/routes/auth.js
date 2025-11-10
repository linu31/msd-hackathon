import express from 'express';
import {
    registerStudent,
    loginUser,
    getMe,
    updateProfile,
    getStudents
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin only routes
router.get('/students', protect, authorize('admin'), getStudents);

export default router;