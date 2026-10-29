const TOOL_FORMS = {
  'loan-calculator': {
    inputs: [
      { id: 'principal', labelKey: 'principalLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitWon' },
      { id: 'rate', labelKey: 'rateLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitPercent' },
      { id: 'months', labelKey: 'monthsLabel', type: 'text', inputmode: 'numeric', unitKey: 'unitMonths' },
      {
        id: 'method',
        labelKey: 'methodLabel',
        type: 'select',
        options: [
          { value: 'equalPayment', labelKey: 'methodEqualPayment' },
          { value: 'equalPrincipal', labelKey: 'methodEqualPrincipal' },
          { value: 'bullet', labelKey: 'methodBullet' },
        ],
      },
    ],
    outputs: [
      { id: 'payment', labelKey: 'paymentLabel', primary: true },
      { id: 'lastPayment', labelKey: 'lastPaymentLabel' },
      { id: 'totalInterest', labelKey: 'totalInterestLabel' },
      { id: 'totalPayment', labelKey: 'totalPaymentLabel' },
    ],
    errorKeys: ['errorInvalid'],
    schedule: true,
  },
  'date-diff': {
    inputs: [
      { id: 'start', labelKey: 'startLabel', type: 'date' },
      { id: 'end', labelKey: 'endLabel', type: 'date' },
    ],
    outputs: [
      { id: 'days', labelKey: 'daysLabel', primary: true },
      { id: 'weeks', labelKey: 'weeksLabel' },
      { id: 'remainder', labelKey: 'remainderLabel' },
    ],
    errorKeys: ['errorEndBeforeStart', 'errorInvalidDate'],
  },
  'date-add': {
    inputs: [
      { id: 'start', labelKey: 'startLabel', type: 'date' },
      { id: 'days', labelKey: 'daysLabel', type: 'text', inputmode: 'numeric', unitKey: 'unitDays' },
      { id: 'includeStart', labelKey: 'includeStartLabel', type: 'checkbox' },
    ],
    outputs: [
      { id: 'resultDate', labelKey: 'resultDateLabel', primary: true },
      { id: 'weekday', labelKey: 'weekdayLabel' },
    ],
    errorKeys: ['errorInvalidDate', 'errorInvalidDays'],
  },
  bmi: {
    inputs: [
      { id: 'height', labelKey: 'heightLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitCm' },
      { id: 'weight', labelKey: 'weightLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitKg' },
    ],
    outputs: [
      { id: 'bmi', labelKey: 'resultLabel', primary: true },
      { id: 'category', labelKey: 'categoryLabel' },
    ],
    errorKeys: ['errorInvalid'],
  },
  severance: {
    inputs: [
      { id: 'hireDate', labelKey: 'hireDateLabel', type: 'date' },
      { id: 'leaveDate', labelKey: 'leaveDateLabel', type: 'date' },
      { id: 'wages', labelKey: 'wagesLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitWon' },
      { id: 'annualBonus', labelKey: 'annualBonusLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitWon' },
      { id: 'annualLeavePay', labelKey: 'annualLeavePayLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitWon' },
    ],
    outputs: [
      { id: 'severance', labelKey: 'resultLabel', primary: true },
      { id: 'dailyWage', labelKey: 'dailyWageLabel' },
      { id: 'daysWorked', labelKey: 'daysWorkedResultLabel' },
      { id: 'period', labelKey: 'periodLabel' },
    ],
    errorKeys: ['errorInvalid', 'errorDateOrder', 'noticeUnderOneYear'],
  },
  'char-count': {
    inputs: [{ id: 'text', labelKey: 'inputLabel', type: 'textarea' }],
    outputs: [
      { id: 'chars', labelKey: 'charsLabel', primary: true },
      { id: 'charsNoSpaces', labelKey: 'charsNoSpacesLabel' },
      { id: 'words', labelKey: 'wordsLabel' },
      { id: 'lines', labelKey: 'linesLabel' },
      { id: 'bytesKr', labelKey: 'bytesKrLabel' },
      { id: 'bytesUtf8', labelKey: 'bytesUtf8Label' },
    ],
    errorKeys: [],
  },
  'case-convert': {
    inputs: [
      { id: 'text', labelKey: 'inputLabel', type: 'textarea' },
      {
        id: 'mode',
        labelKey: 'modeLabel',
        type: 'select',
        options: [
          { value: 'upper', labelKey: 'modeUpper' },
          { value: 'lower', labelKey: 'modeLower' },
          { value: 'title', labelKey: 'modeTitle' },
          { value: 'sentence', labelKey: 'modeSentence' },
        ],
      },
    ],
    outputs: [{ id: 'output', labelKey: 'outputLabel', primary: true, copy: true }],
    errorKeys: [],
  },
  'line-cleanup': {
    inputs: [
      { id: 'text', labelKey: 'inputLabel', type: 'textarea' },
      { id: 'joinLines', labelKey: 'joinLinesLabel', type: 'checkbox' },
    ],
    outputs: [{ id: 'output', labelKey: 'outputLabel', primary: true, copy: true }],
    errorKeys: [],
  },
  'dedupe-lines': {
    inputs: [
      { id: 'text', labelKey: 'inputLabel', type: 'textarea' },
      { id: 'ignoreCase', labelKey: 'ignoreCaseLabel', type: 'checkbox' },
    ],
    outputs: [
      { id: 'output', labelKey: 'outputLabel', primary: true, copy: true },
      { id: 'removed', labelKey: 'removedLabel' },
    ],
    errorKeys: [],
  },
  'hourly-wage': {
    inputs: [
      {
        id: 'mode',
        labelKey: 'modeLabel',
        type: 'select',
        options: [
          { value: 'hourlyToMonthly', labelKey: 'modeHourlyToMonthly' },
          { value: 'monthlyToHourly', labelKey: 'modeMonthlyToHourly' },
        ],
      },
      { id: 'amount', labelKey: 'amountLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitWon' },
      { id: 'weeklyHours', labelKey: 'weeklyHoursLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitHours' },
      { id: 'includeHoliday', labelKey: 'includeHolidayLabel', type: 'checkbox', checked: true },
    ],
    outputs: [
      { id: 'result', labelKey: 'resultLabel', primary: true },
      { id: 'weeklyHolidayPay', labelKey: 'weeklyHolidayPayLabel' },
      { id: 'monthlyHours', labelKey: 'monthlyHoursLabel' },
      { id: 'annual', labelKey: 'annualLabel' },
    ],
    errorKeys: ['errorInvalidAmount', 'errorInvalidHours'],
  },
  'korean-age': {
    inputs: [
      { id: 'birth', labelKey: 'birthLabel', type: 'date' },
      { id: 'on', labelKey: 'onLabel', type: 'date', noShare: true },
    ],
    outputs: [
      { id: 'manAge', labelKey: 'manAgeLabel', primary: true },
      { id: 'yearAge', labelKey: 'yearAgeLabel' },
      { id: 'countingAge', labelKey: 'countingAgeLabel' },
      { id: 'daysToBirthday', labelKey: 'daysToBirthdayLabel' },
    ],
    errorKeys: ['errorInvalidDate', 'errorBirthAfterBase'],
  },
  'discharge-date': {
    inputs: [
      { id: 'enlist', labelKey: 'enlistLabel', type: 'date' },
      {
        id: 'branch',
        labelKey: 'branchLabel',
        type: 'select',
        options: [
          { value: 'army', labelKey: 'branchArmy' },
          { value: 'marine', labelKey: 'branchMarine' },
          { value: 'navy', labelKey: 'branchNavy' },
          { value: 'airforce', labelKey: 'branchAirforce' },
          { value: 'social', labelKey: 'branchSocial' },
        ],
      },
      { id: 'on', labelKey: 'onLabel', type: 'date', noShare: true },
    ],
    outputs: [
      { id: 'discharge', labelKey: 'dischargeLabel', primary: true },
      { id: 'remaining', labelKey: 'remainingLabel' },
      { id: 'served', labelKey: 'servedLabel' },
      { id: 'percent', labelKey: 'percentLabel' },
    ],
    errorKeys: ['errorInvalidDate'],
  },
  pyeong: {
    inputs: [
      {
        id: 'mode',
        labelKey: 'modeLabel',
        type: 'select',
        options: [
          { value: 'pyeongToSqm', labelKey: 'modePyeongToSqm' },
          { value: 'sqmToPyeong', labelKey: 'modeSqmToPyeong' },
        ],
      },
      { id: 'value', labelKey: 'valueLabel', type: 'text', inputmode: 'decimal' },
    ],
    outputs: [{ id: 'result', labelKey: 'resultLabel', primary: true }],
    errorKeys: ['errorInvalid'],
  },
  percent: {
    inputs: [
      {
        id: 'mode',
        labelKey: 'modeLabel',
        type: 'select',
        options: [
          { value: 'percentOf', labelKey: 'modePercentOf' },
          { value: 'whatPercent', labelKey: 'modeWhatPercent' },
          { value: 'change', labelKey: 'modeChange' },
          { value: 'applyChange', labelKey: 'modeApplyChange' },
        ],
      },
      { id: 'a', labelKey: 'aLabel', type: 'text', inputmode: 'decimal' },
      { id: 'b', labelKey: 'bLabel', type: 'text', inputmode: 'decimal' },
    ],
    outputs: [{ id: 'result', labelKey: 'resultLabel', primary: true }],
    errorKeys: ['errorInvalid', 'errorDivideByZero'],
  },
};

const CALC_SLUGS = [
  'loan-calculator',
  'severance',
  'hourly-wage',
  'date-diff',
  'date-add',
  'korean-age',
  'discharge-date',
  'bmi',
  'pyeong',
  'percent',
];
const TEXT_SLUGS = ['char-count', 'case-convert', 'line-cleanup', 'dedupe-lines'];

module.exports = { TOOL_FORMS, CALC_SLUGS, TEXT_SLUGS };
