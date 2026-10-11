/**
 * GhostRunner Demo Store — server.js
 *
 * REVISION env var controls the app's behaviour for the demo:
 *
 *   (unset / "a") — INITIAL STATE
 *     The checkout button has id="checkout-btn" and label "Checkout".
 *     The checkout API works and returns an order ID.
 *     GhostRunner test passes ✅
 *
 *   REVISION=b — LOCATOR DRIFT (simulate a UI refactor)
 *     Button renamed to "Place Order", id changed to "place-order-btn".
 *     API still works — but GhostRunner's test selector breaks.
 *     GhostRunner detects the drift, self-heals, re-runs ✅
 *
 *   REVISION=c — API FAILURE (simulate a backend regression)
 *     Button is back to "Checkout" but /api/checkout returns 500.
 *     GhostRunner classifies as BACKEND_ERROR, raises repair proposal.
 *
 * Usage:
 *   node server.js               (initial state — revision a)
 *   REVISION=b node server.js   (locator drift)
 *   REVISION=c node server.js   (API failure)
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const REVISION = (process.env.REVISION || 'a').toLowerCase();

app.use(express.json());

// ── /api/checkout ─────────────────────────────────────────────────────────────

app.post('/api/checkout', (req, res) => {
  if (REVISION === 'c') {
    // Simulate a payment gateway outage
    return res.status(500).json({
      error: 'Payment gateway unavailable',
      code: 'PAYMENT_GATEWAY_DOWN',
    });
  }
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  res.json({ success: true, orderId, message: 'Order confirmed!' });
});

// ── /health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', revision: REVISION, port: PORT })
);

// ── / (main page) ─────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  // Revision B simulates a frontend refactor where the button ID and label changed
  const buttonId    = REVISION === 'b' ? 'place-order-btn'  : 'checkout-btn';
  const buttonLabel = REVISION === 'b' ? 'Place Order'       : 'Checkout';
  const revisionBadge = {
    a: { label: 'v1.0 — Initial',          color: '#22c55e' },
    b: { label: 'v1.1 — UI Refactor 🔥',   color: '#f59e0b' },
    c: { label: 'v1.2 — Backend Bug 💥',   color: '#ef4444' },
  }[REVISION] || { label: 'Unknown', color: '#6b7280' };

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GhostRunner Demo Store</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 40px;
      width: 100%;
      max-width: 480px;
    }
    .store-logo {
      font-size: 28px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .revision-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      background: ${revisionBadge.color};
      margin-bottom: 28px;
    }
    .product {
      display: flex;
      align-items: center;
      gap: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .product-icon {
      font-size: 40px;
      line-height: 1;
    }
    .product-name { font-weight: 600; color: #1e293b; }
    .product-price { font-size: 20px; font-weight: 700; color: #7c3aed; margin-top: 4px; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 18px;
      color: #1e293b;
      margin-bottom: 24px;
    }
    #checkout-btn, #place-order-btn {
      width: 100%;
      padding: 14px;
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    #checkout-btn:hover, #place-order-btn:hover { background: #6d28d9; }
    #checkout-btn:disabled, #place-order-btn:disabled {
      background: #a5b4fc;
      cursor: not-allowed;
    }
    #status {
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      display: none;
    }
    #status.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    #status.error   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .order-id { font-family: monospace; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="store-logo">🛒 Demo Store</div>
    <div class="revision-badge">${revisionBadge.label}</div>

    <div class="product">
      <div class="product-icon">📦</div>
      <div>
        <div class="product-name">Widget Pro</div>
        <div class="product-price">$29.99</div>
      </div>
    </div>

    <hr class="divider">
    <div class="total-row">
      <span>Total</span>
      <span>$29.99</span>
    </div>

    <button id="${buttonId}">${buttonLabel}</button>
    <div id="status"></div>
  </div>

  <script>
    const btn    = document.getElementById('${buttonId}');
    const status = document.getElementById('status');

    btn.addEventListener('click', async () => {
      btn.disabled    = true;
      btn.textContent = 'Processing…';
      status.style.display = 'none';

      try {
        const resp = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartId: 'cart-demo-001', items: [{ sku: 'widget-pro', qty: 1 }] }),
        });
        const data = await resp.json();

        if (resp.ok && data.success) {
          status.className = 'success';
          status.innerHTML = '✅ Order confirmed! ID: <span class="order-id">' + data.orderId + '</span>';
        } else {
          status.className = 'error';
          status.textContent = '❌ Checkout failed: ' + (data.error || 'Unknown error');
        }
      } catch (err) {
        status.className = 'error';
        status.textContent = '❌ Network error: ' + err.message;
      }

      status.style.display = 'block';
      btn.disabled    = false;
      btn.textContent = '${buttonLabel}';
    });
  </script>
</body>
</html>`);
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🛒 GhostRunner Demo Store`);
  console.log(`   Revision : ${REVISION.toUpperCase()}`);
  console.log(`   URL      : http://localhost:${PORT}`);
  console.log(`   Health   : http://localhost:${PORT}/health\n`);
});

module.exports = app;
