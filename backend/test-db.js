const prisma = require("./prismaClient");

async function testDatabase() {
  try {
    const users = await prisma.users.findMany();

    console.log("Database connected successfully!");
    console.log(users);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();