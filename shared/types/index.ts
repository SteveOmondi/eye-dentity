// Shared types for Eye-Dentity platform

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  profession: string;
  bio?: string;
  phone?: string;
  logoUrl?: string;
  services?: string[];
  metadata?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  previewUrl?: string;
  htmlStructure: any;
  cssStyles: any;
  isActive: boolean;
}

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  profession: string;
  phone?: string;
  bio?: string;
  services: string[];
  logoFile?: File;
}
