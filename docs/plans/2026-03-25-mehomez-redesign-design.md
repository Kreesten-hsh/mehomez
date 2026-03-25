# Mehomez Portfolio Redesign Design

## Goal

Créer une version modernisée du site `mehomez.de` qui impressionne visuellement tout en conservant l'intégralité des informations publiques du site actuel.

## Scope

- Repenser l'interface publique du portfolio.
- Conserver toutes les rubriques, œuvres, entrées de parcours, entrées de presse et coordonnées visibles sur le site existant.
- Construire une version locale statique démonstrative, sans dépendre du code source original.

## Source Inventory

Inventaire public récupéré le `25 mars 2026` depuis les endpoints WordPress de `https://mehomez.de`:

- `3` pages WordPress: `Page d'accueil`, `L'artiste`, `Contact`
- `124` articles WordPress
- `205` médias
- Catégories racines: `Infos & Parcours`, `Les Peintures et Les Peintures Sculptées`, `Les Sculptures`
- Sous-catégories annuelles pour les œuvres et la presse

Cette date d'inventaire doit rester visible dans la documentation interne, car le contenu du site public peut évoluer après la reconstruction locale.

## Product Direction

Le site cible doit suivre une logique hybride:

- une page d'accueil premium et immersive pour l'effet de surprise
- des pages internes structurées pour porter la densité documentaire

Le projet ne doit pas chercher à "simplifier" les archives. Il doit les rendre plus claires, plus élégantes et plus faciles à parcourir.

## Information Architecture

### Primary Navigation

- `/` : accueil premium
- `/artiste.html` : biographie, démarche, présentation
- `/oeuvres.html` : portail global des œuvres
- `/parcours.html` : infos, expositions, résidences, événements
- `/presse.html` : revue de presse
- `/contact.html` : coordonnées

### Secondary Navigation

- filtres par type d'œuvre
- filtres par année
- pages détail pour les œuvres
- pages détail pour les articles de presse

## Visual Direction

Direction validée: `muséal éditorial chaleureux` avec un `dark mode cinématique`.

### Light Mode

- fond ivoire texturé
- noirs profonds
- accents terre cuite, cuivre, brun encre
- forte hiérarchie typographique
- grands espaces respirants

### Dark Mode

- fond anthracite minéral
- textes chauds légèrement cassés
- accents bronze, ocre, rouge terre
- mise en scène plus cinématique des œuvres

### Typography

- serif expressive pour les titres, artistes, citations et têtes de section
- sans serif sobre pour métadonnées, légendes et navigation

## Experience Principles

- La homepage doit impressionner rapidement.
- Les pages internes doivent ralentir le rythme et laisser respirer les œuvres.
- Les métadonnées d'œuvres doivent rester lisibles et systématiques.
- Le dark mode doit être une vraie direction visuelle, pas une inversion automatique.
- Le mobile doit garder une hiérarchie claire sans menus complexes.

## Content Preservation Strategy

Le redesign repose sur une logique de `source de vérité` locale:

- chaque œuvre devient une entrée normalisée avec `slug`, `titre`, `année`, `catégories`, `description`, `technique`, `dimensions`, `images`
- chaque entrée de parcours garde sa date, sa rubrique et son contenu
- chaque entrée de presse garde son titre, sa date, sa source et ses médias
- les contenus WordPress seront figés localement à partir d'un snapshot JSON

Règle de conservation:

- aucune œuvre récupérée ne doit disparaître
- aucune rubrique existante ne doit disparaître
- aucune année peu remplie ne doit être fusionnée ou masquée
- aucune métadonnée technique ne doit être supprimée

## Technical Approach

Le site démonstratif sera un site statique multi-pages:

- HTML pour la structure des pages
- CSS pour le design system, les layouts et le dark mode
- JavaScript léger pour les filtres, le routage des pages détail et les interactions
- un fichier de données local généré à partir du snapshot WordPress

Le projet s'appuiera sur les URLs d'images publiques du site existant, faute de code source ou de médiathèque locale.

## Page-Level Design

### Home

- hero immersif
- manifeste court
- œuvres mises en avant
- accès rapide aux rubriques
- extrait du parcours et de la presse

### Artiste

- portrait
- biographie
- texte de démarche
- résumé du parcours

### Œuvres

- vue d'ensemble
- filtres par type et année
- cartes d'œuvres
- liens vers fiches détail

### Parcours

- timeline éditoriale
- expositions, résidences, ateliers, événements

### Presse

- grille ou liste éditoriale
- détails par article

### Contact

- coordonnées
- liens utiles
- bloc de prise de contact simple

## Risks And Constraints

- Le site d'origine ne fournit pas forcément toutes les images en haute résolution.
- Certains contenus WordPress anciens peuvent contenir du HTML irrégulier.
- Les textes de certaines entrées presse peuvent être essentiellement visuels.
- Sans code source original, le projet local sera une reconstruction fidèle et non un clone exact.

## Verification Checklist

- Toutes les pages racines du site actuel ont un équivalent.
- Le nombre d'œuvres reconstruites correspond au snapshot local.
- Toutes les entrées `Infos & Parcours` sont présentes.
- Toutes les entrées `Revue de presse` sont présentes.
- Les fiches d'œuvres affichent les informations techniques disponibles.
- Le site fonctionne en `light mode` et en `dark mode`.
- La navigation reste claire sur mobile et desktop.

## Non-Goals

- Reproduire le thème WordPress d'origine
- Réimplémenter l'administration
- Éditer le site de production
- Télécharger ou modifier des médias côté serveur
