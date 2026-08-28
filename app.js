/**
 * WAKESOL — Coming Soon Interactive Engine
 * 
 * Features:
 * - Opening Intro Sequence with Untouched Exact WAKESOL Logo
 * - Brevo Waitlist Integration (Configurable endpoint & list ID)
 * - Auto-drafting email to wecareaboutwakesol@gmail.com
 * - Official Instagram connection: @wakesol.co
 * - Confetti celebration on signup
 */

// ============================================================================
// BREVO INTEGRATION CONFIGURATION
// To connect directly to your Brevo list / webhook, add your details below:
// ============================================================================
const BREVO_CONFIG = {
  // If using Brevo form action URL or Webhook, paste it here:
  endpointUrl: '', 
  // Your Brevo List ID (optional):
  listId: 'wakesol_vip_launch',
  // Your Brevo API Key (if submitting via serverless proxy / backend API):
  apiKey: ''
};

const initWakesol = () => {
  console.log('WAKESOL JS INITIALIZED');

  // Brand Palette for Confetti
  const BRAND_CONFETTI_COLORS = ['#F27A0B', '#F9B38F', '#EE7944', '#F5EEDB', '#FFFFFF', '#181513'];
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* --------------------------------------------------------------------------
     1. Opening Intro Animation Sequence
     -------------------------------------------------------------------------- */
  const introCurtain = document.getElementById('introCurtain');

  const dismissIntro = () => {
    if (introCurtain && !introCurtain.classList.contains('dismissed')) {
      introCurtain.classList.add('dismissed');
      setTimeout(() => {
        if (introCurtain) introCurtain.style.display = 'none';
      }, 1200);
    }
  };

  const introTimer = setTimeout(dismissIntro, 1800);
  introCurtain?.addEventListener('click', () => {
    clearTimeout(introTimer);
    dismissIntro();
  });

  /* --------------------------------------------------------------------------
     2. Preserved Brevo Waitlist Integration
     -------------------------------------------------------------------------- */
  const form = document.getElementById('brevoWaitlistForm');
  const emailInput = document.getElementById('emailInput');
  const pillWrapper = document.getElementById('pillWrapper');
  const formFeedback = document.getElementById('formFeedback');
  const formSuccessBox = document.getElementById('formSuccessBox');
  const resetBtn = document.getElementById('resetBtn');

  // Check saved session in localStorage
    
  let savedVipEmail = null;

  try {
    savedVipEmail = localStorage.getItem('wakesol_waitlist_email');
  } catch (error) {
    console.warn('localStorage is unavailable:', error);
  }

  if (savedVipEmail) {
    displaySuccessState(savedVipEmail, false);
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawEmail = emailInput.value.trim();

    if (!rawEmail) {
      showError('Please enter your email address.');
      emailInput.focus();
      return;
    }

    if (!EMAIL_REGEX.test(rawEmail)) {
      showError('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    clearError();

    const joinBtn = document.getElementById('joinBtn');

    if (joinBtn) {
      joinBtn.style.opacity = '0.7';
      joinBtn.style.pointerEvents = 'none';
    }

    try {
      const response = await fetch('http://localhost:3001/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: rawEmail
        })
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'Signup failed.');
      }

      handleSuccess(rawEmail);

    } catch (error) {
      console.error('Waitlist signup error:', error);
      showError('Something went wrong. Please try again.');
    } finally {
      if (joinBtn) {
        joinBtn.style.opacity = '1';
        joinBtn.style.pointerEvents = 'auto';
      }
    }
  });

  function handleSuccess(email) {
    try {
      localStorage.setItem('wakesol_waitlist_email', email);
    } catch (error) {
      console.warn('localStorage is unavailable:', error);
    }

    displaySuccessState(email, true);
  }

  emailInput?.addEventListener('input', () => {
    clearError();
  });

  function showError(msg) {
    if (pillWrapper) pillWrapper.classList.add('has-error');
    if (formFeedback) {
      formFeedback.textContent = msg;
      formFeedback.classList.add('visible');
    }
  }

  function clearError() {
    if (pillWrapper) pillWrapper.classList.remove('has-error');
    if (formFeedback) {
      formFeedback.textContent = '';
      formFeedback.classList.remove('visible');
    }
  }

  function displaySuccessState(email, triggerCelebration) {
    if (form) form.style.display = 'none';
    if (formSuccessBox) {
      formSuccessBox.classList.add('active');
      formSuccessBox.setAttribute('aria-hidden', 'false');
      const sub = formSuccessBox.querySelector('.success-sub');
      if (sub) {
        sub.innerHTML = `Invitation reserved for <strong>${escapeHtml(email)}</strong>.`;
      }
    }

    if (triggerCelebration) {
      launchConfetti();
      showToast('Welcome to the WAKESOL list 🎉');
    }
  }

  // Reset form
  resetBtn?.addEventListener('click', () => {
    try {
      localStorage.removeItem('wakesol_waitlist_email');
    } catch (error) {
      console.warn('localStorage is unavailable:', error);
    }

    if (formSuccessBox) {
      formSuccessBox.classList.remove('active');
      formSuccessBox.setAttribute('aria-hidden', 'true');
    }

    if (form) {
      form.style.display = 'block';
      emailInput.disabled = false;
      emailInput.value = '';
      emailInput.focus();
    }
  });

  /* --------------------------------------------------------------------------
     3. Custom Brand-Palette Confetti Burst
     -------------------------------------------------------------------------- */
  function launchConfetti() {
    if (typeof confetti !== 'function') return;

    try {
      const count = 80;
      const defaults = {
        origin: { y: 0.65 },
        colors: BRAND_CONFETTI_COLORS,
        disableForReducedMotion: true
      };

      function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      }

      fire(0.25, { spread: 26, startVelocity: 45 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 40 });
    } catch (e) {
      // Ignore if confetti script blocked
    }
  }

  /* --------------------------------------------------------------------------
     4. Email & Social Micro-Interactions
     -------------------------------------------------------------------------- */
  const emailLink = document.getElementById('emailContactLink');
  const toast = document.getElementById('wakesolToast');

  emailLink?.addEventListener('click', () => {
    showToast('Drafting email to wecareaboutwakesol@gmail.com ✉️');
  });

  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('active');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWakesol);
} else {
  initWakesol();
}
