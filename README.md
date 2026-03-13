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

---
---

# F1Start — Formula 1 Guide for Beginners

> Academic project developed for university. Freely available for study and learning.

An interactive, bilingual (PT-BR / EN) website that introduces Formula 1 in a simple and educational way for those just starting to follow the sport.

**View the project:** [github.com/MuriloAlonso/F1Start-Guide-For-Begginers](https://github.com/MuriloAlonso/F1Start-Guide-For-Begginers)

---

## About the Project

**F1Start** is a complete guide for beginner Formula 1 fans. The site covers everything from the basics of the sport to real-time information such as news, the season calendar, and team data.

Created as a university project, the code is open and can be freely downloaded, studied, and modified by anyone.

---

## Features

- **Real-time news** — RSS feeds from BBC Sport F1, Motorsport.com, and RaceFans, with automatic translation to PT-BR
- **Season calendar** — all 2026 races
- **Teams and drivers** — information on all constructors for the season
- **Points system** — complete explanation of the scoring rules
- **Circuits** — all championship circuits
- **Weather and strategy** — how weather affects races and tire strategies
- **Where to watch** — available broadcast platforms
- **Bilingual** — Portuguese (PT-BR) and English (EN) with instant switching

---

## Tech Stack

| Technology | Use |
|---|---|
| React 19 + TypeScript | Main framework |
| Vite 7 | Build tool and dev server |
| Tailwind CSS | Styling |
| Radix UI / shadcn/ui | UI components |
| Lucide React | Icons |
| Recharts | Charts |
| React Hook Form + Zod | Forms and validation |

---

## Running Locally

### Prerequisites
- Node.js 18 or higher
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/MuriloAlonso/F1Start-Guide-For-Begginers.git

# 2. Enter the project folder
cd F1Start-Guide-For-Begginers

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The site will be available at `http://localhost:5000`.

### Other commands

```bash
npm run build    # Generates the production build in the /dist folder
npm run preview  # Preview the production build locally
npm run lint     # Check for code errors
```

---

## Deployment

The project is configured for deployment on **Vercel**:

- Includes `vercel.json` with SPA routing configured
- Includes a serverless function at `api/proxy.js` for fetching RSS feeds without CORS issues
- Build command: `npm run build`
- Output directory: `dist`

---

## Project Structure

```
src/
├── App.tsx              # Main component (all page sections)
├── components/          # Reusable components (LanguageSelector, etc.)
├── contexts/            # Global context (language, translations)
├── hooks/               # Custom hooks (useAutoUpdate, etc.)
├── services/            # Data services (newsApi, f1DataService)
└── lib/                 # Utilities

api/
└── proxy.js             # Serverless proxy for RSS feeds (Vercel)
```

---

## License

This project is free for academic and educational use. Feel free to clone, study, and adapt the code.

---

*Built with React + TypeScript + Vite*
