# Site + Painel — Psiquiatra

Site institucional de alto padrão para consultório de psiquiatria, com **agendamento
online** (estilo Doctoralia + WhatsApp), **painel administrativo completo** e **agente
virtual** (site + WhatsApp via Evolution API).

Stack: **Next.js 15 (App Router, TypeScript)** · **PostgreSQL + Drizzle ORM** ·
**Tailwind CSS + Framer Motion** · deploy no **Railway**.

---

## ✨ Recursos

- Landing sofisticada e animada: hero, sobre a médica, clínica, especialidades,
  "quando buscar ajuda", localização (Google Maps) e contato.
- Agendamento: paciente escolhe dia/horário livre **ou** cai no WhatsApp. Confirmação
  automática por WhatsApp (Evolution API).
- Painel `/admin`: edita textos, logo, fotos, cores, menu, rodapé, redes sociais,
  endereço/mapa, especialidades, disponibilidade, consultas, agente e usuários.
- Agente virtual configurável (FAQ) no site e no WhatsApp, com gancho pronto para IA.
- Imagens guardadas no próprio banco (sem bucket externo) — trocáveis pelo painel.

---

## 🚀 Deploy no Railway (passo a passo)

1. **Suba o repositório** para o GitHub (já vem com o git inicializado).
2. No [Railway](https://railway.app): **New Project → Deploy from GitHub repo** e
   selecione este repositório.
3. **Adicione o banco**: no projeto, **New → Database → PostgreSQL**.
4. No serviço do site, aba **Variables**, defina:

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` (referência ao banco) |
   | `AUTH_SECRET` | gere com `openssl rand -base64 32` |
   | `ADMIN_EMAIL` | e-mail do primeiro admin |
   | `ADMIN_PASSWORD` | senha inicial (troque depois no painel) |
   | `ADMIN_NAME` | nome do admin |
   | `NEXT_PUBLIC_SITE_URL` | URL pública do site (ex.: `https://seusite.com.br`) |
   | `EVOLUTION_API_URL` | (opcional) URL da sua Evolution API |
   | `EVOLUTION_API_KEY` | (opcional) chave da Evolution |
   | `EVOLUTION_INSTANCE` | (opcional) nome da instância |
   | `EVOLUTION_WEBHOOK_TOKEN` | (opcional) token para validar o webhook |

5. O deploy roda as **migrações automaticamente** (`db:migrate` no start).
6. **Semeie o conteúdo inicial uma única vez**: no serviço, abra o terminal/Shell do
   Railway e rode:
   ```bash
   npm run db:seed
   ```
   Isso cria o conteúdo placeholder + o admin inicial (`ADMIN_EMAIL`/`ADMIN_PASSWORD`).
7. Acesse `https://seusite.com.br/admin` e faça login. **Troque a senha** em *Conta*.

> Domínio próprio: em **Settings → Networking** do serviço, adicione seu domínio e
> aponte o DNS conforme instruído.

### 🔒 Painel admin em domínio separado (opcional, grátis)

Para servir o painel em um endereço próprio (ex.: `admin.seusite.com`), sem custo extra:

1. No **mesmo serviço** do Railway, em **Settings → Networking**, adicione um segundo
   domínio — pode ser um subdomínio seu (`admin.seusite.com`) ou um domínio grátis
   `*.up.railway.app`.
2. Defina a variável `ADMIN_HOST` com esse host (ex.: `admin.seusite.com`).
3. Pronto: nesse domínio aparece **apenas o painel**; no domínio público o `/admin`
   fica **bloqueado (404)**. Tudo com um único deploy.

---

## 🖥️ Rodando localmente

Pré-requisitos: Node 20+ e um Postgres local.

```bash
cp .env.example .env      # ajuste DATABASE_URL e os demais valores
npm install
npm run db:migrate        # cria as tabelas
npm run db:seed           # popula conteúdo + admin inicial
npm run dev               # http://localhost:3000
```

Painel: `http://localhost:3000/admin` (use `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`).

---

## 📁 Estrutura

```
app/
  page.tsx                # site público (home)
  agendar/                # fluxo de agendamento + server action
  admin/                  # painel (login, dashboard e seções) + actions
  api/media/[id]          # servir imagens do banco
  api/agent               # endpoint do widget de chat
  api/whatsapp/webhook    # recebe mensagens da Evolution
components/               # UI do site, admin e agendamento
lib/
  db/                     # schema Drizzle, conexão, migrate, seed
  auth.ts                 # sessão (JWT httpOnly) + bcrypt
  availability.ts         # geração de horários (fuso America/Sao_Paulo)
  evolution.ts            # envio de WhatsApp (Evolution API)
  agent.ts                # motor de FAQ + gancho de IA
drizzle/                  # migrações SQL geradas
```

---

## 🔌 WhatsApp (Evolution API)

1. Defina as variáveis `EVOLUTION_*` no Railway.
2. Na sua instância da Evolution, configure o webhook para:
   `https://seusite.com.br/api/whatsapp/webhook`, enviando o header
   `x-webhook-token` igual a `EVOLUTION_WEBHOOK_TOKEN`.
3. No painel, aba **Agente**, ative "Responder no WhatsApp".

A confirmação de agendamento e a resposta automática do agente usam a mesma integração.
Sem credenciais, o site funciona normalmente (os envios são apenas ignorados).

---

## 🎨 Editando o conteúdo

Tudo é editável pelo painel, sem código: **Conteúdo** (textos), **Mídia & Logo**
(imagens), **Aparência & Site** (cores, menu, redes, localização), **Especialidades**,
**Disponibilidade** (agenda), **Consultas**, **Agente** e **Conta**.

---

## 🔐 Notas de segurança

- Sessão do admin em cookie `httpOnly` assinado (JWT). Rotas `/admin` protegidas por middleware.
- Defina sempre um `AUTH_SECRET` forte em produção.
- Troque a senha do admin no primeiro acesso.
