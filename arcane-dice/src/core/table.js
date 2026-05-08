import * as THREE from 'three'

const TABLE_WIDTH = 28
const TABLE_HEIGHT = 18

export function createTable(scene) {
  const tableTexture = generateTableTexture()

  const tableGeometry = new THREE.PlaneGeometry(
    TABLE_WIDTH,
    TABLE_HEIGHT
  )

  const tableMaterial = new THREE.MeshStandardMaterial({
    map: tableTexture,
    roughness: 0.95,
    metalness: 0
  })

  const table = new THREE.Mesh(
    tableGeometry,
    tableMaterial
  )

  table.rotation.x = -Math.PI / 2
  table.receiveShadow = true

  scene.add(table)

  createBorders(scene)

  return table
}

function generateTableTexture() {
  const size = 512

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.1,
    size / 2,
    size / 2,
    size * 0.7
  )

  gradient.addColorStop(0, '#5C5650')
  gradient.addColorStop(0.7, '#4A4540')
  gradient.addColorStop(1, '#3A3530')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16

    data[i] = clamp(data[i] + noise)
    data[i + 1] = clamp(data[i + 1] + noise)
    data[i + 2] = clamp(data[i + 2] + noise)
  }

  ctx.putImageData(imageData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  return texture
}

function clamp(value) {
  return Math.max(0, Math.min(255, value))
}

function createBorders(scene) {
  const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a0000,
    roughness: 0.7,
    metalness: 0.1
  })

  const horizontalGeometry = new THREE.BoxGeometry(
    TABLE_WIDTH,
    0.6,
    0.4
  )

  const north = new THREE.Mesh(horizontalGeometry, borderMaterial)
  north.position.set(0, 0.3, -TABLE_HEIGHT / 2)

  const south = new THREE.Mesh(horizontalGeometry, borderMaterial)
  south.position.set(0, 0.3, TABLE_HEIGHT / 2)

  const verticalGeometry = new THREE.BoxGeometry(
    0.4,
    0.6,
    TABLE_HEIGHT
  )

  const east = new THREE.Mesh(verticalGeometry, borderMaterial)
  east.position.set(TABLE_WIDTH / 2, 0.3, 0)

  const west = new THREE.Mesh(verticalGeometry, borderMaterial)
  west.position.set(-TABLE_WIDTH / 2, 0.3, 0)

  const borders = [north, south, east, west]

  borders.forEach((border) => {
    border.castShadow = true
    border.receiveShadow = true
    scene.add(border)
  })
}