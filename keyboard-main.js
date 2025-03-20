// Türkçe Web Klavyesi - Ana Başlatma Dosyası
(function() {
    // Özel karakterleri yeniden ekleyen yardımcı fonksiyon
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

    // Başlatma fonksiyonu
    function init() {
        // Modüllerin doğru yüklendiğinden emin ol
        if (!window.keyboardCore.initializeModules()) {
            console.error('Klavye modüllerinin bazıları yüklenemedi!');
            return;
        }

        // Form elemanlarını dinlemeye başla
        window.keyboardInput.setupFormElementListeners()

        // DOM değişikliklerini izle
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Yeni form elemanları eklenmiş olabilir, kontrol et
                    window.keyboardCore.setupFormElementListeners();

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
            const state = window.keyboardState.getState();
            if (state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });

        // Tarayıcı kopyalama işlemlerini engelle (klavye görünür olduğunda)
        document.addEventListener('copy', function(e) {
            const state = window.keyboardState.getState();
            if (state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });

        // Tarayıcı yapıştırma işlemlerini engelle (klavye görünür olduğunda)
        document.addEventListener('paste', function(e) {
            const state = window.keyboardState.getState();
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