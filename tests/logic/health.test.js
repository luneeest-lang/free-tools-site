const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bmi, bmiCategory } = require('../../src/logic/health');

test('키 170cm, 몸무게 65kg이면 BMI 22.5', () => {
  assert.equal(bmi({ heightCm: 170, weightKg: 65 }), 22.5);
});

test('키가 0이면 null', () => {
  assert.equal(bmi({ heightCm: 0, weightKg: 65 }), null);
});

test('경계값은 아래 등급에 넣지 않는다', () => {
  assert.equal(bmiCategory(18.4), 'underweight');
  assert.equal(bmiCategory(18.5), 'normal');
  assert.equal(bmiCategory(25), 'overweight');
  assert.equal(bmiCategory(30), 'obese');
});
