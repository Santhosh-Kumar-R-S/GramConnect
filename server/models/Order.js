import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            // Link to the farmer of this specific item
            farmer: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User',
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'],
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'Cash on Delivery',
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
