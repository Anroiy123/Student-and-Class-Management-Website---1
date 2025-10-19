import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    throw error;
  }
};
