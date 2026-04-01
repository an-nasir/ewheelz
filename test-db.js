const { prisma } = require("./src/lib/prisma");

async function test() {
  try {
    const models = await prisma.evModel.findMany();
    console.log(`Found ${models.length} EV models`);
    console.log(models);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();