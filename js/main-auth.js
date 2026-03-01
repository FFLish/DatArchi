import { auth } from './firebase-config.js';
import { onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { setupDemoData, DEMO_TARGET_USER_ID } from './demo-setup.js';

const DEMO_AUTO_SETUP_SESSION_KEY = 'datarchi.demoAutoSetupExecuted';
const DEMO_AUTO_AUTH_ATTEMPTED_KEY = 'datarchi.demoAutoAuthAttempted';
const DEMO_SETUP_VERSION_KEY = 'datarchi.demoSetupVersion';
const DEMO_SETUP_VERSION = '4';
function showDemoStatus(message, type = 'success') {
  const existing = document.getElementById('demo-auto-setup-status');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'demo-auto-setup-status';
  el.style.cssText = [
    'position:fixed',
    'right:16px',
    'bottom:16px',
    'z-index:9999',
    'padding:10px 14px',
    'border-radius:10px',
    'font-size:13px',
    'font-weight:600',
    'box-shadow:0 8px 24px rgba(0,0,0,0.15)',
    type === 'success' ? 'background:#ecfdf5;color:#166534;border:1px solid #86efac' : 'background:#fef2f2;color:#991b1b;border:1px solid #fca5a5'
  ].join(';');
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 5000);
}

async function ensureDemoUser(user) {
  if (user) return user;

  const alreadyTried = sessionStorage.getItem(DEMO_AUTO_AUTH_ATTEMPTED_KEY) === '1';
  if (alreadyTried) return null;

  try {
    sessionStorage.setItem(DEMO_AUTO_AUTH_ATTEMPTED_KEY, '1');
    await signInAnonymously(auth);
    console.log('✅ Anonyme Demo-Anmeldung erfolgreich');
  } catch (error) {
    console.error('❌ Anonyme Demo-Anmeldung fehlgeschlagen:', error);
  }

  return auth.currentUser || null;
}

async function runDemoAutoSetupIfNeeded(user) {
  if (!user) return;

  const alreadyExecuted = sessionStorage.getItem(DEMO_AUTO_SETUP_SESSION_KEY);
  const currentVersion = localStorage.getItem(DEMO_SETUP_VERSION_KEY);
  const versionChanged = currentVersion !== DEMO_SETUP_VERSION;

  if (alreadyExecuted === '1' && !versionChanged) return;

  try {
    const result = await setupDemoData(DEMO_TARGET_USER_ID);

    if (result?.success) {
      sessionStorage.setItem(DEMO_AUTO_SETUP_SESSION_KEY, '1');
      localStorage.setItem(DEMO_SETUP_VERSION_KEY, DEMO_SETUP_VERSION);
      console.log('✅ Demo Auto-Setup erfolgreich:', result.message || 'Demo-Daten bereit');
      showDemoStatus('✅ Demo-Projekt für Demo-User ist bereit.');
    } else {
      console.warn('⚠️ Demo Auto-Setup übersprungen/fehlgeschlagen:', result?.error || 'Unbekannter Grund');
      showDemoStatus(`⚠️ Demo-Setup: ${result?.error || 'übersprungen'}`, 'error');
    }
  } catch (error) {
    sessionStorage.removeItem(DEMO_AUTO_SETUP_SESSION_KEY);
    console.error('❌ Demo Auto-Setup Fehler:', error);
    showDemoStatus('❌ Demo-Setup fehlgeschlagen.', 'error');
  }
}

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

onAuthStateChanged(auth, async (user) => {
  try {
    const effectiveUser = await ensureDemoUser(user);
    await runDemoAutoSetupIfNeeded(effectiveUser);

    const heroEl = document.querySelector('.hero-section');
    if (!heroEl) return;

    if (effectiveUser) {
      // Replace hero with logged-in content
      const container = document.createElement('div');
      container.innerHTML = buildLoggedInHero(effectiveUser);
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
