import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Empresas (Tenants) ────────────────────────────────────────────────────────
export const empresas = mysqlTable("empresas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  moeda: varchar("moeda", { length: 3 }).default("BRL").notNull(),
  fusoHorario: varchar("fusoHorario", { length: 64 }).default("America/Sao_Paulo").notNull(),
  limiteGastosMensal: decimal("limiteGastosMensal", { precision: 15, scale: 2 }),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = typeof empresas.$inferInsert;

// ─── Categorias ────────────────────────────────────────────────────────────────
export const categorias = mysqlTable("categorias", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  tipo: mysqlEnum("tipo", ["receita", "despesa", "ambos"]).default("ambos").notNull(),
  cor: varchar("cor", { length: 7 }).default("#DC2626").notNull(),
  icone: varchar("icone", { length: 50 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Categoria = typeof categorias.$inferSelect;
export type InsertCategoria = typeof categorias.$inferInsert;

// ─── Contas Bancárias ──────────────────────────────────────────────────────────
export const contas = mysqlTable("contas", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  tipo: mysqlEnum("tipo", ["corrente", "poupanca", "investimento", "cartao_credito", "outro"]).default("corrente").notNull(),
  banco: varchar("banco", { length: 100 }),
  agencia: varchar("agencia", { length: 20 }),
  numeroConta: varchar("numeroConta", { length: 30 }),
  saldoInicial: decimal("saldoInicial", { precision: 15, scale: 2 }).default("0").notNull(),
  cor: varchar("cor", { length: 7 }).default("#1a1a1a").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conta = typeof contas.$inferSelect;
export type InsertConta = typeof contas.$inferInsert;

// ─── Clientes ──────────────────────────────────────────────────────────────────
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  cpfCnpj: varchar("cpfCnpj", { length: 18 }),
  endereco: text("endereco"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

// ─── Transações ────────────────────────────────────────────────────────────────
export const transacoes = mysqlTable("transacoes", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  userId: int("userId").notNull(),
  contaId: int("contaId"),
  categoriaId: int("categoriaId"),
  clienteId: int("clienteId"),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  tipo: mysqlEnum("tipo", ["receita", "despesa"]).notNull(),
  status: mysqlEnum("status", ["pendente", "confirmado", "cancelado"]).default("confirmado").notNull(),
  data: varchar("data", { length: 10 }).notNull(),
  dataVencimento: varchar("dataVencimento", { length: 10 }),
  observacoes: text("observacoes"),
  recorrente: boolean("recorrente").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transacao = typeof transacoes.$inferSelect;
export type InsertTransacao = typeof transacoes.$inferInsert;
