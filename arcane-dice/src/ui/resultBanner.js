export function createResultBanner({ banner, total, breakdown }) {
  function showResult(resultTotal, resultBreakdown) {
    total.textContent = resultTotal
    breakdown.textContent = resultBreakdown

    banner.classList.add('show')

    clearTimeout(showResult.timeout)

    showResult.timeout = setTimeout(() => {
      banner.classList.remove('show')
    }, 3500)
  }

  return {
    showResult
  }
}
