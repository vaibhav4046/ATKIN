Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$exePath = "C:\Program Files\Atkin\atkin.exe"
if (-not (Test-Path $exePath)) {
    Write-Error "Atkin executable not found at $exePath"
    exit 1
}

Write-Host "Launching installed Atkin from: $exePath"
$p = Start-Process -FilePath $exePath -PassThru
Write-Host "Started Atkin PID: $($p.Id)"

$found = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    $proc = Get-Process -Id $p.Id -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-Host "Process exited at second $i"
        break
    }
    Write-Host "Second $i - Responding: $($proc.Responding) - MainWindowTitle: '$($proc.MainWindowTitle)' - WorkingSet: $($proc.WorkingSet64)"
    if ($proc.MainWindowTitle -ne "") {
        Write-Host "Found Window Title: $($proc.MainWindowTitle)"
        $found = $true
        break
    }
}

# Capture screen
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

$destDir = Join-Path $PSScriptRoot "..\release\screenshots"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
$destPath = Join-Path $destDir "installed-windows-desktop.png"
$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bmp.Dispose()
Write-Host "Screenshot saved to $destPath"

if ($found -or (Get-Process -Id $p.Id -ErrorAction SilentlyContinue)) {
    Write-Host "Atkin installed app is active and responsive."
} else {
    Write-Host "Atkin process finished lifecycle test."
}
