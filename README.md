# GhostRunner Demo Store 🛒

A minimal Express.js e-commerce app built to demonstrate **GhostRunner** — the AI-powered self-healing test runner.

## What This Repo Does

This app has **3 revisions** controlled by the `REVISION` environment variable, each designed to trigger a different GhostRunner scenario:

| Revision | How to run | What it does | GhostRunner result |
|----------|-----------|-------------|-------------------|
| **A** (initial) | `node server.js` | Working app. Button: `#checkout-btn` → "Checkout" | ✅ Test passes |
| **B** (UI drift) | `REVISION=b node server.js` | Button renamed → `#place-order-btn` "Place Order". API still works. | ⚠️ Test fails (LOCATOR_DRIFT) → GhostRunner self-heals |
| **C** (API bug) | `REVISION=c node server.js` | Button back but `/api/checkout` returns `500` | ❌ Test fails (BACKEND_ERROR) → GhostRunner raises repair proposal |

## Quick Start

```bash
npm install
node server.js          # Revision A — starts on http://localhost:3001
```

## The GhostRunner Demo Flow

### Step 1 — Connect & Test (Revision A)
1. Upload this repo to GitHub
2. Connect it to GhostRunner
3. GhostRunner creates a test:
   - Navigate to `http://localhost:3001`
   - Click `#checkout-btn` ("Checkout")
   - Assert: page shows `✅ Order confirmed`
4. **Result:** Test passes ✅

### Step 2 — Introduce UI Drift (Revision B)
Switch to revision B (simulates a Tailwind/CSS refactor that renamed the button):
```bash
REVISION=b node server.js
```
Or commit the change to trigger GhostRunner via GitHub push.

GhostRunner will:
- Detect selector `#checkout-btn` is missing
- Classify as **LOCATOR_DRIFT** (87% confidence)
- Find the new button via semantic matching (`role=button, name="Place Order"`)
- Generate a **Repair Proposal** to update the test
- Re-run with the healed selector → ✅ passes

### Step 3 — Introduce API Failure (Revision C)
```bash
REVISION=c node server.js
```

GhostRunner will:
- Click the button successfully (selector is correct)
- API returns `500 PAYMENT_GATEWAY_DOWN`
- Classify as **BACKEND_ERROR**
- Mark run as failed, escalate to your team

## API

```
GET  /          → Store homepage (HTML)
POST /api/checkout { cartId, items } → { success, orderId } or 500
GET  /health    → { status, revision, port }
```

---

Built for the **GhostRunner** demo — [ghostrunner.dev](https://ghostrunner.dev)
