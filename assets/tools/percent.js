(function () {
  const form = document.getElementById('tool-form');
  const { percentCalc } = window.ToolLogic;

  // Round to at most 4 decimals without trailing zeros.
  function number(value) {
    return new Intl.NumberFormat(document.documentElement.lang, { maximumFractionDigits: 4 }).format(value);
  }

  function update() {
    const mode = document.getElementById('mode').value;
    const a = ToolUI.num('a');
    const b = ToolUI.num('b');

    if (a === null || b === null) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const result = percentCalc({ mode, a, b });
    if (result.error) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, result.error === 'divide_by_zero' ? 'errorDivideByZero' : 'errorInvalid');
      return;
    }

    ToolUI.clearErrors(form);
    const isPercent = mode === 'whatPercent' || mode === 'change';
    const sign = mode === 'change' && result.result > 0 ? '+' : '';
    ToolUI.setOutput('result', isPercent ? `${sign}${number(result.result)}%` : number(result.result));
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
