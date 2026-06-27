import type { House } from "./types";

export const HOUSES: Record<string, House> = {
  valther: {
    id: "valther",
    name: "Valther",
    philosophy: "Le Temps Pur",
    firstPrinciple: "La perfection commence lorsque plus rien ne peut être retiré.",
    specialty:
      "Épure absolue — chaque composant inutile est une faiblesse. La maîtrise se lit dans la retenue.",
    materials: ["acier", "platine", "or gris", "verre saphir"],
    architectures: ["lineaire", "chronometrique"],
    signatureComplications: [
      "heures",
      "minutes",
      "seconde centrale",
      "petite seconde",
      "réserve de marche",
      "quantième simple",
      "quantième annuel",
    ],
    rivalry: "aurell",
    lore: "Valther est la référence absolue en matière de pureté horlogère. Là où d'autres cherchent à repousser les limites de la complexité, Valther en retire. Les collaborations avec Corven sont les plus naturelles.",
  },

  orvain: {
    id: "orvain",
    name: "Orvain",
    philosophy: "L'Architecture",
    firstPrinciple: "Une mécanique invisible est une mécanique inachevée.",
    specialty:
      "Le mouvement est la finalité, pas le moyen. Le cadran n'est qu'une fenêtre ouverte sur l'architecture.",
    materials: ["titane", "saphir", "acier", "alliages techniques"],
    architectures: ["suspendue", "squelettee", "radiale"],
    signatureComplications: [
      "tourbillons",
      "doubles barillets",
      "indicateurs de réserve de marche",
      "phases de lune ouvertes",
    ],
    rivalry: "merian",
    lore: "Orvain considère que le mouvement représente l'expression la plus noble de l'horlogerie. Ses créations cherchent à émerveiller par leur construction autant que par leurs performances. Collaborations privilégiées avec Ferrand.",
  },

  belvor: {
    id: "belvor",
    name: "Belvor",
    philosophy: "L'Acoustique",
    firstPrinciple: "La plus grande réussite d'une création est sa capacité à émouvoir.",
    specialty:
      "Complications sonores — répétitions, sonneries, transmission acoustique. La montre parle autant qu'elle montre.",
    materials: ["or jaune", "or rose", "platine", "alliages acoustiques"],
    architectures: ["sonore", "hybride"],
    signatureComplications: [
      "répétition minutes",
      "grande sonnerie",
      "petite sonnerie",
      "carillon",
      "réveil",
    ],
    rivalry: "ferrand",
    lore: "Belvor affirme que la plus grande réussite d'une création est sa capacité à émouvoir. L'opposition avec Ferrand — qui répond que sans matière capable de la porter, aucune émotion ne dure — a conduit aux deux Maisons à collaborer sur des avancées majeures dans les sonneries.",
  },

  caelis: {
    id: "caelis",
    name: "Caelis",
    philosophy: "Le Temps Cosmique",
    firstPrinciple: "Toute grande création doit rappeler que le temps dépasse l'Homme.",
    specialty:
      "Complications astronomiques — le ciel fut la première horloge. Traduire les rythmes du monde avec précision mécanique.",
    materials: [
      "acier poli",
      "or gris",
      "platine",
      "aventurine",
      "pierres naturelles",
      "émail Grand Feu",
    ],
    architectures: ["concentrique", "orbitale", "hybride"],
    signatureComplications: [
      "phases de lune",
      "calendrier perpétuel",
      "équation du temps",
      "temps sidéral",
      "cartes célestes",
      "indications saisonnières",
    ],
    rivalry: "corven",
    lore: "Caelis est la référence absolue des complications astronomiques. L'opposition avec Corven — qui réfute qu'une discipline puisse dominer les autres — nourrit les deux Maisons. Collaborations remarquées avec Belvor.",
  },

  merian: {
    id: "merian",
    name: "Merian",
    philosophy: "La Chronométrie",
    firstPrinciple: "La précision n'est jamais acquise. Elle se conquiert.",
    specialty:
      "Instrument de mesure avant objet d'art. La régularité irréprochable précède toute complication.",
    materials: ["titane", "aciers techniques", "silicium", "alliages stables"],
    architectures: ["chronometrique", "energetique", "lineaire"],
    signatureComplications: [
      "chronographes",
      "chronographes monopoussoirs",
      "chronographes flyback",
      "chronographes à rattrapante",
      "remontoirs d'égalité",
      "systèmes de résonance",
    ],
    rivalry: "orvain",
    lore: "Merian est universellement reconnue comme la référence en matière de précision chronométrique. L'opposition avec Orvain — beauté de l'architecture contre précision — est l'un des grands débats d'Horolith. Collaborations majeures avec Ferrand.",
  },

  ferrand: {
    id: "ferrand",
    name: "Ferrand",
    philosophy: "La Matière",
    firstPrinciple: "La matière précède toujours la mécanique.",
    specialty:
      "Recherche sur les matériaux, les alliages et les procédés. Une innovation mécanique ne peut exister sans une évolution équivalente de la matière.",
    materials: [
      "titane",
      "tantale",
      "tungstène",
      "aciers techniques",
      "alliages propriétaires",
      "matériaux composites",
    ],
    architectures: ["energetique", "hybride"],
    signatureComplications: [
      "tourbillons",
      "chronographes",
      "calendriers complexes",
      "mécanismes énergétiques",
    ],
    rivalry: "belvor",
    lore: "Ferrand est la référence absolue dans la recherche sur les matériaux. C'est la Maison qui collabore le plus fréquemment avec les autres — ses recherches bénéficient naturellement à tout l'univers Horolith.",
  },

  aurell: {
    id: "aurell",
    name: "Aurell",
    philosophy: "L'Affichage",
    firstPrinciple: "Le temps ne change pas. Seule notre manière de le lire évolue.",
    specialty:
      "Réinventer la lecture du temps. Chaque convention est questionnée, jamais conservée par habitude.",
    materials: ["titane", "saphir", "céramiques techniques", "alliages légers"],
    architectures: ["orbitale", "concentrique", "hybride"],
    signatureComplications: [
      "heures vagabondes",
      "affichages rétrogrades",
      "heures sautantes",
      "minutes traînantes",
      "satellites",
      "disques rotatifs",
    ],
    rivalry: "valther",
    lore: "Aurell est la plus audacieuse lorsqu'il s'agit de réinventer la manière de lire le temps. L'opposition avec Valther — conventions classiques contre remise en question permanente — nourrit les deux Maisons depuis leurs origines.",
  },

  corven: {
    id: "corven",
    name: "Corven",
    philosophy: "L'Équilibre",
    firstPrinciple: "Aucune qualité ne doit exister au détriment d'une autre.",
    specialty:
      "Synthèse de toutes les disciplines. La perfection naît de l'harmonie, jamais de la spécialisation exclusive.",
    materials: ["acier", "titane", "platine", "alliages techniques", "matériaux Ferrand"],
    architectures: ["hybride"],
    signatureComplications: [
      "chronométrie",
      "acoustique",
      "astronomie",
      "affichages",
      "grandes complications",
    ],
    rivalry: "caelis",
    lore: "Corven occupe une place singulière parmi les Maisons. Là où chacune poursuit une spécialisation clairement assumée, Corven refuse qu'une discipline domine les autres. Elle entretient des relations privilégiées avec l'ensemble des Maisons.",
  },
} as const;

export const HOUSE_IDS = Object.keys(HOUSES) as Array<keyof typeof HOUSES>;
