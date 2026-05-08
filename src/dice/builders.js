import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { DICE_SCALE } from '../config/constants.js';

function applyScale(def, type) {
  const scale = DICE_SCALE[type] ?? 1;
  if (scale === 1) return def;
  def.geom.scale(scale, scale, scale);
  if (def.cannonShape instanceof CANNON.ConvexPolyhedron) {
    def.cannonShape.vertices.forEach((v) => v.scale(scale, v));
    def.cannonShape.updateBoundingSphereRadius();
  }
  if (def.cannonShape instanceof CANNON.Cylinder) {
    def.cannonShape = new CANNON.Cylinder(0.95 * scale, 0.95 * scale, 0.28 * scale, 28);
  }
  def.sizeRadius *= scale;
  return def;
}

export function buildPolyhedron(verts, faces, faceValues) {
  const shapeCenter = new THREE.Vector3();
  verts.forEach((v) => shapeCenter.add(new THREE.Vector3(...v)));
  shapeCenter.divideScalar(verts.length);
  const cleanFaces = faces.map((face) => {
    const v0 = new THREE.Vector3(...verts[face[0]]);
    const v1 = new THREE.Vector3(...verts[face[1]]);
    const v2 = new THREE.Vector3(...verts[face[2]]);
    const e1 = new THREE.Vector3().subVectors(v1, v0);
    const e2 = new THREE.Vector3().subVectors(v2, v0);
    const n = new THREE.Vector3().crossVectors(e1, e2).normalize();
    const toFace = new THREE.Vector3().subVectors(v0, shapeCenter);
    return n.dot(toFace) < 0 ? face.slice().reverse() : face;
  });

  const positions = [];
  const uvs = [];
  const indices = [];
  const faceNormals = [];
  let groupStart = 0;
  const geom = new THREE.BufferGeometry();
  cleanFaces.forEach((face, fi) => {
    const faceVerts = face.map((idx) => new THREE.Vector3(...verts[idx]));
    const e1 = new THREE.Vector3().subVectors(faceVerts[1], faceVerts[0]);
    const e2 = new THREE.Vector3().subVectors(faceVerts[2], faceVerts[0]);
    const n = new THREE.Vector3().crossVectors(e1, e2).normalize();
    faceNormals.push([n.x, n.y, n.z]);
    const uAxis = e1.clone().normalize();
    const vAxis = new THREE.Vector3().crossVectors(n, uAxis).normalize();
    const center = new THREE.Vector3();
    faceVerts.forEach((v) => center.add(v));
    center.divideScalar(faceVerts.length);
    const local2D = faceVerts.map((v) => {
      const d = new THREE.Vector3().subVectors(v, center);
      return [d.dot(uAxis), d.dot(vAxis)];
    });
    let maxDist = 0;
    local2D.forEach(([u, v]) => {
      const dist = Math.sqrt(u * u + v * v);
      if (dist > maxDist) maxDist = dist;
    });
    const range = maxDist * 2 || 1;
    const baseIdx = positions.length / 3;
    faceVerts.forEach((v, vi) => {
      positions.push(v.x, v.y, v.z);
      const [u2, v2] = local2D[vi];
      uvs.push(0.5 + (u2 / range) * 0.9, 0.5 + (v2 / range) * 0.9);
    });
    let triCount = 0;
    for (let i = 1; i < face.length - 1; i++) {
      indices.push(baseIdx, baseIdx + i, baseIdx + i + 1);
      triCount += 3;
    }
    geom.addGroup(groupStart, triCount, fi);
    groupStart += triCount;
  });

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  const cannonVerts = verts.map((v) => new CANNON.Vec3(...v));
  const cannonFaces = cleanFaces.map((f) => f.slice());
  const cannonShape = new CANNON.ConvexPolyhedron({ vertices: cannonVerts, faces: cannonFaces });
  return { geom, faceNormals, faceValues, cannonShape };
}

export function buildD2() {
  const radius = 0.95;
  const thickness = 0.28;
  const segs = 28;
  const geom = new THREE.CylinderGeometry(radius, radius, thickness, segs, 1);
  const faceNormals = [[0, 0, 0], [0, 1, 0], [0, -1, 0]];
  const faceValues = [0, 1, 2];
  const cannonShape = new CANNON.Cylinder(radius, radius, thickness, segs);
  const quat = new CANNON.Quaternion();
  quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  return applyScale({ geom, faceNormals, faceValues, cannonShape, cannonOffset: null, cannonQuat: quat, sizeRadius: radius }, 'd2');
}

export function buildD4() { const a = 1 / Math.sqrt(3), verts = [[ a, a, a], [-a, -a, a], [-a, a, -a], [ a, -a, -a]], faces = [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]], faceValues = [1, 2, 3, 4]; return applyScale({ ...buildPolyhedron(verts, faces, faceValues), sizeRadius: 1 }, 'd4'); }
export function buildD6() { const s = 0.55, v = [[ s, s, s], [-s, s, s], [-s, -s, s], [ s, -s, s], [ s, s, -s], [-s, s, -s], [-s, -s, -s], [ s, -s, -s]], faces = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 3, 7, 4], [1, 5, 6, 2], [0, 4, 5, 1], [2, 6, 7, 3]], faceValues = [3, 4, 1, 6, 2, 5]; return applyScale({ ...buildPolyhedron(v, faces, faceValues), sizeRadius: s * Math.sqrt(3) }, 'd6'); }
export function buildD8() { const r = 1, v = [[ 0, r, 0], [ 0, -r, 0], [ r, 0, 0], [-r, 0, 0], [ 0, 0, r], [ 0, 0, -r]], faces = [[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]], faceValues = [1, 2, 3, 4, 8, 7, 6, 5]; return applyScale({ ...buildPolyhedron(v, faces, faceValues), sizeRadius: r }, 'd8'); }
export function buildD10(opts = {}) { const r = 0.93, e = 0.16, h = 1.0, verts = [[0, h, 0], [0, -h, 0]]; for (let i = 0; i < 10; i++) { const ang = (i * Math.PI) / 5, y = (i % 2 === 0) ? +e : -e; verts.push([r * Math.cos(ang), y, r * Math.sin(ang)]); } const faces = []; for (let i = 0; i < 5; i++) faces.push([0, 2 + (2*i + 2) % 10, 2 + (2*i + 1) % 10, 2 + (2*i) % 10]); for (let i = 0; i < 5; i++) faces.push([1, 2 + (2*i + 1) % 10, 2 + (2*i + 2) % 10, 2 + (2*i + 3) % 10]); const faceValues = opts.tens ? [0, 70, 40, 10, 80, 50, 20, 90, 60, 30] : [0, 7, 4, 1, 8, 5, 2, 9, 6, 3]; return applyScale({ ...buildPolyhedron(verts, faces, faceValues), sizeRadius: h, isTens: !!opts.tens }, opts.tens ? 'd10tens' : 'd10'); }
export function buildD12() { const phi = (1 + Math.sqrt(5)) / 2, a = 1 / Math.sqrt(3), b = a / phi, c = a * phi, verts = [[ a, a, a], [ a, a, -a], [ a, -a, a], [ a, -a, -a], [-a, a, a], [-a, a, -a], [-a, -a, a], [-a, -a, -a], [ 0, b, c], [ 0, b, -c], [ 0, -b, c], [ 0, -b, -c], [ b, c, 0], [ b, -c, 0], [-b, c, 0], [-b, -c, 0], [ c, 0, b], [ c, 0, -b], [-c, 0, b], [-c, 0, -b]], faces = [[ 0, 16, 2, 10, 8], [ 0, 8, 4, 14, 12], [ 0, 12, 1, 17, 16], [ 1, 12, 14, 5, 9], [ 1, 9, 11, 3, 17], [ 2, 16, 17, 3, 13], [ 2, 13, 15, 6, 10], [ 3, 11, 7, 15, 13], [ 4, 8, 10, 6, 18], [ 4, 18, 19, 5, 14], [ 5, 19, 7, 11, 9], [ 6, 15, 7, 19, 18]], faceValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; return applyScale({ ...buildPolyhedron(verts, faces, faceValues), sizeRadius: 1 }, 'd12'); }
export function buildD20() { const phi = (1 + Math.sqrt(5)) / 2, norm = 1 / Math.sqrt(1 + phi*phi), a = norm, b = phi * norm, verts = [[-a, b, 0], [ a, b, 0], [-a, -b, 0], [ a, -b, 0], [ 0, -a, b], [ 0, a, b], [ 0, -a, -b], [ 0, a, -b], [ b, 0, -a], [ b, 0, a], [-b, 0, -a], [-b, 0, a]], faces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]], faceValues = [20, 8, 14, 1, 9, 11, 13, 17, 5, 4, 3, 18, 16, 12, 19, 10, 7, 6, 2, 15]; return applyScale({ ...buildPolyhedron(verts, faces, faceValues), sizeRadius: 1 }, 'd20'); }

export function buildDieDefinition(type) {
  switch (type) {
    case 'd2': return buildD2();
    case 'd4': return buildD4();
    case 'd6': return buildD6();
    case 'd8': return buildD8();
    case 'd10': return buildD10({ tens: false });
    case 'd10tens': return buildD10({ tens: true });
    case 'd12': return buildD12();
    case 'd20': return buildD20();
    default: throw new Error(`Unknown die: ${type}`);
  }
}
