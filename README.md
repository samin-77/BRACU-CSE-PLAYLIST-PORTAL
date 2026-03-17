# BRAC CSE Playlist Portal

A responsive React + Tailwind web app for BRAC University CSE students to:

- browse curated YouTube playlists by **course** and **faculty**
- **search** and **filter**
- submit **missing playlist suggestions** (stored in Firebase Firestore)
- sign in securely with **Google OAuth** (restricted to `@g.bracu.ac.bd`)

## Tech

- React (Vite)
- Tailwind CSS
- React Router
- Firebase Auth (Google) + Firestore

## Getting started (local)

1) Install deps

```bash
npm install
```

2) Create Firebase project

- Firebase Console → create project
- Build → Authentication → Sign-in method → **Google** → Enable
- Authentication → Settings → Authorized domains
  - add `localhost` for local dev

3) Create a Firestore database

- Build → Firestore Database → Create database (test mode for quick start, then lock it down)

4) Set environment variables

Copy `.env.example` to `.env` and fill in your Firebase Web App config (Firebase Console → Project settings → Your apps → Web app).

5) Run the app

```bash
npm run dev
```

## Firestore collection

Suggestions are written to:

- `playlistSuggestions` (documents include `status: "pending"` and `submittedBy` info)

## Recommended Firestore rules (basic)

This allows only signed-in users with `@g.bracu.ac.bd` to create playlist suggestions, and prevents reading/updating/deleting from the client (admin panel can be added later).

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isBracGsuite() {
      return request.auth != null
        && request.auth.token.email.matches('.*@g\\.bracu\\.ac\\.bd$');
    }

    match /playlistSuggestions/{docId} {
      allow create: if isBracGsuite();
      allow read, update, delete: if false;
    }
  }
}
```

## Optional: show YouTube video counts

If you set `VITE_YOUTUBE_API_KEY`, the dashboard will fetch playlist `itemCount` via the YouTube Data API.

## Deployment

- **Vercel**: works out of the box; add the same environment variables in the Vercel project settings.
- **Firebase Hosting**: also supported (add SPA rewrite to `index.html`).

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
