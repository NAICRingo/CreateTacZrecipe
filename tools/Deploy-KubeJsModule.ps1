param(
    [Parameter(Mandatory = $false)]
    [string]$InstancePath = "C:\PCL\.minecraft\versions\Mechanomania11120-LO2900R-Test"
)

$ErrorActionPreference = "Stop"
$resolvedInstance = (Resolve-Path -LiteralPath $InstancePath).Path
$modsPath = Join-Path $resolvedInstance "mods"
$targetPath = Join-Path $resolvedInstance "kubejs"
$sourcePath = Join-Path (Split-Path -Parent $PSScriptRoot) "src\kubejs"

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

Write-Host "LO2900R KubeJS module deployed to $resolvedInstance"
