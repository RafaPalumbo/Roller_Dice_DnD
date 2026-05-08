import { DICE_TYPES } from '../config/constants.js';
import { DICE_ICONS } from './icons.js';

export class DiceSelectionUI {
  constructor({ onRoll, onClear }) {
    this.selection = Object.fromEntries(DICE_TYPES.map((t) => [t, 0]));
    this.onRoll = onRoll;
    this.onClear = onClear;
  }

  setup() {
    this.buildDiceSelector();
    document.getElementById('roll-btn').addEventListener('click', this.onRoll);
    document.getElementById('clear-btn').addEventListener('click', () => {
      DICE_TYPES.forEach((t) => { this.selection[t] = 0; });
      document.getElementById('modifier').value = 0;
      this.updateDisplay();
      this.onClear();
    });
    document.getElementById('mod-plus').addEventListener('click', () => {
      const inp = document.getElementById('modifier');
      inp.value = (parseInt(inp.value || '0', 10) || 0) + 1;
      this.updateDisplay();
    });
    document.getElementById('mod-minus').addEventListener('click', () => {
      const inp = document.getElementById('modifier');
      inp.value = (parseInt(inp.value || '0', 10) || 0) - 1;
      this.updateDisplay();
    });
    document.getElementById('modifier').addEventListener('input', () => this.updateDisplay());
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.onRoll();
      }
      if (e.code === 'Escape') this.onClear();
    });
    this.updateDisplay();
  }

  buildDiceSelector() {
    const sel = document.getElementById('dice-selector');
    DICE_TYPES.forEach((t) => {
      const btn = document.createElement('button');
      btn.className = 'die-btn';
      btn.dataset.type = t;
      btn.innerHTML = `${DICE_ICONS[t]}<span class="lbl">${t}</span><span class="count-badge" data-type="${t}">0</span>`;
      btn.addEventListener('click', () => {
        this.selection[t] = (this.selection[t] || 0) + 1;
        if (this.selection[t] > 20) this.selection[t] = 20;
        this.updateDisplay();
      });
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (this.selection[t] > 0) this.selection[t] -= 1;
        this.updateDisplay();
      });
      sel.appendChild(btn);
    });
  }

  updateDisplay() {
    DICE_TYPES.forEach((t) => {
      const badge = document.querySelector(`.count-badge[data-type="${t}"]`);
      const c = this.selection[t] || 0;
      badge.textContent = c;
      badge.classList.toggle('active', c > 0);
    });
    const formula = this.formulaFromSelection();
    const ft = document.getElementById('formula-text');
    ft.innerHTML = formula ? `<span class="formula">${formula}</span>` : '<span class="empty">— nenhum dado selecionado —</span>';
  }

  formulaFromSelection() {
    const parts = [];
    DICE_TYPES.forEach((t) => {
      if ((this.selection[t] || 0) > 0) parts.push(`${this.selection[t]}${t}`);
    });
    let f = parts.join(' + ');
    const mod = this.getModifier();
    if (mod !== 0 && f) f += ` ${mod >= 0 ? '+' : '-'} ${Math.abs(mod)}`;
    return f;
  }

  hasAnyDiceSelected() {
    return DICE_TYPES.some((t) => (this.selection[t] || 0) > 0);
  }

  getModifier() {
    return parseInt(document.getElementById('modifier').value || '0', 10) || 0;
  }

  setRollEnabled(enabled) {
    document.getElementById('roll-btn').disabled = !enabled;
  }
}
