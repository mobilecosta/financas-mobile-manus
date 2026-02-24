import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  BarChart3,
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  Lock,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard em Tempo Real",
    desc: "Visão consolidada de receitas, despesas, saldo e transações pendentes com atualização instantânea.",
  },
  {
    icon: TrendingUp,
    title: "Gestão de Transações",
    desc: "Cadastre, categorize e filtre transações financeiras com precisão. Suporte a receitas e despesas.",
  },
  {
    icon: CreditCard,
    title: "Contas Bancárias",
    desc: "Gerencie múltiplas contas com saldo atualizado, histórico completo e vinculação de transações.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    desc: "Mantenha cadastro completo de clientes com histórico de transações e informações de contato.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Financeiros",
    desc: "Gráficos de evolução temporal e distribuição por categoria. Exportação em PDF para compartilhamento.",
  },
  {
    icon: Lock,
    title: "Multi-tenant Seguro",
    desc: "Isolamento total de dados por empresa. Cada tenant acessa somente suas próprias informações.",
  },
];

const STATS = [
  { value: "R$ 0", label: "Taxa de Setup" },
  { value: "100%", label: "Isolamento de Dados" },
  { value: "∞", label: "Transações" },
  { value: "24/7", label: "Disponibilidade" },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="swiss-accent-lg" />
            <span className="font-bold text-base tracking-tight">financas-mobile</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#plataforma" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Plataforma
            </a>
            <a
              href={getLoginUrl()}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Entrar
            </a>
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Começar Grátis
              <ChevronRight size={14} />
            </a>
          </nav>
          <a
            href={getLoginUrl()}
            className="md:hidden inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-2"
          >
            Entrar
          </a>
        </div>
      </header>

      <main>
        {/* ─── Hero ──────────────────────────────────────────────────── */}
        <section className="pt-14 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-24 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Left column — asymmetric Swiss grid */}
              <div className="lg:col-span-7 lg:pr-16">
                <div className="flex items-center gap-3 mb-8">
                  <span className="swiss-accent-xl" />
                  <span className="swiss-label">Plataforma Financeira Empresarial</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-none tracking-tight">
                  Controle
                  <br />
                  <span className="text-primary">Financeiro</span>
                  <br />
                  para o seu
                  <br />
                  Negócio.
                </h1>

                <div className="swiss-rule-light mb-8" />

                <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
                  Plataforma multi-tenant completa para gestão financeira empresarial.
                  Transações, contas, clientes e relatórios em um único sistema seguro e escalável.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={getLoginUrl()}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 text-base hover:opacity-90 transition-opacity"
                  >
                    Cadastre-se Gratuitamente
                    <ChevronRight size={18} />
                  </a>
                  <a
                    href="#recursos"
                    className="inline-flex items-center justify-center gap-2 border border-foreground text-foreground font-medium px-8 py-4 text-base hover:bg-foreground hover:text-background transition-colors"
                  >
                    Ver Recursos
                  </a>
                </div>
              </div>

              {/* Right column — Swiss grid visual */}
              <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
                <div className="w-full max-w-sm">
                  {/* Swiss-style abstract grid composition */}
                  <div className="grid grid-cols-3 gap-1">
                    <div className="col-span-2 bg-primary h-32 flex items-end p-4">
                      <span className="text-primary-foreground font-bold text-2xl">R$ 84.320</span>
                    </div>
                    <div className="bg-foreground h-32 flex items-center justify-center">
                      <TrendingUp size={32} className="text-background" />
                    </div>
                    <div className="bg-muted h-20 flex items-center justify-center border border-border">
                      <span className="swiss-label text-center">Receitas</span>
                    </div>
                    <div className="bg-muted h-20 flex items-center justify-center border border-border">
                      <span className="swiss-label text-center">Despesas</span>
                    </div>
                    <div className="bg-primary/10 h-20 flex items-center justify-center border border-primary/20">
                      <span className="swiss-label text-primary text-center">Saldo</span>
                    </div>
                    <div className="col-span-3 border border-border p-4 flex items-center gap-3">
                      <span className="swiss-accent" />
                      <span className="text-xs text-muted-foreground font-mono">+12 transações hoje</span>
                      <span className="ml-auto text-xs font-medium text-primary">↑ 8.4%</span>
                    </div>
                    <div className="col-span-2 border border-border p-4">
                      <div className="swiss-label mb-2">Distribuição</div>
                      <div className="flex gap-1 h-8">
                        <div className="bg-primary" style={{ width: "45%" }} />
                        <div className="bg-foreground" style={{ width: "30%" }} />
                        <div className="bg-muted-foreground/30" style={{ width: "25%" }} />
                      </div>
                    </div>
                    <div className="bg-foreground p-4 flex items-center justify-center">
                      <Building2 size={24} className="text-background" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats Bar ─────────────────────────────────────────────── */}
        <section className="border-y border-border bg-foreground text-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`py-8 px-6 text-center ${i < STATS.length - 1 ? "border-r border-background/10" : ""}`}
                >
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs uppercase tracking-widest text-background/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ──────────────────────────────────────────────── */}
        <section id="recursos" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-6">
                  <span className="swiss-accent" />
                  <span className="swiss-label">Funcionalidades</span>
                </div>
                <h2 className="text-4xl font-bold leading-tight mb-6">
                  Tudo que
                  <br />
                  sua empresa
                  <br />
                  precisa.
                </h2>
                <div className="swiss-rule mb-6" />
                <p className="text-muted-foreground leading-relaxed">
                  Sistema completo desenvolvido para empresas que exigem precisão,
                  segurança e escalabilidade na gestão financeira.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                  {FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="bg-background p-8 group">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0 group-hover:bg-foreground transition-colors">
                            <Icon size={18} className="text-primary-foreground" />
                          </div>
                          <h3 className="font-bold text-base pt-2">{feature.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-14">
                          {feature.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Platform Section ──────────────────────────────────────── */}
        <section id="plataforma" className="py-24 bg-foreground text-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="swiss-accent" />
                  <span className="text-xs font-medium uppercase tracking-widest text-background/60">
                    Plataforma
                  </span>
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight">
                  Segurança
                  <br />
                  <span className="text-primary">multi-tenant</span>
                  <br />
                  por design.
                </h2>
                <div className="border-t border-background/20 mb-6" />
                <p className="text-background/70 leading-relaxed mb-8">
                  Cada empresa opera em seu próprio espaço isolado. Dados financeiros
                  nunca se misturam entre tenants, garantindo privacidade e conformidade
                  com as melhores práticas de segurança.
                </p>
                <div className="space-y-4">
                  {[
                    "Isolamento total de dados por empresa",
                    "Autenticação segura com OAuth",
                    "Notificações automáticas de transações",
                    "Relatórios em PDF para auditoria",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="swiss-accent flex-shrink-0" />
                      <span className="text-sm text-background/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { icon: Lock, label: "Segurança", value: "RLS" },
                  { icon: Zap, label: "Performance", value: "< 200ms" },
                  { icon: FileText, label: "Relatórios", value: "PDF" },
                  { icon: Building2, label: "Multi-tenant", value: "∞" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="border border-background/20 p-6">
                      <Icon size={24} className="text-primary mb-4" />
                      <div className="text-2xl font-bold mb-1">{item.value}</div>
                      <div className="text-xs uppercase tracking-widest text-background/50">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ───────────────────────────────────────────────────── */}
        <section className="py-32 border-t border-border">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex justify-center mb-8">
              <span className="swiss-accent-xl" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-none tracking-tight">
              Comece agora.
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              Configure sua empresa em minutos e tenha controle total das finanças.
            </p>
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-10 py-5 text-base hover:opacity-90 transition-opacity"
            >
              Cadastre-se Gratuitamente
              <ChevronRight size={18} />
            </a>
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="swiss-accent" />
              <span className="font-bold text-sm">financas-mobile</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#recursos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#plataforma" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Plataforma
              </a>
              <a href={getLoginUrl()} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Entrar
              </a>
            </div>
            <div className="swiss-label">
              © 2026 financas-mobile
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
