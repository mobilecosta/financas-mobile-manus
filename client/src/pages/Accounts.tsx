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
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const ACCOUNT_TYPES = [
  { value: "corrente", label: "Conta Corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "investimento", label: "Investimento" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "outro", label: "Outro" },
];

interface AccountForm {
  nome: string;
  tipo: "corrente" | "poupanca" | "investimento" | "cartao_credito" | "outro";
  banco?: string;
  agencia?: string;
  numeroConta?: string;
  saldoInicial?: string;
  cor?: string;
}

const emptyForm: AccountForm = {
  nome: "",
  tipo: "corrente",
  cor: "#1a1a1a",
};

export default function Accounts() {
  const utils = trpc.useUtils();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: contas, isLoading } = trpc.contas.list.useQuery();

  const createMutation = trpc.contas.create.useMutation({
    onSuccess: () => {
      utils.contas.list.invalidate();
      setModalOpen(false);
      setForm(emptyForm);
      toast.success("✅ Conta criada com sucesso!");
    },
    onError: (e) => toast.error(`❌ Erro ao criar conta. ${e.message}`),
  });

  const updateMutation = trpc.contas.update.useMutation({
    onSuccess: () => {
      utils.contas.list.invalidate();
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success("✅ Conta atualizada com sucesso!");
    },
    onError: (e) => toast.error(`❌ Erro ao atualizar conta. ${e.message}`),
  });

  const deleteMutation = trpc.contas.delete.useMutation({
    onSuccess: () => {
      utils.contas.list.invalidate();
      setDeleteConfirm(null);
      toast.success("Conta excluída.");
    },
    onError: (e) => toast.error(`❌ Erro ao excluir. ${e.message}`),
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (conta: any) => {
    setEditingId(conta.id);
    setForm({
      nome: conta.nome,
      tipo: conta.tipo,
      banco: conta.banco ?? undefined,
      agencia: conta.agencia ?? undefined,
      numeroConta: conta.numeroConta ?? undefined,
      saldoInicial: conta.saldoInicial ? String(conta.saldoInicial) : undefined,
      cor: conta.cor ?? "#1a1a1a",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) { toast.error("Informe o nome da conta."); return; }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const totalSaldo = contas?.reduce((sum, c) => sum + (c as any).saldoAtual, 0) ?? 0;

  return (
    <AppLayout title="Contas">
      <div className="p-6 space-y-6">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="swiss-accent-lg" />
              <h1 className="text-2xl font-bold tracking-tight">Contas Bancárias</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              {contas?.length ?? 0} conta{(contas?.length ?? 0) !== 1 ? "s" : ""} cadastrada{(contas?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} />
            Nova Conta
          </Button>
        </div>

        {/* ─── Total Balance ───────────────────────────────────────── */}
        {!isLoading && contas && contas.length > 0 && (
          <div className="border border-foreground p-6 flex items-center justify-between">
            <div>
              <div className="swiss-label mb-1">Saldo Total Consolidado</div>
              <div className={`text-3xl font-bold font-mono tracking-tight ${totalSaldo >= 0 ? "text-foreground" : "text-primary"}`}>
                {formatCurrency(totalSaldo)}
              </div>
            </div>
            <span className="swiss-accent-xl" />
          </div>
        )}

        {/* ─── Accounts Grid ───────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-background p-6 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : !contas || contas.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Nenhuma conta cadastrada"
            description="Adicione suas contas bancárias para controlar o saldo e vincular transações."
            action={
              <Button size="sm" onClick={handleOpenCreate} className="gap-2 bg-primary text-primary-foreground">
                <Plus size={14} /> Nova Conta
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {contas.map((conta) => {
              const saldoAtual = (conta as any).saldoAtual as number;
              const typeLabel = ACCOUNT_TYPES.find((t) => t.value === conta.tipo)?.label ?? conta.tipo;
              return (
                <div key={conta.id} className="bg-background border border-border p-6 relative group">
                  {/* Color accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: conta.cor ?? "#1a1a1a" }} />
                  <div className="pl-3">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="swiss-label mb-1">{typeLabel}</div>
                        <h3 className="font-bold text-base">{conta.nome}</h3>
                        {conta.banco && (
                          <div className="text-xs text-muted-foreground mt-0.5">{conta.banco}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(conta)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(conta.id)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="swiss-rule-light mb-4" />
                    <div>
                      <div className="swiss-label mb-1">Saldo Atual</div>
                      <div className={`text-2xl font-bold font-mono tracking-tight ${saldoAtual >= 0 ? "text-foreground" : "text-primary"}`}>
                        {formatCurrency(saldoAtual)}
                      </div>
                    </div>
                    {(conta.agencia || conta.numeroConta) && (
                      <div className="mt-3 text-xs text-muted-foreground font-mono">
                        {conta.agencia && <span>Ag: {conta.agencia} </span>}
                        {conta.numeroConta && <span>Cc: {conta.numeroConta}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal ───────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-md rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              {editingId ? "Editar Conta" : "Nova Conta"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="swiss-label mb-1.5">Nome da Conta *</Label>
              <Input
                placeholder="Ex: Conta Principal"
                value={form.nome}
                onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm(f => ({ ...f, tipo: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Saldo Inicial (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.saldoInicial ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, saldoInicial: e.target.value || undefined }))}
                />
              </div>
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Banco</Label>
              <Input
                placeholder="Ex: Banco do Brasil"
                value={form.banco ?? ""}
                onChange={(e) => setForm(f => ({ ...f, banco: e.target.value || undefined }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Agência</Label>
                <Input
                  placeholder="0000"
                  value={form.agencia ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, agencia: e.target.value || undefined }))}
                />
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Número da Conta</Label>
                <Input
                  placeholder="00000-0"
                  value={form.numeroConta ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, numeroConta: e.target.value || undefined }))}
                />
              </div>
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Cor de Identificação</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.cor ?? "#1a1a1a"}
                  onChange={(e) => setForm(f => ({ ...f, cor: e.target.value }))}
                  className="w-10 h-10 border border-border cursor-pointer"
                />
                <span className="text-xs text-muted-foreground font-mono">{form.cor ?? "#1a1a1a"}</span>
              </div>
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
            A conta será desativada. As transações vinculadas serão mantidas.
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
