// Initialize and add the map
function initMap() {
    // The location of the user (default location, will be updated)
    const userLocation = { lat: -34.397, lng: 150.644 };

    // The map, centered at the user's location
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: userLocation,
    });

    // InfoWindow to display location information
    const infoWindow = new google.maps.InfoWindow();

    // Directions service and renderer
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);

                // Use the Places API to find nearby hospitals
                const service = new google.maps.places.PlacesService(map);
                service.nearbySearch(
                    {
                        location: pos,
                        radius: 5000, // 5 kilometers
                        type: ["hospital"],
                    },
                    (results, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            results.forEach((place) => {
                                if (place.geometry && place.geometry.location) {
                                    const marker = new google.maps.Marker({
                                        map,
                                        position: place.geometry.location,
                                        title: place.name,
                                    });

                                    google.maps.event.addListener(marker, "click", () => {
                                        infoWindow.setContent(place.name);
                                        infoWindow.open(map, marker);
                                        calculateAndDisplayRoute(directionsService, directionsRenderer, pos, place.geometry.location);
                                    });
                                }
                            });
                        }
                    }
                );
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

// Handle location errors
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

// Calculate and display the route
function calculateAndDisplayRoute(directionsService, directionsRenderer, origin, destination) {
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}

// Load the map
window.onload = initMap;
