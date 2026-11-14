# Changelog

## 1.0.0 — first public release

A Home Assistant card that shows where the wind and the rain hit your house.

- **Wind**: chevrons along the wind axis, pointing where the wind blows, denser linearly with the wind speed and turning from green to red between 10 and 15 km/h. Direction (e.g. NNE) and speed in the center. Optional classic arrow (`pointer: arrow`).
- **Rain**: raindrops flying across the compass with the wind, their number following the mm/h. The rain is described in words (drizzle, raining, pouring, cloudburst, with configurable `rain_levels`) together with its amount.
- **Windows**: each window on a wall around the compass at its real exposure, drawn at its real width, with an optional room icon (`mdi:…` or emoji). Two gauges per window: rain hitting the glass (driving rain, ISO 15927-3) and wind pushing on it, for any wind from the window's side weighted by the cosine of the angle. Optional arcs-on-the-ring layout.
- **Texts**: under the compass, or engraved in the dial (`engraved_text`) with adjustable size; optional traditional wind names (Tramontane, Gregale, Sirocco…).
- **Styles**: standard style with a watch-like crown (custom color and opacity), brass style with engraved chevrons and drops, light and dark Home Assistant themes, optional animation (`motion`).
- **Languages**: English, Italian, German, French, Spanish, Dutch; every text can be overridden with `texts`.
- **Customization**: public CSS variables for card-mod and themes.
- **Easy setup**: only the two wind sensors are required; every other option has a default. Visual editor that writes only the options you change.
