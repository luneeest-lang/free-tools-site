(function () {
  const form = document.getElementById('tool-form');
  const { addDays } = window.ToolLogic;
  const lang = document.documentElement.lang;
  const dateFormat = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const weekdayFormat = new Intl.DateTimeFormat(lang, { weekday: 'long', timeZone: 'UTC' });

  function update() {
    const start = document.getElementById('start').value;
    const days = ToolUI.num('days');
    const includeStart = document.getElementById('includeStart').checked;

    if (!start || days === null) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const result = addDays({ start, days, includeStart });
    if (result.error) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, result.error === 'invalid_date' ? 'errorInvalidDate' : 'errorInvalidDays');
      return;
    }

    const date = new Date(`${result.date}T00:00:00Z`);
    ToolUI.clearErrors(form);
    ToolUI.setOutput('resultDate', dateFormat.format(date));
    ToolUI.setOutput('weekday', weekdayFormat.format(date));
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
