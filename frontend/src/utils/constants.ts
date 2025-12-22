export const PROFESSIONS = [
  // Creative & Design
  { value: 'photographer', label: 'Photographer', category: 'creative' },
  { value: 'graphic-designer', label: 'Graphic Designer', category: 'creative' },
  { value: 'web-designer', label: 'Web Designer', category: 'creative' },
  { value: 'illustrator', label: 'Illustrator', category: 'creative' },
  { value: 'architect', label: 'Architect', category: 'creative' },
  { value: 'interior-designer', label: 'Interior Designer', category: 'creative' },
  { value: 'fashion-designer', label: 'Fashion Designer', category: 'creative' },
  { value: 'ux-ui-designer', label: 'UX/UI Designer', category: 'creative' },
  { value: 'animator', label: 'Animator', category: 'creative' },
  { value: 'videographer', label: 'Videographer', category: 'creative' },

  // Consulting & Professional
  { value: 'business-consultant', label: 'Business Consultant', category: 'professional' },
  { value: 'financial-advisor', label: 'Financial Advisor', category: 'professional' },
  { value: 'life-coach', label: 'Life Coach', category: 'professional' },
  { value: 'career-coach', label: 'Career Coach', category: 'professional' },
  { value: 'therapist', label: 'Therapist', category: 'healthcare' }, // Moved to healthcare logic but kept category consistent with user grouping or adjusted? User group "Consulting" has therapist. I'll stick to user logic or sensible schema. Let's use 'professional' or 'healthcare'. User put it in consulting/prof services. I will use 'healthcare' for therapist to match previous logic, but user listed in Consulting. I'll stick to broad categories. Let's use 'healthcare' for therapist/nutritionist as it fits better given previous schema, or create new ones. I will follow the user's groups as categories.
  // Actually, let's use the USER's categories to be safe.
  // Categories: creative, professional, media, arts, education, technology, healthcare, trades, marketing

  { value: 'therapist', label: 'Therapist', category: 'healthcare' }, // Keeping healthcare for specific logic defaults
  { value: 'nutritionist', label: 'Nutritionist', category: 'healthcare' },
  { value: 'real-estate-agent', label: 'Real Estate Agent', category: 'professional' },
  { value: 'lawyer', label: 'Lawyer', category: 'professional' },
  { value: 'accountant', label: 'Accountant', category: 'professional' },
  { value: 'personal-trainer', label: 'Personal Trainer', category: 'healthcare' }, // Fits wellness

  // Writing & Media
  { value: 'writer', label: 'Writer', category: 'media' },
  { value: 'journalist', label: 'Journalist', category: 'media' },
  { value: 'author', label: 'Author', category: 'media' },
  { value: 'blogger', label: 'Blogger', category: 'media' },
  { value: 'copywriter', label: 'Copywriter', category: 'media' },
  { value: 'editor', label: 'Editor', category: 'media' },
  { value: 'content-creator', label: 'Content Creator', category: 'media' },
  { value: 'podcaster', label: 'Podcaster', category: 'media' },
  { value: 'voice-actor', label: 'Voice Actor', category: 'media' },

  // Arts & Entertainment
  { value: 'musician', label: 'Musician', category: 'arts' },
  { value: 'actor', label: 'Actor', category: 'arts' },
  { value: 'dancer', label: 'Dancer', category: 'arts' },
  { value: 'comedian', label: 'Comedian', category: 'arts' },
  { value: 'artist', label: 'Fine Artist', category: 'arts' },
  { value: 'makeup-artist', label: 'Makeup Artist', category: 'arts' },
  { value: 'hairstylist', label: 'Hairstylist', category: 'arts' },
  { value: 'event-planner', label: 'Event Planner', category: 'arts' },
  { value: 'dj', label: 'DJ', category: 'arts' },

  // Education
  { value: 'tutor', label: 'Tutor', category: 'education' },
  { value: 'educator', label: 'Educator', category: 'education' },
  { value: 'public-speaker', label: 'Public Speaker', category: 'education' },
  { value: 'workshop-facilitator', label: 'Workshop Facilitator', category: 'education' },
  { value: 'course-creator', label: 'Online Course Creator', category: 'education' },

  // Technology
  { value: 'software-developer', label: 'Software Developer', category: 'technology' },
  { value: 'freelance-programmer', label: 'Freelance Programmer', category: 'technology' },
  { value: 'it-consultant', label: 'IT Consultant', category: 'technology' },
  { value: 'cybersecurity-expert', label: 'Cybersecurity Expert', category: 'technology' },
  { value: 'data-scientist', label: 'Data Scientist', category: 'technology' },

  // Health & Wellness (more)
  { value: 'doctor', label: 'Doctor (Private Practice)', category: 'healthcare' },
  { value: 'dentist', label: 'Dentist', category: 'healthcare' },
  { value: 'chiropractor', label: 'Chiropractor', category: 'healthcare' },
  { value: 'massage-therapist', label: 'Massage Therapist', category: 'healthcare' },
  { value: 'yoga-instructor', label: 'Yoga Instructor', category: 'healthcare' },

  // Trades
  { value: 'contractor', label: 'Contractor', category: 'trades' },
  { value: 'electrician', label: 'Electrician', category: 'trades' },
  { value: 'plumber', label: 'Plumber', category: 'trades' },
  { value: 'landscaper', label: 'Landscaper', category: 'trades' },
  { value: 'caterer', label: 'Caterer', category: 'trades' },
  { value: 'baker', label: 'Baker', category: 'trades' },
  { value: 'chef', label: 'Private Chef', category: 'trades' },

  // Sales & Marketing
  { value: 'marketing-consultant', label: 'Marketing Consultant', category: 'marketing' },
  { value: 'social-media-manager', label: 'Social Media Manager', category: 'marketing' },
  { value: 'seo-specialist', label: 'SEO Specialist', category: 'marketing' },
  { value: 'brand-strategist', label: 'Brand Strategist', category: 'marketing' },
  { value: 'freelance-marketer', label: 'Freelance Marketer', category: 'marketing' },
];

export const STEPS = [
  { number: 1, title: 'Info', description: 'Personal details' },
  { number: 2, title: 'Bio', description: 'Your story' },
  { number: 3, title: 'Branding', description: 'Visual identity' },
  { number: 4, title: 'Template', description: 'Website design' },
  { number: 5, title: 'Domain', description: 'Your web address' },
  { number: 6, title: 'Hosting', description: 'Select a plan' },
  { number: 7, title: 'Review', description: 'Final summary' },
];

