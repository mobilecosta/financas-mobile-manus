import AppLayout from "@/components/AppLayout";
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
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Building2, Pencil, Plus, Tag, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoryForm {
  nome: string;
  tipo: "receita" | "despesa" | "ambos";
  cor: string;
}

const emptyCatForm: CategoryForm = { nome: "", tipo: "despesa", cor: "#dc2626" };

export default function Settings() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Empresa
  const { data: empresa } = trpc.empresa.get.useQuery();
  const [empresaForm, setEmpresaForm] = useState({ nome: "", cnpj: "", email: "", telefone: "", moeda: "BRL", limiteGastosMensal: "" });
  const [empresaEditing, setEmpresaEditing] = useState(false);

  const updateEmpresaMutation = trpc.empresa.update.useMutation({
    onSuccess: () => {
      utils.empresa.get.invalidate();
      setEmpresaEditing(false);
      toast.success("✅ Empresa atualizada com sucesso!");
    },
    onError: (e) => toast.error(`❌ Erro ao atualizar empresa. ${e.message}`),
  });

  const handleEditEmpresa = () => {
    setEmpresaForm({
      nome: empresa?.nome ?? "",
      cnpj: empresa?.cnpj ?? "",
      email: empresa?.email ?? "",
      telefone: empresa?.telefone ?? "",
      moeda: empresa?.moeda ?? "BRL",
      limiteGastosMensal: empresa?.limiteGastosMensal ? String(empresa.limiteGastosMensal) : "",
    });
    setEmpresaEditing(true);
  };

  // Categorias
  const { data: categorias } = trpc.categorias.list.useQuery();
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catEditingId, setCatEditingId] = useState<number | null>(null);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCatForm);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<number | null>(null);

  const createCatMutation = trpc.categorias.create.useMutation({
    onSuccess: () => {
      utils.categorias.list.invalidate();
      setCatModalOpen(false);
      setCatForm(emptyCatForm);
      toast.success("✅ Categoria criada!");
    },
    onError: (e) => toast.error(`❌ Erro ao criar categoria. ${e.message}`),
  });

  const updateCatMutation = trpc.categorias.update.useMutation({
    onSuccess: () => {
      utils.categorias.list.invalidate();
      setCatModalOpen(false);
      setCatEditingId(null);
      setCatForm(emptyCatForm);
      toast.success("✅ Categoria atualizada!");
    },
    onError: (e) => toast.error(`❌ Erro ao atualizar categoria. ${e.message}`),
  });

  const deleteCatMutation = trpc.categorias.delete.useMutation({
    onSuccess: () => {
      utils.categorias.list.invalidate();
      setCatDeleteConfirm(null);
      toast.success("Categoria excluída.");
    },
    onError: (e) => toast.error(`❌ Erro ao excluir categoria. ${e.message}`),
  });

  const handleOpenCreateCat = () => {
    setCatEditingId(null);
    setCatForm(emptyCatForm);
    setCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: any) => {
    setCatEditingId(cat.id);
    setCatForm({ nome: cat.nome, tipo: cat.tipo, cor: cat.cor });
    setCatModalOpen(true);
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nome) { toast.error("Informe o nome da categoria."); return; }
    if (catEditingId) {
      updateCatMutation.mutate({ id: catEditingId, ...catForm });
    } else {
      createCatMutation.mutate(catForm);
    }
  };

  const receitas = categorias?.filter((c) => c.tipo === "receita" || c.tipo === "ambos") ?? [];
  const despesas = categorias?.filter((c) => c.tipo === "despesa" || c.tipo === "ambos") ?? [];

  return (
    <AppLayout title="Configurações">
      <div className="p-6 space-y-8 max-w-3xl">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="swiss-accent-lg" />
            <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-8">
            Perfil, empresa e preferências do sistema
          </p>
        </div>

        {/* ─── User Profile ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <User size={14} className="text-muted-foreground" />
            <span className="swiss-label">Perfil do Usuário</span>
          </div>
          <div className="border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-foreground flex items-center justify-center flex-shrink-0">
                <span className="text-background text-lg font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-base">{user?.name ?? "—"}</div>
                <div className="text-sm text-muted-foreground">{user?.email ?? "—"}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                  ID: {user?.openId?.slice(0, 12)}...
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 ${user?.role === "admin" ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>
                {user?.role === "admin" ? "Admin" : "Usuário"}
              </span>
            </div>
            <div className="swiss-rule-light mt-4 mb-4" />
            <p className="text-xs text-muted-foreground">
              As informações de perfil são gerenciadas pelo provedor de autenticação Manus OAuth.
              Para alterar nome ou email, acesse as configurações da sua conta Manus.
            </p>
          </div>
        </section>

        {/* ─── Empresa ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 size={14} className="text-muted-foreground" />
              <span className="swiss-label">Dados da Empresa</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleEditEmpresa} className="gap-2 h-7 text-xs">
              <Pencil size={11} /> Editar
            </Button>
          </div>
          <div className="border border-border p-6">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Nome da Empresa", value: empresa?.nome },
                { label: "CNPJ", value: empresa?.cnpj },
                { label: "Email", value: empresa?.email },
                { label: "Telefone", value: empresa?.telefone },
                { label: "Moeda", value: empresa?.moeda ?? "BRL" },
                { label: "Limite de Gastos Mensal", value: empresa?.limiteGastosMensal ? `R$ ${Number(empresa.limiteGastosMensal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Não definido" },
              ].map((field) => (
                <div key={field.label}>
                  <div className="swiss-label mb-1">{field.label}</div>
                  <div className="text-sm font-medium">{field.value ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Categories ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Tag size={14} className="text-muted-foreground" />
              <span className="swiss-label">Categorias de Transações</span>
            </div>
            <Button size="sm" onClick={handleOpenCreateCat} className="gap-2 h-7 text-xs bg-primary text-primary-foreground hover:opacity-90">
              <Plus size={11} /> Nova Categoria
            </Button>
          </div>

          <div className="space-y-4">
            {/* Receitas */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-foreground inline-block" />
                Receitas ({receitas.length})
              </div>
              <div className="border border-border divide-y divide-border">
                {receitas.map((cat) => (
                  <div key={cat.id} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: cat.cor }} />
                    <span className="text-sm flex-1">{cat.nome}</span>
                    <span className="text-xs text-muted-foreground">{cat.tipo}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEditCat(cat)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setCatDeleteConfirm(cat.id)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
                {receitas.length === 0 && (
                  <div className="px-4 py-3 text-xs text-muted-foreground">Nenhuma categoria de receita</div>
                )}
              </div>
            </div>

            {/* Despesas */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary inline-block" />
                Despesas ({despesas.length})
              </div>
              <div className="border border-border divide-y divide-border">
                {despesas.map((cat) => (
                  <div key={cat.id} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: cat.cor }} />
                    <span className="text-sm flex-1">{cat.nome}</span>
                    <span className="text-xs text-muted-foreground">{cat.tipo}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEditCat(cat)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setCatDeleteConfirm(cat.id)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
                {despesas.length === 0 && (
                  <div className="px-4 py-3 text-xs text-muted-foreground">Nenhuma categoria de despesa</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Edit Empresa Modal ──────────────────────────────────────── */}
      <Dialog open={empresaEditing} onOpenChange={setEmpresaEditing}>
        <DialogContent className="max-w-md rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              Editar Empresa
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateEmpresaMutation.mutate({
                nome: empresaForm.nome || undefined,
                cnpj: empresaForm.cnpj || undefined,
                email: empresaForm.email || undefined,
                telefone: empresaForm.telefone || undefined,
                moeda: empresaForm.moeda || undefined,
                limiteGastosMensal: empresaForm.limiteGastosMensal || undefined,
              });
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <Label className="swiss-label mb-1.5">Nome da Empresa</Label>
              <Input value={empresaForm.nome} onChange={(e) => setEmpresaForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">CNPJ</Label>
                <Input placeholder="00.000.000/0001-00" value={empresaForm.cnpj} onChange={(e) => setEmpresaForm(f => ({ ...f, cnpj: e.target.value }))} />
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Moeda</Label>
                <Select value={empresaForm.moeda} onValueChange={(v) => setEmpresaForm(f => ({ ...f, moeda: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL — Real</SelectItem>
                    <SelectItem value="USD">USD — Dólar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="swiss-label mb-1.5">Email</Label>
                <Input type="email" value={empresaForm.email} onChange={(e) => setEmpresaForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label className="swiss-label mb-1.5">Telefone</Label>
                <Input value={empresaForm.telefone} onChange={(e) => setEmpresaForm(f => ({ ...f, telefone: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Limite de Gastos Mensal (R$)</Label>
              <Input type="number" step="0.01" min="0" placeholder="0,00" value={empresaForm.limiteGastosMensal} onChange={(e) => setEmpresaForm(f => ({ ...f, limiteGastosMensal: e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">Você receberá alertas quando atingir 90% deste limite.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEmpresaEditing(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:opacity-90" disabled={updateEmpresaMutation.isPending}>
                {updateEmpresaMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Category Modal ──────────────────────────────────────────── */}
      <Dialog open={catModalOpen} onOpenChange={(open) => { setCatModalOpen(open); if (!open) { setCatEditingId(null); setCatForm(emptyCatForm); } }}>
        <DialogContent className="max-w-sm rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              {catEditingId ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCatSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="swiss-label mb-1.5">Nome *</Label>
              <Input placeholder="Ex: Alimentação" value={catForm.nome} onChange={(e) => setCatForm(f => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Tipo *</Label>
              <Select value={catForm.tipo} onValueChange={(v) => setCatForm(f => ({ ...f, tipo: v as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="swiss-label mb-1.5">Cor</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={catForm.cor} onChange={(e) => setCatForm(f => ({ ...f, cor: e.target.value }))} className="w-10 h-10 border border-border cursor-pointer" />
                <span className="text-xs text-muted-foreground font-mono">{catForm.cor}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setCatModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:opacity-90" disabled={createCatMutation.isPending || updateCatMutation.isPending}>
                {createCatMutation.isPending || updateCatMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Category Confirm ─────────────────────────────────── */}
      <Dialog open={catDeleteConfirm !== null} onOpenChange={() => setCatDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-none border-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="swiss-accent" />
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            A categoria será excluída. As transações vinculadas perderão a categorização.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setCatDeleteConfirm(null)}>Cancelar</Button>
            <Button className="flex-1 bg-primary text-primary-foreground hover:opacity-90" disabled={deleteCatMutation.isPending} onClick={() => catDeleteConfirm && deleteCatMutation.mutate({ id: catDeleteConfirm })}>
              {deleteCatMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
