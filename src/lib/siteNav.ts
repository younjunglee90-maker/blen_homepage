export type HomeSection = 'hero' | 'features' | 'download';

export const HOME_SECTION_HASH: Record<HomeSection, string> = {
  hero: '',
  features: 'features',
  download: 'download',
};

export const SITE_PATHS = {
  terms: '/terms-of-service',
  privacy: '/privacy-policy',
  support: '/contact-us',
} as const;

export function homeSectionHref(section: HomeSection): string {
  const hash = HOME_SECTION_HASH[section];
  return hash ? `/#${hash}` : '/';
}
