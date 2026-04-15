import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "../route";

// ========== Mock جزئي لـ next/server ==========
// نحافظ على NextRequest الحقيقية، ونضيف NextResponse وهمي
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      json: (data: any, init?: { status?: number }) => {
        return {
          status: init?.status || 200,
          json: async () => data,
        } as any;
      },
    },
  };
});

// الآن نستطيع استيراد NextRequest من الموك (سيتم استيراد الحقيقية)
import { NextRequest } from "next/server";

// Mock باقي التبعيات
vi.mock("@/lib/api-auth", () => ({
  verifyApiKey: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { verifyApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";

// ========== اختبارات GET ==========
describe("GET /api/v1/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يرجع 401 لو مفيش مفتاح API صالح", async () => {
    vi.mocked(verifyApiKey).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("يرجع 200 مع قائمة المشاريع لو المفتاح صالح", async () => {
    vi.mocked(verifyApiKey).mockResolvedValue({ userId: "user-1" });

    const mockProjects = [
      {
        id: "1",
        name: "Project 1",
        description: "Desc 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Project 2",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as any);

    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      method: "GET",
      headers: { Authorization: "Bearer valid-key" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.projects).toHaveLength(2);
    expect(data.projects[0].name).toBe("Project 1");
  });
});

// ========== اختبارات POST ==========
describe("POST /api/v1/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يرجع 401 لو مفيش مفتاح صالح", async () => {
    vi.mocked(verifyApiKey).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "New Project" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("يرجع 400 لو الاسم ناقص", async () => {
    vi.mocked(verifyApiKey).mockResolvedValue({ userId: "user-1" });

    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Project name is required");
  });

  it("ينشئ مشروع جديد بنجاح ويرجع 201", async () => {
    vi.mocked(verifyApiKey).mockResolvedValue({ userId: "user-1" });

    vi.mocked(db.project.count).mockResolvedValue(2);
    vi.mocked(db.user.findUnique).mockResolvedValue({ plan: "BASIC" } as any);
    const newProject = {
      id: "new-id",
      name: "API Project",
      description: null,
      userId: "user-1",
    };
    vi.mocked(db.project.create).mockResolvedValue(newProject as any);

    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "API Project" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.project.name).toBe("API Project");
  });
});
