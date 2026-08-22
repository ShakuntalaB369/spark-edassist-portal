import mongoose from 'mongoose';
import dns from 'dns';

// Force Node to use public DNS servers to resolve Atlas SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
