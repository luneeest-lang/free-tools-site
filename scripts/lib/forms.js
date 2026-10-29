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
};

const CALC_SLUGS = ['loan-calculator', 'date-diff', 'date-add', 'bmi', 'severance'];
const TEXT_SLUGS = ['char-count', 'case-convert', 'line-cleanup', 'dedupe-lines'];

module.exports = { TOOL_FORMS, CALC_SLUGS, TEXT_SLUGS };
