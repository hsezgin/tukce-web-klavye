// Türkçe Web Klavyesi - Ana Modül
(function() {
    // Ana modül işlevleri - Eski keyboard-core.js'den aktarıldı
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

    // Özel karakterleri yeniden ekleyen yardımcı fonksiyon - Eski keyboard-main.js'den
    function createShiftAndAltGrChars() {
        const charMaps = window.turkishKeyboardCharMaps || {};
        const keys = document.querySelectorAll('.keyboard-key');

        keys.forEach(key => {
            const keyText = key.getAttribute('data-key');
            if (!keyText || keyText.length !== 1) return;

            // Shift karakterlerini ekle
            if ('1234567890*-,.'.includes(keyText)) {
                const shiftChar = charMaps.getShiftChar(keyText);
                if (shiftChar && !key.querySelector('.key-shift-char')) {
                    // Data attribute ekle (CSS ile görünüm için)
                    key.setAttribute('data-shift-char', shiftChar);

                    // Küçük karakter span'ı ekle (normal görünüm için)
                    const shiftCharSpan = document.createElement('span');
                    shiftCharSpan.className = 'key-shift-char';
                    shiftCharSpan.textContent = shiftChar;
                    key.appendChild(shiftCharSpan);
                }
            }

            // AltGr karakterlerini ekle - tüm tuşlar için
            const altGrChar = charMaps.getAltGrChar(keyText);
            if (altGrChar && !key.querySelector('.key-altgr-char')) {
                // Data attribute ekle (CSS ile görünüm için)
                key.setAttribute('data-altgr-char', altGrChar);

                // Küçük karakter span'ı ekle (normal görünüm için)
                const altGrCharSpan = document.createElement('span');
                altGrCharSpan.className = 'key-altgr-char';
                altGrCharSpan.textContent = altGrChar;
                key.appendChild(altGrCharSpan);
            }
        });
    }

    // Global erişim için bu fonksiyonu dışa aktar
    window.createShiftAndAltGrChars = createShiftAndAltGrChars;

    // Başlatma fonksiyonu - Eski keyboard-main.js'den
    function init() {
        // Modüllerin doğru yüklendiğinden emin ol
        if (!keyboardCore.initializeModules()) {
            console.error('Klavye modüllerinin bazıları yüklenemedi!');
            return;
        }

        // Form elemanlarını dinlemeye başla
        keyboardCore.setupFormElementListeners();

        // DOM değişikliklerini izle
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Yeni form elemanları eklenmiş olabilir, kontrol et
                    keyboardCore.setupFormElementListeners();

                    // Klavye DOM'a eklendiğinde, karakterleri ekle
                    const keyboardElement = document.querySelector('#turkish-web-keyboard');
                    if (keyboardElement) {
                        setTimeout(function() {
                            createShiftAndAltGrChars();
                        }, 100);
                    }
                }
            });
        });

        // Tüm DOM değişikliklerini izle
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Sayfada zaten var olan klavye elementini kontrol et
        const keyboardElement = document.querySelector('#turkish-web-keyboard');
        if (keyboardElement) {
            createShiftAndAltGrChars();
        }

        // Tarayıcı kesme işlemlerini engelle (klavye görünür olduğunda)
        document.addEventListener('cut', function(e) {
            const state = keyboardCore.getState();
            if (state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });

        // Tarayıcı kopyalama işlemlerini engelle (klavye görünür olduğunda)
        document.addEventListener('copy', function(e) {
            const state = keyboardCore.getState();
            if (state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });

        // Tarayıcı yapıştırma işlemlerini engelle (klavye görünür olduğunda)
        document.addEventListener('paste', function(e) {
            const state = keyboardCore.getState();
            if (state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });
    }

    // Sayfa yüklendiğinde başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
        });
    } else {
        init();
    }
})();