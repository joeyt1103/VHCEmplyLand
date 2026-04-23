/* VHC Intranet — script.js */

// ══════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════
const THEME_KEY = 'vhc-theme';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function resolveTheme(choice) {
  return choice === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : choice;
}
function applyTheme(choice) {
  const resolved = resolveTheme(choice);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.style.colorScheme = resolved;

  // Update segmented control active state
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.dataset.active = btn.dataset.theme === choice ? 'true' : 'false';
  });

  // Update hint text
  const hint = document.getElementById('theme-hint');
  if (hint) {
    hint.textContent = choice === 'system'
      ? `Following system · currently ${resolved}`
      : `Set to ${choice}`;
  }
}

function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
}
function setTheme(choice) {
  try { localStorage.setItem(THEME_KEY, choice); } catch {}
  applyTheme(choice);
}

// Apply on load
applyTheme(getTheme());

// React to system changes when in 'system' mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (getTheme() === 'system') applyTheme('system');
});

// Theme seg button clicks
document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});


// ══════════════════════════════════════════════════════
// LOGIN / LOGOUT
// ══════════════════════════════════════════════════════
const screenLogin = document.getElementById('screen-login');
const appShell    = document.getElementById('app');

function showApp() {
  screenLogin.hidden = true;
  appShell.hidden    = false;
  updateGreeting();
}
function showLogin() {
  appShell.hidden    = true;
  screenLogin.hidden = false;
}

document.getElementById('login-btn').addEventListener('click', showApp);
document.getElementById('login-google-btn').addEventListener('click', showApp);
document.getElementById('signout-btn').addEventListener('click', () => {
  userPopover.hidden = true;
  showLogin();
});

// Allow pressing Enter in the password field to sign in
document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') showApp();
});


// ══════════════════════════════════════════════════════
// DYNAMIC GREETING DATE
// ══════════════════════════════════════════════════════
function updateGreeting() {
  const now  = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr = `${days[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()}`;

  const eyebrow = document.querySelector('.dashboard-greeting .eyebrow');
  if (eyebrow) eyebrow.textContent = dateStr;

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const heading = document.querySelector('.dashboard-greeting .display-serif');
  if (heading) heading.textContent = `${greeting}, Joe.`;
}


// ══════════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════════
const ROUTE_TITLES = {
  dashboard:     'Dashboard',
  announcements: 'Announcements',
  directory:     'Directory',
  resources:     'Resources',
  policies:      'Policies',
};

let currentRoute = 'dashboard';

function navigate(route) {
  if (!ROUTE_TITLES[route]) return;

  document.querySelectorAll('[id^="route-"]').forEach(el => { el.hidden = true; el.classList.remove('fade-in'); });

  const target = document.getElementById('route-' + route);
  if (target) {
    target.hidden = false;
    void target.offsetWidth;
    target.classList.add('fade-in');
  }

  document.getElementById('topbar-title').textContent = ROUTE_TITLES[route];

  document.querySelectorAll('.nav-item[data-route]').forEach(btn => {
    btn.dataset.active = btn.dataset.route === route ? 'true' : 'false';
  });

  currentRoute = route;

  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }

  if (route === 'directory') renderDirectory();
}

document.querySelectorAll('.nav-item[data-route]').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.route));
});

// "View all" ghost button inside dashboard announcements widget
document.querySelectorAll('button[data-route]').forEach(el => {
  if (!el.classList.contains('nav-item') && !el.classList.contains('filter-chip')) {
    el.addEventListener('click', () => navigate(el.dataset.route));
  }
});


// ══════════════════════════════════════════════════════
// SIDEBAR MOBILE TOGGLE
// ══════════════════════════════════════════════════════
const sidebar   = document.getElementById('sidebar');
const hamburger = document.getElementById('topbar-hamburger');
hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));

document.addEventListener('click', e => {
  if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});


// ══════════════════════════════════════════════════════
// USER MENU POPOVER
// ══════════════════════════════════════════════════════
const userTrigger = document.getElementById('user-trigger');
const userPopover = document.getElementById('user-popover');

userTrigger.addEventListener('click', e => {
  e.stopPropagation();
  const open = !userPopover.hidden;
  userPopover.hidden = open;
  userTrigger.setAttribute('aria-expanded', String(!open));
});

document.addEventListener('mousedown', e => {
  if (!userPopover.hidden && !userPopover.contains(e.target) && !userTrigger.contains(e.target)) {
    userPopover.hidden = true;
    userTrigger.setAttribute('aria-expanded', 'false');
  }
});


// ══════════════════════════════════════════════════════
// TOPBAR SCROLL SHADOW
// ══════════════════════════════════════════════════════
const topbar  = document.getElementById('topbar');
const appMain = document.querySelector('.app-main');
if (appMain) {
  appMain.addEventListener('scroll', () => {
    topbar.style.boxShadow = appMain.scrollTop > 4 ? 'var(--vhc-shadow-md)' : '';
  }, { passive: true });
}


// ══════════════════════════════════════════════════════
// DIRECTORY
// ══════════════════════════════════════════════════════
const PEOPLE = [
  { name: 'Joe Trave',      title: 'Founder & CEO',          dept: 'Leadership',  email: 'joe@villagehandcrafted.com',     phone: '(215) 555-0100', initials: 'JT', color: 'primary' },
  { name: 'Maria Santos',   title: 'VP of Operations',       dept: 'Operations',  email: 'maria@villagehandcrafted.com',   phone: '(215) 555-0121', initials: 'MS', color: 'secondary' },
  { name: 'Devon Hughes',   title: 'Senior Project Manager', dept: 'Projects',    email: 'devon@villagehandcrafted.com',   phone: '(215) 555-0142', initials: 'DH', color: 'accent' },
  { name: 'Katie Park',     title: 'Design Lead',            dept: 'Design',      email: 'katie@villagehandcrafted.com',   phone: '(215) 555-0158', initials: 'KP', color: 'purple' },
  { name: 'Amir Okafor',    title: 'Shop Floor Supervisor',  dept: 'Production',  email: 'amir@villagehandcrafted.com',    phone: '(215) 555-0165', initials: 'AO', color: 'secondary' },
  { name: 'Lindsay Wu',     title: 'Trade Partner Manager',  dept: 'Sales',       email: 'lindsay@villagehandcrafted.com', phone: '(215) 555-0171', initials: 'LW', color: 'primary' },
  { name: 'Ben Alvarez',    title: 'Finishing Specialist',   dept: 'Production',  email: 'ben@villagehandcrafted.com',     phone: '(215) 555-0188', initials: 'BA', color: 'accent' },
  { name: 'Priya Shah',     title: 'Quality Control',        dept: 'Production',  email: 'priya@villagehandcrafted.com',   phone: '(215) 555-0192', initials: 'PS', color: 'primary' },
  { name: 'Grace Kim',      title: 'People Operations',      dept: 'People',      email: 'grace@villagehandcrafted.com',   phone: '(215) 555-0203', initials: 'GK', color: 'secondary' },
  { name: 'Tom Reilly',     title: 'IT & Systems',           dept: 'Technology',  email: 'tom@villagehandcrafted.ai',      phone: '(215) 555-0217', initials: 'TR', color: 'accent' },
  { name: 'Sofia Martinez', title: 'Kitchen Designer',       dept: 'Design',      email: 'sofia@villagehandcrafted.com',   phone: '(215) 555-0224', initials: 'SM', color: 'purple' },
  { name: 'Jesse Palmer',   title: 'Logistics Coordinator',  dept: 'Operations',  email: 'jesse@villagehandcrafted.com',   phone: '(215) 555-0231', initials: 'JP', color: 'primary' },
];

const AV_STYLES = {
  primary:   'background:var(--vhc-primary);color:var(--vhc-primary-fg)',
  secondary: 'background:var(--vhc-secondary);color:var(--vhc-secondary-fg)',
  accent:    'background:var(--vhc-accent);color:var(--vhc-accent-fg)',
  purple:    'background:hsl(251 86% 93%);color:hsl(263 70% 50%)',
};

function renderDirectory(filter = '') {
  const grid = document.getElementById('directory-grid');
  const q = filter.toLowerCase();
  const filtered = PEOPLE.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.dept.toLowerCase().includes(q)
  );

  const eyebrow = document.querySelector('#route-directory .eyebrow');
  if (eyebrow) eyebrow.textContent = filtered.length + ' members';

  grid.innerHTML = filtered.map(p => `
    <div class="card card-pad directory-card">
      <span class="av av-lg" style="${AV_STYLES[p.color] || AV_STYLES.primary}">${p.initials}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:15px">${p.name}</div>
        <div style="font-size:13px;color:var(--vhc-muted-fg);margin-bottom:6px">${p.title}</div>
        <span class="badge badge-outline">${p.dept}</span>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--vhc-muted-fg)">
          <span style="display:inline-flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            ${p.email}
          </span>
          <span style="display:inline-flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
            ${p.phone}
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

const dirSearch = document.getElementById('directory-search');
if (dirSearch) {
  dirSearch.addEventListener('input', e => renderDirectory(e.target.value));
}


// ══════════════════════════════════════════════════════
// ANNOUNCEMENT FILTER CHIPS
// ══════════════════════════════════════════════════════
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const tag = chip.dataset.tag;
    document.querySelectorAll('.announcement-card').forEach(card => {
      card.hidden = tag !== 'All' && card.dataset.tag !== tag;
    });
  });
});
