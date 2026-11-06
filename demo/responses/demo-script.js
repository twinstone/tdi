window.demoScriptReport = function (msg) {
  document.getElementById('s-out').textContent = msg + ' (' + new Date().toLocaleTimeString() + ')'
}
