import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const resetAdminPassword = async () => {
    try {
        await connectDB();

        const admin = await User.findOne({ email: 'admin@gramconnect.com' });

        if (!admin) {
            console.log('Admin user not found. Creating one...');
            const user = await User.create({
                name: 'Admin User',
                email: 'admin@gramconnect.com',
                password: 'password',
                role: 'admin',
                phone: '9999999999',
            });
            console.log('Admin user created successfully');
            console.log('Email: admin@gramconnect.com');
            console.log('Password: password');
        } else {
            admin.password = 'password';
            await admin.save();
            console.log('Admin password reset successfully');
            console.log('Email: admin@gramconnect.com');
            console.log('Password: password');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

resetAdminPassword();
