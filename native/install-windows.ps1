# Install the optional Native Messaging updater for unpacked Edge/Chrome.
# No elevation, no git and no third-party Python packages are needed.
# Example:
# powershell -ExecutionPolicy Bypass -File .\native\install-windows.ps1 -ExtensionId abcdefghijklmnopabcdefghijklmnop -Browser Edge
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-p]{32}$')]
    [string]$ExtensionId,
    [ValidateSet("Edge", "Chrome", "Both")]
    [string]$Browser = "Edge",
    [string]$ExtensionPath = ""
)
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($ExtensionPath)) {
    $ExtensionPath = Split-Path -Parent $scriptDir
}
$folder = (Resolve-Path -LiteralPath $ExtensionPath).Path
$manifest = Join-Path $folder "manifest.json"
if (-not (Test-Path -LiteralPath $manifest -PathType Leaf)) {
    throw "A megadott mappa nem tartalmaz manifest.json fájlt: $folder"
}
$app = Get-Content -LiteralPath $manifest -Raw -Encoding UTF8 | ConvertFrom-Json
if ($app.name -ne "Claude Voice Bridge") {
    throw "Ez nem Claude Voice Bridge bővítménymappa."
}
$install = Join-Path $env:LOCALAPPDATA "ClaudeVoiceBridgeUpdater"
New-Item -ItemType Directory -Path $install -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $scriptDir "updater.py") -Destination (Join-Path $install "updater.py") -Force

# Resolve the actual Python interpreter now, not an arbitrary PATH entry later.
$python = Get-Command py -ErrorAction SilentlyContinue
if ($python) {
    $pythonArgs = "-3 -u"
} else {
    $python = Get-Command python -ErrorAction Stop
    $pythonArgs = "-u"
}
$pythonPath = $python.Source
$runner = Join-Path $install "updater.cmd"
$cmdText = "@echo off" + [Environment]::NewLine +
    '"' + $pythonPath + '" ' + $pythonArgs + ' "%~dp0updater.py" %*' + [Environment]::NewLine
[System.IO.File]::WriteAllText($runner, $cmdText, [System.Text.Encoding]::ASCII)

$origin = "chrome-extension://$ExtensionId/"
$config = @{ origin = $origin; extension_dir = $folder } | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText((Join-Path $install "config.json"), $config, [System.Text.Encoding]::UTF8)

$hostName = "com.sancho.cvb_updater"
$hostManifest = Join-Path $install "$hostName.json"
$payload = @{
    name = $hostName
    description = "Claude Voice Bridge updater for local unpacked extension"
    path = $runner
    type = "stdio"
    allowed_origins = @($origin)
} | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($hostManifest, $payload, [System.Text.Encoding]::UTF8)

$browsers = if ($Browser -eq "Both") { @("Edge", "Chrome") } else { @($Browser) }
foreach ($item in $browsers) {
    $vendor = if ($item -eq "Edge") { "Microsoft\Edge" } else { "Google\Chrome" }
    $keyPath = "HKCU:\Software\$vendor\NativeMessagingHosts\$hostName"
    New-Item -Path $keyPath -Force | Out-Null
    # Set-Item writes the registry key default value; Get-Item returns a read-only RegistryKey.
    Set-Item -LiteralPath $keyPath -Value $hostManifest
    Write-Host "Native Messaging regisztrálva: $item"
}
Write-Host "Telepítési mappa: $folder"
Write-Host "Engedélyezett bővítmény ID: $ExtensionId"
Write-Host "Native updater: $install"
Write-Host "Most nyisd meg a Claude Voice Bridge felugró paneljét, és ellenőrizd a frissítést."
