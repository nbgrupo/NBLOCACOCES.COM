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

## Implemented (2026-07-25)
- Todas as 11 seções + elementos interativos do brief.
- Hero cinético com reveal linha-a-linha e parallax na moto; contador animado.
- Frota com filtros por categoria; Simulador (moto + slider de km) com preço em tempo real e CTA WhatsApp (grava lead).
- Painel Admin com tabs Conteúdo/Cores/Imagens/Contato — salva em localStorage + backend, exporta JSON, reset.
- WhatsApp flutuante (pulse) com mensagem pré-preenchida, botão voltar ao topo, nav glassmorphism.
- Localização com Google Maps embed (sem chave/API) em tema escuro + botão "Como chegar".
- SEO: meta tags, lang pt-BR, hierarquia H1/H2/H3, lazy loading de imagens.
- Verificado: curl (todos os endpoints) + screenshots (hero, frota, simulador, localização, footer, admin com troca de cor ao vivo).

## Notes
- Imagens são placeholders editáveis (o usuário informou que adicionará as próprias via Painel Admin → Imagens).
- Dados de contato/endereço/CNPJ são placeholders editáveis via Painel Admin → Contato.

## Backlog / Next
- P1: Formulário de lead completo (nome/e-mail) no Simulador em vez de captura silenciosa.
- P2: Autenticação opcional para proteger o Painel Admin.
- P2: Página/rota de listagem de leads (dashboard interno).
- P2: Categorias "Custom"/"Premium" sem motos atualmente — adicionar modelos.
