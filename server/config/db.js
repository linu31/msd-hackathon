import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
    try {
        // Use provided MONGO_URI or fallback to local MongoDB for development
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stackhack';
        if (!process.env.MONGO_URI) {
            console.warn('MONGO_URI not set. Falling back to local MongoDB at', mongoUri);
        } else {
            console.log('Using MONGO_URI from environment');
        }

        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Create admin user if not exists
        await createAdminUser();
    } catch (error) {
        console.error('MongoDB connection error:', error && error.message ? error.message : error);
        if (error && error.stack) console.error(error.stack);
        process.exit(1);
    }
};

const createAdminUser = async () => {
    try {
        // Use the imported User model (ensures schema is available)
        const adminEmail = 'adminpayments@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log(`ℹ️ Admin user already exists: ${adminExists.email} (id: ${adminExists._id})`);
            return;
        }

        // Import bcryptjs and create the admin user
        const bcryptModule = await import('bcryptjs');
        const bcrypt = bcryptModule.default || bcryptModule;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('adminforPayments@university.com', salt);

        const newAdmin = await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            department: 'cse',
            mobile: '9999999999'
        });

        console.log(`✅ Admin user created successfully: ${newAdmin.email} (id: ${newAdmin._id})`);
        return newAdmin;
    } catch (error) {
        // Print a clearer error message
        console.error('Error creating admin user:', error && error.message ? error.message : error);
        if (error && error.stack) console.error(error.stack);
        throw error;
    }
};

export default connectDB;
