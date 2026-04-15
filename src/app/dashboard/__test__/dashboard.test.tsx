import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "../page";

// Mock the auth function (عشان نتجنب مشاكل المصادقة في الاختبار)
vi.mock("@/auth", () => ({
  auth: () => ({
    user: {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    },
  }),
}));

// Mock the subscription check
vi.mock("@/lib/subscription", () => ({
  checkSubscription: () => ({ isActive: false, plan: "BASIC" }),
}));

// Mock the database calls
vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findMany: () => Promise.resolve([]),
    },
  },
}));

describe("DashboardPage", () => {
  it("يعرض رسالة ترحيب للمستخدم", async () => {
    // هذا الكود بيحول DashboardPage من Server Component لـ Client Component عشان نقدر نختبره
    const DashboardPageClient = await DashboardPage();
    render(DashboardPageClient as any);
    expect(screen.getByText(/Welcome, test@example.com/i)).toBeDefined();
  });
});
