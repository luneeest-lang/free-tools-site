function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function monthlyPayment({ principal, annualRatePercent, months, decimals = 0 }) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const rawPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
  const payment = roundTo(rawPayment, decimals);
  const totalPayment = monthlyRate === 0 ? roundTo(principal, decimals) : roundTo(payment * months, decimals);
  return { payment, totalPayment, totalInterest: roundTo(totalPayment - principal, decimals) };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseYmd(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return time;
}

function toYmd(time) {
  const date = new Date(time);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function monthsBefore(time, months) {
  const date = new Date(time);
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, 1));
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay));
}

function severancePeriod({ hireDate, leaveDate }) {
  const hire = parseYmd(hireDate);
  const leave = parseYmd(leaveDate);
  if (hire === null || leave === null) {
    return { error: 'invalid_date' };
  }
  if (leave <= hire) {
    return { error: 'leave_before_hire' };
  }
  const start = monthsBefore(leave, 3);
  return {
    error: null,
    periodStart: toYmd(start),
    periodEnd: toYmd(leave - DAY_MS),
    daysLast3Months: Math.round((leave - start) / DAY_MS),
    daysWorked: Math.round((leave - hire) / DAY_MS),
  };
}

function severancePay({ wagesLast3Months, daysLast3Months, daysWorked, annualBonus = 0, annualLeavePay = 0 }) {
  if (daysLast3Months <= 0 || daysWorked <= 0) {
    throw new RangeError('days must be greater than 0');
  }
  const wageBase = wagesLast3Months + (annualBonus * 3) / 12 + (annualLeavePay * 3) / 12;
  const averageDailyWage = wageBase / daysLast3Months;
  const severance = Math.round((averageDailyWage * 30 * daysWorked) / 365);
  return { wageBase, averageDailyWage, severance, eligible: daysWorked >= 365 };
}

const api = { monthlyPayment, severancePeriod, severancePay };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.ToolLogic = Object.assign(window.ToolLogic || {}, api);
