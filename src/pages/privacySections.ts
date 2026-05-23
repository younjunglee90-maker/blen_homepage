export const PRIVACY_SECTION_IDS = [
  'overview',
  'data-collection',
  'ai-processing',
  'privacy-controls',
  'cookies',
  // 'security',
  // 'third-party',
  'data-retention',
  'your-rights',
  'contact',
] as const;

export type PrivacySectionId = (typeof PRIVACY_SECTION_IDS)[number];
