import AppLayout from "@/components/AppLayout";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const PAGE_SIZE = 20;

interface TransactionForm {
  descricao: string;
  valor: string;
  tipo: "receita" | "despesa";
  data: string;
  categoriaId?: number;
  contaId?: number;
  clienteId?: number;
  status: "pendente" | "confirmado" | "cancelado";
  observacoes?: string;
}

const emptyForm: TransactionForm = {
  descricao: "",
  valor: "",
  tipo: "despesa",
  data: new Date().toISOString().split("T")[0],
  status: "confirmado",
};

export default function Transactions() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<{
    tipo?: "receita" | "despesa";
    categoriaId?: number;
    contaId?: number;
    dataInicio?: string;
    dataFim?: string;
    status?: "pendente" | "confirmado" | "cancelado";
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = trpc.transacoes.list.useQuery({
    ...filters,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const { data: categorias } = trpc.categorias.list.useQuery();
  const { data: contas } = trpc.contas.list.useQuery();
  const { data: clientes } = trpc.clientes.list.useQuery();

  const createMutation = trpc.transacoes.create.useMutation({
    onSuccess: () => {
      utils.transacoes.list.invalidate();
      utils.dashboard.metrics.invalidate();
      utils.dashboard.recentTransactions.invalidate();
      setModalOpen(false);
      setForm(emptyForm);
      toast.success("✅ Transação salva com sucesso!");
    },
    onError: (e) => toast.error(`❌ Erro ao salvar transação. ${e.message}`),
  });

  const updateMutation = trpc.transacoes.update.useMutation({
    onSuccess: () => {
      utils.transacoes.list.invalidate();
      utils.dashboard.metrics.invalidate();
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success("✅ Transação atualizada com sucesso!");
    },
    onError: (e) => toast.error(`❌ Erro ao atualizar transação. ${e.message}`),
  });

  const deleteMutation = trpc.transacoes.delete.useMutation({
    onSuccess: () => {
      utils.transacoes.list.invalidate();
      utils.dashboard.metrics.invalidate();
      setDeleteConfirm(null);
      toast.success("Transação excluída.");
    },
    onError: (e) => toast.error(`❌ Erro ao excluir. ${e.message}`),
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx: any) => {
    setEditingId(tx.id);
    setForm({
      descricao: tx.descricao,
      valor: String(tx.valor),
      tipo: tx.tipo,
      data: tx.data,
      categoriaId: tx.categoriaId ?? undefined,
      contaId: tx.contaId ?? undefined,
      clienteId: tx.clienteId ?? undefined,
      status: tx.status,
      observacoes: tx.observacoes ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor || !form.data) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <AppLayout title="Transações">
      <div className="p-6 space-y-6">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="swiss-accent-lg" />
              <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              {total} transação{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 relative"
            >
              <Filter size={14} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="gap-2 bg-primary text-primary-foreground hover:opacity-90"
            >
              <Plus size={14} />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* ─── Filters ─────────────────────────────────────────────── */}
        {showFilters && (
          <div className="border border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <span className="swiss-label">Filtros</span>
              <button
                onClick={() => { setFilters({}); setPage(0); }}
                className="text-xs text-primary hover:underline"
              >
                Limpar filtros
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Tipo</Label>
                <Select
                  value={filters.tipo ?? "all"}
                  onValueChange={(v) => { setFilters(f => ({ ...f, tipo: v === "all" ? undefined : v as any })); setPage(0); }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Status</Label>
                <Select
                  value={filters.status ?? "all"}
                  onValueChange={(v) => { setFilters(f => ({ ...f, status: v === "all" ? undefined : v as any })); setPage(0); }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Data início</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filters.dataInicio ?? ""}
                  onChange={(e) => { setFilters(f => ({ ...f, dataInicio: e.target.value || undefined })); setPage(0); }}
                />
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Data fim</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filters.dataFim ?? ""}
                  onChange={(e) => { setFilters(f => ({ ...f, dataFim: e.target.value || undefined })); setPage(0); }}
                />
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Categoria</Label>
                <Select
                  value={filters.categoriaId ? String(filters.categoriaId) : "all"}
                  onValueChange={(v) => { setFilters(f => ({ ...f, categoriaId: v === "all" ? undefined : Number(v) })); setPage(0); }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categorias?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Conta</Label>
                <Select
                  value={filters.contaId ? String(filters.contaId) : "all"}
                  onValueChange={(v) => { setFilters(f => ({ ...f, contaId: v === "all" ? undefined : Number(v) })); setPage(0); }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {contas?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* ─── Table ───────────────────────────────────────────────── */}
        <div className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3">
                    <span className="swiss-label">Descrição</span>
                  </th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">
                    <span className="swiss-label">Categoria</span>
                  </th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">
                    <span className="swiss-label">Data</span>
                  </th>
                  <th className="text-left px-4 py-3">
                    <span className="swiss-label">Tipo</span>
                  </th>
                  <th className="text-right px-4 py-3">
                    <span className="swiss-label">Valor</span>
                  </th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">
                    <span className="swiss-label">Status</span>
                  </th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={TrendingUp}
                        title="Nenhuma transação registrada"
                        description="Clique em 'Nova Transação' para começar a registrar suas movimentações financeiras."
                        action={
                          <Button size="sm" onClick={handleOpenCreate} className="gap-2 bg-primary text-primary-foreground">
                            <Plus size={14} /> Nova Transação
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((tx) => {
                    const cat = categorias?.find((c) => c.id === tx.categoriaId);
                    return (
                      <tr key={tx.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-6 flex-shrink-0 ${tx.tipo === "receita" ? "bg-foreground" : "bg-primary"}`} />
                            <span className="text-sm font-medium truncate max-w-[180px]">{tx.descricao}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {cat ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2" style={{ backgroundColor: cat.cor }} />
                              <span className="text-xs text-muted-foreground">{cat.nome}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs font-mono text-muted-foreground">{tx.data}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={tx.tipo === "receita" ? "badge-receita" : "badge-despesa"}>
                            {tx.tipo === "receita" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-mono font-bold ${tx.tipo === "receita" ? "text-foreground" : "text-primary"}`}>
                            {tx.tipo === "receita" ? "+" : "-"}
                            {formatCurrency(Number(tx.valor))}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={
                            tx.status === "confirmado" ? "badge-receita" :
                            tx.status === "pendente" ? "badge-pendente" :
                            "badge-despesa"
                          }>
                            {tx.status === "confirmado" ? "Confirmado" : tx.status === "pendente" ? "Pendente" : "Cancelado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(tx.id)}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-7 h-7 flex items-center justify-center border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="text-xs font-mono px-2">{page + 1}/{totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-7 h-7 flex items-center justify-center border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Create/Edit Modal ───────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              {editingId ? "Editar Transação" : "Nova Transação"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="swiss-label mb-1.5">Descrição *</Label>
              <Input
                placeholder="Ex: Pagamento de fornecedor"
                value={form.descricao}
                onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => setForm(f => ({ ...f, valor: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Data *</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm(f => ({ ...f, tipo: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Categoria</Label>
                <Select
                  value={form.categoriaId ? String(form.categoriaId) : "none"}
                  onValueChange={(v) => setForm(f => ({ ...f, categoriaId: v === "none" ? undefined : Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categorias?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 inline-block" style={{ backgroundColor: c.cor }} />
                          {c.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Conta</Label>
                <Select
                  value={form.contaId ? String(form.contaId) : "none"}
                  onValueChange={(v) => setForm(f => ({ ...f, contaId: v === "none" ? undefined : Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem conta</SelectItem>
                    {contas?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Cliente</Label>
              <Select
                value={form.clienteId ? String(form.clienteId) : "none"}
                onValueChange={(v) => setForm(f => ({ ...f, clienteId: v === "none" ? undefined : Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cliente</SelectItem>
                  {clientes?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Observações</Label>
              <Input
                placeholder="Notas adicionais..."
                value={form.observacoes ?? ""}
                onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value || undefined }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => { setModalOpen(false); setEditingId(null); setForm(emptyForm); }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm Modal ────────────────────────────────────── */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Esta ação não pode ser desfeita. A transação será permanentemente excluída.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirm && deleteMutation.mutate({ id: deleteConfirm })}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
