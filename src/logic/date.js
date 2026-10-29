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

const MAX_DAYS = 100000;

// includeStart counts the start date as day 1, so "100 days" lands one day earlier.
function addDays({ start, days, includeStart = false }) {
  const startTime = parseDate(start);
  if (startTime === null) {
    return { error: 'invalid_date' };
  }
  if (!Number.isInteger(days) || Math.abs(days) > MAX_DAYS) {
    return { error: 'invalid_days' };
  }
  const offset = includeStart && days !== 0 ? days - Math.sign(days) : days;
  const result = new Date(startTime + offset * DAY_MS);
  return {
    error: null,
    date: result.toISOString().slice(0, 10),
    weekday: result.getUTCDay(),
  };
}

function ymdParts(time) {
  const date = new Date(time);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// In a common year a February 29 birthday falls on March 1, the day after
// February 28 when the civil-law year ends (Civil Act Articles 158 and 160).
function birthdayIn(year, birth) {
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(year)) {
    return Date.UTC(year, 2, 1);
  }
  return Date.UTC(year, birth.month - 1, birth.day);
}

function koreanAge({ birth, on }) {
  const birthTime = parseDate(birth);
  const onTime = parseDate(on);
  if (birthTime === null || onTime === null) {
    return { error: 'invalid_date' };
  }
  if (birthTime > onTime) {
    return { error: 'birth_after_base' };
  }
  const b = ymdParts(birthTime);
  const { year } = ymdParts(onTime);
  const thisBirthday = birthdayIn(year, b);
  const manAge = year - b.year - (onTime < thisBirthday ? 1 : 0);
  const nextBirthday = onTime <= thisBirthday ? thisBirthday : birthdayIn(year + 1, b);
  return {
    error: null,
    manAge,
    yearAge: year - b.year,
    countingAge: year - b.year + 1,
    daysToBirthday: Math.round((nextBirthday - onTime) / DAY_MS),
  };
}

const SERVICE_MONTHS = { army: 18, marine: 18, navy: 20, airforce: 21, social: 21 };

// Civil Act Article 160: a period in months ends the day before the matching day
// of the final month, or on that month's last day when no matching day exists.
function dischargeDate({ enlist, months }) {
  const { year, month, day } = ymdParts(parseDate(enlist));
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  const end =
    day <= lastDay
      ? Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), day) - DAY_MS
      : Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), lastDay);
  return new Date(end).toISOString().slice(0, 10);
}

function militaryService({ enlist, branch, on }) {
  const enlistTime = parseDate(enlist);
  const onTime = parseDate(on);
  if (enlistTime === null || onTime === null) {
    return { error: 'invalid_date' };
  }
  const months = SERVICE_MONTHS[branch];
  if (!months) {
    return { error: 'invalid_branch' };
  }
  const discharge = dischargeDate({ enlist, months });
  const dischargeTime = parseDate(discharge);
  const totalDays = Math.round((dischargeTime - enlistTime) / DAY_MS) + 1;
  const elapsed = Math.round((onTime - enlistTime) / DAY_MS) + 1;
  const servedDays = Math.min(Math.max(elapsed, 0), totalDays);
  return {
    error: null,
    months,
    discharge,
    totalDays,
    servedDays,
    remainingDays: Math.max(Math.round((dischargeTime - onTime) / DAY_MS), 0),
    percent: Math.round((servedDays / totalDays) * 1000) / 10,
  };
}

const api = { dateDiff, addDays, koreanAge, dischargeDate, militaryService };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.ToolLogic = Object.assign(window.ToolLogic || {}, api);
