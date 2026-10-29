function splitLines(text) {
  return text.split(/\r\n|\r|\n/);
}

// bytesKr follows the common Korean convention (EUC-KR style): ASCII is 1 byte,
// every other character, including Hangul, is 2 bytes.
function byteCounts(text) {
  let bytesKr = 0;
  let bytesUtf8 = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    bytesKr += code < 0x80 ? 1 : 2;
    bytesUtf8 += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return { bytesKr, bytesUtf8 };
}

function charCount(text) {
  if (text === '') {
    return { chars: 0, charsNoSpaces: 0, words: 0, lines: 0, bytesKr: 0, bytesUtf8: 0 };
  }
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    words: text.split(/\s+/).filter(Boolean).length,
    lines: splitLines(text).length,
    ...byteCounts(text),
  };
}

function convertCase(text, mode) {
  if (mode === 'upper') return text.toUpperCase();
  if (mode === 'lower') return text.toLowerCase();
  if (mode === 'title') {
    return text.toLowerCase().replace(/(^|\s)(\S)/g, (_, space, char) => space + char.toUpperCase());
  }
  if (mode === 'sentence') {
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  throw new RangeError(`unknown mode: ${mode}`);
}

function cleanupLines(text, { joinLines = false } = {}) {
  const trimmed = splitLines(text).map((line) => line.trim());
  if (joinLines) {
    return trimmed.filter((line) => line !== '').join(' ');
  }
  const collapsed = [];
  for (const line of trimmed) {
    if (line === '' && collapsed[collapsed.length - 1] === '') continue;
    collapsed.push(line);
  }
  while (collapsed.length && collapsed[0] === '') collapsed.shift();
  while (collapsed.length && collapsed[collapsed.length - 1] === '') collapsed.pop();
  return collapsed.join('\n');
}

function dedupeLines(text, { ignoreCase = false } = {}) {
  const seen = new Set();
  const kept = [];
  let removed = 0;
  for (const line of splitLines(text)) {
    if (line === '') {
      kept.push(line);
      continue;
    }
    const key = ignoreCase ? line.toLowerCase() : line;
    if (seen.has(key)) {
      removed += 1;
      continue;
    }
    seen.add(key);
    kept.push(line);
  }
  return { result: kept.join('\n'), removed };
}

const api = { charCount, convertCase, cleanupLines, dedupeLines };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.ToolLogic = Object.assign(window.ToolLogic || {}, api);
