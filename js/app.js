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

// ─── State ────────────────────────────────────────────────────────────────────
let allProjects      = [];
let filteredProjects = [];
let activeFilters    = { search: '', type: null, status: null, communityArea: null, sourceConfidence: null };
let map;
let markers          = []; // { mapMarker, el, project }
let activeProject    = null;

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function init() {
  // Init map
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: PRESET_VIEWS[0].center,
    zoom:   PRESET_VIEWS[0].zoom,
  });
  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), 'bottom-right');

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

  // Close drawer on map click (not on marker)
  map.on('click', () => {
    if (activeProject) closeDrawer();
  });
}

// ─── Preset buttons ──────────────────────────────────────────────────────────
function buildPresetButtons() {
  const container = document.getElementById('preset-buttons');
  PRESET_VIEWS.forEach((view, i) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn' + (i === 0 ? ' active' : '');
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
    ['Proposed',              STATUS_COLORS['Proposed'],             'Red = Major pending decision'],
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
  updateCounter();
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
    item.addEventListener('click', () => {
      openDrawer(p);
      map.flyTo({ center: [p.longitude, p.latitude], zoom: Math.max(map.getZoom(), 12), speed: 0.8 });
    });
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

// ─── Cumulative counter ───────────────────────────────────────────────────────
function updateCounter() {
  let sqft = 0, hotelRooms = 0, housingUnits = 0, employees = 0, debt = 0, hearings = 0;
  const now = new Date();

  filteredProjects.forEach(p => {
    if (p.squareFootage)     sqft       += p.squareFootage;
    if (p.hotelRooms)        hotelRooms += p.hotelRooms;
    if (p.housingUnits)      housingUnits += p.housingUnits;
    if (p.estimatedEmployees) employees += p.estimatedEmployees;
    if (p.publicDebtSubsidy) debt       += p.publicDebtSubsidy;
    if (p.nextMeetingDate && new Date(p.nextMeetingDate) >= now) hearings++;
  });

  document.getElementById('counter-projects').textContent  = filteredProjects.length;
  document.getElementById('counter-sqft').textContent      = sqft       ? `${(sqft/1000).toFixed(0)}K sf` : '—';
  document.getElementById('counter-hotels').textContent    = hotelRooms ? hotelRooms : '—';
  document.getElementById('counter-housing').textContent   = housingUnits ? housingUnits : '—';
  document.getElementById('counter-employees').textContent = employees  ? employees.toLocaleString() : '—';
  document.getElementById('counter-debt').textContent      = debt       ? `$${(debt/1e6).toFixed(0)}M` : '—';
  document.getElementById('counter-hearings').textContent  = hearings   ? hearings : '—';
  document.getElementById('counter-debt2').textContent     = debt       ? `$${(debt/1e6).toFixed(0)}M` : '—';
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function openDrawer(project) {
  activeProject = project;
  const color = STATUS_COLORS[project.status] || '#6b7280';

  // Update marker classes
  markers.forEach(({ el, project: p }) => {
    el.classList.toggle('active-marker', p.id === project.id);
  });

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
    if (project.nextMeetingDate)       parts.push(`<div class="drawer-label">Next Meeting</div><p class="drawer-date">${project.nextMeetingDate}</p>`);
    if (project.publicCommentDeadline) parts.push(`<div class="drawer-label" style="margin-top:6px">Comment Deadline</div><p class="drawer-date">${project.publicCommentDeadline}</p>`);
    return parts.length ? `<div class="drawer-section">${parts.join('')}</div>` : '';
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
}

// Expose for inline handlers
window.closeDrawer = closeDrawer;

// ─── Start ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
