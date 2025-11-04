const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userModel = require("./models/userModel");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: "admin@portfolio.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = new userModel({
      name: "Admin User",
      email: "admin@portfolio.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      profile: {
        bio: "System Administrator"
      }
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@portfolio.com");
    console.log("Password: admin123");
    console.log("Role: admin");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createAdminUser();
