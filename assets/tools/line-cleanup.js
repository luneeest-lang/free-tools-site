(function () {
  const form = document.getElementById('tool-form');
  const { cleanupLines } = window.ToolLogic;

  function update() {
    ToolUI.setOutput('output', cleanupLines(document.getElementById('text').value));
  }

  form.addEventListener('input', update);
  update();
})();
