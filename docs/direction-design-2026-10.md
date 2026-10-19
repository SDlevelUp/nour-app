# Direction design du dashboard : tri des inspirations

Base : les 12 inspirations envoyées le 2026-10-19, confrontées au questionnaire (`docs/analyse-questionnaire-2026-10.md`).

## Les règles du tri (issues du questionnaire)

| Demande | Conséquence sur le design |
|---|---|
| Calme et apaisant (7), vert pastel (8) et beige (7) en tête | Base crème + sauge (déjà en place) ; mauve ou lavande en accent seulement |
| « Rose = overdose », rose poudré choisi 3 fois seulement | Pas d'interface dominée par le rose |
| Calligraphie et motifs (6), pas de visages, gêne face aux images IA | Aucune photo ni illustration de personne, aucune image générée |
| Pas de pression (7), pas de ton marketing (6) | Pas de score, de jauge, de série ni de « You're doing great » |
| Pas trop technique (9), pas de design chargé (6) | Peu d'éléments par écran, navigation courte |
| Arabe + translittération + traduction (8), sources visibles (11) | Le bloc texte religieux est le composant le plus soigné de l'app |

## Tri des 12 images

| # | Inspiration | Verdict | On garde | On jette |
|---|---|---|---|---|
| 1 | KendraFit (yoga, rose, ordinateur et téléphone) | **Éliminée** | Rien de spécifique | Photos de femmes, textes illisibles typiques d'une image générée par IA (« FEATNESS », « Marnieg for Math Yoga »), calories et étoiles, rose partout |
| 2 | Jauge « 7/10 Steady » | **Éliminée** | Les tuiles d'icône sur fond teinté (lavande pâle) | La note sur 10, la photo de profil, « You're doing great » : c'est de la pression |
| 3 | Cartes de notification + barre d'onglets en pilule | **Gardée (partiel)** | La barre d'onglets flottante où l'onglet actif affiche son nom ; les cartes de rappel avec icône teintée et ton doux | Le magenta de la barre (à remplacer par le sauge foncé), les émojis |
| 4 | App islamique de suivi des règles (4 écrans) | **Gardée pour les idées, pas pour le style** | Bandeau des jours, statut « Prières en pause », « Jour 3 », compteur de qada par prière, message clair sur la confidentialité des données | Fond dégradé violet-rose, plumes et étoiles scintillantes : c'est le style « IA » à éviter |
| 5 | Zoom de l'écran « Day 3 of hayd cycle » | **Gardée (structure)** | En-tête avec bandeau de la semaine et pastille de statut | Même dégradé que l'image 4 |
| 6 | Suivi de cycle lavande (Victoria) | **Gardée (partiel)** | Grandes cartes arrondies, historique des durées en barres douces, bouton central « + » | Photo de couple, tout-lavande monochrome, rubrique fertilité |
| 7–8 | Ramadhan Pro (lecteur de sourates) | **Gardée : la plus utile** | Navigation latérale regroupée et lisible (catégories, libellés clairs), lecteur en colonnes (liste des sourates, puis texte), chaque verset en trois lignes : arabe, translittération, traduction | Le bleu, la rubrique « Following » avec photos de cheikhs, le streaming |
| 9 | Flowzy, page d'accueil SaaS | **Éliminée pour le dashboard** | La sobriété de l'app intégrée : petits textes, bordures fines, peu d'ombres | Nuages lavande, effet verre, logos de clients, avis : marketing et style « IA » |
| 10 | Dashboard rose « Hello, Alice » | **Éliminée (une idée gardée)** | En-tête « salutation + date du jour » ; tuiles « Aujourd'hui » (à remplacer par prochaine prière, adhkar, lecture) | Barre latérale rose, illustration de femme, photos d'amies, graphique d'activité |
| 11 | Flowzy, « Steps to… » | **Pour la landing, pas pour le dashboard** | La frise en étapes, utile plus tard pour « Comment ça marche » | Le reste |
| 12 | Flowzy, page complète | **Éliminée** | Rien pour le dashboard | Prix, logos, faux avis : interdit par nos règles (rien d'inventé) |

**En bref :** on garde les **structures** des images 3, 4–5, 6 et 7–8, et presque aucun **style**. Les dégradés pastel, les nuages, les étoiles, l'effet verre et les visages sont exactement ce qui donne le rendu « IA » : on les retire tous.

## Pourquoi ça fait « IA », et ce qu'on fait à la place

| Signe « IA » | Alternative moderne |
|---|---|
| Dégradés violet-rose, nuages, étoiles scintillantes | Aplats de couleur ; une seule couleur d'accent ; motif géométrique islamique en traits fins dessiné en SVG (pas une image générée) |
| Ombres douces partout, cartes flottantes | Bordures d'un pixel, fonds légèrement teintés, ombres réservées aux éléments flottants (barre d'onglets, fenêtres) |
| Même police partout, tailles proches | Hiérarchie typographique marquée : un très grand chiffre pour l'heure de la prochaine prière, des titres nets, des chiffres à chasse fixe pour les horaires |
| Tout est arrondi à l'identique | Deux rayons seulement (petit pour les contrôles, grand pour les cartes) |
| Photos et illustrations de personnes | Calligraphie ton sur ton (demandée par une répondante), motifs géométriques ou floraux |
| Score, jauge, « You're doing great » | État neutre : « 3 adhkar sur 3 », « Reprendre à la page 112 » |

Références d'interfaces modernes sans effet « IA » pour l'esprit général : Things 3, Linear, Notion Calendar. Leur force : peu de couleur, une typographie forte et beaucoup d'espace.

## Proposition concrète

### Couleurs
- Fond : crème (actuel).
- Couleur principale : sauge foncé (actuel), pour les actions et l'onglet actif.
- Accent : un seul, au choix (voir arbitrage 1).
- Texte : un vert très foncé presque noir plutôt que le noir pur, pour garder le calme.
- Rose : seulement dans le module règles, et à petite dose.

### Typographie
- Actuellement, Urbanist est la seule police (titres et texte), avec Noto Naskh Arabic pour l'arabe.
- Décision : Urbanist pour le texte, Sora pour les titres, arabe soigné (taille plus grande, interligne généreux).

### Navigation (aujourd'hui 7 entrées : Accueil, Planning, Al-Quran, Science bénéfique, Périodes d'excuse, Notes, Réglages)
Proposition fondée sur les fonctions les plus demandées (Coran 12, adhkar 9, routine 9, horaires 8, règles 6) :

| Mobile : barre d'onglets en pilule (image 3) | Ordinateur : barre latérale regroupée (images 7–8) |
|---|---|
| Aujourd'hui · Coran · Adhkar · Cycle · Plus | **Au quotidien** : Aujourd'hui, Coran, Adhkar, Cycle |
| « Plus » ouvre : Science bénéfique, Planning, Notes, Réglages | **Approfondir** : Science bénéfique, Planning, Notes |
| | **Autres** : Réglages, Notre démarche |

### Écran « Aujourd'hui »
1. Salutation et date, grégorienne et hégirienne (image 10).
2. Grande carte « Prochaine prière » : nom, heure en très grand, temps restant.
3. Carte « Adhkar du moment » (matin ou soir selon l'heure) : reprendre où l'on s'est arrêtée.
4. Carte « Coran » : reprendre la lecture.
5. Si le suivi est activé : bandeau des jours du cycle avec statut (images 4–5).
6. Rien d'autre par défaut ; les autres modules peuvent être ajoutés par l'utilisatrice.

### Lecture (Coran et adhkar)
Modèle des images 7–8 : arabe en grand, translittération, traduction, puis la preuve repliable sous le texte.

## Décisions (2026-10-19)
- Accent : **mauve doux**.
- Navigation : **4 onglets + Plus** sur mobile, barre latérale en 3 groupes sur ordinateur.
- Maquette statique de l'écran « Aujourd'hui » : `docs/maquette/aujourdhui.html` (à ouvrir dans un navigateur ; réduire la fenêtre pour voir la version mobile). Polices validées : **Sora** (titres), **Urbanist** (texte, déjà en place), Amiri (arabe mis en avant) ; pas de police à empattements type Playfair ou Cormorant. Les horaires, dates et progressions qu'elle affiche sont des données d'exemple.
