export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface PromptConfig {
  prompt: string;
  aspectRatio: string;
  style: string;
  guidanceScale: number;
}

export interface MediaAsset {
  id: string;
  url: string;
  prompt: string;
  type: "image" | "video";
  createdAt: string;
}

// Prisma Integration Types
import { Generation as PrismaGeneration, GenerationStatus } from '@prisma/client';

export { GenerationStatus };
export type { PrismaGeneration };

export interface GenerationSettings {
  aspectRatio?: string;
  width?: number;
  height?: number;
  seed?: number;
  guidanceScale?: number;
  steps?: number;
  negativePrompt?: string;
  [key: string]: unknown;
}

/**
 * Type-safe representation of a Generation record with typed JSON settings
 */
export type Generation = Omit<PrismaGeneration, 'settings'> & {
  settings: GenerationSettings | null;
};

