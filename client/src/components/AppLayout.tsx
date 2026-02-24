import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
  { path: "/transactions", icon: TrendingUp, label: "Transações" },
  { path: "/accounts", icon: CreditCard, label: "Contas" },
  { path: "/clients", icon: Users, label: "Clientes" },
  { path: "/reports", icon: BarChart3, label: "Relatórios" },
  { path: "/settings", icon: Settings, label: "Configurações" },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function EmpresaInfo() {
  const { data: empresa } = trpc.empresa.get.useQuery();
  return (
    <div className="hidden sm:flex items-center gap-2 border border-border px-3 py-1.5">
      <Building2 size={12} className="text-muted-foreground" />
      <span className="text-xs text-muted-foreground font-medium">{empresa?.nome ?? "Minha Empresa"}</span>
    </div>
  );
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-4">
          <span className="swiss-accent-xl animate-pulse" />
          <span className="text-sm text-muted-foreground font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const currentPath = location;

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Mobile Overlay ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-sidebar text-sidebar-foreground
          flex flex-col transition-all duration-200
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`h-14 flex items-center border-b border-sidebar-border flex-shrink-0 ${collapsed ? "justify-center px-0" : "px-5 justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <span className="swiss-accent" />
              <span className="font-bold text-sm tracking-tight">financas-mobile</span>
            </div>
          )}
          {collapsed && <span className="swiss-accent" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-6 h-6 text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <X size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {!collapsed && (
            <div className="px-5 mb-3">
              <span className="text-xs uppercase tracking-widest text-sidebar-foreground/30 font-medium">
                Menu
              </span>
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`
                    flex items-center gap-3 mx-2 mb-0.5 px-3 py-2.5 cursor-pointer transition-colors
                    ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className={`border-t border-sidebar-border p-3 flex-shrink-0`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{user?.name ?? "Usuário"}</div>
                <div className="text-xs text-sidebar-foreground/40 truncate">{user?.email ?? ""}</div>
              </div>
              <button
                onClick={() => logout()}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => logout()}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Content ───────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Top Bar */}
        <header className="h-14 bg-background border-b border-border flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            {title && (
              <>
                <span className="swiss-accent flex-shrink-0" />
                <h1 className="font-bold text-sm tracking-tight">{title}</h1>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Tenant info */}
            <EmpresaInfo />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
