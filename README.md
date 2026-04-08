# SvelteKit + PocketBase Full-Stack Template

A robust, production-ready template for building full-stack applications with SvelteKit and PocketBase.

## 🚀 Features

- **Frontend**: SvelteKit (Svelte 5) with modern aesthetics.
- **Backend**: PocketBase (Authentication, Database, Realtime, File Storage).
- **Type Safety**: Automatic TypeScript definitions from PocketBase schema via `pocketbase-typegen`.
- **Form Handling**: `SvelteKit-Superforms` + `Zod` for robust server-side validation.
- **Realtime Notifications**: Persistent notification store synced with PocketBase Realtime.
- **Toasts**: Instant feedback with `Svelte-Sonner` integrated into the notification system.
- **SEO**: Ready-to-use SEO component for meta tags and social sharing.
- **Error Logging**: Automatic logging of server and client errors to a PocketBase collection.
- **Email Service**: Hybrid service supporting Resend API or PocketBase SMTP.

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PocketBase](https://pocketbase.io/) (v0.22+)

## 📦 Setting Up

### 1. Backend (PocketBase)
1. Download [PocketBase](https://pocketbase.io/docs/) and place it in the `/pocketbase` folder.
2. Run the server:
   ```bash
   ./pocketbase serve
   ```
3. Access the Admin UI at `http://localhost:8090/_/` and create your collections.
   - Recommended collections: `system_logs`, `notifications`, `system_emails`.

### 2. Frontend (SvelteKit)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`.
   - Update `VITE_PB_URL` to your PocketBase instance (default: `http://localhost:8090`).
4. Generate types:
   ```bash
   pnpm run typegen
   ```
5. Start the development server:
   ```bash
   pnpm run dev
   ```

## 🔐 Environment Variables

| Variable | Description |
| :--- | :--- |
| `VITE_PB_URL` | Your PocketBase instance URL |
| `EMAIL_PROVIDER` | `resend` or `pocketbase` |
| `RESEND_API_KEY` | Required if using Resend |

## 📁 Project Structure

- `/pocketbase`: Backend logic and data.
- `/frontend`: SvelteKit application.
  - `/src/lib/pb.ts`: Typed PocketBase client.
  - `/src/lib/stores`: Notification and User state.
  - `/src/lib/schemas`: Zod validation schemas.
  - `/src/lib/utils/logger`: Global error handler.

## 📄 License

MIT
