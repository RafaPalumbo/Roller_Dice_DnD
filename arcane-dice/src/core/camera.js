import * as THREE from 'three'

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  )

  camera.position.set(0, 24, 14)
  camera.lookAt(0, 0, 0)

  return camera
}