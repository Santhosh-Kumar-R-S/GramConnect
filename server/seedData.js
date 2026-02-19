import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

// --------------- USERS ---------------
const farmers = [
    {
        name: 'Ravi Kumar',
        email: 'ravi@gramconnect.com',
        password: 'password',
        role: 'farmer',
        phone: '9876543210',
        village: 'Kothapalli',
        district: 'Warangal',
        state: 'Telangana',
        status: 'approved',
    },
    {
        name: 'Lakshmi Devi',
        email: 'lakshmi@gramconnect.com',
        password: 'password',
        role: 'farmer',
        phone: '9876543211',
        village: 'Madanapalle',
        district: 'Annamayya',
        state: 'Andhra Pradesh',
        status: 'approved',
    },
    {
        name: 'Suresh Patil',
        email: 'suresh@gramconnect.com',
        password: 'password',
        role: 'farmer',
        phone: '9876543212',
        village: 'Hubli',
        district: 'Dharwad',
        state: 'Karnataka',
        status: 'approved',
    },
];

const consumers = [
    {
        name: 'Ananya Sharma',
        email: 'ananya@gmail.com',
        password: 'password',
        role: 'consumer',
        phone: '9988776655',
        address: '12, MG Road',
        city: 'Hyderabad',
        state: 'Telangana',
        status: 'approved',
    },
    {
        name: 'Karthik Reddy',
        email: 'karthik@gmail.com',
        password: 'password',
        role: 'consumer',
        phone: '9988776656',
        address: '45, Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        status: 'approved',
    },
];

// --------------- PRODUCTS ---------------
const getProducts = (farmerIds) => [
    // ---- Farmer 1: Ravi Kumar ----
    {
        farmer: farmerIds[0],
        name: 'Organic Basmati Rice',
        category: 'grains',
        description: 'Premium long-grain basmati rice grown organically in the fertile fields of Telangana. Aged for 12 months for the perfect aroma and texture.',
        pricePerUnit: 120,
        unit: 'kg',
        quantityAvailable: 500,
        image: 'https://placehold.co/600x400/f5e6cc/5a3e1b?text=🌾+Basmati+Rice',
        harvestDate: new Date('2026-01-15'),
        isOrganic: true,
        isAvailable: true,
    },
    {
        farmer: farmerIds[0],
        name: 'Fresh Tomatoes',
        category: 'vegetables',
        description: 'Juicy, vine-ripened tomatoes picked fresh from the farm. Rich in flavor and perfect for cooking or salads.',
        pricePerUnit: 40,
        unit: 'kg',
        quantityAvailable: 200,
        image: 'https://placehold.co/600x400/fce4e4/c0392b?text=🍅+Tomatoes',
        harvestDate: new Date('2026-02-10'),
        isOrganic: false,
        isAvailable: true,
    },
    {
        farmer: farmerIds[0],
        name: 'Green Chillies',
        category: 'vegetables',
        description: 'Spicy, farm-fresh green chillies. A staple in Indian cooking, grown without harmful pesticides.',
        pricePerUnit: 60,
        unit: 'kg',
        quantityAvailable: 100,
        image: 'https://placehold.co/600x400/d5f5e3/1e8449?text=🌶️+Green+Chillies',
        harvestDate: new Date('2026-02-12'),
        isOrganic: true,
        isAvailable: true,
    },
    {
        farmer: farmerIds[0],
        name: 'Turmeric Powder',
        category: 'spices',
        description: 'Pure, stone-ground turmeric powder with high curcumin content. Sourced directly from our turmeric fields in Warangal.',
        pricePerUnit: 200,
        unit: 'kg',
        quantityAvailable: 50,
        image: 'https://placehold.co/600x400/fef9e7/d4ac0d?text=✨+Turmeric',
        harvestDate: new Date('2026-01-20'),
        isOrganic: true,
        isAvailable: true,
    },

    // ---- Farmer 2: Lakshmi Devi ----
    {
        farmer: farmerIds[1],
        name: 'Alphonso Mangoes',
        category: 'fruits',
        description: 'Sweet, aromatic Alphonso mangoes handpicked at the perfect ripeness. Known as the king of mangoes for their unmatched flavor.',
        pricePerUnit: 350,
        unit: 'dozen',
        quantityAvailable: 100,
        image: 'https://placehold.co/600x400/fdebd0/e67e22?text=🥭+Mangoes',
        harvestDate: new Date('2026-02-01'),
        isOrganic: false,
        isAvailable: true,
    },
    {
        farmer: farmerIds[1],
        name: 'Fresh Spinach',
        category: 'vegetables',
        description: 'Tender, dark-green spinach leaves packed with iron and vitamins. Harvested just hours before delivery.',
        pricePerUnit: 30,
        unit: 'bunch',
        quantityAvailable: 150,
        image: 'https://placehold.co/600x400/d5f5e3/196f3d?text=🥬+Spinach',
        harvestDate: new Date('2026-02-15'),
        isOrganic: true,
        isAvailable: true,
    },
    {
        farmer: farmerIds[1],
        name: 'Organic Bananas',
        category: 'fruits',
        description: 'Naturally ripened, chemical-free bananas from our organic plantation. Sweet, creamy, and packed with potassium.',
        pricePerUnit: 50,
        unit: 'dozen',
        quantityAvailable: 300,
        image: 'https://placehold.co/600x400/fef9e7/b7950b?text=🍌+Bananas',
        harvestDate: new Date('2026-02-14'),
        isOrganic: true,
        isAvailable: true,
    },
    {
        farmer: farmerIds[1],
        name: 'Red Onions',
        category: 'vegetables',
        description: 'Premium quality red onions from Madanapalle, known for their deep color and sharp flavor. A kitchen essential.',
        pricePerUnit: 35,
        unit: 'kg',
        quantityAvailable: 400,
        image: 'https://placehold.co/600x400/f5eef8/7d3c98?text=🧅+Red+Onions',
        harvestDate: new Date('2026-02-05'),
        isOrganic: false,
        isAvailable: true,
    },

    // ---- Farmer 3: Suresh Patil ----
    {
        farmer: farmerIds[2],
        name: 'Cold Pressed Coconut Oil',
        category: 'dairy',
        description: 'Traditional cold-pressed virgin coconut oil, extracted from fresh coconuts. Ideal for cooking, skin care, and hair care.',
        pricePerUnit: 300,
        unit: 'litre',
        quantityAvailable: 80,
        image: 'https://placehold.co/600x400/eaf2f8/2980b9?text=🥥+Coconut+Oil',
        harvestDate: new Date('2026-01-25'),
        isOrganic: true,
        isAvailable: true,
    },
    {
        farmer: farmerIds[2],
        name: 'Fresh Potatoes',
        category: 'vegetables',
        description: 'Farm-fresh potatoes with smooth skin and creamy texture. Versatile and perfect for all types of Indian dishes.',
        pricePerUnit: 25,
        unit: 'kg',
        quantityAvailable: 600,
        image: 'https://placehold.co/600x400/fae5d3/a04000?text=🥔+Potatoes',
        harvestDate: new Date('2026-02-08'),
        isOrganic: false,
        isAvailable: true,
    },
    {
        farmer: farmerIds[2],
        name: 'Organic Jaggery',
        category: 'other',
        description: 'Pure, unrefined jaggery made from fresh sugarcane juice. A healthy alternative to refined sugar, rich in minerals.',
        pricePerUnit: 80,
        unit: 'kg',
        quantityAvailable: 120,
        image: 'https://placehold.co/600x400/f6ddcc/784212?text=🍯+Jaggery',
        harvestDate: new Date('2026-01-10'),
        isOrganic: true,
        isAvailable: true,
    },
    {
        farmer: farmerIds[2],
        name: 'Fresh Carrots',
        category: 'vegetables',
        description: 'Crunchy, sweet carrots freshly harvested from our fields in Karnataka. Perfect for juices, salads, and cooking.',
        pricePerUnit: 45,
        unit: 'kg',
        quantityAvailable: 250,
        image: 'https://placehold.co/600x400/fdebd0/e67e22?text=🥕+Carrots',
        harvestDate: new Date('2026-02-11'),
        isOrganic: false,
        isAvailable: true,
    },
    {
        farmer: farmerIds[2],
        name: 'Dried Red Chillies',
        category: 'spices',
        description: 'Sun-dried Byadagi red chillies from Karnataka, famous for their deep red color and mild heat. Essential for Indian curries.',
        pricePerUnit: 250,
        unit: 'kg',
        quantityAvailable: 60,
        image: 'https://placehold.co/600x400/fadbd8/922b21?text=🌶️+Red+Chillies',
        harvestDate: new Date('2026-01-05'),
        isOrganic: true,
        isAvailable: true,
    },
    {
        farmer: farmerIds[2],
        name: 'Fresh Coriander',
        category: 'other',
        description: 'Fragrant, fresh coriander leaves grown without pesticides. Adds authentic flavor and aroma to any dish.',
        pricePerUnit: 20,
        unit: 'bunch',
        quantityAvailable: 200,
        image: 'https://placehold.co/600x400/d5f5e3/1e8449?text=🌿+Coriander',
        harvestDate: new Date('2026-02-16'),
        isOrganic: true,
        isAvailable: true,
    },
];

// --------------- SEED FUNCTION ---------------
const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear existing data (except admin)
        await Product.deleteMany({});
        await User.deleteMany({ role: { $ne: 'admin' } });
        console.log('Cleared existing products and non-admin users');

        // Create farmers
        const createdFarmers = [];
        for (const farmer of farmers) {
            const created = await User.create(farmer);
            createdFarmers.push(created);
            console.log(`✓ Farmer created: ${created.name} (${created.email})`);
        }

        // Create consumers
        for (const consumer of consumers) {
            const created = await User.create(consumer);
            console.log(`✓ Consumer created: ${created.name} (${created.email})`);
        }

        // Create products
        const farmerIds = createdFarmers.map(f => f._id);
        const products = getProducts(farmerIds);
        const createdProducts = await Product.insertMany(products);
        console.log(`\n✓ ${createdProducts.length} products created successfully`);

        // Summary
        console.log('\n========================================');
        console.log('  SEED DATA SUMMARY');
        console.log('========================================');
        console.log('\n👨‍🌾 Farmers:');
        createdFarmers.forEach(f => console.log(`   ${f.name} | ${f.email} | password: password`));
        console.log('\n👤 Consumers:');
        consumers.forEach(c => console.log(`   ${c.name} | ${c.email} | password: password`));
        console.log(`\n📦 Products: ${createdProducts.length} items across ${new Set(products.map(p => p.category)).size} categories`);
        console.log('\n✅ Database seeded successfully!');
        console.log('========================================\n');

        process.exit();
    } catch (error) {
        console.error(`Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase();
