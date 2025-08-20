# Assistly Starter (Next.js + Chatwoot via Docker)

This repo gets you from zero to a working Intercom-style support setup with:

- **Chatwoot** self-hosted locally in Docker (Postgres + Redis included)
- A **Next.js 14** app that embeds the Chatwoot widget
- Optional **secure mode** (HMAC) user identification
- Clear, newbie‑friendly steps

> If you're totally new: just follow **Getting Started (Local)** below.

---

## 0) Prerequisites

- Docker Desktop (running)
- Node.js 18+ and npm (for the Next.js app)

---

## 1) Getting Started (Local)

### 1.1 Copy env files
- Duplicate `.env.example` to `.env` (for Docker / Chatwoot).
- Duplicate `next-app/.env.local.example` to `next-app/.env.local`.

Open both files and fill the TODO fields. At minimum, set a long random `SECRET_KEY_BASE` (see the tip below).

**Tip (generate a secret):**
```bash
# macOS/Linux
openssl rand -hex 64
# Windows (PowerShell)
powershell -Command "[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')"
```

### 1.2 Start Chatwoot
From the project root:
```bash
docker compose up -d
```

Wait ~30–60s. Then open **http://localhost:4000** in your browser.

### 1.3 Create the first Admin
You should see Chatwoot's signup screen. Create the first user (this user is the **admin** and can invite others, manage roles, create inboxes, configure automations, etc.).

> If you don't see the signup screen, ensure `ENABLE_ACCOUNT_SIGNUP=true` in `.env` and restart Docker.

### 1.4 Create a Website Inbox and get the Token
Inside Chatwoot:

- Go to **Settings → Inboxes → Add Inbox → Website**
- Give it a name (e.g., “Assistly Web”)
- After creating, copy the **Website Token** shown in the installation snippet

Paste that token into `next-app/.env.local` as `NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN`. Also set `NEXT_PUBLIC_CHATWOOT_BASE_URL=http://localhost:4000`.

### 1.5 (Optional) Secure mode
If you want to identify logged‑in users securely, set a `CHATWOOT_HMAC_TOKEN` in Chatwoot (Settings → Accounts → Installation settings, depending on version) and paste the same token into `next-app/.env.local` as `CHATWOOT_HMAC_TOKEN`. The Next.js app includes an API route that signs the external ID for you.

### 1.6 Run the Next.js app
```bash
cd next-app
npm install
npm run dev
```
Open **http://localhost:3000**. You should see the demo page; the Chatwoot widget loads from **http://localhost:4000** (your Docker Chatwoot).

---

## 2) Project Structure

```
assistly-starter/
├─ docker-compose.yml            # Chatwoot + Postgres + Redis
├─ .env                          # Docker/Chatwoot envs (copy from .env.example)
├─ .env.example
├─ next-app/
│  ├─ package.json
│  ├─ next.config.js
│  ├─ tsconfig.json
│  ├─ .env.local                 # Next.js envs (copy from .env.local.example)
│  ├─ .env.local.example
│  └─ app/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ api/
│     │  └─ chatwoot-signature/route.ts
│     └─ components/
│        └─ ChatwootWidget.tsx
└─ README.md
```

---

## 3) Admin, Roles & Permissions in Chatwoot

- **Admin user**: The first user you create is an **Admin**. Admins can invite users and set their roles.
- **Agents**: Invite agents and assign them to **Inboxes** (channels). You can limit who can see/respond in each inbox.
- **Teams**: Group agents into teams for routing.
- **Business hours**: Configure availability, auto‑away messages.
- **Macros & Rules**: Create canned responses and automation rules to route/label/assign conversations.

**Where to find these:**
- Settings → **Agents & Teams**
- Settings → **Inboxes**
- Settings → **Automation** (Rules, Macros, SLA)
- Settings → **Business Hours**

---

## 4) Secure User Identification (optional but recommended)

When a user is logged into your site/app, you can identify them to Chatwoot so agents see profile/context.

- Client loads the widget and calls `setUser` (or secure version).
- Our Next.js API route `/api/chatwoot-signature` signs the `external_id` with your HMAC token.

See `app/components/ChatwootWidget.tsx` and `app/api/chatwoot-signature/route.ts` for a minimal example.

---

## 5) Troubleshooting

- **Widget doesn’t appear**: Confirm `NEXT_PUBLIC_CHATWOOT_BASE_URL` and `NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN` are correct. Check browser console for 404s.
- **Chatwoot not reachable**: Ensure Docker containers are healthy: `docker compose ps` and `docker compose logs -f chatwoot`.
- **Signup disabled**: Set `ENABLE_ACCOUNT_SIGNUP=true` in `.env` and restart Docker: `docker compose down && docker compose up -d`.
- **Email not sending**: Configure SMTP env in `.env` and restart. For local demos, you can skip email initially.

---

## 6) Going further (later)

- Point Chatwoot at a real domain and add TLS (Nginx/Traefik).
- Connect channels (email, WhatsApp/Twilio, Facebook, Instagram, Telegram).
- Add Knowledge Base (Docs) and surface articles in the widget.
- Add an AI auto‑reply webhook service if you want bot‑assist before human handoff.

Enjoy!
