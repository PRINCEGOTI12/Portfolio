/* ============================================================
   Prince Goti - Portfolio Website JavaScript
   Navigation, Scroll Reveal, Filters, Form, Typing Effect
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Theme Toggle ──
  initThemeToggle();
  // ── Navigation ──
  initNavigation();
  // ── Scroll Reveal ──
  initScrollReveal();
  // ── Typing Effect (Home page only) ──
  initTypingEffect();
  // ── Project Filters (Projects page only) ──
  initProjectFilters();
  // ── Contact Form (Contact page only) ──
  initContactForm();
  // ── Back to Top ──
  initBackToTop();
  // ── Page Enter Animation ──
  initPageEnter();
  // 🚀 3D UI/UX Enhancements 🚀
  initVanillaTilt();
  initMouseParallax();
  initParticleCanvas();
  // ✨ Spring-physics 3D card tilt ──
  initHeroTilt();
  // ✨ Custom Magic Cursor ──
  initCustomCursor();
});

/* ============================================================
   Navigation — Sticky, Mobile Menu, Active Link
   ============================================================ */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');
  const overlay = document.querySelector('.navbar__overlay');
  const links = document.querySelectorAll('.navbar__link');

  // Scroll — add "scrolled" class
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Trigger on load in case page is already scrolled
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  // Mobile toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      if (overlay) overlay.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Close menu on overlay click
  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // Active link highlight based on current page
  setActiveLink(links);
}

function closeMobileMenu() {
  const menu = document.querySelector('.navbar__menu');
  const toggle = document.querySelector('.navbar__toggle');
  const overlay = document.querySelector('.navbar__overlay');
  if (menu) menu.classList.remove('open');
  if (toggle) {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function setActiveLink(links) {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ============================================================
   Scroll Reveal Animation
   ============================================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ============================================================
   Typing Effect — Hero Section
   ============================================================ */
function initTypingEffect() {
  const typedElement = document.querySelector('.typed-text');
  if (!typedElement) return;

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    typedElement.textContent = 'Full Stack Developer';
    typedElement.style.borderRight = 'none';
    return;
  }

  /* UPDATE: Add or remove roles to change the typing animation */
  const roles = [
    'Full Stack Developer',
    'Software Engineer',
    'AI/ML Engineer',
    'Backend Developer',
    'Problem Solver'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typedElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      typedElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Brief pause before next word
    }

    setTimeout(type, typingSpeed);
  }

  // Start after a short delay
  setTimeout(type, 1000);
}

/* ============================================================
   Project Filters
   ============================================================ */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = '';
          // Re-trigger animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ============================================================
   Contact Form Validation & Feedback
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');
    const status = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Simple validation
    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      showFormStatus(status, 'Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(email.value)) {
      showFormStatus(status, 'Please enter a valid email address.', 'error');
      return;
    }

    // Disable button and show sending indicator
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending... ⏳';
    showFormStatus(status, 'Sending message, please wait...', 'info');

    // Prepare form data
    const formData = {};
    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });

    // Send using FormSubmit AJAX endpoint
    const actionUrl = form.getAttribute('action').replace('formsubmit.co/', 'formsubmit.co/ajax/');

    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Server error');
      }
    })
    .then(data => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      showFormStatus(status, 'Thank you! Your message has been sent successfully.', 'success');
      form.reset();
    })
    .catch(error => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      showFormStatus(status, 'Oops! Something went wrong. Please try again later.', 'error');
      console.error('Submission error:', error);
    });
  });
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

let statusTimeout;
function showFormStatus(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'form-status ' + type;
  el.style.display = 'block';

  if (statusTimeout) {
    clearTimeout(statusTimeout);
  }

  // Info status shouldn't auto-hide during submission
  if (type !== 'info') {
    statusTimeout = setTimeout(() => {
      el.style.display = 'none';
    }, 7000);
  }
}

/* ============================================================
   Back to Top Button
   ============================================================ */
function initBackToTop() {
  const btn = document.querySelector('.footer__back-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   Page Enter Animation
   ============================================================ */
function initPageEnter() {
  const pageContent = document.querySelector('.page-content');
  if (pageContent) {
    pageContent.classList.add('page-enter');
  }
}

/* ============================================================
   3D UI/UX Enhancements
   ============================================================ */

// 1. Vanilla Tilt
function initVanillaTilt() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js';
  script.onload = () => {
    VanillaTilt.init(document.querySelectorAll(".project-card, .service-card, .glass-card, .about-image-section, .strength-item, .cert-item"), {
      max: 12,
      speed: 400,
      glare: true,
      "max-glare": 0.15,
      perspective: 1000,
      scale: 1.02
    });
  };
  document.body.appendChild(script);
}

// 2. Mouse Parallax & Spotlight
function initMouseParallax() {
  const shapes = document.querySelectorAll('.bg-shape');
  const heroImage = document.querySelector('.hero__image-wrapper');
  const heroSection = document.querySelector('.section--hero');
  
  if (!shapes.length && !heroImage && !heroSection) return;

  document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;

    shapes.forEach((shape, index) => {
      const depth = (index + 1) * 2;
      shape.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0) rotateX(${y}deg) rotateY(${x}deg)`;
    });

    if (heroImage) {
      heroImage.style.transform = `translate3d(${x * 1.5}px, ${y * 1.5}px, 0) rotateX(${y * 1.2}deg) rotateY(${-x * 1.2}deg)`;
    }
    
    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      const heroX = e.clientX - rect.left;
      const heroY = e.clientY - rect.top;
      heroSection.style.setProperty('--mouse-x', `${heroX}px`);
      heroSection.style.setProperty('--mouse-y', `${heroY}px`);
    }
  });
}

// 3. 3D Particle Canvas Background
function initParticleCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  // Insert at the very beginning of the body
  document.body.insertBefore(canvas, document.body.firstChild);
  
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  
  let mouse = { x: null, y: null, radius: 150 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random() * 2;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse repulsion
      if (mouse.x != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 3;
          this.y -= forceDirectionY * force * 3;
        }
      }

      if (this.x > width) this.x = 0;
      else if (this.x < 0) this.x = width;
      if (this.y > height) this.y = 0;
      else if (this.y < 0) this.y = height;
    }
    draw() {
      const isLight = document.documentElement.classList.contains('light-theme');
      const rgbColor = isLight ? '8, 145, 178' : '6, 182, 212';
      ctx.fillStyle = `rgba(${rgbColor}, ${0.3 + this.z * 0.2})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    // Number of particles responsive to screen size
    const numParticles = Math.min((width * height) / 15000, 100);
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      // Draw connecting lines
      for (let j = i; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const isLight = document.documentElement.classList.contains('light-theme');
          const rgbColor = isLight ? '8, 145, 178' : '6, 182, 212';
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgbColor}, ${0.15 - distance / 800})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();
}

/* ============================================================
   Dark / Light Theme Toggle
   ============================================================ */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle') || document.getElementById('themeToggle');
  if (!themeToggleBtn) return;

  function updateToggleIcon() {
    const isLight = document.documentElement.classList.contains('light-theme');
    const icon = themeToggleBtn.querySelector('.theme-toggle-icon');
    if (icon) {
      icon.textContent = isLight ? '☀️' : '🌙';
    }
  }

  // Update icon based on initial state (determined by FOUC script in head)
  updateToggleIcon();

  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateToggleIcon();
  });
}

/* ============================================================
   Spring-Physics 3D Hover Tilt
   ─────────────────────────────────────────────────────────────
   Applies to [data-tilt] elements and individual hero text lines.
   Physics model: Hooke's Law  F = -k·x  with damping
     · Mouse inside  → spring target = mapped rotation
     · Mouse leaves  → spring target = 0  (snaps back naturally)
   Each frame: a = F/m,  v += a·dt,  x += v·dt
   ============================================================ */
function initHeroTilt() {
  // Selector: target each text line and block individually, plus any [data-tilt] wrappers like the image
  const targets = [
    ...document.querySelectorAll('.hero__image-wrapper'),
    ...document.querySelectorAll('.hero__greeting, .hero__name, .hero__title, .hero__desc, .hero__actions .btn, .hero__stat')
  ];
  if (!targets.length) return;

  // Spring constants — tune freely
  const K = 90;    // stiffness   (higher → snappier)
  const C = 14;    // damping     (higher → less bounce)
  const M = 1.0;   // mass        (higher → more inertia)
  const PERSP    = 900;  // CSS perspective (px)

  targets.forEach(function (el) {
    // Determine if it is a text-only element or container/card/button
    const isTextOnly = el.matches('.hero__greeting, .hero__name, .hero__title, .hero__desc');
    const isButton = el.matches('.btn');
    const MAX_TILT = isTextOnly ? 8 : 14;    // subtler tilt for readable text
    const MAX_SHIFT = isTextOnly ? 5 : 10;   // subtler translate shift for text

    // Set 3D rendering context properties
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';

    // Per-element spring state
    const state = {
      rotX: { pos: 0, vel: 0, target: 0 },
      rotY: { pos: 0, vel: 0, target: 0 },
      tX:   { pos: 0, vel: 0, target: 0 },
      tY:   { pos: 0, vel: 0, target: 0 },
    };

    let raf = null;
    let inside = false;

    function springStep(axis, dt) {
      const disp  = axis.pos - axis.target;
      const force = -K * disp - C * axis.vel;
      axis.vel   += (force / M) * dt;
      axis.pos   += axis.vel    * dt;
    }

    function tick() {
      const DT = 1 / 60;
      springStep(state.rotX, DT);
      springStep(state.rotY, DT);
      springStep(state.tX,   DT);
      springStep(state.tY,   DT);

      el.style.transform =
        `perspective(${PERSP}px) ` +
        `rotateX(${state.rotX.pos.toFixed(3)}deg) ` +
        `rotateY(${state.rotY.pos.toFixed(3)}deg) ` +
        `translate(${state.tX.pos.toFixed(2)}px, ${state.tY.pos.toFixed(2)}px) ` +
        `scale(1.025)`;

      // Stop rAF if settled and mouse left
      const settled =
        !inside &&
        Math.abs(state.rotX.vel) < 0.01 && Math.abs(state.rotX.pos) < 0.01 &&
        Math.abs(state.rotY.vel) < 0.01 && Math.abs(state.rotY.pos) < 0.01;

      if (settled) {
        el.style.transform = '';
        cancelAnimationFrame(raf);
        raf = null;
      } else {
        raf = requestAnimationFrame(tick);
      }
    }

    el.addEventListener('mouseenter', function () {
      inside = true;
      if (isTextOnly) {
        el.style.transition = 'text-shadow 0.3s ease, color 0.3s ease';
        el.style.textShadow = '0 0 15px rgba(6, 182, 212, 0.4)';
      } else if (!isButton) {
        el.style.transition = 'box-shadow 0.3s ease';
        el.style.boxShadow  = '0 15px 45px rgba(6, 182, 212, 0.15)';
      }
      if (!raf) raf = requestAnimationFrame(tick);
    });

    el.addEventListener('mousemove', function (e) {
      const rect = el.getBoundingClientRect();
      // Normalised [-1, +1] from element centre
      const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;

      state.rotX.target = -ny * MAX_TILT;   // tilt up/down
      state.rotY.target =  nx * MAX_TILT;   // tilt left/right
      state.tX.target   =  nx * MAX_SHIFT;  // subtle translate
      state.tY.target   =  ny * MAX_SHIFT;
    });

    el.addEventListener('mouseleave', function () {
      inside = false;
      // Snap targets back to 0 — spring handles the animated return
      state.rotX.target = 0;
      state.rotY.target = 0;
      state.tX.target   = 0;
      state.tY.target   = 0;
      if (isTextOnly) {
        el.style.textShadow = '';
      } else if (!isButton) {
        el.style.boxShadow = '';
      }
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });
}

// 4. Custom Magic Cursor
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Ignore on touch devices

  const dot = document.createElement('div');
  dot.className = 'custom-cursor__dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'custom-cursor__ring';
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let movingTimeout;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
    
    dot.classList.add('moving');
    ring.classList.add('moving');
    
    clearTimeout(movingTimeout);
    movingTimeout = setTimeout(() => {
      dot.classList.remove('moving');
      ring.classList.remove('moving');
    }, 150);
  });

  function render() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate3d(calc(${ringX}px - 50%), calc(${ringY}px - 50%), 0)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  const hoverSelector = 'a, button, input, textarea, select, .project-card, .service-card, .glass-card, [data-tilt], img, p, h1, h2, h3, h4, h5, h6, span, li, label, .navbar, nav, .hero__image-wrapper, .about-image-section, .strength-item, .cert-item, .skill-badge, .resume-skill-tag';

  document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) {
      ring.classList.add('hover');
      dot.classList.add('hover');
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) {
      ring.classList.remove('hover');
      dot.classList.remove('hover');
    }
  });
}

