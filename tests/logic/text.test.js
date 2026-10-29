const { test } = require('node:test');
const assert = require('node:assert/strict');
const { charCount, convertCase, cleanupLines, dedupeLines } = require('../../src/logic/text');

test('빈 문자열은 모두 0', () => {
  assert.deepEqual(charCount(''), { chars: 0, charsNoSpaces: 0, words: 0, lines: 0, bytesKr: 0, bytesUtf8: 0 });
});

test('글자수, 공백 제외 글자수, 단어수, 줄수를 센다', () => {
  assert.deepEqual(charCount('a b\nc'), { chars: 5, charsNoSpaces: 3, words: 3, lines: 2, bytesKr: 5, bytesUtf8: 5 });
});

test('title은 각 단어의 첫 글자만 대문자', () => {
  assert.equal(convertCase('hello world', 'title'), 'Hello World');
});

test('upper는 영문만 바꾸고 한글은 그대로 둔다', () => {
  assert.equal(convertCase('안녕 hello', 'upper'), '안녕 HELLO');
});

test('sentence는 첫 글자만 대문자', () => {
  assert.equal(convertCase('HELLO world', 'sentence'), 'Hello world');
});

test('줄 앞뒤 공백을 지우고 연속 빈 줄을 하나로 줄인다', () => {
  assert.equal(cleanupLines('  a  \n\n\n  b \n'), 'a\n\nb');
});

test('빈 입력은 빈 문자열', () => {
  assert.equal(cleanupLines(''), '');
});

test('중복 줄은 처음 나온 것만 남긴다', () => {
  assert.deepEqual(dedupeLines('a\nb\na'), { result: 'a\nb', removed: 1 });
});

test('ignoreCase를 켜면 대소문자만 다른 줄도 중복', () => {
  assert.deepEqual(dedupeLines('A\na', { ignoreCase: true }), { result: 'A', removed: 1 });
});

test('joinLines를 켜면 줄바꿈을 없애고 한 줄로 합친다', () => {
  assert.equal(cleanupLines('가나\n  다라 \n\n마바', { joinLines: true }), '가나 다라 마바');
});

test('joinLines는 빈 입력과 줄바꿈만 있는 입력에서 빈 문자열을 돌려준다', () => {
  assert.equal(cleanupLines('', { joinLines: true }), '');
  assert.equal(cleanupLines('\n\n  \n', { joinLines: true }), '');
});

test('joinLines를 끄면 기존 동작과 같다', () => {
  assert.equal(cleanupLines('  a  \n\n\n  b \n', { joinLines: false }), 'a\n\nb');
});

test('바이트 수를 한글 2바이트 기준과 UTF-8 기준으로 센다', () => {
  const r = charCount('가a\n😀');
  assert.equal(r.bytesKr, 6);
  assert.equal(r.bytesUtf8, 9);
});

test('빈 문자열의 바이트 수는 0', () => {
  const r = charCount('');
  assert.equal(r.bytesKr, 0);
  assert.equal(r.bytesUtf8, 0);
});
