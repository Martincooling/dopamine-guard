const input = document.getElementById('domain-input');
const addBtn = document.getElementById('add-btn');
const domainList = document.getElementById('domain-list');
const emptyState = document.getElementById('empty-state');
const listCount = document.getElementById('list-count');
const inputHint = document.getElementById('input-hint');

let domains = [];

function cleanDomain(raw) {
  let d = raw.trim().toLowerCase();
  // Strip protocol/path
  d = d.replace(/^https?:\/\//, '');
  d = d.replace(/\/.*$/, '');
  d = d.replace(/^www\./, '');
  return d;
}

function isValidDomain(d) {
  return /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(d);
}

function showHint(msg, type = 'error') {
  inputHint.textContent = msg;
  inputHint.className = 'input-hint' + (type === 'success' ? ' success' : '');
  if (type === 'success') {
    setTimeout(() => { inputHint.textContent = ''; }, 2000);
  }
}

function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function renderList() {
  // Remove all items except empty state
  Array.from(domainList.querySelectorAll('.domain-item')).forEach(el => el.remove());

  listCount.textContent = domains.length;
  emptyState.style.display = domains.length === 0 ? 'flex' : 'none';

  domains.forEach((domain) => {
    const li = document.createElement('li');
    li.className = 'domain-item';
    li.dataset.domain = domain;
    li.innerHTML = `
      <div class="domain-item-text">
        <img class="domain-favicon" src="${getFaviconUrl(domain)}" alt="" onerror="this.style.display='none'">
        <span class="domain-name">${domain}</span>
      </div>
      <button class="remove-btn" title="Remove" data-domain="${domain}">×</button>
    `;
    domainList.appendChild(li);
  });
}

function saveDomains() {
  chrome.storage.sync.set({ blockedDomains: domains });
}

function loadDomains() {
  chrome.storage.sync.get('blockedDomains', ({ blockedDomains = [] }) => {
    domains = blockedDomains;
    renderList();
  });
}

function addDomain() {
  const raw = input.value;
  if (!raw.trim()) return;

  const domain = cleanDomain(raw);

  if (!isValidDomain(domain)) {
    showHint('Enter a valid domain, e.g. reddit.com');
    return;
  }

  if (domains.includes(domain)) {
    showHint(`${domain} is already on the list`);
    return;
  }

  domains.unshift(domain);
  saveDomains();
  renderList();
  input.value = '';
  inputHint.textContent = '';
  showHint(`${domain} added`, 'success');
}

// Event listeners
addBtn.addEventListener('click', addDomain);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addDomain();
  if (inputHint.textContent && !inputHint.classList.contains('success')) {
    inputHint.textContent = '';
  }
});

domainList.addEventListener('click', (e) => {
  const btn = e.target.closest('.remove-btn');
  if (!btn) return;
  const domain = btn.dataset.domain;
  domains = domains.filter(d => d !== domain);
  saveDomains();
  renderList();
});

// Init
loadDomains();
input.focus();
