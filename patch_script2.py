import re

with open('frontend/static/js/app.js', 'r') as f:
    code = f.read()

# Member Search UI
member_search_logic = """    $('memberSearchForm').addEventListener('submit', async e => {
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
    });"""

code = re.sub(r"\$\('memberSearchForm'\)\.addEventListener\('submit', async e => \{.*?\n    \}\);", member_search_logic, code, flags=re.DOTALL)

member_card_html = """function renderMemberCard(u) {
    let earnHtml = '';
    if(u.earnings) {
        let e = u.earnings.earnings || {interest_share:0, penalty_share:0};
        let subA = e.interest_share || 0;
        let subB = e.penalty_share || 0;
        let subAB = subA + subB;
        
        let allKisht = u.payment_history.reduce((acc, p) => p.payment_date ? acc + (p.total_loan_amount || p.total_pending_amount || 0) : acc, 0);
        let grandTotal = allKisht + subAB;
        
        earnHtml = `
        <div class="stats-grid" style="margin-top:20px; margin-bottom: 20px;">
            <div class="stat-card"><div class="stat-info"><div class="stat-label">Earning from Interest (A)</div><div class="stat-value">${formatCurrency(subA)}</div></div></div>
            <div class="stat-card"><div class="stat-info"><div class="stat-label">Earning from Penalty (B)</div><div class="stat-value">${formatCurrency(subB)}</div></div></div>
            <div class="stat-card"><div class="stat-info"><div class="stat-label">Sub Total (A+B)</div><div class="stat-value">${formatCurrency(subAB)}</div></div></div>
            <div class="stat-card"><div class="stat-info"><div class="stat-label">Grand Total (All Kisht+A+B)</div><div class="stat-value">${formatCurrency(grandTotal)}</div></div></div>
        </div>`;
    }

    return `
    <div style="font-size:24px; margin-bottom:10px;">😊 Welcome ${u.name}</div>
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

# Write back
with open('frontend/static/js/app.js', 'w') as f:
    f.write(code)

print("Patch 2 done")
