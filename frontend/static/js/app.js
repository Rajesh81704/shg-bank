/* ============================================================
   SHG BANK SYSTEM — Application Logic (Complete API Integration)
   ============================================================ */

const API = '/api';
const state = { token: localStorage.getItem('token'), user: null, view: 'dashboard' };

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

function showToast(msg, type='info') {
    const c = $('toastContainer');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('toast-exit'); setTimeout(() => t.remove(), 300); }, 3500);
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
};

// ---- Navigation Config ----
const adminNav = [
    { id:'dashboard', label:'Dashboard', icon:'dashboard' },
    { id:'members', label:'Members', icon:'members' },
    { id:'loans', label:'All Loans', icon:'loans' },
    { id:'financialSummary', label:'Financial Summary', icon:'summary' },
    { id:'calculator', label:'EMI Calculator', icon:'calculator' },
    { id:'resetPassword', label:'Reset Password', icon:'resetPw' },
];
const userNav = [
    { id:'dashboard', label:'Dashboard', icon:'dashboard' },
    { id:'myInstallments', label:'My Installments', icon:'installments' },
    { id:'applyLoan', label:'Apply for Loan', icon:'apply' },
    { id:'calculator', label:'EMI Calculator', icon:'calculator' },
    { id:'payContribution', label:'Pay Contribution', icon:'contribution' },
    { id:'myEarnings', label:'My Earnings', icon:'earnings' },
];

// ---- Initialize App ----
document.addEventListener('DOMContentLoaded', () => {
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
    btn.disabled = true; btn.querySelector('.btn-text').textContent = 'Signing in...';
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
        btn.disabled = false; btn.querySelector('.btn-text').textContent = 'Sign In';
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
    nav.innerHTML = '<div class="nav-section-title">Menu</div>' + items.map(it =>
        `<button class="nav-item${state.view===it.id?' active':''}" data-view="${it.id}">
            <span class="nav-icon">${ICONS[it.icon]}</span><span>${it.label}</span>
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
    const titles = { dashboard:'Dashboard', members:'Members', loans:'All Loans', resetPassword:'Reset Password',
        financialSummary:'Financial Summary', myInstallments:'My Installments', applyLoan:'Apply for Loan',
        calculator:'EMI Calculator', payContribution:'Pay Contribution', memberDetail:'Member Details',
        myEarnings:'My Earnings' };
    $('pageTitle').textContent = titles[view] || 'Dashboard';
    $('pageSubtitle').textContent = view === 'dashboard' ? 'Welcome back!' : 'Manage your SHG banking';

    const content = $('contentArea');
    content.innerHTML = '<div class="skeleton skeleton-card" style="height:200px;margin-bottom:16px"></div>';

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
            ${statCard('Total Collection', formatCurrency(s.total_collection), `${st.total_contribution_payments + st.total_emi_payments} payments`, 'purple', ICONS.wallet)}
            ${statCard('Loans Disbursed', formatCurrency(s.total_loans_disbursed), `${st.total_loans_approved} loans approved`, 'green', ICONS.money)}
            ${statCard('Available Amount', formatCurrency(s.available_amount), 'Net balance', 'blue', ICONS.wallet)}
            ${statCard('Total Penalties', formatCurrency(s.total_penalties), `${st.members_with_penalties} members penalized`, 'red', ICONS.alert)}
        </div>
        <div class="stats-grid">
            ${statCard('Contributions', formatCurrency(s.total_contributions), `${st.total_contribution_payments} payments`, 'purple', ICONS.contribution)}
            ${statCard('EMI Collected', formatCurrency(s.total_emi_collected), `${st.total_emi_payments} payments`, 'green', ICONS.payments)}
            ${statCard('Pending EMIs', formatCurrency(s.pending_emi_amount), `${st.pending_emi_count} installments`, 'amber', ICONS.clock)}
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-title">Quick Actions</h3></div>
            <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
                <button class="btn btn-primary" onclick="navigate('members')">👥 View Members</button>
                <button class="btn btn-success" onclick="showCreateUserModal()">➕ Add Member</button>
                <button class="btn btn-secondary" onclick="navigate('loans')">💰 Manage Loans</button>
                <button class="btn btn-secondary" onclick="navigate('financialSummary')">📊 Financial Summary</button>
                <button class="btn btn-secondary" onclick="navigate('calculator')">🧮 EMI Calculator</button>
                <button class="btn btn-secondary" onclick="navigate('resetPassword')">🔑 Reset Password</button>
            </div>
        </div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

function statCard(label, value, sub, color, icon) {
    return `<div class="stat-card"><div class="stat-icon ${color}">${icon}</div><div class="stat-info"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div></div>`;
}

async function renderMembers() {
    const c = $('contentArea');
    c.innerHTML = `
    <div class="section-header">
        <h2 class="section-title">Member Lookup</h2>
        <button class="btn btn-primary btn-sm" onclick="showCreateUserModal()">+ Add Member</button>
    </div>
    <div class="card form-card" style="max-width:100%">
        <div class="card-body">
            <form id="memberSearchForm" style="display:flex;gap:12px;align-items:flex-end">
                <div class="form-group-content" style="flex:1;margin-bottom:0">
                    <label>Phone Number</label>
                    <input class="form-input" type="tel" id="memberSearchPhone" placeholder="Enter member phone number" required>
                </div>
                <button type="submit" class="btn btn-primary" style="height:38px">Search</button>
            </form>
        </div>
    </div>
    <div id="memberSearchResult" style="margin-top:20px"></div>`;
    $('memberSearchForm').addEventListener('submit', async e => {
        e.preventDefault();
        const phone = $('memberSearchPhone').value.trim();
        if (!phone) return;
        const resultDiv = $('memberSearchResult');
        resultDiv.innerHTML = '<div class="skeleton skeleton-card" style="height:100px"></div>';
        try {
            const u = await api.userDetails(phone);
            resultDiv.innerHTML = renderMemberCard(u);
        } catch(err) {
            resultDiv.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state">${ICONS.alert}<h3>Member not found</h3><p>${err.message}</p></div></div></div>`;
        }
    });
}

function renderMemberCard(u) {
    return `
    <div class="card section-gap">
        <div class="card-header"><h3 class="card-title">Member Profile</h3></div>
        <div class="card-body">
            <div class="detail-header" style="margin-bottom:16px">
                <div class="detail-avatar">${initials(u.name)}</div>
                <div><div class="detail-name">${u.name}</div><div class="detail-phone">${u.phone}</div></div>
                <div style="margin-left:auto">${u.is_active ? '<span class="badge badge-success"><span class="badge-dot"></span>Active</span>' : '<span class="badge badge-danger"><span class="badge-dot"></span>Inactive</span>'}</div>
            </div>
            <div class="info-grid">
                <div class="info-item"><div class="info-label">Member ID</div><div class="info-value">${u.id}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${u.phone}</div></div>
                <div class="info-item"><div class="info-label">Join Date</div><div class="info-value">${formatDate(u.join_date)}</div></div>
                <div class="info-item"><div class="info-label">Role</div><div class="info-value">${u.is_admin?'Admin':'Member'}</div></div>
            </div>
        </div>
    </div>
    ${renderPaymentTable(u.payment_history, 'Payment History')}
    ${renderLoanTable(u.loan_history, 'Loan History')}`;
}

async function renderLoans() {
    const c = $('contentArea');
    try {
        const loans = await api.allLoans();
        const pending = loans.filter(l=>l.status==='pending').length;
        c.innerHTML = `
        <div class="section-header"><h2 class="section-title">${loans.length} Loans ${pending?`<span class="badge badge-warning" style="margin-left:8px"><span class="badge-dot"></span>${pending} Pending</span>`:''}</h2></div>
        <div class="card"><div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr>
                <th>ID</th><th>Member</th><th>Amount</th><th>Rate</th><th>EMIs</th><th>Status</th><th>Start</th><th>Action</th>
            </tr></thead><tbody>
            ${loans.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray-400)">No loans found</td></tr>' : loans.map(l=>`<tr>
                <td class="cell-primary">#${l.id}</td><td>${l.member_id}</td><td class="cell-primary">${formatCurrency(l.amount)}</td>
                <td>${l.interest_rate}%</td><td>${l.installments}</td>
                <td>${statusBadge(l.status)}</td><td>${formatDate(l.start_date)}</td>
                <td>${l.status==='pending'?`<button class="btn btn-success btn-sm" onclick="handleApproveLoan(${l.id})">${ICONS.check} Approve</button>`:'-'}</td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

async function handleApproveLoan(id) {
    if(!confirm('Approve this loan? This will create payment installments.')) return;
    try { await api.approveLoan(id); showToast('Loan approved successfully!','success'); renderLoans(); }
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
            ${statCard('Total Collection', formatCurrency(s.total_collection), 'All income', 'purple', ICONS.wallet)}
            ${statCard('Loans Disbursed', formatCurrency(s.total_loans_disbursed), `${st.total_loans_approved} loans`, 'red', ICONS.money)}
            ${statCard('Available Amount', formatCurrency(s.available_amount), 'Net balance', 'green', ICONS.wallet)}
        </div>
        <div class="card section-gap">
            <div class="card-header"><h3 class="card-title">Detailed Breakdown</h3></div>
            <div class="card-body">
                <div class="info-grid">
                    <div class="info-item"><div class="info-label">Total Contributions</div><div class="info-value">${formatCurrency(s.total_contributions)}</div></div>
                    <div class="info-item"><div class="info-label">Total EMI Collected</div><div class="info-value">${formatCurrency(s.total_emi_collected)}</div></div>
                    <div class="info-item"><div class="info-label">Contribution Penalties</div><div class="info-value">${formatCurrency(s.contribution_penalties)}</div></div>
                    <div class="info-item"><div class="info-label">EMI Penalties</div><div class="info-value">${formatCurrency(s.emi_penalties)}</div></div>
                    <div class="info-item"><div class="info-label">Total Penalties</div><div class="info-value">${formatCurrency(s.total_penalties)}</div></div>
                    <div class="info-item"><div class="info-label">Pending EMI Amount</div><div class="info-value">${formatCurrency(s.pending_emi_amount)}</div></div>
                </div>
            </div>
        </div>
        <div class="card section-gap">
            <div class="card-header"><h3 class="card-title">Statistics</h3></div>
            <div class="card-body">
                <div class="info-grid">
                    <div class="info-item"><div class="info-label">Total Contribution Payments</div><div class="info-value">${st.total_contribution_payments}</div></div>
                    <div class="info-item"><div class="info-label">Total EMI Payments</div><div class="info-value">${st.total_emi_payments}</div></div>
                    <div class="info-item"><div class="info-label">Total Loans Approved</div><div class="info-value">${st.total_loans_approved}</div></div>
                    <div class="info-item"><div class="info-label">Pending EMI Count</div><div class="info-value">${st.pending_emi_count}</div></div>
                    <div class="info-item"><div class="info-label">Members with Penalties</div><div class="info-value">${st.members_with_penalties}</div></div>
                </div>
            </div>
        </div>
        ${penalties.length > 0 ? `
        <div class="card">
            <div class="card-header"><h3 class="card-title">Members with Penalties</h3></div>
            <div class="card-body no-padding"><div class="table-wrapper">
                <table class="data-table"><thead><tr><th>Member</th><th>Phone</th><th>Total Penalty</th></tr></thead><tbody>
                ${penalties.map(p=>`<tr><td class="cell-primary">${p.name}</td><td class="cell-mono">${p.phone}</td><td class="cell-primary">${formatCurrency(p.total_penalty)}</td></tr>`).join('')}
                </tbody></table>
            </div></div>
        </div>` : ''}`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

function renderResetPassword() {
    $('contentArea').innerHTML = `
    <div class="card form-card"><div class="card-header"><h3 class="card-title">Reset Member Password</h3></div><div class="card-body">
        <form id="resetPwForm">
            <div class="form-group-content"><label>Member Phone Number</label><input class="form-input" type="tel" id="rpPhone" placeholder="Enter phone number" required></div>
            <div class="form-group-content"><label>New Password</label><input class="form-input" type="text" id="rpPassword" placeholder="Enter new password" required></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">Reset Password</button></div>
        </form>
    </div></div>`;
    $('resetPwForm').addEventListener('submit', async e => {
        e.preventDefault();
        try { await api.resetPassword({ phone:$('rpPhone').value.trim(), new_password:$('rpPassword').value }); showToast('Password reset!','success'); $('resetPwForm').reset(); }
        catch(err) { showToast(err.message,'error'); }
    });
}

function showCreateUserModal() {
    openModal('Add New Member', `
        <form id="createUserForm">
            <div class="form-group-content"><label>Full Name</label><input class="form-input" id="cuName" placeholder="Member name" required></div>
            <div class="form-group-content"><label>Phone Number</label><input class="form-input" type="tel" id="cuPhone" placeholder="Phone number" required></div>
            <div class="form-group-content"><label>Password</label><input class="form-input" id="cuPassword" placeholder="Initial password" required></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary btn-full">Create Member</button></div>
        </form>`);
    $('createUserForm').addEventListener('submit', async e => {
        e.preventDefault();
        try { await api.createUser({name:$('cuName').value.trim(),phone:$('cuPhone').value.trim(),password:$('cuPassword').value}); showToast('Member created!','success'); closeModal(); }
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
            ${statCard('Total Installments', installments.total_installments, `${installments.paid_count} paid`, 'purple', ICONS.installments)}
            ${statCard('Pending EMIs', installments.pending_count, installments.pending_count > 0 ? 'Due payments' : 'All clear!', 'amber', ICONS.clock)}
            ${statCard('Paid EMIs', installments.paid_count, 'Completed', 'green', ICONS.check)}
        </div>
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">My Profile</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">Name</div><div class="info-value">${profile.name}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${profile.username}</div></div>
                <div class="info-item"><div class="info-label">Role</div><div class="info-value">${profile.role}</div></div>
                <div class="info-item"><div class="info-label">Status</div><div class="info-value">${profile.is_active?'<span class="badge badge-success"><span class="badge-dot"></span>Active</span>':'<span class="badge badge-danger"><span class="badge-dot"></span>Inactive</span>'}</div></div>
            </div>
        </div></div>
        <div class="card"><div class="card-header"><h3 class="card-title">Quick Actions</h3></div><div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="navigate('applyLoan')">📝 Apply for Loan</button>
            <button class="btn btn-success" onclick="navigate('payContribution')">💵 Pay Contribution</button>
            <button class="btn btn-secondary" onclick="navigate('myInstallments')">📋 My Installments</button>
            <button class="btn btn-secondary" onclick="navigate('calculator')">🧮 EMI Calculator</button>
            <button class="btn btn-secondary" onclick="navigate('myEarnings')">📈 My Earnings</button>
        </div></div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

async function renderMyInstallments() {
    const c = $('contentArea');
    try {
        const data = await api.myInstallments();
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard('Total', data.total_installments, 'installments', 'purple', ICONS.installments)}
            ${statCard('Pending', data.pending_count, 'to pay', 'amber', ICONS.clock)}
            ${statCard('Paid', data.paid_count, 'completed', 'green', ICONS.check)}
        </div>
        ${data.pending_installments.length > 0 ? `
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">Pending Installments (${data.pending_count})</h3></div>
        <div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr><th>Description</th><th>Amount</th><th>Due Date</th><th>Action</th></tr></thead><tbody>
            ${data.pending_installments.map(i=>`<tr>
                <td>${i.description||'Loan Installment'}</td>
                <td class="cell-primary">${formatCurrency(i.total_pending_amount)}</td>
                <td>${formatDate(i.due_date)}</td>
                <td><button class="btn btn-success btn-sm" onclick="showPayInstallmentModal(${i.id}, ${i.total_pending_amount})">Pay Now</button></td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>` : '<div class="card section-gap"><div class="card-body"><div class="empty-state">' + ICONS.check + '<h3>No pending installments!</h3><p>All your EMIs are paid up.</p></div></div></div>'}
        ${data.paid_installments.length > 0 ? `
        <div class="card"><div class="card-header"><h3 class="card-title">Paid Installments (${data.paid_count})</h3></div>
        <div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr><th>Description</th><th>Amount</th><th>Paid On</th><th>Late</th><th>Penalty</th></tr></thead><tbody>
            ${data.paid_installments.map(i=>`<tr>
                <td>${i.description||'Loan Installment'}</td>
                <td class="cell-primary">${formatCurrency(i.total_loan_amount)}</td>
                <td>${formatDate(i.payment_date)}</td>
                <td>${i.days_late ? i.days_late + ' days' : '—'}</td>
                <td>${i.penalty_amount ? formatCurrency(i.penalty_amount) : '—'}</td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>` : ''}`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

function showPayInstallmentModal(id, amount) {
    openModal('Pay Installment', `
        <div style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px">
            <strong>Amount: ${formatCurrency(amount)}</strong><br>
            <span style="font-size:0.85rem;color:var(--gray-500)">Late payments may incur ₹10/day penalty</span>
        </div>
        <form id="payInstForm">
            <div class="form-group-content"><label>Payment Transaction ID</label>
                <input class="form-input" id="instTxn" placeholder="Enter UPI/bank transaction ID" required>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn-success btn-full">Confirm Payment</button></div>
        </form>`);
    $('payInstForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const r = await api.payInstallment(id, $('instTxn').value.trim());
            showToast('Installment paid!','success'); closeModal();
            openModal('Payment Success', `<div class="info-grid">
                <div class="info-item"><div class="info-label">Amount</div><div class="info-value">${formatCurrency(r.amount_paid)}</div></div>
                <div class="info-item"><div class="info-label">Penalty</div><div class="info-value">${formatCurrency(r.penalty_amount)}</div></div>
                <div class="info-item"><div class="info-label">Total Paid</div><div class="info-value">${formatCurrency(r.total_paid)}</div></div>
                <div class="info-item"><div class="info-label">Date</div><div class="info-value">${formatDate(r.payment_date)}</div></div>
            </div>`);
            renderMyInstallments();
        } catch(err) { showToast(err.message,'error'); }
    });
}

async function renderMyEarnings() {
    const c = $('contentArea');
    try {
        const data = await api.myEarnings();
        const e = data.earnings;
        const g = data.group_totals;
        const m = data.member_contribution;
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard('My Total Earnings', formatCurrency(e.total_earning), 'Your share of profits', 'green', ICONS.earnings)}
            ${statCard('Interest Share', formatCurrency(e.interest_share), 'From loan interest', 'purple', ICONS.money)}
            ${statCard('Penalty Share', formatCurrency(e.penalty_share), 'From late fees', 'amber', ICONS.alert)}
        </div>
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">Group Totals</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">Total Interest Earned</div><div class="info-value">${formatCurrency(g.total_interest_earned)}</div></div>
                <div class="info-item"><div class="info-label">Total Penalties Collected</div><div class="info-value">${formatCurrency(g.total_penalties_collected)}</div></div>
                <div class="info-item"><div class="info-label">Grand Total</div><div class="info-value">${formatCurrency(g.grand_total)}</div></div>
                <div class="info-item"><div class="info-label">Active Members</div><div class="info-value">${data.total_active_members}</div></div>
            </div>
        </div></div>
        <div class="card"><div class="card-header"><h3 class="card-title">My Contribution</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">Penalty Paid by Me</div><div class="info-value">${formatCurrency(m.penalty_paid_by_me)}</div></div>
            </div>
        </div></div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

function renderApplyLoan() {
    $('contentArea').innerHTML = `
    <div class="card form-card"><div class="card-header"><h3 class="card-title">Apply for a Loan</h3></div><div class="card-body">
        <form id="applyLoanForm">
            <div class="form-row">
                <div class="form-group-content"><label>Loan Amount (₹)</label><input class="form-input" type="number" id="alAmount" placeholder="e.g. 10000" min="1" required></div>
                <div class="form-group-content"><label>Interest Rate (%)</label><input class="form-input" type="number" id="alRate" value="2" step="0.1" min="0" required></div>
            </div>
            <div class="form-row">
                <div class="form-group-content"><label>Number of Installments</label><input class="form-input" type="number" id="alInstallments" placeholder="e.g. 6" min="1" required></div>
                <div class="form-group-content"><label>Description (optional)</label><input class="form-input" id="alDesc" placeholder="Purpose of loan"></div>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">Submit Application</button></div>
        </form>
    </div></div>`;
    $('applyLoanForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            await api.applyLoan({ amount:+$('alAmount').value, interest_rate:+$('alRate').value, installments:+$('alInstallments').value, description:$('alDesc').value||null });
            showToast('Loan application submitted!','success'); navigate('myInstallments');
        } catch(err) { showToast(err.message,'error'); }
    });
}

function renderCalculator() {
    $('contentArea').innerHTML = `
    <div class="card form-card" style="max-width:700px"><div class="card-header"><h3 class="card-title">EMI Calculator</h3></div><div class="card-body">
        <form id="calcForm">
            <div class="form-row">
                <div class="form-group-content"><label>Loan Amount (₹)</label><input class="form-input" type="number" id="calcAmt" placeholder="e.g. 10000" min="1" required></div>
                <div class="form-group-content"><label>Interest Rate (%/month)</label><input class="form-input" type="number" id="calcRate" value="2" step="0.1" min="0" required></div>
            </div>
            <div class="form-row">
                <div class="form-group-content"><label>Installments</label><input class="form-input" type="number" id="calcInst" value="6" min="1" required></div>
                <div class="form-group-content"><label>Start Date</label><input class="form-input" type="date" id="calcDate" value="${new Date().toISOString().split('T')[0]}" required></div>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">Calculate</button></div>
        </form>
        <div id="calcResult" style="margin-top:24px"></div>
    </div></div>`;
    $('calcForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const r = await api.calcLoan({ amount:$('calcAmt').value, rate:$('calcRate').value, installments:$('calcInst').value, start_date:$('calcDate').value });
            $('calcResult').innerHTML = `
            <div class="calc-result-grid">
                <div class="calc-result-item"><div class="info-label">Principal</div><div class="info-value">${formatCurrency(r.principal_amount)}</div></div>
                <div class="calc-result-item"><div class="info-label">Total Interest</div><div class="info-value">${formatCurrency(r.total_interest)}</div></div>
                <div class="calc-result-item"><div class="info-label">Total Payable</div><div class="info-value">${formatCurrency(r.total_amount)}</div></div>
                <div class="calc-result-item"><div class="info-label">Duration</div><div class="info-value">${r.installments} months</div></div>
            </div>
            <div class="card"><div class="card-header"><h3 class="card-title">Installment Breakdown</h3></div><div class="card-body no-padding"><div class="table-wrapper">
                <table class="data-table"><thead><tr><th>#</th><th>Due Date</th><th>Principal</th><th>Interest</th><th>EMI</th><th>Balance</th></tr></thead><tbody>
                ${r.installment_breakdown.map(i=>`<tr><td>${i.month}</td><td>${formatDate(i.due_date)}</td><td>${formatCurrency(i.principal)}</td><td>${formatCurrency(i.interest)}</td><td class="cell-primary">${formatCurrency(i.total_payment)}</td><td>${formatCurrency(i.remaining_balance)}</td></tr>`).join('')}
                </tbody></table>
            </div></div></div>`;
        } catch(err) { showToast(err.message,'error'); }
    });
}

function renderPayContribution() {
    $('contentArea').innerHTML = `
    <div class="card form-card"><div class="card-header"><h3 class="card-title">Pay Monthly Contribution</h3></div><div class="card-body">
        <div style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px">
            <strong>Monthly Contribution: ${formatCurrency(1000)}</strong><br>
            <span style="font-size:0.85rem;color:var(--gray-500)">Due on 10th of every month. ₹10/day penalty after 12th.</span>
        </div>
        <form id="contribForm">
            <div class="form-group-content"><label>Payment Transaction ID</label><input class="form-input" id="contribTxn" placeholder="Enter your payment transaction ID" required>
            <div class="form-help">Enter the UPI/bank transaction reference number</div></div>
            <div class="form-actions"><button type="submit" class="btn btn-success">Pay ₹1,000</button></div>
        </form>
    </div></div>`;
    $('contribForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const r = await api.payContribution($('contribTxn').value.trim());
            showToast('Contribution paid successfully!','success');
            openModal('Payment Successful', `
                <div class="info-grid">
                    <div class="info-item"><div class="info-label">Amount</div><div class="info-value">${formatCurrency(r.contribution_amount)}</div></div>
                    <div class="info-item"><div class="info-label">Penalty</div><div class="info-value">${formatCurrency(r.penalty_amount)}</div></div>
                    <div class="info-item"><div class="info-label">Total Paid</div><div class="info-value">${formatCurrency(r.total_paid)}</div></div>
                    <div class="info-item"><div class="info-label">Date</div><div class="info-value">${formatDate(r.payment_date)}</div></div>
                </div>`);
            $('contribForm').reset();
        } catch(err) { showToast(err.message,'error'); }
    });
}

// ---- Shared Render Helpers ----
function renderPaymentTable(payments, title) {
    if(!payments||!payments.length) return `<div class="card section-gap"><div class="card-header"><h3 class="card-title">${title}</h3></div><div class="card-body"><div class="empty-state">${ICONS.wallet}<h3>No payments yet</h3><p>Payment records will appear here.</p></div></div></div>`;
    return `<div class="card section-gap"><div class="card-header"><h3 class="card-title">${title} (${payments.length})</h3></div><div class="card-body no-padding"><div class="table-wrapper">
        <table class="data-table"><thead><tr><th>Type</th><th>Amount</th><th>Due</th><th>Paid</th><th>Late</th><th>Penalty</th><th>Status</th></tr></thead><tbody>
        ${payments.map(p=>`<tr>
            <td>${p.payment_type==='monthly_contribution'?'<span class="badge badge-info"><span class="badge-dot"></span>Contribution</span>':'<span class="badge badge-neutral"><span class="badge-dot"></span>Loan EMI</span>'}</td>
            <td class="cell-primary">${formatCurrency(p.total_pending_amount||p.total_loan_amount)}</td>
            <td>${formatDate(p.due_date)}</td>
            <td>${p.payment_date?formatDate(p.payment_date):'—'}</td>
            <td>${p.days_late?p.days_late+' days':'—'}</td>
            <td>${p.penalty_amount?formatCurrency(p.penalty_amount):'—'}</td>
            <td>${p.payment_date?'<span class="badge badge-success"><span class="badge-dot"></span>Paid</span>':'<span class="badge badge-warning"><span class="badge-dot"></span>Pending</span>'}</td>
        </tr>`).join('')}
        </tbody></table></div></div></div>`;
}

function renderLoanTable(loans, title) {
    if(!loans||!loans.length) return `<div class="card"><div class="card-header"><h3 class="card-title">${title}</h3></div><div class="card-body"><div class="empty-state">${ICONS.money}<h3>No loans yet</h3><p>Loan records will appear here.</p></div></div></div>`;
    return `<div class="card section-gap"><div class="card-header"><h3 class="card-title">${title} (${loans.length})</h3></div><div class="card-body no-padding"><div class="table-wrapper">
        <table class="data-table"><thead><tr><th>ID</th><th>Amount</th><th>Rate</th><th>EMIs</th><th>Status</th><th>Start</th><th>End</th></tr></thead><tbody>
        ${loans.map(l=>`<tr>
            <td class="cell-primary">#${l.id}</td><td class="cell-primary">${formatCurrency(l.amount)}</td><td>${l.interest_rate}%</td><td>${l.installments}</td>
            <td>${statusBadge(l.status)}</td><td>${formatDate(l.start_date)}</td><td>${formatDate(l.end_date)}</td>
        </tr>`).join('')}
        </tbody></table></div></div></div>`;
}

function statusBadge(s) {
    const m = { approved:'badge-success', pending:'badge-warning', rejected:'badge-danger', active:'badge-success' };
    return `<span class="badge ${m[s]||'badge-neutral'}"><span class="badge-dot"></span>${s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
}

function errorHTML(msg) {
    return `<div class="card"><div class="card-body"><div class="empty-state">${ICONS.alert}<h3>Something went wrong</h3><p>${msg}</p></div></div></div>`;
}
