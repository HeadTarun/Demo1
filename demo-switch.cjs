#!/usr/bin/env node
/**
 * demo-switch.cjs
 *
 * One-command demo revision switcher.
 * Updates the default REVISION in server.js and commits it to git,
 * so a GitHub push triggers the GhostRunner webhook automatically.
 *
 * Usage (from the demo-repo folder):
 *   node demo-switch.cjs a   → reset to initial passing state
 *   node demo-switch.cjs b   → introduce locator drift (button renamed)
 *   node demo-switch.cjs c   → introduce API failure
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const revision = (process.argv[2] || '').toLowerCase();

const messages = {
  a: "reset: restore checkout button to initial state (revision A)",
  b: "refactor: rename checkout button for new design system (revision B)",
  c: "bug: payment gateway returning 500 after deploy (revision C)",
};

const descriptions = {
  a: "✅  Revision A — Initial state. GhostRunner test will PASS.",
  b: "⚠️  Revision B — Button renamed '#place-order-btn'. GhostRunner will detect LOCATOR_DRIFT → self-heal.",
  c: "❌  Revision C — /api/checkout returns 500. GhostRunner will classify BACKEND_ERROR.",
};

if (!['a', 'b', 'c'].includes(revision)) {
  console.error('Usage: node demo-switch.cjs [a|b|c]');
  process.exit(1);
}

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Replace the default REVISION line
content = content.replace(
  /const REVISION = \(process\.env\.REVISION \|\| '[abc]'\)\.toLowerCase\(\);/,
  `const REVISION = (process.env.REVISION || '${revision}').toLowerCase();`
);

fs.writeFileSync(serverPath, content, 'utf8');

console.log(`\n${descriptions[revision]}\n`);
console.log(`Committing to git...`);

try {
  execSync(`git add server.js`, { cwd: __dirname, stdio: 'inherit' });
  execSync(`git commit -m "${messages[revision]}"`, { cwd: __dirname, stdio: 'inherit' });
  console.log(`\n🚀 Now push to GitHub to trigger GhostRunner webhook:`);
  console.log(`   git push\n`);
} catch (e) {
  console.error('Git error:', e.message);
}
