(function () {
  const form = document.getElementById('tool-form');
  const { charCount } = window.ToolLogic;

  function update() {
    const result = charCount(document.getElementById('text').value);
    ToolUI.setOutput('chars', ToolUI.fmt(result.chars));
    ToolUI.setOutput('charsNoSpaces', ToolUI.fmt(result.charsNoSpaces));
    ToolUI.setOutput('words', ToolUI.fmt(result.words));
    ToolUI.setOutput('lines', ToolUI.fmt(result.lines));
    ToolUI.setOutput('bytesKr', ToolUI.fmt(result.bytesKr));
    ToolUI.setOutput('bytesUtf8', ToolUI.fmt(result.bytesUtf8));
  }

  form.addEventListener('input', update);
  update();
})();
