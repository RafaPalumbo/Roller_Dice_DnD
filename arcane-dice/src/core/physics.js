import * as CANNON from 'cannon-es'

const TABLE_WIDTH = 28
const TABLE_HEIGHT = 18

export function createPhysicsWorld() {
  const world = new CANNON.World()

  world.gravity.set(0, -20, 0)

  world.broadphase = new CANNON.SAPBroadphase(world)
  world.solver.iterations = 50
  world.solver.tolerance = 0.001
  world.allowSleep = true

  const floorMaterial = new CANNON.Material('floorMaterial')
  const diceMaterial = new CANNON.Material('diceMaterial')

  world.addContactMaterial(
    new CANNON.ContactMaterial(floorMaterial, diceMaterial, {
      friction: 0.6,
      restitution: 0.3
    })
  )

  world.addContactMaterial(
    new CANNON.ContactMaterial(diceMaterial, diceMaterial, {
      friction: 0.3,
      restitution: 0.4
    })
  )

  createFloor(world, floorMaterial)
  createWalls(world, floorMaterial)

  world.userData = {
    diceMaterial
  }

  return world
}

function createFloor(world, material) {
  const floorBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    material
  })

  const floorShape = new CANNON.Plane()

  floorBody.addShape(floorShape)

  floorBody.quaternion.setFromEuler(
    -Math.PI / 2,
    0,
    0
  )

  world.addBody(floorBody)
}

function createWalls(world, material) {
  const wallShape = new CANNON.Plane()

  const walls = [
    {
      position: [0, 0, -TABLE_HEIGHT / 2 + 0.2],
      rotation: [0, 0, 0]
    },
    {
      position: [0, 0, TABLE_HEIGHT / 2 - 0.2],
      rotation: [0, Math.PI, 0]
    },
    {
      position: [-TABLE_WIDTH / 2 + 0.2, 0, 0],
      rotation: [0, Math.PI / 2, 0]
    },
    {
      position: [TABLE_WIDTH / 2 - 0.2, 0, 0],
      rotation: [0, -Math.PI / 2, 0]
    }
  ]

  walls.forEach((wall) => {
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      material
    })

    body.addShape(wallShape)
    body.position.set(...wall.position)
    body.quaternion.setFromEuler(...wall.rotation)

    world.addBody(body)
  })
}