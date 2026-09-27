(() => {
  const doc = document.documentElement;
  const body = document.body;
  const progress = document.getElementById('scrollProgress');
  const header = document.getElementById('siteHeader');
  const year = document.getElementById('year');
  const hero = document.getElementById('heroImage');
  const glow = document.getElementById('cursorGlow');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

  if (year) year.textContent = new Date().getFullYear();

  const updateScroll = () => {
    const max = doc.scrollHeight - innerHeight;
    const value = max > 0 ? (scrollY / max) * 100 : 0;
    if (progress) progress.style.width = value + '%';
    if (header) header.classList.toggle('scrolled', scrollY > 18);
  };

  addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach((el, index) => {
      el.style.transitionDelay = Math.min((index % 4) * 45, 135) + 'ms';
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + visible.target.id);
      });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.1, 0.25] });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const closeMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    body.classList.remove('menu-open');
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      body.classList.toggle('menu-open', open);
    });

    navLinks.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('click', (event) => {
      if (nav.classList.contains('open') && !nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    addEventListener('resize', () => {
      if (innerWidth > 900) closeMenu();
    });
  }

  document.querySelectorAll('.project-gallery').forEach((gallery) => {
    const feature = gallery.querySelector('.project-feature');
    const featureImage = feature?.querySelector('img');
    const thumbnails = [...gallery.querySelectorAll('.project-thumbnails a')];
    if (!feature || !featureImage || !thumbnails.length) return;

    const label = document.createElement('span');
    label.className = 'project-photo-label';
    const caption = document.createElement('span');
    const counter = document.createElement('span');
    label.append(caption, counter);
    feature.append(label);

    const hint = document.createElement('p');
    hint.className = 'project-gallery-hint';
    hint.textContent = 'Select a photo · Click the large image to open full size';
    gallery.append(hint);

    const select = (thumbnail) => {
      const index = thumbnails.indexOf(thumbnail);
      if (index < 0) return;
      const image = thumbnail.querySelector('img');
      if (!image) return;
      feature.href = thumbnail.href;
      featureImage.src = image.src;
      featureImage.alt = image.alt;
      feature.setAttribute('aria-label', 'Open full-size image: ' + image.alt);
      caption.textContent = image.alt;
      counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(thumbnails.length).padStart(2, '0');
      thumbnails.forEach((item) => {
        item.classList.toggle('is-selected', item === thumbnail);
        if (item === thumbnail) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
      });
    };

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', (event) => {
        event.preventDefault();
        select(thumbnail);
      });
    });
    select(thumbnails.find((item) => item.href === feature.href) || thumbnails[0]);
  });

  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    if (glow) {
      addEventListener('pointermove', (event) => {
        glow.style.setProperty('--mx', event.clientX + 'px');
        glow.style.setProperty('--my', event.clientY + 'px');
      }, { passive: true });
    }

    if (hero) {
      const resetHero = () => { hero.style.transform = ''; };
      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.transform =
          'perspective(1200px) rotateY(' + (x * 4.5) + 'deg) rotateX(' + (-y * 4.5) + 'deg) translateY(-3px)';
      });
      hero.addEventListener('pointerleave', resetHero);
    }

    document.querySelectorAll('.project,.focus-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--px', x + '%');
        card.style.setProperty('--py', y + '%');
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
})();