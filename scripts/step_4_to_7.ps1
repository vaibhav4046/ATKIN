$adb = "C:\Users\lalwa\AppData\Local\Android\Sdk\platform-tools\adb.exe"

# Step 4 -> 5
Write-Host "Tapping Step 4 -> 5..."
& $adb shell input tap 801 2124
Start-Sleep -Seconds 2
& $adb shell screencap -p /sdcard/s5.png
& $adb pull /sdcard/s5.png release\screenshots\android-step5.png

# Step 5 -> 6
Write-Host "Tapping Step 5 -> 6..."
& $adb shell input tap 801 2124
Start-Sleep -Seconds 2
& $adb shell screencap -p /sdcard/s6.png
& $adb pull /sdcard/s6.png release\screenshots\android-step6.png

# Step 6 -> 7
Write-Host "Tapping Step 6 -> 7..."
& $adb shell input tap 801 2124
Start-Sleep -Seconds 2
& $adb shell screencap -p /sdcard/s7.png
& $adb pull /sdcard/s7.png release\screenshots\android-step7.png

Write-Host "Stepping to 7 complete."
