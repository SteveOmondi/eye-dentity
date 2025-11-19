import { GeneratedContent, ProfileData } from './ai.service';

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface RenderedWebsite {
  html: string;
  css: string;
  assets: {
    logo?: string;
    profilePhoto?: string;
  };
}

/**
 * Render website by merging AI-generated content with template
 */
export const renderWebsite = (
  templateHtml: any,
  templateCss: any,
  content: GeneratedContent,
  colorScheme: ColorScheme,
  profileData: ProfileData
): RenderedWebsite => {
  // Generate HTML
  const html = generateHTML(content, profileData, colorScheme);

  // Generate CSS with color scheme
  const css = generateCSS(colorScheme);

  return {
    html,
    css,
    assets: {
      logo: profileData.logoUrl,
      profilePhoto: profileData.profilePhotoUrl,
    },
  };
};

/**
 * Generate complete HTML document
 */
function generateHTML(
  content: GeneratedContent,
  profileData: ProfileData,
  colorScheme: ColorScheme
): string {
  const { name, email, phone, profilePhotoUrl, logoUrl } = profileData;
  const { homepage, about, services, contact, meta } = content;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(meta.description)}">
    <meta name="keywords" content="${meta.keywords.join(', ')}">
    <title>${escapeHtml(meta.title)}</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                ${logoUrl ? `<img src="${logoUrl}" alt="${escapeHtml(name)} Logo" class="logo">` : ''}
                <span class="brand-name">${escapeHtml(name)}</span>
            </div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">${escapeHtml(homepage.hero)}</h1>
                <p class="hero-intro">${escapeHtml(homepage.introduction)}</p>
                <div class="hero-highlights">
                    ${homepage.highlights.map(h => `<span class="highlight-badge">${escapeHtml(h)}</span>`).join('')}
                </div>
                <a href="#contact" class="btn btn-primary">Get In Touch</a>
            </div>
            ${profilePhotoUrl ? `
            <div class="hero-image">
                <img src="${profilePhotoUrl}" alt="${escapeHtml(name)}" class="profile-photo">
            </div>
            ` : ''}
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
        <div class="container">
            <h2 class="section-title">${escapeHtml(about.title)}</h2>
            <div class="about-content">
                ${about.content.split('\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}
                ${about.mission ? `<p class="mission"><strong>Mission:</strong> ${escapeHtml(about.mission)}</p>` : ''}
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services">
        <div class="container">
            <h2 class="section-title">${escapeHtml(services.title)}</h2>
            <p class="section-description">${escapeHtml(services.description)}</p>
            <div class="services-grid">
                ${services.servicesList.map(service => `
                <div class="service-card">
                    <h3 class="service-name">${escapeHtml(service.name)}</h3>
                    <p class="service-description">${escapeHtml(service.description)}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
        <div class="container">
            <h2 class="section-title">${escapeHtml(contact.title)}</h2>
            <p class="contact-intro">${escapeHtml(contact.content)}</p>
            <div class="contact-info">
                ${email ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <a href="mailto:${email}">${email}</a>
                </div>` : ''}
                ${phone ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    <a href="tel:${phone}">${phone}</a>
                </div>` : ''}
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${escapeHtml(name)}. All rights reserved.</p>
            <p class="powered-by">Powered by <a href="https://eye-dentity.com" target="_blank">Eye-Dentity</a></p>
        </div>
    </footer>

    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>
</body>
</html>`;
}

/**
 * Generate CSS with color scheme
 */
function generateCSS(colorScheme: ColorScheme): string {
  return `/* Eye-Dentity Generated Styles */
:root {
    --primary-color: ${colorScheme.primary};
    --secondary-color: ${colorScheme.secondary};
    --accent-color: ${colorScheme.accent};
    --text-dark: #1a202c;
    --text-light: #718096;
    --bg-light: #f7fafc;
    --white: #ffffff;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: var(--text-dark);
    background-color: var(--white);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Navigation */
.navbar {
    background: var(--white);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo {
    height: 40px;
    width: auto;
}

.brand-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: var(--text-dark);
    font-weight: 500;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: var(--primary-color);
}

/* Hero Section */
.hero {
    padding: 80px 0;
    background: linear-gradient(135deg, ${colorScheme.primary}15 0%, ${colorScheme.secondary}15 100%);
}

.hero .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
}

.hero-content {
    grid-column: 1;
}

.hero-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--primary-color);
    line-height: 1.2;
}

.hero-intro {
    font-size: 1.25rem;
    color: var(--text-light);
    margin-bottom: 2rem;
}

.hero-highlights {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 2rem;
}

.highlight-badge {
    background: var(--accent-color);
    color: var(--white);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.hero-image {
    grid-column: 2;
    display: flex;
    justify-content: center;
}

.profile-photo {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    object-fit: cover;
    border: 6px solid var(--primary-color);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 12px 32px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
    cursor: pointer;
    border: none;
}

.btn-primary {
    background: var(--primary-color);
    color: var(--white);
}

.btn-primary:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Sections */
section {
    padding: 60px 0;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.section-description {
    text-align: center;
    font-size: 1.1rem;
    color: var(--text-light);
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

/* About Section */
.about {
    background: var(--white);
}

.about-content {
    max-width: 800px;
    margin: 0 auto;
    font-size: 1.1rem;
    color: var(--text-dark);
}

.about-content p {
    margin-bottom: 1rem;
}

.mission {
    background: var(--bg-light);
    padding: 20px;
    border-left: 4px solid var(--accent-color);
    margin-top: 2rem;
}

/* Services Section */
.services {
    background: var(--bg-light);
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 3rem;
}

.service-card {
    background: var(--white);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s, box-shadow 0.3s;
}

.service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.service-name {
    font-size: 1.5rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.service-description {
    color: var(--text-light);
}

/* Contact Section */
.contact {
    background: var(--white);
}

.contact-intro {
    text-align: center;
    font-size: 1.1rem;
    color: var(--text-light);
    margin-bottom: 3rem;
}

.contact-info {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 30px;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
}

.contact-icon {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
}

.contact-item a {
    color: var(--text-dark);
    text-decoration: none;
    transition: color 0.3s;
}

.contact-item a:hover {
    color: var(--primary-color);
}

/* Footer */
.footer {
    background: var(--text-dark);
    color: var(--white);
    padding: 30px 0;
    text-align: center;
}

.footer a {
    color: var(--accent-color);
    text-decoration: none;
}

.powered-by {
    margin-top: 10px;
    font-size: 0.9rem;
    opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero .container {
        grid-template-columns: 1fr;
    }

    .hero-image {
        grid-column: 1;
        margin-top: 2rem;
    }

    .profile-photo {
        width: 200px;
        height: 200px;
    }

    .hero-title {
        font-size: 2rem;
    }

    .nav-menu {
        gap: 1rem;
    }

    .services-grid {
        grid-template-columns: 1fr;
    }
}`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
