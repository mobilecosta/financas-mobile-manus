import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import {
  createCategoria,
  createCliente,
  createConta,
  createEmpresa,
  createTransacao,
  deleteCategoria,
  deleteCliente,
  deleteConta,
  deleteTransacao,
  getCategoriasByEmpresa,
  getCategoryDistribution,
  getClientesByEmpresa,
  getContaSaldos,
  getContasByEmpresa,
  getDashboardMetrics,
  getEmpresaByOwner,
  getMonthlyEvolution,
  getTransacoesByEmpresa,
  countTransacoesByEmpresa,
  updateCategoria,
  updateCliente,
  updateConta,
  updateEmpresa,
  updateTransacao,
} from "./db";

// ─── Helper: get or create empresa for current user ───────────────────────────
async function getOrCreateEmpresa(userId: number, userName?: string | null) {
  let empresa = await getEmpresaByOwner(userId);
  if (!empresa) {
    const id = await createEmpresa({
      nome: userName ? `Empresa de ${userName}` : "Minha Empresa",
      ownerId: userId,
    });
    empresa = await getEmpresaByOwner(userId);
    if (!empresa) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao criar empresa" });
    // Seed default categories
    const defaultCats = [
      { nome: "Salário", tipo: "receita" as const, cor: "#16a34a" },
      { nome: "Freelance", tipo: "receita" as const, cor: "#2563eb" },
      { nome: "Investimentos", tipo: "receita" as const, cor: "#7c3aed" },
      { nome: "Alimentação", tipo: "despesa" as const, cor: "#dc2626" },
      { nome: "Transporte", tipo: "despesa" as const, cor: "#ea580c" },
      { nome: "Moradia", tipo: "despesa" as const, cor: "#ca8a04" },
      { nome: "Saúde", tipo: "despesa" as const, cor: "#0891b2" },
      { nome: "Lazer", tipo: "despesa" as const, cor: "#db2777" },
      { nome: "Outros", tipo: "ambos" as const, cor: "#6b7280" },
    ];
    await Promise.all(defaultCats.map((c) => createCategoria({ ...c, empresaId: empresa!.id })));
  }
  return empresa;
}

// ─── Empresa Router ───────────────────────────────────────────────────────────
const empresaRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateEmpresa(ctx.user.id, ctx.user.name);
  }),
  update: protectedProcedure
    .input(z.object({
      nome: z.string().min(1).optional(),
      cnpj: z.string().optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
      moeda: z.string().length(3).optional(),
      limiteGastosMensal: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      await updateEmpresa(empresa.id, input as any);
      return { success: true };
    }),
});

// ─── Categorias Router ────────────────────────────────────────────────────────
const categoriasRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
    return getCategoriasByEmpresa(empresa.id);
  }),
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      tipo: z.enum(["receita", "despesa", "ambos"]),
      cor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      icone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const id = await createCategoria({ ...input, empresaId: empresa.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      tipo: z.enum(["receita", "despesa", "ambos"]).optional(),
      cor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const { id, ...data } = input;
      await updateCategoria(id, empresa.id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      await deleteCategoria(input.id, empresa.id);
      return { success: true };
    }),
});

// ─── Contas Router ────────────────────────────────────────────────────────────
const contasRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
    return getContaSaldos(empresa.id);
  }),
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      tipo: z.enum(["corrente", "poupanca", "investimento", "cartao_credito", "outro"]),
      banco: z.string().optional(),
      agencia: z.string().optional(),
      numeroConta: z.string().optional(),
      saldoInicial: z.string().optional(),
      cor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const id = await createConta({ ...input, empresaId: empresa.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      tipo: z.enum(["corrente", "poupanca", "investimento", "cartao_credito", "outro"]).optional(),
      banco: z.string().optional(),
      agencia: z.string().optional(),
      numeroConta: z.string().optional(),
      saldoInicial: z.string().optional(),
      cor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const { id, ...data } = input;
      await updateConta(id, empresa.id, data as any);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      await deleteConta(input.id, empresa.id);
      return { success: true };
    }),
});

// ─── Clientes Router ──────────────────────────────────────────────────────────
const clientesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
    return getClientesByEmpresa(empresa.id);
  }),
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
      cpfCnpj: z.string().optional(),
      endereco: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const id = await createCliente({ ...input, empresaId: empresa.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
      cpfCnpj: z.string().optional(),
      endereco: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const { id, ...data } = input;
      await updateCliente(id, empresa.id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      await deleteCliente(input.id, empresa.id);
      return { success: true };
    }),
});

// ─── Transações Router ────────────────────────────────────────────────────────
const transacoesRouter = router({
  list: protectedProcedure
    .input(z.object({
      tipo: z.enum(["receita", "despesa"]).optional(),
      categoriaId: z.number().optional(),
      contaId: z.number().optional(),
      clienteId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      status: z.enum(["pendente", "confirmado", "cancelado"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const [items, total] = await Promise.all([
        getTransacoesByEmpresa(empresa.id, input ?? {}),
        countTransacoesByEmpresa(empresa.id, input ?? {}),
      ]);
      return { items, total };
    }),
  create: protectedProcedure
    .input(z.object({
      descricao: z.string().min(1),
      valor: z.string(),
      tipo: z.enum(["receita", "despesa"]),
      data: z.string(),
      categoriaId: z.number().optional(),
      contaId: z.number().optional(),
      clienteId: z.number().optional(),
      status: z.enum(["pendente", "confirmado", "cancelado"]).optional(),
      observacoes: z.string().optional(),
      recorrente: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const id = await createTransacao({
        ...input,
        empresaId: empresa.id,
        userId: ctx.user.id,
        status: input.status ?? "confirmado",
      });

      // Notify owner for significant transactions
      const valorNum = parseFloat(input.valor);
      if (valorNum >= 1000) {
        await notifyOwner({
          title: `Nova transação: ${input.tipo === "receita" ? "Receita" : "Despesa"} de R$ ${valorNum.toFixed(2)}`,
          content: `Transação registrada: "${input.descricao}" — R$ ${valorNum.toFixed(2)} (${input.tipo}) em ${input.data}.`,
        }).catch(() => {});
      }

      // Check spending limit
      if (input.tipo === "despesa" && empresa.limiteGastosMensal) {
        const metrics = await getDashboardMetrics(empresa.id);
        const limite = parseFloat(String(empresa.limiteGastosMensal));
        if (metrics.despesas >= limite * 0.9) {
          await notifyOwner({
            title: "⚠️ Alerta: Limite de gastos próximo",
            content: `Despesas do mês atingiram R$ ${metrics.despesas.toFixed(2)} (${((metrics.despesas / limite) * 100).toFixed(0)}% do limite de R$ ${limite.toFixed(2)}).`,
          }).catch(() => {});
        }
      }

      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      descricao: z.string().min(1).optional(),
      valor: z.string().optional(),
      tipo: z.enum(["receita", "despesa"]).optional(),
      data: z.string().optional(),
      categoriaId: z.number().optional(),
      contaId: z.number().optional(),
      clienteId: z.number().optional(),
      status: z.enum(["pendente", "confirmado", "cancelado"]).optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      const { id, ...data } = input;
      await updateTransacao(id, empresa.id, data as any);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      await deleteTransacao(input.id, empresa.id);
      return { success: true };
    }),
});

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  metrics: protectedProcedure.query(async ({ ctx }) => {
    const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
    return getDashboardMetrics(empresa.id);
  }),
  monthlyEvolution: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(24).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
      return getMonthlyEvolution(empresa.id, input?.months ?? 6);
    }),
  categoryDistribution: protectedProcedure.query(async ({ ctx }) => {
    const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
    return getCategoryDistribution(empresa.id);
  }),
  recentTransactions: protectedProcedure.query(async ({ ctx }) => {
    const empresa = await getOrCreateEmpresa(ctx.user.id, ctx.user.name);
    const { items } = await getTransacoesByEmpresa(empresa.id, { limit: 5 }).then(items => ({ items }));
    return items;
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  empresa: empresaRouter,
  categorias: categoriasRouter,
  contas: contasRouter,
  clientes: clientesRouter,
  transacoes: transacoesRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
