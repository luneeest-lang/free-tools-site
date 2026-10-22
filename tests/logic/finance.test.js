const { test } = require('node:test');
const assert = require('node:assert/strict');
const { monthlyPayment, severancePay } = require('../../src/logic/finance');

test('금리 0%면 원금을 기간으로 나눈다', () => {
  const r = monthlyPayment({ principal: 12000000, annualRatePercent: 0, months: 12 });
  assert.equal(r.payment, 1000000);
  assert.equal(r.totalInterest, 0);
});

test('원리금균등 상환액을 계산한다', () => {
  // 1억 원, 연 5%, 360개월
  const r = monthlyPayment({ principal: 100000000, annualRatePercent: 5, months: 360 });
  assert.equal(r.payment, 536822);
});

test('퇴직금은 평균임금 x 30 x 근속일수 / 365', () => {
  const r = severancePay({ wagesLast3Months: 9000000, daysLast3Months: 90, daysWorked: 365 });
  assert.equal(r.averageDailyWage, 100000);
  assert.equal(r.severance, 3000000);
});

test('기간이 0 이하이면 RangeError', () => {
  assert.throws(() => severancePay({ wagesLast3Months: 1, daysLast3Months: 0, daysWorked: 10 }), RangeError);
});

test('decimals 옵션으로 소수점 둘째 자리까지 계산한다', () => {
  const r = monthlyPayment({ principal: 100000, annualRatePercent: 5, months: 360, decimals: 2 });
  assert.equal(r.payment, 536.82);
  assert.equal(r.totalPayment, 193255.2);
  assert.equal(r.totalInterest, 93255.2);
});

test('decimals를 지정하지 않으면 기존처럼 정수로 반올림한다', () => {
  const r = monthlyPayment({ principal: 100000000, annualRatePercent: 5, months: 360 });
  assert.equal(r.payment, 536822);
  assert.equal(r.totalInterest, 93255920);
});

test('금리 0%에서 나누어떨어지지 않아도 총 이자는 0이다', () => {
  const whole = monthlyPayment({ principal: 100, annualRatePercent: 0, months: 3 });
  assert.equal(whole.totalInterest, 0);
  assert.equal(whole.totalPayment, 100);
  const cents = monthlyPayment({ principal: 1000, annualRatePercent: 0, months: 3, decimals: 2 });
  assert.equal(cents.payment, 333.33);
  assert.equal(cents.totalInterest, 0);
});
