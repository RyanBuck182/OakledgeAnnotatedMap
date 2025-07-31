let GoogleMap, AdvancedMarkerElement, PinElement;
let map;
let infoWindow;

/**
 * @typedef {object} Source
 * @property {string} name - The name of the source, to be displayed.
 * @property {string} link - The link to the source.
 */
const Sources = {
  crows_path: {
    name: "Crow's Path Oakledge Park",
    link: "https://docs.google.com/document/d/1wXfguzkHqh9jgZSvlM8or0_5bMe_JJPuLTQekxQvPpU/edit?usp=sharing",
  },
  test_source: {
    name: "Test Source",
    link: "https://google.com",
  },
};

/**
 * Marker categories
 * @readonly
 * @enum {Object}
 */
const Category = {
  Chimney: {
    background: "#b103fcff",
    borderColor: "#6e00cfff",
    glyphColor: "#6e00cfff"
  },
  Default: {
    background: "#0390fc",
    borderColor: "#0000cf",
    glyphColor: "#0000cf"
  },
};

async function initializeMap() {
  ({ Map: GoogleMap } = await google.maps.importLibrary("maps"));
  ({ AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker"));

  map = new GoogleMap(document.getElementById('map'), {
    center: { lat: 44.454778, lng: -73.227556 },
    zoom: 18,
    mapId: "46571f95beb50f37f04802da",
    mapTypeId: 'hybrid'
  });

  // Initialize the info window.
  // Only one is ever created. It is reused for each marker.
  infoWindow = new google.maps.InfoWindow({content: ""});
  map.addListener("click", () => {
    infoWindow.close();
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
    sources: [
      Sources.crows_path,
      Sources.test_source,
    ]
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
 * category: Category?,
 * sources: Source?[],
 * }} p The parameters.
 * @returns {AdvancedMarkerElement} The marker element.
 */
function createMarker(p) {
  const pin = new PinElement(p.category ?? Category.Default);

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
 * images: String?[],
 * sources: Source?[],
 * }} p The parameters.
 */
function createInfoWindow(marker, p) {
  const max_desc_length = 150;

  let display_description = p.description;
  if (display_description.length > max_desc_length) {
    display_description = display_description.slice(0, max_desc_length - 3);
    display_description += "..."
  }

  marker.addListener("click", () => {
    infoWindow.setContent(`
      <div style="max-width: 300px;">
        <h2>${p.title}</h2>
        <p>${display_description}</p>
        <p id="see-more">See more...</p>
      </div>
    `);

    infoWindow.open({
      anchor: marker,
      map: map,
    });

    infoWindow.addListener('domready', () => {
      const see_more = document.getElementById("see-more");
      see_more.addEventListener('click', () => showMarkerModal(p));
    });
  });
}

/**
 * Create a modal for a map marker.
 * @param {{
 * title: String,
 * description: String,
 * images: String?[]
 * sources: Source?[],
 * }} p The parameters.
 */
function showMarkerModal(p) {
  const modal = document.getElementById("modal");
  const modal_close = document.getElementById("modal-close");
  const modal_title = document.getElementById("modal-title");
  const modal_description = document.getElementById("modal-description");
  const modal_sources = document.getElementById("modal-sources");

  modal_title.innerText = p.title;
  modal_description.innerText = p.description;

  if (p.sources && p.sources.length > 0) {
    let sources_html = "<h2>Sources:</h2>";
    p.sources.forEach(source => {
      sources_html += `<a class="source" href="${source.link}">${source.name}</a>`
    });
    modal_sources.innerHTML = sources_html;
  }

  showModalImages(p);

  modal_close.onclick = () => modal.classList.remove("show");
  window.onclick = (event) => {
    if (event.target == modal)
      modal.classList.remove("show");
  };

  modal.classList.add("show");
}

/**
 * Show the images on a modal.
 * @param {{
 * title: String,
 * description: String,
 * images: String?[]
 * }} p The parameters.
 */
function showModalImages(p) {
  const modal_images = document.getElementById("modal-images");

  if (p.images && p.images.length > 0) {
    const img_count = p.images.length;
    let img_index = 0;
    
    modal_images.innerHTML = `
      <div id="modal-image-container">
        <img id="modal-image" src="${p.images[0]}" alt="${p.title}">
        ${img_count > 1 ? `
          <button id="modal-image-prev-btn" class="modal-image-nav-btn">&lt;</button>
          <button id="modal-image-next-btn" class="modal-image-nav-btn">&gt;</button>
          <div id="modal-image-counter">${img_index + 1} / ${img_count}</div>
        ` : ''}
      </div>
    `;

    if (img_count > 1) {
      const modal_image = document.getElementById("modal-image");
      const prev_btn = document.getElementById("modal-image-prev-btn");
      const next_btn = document.getElementById("modal-image-next-btn");
      const img_counter = document.getElementById("modal-image-counter");

      const change_img_index = (amt) => {
        img_index = (img_index + amt + img_count) % img_count;
        modal_image.src = p.images[img_index];
        img_counter.innerText = `${img_index + 1} / ${img_count}`;
      }

      prev_btn.onclick = () => change_img_index(-1);
      next_btn.onclick = () => change_img_index(+1);
    }
  } else {
    modal_images.innerHTML = '';
  }
}
