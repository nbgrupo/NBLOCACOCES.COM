import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Settings, Download, RotateCcw, Save, Plus, Trash2, Upload, Loader2, Video, LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useConfig } from "@/context/ConfigContext";
import { useEditMode } from "@/context/EditModeContext";
import { uploadToServer } from "@/lib/upload";
import AdminLoginModal from "@/components/site/AdminLoginModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const TOKEN_KEY = "nb_admin_token";

function Field({ label, value, onChange, type = "text", testid }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/60">{label}</Label>
      <Input
        data-testid={testid}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className="bg-[#0e0e0f] border-white/10 text-white text-sm"
      />
    </div>
  );
}

function Area({ label, value, onChange, testid }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/60">{label}</Label>
      <Textarea
        data-testid={testid}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#0e0e0f] border-white/10 text-white text-sm min-h-[70px]"
      />
    </div>
  );
}

function DropZone({ accept, maxMB, onFile, busy, children }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Arquivo muito grande (máx. ${maxMB}MB).`);
      return;
    }
    onFile(file);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };
  const onInputChange = (e) => processFile(e.target.files?.[0]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Zona de upload — arraste ou clique"
      data-dragging={dragging}
      onClick={() => !busy && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEnter={onDragOver}
      onDrop={onDrop}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 select-none
        ${dragging ? "border-accent-nb bg-accent-nb/10 scale-[1.02]" : "border-white/15 hover:border-accent-nb/50 hover:bg-white/5"}
        ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onInputChange}
        className="hidden"
      />
      {children({ dragging, busy, inputRef })}
    </div>
  );
}

function ImageField({ label, value, onChange, testid }) {
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    setBusy(true);
    try {
      const url = await uploadToServer(file);
      onChange(url);
      toast.success("Imagem enviada! Clique em Salvar para publicar.");
    } catch {
      toast.error("Falha ao enviar a imagem.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/60">{label}</Label>
      <DropZone
        accept="image/png,image/jpeg,image/webp,image/gif"
        maxMB={10}
        onFile={handleFile}
        busy={busy}
      >
        {({ dragging, busy: b }) => (
          <div className="flex flex-col items-center gap-2 py-2" data-testid={testid}>
            {value ? (
              <img
                src={value}
                alt="preview"
                className="h-16 w-full object-contain rounded-lg mb-1"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                <Upload className="h-5 w-5 text-accent-nb" />
              </div>
            )}
            {b ? (
              <span className="text-xs text-white/50 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Enviando…
              </span>
            ) : (
              <span className="text-xs text-white/40">
                {dragging ? "Solte para enviar" : value ? "Arraste ou clique para trocar" : "Arraste ou clique para enviar"}
              </span>
            )}
          </div>
        )}
      </DropZone>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ou cole uma URL"
        className="bg-[#0e0e0f] border-white/10 text-white text-xs"
      />
    </div>
  );
}

function Group({ title, children, onAdd, addTestid }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-accent-nb">{title}</p>
        {onAdd ? (
          <button
            data-testid={addTestid}
            onClick={onAdd}
            className="inline-flex items-center gap-1 text-xs text-accent-nb hover:underline"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function ItemCard({ children, onRemove, removeTestid }) {
  return (
    <div className="space-y-2 rounded-lg border border-white/10 p-3 relative">
      {onRemove ? (
        <button
          onClick={onRemove}
          data-testid={removeTestid}
          className="absolute top-2 right-2 text-white/40 hover:text-red-400"
          aria-label="Remover item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {children}
    </div>
  );
}

export default function AdminPanel() {
  const { config, setConfig, saveToServer, resetConfig } = useConfig();
  const { setIsEditMode, isEditMode } = useEditMode();
  const [draft, setDraft] = useState(config);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const videoInputRef = useRef(null); // kept for backward-compat ref safety

  // Verify stored token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    axios
      .get(`${API}/admin/verify`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setIsAuthenticated(false);
      });
  }, []);

  const handleGearClick = () => {
    if (isAuthenticated) {
      setOpen(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setIsAuthenticated(true);
    setShowLogin(false);
    setOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
    setOpen(false);
    toast.success("Sessão encerrada.");
  };

  // Reset draft only when the panel is opened (never mid-edit)
  useEffect(() => {
    if (open) setDraft(structuredClone(config));
  }, [open]);

  const edit = (mutator) =>
    setDraft((prev) => {
      const d = structuredClone(prev);
      mutator(d);
      return d;
    });

  // handleVideoUpload removed — video upload now uses DropZone component inline

  const handleSave = async () => {
    setSaving(true);
    setConfig(draft);
    try {
      await saveToServer(draft);
      toast.success("Configurações salvas e publicadas!");
    } catch (e) {
      toast.warning("Salvo localmente (sem conexão com o servidor).");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nb-locacoes-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exportado!");
  };

  const handleReset = async () => {
    await resetConfig();
    setOpen(false);
    toast.success("Configurações restauradas ao padrão.");
  };

  return (
    <>
      {/* Gear button — standalone, controls auth flow */}
      <button
        data-testid="admin-gear-btn"
        aria-label="Painel de configurações"
        onClick={handleGearClick}
        className="fixed bottom-6 right-24 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full glass-dark border border-white/10 text-white/70 transition-all duration-500 hover:text-accent-nb hover:rotate-90"
      >
        <Settings className="h-5 w-5" />
      </button>

      {showLogin && (
        <AdminLoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md glass-dark border-white/10 text-white overflow-y-auto p-0"
      >
        <SheetHeader className="p-5 border-b border-white/10 sticky top-0 glass-dark z-10">
          <SheetTitle className="text-white font-display flex items-center gap-2">
            <Settings className="h-4 w-4 text-accent-nb" /> Painel de Configurações
          </SheetTitle>
          <SheetDescription className="sr-only">
            Edite todos os textos, cores, imagens e informações de contato do site.
          </SheetDescription>
          <div className="flex gap-2 pt-2">
            <Button
              data-testid="admin-visual-mode-btn"
              onClick={() => { setOpen(false); setIsEditMode(true); }}
              size="sm"
              variant="outline"
              className="flex-1 border-accent-nb/40 text-accent-nb hover:bg-accent-nb/10 gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar na página
            </Button>
          </div>
          <div className="flex gap-2 pt-1">
            <Button data-testid="admin-save-btn" onClick={handleSave} disabled={saving} size="sm" className="flex-1 bg-accent-nb text-[#0a0a0a] hover:bg-accent-nb/90">
              <Save className="h-4 w-4 mr-1" /> Salvar
            </Button>
            <Button data-testid="admin-export-btn" onClick={handleExport} size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5">
              <Download className="h-4 w-4" />
            </Button>
            <Button data-testid="admin-reset-btn" onClick={handleReset} size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button data-testid="admin-logout-btn" onClick={handleLogout} size="sm" variant="outline" className="border-white/15 text-white hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="conteudo" className="p-5">
          <TabsList className="grid grid-cols-4 bg-[#0e0e0f] w-full">
            <TabsTrigger value="conteudo" data-testid="tab-conteudo" className="text-xs data-[state=active]:bg-accent-nb data-[state=active]:text-[#0a0a0a]">Conteúdo</TabsTrigger>
            <TabsTrigger value="cores" data-testid="tab-cores" className="text-xs data-[state=active]:bg-accent-nb data-[state=active]:text-[#0a0a0a]">Cores</TabsTrigger>
            <TabsTrigger value="imagens" data-testid="tab-imagens" className="text-xs data-[state=active]:bg-accent-nb data-[state=active]:text-[#0a0a0a]">Imagens</TabsTrigger>
            <TabsTrigger value="contato" data-testid="tab-contato" className="text-xs data-[state=active]:bg-accent-nb data-[state=active]:text-[#0a0a0a]">Contato</TabsTrigger>
          </TabsList>

          {/* ---------- CONTEUDO ---------- */}
          <TabsContent value="conteudo" className="space-y-7 mt-5">
            <Group title="Marca">
              <Field label="Nome" value={draft.brand.name} onChange={(v) => edit((d) => (d.brand.name = v))} />
              <Field label="Slogan" value={draft.brand.tagline} onChange={(v) => edit((d) => (d.brand.tagline = v))} />
            </Group>

            <Group title="Navbar">
              <Field label="CTA (desktop)" value={draft.navbar?.cta} onChange={(v) => edit((d) => (d.navbar.cta = v))} />
              <Field label="CTA (mobile)" value={draft.navbar?.ctaMobile} onChange={(v) => edit((d) => (d.navbar.ctaMobile = v))} />
              {(draft.navbar?.links || []).map((l, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Field label={`Link ${i + 1} — nome`} value={l.label} onChange={(v) => edit((d) => (d.navbar.links[i].label = v))} />
                  <Field label="ID âncora" value={l.id} onChange={(v) => edit((d) => (d.navbar.links[i].id = v))} />
                </div>
              ))}
            </Group>

            <Group
              title="Faixa animada (Marquee)"
              addTestid="admin-add-marquee-word"
              onAdd={() => edit((d) => d.marquee.words.push("NOVO TEXTO"))}
            >
              <Field label="Separador" value={draft.marquee?.separator} onChange={(v) => edit((d) => (d.marquee.separator = v))} />
              {(draft.marquee?.words || []).map((w, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Field label={`Palavra ${i + 1}`} value={w} onChange={(v) => edit((d) => (d.marquee.words[i] = v))} />
                  </div>
                  <button
                    onClick={() => edit((d) => d.marquee.words.splice(i, 1))}
                    data-testid={`remove-marquee-${i}`}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-red-400 mb-0.5"
                    aria-label="Remover palavra"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </Group>

            <Group title="Preços">
              <Field label='Sufixo de período (ex: "mês", "semana")' value={draft.global?.pricePeriod} onChange={(v) => edit((d) => { if (!d.global) d.global = {}; d.global.pricePeriod = v; })} />
              <Field label='Rótulo "a partir de"' value={draft.global?.priceFromLabel} onChange={(v) => edit((d) => { if (!d.global) d.global = {}; d.global.priceFromLabel = v; })} />
            </Group>

            <Group title="Hero">
              <Field label="Badge" value={draft.hero.badge} onChange={(v) => edit((d) => (d.hero.badge = v))} />
              <Field label="Título linha 1" testid="edit-hero-title1" value={draft.hero.titleLine1} onChange={(v) => edit((d) => (d.hero.titleLine1 = v))} />
              <Field label="Título linha 2" value={draft.hero.titleLine2} onChange={(v) => edit((d) => (d.hero.titleLine2 = v))} />
              <Area label="Subtítulo (parágrafo)" testid="edit-hero-subtitle" value={draft.hero.subtitle} onChange={(v) => edit((d) => (d.hero.subtitle = v))} />
              <Field label="CTA primário" value={draft.hero.ctaPrimary} onChange={(v) => edit((d) => (d.hero.ctaPrimary = v))} />
              <Field label="CTA secundário" value={draft.hero.ctaSecondary} onChange={(v) => edit((d) => (d.hero.ctaSecondary = v))} />
            </Group>

            <Group title="Contador">
              <Field label="Valor" type="number" value={draft.counter.value} onChange={(v) => edit((d) => (d.counter.value = v))} />
              <Field label="Sufixo" value={draft.counter.suffix} onChange={(v) => edit((d) => (d.counter.suffix = v))} />
              <Field label="Legenda" value={draft.counter.label} onChange={(v) => edit((d) => (d.counter.label = v))} />
            </Group>

            <Group
              title="Como Funciona"
              addTestid="admin-add-step"
              onAdd={() => edit((d) => d.comoFunciona.steps.push({ title: "Novo passo", desc: "Descrição do passo." }))}
            >
              <Field label="Título da seção" value={draft.comoFunciona.title} onChange={(v) => edit((d) => (d.comoFunciona.title = v))} />
              <Area label="Subtítulo" value={draft.comoFunciona.subtitle} onChange={(v) => edit((d) => (d.comoFunciona.subtitle = v))} />
              {draft.comoFunciona.steps.map((s, i) => (
                <ItemCard key={i} removeTestid={`remove-step-${i}`} onRemove={() => edit((d) => d.comoFunciona.steps.splice(i, 1))}>
                  <Field label={`Passo ${i + 1} — título`} value={s.title} onChange={(v) => edit((d) => (d.comoFunciona.steps[i].title = v))} />
                  <Area label="Descrição" value={s.desc} onChange={(v) => edit((d) => (d.comoFunciona.steps[i].desc = v))} />
                </ItemCard>
              ))}
            </Group>

            <Group
              title="Diferenciais"
              addTestid="admin-add-diferencial"
              onAdd={() => edit((d) => d.diferenciais.items.push({ icon: "sparkles", title: "Novo diferencial", desc: "Descrição." }))}
            >
              <Field label="Título da seção" value={draft.diferenciais.title} onChange={(v) => edit((d) => (d.diferenciais.title = v))} />
              <Area label="Subtítulo" value={draft.diferenciais.subtitle} onChange={(v) => edit((d) => (d.diferenciais.subtitle = v))} />
              {draft.diferenciais.items.map((it, i) => (
                <ItemCard key={i} removeTestid={`remove-diferencial-${i}`} onRemove={() => edit((d) => d.diferenciais.items.splice(i, 1))}>
                  <Field label="Ícone (wallet, shield, wrench, repeat, smartphone, clock)" value={it.icon} onChange={(v) => edit((d) => (d.diferenciais.items[i].icon = v))} />
                  <Field label="Título" value={it.title} onChange={(v) => edit((d) => (d.diferenciais.items[i].title = v))} />
                  <Area label="Descrição" value={it.desc} onChange={(v) => edit((d) => (d.diferenciais.items[i].desc = v))} />
                </ItemCard>
              ))}
            </Group>

            <Group
              title="Frota — categorias"
              addTestid="admin-add-category"
              onAdd={() => edit((d) => d.frota.categories.push("Nova"))}
            >
              <Field label="Título da seção" value={draft.frota.title} onChange={(v) => edit((d) => (d.frota.title = v))} />
              <Area label="Subtítulo" value={draft.frota.subtitle} onChange={(v) => edit((d) => (d.frota.subtitle = v))} />
              {draft.frota.categories.map((cat, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Field label={`Categoria ${i + 1}`} value={cat} onChange={(v) => edit((d) => (d.frota.categories[i] = v))} />
                  </div>
                  <button
                    onClick={() => edit((d) => d.frota.categories.splice(i, 1))}
                    data-testid={`remove-category-${i}`}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-red-400 mb-0.5"
                    aria-label="Remover categoria"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </Group>

            <Group
              title="Frota — motos"
              addTestid="admin-add-bike"
              onAdd={() =>
                edit((d) =>
                  d.frota.bikes.push({
                    id: `bike-${Date.now()}`,
                    name: "Nova moto",
                    category: "Street",
                    price: 399,
                    specs: "",
                    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=60",
                  })
                )
              }
            >
              {draft.frota.bikes.map((b, i) => (
                <ItemCard key={b.id} removeTestid={`remove-bike-${i}`} onRemove={() => edit((d) => d.frota.bikes.splice(i, 1))}>
                  <Field label="Nome" value={b.name} onChange={(v) => edit((d) => (d.frota.bikes[i].name = v))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Categoria" value={b.category} onChange={(v) => edit((d) => (d.frota.bikes[i].category = v))} />
                    <Field label="R$/mês" type="number" testid={`edit-bike-price-${b.id}`} value={b.price} onChange={(v) => edit((d) => (d.frota.bikes[i].price = v))} />
                  </div>
                  <Field label="Ficha (specs)" value={b.specs} onChange={(v) => edit((d) => (d.frota.bikes[i].specs = v))} />
                  <ImageField label="Imagem" testid={`edit-bike-image-${b.id}`} value={b.image} onChange={(v) => edit((d) => (d.frota.bikes[i].image = v))} />
                </ItemCard>
              ))}
            </Group>

            <Group
              title="Depoimentos"
              addTestid="admin-add-depoimento"
              onAdd={() => edit((d) => d.depoimentos.items.push({ name: "Nome", role: "Cargo · Cidade", rating: 5, text: "Depoimento...", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=60" }))}
            >
              <Field label="Título da seção" value={draft.depoimentos.title} onChange={(v) => edit((d) => (d.depoimentos.title = v))} />
              {draft.depoimentos.items.map((t, i) => (
                <ItemCard key={i} removeTestid={`remove-depoimento-${i}`} onRemove={() => edit((d) => d.depoimentos.items.splice(i, 1))}>
                  <Field label="Nome" value={t.name} onChange={(v) => edit((d) => (d.depoimentos.items[i].name = v))} />
                  <Field label="Cargo/Local" value={t.role} onChange={(v) => edit((d) => (d.depoimentos.items[i].role = v))} />
                  <Area label="Depoimento" value={t.text} onChange={(v) => edit((d) => (d.depoimentos.items[i].text = v))} />
                  <Field label="Nota (1-5)" type="number" value={t.rating} onChange={(v) => edit((d) => (d.depoimentos.items[i].rating = v))} />
                  <ImageField label="Foto" testid={`edit-depo-image-${i}`} value={t.photo} onChange={(v) => edit((d) => (d.depoimentos.items[i].photo = v))} />
                </ItemCard>
              ))}
            </Group>

            <Group
              title="FAQ"
              addTestid="admin-add-faq"
              onAdd={() => edit((d) => d.faq.items.push({ q: "Nova pergunta", a: "Nova resposta" }))}
            >
              <Field label="Título da seção" value={draft.faq.title} onChange={(v) => edit((d) => (d.faq.title = v))} />
              {draft.faq.items.map((item, i) => (
                <ItemCard key={i} removeTestid={`remove-faq-${i}`} onRemove={() => edit((d) => d.faq.items.splice(i, 1))}>
                  <Field label="Pergunta" value={item.q} onChange={(v) => edit((d) => (d.faq.items[i].q = v))} />
                  <Area label="Resposta" value={item.a} onChange={(v) => edit((d) => (d.faq.items[i].a = v))} />
                </ItemCard>
              ))}
            </Group>

            <Group title="Localização (seção)">
              <Field label="Título da seção" value={draft.localizacao.title} onChange={(v) => edit((d) => (d.localizacao.title = v))} />
              <Area label="Subtítulo" value={draft.localizacao.subtitle} onChange={(v) => edit((d) => (d.localizacao.subtitle = v))} />
            </Group>

            <Group title="CTA Final">
              <Area label="Título" value={draft.ctaFinal.title} onChange={(v) => edit((d) => (d.ctaFinal.title = v))} />
              <Area label="Subtítulo" value={draft.ctaFinal.subtitle} onChange={(v) => edit((d) => (d.ctaFinal.subtitle = v))} />
              <Field label="Botão" value={draft.ctaFinal.button} onChange={(v) => edit((d) => (d.ctaFinal.button = v))} />
            </Group>
          </TabsContent>

          {/* ---------- CORES ---------- */}
          <TabsContent value="cores" className="space-y-6 mt-5">
            <div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
              <div>
                <p className="text-sm text-white">Cor de acento</p>
                <p className="text-xs text-white/50">{draft.colors.accent}</p>
              </div>
              <input
                data-testid="edit-color-accent"
                type="color"
                value={draft.colors.accent}
                onChange={(e) => edit((d) => (d.colors.accent = e.target.value))}
                className="h-10 w-16 rounded cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
              <div>
                <p className="text-sm text-white">Cor de fundo</p>
                <p className="text-xs text-white/50">{draft.colors.background}</p>
              </div>
              <input
                data-testid="edit-color-bg"
                type="color"
                value={draft.colors.background}
                onChange={(e) => edit((d) => (d.colors.background = e.target.value))}
                className="h-10 w-16 rounded cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["#00E5FF", "#2563EB", "#16A34A", "#EA580C", "#DB2777", "#7C3AED"].map((c) => (
                <button
                  key={c}
                  onClick={() => edit((d) => (d.colors.accent = c))}
                  className="h-9 w-9 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["#F4F5F7", "#FFFFFF", "#EEF2FF", "#F1F5F9", "#FFF7ED", "#0E1116"].map((c) => (
                <button
                  key={c}
                  onClick={() => edit((d) => (d.colors.background = c))}
                  className="h-9 w-9 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: c }}
                  aria-label={`Fundo ${c}`}
                />
              ))}
            </div>
            <p className="text-xs text-white/40">Clique em &quot;Salvar&quot; para publicar as cores.</p>
          </TabsContent>

          {/* ---------- IMAGENS ---------- */}
          <TabsContent value="imagens" className="space-y-6 mt-5">
            <ImageField label="Imagem do Hero" testid="edit-hero-image" value={draft.hero.image} onChange={(v) => edit((d) => (d.hero.image = v))} />

            <div className="space-y-3 rounded-lg border border-accent-nb/30 p-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Vídeo de fundo do Hero</p>
              <DropZone
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                maxMB={60}
                onFile={async (file) => {
                  setUploading(true);
                  try {
                    const fullUrl = await uploadToServer(file);
                    edit((d) => (d.hero.videoUrl = fullUrl));
                    toast.success("Vídeo enviado! Clique em Salvar para publicar.");
                  } catch {
                    toast.error("Falha ao enviar o vídeo.");
                  } finally {
                    setUploading(false);
                  }
                }}
                busy={uploading}
              >
                {({ dragging, busy: b }) => (
                  <div className="flex flex-col items-center gap-2 py-3" data-testid="hero-video-upload-btn">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                      {b ? <Loader2 className="h-5 w-5 animate-spin text-accent-nb" /> : <Video className="h-5 w-5 text-accent-nb" />}
                    </div>
                    <span className="text-xs text-white/40">
                      {b ? "Enviando vídeo…" : dragging ? "Solte para enviar" : "Arraste um vídeo ou clique para enviar (máx. 60MB)"}
                    </span>
                  </div>
                )}
              </DropZone>
              {draft.hero.videoUrl ? (
                <div className="relative overflow-hidden rounded-lg border border-white/10">
                  <video src={draft.hero.videoUrl} className="w-full h-28 object-cover" muted loop autoPlay playsInline />
                  <button
                    data-testid="hero-video-remove"
                    onClick={() => edit((d) => (d.hero.videoUrl = ""))}
                    className="absolute top-1.5 right-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-red-400"
                    aria-label="Remover vídeo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Video className="h-4 w-4" /> Nenhum vídeo. Usando fundo padrão.
                </div>
              )}
              <Field label="Ou cole uma URL de vídeo (MP4/WebM)" testid="edit-hero-video" value={draft.hero.videoUrl} onChange={(v) => edit((d) => (d.hero.videoUrl = v))} />
              <ImageField label="Imagem de capa (poster)" testid="edit-hero-video-poster" value={draft.hero.videoPoster} onChange={(v) => edit((d) => (d.hero.videoPoster = v))} />
            </div>

            <Group title="Frota">
              {draft.frota.bikes.map((b, i) => (
                <ImageField key={b.id} label={b.name} testid={`edit-bike-image2-${b.id}`} value={b.image} onChange={(v) => edit((d) => (d.frota.bikes[i].image = v))} />
              ))}
            </Group>

            <Group title="Depoimentos">
              {draft.depoimentos.items.map((t, i) => (
                <ImageField key={i} label={t.name} testid={`edit-depo-image2-${i}`} value={t.photo} onChange={(v) => edit((d) => (d.depoimentos.items[i].photo = v))} />
              ))}
            </Group>
          </TabsContent>

          {/* ---------- CONTATO ---------- */}
          <TabsContent value="contato" className="space-y-6 mt-5">
            <Group title="Localização">
              <Field label="Endereço" testid="edit-local-address" value={draft.localizacao.address} onChange={(v) => edit((d) => (d.localizacao.address = v))} />
              <Field label="Horário" value={draft.localizacao.hours} onChange={(v) => edit((d) => (d.localizacao.hours = v))} />
              <Field label="Telefone" value={draft.localizacao.phone} onChange={(v) => edit((d) => (d.localizacao.phone = v))} />
              <Field label="WhatsApp" value={draft.localizacao.whatsapp} onChange={(v) => edit((d) => (d.localizacao.whatsapp = v))} />
              <div className="rounded-lg border border-accent-nb/30 p-3 space-y-3">
                <p className="text-xs uppercase tracking-widest text-accent-nb">Mapa (CEP ou endereço completo)</p>
                <Field
                  label="CEP ou endereço (ex: 01310-100 ou Av. Paulista, 1000, São Paulo)"
                  testid="edit-local-cep"
                  value={draft.localizacao.mapQuery || ""}
                  onChange={(v) => edit((d) => {
                    d.localizacao.mapQuery = v;
                    const q = encodeURIComponent(v);
                    d.localizacao.mapEmbed = `https://www.google.com/maps?q=${q}&output=embed`;
                    d.localizacao.mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
                  })}
                />
                <p className="text-xs text-white/40">Preencha o campo acima e o mapa será atualizado automaticamente. Ou edite a URL diretamente:</p>
                <Area label="URL embed do mapa (avançado)" value={draft.localizacao.mapEmbed} onChange={(v) => edit((d) => (d.localizacao.mapEmbed = v))} />
              </div>
              <Field label='Texto do botão "Como chegar"' value={draft.localizacao.comoChegar} onChange={(v) => edit((d) => (d.localizacao.comoChegar = v))} />
              <Field label='Texto do botão "WhatsApp"' value={draft.localizacao.falarWhats} onChange={(v) => edit((d) => (d.localizacao.falarWhats = v))} />
            </Group>

            <Group title="WhatsApp flutuante">
              <Field label="Número (só dígitos, com DDI)" testid="edit-whatsapp-number" value={draft.whatsapp.number} onChange={(v) => edit((d) => (d.whatsapp.number = v))} />
              <Area label="Mensagem pré-preenchida" value={draft.whatsapp.message} onChange={(v) => edit((d) => (d.whatsapp.message = v))} />
            </Group>

            <Group title="Footer / Rodapé">
              <Area label="Descrição" value={draft.footer.description} onChange={(v) => edit((d) => (d.footer.description = v))} />
              <Field label="Instagram (@)" value={draft.footer.instagram} onChange={(v) => edit((d) => { d.footer.instagram = v; d.footer.contact.instagram = v; })} />
              <Field label="Instagram URL" value={draft.footer.instagramUrl} onChange={(v) => edit((d) => (d.footer.instagramUrl = v))} />
              <Field label="Rua e número" value={draft.footer.address.street} onChange={(v) => edit((d) => (d.footer.address.street = v))} />
              <Field label="Bairro" value={draft.footer.address.district} onChange={(v) => edit((d) => (d.footer.address.district = v))} />
              <Field label="Cidade/UF" value={draft.footer.address.city} onChange={(v) => edit((d) => (d.footer.address.city = v))} />
              <Field label="CEP" value={draft.footer.address.cep} onChange={(v) => edit((d) => (d.footer.address.cep = v))} />
              <Field label="Telefone" value={draft.footer.contact.phone} onChange={(v) => edit((d) => (d.footer.contact.phone = v))} />
              <Field label="WhatsApp" value={draft.footer.contact.whatsapp} onChange={(v) => edit((d) => (d.footer.contact.whatsapp = v))} />
              <Field label="E-mail" value={draft.footer.contact.email} onChange={(v) => edit((d) => (d.footer.contact.email = v))} />
              <Field label="CNPJ" value={draft.footer.cnpj} onChange={(v) => edit((d) => (d.footer.cnpj = v))} />
              <Field label='Título coluna "Links rápidos"' value={draft.footer.headings?.links} onChange={(v) => edit((d) => { if (!d.footer.headings) d.footer.headings = {}; d.footer.headings.links = v; })} />
              <Field label='Título coluna "Endereço"' value={draft.footer.headings?.address} onChange={(v) => edit((d) => { if (!d.footer.headings) d.footer.headings = {}; d.footer.headings.address = v; })} />
              <Field label='Título coluna "Contato"' value={draft.footer.headings?.contact} onChange={(v) => edit((d) => { if (!d.footer.headings) d.footer.headings = {}; d.footer.headings.contact = v; })} />
              <Field label="Texto: Política de Privacidade" value={draft.footer.legal?.privacy} onChange={(v) => edit((d) => { if (!d.footer.legal) d.footer.legal = {}; d.footer.legal.privacy = v; })} />
              <Field label="Texto: Termos de Uso" value={draft.footer.legal?.terms} onChange={(v) => edit((d) => { if (!d.footer.legal) d.footer.legal = {}; d.footer.legal.terms = v; })} />
            </Group>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
    </>
  );
}
