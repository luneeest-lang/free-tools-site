const TOOL_FORMS = {
  'loan-calculator': {
    inputs: [
      { id: 'principal', labelKey: 'principalLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitWon' },
      { id: 'rate', labelKey: 'rateLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitPercent' },
      { id: 'months', labelKey: 'monthsLabel', type: 'text', inputmode: 'numeric', unitKey: 'unitMonths' },
    ],
    outputs: [
      { id: 'payment', labelKey: 'paymentLabel', primary: true },
      { id: 'totalInterest', labelKey: 'totalInterestLabel' },
      { id: 'totalPayment', labelKey: 'totalPaymentLabel' },
    ],
    errorKeys: ['errorInvalid'],
  },
  'date-diff': {
    inputs: [
      { id: 'start', labelKey: 'startLabel', type: 'date' },
      { id: 'end', labelKey: 'endLabel', type: 'date' },
    ],
    outputs: [
      { id: 'days', labelKey: 'daysLabel', primary: true },
      { id: 'weeks', labelKey: 'weeksLabel' },
    ],
    errorKeys: ['errorEndBeforeStart', 'errorInvalidDate'],
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
      { id: 'wages', labelKey: 'wagesLabel', type: 'text', inputmode: 'decimal', unitKey: 'unitWon' },
      { id: 'daysLast3', labelKey: 'daysLast3Label', type: 'text', inputmode: 'numeric', unitKey: 'unitDays' },
      { id: 'daysWorked', labelKey: 'daysWorkedLabel', type: 'text', inputmode: 'numeric', unitKey: 'unitDays' },
    ],
    outputs: [
      { id: 'severance', labelKey: 'resultLabel', primary: true },
      { id: 'dailyWage', labelKey: 'dailyWageLabel' },
    ],
    errorKeys: ['errorInvalid'],
  },
  'char-count': {
    inputs: [{ id: 'text', labelKey: 'inputLabel', type: 'textarea' }],
    outputs: [
      { id: 'chars', labelKey: 'charsLabel', primary: true },
      { id: 'charsNoSpaces', labelKey: 'charsNoSpacesLabel' },
      { id: 'words', labelKey: 'wordsLabel' },
      { id: 'lines', labelKey: 'linesLabel' },
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
    outputs: [{ id: 'output', labelKey: 'outputLabel', primary: true }],
    errorKeys: [],
  },
  'line-cleanup': {
    inputs: [{ id: 'text', labelKey: 'inputLabel', type: 'textarea' }],
    outputs: [{ id: 'output', labelKey: 'outputLabel', primary: true }],
    errorKeys: [],
  },
  'dedupe-lines': {
    inputs: [
      { id: 'text', labelKey: 'inputLabel', type: 'textarea' },
      { id: 'ignoreCase', labelKey: 'ignoreCaseLabel', type: 'checkbox' },
    ],
    outputs: [
      { id: 'output', labelKey: 'outputLabel', primary: true },
      { id: 'removed', labelKey: 'removedLabel' },
    ],
    errorKeys: [],
  },
};

const CALC_SLUGS = ['loan-calculator', 'date-diff', 'bmi', 'severance'];
const TEXT_SLUGS = ['char-count', 'case-convert', 'line-cleanup', 'dedupe-lines'];

module.exports = { TOOL_FORMS, CALC_SLUGS, TEXT_SLUGS };
