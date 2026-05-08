export function setupDivineIntervention() {
  window.divineIntervention = false;
  let clickCount = 0;
  const brandTitle = document.getElementById('brand-title');
  if (!brandTitle) return;

  brandTitle.setAttribute('role', 'presentation');
  brandTitle.setAttribute('aria-hidden', 'true');

  brandTitle.addEventListener('click', (e) => {
    e.preventDefault();
    clickCount++;
    if (clickCount === 3) {
      window.divineIntervention = !window.divineIntervention;
      clickCount = 0;
      console.log(`%c INTERVENÇÃO ATIVA: ${window.divineIntervention}`, 'color: #D11515; font-weight: bold;');
    }
    setTimeout(() => { clickCount = 0; }, 800);
  });
}
