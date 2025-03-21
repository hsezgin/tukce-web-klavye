// Arka plan işlemleri için
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // İlk kurulumda varsayılan ayarları belirle
        chrome.storage.sync.set({
            keyboardEnabled: true, // Varsayılan olarak aktif
            showOnFocus: true,     // Form alanları odaklandığında otomatik göster
            autoHide: true         // Odak kaybedildiğinde otomatik gizle
        });
    }
});

// İstemcilerden gelen mesajları dinle
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Burada ileride gerekebilecek işlemler eklenebilir
    if (request.action === "getStatus") {
        chrome.storage.sync.get(['keyboardEnabled'], function(result) {
            sendResponse({ enabled: result.keyboardEnabled !== undefined ? result.keyboardEnabled : true });
        });
        return true; // asenkron yanıt için gerekli
    }
});