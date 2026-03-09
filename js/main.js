/* ══════════════════════════════════════════
   PROYECTO MURO — main.js
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Config: actualiza OCCUPIED cuando vendas más espacios ── */
  const OCCUPIED = 5;
  const TOTAL    = 120;

  /* ── Nav: show/hide menu (patrón showMenu) ── */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('show-menu');
      navToggle.classList.toggle('show-icon');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Cerrar al hacer click en un link */
    navMenu.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
        navToggle.classList.remove('show-icon');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
        document.body.style.overflow = '';
      });
    });

    /* Cerrar con Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
        navToggle.classList.remove('show-icon');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });

    /* Reset overflow si se redimensiona a desktop con menú abierto */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
        navToggle.classList.remove('show-icon');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
        document.body.style.overflow = '';
      }
    }, { passive: true });
  }

  /* ── Header scroll class ── */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── Scroll to top ── */
  const topBtn = document.getElementById('top-btn');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Reveal on scroll ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Wall image fallback (reemplaza onerror inline) ── */
  const wallImg = document.querySelector('.wall-real-img');
  if (wallImg) {
    wallImg.addEventListener('error', () => {
      wallImg.style.display = 'none';
      const placeholder = wallImg.nextElementSibling;
      if (placeholder) placeholder.style.display = 'flex';
    });
  }

  /* ── Contador de espacios ── */
  const counterFill  = document.querySelector('.counter-fill');
  const occupiedEl   = document.getElementById('occupied');
  const remainingEl  = document.getElementById('remaining');
  const tRemainingEl = document.getElementById('t-remaining');

  if (tRemainingEl) tRemainingEl.textContent = (TOTAL - OCCUPIED);

  function animateCounter() {
    if (!counterFill) return;
    const pct = Math.min((OCCUPIED / TOTAL) * 100, 100).toFixed(1);
    counterFill.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      counterFill.style.width = pct + '%';
    }));
    let current = 0;
    const step  = Math.max(1, Math.ceil(OCCUPIED / 40));
    const timer = setInterval(() => {
      current = Math.min(current + step, OCCUPIED);
      if (occupiedEl) occupiedEl.textContent = current;
      if (current >= OCCUPIED) clearInterval(timer);
    }, 30);
    if (remainingEl) remainingEl.textContent = (TOTAL - OCCUPIED);
  }

  const counterSection = document.querySelector('.counter-section');
  if (counterSection) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter();
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    counterObs.observe(counterSection);
  }

  /* ══════════════════════════════════════════
     2. CUSTOM CURSOR
     Solo en dispositivos con puntero fino (mouse)
  ══════════════════════════════════════════ */
  const cursor         = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursor-follower');

  if (cursor && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
    /* Activar cursor custom — añade clase para que CSS oculte el cursor nativo */
    document.body.classList.add('custom-cursor');

    let fx = 0, fy = 0;   // follower position
    let cx = 0, cy = 0;   // cursor position

    document.addEventListener('mousemove', e => {
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    });

    /* Follower sigue con lag suave */
    function followCursor() {
      fx += (cx - fx) * 0.12;
      fy += (cy - fy) * 0.12;
      cursorFollower.style.left = fx + 'px';
      cursorFollower.style.top  = fy + 'px';
      requestAnimationFrame(followCursor);
    }
    followCursor();

    /* Hover en interactivos — delegado para cubrir elementos inyectados dinámicamente */
    const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, .poster-tilt, .nav__toggle, .faq-q, .muro-tab, .price-cta, .btn-primary, .btn-ghost, .nav__cta, .ticket-cta, .tag';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(HOVER_SELECTOR)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(HOVER_SELECTOR)) document.body.classList.remove('cursor-hover');
    });

    /* Ocultar al salir de la ventana */
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity         = '0';
      cursorFollower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity         = '1';
      cursorFollower.style.opacity = '1';
    });
  }

  /* ══════════════════════════════════════════
     3. PARALLAX en hero al mover el mouse
  ══════════════════════════════════════════ */
  const heroParallax = document.getElementById('hero-parallax');
  const ticketWrap   = document.querySelector('.ticket-wrap');

  if (heroParallax && window.matchMedia('(pointer: fine)').matches) {
    const hero = document.querySelector('.hero');

    hero.addEventListener('mousemove', e => {
      const rect  = hero.getBoundingClientRect();
      const cx    = (e.clientX - rect.left) / rect.width  - 0.5;   // -0.5 a 0.5
      const cy    = (e.clientY - rect.top)  / rect.height - 0.5;

      /* Texto se mueve suavemente en dirección opuesta */
      heroParallax.style.transform = `translate(${cx * -6}px, ${cy * -5}px)`;

      /* Ticket se mueve un poco más para dar profundidad */
      if (ticketWrap) {
        ticketWrap.style.transform = `translate(${cx * 8}px, ${cy * 6}px)`;
      }
    });

    /* Reset al salir */
    hero.addEventListener('mouseleave', () => {
      heroParallax.style.transform = 'translate(0,0)';
      if (ticketWrap) ticketWrap.style.transform = 'translate(0,0)';
    });
  }

  /* ══════════════════════════════════════════
     4. POSTER TILT 3D al hover
  ══════════════════════════════════════════ */
  function initTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.poster-tilt').forEach(card => {
      if (card.__tiltInit) return; // evitar doble bind
      card.__tiltInit = true;
      card.addEventListener('mousemove', e => {
        const rect  = card.getBoundingClientRect();
        const x     = (e.clientX - rect.left) / rect.width  - 0.5;
        const y     = (e.clientY - rect.top)  / rect.height - 0.5;
        const rotX  = y * -14;
        const rotY  = x *  14;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
        const shine = card.querySelector('.poster-shine');
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(255,255,255,0.18), transparent 65%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        const shine = card.querySelector('.poster-shine');
        if (shine) shine.style.background = '';
      });
    });
  }
  initTilt();
  window.__initTilt = initTilt; // expuesto para anuncios.js

  /* ══════════════════════════════════════════
     4b. TABS — Muro físico / Muro web
  ══════════════════════════════════════════ */
  const tabBtns = document.querySelectorAll('.muro-tab');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => {
        b.classList.remove('muro-tab--active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.hidden = true;
        p.classList.remove('tab-panel--active');
      });
      btn.classList.add('muro-tab--active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('tab-' + target);
      if (panel) {
        panel.hidden = false;
        panel.classList.add('tab-panel--active');
        // Re-init tilt en tarjetas del panel web al activarlo
        if (target === 'web') initTilt();
      }
    });
  });

  /* ══════════════════════════════════════════
     5. SCROLL CINEMATOGRÁFICO
     IntersectionObserver por cada sección con data-scroll
  ══════════════════════════════════════════ */
  const scrollSections = document.querySelectorAll('.scroll-section');
  if (scrollSections.length) {
    const cinemaObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          cinemaObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    scrollSections.forEach(s => cinemaObs.observe(s));
  }

  /* ══════════════════════════════════════════
     6. FORMULARIO DE CONTACTO (AJAX — Formspree)
  ══════════════════════════════════════════ */
  const contactForm = document.querySelector('.contact-form');
  const formStatus  = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          formStatus.textContent = '✓ Mensaje enviado. Te respondo pronto.';
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Error del servidor');
        }
      } catch (err) {
        formStatus.textContent = 'Error al enviar. Escríbeme directo en Instagram.';
        formStatus.className = 'form-status error';
        console.warn('[Form] Error:', err);
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

});

/* ══════════════════════════════════════════
   PWA — Service Worker registration
   Fuera del DOMContentLoaded, después de load
══════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Registrado:', reg.scope))
      .catch(err => console.warn('[SW] No registrado (normal en desarrollo local sin HTTPS):', err.message));
  });
}
