import { connectToDatabase } from "../config/database.js";
import { UserModel } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";

const resetAdminPassword = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    const email = "admin@example.com";
    const newPassword = "admin123";

    console.log(`🔍 Finding user with email: ${email}`);
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.email} (Role: ${user.role})`);
    console.log(`🔐 Hashing new password...`);
    
    const passwordHash = await hashPassword(newPassword);
    user.passwordHash = passwordHash;
    
    await user.save();

    console.log(`✅ Password reset successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`\n✨ You can now login with these credentials`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  }
};

void resetAdminPassword();

