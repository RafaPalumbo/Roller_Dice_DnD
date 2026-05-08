export function createSelectionUI({
  selection,
  dieButtons,
  dieCounts,
  formula,
  modifierInput,
  modMinusButton,
  modPlusButton,
  onChange
}) {
  dieButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const dieType = button.dataset.die
      selection[dieType] += 1
      update()
    })

    button.addEventListener('contextmenu', (event) => {
      event.preventDefault()

      const dieType = button.dataset.die

      if (selection[dieType] > 0) {
        selection[dieType] -= 1
      }

      update()
    })
  })

  modMinusButton.addEventListener('click', () => {
    modifierInput.value = getModifier() - 1
    update()
  })

  modPlusButton.addEventListener('click', () => {
    modifierInput.value = getModifier() + 1
    update()
  })

  modifierInput.addEventListener('input', () => {
    update()
  })

  function getModifier() {
    return Number.parseInt(modifierInput.value || '0', 10) || 0
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

  function hasSelection() {
    return Object.values(selection).some((amount) => amount > 0)
  }

  function clearSelection() {
    selection.d6 = 0
    selection.d20 = 0
    modifierInput.value = 0
    update()
  }

  function update() {
    Object.entries(dieCounts).forEach(([type, countElement]) => {
      countElement.textContent = selection[type]
    })

    formula.textContent = formulaFromSelection() || '— nenhum dado selecionado —'

    onChange?.()
  }

  update()

  return {
    clearSelection,
    formulaFromSelection,
    getModifier,
    hasSelection,
    update
  }
}
