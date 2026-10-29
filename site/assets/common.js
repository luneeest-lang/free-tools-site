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

  function flash(button) {
    button.textContent = button.dataset.copied;
    setTimeout(() => {
      button.textContent = button.dataset.label;
    }, 1500);
  }

  function formFields() {
    const form = document.getElementById('tool-form');
    return form ? [...form.querySelectorAll('input[id], select[id]')] : [];
  }

  // Share links carry inputs after "#", so they are never sent to the server.
  function shareUrl() {
    const params = new URLSearchParams();
    for (const field of formFields()) {
      // Reference dates default to the viewer's today instead of the sender's.
      if ('noShare' in field.dataset) continue;
      if (field.type === 'checkbox') {
        params.set(field.id, field.checked ? '1' : '0');
      } else if (field.value !== '') {
        params.set(field.id, field.value);
      }
    }
    return `${location.origin}${location.pathname}#${params}`;
  }

  function restoreFromHash() {
    if (location.hash.length < 2) return false;
    const params = new URLSearchParams(location.hash.slice(1));
    let restored = false;
    for (const field of formFields()) {
      if (!params.has(field.id)) continue;
      if (field.type === 'checkbox') {
        field.checked = params.get(field.id) === '1';
      } else {
        field.value = params.get(field.id);
      }
      restored = true;
    }
    return restored;
  }

  function today() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  function defaultToday(id) {
    const el = document.getElementById(id);
    if (!el.value) el.value = today();
  }

  document.addEventListener('click', (event) => {
    const share = event.target.closest('[data-share]');
    if (share) {
      copyText(shareUrl()).then(() => flash(share));
      return;
    }
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const text = document.getElementById(button.dataset.copy).textContent;
    if (!text) return;
    copyText(text).then(() => flash(button));
  });

  restoreFromHash();

  window.ToolUI = {
    label,
    defaultToday,
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
