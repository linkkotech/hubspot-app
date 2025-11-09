## NovaCRM — Multi-tenant CRM com agente de IA

NovaCRM é uma plataforma SaaS construída em Next.js para gerenciar múltiplos clientes (tenants) em um único ambiente. Ela combina CRM, gestão de projetos, chat colaborativo e um agente de IA que gera insights a partir dos dados do workspace.

### Principais recursos

- **Isolamento multi-tenant nativo**: todas as entidades (contatos, oportunidades, projetos, tarefas e chats) são segmentadas por workspace.
- **CRM completo**: cadastro de contatos, pipeline de oportunidades com estágios configuráveis e histórico de relacionamento.
- **Gestão de projetos e tarefas**: criação de projetos vinculados aos clientes, tarefas priorizadas e acompanhamento de progresso.
- **Chat colaborativo**: canais temáticos, inclusive um canal especial “Agent Assist” com respostas em linguagem natural.
- **Agente de IA** (OpenAI opcional): gera insights estratégicos, recomendações nas páginas e responde em tempo real no chat.

### Stack

- [Next.js 16](https://nextjs.org/) (App Router + Server Actions)
- [Prisma ORM](https://www.prisma.io/) com SQLite por padrão
- [NextAuth](https://next-auth.js.org/) com `CredentialsProvider`
- [Tailwind CSS 4](https://tailwindcss.com/)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) (opcional)

## Configuração

### Pré-requisitos

- Node.js 18.18+ (recomendado 20.x)
- npm (instalado com Node) ou outro gerenciador compatível

### Variáveis de ambiente

Copie o arquivo `.env.example` (ou utilize o `.env` criado pelo Prisma) e preencha conforme abaixo:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="chave-aleatoria-segura"
OPENAI_API_KEY="sk-..." # opcional, ativa o agente de IA
```

> Gere `AUTH_SECRET` com `openssl rand -hex 32` ou `npx auth secret`.

### Instalando dependências

```bash
npm install
```

### Banco de dados & Prisma

O repositório já inclui a primeira migration. Para aplicar (ou recriar) a base local:

```bash
npm run prisma:migrate   # cria/aplica migrations (atalho opcional)
# ou diretamente
npx prisma migrate dev
```

Sempre que alterar o schema:

```bash
npx prisma migrate dev --name <nome-da-migracao>
```

### Rodando o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`.

### Fluxo inicial

1. Acesse a página inicial e clique em **Criar workspace**.
2. Informe dados do tenant, usuário administrador e senha.
3. Após o cadastro o login é automático; navegue pelas seções do dashboard.
4. No chat, use o canal **Agent Assist** para interações com a IA (requer `OPENAI_API_KEY`).

## Scripts úteis

| Script                | Descrição                                         |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Ambiente de desenvolvimento com hot reload        |
| `npm run build`       | Gera a aplicação para produção                    |
| `npm run start`       | Sobe a build em produção                          |
| `npm run lint`        | Executa o ESLint                                  |
| `npm run prisma:studio` | (Opcional) abre o Prisma Studio para inspeção   |

> Para usar `npm run prisma:studio`, adicione `"prisma:studio": "npx prisma studio"` ao `package.json` se desejar.

## Estrutura de diretórios

- `app/` — rotas App Router (landing, auth, dashboard, APIs)
- `components/` — componentes compartilhados (providers, formulários, chat)
- `lib/` — configuração de Prisma, NextAuth e serviços de IA
- `prisma/` — schema e migrations

## Integração com IA

- Quando `OPENAI_API_KEY` está definido:
  - `/api/ai/insights` gera recomendações e salva em `AgentInsight`.
  - Mensagens no canal **Agent Assist** disparam respostas automáticas.
- Sem chave, o sistema retorna mensagens estáticas orientando a configuração.

## Implantação

1. Configure variáveis de ambiente no provedor (Vercel, Railway, etc.).
2. Execute `npx prisma migrate deploy` no build para aplicar migrations.
3. Use `npm run build` + `npm run start` ou deploy automático via Vercel.

---

Feito com Next.js, Prisma e bastante IA para acelerar sua operação B2B. Ajuste o visual, adicione automações e integre com seus serviços preferidos conforme necessário. 🚀
