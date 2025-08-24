<!DOCTYPE html>
<html>
<head>
  <title>Transactions Panel</title>
  <script src="https://cdn.jsdelivr.net/npm/@pipedrive/app-extensions-sdk@0/dist/index.umd.js"></script>
  <style>
    .header-container {
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 100;
      padding: 10px 20px;
      border-bottom: 1px solid #ddd;
    }
    body { font-family: 'Poppins', sans-serif; }
    .tabs {
      display: flex;
      gap: 10px;
      background: #fff;
      position: sticky;
      top: 80px;
      z-index: 99;
      padding: 10px 20px;
      border-bottom: 1px solid #ddd;
    }
    .tab-btn {
      padding: 10px 20px;
      border: none;
      border-bottom: 3px solid transparent;
      background: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s;
    }
    .tab-btn.active { border-color: #007bff; color: #007bff; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .flex-container { display: flex; flex-wrap: wrap; gap: 20px; }
    .card {
      border: 1px solid #ddd; 
      padding: 20px; 
      border-radius: 12px; 
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      width: 280px;
      background-color: #fff;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-bottom: 10px;
    }
    .card:hover { transform: translateY(-5px); box-shadow: 0 6px 15px rgba(0,0,0,0.12); }
    .btn { 
      margin-top:10px;
      background-color: #007bff;
      color: white;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size:14px;
      transition: background-color 0.2s;
    }
    .btn:hover { background-color: #0056b3; }
  </style>
</head>
<body>
  <div class="header-container">
    <h4>Transactions for <span id="lead-email">...</span></h4>
  </div>


  <div class="tabs">
    <button id="invoicesTabBtn" class="tab-btn active">Invoices</button>
    <button id="transactionsTabBtn" class="tab-btn">Transactions</button>
  </div>

  <div id="transactions">Loading...</div>

<script>
(async function() {
    if (!window.AppExtensionsSDK) {
        console.error('SDK not loaded!');
        return;
    }

    const sdk = await new AppExtensionsSDK().initialize();
    const urlParams = new URLSearchParams(window.location.search);
    const resource = urlParams.get('resource'); 
    const selectedId = urlParams.get('selectedIds');
    const context = await sdk.execute('get_metadata'); 

    const ACCESS_TOKEN = "{{ $accesstoken }}";

    if (!ACCESS_TOKEN) {
        document.getElementById('transactions').innerText = 'No API token found for this domain.';
        return;
    }

    const email = context.person?.primary_email || context.deal?.person?.email;
    document.getElementById('lead-email').innerText = email || 'N/A';

    let apiUrl = resource === 'deal'
        ? `https://api.pipedrive.com/v1/deals/${selectedId}`
        : `https://api.pipedrive.com/v1/persons/${selectedId}`;

    fetch(apiUrl,{
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`  // OAuth token here
        }
    })
    .then(res => res.json())
    .then(data => {
        let email = resource === 'deal'
            ? data.data?.person_id?.email?.[0]?.value || ''
            : data.data?.email?.[0]?.value || '';
        document.getElementById('lead-email').innerText = email || 'N/A';

        fetch('https://662c929dba48.ngrok-free.app/stripe_data?email=' + encodeURIComponent(email))
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('transactions').innerHTML = '<p style="color:red;">'+data.error+'</p>';
                return;
            }

            let html = '';

            html += `<div id="invoicesTab" class="tab-content active">`;
            html += `<h3>Invoices (${data.invoices.length})</h3>`;
            html += `<div class="flex-container">`;
            (data.invoices || []).forEach(inv => {
                const dueDate = new Date(inv.due_date * 1000).toLocaleString();
                html += `<div class="card">
                    <p style="font-weight:600;">Invoice #${inv.number}</p>
                    <p>Amount: $${(inv.subtotal / 100).toFixed(2)}</p>
                    <p>Status: <span style="color:${inv.status === 'paid' ? 'green' : inv.status === 'unpaid' ? 'red' : 'orange'}">${inv.status}</span></p>
                    <p>Customer: ${inv.customer}</p>
                    <p>Date: ${dueDate}</p>
                    <button class="btn" onclick="window.open('${inv.hosted_invoice_url}', '_blank')"> ${inv.status === 'paid' ? 'View Receipt' : 'View Invoice Payment Page'}</button>
                </div>`;
            });
            html += `</div></div>`;

            html += `<div id="transactionsTab" class="tab-content">`;
            html += `<h3>Transactions (${data.charges.length})</h3>`;
            html += `<div class="flex-container">`;
            (data.charges || []).forEach(inv => {
                const created = new Date(inv.created * 1000).toLocaleString();
                html += `<div class="card">
                    <p style="font-weight:600;">Charge #${inv.id}</p>
                    <p>Amount: $${(inv.amount / 100).toFixed(2)}</p>
                    <p>Status: <span style="color:${inv.status === 'succeeded' ? 'green' : 'red'}">${inv.status}</span></p>
                    <p>Customer: ${inv.customer}</p>
                    <p>Date: ${created}</p>
                </div>`;
            });
            html += `</div></div>`;

            document.getElementById('transactions').innerHTML = html;

            document.getElementById('invoicesTabBtn').addEventListener('click', () => {
                document.getElementById('invoicesTab').classList.add('active');
                document.getElementById('transactionsTab').classList.remove('active');
                document.getElementById('invoicesTabBtn').classList.add('active');
                document.getElementById('transactionsTabBtn').classList.remove('active');
            });

            document.getElementById('transactionsTabBtn').addEventListener('click', () => {
                document.getElementById('transactionsTab').classList.add('active');
                document.getElementById('invoicesTab').classList.remove('active');
                document.getElementById('transactionsTabBtn').classList.add('active');
                document.getElementById('invoicesTabBtn').classList.remove('active');
            });

        }).catch(err => {
            console.error(err);
            document.getElementById('transactions').innerHTML = 'Error fetching transactions';
        });
    });

})();
</script>
</body>
</html>