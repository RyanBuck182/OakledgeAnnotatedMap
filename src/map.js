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

  const marker = new AdvancedMarkerElement({
    map: map,
    position: { lat: 44.454778, lng: -73.227556 },
    title: "Test Marker"
  })
}
