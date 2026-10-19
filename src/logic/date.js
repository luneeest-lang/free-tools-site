const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return time;
}

function dateDiff({ start, end }) {
  const startTime = parseDate(start);
  const endTime = parseDate(end);
  if (startTime === null || endTime === null) {
    return { error: 'invalid_date' };
  }
  const days = Math.round((endTime - startTime) / DAY_MS);
  if (days < 0) {
    return { error: 'end_before_start' };
  }
  return {
    error: null,
    days,
    weeks: Math.floor(days / 7),
    remainderDays: days % 7,
  };
}

module.exports = { dateDiff };
