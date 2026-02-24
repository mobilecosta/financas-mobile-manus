import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  date,
  serial,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const tipoCategoriaEnum = pgEnum("tipo_categoria", ["receita", "despesa", "ambos"]);
export const tipoContaEnum = pgEnum("tipo_conta", ["corrente", "poupanca", "investimento", "cartao_credito", "outro"]);
export const tipoTransacaoEnum = pgEnum("tipo_transacao", ["receita", "despesa"]);
export const statusTransacaoEnum = pgEnum("status_transacao", ["pendente", "confirmado", "cancelado"]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 255 }).notNull().unique(), // Aumentado para suportar UUID do Supabase
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Empresas (Tenants) ────────────────────────────────────────────────────────
export const empresas = pgTable("empresas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  moeda: varchar("moeda", { length: 3 }).default("BRL").notNull(),
  fusoHorario: varchar("fusoHorario", { length: 64 }).default("America/Sao_Paulo").notNull(),
  limiteGastosMensal: decimal("limiteGastosMensal", { precision: 15, scale: 2 }),
  ownerId: integer("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = typeof empresas.$inferInsert;

// ─── Categorias ────────────────────────────────────────────────────────────────
export const categorias = pgTable("categorias", {
  id: serial("id").primaryKey(),
  empresaId: integer("empresaId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  tipo: tipoCategoriaEnum("tipo").default("ambos").notNull(),
  cor: varchar("cor", { length: 7 }).default("#DC2626").notNull(),
  icone: varchar("icone", { length: 50 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Categoria = typeof categorias.$inferSelect;
export type InsertCategoria = typeof categorias.$inferInsert;

// ─── Contas Bancárias ──────────────────────────────────────────────────────────
export const contas = pgTable("contas", {
  id: serial("id").primaryKey(),
  empresaId: integer("empresaId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  tipo: tipoContaEnum("tipo").default("corrente").notNull(),
  banco: varchar("banco", { length: 100 }),
  agencia: varchar("agencia", { length: 20 }),
  numeroConta: varchar("numeroConta", { length: 30 }),
  saldoInicial: decimal("saldoInicial", { precision: 15, scale: 2 }).default("0").notNull(),
  cor: varchar("cor", { length: 7 }).default("#1a1a1a").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Conta = typeof contas.$inferSelect;
export type InsertConta = typeof contas.$inferInsert;

// ─── Clientes ──────────────────────────────────────────────────────────────────
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  empresaId: integer("empresaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  cpfCnpj: varchar("cpfCnpj", { length: 18 }),
  endereco: text("endereco"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

// ─── Transações ────────────────────────────────────────────────────────────────
export const transacoes = pgTable("transacoes", {
  id: serial("id").primaryKey(),
  empresaId: integer("empresaId").notNull(),
  userId: integer("userId").notNull(),
  contaId: integer("contaId"),
  categoriaId: integer("categoriaId"),
  clienteId: integer("clienteId"),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  tipo: tipoTransacaoEnum("tipo").notNull(),
  status: statusTransacaoEnum("status").default("confirmado").notNull(),
  data: date("data").notNull(),
  dataVencimento: date("dataVencimento"),
  observacoes: text("observacoes"),
  recorrente: boolean("recorrente").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Transacao = typeof transacoes.$inferSelect;
export type InsertTransacao = typeof transacoes.$inferInsert;
