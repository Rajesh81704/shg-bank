import re

with open('frontend/static/js/app.js', 'r') as f:
    code = f.read()

# 1. API fetch replacements
apis_new = """    memberEarnings: phone => apiFetch('/member-earnings/' + phone),
    toggleEmiStatus: id => apiFetch('/toggle-emi-status/' + id, {method:'PUT'}),
    deleteLoan: id => apiFetch('/delete-loan/' + id, {method:'DELETE'}),
    emiAlert: () => apiFetch('/api/user/emi_alert'),
    memberInstallments: phone => apiFetch('/member-installments/' + phone),
};"""
code = code.replace('};', apis_new, 1)

# 2. Dynamic dashboard greeting
greeting_logic = """    let subtitle = t('page.manage_shg');
    if (view === 'dashboard') {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const name = state.user ? (state.user.name || state.user.username) : '';
        subtitle = `${timeGreeting} ${name}`;
    }
    $('pageSubtitle').textContent = subtitle;"""
code = re.sub(r"\$\('pageSubtitle'\)\.textContent = view === 'dashboard' \? t\('page.welcome_back'\) : t\('page.manage_shg'\);", greeting_logic, code)

# 3. QR Code for payment
qr_code_html = """        <div style="background:var(--purple-50);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px;text-align:center">
            <strong>Scan to Pay: ${formatCurrency(1000)}</strong><br>
            <span style="font-size:0.85rem;color:var(--gray-500)">Monthly Contribution</span>
            <div style="margin:20px auto; width: 150px; height: 150px; background: white; padding: 10px; border-radius: 8px;">
                <!-- Dummy QR Code -->
                <svg width="130" height="130" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4zm-2 15h2v2h-2v-2zm-3-3h2v4h-2v-4zm7 0h2v4h-2v-4zm-8-3h2v2h-2v-2zm4 0h2v4h-2v-4zm4-4h4v2h-4v-2zm-9-4h2v2H7V9zm-3 4h2v2H4v-2zm14 0h2v2h-2v-2zm-3 4h2v4h-2v-4zm-4-4h2v2h-2v-2zM3 3v6h6V3H3zm2 2h2v2H5V5zm12-2v6h6V3h-6zm2 2h2v2h-2V5zM3 15v6h6v-6H3zm2 2h2v2H5v-2z"/>
                </svg>
            </div>
            <p style="font-size:0.9rem;">Scan using any UPI App</p>
        </div>
        <form id="contribForm">
            <div class="form-group-content"><label>Or enter Transaction ID manually (if testing)</label><input class="form-input" id="contribTxn" placeholder="Enter transaction ID" value="QR_SCANNED_TXN_01" required></div>
            <div class="form-actions"><button type="submit" class="btn btn-success">Confirm Payment</button></div>
        </form>"""
code = re.sub(r'        <form id="contribForm">.*?</form>', qr_code_html, code, flags=re.DOTALL)

# 4. Remove Start Date from Calculator
calc_row_2 = """            <div class="form-row">
                <div class="form-group-content"><label>Installments</label><input class="form-input" type="number" id="calcInst" value="6" min="1" required></div>
            </div>"""
code = re.sub(r'<div class="form-row">\s*<div class="form-group-content"><label>Installments.*?</label>.*?</div>\s*<div class="form-group-content"><label>Start Date.*?</label>.*?</div>\s*</div>', calc_row_2, code, flags=re.DOTALL)
code = re.sub(r'start_date:\s*\$\(\'calcDate\'\)\.value', 'start_date: new Date().toISOString().split(\'T\')[0]', code)

# Write back
with open('frontend/static/js/app.js', 'w') as f:
    f.write(code)

print("Patch 1 done")
