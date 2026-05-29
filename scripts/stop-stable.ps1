Set-StrictMode -Version Latest
$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $root '.run-logs'
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

function Stop-ByPidFile {
  param([string]$Name)
  $pidFile = Join-Path $logsDir "$Name.pid"
  if (Test-Path $pidFile) {
    $pidValue = (Get-Content -Path $pidFile -Raw).Trim()
    if ($pidValue -match '^\d+$') {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }
}

Stop-ByPidFile -Name 'watchdog'
Stop-ByPidFile -Name 'frontend'
Stop-ByPidFile -Name 'backend'

foreach($p in 3333,3334,5173){
  $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  foreach($c in $conns){
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Write-Host 'Sistema parado.'