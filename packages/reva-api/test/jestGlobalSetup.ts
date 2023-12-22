import { execSync } from "child_process";

module.exports = async () => {
  console.log("Running migrations on: " + process.env.DATABASE_URL);
  execSync(`npx prisma migrate reset --force --schema prisma/schema.prisma`, {
    stdio: "inherit",
  });
};
