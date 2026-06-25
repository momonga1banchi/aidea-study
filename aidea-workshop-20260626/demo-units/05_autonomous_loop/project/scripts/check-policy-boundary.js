const fs = require('node:fs');
const path = require('node:path');
const { collectFiles } = require('./sensor-utils');

const issues = [];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const policyFile = 'src/services/freeShippingPolicy.js';
const orderEstimateFile = 'src/services/orderEstimateService.js';
const promotionFile = 'src/services/promotionService.js';

if (!fs.existsSync(policyFile)) {
  issues.push(`${policyFile} がありません`);
}

const orderEstimateService = read(orderEstimateFile);
const promotionService = read(promotionFile);

if (!orderEstimateService.includes("require('./freeShippingPolicy')")) {
  issues.push(`${orderEstimateFile}: 送料無料判定を freeShippingPolicy へ委譲してください`);
}

if (!promotionService.includes("require('./freeShippingPolicy')")) {
  issues.push(`${promotionFile}: 残額計算を freeShippingPolicy へ委譲してください`);
}

if (/FREE_SHIPPING_THRESHOLD|subtotal\s*>?=\s*\d{4}|subtotal\s*>?=\s*freeShippingThreshold/.test(orderEstimateService)) {
  issues.push(`${orderEstimateFile}: 送料無料閾値や判定条件を直接持たず、policyを呼んでください`);
}

if (/FREE_SHIPPING_THRESHOLD|\b(5000|7000)\b|threshold\s*=/.test(promotionService)) {
  issues.push(`${promotionFile}: 送料無料閾値の重複があります`);
}

for (const file of collectFiles('src', f => f.endsWith('.js'))) {
  const text = read(file);
  if (file.startsWith('src/controllers/') && /require\(['"].*\.\.\/(repositories|config)/.test(text)) {
    issues.push(`${file}: controllerからrepository/configへの直接依存は禁止です`);
  }
  if (!['src/config/pricing.js', policyFile].includes(file) && /\b(5000|7000)\b/.test(text)) {
    issues.push(`${file}: 送料無料閾値に見える数値をpolicy/config外に置かないでください`);
  }
}

if (issues.length) {
  for (const issue of issues) console.error(`[policy-boundary] NG: ${issue}`);
  process.exit(1);
}

console.log('[policy-boundary] OK: free-shipping policy has one owner');
