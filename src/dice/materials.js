import * as THREE from 'three';
import { COLORS } from '../config/constants.js';

export function makeFaceTexture(value, opts = {}, renderer = null) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.6);
  grd.addColorStop(0, '#FDFAF0');
  grd.addColorStop(1, '#F0E8D2');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(120, 90, 50, 0.08)';
  ctx.fillRect(0, 0, size, 8);
  ctx.fillRect(0, size - 8, size, 8);
  ctx.fillRect(0, 0, 8, size);
  ctx.fillRect(size - 8, 0, 8, size);

  ctx.fillStyle = '#B30000';
  ctx.strokeStyle = '#7A0000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const display = opts.display !== undefined ? opts.display : value.toString();
  const fontSize = display.length === 1 ? 150 : (display.length === 2 ? 120 : 95);
  ctx.font = `700 ${fontSize}px "Playfair Display", serif`;
  ctx.lineWidth = 4;
  const cx = size / 2;
  const cy = size / 2;
  ctx.strokeText(display, cx, cy);
  ctx.fillText(display, cx, cy);

  if (opts.underline) {
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#B30000';
    const underlineY = cy + fontSize * 0.4;
    const underlineW = fontSize * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx - underlineW / 2, underlineY);
    ctx.lineTo(cx + underlineW / 2, underlineY);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
  tex.needsUpdate = true;
  return tex;
}

export function makeMaterialsForDie(faceValues, dieType, renderer = null) {
  return faceValues.map((v, i) => {
    let display = v.toString();
    let underline = false;
    if (dieType === 'd100tens') display = v === 0 ? '00' : v.toString();
    if (dieType === 'd10' || dieType === 'd100ones') display = v.toString();
    if (dieType === 'd6' && (v === 6 || v === 9)) underline = true;
    if (dieType === 'd8' && v === 6) underline = true;
    if (dieType === 'd20' && (v === 6 || v === 9)) underline = true;
    if (dieType === 'd12' && (v === 6 || v === 9)) underline = true;
    if (dieType === 'd2' && i === 0) {
      return new THREE.MeshStandardMaterial({ color: COLORS.diceFace, roughness: 0.55, metalness: 0.05 });
    }
    return new THREE.MeshStandardMaterial({
      map: makeFaceTexture(v, { display, underline }, renderer),
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.05,
    });
  });
}
