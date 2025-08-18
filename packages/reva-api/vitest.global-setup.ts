import { execSync } from "child_process";

import { prismaClient } from "./prisma/client";

export async function setup() {
  console.log("\n🔄 Setting up test environment...");
  console.log("📊 Database URL:", process.env.DATABASE_URL);

  try {
    // Reset database with migrations
    execSync(`npx prisma migrate reset --force --schema prisma/schema.prisma`, {
      stdio: ["inherit", "ignore", "inherit"],
    });

    console.log("✅ Database migrations completed");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    throw error;
  }
}

export async function teardown() {
  console.log("\n🧹 Cleaning up test environment...");
  try {
    await prismaClient.$disconnect();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Failed to close database connection:", error);
  }
}
