(function () {
  const form = document.getElementById('tool-form');
  const { militaryService } = window.ToolLogic;
  const lang = document.documentElement.lang;
  const dateFormat = new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  });

  function days(value) {
    return ToolUI.label(value === 1 ? 'dayFormatOne' : 'daysFormat').replace('{n}', ToolUI.fmt(value));
  }

  function update() {
    const enlist = document.getElementById('enlist').value;
    const branch = document.getElementById('branch').value;
    const on = document.getElementById('on').value;

    if (!enlist || !on) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const result = militaryService({ enlist, branch, on });
    if (result.error) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, 'errorInvalidDate');
      return;
    }

    ToolUI.clearErrors(form);
    ToolUI.setOutput('discharge', dateFormat.format(new Date(`${result.discharge}T00:00:00Z`)));
    ToolUI.setOutput(
      'remaining',
      result.remainingDays === 0 ? ToolUI.label('dischargedText') : `D-${ToolUI.fmt(result.remainingDays)}`
    );
    ToolUI.setOutput('served', `${days(result.servedDays)} / ${days(result.totalDays)}`);
    ToolUI.setOutput('percent', `${ToolUI.fmtMoney(result.percent, 1)}%`);
  }

  ToolUI.defaultToday('on');
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
