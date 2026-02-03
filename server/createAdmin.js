import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@gramconnect.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const user = await User.create({
            name: 'Admin User',
            email: 'admin@gramconnect.com',
            password: 'adminpassword123',
            role: 'admin',
            phone: '9999999999',
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@gramconnect.com');
        console.log('Password: adminpassword123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
