function LocationButton() {
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Latitude:', position.coords.latitude);
          console.log('Longitude:', position.coords.longitude);

          // Send to your free backend
          fetch('https://your-backend.com/save-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          });
        },
        (error) => console.error(error)
      );
    } else {
      alert('Geolocation not supported');
    }
  };

  return <button onClick={getLocation}>Share Location</button>;
}

export default LocationButton;
