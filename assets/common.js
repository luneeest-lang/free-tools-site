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

  function fmtMoney(value, decimals) {
    return new Intl.NumberFormat(document.documentElement.lang, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
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

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => copyWithSelection(text));
    }
    return copyWithSelection(text);
  }

  function copyWithSelection(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    return Promise.resolve();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const text = document.getElementById(button.dataset.copy).textContent;
    if (!text) return;
    copyText(text).then(() => {
      button.textContent = button.dataset.copied;
      setTimeout(() => {
        button.textContent = button.dataset.label;
      }, 1500);
    });
  });

  window.ToolUI = {
    label,
    num,
    isNumber,
    fmt,
    fmtMoney,
    groupDigits,
    bindAmount,
    setOutput,
    clearOutputs,
    clearErrors,
    showError,
  };
})();
