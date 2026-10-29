(function () {
  const form = document.getElementById('tool-form');
  const { convertArea } = window.ToolLogic;

  function update() {
    const mode = document.getElementById('mode').value;
    const value = ToolUI.num('value');

    if (value === null) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const result = convertArea({ mode, value });
    if (result.error) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, 'errorInvalid');
      return;
    }

    ToolUI.clearErrors(form);
    const format = ToolUI.label(mode === 'pyeongToSqm' ? 'sqmFormat' : 'pyeongFormat');
    ToolUI.setOutput('result', format.replace('{n}', ToolUI.fmtMoney(result.result, 2)));
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
