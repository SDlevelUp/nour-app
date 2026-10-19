# PROJET — Nour

## Description

Application web d'organisation spirituelle et personnelle : planning avec horaires de prière, adhkar matin et soir, journal de lecture du Coran, notes de science bénéfique, suivi de cycle et notes personnelles, liés au compte de l'utilisatrice.

## Stack

- Front : Vite, React 19, TypeScript, React Router v7, Tailwind v4, Shadcn UI, Framer Motion, Lucide.
- Back et base de données : Convex (fonctions dans `src/convex/`), Convex Auth (Google OAuth, code par e-mail, sessions anonymes).
- Envoi des codes par e-mail : relais PHP Hostinger (`hostinger-mailer/`).
- Hébergement front : Vercel (`vercel.json`, réécriture SPA) ; `main.ts` sert aussi `dist/` avec Hono sous Deno.
- Déploiement du back : le `buildCommand` de `vercel.json` lance `npx convex deploy` avant le build si `CONVEX_DEPLOY_KEY` est définie, sinon il ne construit que le front. Sans cette clé, toute modification de `src/convex/` doit être déployée à la main : `CONVEX_DEPLOYMENT=prod:useful-anaconda-844 npx convex deploy`.
- Horaires de prière : API AlAdhan (gratuite), réglages imposés de la mosquée Al-Houda d'Antony sur Mawaqit (méthode personnalisée : Fajr 15°, Isha 15°, Maghrib + 4 min, ajustement haute latitude « angle based ») ; constante `prayerCalculation` dans `src/hooks/use-prayer-times.ts`.
- Design du dashboard : `src/styles/nour-ui.css` (classes `n-*`, mode nuit compris), polices Sora (titres), Urbanist (texte), Amiri et Noto Naskh Arabic (arabe).

## Démarrage rapide

```bash
bun install
npx convex dev
bun run dev
```

Copier `.env.example` en `.env` et le remplir avant de lancer. Autres scripts : `build`, `lint`, `format`, `preview`.

## Architecture

- `src/pages/` : `Landing`, `Auth`, `Dashboard`, `NotFound` ; routes déclarées dans `src/main.tsx`.
- `src/components/dashboard/` : vues du tableau de bord (écran « Aujourd'hui » `TodayView.tsx`, planning jour/semaine, lecteur audio du Coran, journaux Coran et science, module d'apprentissage, cycle, notes, rappels). Navigation dans `dashboardNavigation.ts` : groupes « Au quotidien » (Aujourd'hui, Coran, Adhkar, Cycle = onglets mobiles), « Approfondir » et « Autres » (panneau « Plus » sur mobile).
- `src/components/RequireAuth.tsx` : protection des routes connectées.
- `src/hooks/` : `use-auth`, `use-prayer-times`, `use-mobile`.
- `src/convex/` : schéma (`schema.ts`), auth (`auth.ts`, `auth.config.ts`, `auth/emailOtp.ts`), et données par compte (`adhkarProgress`, `quranProgress`, `scienceProgress`, `scienceBooks`, `scienceLearning`, `cycleTracking`, `personalNotes`, `users`). Textes des adhkar dans `adhkarData.ts`.
- `scripts/prerender-landing.mjs` : pré-rendu de la landing page pour le SEO, lancé à la fin de `build` (avec `public/robots.txt` et `public/sitemap.xml`).
- `src/convex/_generated/` : à garder dans git (nécessaire au build Vercel).
- Données stockées dans le navigateur (pas dans Convex) : modules affichés sur « Aujourd'hui » (`nour-today-modules`), activités du planning, position et école de calcul de l'Asr. Passage des modules dans le compte possible plus tard (décision du 2026-10-19 : navigateur pendant la phase de test, offre Convex gratuite).

## Variables d'environnement

Noms et rôles uniquement ; les valeurs vivent dans `.env` (ignoré par git) ou dans Vercel / Convex.

Côté front (`.env`, Vercel) :
- `VITE_CONVEX_URL` : URL du déploiement Convex.
- `VITE_DEMO_MODE` : `true` uniquement pour la version de test anonyme.
- `CONVEX_SITE_URL` : URL du site pour l'auth.
- `CONVEX_DEPLOYMENT` : déploiement utilisé par `npx convex dev`.
- `CONVEX_DEPLOY_KEY` (Vercel, environnement Production uniquement) : clé de déploiement Convex de production ; active le déploiement du back à chaque build. Ne pas la mettre en Preview, sinon chaque branche déploierait sur la prod.

Côté Convex (`npx convex env set`) :
- `JWKS`, `JWT_PRIVATE_KEY`, `SITE_URL` : clés et URL de Convex Auth.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` : connexion Google.
- `NOUR_DEMO_MODE` : `true` sur le déploiement de test pour désactiver Google et e-mail.
- Variables du relais Hostinger : voir `hostinger-mailer/README.md` [À CONFIRMER : liste exacte].

## Feuille de route

- Priorités issues du questionnaire (voir `docs/analyse-questionnaire-2026-10.md`), dans l'ordre décidé le 2026-10-19 :
  1. Refonte du design du dashboard (esthétique, navigation, rendu « trop IA ») : direction dans `docs/direction-design-2026-10.md`, maquette `docs/maquette/aujourdhui.html` validée le 2026-10-19 (titres en Sora). Fait : navigation, écran « Aujourd'hui », page publique (Landing), Planning (vue Jour) et Coran. Reste : Adhkar, Cycle, Science, Notes, Réglages et la vue Semaine du Planning. Principe demandé : « comme l'accueil, interactif sans être trop compliqué ».
  2. Preuves des adhkar : fait (voir journal). Élargir la liste avec d'autres adhkar authentifiés : [À CONFIRMER].
  3. Fiche « Pendant les règles » : brouillon sourcé dans `docs/contenu-regles-brouillon.md`, à faire relire avant intégration.
  4. Page « Notre démarche » (qui est derrière l'app, minhaj, relecture, pas de publicité) : [À CONFIRMER : informations à fournir].
- Règle de contenu : Bukhari, Muslim et autres recueils authentifiés avec degré affiché ; divergences signalées comme telles.
- La branche `fix/icons-point-8` est fusionnée dans `main` (PR #1) ; elle existe encore sur GitHub et peut être supprimée si elle ne sert plus.

## Journal

- 2026-10-18 : repo cloné dans `Desktop\nour-app` ; `.env` retiré du suivi git (commit `2260268`, poussé sur `main`) ; création de ce fichier.
- 2026-10-18 : PR #1 (`fix/icons-point-8`) fusionnée sur GitHub : palette crème et sauge, lecteur audio du Coran, module d'apprentissage, journal science avec liste de lecture, pré-rendu SEO de la landing ; ce fichier mis à jour en conséquence.
- 2026-10-19 : page « Science bénéfique » en erreur en production : les fonctions `scienceBooks` et `scienceLearning` (PR #1) n'avaient jamais été déployées sur Convex. Corrigé par `npx convex deploy` vers `useful-anaconda-844` (index `scienceBooks.by_user_position` et `scienceLearningItems.by_user_createdAt` créés). `vercel.json` déploie désormais Convex au build quand `CONVEX_DEPLOY_KEY` est définie.
- 2026-10-19 : analyse du questionnaire (14 réponses) dans `docs/analyse-questionnaire-2026-10.md`. Preuves des adhkar vérifiées et affichées (`src/convex/adhkarData.ts`, bloc « Preuve » du dashboard) : rapporteur, recueil, numéro et degrés tels que publiés par sunnah.com. « Radîtu billâhi rabban » retiré (da'îf selon al-Albânî, Abû Dâwud 5072 et at-Tirmidhî 3389) ; « لَكَ » ajouté dans Sayyid al-istighfâr (Bukhari 6306) ; fins « al-masîr » / « an-nushûr » du matin et du soir alignées sur at-Tirmidhî 3391. Brouillon de la fiche règles dans `docs/contenu-regles-brouillon.md`.
- 2026-10-19 : tri des 12 inspirations visuelles et direction design (`docs/direction-design-2026-10.md`) : crème + sauge, accent mauve doux, navigation 4 onglets + Plus. Maquette statique de l'écran « Aujourd'hui » dans `docs/maquette/aujourdhui.html`.
- 2026-10-19 : nouveau dashboard en place (navigation groupée, barre d'onglets mobile + « Plus », écran « Aujourd'hui » avec prochaine prière, adhkar du moment, reprise du Coran, cycle, modules personnalisables ; onglet « Adhkar » dédié). Horaires de prière : méthode MWL imposée (l'UOIF était la valeur par défaut), choix de méthode retiré des Réglages et remplacé par une explication.
- 2026-10-19 : page publique (`src/pages/Landing.tsx`) refaite avec le nouveau design (classe racine `n-landing`, sans nuages, effet verre ni ombres violettes) : accroche « Une routine douce, à ton rythme », aperçu de la prochaine prière (horaires d'exemple signalés), principes, fonctionnalités, 3 étapes, FAQ enrichie (sources des invocations, méthode MWL, données). Anciennes règles CSS `.landing-*` retirées de `src/index.css`. Logo déplacé dans `src/components/NourMark.tsx`.
- 2026-10-19 : page publique : « Selon le Coran et la Sunna authentique » mis en avant dans l'accroche, principes « Fidèle au Coran et à la Sunna authentique, selon la compréhension des pieux prédécesseurs » et « Sans publicité » (validés par Sarah).
- 2026-10-19 : déploiement en production : `main` (`4744dc3`) poussé, Vercel « Production » réussi selon GitHub, `npx convex deploy` fait. Le domaine `muslim-dhikr-companion-main.vercel.app` sert pourtant encore la version de 06:05 : domaine probablement pas rattaché au dernier déploiement de production [À CONFIRMER dans Vercel].
- 2026-10-19 : Planning (vue Jour) en frise verticale (passé estompé, prochain moment mis en avant, repère « Maintenant », activités ajoutées supprimables) ; Coran en deux colonnes (liste des sourates avec recherche à gauche, sourate complète verset par verset à droite, clic sur un verset = écoute à partir de là, lecteur audio fixe, options repliables) ; journal de lecture replié. Correction : sourates mecquoises affichées « médinoises » (casse de `revelationType`).
- 2026-10-19 : cause réelle de l'erreur Google « invalid_client » : le site Vercel utilisait le déploiement Convex `adjoining-hamster-203` (inutilisé, sans variables) au lieu de `useful-anaconda-844`. `VITE_CONVEX_URL` (Production) corrigée dans Vercel. Pré-rendu de la page publique sans analyse des dépendances Vite (`scripts/prerender-landing.mjs`), qui inondait les logs Vercel d'avertissements « Request is outdated ». Fin des branches de fonctionnalité : tout se fait désormais sur `main`.
- 2026-10-19 : origine de hamster trouvée : l'intégration Vercel « convex-carmine-park » (équipe Convex gérée par Vercel) injecte sa propre `CONVEX_DEPLOY_KEY`, qui écrasait `VITE_CONVEX_URL` au build. Décision (option A) : garder `useful-anaconda-844` (11 comptes, réglages Google), déconnecter l'intégration dans Vercel et déployer Convex à la main (`npx convex deploy` vers anaconda). Motif des cartes sombres (`.n-pattern`) sur toute la largeur, effacé vers le bas.
- 2026-10-19 : connexion Google rétablie en production (testée par Sarah) après déconnexion de l'intégration Vercel convex-carmine-park et redéploiement. Horaires de prière : la MWL (18°/17°) remplacée par les réglages de la mosquée Al-Houda d'Antony sur Mawaqit (Fajr 15°, Isha 15°, Maghrib + 4 min) ; vérifié le 19 octobre 2026 à Antony : Fajr 06:50, Dhuhr 13:36, Maghrib 18:58 et Isha 20:21 identiques à Mawaqit, Asr 16:25 contre 16:24. Textes des Réglages, de la FAQ et du Planning mis à jour.

## Problèmes connus

- `.env` a été suivi par git jusqu'au commit `2260268` : il reste dans l'historique. Il ne contenait que `VITE_CONVEX_URL`, `CONVEX_SITE_URL` et `CONVEX_DEPLOYMENT` (adresses, pas de clé secrète).
- Le README demande `bun`, mais le repo contient un `package-lock.json` (npm) : gestionnaire de paquets à clarifier.
- Notifications navigateur : envoyées seulement quand l'application est ouverte.
- `CONVEX_DEPLOYMENT` est vide dans le `.env` local : le CLI Convex ne sait pas quel projet viser sans préfixer la commande (`CONVEX_DEPLOYMENT=prod:useful-anaconda-844`). Nom du déploiement de dev : [À CONFIRMER].
- `CONVEX_DEPLOY_KEY` n'est pas encore ajoutée dans Vercel [À CONFIRMER] : tant qu'elle manque, le déploiement Convex reste manuel.
- La progression des adhkar est stockée par position (`currentIndex`) : quand la liste change, le front et Convex doivent être déployés ensemble, sinon le bouton de répétition renvoie une erreur. Une progression en cours le jour du déploiement peut être décalée.
- Traductions françaises des adhkar : pas encore relues par une personne de science [À CONFIRMER].
- Les règles CSS globales `.dashboard-shell [class*="rounded-"]`, `[class*="text-stone-"]`… réécrivent les classes Tailwind de l'ancien design ; le nouveau design utilise les classes `n-*` pour y échapper. À supprimer une fois tous les écrans restylés.
- Le déploiement `useful-anaconda-844` n'apparaît pas dans le tableau de bord Convex de Sarah (lien direct en 404) ; seul l'accès en ligne de commande fonctionne. À retrouver dans le bon compte ou à migrer vers un projet visible, avec export des données au préalable (constaté le 2026-10-19).
- Convex n'est plus déployé automatiquement au build Vercel : après un changement dans `src/convex/`, lancer `npx convex deploy` vers anaconda.
- Connexion par e-mail en production : `NOUR_MAILER_URL` et `NOUR_MAILER_API_KEY` ne sont pas définies dans Convex, l'envoi du code échoue (constaté le 2026-10-19).
- Traduction française du Coran : chargée depuis `raw.githubusercontent.com/mehdi-stark/Coran-Quran` ; traducteur non identifié et non affiché [À CONFIRMER : quelle traduction, et faut-il en choisir une sourcée].
- Entrée « Notre démarche » prévue dans la navigation, pas encore ajoutée faute de contenu [À CONFIRMER : qui est derrière l'app, minhaj, relecture].
