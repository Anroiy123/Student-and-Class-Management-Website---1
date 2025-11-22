import { connectToDatabase } from "../config/database.js";
import { UserModel } from "../models/user.model.js";
import mongoose from "mongoose";

const viewDatabase = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    console.log("\n📊 DATABASE OVERVIEW\n");
    console.log("=".repeat(80));

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📁 Collections:");
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    // Count documents in each collection
    console.log("\n📈 Document counts:");
    for (const col of collections) {
      const count = await mongoose.connection.db
        .collection(col.name)
        .countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }

    // Show users
    console.log("\n👥 USERS:");
    console.log("=".repeat(80));
    const users = await UserModel.find().select("-passwordHash").lean();
    users.forEach((user) => {
      console.log(`  📧 ${user.email}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     ID: ${user._id}`);
      console.log(`     Created: ${user.createdAt}`);
      console.log("");
    });

    // Show students
    console.log("\n🎓 STUDENTS:");
    console.log("=".repeat(80));
    const students = await mongoose.connection.db
      .collection("students")
      .find()
      .limit(10)
      .toArray();
    if (students.length === 0) {
      console.log("  No students found");
    } else {
      students.forEach((student: any) => {
        console.log(`  📝 ${student.fullName || "N/A"}`);
        console.log(`     MSSV: ${student.mssv || "N/A"}`);
        console.log(`     Email: ${student.email || "N/A"}`);
        console.log(`     ID: ${student._id}`);
        console.log("");
      });
    }

    // Show classes
    console.log("\n🏫 CLASSES:");
    console.log("=".repeat(80));
    const classes = await mongoose.connection.db
      .collection("classes")
      .find()
      .limit(10)
      .toArray();
    if (classes.length === 0) {
      console.log("  No classes found");
    } else {
      classes.forEach((cls: any) => {
        console.log(`  📚 ${cls.name || "N/A"}`);
        console.log(`     Code: ${cls.code || "N/A"}`);
        console.log(`     ID: ${cls._id}`);
        console.log("");
      });
    }

    // Show courses
    console.log("\n📖 COURSES:");
    console.log("=".repeat(80));
    const courses = await mongoose.connection.db
      .collection("courses")
      .find()
      .limit(10)
      .toArray();
    if (courses.length === 0) {
      console.log("  No courses found");
    } else {
      courses.forEach((course: any) => {
        console.log(`  📘 ${course.name || "N/A"}`);
        console.log(`     Code: ${course.code || "N/A"}`);
        console.log(`     ID: ${course._id}`);
        console.log("");
      });
    }

    console.log("=".repeat(80));
    console.log("\n✅ Database view completed!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error viewing database:", error);
    process.exit(1);
  }
};

void viewDatabase();

