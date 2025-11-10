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
