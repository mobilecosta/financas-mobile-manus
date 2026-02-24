import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

export default function Reports() {
  const [months, setMonths] = useState(6);
  const [generating, setGenerating] = useState(false);

  const { data: evolution, isLoading: loadingEvolution } = trpc.dashboard.monthlyEvolution.useQuery({ months });
  const { data: distribution, isLoading: loadingDist } = trpc.dashboard.categoryDistribution.useQuery();
  const { data: metrics } = trpc.dashboard.metrics.useQuery();
  const { data: empresa } = trpc.empresa.get.useQuery();

  const evolutionData = (() => {
    if (!evolution) return [];
    const byMonth: Record<string, { mes: string; receitas: number; despesas: number; saldo: number }> = {};
    evolution.forEach((row) => {
      const mes = row.mes as string;
      if (!byMonth[mes]) byMonth[mes] = { mes: formatDate(mes), receitas: 0, despesas: 0, saldo: 0 };
      if (row.tipo === "receita") byMonth[mes].receitas = Number(row.total ?? 0);
      else byMonth[mes].despesas = Number(row.total ?? 0);
    });
    Object.values(byMonth).forEach((m) => { m.saldo = m.receitas - m.despesas; });
    return Object.values(byMonth);
  })();

  const distData = (() => {
    if (!distribution) return [];
    const byCategory: Record<string, { name: string; value: number; color: string; tipo: string }> = {};
    distribution.forEach((row) => {
      const key = String(row.categoriaId ?? "sem-categoria");
      if (!byCategory[key]) {
        byCategory[key] = {
          name: row.categoriaNome ?? "Sem categoria",
          value: 0,
          color: row.categoriaCor ?? "#6b7280",
          tipo: row.tipo as string,
        };
      }
      byCategory[key].value += Number(row.total ?? 0);
    });
    return Object.values(byCategory).sort((a, b) => b.value - a.value);
  })();

  const despesasDist = distData.filter((d) => d.tipo === "despesa");

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      // Build HTML content for PDF
      const now = new Date();
      const empresaNome = empresa?.nome ?? "Minha Empresa";
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 12px; }
    .page { padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1a1a1a; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .accent { width: 20px; height: 20px; background: #dc2626; display: inline-block; }
    .logo-text { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
    .header-info { text-align: right; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; }
    .section { margin-bottom: 32px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 16px; }
    .section-title::before { content: ''; width: 12px; height: 12px; background: #dc2626; display: inline-block; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e5e7eb; margin-bottom: 32px; }
    .metric { background: #fff; padding: 16px; position: relative; }
    .metric::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #dc2626; }
    .metric-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 8px; }
    .metric-value { font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; }
    .metric-value.negative { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; border-bottom: 1px solid #1a1a1a; }
    td { padding: 8px 12px; font-size: 11px; border-bottom: 1px solid #e5e7eb; }
    .badge { display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
    .badge-r { background: #1a1a1a; color: #fff; }
    .badge-d { background: #dc2626; color: #fff; }
    .amount-r { font-family: monospace; font-weight: 700; }
    .amount-d { font-family: monospace; font-weight: 700; color: #dc2626; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #1a1a1a; display: flex; justify-content: space-between; font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      <span class="accent"></span>
      <span class="logo-text">financas-mobile</span>
    </div>
    <div class="header-info">
      <div>${empresaNome}</div>
      <div>Relatório Financeiro</div>
      <div>${now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>
      <div>Gerado em ${now.toLocaleString("pt-BR")}</div>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-label">Saldo do Mês</div>
      <div class="metric-value ${(metrics?.saldo ?? 0) < 0 ? "negative" : ""}">${formatCurrency(metrics?.saldo ?? 0)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Receitas</div>
      <div class="metric-value">${formatCurrency(metrics?.receitas ?? 0)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Despesas</div>
      <div class="metric-value negative">${formatCurrency(metrics?.despesas ?? 0)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Pendentes</div>
      <div class="metric-value">${metrics?.pendentes ?? 0}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Evolução Mensal (${months} meses)</div>
    <table>
      <thead>
        <tr>
          <th>Período</th>
          <th>Receitas</th>
          <th>Despesas</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        ${evolutionData.map((row) => `
          <tr>
            <td>${row.mes}</td>
            <td class="amount-r">${formatCurrency(row.receitas)}</td>
            <td class="amount-d">${formatCurrency(row.despesas)}</td>
            <td class="${row.saldo < 0 ? "amount-d" : "amount-r"}">${formatCurrency(row.saldo)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Distribuição por Categoria (Mês Atual)</div>
    <table>
      <thead>
        <tr>
          <th>Categoria</th>
          <th>Tipo</th>
          <th>Total</th>
          <th>% do Total</th>
        </tr>
      </thead>
      <tbody>
        ${distData.map((item) => {
          const totalDist = distData.reduce((s, d) => s + d.value, 0);
          const pct = totalDist > 0 ? ((item.value / totalDist) * 100).toFixed(1) : "0.0";
          return `
            <tr>
              <td>${item.name}</td>
              <td><span class="badge ${item.tipo === "receita" ? "badge-r" : "badge-d"}">${item.tipo}</span></td>
              <td class="${item.tipo === "despesa" ? "amount-d" : "amount-r"}">${formatCurrency(item.value)}</td>
              <td>${pct}%</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <span>financas-mobile — Controle Financeiro Empresarial</span>
    <span>Página 1 de 1</span>
  </div>
</div>
</body>
</html>`;

      // Open in new tab for printing/saving as PDF
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) {
        win.onload = () => {
          setTimeout(() => win.print(), 500);
        };
      }
      toast.success("✅ Relatório gerado! Use Ctrl+P para salvar como PDF.");
    } catch (err) {
      toast.error("❌ Erro ao gerar relatório.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout title="Relatórios">
      <div className="p-6 space-y-8">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="swiss-accent-lg" />
              <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Análise financeira detalhada por período e categoria
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleGeneratePDF}
            disabled={generating}
            className="gap-2 bg-foreground text-background hover:opacity-90"
          >
            <Download size={14} />
            {generating ? "Gerando..." : "Exportar PDF"}
          </Button>
        </div>

        {/* ─── Period Selector ─────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <span className="swiss-label">Período:</span>
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                months === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {m} meses
            </button>
          ))}
        </div>

        {/* ─── Summary Metrics ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { label: "Saldo do Mês", value: metrics?.saldo ?? 0, negative: (metrics?.saldo ?? 0) < 0 },
            { label: "Receitas", value: metrics?.receitas ?? 0, negative: false },
            { label: "Despesas", value: metrics?.despesas ?? 0, negative: true },
            { label: "Pendentes", value: metrics?.pendentes ?? 0, negative: false, isCount: true },
          ].map((item) => (
            <div key={item.label} className="metric-card bg-background">
              <div className="swiss-label mb-3">{item.label}</div>
              <div className={`text-xl font-bold font-mono tracking-tight ${item.negative ? "text-primary" : "text-foreground"}`}>
                {item.isCount ? item.value : formatCurrency(item.value as number)}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Evolution Chart ─────────────────────────────────────── */}
        <div className="border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="swiss-accent" />
            <span className="swiss-label">Evolução de Receitas e Despesas</span>
          </div>
          {loadingEvolution ? (
            <div className="h-64 bg-muted animate-pulse" />
          ) : evolutionData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={evolutionData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  contentStyle={{ border: "1px solid #1a1a1a", borderRadius: 0, fontSize: 12 }}
                />
                <Bar dataKey="receitas" name="Receitas" fill="#1a1a1a" radius={0} />
                <Bar dataKey="despesas" name="Despesas" fill="#dc2626" radius={0} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ─── Saldo Evolution ─────────────────────────────────────── */}
        <div className="border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="swiss-accent" />
            <span className="swiss-label">Evolução do Saldo</span>
          </div>
          {loadingEvolution ? (
            <div className="h-48 bg-muted animate-pulse" />
          ) : evolutionData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Saldo"]}
                  contentStyle={{ border: "1px solid #1a1a1a", borderRadius: 0, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="saldo" stroke="#1a1a1a" strokeWidth={2} fill="url(#saldoGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ─── Category Distribution ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">
          <div className="bg-background border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="swiss-accent" />
              <span className="swiss-label">Distribuição por Categoria</span>
            </div>
            {loadingDist ? (
              <div className="h-48 bg-muted animate-pulse" />
            ) : despesasDist.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={despesasDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {despesasDist.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{ border: "1px solid #1a1a1a", borderRadius: 0, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-background border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="swiss-accent" />
              <span className="swiss-label">Ranking de Despesas</span>
            </div>
            {loadingDist ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse" />
                ))}
              </div>
            ) : despesasDist.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Nenhuma despesa registrada
              </div>
            ) : (
              <div className="space-y-3">
                {despesasDist.slice(0, 8).map((item, index) => {
                  const maxVal = despesasDist[0]?.value ?? 1;
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-4">{index + 1}</span>
                          <span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-medium truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-primary">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1 bg-muted overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Export Note ─────────────────────────────────────────── */}
        <div className="border border-border p-4 flex items-start gap-3 bg-muted/30">
          <FileText size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium mb-1">Exportar Relatório em PDF</div>
            <p className="text-xs text-muted-foreground">
              Clique em "Exportar PDF" para gerar um relatório completo com métricas, evolução mensal e distribuição por categoria.
              O relatório será aberto em uma nova aba — use Ctrl+P (ou Cmd+P no Mac) para salvar como PDF.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleGeneratePDF}
            disabled={generating}
            className="ml-auto flex-shrink-0 gap-2 bg-primary text-primary-foreground hover:opacity-90"
          >
            <Download size={12} />
            PDF
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
