# ADR-007 — Phase 7 : Polish & lancement

**Date :** 2026-07-01  
**Statut :** Décidé

---

## Problème

Phase 7 : polish final avant lancement. Améliorer la landing, gérer les erreurs proprement, migrer les données invité lors de la première connexion, renforcer l'accessibilité, configurer Vercel.

---

## Décisions clés

### 1. Landing : CTA primaire vers le pack-opening

La landing existait depuis Phase 1 mais ne liait pas vers l'expérience centrale (`/play/open`). Deux CTA sont maintenant présents :

- **Primaire** : « Ouvrir un coffret » → `/play/open` (bordure or-rose, uppercase mono)
- **Secondaire** : « Ma collection → » → `/play/collection` (texte rhodium discret)

La hiérarchie visuelle force l'œil vers l'ouverture de pack, conformément au §16.15.

Une ligne des 8 Maisons est ajoutée sous le tagline en texte mono à 14 % d'opacité — présence de l'univers sans surcharge visuelle.

### 2. Pages d'erreur styled-to-brand

`app/not-found.tsx` et `app/error.tsx` partagent `app/error.module.css`. Tous deux utilisent la typographie Horolith (Bodoni Moda italic pour le titre, IBM Plex Mono pour le code et le lien retour). Le code 404 est affiché en ghost text (6 % opacité) — élément visuel discret, pas un panneau d'erreur criard.

### 3. Migration invité → compte (première connexion)

`POST /api/migrate-guest` reçoit `{ collection: Record<string, number> }` et upserte les lignes dans la table `collections`. La route est protégée par `supabase.auth.getUser()`.

Déclenchement dans `useServerSync.loadUserData` : si le serveur retourne une collection vide ET que le store local contient des cartes, la migration est déclenchée en fire-and-forget. Le store local n'est pas écrasé (on ne `hydrateCollection({})` pas). Lors du prochain rechargement, le serveur aura les données et l'hydratation sera normale.

Seule la collection est migrée (pas le wallet) : le wallet local étant initialisé aux mêmes valeurs que le wallet serveur par défaut, la migration est neutre. Migrer le wallet ouvrirait un vecteur d'abus (envoyer des valeurs gonflées depuis le client).

### 4. Notification d'erreur API dans PackOpeningScene

Avant Phase 7, l'échec de `POST /api/pack/open` était silencieux (`return` sans feedback). Désormais :

- `useState<string | null>` pour `apiError`
- Affiché via `<p role="alert">` au-dessus des boutons de paiement
- Effacé à chaque nouvelle tentative et lors du retour à l'état idle

### 5. Accessibilité : lien skip-to-content

Un lien `#main-content` (`.skip-link`) est rendu dans le `<body>` du root layout. Positionné hors-écran par défaut (`top: -100%`), il apparaît on `:focus`. Toutes les pages principales déclarent `id="main-content"` sur leur élément `<main>`.

### 6. En-têtes de sécurité (Vercel)

`vercel.json` déclare pour toutes les routes :

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 7. Ce qui n'est PAS fait en Phase 7

- Personnalisation du template e-mail Supabase : configuré dans le Dashboard Supabase, pas dans le code.
- Page profil utilisateur : hors périmètre, aucune spec dans la bible.
- Lighthouse run automatisé : à exécuter manuellement dans Vercel Analytics après déploiement.

---

## Conséquences

- La landing convertit vers l'expérience centrale au lieu de la collection
- Aucun écran ne laisse l'utilisateur sans feedback en cas d'erreur
- La progression invité est préservée lors de la première connexion
- L'app est navigable au clavier sans souris
- Les en-têtes de sécurité sont en place pour le lancement Vercel
