const { test } = require('node:test');
const assert = require('node:assert/strict');
const { charCount, convertCase, cleanupLines, dedupeLines } = require('../../src/logic/text');

test('빈 문자열은 모두 0', () => {
  assert.deepEqual(charCount(''), { chars: 0, charsNoSpaces: 0, words: 0, lines: 0 });
});

test('글자수, 공백 제외 글자수, 단어수, 줄수를 센다', () => {
  assert.deepEqual(charCount('a b\nc'), { chars: 5, charsNoSpaces: 3, words: 3, lines: 2 });
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
