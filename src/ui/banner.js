import { BANNER_TIMING } from '../config/constants.js';

let bannerTimer = null;

export function showBanner(total, mod, isCrit, byType, d100Groups) {
  const banner = document.getElementById('result-banner');
  document.getElementById('banner-total').textContent = total;
  const parts = [];
  Object.keys(byType).forEach((t) => parts.push(`${byType[t].length}${t} [${byType[t].join(' + ')}]`));
  Object.keys(d100Groups).forEach((id) => {
    const g = d100Groups[id];
    if (g.tens && g.ones) parts.push(`d100 [${((g.tens.rolledValue + g.ones.rolledValue) === 0) ? 100 : (g.tens.rolledValue + g.ones.rolledValue)}]`);
  });
  let breakdownText = parts.join(' + ');
  if (mod !== 0) breakdownText += ` ${mod >= 0 ? '+' : ''} ${mod}`;
  document.getElementById('banner-breakdown').textContent = breakdownText;
  document.getElementById('banner-crit').style.display = isCrit ? 'block' : 'none';
  banner.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(hideBanner, isCrit ? BANNER_TIMING.criticalMs : BANNER_TIMING.normalMs);
}

export function hideBanner() {
  document.getElementById('result-banner').classList.remove('show');
}
