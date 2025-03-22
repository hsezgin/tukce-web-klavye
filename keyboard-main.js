// Türkçe Web Klavyesi - Ana Modül
(function() {
    // Eklenti durum değişkenleri
    let keyboardEnabled = true; // Varsayılan olarak aktif

    // Ana modül işlevleri - Eski keyboard-core.js'den aktarıldı
    const keyboardCore = {
        // Eklenti durumunu kontrol et
        isEnabled: function() {
            return keyboardEnabled;
        },

        // Form elemanlarını izlemeye başla
        setupFormElementListeners: function() {
            if (window.keyboardInput) {
                window.keyboardInput.setupFormElementListeners();
            }
        },

        // Klavyeyi göster
        showKeyboard: function() {
            if (keyboardEnabled && window.keyboardDisplay) {
                try {
                    window.keyboardDisplay.showKeyboard();
                } catch (e) {
                    console.error('Klavye gösterilirken hata oluştu:', e);
                }
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
        // Tüm bağımlı modülleri yükle
        initializeModules: function() {
            // Modülleri ve gerekli metodlarını kontrol eden yardımcı fonksiyon
            function checkModule(moduleName, requiredMethods = []) {
                const module = window[moduleName];

                if (!module) {
                    console.error(`${moduleName} modülü bulunamadı!`);
                    return false;
                }

                // Eğer metot kontrolü gerekiyorsa
                if (requiredMethods.length > 0) {
                    for (const method of requiredMethods) {
                        if (typeof module[method] !== 'function') {
                            console.error(`${moduleName} modülünde ${method} metodu bulunamadı!`);
                            return false;
                        }
                    }
                }

                return true;
            }

            // Modülleri doğru sırayla kontrol et - bağımlılık sırasına göre

            // Önce temel modüller
            if (!checkModule('keyboardState', ['getState', 'setCurrentInput', 'resetModifierKeys'])) {
                return false;
            }

            if (!checkModule('turkishKeyboardCharMaps', ['getShiftChar', 'getAltGrChar'])) {
                return false;
            }

            // Ardından temel modüllere bağımlı olanlar
            if (!checkModule('keyboardHistory', ['setupInputChangeListener', 'handleControlZ'])) {
                return false;
            }

            if (!checkModule('keyboardInput', ['handleKeyPress', 'setupFormElementListeners'])) {
                return false;
            }

            // UI ve görüntüleme modülleri
            if (!checkModule('keyboardUI', ['createKeyboardElement', 'positionKeyboard'])) {
                return false;
            }

            if (!checkModule('keyboardDisplay', ['showKeyboard', 'hideKeyboard', 'updateKeyDisplay'])) {
                return false;
            }

            // Opsiyonel - varsa kontrol et
            if (!checkModule('keyboardEditMenu', ['createEditMenu', 'hideEditMenu'])) {
                return false;
            }

            if (!checkModule('keyboardDrag', ['makeDraggable'])) {
                return false;
            }

            if (!checkModule('keyboardDisplayText', ['updateInputText'])) {
                console.warn('keyboardDisplayText modülü yüklenemedi, başlıkta metin görüntüleme devre dışı kalacak.');
                // Bu modülü opsiyonel kabul edebiliriz, false döndürmeye gerek yok
            }

            console.log('Tüm modüller başarıyla yüklendi.');
            return true;
        }
    };

    // Ana modülü global alana aktar
    window.keyboardCore = keyboardCore;

    // Eklenti mesajlarını dinle
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.action === "enableKeyboard") {
                keyboardEnabled = true;
                // Eğer klavye halihazırda açıksa görünümü güncelle
                if (window.keyboardState && window.keyboardState.getState().keyboardElement) {
                    window.keyboardDisplay.updateKeyDisplay();
                }
                sendResponse({success: true});
            }
            else if (request.action === "disableKeyboard") {
                keyboardEnabled = false;
                // Eğer klavye açıksa gizle
                if (window.keyboardState && window.keyboardState.getState().isKeyboardVisible) {
                    window.keyboardDisplay.hideKeyboard();
                }
                sendResponse({success: true});
            }
            else if (request.action === "showKeyboard") {
                if (keyboardEnabled && window.keyboardState && window.keyboardState.getState().currentInput) {
                    window.keyboardDisplay.showKeyboard();
                    sendResponse({success: true});
                } else {
                    sendResponse({success: false, message: "Aktif bir form alanı bulunamadı."});
                }
            }
            return true; // Asenkron cevap için gerekli
        });
    }

    // Tüm event listenerları yönetmek için konteyner
    const eventListeners = [];
    
    // Güvenli event listener ekleme
    function addSafeEventListener(element, event, callback, options) {
        if (!element) {
            console.warn(`Event listener eklenirken null element hatası: ${event}`);
            return;
        }
        
        element.addEventListener(event, callback, options);
        eventListeners.push({ element, event, callback });
    }
    
    // Event listener temizleme
    function cleanupEventListeners() {
        eventListeners.forEach(({ element, event, callback }) => {
            try {
                if (element) {
                    element.removeEventListener(event, callback);
                }
            } catch (e) {
                console.warn(`Event listener temizlenirken hata: ${e.message}`);
            }
        });
        eventListeners.length = 0;
    }
    
    // Browser API işlemlerini güvenli kullanma
    function safelyExecute(operation, fallback) {
        try {
            return operation();
        } catch (e) {
            console.warn(`İşlem sırasında hata: ${e.message}`);
            if (typeof fallback === 'function') {
                return fallback();
            }
            return null;
        }
    }
    
    // Özel karakterleri yeniden ekleyen yardımcı fonksiyon
    function createShiftAndAltGrChars() {
        const charMaps = window.turkishKeyboardCharMaps || {};
        const keys = document.querySelectorAll('.keyboard-key');
        
        if (!keys || keys.length === 0) {
            console.warn('Klavye tuşları bulunamadı, özel karakterler eklenemedi');
            return;
        }

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
        if (!keyboardCore.initializeModules()) {
            console.error('Klavye modüllerinin bazıları yüklenemedi!');
            return;
        }

        // Eklenti durumunu kontrol et (eğer Chrome API'si mevcutsa)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(['keyboardEnabled'], function(result) {
                keyboardEnabled = result.keyboardEnabled !== undefined ? result.keyboardEnabled : true;

                // Eğer klavye etkinse, form elemanlarını dinlemeye başla
                if (keyboardEnabled) {
                    keyboardCore.setupFormElementListeners();
                }
            });
        } else {
            // Chrome API'si mevcut değilse (örneğin normal web sayfası olarak çalışıyorsa)
            keyboardCore.setupFormElementListeners();
        }

        // Google.com gibi zorlu sitelerde güvenilir çalışma için ek önlemler
        try {
            // İlk yükleme tamamlandıktan bir süre sonra form elemanlarını tekrar kontrol et
            setTimeout(function() {
                if (keyboardEnabled) {
                    keyboardCore.setupFormElementListeners();
                }
            }, 2000);

            // Sayfa URL'si değiştiğinde (SPA siteleri için)
            let lastURL = window.location.href;
            setInterval(function() {
                if (lastURL !== window.location.href) {
                    lastURL = window.location.href;
                    if (keyboardEnabled) {
                        setTimeout(function() {
                            keyboardCore.setupFormElementListeners();
                        }, 1000);
                    }
                }
            }, 1000);
        } catch (e) {
            console.warn("URL kontrol hatası:", e);
        }

        // DOM değişikliklerini izle
        try {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        // Yeni form elemanları eklenmiş olabilir, kontrol et
                        if (keyboardEnabled) {
                            keyboardCore.setupFormElementListeners();
                        }

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
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        } catch (e) {
            console.warn("MutationObserver hatası:", e);

            // MutationObserver çalışmazsa, belirli aralıklarla form elemanlarını kontrol et
            setInterval(function() {
                if (keyboardEnabled) {
                    keyboardCore.setupFormElementListeners();
                }
            }, 3000);
        }

        // Sayfada zaten var olan klavye elementini kontrol et
        const keyboardElement = document.querySelector('#turkish-web-keyboard');
        if (keyboardElement) {
            createShiftAndAltGrChars();
        }

        // Tarayıcı kesme işlemlerini engelle (klavye görünür olduğunda)
        addSafeEventListener(document, 'cut', function(e) {
            const state = keyboardCore.getState();
            if (state && state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });

        // Tarayıcı kopyalama işlemlerini engelle (klavye görünür olduğunda)
        addSafeEventListener(document, 'copy', function(e) {
            const state = keyboardCore.getState();
            if (state && state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });

        // Tarayıcı yapıştırma işlemlerini engelle (klavye görünür olduğunda)
        addSafeEventListener(document, 'paste', function(e) {
            const state = keyboardCore.getState();
            if (state && state.isKeyboardVisible && !e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        });
    }

    // Klavye gizlendiğinde event listenerları temizle
    const originalHideKeyboard = keyboardCore.hideKeyboard;
    keyboardCore.hideKeyboard = function() {
        if (window.keyboardDisplay) {
            window.keyboardDisplay.hideKeyboard();
            cleanupEventListeners();
        }
    };
    
    // Sayfa kapatıldığında temizlik yap
    addSafeEventListener(window, 'beforeunload', function() {
        cleanupEventListeners();
    });
    
    // Sayfa yüklendiğinde başlat
    if (document.readyState === 'loading') {
        addSafeEventListener(document, 'DOMContentLoaded', function() {
            safelyExecute(init);
        });
    } else {
        safelyExecute(init);
    }
})();