# Idle MMO RPG (Bun + Next.js)

An upgraded idle RPG experience built with Next.js, styled with Tailwind CSS, and powered by Bun. The app is ready for seamless deployment on Vercel and stores persistent game data in MongoDB.

## Getting started

1. Install dependencies with [Bun](https://bun.sh/):
   ```bash
   bun install
   ```
2. Provide your MongoDB connection string in an `.env.local` file:
   ```bash
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/idle-mmo?retryWrites=true&w=majority
   ```
3. Run the development server:
   ```bash
   bun dev
   ```
4. Build for production or run the Next.js server locally:
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

Enjoy the adventure!
