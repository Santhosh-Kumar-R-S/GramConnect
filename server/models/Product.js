import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    pricePerUnit: {
        type: Number,
        required: true,
        default: 0,
    },
    unit: {
        type: String,
        required: true,
    },
    quantityAvailable: {
        type: Number,
        required: true,
        default: 0,
    },
    image: {
        type: String,
        default: '/placeholder.svg',
    },
    harvestDate: {
        type: Date,
    },
    isOrganic: {
        type: Boolean,
        default: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
