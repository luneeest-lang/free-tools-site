(function () {
  const form = document.getElementById('tool-form');
  const { dateDiff } = window.ToolLogic;

  function update() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start && !end) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const result = dateDiff({ start, end });
    if (result.error === 'end_before_start') {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, 'errorEndBeforeStart');
      return;
    }
    if (result.error) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, 'errorInvalidDate');
      return;
    }

    ToolUI.clearErrors(form);
    ToolUI.setOutput('days', ToolUI.fmt(result.days));
    ToolUI.setOutput('weeks', ToolUI.fmt(result.weeks));
  }

  form.addEventListener('input', update);
  update();
})();
