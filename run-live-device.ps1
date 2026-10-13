# Setup Android SDK platform-tools and ANDROID_HOME
if (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
}
$env:Path += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"

# Setup JAVA_HOME from Android Studio if not present
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Android\Android Studio\jbr") {
        $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
        $env:Path = "$env:JAVA_HOME\bin;" + $env:Path
    }
}

# 1. Clean up capacitor.config.ts to avoid TS CommonJS loader error
if (Test-Path "capacitor.config.ts") {
    Remove-Item "capacitor.config.ts" -Force
}

# Clean up any duplicate PNGs in mipmap-anydpi-v26
if (Test-Path "android\app\src\main\res\mipmap-anydpi-v26") {
    Remove-Item "android\app\src\main\res\mipmap-anydpi-v26\*.png" -Force -ErrorAction SilentlyContinue
}

# Ensure capacitor.config.json exists
if (-not (Test-Path "capacitor.config.json")) {
    Set-Content -Path "capacitor.config.json" -Value '{
  "appId": "com.colorclash.game",
  "appName": "Color Clash",
  "webDir": "dist"
}'
}

# 2. Verify adb is available
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    Write-Error "ADB could not be found. Please ensure Android SDK platform-tools are installed."
    exit 1
}

Write-Host "==> Checking connected devices..." -ForegroundColor Cyan
adb devices

# 3. Build web assets
Write-Host "==> Building web assets..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm run build failed!"
    exit 1
}

# 4. Add Android platform if not created yet
if (-not (Test-Path "android")) {
    Write-Host "==> Adding Android platform..." -ForegroundColor Cyan
    npx cap add android
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to add Android platform. Please check the error above."
        exit 1
    }
}

# 5. Sync web build to Android project
Write-Host "==> Syncing web assets to Android..." -ForegroundColor Cyan
npx cap sync android

# 6. Run directly on device
Write-Host "==> Building APK and launching on device..." -ForegroundColor Cyan
npx cap run android
