import './style.css'

import { createRenderer } from './core/renderer'
import { createScene } from './core/scene'
import { createCamera } from './core/camera'
import { createPhysicsWorld } from './core/physics'
import { startGameLoop } from './core/gameLoop'
import { createTable } from './core/table'

import { Die } from './dice/Die'

document.querySelector('#app').innerHTML = `
  <div id="ui">
    <h1>Arcane Dice</h1>

    <div class="dice-selector">
      <button class="die-button" data-die="d6">d6 <span id="count-d6">0</span></button>
      <button class="die-button" data-die="d20">d20 <span id="count-d20">0</span></button>
    </div>

    <div id="modifier-box">
      <button id="mod-minus">−</button>
      <input id="modifier" type="number" value="0" />
      <button id="mod-plus">+</button>
    </div>

    <div id="formula">— nenhum dado selecionado —</div>

    <button id="roll-button">Rolar</button>
    <button id="clear-button">Limpar</button>
  </div>

  <div id="result-banner">
    <div id="result-label">Resultado</div>
    <div id="result-total">0</div>
    <div id="result-breakdown"></div>
  </div>

  <aside id="history">
    <h2>Histórico</h2>
    <ul id="history-list"></ul>
  </aside>

  <div id="canvas-container"></div>
`

const container = document.querySelector('#canvas-container')

const renderer = createRenderer()
container.appendChild(renderer.domElement)

const scene = createScene()
const camera = createCamera()
const world = createPhysicsWorld()

createTable(scene)

const updatables = []
const dice = []

const selection = {
  d6: 0,
  d20: 0
}

let currentRollDice = []
let rolling = false

const formulaEl = document.querySelector('#formula')
const countD6El = document.querySelector('#count-d6')
const countD20El = document.querySelector('#count-d20')
const rollButton = document.querySelector('#roll-button')
const clearButton = document.querySelector('#clear-button')
const modifierInput = document.querySelector('#modifier')
const modMinusButton = document.querySelector('#mod-minus')
const modPlusButton = document.querySelector('#mod-plus')
const resultBanner = document.querySelector('#result-banner')
const resultTotalEl = document.querySelector('#result-total')
const resultBreakdownEl = document.querySelector('#result-breakdown')
const historyList = document.querySelector('#history-list')

document.querySelectorAll('.die-button').forEach((button) => {
  button.addEventListener('click', () => {
    const dieType = button.dataset.die
    selection[dieType] += 1
    updateSelectionUI()
  })

  button.addEventListener('contextmenu', (event) => {
    event.preventDefault()

    const dieType = button.dataset.die

    if (selection[dieType] > 0) {
      selection[dieType] -= 1
    }

    updateSelectionUI()
  })
})

modMinusButton.addEventListener('click', () => {
  modifierInput.value = getModifier() - 1
  updateSelectionUI()
})

modPlusButton.addEventListener('click', () => {
  modifierInput.value = getModifier() + 1
  updateSelectionUI()
})

modifierInput.addEventListener('input', () => {
  updateSelectionUI()
})

rollButton.addEventListener('click', () => {
  rollSelectedDice()
})

clearButton.addEventListener('click', () => {
  clearDice()
  clearSelection()
})

function rollSelectedDice() {
  if (rolling) return
  if (!hasSelection()) return

  clearDice()

  rolling = true
  currentRollDice = []

  Object.entries(selection).forEach(([type, amount]) => {
    for (let i = 0; i < amount; i++) {
      const die = new Die({
        type,
        scene,
        world,
        onResolved: handleDieResolved
      })

      dice.push(die)
      updatables.push(die)
      currentRollDice.push(die)
    }
  })
}

function handleDieResolved() {
  const allResolved = currentRollDice.every((die) => die.resolved)

  if (!allResolved) return

  rolling = false

  const resultsByType = {}

  currentRollDice.forEach((die) => {
    if (!resultsByType[die.type]) {
      resultsByType[die.type] = []
    }

    resultsByType[die.type].push(die.result)
  })

  const diceTotal = currentRollDice.reduce((sum, die) => {
    return sum + die.result
  }, 0)

  const modifier = getModifier()
  const total = diceTotal + modifier

  const breakdown = Object.entries(resultsByType)
    .map(([type, results]) => {
      return `${results.length}${type} [${results.join(' + ')}]`
    })
    .join(' + ')

  const fullBreakdown =
    modifier === 0
      ? breakdown
      : `${breakdown} ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}`

  showResult(total, fullBreakdown)
  addHistory(total, fullBreakdown)
}

function showResult(total, breakdown) {
  resultTotalEl.textContent = total
  resultBreakdownEl.textContent = breakdown

  resultBanner.classList.add('show')

  clearTimeout(showResult.timeout)

  showResult.timeout = setTimeout(() => {
    resultBanner.classList.remove('show')
  }, 3500)
}

function addHistory(total, breakdown) {
  const item = document.createElement('li')

  item.innerHTML = `
    <div class="history-formula">${formulaFromSelection()}</div>
    <strong>${total}</strong>
    <div class="history-breakdown">${breakdown}</div>
  `

  historyList.prepend(item)

  while (historyList.children.length > 20) {
    historyList.removeChild(historyList.lastChild)
  }
}

function clearDice() {
  dice.forEach((die) => {
    die.destroy()
  })

  dice.length = 0
  updatables.length = 0
  currentRollDice = []
  rolling = false
}

function clearSelection() {
  selection.d6 = 0
  selection.d20 = 0
  modifierInput.value = 0
  updateSelectionUI()
}

function hasSelection() {
  return Object.values(selection).some((amount) => amount > 0)
}

function getModifier() {
  return Number.parseInt(modifierInput.value || '0', 10) || 0
}

function updateSelectionUI() {
  countD6El.textContent = selection.d6
  countD20El.textContent = selection.d20

  formulaEl.textContent = formulaFromSelection() || '— nenhum dado selecionado —'
}

function formulaFromSelection() {
  const parts = []

  if (selection.d6 > 0) parts.push(`${selection.d6}d6`)
  if (selection.d20 > 0) parts.push(`${selection.d20}d20`)

  const modifier = getModifier()

  if (modifier !== 0 && parts.length > 0) {
    parts.push(`${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}`)
  }

  return parts.join(' ')
}

updateSelectionUI()

startGameLoop({
  renderer,
  scene,
  camera,
  world,
  updatables
})