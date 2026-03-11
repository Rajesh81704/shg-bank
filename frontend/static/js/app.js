/* ============================================================
   SHG BANK SYSTEM — Application Logic (Complete API Integration)
   ============================================================ */

const API = '/api';
const state = { token: localStorage.getItem('token'), user: null, view: 'dashboard', lang: localStorage.getItem('lang') || 'en' };

const ICONS = {
    dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    members: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    loans: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    calculator: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',
    payments: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    contribution: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    resetPw: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    apply: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
    earnings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    summary: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
    installments: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    users: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    money: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    wallet: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    alert: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
};

// ---- Utility Helpers ----
const $ = id => document.getElementById(id);
const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) : '—';
const formatCurrency = n => '₹' + Number(n||0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const initials = name => (name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const avatarColors = ['avatar-purple','avatar-green','avatar-amber','avatar-red'];
const getAvatarClass = id => avatarColors[(id||0) % avatarColors.length];

// ---- i18n Translation System ----
function t(key) {
    return (translations[state.lang] && translations[state.lang][key]) || translations['en'][key] || key;
}

function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
}

const LANG_LABELS = { en: 'EN', hi: 'HI', ta: 'TA' };

function setupLangToggle(toggleId, btnId, dropdownId, labelId) {
    const toggle = $(toggleId);
    const toggleBtn = $(btnId);
    const dropdown = $(dropdownId);
    const label = $(labelId);
    if (!toggle || !toggleBtn || !dropdown || !label) return;

    label.textContent = LANG_LABELS[state.lang];
    dropdown.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === state.lang);
    });

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        toggle.classList.toggle('open');
    });

    dropdown.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const lang = opt.dataset.lang;
            if (lang === state.lang) { dropdown.classList.add('hidden'); toggle.classList.remove('open'); return; }
            state.lang = lang;
            localStorage.setItem('lang', lang);
            document.documentElement.lang = lang;
            syncAllLangToggles(lang);
            dropdown.classList.add('hidden');
            toggle.classList.remove('open');
            document.documentElement.lang = state.lang || 'en'; applyStaticTranslations();
            if (state.user) {
                buildSidebar();
                navigate(state.view);
            }
        });
    });

    document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        toggle.classList.remove('open');
    });
}

function syncAllLangToggles(lang) {
    ['langToggleLabel', 'loginLangToggleLabel'].forEach(id => {
        const el = $(id);
        if (el) el.textContent = LANG_LABELS[lang];
    });
    ['langDropdown', 'loginLangDropdown'].forEach(id => {
        const el = $(id);
        if (el) el.querySelectorAll('.lang-option').forEach(o => o.classList.toggle('active', o.dataset.lang === lang));
    });
}

function initLanguageToggle() {
    setupLangToggle('langToggle', 'langToggleBtn', 'langDropdown', 'langToggleLabel');
    setupLangToggle('loginLangToggle', 'loginLangToggleBtn', 'loginLangDropdown', 'loginLangToggleLabel');
}

function showToast(msg, type='info') {
    const c = $('toastContainer');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { el.classList.add('toast-exit'); setTimeout(() => el.remove(), 300); }, 3500);
}

function openModal(title, bodyHTML) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = bodyHTML;
    $('modalOverlay').classList.remove('hidden');
}
function closeModal() { $('modalOverlay').classList.add('hidden'); }

// ---- API Layer (mapped to actual backend endpoints) ----
async function apiFetch(path, opts = {}) {
    const headers = opts.headers || {};
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    if (opts.json) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(opts.json); delete opts.json; }
    opts.headers = headers;
    const res = await fetch(path, opts);
    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || `Error ${res.status}`);
    return data;
}

const api = {
    // Auth
    login: (phone, pw) => { const f = new URLSearchParams(); f.append('username',phone); f.append('password',pw); return fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:f}); },
    // User endpoints
    profile: () => apiFetch(`${API}/user/profile`),
    applyLoan: d => apiFetch(`${API}/user/apply-loan`, { method:'POST', json:d }),
    calcLoan: p => apiFetch(`${API}/user/loan_calculator?amount=${p.amount}&interest_rate=${p.rate}&installments=${p.installments}&start_date=${p.start_date}`),
    payContribution: txn => apiFetch(`${API}/user/pay_monthly_contribution?payment_transaction_id=${txn}`, { method:'POST' }),
    payInstallment: (id, txn) => apiFetch(`${API}/user/pay_loan_installment/${id}?payment_transaction_id=${txn}`, { method:'POST' }),
    myInstallments: () => apiFetch(`${API}/user/my_installments`),
    myEarnings: () => apiFetch(`${API}/user/my_earnings`),
    // Admin endpoints
    createUser: d => apiFetch('/create-user', { method:'POST', json:d }),
    emergencyAdmin: d => apiFetch('/emergency-admin', { method:'POST', json:d }),
    resetPassword: d => apiFetch('/reset-password', { method:'POST', json:d }),
    approveLoan: id => apiFetch(`/approve-loan/${id}`, { method:'POST' }),
    allLoans: () => apiFetch('/all-loans'),
    userDetails: phone => apiFetch(`/user_details/${phone}`),
    financialSummary: () => apiFetch('/financial_summary'),
    allUsers: () => apiFetch('/all-users'),
    memberEarnings: phone => apiFetch('/member-earnings/' + phone),
    toggleEmiStatus: id => apiFetch('/toggle-emi-status/' + id, {method:'PUT'}),
    deleteLoan: id => apiFetch('/delete-loan/' + id, {method:'DELETE'}),
    emiAlert: () => apiFetch('/api/user/emi_alert'),
    memberInstallments: phone => apiFetch('/member-installments/' + phone),
};

// ---- Navigation Config (use i18n keys for labels) ----
const adminNav = [
    { id:'dashboard', labelKey:'nav.dashboard', icon:'dashboard' },
    { id:'members', labelKey:'nav.members', icon:'members' },
    { id:'loans', labelKey:'nav.all_loans', icon:'loans' },
    { id:'financialSummary', labelKey:'nav.financial_summary', icon:'summary' },
    { id:'calculator', labelKey:'nav.emi_calculator', icon:'calculator' },
    { id:'resetPassword', labelKey:'nav.reset_password', icon:'resetPw' },
];
const userNav = [
    { id:'dashboard', labelKey:'nav.dashboard', icon:'dashboard' },
    { id:'myInstallments', labelKey:'nav.my_installments', icon:'installments' },
    { id:'applyLoan', labelKey:'nav.apply_loan', icon:'apply' },
    { id:'calculator', labelKey:'nav.emi_calculator', icon:'calculator' },
    { id:'payContribution', labelKey:'nav.pay_contribution', icon:'contribution' },
    { id:'myEarnings', labelKey:'nav.my_earnings', icon:'earnings' },
];

// ---- Initialize App ----
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = state.lang || 'en'; applyStaticTranslations();
    initLanguageToggle();

    if (state.token) { showApp(); } else { showLogin(); }

    $('loginForm').addEventListener('submit', handleLogin);
    $('logoutBtn').addEventListener('click', logout);
    $('modalClose').addEventListener('click', closeModal);
    $('modalOverlay').addEventListener('click', e => { if(e.target === $('modalOverlay')) closeModal(); });
    $('mobileMenuBtn').addEventListener('click', () => { $('sidebar').classList.add('open'); $('sidebarOverlay').classList.remove('hidden'); });
    $('sidebarOverlay').addEventListener('click', closeMobileSidebar);

    const tp = $('togglePassword');
    if(tp) tp.addEventListener('click', () => {
        const inp = $('loginPassword');
        inp.type = inp.type === 'password' ? 'text' : 'password';
    });
});

function closeMobileSidebar() { $('sidebar').classList.remove('open'); $('sidebarOverlay').classList.add('hidden'); }

// ---- Auth ----
async function handleLogin(e) {
    e.preventDefault();
    const btn = $('loginBtn'), errEl = $('loginError');
    const phone = $('loginPhone').value.trim(), pw = $('loginPassword').value;
    btn.disabled = true; btn.querySelector('.btn-text').textContent = t('login.signing_in');
    errEl.classList.add('hidden');
    try {
        const res = await api.login(phone, pw);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        state.token = data.access_token;
        localStorage.setItem('token', state.token);
        showApp();
    } catch(err) {
        errEl.textContent = err.message; errEl.classList.remove('hidden');
    } finally {
        btn.disabled = false; btn.querySelector('.btn-text').textContent = t('login.sign_in');
    }
}

function logout() {
    state.token = null; state.user = null;
    localStorage.removeItem('token');
    showLogin();
}

function showLogin() {
    $('loginPage').classList.remove('hidden');
    $('mainApp').classList.add('hidden');
    document.documentElement.lang = state.lang || 'en'; applyStaticTranslations();
}

async function showApp() {
    $('loginPage').classList.add('hidden');
    $('mainApp').classList.remove('hidden');
    try {
        state.user = await api.profile();
        updateUserUI();
        buildSidebar();
        navigate('dashboard');
    } catch(e) { logout(); }
}

function updateUserUI() {
    const u = state.user, name = u.name || u.username, role = u.role || 'user', ini = initials(name);
    $('sidebarAvatar').textContent = ini;
    $('sidebarUserName').textContent = name;
    $('sidebarUserRole').textContent = role;
    $('topbarAvatar').textContent = ini;
    $('topbarName').textContent = name;
    $('topbarRole').textContent = role;
}

function buildSidebar() {
    const items = state.user.role === 'admin' ? adminNav : userNav;
    const nav = $('sidebarNav');
    nav.innerHTML = '<div class="nav-section-title">' + t('nav.menu') + '</div>' + items.map(it =>
        `<button class="nav-item${state.view===it.id?' active':''}" data-view="${it.id}">
            <span class="nav-icon">${ICONS[it.icon]}</span><span>${t(it.labelKey)}</span>
        </button>`
    ).join('');
    nav.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => {
        navigate(btn.dataset.view); closeMobileSidebar();
    }));
}

// ---- Router ----
function navigate(view, data) {
    state.view = view;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
    const titleKeys = { dashboard:'page.dashboard', members:'page.members', loans:'page.all_loans', resetPassword:'page.reset_password',
        financialSummary:'page.financial_summary', myInstallments:'page.my_installments', applyLoan:'page.apply_loan',
        calculator:'page.emi_calculator', payContribution:'page.pay_contribution', memberDetail:'page.member_details',
        myEarnings:'page.my_earnings' };
    $('pageTitle').textContent = t(titleKeys[view] || 'page.dashboard');
        const name = state.user ? (state.user.name || state.user.username) : '';
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    let subtitle = t('page.manage_shg');
    if (view === 'dashboard') {
        subtitle = `${timeGreeting} ${name}`;
    }
    $('pageSubtitle').textContent = subtitle;

    const content = $('contentArea');
    content.innerHTML = '<div class="skeleton skeleton-card" style="height:200px;margin-bottom:16px"></div>';

    if (view === 'dashboard') {
        // Add large greeting on dashboard content itself
        content.innerHTML = `<div style="font-size: 28px; margin-bottom: 20px; font-weight: bold; color: var(--gray-800);">🌅 ${timeGreeting} ${name}</div>` + content.innerHTML;
    }

    const isAdmin = state.user.role === 'admin';
    const views = {
        dashboard: isAdmin ? renderAdminDashboard : renderUserDashboard,
        members: renderMembers, loans: renderLoans, resetPassword: renderResetPassword,
        financialSummary: renderFinancialSummary,
        myInstallments: renderMyInstallments, applyLoan: renderApplyLoan,
        calculator: renderCalculator, payContribution: renderPayContribution,
        memberDetail: () => renderMemberDetail(data), myEarnings: renderMyEarnings,
    };
    (views[view] || views.dashboard)();
}

// ============================================================
// ADMIN VIEWS
// ============================================================
async function renderAdminDashboard() {
    const c = $('contentArea');
    try {
        const summary = await api.financialSummary();
        const s = summary.summary;
        const st = summary.statistics;
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard(t('admin.total_collection'), formatCurrency(s.total_collection), `${st.total_contribution_payments + st.total_emi_payments} ${t('common.payments')}`, 'purple', ICONS.wallet)}
            ${statCard(t('admin.loans_disbursed'), formatCurrency(s.total_loans_disbursed), `${st.total_loans_approved} ${t('common.loans_approved')}`, 'green', ICONS.money)}
            ${statCard(t('admin.available_amount'), formatCurrency(s.available_amount), t('admin.net_balance'), 'blue', ICONS.wallet)}
            ${statCard(t('admin.total_penalties'), formatCurrency(s.total_penalties), `${st.members_with_penalties} ${t('common.members_penalized')}`, 'red', ICONS.alert)}
        </div>
        <div class="stats-grid">
            ${statCard(t('admin.contributions'), formatCurrency(s.total_contributions), `${st.total_contribution_payments} ${t('common.payments')}`, 'purple', ICONS.contribution)}
            ${statCard(t('admin.emi_collected'), formatCurrency(s.total_emi_collected), `${st.total_emi_payments} ${t('common.payments')}`, 'green', ICONS.payments)}
            ${statCard(t('admin.pending_emis'), formatCurrency(s.pending_emi_amount), `${st.pending_emi_count} ${t('installments.installments')}`, 'amber', ICONS.clock)}
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-title">${t('admin.quick_actions')}</h3></div>
            <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
                <button class="btn btn-primary" onclick="navigate('members')">${t('admin.view_members')}</button>
                <button class="btn btn-success" onclick="showCreateUserModal()">${t('admin.add_member')}</button>
                <button class="btn btn-secondary" onclick="navigate('loans')">${t('admin.manage_loans')}</button>
                <button class="btn btn-secondary" onclick="navigate('financialSummary')">${t('admin.financial_summary')}</button>
                <button class="btn btn-secondary" onclick="navigate('calculator')">${t('admin.emi_calculator')}</button>
                <button class="btn btn-secondary" onclick="navigate('resetPassword')">${t('admin.reset_password')}</button>
            </div>
        </div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

function statCard(label, value, sub, color, icon) {
    return `<div class="stat-card"><div class="stat-icon ${color}">${icon}</div><div class="stat-info"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div></div>`;
}

async function renderMembers() {
    const c = $('contentArea');
    const name = state.user ? (state.user.name || state.user.username) : '';
    c.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 20px;">😊 Welcome ${name}</div>
    <div class="section-header">
        <h2 class="section-title">${t('members.lookup')}</h2>
        <button class="btn btn-primary btn-sm" onclick="showCreateUserModal()">${t('members.add')}</button>
    </div>
    <div class="card form-card" style="max-width:100%">
        <div class="card-body">
            <form id="memberSearchForm" style="display:flex;gap:12px;align-items:flex-end">
                <div class="form-group-content" style="flex:1;margin-bottom:0">
                    <label>${t('members.phone_label')}</label>
                    <input class="form-input" type="tel" id="memberSearchPhone" placeholder="${t('members.phone_placeholder')}" required>
                </div>
                <button type="submit" class="btn btn-primary" style="height:38px">${t('members.search')}</button>
            </form>
        </div>
    </div>
    <div id="memberSearchResult" style="margin-top:20px"></div>
    <div id="allMembersList" style="margin-top:20px"></div>`;

    // Load all members automatically
    (async () => {
        const listDiv = $('allMembersList');
        try {
            const users = await api.allUsers();
            let usersHtml = `<div class="card section-gap"><div class="card-header"><h3 class="card-title">All Members</h3></div><div class="card-body"><div class="table-responsive"><table class="table">
                <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead><tbody>
            `;
            users.forEach(u => {
                usersHtml += `<tr>
                    <td>${u.id}</td>
                    <td>${u.name}</td>
                    <td>${u.phone}</td>
                    <td>${u.is_admin ? '<span class="badge badge-purple">Admin</span>' : '<span class="badge badge-info">Member</span>'}</td>
                    <td>${u.is_active ? '<span class="badge badge-success"><span class="badge-dot"></span>Active</span>' : '<span class="badge badge-danger"><span class="badge-dot"></span>Inactive</span>'}</td>
                    <td>${formatDate(u.join_date)}</td>
                </tr>`;
            });
            usersHtml += `</tbody></table></div></div></div>`;
            listDiv.innerHTML = usersHtml;
        } catch(err) {
            listDiv.innerHTML = `<div class="empty-state">Failed to load members</div>`;
        }
    })();

    $('memberSearchForm').addEventListener('submit', async e => {
        e.preventDefault();
        const phone = $('memberSearchPhone').value.trim();
        if (!phone) return;
        const resultDiv = $('memberSearchResult');
        resultDiv.innerHTML = '<div class="skeleton skeleton-card" style="height:100px"></div>';
        try {
            const u = await api.userDetails(phone);
            try {
                const earn = await api.memberEarnings(phone);
                u.earnings = earn;
            } catch(ee) {} // ignore earning error if any
            resultDiv.innerHTML = renderMemberCard(u);
        } catch(err) {
            resultDiv.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state">${ICONS.alert}<h3>${t('members.not_found')}</h3><p>${err.message}</p></div></div></div>`;
        }
    });
}

function renderMemberCard(u) {
    let earnHtml = '';
    if(u.earnings) {
        let e = u.earnings.earnings || {interest_share:0, penalty_share:0};
        let subA = e.interest_share || 0;
        let subB = e.penalty_share || 0;
        let subAB = subA + subB;
        
        let allKisht = u.payment_history.reduce((acc, p) => p.payment_date ? acc + (p.total_loan_amount || p.total_pending_amount || 0) : acc, 0);
        let grandTotal = allKisht + subAB;
        
        earnHtml = `
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
            <button class="btn btn-secondary" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Earning from Interest (A)</span> <strong>${formatCurrency(subA)}</strong>
            </button>
            <button class="btn btn-secondary" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Earning from Penalty (B)</span> <strong>${formatCurrency(subB)}</strong>
            </button>
            <button class="btn btn-primary" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Sub Total (A+B)</span> <strong>${formatCurrency(subAB)}</strong>
            </button>
            <button class="btn btn-success" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Grand Total (All Kisht+A+B)</span> <strong>${formatCurrency(grandTotal)}</strong>
            </button>
        </div>`;
    }

    return `
    <div class="card section-gap">
        <div class="card-header"><h3 class="card-title">${t('members.profile')}</h3></div>
        <div class="card-body">
            <div class="detail-header" style="margin-bottom:16px">
                <div class="detail-avatar">${initials(u.name)}</div>
                <div><div class="detail-name">${u.name}</div><div class="detail-phone">${u.phone}</div></div>
                <div style="margin-left:auto">${u.is_active ? `<span class="badge badge-success"><span class="badge-dot"></span>${t('badge.active')}</span>` : `<span class="badge badge-danger"><span class="badge-dot"></span>${t('badge.inactive')}</span>`}</div>
            </div>
            <div class="info-grid">
                <div class="info-item"><div class="info-label">${t('members.id')}</div><div class="info-value">${u.id}</div></div>
                <div class="info-item"><div class="info-label">${t('members.phone')}</div><div class="info-value">${u.phone}</div></div>
                <div class="info-item"><div class="info-label">${t('members.join_date')}</div><div class="info-value">${formatDate(u.join_date)}</div></div>
                <div class="info-item"><div class="info-label">${t('members.role')}</div><div class="info-value">${u.is_admin?t('members.admin'):t('members.member')}</div></div>
            </div>
        </div>
    </div>
    ${earnHtml}
    ${renderPaymentTable(u.payment_history, t('common.payment_history'))}
    ${renderLoanTable(u.loan_history, t('common.loan_history'))}`;
}

async function renderLoans() {
    const c = $('contentArea');
    try {
        const loans = await api.allLoans();
        const pendingLoans = loans.filter(l=>l.status==='pending');
        const activeLoans = loans.filter(l=>l.status!=='pending');
        c.innerHTML = `
        <div class="section-header"><h2 class="section-title">All Loans</h2></div>
        
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">Active Loans (${activeLoans.length})</h3></div>
        <div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr>
                <th>${t('table.id')}</th><th>Member ID</th><th>${t('table.amount')}</th><th>${t('table.rate')}</th><th>${t('table.emis')}</th><th>${t('table.status')}</th><th>${t('table.start')}</th>
            </tr></thead><tbody>
            ${activeLoans.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray-400)">No Active Loans</td></tr>` : activeLoans.map(l=>`<tr>
                <td class="cell-primary">#${l.id}</td><td><b>Member ${l.member_id}</b></td><td class="cell-primary">${formatCurrency(l.amount)}</td>
                <td>${l.interest_rate}%</td><td>${l.installments}</td>
                <td>${statusBadge(l.status)}</td><td>${formatDate(l.start_date)}</td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>

        <div class="card"><div class="card-header"><h3 class="card-title">Pending Loans (${pendingLoans.length})</h3></div>
        <div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr>
                <th>${t('table.id')}</th><th>Member ID</th><th>${t('table.amount')}</th><th>${t('table.rate')}</th><th>${t('table.emis')}</th><th>${t('table.status')}</th><th>${t('table.action')}</th>
            </tr></thead><tbody>
            ${pendingLoans.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray-400)">${t('loans.no_loans')}</td></tr>` : pendingLoans.map(l=>`<tr>
                <td class="cell-primary">#${l.id}</td><td><b>Member ${l.member_id}</b></td><td class="cell-primary">${formatCurrency(l.amount)}</td>
                <td>${l.interest_rate}%</td><td>${l.installments}</td>
                <td>${statusBadge(l.status)}</td>
                <td><button class="btn btn-success btn-sm" onclick="handleApproveLoan(${l.id})">${ICONS.check} ${t('loans.approve')}</button></td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

async function handleApproveLoan(id) {
    if(!confirm(t('loans.approve_confirm'))) return;
    try { await api.approveLoan(id); showToast(t('loans.approved_success'),'success'); renderLoans(); }
    catch(e) { showToast(e.message,'error'); }
}

async function renderFinancialSummary() {
    const c = $('contentArea');
    try {
        const data = await api.financialSummary();
        const s = data.summary;
        const st = data.statistics;
        const penalties = data.members_with_penalties || [];
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard(t('admin.total_collection'), formatCurrency(s.total_collection), t('financial.all_income'), 'purple', ICONS.wallet)}
            ${statCard(t('admin.loans_disbursed'), formatCurrency(s.total_loans_disbursed), `${st.total_loans_approved} ${t('common.loans')}`, 'red', ICONS.money)}
            ${statCard(t('admin.available_amount'), formatCurrency(s.available_amount), t('admin.net_balance'), 'green', ICONS.wallet)}
        </div>
        <div class="card section-gap">
            <div class="card-header"><h3 class="card-title">${t('financial.detailed_breakdown')}</h3></div>
            <div class="card-body">
                <div class="info-grid">
                    <div class="info-item"><div class="info-label">${t('financial.total_contributions')}</div><div class="info-value">${formatCurrency(s.total_contributions)}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.total_emi_collected')}</div><div class="info-value">${formatCurrency(s.total_emi_collected)}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.contribution_penalties')}</div><div class="info-value">${formatCurrency(s.contribution_penalties)}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.emi_penalties')}</div><div class="info-value">${formatCurrency(s.emi_penalties)}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.total_penalties')}</div><div class="info-value">${formatCurrency(s.total_penalties)}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.pending_emi_amount')}</div><div class="info-value">${formatCurrency(s.pending_emi_amount)}</div></div>
                </div>
            </div>
        </div>
        <div class="card section-gap">
            <div class="card-header"><h3 class="card-title">${t('financial.statistics')}</h3></div>
            <div class="card-body">
                <div class="info-grid">
                    <div class="info-item"><div class="info-label">${t('financial.total_contribution_payments')}</div><div class="info-value">${st.total_contribution_payments}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.total_emi_payments')}</div><div class="info-value">${st.total_emi_payments}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.total_loans_approved')}</div><div class="info-value">${st.total_loans_approved}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.pending_emi_count')}</div><div class="info-value">${st.pending_emi_count}</div></div>
                    <div class="info-item"><div class="info-label">${t('financial.members_with_penalties')}</div><div class="info-value">${st.members_with_penalties}</div></div>
                </div>
            </div>
        </div>
        ${penalties.length > 0 ? `
        <div class="card">
            <div class="card-header"><h3 class="card-title">${t('financial.members_with_penalties')}</h3></div>
            <div class="card-body no-padding"><div class="table-wrapper">
                <table class="data-table"><thead><tr><th>${t('table.name')}</th><th>${t('table.phone')}</th><th>${t('table.total_penalty')}</th></tr></thead><tbody>
                ${penalties.map(p=>`<tr><td class="cell-primary">${p.name}</td><td class="cell-mono">${p.phone}</td><td class="cell-primary">${formatCurrency(p.total_penalty)}</td></tr>`).join('')}
                </tbody></table>
            </div></div>
        </div>` : ''}`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

function renderResetPassword() {
    $('contentArea').innerHTML = `
    <div class="card form-card"><div class="card-header"><h3 class="card-title">${t('reset_pw.title')}</h3></div><div class="card-body">
        <form id="resetPwForm">
            <div class="form-group-content"><label>${t('reset_pw.phone')}</label><input class="form-input" type="tel" id="rpPhone" placeholder="${t('reset_pw.phone_placeholder')}" required></div>
            <div class="form-group-content"><label>${t('reset_pw.new_password')}</label><input class="form-input" type="text" id="rpPassword" placeholder="${t('reset_pw.password_placeholder')}" required></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">${t('reset_pw.submit')}</button></div>
        </form>
    </div></div>`;
    $('resetPwForm').addEventListener('submit', async e => {
        e.preventDefault();
        try { await api.resetPassword({ phone:$('rpPhone').value.trim(), new_password:$('rpPassword').value }); showToast(t('reset_pw.success'),'success'); $('resetPwForm').reset(); }
        catch(err) { showToast(err.message,'error'); }
    });
}

function showCreateUserModal() {
    openModal(t('create_user.title'), `
        <form id="createUserForm">
            <div class="form-group-content"><label>${t('create_user.name')}</label><input class="form-input" id="cuName" placeholder="${t('create_user.name_placeholder')}" required></div>
            <div class="form-group-content"><label>${t('login.phone')}</label><input class="form-input" type="tel" id="cuPhone" placeholder="${t('create_user.phone_placeholder')}" required></div>
            <div class="form-group-content"><label>${t('create_user.password')}</label><input class="form-input" id="cuPassword" placeholder="${t('create_user.password_placeholder')}" required></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary btn-full">${t('create_user.submit')}</button></div>
        </form>`);
    $('createUserForm').addEventListener('submit', async e => {
        e.preventDefault();
        try { await api.createUser({name:$('cuName').value.trim(),phone:$('cuPhone').value.trim(),password:$('cuPassword').value}); showToast(t('create_user.success'),'success'); closeModal(); }
        catch(err) { showToast(err.message,'error'); }
    });
}

// ============================================================
// USER VIEWS
// ============================================================
async function renderUserDashboard() {
    const c = $('contentArea');
    try {
        const [profile, installments] = await Promise.all([api.profile(), api.myInstallments()]);
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard(t('user.total_installments'), installments.total_installments, `${installments.paid_count} ${t('user.paid')}`, 'purple', ICONS.installments)}
            ${statCard(t('user.pending_emis'), installments.pending_count, installments.pending_count > 0 ? t('user.due_payments') : t('user.all_clear'), 'amber', ICONS.clock)}
            ${statCard(t('user.paid_emis'), installments.paid_count, t('user.completed'), 'green', ICONS.check)}
        </div>
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">${t('user.my_profile')}</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">${t('common.name')}</div><div class="info-value">${profile.name}</div></div>
                <div class="info-item"><div class="info-label">${t('common.phone')}</div><div class="info-value">${profile.username}</div></div>
                <div class="info-item"><div class="info-label">${t('common.role')}</div><div class="info-value">${profile.role}</div></div>
                <div class="info-item"><div class="info-label">${t('common.status')}</div><div class="info-value">${profile.is_active?`<span class="badge badge-success"><span class="badge-dot"></span>${t('badge.active')}</span>`:`<span class="badge badge-danger"><span class="badge-dot"></span>${t('badge.inactive')}</span>`}</div></div>
            </div>
        </div></div>
        <div class="card"><div class="card-header"><h3 class="card-title">${t('user.quick_actions')}</h3></div><div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="navigate('applyLoan')">${t('user.apply_loan')}</button>
            <button class="btn btn-success" onclick="navigate('payContribution')">${t('user.pay_contribution')}</button>
            <button class="btn btn-secondary" onclick="navigate('myInstallments')">${t('user.my_installments')}</button>
            <button class="btn btn-secondary" onclick="navigate('calculator')">${t('user.emi_calculator')}</button>
            <button class="btn btn-secondary" onclick="navigate('myEarnings')">${t('user.my_earnings')}</button>
        </div></div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

async function renderMyInstallments() {
    const c = $('contentArea');
    try {
        const data = await api.myInstallments();
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard(t('installments.total'), data.total_installments, t('installments.installments'), 'purple', ICONS.installments)}
            ${statCard(t('installments.pending'), data.pending_count, t('installments.to_pay'), 'amber', ICONS.clock)}
            ${statCard(t('installments.paid'), data.paid_count, t('installments.completed'), 'green', ICONS.check)}
        </div>
        ${data.pending_installments.length > 0 ? `
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">${t('installments.pending_title')} (${data.pending_count})</h3></div>
        <div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr><th>${t('table.description')}</th><th>${t('table.amount')}</th><th>${t('table.due_date')}</th><th>${t('table.action')}</th></tr></thead><tbody>
            ${data.pending_installments.map(i=>`<tr>
                <td>${i.description||t('installments.loan_installment')}</td>
                <td class="cell-primary">${formatCurrency(i.total_pending_amount)}</td>
                <td>${formatDate(i.due_date)}</td>
                <td><button class="btn btn-success btn-sm" onclick="showPayInstallmentModal(${i.id}, ${i.total_pending_amount})">${t('installments.pay_now')}</button></td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>` : '<div class="card section-gap"><div class="card-body"><div class="empty-state">' + ICONS.check + '<h3>' + t('installments.no_pending') + '</h3><p>' + t('installments.all_paid') + '</p></div></div></div>'}
        ${data.paid_installments.length > 0 ? `
        <div class="card"><div class="card-header"><h3 class="card-title">${t('installments.paid_title')} (${data.paid_count})</h3></div>
        <div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr><th>${t('table.description')}</th><th>${t('table.amount')}</th><th>${t('table.paid_on')}</th><th>${t('table.late')}</th><th>${t('table.penalty')}</th></tr></thead><tbody>
            ${data.paid_installments.map(i=>`<tr>
                <td>${i.description||t('installments.loan_installment')}</td>
                <td class="cell-primary">${formatCurrency(i.total_loan_amount)}</td>
                <td>${formatDate(i.payment_date)}</td>
                <td>${i.days_late ? i.days_late + ' ' + t('common.days') : '—'}</td>
                <td>${i.penalty_amount ? formatCurrency(i.penalty_amount) : '—'}</td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>` : ''}`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

function showPayInstallmentModal(id, amount) {
    openModal(t('pay_inst.title'), `
        <div style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px">
            <strong>${t('common.amount')}: ${formatCurrency(amount)}</strong><br>
            <span style="font-size:0.85rem;color:var(--gray-500)">${t('pay_inst.penalty_note')}</span>
        </div>
        <form id="payInstForm">
            <div class="form-group-content"><label>${t('pay_inst.txn_id')}</label>
                <input class="form-input" id="instTxn" placeholder="${t('pay_inst.txn_placeholder')}" required>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn-success btn-full">${t('pay_inst.confirm')}</button></div>
        </form>`);
    $('payInstForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const r = await api.payInstallment(id, $('instTxn').value.trim());
            showToast(t('pay_inst.success'),'success'); closeModal();
            openModal(t('pay_inst.success_title'), `<div class="info-grid">
                <div class="info-item"><div class="info-label">${t('common.amount')}</div><div class="info-value">${formatCurrency(r.amount_paid)}</div></div>
                <div class="info-item"><div class="info-label">${t('common.penalty')}</div><div class="info-value">${formatCurrency(r.penalty_amount)}</div></div>
                <div class="info-item"><div class="info-label">${t('common.total_paid')}</div><div class="info-value">${formatCurrency(r.total_paid)}</div></div>
                <div class="info-item"><div class="info-label">${t('common.date')}</div><div class="info-value">${formatDate(r.payment_date)}</div></div>
            </div>`);
            renderMyInstallments();
        } catch(err) { showToast(err.message,'error'); }
    });
}

async function renderMyEarnings() {
    const c = $('contentArea');
    try {
        const [data, instData] = await Promise.all([api.myEarnings(), api.myInstallments()]);
        const e = data.earnings || {interest_share:0, penalty_share:0};
        const g = data.group_totals || {total_interest_earned:0, total_penalties_collected:0, grand_total:0};
        const m = data.member_contribution || {penalty_paid_by_me:0};

        let subA = e.interest_share || 0;
        let subB = e.penalty_share || 0;
        let subAB = subA + subB;

        const paidInsts = instData.paid_installments || [];
        let allKisht = paidInsts.reduce((acc, p) => acc + (p.total_loan_amount || p.total_pending_amount || 0), 0);
        let grandTotal = allKisht + subAB;

        c.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
            <button class="btn btn-secondary" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Earning from Interest (A)</span> <strong>${formatCurrency(subA)}</strong>
            </button>
            <button class="btn btn-secondary" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Earning from Penalty (B)</span> <strong>${formatCurrency(subB)}</strong>
            </button>
            <button class="btn btn-primary" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Sub Total (A+B)</span> <strong>${formatCurrency(subAB)}</strong>
            </button>
            <button class="btn btn-success" style="flex:1; min-width:200px; text-align: left; justify-content: space-between;">
                <span>Grand Total (All Kisht+A+B)</span> <strong>${formatCurrency(grandTotal)}</strong>
            </button>
        </div>
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">${t('earnings.group_totals')}</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">${t('earnings.total_interest')}</div><div class="info-value">${formatCurrency(g.total_interest_earned)}</div></div>
                <div class="info-item"><div class="info-label">${t('earnings.total_penalties_collected')}</div><div class="info-value">${formatCurrency(g.total_penalties_collected)}</div></div>
                <div class="info-item"><div class="info-label">${t('earnings.grand_total')}</div><div class="info-value">${formatCurrency(g.grand_total)}</div></div>
                <div class="info-item"><div class="info-label">${t('earnings.active_members')}</div><div class="info-value">${data.total_active_members}</div></div>
            </div>
        </div></div>
        <div class="card"><div class="card-header"><h3 class="card-title">${t('earnings.my_contribution')}</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">${t('earnings.penalty_paid')}</div><div class="info-value">${formatCurrency(m.penalty_paid_by_me)}</div></div>
            </div>
        </div></div>`;
    } catch(err) { c.innerHTML = errorHTML(err.message); }
}

function renderApplyLoan() {
    $('contentArea').innerHTML = `
    <div class="card form-card"><div class="card-header"><h3 class="card-title">${t('apply.title')}</h3></div><div class="card-body">
        <form id="applyLoanForm">
            <div class="form-row">
                <div class="form-group-content"><label>${t('apply.amount')}</label><input class="form-input" type="number" id="alAmount" placeholder="${t('apply.amount_placeholder')}" min="1" required></div>
                <div class="form-group-content"><label>${t('apply.rate')}</label><input class="form-input" type="number" id="alRate" value="2" step="0.1" min="0" required></div>
            </div>
            <div class="form-row">
                <div class="form-group-content"><label>${t('apply.installments')}</label><input class="form-input" type="number" id="alInstallments" value="6" placeholder="${t('apply.installments_placeholder')}" min="1" required></div>
                <div class="form-group-content"><label>${t('apply.description')}</label><input class="form-input" id="alDesc" placeholder="${t('apply.description_placeholder')}"></div>
            </div>
            <div id="liveCalc" style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px;display:none;"></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">${t('apply.submit')}</button></div>
        </form>
    </div></div>`;

    const updateCalc = async () => {
        const a = +$('alAmount').value;
        const r = +$('alRate').value;
        const i = +$('alInstallments').value;
        if(a > 0 && r >= 0 && i > 0) {
            try {
                const res = await api.calcLoan({amount:a, rate:r, installments:i, start_date: new Date().toISOString().split('T')[0]});
                $('liveCalc').innerHTML = `<strong>Estimated EMI:</strong> ${formatCurrency(res.installment_breakdown[0]?.total_payment || 0)}/month <br> <span style="font-size:0.85rem;color:var(--gray-500)">Total Interest: ${formatCurrency(res.total_interest)} | Total Payable: ${formatCurrency(res.total_amount)}</span>`;
                $('liveCalc').style.display = 'block';
            } catch(e){}
        } else {
            $('liveCalc').style.display = 'none';
        }
    };
    $('alAmount').addEventListener('input', updateCalc);
    $('alRate').addEventListener('input', updateCalc);
    $('alInstallments').addEventListener('input', updateCalc);

    $('applyLoanForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            await api.applyLoan({ amount:+$('alAmount').value, interest_rate:+$('alRate').value, installments:+$('alInstallments').value, description:$('alDesc').value||null });
            showToast(t('apply.success'),'success'); navigate('myInstallments');
        } catch(err) { showToast(err.message,'error'); }
    });
}

function renderCalculator() {
    $('contentArea').innerHTML = `
    <div class="card form-card" style="max-width:700px"><div class="card-header"><h3 class="card-title">${t('calc.title')}</h3></div><div class="card-body">
        <form id="calcForm">
            <div class="form-row">
                <div class="form-group-content"><label>${t('calc.amount')}</label><input class="form-input" type="number" id="calcAmt" placeholder="${t('calc.amount_placeholder')}" min="1" required></div>
                <div class="form-group-content"><label>${t('calc.rate')}</label><input class="form-input" type="number" id="calcRate" value="2" step="0.1" min="0" required></div>
            </div>
            <div class="form-row">
                <div class="form-group-content"><label>${t('calc.installments')}</label><input class="form-input" type="number" id="calcInst" value="6" min="1" required></div>
                <div class="form-group-content"><label>${t('calc.start_date')}</label><input class="form-input" type="date" id="calcDate" value="${new Date().toISOString().split('T')[0]}" required></div>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">${t('calc.calculate')}</button></div>
        </form>
        <div id="calcResult" style="margin-top:24px"></div>
    </div></div>`;
    $('calcForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const r = await api.calcLoan({ amount:$('calcAmt').value, rate:$('calcRate').value, installments:$('calcInst').value, start_date: new Date().toISOString().split('T')[0] });
            $('calcResult').innerHTML = `
            <div class="calc-result-grid">
                <div class="calc-result-item"><div class="info-label">${t('calc.principal')}</div><div class="info-value">${formatCurrency(r.principal_amount)}</div></div>
                <div class="calc-result-item"><div class="info-label">${t('calc.total_interest')}</div><div class="info-value">${formatCurrency(r.total_interest)}</div></div>
                <div class="calc-result-item"><div class="info-label">${t('calc.total_payable')}</div><div class="info-value">${formatCurrency(r.total_amount)}</div></div>
                <div class="calc-result-item"><div class="info-label">${t('calc.duration')}</div><div class="info-value">${r.installments} ${t('calc.months')}</div></div>
            </div>
            <div class="card"><div class="card-header"><h3 class="card-title">${t('calc.breakdown')}</h3></div><div class="card-body no-padding"><div class="table-wrapper">
                <table class="data-table"><thead><tr><th>${t('table.hash')}</th><th>${t('table.due_date')}</th><th>${t('table.principal')}</th><th>${t('table.interest')}</th><th>${t('table.emi')}</th><th>${t('table.balance')}</th></tr></thead><tbody>
                ${r.installment_breakdown.map(i=>`<tr><td>${i.month}</td><td>${formatDate(i.due_date)}</td><td>${formatCurrency(i.principal)}</td><td>${formatCurrency(i.interest)}</td><td class="cell-primary">${formatCurrency(i.total_payment)}</td><td>${formatCurrency(i.remaining_balance)}</td></tr>`).join('')}
                </tbody></table>
            </div></div></div>`;
        } catch(err) { showToast(err.message,'error'); }
    });
}

function renderPayContribution() {
    $('contentArea').innerHTML = `
    <div class="card form-card"><div class="card-header"><h3 class="card-title">${t('contrib.title')}</h3></div><div class="card-body">
        <div style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px">
            <strong>${t('contrib.monthly')} ${formatCurrency(1000)}</strong><br>
            <span style="font-size:0.85rem;color:var(--gray-500)">${t('contrib.due_note')}</span>
        </div>
        <div style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px;text-align:center">
            <strong>Scan to Pay: ${formatCurrency(1000)}</strong><br>
            <span style="font-size:0.85rem;color:var(--gray-500)">Monthly Contribution</span>
            <div style="margin:20px auto; width: 170px; height: 170px; background: white; padding: 10px; border-radius: 8px;">
                <img src="/static/QRCode.png" alt="QR Code" style="width: 150px; height: 150px; border-radius: 4px;">
            </div>
            <p style="font-size:0.9rem; margin-top: 10px;">Scan using any UPI App</p>
        </div>
        <form id="contribForm">
            <div class="form-group-content"><label>Or enter Transaction ID manually (if testing)</label><input class="form-input" id="contribTxn" placeholder="Enter transaction ID" value="QR_SCANNED_TXN_01" required></div>
            <div class="form-actions"><button type="submit" class="btn btn-success">Confirm Payment</button></div>
        </form>
    </div></div>`;
    $('contribForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const r = await api.payContribution($('contribTxn').value.trim());
            showToast(t('contrib.success'),'success');
            openModal(t('contrib.success_title'), `
                <div class="info-grid">
                    <div class="info-item"><div class="info-label">${t('common.amount')}</div><div class="info-value">${formatCurrency(r.contribution_amount)}</div></div>
                    <div class="info-item"><div class="info-label">${t('common.penalty')}</div><div class="info-value">${formatCurrency(r.penalty_amount)}</div></div>
                    <div class="info-item"><div class="info-label">${t('common.total_paid')}</div><div class="info-value">${formatCurrency(r.total_paid)}</div></div>
                    <div class="info-item"><div class="info-label">${t('common.date')}</div><div class="info-value">${formatDate(r.payment_date)}</div></div>
                </div>`);
            $('contribForm').reset();
        } catch(err) { showToast(err.message,'error'); }
    });
}

// ---- Shared Render Helpers ----
function renderPaymentTable(payments, title) {
    if(!payments||!payments.length) return `<div class="card section-gap"><div class="card-header"><h3 class="card-title">${title}</h3></div><div class="card-body"><div class="empty-state">${ICONS.wallet}<h3>${t('common.no_payments')}</h3><p>${t('common.payments_appear')}</p></div></div></div>`;
    return `<div class="card section-gap"><div class="card-header"><h3 class="card-title">${title} (${payments.length})</h3></div><div class="card-body no-padding"><div class="table-wrapper">
        <table class="data-table"><thead><tr><th>${t('table.type')}</th><th>${t('table.amount')}</th><th>${t('table.due')}</th><th>${t('table.paid')}</th><th>${t('table.late')}</th><th>${t('table.penalty')}</th><th>${t('table.status')}</th></tr></thead><tbody>
        ${payments.map(p=>`<tr>
            <td>${p.payment_type==='monthly_contribution'?`<span class="badge badge-info"><span class="badge-dot"></span>${t('badge.contribution')}</span>`:`<span class="badge badge-neutral"><span class="badge-dot"></span>${t('badge.loan_emi')}</span>`}</td>
            <td class="cell-primary">${formatCurrency(p.total_pending_amount||p.total_loan_amount)}</td>
            <td>${formatDate(p.due_date)}</td>
            <td>${p.payment_date?formatDate(p.payment_date):'—'}</td>
            <td>${p.days_late?p.days_late+' '+t('common.days'):'—'}</td>
            <td>${p.penalty_amount?formatCurrency(p.penalty_amount):'—'}</td>
            <td>${p.payment_date?`<span class="badge badge-success"><span class="badge-dot"></span>${t('badge.paid')}</span>`:`<span class="badge badge-warning"><span class="badge-dot"></span>${t('badge.pending')}</span>`}</td>
        </tr>`).join('')}
        </tbody></table></div></div></div>`;
}

function renderLoanTable(loans, title) {
    if(!loans||!loans.length) return `<div class="card"><div class="card-header"><h3 class="card-title">${title}</h3></div><div class="card-body"><div class="empty-state">${ICONS.money}<h3>${t('common.no_loans')}</h3><p>${t('common.loans_appear')}</p></div></div></div>`;
    return `<div class="card section-gap"><div class="card-header"><h3 class="card-title">${title} (${loans.length})</h3></div><div class="card-body no-padding"><div class="table-wrapper">
        <table class="data-table"><thead><tr><th>${t('table.id')}</th><th>${t('table.amount')}</th><th>${t('table.rate')}</th><th>${t('table.emis')}</th><th>${t('table.status')}</th><th>${t('table.start')}</th><th>${t('table.end')}</th></tr></thead><tbody>
        ${loans.map(l=>`<tr>
            <td class="cell-primary">#${l.id}</td><td class="cell-primary">${formatCurrency(l.amount)}</td><td>${l.interest_rate}%</td><td>${l.installments}</td>
            <td>${statusBadge(l.status)}</td><td>${formatDate(l.start_date)}</td><td>${formatDate(l.end_date)}</td>
        </tr>`).join('')}
        </tbody></table></div></div></div>`;
}

function statusBadge(s) {
    const m = { approved:'badge-success', pending:'badge-warning', rejected:'badge-danger', active:'badge-success' };
    const labelMap = { approved:'badge.approved', pending:'badge.pending', rejected:'badge.rejected', active:'badge.active' };
    const label = labelMap[s] ? t(labelMap[s]) : s.charAt(0).toUpperCase()+s.slice(1);
    return `<span class="badge ${m[s]||'badge-neutral'}"><span class="badge-dot"></span>${label}</span>`;
}

function errorHTML(msg) {
    return `<div class="card"><div class="card-body"><div class="empty-state">${ICONS.alert}<h3>${t('common.error_title')}</h3><p>${msg}</p></div></div></div>`;
}
