const socket = io();

const markers = {};

const userName = prompt("Enter your name");

let currentPosition = null; // Track the current user's position
let currentUserId = null;

const map = L.map('map').setView([0, 0], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; Jagdamba Tripathi'
}).addTo(map);

if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            
            // Send location only if it has changed
            if (!currentPosition || currentPosition.latitude !== latitude || currentPosition.longitude !== longitude) {
                currentPosition = { latitude, longitude };
                map.setView([latitude, longitude]);
                socket.emit('sendLocation', {...currentPosition,userName});

            }
        }, (error) => {
            console.log(error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    }, 4000);
}

socket.on("welcome-user", (data) => {
    const { id } = data;
    currentUserId = id;
});

socket.on('receiveLocation', (data) => {
    const { id, latitude, longitude,userName } = data;
    console.log(markers);

    // Update or create markers for all users
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        console.log("New User", id);
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
    if(currentPosition.latitude === latitude && currentPosition.longitude === longitude){
        markers[id].bindPopup("You");
    }else{
        markers[id].bindPopup(userName).openPopup();
    }

});

socket.on('disconnect-user', (data) => {
    const { id } = data;
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
