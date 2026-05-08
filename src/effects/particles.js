import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particleGroups = [];
  }

  spawnCritParticles(position) {
    const count = 80;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const lifetimes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y + 0.5;
      positions[i * 3 + 2] = position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 4 + Math.random() * 6;
      velocities.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.cos(phi)) * speed * 1.2 + 2,
        Math.sin(phi) * Math.sin(theta) * speed,
      ));
      lifetimes[i] = 1.0 + Math.random() * 0.8;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xD11515, size: 0.18, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = new THREE.Points(geom, mat);
    this.scene.add(points);
    this.particleGroups.push({ points, velocities, lifetimes, age: 0, maxAge: 1.6 });
  }

  update(dt) {
    for (let i = this.particleGroups.length - 1; i >= 0; i--) {
      const g = this.particleGroups[i];
      g.age += dt;
      const positions = g.points.geometry.attributes.position.array;
      for (let p = 0; p < g.velocities.length; p++) {
        positions[p * 3] += g.velocities[p].x * dt;
        positions[p * 3 + 1] += g.velocities[p].y * dt;
        positions[p * 3 + 2] += g.velocities[p].z * dt;
        g.velocities[p].y -= 18 * dt;
      }
      g.points.geometry.attributes.position.needsUpdate = true;
      g.points.material.opacity = Math.max(0, 1 - (g.age / g.maxAge));
      if (g.age >= g.maxAge) {
        this.scene.remove(g.points);
        g.points.geometry.dispose();
        g.points.material.dispose();
        this.particleGroups.splice(i, 1);
      }
    }
  }
}
