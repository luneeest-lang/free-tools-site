(function () {
  const form = document.getElementById('tool-form');
  const { severancePeriod, severancePay } = window.ToolLogic;

  function optionalAmount(value) {
    return value === null ? 0 : value;
  }

  function validAmount(value, required) {
    if (value === null) return !required;
    return ToolUI.isNumber(value) && value >= 0;
  }

  function update() {
    const hireDate = document.getElementById('hireDate').value;
    const leaveDate = document.getElementById('leaveDate').value;
    const wages = ToolUI.num('wages');
    const bonus = ToolUI.num('annualBonus');
    const leavePay = ToolUI.num('annualLeavePay');

    ToolUI.clearErrors(form);
    ToolUI.clearOutputs(form);

    if (!hireDate || !leaveDate) {
      return;
    }

    const period = severancePeriod({ hireDate, leaveDate });
    if (period.error === 'leave_before_hire') {
      ToolUI.showError(form, 'errorDateOrder');
      return;
    }
    if (period.error) {
      ToolUI.showError(form, 'errorInvalid');
      return;
    }

    const days = ToolUI.label('periodDaysFormat').replace('{days}', ToolUI.fmt(period.daysLast3Months));
    ToolUI.setOutput('daysWorked', ToolUI.fmt(period.daysWorked));
    ToolUI.setOutput('period', `${period.periodStart} ~ ${period.periodEnd} (${days})`);

    if (wages === null && bonus === null && leavePay === null) {
      return;
    }
    if (!validAmount(wages, true) || !validAmount(bonus, false) || !validAmount(leavePay, false)) {
      ToolUI.showError(form, 'errorInvalid');
      return;
    }

    const result = severancePay({
      wagesLast3Months: wages,
      daysLast3Months: period.daysLast3Months,
      daysWorked: period.daysWorked,
      annualBonus: optionalAmount(bonus),
      annualLeavePay: optionalAmount(leavePay),
    });
    ToolUI.setOutput('dailyWage', ToolUI.fmt(Math.round(result.averageDailyWage)));
    if (!result.eligible) {
      ToolUI.showError(form, 'noticeUnderOneYear');
      return;
    }
    ToolUI.setOutput('severance', ToolUI.fmt(result.severance));
  }

  ToolUI.bindAmount('wages');
  ToolUI.bindAmount('annualBonus');
  ToolUI.bindAmount('annualLeavePay');
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
