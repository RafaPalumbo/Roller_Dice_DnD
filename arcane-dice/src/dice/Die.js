import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { buildD6 } from './builders/buildD6'
import { buildD20 } from './builders/buildD20'

export class Die {
  constructor({ type, scene, world, onResolved }) {
    this.type = type
    this.scene = scene
    this.world = world
    this.onResolved = onResolved

    const built = this.build(type)

    this.mesh = built.mesh
    this.faceNormals = built.faceNormals || []
    this.faceValues = built.faceValues || []

    this.body = this.createBody({
      shape: built.shape,
      world
    })

    this.result = null
    this.resolved = false

    scene.add(this.mesh)
    world.addBody(this.body)
  }

  build(type) {
    switch (type) {
      case 'd6':
        return buildD6()
      case 'd20':
        return buildD20()
      default:
        throw new Error(`Tipo de dado inválido: ${type}`)
    }
  }

  createBody({ shape, world }) {
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
    body.position.set(
      (Math.random() - 0.5) * 4,
      8 + Math.random() * 2,
      (Math.random() - 0.5) * 4
    )

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

    if (!this.resolved && this.body.sleepState === CANNON.Body.SLEEPING) {
      this.resolveResult()
    }
  }

  resolveResult() {
    if (this.type === 'd6') {
      this.result = this.detectD6Result()
    }

    if (this.type === 'd20') {
      this.result = this.detectPolyhedronResult()
    }

    this.resolved = true

    if (this.onResolved) {
      this.onResolved(this)
    }
  }

  detectD6Result() {
    const up = new THREE.Vector3(0, 1, 0)

    const directions = [
      { value: 1, vector: new THREE.Vector3(0, 1, 0) },
      { value: 6, vector: new THREE.Vector3(0, -1, 0) },
      { value: 2, vector: new THREE.Vector3(1, 0, 0) },
      { value: 5, vector: new THREE.Vector3(-1, 0, 0) },
      { value: 3, vector: new THREE.Vector3(0, 0, 1) },
      { value: 4, vector: new THREE.Vector3(0, 0, -1) }
    ]

    let bestDot = -Infinity
    let result = 1

    directions.forEach((face) => {
      const worldVector = face.vector.clone()
      worldVector.applyQuaternion(this.mesh.quaternion)

      const dot = worldVector.dot(up)

      if (dot > bestDot) {
        bestDot = dot
        result = face.value
      }
    })

    return result
  }

  detectPolyhedronResult() {
    const upDirection = new CANNON.Vec3(0, 1, 0)

    let bestDot = -Infinity
    let result = 1

    this.faceNormals.forEach((normal, index) => {
      const localNormal = new CANNON.Vec3(normal[0], normal[1], normal[2])
      const worldNormal = new CANNON.Vec3()

      this.body.quaternion.vmult(localNormal, worldNormal)

      const dot = worldNormal.dot(upDirection)

      if (dot > bestDot) {
        bestDot = dot
        result = this.faceValues[index]
      }
    })

    return result
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
    }
  }
}