import type { ReactNode } from 'react';

/** Shared props contract passed to every theme layout component. */
export interface ThemeProps {
  /** Site-wide branding & navigation data */
  site: {
    name: string;
    description: string;
    logoUrl: string;
    faviconUrl: string;
    copyright: string;
  };
  /** Social media links */
  socials: { platform: string; url: string; icon: string }[];
  /** Active navigation categories */
  categories: { id: number; name: string; slug: string }[];
  /** Theme visual config (colors, typography, layout, components) */
  config: Record<string, any>;
  /** The page content rendered by the router */
  children: ReactNode;
}

/**
 * Each theme layout component receives this shape of props.
 * The default implementation reads `config` to decide layout variants
 * and renders `children` inside its own shell.
 */
export type ThemeLayoutComponent = React.ComponentType<ThemeProps>;
