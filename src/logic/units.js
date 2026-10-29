// 1 pyeong is a square 6 ja on each side, and 1 ja is 10/33 m, so 1 pyeong = 400/121 m².
const SQM_PER_PYEONG = 400 / 121;

function convertArea({ mode, value }) {
  if (!Number.isFinite(value) || value <= 0) {
    return { error: 'invalid_value' };
  }
  if (mode === 'pyeongToSqm') {
    return { error: null, result: value * SQM_PER_PYEONG };
  }
  if (mode === 'sqmToPyeong') {
    return { error: null, result: (value * 121) / 400 };
  }
  return { error: 'invalid_mode' };
}

function percentCalc({ mode, a, b }) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { error: 'invalid_value' };
  }
  if (mode === 'percentOf') {
    return { error: null, result: (a * b) / 100 };
  }
  if (mode === 'whatPercent') {
    if (b === 0) return { error: 'divide_by_zero' };
    return { error: null, result: (a / b) * 100 };
  }
  if (mode === 'change') {
    if (a === 0) return { error: 'divide_by_zero' };
    return { error: null, result: ((b - a) / a) * 100 };
  }
  if (mode === 'applyChange') {
    return { error: null, result: a * (1 + b / 100) };
  }
  return { error: 'invalid_mode' };
}

const api = { convertArea, percentCalc };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.ToolLogic = Object.assign(window.ToolLogic || {}, api);
