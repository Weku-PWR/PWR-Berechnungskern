[CmdletBinding()]
param(
    [string]$Version = '2.1.1',
    [string]$Architecture = 'x64'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$distDirectory = Join-Path $projectRoot 'dist'
$releaseDirectory = Join-Path $distDirectory 'release'

function Get-Sha256Hex {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $stream = [System.IO.File]::OpenRead($Path)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hashBytes = $sha256.ComputeHash($stream)
    }
    finally {
        $sha256.Dispose()
        $stream.Dispose()
    }

    return ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant()
}

$expectedFiles = @(
    "PFEIL-Wochenrapport-Setup-$Version-$Architecture.exe",
    "PFEIL-Wochenrapport-Portable-$Version-$Architecture.exe"
)

foreach ($fileName in $expectedFiles) {
    $source = Join-Path $distDirectory $fileName
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Erwartetes Build-Artefakt fehlt: $source"
    }
}

if (Test-Path -LiteralPath $releaseDirectory) {
    Remove-Item -LiteralPath $releaseDirectory -Recurse -Force
}
New-Item -ItemType Directory -Path $releaseDirectory | Out-Null

foreach ($fileName in $expectedFiles) {
    Copy-Item -LiteralPath (Join-Path $distDirectory $fileName) -Destination $releaseDirectory
}

$zipName = "PFEIL-Wochenrapport-Windows-$Version-$Architecture.zip"
$zipPath = Join-Path $releaseDirectory $zipName
$zipSources = $expectedFiles | ForEach-Object { Join-Path $releaseDirectory $_ }
Compress-Archive -LiteralPath $zipSources -DestinationPath $zipPath -CompressionLevel Optimal

$checksumPath = Join-Path $releaseDirectory 'SHA256SUMS.txt'
$deliveredFiles = @($expectedFiles + $zipName)
$checksumLines = foreach ($fileName in $deliveredFiles) {
    $hash = Get-Sha256Hex -Path (Join-Path $releaseDirectory $fileName)
    "$hash *$fileName"
}
[System.IO.File]::WriteAllLines($checksumPath, $checksumLines, [System.Text.Encoding]::ASCII)

Write-Host "Auslieferungsdateien erstellt:"
Get-ChildItem -LiteralPath $releaseDirectory -File | Sort-Object Name | ForEach-Object {
    Write-Host " - $($_.Name)"
}
