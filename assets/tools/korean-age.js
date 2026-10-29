(function () {
  const form = document.getElementById('tool-form');
  const { koreanAge } = window.ToolLogic;

  function years(value) {
    return ToolUI.label('ageFormat').replace('{n}', ToolUI.fmt(value));
  }

  function update() {
    const birth = document.getElementById('birth').value;
    const on = document.getElementById('on').value;

    if (!birth || !on) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const result = koreanAge({ birth, on });
    if (result.error) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, result.error === 'birth_after_base' ? 'errorBirthAfterBase' : 'errorInvalidDate');
      return;
    }

    ToolUI.clearErrors(form);
    ToolUI.setOutput('manAge', years(result.manAge));
    ToolUI.setOutput('yearAge', years(result.yearAge));
    ToolUI.setOutput('countingAge', years(result.countingAge));
    ToolUI.setOutput(
      'daysToBirthday',
      result.daysToBirthday === 0
        ? ToolUI.label('birthdayToday')
        : ToolUI.label(result.daysToBirthday === 1 ? 'dayFormatOne' : 'daysFormat').replace('{n}', ToolUI.fmt(result.daysToBirthday))
    );
  }

  ToolUI.defaultToday('on');
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
