CREATE TABLE `categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`tipo` enum('receita','despesa','ambos') NOT NULL DEFAULT 'ambos',
	`cor` varchar(7) NOT NULL DEFAULT '#DC2626',
	`icone` varchar(50),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`cpfCnpj` varchar(18),
	`endereco` text,
	`observacoes` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`tipo` enum('corrente','poupanca','investimento','cartao_credito','outro') NOT NULL DEFAULT 'corrente',
	`banco` varchar(100),
	`agencia` varchar(20),
	`numeroConta` varchar(30),
	`saldoInicial` decimal(15,2) NOT NULL DEFAULT '0',
	`cor` varchar(7) NOT NULL DEFAULT '#1a1a1a',
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(18),
	`email` varchar(320),
	`telefone` varchar(20),
	`moeda` varchar(3) NOT NULL DEFAULT 'BRL',
	`fusoHorario` varchar(64) NOT NULL DEFAULT 'America/Sao_Paulo',
	`limiteGastosMensal` decimal(15,2),
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`userId` int NOT NULL,
	`contaId` int,
	`categoriaId` int,
	`clienteId` int,
	`descricao` varchar(500) NOT NULL,
	`valor` decimal(15,2) NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`status` enum('pendente','confirmado','cancelado') NOT NULL DEFAULT 'confirmado',
	`data` date NOT NULL,
	`dataVencimento` date,
	`observacoes` text,
	`recorrente` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transacoes_id` PRIMARY KEY(`id`)
);
