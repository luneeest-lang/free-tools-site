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

function equalPaymentRows({ principal, annualRatePercent, months, decimals }) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const { payment } = monthlyPayment({ principal, annualRatePercent, months, decimals });
  const rows = [];
  let balance = principal;
  for (let month = 1; month <= months; month += 1) {
    let interest = roundTo(balance * monthlyRate, decimals);
    let principalPart = roundTo(payment - interest, decimals);
    let amount = payment;
    if (month === months) {
      principalPart = roundTo(balance, decimals);
      if (monthlyRate === 0) {
        amount = principalPart;
        interest = 0;
      } else {
        interest = roundTo(amount - principalPart, decimals);
      }
    }
    balance = roundTo(balance - principalPart, decimals);
    rows.push({ month, payment: amount, principal: principalPart, interest, balance });
  }
  const totalPayment = roundTo(rows.reduce((sum, row) => sum + row.payment, 0), decimals);
  return { rows, totalPayment, totalInterest: roundTo(totalPayment - principal, decimals) };
}

function equalPrincipalRows({ principal, annualRatePercent, months, decimals }) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const principalPart = principal / months;
  const rows = [];
  let balance = principal;
  let interestTotal = 0;
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * monthlyRate;
    interestTotal += interest;
    balance -= principalPart;
    rows.push({
      month,
      payment: roundTo(principalPart + interest, decimals),
      principal: roundTo(principalPart, decimals),
      interest: roundTo(interest, decimals),
      balance: roundTo(Math.max(balance, 0), decimals),
    });
  }
  const totalInterest = roundTo(interestTotal, decimals);
  return { rows, totalPayment: roundTo(principal + totalInterest, decimals), totalInterest };
}

function bulletRows({ principal, annualRatePercent, months, decimals }) {
  const interest = (principal * annualRatePercent) / 100 / 12;
  const rows = [];
  for (let month = 1; month <= months; month += 1) {
    const last = month === months;
    rows.push({
      month,
      payment: roundTo(interest + (last ? principal : 0), decimals),
      principal: last ? roundTo(principal, decimals) : 0,
      interest: roundTo(interest, decimals),
      balance: last ? 0 : roundTo(principal, decimals),
    });
  }
  const totalInterest = roundTo(interest * months, decimals);
  return { rows, totalPayment: roundTo(principal + totalInterest, decimals), totalInterest };
}

function loanSchedule({ principal, annualRatePercent, months, method = 'equalPayment', decimals = 0 }) {
  const build = { equalPayment: equalPaymentRows, equalPrincipal: equalPrincipalRows, bullet: bulletRows }[method];
  if (!build) {
    throw new RangeError(`unknown method: ${method}`);
  }
  const result = build({ principal, annualRatePercent, months, decimals });
  return {
    ...result,
    firstPayment: result.rows[0].payment,
    lastPayment: result.rows[result.rows.length - 1].payment,
  };
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

// Weeks per month as MOEL uses it: 365 days ÷ 7 ÷ 12. A 40-hour week plus 8 paid
// holiday hours gives 48 × 4.345 = 208.57, which MOEL rounds to 209 hours.
const WEEKS_PER_MONTH = 365 / 7 / 12;

function convertWage({ mode, amount, weeklyHours, includeHoliday }) {
  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || weeklyHours > 40) {
    return { error: 'invalid_hours' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'invalid_amount' };
  }
  // Paid weekly holiday applies from 15 contractual hours a week, in proportion to a 40-hour week.
  const holidayHours = includeHoliday && weeklyHours >= 15 ? (weeklyHours / 40) * 8 : 0;
  const monthlyHours = Math.round((weeklyHours + holidayHours) * WEEKS_PER_MONTH);
  let hourly;
  let monthly;
  if (mode === 'hourlyToMonthly') {
    hourly = amount;
    monthly = Math.round(hourly * monthlyHours);
  } else if (mode === 'monthlyToHourly') {
    monthly = amount;
    hourly = Math.round(monthly / monthlyHours);
  } else {
    return { error: 'invalid_mode' };
  }
  return {
    error: null,
    hourly,
    monthly,
    annual: monthly * 12,
    monthlyHours,
    holidayHours,
    weeklyHolidayPay: Math.round(hourly * holidayHours),
  };
}

const api = { monthlyPayment, loanSchedule, severancePeriod, severancePay, convertWage };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.ToolLogic = Object.assign(window.ToolLogic || {}, api);
