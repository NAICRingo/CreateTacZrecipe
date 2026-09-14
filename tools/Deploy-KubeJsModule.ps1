param(
    [Parameter(Mandatory = $false)]
    [string]$InstancePath = "C:\PCL\.minecraft\versions\Mechanomania11120-CreateTacZrecipe-Test"
)

$ErrorActionPreference = "Stop"
$resolvedInstance = (Resolve-Path -LiteralPath $InstancePath).Path
$modsPath = Join-Path $resolvedInstance "mods"
$targetPath = Join-Path $resolvedInstance "kubejs"
$sourcePath = Join-Path (Split-Path -Parent $PSScriptRoot) "src\kubejs"
$exampleSource = Join-Path (Split-Path -Parent $PSScriptRoot) "config\createtaczrecipe\ammo_overrides.json.example"
$configPath = Join-Path $resolvedInstance "config\createtaczrecipe"

if (-not (Test-Path -LiteralPath $modsPath -PathType Container)) {
    throw "Target is not a usable Minecraft instance: missing mods directory at $modsPath"
}

$requiredJarPatterns = @(
    "kubejs-neoforge-*.jar",
    "create-1.21.1-6*.jar",
    "createdeco-*.jar",
    "createdieselgenerators-*.jar",
    "tacz-neoforge-1.21.1-1.1.8*.jar"
)

foreach ($pattern in $requiredJarPatterns) {
    if (-not (Get-ChildItem -LiteralPath $modsPath -Filter $pattern -File)) {
        throw "Missing required dependency matching: $pattern"
    }
}

Get-ChildItem -LiteralPath $sourcePath -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourcePath.Length).TrimStart("\")
    $destination = Join-Path $targetPath $relativePath
    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
    Write-Host "Deployed $relativePath"
}

New-Item -ItemType Directory -Path $configPath -Force | Out-Null
$exampleDestination = Join-Path $configPath "ammo_overrides.json.example"
if (-not (Test-Path -LiteralPath $exampleDestination)) {
    Copy-Item -LiteralPath $exampleSource -Destination $exampleDestination
    Write-Host "Deployed config example ammo_overrides.json.example"
}

Write-Host "CreateTacZrecipe KubeJS module deployed to $resolvedInstance"
