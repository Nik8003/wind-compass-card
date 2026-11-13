/*
 * Wind Compass Card for Home Assistant
 *
 * Shows where the wind comes from and how strong it is, relative to your house:
 * the arrow crosses the compass from the wind's origin, and each configured
 * window is drawn as an arc on the ring that lights up when the wind hits it
 * (orange) or when wind + rain hit it (red).
 * Below the compass, windows are grouped by facade: one row per side of the house.
 *
 * No build step: this single file is the whole card.
 */

const CARD_VERSION = "0.4.0";

const CARDINALS = {
  en: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"],
  it: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"],
};

// Full names for the 8 main directions (used as facade names)
const FACADES = {
  en: ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"],
  it: ["Nord", "Nord-Est", "Est", "Sud-Est", "Sud", "Sud-Ovest", "Ovest", "Nord-Ovest"],
};

const TEXT = {
  en: {
    calm: "Calm",
    raining: "Raining",
    dry: "Dry",
    sheltered: "Sheltered",
    exposed: "Wind",
    risk: "Wind + rain",
    unavailable: "Unavailable",
    direction_entity: "Wind direction sensor (0-360°)",
    speed_entity: "Wind speed sensor",
    rain_entity: "Rain sensor (optional)",
    rain_threshold: "Rain threshold",
    wall_rain_threshold: "Rain on the glass to raise the alarm (mm/h)",
    wall_rain_max: "Rain on the glass for a full arc (mm/h)",
    max_rain: "Rain (mm/h) for the heaviest shower",
    name: "Name (optional)",
    min_speed: "Minimum wind speed to count a window as exposed",
    max_speed: "Speed for full-size arrow",
  },
  it: {
    calm: "Calma",
    raining: "Piove",
    dry: "Asciutto",
    sheltered: "Al riparo",
    exposed: "Vento",
    risk: "Vento + pioggia",
    unavailable: "Non disponibile",
    direction_entity: "Sensore direzione vento (0-360°)",
    speed_entity: "Sensore velocità vento",
    rain_entity: "Sensore pioggia (opzionale)",
    rain_threshold: "Soglia pioggia",
    wall_rain_threshold: "Pioggia sul vetro per l'allarme (mm/h)",
    wall_rain_max: "Pioggia sul vetro per arco pieno (mm/h)",
    max_rain: "Pioggia (mm/h) per l'acquazzone massimo",
    name: "Nome (opzionale)",
    min_speed: "Velocità minima per considerare una finestra esposta",
    max_speed: "Velocità per freccia a dimensione massima",
  },
};

const DEFAULTS = {
  max_speed: 60,
  min_speed: 10,
  rain_threshold: 0,
  max_rain: 15,
  wall_rain_threshold: 0.3,
  wall_rain_max: 5,
};

// Wind speed units -> m/s (the driving-rain formula works in m/s)
const TO_MS = { "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, kn: 0.514444, kt: 0.514444, "ft/s": 0.3048 };

// Rain streaks inside the compass: positions are fixed (pseudo-random) so the layout is stable.
const RAIN_LINES = 300; // with max_rain 15 mm/h: 2 drops every 0.1 mm/h
const RAIN_STREAKS = Array.from({ length: RAIN_LINES }, (_, i) => {
  const r = (n) => {
    const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: 24 + r(1) * 152, size: 0.8 + r(2) * 0.45, delay: r(3), speed: 0.8 + r(4) * 0.4 };
});

// A raindrop moving downwards: round head at the bottom (towards where the wind blows),
// pointed tail at the top. Centered on x, head bottom at y = rad.
// Wind chevrons: fixed "V"s along the wind axis, pointing where the wind blows, drawn for wind
// from North (pointing down). Their arms run off the edge of the compass.
//   1 km/h        -> the central V (k = 0), thin and green
//   each km/h more -> one V before and one after it, up to 19 Vs at 10 km/h (whole dial covered)
//   10 -> 15 km/h -> color goes from green to red
//   above 15 km/h -> the Vs get thicker, up to a few px from each other at max_speed
const CHEV_SIDE = 9; // Vs on each side of the central one
const CHEV_STEP = 12.4; // distance between Vs along the axis
const CHEV_ARM = 130; // reach of each arm (clipped by the compass)
const CHEV_THIN = 1.6;
const CHEV_THICK = CHEV_STEP * Math.SQRT1_2 - 2.2; // perpendicular gap between arms minus a few px
const CHEV_FULL_KMH = 10;
const CHEV_RED_KMH = 15;
// apex offset so that the V's arms are centred on the dial (the central V wraps around the hub)
const CHEVRONS = Array.from({ length: CHEV_SIDE * 2 + 1 }, (_, n) => {
  const k = n - CHEV_SIDE;
  return { k, apex: 100 + 38 + k * CHEV_STEP };
});
const chevronPoints = (apex) =>
  `${100 - CHEV_ARM},${(apex - CHEV_ARM).toFixed(1)} 100,${apex.toFixed(1)} ${100 + CHEV_ARM},${(apex - CHEV_ARM).toFixed(1)}`;
// green (<= 10 km/h) -> yellow -> orange -> red (>= 15 km/h)
const chevronColor = (kmh) => {
  const t = Math.min(Math.max((kmh - CHEV_FULL_KMH) / (CHEV_RED_KMH - CHEV_FULL_KMH), 0), 1);
  return `hsl(${Math.round(120 - 120 * t)}, 75%, 45%)`;
};

const dropPath = (x, size) => {
  const rad = 2.4 * size;
  const tail = 9 * size;
  const f = (n) => n.toFixed(2);
  return `M${f(x)} ${f(-tail)} Q${f(x + rad)} ${f(-rad * 1.2)} ${f(x + rad)} 0 A${f(rad)} ${f(rad)} 0 0 1 ${f(x - rad)} 0 Q${f(
    x - rad
  )} ${f(-rad * 1.2)} ${f(x)} ${f(-tail)}Z`;
};

const RAINY_WEATHER = ["rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail"];

const lang = (hass) => {
  const l = (hass && ((hass.locale && hass.locale.language) || hass.language)) || "en";
  return l.startsWith("it") ? "it" : "en";
};

const norm = (a) => ((a % 360) + 360) % 360;
const angDist = (a, b) => {
  const d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
};
const pt = (deg, r) => {
  const rad = (deg * Math.PI) / 180;
  return [(100 + r * Math.sin(rad)).toFixed(2), (100 - r * Math.cos(rad)).toFixed(2)];
};
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
};

// Ring geometry (viewBox has a margin so cardinal letters sit outside the ring)
const R_OUT = 92; // outer ring
const R_BAND = 78; // inner edge of the window arcs
const R_HUB = 32; // center disc

function arcPath(center, width, r1, r2) {
  const w = Math.min(Math.max(width, 1), 359.9);
  const a1 = center - w / 2;
  const a2 = center + w / 2;
  const large = w > 180 ? 1 : 0;
  const [x1, y1] = pt(a1, r2);
  const [x2, y2] = pt(a2, r2);
  const [x3, y3] = pt(a2, r1);
  const [x4, y4] = pt(a1, r1);
  return `M${x1} ${y1} A${r2} ${r2} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 ${large} 0 ${x4} ${y4} Z`;
}

function buildTicks() {
  let out = "";
  for (let a = 0; a < 360; a += 10) {
    const major = a % 90 === 0;
    const mid = a % 30 === 0;
    const [x1, y1] = pt(a, major ? R_OUT - 10 : mid ? R_OUT - 7 : R_OUT - 4);
    const [x2, y2] = pt(a, R_OUT);
    out += `<line class="tick${major ? " major" : mid ? " mid" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
  }
  return out;
}

// Arrow drawn for wind from North: the tail sits at the top (where the wind comes from),
// it crosses the whole compass under the center disc and the tip points South
// (where the wind goes). It is scaled from the center.
const ARROW_POINTS = [
  [100, 176],
  [121, 148],
  [107, 148],
  [107, 24],
  [100, 33],
  [93, 24],
  [93, 148],
  [79, 148],
]
  .map((p) => p.join(","))
  .join(" ");

// Wind intensity color: light blue (calm) -> green -> yellow -> orange -> red (strong)
const intensityColor = (ratio) => `hsl(${Math.round(200 - 200 * ratio)}, 80%, 47%)`;

const DROP_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z"/></svg>';

const STYLE = `
  :host { display: block; }
  ha-card {
    padding: 16px; cursor: pointer; height: 100%; box-sizing: border-box;
    --wc-idle: var(--divider-color, rgba(127,127,127,0.35));
    --wc-exposed: var(--warning-color, #ffa600);
    --wc-water: #1e88e5;
    --wc-rain: var(--info-color, #039be5);
  }
  .header {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    margin-bottom: 4px;
  }
  .title { font-size: 1.2em; font-weight: 500; color: var(--primary-text-color); }
  .title:empty { display: none; }
  .rain {
    display: inline-flex; align-items: center; gap: 4px; margin-left: auto;
    font-size: 0.85em; padding: 2px 8px; border-radius: 12px; white-space: nowrap;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(127,127,127,0.1));
  }
  .rain[hidden] { display: none; }
  .rain.on { color: #fff; background: var(--wc-rain); }

  .compass { display: block; width: 100%; max-width: 260px; margin: 0 auto; overflow: visible; }
  .face { fill: var(--secondary-background-color, rgba(127,127,127,0.06)); }
  .ring { fill: none; stroke: var(--divider-color, rgba(127,127,127,0.4)); stroke-width: 1.5; }
  .tick { stroke: var(--secondary-text-color, #727272); stroke-width: 0.8; opacity: 0.6; }
  .tick.mid { stroke-width: 1.2; opacity: 0.8; }
  .tick.major { stroke-width: 2; opacity: 1; }
  .label {
    fill: var(--secondary-text-color, #727272);
    font-size: 12px; font-weight: 600; font-family: inherit;
    text-anchor: middle; dominant-baseline: central;
  }
  .label.north { fill: var(--primary-text-color, #212121); }

  .sector { fill: var(--wc-idle); opacity: 0.55; transition: fill 0.6s, opacity 0.6s; }
  .sector.exposed { fill: var(--wc-exposed); opacity: 0.9; }
  /* Water on a window: a thick stroke centered on the outer ring and clipped to it,
     so it fills the arc from the outside (where the rain comes from) inwards. */
  .water {
    fill: none; stroke: var(--wc-water); stroke-width: 0; stroke-linecap: butt;
    transition: stroke-width 1s cubic-bezier(.4,0,.2,1);
  }
  .water-hi {
    fill: none; stroke: rgba(255,255,255,0.55); stroke-width: 0.8; opacity: 0;
    transition: opacity 0.6s;
  }
  @keyframes pulse { 50% { opacity: 0.55; } }

  .rot { transform-origin: 100px 100px; transition: transform 1.2s cubic-bezier(.4,0,.2,1); }

  /* Raindrops: drawn for wind from North (moving downwards), rotated with the arrow */
  .streak {
    fill: var(--wc-rain); opacity: 0;
    animation: fall calc(var(--wc-dur, 2s) * var(--s, 1)) linear infinite;
    animation-delay: calc(var(--wc-dur, 2s) * var(--s, 1) * var(--d, 0) * -1);
    transition: opacity 0.8s;
  }
  .streak.on { opacity: 0.75; }
  @keyframes fall { from { transform: translateY(0); } to { transform: translateY(190px); } }
  .chev {
    fill: none; stroke: var(--wc-wind, #4caf50); stroke-width: var(--wc-chev-w, 1.6);
    stroke-linecap: round; stroke-linejoin: round;
    opacity: 0;
    transition: opacity 0.5s, stroke 1s, stroke-width 1s;
  }
  .chev.on { opacity: 0.9; }
  @media (prefers-reduced-motion: reduce) {
    .streak { animation: none; transform: translateY(calc(var(--d, 0) * 170px)); }
  }
  .arrow {
    transform-origin: 100px 100px;
    transition: transform 1.2s cubic-bezier(.4,0,.2,1), opacity 0.8s, fill 1.2s;
    stroke: var(--card-background-color, #fff); stroke-width: 1.5; stroke-linejoin: round;
  }
  .arrow.calm { opacity: 0.45; }

  .hub { fill: var(--card-background-color, #fff); stroke: var(--divider-color, rgba(127,127,127,0.4)); stroke-width: 1.5; }
  .speed { fill: var(--primary-text-color, #212121); font-size: 20px; font-weight: 600; text-anchor: middle; font-family: inherit; }
  .unit { fill: var(--secondary-text-color, #727272); font-size: 9px; text-anchor: middle; font-family: inherit; }

  .dir { text-align: center; color: var(--secondary-text-color, #727272); margin-top: 6px; }
  .dir b { color: var(--primary-text-color, #212121); font-weight: 500; }

  /* Facades: one row per side of the house */
  .facades { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
  .facades:empty { display: none; }
  .fa {
    display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 10px;
    padding: 6px 10px; border-radius: 10px;
    border: 1px solid var(--divider-color, rgba(127,127,127,0.3));
    border-left-width: 4px; border-left-color: var(--wc-idle);
    transition: background 0.6s, border-color 0.6s;
  }
  .fa .badge {
    position: relative; overflow: hidden;
    width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
    font-size: 0.75em; font-weight: 700; color: var(--secondary-text-color, #727272);
    background: var(--secondary-background-color, rgba(127,127,127,0.1));
    transition: background 0.6s, color 0.6s;
  }
  /* The badge fills with water from the bottom, like a glass */
  .fa .badge .fill {
    position: absolute; left: 0; right: 0; bottom: 0; height: 0;
    background: var(--wc-water); transition: height 1s cubic-bezier(.4,0,.2,1);
  }
  .fa .badge .fill::before {
    content: ""; position: absolute; left: -25%; right: -25%; top: -3px; height: 6px;
    border-radius: 50%; background: var(--wc-water);
  }
  .fa .badge span { position: relative; text-shadow: 0 0 3px var(--card-background-color, #fff); }
  .fa .body { min-width: 0; }
  .fa .top { display: flex; align-items: baseline; gap: 0 6px; flex-wrap: wrap; }
  .fa .fname { font-weight: 500; color: var(--primary-text-color, #212121); font-size: 0.95em; }
  .fa .wins { font-size: 0.8em; color: var(--secondary-text-color, #727272); line-height: 1.35; }
  .fa .w { white-space: nowrap; }
  .fa .w.exposed { color: var(--wc-exposed); font-weight: 600; }
  .fa .w.wet { color: var(--wc-water); font-weight: 600; }
  .fa .st { font-size: 0.8em; font-weight: 600; color: var(--secondary-text-color, #727272); }

  .fa.exposed { border-left-color: var(--wc-exposed); }
  .fa.exposed .badge { background: var(--wc-exposed); color: #fff; }
  .fa.exposed .st { color: var(--wc-exposed); }
  .fa.wet {
    border-color: var(--wc-water);
    background: color-mix(in srgb, var(--wc-water) 9%, transparent);
  }
  .fa.wet .badge { color: var(--primary-text-color, #212121); }
  .fa.wet .st { color: var(--wc-water); }

  .unavailable .compass { opacity: 0.4; }
`;

class WindCompassCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("wind-compass-card-editor");
  }

  static getStubConfig(hass) {
    const ids = Object.keys(hass.states);
    const sensors = ids.filter((e) => e.startsWith("sensor."));
    return {
      direction_entity: sensors.find((e) => /wind.*(dir|bearing)|(dir|bearing).*wind|vento.*dir/i.test(e)) || "",
      speed_entity: sensors.find((e) => /wind.*speed|speed.*wind|vento.*vel/i.test(e)) || "",
      sectors: [{ name: "South", direction: 180 }],
    };
  }

  setConfig(config) {
    if (!config.direction_entity) throw new Error("direction_entity is required");
    if (!config.speed_entity) throw new Error("speed_entity is required");
    if (config.sectors && !Array.isArray(config.sectors)) throw new Error("sectors must be a list");
    (config.sectors || []).forEach((s, i) => {
      if (!Number.isFinite(Number(s.direction))) throw new Error(`sectors[${i}].direction must be a number (0-360)`);
    });
    this._config = { ...DEFAULTS, ...config };
    this._lastKey = null;
    if (!this.shadowRoot) this._build();
    this._renderSectors();
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    return 6 + Math.ceil((this._groups ? this._groups.length : 0) / 2);
  }

  getGridOptions() {
    return { columns: 6, min_columns: 4 };
  }

  _build() {
    const root = this.attachShadow({ mode: "open" });
    const [nx, ny] = pt(0, R_OUT + 10);
    const [ex, ey] = pt(90, R_OUT + 10);
    const [sx, sy] = pt(180, R_OUT + 10);
    const [wx, wy] = pt(270, R_OUT + 10);
    root.innerHTML = `
      <style>${STYLE}</style>
      <ha-card>
        <div class="header">
          <div class="title"></div>
          <div class="rain" hidden>${DROP_ICON}<span></span></div>
        </div>
        <svg class="compass" viewBox="-10 -10 220 220" role="img">
          <defs>
            <clipPath id="wc-inner"><circle cx="100" cy="100" r="${R_BAND - 1}"></circle></clipPath>
            <clipPath id="wc-outer"><circle cx="100" cy="100" r="${R_OUT}"></circle></clipPath>
          </defs>
          <circle class="face" cx="100" cy="100" r="${R_OUT}"></circle>
          <g class="chevs" clip-path="url(#wc-inner)"><g class="rot">${CHEVRONS.map(
            (c) => `<polyline class="chev" data-k="${c.k}" points="${chevronPoints(c.apex)}"></polyline>`
          ).join("")}</g></g>
          <g clip-path="url(#wc-inner)"><g class="rot rain-rot">${RAIN_STREAKS.map(
            (s) =>
              `<path class="streak" d="${dropPath(s.x, s.size)}" style="--d:${s.delay.toFixed(3)};--s:${s.speed.toFixed(2)}"></path>`
          ).join("")}</g></g>
          <g class="sectors"></g>
          <g class="waters" clip-path="url(#wc-outer)"></g>
          <circle class="ring" cx="100" cy="100" r="${R_OUT}"></circle>
          <circle class="ring" cx="100" cy="100" r="${R_BAND}" style="opacity:.5"></circle>
          ${buildTicks()}
          <text class="label north" x="${nx}" y="${ny}"></text>
          <text class="label" x="${ex}" y="${ey}"></text>
          <text class="label" x="${sx}" y="${sy}"></text>
          <text class="label" x="${wx}" y="${wy}"></text>
          <g class="rot arrow-g"><polygon class="arrow" points="${ARROW_POINTS}"></polygon></g>
          <circle class="hub" cx="100" cy="100" r="${R_HUB}"></circle>
          <text class="speed" x="100" y="102">–</text>
          <text class="unit" x="100" y="116"></text>
        </svg>
        <div class="dir">–</div>
        <div class="facades"></div>
      </ha-card>
    `;
    const $ = (s) => root.querySelector(s);
    this._card = $("ha-card");
    this._title = $(".title");
    this._rain = $(".rain");
    this._rainText = $(".rain span");
    this._svg = $(".compass");
    this._sectorsG = $(".sectors");
    this._watersG = $(".waters");
    this._rots = [...root.querySelectorAll(".rot")];
    this._streaks = [...root.querySelectorAll(".streak")];
    this._arrow = $(".arrow");
    this._arrowG = $(".arrow-g");
    this._chevG = $(".chevs");
    this._chevs = [...root.querySelectorAll(".chev")];
    this._speedEl = $(".speed");
    this._unitEl = $(".unit");
    this._dirEl = $(".dir");
    this._facadesEl = $(".facades");
    this._labels = [...root.querySelectorAll(".label")];

    this._card.addEventListener("click", () => {
      if (!this._config) return;
      this.dispatchEvent(
        new CustomEvent("hass-more-info", {
          detail: { entityId: this._config.speed_entity },
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  // Arcs on the ring (one per window) and the facade rows (windows grouped by direction,
  // or by the optional `facade` name).
  _renderSectors() {
    const sectors = this._config.sectors || [];

    // Windows on the same facade overlap: draw the widest first so the narrower ones stay visible on top.
    // `width` is only the size of the arc drawn on the ring; exposure is computed from the wind angle.
    const w = (s) => Number(s.width) || 30;
    const order = sectors.map((_, i) => i).sort((a, b) => w(sectors[b]) - w(sectors[a]));
    this._sectorsG.innerHTML = order
      .map((i) => {
        const s = sectors[i];
        return `<path class="sector" data-i="${i}" d="${arcPath(Number(s.direction), w(s), R_BAND, R_OUT)}"><title>${escapeHtml(
          s.name || ""
        )}</title></path>`;
      })
      .join("");
    this._sectorEls = [];
    [...this._sectorsG.children].forEach((el) => (this._sectorEls[Number(el.dataset.i)] = el));

    // Water layer: an open arc on the outer ring for each window (stroke grows with the rain on the glass)
    const openArc = (center, width, r) => {
      const wd = Math.min(Math.max(width, 1), 359.9);
      const [x1, y1] = pt(center - wd / 2, r);
      const [x2, y2] = pt(center + wd / 2, r);
      return `M${x1} ${y1} A${r} ${r} 0 ${wd > 180 ? 1 : 0} 1 ${x2} ${y2}`;
    };
    this._watersG.innerHTML = order
      .map((i) => {
        const s = sectors[i];
        return `<g data-i="${i}"><path class="water" d="${openArc(Number(s.direction), w(s), R_OUT)}"></path><path class="water-hi" d="${openArc(
          Number(s.direction),
          w(s),
          R_OUT
        )}"></path></g>`;
      })
      .join("");
    this._waterEls = [];
    [...this._watersG.children].forEach((g) => {
      this._waterEls[Number(g.dataset.i)] = { water: g.querySelector(".water"), hi: g.querySelector(".water-hi"), center: Number(sectors[g.dataset.i].direction), width: w(sectors[g.dataset.i]), openArc };
    });

    const groups = new Map();
    sectors.forEach((s, i) => {
      const key = s.facade ? `f:${s.facade}` : `d:${norm(Number(s.direction))}`;
      if (!groups.has(key)) groups.set(key, { facade: s.facade, direction: norm(Number(s.direction)), items: [] });
      groups.get(key).items.push(i);
    });
    // Order rows clockwise from North, so they always appear in the same place
    this._groups = [...groups.values()].sort((a, b) => a.direction - b.direction);
    this._facadesEl.innerHTML = this._groups
      .map(
        (g) => `<div class="fa">
          <div class="badge"><div class="fill"></div><span></span></div>
          <div class="body">
            <div class="top"><span class="fname"></span><span class="st"></span></div>
            <div class="wins">${g.items
              .map((i) => `<span class="w">${escapeHtml(sectors[i].name || `${sectors[i].direction}°`)}</span>`)
              .join(", ")}</div>
          </div>
        </div>`
      )
      .join("");
    [...this._facadesEl.children].forEach((el, n) => {
      const g = this._groups[n];
      g.el = el;
      g.badge = el.querySelector(".badge span");
      g.fill = el.querySelector(".badge .fill");
      g.fname = el.querySelector(".fname");
      g.st = el.querySelector(".st");
      g.wEls = [...el.querySelectorAll(".w")];
    });
  }

  // Current rain: { raining, amount (number|undefined), unit }
  _rainNow(st) {
    if (!st) return { raining: false };
    const s = st.state;
    if (s === "on") return { raining: true };
    if (s === "off") return { raining: false };
    if (RAINY_WEATHER.includes(s)) return { raining: true };
    const n = num(s);
    if (n === undefined || (st.entity_id && st.entity_id.startsWith("weather."))) return { raining: false };
    return {
      raining: n > Number(this._config.rain_threshold || 0),
      amount: n,
      unit: st.attributes.unit_of_measurement || "mm",
    };
  }

  _update() {
    if (!this._config || !this._hass || !this._card) return;
    const cfg = this._config;
    const states = this._hass.states;
    const dirSt = states[cfg.direction_entity];
    const spdSt = states[cfg.speed_entity];
    const rainSt = cfg.rain_entity ? states[cfg.rain_entity] : undefined;
    const l = lang(this._hass);
    const T = TEXT[l];
    const unit = (spdSt && spdSt.attributes.unit_of_measurement) || "";

    const key = [dirSt && dirSt.state, spdSt && spdSt.state, rainSt && rainSt.state, unit, l].join("|");
    if (key === this._lastKey) return;
    this._lastKey = key;

    const dir = dirSt ? parseFloat(dirSt.state) : NaN;
    const spd = spdSt ? parseFloat(spdSt.state) : NaN;
    const dirOk = Number.isFinite(dir);
    const spdOk = Number.isFinite(spd);
    const rain = this._rainNow(rainSt);
    const raining = rain.raining;
    const windy = dirOk && spdOk && spd >= Number(cfg.min_speed);
    const fmt = (v, digits) => v.toLocaleString(l, { maximumFractionDigits: digits });

    this._card.classList.toggle("unavailable", !dirOk || !spdOk);
    this._title.textContent = cfg.name || "";

    // Rain badge (only when a rain entity is configured): shows mm when the sensor gives them
    this._rain.hidden = !cfg.rain_entity;
    this._rain.classList.toggle("on", raining);
    if (!rainSt) this._rainText.textContent = T.unavailable;
    else if (rain.amount !== undefined && rain.amount > 0)
      this._rainText.textContent = `${fmt(rain.amount, rain.amount < 10 ? 1 : 0)} ${rain.unit}`;
    else this._rainText.textContent = raining ? T.raining : T.dry;

    // Cardinal letters
    const names = CARDINALS[l];
    [0, 4, 8, 12].forEach((i, n) => (this._labels[n].textContent = names[i]));

    // Arrow rotation: shortest way round (350° -> 10° turns 20°, not 340°)
    if (dirOk) {
      const target = norm(dir);
      if (this._angle === undefined) this._angle = target;
      else this._angle += ((target - norm(this._angle) + 540) % 360) - 180;
    }
    this._rots.forEach((el) => (el.style.transform = `rotate(${this._angle || 0}deg)`));

    // Arrow size and color follow the speed (0 .. max_speed)
    const max = Number(cfg.max_speed) > 0 ? Number(cfg.max_speed) : DEFAULTS.max_speed;
    const ratio = spdOk ? Math.min(Math.max(spd / max, 0), 1) : 0;
    this._arrow.style.transform = `scale(${0.5 + 0.5 * ratio})`;
    this._arrow.style.fill = cfg.color || intensityColor(ratio);
    this._arrow.classList.toggle("calm", !windy);

    // Wind pointer: chevrons (default) or the classic arrow
    const useArrow = cfg.pointer === "arrow";
    this._arrowG.style.display = useArrow ? "" : "none";
    this._chevG.style.display = useArrow ? "none" : "";
    // Chevron rules work in km/h, whatever the sensor's unit
    const kmhFactor = (TO_MS[unit] || TO_MS["km/h"]) * 3.6;
    const kmh = dirOk && spdOk ? spd * kmhFactor : 0;
    const maxKmh = Math.max(max * kmhFactor, CHEV_RED_KMH + 1);
    // 1 km/h -> 1 V, then 2 more per km/h, all 19 at 10 km/h
    const side = kmh < 1 ? -1 : Math.min(Math.floor(kmh), CHEV_FULL_KMH) - 1; // how far from the center
    const grow = Math.min(Math.max((kmh - CHEV_RED_KMH) / (maxKmh - CHEV_RED_KMH), 0), 1);
    this._card.style.setProperty("--wc-wind", cfg.color || chevronColor(kmh));
    this._card.style.setProperty("--wc-chev-w", (CHEV_THIN + (CHEV_THICK - CHEV_THIN) * grow).toFixed(2));
    this._chevs.forEach((el) => el.classList.toggle("on", Math.abs(Number(el.dataset.k)) <= side));

    // Rain streaks: how many depends on the rain amount, how fast on the wind speed
    let rainLevel = 0; // 0..1
    if (raining) {
      if (rain.amount !== undefined) {
        const maxRain = Number(cfg.max_rain) > 0 ? Number(cfg.max_rain) : DEFAULTS.max_rain;
        rainLevel = Math.min(rain.amount / maxRain, 1); // linear: 0 .. max_rain mm/h -> 0 .. all drops
      } else {
        rainLevel = rainSt && rainSt.state === "pouring" ? 0.75 : 0.4; // binary sensor / weather: no amount
      }
    }
    const shown = raining ? Math.max(1, Math.round(rainLevel * RAIN_LINES)) : 0; // at least one drop when it rains
    this._streaks.forEach((el, i) => el.classList.toggle("on", i < shown));
    this._card.style.setProperty("--wc-dur", `${(3.2 - 2.4 * ratio).toFixed(2)}s`);

    // ----- Impact on each window -----
    // Driving rain on a vertical wall (ISO 15927-3 / Straube & Burnett):
    //   wall rain [mm/h] ≈ 0.222 · U [m/s] · R^0.88 [mm/h] · cos(θ)
    // θ = angle between where the wind comes from and where the window faces.
    // Any wind from the window's side (θ < 90°) counts, weighted by cos(θ):
    // with wind from 45°, windows facing 0° and 90° both get ~71% of the full hit.
    const sectors = cfg.sectors || [];
    const toMs = TO_MS[unit] || TO_MS["km/h"];
    const rate = !raining
      ? 0
      : rain.amount !== undefined
      ? rain.amount * (/^in/.test(rain.unit) ? 25.4 : 1)
      : rainSt && rainSt.state === "pouring"
      ? 8
      : 2; // binary sensor / weather without amount: assume moderate rain
    const wallThr = Number(cfg.wall_rain_threshold);
    const impact = sectors.map((s) => {
      if (!dirOk || !spdOk) return { level: 0, wind: 0, wall: 0 };
      const theta = angDist(dir, Number(s.direction));
      const exposure = s.exposure !== undefined ? Math.min(Math.max(Number(s.exposure), 0), 1) : 1;
      const c = theta < 90 ? Math.cos((theta * Math.PI) / 180) * exposure : 0;
      const wind = spd * c; // wind pushing straight onto the window, in the sensor's unit
      const wall = rate > 0 ? 0.222 * spd * toMs * Math.pow(rate, 0.88) * c : 0;
      const level = wall >= wallThr && wall > 0 ? 2 : wind >= Number(cfg.min_speed) ? 1 : 0;
      return { level, wind, wall };
    });
    const level = impact.map((x) => x.level);
    // How full of water (0..1): rain on the glass relative to wall_rain_max
    const wallMax = Number(cfg.wall_rain_max) > 0 ? Number(cfg.wall_rain_max) : DEFAULTS.wall_rain_max;
    const fullness = (wall) => (wall > 0.02 ? Math.min(wall / wallMax, 1) : 0);
    const band = R_OUT - R_BAND;
    sectors.forEach((_, i) => {
      // Orange = wind on the window; water is drawn on top of it
      this._sectorEls[i].classList.toggle("exposed", impact[i].wind >= Number(cfg.min_speed));
      const f = fullness(impact[i].wall);
      const t = f > 0 ? 1.5 + (band - 1.5) * f : 0; // water thickness, from the outer edge inwards
      const we = this._waterEls[i];
      we.water.style.strokeWidth = `${(2 * t).toFixed(2)}`;
      // thin light line on the water surface
      we.hi.setAttribute("d", we.openArc(we.center, we.width, R_OUT - t + 0.6));
      we.hi.style.opacity = f > 0 ? "1" : "0";
    });

    // Facade rows: the row takes the worst state of its windows; hit windows are highlighted
    const STATE = [T.sheltered, T.exposed, T.risk];
    (this._groups || []).forEach((g) => {
      const worst = Math.max(0, ...g.items.map((i) => level[i]));
      const anyWind = g.items.some((i) => impact[i].wind >= Number(cfg.min_speed));
      g.el.classList.toggle("exposed", worst === 1 || (worst === 2 && anyWind));
      g.el.classList.toggle("wet", worst === 2);
      const gFull = Math.max(0, ...g.items.map((i) => fullness(impact[i].wall)));
      g.fill.style.height = `${Math.round(gFull * 100)}%`;
      g.fill.style.visibility = gFull > 0 ? "visible" : "hidden";
      const octant = Math.round(g.direction / 45) % 8;
      const exact = Math.abs(g.direction - octant * 45) < 0.5;
      g.badge.textContent = names[Math.round(g.direction / 22.5) % 16];
      g.fname.textContent = g.facade || (exact ? FACADES[l][octant] : `${names[Math.round(g.direction / 22.5) % 16]} · ${fmt(g.direction, 0)}°`);
      // Show how hard the facade is hit: rain on the glass (mm/h) or wind pushing on it
      const wall = Math.max(0, ...g.items.map((i) => impact[i].wall));
      const wind = Math.max(0, ...g.items.map((i) => impact[i].wind));
      const detail =
        worst === 2 ? ` · ${fmt(wall, wall < 10 ? 1 : 0)} mm/h` : worst === 1 ? ` · ${fmt(wind, 0)} ${unit}` : "";
      g.st.textContent = `(${STATE[worst]}${detail})`;
      g.items.forEach((i, n) => {
        g.wEls[n].classList.toggle("exposed", level[i] === 1);
        g.wEls[n].classList.toggle("wet", level[i] === 2);
      });
    });

    // Texts
    this._speedEl.textContent = spdOk ? fmt(spd, spd < 10 ? 1 : 0) : "–";
    this._unitEl.textContent = spdOk ? unit : "";
    if (!dirOk) {
      this._dirEl.textContent = T.unavailable;
    } else {
      const card = names[Math.round(norm(dir) / 22.5) % 16];
      this._dirEl.innerHTML = `<b>${card}</b> · ${fmt(dir, 0)}°${windy ? "" : ` · ${T.calm}`}`;
    }
    this._svg.setAttribute("aria-label", `${this._dirEl.textContent}, ${this._speedEl.textContent} ${unit}`);
  }
}

// ---------- Visual editor (uses Home Assistant's built-in ha-form) ----------
// Windows/sectors are edited in YAML (code editor); the form keeps them untouched.

class WindCompassCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    return [
      { name: "name", selector: { text: {} } },
      { name: "direction_entity", required: true, selector: { entity: { domain: "sensor" } } },
      { name: "speed_entity", required: true, selector: { entity: { domain: "sensor" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min_speed", selector: { number: { min: 0, max: 500, step: 1, mode: "box" } } },
          { name: "max_speed", selector: { number: { min: 1, max: 500, step: 1, mode: "box" } } },
        ],
      },
      { name: "rain_entity", selector: { entity: { domain: ["binary_sensor", "sensor", "weather"] } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "rain_threshold", selector: { number: { min: 0, max: 100, step: 0.1, mode: "box" } } },
          { name: "max_rain", selector: { number: { min: 0.5, max: 200, step: 0.5, mode: "box" } } },
          { name: "wall_rain_threshold", selector: { number: { min: 0, max: 50, step: 0.1, mode: "box" } } },
          { name: "wall_rain_max", selector: { number: { min: 0.5, max: 100, step: 0.5, mode: "box" } } },
        ],
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const l = lang(this._hass);
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: ev.detail.value },
            bubbles: true,
            composed: true,
          })
        );
      });
      this.appendChild(this._form);
    }
    this._form.computeLabel = (s) => TEXT[l][s.name] || s.name;
    this._form.hass = this._hass;
    this._form.data = { ...DEFAULTS, ...this._config };
    this._form.schema = this._schema();
  }
}

if (!customElements.get("wind-compass-card")) {
  customElements.define("wind-compass-card", WindCompassCard);
}
if (!customElements.get("wind-compass-card-editor")) {
  customElements.define("wind-compass-card-editor", WindCompassCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "wind-compass-card",
  name: "Wind Compass Card",
  description: "Wind direction and strength around your house, with windows that light up when wind and rain hit them.",
  preview: true,
});

console.info(`%c WIND-COMPASS-CARD %c v${CARD_VERSION} `, "color:white;background:#0277bd;font-weight:bold", "color:#0277bd");
