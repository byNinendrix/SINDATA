Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'
$logsDir = Join-Path $root '.run-logs'
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

function Write-NoBomFile {
  param(
    [Parameter(Mandatory = $true)] [string] $Path,
    [Parameter(Mandatory = $true)] [string] $Value
  )
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Value, $enc)
}

function Log-Line {
  param([Parameter(Mandatory = $true)] [string] $Message)
  $time = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  Add-Content -Path (Join-Path $logsDir 'watchdog.log') -Value "[$time] $Message"
}

function Save-Pid {
  param(
    [Parameter(Mandatory = $true)] [string] $Name,
    [Parameter(Mandatory = $true)] [int] $Pid
  )
  Write-NoBomFile -Path (Join-Path $logsDir "$Name.pid") -Value "$Pid"
}

function Start-ManagedProcess {
  param(
    [Parameter(Mandatory = $true)] [string] $Name,
    [Parameter(Mandatory = $true)] [string] $FilePath,
    [Parameter(Mandatory = $true)] [string[]] $Arguments,
    [Parameter(Mandatory = $true)] [string] $WorkingDirectory
  )
  $outLog = Join-Path $logsDir "$Name.out.log"
  $errLog = Join-Path $logsDir "$Name.err.log"
  $proc = Start-Process -FilePath $FilePath `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -WindowStyle Hidden `
    -PassThru

  Save-Pid -Name $Name -Pid $proc.Id
  Log-Line "Processo $Name iniciado (PID=$($proc.Id))."
}

function Test-Http {
  param(
    [Parameter(Mandatory = $true)] [string] $Url
  )
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Restart-Backend {
  Log-Line 'Reiniciando backend...'
  $pidFile = Join-Path $logsDir 'backend.pid'
  if (Test-Path $pidFile) {
    $pidValue = Get-Content -Path $pidFile -Raw
    if ($pidValue -match '^\d+$') {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue
    }
  }
  Start-ManagedProcess -Name 'backend' -FilePath 'D:\\Apps\\_runtime\\node-v20.19.0-win-x64\\node.exe' -Arguments @('dist/server.js') -WorkingDirectory $backendDir
}

function Restart-Frontend {
  Log-Line 'Reiniciando frontend...'
  $pidFile = Join-Path $logsDir 'frontend.pid'
  if (Test-Path $pidFile) {
    $pidValue = Get-Content -Path $pidFile -Raw
    if ($pidValue -match '^\d+$') {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue
    }
  }
  Start-ManagedProcess -Name 'frontend' -FilePath 'npm.cmd' -Arguments @('run', 'preview', '--', '--host', '0.0.0.0', '--port', '3333', '--strictPort') -WorkingDirectory $frontendDir
}

Log-Line 'Watchdog iniciado.'
while ($true) {
  if (-not (Test-Http -Url 'http://127.0.0.1:3334/api/health')) {
    Restart-Backend
    Start-Sleep -Seconds 2
  }

  if (-not (Test-Http -Url 'http://127.0.0.1:3333')) {
    Restart-Frontend
    Start-Sleep -Seconds 2
  }

  Start-Sleep -Seconds 8
}
