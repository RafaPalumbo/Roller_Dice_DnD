import './styles/main.css';
import { createArcaneScene } from './core/scene.js';
import { GameLoop } from './core/loop.js';
import { RollManager } from './core/rollManager.js';
import { ParticleSystem } from './effects/particles.js';
import { setupDivineIntervention } from './effects/divineIntervention.js';
import { DiceSelectionUI } from './ui/selection.js';
import { RollHistory } from './ui/history.js';

function boot() {
  setupDivineIntervention();

  const container = document.getElementById('canvas-container');
  const context = createArcaneScene(container);
  const particles = new ParticleSystem(context.scene);

  let rollManager;
  const selectionUI = new DiceSelectionUI({
    onRoll: () => rollManager.rollSelected(),
    onClear: () => rollManager.clearAllDice(),
  });
  const history = new RollHistory(() => selectionUI.formulaFromSelection());
  rollManager = new RollManager({ context, selectionUI, particles, history });

  selectionUI.setup();
  const loop = new GameLoop({ ...context, rollManager, particles });
  loop.start();

  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
  }, 400);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
