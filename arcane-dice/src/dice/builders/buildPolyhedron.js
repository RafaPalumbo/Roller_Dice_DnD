import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export function buildPolyhedron({
  vertices,
  faces,
  faceValues,
  materials
}) {
  const positions = []
  const indices = []
  const uvs = []
  const faceNormals = []

  const center = new THREE.Vector3()

  vertices.forEach((vertex) => {
    center.add(new THREE.Vector3(...vertex))
  })

  center.divideScalar(vertices.length)

  const cleanFaces = faces.map((face) => {
    const v0 = new THREE.Vector3(...vertices[face[0]])
    const v1 = new THREE.Vector3(...vertices[face[1]])
    const v2 = new THREE.Vector3(...vertices[face[2]])

    const edge1 = new THREE.Vector3().subVectors(v1, v0)
    const edge2 = new THREE.Vector3().subVectors(v2, v0)

    const normal = new THREE.Vector3()
      .crossVectors(edge1, edge2)
      .normalize()

    const toFace = new THREE.Vector3().subVectors(v0, center)

    if (normal.dot(toFace) < 0) {
      return [...face].reverse()
    }

    return face
  })

  let groupStart = 0

  cleanFaces.forEach((face, faceIndex) => {
    const faceVertices = face.map((index) => {
      return new THREE.Vector3(...vertices[index])
    })

    const edge1 = new THREE.Vector3().subVectors(
      faceVertices[1],
      faceVertices[0]
    )

    const edge2 = new THREE.Vector3().subVectors(
      faceVertices[2],
      faceVertices[0]
    )

    const normal = new THREE.Vector3()
      .crossVectors(edge1, edge2)
      .normalize()

    faceNormals.push([
      normal.x,
      normal.y,
      normal.z
    ])

    const faceCenter = new THREE.Vector3()

    faceVertices.forEach((vertex) => {
      faceCenter.add(vertex)
    })

    faceCenter.divideScalar(faceVertices.length)

    const uAxis = edge1.clone().normalize()

    const vAxis = new THREE.Vector3()
      .crossVectors(normal, uAxis)
      .normalize()

    const local2D = faceVertices.map((vertex) => {
      const delta = new THREE.Vector3().subVectors(
        vertex,
        faceCenter
      )

      return [
        delta.dot(uAxis),
        delta.dot(vAxis)
      ]
    })

    let maxDistance = 0

    local2D.forEach(([u, v]) => {
      const distance = Math.sqrt(u * u + v * v)

      if (distance > maxDistance) {
        maxDistance = distance
      }
    })

    const range = maxDistance * 2 || 1
    const baseIndex = positions.length / 3

    faceVertices.forEach((vertex, vertexIndex) => {
      positions.push(vertex.x, vertex.y, vertex.z)

      const [u, v] = local2D[vertexIndex]

      uvs.push(
        0.5 + (u / range) * 0.9,
        0.5 + (v / range) * 0.9
      )
    })

    let triangleCount = 0

    for (let i = 1; i < face.length - 1; i++) {
      indices.push(
        baseIndex,
        baseIndex + i,
        baseIndex + i + 1
      )

      triangleCount += 3
    }

    geometryGroup(faceIndex, groupStart, triangleCount)
    groupStart += triangleCount
  })

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  )

  geometry.setAttribute(
    'uv',
    new THREE.Float32BufferAttribute(uvs, 2)
  )

  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  cleanFaces.forEach((face, faceIndex) => {
    const count = (face.length - 2) * 3
    const start = cleanFaces
      .slice(0, faceIndex)
      .reduce((sum, currentFace) => {
        return sum + (currentFace.length - 2) * 3
      }, 0)

    geometry.addGroup(start, count, faceIndex)
  })

  const mesh = new THREE.Mesh(geometry, materials)

  mesh.castShadow = true
  mesh.receiveShadow = true

  const cannonVertices = vertices.map((vertex) => {
    return new CANNON.Vec3(...vertex)
  })

  const cannonFaces = cleanFaces.map((face) => [...face])

  const shape = new CANNON.ConvexPolyhedron({
    vertices: cannonVertices,
    faces: cannonFaces
  })

  return {
    mesh,
    shape,
    faceNormals,
    faceValues
  }
}

function geometryGroup() {}