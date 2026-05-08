import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { createD6Materials } from './materials/diceMaterials'

export class TestDie {
  constructor(scene, world) {
    this.scene = scene
    this.world = world

    this.mesh = this.createMesh()
    this.body = this.createBody(world)

    scene.add(this.mesh)
    world.addBody(this.body)
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(2, 2, 2)

    const mesh = new THREE.Mesh(
      geometry,
      createD6Materials()
    )

    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  createBody(world) {
    const shape = new CANNON.Box(
      new CANNON.Vec3(1, 1, 1)
    )

    const body = new CANNON.Body({
      mass: 1.5,
      material: world.userData.diceMaterial,
      allowSleep: true,
      sleepSpeedLimit: 0.1,
      sleepTimeLimit: 0.3,
      linearDamping: 0.12,
      angularDamping: 0.18
    })

    body.addShape(shape)
    body.position.set(0, 8, 0)

    body.quaternion.setFromEuler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )

    body.velocity.set(
      (Math.random() - 0.5) * 10,
      2,
      (Math.random() - 0.5) * 10
    )

    body.angularVelocity.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 14
    )

    return body
  }

  update() {
    this.mesh.position.copy(this.body.position)
    this.mesh.quaternion.copy(this.body.quaternion)
  }

  destroy() {
    this.scene.remove(this.mesh)
    this.world.removeBody(this.body)

    this.mesh.geometry.dispose()

    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((material) => {
        if (material.map) material.map.dispose()
        material.dispose()
      })
    } else {
      if (this.mesh.material.map) this.mesh.material.map.dispose()
      this.mesh.material.dispose()
    }
  }
}