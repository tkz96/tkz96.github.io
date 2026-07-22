/* ==========================================================================
   THE AI DEVELOPMENT PLAYBOOK - CLIENT-SIDE INTERACTION & THEME CONTROLLER
   ========================================================================== */

/**
 * Copy code snippet to clipboard
 */
function copyCode(button) {
  const wrapper = button.closest('.code-block-wrapper');
  if (!wrapper) return;
  const codeEl = wrapper.querySelector('code');
  if (!codeEl) return;
  const code = codeEl.textContent;

  navigator.clipboard.writeText(code).then(() => {
    button.textContent = 'Copied';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = 'Copy';
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => console.error('Failed to copy code: ', err));
}

/**
 * 6 Theme Level Configurations
 */
const THEME_LEVELS = {
  1: { name: 'Level 1: Stark OLED', desc: 'Pure high-contrast pitch black & white (OLED mode).' },
  2: { name: 'Level 2: Deep Midnight', desc: 'Rich dark charcoal with emerald accents.' },
  3: { name: 'Level 3: Dark Slate', desc: 'Cool slate gray with soft contrast.' },
  4: { name: 'Level 4: Paper Muted', desc: 'Warm eye-care sepia tone with soft contrast.' },
  5: { name: 'Level 5: Soft Light', desc: 'Clean off-white paper with Swiss red accents.' },
  6: { name: 'Level 6: Stark Light', desc: 'Pure high-contrast white & black (Stark Light mode).' }
};

/**
 * Set theme contrast level (1 to 6)
 */
function setThemeLevel(level) {
  level = Math.min(6, Math.max(1, parseInt(level, 10) || 2));
  document.documentElement.setAttribute('data-theme-level', level);
  document.documentElement.setAttribute('data-theme', level <= 3 ? 'dark' : 'light');
  localStorage.setItem('theme-level', level);
  localStorage.setItem('theme', level <= 3 ? 'dark' : 'light');

  const slider = document.getElementById('theme-level-slider');
  if (slider) slider.value = level;

  const badge = document.getElementById('theme-level-badge');
  if (badge) badge.textContent = 'Theme: ' + level + '/6';

  const readout = document.getElementById('theme-level-name');
  if (readout && THEME_LEVELS[level]) readout.textContent = THEME_LEVELS[level].name;

  const desc = document.getElementById('theme-level-desc');
  if (desc && THEME_LEVELS[level]) desc.textContent = THEME_LEVELS[level].desc;

  document.querySelectorAll('.step-tick').forEach(tick => {
    const tickLevel = parseInt(tick.getAttribute('data-level'), 10);
    tick.classList.toggle('active', tickLevel === level);
  });
}

function onThemeSliderInput(val) {
  setThemeLevel(val);
}

/**
 * Toggle & close theme popover dialog
 */
function toggleThemePopover() {
  const popover = document.getElementById('theme-popover-card');
  const btn = document.getElementById('theme-popover-trigger');
  if (!popover) return;
  const isHidden = popover.hasAttribute('hidden');
  if (isHidden) {
    popover.removeAttribute('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  } else {
    popover.setAttribute('hidden', '');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
}

function closeThemePopover() {
  const popover = document.getElementById('theme-popover-card');
  const btn = document.getElementById('theme-popover-trigger');
  if (popover && !popover.hasAttribute('hidden')) {
    popover.setAttribute('hidden', '');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Toggle & close mobile navigation drawer
 */
function toggleMobileDrawer() {
  const drawer = document.getElementById('sidebar-drawer');
  const btn = document.querySelector('.mobile-menu-btn');
  if (drawer) {
    const isActive = drawer.classList.toggle('active');
    document.body.classList.toggle('drawer-open', isActive);
    if (btn) btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  } else {
    toggleLandingNav();
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('sidebar-drawer');
  const btn = document.querySelector('.mobile-menu-btn');
  if (drawer) drawer.classList.remove('active');
  document.body.classList.remove('drawer-open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function toggleLandingNav() {
  const nav = document.querySelector('header nav');
  const btn = document.querySelector('.mobile-menu-btn');
  if (!nav) return;
  const isOpen = nav.classList.toggle('nav-open');
  if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

/* Global Event Listeners */
document.addEventListener('click', function(e) {
  const popover = document.getElementById('theme-popover-card');
  const btn = document.getElementById('theme-popover-trigger');
  if (popover && !popover.hasAttribute('hidden')) {
    if (!popover.contains(e.target) && !btn.contains(e.target)) {
      closeThemePopover();
    }
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeMobileDrawer();
    closeThemePopover();
  }
});

/**
 * Scrollspy for On This Page section index
 */
function initScrollspy() {
  const otpLinks = document.querySelectorAll('.on-this-page-link, .mobile-otp-list a');
  const headings = Array.from(document.querySelectorAll('.prose h2[id], .prose h3[id]'));

  if (!headings.length || !otpLinks.length) return;

  const observerOptions = {
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        otpLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  headings.forEach(heading => observer.observe(heading));
}

/**
 * Text opacity interval blink for targeted heading (delayed until heading is in view)
 */
function triggerHeadingHighlight(targetId) {
  if (!targetId) return;
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  targetEl.classList.remove('heading-target-blink');

  // Wait 250ms for smooth scroll to settle heading in view before starting text opacity blink
  setTimeout(() => {
    void targetEl.offsetWidth; // Force DOM reflow to restart keyframe animation
    targetEl.classList.add('heading-target-blink');

    setTimeout(() => {
      targetEl.classList.remove('heading-target-blink');
    }, 1250);
  }, 250);
}

document.addEventListener('DOMContentLoaded', function() {
  const savedLevel = localStorage.getItem('theme-level');
  if (savedLevel) {
    setThemeLevel(savedLevel);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeLevel(prefersDark ? 2 : 5);
  }

  // Initialize Scrollspy for On-This-Page index
  initScrollspy();

  // Add calm blink trigger on ON-THIS-PAGE and heading anchor clicks
  document.querySelectorAll('.on-this-page-link, .mobile-otp-list a, .heading-anchor').forEach(link => {
    link.addEventListener('click', function() {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        triggerHeadingHighlight(targetId);
      }
    });
  });

  if (window.location.hash) {
    const initialHash = window.location.hash.substring(1);
    setTimeout(() => {
      triggerHeadingHighlight(initialHash);
    }, 300);
  }

  // Auto-close landing nav link click
  document.querySelectorAll('header nav ul a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.querySelector('header nav');
      const btn = document.querySelector('.mobile-menu-btn');
      if (nav) nav.classList.remove('nav-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
});
