// import { PrismaClient } from "@/generated/prisma/client";

import { PrismaClient } from "@prisma/client";

// import { PrismaClient } from "../../prisma/generated/client"; // المسار الجديد
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
