(function () {
  const form = document.getElementById('tool-form');
  const { convertWage } = window.ToolLogic;

  function won(value) {
    return ToolUI.label('wonFormat').replace('{n}', ToolUI.fmt(value));
  }

  function update() {
    const mode = document.getElementById('mode').value;
    const amount = ToolUI.num('amount');
    const weeklyHours = ToolUI.num('weeklyHours');
    const includeHoliday = document.getElementById('includeHoliday').checked;

    if (amount === null || weeklyHours === null) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const result = convertWage({ mode, amount, weeklyHours, includeHoliday });
    if (result.error) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, result.error === 'invalid_hours' ? 'errorInvalidHours' : 'errorInvalidAmount');
      return;
    }

    ToolUI.clearErrors(form);
    const primary = mode === 'hourlyToMonthly' ? result.monthly : result.hourly;
    const prefix = ToolUI.label(mode === 'hourlyToMonthly' ? 'monthlyPrefix' : 'hourlyPrefix');
    ToolUI.setOutput('result', `${prefix} ${won(primary)}`);
    ToolUI.setOutput('weeklyHolidayPay', won(result.weeklyHolidayPay));
    ToolUI.setOutput('monthlyHours', ToolUI.label('hoursFormat').replace('{n}', ToolUI.fmt(result.monthlyHours)));
    ToolUI.setOutput('annual', won(result.annual));
  }

  ToolUI.bindAmount('amount');
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
