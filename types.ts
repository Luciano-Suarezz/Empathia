export enum ToneOption {
  EMPATHY = 'Empatía',
  SUPER_EMPATHY = 'Super Empatía',
  PARAPHRASE = 'Parafrasear',
  PROFESSIONAL = 'Profesional',
  SIMPLIFY = 'Simplificar',
  ASSERTIVE = 'Asertivo'
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

export enum PerspectiveOption {
  WE = 'Nosotros (Corp.)',
  ME = 'Yo (Personal)'
}

export enum OutputLanguage {
  AUTO = 'Original (Detectar)',
  ES = 'Español',
  EN = 'Inglés',
  PT = 'Portugués',
  FR = 'Francés',
  // Secondary
  IT = 'Italiano',
  DE = 'Alemán',
  RU = 'Ruso',
  ZH = 'Chino',
  JA = 'Japonés'
}

export enum ModelOption {
  FLASH = 'gemini-3-flash-preview',
  LITE = 'gemini-flash-lite-latest'
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