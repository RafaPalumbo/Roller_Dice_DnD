import * as THREE from 'three'

export function createScene() {
  const scene = new THREE.Scene()

  scene.background = new THREE.Color(0x2a2724)
  scene.fog = new THREE.Fog(0x2a2724, 25, 60)

  const ambientLight = new THREE.AmbientLight(0xffe9c2, 0.4)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xfff2d6, 1.1)
  keyLight.position.set(8, 18, 10)
  keyLight.castShadow = true
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xc0a880, 0.5)
  fillLight.position.set(-12, 8, -6)
  scene.add(fillLight)

  const rimLight = new THREE.PointLight(0xb30000, 0.7, 30)
  rimLight.position.set(0, 4, -10)
  scene.add(rimLight)

  return scene
}