# Finanças Mobile — TODO

## Fase 1: Schema, Tema e Infraestrutura
- [x] Configurar schema do banco de dados (empresas, transacoes, contas, clientes, categorias)
- [x] Configurar tema Swiss Style (cores, tipografia, grade) em index.css
- [x] Configurar fontes (IBM Plex Sans) via Google Fonts

## Fase 2: Landing Page
- [x] Hero section com título, subtítulo e CTA
- [x] Seção de features/funcionalidades
- [x] Header fixo com logo e navegação
- [x] Footer com links

## Fase 3: Layout e Navegação
- [x] Sidebar responsiva com menu colapsável para mobile
- [x] AppLayout customizado com Swiss Style
- [x] Rotas protegidas com autenticação
- [x] Navegação interna

## Fase 4: Dashboard Principal
- [x] Cards de métricas (saldo, receitas, despesas, pendentes)
- [x] Gráfico de evolução temporal (barras)
- [x] Gráfico de distribuição por categoria (pizza/barras)
- [x] Resumo de transações recentes

## Fase 5: Gestão de Transações
- [x] Tabela de transações com filtros (data, categoria, tipo, conta)
- [x] Modal de criação de transação
- [x] Modal de edição de transação
- [x] Exclusão de transação com confirmação
- [x] Sistema de categorias com cores personalizadas
- [x] Paginação da tabela

## Fase 6: Contas e Clientes
- [x] Listagem de contas bancárias com saldo atual
- [x] Modal de criação/edição de conta
- [x] Histórico de transações por conta
- [x] Listagem de clientes com informações de contato
- [x] Modal de criação/edição de cliente
- [x] Histórico de transações por cliente

## Fase 7: Relatórios
- [x] Relatório de evolução de receitas/despesas por período
- [x] Relatório de distribuição por categoria
- [x] Geração de PDF com gráficos e tabelas (HTML → Print)
- [x] Download e compartilhamento de relatórios

## Fase 8: Configurações e Notificações
- [x] Página de configurações com perfil do usuário
- [x] Preferências do sistema (moeda, CNPJ, telefone)
- [x] Gestão de tenant (nome da empresa)
- [x] Notificações automáticas ao proprietário para transações importantes (notifyOwner)
- [x] Alertas de limite de gastos

## Testes
- [x] Testes unitários para auth.logout
- [x] Testes unitários para validação de input: transações, categorias, contas, clientes
- [x] 10 testes passando (2 arquivos de teste)
