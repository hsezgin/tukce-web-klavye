// Türkçe Web Klavyesi - Girdi İşlemleri Modülü
(function() {
    // Girdi işlemleri fonksiyonları
    const keyboardInput = {
        // Form elemanlarını izleme
        setupFormElementListeners: function() {
            const formElements = ['input[type="text"]', 'input[type="search"]', 'input[type="email"]', 'input[type="password"]', 'textarea'];

            formElements.forEach(selector => {
                const elements = document.querySelectorAll(selector);

                elements.forEach(element => {
                    if (!element.hasAttribute('data-turkish-keyboard-setup')) {
                        element.addEventListener('focus', this.onFocus.bind(this));
                        element.setAttribute('data-turkish-keyboard-setup', 'true');
                    }
                });
            });
        },

        // Focus olayı
        onFocus: function(e) {
            // Mevcut input alanını kaydet
            window.keyboardState.setCurrentInput(e.target);

            // Bu input için tarihçe izlemeyi kur
            window.keyboardHistory.setupInputChangeListener(e.target);

            // Klavyeyi göster
            window.keyboardDisplay.showKeyboard();

            // Input alanının eventlerini özelleştir
            if (e.target && !e.target.getAttribute('data-keyboard-events-set')) {
                // Bu alanın eventlerinin ayarlandığını işaretle
                e.target.setAttribute('data-keyboard-events-set', 'true');
            }
        },

        // Alternatif yapıştır yöntemi için yardımcı fonksiyon
        fallbackPaste: function(inputElement) {
            // Odağı emin olalım
            inputElement.focus();

            // Tarayıcının kendi yapıştırma komutunu kullanmayı dene
            try {
                // Eski yöntem - document.execCommand kullanımı
                const result = document.execCommand('paste');
                if (!result) {
                    // execCommand başarısız olduysa, kullanıcıyı bilgilendir
                    alert('Yapıştırma işlemi tarayıcı kısıtlamaları nedeniyle başarısız oldu. Lütfen Ctrl+V kullanın veya sağ tıklayıp "Yapıştır" seçeneğini kullanın.');
                }
            } catch (e) {
                console.error('Yapıştırma hatası:', e);
                alert('Yapıştırma işlemi tarayıcı kısıtlamaları nedeniyle başarısız oldu. Lütfen Ctrl+V kullanın veya sağ tıklayıp "Yapıştır" seçeneğini kullanın.');
            }
        },

        // Control+C işlemi
        handleCopy: function(inputElement) {
            try {
                document.execCommand('copy');
            } catch (e) {
                // Execommand başarısız olursa, modern API kullan
                const selectedText = inputElement.value.substring(
                    inputElement.selectionStart,
                    inputElement.selectionEnd
                );
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(selectedText);
                }
            }
            return true;
        },

        // Control+V işlemi
        handlePaste: function(inputElement) {
            try {
                // Modern tarayıcılar için Clipboard API kullanımı
                if (navigator.clipboard && navigator.clipboard.readText) {
                    navigator.clipboard.readText()
                        .then(text => {
                            if (text) {
                                // Metni seçili alana veya imleç konumuna yerleştir
                                const start = inputElement.selectionStart;
                                const end = inputElement.selectionEnd;
                                const value = inputElement.value;
                                inputElement.value = value.slice(0, start) + text + value.slice(end);
                                inputElement.selectionStart = inputElement.selectionEnd = start + text.length;

                                // Input olayını tetikle
                                const event = new Event('input', { bubbles: true });
                                inputElement.dispatchEvent(event);
                            }
                        })
                        .catch(err => {
                            console.error('Pano okuma hatası:', err);
                            this.fallbackPaste(inputElement);
                        });
                } else {
                    this.fallbackPaste(inputElement);
                }
            } catch (e) {
                this.fallbackPaste(inputElement);
            }
            return true;
        },

        // Control+X işlemi
        handleCut: function(inputElement) {
            try {
                document.execCommand('cut');
            } catch (e) {
                // Clipboard API ile manuel kes
                const selectedText = inputElement.value.substring(
                    inputElement.selectionStart,
                    inputElement.selectionEnd
                );
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(selectedText);
                }

                // Seçili metni sil
                const start = inputElement.selectionStart;
                const end = inputElement.selectionEnd;
                const value = inputElement.value;
                inputElement.value = value.slice(0, start) + value.slice(end);
                inputElement.selectionStart = inputElement.selectionEnd = start;

                // Input olayını tetikle
                const event = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(event);
            }
            return true;
        },

        // İmleç hareketlerini yönet
        handleCursorMovement: function(direction, inputElement) {
            const selStart = inputElement.selectionStart || 0;
            const selEnd = inputElement.selectionEnd || 0;
            const text = inputElement.value || '';

            switch (direction) {
                case 'left':
                    // İmleç konumunu sola taşı
                    if (selStart > 0) {
                        inputElement.selectionStart = inputElement.selectionEnd = selStart - 1;
                    }
                    break;

                case 'right':
                    // İmleç konumunu sağa taşı
                    if (selStart < text.length) {
                        inputElement.selectionStart = inputElement.selectionEnd = selStart + 1;
                    }
                    break;

                case 'up':
                    // İmleci yukarı taşı (satır başına gitmeye çalış)
                    // Mevcut satırın başlangıcını bul
                    let lineStart = text.lastIndexOf('\n', selStart - 1) + 1;
                    if (lineStart <= 0) lineStart = 0;

                    // Önceki satırın başlangıcını bul
                    let prevLineStart = text.lastIndexOf('\n', lineStart - 2) + 1;
                    if (prevLineStart < 0) prevLineStart = 0;

                    // Mevcut satırdaki konum
                    const columnPos = selStart - lineStart;

                    // Önceki satırdaki eşdeğer konumu hesapla (satır daha kısaysa sınırla)
                    const prevLineLength = lineStart - prevLineStart;
                    const newPos = prevLineStart + Math.min(columnPos, prevLineLength - 1);

                    inputElement.selectionStart = inputElement.selectionEnd = newPos;
                    break;

                case 'down':
                    // İmleci aşağı taşı (satır sonuna gitmeye çalış)
                    // Mevcut satırın başlangıcını bul
                    let lineStartDown = text.lastIndexOf('\n', selStart - 1) + 1;
                    if (lineStartDown < 0) lineStartDown = 0;

                    // Mevcut satırın sonunu bul
                    let lineEnd = text.indexOf('\n', selStart);
                    if (lineEnd < 0) lineEnd = text.length;

                    // Sonraki satırın başlangıcını bul
                    let nextLineStart = lineEnd + 1;
                    if (nextLineStart >= text.length) nextLineStart = text.length;

                    // Sonraki satırın sonunu bul
                    let nextLineEnd = text.indexOf('\n', nextLineStart);
                    if (nextLineEnd < 0) nextLineEnd = text.length;

                    // Mevcut satırdaki konum
                    const columnPosDown = selStart - lineStartDown;

                    // Sonraki satırdaki eşdeğer konumu hesapla (satır daha kısaysa sınırla)
                    const nextLineLength = nextLineEnd - nextLineStart;
                    const newPosDown = nextLineStart + Math.min(columnPosDown, nextLineLength);

                    inputElement.selectionStart = inputElement.selectionEnd = newPosDown;
                    break;
            }
        },

        // Özel tuş işlemleri
        handleSpecialKey: function(key, inputElement) {
            let selStart = inputElement.selectionStart || 0;
            let selEnd = inputElement.selectionEnd || 0;
            let text = inputElement.value || '';

            switch (key) {
                case 'Sil':
                    if (selStart === selEnd) {
                        if (selStart > 0) {
                            inputElement.value = text.slice(0, selStart - 1) + text.slice(selEnd);
                            inputElement.selectionStart = inputElement.selectionEnd = selStart - 1;
                        }
                    } else {
                        inputElement.value = text.slice(0, selStart) + text.slice(selEnd);
                        inputElement.selectionStart = inputElement.selectionEnd = selStart;
                    }
                    return true;

                case 'Tab':
                    // Tab için 4 boşluk ekle
                    text = text.slice(0, selStart) + '    ' + text.slice(selEnd);
                    inputElement.value = text;
                    inputElement.selectionStart = inputElement.selectionEnd = selStart + 4;
                    return true;

                case 'Enter':
                    // Enter tuşu için yeni satır ekle
                    text = text.slice(0, selStart) + '\n' + text.slice(selEnd);
                    inputElement.value = text;
                    inputElement.selectionStart = inputElement.selectionEnd = selStart + 1;
                    return true;

                case 'Boşluk':
                    // Boşluk ekle
                    text = text.slice(0, selStart) + ' ' + text.slice(selEnd);
                    inputElement.value = text;
                    inputElement.selectionStart = inputElement.selectionEnd = selStart + 1;
                    return true;

                case 'Kapat':
                    window.keyboardDisplay.hideKeyboard();
                    return true;

                case 'HepsiniSec':
                    if (window.keyboardEditMenu && window.keyboardEditMenu.toggleEditMenu) {
                        window.keyboardEditMenu.toggleEditMenu();
                    }
                    return true;
            }

            return false;
        },

        // Tuş basma olayını işle
        handleKeyPress: function(key) {
            const state = window.keyboardState.getState();
            const inputElement = state.currentInput;

            if (!inputElement) return;

            // Input alanını aktif et - mevcut odağı koruyarak
            inputElement.focus();

            // Özel tuşları işle
            if (this.handleSpecialKey(key, inputElement)) {
                this.triggerInputEvent(inputElement);
                return;
            }

            // Modifier tuşları işle
            if (key === 'Shift') {
                // Diğer modifier tuşları devre dışı bırak
                const state = window.keyboardState.getState();
                if (state.isAltGrActive) {
                    window.keyboardState.toggleAltGrActive(); // Kapat
                }
                if (state.isControlActive) {
                    window.keyboardState.toggleControlActive(); // Kapat
                }
                window.keyboardState.toggleShiftActive();
                window.keyboardDisplay.updateKeyDisplay();
                return;
            }

            if (key === 'Caps') {
                window.keyboardState.toggleCapsActive();
                window.keyboardDisplay.updateKeyDisplay();
                return;
            }

            if (key === 'AltGr') {
                window.keyboardState.toggleAltGrActive();
                window.keyboardDisplay.updateKeyDisplay();
                return;
            }

            if (key === 'Control') {
                window.keyboardState.toggleControlActive();
                window.keyboardDisplay.updateKeyDisplay();
                return;
            }

            // Ok tuşları
            if (key === 'ArrowLeft') {
                this.handleCursorMovement('left', inputElement);
                return;
            }

            if (key === 'ArrowRight') {
                this.handleCursorMovement('right', inputElement);
                return;
            }

            if (key === 'ArrowUp') {
                this.handleCursorMovement('up', inputElement);
                return;
            }

            if (key === 'ArrowDown') {
                this.handleCursorMovement('down', inputElement);
                return;
            }

            // Normal karakterleri işle
            let charToInsert = key;
            const charMaps = window.turkishKeyboardCharMaps || {};

            // Control tuşu aktifken
            if (state.isControlActive) {
                // Control tuşu ile özel kombinasyonlar
                switch (key) {
                    case 'a': // Control+A: Tümünü seç
                        inputElement.select();
                        window.keyboardState.toggleControlActive(); // Kullanıldıktan sonra devre dışı bırak
                        window.keyboardDisplay.updateKeyDisplay();
                        return;

                    case 'c': // Control+C: Kopyala
                        this.handleCopy(inputElement);
                        window.keyboardState.toggleControlActive();
                        window.keyboardDisplay.updateKeyDisplay();
                        return;

                    case 'v': // Control+V: Yapıştır
                        this.handlePaste(inputElement);
                        window.keyboardState.toggleControlActive();
                        window.keyboardDisplay.updateKeyDisplay();
                        return;

                    case 'x': // Control+X: Kes
                        this.handleCut(inputElement);
                        window.keyboardState.toggleControlActive();
                        window.keyboardDisplay.updateKeyDisplay();
                        return;

                    case 'z': // Control+Z: Geri Al
                        window.keyboardHistory.handleControlZ(inputElement);
                        window.keyboardState.toggleControlActive();
                        window.keyboardDisplay.updateKeyDisplay();
                        return;

                    case 'y': // Control+Y: İleri Al
                        window.keyboardHistory.handleControlY(inputElement);
                        window.keyboardState.toggleControlActive();
                        window.keyboardDisplay.updateKeyDisplay();
                        return;
                }

                // Diğer Control kombinasyonları için varsayılan davranış
                window.keyboardState.toggleControlActive();
                window.keyboardDisplay.updateKeyDisplay();
            }
            // AltGr aktifken tüm karakterleri kontrol et
            else if (state.isAltGrActive) {
                const altGrChar = charMaps.getAltGrChar(key);
                if (altGrChar) {
                    charToInsert = altGrChar;
                }

                // AltGr kullanıldığında devre dışı bırak
                window.keyboardState.toggleAltGrActive();
                window.keyboardDisplay.updateKeyDisplay();
            }
            // Shift aktifken
            else if (state.isShiftActive) {
                if ('1234567890*-,.'.includes(key)) {
                    const shiftChar = charMaps.getShiftChar(key);
                    if (shiftChar) {
                        charToInsert = shiftChar;
                    }
                } else if (key.match(/[a-zçğıöşü]/i)) {
                    // Shift + Harf durumu: Caps Lock aktifse küçük, değilse büyük yaz
                    if (state.isCapsActive) {
                        // Caps Lock açıkken Shift'e basılırsa küçük harf yaz
                        charToInsert = key.toLowerCase();
                    } else {
                        // Caps Lock kapalıyken Shift'e basılırsa büyük harf yaz
                        charToInsert = key.toUpperCase();
                    }
                }

                // Shift kullanıldığında devre dışı bırak
                window.keyboardState.toggleShiftActive();
                window.keyboardDisplay.updateKeyDisplay();
            }
            // Caps Lock aktifken harfler
            else if (state.isCapsActive && key.match(/[a-zçğıöşü]/i)) {
                // Caps Lock açıkken harfler her zaman büyük
                charToInsert = key.toUpperCase();
            }

            // Metni doğrudan manipüle et
            const selStart = inputElement.selectionStart || 0;
            const selEnd = inputElement.selectionEnd || 0;
            const text = inputElement.value || '';

            inputElement.value = text.slice(0, selStart) + charToInsert + text.slice(selEnd);
            inputElement.selectionStart = inputElement.selectionEnd = selStart + charToInsert.length;

            // Input olayını tetikle
            this.triggerInputEvent(inputElement);

            // Saniyenin küçük bir kısmı kadar bekleyip input alanını yeniden odakla
            setTimeout(function() {
                if (inputElement) {
                    inputElement.focus();
                }
            }, 10);
        },

        // Input olayını tetikle
        triggerInputEvent: function(inputElement) {
            try {
                const event = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(event);
            } catch (e) {
                // Eski tarayıcılar için alternatif
                if (typeof document.createEvent === 'function') {
                    const event = document.createEvent('HTMLEvents');
                    event.initEvent('input', true, false);
                    inputElement.dispatchEvent(event);
                }
            }
        }
    };

    // Girdi işlemleri modülünü global alana aktar
    window.keyboardInput = keyboardInput;
})();