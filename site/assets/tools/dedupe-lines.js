(function () {
  const form = document.getElementById('tool-form');
  const { dedupeLines } = window.ToolLogic;

  function update() {
    const text = document.getElementById('text').value;
    const ignoreCase = document.getElementById('ignoreCase').checked;
    const result = dedupeLines(text, { ignoreCase });
    ToolUI.setOutput('output', result.result);
    ToolUI.setOutput('removed', ToolUI.fmt(result.removed));
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
