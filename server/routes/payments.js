import express from 'express';
import {
    createOrder,
    verifyPayment,
    getStudentPayments,
    getAllPayments,
    getDepartmentStats,
    getStudentsByDepartment,
    sendPaymentNotification
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Student routes
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/student-payments', getStudentPayments);

// Admin routes
router.get('/all-payments', authorize('admin'), getAllPayments);
router.get('/department-stats', authorize('admin'), getDepartmentStats);
router.get('/department/:department/students', authorize('admin'), getStudentsByDepartment);
router.post('/notify/:studentId', authorize('admin'), sendPaymentNotification);

export default router;