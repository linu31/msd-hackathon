import Student from '../models/Student.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// @desc    Get student profile with details
// @route   GET /api/students/profile
// @access  Private
const getStudentProfile = async (req, res) => {
    try {
        // Get basic user info
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get student details
        let student = await Student.findOne({ user: req.user._id })
            .populate('user', 'name email regNo mobile department');

        // If student details don't exist, create basic one
        if (!student) {
            student = await Student.create({
                user: req.user._id,
                academicYear: '2024-2025',
                semester: '1',
                admissionYear: new Date().getFullYear()
            });
        }

        // Get payment history
        const payments = await Payment.find({ 
            student: req.user._id 
        }).sort({ createdAt: -1 }).limit(10);

        // Calculate fee status
        const feeStatus = {
            tuition: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'tuition', 
                status: 'completed' 
            }),
            bus: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'bus', 
                status: 'completed' 
            }),
            hostel: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'hostel', 
                status: 'completed' 
            }),
            supply: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'supply', 
                status: 'completed' 
            }),
            condonation: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'condonation', 
                status: 'completed' 
            }),
            idcard: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'idcard', 
                status: 'completed' 
            }),
            crt: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'crt', 
                status: 'completed' 
            }),
            uniform: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'uniform', 
                status: 'completed' 
            }),
            other_registrations: await Payment.findOne({ 
                student: req.user._id, 
                feeType: 'other_registrations', 
                status: 'completed' 
            })
        };

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    regNo: user.regNo,
                    mobile: user.mobile,
                    department: user.department,
                    role: user.role
                },
                student: student,
                feeStatus: {
                    tuitionPaid: !!feeStatus.tuition,
                    busPaid: !!feeStatus.bus,
                    hostelPaid: !!feeStatus.hostel,
                    tuitionAmount: feeStatus.tuition?.amount || 50000,
                    busAmount: feeStatus.bus?.amount || 10000,
                    hostelAmount: feeStatus.hostel?.amount || 30000,
                    supplyAmount: feeStatus.supply?.amount || 1000,
                    condonationAmount: feeStatus.condonation?.amount || 500,
                    idcardAmount: feeStatus.idcard?.amount || 100,
                    crtAmount: feeStatus.crt?.amount || 5000,
                    uniformAmount: feeStatus.uniform?.amount || 1500,
                    otherAmount: feeStatus.other_registrations?.amount || 1000
                },
                recentPayments: payments
            }
        });
    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student profile'
        });
    }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private
const updateStudentProfile = async (req, res) => {
    try {
        const {
            academicYear,
            semester,
            section,
            fatherName,
            motherName,
            dateOfBirth,
            address,
            emergencyContact,
            bloodGroup,
            isHosteller,
            busRoute
        } = req.body;

        // Find or create student profile
        let student = await Student.findOne({ user: req.user._id });

        if (!student) {
            student = new Student({ user: req.user._id });
        }

        // Update fields
        const updateFields = {};
        if (academicYear) updateFields.academicYear = academicYear;
        if (semester) updateFields.semester = semester;
        if (section) updateFields.section = section.toUpperCase();
        if (fatherName) updateFields.fatherName = fatherName;
        if (motherName) updateFields.motherName = motherName;
        if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
        if (address) updateFields.address = address;
        if (emergencyContact) updateFields.emergencyContact = emergencyContact;
        if (bloodGroup) updateFields.bloodGroup = bloodGroup;
        if (isHosteller !== undefined) updateFields.isHosteller = isHosteller;
        if (busRoute) updateFields.busRoute = busRoute;

        // Update student profile
        student = await Student.findOneAndUpdate(
            { user: req.user._id },
            { $set: updateFields },
            { new: true, runValidators: true, upsert: true }
        ).populate('user', 'name email regNo mobile department');

        res.status(200).json({
            success: true,
            data: student,
            message: 'Student profile updated successfully'
        });
    } catch (error) {
        console.error('Update student profile error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating student profile'
        });
    }
};

// @desc    Get all students with details (Admin)
// @route   GET /api/students/all
// @access  Private/Admin
const getAllStudents = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            department, 
            status, 
            search,
            hasPaidTuition,
            hasPaidBus,
            hasPaidHostel,
            hasPaidSupply,
            hasPaidCondonation,
            hasPaidIdcard,
            hasPaidCrt,
            hasPaidUniform,
            hasPaidOther
        } = req.query;

        // Build filter for User model
        const userFilter = { role: 'student' };
        if (department) userFilter.department = department;
        
        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { regNo: { $regex: search.toUpperCase(), $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Build filter for Student model
        const studentFilter = {};
        if (status) studentFilter.status = status;

        // Get users with pagination
        const users = await User.find(userFilter)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get student details for these users
        const studentDetails = await Student.find({
            user: { $in: users.map(u => u._id) },
            ...studentFilter
        }).populate('user');

        // Get payment status for each student
        const studentsWithPayments = await Promise.all(
            studentDetails.map(async (student) => {
                const payments = await Payment.find({
                    student: student.user._id,
                    status: 'completed'
                });

                const paidFees = payments.map(p => p.feeType);
                
                // Apply payment filters if specified
                if (hasPaidTuition === 'true' && !paidFees.includes('tuition')) return null;
                if (hasPaidBus === 'true' && !paidFees.includes('bus')) return null;
                if (hasPaidHostel === 'true' && !paidFees.includes('hostel')) return null;
                if (hasPaidTuition === 'false' && paidFees.includes('tuition')) return null;
                if (hasPaidBus === 'false' && paidFees.includes('bus')) return null;
                if (hasPaidHostel === 'false' && paidFees.includes('hostel')) return null;
                if (hasPaidSupply === 'true' && !paidFees.includes('supply')) return null;
                if (hasPaidCondonation === 'true' && !paidFees.includes('condonation')) return null;
                if (hasPaidIdcard === 'true' && !paidFees.includes('idcard')) return null;
                if (hasPaidCrt === 'true' && !paidFees.includes('crt')) return null;
                if (hasPaidUniform === 'true' && !paidFees.includes('uniform')) return null;
                if (hasPaidOther === 'true' && !paidFees.includes('other_registrations')) return null;
                if (hasPaidSupply === 'false' && paidFees.includes('supply')) return null;
                if (hasPaidCondonation === 'false' && paidFees.includes('condonation')) return null;
                if (hasPaidIdcard === 'false' && paidFees.includes('idcard')) return null;
                if (hasPaidCrt === 'false' && paidFees.includes('crt')) return null;
                if (hasPaidUniform === 'false' && paidFees.includes('uniform')) return null;
                if (hasPaidOther === 'false' && paidFees.includes('other_registrations')) return null;

                return {
                    ...student.toObject(),
                    paidFees,
                    hasPaidTuition: paidFees.includes('tuition'),
                    hasPaidBus: paidFees.includes('bus'),
                    hasPaidHostel: paidFees.includes('hostel'),
                    totalPaid: payments.reduce((sum, p) => sum + p.amount, 0)
                };
            })
        );

        // Filter out null values from payment filters
        const filteredStudents = studentsWithPayments.filter(student => student !== null);

        const total = await User.countDocuments(userFilter);

        res.status(200).json({
            success: true,
            data: {
                students: filteredStudents,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    totalStudents: total
                }
            }
        });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
};

// @desc    Get student by ID (Admin)
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.params.id })
            .populate('user', 'name email regNo mobile department createdAt');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get complete payment history
        const payments = await Payment.find({ student: req.params.id })
            .sort({ createdAt: -1 });

        // Get fee status
        const feeStatus = {
            tuition: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'tuition', 
                status: 'completed' 
            }),
            bus: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'bus', 
                status: 'completed' 
            }),
            hostel: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'hostel', 
                status: 'completed' 
            }),
            supply: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'supply', 
                status: 'completed' 
            }),
            condonation: await Payment.findOne({ 
               student: req.params.id, 
               feeType: 'condonation', 
               status: 'completed' 
            }),
            idcard: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'idcard', 
                status: 'completed' 
            }),
            crt: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'crt', 
                status: 'completed' 
            }),
            uniform: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'uniform', 
                status: 'completed' 
            }),
            other_registrations: await Payment.findOne({ 
                student: req.params.id, 
                feeType: 'other_registrations', 
                status: 'completed' 
            })

        };

        res.status(200).json({
            success: true,
            data: {
                student,
                payments,
                feeStatus: {
                    tuitionPaid: !!feeStatus.tuition,
                    busPaid: !!feeStatus.bus,
                    hostelPaid: !!feeStatus.hostel,
                    supplyPaid: !!feeStatus.supply,
                    condonationPaid: !!feeStatus.condonation,
                    idcardPaid: !!feeStatus.idcard,
                    crtPaid: !!feeStatus.crt,
                    uniformPaid: !!feeStatus.uniform,
                    otherPaid: !!feeStatus.other_registrations,
                    lastPayment: payments[0] || null
                }
            }
        });
    } catch (error) {
        console.error('Get student by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student details'
        });
    }
};

// @desc    Update student status (Admin)
// @route   PUT /api/students/:id/status
// @access  Private/Admin
const updateStudentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'inactive', 'graduated', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const student = await Student.findOneAndUpdate(
            { user: req.params.id },
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'name regNo department');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Also update user's isActive status based on student status
        await User.findByIdAndUpdate(req.params.id, {
            isActive: status === 'active'
        });

        res.status(200).json({
            success: true,
            data: student,
            message: `Student status updated to ${status}`
        });
    } catch (error) {
        console.error('Update student status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student status'
        });
    }
};

// @desc    Get student statistics (Admin)
// @route   GET /api/students/stats
// @access  Private/Admin
const getStudentStatistics = async (req, res) => {
    try {
        // Get basic student stats
        const totalStudents = await User.countDocuments({ role: 'student' });
        const activeStudents = await User.countDocuments({ 
            role: 'student', 
            isActive: true 
        });

        // Get department-wise stats
        const departmentStats = await User.aggregate([
            { $match: { role: 'student' } },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    active: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get payment statistics
        const paymentStats = await Payment.aggregate([
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
                $match: {
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$feeType',
                    totalAmount: { $sum: '$amount' },
                    totalPayments: { $sum: 1 },
                    uniqueStudents: { $addToSet: '$student' }
                }
            }
        ]);

        // Calculate students who have paid each fee type
        const studentsPaidTuition = await Payment.distinct('student', {
            feeType: 'tuition',
            status: 'completed'
        });
        const studentsPaidBus = await Payment.distinct('student', {
            feeType: 'bus',
            status: 'completed'
        });
        const studentsPaidHostel = await Payment.distinct('student', {
            feeType: 'hostel',
            status: 'completed'
        });
        const studentsPaidSupply = await Payment.distinct('student', {
            feeType: 'supply',
            status: 'completed'
        });
        const studentsPaidCondonation = await Payment.distinct('student', {
            feeType: 'condonation',
            status: 'completed'
        });
        const studentsPaidIdcard = await Payment.distinct('student', {
            feeType: 'idcard',
            status: 'completed'
        });
        const studentsPaidCrt = await Payment.distinct('student', {
            feeType: 'crt',
            status: 'completed'
        });
        const studentsPaidUniform = await Payment.distinct('student', {
            feeType: 'uniform',
            status: 'completed'
        });
        const studentsPaidOther = await Payment.distinct('student', {
            feeType: 'other_registrations',
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalStudents,
                    activeStudents,
                    inactiveStudents: totalStudents - activeStudents
                },
                departments: departmentStats,
                payments: {
                    stats: paymentStats,
                    studentsPaid: {
                        tuition: studentsPaidTuition.length,
                        bus: studentsPaidBus.length,
                        hostel: studentsPaidHostel.length,
                        supply: studentsPaidSupply.length,
                        condonation: studentsPaidCondonation.length,
                        idcard: studentsPaidIdcard.length,
                        crt: studentsPaidCrt.length,
                        uniform: studentsPaidUniform.length,
                        other: studentsPaidOther.length  
                    },
                    totalRevenue: paymentStats.reduce((sum, stat) => sum + stat.totalAmount, 0)
                }
            }
        });
    } catch (error) {
        console.error('Get student statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student statistics'
        });
    }
};

// @desc    Create student profile (for manual creation by admin)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
    try {
        const {
            userId,
            academicYear,
            semester,
            section,
            fatherName,
            motherName,
            dateOfBirth,
            address,
            emergencyContact,
            bloodGroup,
            admissionYear,
            isHosteller,
            busRoute
        } = req.body;

        // Check if user exists and is a student
        const user = await User.findById(userId);
        if (!user || user.role !== 'student') {
            return res.status(400).json({
                success: false,
                message: 'User not found or is not a student'
            });
        }

        // Check if student profile already exists
        const existingStudent = await Student.findOne({ user: userId });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student profile already exists'
            });
        }

        // Create student profile
        const student = await Student.create({
            user: userId,
            academicYear: academicYear || '2024-2025',
            semester: semester || '1',
            section: section ? section.toUpperCase() : undefined,
            fatherName,
            motherName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            address,
            emergencyContact,
            bloodGroup,
            admissionYear: admissionYear || new Date().getFullYear(),
            isHosteller: isHosteller || false,
            busRoute: busRoute || 'Not Applicable'
        });

        const populatedStudent = await Student.findById(student._id)
            .populate('user', 'name email regNo mobile department');

        res.status(201).json({
            success: true,
            data: populatedStudent,
            message: 'Student profile created successfully'
        });
    } catch (error) {
        console.error('Create student error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating student profile'
        });
    }
};

export {
    getStudentProfile,
    updateStudentProfile,
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    getStudentStatistics,
    createStudent
};