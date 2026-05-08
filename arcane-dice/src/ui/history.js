export function createHistory({ list, formulaFromSelection }) {
  function addHistory(total, breakdown) {
    const item = document.createElement('li')

    item.innerHTML = `
      <div class="history-formula">${formulaFromSelection()}</div>
      <strong>${total}</strong>
      <div class="history-breakdown">${breakdown}</div>
    `

    list.prepend(item)

    while (list.children.length > 20) {
      list.removeChild(list.lastChild)
    }
  }

  return {
    addHistory
  }
}
