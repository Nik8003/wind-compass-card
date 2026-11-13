# Wind Compass Card

A Home Assistant Lovelace card that shows **where the wind hits your house**.

- **Chevrons** (V shapes) along the wind axis point where the wind **blows**. They are spread evenly over the dial and get **denser linearly with the wind**: a single V in the center at 1 km/h, then more and more, closer and closer, up to about 45 at `max_speed`. Between 10 and 15 km/h they turn from green to red. Other units (m/s, knots…) are converted to km/h. Prefer a classic arrow? Set `pointer: arrow`.
- Windows sit on **walls tangent to the compass**, at the point of their exposure, like the sides of the house around it: windows facing the same way share a wall, side by side. Each window is split in two gauges that grow from its middle towards its sides: the **outer half fills with blue** in proportion to the rain hitting the glass (full at `wall_rain_max`), the **inner half fills with orange** in proportion to the wind pushing on it (full at `max_speed`, faded below `min_speed`). When the blue half fills up, it's time to close the shutters. (Set `window_layout: ring` to draw them as arcs on the ring instead.)
- When it rains, **raindrops** fly across the compass in the wind's direction: the more it rains, the more drops; the stronger the wind, the faster they move.
- In the center: where the wind comes from (e.g. **NNE**) and, underneath, its speed.
- Below the compass: the wind's traditional name (optional, e.g. *Grecale*) or *Calm*, and a badge with the current rain in mm (or mm/h). With `engraved_text: true` these are engraved in the dial instead: the wind's name on an arc above the center, the rain along the bottom.

Built for a simple use case: close the shutters when rain is blown onto the windows.

## Installation

### HACS (custom repository)

1. HACS → ⋮ → *Custom repositories* → add this repository URL, category **Dashboard**.
2. Install **Wind Compass Card** and reload the browser.

### Manual

1. Copy `dist/wind-compass-card.js` to `<config>/www/wind-compass-card.js`.
2. Settings → Dashboards → ⋮ → *Resources* → add `/local/wind-compass-card.js` as **JavaScript module**.
3. Reload the browser.

## Configuration

Only the two wind sensors are required; everything else has a default:

```yaml
type: custom:wind-compass-card
direction_entity: sensor.wind_direction
speed_entity: sensor.wind_speed
```

Add `rain_entity` to see the rain, and `sectors` to see your windows. A fuller example:

```yaml
type: custom:wind-compass-card
name: Wind
direction_entity: sensor.wind_direction
speed_entity: sensor.wind_speed
rain_entity: sensor.rain_rate     # mm/h, mm, binary_sensor or weather
min_speed: 10
max_speed: 60
sectors:
  - name: Kitchen
    direction: 180   # the direction the window faces (180 = South)
    width: 120       # real width of the window (e.g. cm), drawn in proportion
    icon: mdi:stove  # symbol of the room: HA icon or emoji
  - name: Living room
    direction: 180
    width: 200
    icon: mdi:sofa
  - name: Bedroom
    direction: 0
    width: 120
    icon: 🛏️
```

| Option             | Required | Default | Description |
|--------------------|----------|---------|-------------|
| `direction_entity` | yes      |         | Sensor with the wind direction in degrees: where the wind comes **from** (0 = North, 90 = East). |
| `speed_entity`     | yes      |         | Sensor with the wind speed (any unit). |
| `rain_entity`      | no       |         | `binary_sensor` (`on` = rain), numeric `sensor` (rain if > `rain_threshold`) or `weather` entity (rainy states). |
| `rain_threshold`   | no       | `0`     | For numeric rain sensors: value above which it counts as raining. |
| `rain_levels`      | no       | `[1, 4, 10]` | mm/h limits for describing the rain: below 1 *Drizzle*, 1–4 *Raining*, 4–10 *Pouring*, 10 and more *Cloudburst* (in Italian: Pioviggina, Piove, Diluvia, Secchiate). Shown with the amount, e.g. *Pouring · 6 mm/h*. |
| `wall_rain_max`    | no       | `5`     | Rain hitting the glass (mm/h) at which the arc and the badge are completely full of water. |
| `max_rain`         | no       | `15`    | Rain rate (mm/h) shown as the heaviest shower: the number of raindrops in the compass grows linearly from 0 up to this value (300 drops: with the default, 2 drops every 0.1 mm/h). |
| `name`             | no       |         | Card title (centered). |
| `theme`            | no       | `default` | `brass` turns the compass into a brass instrument: polished bezel, engraved chevrons and raindrops on the brass face, serif lettering, copper/blue enamel for the window arcs. |
| `language`         | no       | `auto`  | Language of the texts: `auto` (same as Home Assistant, English if not available), `en`, `it`, `de`, `fr`, `es`, `nl`. |
| `texts`            | no       |         | Your own texts, replacing the built-in ones (see below). |
| `motion`           | no       | `false` | `true` animates the compass: raindrops fly with the wind and the chevrons flow along its axis, faster with stronger wind. With `false` everything stays still. |
| `engraved_text`    | no       | `false` | `true` engraves the texts in the dial, like the writing on a watch face, instead of writing them under the compass: the wind's name (or *Calm*) on an arc above the center, the rain along the bottom. Chevrons and drops are cut away around the letters so they always read. |
| `engraved_text_size` | no     | `1`     | Size of the engraved texts, as a multiplier: e.g. `1.3` is 30% bigger, `0.8` smaller (0.5–2.5). Very long texts may get cut at the ends of their arc. |
| `window_thickness` | no       | `10`    | Thickness of the windows on their walls (6–24). Thicker windows leave more room for their symbol. |
| `window_layout`    | no       | `tangent` | `tangent`: windows on walls tangent to the compass, grouped by direction. `ring`: windows as arcs on the compass ring (their `width` sets the arc size). |
| `bezel_color`      | no       |         | Standard style only: color of the crown (any CSS color, or `[r, g, b]` as given by the visual editor's color picker). A polished sheen is kept on top. |
| `bezel_opacity`    | no       | `1`     | Standard style only: opacity of the crown, from `0` (invisible, the card shows through) to `1`. |
| `bezel_text_color` | no       | auto    | Standard style only: color of the ticks and letters on the crown. By default white or dark, whichever reads better on `bezel_color` (the theme's text color when the crown is mostly transparent). |
| `show_wind_name`   | no       | `false` | Show the traditional name of the wind under the compass: Tramontane (N), Gregale (NE), Levant (E), Sirocco (SE), Ostro (S), Libeccio (SW), Ponente (W), Mistral (NW). In Italian: Tramontana, Grecale, Levante, Scirocco, Ostro, Libeccio, Ponente, Maestrale. |
| `min_speed`        | no       | `10`    | Wind pushing on a window (see below) from which it counts as exposed (orange). Same unit as the speed sensor. |
| `max_speed`        | no       | `60`    | Speed at which the chevrons are densest (or the arrow at full size). |
| `pointer`          | no       | `chevrons` | How the wind is drawn: `chevrons` (V shapes along the wind axis) or `arrow` (a single arrow across the compass). |
| `sectors`          | no       |         | List of windows: `name`, `direction` (where the window faces, 0–360), optional `icon` (a symbol for the room, drawn upright in the middle of the window: a Home Assistant icon like `mdi:sofa`, or an emoji or letter like `🛋️`), `exposure` (0–1, default 1) and `width` (the window's real width in any unit, e.g. cm, default 30: windows are drawn in proportion, with the same scale on every wall; with `window_layout: ring` it is the arc size in degrees). |
| `color`            | no       |         | Fixed chevron/arrow color (any CSS color) instead of the speed-based color. |

### How the impact on a window is computed

Any wind coming from the window's side of the house (less than 90° away from where it faces) hits it, weighted by the cosine of that angle θ: head-on counts 100%, 45° off counts 71%, 60° off counts 50%. So with wind from North-East, both North- and East-facing windows are hit.

- **Wind on the window** = wind speed × cos θ × `exposure`. The window turns **orange** when this reaches `min_speed`.
- **Rain on the glass** (driving rain, ISO 15927-3): `0.222 × wind [m/s] × rain^0.88 [mm/h] × cos θ × exposure`. The window fills with water in proportion to this value (full at `wall_rain_max`). Example: 25 km/h and 2 mm/h at 45° → about 2 mm/h on the glass.

Use `exposure` for windows that are partly sheltered: `0.5` for a window under a balcony or recessed in the wall, `0` to ignore it. If the rain sensor gives no amount (binary sensor, weather entity), 2 mm/h is assumed (8 mm/h when *pouring*).

The base options can be set with the visual editor; `sectors` are edited in the YAML code editor. The visual editor only writes the options you change, so the YAML stays short. An option left empty in YAML (e.g. `min_speed:`) or with an invalid value uses its default.

## Languages and custom texts

Built-in languages: English, Italian, German, French, Spanish and Dutch. With `language: auto` the card follows Home Assistant's language and falls back to English.

Any text can be replaced with `texts` (only what you set is replaced, the rest stays in the card's language):

```yaml
texts:
  calm: Bonaccia
  drizzle: Pioggerellina      # below rain_levels[0]
  raining: Piove              # rain_levels[0] .. [1] (also used when the sensor gives no amount)
  heavy_rain: Piove forte     # rain_levels[1] .. [2]
  downpour: A catinelle       # from rain_levels[2]
  dry: Secco
  unavailable: "—"
  # 16 compass points, from N clockwise
  cardinals: [N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW]
  # 8 wind names, for winds from N, NE, E, SE, S, SW, W, NW
  wind_names: [Tramontana, Grecale, Levante, Scirocco, Mezzogiorno, Garbino, Ponente, Maestrale]
```

`cardinals` must have 16 items and `wind_names` 8, otherwise they are ignored. The 4 letters on the crown are items 1, 5, 9 and 13 of `cardinals`.

## Styling (card-mod or themes)

The card reads these CSS variables, so you can restyle it with [card-mod](https://github.com/thomasloven/lovelace-card-mod) or from a Home Assistant theme:

| Variable | What it colors |
|----------|----------------|
| `--wind-compass-chevron-color` | Wind chevrons (replaces the speed-based color) |
| `--wind-compass-drop-color` | Raindrops in the compass |
| `--wind-compass-wind-color` | Wind half of the windows |
| `--wind-compass-rain-color` | Rain half of the windows and the rain badge |
| `--wind-compass-face-color` | Compass face background |
| `--wind-compass-bezel-color` | Crown (bezel) around the face: dark ceramic watch bezel by default |
| `--wind-compass-bezel-opacity` | Opacity of the crown (0–1) |
| `--wind-compass-bezel-text-color` | Ticks and letters on the crown |
| `--wind-compass-north-color` | The N on the crown |
| `--wind-compass-window-icon-color` | Room symbols on the windows |
| `--wind-compass-engraved-text-color` | Texts engraved in the dial (`engraved_text: true`) |
| `--wind-compass-font` | Font of all texts |
| `--wind-compass-max-width` | Maximum size of the compass (e.g. `320px`) |

```yaml
type: custom:wind-compass-card
# ...
card_mod:
  style: |
    ha-card {
      --wind-compass-chevron-color: #8e24aa;
      --wind-compass-rain-color: #00897b;
      --wind-compass-max-width: 320px;
      background: transparent;
      box-shadow: none;
    }
```

`ha-card` itself (background, border, padding, shadow) can be styled with card-mod as usual.

Clicking the card opens the details of the speed sensor.

## License

MIT
