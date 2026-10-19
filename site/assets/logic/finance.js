function monthlyPayment({ principal, annualRatePercent, months }) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const rawPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
  const payment = Math.round(rawPayment);
  const totalPayment = payment * months;
  return { payment, totalPayment, totalInterest: totalPayment - principal };
}

function severancePay({ wagesLast3Months, daysLast3Months, daysWorked }) {
  if (daysLast3Months <= 0 || daysWorked <= 0) {
    throw new RangeError('days must be greater than 0');
  }
  const averageDailyWage = wagesLast3Months / daysLast3Months;
  const severance = Math.round((averageDailyWage * 30 * daysWorked) / 365);
  return { averageDailyWage, severance };
}

const api = { monthlyPayment, severancePay };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.ToolLogic = Object.assign(window.ToolLogic || {}, api);
