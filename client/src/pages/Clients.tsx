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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ClientForm {
  nome: string;
  email?: string;
  telefone?: string;
  cpfCnpj?: string;
  endereco?: string;
  observacoes?: string;
}

const emptyForm: ClientForm = { nome: "" };

export default function Clients() {
  const utils = trpc.useUtils();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: clientes, isLoading } = trpc.clientes.list.useQuery();

  const createMutation = trpc.clientes.create.useMutation({
    onSuccess: () => {
      utils.clientes.list.invalidate();
      setModalOpen(false);
      setForm(emptyForm);
      toast.success("✅ Cliente criado com sucesso!");
    },
    onError: (e) => toast.error(`❌ Erro ao criar cliente. ${e.message}`),
  });

  const updateMutation = trpc.clientes.update.useMutation({
    onSuccess: () => {
      utils.clientes.list.invalidate();
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success("✅ Cliente atualizado com sucesso!");
    },
    onError: (e) => toast.error(`❌ Erro ao atualizar cliente. ${e.message}`),
  });

  const deleteMutation = trpc.clientes.delete.useMutation({
    onSuccess: () => {
      utils.clientes.list.invalidate();
      setDeleteConfirm(null);
      toast.success("Cliente excluído.");
    },
    onError: (e) => toast.error(`❌ Erro ao excluir. ${e.message}`),
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (cliente: any) => {
    setEditingId(cliente.id);
    setForm({
      nome: cliente.nome,
      email: cliente.email ?? undefined,
      telefone: cliente.telefone ?? undefined,
      cpfCnpj: cliente.cpfCnpj ?? undefined,
      endereco: cliente.endereco ?? undefined,
      observacoes: cliente.observacoes ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) { toast.error("Informe o nome do cliente."); return; }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = clientes?.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpfCnpj?.includes(search)
  ) ?? [];

  return (
    <AppLayout title="Clientes">
      <div className="p-6 space-y-6">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="swiss-accent-lg" />
              <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} />
            Novo Cliente
          </Button>
        </div>

        {/* ─── Search ──────────────────────────────────────────────── */}
        <div className="max-w-sm">
          <Input
            placeholder="Buscar por nome, email ou CPF/CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>

        {/* ─── Table ───────────────────────────────────────────────── */}
        <div className="border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3">
                  <span className="swiss-label">Nome</span>
                </th>
                <th className="text-left px-4 py-3 hidden md:table-cell">
                  <span className="swiss-label">Email</span>
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">
                  <span className="swiss-label">Telefone</span>
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">
                  <span className="swiss-label">CPF/CNPJ</span>
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title="Nenhum cliente cadastrado"
                      description="Adicione clientes para vincular às suas transações e acompanhar o histórico."
                      action={
                        <Button size="sm" onClick={handleOpenCreate} className="gap-2 bg-primary text-primary-foreground">
                          <Plus size={14} /> Novo Cliente
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-foreground flex items-center justify-center flex-shrink-0">
                          <span className="text-background text-xs font-bold">
                            {cliente.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{cliente.nome}</div>
                          {cliente.observacoes && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {cliente.observacoes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {cliente.email ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail size={11} />
                          {cliente.email}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {cliente.telefone ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone size={11} />
                          {cliente.telefone}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">
                        {cliente.cpfCnpj ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleOpenEdit(cliente)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(cliente.id)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal ───────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-md rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              {editingId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="swiss-label mb-1.5">Nome *</Label>
              <Input
                placeholder="Nome completo ou razão social"
                value={form.nome}
                onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value || undefined }))}
                />
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={form.telefone ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value || undefined }))}
                />
              </div>
            </div>
            <div>
              <Label className="swiss-label mb-1.5">CPF / CNPJ</Label>
              <Input
                placeholder="000.000.000-00"
                value={form.cpfCnpj ?? ""}
                onChange={(e) => setForm(f => ({ ...f, cpfCnpj: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Endereço</Label>
              <Input
                placeholder="Rua, número, cidade..."
                value={form.endereco ?? ""}
                onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Observações</Label>
              <Input
                placeholder="Notas sobre o cliente..."
                value={form.observacoes ?? ""}
                onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value || undefined }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>
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

      {/* ─── Delete Confirm ──────────────────────────────────────────── */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            O cliente será desativado. As transações vinculadas serão mantidas.
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
