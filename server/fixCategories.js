import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

// Fix product categories to lowercase to match frontend config
const fixCategories = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const categoryMap = {
            'Grains': 'grains',
            'Vegetables': 'vegetables',
            'Fruits': 'fruits',
            'Spices': 'spices',
            'Herbs': 'other',
            'Dairy & Oil': 'dairy',
            'Sweeteners': 'other',
        };

        for (const [oldCat, newCat] of Object.entries(categoryMap)) {
            const result = await Product.updateMany(
                { category: oldCat },
                { $set: { category: newCat } }
            );
            if (result.modifiedCount > 0) {
                console.log(`✓ Updated ${result.modifiedCount} products: "${oldCat}" → "${newCat}"`);
            }
        }

        console.log('\n✅ Categories fixed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

fixCategories();
