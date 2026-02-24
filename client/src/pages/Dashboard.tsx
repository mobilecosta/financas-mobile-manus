import AppLayout from "@/components/AppLayout";
import { MetricCardSkeleton } from "@/components/LoadingSkeleton";
import { trpc } from "@/lib/trpc";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  const [year, month] = dateStr.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]}/${year?.slice(2)}`;
}

const CHART_COLORS = ["#dc2626", "#1a1a1a", "#6b7280", "#9ca3af", "#d1d5db"];

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = trpc.dashboard.metrics.useQuery();
  const { data: evolution, isLoading: loadingEvolution } = trpc.dashboard.monthlyEvolution.useQuery();
  const { data: distribution, isLoading: loadingDist } = trpc.dashboard.categoryDistribution.useQuery();
  const { data: recent, isLoading: loadingRecent } = trpc.dashboard.recentTransactions.useQuery();

  // Process evolution data for chart
  const evolutionData = (() => {
    if (!evolution) return [];
    const byMonth: Record<string, { mes: string; receitas: number; despesas: number }> = {};
    evolution.forEach((row) => {
      const mes = row.mes as string;
      if (!byMonth[mes]) byMonth[mes] = { mes: formatDate(mes), receitas: 0, despesas: 0 };
      if (row.tipo === "receita") byMonth[mes].receitas = Number(row.total ?? 0);
      else byMonth[mes].despesas = Number(row.total ?? 0);
    });
    return Object.values(byMonth);
  })();

  // Process distribution data
  const distData = (() => {
    if (!distribution) return [];
    const byCategory: Record<string, { name: string; value: number; color: string }> = {};
    distribution.forEach((row) => {
      const key = String(row.categoriaId ?? "sem-categoria");
      if (!byCategory[key]) {
        byCategory[key] = {
          name: row.categoriaNome ?? "Sem categoria",
          value: 0,
          color: row.categoriaCor ?? "#6b7280",
        };
      }
      byCategory[key].value += Number(row.total ?? 0);
    });
    return Object.values(byCategory).sort((a, b) => b.value - a.value).slice(0, 6);
  })();

  const metricCards = [
    {
      label: "Saldo do Mês",
      value: metrics ? formatCurrency(metrics.saldo) : "—",
      icon: Wallet,
      trend: metrics ? (metrics.saldo >= 0 ? "up" : "down") : null,
      color: metrics ? (metrics.saldo >= 0 ? "text-foreground" : "text-primary") : "text-foreground",
    },
    {
      label: "Receitas",
      value: metrics ? formatCurrency(metrics.receitas) : "—",
      icon: ArrowUpRight,
      trend: "up" as const,
      color: "text-foreground",
    },
    {
      label: "Despesas",
      value: metrics ? formatCurrency(metrics.despesas) : "—",
      icon: ArrowDownRight,
      trend: "down" as const,
      color: "text-primary",
    },
    {
      label: "Pendentes",
      value: metrics ? String(metrics.pendentes) : "—",
      icon: Clock,
      trend: null,
      color: "text-muted-foreground",
    },
  ];

  return (
    <AppLayout title="Visão Geral">
      <div className="p-6 space-y-8">
        {/* ─── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="swiss-accent-lg" />
              <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Resumo financeiro do mês atual
            </p>
          </div>
          <div className="text-xs text-muted-foreground font-mono border border-border px-3 py-2">
            {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </div>
        </div>

        {/* ─── Metric Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {loadingMetrics
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-background">
                  <MetricCardSkeleton />
                </div>
              ))
            : metricCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="metric-card bg-background">
                    <div className="flex items-start justify-between mb-4">
                      <span className="swiss-label">{card.label}</span>
                      <div className="w-8 h-8 bg-muted flex items-center justify-center">
                        <Icon size={14} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div className={`text-2xl font-bold font-mono tracking-tight mb-1 ${card.color}`}>
                      {card.value}
                    </div>
                    {card.trend && (
                      <div className="flex items-center gap-1">
                        {card.trend === "up" ? (
                          <TrendingUp size={10} className="text-foreground" />
                        ) : (
                          <ArrowDownRight size={10} className="text-primary" />
                        )}
                        <span className="text-xs text-muted-foreground">Este mês</span>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>

        {/* ─── Charts Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border">
          {/* Evolution Chart */}
          <div className="lg:col-span-2 bg-background border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="swiss-accent" />
              <span className="swiss-label">Evolução Mensal</span>
            </div>
            {loadingEvolution ? (
              <div className="h-48 bg-muted animate-pulse" />
            ) : evolutionData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={evolutionData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{ border: "1px solid #1a1a1a", borderRadius: 0, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#1a1a1a" strokeWidth={2} fill="url(#colorReceitas)" />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#dc2626" strokeWidth={2} fill="url(#colorDespesas)" />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Distribution Chart */}
          <div className="bg-background border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="swiss-accent" />
              <span className="swiss-label">Por Categoria</span>
            </div>
            {loadingDist ? (
              <div className="h-48 bg-muted animate-pulse" />
            ) : distData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={distData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{ border: "1px solid #1a1a1a", borderRadius: 0, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {distData.length > 0 && (
              <div className="mt-4 space-y-2">
                {distData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                    <span className="text-xs font-mono font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Recent Transactions ─────────────────────────────────── */}
        <div className="border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="swiss-accent" />
              <span className="swiss-label">Transações Recentes</span>
            </div>
            <a href="/transactions" className="text-xs font-medium text-primary hover:underline">
              Ver todas →
            </a>
          </div>
          {loadingRecent ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse" />
              ))}
            </div>
          ) : !recent || recent.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma transação registrada.</p>
              <a href="/transactions" className="text-xs font-medium text-primary hover:underline mt-2 inline-block">
                Criar primeira transação →
              </a>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((tx) => (
                <div key={tx.id} className="px-6 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-1 h-8 flex-shrink-0 ${tx.tipo === "receita" ? "bg-foreground" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tx.descricao}</div>
                    <div className="text-xs text-muted-foreground">{tx.data}</div>
                  </div>
                  <div className={`text-sm font-mono font-bold ${tx.tipo === "receita" ? "text-foreground" : "text-primary"}`}>
                    {tx.tipo === "receita" ? "+" : "-"}
                    {formatCurrency(Number(tx.valor))}
                  </div>
                  <span className={tx.status === "pendente" ? "badge-pendente" : tx.tipo === "receita" ? "badge-receita" : "badge-despesa"}>
                    {tx.status === "pendente" ? "Pendente" : tx.tipo === "receita" ? "Receita" : "Despesa"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
