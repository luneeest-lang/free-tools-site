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
