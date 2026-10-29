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

const { severancePeriod } = require('../../src/logic/finance');

test('퇴직일 이전 3개월 산정 기간과 일수를 구한다', () => {
  const r = severancePeriod({ hireDate: '2025-10-01', leaveDate: '2026-10-01' });
  assert.equal(r.error, null);
  assert.equal(r.periodStart, '2026-07-01');
  assert.equal(r.periodEnd, '2026-09-30');
  assert.equal(r.daysLast3Months, 92);
  assert.equal(r.daysWorked, 365);
});

test('고용노동부 예시처럼 7월 16일 퇴직이면 4월 16일부터 7월 15일까지다', () => {
  const r = severancePeriod({ hireDate: '2023-07-16', leaveDate: '2024-07-16' });
  assert.equal(r.periodStart, '2024-04-16');
  assert.equal(r.periodEnd, '2024-07-15');
  assert.equal(r.daysLast3Months, 91);
  assert.equal(r.daysWorked, 366);
});

test('3개월 전 같은 날이 없으면 그 달의 마지막 날로 맞춘다', () => {
  const r = severancePeriod({ hireDate: '2020-01-01', leaveDate: '2026-05-31' });
  assert.equal(r.periodStart, '2026-02-28');
  assert.equal(r.periodEnd, '2026-05-30');
  assert.equal(r.daysLast3Months, 92);
});

test('퇴직일이 입사일보다 늦지 않거나 날짜가 잘못되면 오류를 돌려준다', () => {
  assert.equal(severancePeriod({ hireDate: '2026-05-01', leaveDate: '2026-05-01' }).error, 'leave_before_hire');
  assert.equal(severancePeriod({ hireDate: '2026-13-01', leaveDate: '2026-05-01' }).error, 'invalid_date');
});

test('상여금과 연차수당은 3/12을 3개월 임금에 더한다', () => {
  const r = severancePay({
    wagesLast3Months: 9000000,
    daysLast3Months: 92,
    daysWorked: 365,
    annualBonus: 4000000,
    annualLeavePay: 1200000,
  });
  assert.equal(r.wageBase, 10300000);
  assert.equal(r.severance, 3358696);
  assert.equal(r.eligible, true);
});

test('근속 1년 미만이면 지급 대상이 아니라고 표시한다', () => {
  const r = severancePay({ wagesLast3Months: 9000000, daysLast3Months: 90, daysWorked: 364 });
  assert.equal(r.eligible, false);
});
