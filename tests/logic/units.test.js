const { test } = require('node:test');
const assert = require('node:assert/strict');
const { convertArea, percentCalc } = require('../../src/logic/units');

test('평을 제곱미터로, 제곱미터를 평으로 바꾼다', () => {
  assert.ok(Math.abs(convertArea({ mode: 'pyeongToSqm', value: 1 }).result - 400 / 121) < 1e-12);
  assert.ok(Math.abs(convertArea({ mode: 'pyeongToSqm', value: 30 }).result - 99.17355371900827) < 1e-9);
  assert.equal(convertArea({ mode: 'sqmToPyeong', value: 84 }).result, 25.41);
});

test('면적이 0 이하이거나 모드가 없으면 오류', () => {
  assert.equal(convertArea({ mode: 'pyeongToSqm', value: 0 }).error, 'invalid_value');
  assert.equal(convertArea({ mode: 'acres', value: 1 }).error, 'invalid_mode');
});

test('퍼센트 계산 네 가지', () => {
  assert.equal(percentCalc({ mode: 'percentOf', a: 200, b: 15 }).result, 30);
  assert.equal(percentCalc({ mode: 'whatPercent', a: 30, b: 200 }).result, 15);
  assert.equal(percentCalc({ mode: 'change', a: 200, b: 250 }).result, 25);
  assert.equal(percentCalc({ mode: 'change', a: 200, b: 150 }).result, -25);
  assert.equal(percentCalc({ mode: 'applyChange', a: 200, b: -10 }).result, 180);
});

test('0으로 나누는 퍼센트 계산은 오류', () => {
  assert.equal(percentCalc({ mode: 'whatPercent', a: 30, b: 0 }).error, 'divide_by_zero');
  assert.equal(percentCalc({ mode: 'change', a: 0, b: 10 }).error, 'divide_by_zero');
});
