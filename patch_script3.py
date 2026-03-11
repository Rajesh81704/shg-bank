import re

with open('frontend/static/js/app.js', 'r') as f:
    code = f.read()

# 1. Split renderLoans into Active and Pending Loans tables
new_loans_html = r"""async function renderLoans() {
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
}"""

code = re.sub(r'async function renderLoans\(\) \{.*?\n\}', new_loans_html, code, flags=re.DOTALL)


# 2. renderApplyLoan with EMI Calculator
new_apply_html = r"""function renderApplyLoan() {
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
}"""

code = re.sub(r'function renderApplyLoan\(\) \{.*?\n\}', new_apply_html, code, count=1, flags=re.DOTALL)

with open('frontend/static/js/app.js', 'w') as f:
    f.write(code)
print("Patch 3 done")
