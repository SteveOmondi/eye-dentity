import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ... (interfaces remain same)

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
  colorScheme: string;
  selectedColorScheme: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  useAIDesign: boolean;

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
  sessionId: string | null;
  formData: FormData;
  setCurrentStep: (step: number) => void;
  setSessionId: (id: string | null) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}

const initialFormData: FormData = {
  // ... (unchanged)
  name: '',
  email: '',
  profession: '',
  phone: '',
  companyName: '',
  tagline: '',
  yearsOfExperience: null,
  location: '',
  languages: [],
  bio: '',
  services: [],
  specializations: [],
  missionStatement: '',
  serviceAreas: [],
  education: [],
  certifications: [],
  awards: [],
  professionalMemberships: [],
  socialLinks: {},
  portfolioItems: [],
  testimonials: [],
  logoFile: null,
  logoUrl: '',
  profilePhotoFile: null,
  profilePhotoUrl: '',
  selectedTemplate: null,
  colorScheme: 'default',
  selectedColorScheme: null,
  useAIDesign: false,
  domain: '',
  domainAvailable: false,
  domainPrice: null,
  selectedPlan: null,
  emailHosting: false,
};

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      currentStep: 1,
      sessionId: null,
      formData: initialFormData,
      setCurrentStep: (step) => set({ currentStep: step }),
      setSessionId: (sessionId) => set({ sessionId }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetForm: () => set({ currentStep: 1, sessionId: null, formData: initialFormData }),
    }),
    {
      name: 'eye-dentity-form-storage',
      // skip serialization for File objects
      partialize: (state) => ({
        ...state,
        formData: {
          ...state.formData,
          logoFile: null,
          profilePhotoFile: null,
        },
      }),
    }
  )
);
