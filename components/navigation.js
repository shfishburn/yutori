// navigation.js

// Consolidated page content for hero sections
const pageContent = {
    // Root
    '/': {
      hero: {
        title: 'Yutori Labs',
        subtitle: 'Discover tools and resources for your fitness journey'
      }
    },
    '/index.html': {
      hero: {
        title: 'Yutori Labs',
        subtitle: 'Discover tools and resources for your fitness journey'
      }
    },
  
    // Chat
    '/chat/chat.html': {
      hero: {
        title: 'Fitness Protocol Builder',
        subtitle: 'Get personalized fitness advice & support from our AI assistant.'
      }
    },
  
    // JSON Editor
    '/editor/editor.html': {
      hero: {
        title: 'JSON Editor',
        subtitle: 'Create and modify your training data with our specialized editor'
      }
    },
  
    // Calculator
    '/calc/calc.html': {
      hero: {
        title: 'Calculator',
        subtitle: 'Advanced calculation tools for your fitness needs'
      }
    },
  
    // TDEE
    '/tdee/tdee.html': {
      hero: {
        title: 'TDEE Calculator',
        subtitle: 'Calculate your total daily energy expenditure.'
      }
    },
    // Also handle /tdee/ or /tdee if needed
    '/tdee/': {
      hero: {
        title: 'TDEE Calculator',
        subtitle: 'Calculate your total daily energy expenditure.'
      }
    },
    '/tdee': {
      hero: {
        title: 'TDEE Calculator',
        subtitle: 'Calculate your total daily energy expenditure.'
      }
    },
  
    // Protocols
    '/protocols/': {  
      hero: {
        title: 'Fitness Protocols',
        subtitle: 'Design and track your personalized fitness protocols'
      }
    },
    '/protocols': {  
      hero: {
        title: 'Fitness Protocols',
        subtitle: 'Design and track your personalized fitness protocols'
      }
    },
    '/protocols/protocols.html': {  
      hero: {
        title: 'Fitness Protocols',
        subtitle: 'Design and track your personalized fitness protocols'
      }
    },
    '/protocols/index.html': {  
      hero: {
        title: 'Fitness Protocols',
        subtitle: 'Design and track your personalized fitness protocols'
      }
    }
  };
  
  class Navigation {
    static createNav() {
      // Added TDEE link in both desktop and mobile nav
      return `
        <nav class="nav-wrapper">
          <div class="container mx-auto flex items-center justify-between py-4">
            <!-- Logo -->
            <a href="/index.html">
              <img src="/assets/logo_400px_wide.png" alt="Yutori Labs" class="logo h-10" />
            </a>
            <!-- Hamburger Icon for mobile -->
            <button id="navToggle" class="md:hidden focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <!-- Desktop Navigation Menu -->
            <ul id="navMenu" class="hidden md:flex space-x-6">
              <li><a href="/index.html" class="text-gray-800">Home</a></li>
              <li><a href="/calc/calc.html" class="text-gray-800">Calculator</a></li>
              <li><a href="/tdee/tdee.html" class="text-gray-800">TDEE</a></li>
              <li><a href="/protocols/protocols.html" class="text-gray-800">Protocols</a></li>
            <li><a href="/chat/chat.html" class="text-gray-800">Fitness AI</a></li>
            <li><a href="/editor/editor.html" class="text-gray-800">JSON Editor</a></li>
            </ul>
          </div>
          <!-- Mobile Navigation Menu -->
          <ul id="navMenuMobile" class="md:hidden hidden px-4 pb-4">

            <li class="py-1"><a href="/index.html" class="block text-gray-800">Home</a></li> 
            <li class="py-1"><a href="/calc/calc.html" class="block text-gray-800">Calculator</a></li>
            <li class="py-1"><a href="/tdee/tdee.html" class="block text-gray-800">TDEE</a></li>
            <li class="py-1"><a href="/protocols/protocols.html" class="block text-gray-800">Protocols</a></li>
            <li class="py-1"><a href="/chat/chat.html" class="block text-gray-800">Fitness AI</a></li>
            <li class="py-1"><a href="/editor/editor.html" class="block text-gray-800">JSON Editor</a></li>
          </ul>
        </nav>
      `;
    }
  
    static createFooter() {
      return `
        <footer class="footer-wrapper">
          <div class="container mx-auto">
            <div class="footer-content">
              <a href="/legal/privacy.html" class="text-gray-800">Privacy Policy</a>
              <br />
              <a href="/legal/terms.html" class="text-gray-800">Terms of Service</a>
              <br />
              <p class="text-gray-800">&copy; 2025 Yutori Labs, LLC</p>
            </div>
          </div>
        </footer>
      `;
    }
  
    static createHero() {
      const currentPath = window.location.pathname;
      console.log('DEBUG - Current pathname:', currentPath);
      console.log('DEBUG - pageContent keys:', Object.keys(pageContent));
      
      // Remove trailing slash if present
      const normalizedPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
      console.log('DEBUG - Normalized path:', normalizedPath);
  
      let content = pageContent[normalizedPath]?.hero;
      console.log('DEBUG - Content from exact match:', content);
  
      // If no match and no .html extension, try with .html
      if (!content && !normalizedPath.endsWith('.html')) {
        const pathWithHtml = normalizedPath + '.html';
        console.log('DEBUG - Trying with .html:', pathWithHtml);
        content = pageContent[pathWithHtml]?.hero;
        console.log('DEBUG - Content with .html:', content);
      }
  
      // Fallback for protocols pages
      if (!content && normalizedPath.includes('protocols')) {
        console.log('DEBUG - Using fallback hero content for protocols');
        content = pageContent['/protocols/protocols.html']?.hero;
      }
  
      if (!content) {
        console.log('DEBUG - No hero content found for', normalizedPath);
        return '';
      }
  
      console.log('DEBUG - Found content, returning hero section');
      return `
        <section class="hero-section py-10">
          <div class="container mx-auto">
            <div class="hero-content">
              <h1 class="hero-title text-4xl font-bold text-left">${content.title}</h1>
              <p class="hero-subtitle mt-4 text-lg text-left">${content.subtitle}</p>
            </div>
          </div>
        </section>
      `;
    }
  
    static init() {
      // Insert navigation
      const navPlaceholder = document.getElementById('nav-placeholder');
      if (navPlaceholder) {
        navPlaceholder.innerHTML = Navigation.createNav();
      }
  
      // Insert hero
      const heroPlaceholder = document.getElementById('hero-placeholder');
      if (heroPlaceholder) {
        heroPlaceholder.innerHTML = Navigation.createHero();
      }
  
      // Insert footer
      const footerPlaceholder = document.getElementById('footer-placeholder');
      if (footerPlaceholder) {
        footerPlaceholder.innerHTML = Navigation.createFooter();
      }
  
      // Setup mobile menu toggle
      const navToggle = document.getElementById('navToggle');
      const navMenuMobile = document.getElementById('navMenuMobile');
      if (navToggle && navMenuMobile) {
        navToggle.addEventListener('click', () => {
          navMenuMobile.classList.toggle('hidden');
          navToggle.classList.toggle('active');
        });
      }
  
      // Highlight current page in navigation
      const navLinks = document.querySelectorAll('nav a, footer a');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === window.location.pathname) {
          link.classList.add('font-bold');
          link.style.color = 'var(--primary-color)';
        }
      });
  
      // Add hover effect for logo
      const logo = document.querySelector('.logo');
      if (logo) {
        logo.addEventListener('mouseover', () => {
          logo.style.transform = 'scale(1.05)';
        });
        logo.addEventListener('mouseout', () => {
          logo.style.transform = 'scale(1)';
        });
      }
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', Navigation.init);
  