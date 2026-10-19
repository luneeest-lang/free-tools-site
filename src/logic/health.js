function bmi({ heightCm, weightKg }) {
  if (!(heightCm > 0) || !(weightKg > 0)) {
    return null;
  }
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function bmiCategory(value, standard = 'who') {
  if (standard === 'korea') {
    if (value < 18.5) return 'underweight';
    if (value < 23) return 'normal';
    if (value < 25) return 'preObese';
    if (value < 30) return 'obese1';
    if (value < 35) return 'obese2';
    return 'obese3';
  }
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'normal';
  if (value < 30) return 'overweight';
  return 'obese';
}

const api = { bmi, bmiCategory };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.ToolLogic = Object.assign(window.ToolLogic || {}, api);
