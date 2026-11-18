import mongoose from 'mongoose';
import { env } from './env';
import { Doctor, Patient } from '../models';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Keep Mongo indexes in sync with schema definitions (search/filter/pagination).
    await Promise.all([Doctor.syncIndexes(), Patient.syncIndexes()]);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
