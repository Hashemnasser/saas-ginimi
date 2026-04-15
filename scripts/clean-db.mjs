import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function cleanDb() {
  try {
    // const clean = await prisma.user.deleteMany({})  //if you want clean db active this
    const clean = await prisma.user.count();
    console.log(`${clean}`);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}
cleanDb();
