import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import dotenv from "dotenv";
import twilio from 'twilio';
dotenv.config();

const TOTAL_FEES = {
    tuition: 50000,
    bus: 20000,
    hostel: 50000,
    supply: 500,
    condonation: 300,
    idcard: 200,
    crt: 3000,
    uniform: 2500,
    other_registrations: 1000
};

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { feeType, amount } = req.body;
        
        // Validate request
        if (!feeType || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Please provide fee type and amount'
            });
        }

        // Updated fee types array with all new types
        if (!['tuition', 'bus', 'hostel','supply','condonation','idcard','crt','uniform','other_registrations'].includes(feeType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fee type'
            });
        }

        if (amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be at least 1'
            });
        }

        // Check if student already paid this fee type
        // ✅ Partial payments allowed but NOT beyond total fee amount

        // Total fee amount for this fee type
            const totalFeeAmount = TOTAL_FEES[feeType];

        // Get all previous completed payments
            const pastPayments = await Payment.find({
                student: req.user._id,
                feeType,
                status: 'completed'
            });

        // Calculate how much the student already paid
            const totalPaid = pastPayments.reduce((sum, p) => sum + p.amount, 0);
        // ✅ If full fee is already paid → block further payments
                if (totalPaid >= totalFeeAmount) {
                    return res.status(400).json({
                        success: false,
                        message: `You have already paid the full ${feeType} fee`
                    });
                }


        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}_${req.user.regNo}`,
            notes: {
                studentId: req.user._id.toString(),
                studentName: req.user.name,
                regNo: req.user.regNo,
                feeType: feeType,
                department: req.user.department
            }
        };

        const order = await razorpay.orders.create(options);

        // Create payment record in database
        const payment = await Payment.create({
            student: req.user._id,
            feeType,
            amount,
            razorpayOrderId: order.id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                paymentId: payment._id,
                feeType: feeType
            },
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order'
        });
    }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

        // Validate request
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification data'
            });
        }

        // Find the payment record
        const payment = await Payment.findById(paymentId);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Verify that the payment belongs to the logged-in user
        if (payment.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to verify this payment'
            });
        }

        // Verify Razorpay signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment verified successfully
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'completed';
            payment.receiptSent = true;

            await payment.save();

            res.json({
                success: true,
                data: {
                    paymentId: payment._id,
                    status: payment.status,
                    feeType: payment.feeType,
                    amount: payment.amount,
                    transactionId: razorpay_payment_id
                },
                message: 'Payment verified successfully'
            });
        } else {
            // Signature verification failed
            payment.status = 'failed';
            await payment.save();

            res.status(400).json({ 
                success: false,
                message: 'Payment verification failed - invalid signature' 
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        
        // Mark payment as failed in case of error
        try {
            await Payment.findByIdAndUpdate(req.body.paymentId, {
                status: 'failed'
            });
        } catch (updateError) {
            console.error('Error updating payment status:', updateError);
        }

        res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
};

// @desc    Get student's payment history
// @route   GET /api/payments/student-payments
// @access  Private
const getStudentPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.user._id })
            .sort({ createdAt: -1 })
            .populate('student', 'name regNo department');

        const paymentStats = await Payment.aggregate([
            {
                $match: { 
                    student: req.user._id,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$feeType',
                    totalPaid: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                payments,
                stats: paymentStats
            },
            count: payments.length
        });
    } catch (error) {
        console.error('Get student payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history'
        });
    }
};

// @desc    Get all payments (for admin)
// @route   GET /api/payments/all-payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, feeType, department } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (feeType) filter.feeType = feeType;
        
        let populateQuery = {
            path: 'student',
            select: 'name regNo department email mobile'
        };
        
        if (department) {
            populateQuery.match = { department: department };
        }

        const payments = await Payment.find(filter)
            .populate(populateQuery)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Payment.countDocuments(filter);

        // Get payment statistics
        const stats = await Payment.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            {
                $unwind: '$studentInfo'
            },
            {
                $group: {
                    _id: {
                        department: '$studentInfo.department',
                        status: '$status',
                        feeType: '$feeType'
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    totalPayments: total
                },
                stats
            }
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
};

// @desc    Get department-wise statistics
// @route   GET /api/payments/department-stats
// @access  Private/Admin
const getDepartmentStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            { 
                $match: { 
                    role: 'student',
                    isActive: true
                } 
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'student',
                    as: 'payments'
                }
            },
            {
                $group: {
                    _id: '$department',
                    totalStudents: { $sum: 1 },
                    paidTuition: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'tuition'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidBus: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'bus'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidHostel: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'hostel'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidSupply: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'supply'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidCondonation: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'condonation'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidIdcard: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'idcard'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidCrt: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'crt'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidUniform: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'uniform'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    paidOther: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'payment',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$payment.feeType', 'other_registrations'] },
                                                            { $eq: ['$$payment.status', 'completed'] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    totalRevenue: {
                        $sum: {
                            $reduce: {
                                input: '$payments',
                                initialValue: 0,
                                in: {
                                    $cond: [
                                        { $eq: ['$$this.status', 'completed'] },
                                        { $add: ['$$value', '$$this.amount'] },
                                        '$$value'
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Calculate overall totals
        const overallStats = {
            totalStudents: stats.reduce((sum, dept) => sum + dept.totalStudents, 0),
            totalRevenue: stats.reduce((sum, dept) => sum + dept.totalRevenue, 0),
            paidTuition: stats.reduce((sum, dept) => sum + dept.paidTuition, 0),
            paidBus: stats.reduce((sum, dept) => sum + dept.paidBus, 0),
            paidHostel: stats.reduce((sum, dept) => sum + dept.paidHostel, 0),
            paidSupply: stats.reduce((sum, dept) => sum + dept.paidSupply, 0),
            paidCondonation: stats.reduce((sum, dept) => sum + dept.paidCondonation, 0),
            paidIdcard: stats.reduce((sum, dept) => sum + dept.paidIdcard, 0),
            paidCrt: stats.reduce((sum, dept) => sum + dept.paidCrt, 0),
            paidUniform: stats.reduce((sum, dept) => sum + dept.paidUniform, 0),
            paidOther: stats.reduce((sum, dept) => sum + dept.paidOther, 0)
        };

        res.json({
            success: true,
            data: {
                departments: stats,
                overall: overallStats
            }
        });
    } catch (error) {
        console.error('Get department stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department statistics'
        });
    }
};

// @desc    Get students by department with payment status
// @route   GET /api/payments/department/:department/students
// @access  Private/Admin
const getStudentsByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        
        const students = await User.find({ 
            department: department.toUpperCase(),
            role: 'student',
            isActive: true
        }).select('-password');

        // Get payment status for each student
        const studentsWithPayments = await Promise.all(
            students.map(async (student) => {
                const payments = await Payment.find({
                    student: student._id,
                    status: 'completed'
                }).select('feeType amount createdAt');

                const paidFees = payments.map(p => p.feeType);
                const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

                return {
                    ...student.toObject(),
                    payments,
                    paidFees,
                    totalPaid,
                    hasPaidTuition: paidFees.includes('tuition'),
                    hasPaidBus: paidFees.includes('bus'),
                    hasPaidHostel: paidFees.includes('hostel'),
                    hasPaidSupply: paidFees.includes('supply'),
                    hasPaidCondonation: paidFees.includes('condonation'),
                    hasPaidIdcard: paidFees.includes('idcard'),
                    hasPaidCrt: paidFees.includes('crt'),
                    hasPaidUniform: paidFees.includes('uniform'),
                    hasPaidOther: paidFees.includes('other_registrations')
                };
            })
        );

        res.json({
            success: true,
            data: {
                department,
                students: studentsWithPayments,
                count: studentsWithPayments.length
            }
        });
    } catch (error) {
        console.error('Get students by department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students by department'
        });
    }
};

// @desc    Send payment notification to student
// @route   POST /api/payments/notify/:studentId
// @access  Private/Admin
const sendPaymentNotification = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { message } = req.body;

        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (!student.mobile) {
            return res.status(400).json({
                success: false,
                message: 'Student mobile number not available'
            });
        }

        // Prepend +91 if missing
        let mobileNumber = student.mobile.trim();
        if (!mobileNumber.startsWith('+')) {
            mobileNumber = '+91' + mobileNumber;
        }

        // Initialize Twilio client
        const client = twilio(
            process.env.SMS_ACCOUNT_SID,
            process.env.SMS_AUTH_TOKEN
        );

        const smsMessage = message || `Hello ${student.name}, your fee payment is pending. Please clear it at the earliest.`;

        // Send SMS
        const smsResponse = await client.messages.create({
            body: smsMessage,
            from: process.env.SMS_PHONE_NUMBER,
            to: mobileNumber
        });

        console.log(`SMS sent to ${student.name} (${mobileNumber}):`, smsResponse.sid);

        res.json({
            success: true,
            message: `Payment notification sent to ${student.name}`,
            data: {
                student: student.name,
                mobile: mobileNumber,
                smsSid: smsResponse.sid
            }
        });

    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending payment notification'
        });
    }
};


export {
    createOrder,
    verifyPayment,
    getStudentPayments,
    getAllPayments,
    getDepartmentStats,
    getStudentsByDepartment,
    sendPaymentNotification
};