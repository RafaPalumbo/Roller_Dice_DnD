import { HISTORY_LIMIT } from '../config/constants.js';

export class RollHistory {
  constructor(formulaProvider) {
    this.history = [];
    this.formulaProvider = formulaProvider;
  }

  add(total, breakdown, mod, isCrit) {
    const empty = document.getElementById('history-empty');
    if (empty) empty.remove();
    const li = document.createElement('li');
    li.className = `history-item${isCrit ? ' crit' : ''}`;
    const breakdownDiv = document.createElement('div');
    breakdownDiv.className = 'breakdown';
    breakdownDiv.textContent = breakdown + (mod !== 0 ? ` ${mod >= 0 ? '+' : ''} ${mod}` : '');
    const formulaDiv = document.createElement('div');
    formulaDiv.className = 'formula';
    formulaDiv.textContent = this.formulaProvider();
    const totalDiv = document.createElement('div');
    totalDiv.className = 'total';
    totalDiv.textContent = total;
    li.appendChild(formulaDiv);
    li.appendChild(totalDiv);
    li.appendChild(breakdownDiv);
    const list = document.getElementById('history-list');
    list.insertBefore(li, list.firstChild);
    while (list.children.length > HISTORY_LIMIT) list.removeChild(list.lastChild);
    this.history.unshift({ total, breakdown, mod, isCrit });
  }
}
