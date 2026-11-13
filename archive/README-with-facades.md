# Wind Compass Card

A Home Assistant Lovelace card that shows **where the wind hits your house**.

- **Chevrons** (V shapes) along the wind axis point where the wind **blows**. At 1 km/h a single thin green V appears in the center; every extra km/h adds one before and one after it, until 10 km/h covers the whole dial. Between 10 and 15 km/h they turn from green to red; above 15 km/h they get thicker, up to almost touching at `max_speed`. Other units (m/s, knots…) are converted to km/h. The speed is shown in the center. Prefer a classic arrow? Set `pointer: arrow`.
- Each window is an **arc on the ring**. It turns **orange** when the wind pushes on it, and **fills with water** from the outside in, in proportion to the rain hitting the glass: when it fills, it's time to close the shutters.
- Below the compass, windows are **grouped by facade** (one row per side of the house, e.g. North, East). Each row shows its state (*Sheltered*, *Wind*, *Wind + rain*) with the amount, highlights the windows that are actually hit, and its round badge fills with water like a glass.
- When it rains, **raindrops** fly across the compass in the wind's direction: the more it rains, the more drops; the stronger the wind, the faster they move.
- The badge in the top right shows the current rain in mm (or mm/h) from your rain sensor.

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
    width: 90        # how wide the exposed angle is, in degrees
  - name: Living room
    direction: 250
    width: 70
  - name: Bedroom
    direction: 0
```

| Option             | Required | Default | Description |
|--------------------|----------|---------|-------------|
| `direction_entity` | yes      |         | Sensor with the wind direction in degrees: where the wind comes **from** (0 = North, 90 = East). |
| `speed_entity`     | yes      |         | Sensor with the wind speed (any unit). |
| `rain_entity`      | no       |         | `binary_sensor` (`on` = rain), numeric `sensor` (rain if > `rain_threshold`) or `weather` entity (rainy states). |
| `rain_threshold`   | no       | `0`     | For numeric rain sensors: value above which it counts as raining. |
| `wall_rain_threshold` | no    | `0.3`   | Rain hitting the glass (mm/h, see below) from which a window counts as *Wind + rain*. |
| `wall_rain_max`    | no       | `5`     | Rain hitting the glass (mm/h) at which the arc and the badge are completely full of water. |
| `max_rain`         | no       | `15`    | Rain rate (mm/h) shown as the heaviest shower: the number of raindrops in the compass grows linearly from 0 up to this value (300 drops: with the default, 2 drops every 0.1 mm/h). |
| `name`             | no       |         | Card title. |
| `min_speed`        | no       | `10`    | Wind pushing on a window (see below) from which it counts as exposed (orange). Same unit as the speed sensor. |
| `max_speed`        | no       | `60`    | Speed at which the chevrons reach their maximum thickness (or the arrow its full size). |
| `pointer`          | no       | `chevrons` | How the wind is drawn: `chevrons` (V shapes along the wind axis) or `arrow` (a single arrow across the compass). |
| `sectors`          | no       |         | List of windows: `name`, `direction` (where the window faces, 0–360), optional `exposure` (0–1, default 1), `width` (size of the arc drawn on the ring, default 30) and `facade` (row name). |
| `color`            | no       |         | Fixed chevron/arrow color (any CSS color) instead of the speed-based color. |

### How the impact on a window is computed

Any wind coming from the window's side of the house (less than 90° away from where it faces) hits it, weighted by the cosine of that angle θ: head-on counts 100%, 45° off counts 71%, 60° off counts 50%. So with wind from North-East, both North- and East-facing windows are hit.

- **Wind on the window** = wind speed × cos θ × `exposure`. The window turns **orange** when this reaches `min_speed`.
- **Rain on the glass** (driving rain, ISO 15927-3): `0.222 × wind [m/s] × rain^0.88 [mm/h] × cos θ × exposure`. The arc fills with water in proportion to this value (full at `wall_rain_max`); the window counts as *Wind + rain* when it reaches `wall_rain_threshold`. Example: 25 km/h and 2 mm/h at 45° → about 2 mm/h on the glass.

Each facade row shows the value that matters: wind on the window, or rain on the glass when it's wet.

Use `exposure` for windows that are partly sheltered: `0.5` for a window under a balcony or recessed in the wall, `0` to ignore it. If the rain sensor gives no amount (binary sensor, weather entity), 2 mm/h is assumed (8 mm/h when *pouring*).

Windows with the same `direction` share a facade row, named after the direction (North, North-East, …). Give windows the same `facade: Garden side` to group them under a name of your choice.

The base options can be set with the visual editor; `sectors` are edited in the YAML code editor.

Clicking the card opens the details of the speed sensor.

## License

MIT
