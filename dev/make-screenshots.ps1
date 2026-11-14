# Regenerates the README screenshots in docs/images with headless Chrome.
# Usage (from the repository root):  powershell -ExecutionPolicy Bypass -File dev\make-screenshots.ps1
# Optional: -Only name1,name2  to regenerate just some images.
param(
  [string]$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe",
  [string[]]$Only = @()
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$page = "file:///" + ((Join-Path $root "dev\screenshot.html") -replace "\\", "/")
$outDir = Join-Path $root "docs\images"
New-Item -ItemType Directory -Force $outDir | Out-Null
$profileDir = Join-Path $env:TEMP "wind-rain-compass-card-shots"

# The windows of the example house
$house = @(
  @{ name = "Kitchen"; direction = 0; width = 20; icon = "mdi:stove" },
  @{ name = "Guest WC"; direction = 0; width = 20; icon = "mdi:toilet" },
  @{ name = "Living room"; direction = 0; width = 30; icon = "mdi:sofa" },
  @{ name = "Entrance"; direction = 0; width = 30; icon = "mdi:door" },
  @{ name = "Guest room"; direction = 90; width = 30; icon = "mdi:bed-outline" },
  @{ name = "Bedroom"; direction = 90; width = 20; icon = "mdi:bed" },
  @{ name = "Office"; direction = 90; width = 20; icon = "mdi:desk" },
  @{ name = "Hall"; direction = 180; width = 20; icon = "mdi:door-sliding" },
  @{ name = "Bathroom"; direction = 270; width = 30; icon = "mdi:shower" }
)
$houseNoIcons = $house | ForEach-Object { $h = $_.Clone(); $h.Remove("icon"); $h }
$full = @{ name = "Wind"; show_wind_name = $true; engraved_text = $true; window_thickness = 14; sectors = $house }

# name -> card options + sensor values + page options
$shots = [ordered]@{
  "hero-standard"   = @{ c = $full; dir = 30; spd = 25; rain = 3 }
  "hero-brass"      = @{ c = $full + @{ theme = "brass" }; dir = 30; spd = 25; rain = 3 }
  "dark"            = @{ c = $full; dir = 200; spd = 18; rain = 1.5; dark = 1 }
  "brass-dark"      = @{ c = $full + @{ theme = "brass" }; dir = 200; spd = 18; rain = 1.5; dark = 1 }
  "minimal"         = @{ c = @{}; dir = 30; spd = 12; w = 260 }
  "text-below"      = @{ c = @{ name = "Wind"; show_wind_name = $true; sectors = $houseNoIcons }; dir = 30; spd = 25; rain = 3 }
  "wind-01"         = @{ c = @{}; dir = 0; spd = 1; w = 240 }
  "wind-08"         = @{ c = @{}; dir = 0; spd = 8; w = 240 }
  "wind-20"         = @{ c = @{}; dir = 0; spd = 20; w = 240 }
  "wind-45"         = @{ c = @{}; dir = 0; spd = 45; w = 240 }
  "rain-0"          = @{ c = @{}; dir = 250; spd = 15; rain = 0; w = 240 }
  "rain-05"         = @{ c = @{}; dir = 250; spd = 15; rain = 0.5; w = 240 }
  "rain-2"          = @{ c = @{}; dir = 250; spd = 15; rain = 2; w = 240 }
  "rain-6"          = @{ c = @{}; dir = 250; spd = 15; rain = 6; w = 240 }
  "rain-12"         = @{ c = @{}; dir = 250; spd = 15; rain = 12; w = 240 }
  "windows-plain"   = @{ c = @{ sectors = $houseNoIcons }; dir = 45; spd = 30; rain = 3 }
  "windows-icons"   = @{ c = @{ sectors = $house; window_thickness = 20 }; dir = 45; spd = 30; rain = 3 }
  "windows-ring"    = @{ c = @{ sectors = $houseNoIcons; window_layout = "ring" }; dir = 45; spd = 30; rain = 3 }
  "pointer-arrow"   = @{ c = @{ pointer = "arrow" }; dir = 30; spd = 25; rain = 2; w = 260 }
  "bezel-navy"      = @{ c = @{ bezel_color = "#0d2a4a" }; dir = 30; spd = 12; w = 240 }
  "bezel-light"     = @{ c = @{ bezel_color = "#e0e4ea" }; dir = 30; spd = 12; w = 240 }
  "bezel-red"       = @{ c = @{ bezel_color = "#8e1b1b" }; dir = 30; spd = 12; w = 240 }
  "bezel-glass"     = @{ c = @{ bezel_color = "#0d2a4a"; bezel_opacity = 0.25 }; dir = 30; spd = 12; w = 240 }
  "engraved-big"    = @{ c = @{ show_wind_name = $true; engraved_text = $true; engraved_text_size = 1.5 }; dir = 135; spd = 12; rain = 6; w = 300 }
  "cardmod"         = @{ c = @{ show_wind_name = $true; engraved_text = $true; sectors = $house; window_thickness = 14 }; dir = 30; spd = 25; rain = 3;
                         cardmod = ":host { --wind-compass-chevron-color: #8e24aa; --wind-compass-drop-color: #00897b; --wind-compass-rain-color: #00897b; --wind-compass-wind-color: #e91e63; --wind-compass-face-color: #fdf6ff; }" }
}
foreach ($l in "en", "it", "de", "fr", "es", "nl") {
  $shots["lang-$l"] = @{ c = @{ language = $l; show_wind_name = $true; engraved_text = $true }; dir = 225; spd = 6; rain = 2; w = 220 }
}

function Invoke-Chrome([string[]]$ChromeArgs, [string]$StdOut) {
  $base = @("--headless=new", "--disable-gpu", "--user-data-dir=$profileDir", "--allow-file-access-from-files", "--hide-scrollbars")
  if ($StdOut) { Start-Process -FilePath $Chrome -ArgumentList ($base + $ChromeArgs) -RedirectStandardOutput $StdOut -Wait -WindowStyle Hidden }
  else { Start-Process -FilePath $Chrome -ArgumentList ($base + $ChromeArgs) -Wait -WindowStyle Hidden }
}

$tmp = Join-Path $env:TEMP "wcc-dom.html"
foreach ($name in $shots.Keys) {
  if ($Only.Count -and $Only -notcontains $name) { continue }
  $s = $shots[$name]
  $qs = "c=" + [uri]::EscapeDataString(($s.c | ConvertTo-Json -Depth 6 -Compress))
  foreach ($k in "dir", "spd", "rain", "dark", "w", "lang", "cardmod") {
    if ($s.ContainsKey($k)) { $qs += "&$k=" + [uri]::EscapeDataString([string]$s[$k]) }
  }
  $url = "$page`?$qs"
  # 1) measure the page
  Invoke-Chrome @("--virtual-time-budget=6000", "--dump-dom", $url) $tmp
  $m = [regex]::Match((Get-Content $tmp -Raw), "size:(\d+)x(\d+)")
  if (-not $m.Success) { Write-Warning "$name : could not measure, skipped"; continue }
  $w = [int]$m.Groups[1].Value; $h = [int]$m.Groups[2].Value
  # 2) screenshot at exactly that size, 2x for sharp images
  $file = Join-Path $outDir "$name.png"
  Invoke-Chrome @("--window-size=$w,$h", "--force-device-scale-factor=2", "--virtual-time-budget=6000", "--screenshot=$file", $url)
  Write-Host ("{0,-16} {1}x{2}" -f $name, $w, $h)
}
