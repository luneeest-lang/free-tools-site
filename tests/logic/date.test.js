const { test } = require('node:test');
const assert = require('node:assert/strict');
const { dateDiff } = require('../../src/logic/date');

test('윤년 2월 28일에서 3월 1일까지는 2일', () => {
  const r = dateDiff({ start: '2024-02-28', end: '2024-03-01' });
  assert.equal(r.error, null);
  assert.equal(r.days, 2);
});

test('주수와 남은 일수를 나눠 준다', () => {
  const r = dateDiff({ start: '2025-01-01', end: '2025-01-18' });
  assert.equal(r.days, 17);
  assert.equal(r.weeks, 2);
  assert.equal(r.remainderDays, 3);
});

test('종료일이 시작일보다 앞이면 end_before_start', () => {
  const r = dateDiff({ start: '2025-03-01', end: '2025-02-01' });
  assert.equal(r.error, 'end_before_start');
});

test('존재하지 않는 날짜면 invalid_date', () => {
  const r = dateDiff({ start: '2025-13-01', end: '2025-02-01' });
  assert.equal(r.error, 'invalid_date');
});
