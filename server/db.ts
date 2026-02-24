import { and, desc, eq, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  Categoria,
  Cliente,
  Conta,
  Empresa,
  InsertCategoria,
  InsertCliente,
  InsertConta,
  InsertEmpresa,
  InsertTransacao,
  InsertUser,
  Transacao,
  categorias,
  clientes,
  contas,
  empresas,
  transacoes,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const queryClient = postgres(process.env.DATABASE_URL);
      _db = drizzle(queryClient);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  
  const values: InsertUser = { 
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    lastSignedIn: user.lastSignedIn ?? new Date(),
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user")
  };

  await db.insert(users).values(values).onConflictDoUpdate({
    target: users.openId,
    set: {
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      lastSignedIn: values.lastSignedIn,
      role: values.role,
      updatedAt: new Date()
    }
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Empresas ─────────────────────────────────────────────────────────────────
export async function getEmpresaByOwner(ownerId: number): Promise<Empresa | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(empresas).where(eq(empresas.ownerId, ownerId)).limit(1);
  return result[0];
}

export async function createEmpresa(data: InsertEmpresa): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(empresas).values(data).returning({ id: empresas.id });
  return result[0].id;
}

export async function updateEmpresa(id: number, data: Partial<InsertEmpresa>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(empresas).set({ ...data, updatedAt: new Date() }).where(eq(empresas.id, id));
}

// ─── Categorias ───────────────────────────────────────────────────────────────
export async function getCategoriasByEmpresa(empresaId: number): Promise<Categoria[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categorias).where(and(eq(categorias.empresaId, empresaId), eq(categorias.ativo, true)));
}

export async function createCategoria(data: InsertCategoria): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(categorias).values(data).returning({ id: categorias.id });
  return result[0].id;
}

export async function updateCategoria(id: number, empresaId: number, data: Partial<InsertCategoria>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(categorias).set(data).where(and(eq(categorias.id, id), eq(categorias.empresaId, empresaId)));
}

export async function deleteCategoria(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(categorias).set({ ativo: false }).where(and(eq(categorias.id, id), eq(categorias.empresaId, empresaId)));
}

// ─── Contas ───────────────────────────────────────────────────────────────────
export async function getContasByEmpresa(empresaId: number): Promise<Conta[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contas).where(and(eq(contas.empresaId, empresaId), eq(contas.ativo, true)));
}

export async function createConta(data: InsertConta): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(contas).values(data).returning({ id: contas.id });
  return result[0].id;
}

export async function updateConta(id: number, empresaId: number, data: Partial<InsertConta>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(contas).set({ ...data, updatedAt: new Date() }).where(and(eq(contas.id, id), eq(contas.empresaId, empresaId)));
}

export async function deleteConta(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(contas).set({ ativo: false, updatedAt: new Date() }).where(and(eq(contas.id, id), eq(contas.empresaId, empresaId)));
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export async function getClientesByEmpresa(empresaId: number): Promise<Cliente[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientes).where(and(eq(clientes.empresaId, empresaId), eq(clientes.ativo, true)));
}

export async function createCliente(data: InsertCliente): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(clientes).values(data).returning({ id: clientes.id });
  return result[0].id;
}

export async function updateCliente(id: number, empresaId: number, data: Partial<InsertCliente>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(clientes).set({ ...data, updatedAt: new Date() }).where(and(eq(clientes.id, id), eq(clientes.empresaId, empresaId)));
}

export async function deleteCliente(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(clientes).set({ ativo: false, updatedAt: new Date() }).where(and(eq(clientes.id, id), eq(clientes.empresaId, empresaId)));
}

// ─── Transações ───────────────────────────────────────────────────────────────
export async function getTransacoesByEmpresa(
  empresaId: number,
  filters?: {
    tipo?: "receita" | "despesa";
    categoriaId?: number;
    contaId?: number;
    clienteId?: number;
    dataInicio?: string;
    dataFim?: string;
    status?: "pendente" | "confirmado" | "cancelado";
    limit?: number;
    offset?: number;
  }
): Promise<Transacao[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(transacoes.empresaId, empresaId)];
  if (filters?.tipo) conditions.push(eq(transacoes.tipo, filters.tipo));
  if (filters?.categoriaId) conditions.push(eq(transacoes.categoriaId, filters.categoriaId));
  if (filters?.contaId) conditions.push(eq(transacoes.contaId, filters.contaId));
  if (filters?.clienteId) conditions.push(eq(transacoes.clienteId, filters.clienteId));
  if (filters?.status) conditions.push(eq(transacoes.status, filters.status));
  if (filters?.dataInicio) conditions.push(sql`${transacoes.data} >= ${filters.dataInicio}`);
  if (filters?.dataFim) conditions.push(sql`${transacoes.data} <= ${filters.dataFim}`);
  
  const query = db
    .select()
    .from(transacoes)
    .where(and(...conditions))
    .orderBy(desc(transacoes.data), desc(transacoes.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);
  return query;
}

export async function countTransacoesByEmpresa(
  empresaId: number,
  filters?: { tipo?: "receita" | "despesa"; categoriaId?: number; contaId?: number; dataInicio?: string; dataFim?: string; status?: "pendente" | "confirmado" | "cancelado" }
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const conditions = [eq(transacoes.empresaId, empresaId)];
  if (filters?.tipo) conditions.push(eq(transacoes.tipo, filters.tipo));
  if (filters?.categoriaId) conditions.push(eq(transacoes.categoriaId, filters.categoriaId));
  if (filters?.contaId) conditions.push(eq(transacoes.contaId, filters.contaId));
  if (filters?.status) conditions.push(eq(transacoes.status, filters.status));
  if (filters?.dataInicio) conditions.push(sql`${transacoes.data} >= ${filters.dataInicio}`);
  if (filters?.dataFim) conditions.push(sql`${transacoes.data} <= ${filters.dataFim}`);
  const result = await db.select({ count: sql<number>`count(*)` }).from(transacoes).where(and(...conditions));
  return Number(result[0]?.count ?? 0);
}

export async function createTransacao(data: InsertTransacao): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(transacoes).values(data).returning({ id: transacoes.id });
  return result[0].id;
}

export async function updateTransacao(id: number, empresaId: number, data: Partial<InsertTransacao>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(transacoes).set({ ...data, updatedAt: new Date() }).where(and(eq(transacoes.id, id), eq(transacoes.empresaId, empresaId)));
}

export async function deleteTransacao(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(transacoes).where(and(eq(transacoes.id, id), eq(transacoes.empresaId, empresaId)));
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export async function getDashboardMetrics(empresaId: number) {
  const db = await getDb();
  if (!db) return { receitas: 0, despesas: 0, saldo: 0, pendentes: 0 };

  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

  const [receitasResult, despesasResult, pendentesResult] = await Promise.all([
    db
      .select({ total: sum(transacoes.valor) })
      .from(transacoes)
      .where(and(eq(transacoes.empresaId, empresaId), eq(transacoes.tipo, "receita"), eq(transacoes.status, "confirmado"), sql`${transacoes.data} >= ${firstDay}`, sql`${transacoes.data} <= ${lastDay}`)),
    db
      .select({ total: sum(transacoes.valor) })
      .from(transacoes)
      .where(and(eq(transacoes.empresaId, empresaId), eq(transacoes.tipo, "despesa"), eq(transacoes.status, "confirmado"), sql`${transacoes.data} >= ${firstDay}`, sql`${transacoes.data} <= ${lastDay}`)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(transacoes)
      .where(and(eq(transacoes.empresaId, empresaId), eq(transacoes.status, "pendente"))),
  ]);

  const receitas = Number(receitasResult[0]?.total ?? 0);
  const despesas = Number(despesasResult[0]?.total ?? 0);
  const pendentes = Number(pendentesResult[0]?.count ?? 0);

  return { receitas, despesas, saldo: receitas - despesas, pendentes };
}

export async function getMonthlyEvolution(empresaId: number, months = 6) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      mes: sql<string>`to_char(data, 'YYYY-MM')`,
      tipo: transacoes.tipo,
      total: sum(transacoes.valor),
    })
    .from(transacoes)
    .where(and(eq(transacoes.empresaId, empresaId), eq(transacoes.status, "confirmado"), sql`${transacoes.data} >= date_trunc('month', now() - interval '${months} months')`))
    .groupBy(sql`to_char(data, 'YYYY-MM')`, transacoes.tipo)
    .orderBy(sql`to_char(data, 'YYYY-MM')`);
  return result;
}

export async function getCategoryDistribution(empresaId: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const result = await db
    .select({
      categoriaId: transacoes.categoriaId,
      categoriaNome: categorias.nome,
      categoriaCor: categorias.cor,
      tipo: transacoes.tipo,
      total: sum(transacoes.valor),
    })
    .from(transacoes)
    .leftJoin(categorias, eq(transacoes.categoriaId, categorias.id))
    .where(and(eq(transacoes.empresaId, empresaId), eq(transacoes.status, "confirmado"), sql`${transacoes.data} >= ${firstDay}`))
    .groupBy(transacoes.categoriaId, categorias.nome, categorias.cor, transacoes.tipo);
  return result;
}

export async function getContaSaldos(empresaId: number) {
  const db = await getDb();
  if (!db) return [];
  const contasList = await getContasByEmpresa(empresaId);
  const saldos = await Promise.all(
    contasList.map(async (conta) => {
      const [rec, desp] = await Promise.all([
        db.select({ total: sum(transacoes.valor) }).from(transacoes).where(and(eq(transacoes.empresaId, empresaId), eq(transacoes.contaId, conta.id), eq(transacoes.tipo, "receita"), eq(transacoes.status, "confirmado"))),
        db.select({ total: sum(transacoes.valor) }).from(transacoes).where(and(eq(transacoes.empresaId, empresaId), eq(transacoes.contaId, conta.id), eq(transacoes.tipo, "despesa"), eq(transacoes.status, "confirmado"))),
      ]);
      const saldoAtual = Number(conta.saldoInicial) + Number(rec[0]?.total ?? 0) - Number(desp[0]?.total ?? 0);
      return { ...conta, saldoAtual };
    })
  );
  return saldos;
}
