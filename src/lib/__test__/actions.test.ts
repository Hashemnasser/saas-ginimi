import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock كل التبعيات أولاً
vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
  default: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    project: {
      count: vi.fn(),
      create: vi.fn(),
    },
    projectMember: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/webhook-dispatcher", () => ({
  dispatchWebhook: vi.fn(),
}));

// استيراد الدوال بعد الـ mock
import { auth } from "@/auth";
import { createProject, generateApiKey } from "@/lib/actions";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";

describe("اختبارات API Key", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ينشئ مفتاح API للمستخدم المسجل", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(db.user.update).mockResolvedValue({ id: "user-1" } as any);
    const result = await generateApiKey();
    expect(result.apiKey).toBeDefined();
    expect(result.apiKey).toMatch(/^sk_live_/);
  });

  it("يرفض إنشاء مفتاح لو المستخدم مش مسجل", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);
    const result = await generateApiKey();
    expect(result.error).toBe("Unauthorized");
  });
});

describe("اختبارات createProject", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ينشئ مشروع جديد بنجاح", async () => {
    // 1. Mock auth
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);

    // 2. Mock checkSubscription (بحاجة user.findUnique)
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1",
      plan: "BASIC",
      stripeSubscriptionStatus: false,
    } as any);
    vi.mocked(checkSubscription).mockResolvedValue({
      isActive: false,
      plan: "BASIC",
    } as any);

    // 3. Mock project.count
    vi.mocked(db.project.count).mockResolvedValue(2);

    // 4. Mock project.create
    vi.mocked(db.project.create).mockResolvedValue({
      id: "new-id",
      name: "My Project",
      description: "Test desc",
      userId: "user-1",
    } as any);

    // 5. Mock projectMember.create (لازم عشان ما يفشلش)
    vi.mocked(db.projectMember.create).mockResolvedValue({} as any);

    const formData = new FormData();
    formData.append("name", "My Project");
    formData.append("description", "Test desc");

    const result = await createProject(null, formData);

    expect(result).toEqual({ success: "Project created!" });
    expect(db.project.create).toHaveBeenCalledWith({
      data: {
        name: "My Project",
        description: "Test desc",
        userId: "user-1",
      },
    });
  });

  it("يرفض إنشاء مشروع بدون اسم", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    const formData = new FormData();
    formData.append("name", "");
    const result = await createProject(null, formData);
    expect(result.error).toContain("Project name is required");
  });
});
