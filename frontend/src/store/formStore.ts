import { create } from 'zustand';

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface PortfolioItem {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Testimonial {
  clientName: string;
  feedback: string;
  rating?: number;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
}

export interface FormData {
  // Step 1: Personal Info (Enhanced)
  name: string;
  email: string;
  profession: string;
  phone: string;
  companyName: string;
  tagline: string;
  yearsOfExperience: number | null;
  location: string;
  languages: string[];

  // Step 2: Bio & Services (Enhanced)
  bio: string;
  services: string[];
  specializations: string[];
  missionStatement: string;
  serviceAreas: string[];

  // Step 3: Credentials & Education (NEW)
  education: Education[];
  certifications: string[];
  awards: string[];
  professionalMemberships: string[];

  // Step 4: Social Links (NEW - Optional)
  socialLinks: SocialLinks;

  // Step 5: Portfolio & Testimonials (NEW - Optional)
  portfolioItems: PortfolioItem[];
  testimonials: Testimonial[];

  // Step 6: Branding (Logo & Profile Photo)
  logoFile: File | null;
  logoUrl: string;
  profilePhotoFile: File | null;
  profilePhotoUrl: string;

  // Step 7: Template Selection
  selectedTemplate: string | null;
  selectedColorScheme: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  } | null;

  // Step 8: Domain Selection
  domain: string;
  domainAvailable: boolean;
  domainPrice: number | null;

  // Step 9: Hosting Plan
  selectedPlan: string | null;
  emailHosting: boolean;
}

interface FormState {
  currentStep: number;
  formData: FormData;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}

const initialFormData: FormData = {
  // Personal Info
  name: '',
  email: '',
  profession: '',
  phone: '',
  companyName: '',
  tagline: '',
  yearsOfExperience: null,
  location: '',
  languages: [],

  // Bio & Services
  bio: '',
  services: [],
  specializations: [],
  missionStatement: '',
  serviceAreas: [],

  // Credentials
  education: [],
  certifications: [],
  awards: [],
  professionalMemberships: [],

  // Social Links
  socialLinks: {},

  // Portfolio
  portfolioItems: [],
  testimonials: [],

  // Branding
  logoFile: null,
  logoUrl: '',
  profilePhotoFile: null,
  profilePhotoUrl: '',

  // Template
  selectedTemplate: null,
  selectedColorScheme: null,

  // Domain
  domain: '',
  domainAvailable: false,
  domainPrice: null,

  // Hosting
  selectedPlan: null,
  emailHosting: false,
};

export const useFormStore = create<FormState>((set) => ({
  currentStep: 1,
  formData: initialFormData,
  setCurrentStep: (step) => set({ currentStep: step }),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () => set({ currentStep: 1, formData: initialFormData }),
}));
