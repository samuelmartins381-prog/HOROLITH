# ADR-006 — Phase 6 : Auth & sync Supabase

**Date :** 2026-07-01  
**Statut :** Décidé

---

## Problème

Phase 6 : persister la collection, le wallet et l'état pity sur un compte utilisateur, permettre la synchronisation multi-appareils, et implémenter une anti-triche de base sur les tirages de pack.

---

## Décisions clés

### 1. Auth : magic link par e-mail

Ni mot de passe ni OAuth tiers n'est requis. Supabase `signInWithOtp` envoie un lien magique — aucun secret à stocker côté utilisateur. Le callback `/auth/callback` échange le code PKCE contre une session HTTP-only. Adapté au registre premium de l'app : sobre, sans friction.

### 2. Stratégie locale-first + sync serveur

Le jeu fonctionne intégralement en mode invité (localStorage via Zustand `persist`). La connexion active la synchronisation ; `useServerSync` charge l'état serveur dans les stores Zustand au moment du sign-in, rendant le switchover transparent. Avantage : zéro régression pour les utilisateurs hors-ligne.

### 3. Anti-triche : tirage gacha côté serveur

Les utilisateurs authentifiés ouvrent les packs via `POST /api/pack/open`. L'API :

1. Valide la session via `supabase.auth.getUser()`
2. Lit le wallet/pity depuis la DB
3. Tire les cartes avec un seed cryptographiquement aléatoire (`crypto.getRandomValues`)
4. Appelle `rpc_open_pack` — une fonction SQL SECURITY DEFINER qui déduit la monnaie, met à jour le pity, upserte la collection et insère l'audit log de manière atomique
5. Renvoie le résultat au client

Le mode invité conserve le tirage local. La migration vers le serveur est automatique à la connexion.

### 4. Accrual des packs quotidiens : corrigé

Un bug en Phase 4 rendait les packs quotidiens inaccessibles (`pendingDailyPacks` restait à 0 car aucune logique ne l'initialisait). Corrigé dans Phase 6 :

- `accrueDailyPacks()` remplace `claimDailyPack()` — appelé au montage, accumule le delta horaire
- `spendDailyPack()` consomme un pack (décrémente le compteur)
- Côté serveur, le RPC PostgreSQL accrédite les packs à due proportion avant chaque transaction

### 5. RLS + RPC SECURITY DEFINER

Toutes les tables activent Row Level Security. La fonction `rpc_open_pack` est SECURITY DEFINER, bypass RLS en interne pour garantir l'atomicité (UPDATE wallet + INSERT collection + INSERT audit log dans la même transaction) sans exposer de clé service-role côté client.

### 6. Null-safe en l'absence de Supabase

`getBrowserSupabaseClient()` renvoie `null` quand les variables d'env sont absentes. `useServerSync` détecte le null et passe immédiatement à `loading = false`. L'app reste entièrement fonctionnelle sans Supabase configuré.

---

## Structure

```
supabase/migrations/001_initial.sql   — schéma, RLS, trigger, RPC
src/lib/supabase/
  browser.ts   — singleton client navigateur
  server.ts    — client RSC / route handlers (cookies)
  middleware.ts — refresh de session (appelé par middleware.ts root)
middleware.ts                          — Next.js middleware racine
app/auth/callback/route.ts             — échange PKCE → session
app/api/pack/open/route.ts             — tirage gacha serveur
src/state/auth-store.ts                — état Zustand auth (user, loading)
src/hooks/useServerSync.ts             — init auth + hydratation stores
src/ui/auth/AuthGate.tsx               — bannière sign-in / barre utilisateur
app/Providers.tsx                      — composant racine "use client"
```

---

## Conséquences

- Deux modes co-existent (invité / authentifié) sans rupture de la boucle de jeu
- L'anti-triche protège le résultat des tirages pour les comptes connectés
- `.env.local.example` documente les variables requises ; les vraies clés ne sont jamais committées
- Phase 7 : migration de la progression invité lors de la première connexion
