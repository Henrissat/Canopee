export type CatalogSpecies = {
  slug: string;
  commonName: string;
  scientificName: string;
  kind:
    | "FEUILLAGE"
    | "FLEURIE"
    | "SUCCULENTE"
    | "AROMATIQUE"
    | "POTAGER"
    | "ARBRE"
    | "AUTRE";
  waterDaysWinter: number;
  waterDaysSpring: number;
  waterDaysSummer: number;
  waterDaysAutumn: number;
  fertilizeEveryDays: number | null;
  defaultMethod:
    | "SUBSTRAT"
    | "SUBSTRAT_ET_FEUILLAGE"
    | "IMMERSION"
    | "SOUCOUPE"
    | "BRUMISATION";
  summary: string;
  tips: string;
  symptoms: { symptom: string; likelyCauses: string; whatToDo: string }[];
};

/**
 * Repères pour un pot d'appartement en France, hémisphère nord.
 * Ce sont des points de départ : le diamètre du pot, le chauffage et la lumière comptent plus que l'espèce seule.
 */
export const CATALOG: CatalogSpecies[] = [
  {
    slug: "monstera-deliciosa",
    commonName: "Monstera",
    scientificName: "Monstera deliciosa",
    kind: "FEUILLAGE",
    waterDaysWinter: 16,
    waterDaysSpring: 10,
    waterDaysSummer: 7,
    waterDaysAutumn: 12,
    fertilizeEveryDays: 30,
    defaultMethod: "SUBSTRAT",
    summary:
      "Grand feuillage tropical. On arrose le substrat quand les premiers centimètres sont secs. L'air sec d'un chauffage électrique fait se refermer les feuilles bien avant que la motte soit sèche.",
    tips: "Lumière indirecte, idéalement vive. Pas de soleil de midi sur les feuilles. Éloigne-la du radiateur, et de la vitre froide la nuit. Vide la soucoupe. L'engrais s'arrête d'octobre à février. Mouiller les feuilles n'est pas son mode d'arrosage : ça laisse des taches.",
    symptoms: [
      {
        symptom: "Feuilles recroquevillées",
        likelyCauses:
          "Air sec du chauffage, substrat trop sec, ou au contraire motte encore détrempée. En novembre, près d'une fenêtre peu lumineuse, les deux premiers cas se cumulent souvent.",
        whatToDo:
          "Enfonce un doigt dans le pot. Sec sur 3 à 4 cm : arrose le substrat jusqu'à ce que l'eau sorte, puis vide la soucoupe. Encore humide : n'arrose pas, vérifie que le pot draine. Éloigne la plante du radiateur. Un récipient d'eau à côté humidifie mieux qu'un vaporisateur quotidien.",
      },
      {
        symptom: "Feuilles jaunes",
        likelyCauses:
          "Souvent trop d'eau, surtout quand la lumière baisse. Une vieille feuille du bas qui jaunit seule peut aussi être normale.",
        whatToDo:
          "Si plusieurs feuilles jaunissent et que la terre reste humide, laisse sécher et espace les arrosages. N'apporte pas d'engrais à une plante déjà trop arrosée.",
      },
      {
        symptom: "Peu ou pas de découpes",
        likelyCauses: "Lumière insuffisante, ou feuille encore jeune.",
        whatToDo:
          "Rapproche-la d'une fenêtre plus claire, sans soleil direct brûlant. Les premières feuilles d'une jeune plante sont pleines : c'est normal.",
      },
    ],
  },
  {
    slug: "epipremnum-aureum",
    commonName: "Pothos",
    scientificName: "Epipremnum aureum",
    kind: "FEUILLAGE",
    waterDaysWinter: 14,
    waterDaysSpring: 10,
    waterDaysSummer: 7,
    waterDaysAutumn: 10,
    fertilizeEveryDays: 45,
    defaultMethod: "SUBSTRAT",
    summary:
      "Très tolérant. Il ramollit quand il a soif, puis se redresse après un arrosage du substrat.",
    tips: "Lumière indirecte, même moyenne. Laisse sécher le premier tiers du pot. Pas d'eau qui stagne dans la soucoupe.",
    symptoms: [
      {
        symptom: "Feuilles molles",
        likelyCauses: "Soif, ou racines noyées.",
        whatToDo:
          "Pot léger et terre sèche : arrose le substrat. Pot lourd et terre encore humide : stoppe, et vérifie le drainage.",
      },
      {
        symptom: "Tiges longues, petites feuilles",
        likelyCauses: "Manque de lumière.",
        whatToDo:
          "Rapproche-le de la fenêtre. Une taille pourra servir de bouture plus tard : le suivi des boutures n'est pas encore dans l'app.",
      },
    ],
  },
  {
    slug: "ficus-elastica",
    commonName: "Caoutchouc",
    scientificName: "Ficus elastica",
    kind: "FEUILLAGE",
    waterDaysWinter: 16,
    waterDaysSpring: 12,
    waterDaysSummer: 8,
    waterDaysAutumn: 12,
    fertilizeEveryDays: 30,
    defaultMethod: "SUBSTRAT",
    summary:
      "Il aime qu'on le laisse tranquille. Il perd des feuilles quand on le déplace, qu'on le sur-arrose, ou que l'air devient très sec.",
    tips: "Lumière vive indirecte. Arrose quand le substrat sèche sur plusieurs centimètres. Essuie la poussière, plutôt que de mouiller le feuillage.",
    symptoms: [
      {
        symptom: "Chute de feuilles",
        likelyCauses: "Changement de place, courant d'air, ou arrosage trop fréquent.",
        whatToDo:
          "Laisse-le au même endroit lumineux. Si la motte est détrempée, espace nettement. En hiver le rythme s'allonge.",
      },
    ],
  },
  {
    slug: "dracaena-trifasciata",
    commonName: "Sansevière",
    scientificName: "Dracaena trifasciata",
    kind: "SUCCULENTE",
    waterDaysWinter: 28,
    waterDaysSpring: 21,
    waterDaysSummer: 14,
    waterDaysAutumn: 21,
    fertilizeEveryDays: 60,
    defaultMethod: "SUBSTRAT",
    summary:
      "Elle stocke l'eau dans les feuilles. Un pot trop souvent humide la fait mourir plus vite que la soif, surtout l'hiver.",
    tips: "Accepte une lumière faible, préfère une lumière vive sans soleil brûlant toute la journée. Terreau drainant. Le pot doit redevenir léger avant l'arrosage suivant.",
    symptoms: [
      {
        symptom: "Feuilles molles qui penchent",
        likelyCauses: "Presque toujours un substrat resté humide.",
        whatToDo:
          "Stoppe l'arrosage. Si la motte sent le moisi, sors-la du pot et laisse-la sécher. Reprends seulement quand le pot est léger.",
      },
    ],
  },
  {
    slug: "spathiphyllum",
    commonName: "Fleur de lune",
    scientificName: "Spathiphyllum",
    kind: "FLEURIE",
    waterDaysWinter: 8,
    waterDaysSpring: 6,
    waterDaysSummer: 5,
    waterDaysAutumn: 7,
    fertilizeEveryDays: 30,
    defaultMethod: "SUBSTRAT",
    summary:
      "Elle s'affaisse nettement quand elle a soif, puis se redresse. La motte reste fraîche, sans eau en permanence dans la soucoupe.",
    tips: "Lumière moyenne, pas de soleil direct. Eau à température de la pièce, versée sur le substrat.",
    symptoms: [
      {
        symptom: "Plante toute molle",
        likelyCauses: "Soif, dans la grande majorité des cas. Parfois des racines noyées si la terre était déjà humide.",
        whatToDo:
          "Si le pot est léger : arrose généreusement le substrat, vide la soucoupe au bout de vingt minutes. S'il était déjà humide et qu'elle reste molle, espace les arrosages.",
      },
    ],
  },
  {
    slug: "calathea",
    commonName: "Calathéa",
    scientificName: "Calathea",
    kind: "FEUILLAGE",
    waterDaysWinter: 10,
    waterDaysSpring: 7,
    waterDaysSummer: 6,
    waterDaysAutumn: 8,
    fertilizeEveryDays: 30,
    defaultMethod: "SUBSTRAT",
    summary:
      "Feuillage sensible à l'air sec et à l'eau très calcaire. On arrose le substrat, pas les feuilles.",
    tips: "Lumière indirecte, jamais de soleil direct. Eau à température ambiante. Loin du radiateur. La brumisation du soir laisse des taches.",
    symptoms: [
      {
        symptom: "Bords secs, feuilles enroulées",
        likelyCauses:
          "Air sec du chauffage, substrat laissé trop longtemps au sec, ou eau du robinet très calcaire.",
        whatToDo:
          "Garde le substrat légèrement frais sans le détremper. Éloigne du radiateur. Un groupe de plantes ou un bac d'eau à proximité aide plus qu'un vaporisateur.",
      },
    ],
  },
  {
    slug: "ocimum-basilicum",
    commonName: "Basilic",
    scientificName: "Ocimum basilicum",
    kind: "AROMATIQUE",
    waterDaysWinter: 4,
    waterDaysSpring: 3,
    waterDaysSummer: 2,
    waterDaysAutumn: 3,
    fertilizeEveryDays: 21,
    defaultMethod: "SUBSTRAT",
    summary:
      "Veut du soleil et un substrat qui ne sèche pas à cœur, sans rester noyé. En intérieur l'hiver, il vit au ralenti.",
    tips: "Devant une fenêtre claire. Pince les fleurs pour qu'il continue à faire des feuilles. Au balcon dès que les nuits restent douces, il s'en sort mieux.",
    symptoms: [
      {
        symptom: "Tiges longues et molles",
        likelyCauses: "Manque de lumière, pot trop petit, ou soifs répétées.",
        whatToDo:
          "Plus de lumière. Arrose dès que la surface sèche. Un basilic d'hiver derrière une vitre peu claire reste fragile : c'est la saison, pas forcément une erreur d'arrosage.",
      },
    ],
  },
  {
    slug: "solanum-lycopersicum",
    commonName: "Tomate",
    scientificName: "Solanum lycopersicum",
    kind: "POTAGER",
    waterDaysWinter: 4,
    waterDaysSpring: 2,
    waterDaysSummer: 1,
    waterDaysAutumn: 3,
    fertilizeEveryDays: 14,
    defaultMethod: "SUBSTRAT",
    summary:
      "Gourmande en eau et en lumière dès qu'elle porte des fruits. Au balcon, soleil et vent peuvent assécher un pot en une journée l'été. L'hiver, un plant en intérieur s'arrose beaucoup moins.",
    tips: "Plein soleil. Arrose le pied, pas les feuilles, pour limiter les maladies. Tuteur. Engrais seulement quand elle pousse et fructifie.",
    symptoms: [
      {
        symptom: "Feuilles recroquevillées vers le haut",
        likelyCauses:
          "Chaleur, vent, arrosage irrégulier, ou excès d'engrais. Ce n'est pas le même geste que pour une monstera.",
        whatToDo:
          "Arrose le substrat le matin, de façon régulière. Paille le pot. Ne mouille pas le feuillage. Si les feuilles sont aussi tachées ou collantes, regarde dessous avant d'ajouter quoi que ce soit.",
      },
    ],
  },
  {
    slug: "echeveria",
    commonName: "Echeveria",
    scientificName: "Echeveria",
    kind: "SUCCULENTE",
    waterDaysWinter: 28,
    waterDaysSpring: 18,
    waterDaysSummer: 14,
    waterDaysAutumn: 21,
    fertilizeEveryDays: null,
    defaultMethod: "IMMERSION",
    summary:
      "Rosette de soleil. Le pot doit sécher entièrement entre deux apports. On trempe le pot, on n'arrose pas la rosette.",
    tips: "Plusieurs heures de lumière directe. Pot percé, mélange très drainant. Zéro eau au cœur des feuilles. L'hiver, un seul arrosage de temps en temps suffit.",
    symptoms: [
      {
        symptom: "Rosette qui s'étire",
        likelyCauses: "Pas assez de lumière.",
        whatToDo:
          "Place-la au soleil, derrière une vitre claire. Les feuilles déjà étirées ne se resserrent pas. Les nouvelles, oui, si la lumière est bonne.",
      },
      {
        symptom: "Feuilles translucides et molles",
        likelyCauses: "Trop d'eau.",
        whatToDo:
          "Stoppe l'arrosage et retire les feuilles pourries. Ne reprends que lorsque le pot est sec et léger.",
      },
    ],
  },
  {
    slug: "phalaenopsis",
    commonName: "Orchidée phalaenopsis",
    scientificName: "Phalaenopsis",
    kind: "FLEURIE",
    waterDaysWinter: 12,
    waterDaysSpring: 10,
    waterDaysSummer: 7,
    waterDaysAutumn: 10,
    fertilizeEveryDays: 21,
    defaultMethod: "IMMERSION",
    summary:
      "On trempe le pot d'écorces une vingtaine de minutes, puis on égoutte. Jamais d'eau dans le cœur des feuilles, ni dans le cache-pot.",
    tips: "Lumière indirecte vive. Racines vertes : encore humides. Racines grises et fermes : on peut tremper. Loin du radiateur.",
    symptoms: [
      {
        symptom: "Feuilles molles et ridées",
        likelyCauses: "Soif prolongée, ou racines abîmées par une eau qui stagne.",
        whatToDo:
          "Racines grises et fermes : immersion du pot, puis égouttage complet. Racines brunes et molles : espace les bains et vérifie que le cache-pot ne garde pas d'eau.",
      },
    ],
  },
  {
    slug: "strelitzia-nicolai",
    commonName: "Oiseau du paradis",
    scientificName: "Strelitzia nicolai",
    kind: "FEUILLAGE",
    waterDaysWinter: 14,
    waterDaysSpring: 10,
    waterDaysSummer: 7,
    waterDaysAutumn: 12,
    fertilizeEveryDays: 30,
    defaultMethod: "SUBSTRAT",
    summary:
      "Proche de la monstera pour le rythme, avec un besoin de lumière plus franc. Les feuilles se fendent souvent au vent ou à l'air sec : ce n'est pas toujours un souci.",
    tips: "Lumière vive, un peu de soleil doux le matin ou le soir. Laisse sécher le dessus du pot. Prévois un pot stable, elle devient lourde.",
    symptoms: [
      {
        symptom: "Feuilles enroulées",
        likelyCauses: "Substrat trop sec, ou air très sec près d'un chauffage.",
        whatToDo:
          "Si les premiers centimètres sont secs, arrose le substrat et vide la soucoupe. Éloigne du radiateur. Un fendillement sans jaunissement est souvent mécanique.",
      },
    ],
  },
];
