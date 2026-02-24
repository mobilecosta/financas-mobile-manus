# Finanças Mobile — Controle Financeiro Empresarial

Uma plataforma moderna e profissional de gestão financeira multi-tenant, desenvolvida com **React 19 + Vite + TypeScript**, **Express + tRPC**, **Tailwind CSS 4** e **Drizzle ORM**. Implementa o **Estilo Tipográfico Internacional (Swiss Style)** com design limpo, assimétrico e funcional.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-22.13.0-green.svg)
![React](https://img.shields.io/badge/react-19.2.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue.svg)

---

## 🎯 Funcionalidades Principais

### Dashboard & Métricas
- **Dashboard em tempo real** com cards de saldo, receitas, despesas e transações pendentes
- **Gráficos interativos** de evolução mensal e distribuição por categoria
- **Resumo de transações recentes** com status visual

### Gestão de Transações
- **Tabela filtrada** por data, categoria, tipo (receita/despesa), conta e status
- **Modal de criação/edição** com validação em tempo real
- **Sistema de categorias** com cores personalizadas
- **Paginação** e ordenação automática

### Contas Bancárias
- **Listagem de contas** com saldo calculado em tempo real
- **Histórico de transações** por conta
- **Modal de criação/edição** com tipos de conta (corrente, poupança, etc.)

### Gestão de Clientes
- **Cadastro completo** com informações de contato
- **Histórico de transações** por cliente
- **Filtros e busca** rápida

### Relatórios Financeiros
- **Evolução mensal** de receitas e despesas (3, 6 ou 12 meses)
- **Distribuição por categoria** com gráficos de pizza e ranking
- **Exportação em PDF** com tabelas e gráficos formatados
- **Download direto** para compartilhamento

### Configurações
- **Perfil do usuário** com informações de autenticação
- **Gestão de empresa** (nome, CNPJ, email, telefone, moeda)
- **Limite de gastos mensal** com alertas automáticos
- **Criação e edição de categorias** com cores personalizadas

### Autenticação & Multi-tenant
- **Manus OAuth** com suporte a email/senha e Google OAuth
- **Isolamento total de dados** por empresa (tenant)
- **Controle de acesso** baseado em roles (admin/user)
- **Notificações automáticas** ao proprietário para transações importantes

### Design & UX
- **Estilo Tipográfico Internacional (Swiss Style)**
  - Fundo branco puro, acentos em quadrados vermelhos vibrantes
  - Tipografia IBM Plex Sans sans-serif preta nítida
  - Linhas divisórias pretas finas e amplo espaço negativo
  - Layout assimétrico baseado em grade matemática
- **Sidebar responsiva** com menu colapsável para mobile
- **Design mobile-first** com breakpoints otimizados
- **Modo claro** com contraste acessível

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** — UI library moderna
- **Vite 7** — Build tool rápido e otimizado
- **TypeScript 5.9** — Type safety
- **Tailwind CSS 4** — Utility-first styling
- **Shadcn/UI** — Componentes acessíveis e customizáveis
- **Recharts** — Gráficos interativos
- **Wouter** — Roteamento leve
- **React Hook Form + Zod** — Validação de formulários
- **Sonner** — Toast notifications

### Backend
- **Express 4** — Web framework
- **tRPC 11** — Type-safe API
- **Drizzle ORM** — Query builder type-safe
- **MySQL/TiDB** — Banco de dados relacional
- **Jose** — JWT handling
- **Superjson** — Serialização de tipos complexos

### Desenvolvimento
- **Vitest** — Unit testing framework
- **Prettier** — Code formatter
- **TypeScript** — Type checking
- **ESBuild** — Bundler otimizado

---

## 📋 Requisitos

- **Node.js** 22.13.0 ou superior
- **pnpm** 10.4.1 ou superior
- **MySQL 8.0** ou **TiDB** (banco de dados)
- **Conta Manus** com OAuth configurado

---

## 🚀 Instalação & Desenvolvimento Local

### 1. Clonar o Repositório

```bash
git clone https://github.com/mobilecosta/financas-mobile-manus.git
cd financas-mobile
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/financas_mobile

# Manus OAuth
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Owner Info
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### 4. Executar Migrações do Banco de Dados

```bash
pnpm db:push
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O aplicativo estará disponível em: **http://localhost:3000**

---

## 📦 Estrutura do Projeto

```
financas-mobile/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                  # Páginas (Home, Dashboard, Transactions, etc.)
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── contexts/               # React contexts (Theme, Auth)
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilitários (tRPC client, etc.)
│   │   ├── index.css               # Estilos globais (Swiss Style)
│   │   └── App.tsx                 # Rotas principais
│   ├── public/                     # Assets estáticos
│   └── index.html                  # HTML template
├── server/
│   ├── routers.ts                  # Procedures tRPC
│   ├── db.ts                       # Helpers de banco de dados
│   ├── _core/                      # Infraestrutura (Auth, OAuth, etc.)
│   └── *.test.ts                   # Testes unitários
├── drizzle/
│   ├── schema.ts                   # Definição de tabelas
│   └── migrations/                 # Migrações do banco
├── shared/                         # Código compartilhado
├── storage/                        # Helpers de S3
├── package.json                    # Dependências e scripts
├── tsconfig.json                   # Configuração TypeScript
├── tailwind.config.js              # Configuração Tailwind
├── vite.config.ts                  # Configuração Vite
└── vercel.json                     # Configuração Vercel
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

**users** — Usuários autenticados via Manus OAuth
```sql
id (PK) | openId (UNIQUE) | name | email | role | createdAt | updatedAt | lastSignedIn
```

**empresas** — Tenants (empresas/organizações)
```sql
id (PK) | ownerId (FK) | nome | cnpj | email | telefone | moeda | limiteGastosMensal | createdAt | updatedAt
```

**categorias** — Categorias de transações
```sql
id (PK) | empresaId (FK) | nome | tipo (receita/despesa/ambos) | cor | ativo | createdAt | updatedAt
```

**contas** — Contas bancárias
```sql
id (PK) | empresaId (FK) | nome | tipo | saldoInicial | ativo | createdAt | updatedAt
```

**clientes** — Clientes/fornecedores
```sql
id (PK) | empresaId (FK) | nome | email | telefone | endereco | ativo | createdAt | updatedAt
```

**transacoes** — Transações financeiras
```sql
id (PK) | empresaId (FK) | categoriaId (FK) | contaId (FK) | clienteId (FK) | descricao | valor | tipo | status | data | createdAt | updatedAt
```

---

## 🔌 API tRPC

Todos os endpoints são type-safe e validados com Zod. Exemplos:

### Dashboard
```typescript
trpc.dashboard.metrics.useQuery()           // Métricas do mês
trpc.dashboard.monthlyEvolution.useQuery()  // Evolução mensal
trpc.dashboard.categoryDistribution.useQuery() // Distribuição por categoria
```

### Transações
```typescript
trpc.transacoes.list.useQuery(filters)      // Listar com filtros
trpc.transacoes.create.useMutation()        // Criar
trpc.transacoes.update.useMutation()        // Editar
trpc.transacoes.delete.useMutation()        // Deletar
```

### Categorias
```typescript
trpc.categorias.list.useQuery()             // Listar
trpc.categorias.create.useMutation()        // Criar
trpc.categorias.update.useMutation()        // Editar
trpc.categorias.delete.useMutation()        // Deletar
```

Veja `server/routers.ts` para a lista completa de procedures.

---

## 🧪 Testes

Executar todos os testes:

```bash
pnpm test
```

Testes incluem:
- ✅ Validação de autenticação (logout)
- ✅ Validação de input para transações, categorias, contas e clientes
- ✅ 10 testes vitest passando

---

## 📊 Variáveis de Ambiente

### Obrigatórias para Desenvolvimento
- `DATABASE_URL` — String de conexão MySQL
- `VITE_APP_ID` — ID da aplicação Manus OAuth
- `JWT_SECRET` — Chave secreta para JWT (mín. 32 caracteres)
- `OWNER_OPEN_ID` — OpenID do proprietário
- `OWNER_NAME` — Nome do proprietário

### Obrigatórias para Produção (Vercel)
- Todas as acima, mais:
- `OAUTH_SERVER_URL` — URL do servidor OAuth Manus
- `VITE_OAUTH_PORTAL_URL` — URL do portal de login Manus
- `BUILT_IN_FORGE_API_URL` — URL da API Manus
- `BUILT_IN_FORGE_API_KEY` — Chave da API Manus (server-side)
- `VITE_FRONTEND_FORGE_API_KEY` — Chave da API Manus (client-side)

### Opcionais
- `VITE_ANALYTICS_ENDPOINT` — Endpoint de analytics
- `VITE_ANALYTICS_WEBSITE_ID` — ID do site para analytics

---

## 🚀 Deployment na Vercel

### Pré-requisitos
1. Conta na [Vercel](https://vercel.com)
2. Repositório GitHub conectado
3. Banco de dados MySQL acessível (TiDB Serverless recomendado)

### Passos para Deploy

#### 1. Conectar Repositório GitHub
```bash
# Na Vercel dashboard, clique em "New Project"
# Selecione o repositório: mobilecosta/financas-mobile-manus
# Clique em "Import"
```

#### 2. Configurar Variáveis de Ambiente
Na Vercel dashboard, vá para **Settings → Environment Variables** e adicione:

```
DATABASE_URL=mysql://...
VITE_APP_ID=...
JWT_SECRET=...
OWNER_OPEN_ID=...
OWNER_NAME=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
```

#### 3. Configurar Build Settings
- **Framework Preset:** Other
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`

#### 4. Deploy
```bash
# Vercel detectará automaticamente as mudanças no GitHub
# Clique em "Deploy" ou faça push para a branch main
git push origin main
```

#### 5. Verificar Deployment
- Vercel fornecerá uma URL: `https://financas-mobile-*.vercel.app`
- Verifique os logs em **Deployments → View Logs**

---

## 🔐 Segurança

- **Autenticação:** Manus OAuth com JWT
- **Isolamento Multi-tenant:** Cada empresa tem dados isolados
- **Validação:** Zod schemas em frontend e backend
- **HTTPS:** Obrigatório em produção
- **CORS:** Configurado para origem específica
- **Rate Limiting:** Implementado via Express middleware (opcional)

---

## 📝 Scripts Disponíveis

```bash
pnpm dev              # Iniciar servidor de desenvolvimento
pnpm build            # Build para produção
pnpm start            # Iniciar servidor de produção
pnpm test             # Executar testes vitest
pnpm test:watch      # Executar testes em modo watch
pnpm db:push         # Executar migrações do banco
pnpm format          # Formatar código com Prettier
pnpm check           # Verificar tipos TypeScript
```

---

## 🎨 Design System

### Cores (Swiss Style)
- **Fundo:** Branco puro (`oklch(1 0 0)`)
- **Foreground:** Preto nítido (`oklch(0.08 0 0)`)
- **Primário (Vermelho):** `oklch(0.47 0.22 27)` (#DC2626)
- **Muted:** Cinza claro (`oklch(0.96 0 0)`)
- **Border:** Cinza muito claro (`oklch(0.88 0 0)`)

### Tipografia
- **Sans-serif:** IBM Plex Sans
- **Monospace:** IBM Plex Mono
- **Peso:** 300, 400, 500, 600, 700
- **Espaçamento:** -0.02em (headings), 0.01em (body)

### Componentes
- **Accent Squares:** `.swiss-accent`, `.swiss-accent-lg`, `.swiss-accent-xl`
- **Labels:** `.swiss-label` (uppercase, tracking-widest)
- **Rules:** `.swiss-rule`, `.swiss-rule-light`
- **Metric Cards:** `.metric-card` (com barra vermelha esquerda)

---

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

Para dúvidas ou sugestões, abra uma [issue](https://github.com/mobilecosta/financas-mobile-manus/issues) no repositório GitHub.

---

## 🙏 Agradecimentos

- **Manus** — Plataforma de desenvolvimento e deployment
- **React** — UI library
- **Tailwind CSS** — Utility-first CSS framework
- **tRPC** — Type-safe RPC framework
- **Drizzle ORM** — Type-safe SQL query builder

---

**Desenvolvido com ❤️ usando Manus**
