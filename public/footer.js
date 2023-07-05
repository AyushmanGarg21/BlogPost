// Fetch the user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocation);
  } else {
    console.log("Geolocation is not supported by the browser");
  }

  // Send the location data to the server
  function sendLocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Make an AJAX request to send the location data
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/location?lat=${latitude}&lon=${longitude}`, true);
    xhr.send();
  }
  