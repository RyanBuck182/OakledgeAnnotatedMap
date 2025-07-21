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
    description: 'This is a test decription. Lorem ipsum dolor sit amet'
    + ' consectetur adipisicing elit. Rerum incidunt ex illo reiciendis cupiditate'
    + ' consectetur, aliquid quis, delectus sed quasi ut neque natus aspernatur ab'
    + ' placeat minus nesciunt obcaecati eum.',
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

  createInfoWindow(marker, p);

  return marker;
}

/**
 * Create an info window for a map marker.
 * @param {AdvancedMarkerElement} marker The map marker.
 * @param {{
 * title: String,
 * description: String,
 * }} p The parameters.
 */
function createInfoWindow(marker, p) {
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="max-width: 300px;">
        <h2>${p.title}</h2>
        <p>${p.description}</p>
        <p id="see-more">See more...</p>
      </div>
    `,
  });

  marker.addListener("click", () => {
    infoWindow.open({
      anchor: marker,
      map: map,
    });
  });

  infoWindow.addListener('domready', () => {
    const see_more = document.getElementById("see-more");
    see_more.addEventListener('click', () => showMarkerModal(p));
  });
}

/**
 * Create a modal for a map marker.
 * @param {{
 * title: String,
 * description: String,
 * }} p The parameters.
 */
function showMarkerModal(p) {
  const modal = document.getElementById("modal");
  const modal_close = document.getElementById("modal-close");
  const modal_title = document.getElementById("modal-title");
  const modal_description = document.getElementById("modal-description");

  modal_title.innerText = p.title;
  modal_description.innerText = p.description;

  modal_close.onclick = () => modal.classList.remove("show");
  window.onclick = (event) => {
    if (event.target == modal)
      modal.classList.remove("show");
  };

  modal.classList.add("show");
}
