# Travel Wishlist Demo

A tiny Next.js demo that showcases client-side data persistence (IndexedDB and localStorage) for creating and managing a travel wishlist, with simple offline-friendly behavior.

## Getting Started

### Installation

First, install the dependencies:

Using npm:

```bash
npm install
```

Using Yarn:

```bash
yarn install
```

### Run the dev server

```bash
npm run dev
# or
yarn dev
```

Then open http://localhost:3000 in your browser.

### Build and run in production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Available scripts

- **dev**: Start Next.js in development mode (uses Turbopack).
- **build**: Create an optimized production build (Turbopack).
- **start**: Start the production server.
- **lint**: Run ESLint.

## Features

- **Travel wishlist CRUD**: Add, view, and manage destinations.
- **IndexedDB persistence**: Durable storage via a small helper in `lib/idb.ts`.
- **LocalStorage flags**: Simple UI/session flags via `hooks/use-session-flag.ts`.
- **Offline-friendly**: Data remains available without a network connection.
- **Theme support**: Light/dark mode using `next-themes`.

## Tech stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **idb** (IndexedDB helper)
- **next-themes** (theme switching)
- **lucide-react** (icons)

## Requirements

- Node.js 18+
- npm or Yarn
