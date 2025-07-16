let GoogleMap, AdvancedMarkerElement;
let map;

async function initializeMap() {
  ({ Map: GoogleMap } = await google.maps.importLibrary("maps"));
  ({ AdvancedMarkerElement } = await google.maps.importLibrary("marker"));

  map = new GoogleMap(document.getElementById('map'), {
    center: { lat: 44.454778, lng: -73.227556 },
    zoom: 18,
    mapId: "46571f95beb50f37f04802da"
  });

  createMarker({
    title: "Test Marker",
    position: { lat: 44.454778, lng: -73.227556 },
    description: `This is a test decription. Lorem ipsum dolor sit amet
    consectetur adipisicing elit. Rerum incidunt ex illo reiciendis cupiditate
    consectetur, aliquid quis, delectus sed quasi ut neque natus aspernatur ab
    placeat minus nesciunt obcaecati eum.`,
  });
}

/**
 * Create a map marker.
 * @param {{
 * title: String,
 * position: { lat: Number, lng: Number },
 * description: String,
 * }} p The parameters.
 * @returns {AdvancedMarkerElement} The marker element.
 */
function createMarker(p) {
  const marker = new AdvancedMarkerElement({
    map: map,
    position: p.position,
    title: p.title,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="max-width: 300px;">
        <h1 id="firstHeading" class="firstHeading">${p.title}</h1>
        <p>${p.description}</p>
      </div>
    `,
  });

  marker.addListener("click", () => {
    infoWindow.open({
      anchor: marker,
      map: map,
    });
  });

  return marker;
}
