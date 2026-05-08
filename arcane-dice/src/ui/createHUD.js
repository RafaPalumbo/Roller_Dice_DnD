export function createHUD(root) {
  root.innerHTML = `
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

  return {
    canvasContainer: root.querySelector('#canvas-container'),
    dieButtons: root.querySelectorAll('.die-button'),
    formula: root.querySelector('#formula'),
    dieCounts: {
      d6: root.querySelector('#count-d6'),
      d20: root.querySelector('#count-d20')
    },
    rollButton: root.querySelector('#roll-button'),
    clearButton: root.querySelector('#clear-button'),
    modifierInput: root.querySelector('#modifier'),
    modMinusButton: root.querySelector('#mod-minus'),
    modPlusButton: root.querySelector('#mod-plus'),
    resultBanner: root.querySelector('#result-banner'),
    resultTotal: root.querySelector('#result-total'),
    resultBreakdown: root.querySelector('#result-breakdown'),
    historyList: root.querySelector('#history-list')
  }
}
