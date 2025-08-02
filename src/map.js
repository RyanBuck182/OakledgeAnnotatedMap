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
  news_vid: {
    name: "This Place In History: Oakledge Park",
    link: "https://vermonthistory.org/oakledge-park",
  }
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
  const cliff_text = "Overlooking the lake, the cliffs of Oakledge provide a unique vantage point for park-goers. They offer a phenomenal view while simultaneously being insulated by forest on all sides but the coast, making it an ideal spot when one wants to avoid crowds at the beach or cove. Furthermore, their elevation over the lake allows them to be used as a launch point for jumping into the water. I experienced this myself when I jumped off the cliff a few times during the final for one of Erik Shonstrom’s classes. This was honestly a pretty huge moment of growth for me, as at the time I did this, I hadn’t gone swimming in any capacity in a few years. My reasoning for this was that I didn’t want to get sand/dirt on me or get cold, but these were silly excuses that prevented me from having fun. During my class and my time at Oakledge, I learned to accept that getting cold or dirty is something you just have to do sometimes in order to have fun. This growth enabled me to make these jumps and really enjoy them.";

  // Cliffs
  createMarker({
    title: "Cliffs",
    description: cliff_text,
    images: ["./assets/images/20250721_124556.jpg"],
    position: { lat: 44.455309, lng: -73.228092 },
    category: Category.Water,
  });
  createMarker({
    title: "Cliffs",
    description: cliff_text,
    images: ["./assets/images/20250721_124703.jpg"],
    position: { lat: 44.455139, lng: -73.228316 },
    category: Category.Water,
  });
  createMarker({
    title: "Cliffs",
    description: cliff_text,
    images: ["./assets/images/20250721_124730.jpg"],
    position: { lat: 44.455003, lng: -73.228373 },
    category: Category.Water,
  });
  createMarker({ // The one I jumped off
    title: "Cliffs",
    description: cliff_text,
    images: ["./assets/images/20250721_124835.jpg"],
    audio: ["./assets/audio/big cliff.wav"],
    position: { lat: 44.455045, lng: -73.228457 },
    category: Category.Water,
  });

  // Rocky Shore
  createMarker({
    title: "Rocky Shore",
    position: { lat: 44.455771, lng: -73.227568 },
    description: "Between the sheer cliffs and the crowded beach, the coast is lined by a secluded rocky shore. It’s covered by foliage and can be accessed from a few small trails, sequestering it from the busier areas of Oakledge. Furthermore, larger rocks create natural barriers that break up the shore, creating a few separate sections that allow multiple groups to use it without breaking the sense of seclusion.",
    images: [
      "./assets/images/20250721_124306.jpg",
      "./assets/images/20250721_124318.jpg",
     ],
    audio: [ "./assets/audio/rocky lake thing.wav" ],
    category: Category.Water,
  });

  // Climbing Cliff
  createMarker({
    title: "Climbing Ridge",
    description: "This fairly inconspicuous rock face, which would likely be passed over by hikers walking by, played a large role in my personal growth. For a few years prior to coming to Champlain, I had been distancing myself from nature. I wouldn’t go near forests or anywhere I could get dirty or encounter bugs. Throughout, my experience at Champlain, I began to reacquaint myself with nature and began developing an understanding that nature wasn’t all bugs and dirt. It was beautiful, peaceful, and most of all, it can be fun. This new understanding came to be tested when, for a class, Erik Shonstrom took us here to rock climb. Merely a few months prior, I would’ve refused, citing bugs, dirt, difficulty, etc., but due to the growth and experiences Oakledge had provided me, I was ready, and had a ton of fun climbing it with my peers. Without these experiences, I wouldn’t be the person I am today.",
    images: ["./assets/images/20250721_131612.jpg"],
    position: { lat: 44.45429299972223, lng: -73.2283414 },
    category: Category.Nature,
  });

  // Oakledge Cove
  createMarker({
    title: "Oakledge Cove",
    description: "Oakledge Cove is an awesome place for swimming, community gathering, and simply admiring Lake Champlain. The shape of the cove makes it feel more safe and secluded than simply wading into the open lake, and it means that from any point within the cove, one is never too far from the shore. Furthermore, the small peninsula extending from the shore also provides some more space for people on shore to spread out or view the lake from. A path also leads up to the cove, making it convenient for anyone to reach without having to walk through steep or rocky trails, and making it accessible to almost anyone.",
    images: [
      "./assets/images/20250721_130224.jpg",
      "./assets/images/20250721_130147.jpg",
      "./assets/images/20250721_125851.jpg",
    ],
    position: { lat: 44.454169, lng: -73.229424 },
    category: Category.Water,
  });

  // Second Cove
  createMarker({
    title: "Second Cove",
    description: "The second cove at Oakledge provides an additional area for swimming and hanging out. Unlike its neighbor, it's rocky rather than sandy, making it a less popular option. However, it still serves its purpose for those who wish to be a bit farther from the crowds. There’s also a manmade wall on the edge of the cove, which separates the public park from the multi-million dollar houses. This is deeply interesting to me, as it's a visible reminder that there’s essentially an entire extra swathe of nature that’s simply closed off to the public.",
    images: ["./assets/images/20250721_130401.jpg", "./assets/images/20250721_130301.jpg"],
    position: { lat: 44.453944499722226, lng: -73.23013939972222 },
    category: Category.Water,
  });

  // White Oak Tree
  createMarker({
    title: "White Oak Tree",
    description: "This white oak tree was recognized by the National Arborist Association in 1987 for the achievement of having lived at the time the Constitution was signed. Though not the oldest tree in Vermont, it certainly makes the age of most other trees in the park seem minuscule in comparison. If not for the marker placed at its feet, this tree would likely go unnoticed by most park-goers.",
    images: [
      "./assets/images/20250721_130016.jpg",
      "./assets/images/20250721_130002.jpg"
    ],
    position: { lat: 44.4540456, lng: -73.22951709972223 },
    category: Category.Nature,
    sources: [
      {
        name: "Bulrington Free Press - Oldest Trees In Vermont",
        link: "https://www.burlingtonfreepress.com/story/life/2019/07/04/oldest-tree-vermont-white-oak-burlington-nature-conservancy/1509194001/"
      }
    ]
  });

  const chimney_text = "The chimneys are perhaps the weirdest feature of Oakledge Park. A park-goer may simply be following a trail through the woods and suddenly come across a massive structure made of stone. These chimneys are actually remnants from old cabins and provide some insight into the park’s history. Before the park was owned by the city of Burlington, it was owned by a wealthy businessman, William Seward Webb, who later went on to build Shelburne Farms. On the land, Webb built a manor and called it “Oak Ledge.” They lived there for a few years before giving it to their daughter. Their daughter then sold it to some businessmen, and it changed hands a few times before eventually being sold to Alan Beach, who decided to turn it into a resort called Oakledge Manor. This resort was in operation between 1929 and 1961, before being sold to General Electric, which intended to turn it into a Country Club. In 1971, the land was finally sold to the city and turned into a public park. The resort, Oakledge Manor, is where the chimneys come from. They were once part of cabins that have long since decayed. The manor was destroyed when the city bought the park and let the fire department perform a fire drill with the manor, burning it down in the process.";

  // Chimney 1
  createMarker({
    title: "Chimney 1",
    description: chimney_text,
    images: [
      "./assets/images/20250721_130045.jpg",
      "./assets/images/20250721_130053.jpg"
    ],
    position: { lat: 44.45403579972223, lng: -73.22966529972223 },
    category: Category.Chimney,
    sources: [
      Sources.crows_path,
      Sources.news_vid,
    ]
  });
  // Chimney 2
  createMarker({
    title: "Chimney 2",
    description: chimney_text,
    images: ["./assets/images/20250721_131735.jpg"],
    position: { lat: 44.45405889972223, lng: -73.2286383 },
    category: Category.Chimney,
    sources: [
      Sources.crows_path,
      Sources.news_vid,
    ]
  });
  // Chimney 3
  createMarker({
    title: "Chimney 3",
    description: chimney_text,
    images: ["./assets/images/20250721_131929.jpg"],
    position: { lat: 44.4546178, lng: -73.2285748 },
    category: Category.Chimney,
    sources: [
      Sources.crows_path,
      Sources.news_vid,
    ]
  });
  // Chimney 4
  createMarker({
    title: "Chimney 4",
    description: chimney_text,
    images: [
      "./assets/images/20250721_132812.jpg",
      "./assets/images/20250721_132800.jpg",
    ],
    position: { lat: 44.45452159972223, lng: -73.228323 },
    category: Category.Chimney,
    sources: [
      Sources.crows_path,
      Sources.news_vid,
    ]
  });
  // Chimney 5
  createMarker({
    title: "Chimney 5",
    description: chimney_text,
    images: ["./assets/images/20250721_132854.jpg"],
    position: { lat: 44.4548235, lng: -73.22831759972222 },
    category: Category.Chimney,
    sources: [
      Sources.crows_path,
      Sources.news_vid,
    ]
  });  
  // Chimney 6
  createMarker({
    title: "Chimney 6",
    description: chimney_text + " \nI didn't spot this one on the ground, so I didn't manage to get a picture, but I decided to mark it after noticing it on the maps.",
    position: { lat: 44.453976, lng: -73.228103 },
    category: Category.Chimney,
    sources: [
      Sources.crows_path,
      Sources.news_vid,
    ]
  });

  // weird concrete thing (maybe remove)
  createMarker({
    title: "Concrete Foundation",
    description: "I unfortunately do not have much to say about this weird concrete foundation nestled in the woods. It most likely came from construction in relation to Oakledge Manor, but I was unable to find any information to back this up. Nevertheless, it will remain there and continue to puzzle park-goers for years to come.",
    images: ["./assets/images/20250721_132443.jpg"],
    position: { lat: 44.454917299722226, lng: -73.22808879972223 },
    category: Category.Misc,
  });
  // explain that i have no idea what it is but might have to do with oakledge manor

  // Oakledge Manor Sign
  createMarker({
    title: "Oakledge Manor Sign",
    description: "This sign provides some information about Oakledge Manor, the resort that used to be at Oakledge before it became a public park. It’s interesting to look at the photos and think about the people who once stayed at Oakledge Manor. They carried the same desire to enjoy nature that keeps people coming to Oakledge Park today.",
    images: ["./assets/images/20250721_125653.jpg"],
    position: { lat: 44.4531141, lng: -73.22793749972223 },
    category: Category.Misc,
  });
    
  // Treehouse
  createMarker({
    title: "Treehouse",
    description: "The Forever Young Treehouse at Oakledge Park is not only an enjoyable place to hang out and enjoy nature, but it’s also a symbol of progress and achievement. This treehouse is the first universally accessible treehouse in the world. This achievement is owed to its novel design and strategic location, requiring no ladder or stairs to enter, instead opting to build a wheelchair accessible bridge to the house from a nearby ledge.",
    images: [
      "./assets/images/20250721_125441.jpg",
      "./assets/images/20250721_130947.jpg",
      "./assets/images/20250721_131006.jpg",
      "./assets/images/20250721_131012.jpg",
      "./assets/images/20250721_131015.jpg",
    ],
    position: { lat: 44.4526905, lng: -73.2279735 },
    category: Category.Nature,
    sources: [
      {
        name: "Forever Young Treehouse In Oakledge Park",
        link: "https://www.officiantvermont.com/greatvermontelopementlocation"
      },
      {
        name: "The Treehouse Guys - Oakledge Park",
        link: "https://thetreehouseguys.com/universally-accessible/public-parks/oakledge/"
      }
    ]
  });
  //accessible

  // Pavilion
  createMarker({
    title: "Pavilion",
    description: "Placeholder description blah blah.",
    images: ["./assets/images/20250721_131137.jpg"],
    position: { lat: 44.453455, lng: -73.227627 },
    category: Category.Misc,
  });

  // Playground
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

  // Blanchard Beach
  createMarker({
    title: "Blanchard Beach",
    description: "Blanchard Beach is a great place for the community to enjoy the waters of Lake Champlain. One can relax, swim, and enjoy nature all for free. On nice summer days, one can encounter many people (and ducks) taking advantage of the natural area and enjoying the water. Though there are other beaches near Burlington, Blanchard Beach, though smaller, is known to be less crowded, providing a more enjoyable experience for the community.",
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

  // Green Space
  createMarker({
    title: "Green Space",
    description: "Adjacent to the beach is a large open green space. This space is perfect for picnics, games, community gatherings, and getting away from the heat of the sun. Considering Burlington’s urbanization, having a green space like this so close is huge for residents who need time away from the harsh metal and concrete of the city.",
    images: ["./assets/images/20250721_133657.jpg"],
    position: { lat: 44.456779599722225, lng: -73.2243871 },
    category: Category.Nature,
  });
  // has picnic bench
  
  // Earth Clock
  createMarker({
    title: "Earth Clock",
    description: "The Burlington Earth Clock is a unique installation built by Circles for Peace, a Vermont organization that believes that witnessing the cycles of nature can benefit one’s wellbeing. When one stands in the center of the Earth Clock, their shadow tells the time of day. The goal of Circles for Peace is to build installations like the Earth Clock at parks all around Vermont to create these spaces for the community.",
    images: [
      "./assets/images/20250721_134606.jpg",
      "./assets/images/20250721_134625.jpg"
    ],
    position: { lat: 44.457780, lng: -73.223546 },
    category: Category.Misc,
    sources: [
      {
        name: "Burlington City Arts - Burlington Earth Clock",
        link: "https://www.burlingtoncityarts.org/burlington-earth-clock",
      },
      {
        name: "Circles For Peace - About",
        link: "https://circlesforpeace.org/about/"
      }
    ]
  });
}
