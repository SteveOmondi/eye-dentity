/**
 * AI Prompt Templates for Website Content Generation
 * Centralized prompts for consistent, high-quality content generation
 */

export interface PromptContext {
  name: string;
  profession: string;
  bio?: string;
  services?: string[];
  phone?: string;
  email?: string;
  location?: string;
  logoUrl?: string; // [NEW] Context for design
  profilePhotoUrl?: string; // [NEW] Context for design
}

/**
 * Homepage Hero Section Prompt
 */
export const getHomepageHeroPrompt = (context: PromptContext): string => {
  return `You are a professional copywriter creating website content for a ${context.profession}.

Name: ${context.name}
Profession: ${context.profession}
${context.bio ? `Bio: ${context.bio}` : ''}
${context.services ? `Services: ${context.services.join(', ')}` : ''}

Create a compelling hero section for their website homepage. Include:
1. A powerful headline (max 10 words) that captures their unique value proposition
2. A subheadline (max 20 words) that elaborates on what they do
3. A brief introduction paragraph (2-3 sentences) that establishes credibility and trust

Requirements:
- Professional and engaging tone
- Focus on benefits to clients/customers
- Include relevant keywords for SEO
- Make it personal and authentic
- Avoid clichés and generic phrases

Return ONLY a JSON object with this structure:
{
  "headline": "...",
  "subheadline": "...",
  "introduction": "..."
}`;
};

/**
 * About Page Prompt
 */
export const getAboutPagePrompt = (context: PromptContext): string => {
  return `You are a professional copywriter creating an "About" page for a ${context.profession}.

Name: ${context.name}
Profession: ${context.profession}
${context.bio ? `Background: ${context.bio}` : ''}

Create compelling "About" page content that includes:
1. A personal story or background (2-3 paragraphs)
2. Professional qualifications and expertise
3. Why they're passionate about their work
4. What makes them different from competitors

Requirements:
- First-person narrative ("I" or "We")
- Authentic and relatable tone
- Build trust and credibility
- Include personality and human elements
- 250-350 words total

Return ONLY a JSON object with this structure:
{
  "title": "About [Name]",
  "content": "Full about page content as a single string with \\n\\n for paragraph breaks"
}`;
};

/**
 * Services Page Prompt
 */
export const getServicesPagePrompt = (context: PromptContext): string => {
  const servicesText = context.services && context.services.length > 0
    ? context.services.join(', ')
    : 'their professional services';

  return `You are a professional copywriter creating a "Services" page for a ${context.profession}.

Name: ${context.name}
Profession: ${context.profession}
Services offered: ${servicesText}

Create detailed service descriptions. For each service:
1. Service name/title
2. Brief description (2-3 sentences)
3. Key benefits (3-4 bullet points)
4. Optional: Typical process or what to expect

Requirements:
- Clear, benefit-focused language
- Specific and actionable
- Professional tone
- SEO-friendly keywords
- Client-centric perspective

Return ONLY a JSON object with this structure:
{
  "title": "Services",
  "introduction": "Brief intro paragraph about services",
  "services": [
    {
      "name": "Service Name",
      "description": "Service description",
      "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
    }
  ]
}`;
};

/**
 * Contact Page Prompt
 */
export const getContactPagePrompt = (context: PromptContext): string => {
  return `You are a professional copywriter creating a "Contact" page for a ${context.profession}.

Name: ${context.name}
Profession: ${context.profession}
${context.email ? `Email: ${context.email}` : ''}
${context.phone ? `Phone: ${context.phone}` : ''}
${context.location ? `Location: ${context.location}` : ''}

Create welcoming contact page content that includes:
1. A friendly invitation to get in touch
2. What happens after they contact (response time, next steps)
3. Optional: Best ways to reach out for different needs

Requirements:
- Warm and approachable tone
- Clear call-to-action
- Set expectations
- 100-150 words

Return ONLY a JSON object with this structure:
{
  "title": "Get in Touch",
  "content": "Contact page content",
  "cta": "Call-to-action text for contact button"
}`;
};

/**
 * SEO Metadata Prompt
 */
export const getSEOMetadataPrompt = (context: PromptContext): string => {
  return `You are an SEO specialist creating metadata for a ${context.profession}'s website.

Name: ${context.name}
Profession: ${context.profession}
${context.bio ? `Bio: ${context.bio}` : ''}
${context.location ? `Location: ${context.location}` : ''}

Create SEO-optimized metadata:
1. Page title (50-60 characters) - Include name, profession, and location if available
2. Meta description (150-160 characters) - Compelling summary with keywords
3. Keywords (5-8 relevant keywords)

Requirements:
- Include primary keywords naturally
- Location-based if applicable
- Compelling and click-worthy
- Follow SEO best practices

Return ONLY a JSON object with this structure:
{
  "title": "Page title",
  "description": "Meta description",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;
};

/**
 * Profession-specific prompt modifiers
 */
export const professionModifiers: Record<string, string> = {
  lawyer: 'Emphasize expertise, trustworthiness, and results. Use professional, authoritative tone.',
  doctor: 'Focus on patient care, expertise, and compassionate service. Use reassuring, professional tone.',
  dentist: 'Highlight patient comfort, modern technology, and quality care. Use friendly, professional tone.',
  therapist: 'Emphasize empathy, confidentiality, and healing. Use warm, supportive tone.',
  consultant: 'Focus on results, expertise, and problem-solving. Use confident, professional tone.',
  designer: 'Showcase creativity, innovation, and unique style. Use creative, inspiring tone.',
  photographer: 'Highlight artistic vision, experience, and portfolio. Use creative, engaging tone.',
  developer: 'Emphasize technical expertise, problem-solving, and innovation. Use clear, professional tone.',
  accountant: 'Focus on accuracy, reliability, and financial expertise. Use trustworthy, professional tone.',
  realtor: 'Highlight market knowledge, client service, and results. Use friendly, professional tone.',
  // New Category Fallbacks
  creative: 'Showcase portfolio, vision, and unique aesthetic. Use innovative and expressive tone.',
  media: 'Highlight storytelling, engagement, and audience reach. Use compelling and articulate tone.',
  arts: 'Emphasize artistic expression, talent, and experience. Use expressive and passionate tone.',
  education: 'Focus on knowledge sharing, growth, and empowerment. Use instructional and encouraging tone.',
  technology: 'Highlight innovation, efficiency, and cutting-edge solutions. Use modern and knowledgeable tone.',
  healthcare: 'Emphasize care, wellbeing, and professional expertise. Use compassionate and trustworthy tone.',
  trades: 'Focus on reliability, craftsmanship, and quality service. Use practical and dependable tone.',
  marketing: 'Highlight growth, strategy, and ROI. Use persuasive and dynamic tone.',
};

/**
 * Get profession-specific modifier
 */
export const getProfessionModifier = (profession: string): string => {
  const normalizedProfession = profession.toLowerCase();

  // Direct match
  if (professionModifiers[normalizedProfession]) {
    return professionModifiers[normalizedProfession];
  }

  // Keyword/Category matching
  const keywords: Record<string, string> = {
    'design': 'creative',
    'art': 'arts',
    'music': 'arts',
    'dance': 'arts',
    'write': 'media',
    'edit': 'media',
    'coach': 'professional',
    'tutor': 'education',
    'teach': 'education', // Changed 'teacher' to 'teach' for broader match
    'develop': 'technology',
    'program': 'technology',
    'data': 'technology',
    'cyber': 'technology',
    'health': 'healthcare',
    'medic': 'healthcare',
    'therap': 'healthcare',
    'plumb': 'trades',
    'electr': 'trades',
    'construct': 'trades',
    'landscap': 'trades',
    'chef': 'trades',
    'bak': 'trades',
    'market': 'marketing',
    'social': 'marketing',
    'seo': 'marketing'
  };

  for (const [keyword, category] of Object.entries(keywords)) {
    if (normalizedProfession.includes(keyword)) {
      return professionModifiers[category];
    }
  }

  return 'Use professional, engaging tone appropriate for the industry.';
};

/**
 * Complete website content generation prompt
 */
export const getCompleteWebsitePrompt = (context: PromptContext): string => {
  const modifier = getProfessionModifier(context.profession);

  return `You are a professional web copywriter creating complete website content for a ${context.profession}.

Client Information:
- Name: ${context.name}
- Profession: ${context.profession}
${context.bio ? `- Background: ${context.bio}` : ''}
${context.services ? `- Services: ${context.services.join(', ')}` : ''}
${context.email ? `- Email: ${context.email}` : ''}
${context.phone ? `- Phone: ${context.phone}` : ''}
${context.location ? `- Location: ${context.location}` : ''}

Style Guide: ${modifier}

Create complete website content including:
1. Homepage (hero section, introduction, services overview)
2. About page (personal story, qualifications, mission)
3. Services page (detailed service descriptions)
4. Contact page (invitation to connect)
5. SEO metadata (title, description, keywords)

Requirements:
- Consistent voice and tone throughout
- SEO-optimized with relevant keywords
- Client-focused (benefits over features)
- Professional yet personable
- Authentic and credible

Return ONLY a valid JSON object with this structure:
{
  "homepage": {
    "headline": "...",
    "subheadline": "...",
    "introduction": "...",
    "servicesOverview": "..."
  },
  "about": {
    "title": "...",
    "content": "..."
  },
  "services": {
    "title": "...",
    "introduction": "...",
    "services": [
      {
        "name": "...",
        "description": "...",
        "benefits": ["...", "...", "..."]
      }
    ]
  },
  "contact": {
    "title": "...",
    "content": "...",
    "cta": "..."
  },
  "seo": {
    "title": "...",
    "description": "...",
    "keywords": ["...", "...", "..."]
  }
}`;
};

/**
 * Design System Generation Prompt
 */
export const getDesignSystemPrompt = (context: PromptContext): string => {
  return `You are an award-winning Brand Strategist and UI/UX Designer crafting a unique visual identity.

CLIENT PROFILE:
Name: ${context.name}
Profession: ${context.profession}
${context.logoUrl ? 'Has Logo: Yes (Consider matching brand colors if implied)' : 'Has Logo: No'}
${context.profilePhotoUrl ? 'Has Profile Photo: Yes (Consider a layout that showcases the personal brand)' : 'Has Profile Photo: No'}

YOUR MISSION:
Create a design system that is UNMISTAKABLY different from generic templates. Think about:
1. The emotional response this profession should evoke (trust? excitement? creativity? sophistication?)
2. The client's likely audience and what appeals to them
3. Current design trends in this industry while adding unexpected twists

STRATEGIC CONSTRAINTS (Choose from available options):
Themes: 'classic', 'gradient', 'flat', 'minimal', 'tech'
Layouts: 'standard', 'split', 'asymmetric'
Shapes: 'sharp', 'soft', 'pill', 'glass', 'brutalist', 'circle'

CREATIVITY GUIDELINES:

COLOR STRATEGY - Go beyond obvious:
- Lawyers don't always need navy/gold - consider deep burgundy + cream for a distinguished look
- DJs don't always need neon - perhaps deep purples with electric cyan accents
- Bakeries can use rich terracotta + sage green instead of pink pastels
- Think about UNEXPECTED but premium color combinations
- Ensure WCAG AAA contrast (7:1 for text, 4.5:1 for large text)

TYPOGRAPHY - Be specific and intentional:
- Choose real Google Fonts that match the vibe (not just "serif" or "sans-serif")
- Pair contrasting weights/styles (e.g., bold geometric heading + elegant body)
- Examples: Playfair Display + Work Sans, Space Grotesk + Inter, Cormorant Garamond + Montserrat

SHAPE LANGUAGE - Create consistency:
- Match shapes to the profession's personality
- Financial services → Sharp & trustworthy
- Creative fields → Soft & approachable  
- Tech startups → Glass & modern
- Established brands → Classic or minimal

THEME SELECTION - Break patterns:
- "Classic" isn't just for lawyers - could work for luxury bakeries
- "Tech" isn't just for IT - could elevate a modern law firm
- "Gradient" adds energy to any profession
- Think about what makes THIS client different from competitors

OUTPUT REQUIREMENTS:
Return ONLY valid JSON (no markdown, no comments):
{
  "theme": "<selected theme>",
  "layout": "<selected layout>",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode"
  },
  "fonts": {
    "heading": "Actual Google Font Name",
    "body": "Actual Google Font Name",
    "url": "https://fonts.googleapis.com/css2?family=FontName1:wght@400;700&family=FontName2:wght@300;600&display=swap"
  },
  "shapes": {
    "style": "<selected shape>",
    "radius": "<CSS value like '0px', '8px', '24px', '50%'>"
  },
  "rationale": "One sentence explaining the unique angle for this design"
}

CONTRAST SAFETY RULES (CRITICAL):
1. IF background is LIGHT (hex > #888888):
   - Text color MUST be DARK (e.g., #1a1a1a, #0f172a).
   - Primary/Accent colors must be dark enough to read against white.
   - NEVER use white, yellow, or pale cyan text on a light background.

2. IF background is DARK (hex < #888888):
   - Text color MUST be LIGHT (e.g., #f3f4f6, #e5e5e5).
   - Primary/Accent colors must be bright enough to pop against dark.
   - NEVER use black, navy, or dark grey text on a dark background.

3. VISUAL CHECK:
   - Before outputting, imagine the text color written on top of the background color. Is it instantly readable?
   - If in doubt, default to strict Black (#000000) on White, or White (#FFFFFF) on Dark.

REMEMBER: Your goal is to surprise with sophistication, not shock with randomness. Every choice should feel intentional and elevated. Visibility is paramount.`;
};
