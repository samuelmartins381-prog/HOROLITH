# HOROLITH — Bible de production (version Web)

> **Méga-prompt / project bible à donner à Claude Code.**
> Place ce fichier à la racine du repo sous le nom `CLAUDE.md`. Claude Code le lit automatiquement à chaque session.

---

## 0. Contrat de travail avec Claude Code (à lire en premier)

Tu es le lead engineer ET le directeur artistique de Horolith. Règles non négociables :

1. **Tu construis par phases** (voir §14). Tu ne passes JAMAIS à la phase suivante tant que la Definition of Done de la phase courante n'est pas remplie. À la fin de chaque phase, tu t'arrêtes, tu fais un récap, et tu attends mon feu vert.
2. **Zéro fait inventé.** Les noms des 10 Maisons, le lore, les 5 raretés, les taux et les valeurs de pity viennent EXCLUSIVEMENT de la bible Horolith canon (le `CLAUDE.md` de l'app React Native d'origine). Si tu n'as pas ce contenu sous la main, **arrête-toi et demande-le-moi** avant de générer la moindre donnée de carte. N'invente aucun nom de Maison ni aucune référence.
3. **La barre, c'est le premium.** Si un écran ressemble à un template Tailwind par défaut, c'est un bug, pas une étape intermédiaire acceptable. Voir §13 (anti-patterns) et §15 (barre qualité).
4. **Tu critiques ton propre travail.** À chaque écran livré : screenshot mental, qu'est-ce qui trahit l'IA, qu'est-ce que je retire. La règle Chanel : avant de livrer, enlève un accessoire.
5. **Tu écris du TypeScript strict, testé sur la logique de jeu.** Le moteur gacha n'a pas le droit d'être faux.
6. **Tu commit petit et souvent**, messages conventionnels (`feat:`, `fix:`, `chore:`…).

---

## 1. Vision & pitch

Horolith est un **jeu de cartes à collectionner (CCG / gacha)** sur le thème de la **haute horlogerie fictive**, jouable dans le navigateur. Inspiration de boucle : Pokémon TCG Pocket. Inspiration de _feel_ : ouvrir un fond de boîte saphir et voir un mouvement s'animer.

Le joueur ouvre des **packs**, collectionne des **cartes-montres** issues de **10 Maisons horlogères fictives**, complète sa **collection**, et revient chaque jour pour la dose. Le cœur émotionnel n'est pas la stratégie : **c'est le rituel d'ouverture.** Tout le reste sert ce moment.

**Pourquoi le web :** rendu 3D/animation premium beaucoup plus fiable qu'en React Native, distribution sans store, itération rapide, partage par simple URL.

---

## 2. Principe directeur produit — le « feel »

Une seule phrase qui tranche toutes les décisions de design :

> **« Chaque interaction doit avoir le poids, la précision et le luxe d'un objet d'horlogerie — jamais le clinquant d'un free-to-play criard. »**

Concrètement :

- Le luxe se ressent dans la **retenue** et la **matière**, pas dans le nombre d'effets.
- Une seule chose brille à la fois. Le reste est silencieux et discipliné.
- Le timing des animations s'inspire du **battement** (rythme mécanique régulier), pas de l'easing par défaut.
- On ne hurle jamais « LÉGENDAIRE !! » en jaune fluo. La rareté se révèle par la **lumière, la matière et le silence avant l'éclat**.

---

## 3. Direction artistique

### Palette (6 valeurs nommées)

- `--obsidian` `#0B0C0E` — fond principal
- `--blued-steel` `#1E3A5F` → `#2C5A8C` — bleu acier bleui (gradient froid)
- `--rhodium` `#E8E6E1` — blanc rhodié / argent, texte premium
- `--or-rose` `#C9A36B` — accent chaud principal (or rose), réservé aux moments de valeur
- `--rubis` `#7A1220` → `#B11E2F` — rouge rubis synthétique, accent jewel, rare
- `--lume` `#C8D9C0` — lueur luminescente vintage. **Usage exclusif : révélation des hautes raretés.**

Interdits : violet/indigo Tailwind par défaut, néons saturés, dégradés arc-en-ciel.

### Typographie (3 rôles)

- **Display / wordmark** : Cormorant (variable, fort contraste, esprit gravure)
- **Body / UI** : Inter (grotesque suisse neutre, cheval de trait)
- **Données / specs** : JetBrains Mono (références, calibres, numéros de série)

### Matières & textures

- **Guilloché**, **Perlage**, **Côtes de Genève** en texture de fond très basse opacité
- **Cadran soleillé** pour les fonds de carte
- **Émail grand feu**, **laque profonde**, **fumé/dégradé** pour les raretés

### Motion

- Tempo : battement mécanique régulier (4 Hz)
- `prefers-reduced-motion` respecté partout

---

## 4. Stack technique

- **Framework** : Next.js 15 (App Router) + TypeScript strict
- **3D** : `three` + `@react-three/fiber` + `@react-three/drei`
- **Animation orchestrée** : **GSAP**
- **Micro-interactions UI** : Framer Motion
- **2D VFX** : `lottie-react` + shaders custom
- **Styling** : Tailwind CSS v4 + tokens CSS custom + CSS modules
- **State** : **Zustand** (+ persistance)
- **Backend** : **Supabase** (Phase 6)
- **Audio** : `howler`
- **Tests** : Vitest (moteur gacha + économie)
- **Déploiement** : Vercel

---

## 5. Architecture & arborescence cible

```
horolith/
├─ CLAUDE.md
├─ app/
│  ├─ (marketing)/page.tsx
│  ├─ play/
│  │  ├─ collection/
│  │  ├─ open/
│  │  └─ card/[id]/
│  └─ api/
├─ src/
│  ├─ game/          ← logique pure, sans React, testée
│  │  ├─ gacha/
│  │  ├─ economy/
│  │  └─ canon/
│  ├─ render/
│  ├─ ui/
│  ├─ state/
│  ├─ data/
│  └─ audio/
├─ assets/
└─ design/tokens.css
```

Règle : **`src/game` ne dépend jamais de React ni du DOM.**

---

## 6. Systèmes de jeu

### 6.1 Les 10 Maisons — ⚠️ PORTÉ DU CANON

N'invente rien. Si tu ne les as pas : **demande-les avant de coder `src/game/canon`.**

### 6.2 Raretés (5 paliers) — ⚠️ PORTÉ DU CANON

Reprends les 5 paliers canon avec leurs noms exacts.

### 6.3 Carte — modèle de données

```ts
type Card = {
  id: string;
  ref: string;
  house: HouseId;
  rarity: RarityId;
  name: string;
  complication?: string;
  dial: DialStyle;
  serial: number;
  lore: string;
  assets: { glb?: string; face2d: string; foilMask?: string };
};
```

### 6.4 Économie & monnaies

Taux à caler sur le canon s'ils existent.

### 6.5 Moteur gacha — `src/game/gacha`

- Taux de base + soft pity + hard pity + rate-up + doublons
- Tests Vitest : distributions sur 1M de tirages, pity, seed

---

## 7. Pack-opening — spec frame par frame

**A — Anticipation** : plateau velours, tic-tac, glint sur la tranche  
**B — Déclenchement** : geste mécanique de descellement  
**C — Montée / tell rareté** : fuite de lumière colorée selon rareté  
**D — Révélation** : éventail + flip + escalade dopaminergique par palier  
**E — Résolution** : récap, marquage NOUVEAU/doublon, shards animés

Hold-to-skip. Variante reduced-motion. 60 fps.

---

## 8. Shader holographique « verre saphir »

Réaction au mouvement souris/gyroscope. Intensité pilotée par rareté. Subtil au repos. Fallback CSS.

---

## 9. Pipeline d'assets

Meshy → GLB → gltf-transform (Draco/meshopt) → KTX2. Budget par asset documenté.

---

## 10. Audio

Couches : ambiance (atelier, tic-tac) + SFX. Le tic-tac monte en crescendo au reveal.

---

## 11. Backend / persistance

- Phase 2 : localStorage/IndexedDB (local-first)
- Phase 6 : Supabase. Clés en variables d'env, **jamais commitées**.

---

## 12. Budget perf & accessibilité

- 60 fps desktop, ≥ 30 fps mobile stable
- A11y : focus clavier visible, contrastes AA, reduced-motion, textes alternatifs
- Lighthouse ≥ 90 perf sur la landing

---

## 13. Anti-patterns — à NE PAS faire

- ❌ Look « AI par défaut » : fond crème + serif contrasté + terracotta
- ❌ Dégradés violet/indigo Tailwind, néons, glassmorphism générique
- ❌ Emojis dans l'UI de jeu
- ❌ Spinners de chargement standards
- ❌ « LÉGENDAIRE !! » criard, confettis génériques
- ❌ Effets en boucle au repos
- ❌ Inventer du lore ou des noms de Maison

---

## 14. Phases de build

**Phase 0 — Fondations** ✅  
Next.js + TS strict, Tailwind v4, design/tokens.css, ESLint/Prettier, husky, CI.  
_DoD :_ `npm run dev` tourne, tokens en place, page stylée aux couleurs Horolith.

**Phase 1 — Design system + carte statique**  
Composant `Card` premium 2D + shader holo. Composants UI de base.  
_DoD :_ une carte qui réagit à l'inclinaison, indiscernable d'un objet premium.

**Phase 2 — Binder + data layer local**  
`CollectionRepository` local, Zustand, binder, fiche carte.  
_DoD :_ parcourir une collection (données seed) avec fluidité.

**Phase 3 — Moteur gacha (headless)**  
`src/game/gacha` + `economy`, tests Vitest (1M tirages).  
_DoD :_ tests verts, distributions conformes au canon.

**Phase 4 — Pack-opening 2D cinématique**  
Timeline GSAP complète (phases A→E), audio, hold-to-skip.  
_DoD :_ frissons à 60 fps, sans 3D.

**Phase 5 — Pack-opening 3D**  
R3F : pack/boîtier 3D, assets, réfraction/lume.  
_DoD :_ rituel premium, perf tenue, fallback propre.

**Phase 6 — Comptes & sync (Supabase)**  
Auth, tables, pulls signés, sync, wallet.  
_DoD :_ collection persistée multi-appareils, anti-triche de base.

**Phase 7 — Polish & lancement**  
Landing marketing, audit perf/a11y, états vides/erreurs, critique finale, Vercel.  
_DoD :_ Lighthouse ≥ 90, zéro écran qui trahit l'IA.

---

## 15. Barre qualité globale

Avant de déclarer une phase finie :

- Peut-on le confondre avec n'importe quelle autre app ? → Non.
- Y a-t-il une chose mémorable, et le reste est-il calme ?
- La matière horlogère est-elle présente ?
- Le texte aide-t-il vraiment à naviguer ?
- 60 fps, focus clavier visible, reduced-motion respecté ?
