import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Professional Elite',
    category: 'professional',
    description: 'Clean and professional template perfect for lawyers, consultants, and corporate professionals',
    previewUrl: '/templates/professional-elite-preview.jpg',
    htmlStructure: {
      layout: 'single-page',
      sections: ['hero', 'about', 'services', 'testimonials', 'contact'],
      navigation: 'sticky-top',
    },
    cssStyles: {
      primaryFont: 'Inter, sans-serif',
      secondaryFont: 'Merriweather, serif',
      defaultColors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        background: '#ffffff',
        text: '#1f2937',
      },
      colorPalettes: [
        { name: 'Navy Blue', primary: '#1e3a8a', secondary: '#3b82f6', accent: '#60a5fa' },
        { name: 'Forest Green', primary: '#064e3b', secondary: '#059669', accent: '#34d399' },
        { name: 'Deep Purple', primary: '#581c87', secondary: '#a855f7', accent: '#c084fc' },
        { name: 'Burgundy', primary: '#7f1d1d', secondary: '#dc2626', accent: '#f87171' },
        { name: 'Charcoal', primary: '#1f2937', secondary: '#4b5563', accent: '#9ca3af' },
      ],
    },
  },
  {
    name: 'Creative Studio',
    category: 'creative',
    description: 'Bold and modern design for designers, photographers, and creative professionals',
    previewUrl: '/templates/creative-studio-preview.jpg',
    htmlStructure: {
      layout: 'multi-page',
      sections: ['hero-slideshow', 'portfolio', 'about', 'services', 'blog', 'contact'],
      navigation: 'sidebar',
    },
    cssStyles: {
      primaryFont: 'Poppins, sans-serif',
      secondaryFont: 'Playfair Display, serif',
      defaultColors: {
        primary: '#ec4899',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        background: '#fafafa',
        text: '#111827',
      },
      colorPalettes: [
        { name: 'Vibrant Pink', primary: '#ec4899', secondary: '#8b5cf6', accent: '#f59e0b' },
        { name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316', accent: '#fbbf24' },
        { name: 'Ocean Blue', primary: '#0891b2', secondary: '#06b6d4', accent: '#22d3ee' },
        { name: 'Neon Green', primary: '#65a30d', secondary: '#84cc16', accent: '#bef264' },
        { name: 'Royal Purple', primary: '#7c3aed', secondary: '#a78bfa', accent: '#c4b5fd' },
      ],
    },
  },
  {
    name: 'Healthcare Plus',
    category: 'healthcare',
    description: 'Trustworthy and calming design for doctors, dentists, and healthcare professionals',
    previewUrl: '/templates/healthcare-plus-preview.jpg',
    htmlStructure: {
      layout: 'single-page',
      sections: ['hero', 'about', 'services', 'team', 'appointments', 'testimonials', 'contact'],
      navigation: 'sticky-top',
    },
    cssStyles: {
      primaryFont: 'Lato, sans-serif',
      secondaryFont: 'Source Serif Pro, serif',
      defaultColors: {
        primary: '#0369a1',
        secondary: '#0ea5e9',
        accent: '#38bdf8',
        background: '#f8fafc',
        text: '#334155',
      },
      colorPalettes: [
        { name: 'Medical Blue', primary: '#0369a1', secondary: '#0ea5e9', accent: '#38bdf8' },
        { name: 'Mint Green', primary: '#047857', secondary: '#10b981', accent: '#6ee7b7' },
        { name: 'Soft Purple', primary: '#7c3aed', secondary: '#a78bfa', accent: '#ddd6fe' },
        { name: 'Warm Gray', primary: '#475569', secondary: '#64748b', accent: '#cbd5e1' },
        { name: 'Teal', primary: '#0f766e', secondary: '#14b8a6', accent: '#5eead4' },
      ],
    },
  },
  {
    name: 'Modern Geometric',
    category: 'professional',
    description: 'Contemporary design with geometric shapes and modern aesthetics, perfect for tech professionals and consultants',
    previewUrl: '/templates/modern-geometric-preview.jpg',
    htmlStructure: {
      layout: 'single-page',
      sections: ['hero-geometric', 'about', 'services', 'portfolio', 'contact'],
      navigation: 'sticky-top',
      features: ['geometric-shapes', 'dark-mode-ready', 'ai-generated-badge'],
    },
    cssStyles: {
      primaryFont: 'Inter, sans-serif',
      secondaryFont: 'Space Grotesk, sans-serif',
      defaultColors: {
        primary: '#1e3a5f',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        background: '#0f172a',
        text: '#f1f5f9',
      },
      colorPalettes: [
        { name: 'Dark Blue', primary: '#1e3a5f', secondary: '#3b82f6', accent: '#60a5fa' },
        { name: 'Teal Dark', primary: '#0f766e', secondary: '#14b8a6', accent: '#5eead4' },
        { name: 'Purple Night', primary: '#581c87', secondary: '#a855f7', accent: '#c084fc' },
        { name: 'Slate Modern', primary: '#1e293b', secondary: '#475569', accent: '#94a3b8' },
        { name: 'Indigo Tech', primary: '#3730a3', secondary: '#6366f1', accent: '#a5b4fc' },
      ],
      specialFeatures: {
        geometricShapes: true,
        gradientBackgrounds: true,
        modernTypography: true,
        darkTheme: true,
      },
    },
  },
  {
    name: 'Executive Dark',
    category: 'professional',
    description: 'Sophisticated dark theme with bold accents, ideal for executives, political figures, and high-profile professionals',
    previewUrl: '/templates/executive-dark-preview.jpg',
    htmlStructure: {
      layout: 'single-page',
      sections: ['hero-dark', 'about', 'expertise', 'portfolio', 'testimonials', 'contact'],
      navigation: 'sticky-top',
      features: ['dark-theme', 'bold-typography', 'ai-generated-badge', 'expert-opinions'],
    },
    cssStyles: {
      primaryFont: 'Inter, sans-serif',
      secondaryFont: 'Playfair Display, serif',
      defaultColors: {
        primary: '#1a1a1a',
        secondary: '#ff6b35',
        accent: '#f7931e',
        background: '#0a0a0a',
        text: '#ffffff',
      },
      colorPalettes: [
        { name: 'Orange Accent', primary: '#1a1a1a', secondary: '#ff6b35', accent: '#f7931e' },
        { name: 'Gold Luxury', primary: '#1a1a1a', secondary: '#d4af37', accent: '#ffd700' },
        { name: 'Red Power', primary: '#1a1a1a', secondary: '#dc2626', accent: '#f87171' },
        { name: 'Blue Executive', primary: '#1a1a1a', secondary: '#3b82f6', accent: '#60a5fa' },
        { name: 'Green Elite', primary: '#1a1a1a', secondary: '#059669', accent: '#34d399' },
      ],
      specialFeatures: {
        darkTheme: true,
        boldAccents: true,
        premiumTypography: true,
        executiveLayout: true,
      },
    },
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing templates
  await prisma.template.deleteMany({});
  console.log('✨ Cleared existing templates');

  // Create templates
  for (const template of templates) {
    await prisma.template.create({
      data: template,
    });
    console.log(`✅ Created template: ${template.name}`);
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
