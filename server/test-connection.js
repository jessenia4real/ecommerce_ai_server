import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB Connection...');
console.log('Connection String:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':****@'));

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerseai',
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Check if your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('2. Verify your database username and password');
    console.error('3. Ensure your cluster is active (not paused)');
    console.error('4. Check your internet connection');
    process.exit(1);
  }
};

testConnection();
