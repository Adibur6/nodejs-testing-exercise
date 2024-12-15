import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/users', {});
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection error', err);
    throw err;
  }
};

connectDB();
