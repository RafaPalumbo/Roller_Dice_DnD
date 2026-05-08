export const COLORS = {
  parchment: 0xF5EFE0,
  parchmentDeep: 0xECE3CF,
  felt: 0x4A4540,
  crimson: 0xB30000,
  crimsonDeep: 0x7A0000,
  crimsonBright: 0xD11515,
  ink: 0x1B1410,
  diceFace: 0xF7F2E5,
};

export const PHYSICS = {
  gravity: -45,
  diceMass: 1.5,
  rollImpulse: 15,
  spinImpulse: 25,
  sleepThreshold: 0.1,
  sleepTimeLimit: 0.3,
  restitution: 0.3,
  friction: 0.6,
  solverIterations: 50,
  solverTolerance: 0.001,
  maxSubSteps: 3,
  fixedTimeStep: 1 / 60,
  fallbackTimeoutMs: 5000,
};

export const DICE_TYPES = ['d2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export const TABLE = {
  width: 28,
  height: 18,
};

// Escalas explícitas para manter o conjunto visual consistente; o d6 foi levemente aumentado
// em relação ao protótipo para não parecer menor que os outros sólidos.
export const DICE_SCALE = {
  d2: 1,
  d4: 1,
  d6: 1.18,
  d8: 1,
  d10: 1,
  d10tens: 1,
  d12: 1,
  d20: 1,
};

export const HISTORY_LIMIT = 30;
export const BANNER_TIMING = {
  normalMs: 3500,
  criticalMs: 5000,
};
