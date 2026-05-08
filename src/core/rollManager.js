import * as CANNON from 'cannon-es';
import { DICE_TYPES, PHYSICS } from '../config/constants.js';
import { Die } from '../dice/Die.js';
import { showBanner, hideBanner } from '../ui/banner.js';

export class RollManager {
  constructor({ context, selectionUI, particles, history }) {
    this.context = context;
    this.selectionUI = selectionUI;
    this.particles = particles;
    this.history = history;
    this.liveDice = [];
    this.rolling = false;
    this.rollResolved = false;
    this.rollStartTime = 0;
    this.modifier = 0;
  }

  clearAllDice() {
    this.liveDice.forEach((d) => d.destroy());
    this.liveDice.length = 0;
    hideBanner();
  }

  spawnDice() {
    const items = [];
    DICE_TYPES.forEach((t) => {
      const count = this.selectionUI.selection[t] || 0;
      if (t === 'd100') {
        for (let i = 0; i < count; i++) {
          items.push({ type: 'd10tens', d100: true, role: 'tens', pairId: i });
          items.push({ type: 'd10', d100: true, role: 'ones', pairId: i });
        }
      } else {
        for (let i = 0; i < count; i++) items.push({ type: t });
      }
    });
    if (items.length === 0) return false;
    items.forEach((item, idx) => {
      const die = new Die(item.type, this.context, { partOfD100: !!item.d100, d100Role: item.role });
      die.partOfD100 = !!item.d100;
      die.d100Role = item.role || null;
      die.d100PairId = item.pairId;
      const cols = Math.ceil(Math.sqrt(items.length));
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const xOff = (col - (cols - 1) / 2) * 1.5 + (Math.random() - 0.5) * 0.4;
      const zOff = (row - (cols - 1) / 2) * 1.5 + (Math.random() - 0.5) * 0.4 - 2;
      die.setPosition(xOff, 6 + Math.random() * 2, zOff);
      die.randomizeRotation();
      die.applyRollImpulse();
      this.liveDice.push(die);
    });
    return true;
  }

  rollSelected() {
    if (this.rolling || !this.selectionUI.hasAnyDiceSelected()) return;
    this.clearAllDice();
    this.rolling = true;
    this.rollResolved = false;
    this.rollStartTime = performance.now();
    this.selectionUI.setRollEnabled(false);
    this.modifier = this.selectionUI.getModifier();
    if (!this.spawnDice()) {
      this.rolling = false;
      this.selectionUI.setRollEnabled(true);
    }
  }

  updateDiceMeshes() {
    this.liveDice.forEach((d) => d.syncMesh());
  }

  tryResolveRoll() {
    if (!this.rolling || this.rollResolved || this.liveDice.length === 0) return;
    const allSleeping = this.liveDice.every((d) => d.body.sleepState === CANNON.Body.SLEEPING);
    const isTimeout = (performance.now() - this.rollStartTime) > PHYSICS.fallbackTimeoutMs;
    if (!allSleeping && !isTimeout) return;
    if (isTimeout) this.liveDice.forEach((d) => { if (d.body.sleepState !== CANNON.Body.SLEEPING) d.body.sleep(); });
    this.liveDice.forEach((d) => d.resolve());

    let total = 0;
    let isCrit = false;
    const breakdownParts = [];
    const d100Groups = {};
    const standalone = [];
    const byType = {};

    this.liveDice.forEach((d) => {
      if (d.partOfD100) {
        if (!d100Groups[d.d100PairId]) d100Groups[d.d100PairId] = {};
        d100Groups[d.d100PairId][d.d100Role] = d;
      } else {
        standalone.push(d);
      }
    });

    Object.keys(d100Groups).forEach((id) => {
      const g = d100Groups[id];
      if (!g.tens || !g.ones) return;
      let val = (g.tens.rolledValue || 0) + (g.ones.rolledValue || 0);
      if (val === 0) val = 100;
      total += val;
      breakdownParts.push(`d100=${val} (${g.tens.rolledValue}|${g.ones.rolledValue})`);
    });

    standalone.forEach((d) => {
      if (!byType[d.type]) byType[d.type] = [];
      let v = d.rolledValue;
      if (d.type === 'd10' && v === 0) v = 10;
      byType[d.type].push(v);
      total += v;
      if (d.type === 'd20' && d.rolledValue === 20 && !d.critEffectSpawned) {
        isCrit = true;
        d.critEffectSpawned = true;
        this.particles.spawnCritParticles(d.mesh.position);
      }
    });

    Object.keys(byType).forEach((t) => breakdownParts.unshift(`${byType[t].length}${t}=[${byType[t].join(',')}]`));
    total += this.modifier;
    this.rollResolved = true;
    this.rolling = false;
    this.selectionUI.setRollEnabled(true);
    const breakdown = breakdownParts.join(' + ');
    showBanner(total, this.modifier, isCrit, byType, d100Groups);
    this.history.add(total, breakdown, this.modifier, isCrit);
  }
}
