(function () {
  const form = document.getElementById('tool-form');
  const { bmi, bmiCategory } = window.ToolLogic;
  const standard = document.documentElement.lang === 'ko' ? 'korea' : 'who';
  const CATEGORY_KEY = {
    underweight: 'categoryUnderweight',
    normal: 'categoryNormal',
    overweight: 'categoryOverweight',
    obese: 'categoryObese',
    preObese: 'categoryPreObese',
    obese1: 'categoryObese1',
    obese2: 'categoryObese2',
    obese3: 'categoryObese3',
  };

  function update() {
    const height = ToolUI.num('height');
    const weight = ToolUI.num('weight');

    if (height === null && weight === null) {
      ToolUI.clearErrors(form);
      ToolUI.clearOutputs(form);
      return;
    }

    const value = bmi({ heightCm: height, weightKg: weight });
    if (value === null || !ToolUI.isNumber(value)) {
      ToolUI.clearOutputs(form);
      ToolUI.showError(form, 'errorInvalid');
      return;
    }

    ToolUI.clearErrors(form);
    ToolUI.setOutput('bmi', value.toFixed(1));
    ToolUI.setOutput('category', ToolUI.label(CATEGORY_KEY[bmiCategory(value, standard)]));
  }

  form.addEventListener('input', update);
  update();
})();
