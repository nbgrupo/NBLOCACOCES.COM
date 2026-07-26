// Default editable content for the NB Locações landing page.
// Everything here can be overridden live via the Admin panel (localStorage + backend).

const defaultConfig = {
  colors: {
    accent: "#00E5FF",
    background: "#121212",
  },
  brand: {
    name: "NB Locações",
    tagline: "Assinatura de motos",
  },
  hero: {
    badge: "Plano Conquiste",
    titleLine1: "A LOCAÇÃO QUE TE",
    titleLine2: "TRANSFORMA EM DONO",
    subtitle:
      "Assine sua moto em minutos. Sem entrada, sem burocracia, com tudo incluso.",
    ctaPrimary: "Simular agora",
    ctaSecondary: "Ver frotas",
    image:
      "https://images.unsplash.com/photo-1656420731892-a4ece094df5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHw0fHxtb3RvcmN5Y2xlJTIwZGFyayUyMGJhY2tncm91bmQlMjBzdHVkaW98ZW58MHx8fHwxNzg1MDA4NjU5fDA&ixlib=rb-4.1.0&q=85",
    videoUrl: "",
    videoPoster: "",
  },
  counter: {
    value: 1200,
    suffix: "+",
    label: "clientes já pilotando com a NB",
  },
  comoFunciona: {
    title: "Como funciona",
    subtitle: "Três passos. Zero burocracia.",
    steps: [
      {
        title: "Escolha sua moto",
        desc: "Navegue pela frota e selecione o modelo que combina com o seu ritmo.",
      },
      {
        title: "Aprove e assine digital",
        desc: "Análise rápida e assinatura 100% online. Sem papelada, sem filas.",
      },
      {
        title: "Receba e pilote",
        desc: "A moto chega até você com IPVA, seguro e manutenção já inclusos.",
      },
    ],
  },
  diferenciais: {
    title: "Por que a NB",
    subtitle: "Tudo o que você precisa. Nada que te prende.",
    items: [
      { icon: "wallet", title: "Sem entrada", desc: "Comece a pilotar sem desembolsar nada no início." },
      { icon: "shield", title: "IPVA e Seguro inclusos", desc: "Documentação e proteção já embutidas na mensalidade." },
      { icon: "wrench", title: "Manutenção inclusa", desc: "Revisões e reparos por nossa conta. Você só pilota." },
      { icon: "repeat", title: "Troca flexível", desc: "Mudou de ideia? Troque de modelo quando quiser." },
      { icon: "smartphone", title: "100% Digital", desc: "Do orçamento à assinatura, tudo pelo celular." },
      { icon: "clock", title: "Cobertura 24h", desc: "Assistência e suporte a qualquer hora, todos os dias." },
    ],
  },
  frota: {
    title: "Nossa frota",
    subtitle: "Escolha por categoria e assine em minutos.",
    categories: ["Todas", "Street", "Trail", "Custom", "Premium"],
    bikes: [
      {
        id: "cg-start",
        name: "Honda CG Start",
        category: "Street",
        price: 389,
        image:
          "https://images.unsplash.com/photo-1661215477041-ec4501e00042?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwzfHxtb3RvcmN5Y2xlJTIwZGFyayUyMGJhY2tncm91bmQlMjBzdHVkaW98ZW58MHx8fHwxNzg1MDA4NjU5fDA&ixlib=rb-4.1.0&q=85",
        specs: "160cc · Econômica",
      },
      {
        id: "cg-fan",
        name: "Honda CG Fan",
        category: "Street",
        price: 429,
        image:
          "https://images.unsplash.com/photo-1656420731892-a4ece094df5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHw0fHxtb3RvcmN5Y2xlJTIwZGFyayUyMGJhY2tncm91bmQlMjBzdHVkaW98ZW58MHx8fHwxNzg1MDA4NjU5fDA&ixlib=rb-4.1.0&q=85",
        specs: "160cc · Conforto",
      },
      {
        id: "bros",
        name: "Honda Bros",
        category: "Trail",
        price: 549,
        image:
          "https://images.pexels.com/photos/13074627/pexels-photo-13074627.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        specs: "160cc · Trail urbana",
      },
      {
        id: "factor",
        name: "Yamaha Factor",
        category: "Street",
        price: 449,
        image:
          "https://images.unsplash.com/photo-1661215477041-ec4501e00042?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwzfHxtb3RvcmN5Y2xlJTIwZGFyayUyMGJhY2tncm91bmQlMjBzdHVkaW98ZW58MHx8fHwxNzg1MDA4NjU5fDA&ixlib=rb-4.1.0&q=85",
        specs: "150cc · Ágil",
      },
      {
        id: "crosser",
        name: "Yamaha Crosser",
        category: "Trail",
        price: 589,
        image:
          "https://images.pexels.com/photos/18757688/pexels-photo-18757688.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        specs: "150cc · Aventura",
      },
    ],
  },
  simulador: {
    title: "Simulador",
    subtitle: "Monte seu plano e veja a mensalidade em tempo real.",
    mileageTiers: [
      { label: "1.000 km/mês", add: 0 },
      { label: "1.500 km/mês", add: 90 },
      { label: "2.000 km/mês", add: 170 },
      { label: "Km livre", add: 290 },
    ],
  },
  depoimentos: {
    title: "Quem já é dono da estrada",
    items: [
      {
        name: "Rafael Souza",
        role: "Motoentregador · SP",
        rating: 5,
        text: "Assinei em 10 minutos pelo celular. Sem entrada e com manutenção inclusa mudou o meu jogo.",
        photo:
          "https://images.pexels.com/photos/7562179/pexels-photo-7562179.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      },
      {
        name: "Camila Ferreira",
        role: "Autônoma · RJ",
        rating: 5,
        text: "Nunca mais me preocupei com IPVA nem seguro. Pago uma mensalidade fixa e pronto.",
        photo:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHxoYXBweSUyMHBlcnNvbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NTAwODY1OXww&ixlib=rb-4.1.0&q=85",
      },
      {
        name: "Diego Martins",
        role: "Entregador · MG",
        rating: 5,
        text: "Troquei de modelo quando precisei de mais autonomia. Flexibilidade total, recomendo demais.",
        photo:
          "https://images.pexels.com/photos/7562179/pexels-photo-7562179.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      },
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      { q: "Preciso dar entrada?", a: "Não. O Plano Conquiste é sem entrada. Você paga apenas a mensalidade fixa." },
      { q: "O que está incluso na mensalidade?", a: "IPVA, seguro, manutenção preventiva e corretiva, além de assistência 24h." },
      { q: "Posso trocar de moto durante o plano?", a: "Sim. A troca é flexível — você pode mudar de modelo conforme sua necessidade." },
      { q: "Como funciona a assinatura?", a: "É 100% digital: escolha a moto, faça a análise online e assine pelo celular em minutos." },
      { q: "Existe fidelidade?", a: "Trabalhamos com planos flexíveis. Fale com nosso time para conhecer as condições atuais." },
      { q: "E se a moto der problema?", a: "A manutenção é por nossa conta e você conta com cobertura e suporte 24 horas." },
    ],
  },
  localizacao: {
    title: "Onde estamos",
    subtitle: "Venha conhecer a NB Locações de perto.",
    address: "Av. das Motos, 1234 — Centro, São Paulo/SP, 01000-000",
    hours: "Seg a Sex: 08h às 18h · Sáb: 08h às 13h",
    phone: "(11) 4000-0000",
    whatsapp: "(11) 90000-0000",
    mapEmbed:
      "https://www.google.com/maps?q=Avenida+Paulista,+Sao+Paulo&output=embed",
    mapsLink: "https://www.google.com/maps/dir/?api=1&destination=Avenida+Paulista+Sao+Paulo",
  },
  ctaFinal: {
    title: "Pronto para pilotar sem preocupações?",
    subtitle: "Assine o Plano Conquiste e comece hoje mesmo.",
    button: "Começar agora",
  },
  footer: {
    description:
      "Assinatura de motos com mensalidade fixa. Sem entrada, sem burocracia, com IPVA, seguro e manutenção inclusos.",
    instagram: "@nb_locacoes",
    instagramUrl: "https://instagram.com/nb_locacoes",
    address: {
      street: "Av. das Motos, 1234",
      district: "Centro",
      city: "São Paulo/SP",
      cep: "CEP 01000-000",
    },
    contact: {
      whatsapp: "(11) 90000-0000",
      phone: "(11) 4000-0000",
      email: "contato@nblocacoes.com.br",
      instagram: "@nb_locacoes",
    },
    cnpj: "CNPJ 00.000.000/0001-00",
  },
  whatsapp: {
    number: "5511900000000",
    message:
      "Olá! Vim pelo site da NB Locações e quero saber mais sobre o Plano Conquiste.",
  },
};

export default defaultConfig;
