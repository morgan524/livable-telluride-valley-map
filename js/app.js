/* Valley Project Map — Livable Telluride
   Phase 1: Mapbox GL JS + static data/projects.json + GitHub Pages
   Phase 2 (future): Supabase/PostGIS + MapLibre
*/

mapboxgl.accessToken = 'pk.eyJ1IjoibGl2YWJsZXRlbGx1cmlkZSIsImEiOiJjbXA0NTVva3EwNXo1MnBwcmhnaHhka3dsIn0.8erE-LUnadeYwRSwdr20_w';

// ─── Preset regional views ────────────────────────────────────────────────────
const PRESET_VIEWS = [
  { label: 'Countywide',            center: [-108.00, 38.00], zoom: 9.2  },
  { label: 'Telluride / East End',  center: [-107.830, 37.940], zoom: 12.2 },
  { label: 'Mountain Village',      center: [-107.849, 37.941], zoom: 13.0 },
  { label: "Norwood / Wright's Mesa", center: [-108.281, 38.130], zoom: 11.5 },
  { label: 'Nucla / Naturita / West End', center: [-108.545, 38.250], zoom: 11.0 },
  { label: 'Ophir',                 center: [-107.825, 37.856], zoom: 13.2 },
  { label: 'Ridgway / Regional',    center: [-107.760, 38.153], zoom: 11.0 },
];

// ─── Status → pin color ───────────────────────────────────────────────────────
const STATUS_COLORS = {
  'Proposed':             '#dc2626', // red
  'Under Review':         '#ea580c', // orange
  'Approved':             '#16a34a', // green
  'Litigation':           '#7c3aed', // purple
  'Built':                '#6b7280', // gray
  'Public Infrastructure':'#2563eb', // blue
};

// ─── 3D massing colors by status ─────────────────────────────────────────────
const MASSING_COLORS = {
  'Proposed':             '#d95f02',
  'Under Review':         '#f0a202',
  'Approved':             '#2f7a5f',
  'Public Infrastructure':'#376980',
  'Disputed':             '#6b4f87',
};

// ─── Inline massing GeoJSON (avoids async file-load race) ────────────────────
const MASSING_GEOJSON = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"id":"society-turn-pud-massing","project_id":"society-turn-pud","name":"Society Turn PUD","status":"Under Review","project_type":"Medical / Commercial / Hotel","height_ft":72,"height_m":21.95,"base_m":0,"floors":5,"sqft":400000,"hotel_rooms":125,"housing_units":null,"source_confidence":"Estimated","source_note":"Approximate block massing based on 400,000 sq ft PUD application summary and site area.","deep_dive_url":"https://livabletelluride.org/societyturnpud/","primary_source_url":"","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.8744,37.9489],[-107.8684,37.9489],[-107.8684,37.9517],[-107.8744,37.9517],[-107.8744,37.9489]]]}},{"type":"Feature","properties":{"id":"four-seasons-mv-massing","project_id":"four-seasons-mountain-village","name":"Four Seasons Resort & Residences Telluride","status":"Approved","project_type":"Hotel / Lodging","height_ft":85,"height_m":25.91,"base_m":0,"floors":7,"sqft":350000,"hotel_rooms":52,"housing_units":10,"source_confidence":"Estimated","source_note":"Approximate massing derived from 4.4-acre site area and public application materials.","deep_dive_url":"https://livabletelluride.org/","primary_source_url":"https://coloradosun.com/2026/04/07/housing-four-seasons-mountain-village/","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.8462,37.9372],[-107.8440,37.9372],[-107.8440,37.9384],[-107.8462,37.9384],[-107.8462,37.9372]]]}},{"type":"Feature","properties":{"id":"six-senses-mv-massing","project_id":"six-senses-mountain-village","name":"Six Senses Telluride","status":"Approved","project_type":"Hotel / Lodging","height_ft":72,"height_m":21.95,"base_m":0,"floors":6,"sqft":180000,"hotel_rooms":77,"housing_units":56,"source_confidence":"Estimated","source_note":"Approximate massing based on 77-room hotel + 24 residences + 56-unit employee housing complex.","deep_dive_url":"https://livabletelluride.org/","primary_source_url":"https://www.telluridenews.com/","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.8489,37.9329],[-107.8471,37.9329],[-107.8471,37.9341],[-107.8489,37.9341],[-107.8489,37.9329]]]}},{"type":"Feature","properties":{"id":"voodoo-housing-massing","project_id":"voodoo-affordable-housing","name":"VooDoo Affordable Housing","status":"Approved","project_type":"Housing","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":85000,"hotel_rooms":null,"housing_units":27,"source_confidence":"Estimated","source_note":"Approximate block massing based on 27-unit affordable housing project.","deep_dive_url":"https://livabletelluride.org/the-voodoo-project/","primary_source_url":"","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.8123,37.9379],[-107.8103,37.9379],[-107.8103,37.9391],[-107.8123,37.9391],[-107.8123,37.9379]]]}},{"type":"Feature","properties":{"id":"chair-7-massing","project_id":"chair-7-open-space","name":"Chair 7 Redevelopment Area","status":"Proposed","project_type":"Open Space / Hotel / Land Use","height_ft":60,"height_m":18.29,"base_m":0,"floors":5,"sqft":120000,"hotel_rooms":80,"housing_units":null,"source_confidence":"Unknown","source_note":"Placeholder massing only. Chair 7 redevelopment concept has been discussed publicly but no formal application has been filed.","deep_dive_url":"https://livabletelluride.org/the-chair-7-development-controversy/","primary_source_url":"","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.8630,37.9274],[-107.8610,37.9274],[-107.8610,37.9286],[-107.8630,37.9286],[-107.8630,37.9274]]]}},{"type":"Feature","properties":{"id":"canyonlands-tower-house-massing","project_id":"canyonlands-tower-house","name":"Tower House Parcel (.33 AC)","status":"Approved","project_type":"Housing","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":14374,"hotel_rooms":null,"housing_units":25,"source_confidence":"Estimated","source_note":"Tower House parcel (.33 AC, acquired 2018). Footprint estimated at ~40% lot coverage per Accommodations Two zoning. ~25 of the 35–45 projected units. Height: ~45 ft per project program.","deep_dive_url":"https://livabletelluride.org/from-36-million-to-103-million-how-telluride-became-richer-than-a-lottery-winner/","primary_source_url":"","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.8172,37.9388],[-107.8167,37.9388],[-107.8167,37.9393],[-107.8172,37.9393],[-107.8172,37.9388]]]}},{"type":"Feature","properties":{"id":"canyonlands-parcel-massing","project_id":"canyonlands-tower-house","name":"Canyonlands Parcel (.20 AC)","status":"Approved","project_type":"Housing","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":8712,"hotel_rooms":null,"housing_units":15,"source_confidence":"Estimated","source_note":"Canyonlands parcel (.20 AC, acquired 2021). Footprint estimated at ~40% lot coverage. ~15 of the 35–45 projected units. Height: ~45 ft per project program.","deep_dive_url":"https://livabletelluride.org/from-36-million-to-103-million-how-telluride-became-richer-than-a-lottery-winner/","primary_source_url":"","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.8165,37.9388],[-107.8162,37.9388],[-107.8162,37.9392],[-107.8165,37.9392],[-107.8165,37.9388]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-a-massing","project_id":"carhenge-lot","name":"Carhenge — Building A (NW, near Cimarron Lodge)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":8000,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 8,000 SF total floor area.","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819934,37.937250],[-107.819761,37.937250],[-107.819761,37.937385],[-107.819934,37.937385],[-107.819934,37.937250]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-b-massing","project_id":"carhenge-lot","name":"Carhenge — Building B (North, Center)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":6400,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 6,400 SF total floor area.","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819715,37.937269],[-107.819564,37.937269],[-107.819564,37.937394],[-107.819715,37.937394],[-107.819715,37.937269]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-c-massing","project_id":"carhenge-lot","name":"Carhenge — Building C (North, East)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":12300,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 12,300 SF total floor area.","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819529,37.937232],[-107.819299,37.937232],[-107.819299,37.937394],[-107.819529,37.937394],[-107.819529,37.937232]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-d-west-massing","project_id":"carhenge-lot","name":"Carhenge — Building D-West (Mid-Tier)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":33400,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 33,400 SF total floor area (west half of combined 74,400 SF Building D).","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819923,37.936943],[-107.819553,37.936943],[-107.819553,37.937187],[-107.819923,37.937187],[-107.819923,37.936943]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-d-east-massing","project_id":"carhenge-lot","name":"Carhenge — Building D-East (Mid-Tier)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":41000,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 41,000 SF total floor area (east half of combined 74,400 SF Building D).","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819519,37.936943],[-107.819114,37.936943],[-107.819114,37.937187],[-107.819519,37.937187],[-107.819519,37.936943]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-e-west-massing","project_id":"carhenge-lot","name":"Carhenge — Building E-West (South Tier)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":49200,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 49,200 SF total floor area (west half of combined 94,200 SF Building E).","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819923,37.936618],[-107.819437,37.936618],[-107.819437,37.936889],[-107.819923,37.936889],[-107.819923,37.936618]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-e-east-massing","project_id":"carhenge-lot","name":"Carhenge — Building E-East (South Tier)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":45000,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 45,000 SF total floor area (east half of combined 94,200 SF Building E).","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819403,37.936618],[-107.818976,37.936618],[-107.818976,37.936889],[-107.819403,37.936889],[-107.819403,37.936618]]]}},{"type":"Feature","properties":{"id":"carhenge-bldg-f-massing","project_id":"carhenge-lot","name":"Carhenge — Building F (SE, Telluride Trail)","status":"Under Review","project_type":"Housing / Mixed-Use","height_ft":45,"height_m":13.72,"base_m":0,"floors":4,"sqft":18100,"hotel_rooms":null,"housing_units":null,"source_confidence":"Estimated","source_note":"Footprint estimated from Exhibit C Site Plan, HARC Work Session (May 2026). 18,100 SF total floor area, long thin building along Telluride Trail.","deep_dive_url":"https://engagetelluride.org/carhenge-lot-redevelopment-project","primary_source_url":"https://engagetelluride.org/32089/widgets/113355/documents/80980","last_updated":"2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.819253,37.936546],[-107.818836,37.936546],[-107.818836,37.936655],[-107.819253,37.936655],[-107.819253,37.936546]]]}},{"type":"Feature","properties":{"id": "shandoka-lot-l-garage-massing", "project_id": "shandoka-lot-l", "name": "Shandoka Lot L \u2014 Parking Garage (~900 spaces)", "status": "Under Review", "project_type": "Parking / Transit", "height_ft": 50, "height_m": 15.24, "base_m": 0, "floors": 5, "sqft": 405000, "hotel_rooms": null, "housing_units": null, "source_confidence": "Estimated", "source_note": "338-ft wide garage per Exhibit D site plan. ~900 parking spaces. Height 50 ft per section drawing. Depth estimated at ~180 ft. Footprint based on program data in May 2026 P&Z Work Session.", "deep_dive_url": "https://livabletelluride.org/", "primary_source_url": "https://engagetelluride.org/", "last_updated": "2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.823497,37.937843],[-107.822319,37.937843],[-107.822319,37.938339],[-107.823497,37.938339],[-107.823497,37.937843]]]}},{"type":"Feature","properties":{"id": "shandoka-lot-l-housing-massing", "project_id": "shandoka-lot-l", "name": "Shandoka Lot L \u2014 Housing (~60 units / 57,600 SF)", "status": "Under Review", "project_type": "Housing", "height_ft": 45, "height_m": 13.72, "base_m": 0, "floors": 4, "sqft": 57600, "hotel_rooms": null, "housing_units": 60, "source_confidence": "Estimated", "source_note": "+/-57,600 SF / +/-60 units of affordable housing (limited free-market units allowed) per May 2026 P&Z Work Session program table. Located north and east of parking garage.", "deep_dive_url": "https://livabletelluride.org/", "primary_source_url": "https://engagetelluride.org/", "last_updated": "2026-05-13"},"geometry":{"type":"Polygon","coordinates":[[[-107.823200,37.938339],[-107.822600,37.938339],[-107.822600,37.938609],[-107.823200,37.938609],[-107.823200,37.938339]]]}}]};

// ─── State ────────────────────────────────────────────────────────────────────
let allProjects      = [];
let filteredProjects = [];
let activeFilters    = { search: '', type: null, status: null, communityArea: null, sourceConfidence: null };
let map;
let markers          = []; // { mapMarker, el, project }
let activeProject    = null;
let massingLoaded    = false;

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function init() {
  // Init map
  // Default to the corridor from Telluride through Mountain Village to Society Turn
  // Telluride: 37.936,-107.814 | MV: 37.931,-107.856 | Society Turn: 37.950,-107.871
  const DEFAULT_VIEW = { center: [-107.843, 37.938], zoom: 12.3 };
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: DEFAULT_VIEW.center,
    zoom:   DEFAULT_VIEW.zoom,
  });
  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');

  // Load data
  try {
    const resp = await fetch('data/projects.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    allProjects = await resp.json();
  } catch (e) {
    console.error('Failed to load projects.json:', e);
    document.getElementById('project-list').innerHTML =
      '<div class="no-results">⚠️ Could not load project data.</div>';
    return;
  }

  buildPresetButtons();
  buildFilterUI();
  buildLegend();
  applyFilters();

  // Search
  document.getElementById('search-input').addEventListener('input', e => {
    activeFilters.search = e.target.value.toLowerCase().trim();
    applyFilters();
  });

  // Close drawer on map click (not on marker or massing)
  map.on('click', e => {
    const massingFeatures = map.queryRenderedFeatures(e.point, { layers: ['proposed-massing-layer'] });
    if (massingFeatures.length === 0 && activeProject) closeDrawer();
  });

  // Load 3D massing after style is fully ready
  map.on('load', () => {
    loadMassingLayer();
  });
}

// ─── 3D Massing layer ─────────────────────────────────────────────────────────
function loadMassingLayer() {
  // Add GeoJSON source — inlined to avoid async file-load race
  map.addSource('proposed-massing', {
    type: 'geojson',
    data: MASSING_GEOJSON,
  });

  // Add fill-extrusion layer (hidden by default)
  // Heights are multiplied 10× so blocks are visible at overview zoom levels;
  // they become correctly-proportioned when zoomed in to street level.
  map.addLayer({
    id: 'proposed-massing-layer',
    type: 'fill-extrusion',
    source: 'proposed-massing',
    layout: {
      visibility: 'none',
    },
    paint: {
      'fill-extrusion-color': [
        'match',
        ['get', 'status'],
        'Proposed',              '#d95f02',
        'Under Review',          '#f0a202',
        'Approved',              '#2f7a5f',
        'Public Infrastructure', '#376980',
        'Disputed',              '#6b4f87',
        '#888888',
      ],
      // Zoom-scaled height: 4× exaggeration at overview zoom 12, true height at zoom 17+
      'fill-extrusion-height': [
        'interpolate', ['exponential', 2], ['zoom'],
        12, ['*', ['coalesce', ['get', 'height_m'], 20], 4],
        15, ['*', ['coalesce', ['get', 'height_m'], 20], 1.5],
        17, ['coalesce', ['get', 'height_m'], 20],
        22, ['coalesce', ['get', 'height_m'], 20],
      ],
      'fill-extrusion-base':   0,
      'fill-extrusion-opacity': 0.82,
      'fill-extrusion-vertical-gradient': true,
    },
  });

  // Add existing-buildings layer for context (gray, from Mapbox/OSM building tiles)
  // Renders only at zoom ≥ 15 so it doesn't clutter the overview
  map.addLayer({
    id: 'existing-buildings-3d',
    type: 'fill-extrusion',
    source: 'composite',
    'source-layer': 'building',
    filter: ['==', 'extrude', 'true'],
    minzoom: 15,
    layout: { visibility: 'none' },
    paint: {
      'fill-extrusion-color': '#c8c0b4',
      'fill-extrusion-height': [
        'interpolate', ['linear'], ['zoom'],
        15, 0,
        15.5, ['coalesce', ['get', 'height'], 6],
      ],
      'fill-extrusion-base': [
        'interpolate', ['linear'], ['zoom'],
        15, 0,
        15.5, ['coalesce', ['get', 'min_height'], 0],
      ],
      'fill-extrusion-opacity': 0.55,
    },
  }, 'proposed-massing-layer'); // render existing buildings BEHIND proposed massing

  massingLoaded = true;

  // Click on a massing block → open project drawer
  map.on('click', 'proposed-massing-layer', e => {
    const props = e.features[0].properties;
    const project = allProjects.find(p => p.id === props.project_id);
    if (project) {
      openDrawer(project);
    } else {
      // Fallback: open drawer using massing properties directly
      openMassingDrawer(props);
    }
    e.originalEvent.stopPropagation();
  });

  // Hover: pointer cursor
  map.on('mouseenter', 'proposed-massing-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'proposed-massing-layer', () => {
    map.getCanvas().style.cursor = '';
  });

  // Wire toggle
  const toggle = document.getElementById('toggleMassing');
  if (toggle) {
    toggle.addEventListener('change', e => {
      const visible = e.target.checked;
      map.setLayoutProperty('proposed-massing-layer', 'visibility', visible ? 'visible' : 'none');
      map.setLayoutProperty('existing-buildings-3d', 'visibility', visible ? 'visible' : 'none');
      // When enabling, fly to the main Telluride–MV corridor zoomed in enough to see blocks
      map.easeTo({
        ...(visible ? { center: [-107.843, 37.938], zoom: 13.5 } : {}),
        pitch:    visible ? 58 : 0,
        bearing:  visible ? -20 : 0,
        duration: visible ? 1100 : 700,
      });

      // Show/hide disclaimer
      const disclaimer = document.getElementById('massing-disclaimer');
      if (disclaimer) disclaimer.style.display = visible ? 'block' : 'none';

      // Update massing legend visibility
      const massingLegend = document.getElementById('massing-legend-section');
      if (massingLegend) massingLegend.style.display = visible ? 'block' : 'none';
    });
  }
}

// Fallback drawer for massing blocks not linked to a project
function openMassingDrawer(props) {
  const drawer = document.getElementById('drawer');
  const color  = MASSING_COLORS[props.status] || '#888888';

  const confClass = 'confidence-' + (props.source_confidence || 'unknown').toLowerCase().replace(/[^a-z]/g, '-');

  const statsHtml = (() => {
    const parts = [];
    if (props.sqft)        parts.push(`<div class="stat"><span>${(props.sqft/1000).toFixed(0)}K</span>sq ft</div>`);
    if (props.hotel_rooms) parts.push(`<div class="stat"><span>${props.hotel_rooms}</span>hotel rooms</div>`);
    if (props.housing_units) parts.push(`<div class="stat"><span>${props.housing_units}</span>units</div>`);
    if (props.height_ft)   parts.push(`<div class="stat"><span>${props.height_ft} ft</span>approx height</div>`);
    if (props.floors)      parts.push(`<div class="stat"><span>${props.floors}</span>floors</div>`);
    return parts.length
      ? `<div class="drawer-section"><div class="drawer-label">Approximate Scale</div><div class="drawer-stats-grid">${parts.join('')}</div></div>`
      : '';
  })();

  const linksHtml = (() => {
    const parts = [];
    if (props.deep_dive_url)     parts.push(`<a href="${props.deep_dive_url}" target="_blank" rel="noopener" class="drawer-btn drawer-btn-primary">Deep Dive →</a>`);
    if (props.primary_source_url) parts.push(`<a href="${props.primary_source_url}" target="_blank" rel="noopener" class="drawer-btn">Primary Source →</a>`);
    return parts.join('');
  })();

  drawer.innerHTML = `
    <div class="drawer-header" style="background:${color}">
      <button class="drawer-close" onclick="closeDrawer()" title="Close">✕</button>
      <div class="drawer-status-badge" style="outline:1px solid rgba(255,255,255,0.35)">${props.status}</div>
      <h2 class="drawer-title">${props.name}</h2>
      <div class="drawer-meta">${props.project_type}</div>
    </div>
    <div class="drawer-body">
      <div class="drawer-section">
        <div class="drawer-label">3D Massing Block</div>
        <p style="font-size:0.8rem;color:#555;font-style:italic">This block shows the approximate physical scale of the proposed project. It is not an architectural rendering.</p>
      </div>
      ${statsHtml}
      <div class="drawer-section">
        <div class="drawer-label">Source Confidence</div>
        <div class="confidence-badge ${confClass}">${props.source_confidence || 'Unknown'}</div>
        ${props.source_note ? `<p style="font-size:0.72rem;color:#6b7280;margin-top:6px">${props.source_note}</p>` : ''}
      </div>
      ${linksHtml ? `<div class="drawer-links">${linksHtml}</div>` : ''}
      <div class="drawer-footer">Last updated: ${props.last_updated || '—'}</div>
    </div>
  `;

  activeProject = { id: props.project_id };
  drawer.classList.add('open');
}

// ─── Preset buttons ──────────────────────────────────────────────────────────
function buildPresetButtons() {
  const container = document.getElementById('preset-buttons');
  PRESET_VIEWS.forEach((view, i) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = view.label;
    btn.addEventListener('click', () => {
      map.flyTo({ center: view.center, zoom: view.zoom, speed: 0.9 });
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.appendChild(btn);
  });
}

// ─── Filter UI ───────────────────────────────────────────────────────────────
function buildFilterUI() {
  const types       = new Set();
  const statuses    = new Set();
  const areas       = new Set();
  const confidences = new Set();

  allProjects.forEach(p => {
    p.projectType.forEach(t => types.add(t));
    statuses.add(p.status);
    areas.add(p.communityArea);
    confidences.add(p.sourceConfidence);
  });

  renderChips('filter-type',       [...types].sort(),      'type');
  renderChips('filter-status',     [...statuses].sort(),   'status');
  renderChips('filter-area',       [...areas].sort(),      'communityArea');
  renderChips('filter-confidence', [...confidences].sort(),'sourceConfidence');
}

function renderChips(containerId, values, filterKey) {
  const container = document.getElementById(containerId);
  values.forEach(val => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip';
    chip.textContent = val;
    chip.addEventListener('click', () => {
      if (activeFilters[filterKey] === val) {
        activeFilters[filterKey] = null;
        chip.classList.remove('active');
      } else {
        container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        activeFilters[filterKey] = val;
        chip.classList.add('active');
      }
      applyFilters();
    });
    container.appendChild(chip);
  });
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function buildLegend() {
  const container = document.getElementById('legend-items');
  const entries = [
    ['Proposed',              STATUS_COLORS['Proposed'],             ''],
    ['Under Review',          STATUS_COLORS['Under Review'],         ''],
    ['Approved',              STATUS_COLORS['Approved'],             ''],
    ['Litigation',            STATUS_COLORS['Litigation'],           ''],
    ['Public Infrastructure', STATUS_COLORS['Public Infrastructure'],''],
    ['Built / Historical',    STATUS_COLORS['Built'],                ''],
  ];
  entries.forEach(([label, color]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-dot" style="background:${color}"></div><span>${label}</span>`;
    container.appendChild(item);
  });

  // Massing legend (hidden until toggle is on)
  const massingSection = document.getElementById('massing-legend-section');
  if (massingSection) {
    const massingEntries = [
      ['Proposed / Under Review', '#d95f02'],
      ['Approved (not yet built)', '#2f7a5f'],
      ['Public / Civic',          '#376980'],
      ['Disputed',                '#6b4f87'],
    ];
    massingEntries.forEach(([label, color]) => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<div class="legend-block" style="background:${color}"></div><span>${label}</span>`;
      massingSection.appendChild(item);
    });
  }
}

// ─── Filter & render ─────────────────────────────────────────────────────────
function applyFilters() {
  filteredProjects = allProjects.filter(p => {
    if (activeFilters.search) {
      const haystack = [
        p.name, p.shortName, p.location, p.keyQuestion || '',
        ...p.projectType, p.communityArea, p.jurisdiction,
        p.decisionBody || '', p.whyItMatters || '',
      ].join(' ').toLowerCase();
      if (!haystack.includes(activeFilters.search)) return false;
    }
    if (activeFilters.type         && !p.projectType.includes(activeFilters.type)) return false;
    if (activeFilters.status       && p.status !== activeFilters.status)           return false;
    if (activeFilters.communityArea && p.communityArea !== activeFilters.communityArea) return false;
    if (activeFilters.sourceConfidence && p.sourceConfidence !== activeFilters.sourceConfidence) return false;
    return true;
  });

  renderProjectList();
  renderMarkers();
  updateMassingFilter();
}

// Update massing layer to match visible project IDs
function updateMassingFilter() {
  if (!massingLoaded) return;
  const visibleIds = filteredProjects.map(p => p.id);
  // If no filters active, show all massing; otherwise filter to matching project_ids
  const hasActiveFilter = Object.values(activeFilters).some(v => v !== null && v !== '');
  if (hasActiveFilter) {
    map.setFilter('proposed-massing-layer', [
      'in',
      ['get', 'project_id'],
      ['literal', visibleIds],
    ]);
  } else {
    map.setFilter('proposed-massing-layer', null); // show all
  }
}

// ─── Project list ─────────────────────────────────────────────────────────────
function renderProjectList() {
  const list = document.getElementById('project-list');
  list.innerHTML = '';

  if (filteredProjects.length === 0) {
    list.innerHTML = '<div class="no-results">No projects match your filters.</div>';
    return;
  }

  filteredProjects.forEach(p => {
    const item  = document.createElement('div');
    item.className = 'project-item' + (activeProject?.id === p.id ? ' active' : '');

    const dot = document.createElement('span');
    dot.className = 'status-dot';
    dot.style.background = STATUS_COLORS[p.status] || '#6b7280';

    const text = document.createElement('div');
    text.className = 'project-item-text';
    text.innerHTML = `<strong>${p.name}</strong><span>${p.communityArea} · ${p.status}</span>`;

    item.appendChild(dot);
    item.appendChild(text);
    item.addEventListener('click', () => openDrawer(p));
    list.appendChild(item);
  });
}

// ─── Map markers ─────────────────────────────────────────────────────────────
function renderMarkers() {
  markers.forEach(({ mapMarker }) => mapMarker.remove());
  markers = [];

  filteredProjects.forEach(p => {
    const color = STATUS_COLORS[p.status] || '#6b7280';
    const el    = document.createElement('div');
    el.className = 'map-marker' + (activeProject?.id === p.id ? ' active-marker' : '');
    el.style.background = color;
    el.title = p.name;

    const mapMarker = new mapboxgl.Marker({ element: el })
      .setLngLat([p.longitude, p.latitude])
      .addTo(map);

    el.addEventListener('click', e => {
      e.stopPropagation();
      openDrawer(p);
    });

    markers.push({ mapMarker, el, project: p });
  });
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function openDrawer(project) {
  activeProject = project;
  const color = STATUS_COLORS[project.status] || '#6b7280';

  // Update marker classes
  markers.forEach(({ el, project: p }) => {
    el.classList.toggle('active-marker', p.id === project.id);
  });

  // Fly to location and show 3D massing for this project
  map.easeTo({
    center:   [project.longitude, project.latitude],
    zoom:     17,
    pitch:    60,
    bearing:  -22,
    duration: 1200,
  });
  if (massingLoaded) {
    map.setLayoutProperty('proposed-massing-layer', 'visibility', 'visible');
    map.setLayoutProperty('existing-buildings-3d', 'visibility', 'visible');
    map.setFilter('proposed-massing-layer', ['==', ['get', 'project_id'], project.id]);
    const toggle = document.getElementById('toggleMassing');
    if (toggle) toggle.checked = true;
    const disclaimer = document.getElementById('massing-disclaimer');
    if (disclaimer) disclaimer.style.display = 'block';
    const massingLegend = document.getElementById('massing-legend-section');
    if (massingLegend) massingLegend.style.display = 'block';
  }

  const drawer = document.getElementById('drawer');

  const statsHtml = (() => {
    const parts = [];
    if (project.squareFootage)     parts.push(`<div class="stat"><span>${(project.squareFootage/1000).toFixed(0)}K</span>sq ft</div>`);
    if (project.hotelRooms)        parts.push(`<div class="stat"><span>${project.hotelRooms}</span>hotel rooms</div>`);
    if (project.housingUnits)      parts.push(`<div class="stat"><span>${project.housingUnits}</span>units</div>`);
    if (project.estimatedEmployees)parts.push(`<div class="stat"><span>${project.estimatedEmployees.toLocaleString()}</span>employees</div>`);
    if (project.publicDebtSubsidy) parts.push(`<div class="stat"><span>$${(project.publicDebtSubsidy/1e6).toFixed(1)}M</span>public debt</div>`);
    return parts.length ? `<div class="drawer-section"><div class="drawer-label">Key Numbers</div><div class="drawer-stats-grid">${parts.join('')}</div></div>` : '';
  })();

  const datesHtml = (() => {
    const parts = [];
    if (project.nextMeetingDate) {
      const label = project.nextMeetingType || 'Next Meeting';
      const timeStr = project.nextMeetingTime ? ` &nbsp;·&nbsp; ${project.nextMeetingTime}` : '';
      parts.push(`<div class="drawer-label">${label}</div><p class="drawer-date">${project.nextMeetingDate}${timeStr}</p>`);
    }
    if (project.publicCommentDeadline) parts.push(`<div class="drawer-label" style="margin-top:6px">Comment Deadline</div><p class="drawer-date">${project.publicCommentDeadline}</p>`);
    return parts.length ? `<div class="drawer-section">${parts.join('')}</div>` : '';
  })();

  const upcomingHearingsHtml = (() => {
    if (!Array.isArray(project.upcomingHearings) || !project.upcomingHearings.length) return '';
    const cards = project.upcomingHearings.map(h => {
      const d = new Date(h.date + 'T12:00:00');
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const links = [];
      if (h.agendaUrl)   links.push(`<a href="${h.agendaUrl}" target="_blank" rel="noopener" class="hearing-link">Full Agenda →</a>`);
      if (h.zoomUrl)     links.push(`<a href="${h.zoomUrl}" target="_blank" rel="noopener" class="hearing-link">Join Zoom →</a>`);
      if (h.calendarUrl) links.push(`<a href="${h.calendarUrl}" target="_blank" rel="noopener" class="hearing-link">Add to Calendar</a>`);
      return `<div class="hearing-card">
        <div class="hearing-type">${h.type}</div>
        <div class="hearing-date">${dateStr} · ${h.time}</div>
        ${h.description ? `<div class="hearing-desc">${h.description}</div>` : ''}
        ${links.length ? `<div class="hearing-links">${links.join('')}</div>` : ''}
      </div>`;
    }).join('');
    return `<div class="drawer-section"><div class="drawer-label hearing-alert-label">⚠ Upcoming Hearing</div>${cards}</div>`;
  })();

  const documentsHtml = (() => {
    if (!Array.isArray(project.documents) || !project.documents.length) return '';
    const btns = project.documents.map((doc, i) =>
      `<a href="${doc.url}" target="_blank" rel="noopener" class="drawer-btn ${i === 0 ? 'drawer-btn-download' : ''}">
        ⬇ ${doc.title}${doc.size ? ' (' + doc.size + ')' : ''}
      </a>`
    ).join('');
    return `<div class="drawer-section"><div class="drawer-label">Project Documents</div><div class="drawer-links" style="margin-top:6px">${btns}</div></div>`;
  })();

  const confClass = 'confidence-' + project.sourceConfidence.toLowerCase().replace(/[^a-z]/g, '-');

  const linksHtml = (() => {
    const parts = [];
    if (project.deepDiveUrl)     parts.push(`<a href="${project.deepDiveUrl}" target="_blank" rel="noopener" class="drawer-btn drawer-btn-primary">Deep Dive →</a>`);
    if (project.primarySourceUrl) parts.push(`<a href="${project.primarySourceUrl}" target="_blank" rel="noopener" class="drawer-btn">Primary Source →</a>`);
    const subject = encodeURIComponent(`Correction or addition: ${project.name}`);
    const body    = encodeURIComponent(`Project: ${project.name}\n\nMy correction or missing detail:\n`);
    parts.push(`<a href="mailto:info@livabletelluride.org?subject=${subject}&body=${body}" class="drawer-btn drawer-btn-subtle">Submit Correction / Addition</a>`);
    return parts.join('');
  })();

  drawer.innerHTML = `
    <div class="drawer-header">
      <button class="drawer-close" onclick="closeDrawer()" title="Close">✕</button>
      <div class="drawer-status-badge" style="outline:1px solid rgba(255,255,255,0.35)">${project.status}</div>
      <h2 class="drawer-title">${project.name}</h2>
      <div class="drawer-meta">${project.projectType.join(' · ')} &nbsp;·&nbsp; ${project.communityArea}</div>
    </div>
    <div class="drawer-body">
      ${project.keyQuestion ? `
        <div class="drawer-section">
          <div class="drawer-label">Key Question</div>
          <p class="drawer-key-question">${project.keyQuestion}</p>
        </div>` : ''}
      ${project.whyItMatters ? `
        <div class="drawer-section">
          <div class="drawer-label">Why It Matters</div>
          <p>${project.whyItMatters}</p>
        </div>` : ''}
      ${statsHtml}
      <div class="drawer-section">
        <div class="drawer-label">Jurisdiction</div>
        <p style="margin-bottom:4px">${project.jurisdiction}</p>
        <div class="drawer-label">Decision Body</div>
        <p>${project.decisionBody}</p>
      </div>
      ${datesHtml}
      ${upcomingHearingsHtml}
      ${documentsHtml}
      <div class="drawer-section">
        <div class="drawer-label">Source Confidence</div>
        <div class="confidence-badge ${confClass}">${project.sourceConfidence}</div>
        <div class="drawer-label" style="margin-top:6px">Editorial Status</div>
        <p style="font-size:0.72rem;color:#6b7280">${project.editorialStatus}</p>
      </div>
      <div class="drawer-links">${linksHtml}</div>
      <div class="drawer-footer">Last updated: ${project.lastUpdated}</div>
    </div>
  `;

  drawer.classList.add('open');
  renderProjectList(); // update active state in list
}

function closeDrawer() {
  activeProject = null;
  document.getElementById('drawer').classList.remove('open');
  markers.forEach(({ el }) => el.classList.remove('active-marker'));
  renderProjectList();

  // Return to flat view, hide massing, restore full filter
  map.easeTo({ pitch: 0, bearing: 0, duration: 700 });
  if (massingLoaded) {
    map.setLayoutProperty('proposed-massing-layer', 'visibility', 'none');
    map.setLayoutProperty('existing-buildings-3d', 'visibility', 'none');
    map.setFilter('proposed-massing-layer', null);
    const toggle = document.getElementById('toggleMassing');
    if (toggle) toggle.checked = false;
    const disclaimer = document.getElementById('massing-disclaimer');
    if (disclaimer) disclaimer.style.display = 'none';
    const massingLegend = document.getElementById('massing-legend-section');
    if (massingLegend) massingLegend.style.display = 'none';
  }
}

// Expose for inline handlers
window.closeDrawer = closeDrawer;

// ─── Start ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
