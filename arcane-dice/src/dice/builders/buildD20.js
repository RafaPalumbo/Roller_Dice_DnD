import { buildPolyhedron } from './buildPolyhedron'
import { createNumberedMaterials } from '../materials/diceMaterials'

export function buildD20() {
  const phi = (1 + Math.sqrt(5)) / 2
  const norm = 1 / Math.sqrt(1 + phi * phi)

  const a = norm
  const b = phi * norm

  const vertices = [
    [-a, b, 0],
    [a, b, 0],
    [-a, -b, 0],
    [a, -b, 0],
    [0, -a, b],
    [0, a, b],
    [0, -a, -b],
    [0, a, -b],
    [b, 0, -a],
    [b, 0, a],
    [-b, 0, -a],
    [-b, 0, a]
  ]

  const faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1]
  ]

  const faceValues = [
    20, 8, 14, 1, 9,
    11, 13, 17, 5, 4,
    3, 18, 16, 12, 19,
    10, 7, 6, 2, 15
  ]

  return buildPolyhedron({
    vertices,
    faces,
    faceValues,
    materials: createNumberedMaterials(faceValues, 'd20')
  })
}