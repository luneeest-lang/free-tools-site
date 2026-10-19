(function () {
  const form = document.getElementById('tool-form');
  const { severancePay } = window.ToolLogic;

  function update() {
    const wages = ToolUI.num('wages');
    const daysLast3 = ToolUI.num('daysLast3');
    const daysWorked = ToolUI.num('daysWorked');

    if (wages === null && daysLast3 === null && daysWorked === null) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const valid =
      ToolUI.isNumber(wages) && wages >= 0 &&
      ToolUI.isNumber(daysLast3) && daysLast3 > 0 &&
      ToolUI.isNumber(daysWorked) && daysWorked > 0;

    if (!valid) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, 'errorInvalid');
      return;
    }

    const result = severancePay({
      wagesLast3Months: wages,
      daysLast3Months: daysLast3,
      daysWorked,
    });
    ToolUI.clearErrors(form);
    ToolUI.setOutput('severance', ToolUI.fmt(Math.round(result.severance)));
    ToolUI.setOutput('dailyWage', ToolUI.fmt(Math.round(result.averageDailyWage)));
  }

  ToolUI.bindAmount('wages');
  form.addEventListener('input', update);
  update();
})();
