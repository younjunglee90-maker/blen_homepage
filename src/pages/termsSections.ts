export const TERMS_SECTION_IDS = [
  'introduction',
  'user-responsibilities',
  'acceptable-use',
  'account-subscription',
  'ai-insights',
  'privacy-data',
  'limitation-liability',
  'termination',
  'contact',
] as const;

export type TermsSectionId = (typeof TERMS_SECTION_IDS)[number];
