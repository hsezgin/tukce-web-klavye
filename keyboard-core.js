// Türkçe Web Klavyesi - Ana İşlem Modülü
(function() {
    // Ana modül işlevleri
    const keyboardCore = {
        // Form elemanlarını izlemeye başla
        setupFormElementListeners: function() {
            if (window.keyboardInput) {
                window.keyboardInput.setupFormElementListeners();
            }
        },

        // Klavyeyi göster
        showKeyboard: function() {
            if (window.keyboardDisplay) {
                window.keyboardDisplay.showKeyboard();
            }
        },

        // Klavyeyi gizle
        hideKeyboard: function() {
            if (window.keyboardDisplay) {
                window.keyboardDisplay.hideKeyboard();
            }
        },

        // Tuşların görünümünü güncelle
        updateKeyDisplay: function() {
            document.querySelectorAll('.keyboard-key:not(.keyboard-special-key)').forEach(key => {
                    let keyValue = key.getAttribute("data-key");

                    if (!keyValue) return;

                    const state = window.keyboardState.getState();
                    let newKeyValue = keyValue;

                // CAPS LOCK veya SHIFT aktifse büyük harfe çevir
                if ((state.isCapsActive && !state.isShiftActive) || (!state.isCapsActive && state.isShiftActive)) {
                    // Türkçe karakterler için özel dönüşüm
                    if (keyValue === "i") {
                        newKeyValue = "İ";
                    } else if (keyValue === "ı") {
                        newKeyValue = "I";
                    } else {
                        // Diğer harfler için standart büyütme
                        newKeyValue = keyValue.toUpperCase();
                    }
                }
                // Her ikisi de aktif veya ikisi de pasifse küçük harfe çevir
                else {
                    // Türkçe karakterler için özel dönüşüm
                    if (keyValue === "İ") {
                        newKeyValue = "i";
                    } else if (keyValue === "I") {
                        newKeyValue = "ı";
                    } else {
                        // Diğer harfler için standart küçültme
                        newKeyValue = keyValue.toLowerCase();
                    }
                }


                key.textContent = newKeyValue; // Çift harf hatasını önlemek için doğrudan değiştir
            });
        },

        // Klavyeyi oluştur
        createKeyboard: function() {
            if (window.keyboardDisplay) {
                return window.keyboardDisplay.createKeyboard();
            }
            return null;
        },

        // Tuş basma olayını işle
        handleKeyPress: function(key) {
            if (window.keyboardInput) {
                window.keyboardInput.handleKeyPress(key);
            }
        },

        // Durum bilgisini getir
        getState: function() {
            if (window.keyboardState) {
                return window.keyboardState.getState();
            }
            return {};
        },

        // Tüm bağımlı modülleri yükle
        initializeModules: function() {
            // Modüllerin doğru sırayla yüklenip yüklenmediğini kontrol et
            if (!window.keyboardState) {
                console.error('keyboard-state.js modülü yüklenemedi!');
                return false;
            }

            if (!window.keyboardHistory) {
                console.error('keyboard-history.js modülü yüklenemedi!');
                return false;
            }

            if (!window.keyboardDisplay) {
                console.error('keyboard-display.js modülü yüklenemedi!');
                return false;
            }

            if (!window.keyboardInput) {
                console.error('keyboard-input.js modülü yüklenemedi!');
                return false;
            }

            if (!window.keyboardUI) {
                console.error('keyboard-ui.js modülü yüklenemedi!');
                return false;
            }

            return true;
        }
    };

    // Ana modülü global alana aktar
    window.keyboardCore = keyboardCore;
})();