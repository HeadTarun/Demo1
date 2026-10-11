# GhostRunner Demo — Step-by-Step Guide

## What This Demo Proves

> "GhostRunner connects to your GitHub repo, understands your app,
> generates tests from intent, and **self-heals** when your UI changes — zero manual effort."

---

## The Demo App: `ghostrunner-demo-store`

A minimal Node.js/Express checkout page with 3 built-in states:

| State | How | What breaks | GhostRunner shows |
|-------|-----|------------|-------------------|
| **A — Initial** | `node server.js` | Nothing | Test created & passes ✅ |
| **B — UI Drift** | `REVISION=b node server.js` | Button id + label renamed | LOCATOR_DRIFT → self-heals |
| **C — API Bug** | `REVISION=c node server.js` | `/api/checkout` → 500 | BACKEND_ERROR → repair proposal |

---

## Setup (One Time)

```bash
# Clone the demo repo you uploaded to GitHub
git clone https://github.com/YOUR_USERNAME/ghostrunner-demo-store
cd ghostrunner-demo-store
npm install
node server.js     # runs on http://localhost:3001
```

---

## Demo Flow (Live Walkthrough)

### STEP 1 — Connect Repo to GhostRunner

1. Open GhostRunner → **Projects** → **New Project** → name it `"Demo Store"`
2. In the project detail page click **"Connect GitHub"**
3. Authorize GhostRunner GitHub App → select `ghostrunner-demo-store` repo
4. Pick branch: `main`
5. GhostRunner shows: **"Repository connected ✅"**

---

### STEP 2 — Create a Test (Natural Language)

In GhostRunner → **New Test Definition**:

```
Name: Checkout Flow
Intent: User visits the store homepage, clicks the Checkout button,
        and sees an order confirmation message with an order ID.
```

GhostRunner generates the action plan:
```json
[
  { "action": "navigate", "target": { "url": "http://localhost:3001" } },
  { "action": "click",    "target": { "selector": "#checkout-btn" } },
  { "action": "assert",   "target": { "selector": "#status.success" }, "expected": "Order confirmed" }
]
```

Click **"Run Test"** — GhostRunner triggers the Playwright runner.

**Result → PASSED ✅**
> "All 3 steps executed cleanly. Selector #checkout-btn found. Order confirmed message visible."

---

### STEP 3 — Introduce UI Drift (The Money Shot)

Simulate a frontend refactor. In terminal:

```bash
# Revision B: button renamed from "Checkout" (#checkout-btn)
#             to "Place Order" (#place-order-btn)
REVISION=b node server.js
```

**OR** commit it to GitHub to trigger the webhook:
```bash
# Edit server.js — change REVISION default to 'b'
git add server.js
git commit -m "refactor: rename checkout button for new design system"
git push
```

GhostRunner receives the push webhook → auto-triggers the test run.

**Result → FAILED ⚠️**
```
Classification : LOCATOR_DRIFT (confidence: 87%)
Error          : Cannot find element #checkout-btn
                 Timeout 3000ms exceeded
GhostRunner    : DOM mutation detected — class #checkout-btn was removed
                 Semantic match found: role="button" name="Place Order" → #place-order-btn
```

GhostRunner creates a **Repair Proposal**:
```json
{
  "old_selector": "#checkout-btn",
  "new_selector": "#place-order-btn",
  "reasoning": "Button was renamed during UI refactor. Semantic role+name still matches intent.",
  "confidence": 0.91
}
```

Click **"Approve & Re-run"** → GhostRunner re-runs with the healed selector.

**Result → PASSED ✅ (Self-Healed)**
> "Test v1 → v2 automatically updated. New selector verified. Run passed."

---

### STEP 4 — Introduce API Failure (Escalation)

```bash
REVISION=c node server.js
```

**OR** commit:
```bash
git commit -m "fix: revert button (oops this breaks the API instead)"
git push
```

**Result → FAILED ❌**
```
Classification : BACKEND_ERROR (confidence: 94%)
Error          : POST /api/checkout → 500 PAYMENT_GATEWAY_DOWN
GhostRunner    : Selector found ✅, click succeeded ✅, API returned 500 ❌
                 This is NOT a locator drift — this requires human/backend fix
Repair Proposal: "Investigate payment gateway. Error: PAYMENT_GATEWAY_DOWN"
```

> **Key talking point:** GhostRunner is smart enough to tell the difference between
> a UI change it can fix automatically vs. a real backend bug that needs a human.

---

## Key Demo Talking Points

| What you say | What you show |
|-------------|--------------|
| "Zero test maintenance" | Revision B auto-heals without touching test code |
| "Intent-based, not selector-based" | Test defined in plain English, not CSS selectors |
| "Classifies failures correctly" | LOCATOR_DRIFT vs BACKEND_ERROR — different response |
| "Triggered by GitHub push" | Webhook fires test on every commit |
| "Full audit trail" | Run history, evidence screenshots, version diffs |

---

## Files in `ghostrunner-demo-store/`

```
ghostrunner-demo-store/
├── server.js       ← The entire app (revision A/B/C in one file)
├── package.json    ← express dependency
├── .gitignore
└── README.md       ← User-facing docs
```

---

## How to Switch Revisions During Demo

### Option 1 — Local (fastest for live demo)
```bash
# Terminal 1: kill current server, restart with new revision
Ctrl+C
REVISION=b node server.js
```

### Option 2 — GitHub push (shows full webhook flow)
```bash
# Edit server.js line 20:
# const REVISION = (process.env.REVISION || 'a').toLowerCase();
# Change 'a' to 'b', save, commit, push
git add server.js
git commit -m "ui: rename checkout button to Place Order"
git push
# GhostRunner detects push → runs test automatically
```
