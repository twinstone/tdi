(function() {
  alert('app.js script loaded, you should see changing background color every 1s');

  const targetElement = document.querySelector('body');

  // Define an array of colors from light to dark
  const colors = [
      '#00008B', // DarkBlue
      '#0000CD', // MediumBlue
      '#0000FF', // Blue
      '#1E90FF', // DodgerBlue
      '#4169E1', // RoyalBlue
      '#4682B4', // SteelBlue
      '#5F9EA0', // CadetBlue
      '#87CEEB', // SkyBlue
      '#87CEFA', // LightSkyBlue
      '#ADD8E6', // LightBlue
  ];

  // Initialize an index to keep track of the current color
  let colorIndex = 0;
  targetElement.style.transition = 'background-color 1s ease-in-out';
  // Function to change the background color
  function changeBackgroundColor() {
      // Set the background color of the target element
      targetElement.style.backgroundColor = colors[colorIndex];

      // Update the index to loop through the colors
      colorIndex = (colorIndex + 1) % colors.length;
  }

  setInterval(changeBackgroundColor, 1000);
})();