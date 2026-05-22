param(
  [switch]$Rebuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

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

function Save-Pid {
  param(
    [Parameter(Mandatory = $true)] [string] $Name,
    [Parameter(Mandatory = $true)] [int] $ProcessId
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
  if (Test-Path $outLog) { Remove-Item $outLog -Force }
  if (Test-Path $errLog) { Remove-Item $errLog -Force }

  $proc = Start-Process -FilePath $FilePath `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -WindowStyle Hidden `
    -PassThru

  Save-Pid -Name $Name -ProcessId $proc.Id
  return $proc
}

Write-Host 'Parando processos antigos...'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'stop-stable.ps1') | Out-Null

if ($Rebuild) {
  Write-Host 'Build backend...'
  & npm.cmd run build --prefix $backendDir | Out-Host

  Write-Host 'Build frontend...'
  & npm.cmd run build --prefix $frontendDir | Out-Host
}

Write-Host 'Subindo backend (producao)...'
$backendProc = Start-ManagedProcess `
  -Name 'backend' `
  -FilePath 'D:\\Apps\\_runtime\\node-v20.19.0-win-x64\\node.exe' `
  -Arguments @('dist/server.js') `
  -WorkingDirectory $backendDir

Write-Host 'Subindo frontend (preview estavel)...'
$frontendProc = Start-ManagedProcess `
  -Name 'frontend' `
  -FilePath 'npm.cmd' `
  -Arguments @('run', 'preview', '--', '--host', '0.0.0.0', '--port', '5173', '--strictPort') `
  -WorkingDirectory $frontendDir

Write-Host 'Subindo watchdog...'
$watchdogProc = Start-ManagedProcess `
  -Name 'watchdog' `
  -FilePath 'powershell.exe' `
  -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'watchdog-stable.ps1')) `
  -WorkingDirectory $root

Start-Sleep -Seconds 2
Write-Host "backend PID: $($backendProc.Id)"
Write-Host "frontend PID: $($frontendProc.Id)"
Write-Host "watchdog PID: $($watchdogProc.Id)"
Write-Host 'Sistema iniciado.'
