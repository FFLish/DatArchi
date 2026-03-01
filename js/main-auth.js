import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';

// Replace main page hero when user is logged in
function buildLoggedInHero(user) {
  const name = (user.displayName && user.displayName !== '') ? user.displayName : user.email;
  return `
    <div class="hero-section">
      <h1>Willkommen zurück, ${name}!</h1>
      <p class="lead">Schön, dass du wieder da bist. Verwalte deine Projekte oder erstelle ein neues.</p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:20px;">
        <a href="pages/projects/index.html" class="btn btn-primary" style="padding:12px 28px; font-weight:700; text-decoration:none; color:#fff; border-radius:10px;">Meine Projekte</a>
        <a href="pages/projects/index.html#create" class="btn" style="padding:12px 28px; font-weight:700; text-decoration:none; color:#f97316; border:2px solid #f97316; border-radius:10px; background:#fff;">Neues Projekt</a>
      </div>
    </div>
  `;
}

function buildLoggedOutHero() {
  // Keep existing CTA markup but minimal
  return document.querySelector('.hero-section')?.outerHTML || '';
}

onAuthStateChanged(auth, (user) => {
  try {
    const heroEl = document.querySelector('.hero-section');
    if (!heroEl) return;

    if (user) {
      // Replace hero with logged-in content
      const container = document.createElement('div');
      container.innerHTML = buildLoggedInHero(user);
      heroEl.replaceWith(container.firstElementChild);

      // Replace the "Jetzt registrieren" CTA block with a direct "Meine Projekte" button
      const regAnchors = document.querySelectorAll('a[href="pages/profile/index.html"]');
      regAnchors.forEach(a => {
        const parentBlock = a.closest('div[style*="dashed"]') || a.closest('div');
        if (!parentBlock) return;
        // Save original HTML so we can restore on logout
        if (!parentBlock.dataset.originalHtml) parentBlock.dataset.originalHtml = parentBlock.innerHTML;
        parentBlock.innerHTML = `
          <a href="pages/projects/index.html" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:8px; padding:12px 32px; background:linear-gradient(135deg,#f97316 0%,#fb923c 100%); color:#fff; border-radius:12px; font-weight:700; text-decoration:none;">\n            <i class="fas fa-folder-open"></i> Meine Projekte\n          </a>`;
      });
    } else {
      // Restore registration CTA visibility and hero if needed
      const regAnchors = document.querySelectorAll('a[href="pages/profile/index.html"]');
      regAnchors.forEach(a => {
        const parentBlock = a.closest('div[style*="dashed"]') || a.closest('div');
        if (!parentBlock) return;
        if (parentBlock.dataset.originalHtml) {
          parentBlock.innerHTML = parentBlock.dataset.originalHtml;
          delete parentBlock.dataset.originalHtml;
        } else {
          parentBlock.style.display = '';
        }
      });
    }
  } catch (err) {
    console.error('main-auth error:', err);
  }
});

console.log('main-auth initialized');
