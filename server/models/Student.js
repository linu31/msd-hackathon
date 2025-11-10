import mongoose from 'mongoose';

// This model is for additional student-specific information if needed
// Main student data is in User model with role: 'student'

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    academicYear: {
        type: String,
        required: true,
        default: '2024-2025'
    },
    semester: {
        type: String,
        enum: ['1', '2', '3', '4', '5', '6', '7', '8'],
        required: true
    },
    section: {
        type: String,
        uppercase: true,
        maxlength: 2
    },
    fatherName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    motherName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India'
        }
    },
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
    },
    admissionYear: {
        type: Number,
        required: true,
        min: 2000,
        max: 2030
    },
    isHosteller: {
        type: Boolean,
        default: false
    },
    busRoute: {
        type: String,
        enum: ['Route A', 'Route B', 'Route C', 'Route D', 'Not Applicable'],
        default: 'Not Applicable'
    },
    fees: {
        tuition: {
            amount: { type: Number, default: 50000 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        bus: {
            amount: { type: Number, default: 10000 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        hostel: {
            amount: { type: Number, default: 30000 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        supply: {
            amount: { type: Number, default: 1000 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        condonation: {
            amount: { type: Number, default: 500 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        idcard: {
            amount: { type: Number, default: 100 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        crt: {
            amount: { type: Number, default: 5000 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        uniform: {
            amount: { type: Number, default: 1500 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        },
        other_registrations: {
            amount: { type: Number, default: 1000 },
            paid: { type: Boolean, default: false },
            paidAt: Date
        }
    },
    documents: {
        aadhaar: { type: String, default: '' },
        pan: { type: String, default: '' },
        tc: { type: String, default: '' }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'graduated', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for better query performance
studentSchema.index({ user: 1 });
studentSchema.index({ regNo: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ academicYear: 1 });

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
    const addressParts = [];
    if (this.address.street) addressParts.push(this.address.street);
    if (this.address.city) addressParts.push(this.address.city);
    if (this.address.state) addressParts.push(this.address.state);
    if (this.address.pincode) addressParts.push(this.address.pincode);
    if (this.address.country) addressParts.push(this.address.country);
    
    return addressParts.join(', ');
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Static method to get student statistics
studentSchema.statics.getStudentStats = async function() {
    const stats = await this.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $group: {
                _id: '$userInfo.department',
                totalStudents: { $sum: 1 },
                activeStudents: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                hostellers: {
                    $sum: { $cond: ['$isHosteller', 1, 0] }
                },
                busUsers: {
                    $sum: { 
                        $cond: [{ $ne: ['$busRoute', 'Not Applicable'] }, 1, 0] 
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
    
    return stats;
};

// Method to check if student has paid all fees
studentSchema.methods.hasPaidAllFees = function() {
    return this.fees.tuition.paid && this.fees.bus.paid && this.fees.hostel.paid;
};

// Method to get pending fees amount
studentSchema.methods.getPendingFees = function() {
    let pending = 0;
    if (!this.fees.tuition.paid) pending += this.fees.tuition.amount;
    if (!this.fees.bus.paid) pending += this.fees.bus.amount;
    if (!this.fees.hostel.paid) pending += this.fees.hostel.amount;
    if (!this.fees.supply.paid) pending += this.fees.supply.amount;
    if (!this.fees.condonation.paid) pending += this.fees.condonation.amount;
    if (!this.fees.idcard.paid) pending += this.fees.idcard.amount;
    if (!this.fees.crt.paid) pending += this.fees.crt.amount;
    if (!this.fees.uniform.paid) pending += this.fees.uniform.amount;
    if (!this.fees.other_registrations.paid) pending += this.fees.other_registrations.amount;
    return pending;
};

export default mongoose.model('Student', studentSchema);