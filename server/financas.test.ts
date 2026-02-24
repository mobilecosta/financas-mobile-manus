import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });

  it("auth.me returns null for unauthenticated context", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });
});

// ─── Input Validation Tests ───────────────────────────────────────────────────
describe("transacoes.create input validation", () => {
  it("rejects empty descricao", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.transacoes.create({
        descricao: "",
        valor: "100.00",
        tipo: "receita",
        data: "2026-01-01",
        status: "confirmado",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid tipo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.transacoes.create({
        descricao: "Test",
        valor: "100.00",
        tipo: "invalido" as any,
        data: "2026-01-01",
        status: "confirmado",
      })
    ).rejects.toThrow();
  });
});

describe("categorias.create input validation", () => {
  it("rejects empty nome", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.categorias.create({
        nome: "",
        tipo: "despesa",
        cor: "#dc2626",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid hex color", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.categorias.create({
        nome: "Test",
        tipo: "despesa",
        cor: "not-a-color",
      })
    ).rejects.toThrow();
  });
});

describe("contas.create input validation", () => {
  it("rejects empty nome", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contas.create({
        nome: "",
        tipo: "corrente",
      })
    ).rejects.toThrow();
  });
});

describe("clientes.create input validation", () => {
  it("rejects invalid email format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientes.create({
        nome: "Test Cliente",
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });

  it("accepts valid client without email (validation passes)", async () => {
    // This test validates that email is optional at the schema level
    // The mutation may succeed or fail at DB level, but should NOT fail at validation
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw a ZodError — only DB or internal errors are acceptable
    try {
      await caller.clientes.create({ nome: "Valid Client" });
      // If it succeeds, that's fine too
    } catch (err: any) {
      // Must not be a validation error
      expect(err?.message ?? "").not.toMatch(/invalid_type|Required|ZodError/);
    }
  });
});
