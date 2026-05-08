import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import {
  createD6Materials
} from '../materials/diceMaterials'

export function buildD6() {
  const size = 1

  const geometry = new THREE.BoxGeometry(
    size * 2,
    size * 2,
    size * 2
  )

  const mesh = new THREE.Mesh(
    geometry,
    createD6Materials()
  )

  mesh.castShadow = true
  mesh.receiveShadow = true

  const shape = new CANNON.Box(
    new CANNON.Vec3(size, size, size)
  )

  return {
    mesh,
    shape
  }
}