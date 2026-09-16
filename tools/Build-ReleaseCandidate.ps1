param(
    [string]$Version = "0.2.0-rc1"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$jarName = "createtaczrecipe-$Version.jar"
$builtJar = Join-Path $projectRoot "build\libs\$jarName"
$distDir = Join-Path $projectRoot "dist"
$distJar = Join-Path $distDir $jarName

Push-Location $projectRoot
try {
    & node ".\tools\validate-ammo-framework.js"
    if ($LASTEXITCODE -ne 0) { throw "Default framework validation failed." }

    & node ".\tools\validate-ammo-framework.js" "--without-optional"
    if ($LASTEXITCODE -ne 0) { throw "No-optional-mod framework validation failed." }

    & ".\gradlew.bat" clean build
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed." }

    & node ".\tools\validate-release.js" $builtJar
    if ($LASTEXITCODE -ne 0) { throw "Release content validation failed." }

    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    Copy-Item -LiteralPath $builtJar -Destination $distJar -Force
    Copy-Item -LiteralPath ".\docs\RELEASE-0.2.0-RC1.md" -Destination (Join-Path $distDir "README-$Version.md") -Force
    Copy-Item -LiteralPath ".\CHANGELOG.md" -Destination (Join-Path $distDir "CHANGELOG.md") -Force

    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $distJar).Hash.ToLowerInvariant()
    Set-Content -LiteralPath (Join-Path $distDir "$jarName.sha256") -Encoding ascii -Value "$hash  $jarName"
    Write-Host "Release candidate: $distJar"
    Write-Host "SHA-256: $hash"
}
finally {
    Pop-Location
}
