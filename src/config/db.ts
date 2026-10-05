import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`✅MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log(`💥MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;

// Username = boluwatifejohnson01_db_user
// Password = 2gGWYDjK4n1H0eTw

// string = mongodb+srv://<db_username>:2gGWYDjK4n1H0eTw@cluster0.upgqnfd.mongodb.net/?appName=Cluster0&compressors=zlib
