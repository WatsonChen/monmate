# MonMate

MonMate 是活動報到系統 MVP，包含手機現場報到頁、主辦方後台，以及統一的 Express API / Prisma / PostgreSQL 後端。

## 架構

```txt
monmate/
├─ apps/
│  ├─ web/          # Next.js：/checkin 前台報到、/admin 後台
│  └─ api/          # Express API
├─ packages/
│  ├─ types/        # ApiResponse 與共用 DTO
│  ├─ utils/        # 共用工具
│  └─ config/       # 品牌與共用設定
├─ prisma/          # Prisma schema 與 seed
├─ package.json
└─ README.md
```

初期先將前台與後台放在同一個 Next.js app，用路由清楚區隔：

- `/`：MonMate landing / 入口頁
- `/checkin`：現場工作人員手機報到頁
- `/event/:slug/checkin`：活動建立後產生的專屬報到 URL
- `/admin`：主辦方後台
- `/admin/login`：後台登入
- 後端 API 統一由 `apps/api` 的 Express 提供，不使用 Next.js API routes

## 重要原則

- 前端只能透過 HTTP 呼叫 Express API。
- Prisma 與資料庫存取只存在 `apps/api` 與 `prisma/`。
- 前台與後台共用同一套 API，以 JWT 與角色處理權限。
- JSON API 回應格式統一為 `ApiResponse<T>`。
- MVP 使用單一 Express API，不拆微服務。

## 安裝

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

請在 `apps/api/.env` 設定 PostgreSQL 連線與後端機密：

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/monmate?schema=public
JWT_SECRET=replace-with-a-long-random-secret
```

請在 `apps/web/.env.local` 設定前端公開 API 位置：

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

前端 env 只放 `NEXT_PUBLIC_*` 這類可公開變數；`DATABASE_URL`、`JWT_SECRET` 等後端機密只放在 `apps/api/.env`。

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
```

也可以使用較一致的 root scripts：

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

Prisma / DB scripts 會明確讀取 `apps/api/.env`，避免把資料庫連線字串放到前端或混在 web env。

Seed 會建立測試帳號：

```txt
email: admin@monmate.local
password: monmate123
```

Seed 完成後會在 terminal 印出測試用的 `Event ID`、手動報到序號與 QR token。到 `/checkin` 測試時：

```txt
活動 ID: 使用 seed 輸出的 Event ID
QR Token: 使用 seed 輸出的 qr
手動序號: 切到手動序號後使用 seed 輸出的 manual
```

正式活動報到 URL 則使用活動 slug：

```txt
http://localhost:3000/event/monmate-demo/checkin
```

這個頁面會透過 Express API 的 `GET /events/public/:slug` 取得活動基本資料，再用活動 ID 呼叫 check-in API。

## 開發啟動

```bash
npm run dev:api
npm run dev:web
```

預設網址：

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

也可以同時啟動：

```bash
npm run dev
```

## Build / Typecheck

```bash
npm run typecheck
npm run build
```

## Vercel 部署

如果 Vercel 出現：

```txt
No Output Directory named "public" found after the Build completed.
```

代表 Project Settings 裡的 Output Directory 被設成了 `public`。`public` 是 Next.js 靜態資產來源資料夾，不是 build output。

建議設定：

```txt
Framework Preset: Next.js
Root Directory: apps/web
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

repo 內已提供 `apps/web/vercel.json`；如果 Vercel 專案 Root Directory 設為 `apps/web`，它會使用該設定。若 Root Directory 保持 repo root，則會使用根目錄 `vercel.json`，build `@monmate/web` 並使用 `apps/web/.next` 作為 output。

前端部署時至少要設定：

```txt
NEXT_PUBLIC_API_URL=<你的 API URL>
```

目前 Express API 不會跟 Next app 一起部署到同一個 Vercel project。正式環境可先將 `apps/web` 部署到 Vercel，`apps/api` 之後再依 Neon / Vercel 或其他 Node runtime 的部署策略處理。

## API Routes

### Auth

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Events

- `GET /events`
- `POST /events`
- `GET /events/:eventId`
- `PATCH /events/:eventId`
- `DELETE /events/:eventId`

### Attendees

- `GET /events/:eventId/attendees`
- `POST /events/:eventId/attendees/import`
- `GET /events/:eventId/attendees/export`
- `PATCH /events/:eventId/attendees/:attendeeId`

### Check-in

- `POST /events/:eventId/check-in/qr`
- `POST /events/:eventId/check-in/manual`
- `GET /events/:eventId/check-in/logs`

### Notification

- `POST /events/:eventId/notifications/pre-event`

Notification 目前是 mock service，已保留未來替換 email / SMS / LINE provider 的位置。

## 品牌資產

MonMate logo、吉祥物與視覺圖已放在：

```txt
apps/web/public/brand/
```

目前僅套用在登入頁、後台側邊欄、前台報到頁與空狀態畫面。
