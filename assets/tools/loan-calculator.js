(function () {
  const form = document.getElementById('tool-form');
  const { monthlyPayment } = window.ToolLogic;
  const decimals = document.documentElement.lang === 'ko' ? 0 : 2;

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

    const result = monthlyPayment({ principal, annualRatePercent: rate, months, decimals });
    ToolUI.clearErrors(form);
    ToolUI.setOutput('payment', ToolUI.fmtMoney(result.payment, decimals));
    ToolUI.setOutput('totalInterest', ToolUI.fmtMoney(result.totalInterest, decimals));
    ToolUI.setOutput('totalPayment', ToolUI.fmtMoney(result.totalPayment, decimals));
  }

  ToolUI.bindAmount('principal');
  form.addEventListener('input', update);
  update();
})();
