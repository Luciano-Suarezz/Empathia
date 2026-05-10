export enum ToneOption {
  EMPATHY = 'Empatía',
  SUPER_EMPATHY = 'Super Empatía',
  PARAPHRASE = 'Parafrasear',
  PROFESSIONAL = 'Profesional',
  SIMPLIFY = 'Simplificar',
  ASSERTIVE = 'Asertivo',
  FRIENDLY = 'Amistoso',
  DIRECT = 'Directo',
  URGENT = 'Urgente'
}

export enum MacroType {
  FULL = 'Macro Completo',
  FIRST = 'Primer Mensaje',
  SECOND = 'Segundo Mensaje'
}

export enum LengthOption {
  SHORT = 'Corto',
  ORIGINAL = 'Original',
  LONG = 'Largo'
}

export enum OutputLanguage {
  AUTO = 'Original (Detectar)',
  ES = 'Español',
  EN = 'Inglés',
  PT = 'Portugués',
  FR = 'Francés',
  IT = 'Italiano',
  DE = 'Alemán',
  NL = 'Holandés',
  RO = 'Rumano',
  EL = 'Griego',
  PL = 'Polaco',
  CS = 'Checo',
  SV = 'Sueco',
  DA = 'Danés',
  FI = 'Finlandés',
  HU = 'Húngaro',
  BG = 'Búlgaro',
  RU = 'Ruso',
  ZH = 'Chino',
  JA = 'Japonés',
  NO = 'Noruego',
  SK = 'Eslovaco',
  HR = 'Croata',
  SR = 'Serbio',
  UK = 'Ucraniano',
  LT = 'Lituano',
  LV = 'Letón',
  ET = 'Estonio',
  SL = 'Esloveno'
}

export enum ModelOption {
  FLASH = 'gemini-3-flash-preview',
  LITE = 'gemini-3.1-flash-lite-preview'
}

export interface InternalNote {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
  timestamp: number;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface TransformationResult {
  original: string;
  transformed: string;
  appliedTones: ToneOption[];
  language: OutputLanguage;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  original: string;
  transformed: string;
  macro: MacroType;
  issueTopic?: string;
}

export interface ApiError {
  message: string;
}