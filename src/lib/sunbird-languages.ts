/** Sunbird-supported languages for Language & voice projects (ISO 639-3). */
export const SUNBIRD_LANGUAGES = [
  { code: "lug", label: "Luganda" },
  { code: "swa", label: "Swahili" },
  { code: "ach", label: "Acholi" },
  { code: "nyn", label: "Runyankole" },
  { code: "teo", label: "Ateso" },
  { code: "xog", label: "Lusoga" },
  { code: "ttj", label: "Rutooro" },
  { code: "kin", label: "Kinyarwanda" },
  { code: "lgg", label: "Lugbara" },
  { code: "myx", label: "Lumasaba" },
  { code: "eng", label: "English" },
] as const;

export type SunbirdLanguageCode = (typeof SUNBIRD_LANGUAGES)[number]["code"];

export const DEFAULT_VOICE_LANGUAGE: SunbirdLanguageCode = "lug";
