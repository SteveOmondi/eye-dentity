import { create } from 'zustand';

export interface FormData {
  // Step 1: Personal Info
  name: string;
  email: string;
  profession: string;
  phone: string;

  // Step 2: Bio & Services
  bio: string;
  services: string[];

  // Step 3: Logo
  logoFile: File | null;
  logoUrl: string;

  // Template Selection
  selectedTemplate: string | null;
  selectedColorScheme: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  } | null;
}

interface FormState {
  currentStep: number;
  formData: FormData;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  profession: '',
  phone: '',
  bio: '',
  services: [],
  logoFile: null,
  logoUrl: '',
  selectedTemplate: null,
  selectedColorScheme: null,
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
