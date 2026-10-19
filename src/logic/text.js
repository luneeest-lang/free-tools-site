function splitLines(text) {
  return text.split(/\r\n|\r|\n/);
}

function charCount(text) {
  if (text === '') {
    return { chars: 0, charsNoSpaces: 0, words: 0, lines: 0 };
  }
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    words: text.split(/\s+/).filter(Boolean).length,
    lines: splitLines(text).length,
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

function cleanupLines(text) {
  const trimmed = splitLines(text).map((line) => line.trim());
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

module.exports = { charCount, convertCase, cleanupLines, dedupeLines };
