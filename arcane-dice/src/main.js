import './style.css'

import { createRenderer } from './core/renderer'
import { createScene } from './core/scene'
import { createCamera } from './core/camera'
import { createPhysicsWorld } from './core/physics'
import { startGameLoop } from './core/gameLoop'
import { createTable } from './core/table'

import { Die } from './dice/Die'

import { createHUD } from './ui/createHUD'
import { createSelectionUI } from './ui/selectionUI'
import { createResultBanner } from './ui/resultBanner'
import { createHistory } from './ui/history'

const hud = createHUD(document.querySelector('#app'))

const renderer = createRenderer()
hud.canvasContainer.appendChild(renderer.domElement)

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

const selectionUI = createSelectionUI({
  selection,
  dieButtons: hud.dieButtons,
  dieCounts: hud.dieCounts,
  formula: hud.formula,
  modifierInput: hud.modifierInput,
  modMinusButton: hud.modMinusButton,
  modPlusButton: hud.modPlusButton
})

const resultBanner = createResultBanner({
  banner: hud.resultBanner,
  total: hud.resultTotal,
  breakdown: hud.resultBreakdown
})

const history = createHistory({
  list: hud.historyList,
  formulaFromSelection: selectionUI.formulaFromSelection
})

hud.rollButton.addEventListener('click', () => {
  rollSelectedDice()
})

hud.clearButton.addEventListener('click', () => {
  clearDice()
  selectionUI.clearSelection()
})

function rollSelectedDice() {
  if (rolling) return
  if (!selectionUI.hasSelection()) return

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

  const modifier = selectionUI.getModifier()
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

  resultBanner.showResult(total, fullBreakdown)
  history.addHistory(total, fullBreakdown)
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

startGameLoop({
  renderer,
  scene,
  camera,
  world,
  updatables
})
