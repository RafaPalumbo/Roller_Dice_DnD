import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { COLORS, PHYSICS, TABLE } from '../config/constants.js';
import { generateTableTexture } from './tableTexture.js';

export function createArcaneScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a2724);
  scene.fog = new THREE.Fog(0x2a2724, 25, 60);

  const w = container.clientWidth;
  const h = container.clientHeight;
  const isMobile = window.innerWidth < 900;
  const camera = new THREE.PerspectiveCamera(isMobile ? 55 : 45, w / h, 0.1, 200);
  camera.position.set(0, isMobile ? 30 : 24, 14);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  addLights(scene);
  addTable(scene, renderer);
  const world = createPhysicsWorld(scene);

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    const mobile = window.innerWidth < 900;
    camera.fov = mobile ? 55 : 45;
    camera.position.y = mobile ? 30 : 24;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  return { scene, camera, renderer, world };
}

function addLights(scene) {
  scene.add(new THREE.AmbientLight(0xffe9c2, 0.4));

  const key = new THREE.DirectionalLight(0xfff2d6, 1.1);
  key.position.set(8, 18, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 50;
  key.shadow.camera.left = -16;
  key.shadow.camera.right = 16;
  key.shadow.camera.top = 16;
  key.shadow.camera.bottom = -16;
  key.shadow.bias = -0.0008;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc0a880, 0.5);
  fill.position.set(-12, 8, -6);
  scene.add(fill);

  const rim = new THREE.PointLight(0xb30000, 0.7, 30);
  rim.position.set(0, 4, -10);
  scene.add(rim);
}

function addTable(scene, renderer) {
  const tableTex = generateTableTexture(renderer);
  const tableMat = new THREE.MeshStandardMaterial({ map: tableTex, roughness: 0.95, metalness: 0.0 });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(TABLE.width, TABLE.height), tableMat);
  table.rotation.x = -Math.PI / 2;
  table.receiveShadow = true;
  scene.add(table);

  const borderMat = new THREE.MeshStandardMaterial({ color: COLORS.crimsonDeep, roughness: 0.7, metalness: 0.1 });
  const borderGeom = new THREE.BoxGeometry(TABLE.width, 0.6, 0.4);
  ['n', 's'].forEach((d) => {
    const m = new THREE.Mesh(borderGeom, borderMat);
    m.position.set(0, 0.3, d === 'n' ? -TABLE.height / 2 : TABLE.height / 2);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  });

  const borderGeomY = new THREE.BoxGeometry(0.4, 0.6, TABLE.height);
  ['e', 'w'].forEach((d) => {
    const m = new THREE.Mesh(borderGeomY, borderMat);
    m.position.set(d === 'e' ? TABLE.width / 2 : -TABLE.width / 2, 0.3, 0);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  });
}

function createPhysicsWorld(scene) {
  const world = new CANNON.World();
  world.gravity.set(0, PHYSICS.gravity, 0);
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.solver.iterations = PHYSICS.solverIterations;
  world.solver.tolerance = PHYSICS.solverTolerance;
  world.allowSleep = true;

  const floorMat = new CANNON.Material('floorMat');
  const diceMat = new CANNON.Material('diceMat');
  world.addContactMaterial(new CANNON.ContactMaterial(floorMat, diceMat, { friction: PHYSICS.friction, restitution: PHYSICS.restitution }));
  world.addContactMaterial(new CANNON.ContactMaterial(diceMat, diceMat, { friction: 0.3, restitution: 0.4, contactEquationStiffness: 1e8, contactEquationRelaxation: 3 }));

  const floorBody = new CANNON.Body({ mass: 0, material: floorMat });
  floorBody.addShape(new CANNON.Plane());
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);

  const wallShape = new CANNON.Plane();
  const walls = [
    { pos: [0, 0, -TABLE.height / 2 + 0.2], rot: [0, 0, 0] },
    { pos: [0, 0, TABLE.height / 2 - 0.2], rot: [0, Math.PI, 0] },
    { pos: [-TABLE.width / 2 + 0.2, 0, 0], rot: [0, Math.PI / 2, 0] },
    { pos: [TABLE.width / 2 - 0.2, 0, 0], rot: [0, -Math.PI / 2, 0] },
  ];
  walls.forEach((w) => {
    const b = new CANNON.Body({ mass: 0, material: floorMat });
    b.addShape(wallShape);
    b.position.set(...w.pos);
    b.quaternion.setFromEuler(...w.rot);
    world.addBody(b);
  });

  scene.userData.diceMat = diceMat;
  return world;
}
