
export enum Page {
  Dashboard = 'dashboard',
  Editor = 'editor',
  Library = 'library',
  ABTesting = 'ab-testing',
  Analytics = 'analytics',
  BGRemover = 'bg-remover',
  Generator = 'generator',
  Pricing = 'pricing'
}

export type Language = 'pt-BR' | 'en' | 'es';

export interface ProjectContext {
  title: string;
  topic: string;
  imageUrl: string | null;
  step: 'topic' | 'title' | 'background' | 'editor';
}

export interface Project {
  id: string;
  title: string;
  editedAt: string;
  score: number;
  imageUrl: string;
}

export interface Asset {
  id: string;
  title: string;
  type: string;
  format: string;
  heat: number;
  imageUrl: string;
  velocity?: string;
}

export interface Template {
  id: string;
  category: 'financas' | 'tech' | 'vlog' | 'educacao' | 'religiao' | 'marketing' | 'games' | 'podcast';
  name: string;
  description: string;
  previewUrl: string;
  blueprint: {
    faceArea: { x: number, y: number, w: number, h: number };
    textArea: { x: number, y: number, w: number, h: number };
    eyeLevel: number;
  };
}
