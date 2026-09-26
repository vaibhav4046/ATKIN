$adb = "C:\Users\lalwa\AppData\Local\Android\Sdk\platform-tools\adb.exe"

Write-Host "=== PACKAGE LISTING ==="
& $adb shell pm list packages | Select-String "atkin"

Write-Host "=== LAUNCHING ACTIVITY ==="
& $adb shell am start -n com.atkin.legal/.MainActivity

Start-Sleep -Seconds 5

Write-Host "=== CAPTURING EMULATOR SCREENSHOT ==="
& $adb shell screencap -p /sdcard/atkin-launch.png
& $adb pull /sdcard/atkin-launch.png release\screenshots\android-emulator-launch.png

Write-Host "=== RUNNING PROCESSES FOR ATKIN ==="
& $adb shell ps -A | Select-String "com.atkin.legal"

Write-Host "=== LOGCAT STARTUP EXCERPT ==="
& $adb logcat -d -s ActivityTaskManager,Tauri,com.atkin.legal,AndroidRuntime | Select-Object -Last 40
