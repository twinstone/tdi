const PageColorChanger = (() => {
  function getRandomColor() {
    // Generate a random hex color
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  function handleDoubleClick() {
    document.body.style.backgroundColor = getRandomColor();
  }

  function init() {
    document.addEventListener('dblclick', handleDoubleClick);
  }

  return {
    init
  };
})();

export default PageColorChanger;