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
    background: "#fcad03ff",
    borderColor: "#cf2d00ff",
    glyphColor: "#cf2d00ff"
  },
  Nature: {
    background: "#24fc03ff",
    borderColor: "#208000ff",
    glyphColor: "#208000ff"
  },
  Misc: {
    background: "#b103fcff",
    borderColor: "#6e00cfff",
    glyphColor: "#6e00cfff"
  },
  Water: {
    background: "#0390fc",
    borderColor: "#0000cf",
    glyphColor: "#0000cf"
  },
  Default: {}
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

  createMarkers();
}

/**
 * Create a map marker.
 * @param {{
 * title: String,
 * position: { lat: Number, lng: Number },
 * description: String,
 * images: String?[],
 * audio: String?[],
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
 * audio: String?[],
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
 * audio: String?[],
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
  } else {
    modal_sources.innerHTML = "";
  }

  showModalImages(p);
  showModalAudio(p);

  const stopAudio = () => {
    const audio_elements = modal.getElementsByTagName('audio');
    for (const audio_element of audio_elements) {
      audio_element.pause();
      audio_element.currentTime = 0;
    };
  }

  modal_close.onclick = () => {
    stopAudio();
    modal.classList.remove("show");
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      stopAudio();
      modal.classList.remove("show");
    }
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

    const modal_image = document.getElementById("modal-image");
    modal_image.addEventListener("click", () => {
      window.open(modal_image.src);
    });

    if (img_count > 1) {
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

/**
 * Show the audio on a modal.
 * @param {{
 * audio: String?[]
 * }} p The parameters.
 */
function showModalAudio(p) {
  const modal_audio = document.getElementById("modal-audio");

  if (p.audio && p.audio.length > 0) {
    let audio_html = '<div id="modal-audio-container">';

    p.audio.forEach((audio_src) => {
      audio_html += `
        <div class="audio-item">
          <audio controls>
            <source src="${audio_src}" type="audio/wav">
            <source src="${audio_src}" type="audio/mpeg">
            <source src="${audio_src}" type="audio/ogg">
            Your browser does not support the audio.
          </audio>
        </div>
      `;
    });

    audio_html += '</div>';
    modal_audio.innerHTML = audio_html;
  } else {
    modal_audio.innerHTML = '';
  }
}

function createMarkers() {
  // rocky shore
  createMarker({
    title: "Rocky Shore",
    position: { lat: 44.455771, lng: -73.227568 },
    description: 'This is a test decription. Lorem ipsum dolor sit amet'
    + ' consectetur adipisicing elit. Rerum incidunt ex illo reiciendis cupiditate'
    + ' consectetur, aliquid quis, delectus sed quasi ut neque natus aspernatur ab'
    + ' placeat minus nesciunt obcaecati eum.',
    images: [
      "./assets/images/20250721_124306.jpg",
      "./assets/images/20250721_124318.jpg",
     ],
    audio: [ "./assets/audio/rocky lake thing.wav" ],
    category: Category.Water,
  });

  // playground
  createMarker({
    title: "Playground",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_124043.jpg",
      "./assets/images/20250721_124137.jpg",
      "./assets/images/20250721_124214.jpg",
    ],
    position: { lat: 44.455903, lng: -73.226554},
    category: Category.Misc,
  });

  // Cliffs
  createMarker({
    title: "Cliffs",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_124556.jpg"],
    position: { lat: 44.455309, lng: -73.228092 },
    category: Category.Water,
  });
  createMarker({
    title: "Cliffs",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_124703.jpg"],
    position: { lat: 44.455139, lng: -73.228316 },
    category: Category.Water,
  });
  createMarker({
    title: "Cliffs",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_124730.jpg"],
    position: { lat: 44.455003, lng: -73.228373 },
    category: Category.Water,
  });
  createMarker({ // The one I jumped off
    title: "Cliffs",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_124835.jpg"],
    audio: ["./assets/audio/big cliff.wav"],
    position: { lat: 44.455045, lng: -73.228457 },
    category: Category.Water,
  });

  // oakledge cove
  createMarker({
    title: "Oakledge Cove",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_130224.jpg",
      "./assets/images/20250721_130147.jpg",
      "./assets/images/20250721_125851.jpg",
    ],
    position: { lat: 44.454169, lng: -73.229424 },
    category: Category.Water,
  });

  // second cove
  createMarker({
    title: "Second Cove",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_130401.jpg", "./assets/images/20250721_130301.jpg"],
    position: { lat: 44.453944499722226, lng: -73.23013939972222 },
    category: Category.Water,
  });

  // really old tree
  createMarker({
    title: "White Oak Tree",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_130016.jpg",
      "./assets/images/20250721_130002.jpg"
    ],
    position: { lat: 44.4540456, lng: -73.22951709972223 },
    category: Category.Nature,
  });
  //info https://www.burlingtonfreepress.com/story/life/2019/07/04/oldest-tree-vermont-white-oak-burlington-nature-conservancy/1509194001/

  // oakledge manor informational sign
  createMarker({
    title: "Oakledge Manor Sign",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_125653.jpg"],
    position: { lat: 44.4531141, lng: -73.22793749972223 },
    category: Category.Misc,
  });
  
  // pavilion
  createMarker({
    title: "Pavilion",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_131137.jpg"],
    position: { lat: 44.453455, lng: -73.227627 },
    category: Category.Misc,
  });
  
  // weird concrete thing (maybe remove)
  createMarker({
    title: "Concrete Foundation",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_132443.jpg"],
    position: { lat: 44.454917299722226, lng: -73.22808879972223 },
    category: Category.Misc,
  });
  // explain that i have no idea what it is but might have to do with oakledge manor

  // green space, picnic bench
  createMarker({
    title: "Green Space",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_133657.jpg"],
    position: { lat: 44.456779599722225, lng: -73.2243871 },
    category: Category.Nature,
  });
  
  //treehouse
  createMarker({
    title: "Treehouse",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_125441.jpg",
      "./assets/images/20250721_130947.jpg",
      "./assets/images/20250721_131006.jpg",
      "./assets/images/20250721_131012.jpg",
      "./assets/images/20250721_131015.jpg",
    ],
    position: { lat: 44.4526905, lng: -73.2279735 },
    category: Category.Nature,
  });
  //accessible

  //climbing cliff
  createMarker({
    title: "Climbing Ridge",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_131612.jpg"],
    position: { lat: 44.45429299972223, lng: -73.2283414 },
    category: Category.Nature,
  });

  // chimney 1
  createMarker({
    title: "Chimney 1",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_130045.jpg",
      "./assets/images/20250721_130053.jpg"
    ],
    position: { lat: 44.45403579972223, lng: -73.22966529972223 },
    category: Category.Chimney,
  });

  //chimney 2
  createMarker({
    title: "Chimney 2", description:
    "Placeholder description blah blah.",
    images: ["./assets/images/20250721_131735.jpg"],
    position: { lat: 44.45405889972223, lng: -73.2286383 },
    category: Category.Chimney,
  });

  //chimney 3
  createMarker({
    title: "Chimney 3",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_131929.jpg"],
    position: { lat: 44.4546178, lng: -73.2285748 },
    category: Category.Chimney,
  });

  //chimney 4
  createMarker({
    title: "Chimney 4",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_132812.jpg",
      "./assets/images/20250721_132800.jpg",
    ],
    position: { lat: 44.45452159972223, lng: -73.228323 },
    category: Category.Chimney,
  });

  // chimney 5
  createMarker({
    title: "Chimney 5",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_132854.jpg"],
    position: { lat: 44.4548235, lng: -73.22831759972222 },
    category: Category.Chimney,
  });  

  // chimney 6?
  //wasn't able to find it on foot, but I saw it on google maps and figured it was likely to be the last chimney
  createMarker({
    title: "Chimney 6",
    description: "Placeholder description blah blah.",
    position: { lat: 44.453976, lng: -73.228103 },
    category: Category.Chimney,
  });  

  // merge for blanchard beach
  createMarker({
    title: "Blanchard Beach",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_133443.jpg",
      "./assets/images/20250721_133521.jpg",
      "./assets/images/20250721_133743.jpg",
      "./assets/images/20250721_133813.jpg",
      "./assets/images/20250721_133557.jpg",
    ],
    audio: ["./assets/audio/beach.wav"],
    position: { lat: 44.457271599722226, lng: -73.2243196 },
    category: Category.Water,
  });
  
  // merge for earth clock
  createMarker({
    title: "Earth Clock",
    description: "Placeholder description blah blah.",
    images: [
      "./assets/images/20250721_134606.jpg",
      "./assets/images/20250721_134625.jpg"
    ],
    position: { lat: 44.457780, lng: -73.223546 },
    category: Category.Misc,
  });
}
