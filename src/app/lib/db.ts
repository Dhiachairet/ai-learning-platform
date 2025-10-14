import mongoose from 'mongoose';

const connectDB = async () => {
  console.log('MONGODB_URI:', process.env.MONGODB_URI); // Debug log
  if (mongoose.connection.readyState === 1) return; // Already connected
  try {
    await mongoose.connect(process.env.MONGODB_URI!); // Remove the ! assertion
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default connectDB;