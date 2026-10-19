(function () {
  function labels() {
    const el = document.getElementById('tool-labels');
    try {
      return el ? JSON.parse(el.textContent) : {};
    } catch (error) {
      return {};
    }
  }

  function label(key) {
    return labels()[key] || '';
  }

  function num(id) {
    const raw = document.getElementById(id).value.replace(/,/g, '').trim();
    if (raw === '') return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : NaN;
  }

  function isNumber(value) {
    return value !== null && !Number.isNaN(value);
  }

  function fmt(value) {
    return new Intl.NumberFormat(document.documentElement.lang).format(value);
  }

  function setOutput(id, text) {
    document.getElementById(id).textContent = text;
  }

  function clearOutputs(form) {
    form.querySelectorAll('output').forEach((output) => {
      output.textContent = '';
    });
  }

  function clearErrors(form) {
    form.querySelectorAll('[data-error]').forEach((el) => {
      el.hidden = true;
    });
  }

  function showError(form, key) {
    clearErrors(form);
    const el = form.querySelector(`[data-error="${key}"]`);
    if (el) el.hidden = false;
  }

  function groupDigits(raw) {
    const cleaned = raw.replace(/[^\d.]/g, '');
    const [whole, fraction] = cleaned.split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fraction !== undefined ? `${grouped}.${fraction}` : grouped;
  }

  function bindAmount(id) {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      el.value = groupDigits(el.value);
    });
  }

  window.ToolUI = {
    label,
    num,
    isNumber,
    fmt,
    groupDigits,
    bindAmount,
    setOutput,
    clearOutputs,
    clearErrors,
    showError,
  };
})();
