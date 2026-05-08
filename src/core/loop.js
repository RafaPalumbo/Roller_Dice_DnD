import * as THREE from 'three';
import { PHYSICS } from '../config/constants.js';

export class GameLoop {
  constructor({ world, renderer, scene, camera, rollManager, particles }) {
    this.world = world;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.rollManager = rollManager;
    this.particles = particles;
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
  }

  start() {
    requestAnimationFrame(this.animate);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 1 / 30);
    this.world.step(PHYSICS.fixedTimeStep, dt, PHYSICS.maxSubSteps);
    this.rollManager.updateDiceMeshes();
    this.rollManager.tryResolveRoll();
    this.particles.update(dt);
    this.renderer.render(this.scene, this.camera);
  }
}
