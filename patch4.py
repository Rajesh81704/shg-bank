import re

with open('frontend/static/js/app.js', 'r') as f:
    code = f.read()

# 1. Update Dashboard Greeting
greeting_update = r"""    const name = state.user ? (state.user.name || state.user.username) : '';
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
    }"""
code = re.sub(r'    let subtitle = t\(\'page\.manage_shg\'\);.*?    const content = \$\(\'contentArea\'\);\n    content\.innerHTML = \'<div class="skeleton skeleton-card" style="height:200px;margin-bottom:16px"></div>\';', greeting_update, code, flags=re.DOTALL)


# 2. Update Members Page - Add 4 Buttons + Welcome Smiley
member_card_html = r"""function renderMemberCard(u) {
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
                <div style="margin-left:auto">${u.is_active ? \`<span class="badge badge-success"><span class="badge-dot"></span>${t('badge.active')}</span>\` : \`<span class="badge badge-danger"><span class="badge-dot"></span>${t('badge.inactive')}</span>\`}</div>
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
}"""

code = re.sub(r'function renderMemberCard\(u\) \{.*?\n\}', member_card_html, code, flags=re.DOTALL)

# Add Smiley to Render Members Header
members_header = r"""async function renderMembers() {
    const c = $('contentArea');
    const name = state.user ? (state.user.name || state.user.username) : '';
    c.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 20px;">😊 Welcome ${name}</div>
    <div class="section-header">"""
code = re.sub(r'async function renderMembers\(\) \{\s*const c = \$\(\'contentArea\'\);\s*c\.innerHTML = `\s*<div class="section-header">', members_header, code)


# 3. Use QR Code image in Pay Contribution
qr_replacement_html = r"""        <div style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px;text-align:center">
            <strong>Scan to Pay: ${formatCurrency(1000)}</strong><br>
            <span style="font-size:0.85rem;color:var(--gray-500)">Monthly Contribution</span>
            <div style="margin:20px auto; width: 170px; height: 170px; background: white; padding: 10px; border-radius: 8px;">
                <img src="/static/QRCode.png" alt="QR Code" style="width: 150px; height: 150px; border-radius: 4px;">
            </div>
            <p style="font-size:0.9rem; margin-top: 10px;">Scan using any UPI App</p>
        </div>"""
code = re.sub(r'        <div style="background:var\(--purple-50\);padding:16px;border-radius:var\(--radius-sm\);margin-bottom:20px;text-align:center">.*?</svg>\n            </div>\n            <p style="font-size:0\.9rem;">Scan using any UPI App</p>\n        </div>', qr_replacement_html, code, flags=re.DOTALL)


with open('frontend/static/js/app.js', 'w') as f:
    f.write(code)

print("Patch 4 completed")
