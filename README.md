# Idle MMO RPG (Bun + Next.js)

An upgraded idle RPG experience built with Next.js, styled with Tailwind CSS, and powered by Bun. The app is ready for seamless deployment on Vercel and stores persistent game data in MongoDB.

## Getting started

1. Install Bun if you have not already. The easiest way is via the official installer:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
   Restart your shell so that the `bun` command is available.
2. Install project dependencies with [Bun](https://bun.sh/):
   ```bash
   bun install
   ```
3. Provide your MongoDB connection string in an `.env.local` file:
   ```bash
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/idle-mmo?retryWrites=true&w=majority
   # Optional: override the database name used by the API routes (defaults to "idle-mmo").
   MONGODB_DB=idle-mmo
   ```
   > **Tip:** If you are just exploring the UI, you can skip this step. The API routes automatically fall back to an in-memory store
   > when `MONGODB_URI` is not configured or the MongoDB driver fails to load, so the game boots without any external services.
   > Data will reset whenever the server restarts.
4. (Optional) Seed your MongoDB database with a demo player and welcome message:
   ```bash
   bun run seed:mongo
   ```
   This command ensures the required collections exist and inserts sample data so the UI has something to render immediately.
5. Run the development server:
   ```bash
   bun dev
   ```
   This starts Next.js on [http://localhost:3000](http://localhost:3000).
6. Build for production or run the Next.js server locally:
   ```bash
   bun run build
   bun start
   ```

## Deployment on Vercel

- Set `MONGODB_URI` in the Vercel project environment variables.
- Configure the build command to `bun run build` and output directory to `.next`.
- Enable the Bun runtime by selecting "Use Bun" in the project settings, or let Vercel detect the `bun.lockb` file when generated.

## Features

- 🎮 **Persistent progression** stored in MongoDB, so players can return to their heroes.
- 🔐 **Stateless authentication** using signed device identifiers saved to local storage.
- ⚔️ **Real-time inspired combat loop** with tactical upgrades, gacha pulls, and gear management.
- 🏆 **Server-backed leaderboards** to compare hero levels across sessions.
- 💬 **World chat** powered by MongoDB with automatic polling for updates.
- 🎨 **Refreshed UI/UX** featuring modern gradients, glassmorphism panels, and subtle animations.

## Project structure

```
app/
  api/           → Serverless API routes (player, leaderboard, chat)
  globals.css    → Tailwind base styles & design tokens
  layout.tsx     → Root layout with fonts
  page.tsx       → Client game experience
components/
  ...            → UI building blocks and game widgets
hooks/
  useGameEngine.ts → Core game logic + persistence bridge
lib/
  constants.ts   → Monsters, items, rarities, and helpers
  mongodb.ts     → MongoDB connection helper with caching
  types.ts       → Shared TypeScript types
```

### MongoDB troubleshooting

If you encounter runtime errors similar to `Cannot find module './operations/search_indexes/update'` while the API is starting up,
the local MongoDB driver installation is corrupted. The project intentionally pins the driver to the 5.x line because Bun's bundler
does not parse the 6.x search index helpers yet, which surfaces as `error: Unexpected` in development. The game will continue to run
against the in-memory store, but you can restore the MongoDB connection with the following steps:

1. Delete your existing installation artifacts:
   ```bash
   rm -rf node_modules package-lock.json bun.lockb
   ```
2. Reinstall dependencies. If you are using Bun, run `bun install`. For npm users run `npm install` instead.
3. Run the database seeder once the driver installs to recreate the collections:
   ```bash
   bun run seed:mongo
   ```
4. Restart the development server (`bun run dev`).

The API will resume using MongoDB once the driver loads correctly. Until then it silently falls back to the in-memory data, so you
can continue developing without interruption.

Enjoy the adventure!
