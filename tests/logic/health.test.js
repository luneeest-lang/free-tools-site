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

test('한국 기준 분류는 18.5, 23, 25, 30, 35에서 나뉜다', () => {
  assert.equal(bmiCategory(18.4, 'korea'), 'underweight');
  assert.equal(bmiCategory(18.5, 'korea'), 'normal');
  assert.equal(bmiCategory(22.9, 'korea'), 'normal');
  assert.equal(bmiCategory(23, 'korea'), 'preObese');
  assert.equal(bmiCategory(24.9, 'korea'), 'preObese');
  assert.equal(bmiCategory(25, 'korea'), 'obese1');
  assert.equal(bmiCategory(29.9, 'korea'), 'obese1');
  assert.equal(bmiCategory(30, 'korea'), 'obese2');
  assert.equal(bmiCategory(34.9, 'korea'), 'obese2');
  assert.equal(bmiCategory(35, 'korea'), 'obese3');
});

test('기준을 지정하지 않으면 WHO 분류를 쓴다', () => {
  assert.equal(bmiCategory(27), 'overweight');
  assert.equal(bmiCategory(27, 'who'), 'overweight');
});
