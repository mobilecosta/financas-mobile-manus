CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status_transacao" AS ENUM('pendente', 'confirmado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."tipo_categoria" AS ENUM('receita', 'despesa', 'ambos');--> statement-breakpoint
CREATE TYPE "public"."tipo_conta" AS ENUM('corrente', 'poupanca', 'investimento', 'cartao_credito', 'outro');--> statement-breakpoint
CREATE TYPE "public"."tipo_transacao" AS ENUM('receita', 'despesa');--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresaId" integer NOT NULL,
	"nome" varchar(100) NOT NULL,
	"tipo" "tipo_categoria" DEFAULT 'ambos' NOT NULL,
	"cor" varchar(7) DEFAULT '#DC2626' NOT NULL,
	"icone" varchar(50),
	"ativo" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresaId" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(320),
	"telefone" varchar(20),
	"cpfCnpj" varchar(18),
	"endereco" text,
	"observacoes" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contas" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresaId" integer NOT NULL,
	"nome" varchar(100) NOT NULL,
	"tipo" "tipo_conta" DEFAULT 'corrente' NOT NULL,
	"banco" varchar(100),
	"agencia" varchar(20),
	"numeroConta" varchar(30),
	"saldoInicial" numeric(15, 2) DEFAULT '0' NOT NULL,
	"cor" varchar(7) DEFAULT '#1a1a1a' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"cnpj" varchar(18),
	"email" varchar(320),
	"telefone" varchar(20),
	"moeda" varchar(3) DEFAULT 'BRL' NOT NULL,
	"fusoHorario" varchar(64) DEFAULT 'America/Sao_Paulo' NOT NULL,
	"limiteGastosMensal" numeric(15, 2),
	"ownerId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresaId" integer NOT NULL,
	"userId" integer NOT NULL,
	"contaId" integer,
	"categoriaId" integer,
	"clienteId" integer,
	"descricao" varchar(500) NOT NULL,
	"valor" numeric(15, 2) NOT NULL,
	"tipo" "tipo_transacao" NOT NULL,
	"status" "status_transacao" DEFAULT 'confirmado' NOT NULL,
	"data" date NOT NULL,
	"dataVencimento" date,
	"observacoes" text,
	"recorrente" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(255) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
