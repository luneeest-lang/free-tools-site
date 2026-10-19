(function () {
  const form = document.getElementById('tool-form');
  const { monthlyPayment } = window.ToolLogic;

  function update() {
    const principal = ToolUI.num('principal');
    const rate = ToolUI.num('rate');
    const months = ToolUI.num('months');

    if (principal === null && rate === null && months === null) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const valid =
      ToolUI.isNumber(principal) && principal > 0 &&
      ToolUI.isNumber(rate) && rate >= 0 &&
      ToolUI.isNumber(months) && months > 0 && Number.isInteger(months);

    if (!valid) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, 'errorInvalid');
      return;
    }

    const result = monthlyPayment({ principal, annualRatePercent: rate, months });
    ToolUI.clearErrors(form);
    ToolUI.setOutput('payment', ToolUI.fmt(result.payment));
    ToolUI.setOutput('totalInterest', ToolUI.fmt(result.totalInterest));
    ToolUI.setOutput('totalPayment', ToolUI.fmt(result.totalPayment));
  }

  ToolUI.bindAmount('principal');
  form.addEventListener('input', update);
  update();
})();
