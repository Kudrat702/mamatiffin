// migrations/fixOrderIndexes.ts
import mongoose from "mongoose";
import { Order } from "../models/order"; // <-- path adjust karo agar alag ho

// Load env file
import dotenv from "dotenv";
dotenv.config();

// Secure DB URI (must be in .env file)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1); // Exit with failure
}

const runMigration = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.collection("orders");

    // 1. Get all indexes
    const indexes = await collection.indexes();
    console.log("📌 Current Indexes:", indexes);

    // 2. Drop duplicate/invalid index if exists
    if (indexes.find((idx) => idx.name === "paymentDetails.paymentId_1")) {
      await collection.dropIndex("paymentDetails.paymentId_1");
      console.log("🗑️ Dropped old index: paymentDetails.paymentId_1");
    }

    // 3. Recreate safe indexes from Order model
    await Order.syncIndexes();
    console.log("✅ Synced indexes from Order model");

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
