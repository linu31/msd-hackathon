import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// Generate random password (for admin creation)
const generateRandomPassword = (length = 12) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
    try {
        const { name, email, regNo, mobile, department, password } = req.body;

        // Validation
        if (!name || !email || !regNo || !mobile || !department || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ 
            $or: [{ email: email.toLowerCase() }, { regNo: regNo.toUpperCase() }] 
        });

        if (userExists) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this email or registration number' 
            });
        }

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            regNo: regNo.toUpperCase(),
            mobile,
            department,
            password,
            role: 'student'
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    regNo: user.regNo,
                    mobile: user.mobile,
                    department: user.department,
                    role: user.role,
                    token: generateToken(user._id),
                },
                message: 'Student registered successfully'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, regNo, password } = req.body;

        // Validate request
        if ((!email && !regNo) || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/regNo and password'
            });
        }

        let user;
        const isAdminLogin = email === 'adminpayments@gmail.com';

        console.log('🔐 Login attempt - Email:', email, 'Is Admin:', isAdminLogin);

        if (isAdminLogin) {
            // Handle admin login
            user = await User.findOne({ email: email.toLowerCase() }).select('+password');
            console.log('👤 Admin user found in DB:', user ? 'Yes' : 'No');
            
            if (!user) {
                console.log('🆕 Creating new admin user...');
                // Create admin user if not exists (for first time setup)
                const bcrypt = await import('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('adminforPayments@university.com', salt);
                
                user = await User.create({
                    name: 'Admin',
                    email: 'adminpayments@gmail.com',
                    password: hashedPassword,
                    role: 'admin'
                });
                console.log('✅ Admin user created successfully');
                
                // 🚨 IMPORTANT: After creating admin, return success immediately
                // Don't go to password check for newly created user
                const token = generateToken(user._id);
                
                return res.json({
                    success: true,
                    data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        regNo: user.regNo,
                        mobile: user.mobile,
                        department: user.department,
                        role: user.role,
                        token: token,
                    },
                    message: 'Admin user created and logged in successfully'
                });
            }
        } else if (regNo) {
            // Handle student login with regNo
            user = await User.findOne({ regNo: regNo.toUpperCase() }).select('+password');
        } else {
            // Handle student login with email
            user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        }

        console.log('🔑 Checking password for user:', user?.email);

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            console.log('✅ Password matches');
            // Check if account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account has been deactivated. Please contact administrator.'
                });
            }

            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    regNo: user.regNo,
                    mobile: user.mobile,
                    department: user.department,
                    role: user.role,
                    token: generateToken(user._id),
                },
                message: 'Login successful'
            });
        } else {
            console.log('❌ Invalid credentials - User exists:', !!user, 'Password match:', user ? await user.matchPassword(password) : 'N/A');
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const fieldsToUpdate = {
            name: req.body.name || user.name,
            email: req.body.email || user.email,
            mobile: req.body.mobile || user.mobile,
            department: req.body.department || user.department,
        };

        // Check if email is being changed and if it's already taken
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ 
                email: req.body.email.toLowerCase(),
                _id: { $ne: user._id }
            });
            
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
            fieldsToUpdate.email = req.body.email.toLowerCase();
        }

        // Update password if provided
        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }
            user.password = req.body.password;
        }

        // Update other fields
        Object.keys(fieldsToUpdate).forEach(key => {
            user[key] = fieldsToUpdate[key];
        });

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                regNo: updatedUser.regNo,
                mobile: updatedUser.mobile,
                department: updatedUser.department,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};

// @desc    Get all students (for admin)
// @route   GET /api/auth/students
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export {
    registerStudent,
    loginUser,
    getMe,
    updateProfile,
    getStudents
};