# PRD — NB Locações (Landing Page de Assinatura de Motos)

## Problem Statement (original)
Landing page completa para a NB Locações (assinatura de motos): mensalidade fixa, sem entrada,
IPVA/seguro/manutenção inclusos, 100% digital. Estética futurista/dark com acento ciano #00E5FF,
fontes Poppins/Inter, glassmorphism, animações premium (framer-motion + lenis). Inclui Hero cinético,
Como Funciona, Diferenciais (bento), Frota com filtros, Simulador dinâmico, Social Proof, FAQ,
Localização (Google Maps embed), CTA final, Footer expandido (4 colunas), Painel Admin (engrenagem)
editável em tempo real com tabs (Conteúdo/Cores/Imagens/Contato), localStorage + export JSON,
WhatsApp flutuante e botão voltar ao topo.

## Architecture
- **Frontend**: React 19 + CRACO + Tailwind. framer-motion (scroll reveal, masked hero, parallax),
  lenis (smooth scroll), react-fast-marquee, lucide-react, shadcn/ui (Sheet, Tabs, Accordion, Slider,
  Input, Textarea, Button, Sonner toaster).
- **Estado/config**: `ConfigContext` (deep-merge default + localStorage + backend). Cor de acento
  aplicada via CSS var `--nb-accent` (+ `--primary`/`--ring` para shadcn) — edição em tempo real.
- **Backend**: FastAPI + MongoDB (motor). Persistência da config do site + captura de leads.
  - `GET /api/config` · `PUT /api/config` · `DELETE /api/config`
  - `POST /api/leads` · `GET /api/leads`
- **Sem autenticação** (painel admin aberto via engrenagem, conforme brief).

## Implemented (2026-08-04 — iteração 2)
- **Marquee dinâmico**: `EditorialMarquee.jsx` consome `config.marquee.words` e `config.marquee.separator`; Admin Panel tem seção "FAIXA ANIMADA" com add/remove de palavras e separador editável.
- **Período de preço editável**: Adicionado `config.global.pricePeriod` (padrão "mês") e `config.global.priceFromLabel` (padrão "a partir de"). Hero e Frota usam esses valores. Campo "PREÇOS" no Admin Panel.
- **Localização via CEP/endereço**: Campo "CEP ou endereço" no Admin (aba Contato) gera automaticamente a URL embed do Google Maps e o link "Como chegar" sem necessidade de API key.
- **Botões da Localização editáveis**: `Localizacao.jsx` usa `data.comoChegar` e `data.falarWhats`; campos no Admin.
- **Footer totalmente dinâmico**: Cabeçalhos das colunas (`config.footer.headings`) e textos legais (`config.footer.legal`) editáveis. Links rápidos usam `config.navbar.links`.
- **Navbar no Admin**: Seção para editar CTA desktop/mobile e labels dos links de navegação.
- **Testes**: 12/12 features passaram (iteration_2.json).
- Todas as 11 seções + elementos interativos do brief.
- Hero cinético com reveal linha-a-linha e parallax na moto; contador animado.
- Frota com filtros por categoria; Simulador (moto + slider de km) com preço em tempo real e CTA WhatsApp (grava lead).
- Painel Admin com tabs Conteúdo/Cores/Imagens/Contato — salva em localStorage + backend, exporta JSON, reset.
- WhatsApp flutuante (pulse) com mensagem pré-preenchida, botão voltar ao topo, nav glassmorphism.
- Localização com Google Maps embed (sem chave/API) em tema escuro + botão "Como chegar".
- SEO: meta tags, lang pt-BR, hierarquia H1/H2/H3, lazy loading de imagens.
- Verificado: curl (todos os endpoints) + screenshots (hero, frota, simulador, localização, footer, admin com troca de cor ao vivo).

## Implemented (2026-09-16 — iteração 3)
- **Proteção do Admin Panel**: Modal de login com JWT. Usuário: `Admin`, Senha: `esenha132` (via env vars). Token 8h em localStorage. Botão de logout no painel.
- **Upload na nuvem**: Migrado de armazenamento local para Emergent Object Storage. Arquivos persistentes entre deploys.
- **Endpoints de auth**: `POST /api/admin/login`, `GET /api/admin/verify`.
- **Deployment check**: ✅ PASS — sem blockers, pronto para Kubernetes.
- **Testes**: 16/16 passaram (iteration_3.json).

## Notes
- Imagens são placeholders editáveis (o usuário informou que adicionará as próprias via Painel Admin → Imagens).
- Dados de contato/endereço/CNPJ são placeholders editáveis via Painel Admin → Contato.

## Backlog / Next
- P1: Drag-and-drop para upload de arquivos no Admin Panel.
- P1: Deploy do backend em serviço permanente + configurar `REACT_APP_BACKEND_URL` na Vercel.
- P2: Dashboard/página interna de listagem de leads.
- P2: Categorias "Custom"/"Premium" sem motos — adicionar modelos.
- Refactor: `AdminPanel.jsx` está com ~690 linhas — considerar divisão em sub-componentes.
