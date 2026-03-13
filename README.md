# F1Start — Guia de Fórmula 1 para Iniciantes

> Projeto acadêmico desenvolvido para a faculdade. Disponível gratuitamente para estudo e aprendizado.

Site interativo e bilíngue (PT-BR / EN) que apresenta a Fórmula 1 de forma simples e didática para quem está começando a acompanhar o esporte.

**Acesse o projeto:** [github.com/MuriloAlonso/F1Start-Guide-For-Begginers](https://github.com/MuriloAlonso/F1Start-Guide-For-Begginers)

---

## Sobre o Projeto

O **F1Start** é um guia completo para fãs iniciantes da Fórmula 1. O site cobre desde o básico do esporte até informações em tempo real como notícias, calendário da temporada e dados das equipes.

Criado como projeto de faculdade, o código é aberto e pode ser baixado, estudado e modificado livremente por qualquer pessoa.

---

## Funcionalidades

- **Notícias em tempo real** — feeds RSS de BBC Sport F1, Motorsport.com e RaceFans, com tradução automática para PT-BR
- **Calendário da temporada** — todas as corridas de 2026
- **Equipes e pilotos** — informações sobre todos os construtores da temporada
- **Sistema de pontuação** — explicação completa das regras de pontos
- **Circuitos** — todos os circuitos do campeonato
- **Clima e estratégia** — como o tempo afeta as corridas e estratégias de pneus
- **Onde assistir** — plataformas de transmissão disponíveis
- **Bilíngue** — português (PT-BR) e inglês (EN) com troca instantânea

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| React 19 + TypeScript | Framework principal |
| Vite 7 | Build tool e dev server |
| Tailwind CSS | Estilização |
| Radix UI / shadcn/ui | Componentes de interface |
| Lucide React | Ícones |
| Recharts | Gráficos |
| React Hook Form + Zod | Formulários e validação |

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18 ou superior
- npm

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/MuriloAlonso/F1Start-Guide-For-Begginers.git

# 2. Entre na pasta do projeto
cd F1Start-Guide-For-Begginers

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O site estará disponível em `http://localhost:5000`.

### Outros comandos

```bash
npm run build    # Gera a versão de produção na pasta /dist
npm run preview  # Visualiza a versão de produção localmente
npm run lint     # Verifica erros de código
```

---

## Deploy

O projeto está configurado para deploy no **Vercel**:

- Inclui `vercel.json` com roteamento SPA configurado
- Inclui função serverless em `api/proxy.js` para busca dos feeds RSS sem problemas de CORS
- Build command: `npm run build`
- Output directory: `dist`

---

## Estrutura do Projeto

```
src/
├── App.tsx              # Componente principal (todas as seções da página)
├── components/          # Componentes reutilizáveis (LanguageSelector, etc.)
├── contexts/            # Contexto global (idioma, traduções)
├── hooks/               # Hooks personalizados (useAutoUpdate, etc.)
├── services/            # Serviços de dados (newsApi, f1DataService)
└── lib/                 # Utilitários

api/
└── proxy.js             # Proxy serverless para feeds RSS (Vercel)
```

---

## Licença

Este projeto é livre para uso acadêmico e educacional. Sinta-se à vontade para clonar, estudar e adaptar o código.

---

*Desenvolvido com React + TypeScript + Vite*
