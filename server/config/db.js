import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        // Ensure the connection string has a database name
        let uri = process.env.MONGO_URI;
        if (uri && !uri.match(/\.mongodb\.net\/[a-zA-Z]/)) {
            uri = uri.replace(/\.mongodb\.net\//, '.mongodb.net/gramconnect');
        }

        const opts = {
            bufferCommands: false,
            dbName: 'gramconnect',
        };

        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export default connectDB;
