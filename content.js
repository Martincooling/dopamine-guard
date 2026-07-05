// Content script — injected into all pages

(function () {
  let overlayActive = false;
  let hostEl = null;
  let shadowRoot = null;

  // Save original styles we'll override
  let savedHTMLStyles = '';
  let savedBodyStyles = '';

  function getDomain() {
    return window.location.hostname.replace(/^www\./, '');
  }

  async function isBlocked() {
    const domain = getDomain();
    return new Promise((resolve) => {
      chrome.storage.sync.get('blockedDomains', ({ blockedDomains = [] }) => {
        const blocked = blockedDomains.some(d => {
          const clean = d.replace(/^www\./, '');
          return domain === clean || domain.endsWith('.' + clean);
        });
        resolve(blocked);
      });
    });
  }

  function lockPage() {
    const html = document.documentElement;
    const body = document.body;

    // Force html/body to a stable state that won't clip fixed overlays
    savedHTMLStyles = html.getAttribute('style') || '';
    savedBodyStyles = body ? (body.getAttribute('style') || '') : '';

    // Remove any transform/filter that would create a containing block for fixed elements
    html.style.setProperty('transform', 'none', 'important');
    html.style.setProperty('filter', 'none', 'important');
    html.style.setProperty('perspective', 'none', 'important');
    html.style.setProperty('overflow', 'hidden', 'important');
    html.style.setProperty('height', '100%', 'important');

    if (body) {
      body.style.setProperty('transform', 'none', 'important');
      body.style.setProperty('filter', 'none', 'important');
      body.style.setProperty('overflow', 'hidden', 'important');
    }
  }

  function unlockPage() {
    const html = document.documentElement;
    const body = document.body;

    if (savedHTMLStyles) {
      html.setAttribute('style', savedHTMLStyles);
    } else {
      html.removeAttribute('style');
    }

    if (body) {
      if (savedBodyStyles) {
        body.setAttribute('style', savedBodyStyles);
      } else {
        body.removeAttribute('style');
      }
    }
  }

  function showOverlay(domain) {
    if (overlayActive) return;
    overlayActive = true;

    lockPage();

    // Create a host element and attach a shadow root so
    // the site's CSS cannot reach our overlay
    hostEl = document.createElement('div');
    hostEl.id = 'dopamine-guard-host';

    // Position the host to cover everything
    Object.assign(hostEl.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      display: 'block',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'all',
    });

    shadowRoot = hostEl.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
        }

        #overlay {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(10, 10, 14, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          animation: fade-in 0.25s ease;
          box-sizing: border-box;
          padding: 20px;
        }

        #overlay.fade-out {
          animation: fade-out 0.3s ease forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .card {
          background: #16161e;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px 36px;
          max-width: 360px;
          width: 100%;
          text-align: center;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          animation: slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-sizing: border-box;
        }

        @keyframes slide-up {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .icon {
          font-size: 36px;
          margin-bottom: 12px;
          line-height: 1;
        }

        h1 {
          color: #f0f0f5;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin: 0 0 6px;
        }

        .domain {
          color: #f97316;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 14px;
          opacity: 0.9;
        }

        .message {
          color: #888899;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 28px;
        }

        .timer-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          margin: 0 auto 28px;
        }

        .ring {
          width: 72px;
          height: 72px;
          transform: rotate(-90deg);
        }

        .ring-bg {
          fill: none;
          stroke: rgba(255,255,255,0.07);
          stroke-width: 4;
        }

        .ring-fill {
          fill: none;
          stroke: #f97316;
          stroke-width: 4;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.9s linear;
        }

        .countdown {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f0f0f5;
          font-size: 22px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .btn {
          display: block;
          width: 100%;
          padding: 13px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          margin-bottom: 10px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .btn-continue {
          background: rgba(249, 115, 22, 0.15);
          color: #f97316;
          border: 1px solid rgba(249, 115, 22, 0.25);
        }

        .btn-continue:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .btn-continue.ready:hover {
          background: rgba(249, 115, 22, 0.25);
          border-color: rgba(249, 115, 22, 0.5);
        }

        .btn-back {
          background: rgba(255,255,255,0.05);
          color: #888899;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .btn-back:hover {
          background: rgba(255,255,255,0.09);
          color: #aaaabc;
        }
      </style>

      <div id="overlay">
        <div class="card">
          <div class="icon">⏸</div>
          <h1>Hold on a second.</h1>
          <p class="domain">${domain}</p>
          <p class="message">You added this site because it distracts you.<br>Do you really need to be here right now?</p>
          <div class="timer-wrap">
            <svg class="ring" viewBox="0 0 60 60">
              <circle class="ring-bg" cx="30" cy="30" r="26"/>
              <circle class="ring-fill" id="ring-fill" cx="30" cy="30" r="26"/>
            </svg>
            <span class="countdown" id="countdown">5</span>
          </div>
          <button class="btn btn-continue" id="btn-continue" disabled>
            Continue anyway
          </button>
          <button class="btn btn-back" id="btn-back">
            ← Go back
          </button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(hostEl);

    const countdownEl = shadowRoot.getElementById('countdown');
    const continueBtn = shadowRoot.getElementById('btn-continue');
    const backBtn = shadowRoot.getElementById('btn-back');
    const ringFill = shadowRoot.getElementById('ring-fill');

    const circumference = 2 * Math.PI * 26;
    ringFill.style.strokeDasharray = circumference;
    ringFill.style.strokeDashoffset = '0';

    let timeLeft = 5;

    const tick = setInterval(() => {
      timeLeft -= 1;
      countdownEl.textContent = timeLeft;

      const progress = timeLeft / 5;
      ringFill.style.strokeDashoffset = circumference * (1 - progress);

      if (timeLeft <= 0) {
        clearInterval(tick);
        countdownEl.textContent = '✓';
        continueBtn.disabled = false;
        continueBtn.classList.add('ready');
      }
    }, 1000);

    continueBtn.addEventListener('click', () => {
      removeOverlay();
    });

    backBtn.addEventListener('click', () => {
      removeOverlay();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    });
  }

  function removeOverlay() {
    if (!shadowRoot) return;
    const overlayEl = shadowRoot.getElementById('overlay');
    if (overlayEl) {
      overlayEl.classList.add('fade-out');
      setTimeout(() => {
        hostEl?.remove();
        hostEl = null;
        shadowRoot = null;
        unlockPage();
        overlayActive = false;
      }, 300);
    }
  }

  // Listen for message from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_GUARD') {
      showOverlay(msg.domain);
    }
  });

  // Check on page load
  async function init() {
    if (await isBlocked()) {
      showOverlay(getDomain());
    }
  }

  init();
})();
