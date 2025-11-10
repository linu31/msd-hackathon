import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Payment must belong to a student']
    },
    feeType: {
        type: String,
        enum: ['tuition', 'bus', 'hostel','supply','condonation','idcard','crt','uniform','other_registrations'],
        required: [true, 'Please specify fee type']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [1, 'Amount must be at least 1']
    },
    razorpayOrderId: {
        type: String,
        required: [true, 'Razorpay order ID is required'],
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true
    },
    razorpaySignature: {
        type: String,
        sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    receiptSent: {
        type: Boolean,
        default: false
    },
    receiptUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Index for better query performance
paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

// Virtual for formatted fee type
paymentSchema.virtual('formattedFeeType').get(function() {
    const feeTypes = {
        tuition: 'Tuition Fee',
        bus: 'Bus Fee',
        hostel: 'Hostel Fee',
        supply: 'Supply Fee',
        condonation: 'Condonation Fee',
        idcard: 'ID Card Fee',
        crt: 'CRT Fee',
        uniform: 'Uniform Fee',
        other_registrations: 'Other Registrations Fee'
    };
    return feeTypes[this.feeType] || this.feeType;
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(studentId) {
    const stats = await this.aggregate([
        {
            $match: { 
                student: mongoose.Types.ObjectId(studentId),
                status: 'completed'
            }
        },
        {
            $group: {
                _id: '$feeType',
                totalPaid: { $sum: '$amount' },
                paymentCount: { $sum: 1 }
            }
        }
    ]);
    
    return stats;
};

export default mongoose.model('Payment', paymentSchema);