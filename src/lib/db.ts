// import { PrismaClient } from "@/generated/prisma/client";

import { PrismaClient } from "@prisma/client";

// import { PrismaClient } from "../../prisma/generated/client"; // المسار الجديد
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});
export const db = globalForPrisma.prisma || prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
