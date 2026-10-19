# Questionnaire « Ton avis compte » : ce qui en découle

Sources : export Typeform (10 réponses, 9 octobre 2026) et export Tally (4 réponses, 10 et 11 octobre 2026). **14 répondantes au total.**
Les e-mails laissés par les répondantes ne sont pas repris ici.

> Échantillon petit : les tendances sont utiles pour orienter, pas pour trancher seules. Sur Tally, plusieurs questions acceptent plusieurs réponses, contre une seule sur Typeform pour certaines (usage principal, phrase rassurante) : les totaux de ces questions peuvent dépasser 14.

## En une phrase

Elles veulent une application **sourcée avant tout, simple, calme, sans musique ni pression**. Le cœur attendu est **Coran + adhkar + routine matin/soir + horaires de prière**, et le suivi des règles intéresse surtout s'il apporte **les règles fiqh avec références** et le **calcul du qada**.

## Qui a répondu

| | Réponses |
|---|---|
| 25–34 ans | 7 |
| 35–44 ans | 6 |
| 45–54 ans | 1 |
| iPhone / Android / les deux | 7 / 5 / 2 |
| Utilisent déjà une appli : souvent / parfois / pas encore | 2 / 8 / 4 |

→ Il faut fonctionner aussi bien sur iPhone que sur Android : l'approche web/PWA actuelle convient.

## 1. La confiance : le point n°1

| Ce qui donne confiance | Réponses |
|---|---|
| Sources visibles pour chaque contenu | **11 / 14** |
| Savoir qui est derrière l'application | 6 |
| Contenu relu par une personne de science | 5 |
| Minhaj clairement affiché | 5 |

| Ce qui compte dans le contenu religieux | Réponses |
|---|---|
| Références précises (sourate/verset, recueil) | **9** |
| Arabe + translittération + traduction | 8 |
| Invocations uniquement du Coran et de la Sunna authentique | 7 |
| Degré d'authenticité des hadiths | 4 |
| Avis de savants reconnus | 3 |
| Audio de récitation | 1 |

« Du contenu sans source ni référence » est aussi l'une des deux choses à éviter les plus citées (9 / 14).

Remarques libres :
- Une répondante demande que les **divergences entre savants** soient mentionnées, avec le rappel du comportement à adopter face à la divergence.
- Une autre demande des **références précises + explications**.

**Ce que ça implique pour Nour :**
- **Priorité absolue : compléter les preuves des adhkar.** Aujourd'hui, dans `src/convex/adhkarData.ts`, chaque invocation a ses champs de preuve (rapporteur, recueil, numéro, degré, source de classification) à « TODO — à relever et vérifier ». C'est exactement ce que les répondantes attendent en premier.
- Afficher, pour chaque contenu, la référence et le degré d'authenticité, de façon visible mais discrète.
- Ajouter une page « Qui sommes-nous / notre démarche » : qui est derrière l'app, minhaj, qui relit le contenu. Elle n'existe pas encore. [À CONFIRMER : nom de la personne de science qui relit, si tu en as une.]

## 2. Les fonctions attendues

| Fonction jugée utile | Réponses |
|---|---|
| Lecture et suivi du Coran | **12** |
| Dhikr / adhkar | 9 |
| Routine du matin / du soir | 9 |
| Horaires de prière et adhan | 8 |
| Suivi des règles / nifas | 6 |
| Rappels | 6 |
| Espace personnel | 5 |
| Jeûnes surérogatoires (lundi, jeudi, jours blancs) | 3 |
| Interface simple et rapide | 2 |
| Journal / notes personnelles | 1 |
| Qada Ramadan (en tant que fonction séparée) | 0 |

Usage principal déclaré : rappels utiles sans pression (6), organiser sa routine spirituelle (5), dhikr quotidien (3), suivi des règles (1), lecture des invocations (1).

**Ce que ça implique :**
- Le socle actuel (Coran, adhkar, horaires, routine) correspond à la demande. C'est là qu'il faut soigner la qualité avant d'ajouter autre chose.
- Les **jeûnes surérogatoires** sont la seule fonction demandée qui manque, mais elle reste minoritaire (3) : à garder pour plus tard.
- Journal et notes, déjà présents, n'intéressent presque personne (1) : ne pas investir davantage dedans pour l'instant.
- Le qada Ramadan n'est demandé par personne comme fonction séparée, mais par 7 répondantes **dans le cadre du suivi des règles** (voir section 4). Sa place actuelle, dans le module cycle, est donc la bonne.

## 3. Simplicité et ton

| Ce qu'il faut éviter | Réponses |
|---|---|
| Interface trop « technique » | **9** |
| Contenu sans source | **9** |
| Trop de pression | 7 |
| Ton trop marketing | 6 |
| Design trop chargé | 6 |
| Ton trop strict | 4 |
| Trop de contenu | 2 |

| Type d'application préféré | Réponses |
|---|---|
| Simple mais jolie | **6** |
| Très simple | 3 |
| Très complète / plus complète | 3 |
| Je ne sais pas | 2 |

| Espace personnel dédié | Réponses |
|---|---|
| Oui, mais simple | **6** |
| Oui, absolument | 4 |
| Non, un espace unique suffit | 2 |
| Je ne sais pas | 2 |

| Phrase qui rassure le plus | Réponses |
|---|---|
| « Une routine douce, à ton rythme. » | **6** |
| « Une application fidèle au Coran et à la Sunna, selon la compréhension des pieux prédécesseurs. » | 4 |
| « Un espace sans pression. » | 2 |
| « Un accompagnement spirituel respectueux. » | 2 |
| « Ton rythme est le bon. » | 1 |

Autres remarques : une répondante cite les **publicités** (surtout quand elles interrompent la lecture ou l'écoute du Coran) ; une autre dit **se lasser vite** des applis qu'elle a essayées.

**Ce que ça implique :**
- Pas de publicité, et le dire clairement.
- Pas de séries, de scores ou de messages culpabilisants (« tu as raté… »). Les rappels doivent rester proposés, jamais imposés.
- Le tableau de bord actuel a beaucoup de modules : vérifier qu'une utilisatrice peut **masquer ce qu'elle n'utilise pas** et que l'écran d'accueil reste léger.
- Accroche possible pour la landing : « Une routine douce, à ton rythme », complétée par l'engagement de fidélité au Coran et à la Sunna (les deux phrases les plus choisies).

## 4. Suivi des règles / nifas

| Ce qui aiderait le plus | Réponses |
|---|---|
| Suivre mes jours (début, fin, durée) | **9** |
| Calculer mes jours de qada Ramadan | 7 |
| Ce qui est à faire ou à éviter, avec références | 7 |
| Étapes de purification à la fin | 3 |
| N'utiliserait pas cette fonction | 2 |

| Données du suivi | Réponses |
|---|---|
| Sauvegardées dans un compte | **8** |
| Uniquement sur le téléphone (« c'est important pour moi ») | 1 |
| Pas de préférence | 3 |
| N'utiliserait pas la fonction | 2 |

**Ce que ça implique :**
- Le stockage actuel (dans le compte, via Convex) correspond à la majorité.
- Pour la répondante qui tient au stockage local, prévoir au minimum un texte clair sur où vont les données et un bouton pour les supprimer. Une option « uniquement sur cet appareil » serait un arbitrage structurel à discuter.
- À ajouter en priorité dans ce module : la fiche **« à faire / à éviter pendant les règles »**, puis les **étapes de purification**, toutes deux **avec références**. Le contenu demandera une relecture par une personne de science.

## 5. Ambiance visuelle et sons

| Ambiance | Réponses |
|---|---|
| Calme et apaisant | **7** |
| Féminin doux | 4 |
| Minimal chic | 2 |
| Sobre et élégant | 1 |

| Couleurs | Réponses |
|---|---|
| Vert pastel | **8** |
| Beige / crème | **7** |
| Mauve doux | 5 |
| Lavande | 5 |
| Rose poudré | 3 |
| Blanc cassé | 3 |
| Taupe / terre | 1 |
| Noir élégant | 1 |

| Ressenti à l'ouverture | Réponses |
|---|---|
| Inspirée | 6 (+1 « sereine et inspirée ») |
| Sereine | 4 |
| Calme | 3 |

| Visuels | Réponses |
|---|---|
| Calligraphie, motifs géométriques et floraux uniquement | **6** |
| Illustrations stylisées sans visage | 3 |
| Pas de préférence | 3 |
| Photos ou illustrations de personnes acceptées | 1 |
| Autre (« sans images pour se concentrer ») | 1 |

| Sons | Réponses |
|---|---|
| Voix seule (récitation, invocations, adhan), sans musique | **7** |
| Pas de préférence | 5 |
| Aucun son, notifications silencieuses | 1 |
| Choix du type de notification, sans musique ni sonnerie | 1 |

Personne n'a demandé de musique.

Remarques : « beige, sauge et grenade » cité comme inspiration ; « rose = overdose » ; « styles sobres avec calligraphie ton sur ton, sans surcharge » ; une répondante dit être gênée par **des images générées par IA** dans le rendu. [À CONFIRMER : de quelles images il s'agit (questionnaire, maquette, autre support). L'application elle-même ne contient aujourd'hui que `public/logo.svg`.]

**Ce que ça implique :**
- La palette **crème + sauge** déjà en place est validée par les deux couleurs les plus choisies. Mauve et lavande peuvent servir d'accents ; le rose doit rester discret.
- Visuels : calligraphie et motifs géométriques ou floraux, pas de visages, **pas d'images générées par IA**.
- Sons : voix seule, jamais de musique. Prévoir un réglage pour choisir entre son et notification silencieuse.

## Priorités proposées

1. **Compléter et afficher les preuves de chaque adhkar** (référence, degré d'authenticité, source de classification). C'est la demande n°1 et elle est aujourd'hui à l'état de TODO.
2. **Page « Notre démarche »** : qui est derrière l'app, minhaj, relecture, pas de publicité.
3. **Module règles** : fiche « à faire / à éviter » et étapes de purification, avec références ; texte clair sur la confidentialité des données.
4. **Simplicité** : permettre de masquer les modules non utilisés et garder l'accueil léger ; supprimer tout message qui met la pression.
5. **Réglages sonores** : voix seule ou silencieux, sans musique.
6. Plus tard : jeûnes surérogatoires (3 demandes), « un mot arabe par jour » (suggestion isolée).

Mots qui reviennent dans les descriptions en 3 mots (nombre de répondantes) : sérénité / paix / douceur (6), simple / utile (5), motivation / inspirante / avancer (5), fiable / fidèle au minhaj (2).
