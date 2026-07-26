import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Settings, Download, RotateCcw, Save, Plus, Trash2, Upload, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { useConfig } from "@/context/ConfigContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

function ImageField({ label, value, onChange, testid }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/60">{label}</Label>
      <div className="flex gap-2 items-center">
        {value ? (
          <img src={value} alt="preview" className="h-12 w-12 rounded-lg object-cover border border-white/10" />
        ) : null}
        <Input
          data-testid={testid}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL da imagem"
          className="bg-[#0e0e0f] border-white/10 text-white text-sm flex-1"
        />
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { config, setConfig, saveToServer, resetConfig } = useConfig();
  const [draft, setDraft] = useState(config);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoInputRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    if (open) setDraft(structuredClone(config));
  }, [open, config]);

  const edit = (mutator) =>
    setDraft((prev) => {
      const d = structuredClone(prev);
      mutator(d);
      return d;
    });

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMB = 60;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Vídeo muito grande (máx. ${maxMB}MB).`);
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fullUrl = `${BACKEND_URL}${res.data.url}`;
      edit((d) => (d.hero.videoUrl = fullUrl));
      toast.success("Vídeo enviado! Clique em Salvar para publicar.");
    } catch (err) {
      toast.error("Falha ao enviar o vídeo.");
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          data-testid="admin-gear-btn"
          aria-label="Painel de configurações"
          className="fixed bottom-6 right-24 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full glass-strong border border-white/10 text-white/70 transition-all duration-500 hover:text-accent-nb hover:rotate-90"
        >
          <Settings className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md glass-strong border-white/10 text-white overflow-y-auto p-0"
      >
        <SheetHeader className="p-5 border-b border-white/10 sticky top-0 glass-strong z-10">
          <SheetTitle className="text-white font-display flex items-center gap-2">
            <Settings className="h-4 w-4 text-accent-nb" /> Painel de Configurações
          </SheetTitle>
          <div className="flex gap-2 pt-2">
            <Button data-testid="admin-save-btn" onClick={handleSave} disabled={saving} size="sm" className="flex-1 bg-accent-nb text-[#0a0a0a] hover:bg-accent-nb/90">
              <Save className="h-4 w-4 mr-1" /> Salvar
            </Button>
            <Button data-testid="admin-export-btn" onClick={handleExport} size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5">
              <Download className="h-4 w-4" />
            </Button>
            <Button data-testid="admin-reset-btn" onClick={handleReset} size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5">
              <RotateCcw className="h-4 w-4" />
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
          <TabsContent value="conteudo" className="space-y-6 mt-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Hero</p>
              <Field label="Badge" value={draft.hero.badge} onChange={(v) => edit((d) => (d.hero.badge = v))} />
              <Field label="Título linha 1" testid="edit-hero-title1" value={draft.hero.titleLine1} onChange={(v) => edit((d) => (d.hero.titleLine1 = v))} />
              <Field label="Título linha 2" value={draft.hero.titleLine2} onChange={(v) => edit((d) => (d.hero.titleLine2 = v))} />
              <Area label="Subtítulo" value={draft.hero.subtitle} onChange={(v) => edit((d) => (d.hero.subtitle = v))} />
              <Field label="CTA primário" value={draft.hero.ctaPrimary} onChange={(v) => edit((d) => (d.hero.ctaPrimary = v))} />
              <Field label="CTA secundário" value={draft.hero.ctaSecondary} onChange={(v) => edit((d) => (d.hero.ctaSecondary = v))} />
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Contador</p>
              <Field label="Valor" type="number" value={draft.counter.value} onChange={(v) => edit((d) => (d.counter.value = v))} />
              <Field label="Legenda" value={draft.counter.label} onChange={(v) => edit((d) => (d.counter.label = v))} />
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Frota — preços</p>
              {draft.frota.bikes.map((b, i) => (
                <div key={b.id} className="grid grid-cols-3 gap-2 items-end">
                  <div className="col-span-2">
                    <Field label={`Moto ${i + 1}`} value={b.name} onChange={(v) => edit((d) => (d.frota.bikes[i].name = v))} />
                  </div>
                  <Field label="R$/mês" type="number" testid={`edit-bike-price-${b.id}`} value={b.price} onChange={(v) => edit((d) => (d.frota.bikes[i].price = v))} />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Depoimentos</p>
              {draft.depoimentos.items.map((t, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                  <Field label="Nome" value={t.name} onChange={(v) => edit((d) => (d.depoimentos.items[i].name = v))} />
                  <Field label="Cargo/Local" value={t.role} onChange={(v) => edit((d) => (d.depoimentos.items[i].role = v))} />
                  <Area label="Depoimento" value={t.text} onChange={(v) => edit((d) => (d.depoimentos.items[i].text = v))} />
                  <Field label="Nota (1-5)" type="number" value={t.rating} onChange={(v) => edit((d) => (d.depoimentos.items[i].rating = v))} />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-accent-nb">FAQ</p>
                <button
                  data-testid="admin-add-faq"
                  onClick={() => edit((d) => d.faq.items.push({ q: "Nova pergunta", a: "Nova resposta" }))}
                  className="inline-flex items-center gap-1 text-xs text-accent-nb"
                >
                  <Plus className="h-3 w-3" /> Adicionar
                </button>
              </div>
              {draft.faq.items.map((item, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3 relative">
                  <button
                    onClick={() => edit((d) => d.faq.items.splice(i, 1))}
                    className="absolute top-2 right-2 text-white/40 hover:text-red-400"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <Field label="Pergunta" value={item.q} onChange={(v) => edit((d) => (d.faq.items[i].q = v))} />
                  <Area label="Resposta" value={item.a} onChange={(v) => edit((d) => (d.faq.items[i].a = v))} />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">CTA Final</p>
              <Area label="Título" value={draft.ctaFinal.title} onChange={(v) => edit((d) => (d.ctaFinal.title = v))} />
              <Field label="Botão" value={draft.ctaFinal.button} onChange={(v) => edit((d) => (d.ctaFinal.button = v))} />
            </div>
          </TabsContent>

          {/* ---------- CORES ---------- */}
          <TabsContent value="cores" className="space-y-6 mt-5">
            <div className="space-y-4">
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
                {["#00E5FF", "#00FF94", "#FF4D4D", "#FFB800", "#B24BF3", "#FF5CA8"].map((c) => (
                  <button
                    key={c}
                    onClick={() => edit((d) => (d.colors.accent = c))}
                    className="h-9 w-9 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: c }}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40">Clique em &quot;Salvar&quot; para publicar. A pré-visualização é aplicada ao salvar.</p>
            </div>
          </TabsContent>

          {/* ---------- IMAGENS ---------- */}
          <TabsContent value="imagens" className="space-y-6 mt-5">
            <ImageField label="Imagem do Hero" testid="edit-hero-image" value={draft.hero.image} onChange={(v) => edit((d) => (d.hero.image = v))} />
            <div className="space-y-3 rounded-lg border border-accent-nb/30 p-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Vídeo de fundo do Hero</p>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleVideoUpload}
                className="hidden"
                data-testid="hero-video-file-input"
              />
              <button
                data-testid="hero-video-upload-btn"
                onClick={() => videoInputRef.current && videoInputRef.current.click()}
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/25 bg-[#0e0e0f] px-4 py-4 text-sm text-white/70 transition-colors hover:border-accent-nb hover:text-accent-nb disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando vídeo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Enviar vídeo do dispositivo
                  </>
                )}
              </button>

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

              <Field
                label="Ou cole uma URL de vídeo (MP4/WebM)"
                testid="edit-hero-video"
                value={draft.hero.videoUrl}
                onChange={(v) => edit((d) => (d.hero.videoUrl = v))}
              />
              <ImageField
                label="Imagem de capa (poster)"
                testid="edit-hero-video-poster"
                value={draft.hero.videoPoster}
                onChange={(v) => edit((d) => (d.hero.videoPoster = v))}
              />
              <p className="text-[11px] text-white/40">
                Envie um arquivo (máx. 60MB) ou cole um link. Deixe em branco para usar o fundo padrão.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Frota</p>
              {draft.frota.bikes.map((b, i) => (
                <ImageField key={b.id} label={b.name} value={b.image} onChange={(v) => edit((d) => (d.frota.bikes[i].image = v))} />
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Depoimentos</p>
              {draft.depoimentos.items.map((t, i) => (
                <ImageField key={i} label={t.name} value={t.photo} onChange={(v) => edit((d) => (d.depoimentos.items[i].photo = v))} />
              ))}
            </div>
          </TabsContent>

          {/* ---------- CONTATO ---------- */}
          <TabsContent value="contato" className="space-y-6 mt-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Localização</p>
              <Field label="Endereço" value={draft.localizacao.address} onChange={(v) => edit((d) => (d.localizacao.address = v))} />
              <Field label="Horário" value={draft.localizacao.hours} onChange={(v) => edit((d) => (d.localizacao.hours = v))} />
              <Field label="Telefone" value={draft.localizacao.phone} onChange={(v) => edit((d) => (d.localizacao.phone = v))} />
              <Field label="WhatsApp" value={draft.localizacao.whatsapp} onChange={(v) => edit((d) => (d.localizacao.whatsapp = v))} />
              <Area label="Google Maps embed URL" value={draft.localizacao.mapEmbed} onChange={(v) => edit((d) => (d.localizacao.mapEmbed = v))} />
              <Area label="Link 'Como chegar'" value={draft.localizacao.mapsLink} onChange={(v) => edit((d) => (d.localizacao.mapsLink = v))} />
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">WhatsApp flutuante</p>
              <Field label="Número (só dígitos, com DDI)" testid="edit-whatsapp-number" value={draft.whatsapp.number} onChange={(v) => edit((d) => (d.whatsapp.number = v))} />
              <Area label="Mensagem pré-preenchida" value={draft.whatsapp.message} onChange={(v) => edit((d) => (d.whatsapp.message = v))} />
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-accent-nb">Footer / Rodapé</p>
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
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
