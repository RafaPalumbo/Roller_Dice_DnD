import * as THREE from 'three'

export function createNumberTexture(
  number,
  {
    display = String(number),
    underline = false
  } = {}
) {
  const size = 256

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size * 0.6
  )

  gradient.addColorStop(0, '#FDFAF0')
  gradient.addColorStop(1, '#F0E8D2')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = 'rgba(120, 90, 50, 0.08)'
  ctx.fillRect(0, 0, size, 8)
  ctx.fillRect(0, size - 8, size, 8)
  ctx.fillRect(0, 0, 8, size)
  ctx.fillRect(size - 8, 0, 8, size)

  ctx.fillStyle = '#B30000'
  ctx.strokeStyle = '#7A0000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const fontSize =
    display.length === 1 ? 150 :
    display.length === 2 ? 120 :
    95

  ctx.font = `700 ${fontSize}px serif`
  ctx.lineWidth = 4

  const x = size / 2
  const y = size / 2

  ctx.strokeText(display, x, y)
  ctx.fillText(display, x, y)

  if (underline) {
    ctx.lineWidth = 6
    ctx.strokeStyle = '#B30000'

    const underlineY = y + fontSize * 0.4
    const underlineWidth = fontSize * 0.45

    ctx.beginPath()
    ctx.moveTo(x - underlineWidth / 2, underlineY)
    ctx.lineTo(x + underlineWidth / 2, underlineY)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  return texture
}

export function createNumberedMaterials(faceValues, dieType) {
  return faceValues.map((value) => {
    const underline = shouldUnderline(value, dieType)

    return new THREE.MeshStandardMaterial({
      map: createNumberTexture(value, {
        display: String(value),
        underline
      }),
      roughness: 0.45,
      metalness: 0.05,
      flatShading: true
    })
  })
}

export function createD6Materials() {
  return createNumberedMaterials(
    [1, 2, 3, 4, 5, 6],
    'd6'
  )
}

function shouldUnderline(value, dieType) {
  if (dieType === 'd6' && value === 6) return true
  if (dieType === 'd8' && value === 6) return true
  if (dieType === 'd12' && [6, 9].includes(value)) return true
  if (dieType === 'd20' && [6, 9].includes(value)) return true

  return false
}