import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PHYSICS } from '../config/constants.js';
import { buildDieDefinition } from './builders.js';
import { makeMaterialsForDie } from './materials.js';

export class Die {
  constructor(type, context, opts = {}) {
    const { scene, world, renderer } = context;
    this.scene = scene;
    this.world = world;
    this.type = type;
    this.dieKind = opts.kind || type;
    this.partOfD100 = opts.partOfD100 || false;
    this.d100Role = opts.d100Role || null;

    const def = buildDieDefinition(type);
    this.faceNormals = def.faceNormals;
    this.faceValues = def.faceValues;
    this.sizeRadius = def.sizeRadius;
    this.detectDir = type === 'd4' ? new CANNON.Vec3(0, -1, 0) : new CANNON.Vec3(0, 1, 0);

    const materials = makeMaterialsForDie(this.faceValues, type === 'd10tens' ? 'd100tens' : type, renderer);
    this.mesh = new THREE.Mesh(def.geom, materials);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    scene.add(this.mesh);

    const body = new CANNON.Body({
      mass: PHYSICS.diceMass,
      material: scene.userData.diceMat,
      allowSleep: true,
      sleepSpeedLimit: PHYSICS.sleepThreshold,
      sleepTimeLimit: PHYSICS.sleepTimeLimit,
      linearDamping: 0.12,
      angularDamping: 0.18,
    });

    this.cheatOffset = null;
    const cannonOffset = new CANNON.Vec3(0, 0, 0);
    if (type === 'd20' && window.divineIntervention) {
      const n20 = def.faceNormals[0];
      const pesoVicio = 0.10;
      cannonOffset.set(n20[0] * pesoVicio, n20[1] * pesoVicio, n20[2] * pesoVicio);
      this.cheatOffset = new CANNON.Vec3(cannonOffset.x, cannonOffset.y, cannonOffset.z);
    }

    if (type === 'd2') body.addShape(def.cannonShape, cannonOffset, def.cannonQuat);
    else body.addShape(def.cannonShape, cannonOffset);

    this.body = body;
    world.addBody(body);
    this.rolling = false;
    this.resolved = false;
    this.rolledValue = null;
    this.upFaceIndex = null;
    this.critEffectSpawned = false;
  }

  setPosition(x, y, z) {
    this.body.position.set(x, y, z);
    this.mesh.position.set(x, y, z);
  }

  randomizeRotation() {
    const q = new CANNON.Quaternion();
    q.setFromEuler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    this.body.quaternion.copy(q);
    this.mesh.quaternion.copy(q);
  }

  applyRollImpulse() {
    const ang = Math.random() * Math.PI * 2;
    const speed = PHYSICS.rollImpulse + Math.random() * 4;
    this.body.velocity.set(Math.cos(ang) * speed, 4 + Math.random() * 3, Math.sin(ang) * speed);
    this.body.angularVelocity.set(
      (Math.random() - 0.5) * PHYSICS.spinImpulse,
      (Math.random() - 0.5) * PHYSICS.spinImpulse,
      (Math.random() - 0.5) * PHYSICS.spinImpulse,
    );
    this.body.wakeUp();
  }

  syncMesh() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    if (this.cheatOffset) {
      const localOffset = this.cheatOffset.clone();
      this.body.quaternion.vmult(localOffset, localOffset);
      this.mesh.position.add(localOffset);
    }
  }

  detectUpFace() {
    let maxDot = -Infinity;
    let upIdx = -1;
    const local = new CANNON.Vec3();
    const worldNormal = new CANNON.Vec3();
    for (let i = 0; i < this.faceNormals.length; i++) {
      const n = this.faceNormals[i];
      if (n[0] === 0 && n[1] === 0 && n[2] === 0) continue;
      local.set(n[0], n[1], n[2]);
      this.body.quaternion.vmult(local, worldNormal);
      const dot = worldNormal.dot(this.detectDir);
      if (dot > maxDot) {
        maxDot = dot;
        upIdx = i;
      }
    }
    return upIdx;
  }

  resolve() {
    if (this.resolved) return this.rolledValue;
    this.upFaceIndex = this.detectUpFace();
    this.rolledValue = this.faceValues[this.upFaceIndex];
    this.resolved = true;
    return this.rolledValue;
  }

  destroy() {
    this.scene.remove(this.mesh);
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    } else {
      this.mesh.material.dispose();
    }
    this.mesh.geometry.dispose();
    this.world.removeBody(this.body);
  }
}
