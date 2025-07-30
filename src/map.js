let GoogleMap, AdvancedMarkerElement, PinElement;
let map;

async function initializeMap() {
  ({ Map: GoogleMap } = await google.maps.importLibrary("maps"));
  ({ AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker"));

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
    images: [
      "./assets/squirrel.jpg",
      "./assets/620762.png",
    ],
  });

  createMarker({
    title: "Rocky Shore",
    position: { lat: 44.455694, lng: -73.227519 },
    description: 'This is a test decription. Lorem ipsum dolor sit amet'
    + ' consectetur adipisicing elit. Rerum incidunt ex illo reiciendis cupiditate'
    + ' consectetur, aliquid quis, delectus sed quasi ut neque natus aspernatur ab'
    + ' placeat minus nesciunt obcaecati eum.',
    images: [
      "./assets/20250721_124306.jpg",
    ],
  });
  
}

/**
 * Create a map marker.
 * @param {{
 * title: String,
 * position: { lat: Number, lng: Number },
 * description: String,
 * images: String?[],
 * }} p The parameters.
 * @returns {AdvancedMarkerElement} The marker element.
 */
function createMarker(p) {
  const pin = new PinElement({
    background: "#0390fc",
    borderColor: "#0000cf",
    glyphColor: "#0000cf"
  });

  const marker = new AdvancedMarkerElement({
    map: map,
    position: p.position,
    title: p.title,
    content: pin.element,
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
 * images: String?[]
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
  const modal_images = document.getElementById("modal-images");

  modal_title.innerText = p.title;
  modal_description.innerText = p.description;

  if (p.images && p.images.length > 0) {
    let currentImageIndex = 0;
    
    modal_images.innerHTML = `
      <div class="image-container">
        <img id="modal-image" src="${p.images[0]}" alt="${p.title}">
        ${p.images.length > 1 ? `
          <button id="prev-btn" class="nav-btn prev">&lt;</button>
          <button id="next-btn" class="nav-btn next">&gt;</button>
          <div class="image-counter">${currentImageIndex + 1} / ${p.images.length}</div>
        ` : ''}
      </div>
    `;

    if (p.images.length > 1) {
      const prevBtn = document.getElementById("prev-btn");
      const nextBtn = document.getElementById("next-btn");
      const modalImage = document.getElementById("modal-image");
      const counter = document.querySelector(".image-counter");

      prevBtn.onclick = () => {
        currentImageIndex = (currentImageIndex - 1 + p.images.length) % p.images.length;
        modalImage.src = p.images[currentImageIndex];
        counter.innerText = `${currentImageIndex + 1} / ${p.images.length}`;
      };

      nextBtn.onclick = () => {
        currentImageIndex = (currentImageIndex + 1) % p.images.length;
        modalImage.src = p.images[currentImageIndex];
        counter.innerText = `${currentImageIndex + 1} / ${p.images.length}`;
      };
    }
  } else {
    modal_images.innerHTML = '';
  }

  modal_close.onclick = () => modal.classList.remove("show");
  window.onclick = (event) => {
    if (event.target == modal)
      modal.classList.remove("show");
  };

  modal.classList.add("show");
}
