$adb = "C:\Users\lalwa\AppData\Local\Android\Sdk\platform-tools\adb.exe"

for ($step = 3; $step -le 8; $step++) {
    Write-Host "Tapping Continue for step $step..."
    & $adb shell input tap 805 2119
    Start-Sleep -Seconds 2
    $xml = & $adb shell uiautomator dump /sdcard/step.xml
    $content = & $adb shell cat /sdcard/step.xml
    & $adb shell screencap -p "/sdcard/atkin-step$step.png"
    & $adb pull "/sdcard/atkin-step$step.png" "release\screenshots\android-emulator-step$step.png"
}
