// Popup için gerekli işlevsellik
document.addEventListener('DOMContentLoaded', function() {
    // Anahtar elementleri seç
    const toggleSwitch = document.getElementById('keyboard-toggle');
    const statusDiv = document.getElementById('status');
    const showKeyboardButton = document.getElementById('show-keyboard');

    // Mevcut klavye durumunu al ve kullanıcı arayüzünü güncelle
    chrome.storage.sync.get(['keyboardEnabled'], function(result) {
        // Varsayılan olarak etkin (undefined ise)
        const enabled = result.keyboardEnabled !== undefined ? result.keyboardEnabled : true;
        toggleSwitch.checked = enabled;
        updateStatusUI(enabled);
    });

    // Anahtar durumu değiştiğinde
    toggleSwitch.addEventListener('change', function() {
        const enabled = toggleSwitch.checked;

        // Durumu kaydet
        chrome.storage.sync.set({keyboardEnabled: enabled}, function() {
            updateStatusUI(enabled);

            // Tüm aktif sekmelere durumu bildir
            sendStatusToTabs(enabled);
        });
    });

    // "Klavyeyi Göster" düğmesine tıklandığında
    showKeyboardButton.addEventListener('click', function() {
        // Aktif sekmedeki içerik scriptine mesaj gönder
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "showKeyboard"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Mesaj gönderiminde hata:", chrome.runtime.lastError);
                    return;
                }

                // Popup'ı kapat
                window.close();
            });
        });
    });

    // UI güncellemesi için yardımcı fonksiyon
    function updateStatusUI(enabled) {
        if (enabled) {
            statusDiv.textContent = "Klavye Aktif";
            statusDiv.classList.add("active");
            showKeyboardButton.disabled = false;
        } else {
            statusDiv.textContent = "Klavye Devre Dışı";
            statusDiv.classList.remove("active");
            showKeyboardButton.disabled = true;
        }
    }

    // Tüm sekmelere mesaj gönderme
    function sendStatusToTabs(enabled) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                chrome.tabs.sendMessage(tab.id, {
                    action: enabled ? "enableKeyboard" : "disableKeyboard"
                }, function(response) {
                    // Hataları engelle - bazı sekmelerde content script olmayabilir
                    if (chrome.runtime.lastError) {
                        console.log("Sekme iletişiminde hata (beklenen):", chrome.runtime.lastError);
                    }
                });
            });
        });
    }
});