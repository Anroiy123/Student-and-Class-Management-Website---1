import { connectToDatabase } from "../config/database";
import { UserModel } from "../models/user.model";
import { hashPassword } from "../utils/password";

const seedUsers = async () => {
  try {
    console.log("🌱 Bắt đầu seed users...");

    await connectToDatabase();

    // Xóa users cũ (để test)
    await UserModel.deleteMany({});
    console.log("✅ Đã xóa users cũ");

    // Hash password
    const password = await hashPassword("123456");

    // Tạo users mẫu
    const users = await UserModel.create([
      {
        email: "admin@example.com",
        passwordHash: password,
        role: "ADMIN",
      },
      {
        email: "teacher@example.com",
        passwordHash: password,
        role: "TEACHER",
      },
      {
        email: "student@example.com",
        passwordHash: password,
        role: "STUDENT",
      },
      {
        email: "teacher2@example.com",
        passwordHash: password,
        role: "TEACHER",
      },
      {
        email: "student2@example.com",
        passwordHash: password,
        role: "STUDENT",
      },
    ]);

    console.log(`✅ Đã tạo ${users.length} users`);
    console.log("\n📋 Thông tin đăng nhập:");
    console.log("─────────────────────────────────────");
    console.log("👑 ADMIN:");
    console.log("   Email: admin@example.com");
    console.log("   Password: 123456");
    console.log("─────────────────────────────────────");
    console.log("👨‍🏫 TEACHER:");
    console.log("   Email: teacher@example.com");
    console.log("   Password: 123456");
    console.log("   ---");
    console.log("   Email: teacher2@example.com");
    console.log("   Password: 123456");
    console.log("─────────────────────────────────────");
    console.log("🎓 STUDENT:");
    console.log("   Email: student@example.com");
    console.log("   Password: 123456");
    console.log("   ---");
    console.log("   Email: student2@example.com");
    console.log("   Password: 123456");
    console.log("─────────────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi seed users:", error);
    process.exit(1);
  }
};

seedUsers();
