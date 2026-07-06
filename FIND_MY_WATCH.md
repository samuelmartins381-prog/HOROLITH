# Find My Watch — Stratégie produit pour Chrono24

**Auteur de la note :** exercice de Head of Product / conseil produit
**Statut :** document de travail, prêt pour prototype + vidéo démo + prise de contact Chrono24

---

## 0. Verdict en une page

Chrono24 ne souffre pas d'un problème de catalogue, il souffre d'un problème de **confiance et de décision sur un marché non-fongible**. Contrairement à Amazon, deux annonces avec la même référence ne sont jamais le même produit (état, boîte/papiers, historique d'entretien, réputation du vendeur, marge de négociation). C'est ça, le vrai frein — pas le manque de filtres.

`Find My Watch` est une bonne idée **si et seulement si** elle est construite sur une couche de données qui n'existe probablement pas encore chez Chrono24 aujourd'hui : un **score de cohérence prix/marché** et un **score de confiance vendeur** calculés en continu sur l'ensemble du catalogue. Sans cette couche, l'agent n'est qu'un chatbot habillé qui recommande "joliment" sans rien savoir de plus qu'un bon système de filtres.

Ma recommandation, détaillée en section 9 : **ne pas construire `Find My Watch` en premier**. Construire d'abord la couche d'intelligence prix/confiance (`Price & Trust Intelligence Layer`), la déployer sur 100 % des annonces (invisible, pas de bouton, pas d'opt-in), mesurer l'impact, puis construire `Find My Watch` **par-dessus** cette couche comme expérience premium guidée. Dans ce document, je conçois néanmoins `Find My Watch` dans son intégralité comme demandé, en étant explicite sur ce qui est solide et ce qui est faible.

---

## 1. Diagnostic du parcours utilisateur Chrono24

Chrono24 est une place de marché C2C/B2C de montres d'occasion et neuves, avec ~500 000+ annonces actives, des vendeurs professionnels (dealers) et particuliers, et un modèle de confiance bâti sur "Trusted Checkout", des certificats et des avis vendeurs. Le catalogue est immense et fragmenté : une même référence (ex. Rolex Submariner 126610LN) peut apparaître dans 300+ annonces à des prix variant de 20 à 40 %, avec des états et des inclusions différentes.

### Parcours actuel (simplifié)

1. **Entrée** : recherche par marque/modèle/référence, ou navigation par catégorie.
2. **Liste de résultats** : grille d'annonces avec filtres (prix, année, état, avec/sans papiers, localisation).
3. **Comparaison manuelle** : l'utilisateur ouvre 10-30 onglets, compare à la main.
4. **Fiche annonce** : photos, description vendeur, prix, badges de confiance, bouton "faire une offre" / "contacter le vendeur".
5. **Décision** : achat direct, offre négociée, ou abandon.

### Points de friction identifiés

- **Paralysie du choix** : pour une référence populaire, des centaines de résultats quasi identiques en apparence. L'utilisateur ne sait pas quels critères priorisent réellement la valeur (état du bracelet, service récent, boîte complète, année de production, variante de cadran).
- **Incohérence de prix invisible** : rien n'indique si un prix est bon, dans la moyenne, ou une arnaque potentielle. L'utilisateur doit faire sa propre recherche de marché ailleurs (forums, Chrono24 lui-même en multi-onglets, WatchCharts) — **fuite hors plateforme**, c'est le vrai moment de churn.
- **Confiance vendeur hétérogène** : un badge "Trusted Checkout" existe mais la profondeur de réputation (historique, litiges, délai de réponse) n'est pas exploitée pour aider la décision.
- **Jargon horloger** : les néophytes ne comprennent pas les différences entre références proches (ex. 16233 vs 16220 Datejust), les complications, les tailles de boîtier adaptées à leur poignet, ni ce que signifie "full set" ou "papers".
- **Pas de notion de "pourquoi cette montre pour moi"** : le moteur de recherche répond à des requêtes explicites, pas à des besoins implicites ("je veux une montre pour mon mariage", "mon premier achat de collection", "un investissement qui tient sa valeur").
- **Négociation opaque** : "faire une offre" sans aucune donnée sur ce qui constitue une offre raisonnable — anxiété et sous-utilisation de la fonctionnalité.
- **Pas de mémoire inter-session** : l'utilisateur qui revient après 3 semaines repart de zéro, doit refiltrer, ne retrouve pas facilement son raisonnement précédent.

### Segments distincts

- **Néophytes / premier achat** : bloqués par le jargon et la peur de se faire arnaquer sur un marché d'occasion à fort enjeu financier (souvent 3 000-15 000 €). Abandon principal : peur + incompréhension.
- **Collectionneurs expérimentés** : ne cherchent pas de pédagogie, cherchent de la **vitesse** et de **l'information différenciante** (rare dial variant, prix sous le marché, vendeur réactif). Abandon principal : perte de temps à comparer manuellement, absence d'alerte sur les bonnes affaires réelles.

---

## 2. Concept `Find My Watch`

### Positionnement

`Find My Watch` n'est **pas un chatbot** — c'est un **conseiller structuré hybride** : un flux guidé (questions à choix rapide, type quiz élégant) doublé d'un canal texte libre pour les utilisateurs qui préfèrent décrire leur besoin en langage naturel. Le chat pur est un piège UX classique (charge cognitive de "quoi taper", latence perçue, absence de repères visuels) — ce qui fait la valeur d'un bon vendeur en boutique, ce n'est pas qu'il parle, c'est qu'il **pose 4-5 questions précises et resserre immédiatement le choix**.

### Boucle produit

```
Profilage (30-45s) → Short-list de 3 montres → Explication + comparatif → Alternatives → Action (contact/offre/alerte)
```

### Ce que l'agent doit établir pendant le profilage

- Budget (fourchette, pas un chiffre unique — les gens sous-déclarent leur vrai budget de 20-30 %, prévoir une question indirecte type "seriez-vous prêt à investir 10% de plus pour X bénéfice ?")
- Usage réel : tous les jours / occasions / bureau / sport / collection
- Poignet (taille) → filtre boîtier réaliste, évite les erreurs de taille (frein d'achat énorme et sous-estimé)
- Intention : premier achat, investissement/valeur de revente, pièce de collection, cadeau/mariage, complément de collection existante
- Niveau de connaissance horlogère (auto-évalué ou déduit du vocabulaire employé)
- Marques/styles déjà possédés ou aimés (si compte existant → historique de navigation)
- Tolérance au risque sur l'état (revendu/patiné accepté ou état neuf exigé)

### Pourquoi ce n'est pas trivial de "juste" afficher 3 montres

La difficulté produit n'est pas la génération du texte explicatif (un LLM le fait bien), c'est le **ranking de fond** : sans un vrai modèle de scoring qui combine cohérence prix/marché, fiabilité vendeur, état réel de l'annonce (au-delà du texte marketing du vendeur) et adéquation au profil, l'agent va soit halluciner des justifications, soit recommander les annonces les mieux rédigées plutôt que les meilleures. **C'est le risque n°1 de tout ce projet** : construire une couche de "storytelling IA" par-dessus un ranking naïf (ex. tri par prix ou par date). Voir section 4 pour le socle nécessaire.

---

## 3. Fonctionnalités avancées — évaluées sans complaisance

| Fonctionnalité | Valeur réelle | Verdict |
|---|---|---|
| Comparateur automatique multi-annonces | Élevée — répond directement à la friction n°1 (comparaison manuelle en 20 onglets) | **À construire en priorité** |
| Score de cohérence prix/marché ("Fair Price Score") | Très élevée — c'est la donnée qui manque le plus sur la plateforme actuelle | **Cœur du produit, pas une feature parmi d'autres** |
| Détection de bonnes affaires | Élevée pour les collectionneurs expérimentés, génère de la rétention (raison de revenir) | À construire, mais nécessite le Fair Price Score en amont — dépendance directe |
| Alertes personnalisées | Moyenne-élevée, mécanisme de rétention classique et éprouvé (type alertes Zillow/Idealista) | Facile à justifier en ROI, à faible coût d'implémentation |
| Recommandations "auxquelles l'utilisateur n'aurait pas pensé" | Risque de gadget si mal exécuté — donne une impression d'aléatoire si le lien de justification est faible | À faire, mais **toujours avec justification explicite du lien** (ex. "vous aimez le cadran vert de la Submariner, la Tudor Black Bay 58 Navy Blue partage le même horloger de mouvement à un tiers du prix") |
| Explication de différences entre références proches | Forte valeur pédagogique, différenciant vs marketplace généraliste | Bon investissement, contenu largement pré-générable (pas besoin de le faire à la volée à chaque fois) |
| Copilote de négociation (suggérer une contre-offre) | Valeur utilisateur réelle, **mais risque business direct** : Chrono24 vit de la transaction et de la mise en avant d'annonces ; automatiser la pression à la baisse peut irriter les vendeurs pro qui sont aussi des clients payants (dealers) | À traiter avec prudence — cadrer comme "fourchette de marché" informative, jamais comme un bot qui négocie à la place de l'utilisateur |
| Calculateur de coût total de possession (droits de douane, assurance, entretien) | Élevée pour les achats transfrontaliers (très fréquents chez Chrono24, marketplace internationale) | Sous-estimée dans le brief initial, à ajouter |
| Score de confiance vendeur agrégé (au-delà du badge actuel) | Élevée — lève l'angoisse n°1 des néophytes | À construire, dépend de données déjà présentes chez Chrono24 (historique transactions, litiges, délais) |
| Vue "portefeuille de collection" avec analyse de gap | Intéressante pour les gros collectionneurs (LTV élevée), mais niche | Feature v2, pas MVP |
| Recherche par photo ("je veux l'équivalent moins cher de cette photo") | Techniquement faisable (vision model + matching catalogue), forte valeur virale/marketing | Bon candidat pour un moment "wahou" dans la démo, mais volume d'usage réel incertain — à instrumenter avant d'investir massivement |
| Agent de suivi post-achat (entretien, révision, bracelet) | Valeur réelle mais hors du problème initial (acquisition) — c'est un produit de rétention différent | Ne pas mélanger dans le MVP, backlog v2 |
| "Regret-proofing" — projection de valeur de revente | Différenciant fort (personne ne le fait bien aujourd'hui), aligné avec l'ADN "montre = actif" de la culture collectionneur | Ambitieux, nécessite un vrai modèle de séries temporelles sur les prix (cf. section 4) — à ne pas promettre avant d'avoir la donnée historique fiable |

### Fonctionnalités que je retire ou requalifie du brief initial

- **"Chat qui parle de la montre"** façon assistant conversationnel permanent : gadget à faible usage réel. Les utilisateurs de marketplace à fort enjeu financier veulent des faits vérifiables, pas une conversation. Le chat libre doit rester une option secondaire au flux structuré, pas le canal principal.
- **Automatisation complète de la négociation** : risque business (cf. tableau) et risque de confiance (l'utilisateur doit rester acteur d'un achat de plusieurs milliers d'euros).
- **Recommandations "surprenantes" non justifiées** : toute recommandation hors du profil explicite doit être accompagnée d'un lien causal clair, sinon ça sent le remplissage algorithmique et ça casse la confiance construite par ailleurs.

---

## 4. Architecture IA

### Principe directeur

Le catalogue Chrono24 est une base **structurée** (prix, référence, année, état, localisation, vendeur). La tentation classique est de tout jeter dans un RAG vectoriel façon chatbot documentaire — **c'est une erreur** pour la partie factuelle (prix, specs, disponibilité). Le RAG vectoriel n'a de sens que sur du texte non structuré (descriptions vendeur, avis, contenu éditorial sur les modèles). Le reste doit passer par des requêtes structurées (SQL/filtres) exposées à l'agent comme des outils (tool use), pas comme du texte à retrouver par similarité. C'est la garantie anti-hallucination n°1.

### Modèles IA

- **Raisonnement / orchestration conversationnelle** : Claude Sonnet 5 comme modèle principal pour l'extraction d'intention, la génération d'explications, et l'orchestration des appels d'outils — bon rapport qualité/latence/coût pour un usage production à fort volume.
- **Tâches lourdes ponctuelles** (génération de contenu éditorial pré-calculé type "comparatif 116610LN vs 126610LN", synthèse d'avis vendeurs) : Claude Opus 4.x, exécuté en batch offline, pas en synchrone utilisateur — ça ne coûte rien en latence perçue et ça permet d'utiliser le modèle le plus capable là où ça compte (contenu qui sert à des milliers de sessions).
- **Classification légère / extraction rapide** (ex. catégorisation d'une requête libre, détection de langue, modération) : Claude Haiku 4.5 — coût et latence minimaux.
- **Vision** (recherche par photo, détection d'incohérence entre photos d'annonce et description) : modèle multimodal Claude (Sonnet 5 supporte la vision) pour l'analyse d'images de montres — matching de cadran/boîtier contre le catalogue de référence.
- **Scoring quantitatif (Fair Price Score, détection d'anomalie de prix, projection de valeur de revente)** : **ce n'est pas un travail pour un LLM**. Il faut un modèle statistique classique (gradient boosting — XGBoost/LightGBM — ou modèle de régression hédonique) entraîné sur l'historique des transactions et annonces, avec les caractéristiques structurées (référence, année, état, inclusions, vendeur, région) en features. Le LLM **consomme** le score en sortie, il ne le calcule pas. C'est le point d'architecture le plus important de tout le document : confondre les deux, c'est le chemin vers un produit qui "a l'air intelligent" mais qui ment sur les prix.

### Framework d'agents

- **LangGraph** (ou équivalent maison) pour l'orchestration à états explicites du parcours de profilage → ranking → explication. Préférer un graphe d'états explicite à un agent "libre" en boucle ReAct : le parcours d'achat d'une montre a une structure connue et répétable, pas besoin de laisser le modèle improviser la logique métier — ça réduit la latence, le coût, et la surface d'hallucination.
- **Claude Agent SDK** pour l'implémentation des appels d'outils (tool use) côté agent conversationnel/explicatif, avec des outils fortement typés : `search_catalog`, `get_fair_price_score`, `get_seller_trust_score`, `compare_listings`, `get_reference_diff`, `create_alert`.

### Mémoire

- **Mémoire de session** (courte durée, in-memory / Redis) : réponses au profilage en cours, montres déjà vues dans la session.
- **Mémoire long terme utilisateur** (opt-in, RGPD explicite) : préférences déduites (styles aimés, budget habituel, montres déjà possédées), stockée dans un profil utilisateur classique (Postgres), **jamais** dans le contexte du prompt en clair au-delà de ce qui est nécessaire — résumé structuré, pas transcript brut, pour limiter les coûts et les risques de fuite de données sensibles (budget, adresse via douane).
- Politique claire : l'utilisateur doit pouvoir voir et effacer ce que l'agent "sait" de lui — un écran "Ce que Find My Watch a retenu" est un différenciateur de confiance, pas un détail.

### RAG et recherche

- **Recherche structurée** (SQL/Elasticsearch déjà existant chez Chrono24 vraisemblablement) pour tout ce qui est filtrable : prix, référence, année, localisation.
- **Recherche vectorielle** (pgvector sur Postgres, ou une base vectorielle managée) uniquement pour : similarité sémantique de description d'annonce, matching "montres qui se ressemblent" par contenu éditorial, recherche par photo (embeddings d'image).
- **Base de connaissance horlogère éditoriale** : contenu de référence sur les familles de modèles, différences entre références, précompilé et vectorisé — alimente les explications sans reformuler à chaque fois depuis zéro (coût + cohérence + contrôle éditorial par des experts horlogers, important pour la crédibilité).

### Bases de données

- **Postgres** : profils utilisateurs, historique de session, alertes, préférences.
- **Postgres + pgvector ou base vectorielle dédiée (Qdrant, Weaviate)** : recherche sémantique.
- **TimescaleDB (ou extension time-series sur Postgres)** : historique de prix par référence/état, nécessaire pour le Fair Price Score et la projection de valeur de revente.
- **Catalogue existant Chrono24** : reste la source de vérité, on ne le duplique pas, on l'interroge via API interne.

### APIs et connecteurs

- API interne catalogue/listings Chrono24 (existante).
- API de score de confiance vendeur (à construire si elle n'existe pas déjà sous cette forme).
- API de taux de change et de calcul de droits de douane (fournisseur tiers, ex. type Avalara/Zonos pour la logique douanière si Chrono24 n'a pas déjà ça en interne pour les expéditions internationales).
- Bus d'événements (Kafka ou équivalent) pour logger chaque interaction agent → décision (feedback loop, réentraînement du modèle de scoring, évaluation offline).

### MCP servers

Exposer les capacités internes comme des **serveurs MCP** plutôt que des endpoints ad hoc facilite la réutilisation par d'autres agents internes (support client, outils vendeurs) :

- `mcp-catalog` : recherche et filtrage d'annonces.
- `mcp-pricing` : Fair Price Score, historique de prix, projection de valeur.
- `mcp-trust` : score de confiance vendeur, historique de transactions.
- `mcp-user-profile` : lecture/écriture du profil et des préférences (avec contrôle d'accès strict).

### SDK et bibliothèques

- Claude Agent SDK / Anthropic SDK (orchestration, tool use, streaming des réponses pour un affichage progressif à l'écran).
- LangGraph (orchestration à états).
- XGBoost/LightGBM ou scikit-learn (modèle de scoring quantitatif).
- Pydantic (validation stricte des schémas d'outils — critique pour éviter que le modèle invente des champs).
- Evaluation : un harness maison de type "golden dataset" (transcriptions annotées par des experts horlogers internes Chrono24 sur ce qu'aurait recommandé un bon vendeur) + framework d'éval automatisée (type promptfoo ou équivalent interne) pour détecter les régressions de qualité de recommandation avant chaque déploiement.

### Garde-fous (le vrai sujet critique)

1. **Zéro invention de fait** : toute affirmation sur prix, specs, ou disponibilité doit être traçable à un enregistrement structuré (ID d'annonce cité). Le prompt système interdit explicitement d'extrapoler un prix ou une spec non présente dans les données récupérées.
2. **Le scoring de prix et de confiance n'est jamais généré par le LLM** — toujours par le modèle quantitatif dédié (cf. plus haut).
3. **Évaluation humaine périodique** : un expert horloger interne revoit un échantillon de recommandations chaque semaine en phase de lancement.
4. **Escalade vers un humain** : pour tout achat au-dessus d'un seuil (ex. 20 000 €) ou toute négociation complexe, proposer explicitement un contact avec un expert Chrono24 humain — garde le produit crédible et gère le risque réputationnel sur les grosses transactions.

---

## 5. UX détaillée

### Point d'entrée

- Bouton **`🔍 Find My Watch`** dans la barre de navigation principale, visible en permanence (pas caché dans un menu).
- Déclencheurs contextuels intelligents (sans être intrusifs, un seul déclenchement par session max) : résultats de recherche vides ou trop nombreux (>200), temps de navigation prolongé sans action (>3 min sur une catégorie sans clic sur une annonce) → bandeau discret "Vous hésitez ? Laissez-nous vous aider à choisir."

### Écran 1 — Lancement

Plein écran (mobile) ou modale centrée large (desktop), fond avec un dégradé sombre discret évoquant l'horlogerie fine (pas de skeuomorphisme cliché de cadran). Titre : "Trouvons la montre qui vous correspond." Sous-titre : "5 questions, 45 secondes, 3 recommandations vraiment pertinentes." Bouton "Commencer" + lien discret "Décrire ce que je cherche en une phrase" (bascule vers le mode texte libre pour les utilisateurs qui savent déjà ce qu'ils veulent).

### Écran 2 — Profilage (5-6 étapes)

Chaque étape = une carte avec une question, des choix visuels en tuiles (pas de menu déroulant), une barre de progression fine en haut, bouton "Retour" toujours visible. Animation de transition : glissement horizontal doux (250ms, easing standard, pas de rebond exagéré). Chaque tuile choisie a un état actif net (bordure + fond légèrement teinté), pas de surcharge visuelle.

Ordre des questions : budget (slider à deux poignées avec fourchette pré-remplie par palier réaliste) → usage → intention (premier achat/investissement/collection/cadeau) → niveau de connaissance (3 niveaux avec description courte, pas de jargon) → taille de poignet (schéma visuel simple, pas un chiffre technique) → optionnel : marques déjà aimées (recherche autocomplete, skippable).

### Écran 3 — État de chargement

Pas un simple spinner. Message qui évolue en 2-3 étapes sur 2-4 secondes : "Analyse de 340 annonces correspondant à votre profil…" → "Comparaison des prix avec le marché…" → "Sélection des 3 meilleures options." Ce séquençage donne une impression de travail réel (et c'en est un, si le scoring quantitatif tourne vraiment derrière) plutôt qu'un faux suspense artificiel.

### Écran 4 — Résultats (le cœur du produit)

3 cartes larges (pas de grille de 20), chacune avec :
- Photo principale de l'annonce.
- Nom de référence + prix + jauge visuelle "Fair Price" (position sur une échelle bas marché → au-dessus du marché, avec zone verte).
- Une phrase de justification directe : "Correspond à votre budget et à un usage quotidien ; état excellent avec révision récente documentée."
- Bouton "Voir pourquoi" → dépliant avec le détail du raisonnement (compromis inclus, ex. "bracelet non-original, à prévoir en option").
- Bouton "Comparer" (coche la carte pour l'ajouter à une vue comparatif).

Sous les 3 cartes, section repliée "Alternatives auxquelles vous n'aviez peut-être pas pensé" (2-3 suggestions avec justification explicite du lien).

### Écran 5 — Vue comparatif

Tableau (desktop) / cartes empilées avec swipe (mobile) : prix, année, état, inclusions, score de confiance vendeur, délai de réponse vendeur, Fair Price Score — colonnes alignées pour comparaison directe. C'est l'écran qui répond le plus directement à la friction n°1 identifiée en section 1.

### Écran 6 — Fiche annonce enrichie

La fiche annonce existante de Chrono24, augmentée de : jauge Fair Price, badge de confiance détaillé (au survol : historique résumé), et si pertinent, bloc "Différence avec [référence proche]" quand l'utilisateur a hésité entre deux références pendant le profilage.

### Écran 7 — Actions de suivi

Une fois la sélection faite (ou même sans achat immédiat) : "Créer une alerte sur ce modèle" (prix cible, nouvelle annonce similaire), ou "Parler à un expert Chrono24" pour les transactions complexes/élevées — le handoff humain est assumé et mis en avant, pas caché comme un échec de l'IA.

### Ton et voix

Expert mais jamais condescendant, toujours transparent sur le raisonnement ("voici pourquoi", jamais d'affirmation sans justification visible), vocabulaire accessible avec des info-bulles pour les termes techniques plutôt que de l'éviter (pédagogie progressive, pas nivellement par le bas pour les connaisseurs).

---

## 6. Business

### Pourquoi Chrono24 accepterait

- Aligné avec le narratif stratégique de Chrono24 (confiance + expertise sur un marché d'occasion à fort enjeu) — pas une feature IA gadget mais un renforcement de la proposition de valeur centrale de la marque.
- Différenciation face à des concurrents généralistes (eBay) ou spécialisés plus petits (Watchfinder, Bob's Watches) qui n'ont pas la donnée à cette échelle.
- Levier direct sur la conversion, métrique dont dépend directement le take-rate de la marketplace.
- Potentiel de monétisation additionnelle (voir ROI) sans cannibaliser le modèle publicitaire des annonces boostées, **si** bien cadré (l'agent recommande sur des critères objectifs, pas en fonction de qui a payé pour être mis en avant — point de gouvernance à trancher explicitement avec l'équipe monétisation, sinon risque de conflit d'intérêt interne).

### KPIs impactés

- Taux de conversion recherche → contact vendeur / offre.
- Temps médian entre première visite et première offre (raccourcir le cycle de décision).
- Taux de rebond sur les pages de résultats de recherche à forte volumétrie.
- Taux de retour (rétention) via les alertes personnalisées.
- NPS / satisfaction post-achat, en particulier chez les primo-acheteurs (segment le plus sujet à l'abandon par anxiété).
- GMV par visiteur unique.

### Estimation ROI (hypothèses explicites — Chrono24 n'a pas de chiffres publics précis, donc ceci est un ordre de grandeur, pas une prévision)

En supposant : 10 % des visiteurs qualifiés utilisent la fonctionnalité, et parmi eux une amélioration de conversion de +15 % relative (hypothèse conservatrice tirée de cas similaires de "guided selling" dans le retail à forte considération, ex. immobilier/automobile en ligne) sur un taux de conversion de base autour de quelques points de pourcent — l'uplift de GMV se compte en points de pourcentage du GMV total, ce qui à l'échelle de Chrono24 (GMV estimé publiquement de l'ordre du milliard d'euros/an) représente potentiellement plusieurs millions d'euros de GMV additionnel annuel, pour un coût d'infrastructure IA de l'ordre de quelques centaines de milliers d'euros par an en régime établi (coût par session de l'ordre de quelques centimes à un peu plus d'un euro selon le modèle et le volume d'appels d'outils). **Le ratio potentiel est favorable, mais il faut le valider par un test A/B réel avant tout engagement de développement lourd** — ne pas construire le plan de financement sur cette estimation seule.

### Coût de développement (ordre de grandeur MVP)

- Équipe : 1 PM, 2 ingénieurs backend/IA, 1 data scientist (scoring quantitatif), 1 designer produit, 0.5 ingénieur QA/eval — squad resserrée de 5-6 personnes.
- Durée MVP fonctionnel testable en interne : 4-5 mois.
- Coût chargé (salaires + infra) pour cette période : de l'ordre de 400 000 à 600 000 € selon la localisation de l'équipe — à ajuster selon si l'équipe est ré-allouée en interne (coût marginal) ou recrutée (coût complet).
- Le poste le plus sous-estimé habituellement : la construction du modèle de Fair Price Score sur données historiques de qualité suffisante — si cette donnée n'existe pas encore proprement chez Chrono24, prévoir 4-8 semaines supplémentaires rien que pour ce socle.

### Test MVP

- Approche recommandée : **Magicien d'Oz** avant tout développement d'agent complet — un petit groupe d'experts horlogers internes répond manuellement aux profils utilisateurs derrière une interface qui a l'air automatisée, pendant 2-3 semaines, pour valider que la promesse ("3 recommandations qui convertissent mieux que la recherche libre") tient avant d'investir dans l'IA elle-même. C'est la méthode la moins chère pour tester l'hypothèse produit centrale.
- Ensuite, feature flag + A/B test sur un segment de trafic (ex. 5 %), groupe témoin = parcours de recherche actuel, mesure sur 4-6 semaines des KPIs de la section précédente.
- Garder un mécanisme d'escalade humaine dès le MVP (pas une feature v2) — nécessaire pour la crédibilité sur les transactions à enjeu élevé et pour capturer les cas d'échec de l'agent en phase d'apprentissage.

---

## 7. Prototype — écran par écran (récapitulatif pour construction)

1. Page d'accueil Chrono24 avec bouton `Find My Watch` visible dans la nav.
2. Modale de lancement (accroche + CTA + option texte libre).
3. 5-6 écrans de profilage à choix visuels avec barre de progression.
4. Écran de chargement séquencé (2-3 messages).
5. Écran de résultats : 3 cartes avec jauge Fair Price + justification + bouton "voir pourquoi" + section alternatives repliée.
6. Panneau détail "pourquoi cette montre" (compromis inclus).
7. Vue comparatif tabulaire.
8. Fiche annonce enrichie (jauge + confiance + diff de référence si pertinent).
9. Écran d'action : créer alerte / parler à un expert.
10. Écran "Ce que Find My Watch a retenu de vous" (transparence mémoire, contrôle utilisateur).

---

## 8. Script vidéo démo — 5 minutes, comité produit Chrono24

**[0:00–0:30] Ouverture**
Plan sur la page de recherche Chrono24 actuelle, un utilisateur qui scrolle sans fin dans une liste de 340 Submariners. Voix off : "Chaque jour, des milliers d'utilisateurs Chrono24 savent qu'ils veulent une montre — mais pas laquelle. Ils ouvrent 20 onglets, comparent à la main, et beaucoup partent sans acheter. Voici comment on change ça."

**[0:30–1:00] Le déclencheur**
Clic sur `Find My Watch` depuis la nav. Transition fluide vers la modale de lancement. "Pas un chatbot de plus. Un vendeur expert, disponible en continu, qui pose les bonnes questions."

**[1:00–2:00] Profilage**
Enchaînement rapide des 5-6 écrans de profilage (accéléré à l'écran, mais fluide). Montrer le slider de budget à deux poignées, le choix visuel de taille de poignet, le niveau de connaissance. "45 secondes. Pas de jargon imposé, pas de formulaire de recherche à remplir soi-même."

**[2:00–2:20] Chargement**
Les 2-3 messages séquencés à l'écran. "Derrière cet écran : un vrai modèle de scoring qui compare le prix de chaque annonce au marché réel — pas juste un prompt qui invente une réponse."

**[2:20–3:30] Résultats**
Les 3 cartes. Ouvrir "voir pourquoi" sur une carte : justification + compromis affiché honnêtement ("bracelet non-original"). Montrer la jauge Fair Price en vert. Ouvrir la section alternatives, montrer une suggestion inattendue avec sa justification explicite.

**[3:30–4:10] Comparatif**
Basculer sur la vue comparatif tabulaire des 3 montres sélectionnées. "Ce que l'utilisateur faisait avant en 20 onglets, en un écran."

**[4:10–4:40] Confiance et suivi**
Créer une alerte de prix. Montrer le bouton "Parler à un expert Chrono24" — insister : "L'IA ne remplace pas l'expertise humaine sur les décisions importantes, elle la rend accessible à chaque visiteur, pas seulement à ceux qui appellent le service client."

**[4:40–5:00] Clôture business**
Retour sur les KPIs à l'écran (conversion, temps de décision, rétention). "C'est un renforcement direct de ce qui fait déjà la force de Chrono24 : la confiance sur un marché où chaque objet est unique." Fin sur le logo Chrono24 + `Find My Watch`.

---

## 9. Critique finale et proposition alternative

### Faiblesses honnêtes de `Find My Watch`

- **Risque de "nice-to-have"** : si les filtres actuels de Chrono24 sont déjà jugés suffisants par une majorité d'utilisateurs expérimentés, l'agent n'aura d'usage réel que sur le segment néophyte — segment réel et important, mais plus petit en volume de GMV que les collectionneurs récurrents.
- **Le vrai verrou n'est pas le choix, c'est la confiance** — un agent qui recommande sans un socle de données de confiance/prix solide ne fait que déplacer le problème dans une interface plus jolie.
- **Risque de réduction de la découverte fortuite** : recommander "seulement 3 montres" peut réduire la sérendipité de la navigation libre, qui génère aujourd'hui une partie du GMV via des achats non prémédités — à mesurer, ne pas supposer que "moins de choix" est toujours gagnant en GMV total.
- **Tension de monétisation non résolue** : si l'agent recommande objectivement, il peut mécaniquement écarter des annonces boostées/payantes — sujet de gouvernance interne à trancher avant le développement, pas après.

### Une meilleure séquence stratégique

L'idée supérieure n'est pas une fonctionnalité différente de `Find My Watch`, c'est un **séquençage différent** : construire d'abord, **sans aucune interface conversationnelle**, la `Price & Trust Intelligence Layer` — le Fair Price Score et le score de confiance vendeur enrichi — et l'afficher directement sur **chaque annonce du catalogue**, sans bouton, sans opt-in. Cette couche :

- Touche 100 % des sessions de recherche dès le jour 1, contre une fraction des utilisateurs qui cliqueront sur un bouton `Find My Watch` optionnel.
- Est mesurable immédiatement en A/B test classique sur les KPIs de conversion, sans dépendre de la qualité d'un agent conversationnel encore incertaine.
- Constitue le socle de données indispensable à `Find My Watch` de toute façon — donc rien n'est perdu, tout est réutilisé.
- Est un moat défendable : n'importe qui peut construire un chatbot par-dessus un catalogue ; peu d'acteurs ont l'historique de transactions nécessaire pour calculer un Fair Price Score fiable à cette échelle. C'est la vraie barrière à l'entrée, pas l'interface.

**Recommandation de roadmap** : Phase 1 (2-3 mois) — Price & Trust Intelligence Layer sur toutes les annonces, mesure d'impact. Phase 2 (4-5 mois, en parallèle possible dès que le socle Phase 1 est stable) — `Find My Watch` construit par-dessus ce socle, testé d'abord en Magicien d'Oz. `Find My Watch` reste le bon produit final — mais présenté seul, sans le socle, à un comité produit expérimenté, il se fera légitimement challenger sur "qu'est-ce qui rend vos recommandations meilleures qu'un bon système de filtres ?". Avec le socle en place, la réponse devient concrète et défendable.
