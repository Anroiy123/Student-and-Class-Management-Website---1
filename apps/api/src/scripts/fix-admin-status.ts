import { connectToDatabase } from "../config/database.js";
import { UserModel } from "../models/user.model.js";

/**
 * Script để cập nhật status của tất cả tài khoản ADMIN thành ACTIVE
 */
const fixAdminStatus = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    console.log("🔍 Finding all ADMIN users...");
    const adminUsers = await UserModel.find({ role: "ADMIN" });

    if (adminUsers.length === 0) {
      console.log("❌ No ADMIN users found");
      process.exit(1);
    }

    console.log(`✅ Found ${adminUsers.length} ADMIN user(s)`);

    for (const user of adminUsers) {
      console.log(`\n📧 User: ${user.email}`);
      console.log(`   Current status: ${user.status}`);

      if (user.status !== "ACTIVE") {
        user.status = "ACTIVE";
        await user.save();
        console.log(`   ✅ Updated status to ACTIVE`);
      } else {
        console.log(`   ⏭️ Already ACTIVE, skipping`);
      }
    }

    console.log("\n✨ Done! All ADMIN users are now ACTIVE");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

void fixAdminStatus();

