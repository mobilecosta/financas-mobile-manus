import { PrismaClient } from "@prisma/client";
import type {
  Categoria,
  Cliente,
  Conta,
  Empresa,
  Transacao,
  User,
} from "@prisma/client";
import { ENV } from "./_core/env";

let _db: PrismaClient | null = null;

export async function getDb() {
  if (!_db) {
    try {
      _db = new PrismaClient();
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
  role?: "user" | "admin";
}): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");

  await db.user.upsert({
    where: { openId: user.openId },
    update: {
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      loginMethod: user.loginMethod ?? undefined,
      lastSignedIn: user.lastSignedIn ?? new Date(),
      role,
    },
    create: {
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: user.lastSignedIn ?? new Date(),
      role,
    },
  });
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  return db.user.findUnique({ where: { openId } });
}

// ─── Empresas ─────────────────────────────────────────────────────────────────
export async function getEmpresaByOwner(ownerId: number): Promise<Empresa | null> {
  const db = await getDb();
  if (!db) return null;
  return db.empresa.findFirst({ where: { ownerId } });
}

export async function createEmpresa(data: {
  nome: string;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  moeda?: string;
  fusoHorario?: string;
  limiteGastosMensal?: any;
  ownerId: number;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.empresa.create({ data });
  return result.id;
}

export async function updateEmpresa(
  id: number,
  data: Partial<{
    nome: string;
    cnpj: string | null;
    email: string | null;
    telefone: string | null;
    moeda: string;
    fusoHorario: string;
    limiteGastosMensal: any;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.empresa.update({ where: { id }, data });
}

// ─── Categorias ───────────────────────────────────────────────────────────────
export async function getCategoriasByEmpresa(empresaId: number): Promise<Categoria[]> {
  const db = await getDb();
  if (!db) return [];
  return db.categoria.findMany({
    where: { empresaId, ativo: true },
  });
}

export async function createCategoria(data: {
  empresaId: number;
  nome: string;
  tipo?: "receita" | "despesa" | "ambos";
  cor?: string;
  icone?: string | null;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.categoria.create({ data });
  return result.id;
}

export async function updateCategoria(
  id: number,
  empresaId: number,
  data: Partial<{
    nome: string;
    tipo: "receita" | "despesa" | "ambos";
    cor: string;
    icone: string | null;
    ativo: boolean;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.categoria.update({
    where: { id },
    data,
  });
}

export async function deleteCategoria(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.categoria.update({
    where: { id },
    data: { ativo: false },
  });
}

// ─── Contas ───────────────────────────────────────────────────────────────────
export async function getContasByEmpresa(empresaId: number): Promise<Conta[]> {
  const db = await getDb();
  if (!db) return [];
  return db.conta.findMany({
    where: { empresaId, ativo: true },
  });
}

export async function createConta(data: {
  empresaId: number;
  nome: string;
  tipo?: "corrente" | "poupanca" | "investimento" | "cartao_credito" | "outro";
  banco?: string | null;
  agencia?: string | null;
  numeroConta?: string | null;
  saldoInicial?: any;
  cor?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.conta.create({ data });
  return result.id;
}

export async function updateConta(
  id: number,
  empresaId: number,
  data: Partial<{
    nome: string;
    tipo: "corrente" | "poupanca" | "investimento" | "cartao_credito" | "outro";
    banco: string | null;
    agencia: string | null;
    numeroConta: string | null;
    saldoInicial: any;
    cor: string;
    ativo: boolean;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.conta.update({
    where: { id },
    data,
  });
}

export async function deleteConta(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.conta.update({
    where: { id },
    data: { ativo: false },
  });
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export async function getClientesByEmpresa(empresaId: number): Promise<Cliente[]> {
  const db = await getDb();
  if (!db) return [];
  return db.cliente.findMany({
    where: { empresaId, ativo: true },
  });
}

export async function createCliente(data: {
  empresaId: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cpfCnpj?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.cliente.create({ data });
  return result.id;
}

export async function updateCliente(
  id: number,
  empresaId: number,
  data: Partial<{
    nome: string;
    email: string | null;
    telefone: string | null;
    cpfCnpj: string | null;
    endereco: string | null;
    observacoes: string | null;
    ativo: boolean;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.cliente.update({
    where: { id },
    data,
  });
}

export async function deleteCliente(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.cliente.update({
    where: { id },
    data: { ativo: false },
  });
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

  const where: any = { empresaId };
  if (filters?.tipo) where.tipo = filters.tipo;
  if (filters?.categoriaId) where.categoriaId = filters.categoriaId;
  if (filters?.contaId) where.contaId = filters.contaId;
  if (filters?.clienteId) where.clienteId = filters.clienteId;
  if (filters?.status) where.status = filters.status;

  if (filters?.dataInicio || filters?.dataFim) {
    where.data = {};
    if (filters?.dataInicio) where.data.gte = new Date(filters.dataInicio);
    if (filters?.dataFim) where.data.lte = new Date(filters.dataFim);
  }

  return db.transacao.findMany({
    where,
    orderBy: [{ data: "desc" }, { createdAt: "desc" }],
    take: filters?.limit ?? 50,
    skip: filters?.offset ?? 0,
  });
}

export async function countTransacoesByEmpresa(
  empresaId: number,
  filters?: {
    tipo?: "receita" | "despesa";
    categoriaId?: number;
    contaId?: number;
    dataInicio?: string;
    dataFim?: string;
    status?: "pendente" | "confirmado" | "cancelado";
  }
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const where: any = { empresaId };
  if (filters?.tipo) where.tipo = filters.tipo;
  if (filters?.categoriaId) where.categoriaId = filters.categoriaId;
  if (filters?.contaId) where.contaId = filters.contaId;
  if (filters?.status) where.status = filters.status;

  if (filters?.dataInicio || filters?.dataFim) {
    where.data = {};
    if (filters?.dataInicio) where.data.gte = new Date(filters.dataInicio);
    if (filters?.dataFim) where.data.lte = new Date(filters.dataFim);
  }

  return db.transacao.count({ where });
}

export async function createTransacao(data: {
  empresaId: number;
  userId: number;
  descricao: string;
  valor: any;
  tipo: "receita" | "despesa";
  data: Date;
  contaId?: number | null;
  categoriaId?: number | null;
  clienteId?: number | null;
  status?: "pendente" | "confirmado" | "cancelado";
  dataVencimento?: Date | null;
  observacoes?: string | null;
  recorrente?: boolean;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.transacao.create({ data });
  return result.id;
}

export async function updateTransacao(
  id: number,
  empresaId: number,
  data: Partial<{
    descricao: string;
    valor: any;
    tipo: "receita" | "despesa";
    data: Date;
    contaId: number | null;
    categoriaId: number | null;
    clienteId: number | null;
    status: "pendente" | "confirmado" | "cancelado";
    dataVencimento: Date | null;
    observacoes: string | null;
    recorrente: boolean;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.transacao.update({
    where: { id },
    data,
  });
}

export async function deleteTransacao(id: number, empresaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.transacao.delete({
    where: { id },
  });
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export async function getDashboardMetrics(empresaId: number) {
  const db = await getDb();
  if (!db) return { receitas: 0, despesas: 0, saldo: 0, pendentes: 0 };

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [receitasResult, despesasResult, pendentesResult] = await Promise.all([
    db.transacao.aggregate({
      where: {
        empresaId,
        tipo: "receita",
        status: "confirmado",
        data: { gte: firstDay, lte: lastDay },
      },
      _sum: { valor: true },
    }),
    db.transacao.aggregate({
      where: {
        empresaId,
        tipo: "despesa",
        status: "confirmado",
        data: { gte: firstDay, lte: lastDay },
      },
      _sum: { valor: true },
    }),
    db.transacao.count({
      where: {
        empresaId,
        status: "pendente",
      },
    }),
  ]);

  const receitas = Number(receitasResult._sum.valor ?? 0);
  const despesas = Number(despesasResult._sum.valor ?? 0);
  const pendentes = pendentesResult;

  return { receitas, despesas, saldo: receitas - despesas, pendentes };
}

export async function getMonthlyEvolution(empresaId: number, months = 6) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const transacoes = await db.transacao.findMany({
    where: {
      empresaId,
      status: "confirmado",
      data: { gte: startDate },
    },
    select: {
      data: true,
      tipo: true,
      valor: true,
    },
  });

  // Agrupar por mês e tipo
  const grouped: Record<string, Record<string, number>> = {};
  for (const t of transacoes) {
    const mes = t.data.toISOString().substring(0, 7); // YYYY-MM
    if (!grouped[mes]) grouped[mes] = { receita: 0, despesa: 0 };
    grouped[mes][t.tipo] += Number(t.valor);
  }

  return Object.entries(grouped).map(([mes, totals]) => ({
    mes,
    receita: totals.receita,
    despesa: totals.despesa,
  }));
}

export async function getCategoryDistribution(empresaId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const transacoes = await db.transacao.findMany({
    where: {
      empresaId,
      status: "confirmado",
      data: { gte: firstDay },
    },
    include: {
      categoria: true,
    },
  });

  // Agrupar por categoria
  const grouped: Record<
    number,
    {
      categoriaId: number | null;
      categoriaNome: string | null;
      categoriaCor: string | null;
      receita: number;
      despesa: number;
    }
  > = {};

  for (const t of transacoes) {
    const catId = t.categoriaId ?? 0;
    if (!grouped[catId]) {
      grouped[catId] = {
        categoriaId: t.categoriaId,
        categoriaNome: t.categoria?.nome ?? null,
        categoriaCor: t.categoria?.cor ?? null,
        receita: 0,
        despesa: 0,
      };
    }
    if (t.tipo === "receita") {
      grouped[catId].receita += Number(t.valor);
    } else {
      grouped[catId].despesa += Number(t.valor);
    }
  }

  return Object.values(grouped);
}

export async function getContaSaldos(empresaId: number) {
  const db = await getDb();
  if (!db) return [];

  const contas = await getContasByEmpresa(empresaId);

  const saldos = await Promise.all(
    contas.map(async (conta) => {
      const [receitasResult, despesasResult] = await Promise.all([
        db.transacao.aggregate({
          where: {
            empresaId,
            contaId: conta.id,
            tipo: "receita",
            status: "confirmado",
          },
          _sum: { valor: true },
        }),
        db.transacao.aggregate({
          where: {
            empresaId,
            contaId: conta.id,
            tipo: "despesa",
            status: "confirmado",
          },
          _sum: { valor: true },
        }),
      ]);

      const receitas = Number(receitasResult._sum.valor ?? 0);
      const despesas = Number(despesasResult._sum.valor ?? 0);
      const saldoAtual = Number(conta.saldoInicial) + receitas - despesas;

      return { ...conta, saldoAtual };
    })
  );

  return saldos;
}
