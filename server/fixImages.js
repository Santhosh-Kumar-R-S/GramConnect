import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

// Map product names to nice placehold.co images with category-themed colors
const imageMap = {
    'Organic Basmati Rice': 'https://placehold.co/600x400/f5e6cc/5a3e1b?text=🌾+Basmati+Rice',
    'Fresh Tomatoes': 'https://placehold.co/600x400/fce4e4/c0392b?text=🍅+Tomatoes',
    'Green Chillies': 'https://placehold.co/600x400/d5f5e3/1e8449?text=🌶️+Green+Chillies',
    'Turmeric Powder': 'https://placehold.co/600x400/fef9e7/d4ac0d?text=✨+Turmeric',
    'Alphonso Mangoes': 'https://placehold.co/600x400/fdebd0/e67e22?text=🥭+Mangoes',
    'Fresh Spinach': 'https://placehold.co/600x400/d5f5e3/196f3d?text=🥬+Spinach',
    'Organic Bananas': 'https://placehold.co/600x400/fef9e7/b7950b?text=🍌+Bananas',
    'Red Onions': 'https://placehold.co/600x400/f5eef8/7d3c98?text=🧅+Red+Onions',
    'Cold Pressed Coconut Oil': 'https://placehold.co/600x400/eaf2f8/2980b9?text=🥥+Coconut+Oil',
    'Fresh Potatoes': 'https://placehold.co/600x400/fae5d3/a04000?text=🥔+Potatoes',
    'Organic Jaggery': 'https://placehold.co/600x400/f6ddcc/784212?text=🍯+Jaggery',
    'Fresh Carrots': 'https://placehold.co/600x400/fdebd0/e67e22?text=🥕+Carrots',
    'Dried Red Chillies': 'https://placehold.co/600x400/fadbd8/922b21?text=🌶️+Red+Chillies',
    'Fresh Coriander': 'https://placehold.co/600x400/d5f5e3/1e8449?text=🌿+Coriander',
};

const fixImages = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB\n');

        for (const [name, imageUrl] of Object.entries(imageMap)) {
            const result = await Product.updateOne(
                { name },
                { $set: { image: imageUrl } }
            );
            if (result.modifiedCount > 0) {
                console.log(`✓ ${name} → image updated`);
            } else if (result.matchedCount > 0) {
                console.log(`- ${name} → already up to date`);
            } else {
                console.log(`✗ ${name} → not found in DB`);
            }
        }

        console.log('\n✅ All product images updated!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

fixImages();
