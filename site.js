/* ==========================================================
   Magnus Academy — shared behaviour
   Used by: courses.html, faculty.html, results.html
   ========================================================== */

// Theme toggle (light/dark), remembers choice in localStorage
(function themeToggle() {
  const root = document.documentElement;
  const saved = localStorage.getItem('magnus-theme');
  if (saved === 'dark') root.dataset.theme = 'dark';

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('magnus-theme', next);
    });
  }
})();

// Mobile menu open/close
(function mobileMenu() {
  const mobileMenuEl = document.getElementById('mobile-menu');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  if (!mobileMenuEl || !mobileMenuToggle) return;

  mobileMenuToggle.addEventListener('click', () => {
    const open = mobileMenuEl.classList.toggle('open');
    mobileMenuToggle.setAttribute('aria-expanded', String(open));
    mobileMenuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenuToggle.textContent = open ? '×' : '☰';
  });

  mobileMenuEl.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mobileMenuEl.classList.remove('open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-label', 'Open navigation');
    mobileMenuToggle.textContent = '☰';
  }));
})();
