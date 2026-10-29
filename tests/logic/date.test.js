const { test } = require('node:test');
const assert = require('node:assert/strict');
const { dateDiff, addDays } = require('../../src/logic/date');

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

test('날짜에 일수를 더하고 요일을 알려 준다', () => {
  const r = addDays({ start: '2026-01-01', days: 100 });
  assert.equal(r.error, null);
  assert.equal(r.date, '2026-04-11');
  assert.equal(r.weekday, 6);
});

test('시작일을 1일로 세면 하루 앞당겨진다', () => {
  const r = addDays({ start: '2026-01-01', days: 100, includeStart: true });
  assert.equal(r.date, '2026-04-10');
  assert.equal(r.weekday, 5);
});

test('음수 일수는 과거 날짜를 구한다', () => {
  assert.equal(addDays({ start: '2026-01-01', days: -100 }).date, '2025-09-23');
  assert.equal(addDays({ start: '2026-01-01', days: -100, includeStart: true }).date, '2025-09-24');
});

test('윤년 2월 28일에 하루를 더하면 2월 29일', () => {
  assert.equal(addDays({ start: '2024-02-28', days: 1 }).date, '2024-02-29');
});

test('날짜나 일수가 올바르지 않으면 오류', () => {
  assert.equal(addDays({ start: '2025-02-30', days: 1 }).error, 'invalid_date');
  assert.equal(addDays({ start: '2025-01-01', days: 1.5 }).error, 'invalid_days');
  assert.equal(addDays({ start: '2025-01-01', days: 1000000 }).error, 'invalid_days');
});
