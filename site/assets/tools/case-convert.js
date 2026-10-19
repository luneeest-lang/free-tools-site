(function () {
  const form = document.getElementById('tool-form');
  const { convertCase } = window.ToolLogic;

  function update() {
    const text = document.getElementById('text').value;
    const mode = document.getElementById('mode').value;
    ToolUI.setOutput('output', convertCase(text, mode));
  }

  form.addEventListener('input', update);
  update();
})();
