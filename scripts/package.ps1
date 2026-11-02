param([string]$CertificateThumbprint = '')

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$compilerPath = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
if (-not (Test-Path -LiteralPath $compilerPath)) { throw 'Compilador .NET Framework não encontrado.' }

$payloadPath = Join-Path $projectRoot 'dist/app.html.gz'
$nativeBuildPath = Join-Path $projectRoot 'dist/desktop'
$releasePath = Join-Path $projectRoot 'release'
$outputPath = Join-Path $releasePath 'LeleJogos.exe'
if (-not (Test-Path -LiteralPath $payloadPath)) { throw 'Execute npm.cmd run build primeiro.' }
New-Item -ItemType Directory -Force -Path $nativeBuildPath,$releasePath | Out-Null

# Generate the application icon from drawing primitives; no image downloads are needed.
Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap 64,64
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$background = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(45,79,55))
$foreground = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(241,239,218))
$font = New-Object Drawing.Font 'Georgia',36,([Drawing.FontStyle]::Regular),([Drawing.GraphicsUnit]::Pixel)
$iconPath = Join-Path $nativeBuildPath 'app.ico'
$iconStream = $null
$icon = $null
try {
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([Drawing.Color]::Transparent)
    $graphics.FillEllipse($background,1,1,62,62)
    $graphics.DrawString([char]0x2660,$font,$foreground,12,8)
    $icon = [Drawing.Icon]::FromHandle($bitmap.GetHicon())
    $iconStream = [IO.File]::Create($iconPath)
    $icon.Save($iconStream)
}
finally {
    if ($iconStream) { $iconStream.Dispose() }
    if ($icon) { $icon.Dispose() }
    $font.Dispose(); $foreground.Dispose(); $background.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}

$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$assemblyPath = Join-Path $nativeBuildPath 'AssemblyInfo.cs'
@"
using System.Reflection;
[assembly: AssemblyTitle("Lelê Jogos")]
[assembly: AssemblyProduct("Lelê Jogos")]
[assembly: AssemblyDescription("Biblioteca de jogos offline para Windows")]
[assembly: AssemblyCompany("Lelê Jogos")]
[assembly: AssemblyVersion("$($package.version).0")]
[assembly: AssemblyFileVersion("$($package.version).0")]
"@ | Set-Content -LiteralPath $assemblyPath -Encoding UTF8

& $compilerPath /nologo /target:winexe /platform:anycpu /optimize+ `
    "/out:$outputPath" /reference:System.Windows.Forms.dll `
    "/win32manifest:$(Join-Path $projectRoot 'desktop/app.manifest')" "/win32icon:$iconPath" `
    "/resource:$payloadPath,Game.html.gz" (Join-Path $projectRoot 'desktop/Program.cs') $assemblyPath
if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar o aplicativo.' }

if ($CertificateThumbprint) {
    $certificate = Get-Item -LiteralPath "Cert:/CurrentUser/My/$CertificateThumbprint"
    if (-not $certificate.HasPrivateKey -or $certificate.NotAfter -le (Get-Date)) {
        throw 'O certificado precisa estar válido e ter chave privada.'
    }
    $signature = Set-AuthenticodeSignature -LiteralPath $outputPath -Certificate $certificate -HashAlgorithm SHA256
    if ($signature.Status -ne 'Valid') { throw "Assinatura inválida: $($signature.StatusMessage)" }
    Write-Host 'Executável assinado.'
} else {
    Write-Host 'Executável sem assinatura digital: as políticas do Windows ainda podem bloqueá-lo.'
}
Write-Host "Aplicativo: $outputPath"
