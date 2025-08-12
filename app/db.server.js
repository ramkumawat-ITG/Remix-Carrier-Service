import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export default async function connectDB() {

  if (!MONGO_URI) {
    throw new Error("MongoDB connection string is missing in .env file");
  }

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}
connectDB()