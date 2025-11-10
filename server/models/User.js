import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    regNo: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number']
    },
    department: {
        type: String,
        required: [true, 'Please select a department'],
        enum: [
            'CSE', 'ECE', 'MECH', 'EEE', 'AIML', 'IT', 
            'LAW', 'BBA', 'BCOM', 'MCA', 'MBA', 'MCS'
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Cascade delete payments when user is deleted
userSchema.pre('remove', async function(next) {
    console.log(`Payments being removed for user ${this._id}`);
    await this.model('Payment').deleteMany({ student: this._id });
    next();
});

export default mongoose.model('User', userSchema);