function bmi({ heightCm, weightKg }) {
  if (!(heightCm > 0) || !(weightKg > 0)) {
    return null;
  }
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function bmiCategory(value) {
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'normal';
  if (value < 30) return 'overweight';
  return 'obese';
}

module.exports = { bmi, bmiCategory };
