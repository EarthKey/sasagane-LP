Param(
  [string]$SourceDir = 'D:\AIillust\CriptNinja\Sasagane\LP',
  [string]$DestDir   = "\\wsl$\Ubuntu\home\earthkey\sasagane-lp\assets"
)

Write-Host "Source : $SourceDir"
Write-Host "Dest   : $DestDir"

if (!(Test-Path $SourceDir)) { throw "SourceDir not found: $SourceDir" }
if (!(Test-Path $DestDir)) { New-Item -ItemType Directory -Path $DestDir -Force | Out-Null }

$names = @(
  '20250817 (1).png','20250817 (2).png','20250817 (3).png','20250817 (4).png','20250817 (5).png','20250817 (6).png',
  '20250819 (1).png','20250819 (2).png',
  '20250820 (1).png','20250820 (2).png','20250820 (9).png',
  '20250821 (1).png','20250821 (2).png','20250821 (3).png','20250821 (4).png','20250821 (8).png','20250821 (9).png','20250821 (10).png','20250821 (11).png','20250821 (13).png'
)

$copied = @()
foreach ($n in $names) {
  $src = Join-Path $SourceDir $n
  if (!(Test-Path $src)) { Write-Warning "Missing: $n"; continue }
  $destName = ($n -replace ' \((\d+)\)', '-$1')
  $dest = Join-Path $DestDir $destName
  Copy-Item -Path $src -Destination $dest -Force
  $copied += $destName
  Write-Host "Copied -> $destName"
}

Write-Host "Done. Copied files:" -ForegroundColor Green
$copied | ForEach-Object { Write-Host "  $_" }

