# ADR-005 — Phase 5 : Architecture 3D pack-opening

**Date :** 2026-06-30  
**Statut :** Décidé

---

## Problème

Phase 5 du cahier des charges : ajouter la couche 3D au rituel d'ouverture de coffret (pack-opening). Trois composantes à couvrir :

1. Le **coffret 3D** (boîtier qui s'ouvre, remplace la version CSS 2D)
2. L'**effet verre saphir** sur les cartes révélées (Maîtrise et au-delà)
3. Les **particules lume** pour les hautes raretés (Grande Œuvre, Opus Aeternum)

Contraintes : 60 fps desktop / 30 fps mobile ; fallback propre si WebGL absent ; GLSL externalisé (§16.6) ; aucun asset binaire chargé (§16.7).

---

## Options envisagées

### Coffret 3D

**A — GSAP 3D CSS (preserve-3d)**  
Avantage : zéro nouvelle dépendance.  
Rejeté : les ombres et la réfraction de matière (métal poli, velours) sont impossibles en CSS seul ; le résultat visuellement reste "plat".

**B — Three.js + R3F (retenu)**  
Avantages : éclairage PBR (MeshStandardMaterial) pour rendre le métal, le velours et l'or avec crédibilité matière ; `useFrame` pour l'animation de couvercle avec lerp exponentiel fluide ; Suspense natif pour le lazy-load.  
Inconvénient : bundle +350 Ko (Three.js). Atténué par dynamic import avec `ssr: false` — Three.js ne bloque pas le SSR ni le Time-to-Interactive.

**C — Babylon.js / Spline**  
Rejeté : sur-dimensionné pour un unique élément de scène ; Spline exige un asset externe hébergé.

---

### Effet verre saphir (cartes Maîtrise+)

**A — CSS `backdrop-filter` + hue-rotate**  
Avantage : aucun JS.  
Rejeté : `backdrop-filter` n'accède pas aux pixels de la carte ; hue-rotate est trop uniforme, sans réaction à la position souris.

**B — Canvas 2D**  
Rejeté : pas de blend modes per-pixel ; performances médiocres sur grande surface.

**C — WebGL2 raw canvas overlay (retenu)**  
Fragment shader GLSL : HSL iridescent drifting, specular hotspot mouse-reactif, vignette radiale. Canvas positionné `absolute; inset:0` au-dessus de `HorolCard`, avec `mix-blend-mode: overlay`. Intensité pilotée par rareté (0.32 → 1.0). Fallback silencieux si WebGL2 absent (overlay non monté).

---

### Particules lume

**A — Canvas / Particles.js**  
Rejeté : ajout de dépendance ; les particules n'ont besoin d'aucun rendu complexe.

**B — CSS animations avec custom properties (retenu)**  
28 divs absolus, animation `particleBurst` via `@keyframes` + CSS custom properties `--tx / --ty` pour la direction individuelle. Seed déterministe (LCG) pour la cohérence SSR/client. `prefers-reduced-motion: reduce` → `display: none` sur toutes les particules. Aucune dépendance ajoutée.

---

## Décisions architecturales clés

### Détection WebGL dans PackCoffret

La détection WebGL (`canvas.getContext("webgl2")`) s'effectue dans `PackCoffret` (composant feuille) plutôt que dans `PackOpeningScene`. Raison : encapsulation — `PackOpeningScene` n'a pas à connaître les capacités GPU. Si WebGL est absent, `PackCoffret` rend le fallback CSS existant sans aucun changement en amont.

### Animation couvercle 3D

Lerp exponentiel dans `useFrame` : `lerp(current, target, 1 - 0.004^delta)`. Cette formule est frame-rate-indépendante (delta en secondes) avec une demi-vie d'environ 65 ms. Le callback `onOpenComplete` se déclenche quand `|rotation - target| < 0.025 rad`.

### GLSL externalisé

Webpack `asset/source` rule dans `next.config.ts` expose les fichiers `.glsl/.vert/.frag` comme strings importables. Les déclarations TypeScript dans `src/types/glsl.d.ts` évitent les erreurs de type. Aucun GLSL inline dans aucun composant React (§16.6).

### Séquençage émotionnel (§16.8)

- Coffret 3D → précision mécanique et matière (velours, métal poli, or)
- Reveal Maîtrise/Virtuosité → overlay saphir subtil (iridescence froide, présente mais discrète)
- Reveal Grande Œuvre → overlay saphir intense + burst lume vert-blanc
- Reveal Opus Aeternum → overlay saphir maximum + burst lume bleu-blanc, couleur `--tier-opus-aeternum` (#a8c8ff)

La montée est monotone. Chaque pallier ajoute exactement une couche visuelle.

---

## Conséquences

- `next.config.ts` modifié (webpack GLSL rule)
- Nouveau : `src/types/glsl.d.ts`, `src/render/shaders/sapphire.{vert,frag}.glsl`, `src/render/coffret/{CoffretScene,CoffretMesh}.tsx`, `src/render/{SapphireOverlay,LumeParticles}.tsx`
- Modifié : `PackCoffret.tsx` (WebGL detection + dynamic import), `RevealCard.tsx` (overlay + particules)
- Dépendances déjà installées : `three ^0.185`, `@react-three/fiber ^9.6`, `@react-three/drei ^10.7`
