/*
 * Wind Compass Card for Home Assistant
 *
 * A wind & rain compass: chevrons along the wind axis show direction and strength (denser
 * with stronger wind), raindrops fly across it with the wind, and each configured window sits
 * on a wall around the compass with two gauges: wind pushing on it and rain hitting the glass.
 *
 * (The per-facade window list lives in archive/ and will become its own card.)
 *
 * No build step: this single file is the whole card.
 */

const CARD_VERSION = "1.0.0";

// ---------- Translations ----------
// Each language has: the 16 compass points, the 8 traditional winds of the Mediterranean wind
// rose (by where the wind comes from: N, NE, E, SE, S, SW, W, NW), the card texts and the editor
// labels. Users can override any card text with the `texts` option (see README).

const LANGUAGES = {
  en: { label: "English" },
  it: { label: "Italiano" },
  de: { label: "Deutsch" },
  fr: { label: "Français" },
  es: { label: "Español" },
  nl: { label: "Nederlands" },
};

const CARDINALS = {
  en: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"],
  it: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"],
  de: ["N", "NNO", "NO", "ONO", "O", "OSO", "SO", "SSO", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"],
  fr: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"],
  es: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"],
  nl: ["N", "NNO", "NO", "ONO", "O", "OZO", "ZO", "ZZO", "Z", "ZZW", "ZW", "WZW", "W", "WNW", "NW", "NNW"],
};

const WIND_NAMES = {
  en: ["Tramontane", "Gregale", "Levant", "Sirocco", "Ostro", "Libeccio", "Ponente", "Mistral"],
  it: ["Tramontana", "Grecale", "Levante", "Scirocco", "Ostro", "Libeccio", "Ponente", "Maestrale"],
  de: ["Tramontana", "Gregale", "Levante", "Scirocco", "Ostro", "Libeccio", "Ponente", "Mistral"],
  fr: ["Tramontane", "Grégal", "Levant", "Sirocco", "Ostro", "Libeccio", "Ponant", "Mistral"],
  es: ["Tramontana", "Gregal", "Levante", "Siroco", "Mediodía", "Lebeche", "Poniente", "Mistral"],
  nl: ["Tramontana", "Gregale", "Levante", "Scirocco", "Ostro", "Libeccio", "Ponente", "Mistral"],
};

const TEXT = {
  en: {
    calm: "Calm",
    raining: "Raining",
    drizzle: "Drizzle",
    heavy_rain: "Pouring",
    downpour: "Cloudburst",
    engraved_text_size: "Size of the engraved texts (×)",
    window_thickness: "Thickness of the windows",
    dry: "Dry",
    unavailable: "Unavailable",
    // editor
    name: "Title (optional)",
    direction_entity: "Wind direction sensor (0-360°)",
    speed_entity: "Wind speed sensor",
    rain_entity: "Rain sensor (optional)",
    min_speed: "Wind speed from which it counts",
    max_speed: "Wind speed for the densest chevrons",
    rain_threshold: "Rain threshold",
    max_rain: "Rain (mm/h) for the heaviest shower",
    wall_rain_max: "Rain on the glass for a full window (mm/h)",
    show_wind_name: "Show the wind's name (Tramontane, Gregale…)",
    theme: "Style",
    bezel_color: "Crown color",
    bezel_text_color: "Ticks and letters color",
    bezel_opacity: "Crown opacity",
    theme_default: "Standard",
    theme_brass: "Brass",
    language: "Language",
    language_auto: "Automatic (as Home Assistant)",
    motion: "Animation (moving raindrops and wind chevrons)",
    engraved_text: "Texts engraved in the dial",
  },
  it: {
    calm: "Calma",
    raining: "Piove",
    drizzle: "Pioviggina",
    heavy_rain: "Diluvia",
    downpour: "Secchiate",
    engraved_text_size: "Dimensione dei testi incisi (×)",
    window_thickness: "Spessore delle finestre",
    dry: "Asciutto",
    unavailable: "Non disponibile",
    name: "Titolo (opzionale)",
    direction_entity: "Sensore direzione vento (0-360°)",
    speed_entity: "Sensore velocità vento",
    rain_entity: "Sensore pioggia (opzionale)",
    min_speed: "Velocità del vento da cui conta",
    max_speed: "Velocità del vento per le V più fitte",
    rain_threshold: "Soglia pioggia",
    max_rain: "Pioggia (mm/h) per l'acquazzone massimo",
    wall_rain_max: "Pioggia sul vetro per finestra piena (mm/h)",
    show_wind_name: "Mostra il nome del vento (Tramontana, Grecale…)",
    theme: "Stile",
    bezel_color: "Colore della ghiera",
    bezel_text_color: "Colore di tacche e lettere",
    bezel_opacity: "Opacità della ghiera",
    theme_default: "Standard",
    theme_brass: "Ottone",
    language: "Lingua",
    language_auto: "Automatica (come Home Assistant)",
    motion: "Animazione (gocce e V del vento in movimento)",
    engraved_text: "Testi incisi nel quadrante",
  },
  de: {
    calm: "Windstill",
    raining: "Regen",
    drizzle: "Nieselregen",
    heavy_rain: "Starkregen",
    downpour: "Wolkenbruch",
    engraved_text_size: "Größe der gravierten Texte (×)",
    window_thickness: "Dicke der Fenster",
    dry: "Trocken",
    unavailable: "Nicht verfügbar",
    name: "Titel (optional)",
    direction_entity: "Sensor Windrichtung (0-360°)",
    speed_entity: "Sensor Windgeschwindigkeit",
    rain_entity: "Regensensor (optional)",
    min_speed: "Windgeschwindigkeit, ab der er zählt",
    max_speed: "Windgeschwindigkeit für die dichtesten Winkel",
    rain_threshold: "Regenschwelle",
    max_rain: "Regen (mm/h) für den stärksten Schauer",
    wall_rain_max: "Regen auf der Scheibe für volles Fenster (mm/h)",
    show_wind_name: "Namen des Windes anzeigen (Tramontana, Gregale…)",
    theme: "Stil",
    bezel_color: "Farbe der Lünette",
    bezel_text_color: "Farbe der Striche und Buchstaben",
    bezel_opacity: "Deckkraft der Lünette",
    theme_default: "Standard",
    theme_brass: "Messing",
    language: "Sprache",
    language_auto: "Automatisch (wie Home Assistant)",
    motion: "Animation (bewegte Regentropfen und Windwinkel)",
    engraved_text: "Texte ins Zifferblatt graviert",
  },
  fr: {
    calm: "Calme",
    raining: "Pluie",
    drizzle: "Bruine",
    heavy_rain: "Averse",
    downpour: "Déluge",
    engraved_text_size: "Taille des textes gravés (×)",
    window_thickness: "Épaisseur des fenêtres",
    dry: "Sec",
    unavailable: "Indisponible",
    name: "Titre (facultatif)",
    direction_entity: "Capteur de direction du vent (0-360°)",
    speed_entity: "Capteur de vitesse du vent",
    rain_entity: "Capteur de pluie (facultatif)",
    min_speed: "Vitesse du vent à partir de laquelle il compte",
    max_speed: "Vitesse du vent pour les chevrons les plus serrés",
    rain_threshold: "Seuil de pluie",
    max_rain: "Pluie (mm/h) pour l'averse la plus forte",
    wall_rain_max: "Pluie sur la vitre pour une fenêtre pleine (mm/h)",
    show_wind_name: "Afficher le nom du vent (Tramontane, Grégal…)",
    theme: "Style",
    bezel_color: "Couleur de la lunette",
    bezel_text_color: "Couleur des graduations et lettres",
    bezel_opacity: "Opacité de la lunette",
    theme_default: "Standard",
    theme_brass: "Laiton",
    language: "Langue",
    language_auto: "Automatique (comme Home Assistant)",
    motion: "Animation (gouttes et chevrons du vent en mouvement)",
    engraved_text: "Textes gravés dans le cadran",
  },
  es: {
    calm: "Calma",
    raining: "Lluvia",
    drizzle: "Llovizna",
    heavy_rain: "Chaparrón",
    downpour: "Diluvio",
    engraved_text_size: "Tamaño de los textos grabados (×)",
    window_thickness: "Grosor de las ventanas",
    dry: "Seco",
    unavailable: "No disponible",
    name: "Título (opcional)",
    direction_entity: "Sensor de dirección del viento (0-360°)",
    speed_entity: "Sensor de velocidad del viento",
    rain_entity: "Sensor de lluvia (opcional)",
    min_speed: "Velocidad del viento a partir de la cual cuenta",
    max_speed: "Velocidad del viento para las uves más densas",
    rain_threshold: "Umbral de lluvia",
    max_rain: "Lluvia (mm/h) para el chubasco más fuerte",
    wall_rain_max: "Lluvia en el cristal para ventana llena (mm/h)",
    show_wind_name: "Mostrar el nombre del viento (Tramontana, Gregal…)",
    theme: "Estilo",
    bezel_color: "Color del bisel",
    bezel_text_color: "Color de marcas y letras",
    bezel_opacity: "Opacidad del bisel",
    theme_default: "Estándar",
    theme_brass: "Latón",
    language: "Idioma",
    language_auto: "Automático (como Home Assistant)",
    motion: "Animación (gotas y uves del viento en movimiento)",
    engraved_text: "Textos grabados en la esfera",
  },
  nl: {
    calm: "Windstil",
    raining: "Regen",
    drizzle: "Motregen",
    heavy_rain: "Stortregen",
    downpour: "Wolkbreuk",
    engraved_text_size: "Grootte van de gegraveerde teksten (×)",
    window_thickness: "Dikte van de ramen",
    dry: "Droog",
    unavailable: "Niet beschikbaar",
    name: "Titel (optioneel)",
    direction_entity: "Sensor windrichting (0-360°)",
    speed_entity: "Sensor windsnelheid",
    rain_entity: "Regensensor (optioneel)",
    min_speed: "Windsnelheid vanaf wanneer hij telt",
    max_speed: "Windsnelheid voor de dichtste punthaken",
    rain_threshold: "Regendrempel",
    max_rain: "Regen (mm/h) voor de zwaarste bui",
    wall_rain_max: "Regen op het glas voor een vol raam (mm/h)",
    show_wind_name: "Naam van de wind tonen (Tramontana, Gregale…)",
    theme: "Stijl",
    bezel_color: "Kleur van de ring",
    bezel_text_color: "Kleur van streepjes en letters",
    bezel_opacity: "Dekking van de ring",
    theme_default: "Standaard",
    theme_brass: "Messing",
    language: "Taal",
    language_auto: "Automatisch (zoals Home Assistant)",
    motion: "Animatie (bewegende regendruppels en windpunthaken)",
    engraved_text: "Teksten gegraveerd in de wijzerplaat",
  },
};

// Texts for the card in language `l`, with the user's `texts` overrides on top.
// `texts` may contain calm, raining, dry, unavailable, cardinals (16 items), wind_names (8 items).
const cardTexts = (l, cfg) => {
  const o = (cfg && cfg.texts) || {};
  const list = (v, n, fallback) => (Array.isArray(v) && v.length === n ? v.map(String) : fallback);
  return {
    T: { ...TEXT[l], ...Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === "string")) },
    cardinals: list(o.cardinals, 16, CARDINALS[l]),
    windNames: list(o.wind_names, 8, WIND_NAMES[l]),
  };
};

// Every option except direction_entity and speed_entity is optional: these are the defaults.
// (Options without a default here are simply "off" when missing: name, rain_entity, color,
// texts, sectors, bezel_color, bezel_opacity, bezel_text_color.)
const DEFAULTS = {
  language: "auto",
  theme: "default",
  pointer: "chevrons",
  window_layout: "tangent",
  motion: false,
  show_wind_name: false,
  engraved_text: false,
  engraved_text_size: 1,
  window_thickness: 10,
  min_speed: 10,
  max_speed: 60,
  rain_threshold: 0,
  rain_levels: [1, 4, 10], // mm/h: drizzle < 1 <= rain < 4 <= heavy rain < 10 <= downpour
  max_rain: 15,
  wall_rain_max: 5,
};

// Drop empty values (an option written in YAML without a value), so the defaults apply
const withoutEmpty = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== null && v !== undefined && v !== ""));

// For the visual editor: keep only what differs from the defaults, so the YAML stays short
const withoutDefaults = (obj) =>
  Object.fromEntries(
    Object.entries(withoutEmpty(obj)).filter(([k, v]) => !(k in DEFAULTS) || JSON.stringify(DEFAULTS[k]) !== JSON.stringify(v))
  );

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
// Wind chevrons: "V"s along the wind axis, pointing where the wind blows, drawn for wind from
// North (pointing down). Their arms run off the edge of the compass. They are spread evenly
// over the dial and get denser linearly with the wind:
//   1 km/h        -> a single V in the center
//   1 -> max_speed -> the number of Vs grows linearly up to CHEV_MAX (the gap shrinks)
//   10 -> 15 km/h -> color goes from green to red
// Each V is drawn once at the center (k = 0 position) and moved along the axis by k × gap.
const CHEV_K = 26; // Vs on each side of the central one, at most
const CHEV_MAX = 45; // Vs covering the dial at max_speed
const CHEV_SPAN = 230; // length of the axis covered by the Vs (apex positions)
const CHEV_ARM = 130; // reach of each arm (clipped by the compass)
const CHEV_W = 1.6; // stroke width
const CHEV_FULL_KMH = 10;
const CHEV_RED_KMH = 15;
const CHEV_APEX = 100 + 38; // apex of the central V: its arms are centred on the dial (wraps the hub)
// k = -(CHEV_K + 1) is an extra V behind the others: with motion, the Vs slide one gap along the
// axis and it fills the space left at the back, so the flow loops seamlessly.
const CHEVRONS = Array.from({ length: CHEV_K * 2 + 2 }, (_, n) => ({ k: n - CHEV_K - 1 }));
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

// Language: the card's `language` option if set, otherwise Home Assistant's language
const lang = (hass, cfg) => {
  if (cfg && cfg.language && TEXT[cfg.language]) return cfg.language;
  const l = ((hass && ((hass.locale && hass.locale.language) || hass.language)) || "en").slice(0, 2).toLowerCase();
  return TEXT[l] ? l : "en";
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
// Windows on tangent lines (window_layout: tangent): each facade is a short "wall" tangent to the
// compass at its exposure, just outside the ring; its windows sit side by side on it.
const R_WIN = R_OUT + 5; // inner edge of the windows
const WIN_T = 10; // window thickness (radial): outer half rain, inner half wind
const WIN_GAP = 3; // gap between windows on the same wall
const WIN_MAX_LEN = 24; // length of the widest window
const WALL_HALF = 38; // max half-length of a wall, so 45°-apart walls don't touch
const ETXT_R1 = (R_BAND + R_HUB) / 2; // engraved text: wind name, centred between hub and crown
const ETXT_R2 = 64; // engraved text: rain, on an arc along the bottom of the dial
const R_LABEL =(R_OUT + R_BAND) / 2 - 0.5; // cardinal letters, on the crown

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

// Ticks on the crown every 10°; none at N/E/S/W, where the letters sit.
function buildTicks() {
  let out = "";
  for (let a = 0; a < 360; a += 10) {
    if (a % 90 === 0) continue;
    const mid = a % 30 === 0;
    const [x1, y1] = pt(a, mid ? R_OUT - 7 : R_OUT - 4);
    const [x2, y2] = pt(a, R_OUT);
    out += `<line class="tick${mid ? " mid" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
  }
  return out;
}

// Compass rose on the face: 4 long cardinal points, 4 shorter intercardinal ones, each split in a
// dark and a light half (the classic two-tone look), plus two thin circles.
function buildRose() {
  const point = (a, r, valley) => {
    const [tx, ty] = pt(a, r);
    const [lx, ly] = pt(a - 45 / 2, valley);
    const [rx, ry] = pt(a + 45 / 2, valley);
    return (
      `<polygon class="rose-dark" points="100,100 ${tx},${ty} ${lx},${ly}"></polygon>` +
      `<polygon class="rose-light" points="100,100 ${tx},${ty} ${rx},${ry}"></polygon>`
    );
  };
  let out = `<circle class="rose-ring" cx="100" cy="100" r="70"></circle><circle class="rose-ring" cx="100" cy="100" r="54"></circle>`;
  for (let a = 45; a < 360; a += 90) out += point(a, 52, 13);
  for (let a = 0; a < 360; a += 90) out += point(a, 74, 16);
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
  /* Public CSS variables (settable with card-mod or a theme), see README:
     --wind-compass-chevron-color, --wind-compass-drop-color, --wind-compass-wind-color,
     --wind-compass-rain-color, --wind-compass-face-color, --wind-compass-font, --wind-compass-max-width */
  ha-card {
    padding: 16px; cursor: pointer; height: 100%; box-sizing: border-box;
    font-family: var(--wind-compass-font, inherit);
    --wc-idle: var(--divider-color, rgba(127,127,127,0.35));
    --wc-exposed: var(--wind-compass-wind-color, var(--warning-color, #ffa600));
    --wc-water: var(--wind-compass-rain-color, #1e88e5);
    --wc-rain: var(--wind-compass-drop-color, var(--info-color, #039be5));
  }
  .header {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 4px; text-align: center;
  }
  .title { font-size: 1.2em; font-weight: 500; color: var(--primary-text-color); }
  .header:has(.title:empty) { display: none; }
  .rain {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.85em; padding: 2px 8px; border-radius: 12px; white-space: nowrap;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(127,127,127,0.1));
  }
  .rain[hidden] { display: none; }
  .rain.on { color: #fff; background: var(--wind-compass-rain-color, var(--wc-rain)); }

  .compass {
    display: block; width: 100%; margin: 0 auto; overflow: visible;
    max-width: var(--wind-compass-max-width, var(--_wc-maxw, 260px));
  }
  .face { fill: var(--wind-compass-face-color, var(--secondary-background-color, rgba(127,127,127,0.06))); }
  /* Crown, watch style: dark ceramic bezel with a polished sheen, steel outer rim, white markings */
  .bezel { fill: none; stroke: var(--wind-compass-bezel-color, var(--wc-bezel-color, url(#wc-watch-bezel))); stroke-width: ${R_OUT - R_BAND}; }
  /* bezel_opacity; with a custom bezel_color, a sheen keeps the polished watch look */
  .bezel-g { opacity: var(--wind-compass-bezel-opacity, var(--wc-bezel-opacity, 1)); }
  .bezel-sheen { display: none; fill: none; stroke: url(#wc-watch-sheen); stroke-width: ${R_OUT - R_BAND}; }
  .custom-bezel .bezel-sheen { display: inline; }
  .brass .bezel-sheen { display: none; }
  /* engraved wind name: vertically centred on its arc */
  .etext text.mid, .etext-mask text.mid { dominant-baseline: central; }
  .rim { fill: none; stroke: url(#wc-steel); stroke-width: 2.6; }
  .ring { fill: none; stroke: rgba(0,0,0,0.45); stroke-width: 0.8; }
  .tick { stroke: var(--wind-compass-bezel-text-color, var(--wc-bezel-text, #f2f2f2)); stroke-width: 0.8; opacity: 0.75; }
  .tick.mid { stroke-width: 1.3; opacity: 0.95; }
  .tick.major { stroke-width: 2; opacity: 1; }
  .label {
    fill: var(--wind-compass-bezel-text-color, var(--wc-bezel-text, #f2f2f2));
    font-size: 11px; font-weight: 700; font-family: var(--wind-compass-font, inherit);
    text-anchor: middle; dominant-baseline: central;
  }
  .label.north { fill: var(--wind-compass-north-color, #ff5a36); }
  /* Compass rose on the face (under the chevrons and the drops) */
  .rose-dark { fill: var(--secondary-text-color, #727272); opacity: 0.16; }
  .rose-light { fill: var(--secondary-text-color, #727272); opacity: 0.06; }
  .rose-ring { fill: none; stroke: var(--secondary-text-color, #727272); stroke-width: 0.6; opacity: 0.25; }

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

  /* Windows on tangent walls */
  .wall { stroke: var(--secondary-text-color, #727272); stroke-width: 1.2; stroke-linecap: round; opacity: 0.5; }
  .win-glass { fill: var(--card-background-color, #fff); }
  .win-rain, .win-wind {
    transform-box: fill-box; transform-origin: center; transform: scaleX(0);
    transition: transform 1s cubic-bezier(.4,0,.2,1), opacity 0.6s;
  }
  .win-rain { fill: var(--wc-water); }
  .win-wind { fill: var(--wc-exposed); }
  .win-wind.weak { opacity: 0.45; } /* below min_speed: wind is there but doesn't count yet */
  .win-mid { stroke: var(--secondary-text-color, #727272); stroke-width: 0.5; opacity: 0.6; }
  .win-frame { fill: none; stroke: var(--secondary-text-color, #727272); stroke-width: 0.9; }
  /* room symbol on a window: dark with a light halo, readable over the gauges */
  .win-icons { pointer-events: none; }
  text.win-icon {
    text-anchor: middle; dominant-baseline: central; font-weight: 700;
    fill: var(--wind-compass-window-icon-color, #1f2328);
    paint-order: stroke; stroke: rgba(255,255,255,0.85); stroke-width: 1.2px; stroke-linejoin: round;
  }
  foreignObject.win-icon { overflow: visible; color: var(--wind-compass-window-icon-color, #1f2328);
    filter: drop-shadow(0 0 0.6px #fff) drop-shadow(0 0 0.6px #fff); }
  .brass text.win-icon { fill: var(--wind-compass-window-icon-color, #3b2806); stroke: rgba(255,244,204,0.85); }
  .brass foreignObject.win-icon { color: var(--wind-compass-window-icon-color, #3b2806); }

  .rot { transform-origin: 100px 100px; transition: transform 1.2s cubic-bezier(.4,0,.2,1); }

  /* Raindrops: drawn for wind from North (moving downwards), rotated with the arrow */
  /* Without motion the drops stay still, spread over the dial */
  .streak {
    fill: var(--wc-rain); opacity: 0;
    transform: translateY(calc(var(--d, 0) * 170px + 10px));
    transition: opacity 0.8s;
  }
  .streak.on { opacity: 0.75; }
  /* motion: true -> drops fly with the wind, chevrons flow along its axis.
     It's an explicit opt-in (default off), so it applies even if the OS asks for reduced motion. */
  .motion .streak {
    animation: fall calc(var(--wc-dur, 2s) * var(--s, 1)) linear infinite;
    animation-delay: calc(var(--wc-dur, 2s) * var(--s, 1) * var(--d, 0) * -1);
  }
  @keyframes fall { from { transform: translateY(0); } to { transform: translateY(190px); } }
  .motion .chev-flow { animation: chevflow var(--wc-cstep, 1s) linear infinite; }
  @keyframes chevflow { from { transform: translateY(0); } to { transform: translateY(var(--wc-gap, 12px)); } }
  .chev {
    fill: none; stroke: var(--wind-compass-chevron-color, var(--wc-wind, #4caf50)); stroke-width: var(--wc-chev-w, 1.6);
    stroke-linecap: round; stroke-linejoin: round;
    opacity: 0;
    transition: opacity 0.5s, stroke 1s, transform 1s cubic-bezier(.4,0,.2,1);
  }
  .chev.on { opacity: 0.9; }
  .arrow {
    transform-origin: 100px 100px;
    transition: transform 1.2s cubic-bezier(.4,0,.2,1), opacity 0.8s, fill 1.2s;
    stroke: var(--card-background-color, #fff); stroke-width: 1.5; stroke-linejoin: round;
  }
  .arrow.calm { opacity: 0.45; }

  .hub { fill: var(--card-background-color, #fff); stroke: var(--divider-color, rgba(127,127,127,0.4)); stroke-width: 1.5; }
  /* hub: where the wind comes from (big letters) and its speed (small, underneath) */
  .speed { fill: var(--primary-text-color, #212121); font-size: 17px; font-weight: 700; text-anchor: middle; font-family: var(--wind-compass-font, inherit); }
  .unit { fill: var(--secondary-text-color, #727272); font-size: 9.5px; font-weight: 500; text-anchor: middle; font-family: var(--wind-compass-font, inherit); }

  /* Bottom: first row = wind (direction, name), second row = rain */
  .info { display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: 6px; }
  .row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 2px 8px; }
  .rain-row:has(.rain[hidden]) { display: none; }
  .dir { color: var(--secondary-text-color, #727272); }
  .dir b { color: var(--primary-text-color, #212121); font-weight: 500; }
  .wname { color: var(--primary-text-color, #212121); font-style: italic; }
  .dir:empty { display: none; }
  .wname:not([hidden]) + .dir::before { content: "·"; color: var(--secondary-text-color, #727272); margin-right: 8px; }
  .wind-row:has(.wname[hidden]):has(.dir:empty) { display: none; }
  .wname[hidden] { display: none; }

  /* engraved_text: true -> the two text rows are engraved along the bottom of the dial
     (wind on the inner arc, rain on the outer one) instead of being written under the compass.
     The chevrons and drops are cut away around the letters (mask), so they always read. */
  .etext { display: none; }
  .engraved-text .etext { display: inline; }
  .engraved-text .info { display: none; }
  .etext text, .etext-mask text {
    font-family: var(--wind-compass-font, inherit); font-weight: 600; font-style: italic;
    font-size: calc(9px * var(--wc-etext-scale, 1)); letter-spacing: 0.06em; text-anchor: middle;
  }
  .etext text { fill: var(--wind-compass-engraved-text-color, var(--primary-text-color, #212121)); }
  .etext text.e2, .etext-mask text.mt2 { font-style: normal; font-size: calc(8.5px * var(--wc-etext-scale, 1)); }
  .brass .etext-mask text { font-family: var(--wind-compass-font, Georgia, "Times New Roman", serif); }
  .brass .etext text, .brass .etext .e2 {
    fill: var(--wind-compass-engraved-text-color, #3b2806);
    font-family: var(--wind-compass-font, Georgia, "Times New Roman", serif);
  }

  .unavailable .compass { opacity: 0.4; }

  /* ---------- Brass theme (theme: brass) ---------- */
  .brass .bezel { stroke: var(--wind-compass-bezel-color, url(#wc-brass-bezel)); }
  .brass .rim { stroke: #5c3f0c; }
  .brass .face { fill: var(--wind-compass-face-color, url(#wc-brass-face)); }
  .brass .ring { stroke: #5c3f0c; stroke-width: 1; }
  .brass .tick { stroke: #3f2a06; opacity: 0.85; }
  .brass .label {
    fill: #3f2a06; font-family: var(--wind-compass-font, Georgia, "Times New Roman", serif); font-size: 12px; font-weight: 700;
    filter: url(#wc-engrave);
  }
  .brass .label.north { fill: var(--wind-compass-north-color, #8e1b1b); }
  .brass .rose-dark { fill: #5c3f0c; opacity: 0.32; }
  .brass .rose-light { fill: #fff3c4; opacity: 0.35; }
  .brass .rose-ring { stroke: #5c3f0c; opacity: 0.35; }
  /* window arcs: recessed in the bezel, copper enamel with wind, blue enamel water */
  .brass .sector { fill: #3f2a06; opacity: 0.22; }
  .brass .sector.exposed { fill: var(--wind-compass-wind-color, #b5541c); opacity: 0.9; }
  .brass .water { stroke: var(--wind-compass-rain-color, #1d5a86); }
  .brass .wall { stroke: #5c3f0c; opacity: 0.8; }
  .brass .win-glass { fill: #ecd38f; }
  .brass .win-wind { fill: var(--wind-compass-wind-color, #b5541c); }
  .brass .win-rain { fill: var(--wind-compass-rain-color, #1d5a86); }
  .brass .win-mid { stroke: #5c3f0c; }
  .brass .win-frame { stroke: #5c3f0c; stroke-width: 1.1; }
  /* chevrons and raindrops are engravings in the brass face */
  .brass .engraved { filter: url(#wc-engrave); }
  .brass .chev.on { opacity: 0.85; }
  .brass .streak { fill: var(--wind-compass-drop-color, #5a3604); }
  .brass .streak.on { opacity: 0.8; }
  .brass .hub { fill: url(#wc-brass-hub); stroke: #5c3f0c; stroke-width: 1.2; }
  .brass .speed { fill: #3b2806; font-family: var(--wind-compass-font, Georgia, "Times New Roman", serif); }
  .brass .unit { fill: #5c3f0c; font-family: var(--wind-compass-font, Georgia, "Times New Roman", serif); }
  .brass .title, .brass .info, .brass .wname { font-family: var(--wind-compass-font, Georgia, "Times New Roman", serif); }
  .brass .rain.on { background: var(--wind-compass-rain-color, #1d5a86); }
`;

// Room symbol on a window: a Home Assistant icon ("mdi:sofa") or any short text/emoji ("🛋️", "K").
// Centred on (cx, cy), `size` in drawing units.
const windowIcon = (icon, cx, cy, size, name) => {
  const title = `<title>${escapeHtml(name || "")}</title>`;
  if (/^[a-z0-9-]+:[a-z0-9-]+$/i.test(icon)) {
    const s = size.toFixed(2);
    return `<foreignObject class="win-icon" x="${(cx - size / 2).toFixed(2)}" y="${(cy - size / 2).toFixed(2)}" width="${s}" height="${s}">${title}
      <ha-icon icon="${escapeHtml(icon)}" style="--mdc-icon-size:${s}px;width:${s}px;height:${s}px;display:flex"></ha-icon>
    </foreignObject>`;
  }
  return `<text class="win-icon" x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" font-size="${(size * 0.85).toFixed(2)}">${title}${escapeHtml(icon)}</text>`;
};

// Colors from the config: a CSS color string or an [r, g, b] list (what HA's color picker gives)
const cssColor = (v) => (Array.isArray(v) && v.length >= 3 ? `rgb(${v.slice(0, 3).map(Number).join(",")})` : typeof v === "string" && v.trim() ? v.trim() : undefined);
const rgbOf = (v) => {
  if (Array.isArray(v) && v.length >= 3) return v.slice(0, 3).map(Number);
  const m = typeof v === "string" && v.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return undefined;
  const h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
// Standard crown: bezel_color, bezel_opacity, bezel_text_color. When the text color isn't given,
// pick white or dark for the markings so they stay readable on the chosen crown.
const bezelStyle = (cfg) => {
  const color = cssColor(cfg.bezel_color);
  const op = cfg.bezel_opacity !== undefined && Number.isFinite(Number(cfg.bezel_opacity)) ? Math.min(Math.max(Number(cfg.bezel_opacity), 0), 1) : undefined;
  let text = cssColor(cfg.bezel_text_color);
  if (!text && (color || op !== undefined)) {
    const rgb = rgbOf(cfg.bezel_color);
    if (op !== undefined && op < 0.5) text = "var(--primary-text-color, #212121)"; // mostly see-through: use the theme's text color
    else if (rgb) {
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      text = lum > 0.55 ? "#1f2328" : "#f2f2f2";
    }
  }
  return { color, opacity: op, text };
};

// Brass theme: chevrons are dark engravings, turning from bronze to oxblood as the wind gets strong
const brassChevronColor = (kmh) => {
  const t = Math.min(Math.max((kmh - CHEV_FULL_KMH) / (CHEV_RED_KMH - CHEV_FULL_KMH), 0), 1);
  return `hsl(${Math.round(38 - 36 * t)}, ${Math.round(70 + 10 * t)}%, ${Math.round(20 + 8 * t)}%)`;
};

// Gradients and the engraving filter used by the brass theme
const BRASS_DEFS = `
  <!-- standard theme: watch-style ceramic bezel and steel rim -->
  <linearGradient id="wc-watch-bezel" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#4a525e"></stop>
    <stop offset="30%" stop-color="#1f242c"></stop>
    <stop offset="50%" stop-color="#0d1015"></stop>
    <stop offset="72%" stop-color="#232932"></stop>
    <stop offset="100%" stop-color="#3d4450"></stop>
  </linearGradient>
  <!-- polished sheen laid over a custom bezel color -->
  <linearGradient id="wc-watch-sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#fff" stop-opacity="0.35"></stop>
    <stop offset="30%" stop-color="#fff" stop-opacity="0"></stop>
    <stop offset="50%" stop-color="#000" stop-opacity="0.3"></stop>
    <stop offset="72%" stop-color="#000" stop-opacity="0"></stop>
    <stop offset="100%" stop-color="#fff" stop-opacity="0.25"></stop>
  </linearGradient>
  <linearGradient id="wc-steel" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#f4f6f8"></stop>
    <stop offset="35%" stop-color="#9aa2ad"></stop>
    <stop offset="60%" stop-color="#e6e9ed"></stop>
    <stop offset="100%" stop-color="#6f7782"></stop>
  </linearGradient>
  <radialGradient id="wc-brass-face" cx="40%" cy="35%" r="75%">
    <stop offset="0%" stop-color="#f4dc92"></stop>
    <stop offset="45%" stop-color="#d6ab4c"></stop>
    <stop offset="100%" stop-color="#a27424"></stop>
  </radialGradient>
  <linearGradient id="wc-brass-bezel" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#fff0b5"></stop>
    <stop offset="28%" stop-color="#cf9d36"></stop>
    <stop offset="55%" stop-color="#7d5713"></stop>
    <stop offset="80%" stop-color="#d8aa48"></stop>
    <stop offset="100%" stop-color="#f8e39b"></stop>
  </linearGradient>
  <radialGradient id="wc-brass-hub" cx="35%" cy="30%" r="80%">
    <stop offset="0%" stop-color="#fff5cc"></stop>
    <stop offset="50%" stop-color="#e2b653"></stop>
    <stop offset="100%" stop-color="#946818"></stop>
  </radialGradient>
  <!-- engraving: the cut is dark, and its lower edge catches the light (light from top-left) -->
  <filter id="wc-engrave" x="-5%" y="-5%" width="110%" height="110%">
    <feOffset in="SourceAlpha" dx="0.5" dy="0.75" result="off"></feOffset>
    <feFlood flood-color="#fff6d2" flood-opacity="0.75"></feFlood>
    <feComposite in2="off" operator="in" result="hi"></feComposite>
    <feMerge><feMergeNode in="hi"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
  </filter>
`;

class WindCompassCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("wind-compass-card-editor");
  }

  static getStubConfig(hass) {
    const ids = Object.keys(hass.states);
    const sensors = ids.filter((e) => e.startsWith("sensor."));
    // Only the two required sensors (guessed from their names): everything else has a default
    return {
      direction_entity: sensors.find((e) => /wind.*(dir|bearing)|(dir|bearing).*wind|vento.*dir/i.test(e)) || "",
      speed_entity: sensors.find((e) => /wind.*speed|speed.*wind|vento.*vel/i.test(e)) || "",
    };
  }

  setConfig(config) {
    config = withoutEmpty(config);
    if (!config.direction_entity) throw new Error("direction_entity is required (the wind direction sensor, 0-360°)");
    if (!config.speed_entity) throw new Error("speed_entity is required (the wind speed sensor)");
    if (config.sectors !== undefined && !Array.isArray(config.sectors)) throw new Error("sectors must be a list of windows");
    // empty list items are ignored; a window only needs `direction`
    const sectors = (config.sectors || []).filter((s) => s && typeof s === "object");
    sectors.forEach((s, i) => {
      if (!Number.isFinite(Number(s.direction)) || s.direction === "")
        throw new Error(`sectors[${i}]${s.name ? ` (${s.name})` : ""}: direction must be a number (0-360)`);
    });
    if (config.sectors !== undefined) config.sectors = sectors;
    this._config = { ...DEFAULTS, ...config };
    // a numeric option with a non-numeric value falls back to its default
    Object.entries(DEFAULTS).forEach(([k, d]) => {
      if (typeof d === "number" && !Number.isFinite(Number(this._config[k]))) this._config[k] = d;
    });
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
    return 6;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 4 };
  }

  _build() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>${STYLE}</style>
      <ha-card>
        <div class="header"><div class="title"></div></div>
        <svg class="compass" viewBox="-10 -10 220 220" role="img">
          <defs>
            <clipPath id="wc-inner"><circle cx="100" cy="100" r="${R_BAND - 1}"></circle></clipPath>
            <clipPath id="wc-outer"><circle cx="100" cy="100" r="${R_OUT}"></circle></clipPath>
            <!-- arcs along the bottom of the dial for the engraved text, left to right -->
            <path id="wc-arc1" d="M${pt(290, ETXT_R1).join(" ")} A${ETXT_R1} ${ETXT_R1} 0 0 1 ${pt(70, ETXT_R1).join(" ")}"></path>
            <path id="wc-arc2" d="M${pt(240, ETXT_R2).join(" ")} A${ETXT_R2} ${ETXT_R2} 0 0 0 ${pt(120, ETXT_R2).join(" ")}"></path>
            <!-- cut-out around the engraved text: white = keep, black (letters + margin) = hide -->
            <mask id="wc-etext-mask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240">
              <rect x="-20" y="-20" width="240" height="240" fill="#fff"></rect>
              <g class="etext-mask" fill="#000" stroke="#000" stroke-width="5" stroke-linejoin="round"
                 >
                <text class="mt1 mid"><textPath href="#wc-arc1" startOffset="50%" class="m1"></textPath></text>
                <text class="mt2"><textPath href="#wc-arc2" startOffset="50%" class="m2"></textPath></text>
              </g>
            </mask>
            ${BRASS_DEFS}
          </defs>
          <circle class="rim" cx="100" cy="100" r="${R_OUT + 1.2}"></circle>
          <circle class="face" cx="100" cy="100" r="${R_BAND}"></circle>
          <g class="bezel-g">
            <circle class="bezel" cx="100" cy="100" r="${(R_OUT + R_BAND) / 2}"></circle>
            <circle class="bezel-sheen" cx="100" cy="100" r="${(R_OUT + R_BAND) / 2}"></circle>
          </g>
          <g class="rose engraved">${buildRose()}</g>
          <g class="chevs engraved masked" clip-path="url(#wc-inner)"><g class="rot"><g class="chev-flow">${CHEVRONS.map(
            (c) => `<polyline class="chev" data-k="${c.k}" points="${chevronPoints(CHEV_APEX)}"></polyline>`
          ).join("")}</g></g></g>
          <g class="engraved masked" clip-path="url(#wc-inner)"><g class="rot rain-rot">${RAIN_STREAKS.map(
            (s) =>
              `<path class="streak" d="${dropPath(s.x, s.size)}" style="--d:${s.delay.toFixed(3)};--s:${s.speed.toFixed(2)}"></path>`
          ).join("")}</g></g>
          <g class="etext engraved">
            <text class="mid"><textPath href="#wc-arc1" startOffset="50%" class="e1"></textPath></text>
            <text class="e2"><textPath href="#wc-arc2" startOffset="50%" class="e2"></textPath></text>
          </g>
          <g class="sectors"></g>
          <g class="waters" clip-path="url(#wc-outer)"></g>
          <circle class="ring" cx="100" cy="100" r="${R_OUT}"></circle>
          <circle class="ring" cx="100" cy="100" r="${R_BAND}" style="opacity:.5"></circle>
          ${buildTicks()}
          <g class="tangent"></g>
          <text class="label north"></text>
          <text class="label"></text>
          <text class="label"></text>
          <text class="label"></text>
          <g class="rot arrow-g"><polygon class="arrow" points="${ARROW_POINTS}"></polygon></g>
          <circle class="hub" cx="100" cy="100" r="${R_HUB}"></circle>
          <text class="speed" x="100" y="100">–</text>
          <text class="unit" x="100" y="114"></text>
        </svg>
        <div class="info">
          <div class="row wind-row"><span class="wname" hidden></span><span class="dir"></span></div>
          <div class="row rain-row"><div class="rain" hidden>${DROP_ICON}<span></span></div></div>
        </div>
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
    this._tangentG = $(".tangent");
    this._rots = [...root.querySelectorAll(".rot")];
    this._streaks = [...root.querySelectorAll(".streak")];
    this._arrow = $(".arrow");
    this._arrowG = $(".arrow-g");
    this._chevG = $(".chevs");
    this._chevs = [...root.querySelectorAll(".chev")];
    this._speedEl = $(".speed");
    this._unitEl = $(".unit");
    this._dirEl = $(".dir");
    this._wnameEl = $(".wname");
    this._eTexts = [$(".etext .e1"), $("textPath.e2"), $(".etext-mask .m1"), $(".etext-mask .m2")];
    this._masked = [...root.querySelectorAll(".masked")];
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

  // Windows: on tangent walls outside the compass (default) or as arcs on the ring.
  _renderSectors() {
    const sectors = this._config.sectors || [];
    const tangent = this._config.window_layout !== "ring";
    this._tangent = tangent;

    // Window thickness (window_thickness): the windows grow outwards
    const wt = Number(this._config.window_thickness) > 0 ? Math.min(Math.max(Number(this._config.window_thickness), 6), 24) : WIN_T;
    // Letters sit on the crown; the drawing only needs room for the windows' walls
    const rLabel = R_LABEL;
    const m = tangent && sectors.length ? R_WIN + wt + 4 : R_OUT + 4;
    this._svg.setAttribute("viewBox", `${100 - m} ${100 - m} ${2 * m} ${2 * m}`);
    this._svg.style.setProperty("--_wc-maxw", `${Math.round((260 * m) / 100)}px`);
    [0, 90, 180, 270].forEach((a, n) => {
      const [x, y] = pt(a, rLabel);
      this._labels[n].setAttribute("x", x);
      this._labels[n].setAttribute("y", y);
    });

    this._tangentG.innerHTML = "";
    this._winEls = [];
    if (tangent) {
      this._sectorsG.innerHTML = "";
      this._watersG.innerHTML = "";
      this._sectorEls = [];
      this._waterEls = [];
      // group windows by the direction they face: each group is one wall
      const walls = new Map();
      sectors.forEach((s, i) => {
        const d = norm(Number(s.direction));
        if (!walls.has(d)) walls.set(d, []);
        walls.get(d).push(i);
      });
      const yIn = 100 - R_WIN; // drawn for a wall facing North, then rotated
      const yOut = yIn - wt;
      const icons = []; // room symbols, drawn upright on top of the (rotated) windows
      // `width` is the window's real width (any unit, e.g. cm): one scale for all walls, chosen so
      // that the most crowded wall still fits and the widest window isn't longer than WIN_MAX_LEN.
      const ww = (i) => (Number(sectors[i].width) > 0 ? Number(sectors[i].width) : 30);
      let scale = WIN_MAX_LEN / Math.max(...sectors.map((_, i) => ww(i)));
      walls.forEach((items) => {
        const sum = items.reduce((a, i) => a + ww(i), 0);
        scale = Math.min(scale, (2 * WALL_HALF - (items.length - 1) * WIN_GAP) / sum);
      });
      this._tangentG.innerHTML = [...walls]
        .map(([d, items]) => {
          const span = items.reduce((a, i) => a + ww(i) * scale, 0) + (items.length - 1) * WIN_GAP;
          let x = 100 - span / 2;
          const wins = items
            .map((i) => {
              const len = ww(i) * scale;
              // Two gauges in one window: outer half = rain on the glass, inner half = wind on it.
              // Both grow from the middle of the window towards its sides.
              const h = wt / 2;
              const X = x.toFixed(2);
              const L = len.toFixed(2);
              const out = `<g data-i="${i}">
                <rect class="win-glass" x="${X}" y="${yOut}" width="${L}" height="${wt}" rx="1.2"></rect>
                <rect class="win-rain" x="${X}" y="${yOut}" width="${L}" height="${h}"></rect>
                <rect class="win-wind" x="${X}" y="${yOut + h}" width="${L}" height="${h}"></rect>
                <line class="win-mid" x1="${X}" y1="${yOut + h}" x2="${(x + len).toFixed(2)}" y2="${yOut + h}"></line>
                <rect class="win-frame" x="${X}" y="${yOut}" width="${L}" height="${wt}" rx="1.2"><title>${escapeHtml(
                sectors[i].name || ""
              )}</title></rect>
              </g>`;
              // Room symbol: centre of the window, rotated with the wall, then drawn upright
              if (sectors[i].icon) {
                const rad = (d * Math.PI) / 180;
                const dx = x + len / 2 - 100;
                const dy = yOut + h - 100;
                const size = Math.min(wt * 0.8, len * 0.9);
                icons.push(windowIcon(String(sectors[i].icon), 100 + dx * Math.cos(rad) - dy * Math.sin(rad), 100 + dx * Math.sin(rad) + dy * Math.cos(rad), size, sectors[i].name));
              }
              x += len + WIN_GAP;
              return out;
            })
            .join("");
          const wy = (yIn - wt / 2).toFixed(2);
          return `<g transform="rotate(${d} 100 100)">
            <line class="wall" x1="${(100 - span / 2 - 4).toFixed(2)}" y1="${wy}" x2="${(100 + span / 2 + 4).toFixed(2)}" y2="${wy}"></line>
            ${wins}
          </g>`;
        })
        .join("") + `<g class="win-icons">${icons.join("")}</g>`;
      [...this._tangentG.querySelectorAll("g[data-i]")].forEach((g) => {
        this._winEls[Number(g.dataset.i)] = { rain: g.querySelector(".win-rain"), wind: g.querySelector(".win-wind") };
      });
      return;
    }

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
    const l = lang(this._hass, cfg);
    const { T, cardinals, windNames } = cardTexts(l, cfg);
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
    this._card.classList.toggle("brass", cfg.theme === "brass");
    this._card.classList.toggle("motion", !!cfg.motion);
    const engraved = !!cfg.engraved_text;
    this._card.classList.toggle("engraved-text", engraved);

    // Engraved text size (multiplier)
    // Standard theme crown: custom color / opacity, and readable markings on it
    const bz = cfg.theme === "brass" ? {} : bezelStyle(cfg);
    this._card.classList.toggle("custom-bezel", !!bz.color);
    [["--wc-bezel-color", bz.color], ["--wc-bezel-opacity", bz.opacity], ["--wc-bezel-text", bz.text]].forEach(([k, v]) =>
      v !== undefined ? this._card.style.setProperty(k, String(v)) : this._card.style.removeProperty(k)
    );

    const eSize = Number(cfg.engraved_text_size) > 0 ? Math.min(Math.max(Number(cfg.engraved_text_size), 0.5), 2.5) : 1;
    this._card.style.setProperty("--wc-etext-scale", String(eSize));

    // Rain: a word for how hard it rains (drizzle / rain / heavy rain / downpour, by mm/h)
    // plus the amount when the sensor gives it.
    const lv = Array.isArray(cfg.rain_levels) && cfg.rain_levels.length === 3 && cfg.rain_levels.every((v) => Number.isFinite(Number(v)))
      ? cfg.rain_levels.map(Number)
      : DEFAULTS.rain_levels;
    let rainWord = T.raining;
    if (raining && rain.amount !== undefined) {
      const mmh = rain.amount * (/^in/.test(rain.unit) ? 25.4 : 1);
      rainWord = mmh < lv[0] ? T.drizzle : mmh < lv[1] ? T.raining : mmh < lv[2] ? T.heavy_rain : T.downpour;
    } else if (raining && rainSt && rainSt.state === "pouring") {
      rainWord = T.heavy_rain;
    }
    const amountTxt = rain.amount !== undefined && rain.amount > 0 ? `${fmt(rain.amount, rain.amount < 10 ? 1 : 0)} ${rain.unit}` : "";

    // Rain badge (only when a rain entity is configured)
    this._rain.hidden = !cfg.rain_entity;
    this._rain.classList.toggle("on", raining);
    if (!rainSt) this._rainText.textContent = T.unavailable;
    else if (raining) this._rainText.textContent = amountTxt ? `${rainWord} · ${amountTxt}` : rainWord;
    else this._rainText.textContent = amountTxt || T.dry;

    // Cardinal letters
    const names = cardinals;
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
    // How many Vs: 1 at 1 km/h, growing linearly up to CHEV_MAX at max_speed, spread evenly
    const t = Math.min(Math.max((kmh - 1) / (maxKmh - 1), 0), 1);
    const n = kmh < 1 ? 0 : 1 + (CHEV_MAX - 1) * t;
    const gap = n > 0 ? CHEV_SPAN / n : CHEV_SPAN; // distance between two Vs along the axis
    const brass = cfg.theme === "brass";
    this._card.style.setProperty("--wc-wind", cfg.color || (brass ? brassChevronColor(kmh) : chevronColor(kmh)));
    this._card.style.setProperty("--wc-chev-w", String(CHEV_W));
    this._card.style.setProperty("--wc-gap", `${gap.toFixed(2)}px`);
    // A V is shown when it falls within the covered span; with motion, also the one just behind it
    const motion = !!cfg.motion;
    const half = CHEV_SPAN / 2;
    this._chevs.forEach((el) => {
      const k = Number(el.dataset.k);
      const pos = k * gap;
      const on = n > 0 && ((pos >= -half - 0.01 && pos <= half + 0.01) || (motion && pos < -half && pos >= -half - gap));
      el.classList.toggle("on", on);
      el.style.transform = `translateY(${pos.toFixed(2)}px)`;
    });

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
    const dur = 3.2 - 2.4 * ratio; // seconds for a drop to cross the dial: faster with stronger wind
    this._card.style.setProperty("--wc-dur", `${dur.toFixed(2)}s`);
    this._card.style.setProperty("--wc-cstep", `${(dur * 0.3).toFixed(2)}s`); // time for a V to move one step

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
    const impact = sectors.map((s) => {
      if (!dirOk || !spdOk) return { wind: 0, wall: 0 };
      const theta = angDist(dir, Number(s.direction));
      const exposure = s.exposure !== undefined ? Math.min(Math.max(Number(s.exposure), 0), 1) : 1;
      const c = theta < 90 ? Math.cos((theta * Math.PI) / 180) * exposure : 0;
      const wind = spd * c; // wind pushing straight onto the window, in the sensor's unit
      const wall = rate > 0 ? 0.222 * spd * toMs * Math.pow(rate, 0.88) * c : 0;
      return { wind, wall };
    });
    // How full of water (0..1): rain on the glass relative to wall_rain_max
    const wallMax = Number(cfg.wall_rain_max) > 0 ? Number(cfg.wall_rain_max) : DEFAULTS.wall_rain_max;
    const fullness = (wall) => (wall > 0.02 ? Math.min(wall / wallMax, 1) : 0);
    const band = R_OUT - R_BAND;
    sectors.forEach((_, i) => {
      if (this._tangent) {
        // Window on its wall: orange with wind, water rising from the outer edge inwards
        const we = this._winEls[i];
        // rain: rain on the glass vs wall_rain_max; wind: wind on the window vs max_speed
        we.rain.style.transform = `scaleX(${fullness(impact[i].wall).toFixed(3)})`;
        we.wind.style.transform = `scaleX(${Math.min(impact[i].wind / max, 1).toFixed(3)})`;
        we.wind.classList.toggle("weak", impact[i].wind < Number(cfg.min_speed));
        return;
      }
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

    // Texts
    // Hub: where the wind comes from (e.g. NNE), and the speed underneath
    const card = dirOk ? names[Math.round(norm(dir) / 22.5) % 16] : "–";
    this._speedEl.textContent = card;
    this._unitEl.textContent = spdOk ? `${fmt(spd, spd < 10 ? 1 : 0)} ${unit}` : "";
    // Wind row: the wind's traditional name (optional) and "Calm"; no more letters or degrees here
    this._dirEl.textContent = !dirOk ? T.unavailable : windy ? "" : T.calm;
    this._wnameEl.hidden = !cfg.show_wind_name || !dirOk;
    if (cfg.show_wind_name && dirOk) this._wnameEl.textContent = windNames[Math.round(norm(dir) / 45) % 8];

    // Engraved text on the dial: wind name above the center, rain along the bottom
    if (engraved) {
      const line1 = [this._wnameEl.hidden ? "" : this._wnameEl.textContent, this._dirEl.textContent].filter(Boolean).join(" · ");
      let line2 = "";
      if (cfg.rain_entity) {
        line2 = this._rainText.textContent;
      }
      [line1, line2, line1, line2].forEach((txt, n) => (this._eTexts[n].textContent = txt));
    }
    this._masked.forEach((g) => (engraved ? g.setAttribute("mask", "url(#wc-etext-mask)") : g.removeAttribute("mask")));
    this._svg.setAttribute("aria-label", `${card}${dirOk ? ` ${fmt(dir, 0)}°` : ""}, ${this._unitEl.textContent}`);
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

  _schema(l) {
    return [
      { name: "name", selector: { text: {} } },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "auto", label: TEXT[l].language_auto },
              ...Object.entries(LANGUAGES).map(([value, { label }]) => ({ value, label })),
            ],
          },
        },
      },
      { name: "motion", selector: { boolean: {} } },
      { name: "engraved_text", selector: { boolean: {} } },
      { name: "engraved_text_size", selector: { number: { min: 0.5, max: 2.5, step: 0.1, mode: "box" } } },
      { name: "show_wind_name", selector: { boolean: {} } },
      { name: "window_thickness", selector: { number: { min: 6, max: 24, step: 1, mode: "slider" } } },
      {
        name: "theme",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "default", label: TEXT[l].theme_default },
              { value: "brass", label: TEXT[l].theme_brass },
            ],
          },
        },
      },
      // crown of the standard style (ignored by the brass one)
      ...(this._config.theme === "brass"
        ? []
        : [
            {
              type: "grid",
              name: "",
              schema: [
                { name: "bezel_color", selector: { color_rgb: {} } },
                { name: "bezel_text_color", selector: { color_rgb: {} } },
              ],
            },
            { name: "bezel_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
          ]),
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
          { name: "wall_rain_max", selector: { number: { min: 0.5, max: 100, step: 0.5, mode: "box" } } },
        ],
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const l = lang(this._hass, this._config);
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: withoutDefaults(ev.detail.value) },
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
    this._form.schema = this._schema(l);
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
