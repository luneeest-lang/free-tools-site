(function () {
  const form = document.getElementById('tool-form');
  const { cleanupLines } = window.ToolLogic;

  function update() {
    const text = document.getElementById('text').value;
    const joinLines = document.getElementById('joinLines').checked;
    ToolUI.setOutput('output', cleanupLines(text, { joinLines }));
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
