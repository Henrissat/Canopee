export const PLANT_KIND_LABELS = {
  FEUILLAGE: "Feuillage",
  FLEURIE: "Fleurie",
  SUCCULENTE: "Succulente",
  AROMATIQUE: "Aromatique",
  POTAGER: "Potager",
  ARBRE: "Arbre",
  AUTRE: "Autre",
} as const;

export const LOCATION_KIND_LABELS = {
  INTERIEUR: "Intérieur",
  BALCON: "Balcon",
  JARDIN: "Jardin",
  SERRE: "Serre",
  AUTRE: "Autre",
} as const;

export const LIGHT_LABELS = {
  TRES_FAIBLE: "Très faible",
  FAIBLE: "Faible",
  INDIRECTE: "Indirecte",
  VIVE: "Vive",
  DIRECTE: "Directe",
} as const;

export const HEATING_LABELS = {
  AUCUN: "Pas de chauffage",
  ELECTRIQUE: "Chauffage électrique",
  RADIATEUR: "Radiateur",
  POELE: "Poêle",
  CLIM: "Climatisation",
  AUTRE: "Autre chauffage",
} as const;

export const ORIENTATION_LABELS = {
  NORD: "Nord",
  EST: "Est",
  SUD: "Sud",
  OUEST: "Ouest",
  INCONNUE: "Orientation inconnue",
} as const;

export const WATERING_METHOD_LABELS = {
  SUBSTRAT: "Pot (substrat seulement)",
  SUBSTRAT_ET_FEUILLAGE: "Pot + feuillage",
  IMMERSION: "Immersion du pot",
  SOUCOUPE: "Par la soucoupe",
  BRUMISATION: "Brumisation",
} as const;

export const CARE_KIND_LABELS = {
  ARROSAGE: "Arrosage",
  FERTILISATION: "Engrais",
  REMPOTAGE: "Rempotage",
  TAILLE: "Taille",
  BRUMISATION: "Brumisation",
  BOUTURAGE: "Bouturage",
  TRAITEMENT: "Traitement",
  AUTRE: "Soin",
} as const;

export const SEASON_LABELS = {
  winter: "Hiver",
  spring: "Printemps",
  summer: "Été",
  autumn: "Automne",
} as const;

export type SeasonKey = keyof typeof SEASON_LABELS;

export const PLANT_KINDS = Object.keys(PLANT_KIND_LABELS) as (keyof typeof PLANT_KIND_LABELS)[];
export const LOCATION_KINDS = Object.keys(LOCATION_KIND_LABELS) as (keyof typeof LOCATION_KIND_LABELS)[];
export const LIGHT_LEVELS = Object.keys(LIGHT_LABELS) as (keyof typeof LIGHT_LABELS)[];
export const HEATING_KINDS = Object.keys(HEATING_LABELS) as (keyof typeof HEATING_LABELS)[];
export const ORIENTATIONS = Object.keys(ORIENTATION_LABELS) as (keyof typeof ORIENTATION_LABELS)[];
export const WATERING_METHODS = Object.keys(WATERING_METHOD_LABELS) as (keyof typeof WATERING_METHOD_LABELS)[];
