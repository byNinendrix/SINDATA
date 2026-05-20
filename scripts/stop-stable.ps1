Set-StrictMode -Version Latest
$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $root '.run-logs'

function Stop-ByPidFile {
  param([Parameter(Mandatory = $true)] [string] $Name)
  $pidFile = Join-Path $logsDir "$Name.pid"
  if (Test-Path $pidFile) {
    $pidValue = Get-Content -Path $pidFile -Raw
    if ($pidValue -match '^\d+$') {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }
}

Stop-ByPidFile -Name 'watchdog'
Stop-ByPidFile -Name 'frontend'
Stop-ByPidFile -Name 'backend'

$ports = @(3333, 5173)
foreach ($port in $ports) {
  $lines = netstat -ano | findstr ":$port" | findstr 'LISTENING'
  if ($lines) {
    foreach ($line in @($lines)) {
      $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
      $procId = $parts[-1]
      if ($procId -match '^\d+$') {
        Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue
      }
    }
  }
}

Write-Host 'Sistema parado.'
