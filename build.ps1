# PowerShell 7 için Chrome Eklenti Paketleyici

try {
    # Çalışma dizinini al
    $scriptPath = $PWD.Path

    # manifest.json'ı oku
    $manifestPath = Join-Path -Path $scriptPath -ChildPath "manifest.json"
    $manifestContent = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json

    # Eklenti adı ve sürümü
    $version = $manifestContent.version
    $zipFileName = "ChromeExtension_v$version.zip"
    $zipFilePath = Join-Path -Path $scriptPath -ChildPath $zipFileName

    # Geçici klasör oluştur
    $tempDirName = "temp_extension"
    $tempFolderPath = Join-Path -Path $scriptPath -ChildPath $tempDirName

    # Eğer geçici klasör varsa önce sil
    if (Test-Path $tempFolderPath) {
        Remove-Item -Path $tempFolderPath -Recurse -Force
    }

    # Geçici klasör oluştur
    New-Item -ItemType Directory -Path $tempFolderPath | Out-Null

    Write-Host "Manifest.json dosyası okundu. Dosyalar kopyalanıyor..." -ForegroundColor Cyan

    # manifest.json'ı kopyala
    Copy-Item -Path $manifestPath -Destination $tempFolderPath

    # Popup HTML'i kopyala
    if ($manifestContent.action.default_popup) {
        $popupPath = Join-Path -Path $scriptPath -ChildPath $manifestContent.action.default_popup
        if (Test-Path $popupPath) {
            $targetPath = Join-Path -Path $tempFolderPath -ChildPath $manifestContent.action.default_popup
            $targetDir = Split-Path -Parent $targetPath
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            Copy-Item -Path $popupPath -Destination $targetPath
            Write-Host "Kopyalandı: $($manifestContent.action.default_popup)" -ForegroundColor Gray
        }
    }

    # Background worker'ı kopyala
    if ($manifestContent.background -and $manifestContent.background.service_worker) {
        $workerPath = Join-Path -Path $scriptPath -ChildPath $manifestContent.background.service_worker
        if (Test-Path $workerPath) {
            $targetPath = Join-Path -Path $tempFolderPath -ChildPath $manifestContent.background.service_worker
            $targetDir = Split-Path -Parent $targetPath
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            Copy-Item -Path $workerPath -Destination $targetPath
            Write-Host "Kopyalandı: $($manifestContent.background.service_worker)" -ForegroundColor Gray
        }
    }

    # Content script JS dosyalarını kopyala
    if ($manifestContent.content_scripts) {
        foreach ($contentScript in $manifestContent.content_scripts) {
            if ($contentScript.js) {
                foreach ($jsFile in $contentScript.js) {
                    $jsPath = Join-Path -Path $scriptPath -ChildPath $jsFile
                    if (Test-Path $jsPath) {
                        $targetPath = Join-Path -Path $tempFolderPath -ChildPath $jsFile
                        $targetDir = Split-Path -Parent $targetPath
                        if (-not (Test-Path $targetDir)) {
                            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                        }
                        Copy-Item -Path $jsPath -Destination $targetPath
                        Write-Host "Kopyalandı: $jsFile" -ForegroundColor Gray
                    }
                }
            }

            # Content script CSS dosyalarını kopyala
            if ($contentScript.css) {
                foreach ($cssFile in $contentScript.css) {
                    $cssPath = Join-Path -Path $scriptPath -ChildPath $cssFile
                    if (Test-Path $cssPath) {
                        $targetPath = Join-Path -Path $tempFolderPath -ChildPath $cssFile
                        $targetDir = Split-Path -Parent $targetPath
                        if (-not (Test-Path $targetDir)) {
                            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                        }
                        Copy-Item -Path $cssPath -Destination $targetPath
                        Write-Host "Kopyalandı: $cssFile" -ForegroundColor Gray
                    }
                }
            }
        }
    }

    # Icon dosyalarını kopyala
    if ($manifestContent.icons) {
        $iconProperties = $manifestContent.icons | Get-Member -MemberType NoteProperty
        foreach ($prop in $iconProperties) {
            $iconPath = Join-Path -Path $scriptPath -ChildPath $manifestContent.icons.($prop.Name)
            if (Test-Path $iconPath) {
                $targetPath = Join-Path -Path $tempFolderPath -ChildPath $manifestContent.icons.($prop.Name)
                $targetDir = Split-Path -Parent $targetPath
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                Copy-Item -Path $iconPath -Destination $targetPath
                Write-Host "Kopyalandı: $($manifestContent.icons.($prop.Name))" -ForegroundColor Gray
            }
        }
    }

    # ZIP oluştur (PowerShell 7 için uyumlu)
    Write-Host "Dosyalar kopyalandı. ZIP oluşturuluyor..." -ForegroundColor Cyan

    # Eğer ZIP dosyası varsa sil
    if (Test-Path $zipFilePath) {
        Remove-Item -Path $zipFilePath -Force
    }

    # PowerShell'in Compress-Archive cmdlet'ini kullan
    $compressParams = @{
        Path = "$tempFolderPath\*"
        DestinationPath = $zipFilePath
        CompressionLevel = "Optimal"
    }

    Compress-Archive @compressParams

    # Geçici klasörü temizle
    Remove-Item -Path $tempFolderPath -Recurse -Force

    # Başarı mesajı
    if (Test-Path $zipFilePath) {
        Write-Host "ZIP dosyası başarıyla oluşturuldu: $zipFilePath" -ForegroundColor Green
    } else {
        Write-Host "ZIP dosyası oluşturulamadı." -ForegroundColor Red
    }
} catch {
    Write-Host "İşlem sırasında hata oluştu: $_" -ForegroundColor Red

    # Geçici klasörü temizle
    if (Test-Path $tempFolderPath) {
        Remove-Item -Path $tempFolderPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}