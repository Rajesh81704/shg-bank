/* ============================================================
   SHG BANK SYSTEM — Application Logic
   ============================================================ */

const API = '/api';
const state = { token: localStorage.getItem('token'), user: null, view: 'dashboard' };

// ---- Icons ----
const ICONS = {
    dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    members: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    loans: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    calculator: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',
    payments: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    contribution: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    resetPw: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    apply: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
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

// ---- API Layer ----
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
    login: (phone, pw) => { const f = new URLSearchParams(); f.append('username',phone); f.append('password',pw); return fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:f}); },
    profile: () => apiFetch(`${API}/user/profile`),
    myDetails: () => apiFetch(`${API}/user/my-details`),
    allUsers: () => apiFetch('/all-users'),
    dashStats: () => apiFetch('/dashboard-stats'),
    createUser: d => apiFetch('/create-user', { method:'POST', json:d }),
    resetPassword: d => apiFetch('/reset-password', { method:'POST', json:d }),
    allLoans: () => apiFetch('/all-loans'),
    approveLoan: id => apiFetch(`/approve-loan/${id}`, { method:'POST' }),
    userDetails: phone => apiFetch(`/user_details/${phone}`),
    applyLoan: d => apiFetch(`${API}/user/apply-loan`, { method:'POST', json:d }),
    calcLoan: p => apiFetch(`${API}/user/loan_calculator?amount=${p.amount}&interest_rate=${p.rate}&installments=${p.installments}&start_date=${p.start_date}`),
    payContribution: txn => apiFetch(`${API}/user/pay_monthly_contribution?payment_transaction_id=${txn}`, { method:'POST' }),
};

// ---- Navigation Config ----
const adminNav = [
    { id:'dashboard', label:'Dashboard', icon:'dashboard' },
    { id:'members', label:'Members', icon:'members' },
    { id:'loans', label:'Loans', icon:'loans' },
    { id:'resetPassword', label:'Reset Password', icon:'resetPw' },
];
const userNav = [
    { id:'dashboard', label:'Dashboard', icon:'dashboard' },
    { id:'myPayments', label:'My Payments', icon:'payments' },
    { id:'myLoans', label:'My Loans', icon:'loans' },
    { id:'applyLoan', label:'Apply for Loan', icon:'apply' },
    { id:'calculator', label:'EMI Calculator', icon:'calculator' },
    { id:'payContribution', label:'Pay Contribution', icon:'contribution' },
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
    const titles = { dashboard:'Dashboard', members:'Members', loans:'Loans', resetPassword:'Reset Password',
        myPayments:'My Payments', myLoans:'My Loans', applyLoan:'Apply for Loan', calculator:'EMI Calculator',
        payContribution:'Pay Contribution', memberDetail:'Member Details' };
    $('pageTitle').textContent = titles[view] || 'Dashboard';
    $('pageSubtitle').textContent = view === 'dashboard' ? 'Welcome back!' : 'Manage your SHG banking';

    const content = $('contentArea');
    content.innerHTML = '<div class="skeleton skeleton-card" style="height:200px;margin-bottom:16px"></div>';

    const isAdmin = state.user.role === 'admin';
    const views = {
        dashboard: isAdmin ? renderAdminDashboard : renderUserDashboard,
        members: renderMembers, loans: renderLoans, resetPassword: renderResetPassword,
        myPayments: renderMyPayments, myLoans: renderMyLoans, applyLoan: renderApplyLoan,
        calculator: renderCalculator, payContribution: renderPayContribution,
        memberDetail: () => renderMemberDetail(data),
    };
    (views[view] || views.dashboard)();
}

// ============================================================
// ADMIN VIEWS
// ============================================================
async function renderAdminDashboard() {
    const c = $('contentArea');
    try {
        const stats = await api.dashStats();
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard('Total Members', stats.total_members, `${stats.active_members} active`, 'purple', ICONS.users)}
            ${statCard('Active Loans', stats.approved_loans, formatCurrency(stats.total_loan_amount)+' disbursed', 'green', ICONS.money)}
            ${statCard('Pending Loans', stats.pending_loans, 'Awaiting approval', 'amber', ICONS.clock)}
            ${statCard('Contributions', stats.total_contributions, formatCurrency(stats.total_contribution_amount)+' collected', 'blue', ICONS.wallet)}
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-title">Quick Actions</h3></div>
            <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
                <button class="btn btn-primary" onclick="navigate('members')">👥 View Members</button>
                <button class="btn btn-success" onclick="showCreateUserModal()">➕ Add Member</button>
                <button class="btn btn-secondary" onclick="navigate('loans')">💰 Manage Loans</button>
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
    try {
        const users = await api.allUsers();
        c.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">${users.length} Members</h2>
            <button class="btn btn-primary btn-sm" onclick="showCreateUserModal()">+ Add Member</button>
        </div>
        <div class="card"><div class="card-body no-padding"><div class="table-wrapper">
            <table class="data-table"><thead><tr>
                <th>Member</th><th>Phone</th><th>Joined</th><th>Role</th><th>Status</th><th>Action</th>
            </tr></thead><tbody>
            ${users.map(u => `<tr>
                <td><div class="user-cell"><div class="user-avatar ${getAvatarClass(u.id)}">${initials(u.name)}</div><div class="user-cell-info"><span class="user-cell-name">${u.name}</span><span class="user-cell-sub">ID: ${u.id}</span></div></div></td>
                <td class="cell-mono">${u.phone}</td>
                <td>${formatDate(u.join_date)}</td>
                <td>${u.is_admin ? '<span class="badge badge-info"><span class="badge-dot"></span>Admin</span>' : '<span class="badge badge-neutral"><span class="badge-dot"></span>Member</span>'}</td>
                <td>${u.is_active ? '<span class="badge badge-success"><span class="badge-dot"></span>Active</span>' : '<span class="badge badge-danger"><span class="badge-dot"></span>Inactive</span>'}</td>
                <td><div class="action-btns"><button class="action-btn action-btn-view" title="View Details" onclick="navigate('memberDetail','${u.phone}')">${ICONS.eye}</button></div></td>
            </tr>`).join('')}
            </tbody></table>
        </div></div></div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

async function renderMemberDetail(phone) {
    const c = $('contentArea');
    try {
        const u = await api.userDetails(phone);
        c.innerHTML = `
        <button class="back-btn" onclick="navigate('members')">${ICONS.back} Back to Members</button>
        <div class="detail-header">
            <div class="detail-avatar">${initials(u.name)}</div>
            <div><div class="detail-name">${u.name}</div><div class="detail-phone">${u.phone}</div></div>
            <div style="margin-left:auto">${u.is_active ? '<span class="badge badge-success"><span class="badge-dot"></span>Active</span>' : '<span class="badge badge-danger"><span class="badge-dot"></span>Inactive</span>'}</div>
        </div>
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">Profile Information</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">Member ID</div><div class="info-value">${u.id}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${u.phone}</div></div>
                <div class="info-item"><div class="info-label">Join Date</div><div class="info-value">${formatDate(u.join_date)}</div></div>
                <div class="info-item"><div class="info-label">Role</div><div class="info-value">${u.is_admin?'Admin':'Member'}</div></div>
            </div>
        </div></div>
        ${renderPaymentTable(u.payment_history, 'Payment History')}
        ${renderLoanTable(u.loan_history, 'Loan History')}`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
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
            ${loans.map(l=>`<tr>
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
        try { await api.createUser({name:$('cuName').value.trim(),phone:$('cuPhone').value.trim(),password:$('cuPassword').value}); showToast('Member created!','success'); closeModal(); if(state.view==='members') renderMembers(); }
        catch(err) { showToast(err.message,'error'); }
    });
}

// ============================================================
// USER VIEWS
// ============================================================
async function renderUserDashboard() {
    const c = $('contentArea');
    try {
        const d = await api.myDetails();
        const paidPayments = d.payment_history.filter(p=>p.payment_date);
        const activeLoans = d.loan_history.filter(l=>l.status==='approved');
        const pendingInstallments = d.payment_history.filter(p=>!p.payment_date && p.payment_type==='loan_installment');
        c.innerHTML = `
        <div class="stats-grid">
            ${statCard('Total Payments', paidPayments.length, 'payments made', 'purple', ICONS.wallet)}
            ${statCard('Active Loans', activeLoans.length, activeLoans.length?formatCurrency(activeLoans.reduce((s,l)=>s+l.amount,0)):'No active loans', 'green', ICONS.money)}
            ${statCard('Pending EMIs', pendingInstallments.length, pendingInstallments.length?formatCurrency(pendingInstallments.reduce((s,p)=>s+p.total_pending_amount,0))+' due':'All clear!', 'amber', ICONS.clock)}
        </div>
        <div class="card section-gap"><div class="card-header"><h3 class="card-title">My Profile</h3></div><div class="card-body">
            <div class="info-grid">
                <div class="info-item"><div class="info-label">Name</div><div class="info-value">${d.name}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${d.phone}</div></div>
                <div class="info-item"><div class="info-label">Member Since</div><div class="info-value">${formatDate(d.join_date)}</div></div>
                <div class="info-item"><div class="info-label">Status</div><div class="info-value">${d.is_active?'<span class="badge badge-success"><span class="badge-dot"></span>Active</span>':'<span class="badge badge-danger"><span class="badge-dot"></span>Inactive</span>'}</div></div>
            </div>
        </div></div>
        <div class="card"><div class="card-header"><h3 class="card-title">Quick Actions</h3></div><div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="navigate('applyLoan')">📝 Apply for Loan</button>
            <button class="btn btn-success" onclick="navigate('payContribution')">💵 Pay Contribution</button>
            <button class="btn btn-secondary" onclick="navigate('calculator')">🧮 EMI Calculator</button>
        </div></div>`;
    } catch(e) { c.innerHTML = errorHTML(e.message); }
}

async function renderMyPayments() {
    const c = $('contentArea');
    try { const d = await api.myDetails(); c.innerHTML = renderPaymentTable(d.payment_history, 'My Payment History'); }
    catch(e) { c.innerHTML = errorHTML(e.message); }
}

async function renderMyLoans() {
    const c = $('contentArea');
    try { const d = await api.myDetails(); c.innerHTML = renderLoanTable(d.loan_history, 'My Loan History'); }
    catch(e) { c.innerHTML = errorHTML(e.message); }
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
            showToast('Loan application submitted!','success'); navigate('myLoans');
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
        <div style="background:var(--primary-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px">
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
    if(!payments||!payments.length) return `<div class="card"><div class="card-header"><h3 class="card-title">${title}</h3></div><div class="card-body"><div class="empty-state">${ICONS.wallet}<h3>No payments yet</h3><p>Payment records will appear here.</p></div></div></div>`;
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
