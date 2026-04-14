# Demo Deployment: Vercel + Hosted PostgreSQL

## Goal

`../new-matching` と同じ方向性で、この starter を `Vercel + hosted PostgreSQL + Auth.js` 構成に載せる。

- App hosting: Vercel
- Database: hosted PostgreSQL (`DATABASE_URL`)
- Session: Auth.js JWT
- Local development: Docker Compose PostgreSQL

## Why this path

この repo の弱点は、`file:./dev.db` と独自 signed cookie を前提にすると Vercel / hosted DB 前提の運用へ綺麗に繋がらないことです。

そこで runtime 境界を `PrismaPg + PostgreSQL` と `Auth.js JWT` に寄せ、Preview / Production でも同じ env 契約で動かせる形に揃えます。

## Env contract

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `LOG_LEVEL`

## Local bootstrap

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:prepare
npm run dev
```

## Provider check

```bash
npm run check:postgres -- --mode status
npm run check:postgres -- --mode smoke
```

## Vercel rollout

1. hosted PostgreSQL を用意する
2. Vercel に repo を接続する
3. `Production / Preview / Development` それぞれに env を登録する
4. 初回 deploy 前に `DATABASE_URL` へ `prisma migrate deploy` が通ることを確認する
5. deploy 後に `npm run check:preview -- --base-url https://<preview-domain>` を通す

## Free-tier note

free deploy を優先するなら、Vercel Hobby と hosted PostgreSQL の free tier を組み合わせる。
この repo は provider 固有実装ではなく `DATABASE_URL` 契約なので、Neon でも Supabase でも接続自体は可能。

ただし `../new-matching` と同じ方向へ揃えるなら、まずは Vercel + generic hosted PostgreSQL を前提に運用するのが一番素直です。
