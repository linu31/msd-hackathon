import express from 'express';
import {
    getStudentProfile,
    updateStudentProfile,
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    getStudentStatistics,
    createStudent
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Student routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Admin routes
router.get('/all', authorize('admin'), getAllStudents);
router.get('/stats', authorize('admin'), getStudentStatistics);
router.get('/:id', authorize('admin'), getStudentById);
router.put('/:id/status', authorize('admin'), updateStudentStatus);
router.post('/', authorize('admin'), createStudent);

export default router;