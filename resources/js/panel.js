import PipedriveAppSDK from '@pipedrive/app-extensions-sdk';

// No sdk.initialize() needed
const sdk = PipedriveAppSDK;

// Use context.observe directly
sdk.context.observe(context => {
    const email = context.person?.primary_email || context.deal?.person?.email;
    console.log('Lead email:', email);

    const container = document.getElementById('transactions');
    document.getElementById('lead-email').innerText = email || 'N/A';

    if (!email) {
        container.innerHTML = 'No email found for this lead.';
        return;
    }

    fetch('/api/stripe_data?email=' + encodeURIComponent(email))
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                container.innerHTML = '<p style="color:red;">' + data.error + '</p>';
                return;
            }

            let html = '<table><tr><th>ID</th><th>Amount</th><th>Status</th><th>Date</th><th>Receipt</th></tr>';
            (data.invoices || []).forEach(inv => {
                html += `<tr>
                    <td>${inv.id}</td>
                    <td>${inv.amount}</td>
                    <td>${inv.status}</td>
                    <td>${inv.date}</td>
                    <td>${inv.receipt_url ? '<a href="'+inv.receipt_url+'" target="_blank">View</a>' : ''}</td>
                </tr>`;
            });
            html += '</table>';
            container.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = 'Error fetching transactions';
        });
});