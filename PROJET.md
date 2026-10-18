# PROJET — Nour

## Description

Application web d'organisation spirituelle et personnelle : planning avec horaires de prière, adhkar matin et soir, journal de lecture du Coran, notes de science bénéfique, suivi de cycle et notes personnelles, liés au compte de l'utilisatrice.

## Stack

- Front : Vite, React 19, TypeScript, React Router v7, Tailwind v4, Shadcn UI, Framer Motion, Lucide.
- Back et base de données : Convex (fonctions dans `src/convex/`), Convex Auth (Google OAuth, code par e-mail, sessions anonymes).
- Envoi des codes par e-mail : relais PHP Hostinger (`hostinger-mailer/`).
- Hébergement front : Vercel (`vercel.json`, réécriture SPA) ; `main.ts` sert aussi `dist/` avec Hono sous Deno.
- Horaires de prière : API AlAdhan (gratuite).

## Démarrage rapide

```bash
bun install
npx convex dev
bun run dev
```

Copier `.env.example` en `.env` et le remplir avant de lancer. Autres scripts : `build`, `lint`, `format`, `preview`.

## Architecture

- `src/pages/` : `Landing`, `Auth`, `Dashboard`, `NotFound` ; routes déclarées dans `src/main.tsx`.
- `src/components/dashboard/` : vues du tableau de bord (aperçu, planning, Coran, science, cycle, notes, rappels).
- `src/components/RequireAuth.tsx` : protection des routes connectées.
- `src/hooks/` : `use-auth`, `use-prayer-times`, `use-mobile`.
- `src/convex/` : schéma (`schema.ts`), auth (`auth.ts`, `auth.config.ts`, `auth/emailOtp.ts`), et données par compte (`adhkarProgress`, `quranProgress`, `scienceProgress`, `cycleTracking`, `personalNotes`, `users`). Textes des adhkar dans `adhkarData.ts`.
- `src/convex/_generated/` : à garder dans git (nécessaire au build Vercel).
- Données stockées dans le navigateur (pas dans Convex) : raccourcis de l'aperçu, activités du planning, position et réglages de calcul des prières.

## Variables d'environnement

Noms et rôles uniquement ; les valeurs vivent dans `.env` (ignoré par git) ou dans Vercel / Convex.

Côté front (`.env`, Vercel) :
- `VITE_CONVEX_URL` : URL du déploiement Convex.
- `VITE_DEMO_MODE` : `true` uniquement pour la version de test anonyme.
- `CONVEX_SITE_URL` : URL du site pour l'auth.
- `CONVEX_DEPLOYMENT` : déploiement utilisé par `npx convex dev`.

Côté Convex (`npx convex env set`) :
- `JWKS`, `JWT_PRIVATE_KEY`, `SITE_URL` : clés et URL de Convex Auth.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` : connexion Google.
- `NOUR_DEMO_MODE` : `true` sur le déploiement de test pour désactiver Google et e-mail.
- Variables du relais Hostinger : voir `hostinger-mailer/README.md` [À CONFIRMER : liste exacte].

## Feuille de route

- Branche ouverte sur GitHub : `fix/icons-point-8` [À CONFIRMER : contenu et statut].

## Journal

- 2026-10-18 : repo cloné dans `Desktop\nour-app` ; `.env` retiré du suivi git (commit `2260268`, poussé sur `main`) ; création de ce fichier.

## Problèmes connus

- `.env` a été suivi par git jusqu'au commit `2260268` : il reste dans l'historique. Il ne contenait que `VITE_CONVEX_URL`, `CONVEX_SITE_URL` et `CONVEX_DEPLOYMENT` (adresses, pas de clé secrète).
- Le README demande `bun`, mais le repo contient un `package-lock.json` (npm) : gestionnaire de paquets à clarifier.
- Notifications navigateur : envoyées seulement quand l'application est ouverte.
