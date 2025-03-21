// Türkçe Web Klavyesi - Girdi İşlemleri Modülü
(function() {
    // Input türünün selection işlemlerini destekleyip desteklemediğini kontrol et
    function supportsSelection(inputElement) {
        if (!inputElement) return false;

        // Selection API'sini desteklemeyen input türleri
        const nonSelectableTypes = ['date', 'datetime', 'datetime-local', 'month', 'week', 'time', 'color', 'range', 'file', 'hidden'];

        // Input etiketi değilse veya desteklenmeyen bir türse, false döndür
        if (inputElement.tagName !== 'INPUT' && inputElement.tagName !== 'TEXTAREA') {
            return true; // Etiket INPUT veya TEXTAREA değilse (örn. contenteditable div), desteklediğini varsay
        }

        if (nonSelectableTypes.includes(inputElement.type)) {
            return false;
        }

        // Email türü için tarayıcı testi yap
        if (inputElement.type === 'email') {
            try {
                // Test et - atama yapıp hata verip vermediğine bak
                const currentStart = inputElement.selectionStart;
                inputElement.selectionStart = currentStart;
                return true; // Hata vermedi, destekliyor
            } catch (e) {
                return false; // Hata verdi, desteklemiyor
            }
        }

        return true; // Diğer türler (text, search, tel, url, password) genelde destekler
    }

    // Selection işlemini güvenli bir şekilde uygula
    function safelySetSelection(inputElement, startPos, endPos) {
        if (!inputElement) return false;

        // İnput üzerinde selection API'sini kullanabilir miyiz kontrol et
        if (supportsSelection(inputElement)) {
            try {
                inputElement.selectionStart = startPos;
                inputElement.selectionEnd = endPos || startPos;
                return true;
            } catch (e) {
                console.warn('Selection API hatası:', e);
                return false;
            }
        }
        return false;
    }

    // Selection değerlerini güvenli bir şekilde oku
    function safelyGetSelection(inputElement) {
        if (!inputElement) return { start: 0, end: 0 };

        if (supportsSelection(inputElement)) {
            try {
                return {
                    start: inputElement.selectionStart || 0,
                    end: inputElement.selectionEnd || 0
                };
            } catch (e) {
                console.warn('Selection API okuma hatası:', e);
                return { start: 0, end: 0 };
            }
        }
        return { start: 0, end: 0 };
    }

    // Girdi işlemleri fonksiyonları
    // Girdi işlemleri modülünü global alana aktar
    window.keyboardInput = {
        // Form elemanlarını izleme
        setupFormElementListeners: function () {
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
        onFocus: function (e) {
            // Mevcut input alanını kaydet
            window.keyboardState.setCurrentInput(e.target);

            // Bu input için tarihçe izlemeyi kur
            window.keyboardHistory.setupInputChangeListener(e.target);

            // Klavyeyi göster
            window.keyboardDisplay.showKeyboard();

            // Bu satırı ekleyin - Input metni hemen göster
            if (window.keyboardDisplayText) {
                window.keyboardDisplayText.updateInputText(e.target);
            }

            // Input alanının eventlerini özelleştir
            if (e.target && !e.target.getAttribute('data-keyboard-events-set')) {
                // Bu alanın eventlerinin ayarlandığını işaretle
                e.target.setAttribute('data-keyboard-events-set', 'true');
            }
        },

        // Alternatif yapıştır yöntemi için yardımcı fonksiyon
        fallbackPaste: function (inputElement) {
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
        handleCopy: function (inputElement) {
            if (!supportsSelection(inputElement)) {
                console.warn("Bu alan kopyalama işlemini desteklemiyor");
                return false;
            }

            try {
                document.execCommand('copy');
            } catch (e) {
                // Execommand başarısız olursa, modern API kullan
                const selection = safelyGetSelection(inputElement);
                const selectedText = inputElement.value.substring(
                    selection.start,
                    selection.end
                );
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(selectedText);
                }
            }
            return true;
        },

        // Control+V işlemi
        handlePaste: function (inputElement) {
            try {
                // Modern tarayıcılar için Clipboard API kullanımı
                if (navigator.clipboard && navigator.clipboard.readText) {
                    navigator.clipboard.readText()
                        .then(text => {
                            if (text) {
                                // Metni seçili alana veya imleç konumuna yerleştir
                                const selection = safelyGetSelection(inputElement);
                                const start = selection.start;
                                const end = selection.end;
                                const value = inputElement.value;
                                inputElement.value = value.slice(0, start) + text + value.slice(end);

                                // Eğer selection API destekleniyorsa cursor pozisyonunu ayarla
                                safelySetSelection(inputElement, start + text.length, start + text.length);

                                // Input olayını tetikle
                                const event = new Event('input', {bubbles: true});
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
        handleCut: function (inputElement) {
            if (!supportsSelection(inputElement)) {
                console.warn("Bu alan kesme işlemini desteklemiyor");
                return false;
            }

            try {
                document.execCommand('cut');
            } catch (e) {
                // Clipboard API ile manuel kes
                const selection = safelyGetSelection(inputElement);
                const selectedText = inputElement.value.substring(
                    selection.start,
                    selection.end
                );
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(selectedText);
                }

                // Seçili metni sil
                const start = selection.start;
                const end = selection.end;
                const value = inputElement.value;
                inputElement.value = value.slice(0, start) + value.slice(end);
                safelySetSelection(inputElement, start, start);

                // Input olayını tetikle
                const event = new Event('input', {bubbles: true});
                inputElement.dispatchEvent(event);
            }
            return true;
        },

        // İmleç hareketlerini yönet
        handleCursorMovement: function (direction, inputElement) {
            // Selection API desteği yoksa işlemi atla
            if (!supportsSelection(inputElement)) return;

            const selection = safelyGetSelection(inputElement);
            const selStart = selection.start;
            const selEnd = selection.end;
            const text = inputElement.value || '';

            switch (direction) {
                case 'left':
                    // İmleç konumunu sola taşı
                    if (selStart > 0) {
                        safelySetSelection(inputElement, selStart - 1, selStart - 1);
                    }
                    break;

                case 'right':
                    // İmleç konumunu sağa taşı
                    if (selStart < text.length) {
                        safelySetSelection(inputElement, selStart + 1, selStart + 1);
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

                    safelySetSelection(inputElement, newPos, newPos);
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

                    safelySetSelection(inputElement, newPosDown, newPosDown);
                    break;
            }
        },

        uzunBasmaAyarla: function (element, islemFonksiyonu) {
            // Temizleme fonksiyonu
            function temizle() {
                clearTimeout(element.longPressTimer);
                clearInterval(element.silInterval);
                element.longPressTimer = null;
                element.silInterval = null;
                element.uzunBasmaAktif = false;
            }

            // Başlangıçta temizle
            temizle();

            // Mouse işleyicileri
            element.onmousedown = function (e) {
                // İlk basıldığında işlemi bir kez çalıştır
                islemFonksiyonu();

                // Uzun basma algılamayı başlat
                element.longPressTimer = setTimeout(() => {
                    element.uzunBasmaAktif = true;
                    // Hızlı tekrar için interval başlat
                    element.silInterval = setInterval(() => {
                        if (islemFonksiyonu() === false) {
                            // İşlem false döndürürse durdur
                            temizle();
                        }
                    }, 50); // Hızlı tekrarlama (50ms aralıkla)
                }, 500); // 500ms sonra hızlı işlemi başlat

                e.preventDefault();
                e.stopPropagation();
            };

            element.onmouseup = function (e) {
                temizle();
                e.preventDefault();
                e.stopPropagation();
            };

            element.onmouseleave = function (e) {
                if (element.uzunBasmaAktif) {
                    temizle();
                }
                e.preventDefault();
                e.stopPropagation();
            };

            // Dokunmatik ekran desteği
            element.ontouchstart = function (e) {
                // İlk basıldığında işlemi bir kez çalıştır
                islemFonksiyonu();

                // Uzun basma algılamayı başlat
                element.longPressTimer = setTimeout(() => {
                    element.uzunBasmaAktif = true;
                    // Hızlı tekrar için interval başlat
                    element.silInterval = setInterval(() => {
                        if (islemFonksiyonu() === false) {
                            // İşlem false döndürürse durdur
                            temizle();
                        }
                    }, 50); // Hızlı tekrarlama (50ms aralıkla)
                }, 500); // 500ms sonra hızlı işlemi başlat

                e.preventDefault();
            };

            element.ontouchend = function (e) {
                temizle();
                e.preventDefault();
            };
        },


        // Özel tuş işlemleri
        handleSpecialKey: function (key, inputElement) {
            const selection = safelyGetSelection(inputElement);
            const selStart = selection.start;
            const selEnd = selection.end;
            let text = inputElement.value || '';
            const form = inputElement.closest('form');

            switch (key) {
                case 'Sil':

                    // Silme işlevi
                function silmeIslemi() {
                    const text = inputElement.value;
                    const selStart = inputElement.selectionStart;
                    const selEnd = inputElement.selectionEnd;

                    if (selStart === selEnd) {
                        if (selStart > 0) {
                            inputElement.value = text.slice(0, selStart - 1) + text.slice(selEnd);
                            inputElement.selectionStart = inputElement.selectionEnd = selStart - 1;
                        } else {
                            return false; // Silinecek karakter kalmadı
                        }
                    } else {
                        inputElement.value = text.slice(0, selStart) + text.slice(selEnd);
                        inputElement.selectionStart = inputElement.selectionEnd = selStart;
                    }

                    // Input olayını tetikle
                    const event = new Event('input', {bubbles: true});
                    inputElement.dispatchEvent(event);

                    return true;
                }

                    // İlk silme işlemini yap
                    silmeIslemi();

                    // Uzun basma özelliğini ekle
                    this.uzunBasmaAyarla(event.currentTarget, silmeIslemi);
                    return true;


                case 'Tab':
                    // Shift tuşu basılıysa bir önceki forma git
                    const state = window.keyboardState.getState();
                    const isShiftActive = state.isShiftActive;

                    // Formdaki tüm input, select ve textarea elemanlarını bul

                    if (form) {
                        const focusableElements = form.querySelectorAll('input, select, textarea, button');
                        const focusableArray = Array.from(focusableElements)
                            .filter(el => el.offsetParent !== null); // Görünür elemanları filtrele

                        const currentIndex = focusableArray.indexOf(inputElement);

                        // Bir sonraki veya bir önceki elemana geç
                        let nextIndex;
                        if (isShiftActive) {
                            // Shift + Tab: Bir önceki elemana git
                            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableArray.length - 1;
                        } else {
                            // Normal Tab: Bir sonraki elemana git
                            nextIndex = (currentIndex + 1) % focusableArray.length;
                        }

                        // Sonraki veya önceki elemana odaklan
                        const nextElement = focusableArray[nextIndex];
                        if (nextElement) {
                            nextElement.focus();
                            // Eğer input alanıysa tüm metni seç
                            if (nextElement.select) {
                                nextElement.select();
                            }
                            return true;
                        }
                    }

                    // Form yoksa veya özel bir durum varsa varsayılan Tab davranışı
                    text = text.slice(0, selStart) + '    ' + text.slice(selEnd);
                    inputElement.value = text;
                    inputElement.selectionStart = inputElement.selectionEnd = selStart + 4;
                    return true;

                case 'Enter':
                    // Eğer input bir form içindeyse ve submit edilebilirse submit et
                    if (form) {
                        // Form varsa ve submit edilebilirse
                        const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
                        if (submitButton) {
                            submitButton.click(); // Form submit butonu varsa tıkla
                            return true;
                        } else {
                            // Submit butonları yoksa, formu submit et
                            form.dispatchEvent(new Event('submit', {cancelable: true}));
                            return true;
                        }
                    }

                    // Form yoksa veya submit edilemezse yeni satır ekle (textarea gibi)
                    if (inputElement.nodeName === 'TEXTAREA') {
                        text = text.slice(0, selStart) + '\n' + text.slice(selEnd);
                        inputElement.value = text;
                        inputElement.selectionStart = inputElement.selectionEnd = selStart + 1;
                    }
                    return true;

                case 'Boşluk':
                    // Boşluk ekle
                    text = text.slice(0, selStart) + ' ' + text.slice(selEnd);
                    inputElement.value = text;
                    safelySetSelection(inputElement, selStart + 1, selStart + 1);
                    return true;

                case 'Kapat':
                    window.keyboardDisplay.hideKeyboard();
                    return true;

                case 'HepsiniSec':
                    if (supportsSelection(inputElement)) {
                        inputElement.select();
                    }
                    if (window.keyboardEditMenu && window.keyboardEditMenu.toggleEditMenu) {
                        window.keyboardEditMenu.toggleEditMenu();
                    }
                    return true;
                case 'ArrowLeft':

                    // Sol ok işlevi
                function solOkIslemi() {
                    const selStart = inputElement.selectionStart;

                    if (selStart > 0) {
                        inputElement.selectionStart = inputElement.selectionEnd = selStart - 1;
                        return true;
                    }
                    return false; // Daha fazla sola gidilemez
                }

                    // İlk işlemi yap
                    solOkIslemi();

                    // Uzun basma özelliğini ekle
                    this.uzunBasmaAyarla(event.currentTarget, solOkIslemi);
                    return true;

                case 'ArrowRight':

                    // Sağ ok işlevi
                function sagOkIslemi() {
                    const text = inputElement.value;
                    const selEnd = inputElement.selectionEnd;

                    if (selEnd < text.length) {
                        inputElement.selectionStart = inputElement.selectionEnd = selEnd + 1;
                        return true;
                    }
                    return false; // Daha fazla sağa gidilemez
                }

                    // İlk işlemi yap
                    sagOkIslemi();

                    // Uzun basma özelliğini ekle
                    this.uzunBasmaAyarla(event.currentTarget, sagOkIslemi);
                    return true;

                case 'ArrowUp':

                    // Yukarı ok işlevi - satır başına gitmek için
                function yukariOkIslemi() {
                    const text = inputElement.value;
                    const selStart = inputElement.selectionStart;

                    // Mevcut konumun satır başını bul
                    let satirbasi = selStart;
                    while (satirbasi > 0 && text[satirbasi - 1] !== '\n') {
                        satirbasi--;
                    }

                    // Bir önceki satırın başını bul
                    let oncekiSatirBasi = satirbasi - 1;
                    while (oncekiSatirBasi > 0 && text[oncekiSatirBasi - 1] !== '\n') {
                        oncekiSatirBasi--;
                    }

                    if (oncekiSatirBasi >= 0) {
                        // Mevcut satırdaki offset'i hesapla
                        const offset = selStart - satirbasi;

                        // Önceki satırın sonunu bul
                        let oncekiSatirSonu = oncekiSatirBasi;
                        while (oncekiSatirSonu < satirbasi - 1) {
                            oncekiSatirSonu++;
                        }

                        // Önceki satırın aynı konumuna git, ancak satırın sonunu aşma
                        const yeniPozisyon = Math.min(oncekiSatirBasi + offset, oncekiSatirSonu);
                        inputElement.selectionStart = inputElement.selectionEnd = yeniPozisyon;
                        return true;
                    }
                    return false; // Daha fazla yukarı çıkılamaz
                }

                    // İlk işlemi yap
                    yukariOkIslemi();

                    // Uzun basma özelliğini ekle
                    this.uzunBasmaAyarla(event.currentTarget, yukariOkIslemi);
                    return true;

                case 'ArrowDown':

                    // Aşağı ok işlevi - sonraki satıra gitme
                function asagiOkIslemi() {
                    const text = inputElement.value;
                    const selStart = inputElement.selectionStart;

                    // Mevcut konumun satır başını bul
                    let satırBasi = selStart;
                    while (satırBasi > 0 && text[satırBasi - 1] !== '\n') {
                        satırBasi--;
                    }

                    // Sonraki satırın başını bul
                    let sonrakiSatirBasi = selStart;
                    while (sonrakiSatirBasi < text.length && text[sonrakiSatirBasi] !== '\n') {
                        sonrakiSatirBasi++;
                    }

                    // Satır sonuna geldik mi kontrol et
                    if (sonrakiSatirBasi < text.length) {
                        sonrakiSatirBasi++; // '\n' karakterinin ötesine geç

                        // Mevcut satırdaki offset'i hesapla
                        const offset = selStart - satırBasi;

                        // Sonraki satırın sonunu bul
                        let sonrakiSatirSonu = sonrakiSatirBasi;
                        while (sonrakiSatirSonu < text.length && text[sonrakiSatirSonu] !== '\n') {
                            sonrakiSatirSonu++;
                        }

                        // Sonraki satırın aynı konumuna git, ancak satırın sonunu aşma
                        const yeniPozisyon = Math.min(sonrakiSatirBasi + offset, sonrakiSatirSonu);
                        inputElement.selectionStart = inputElement.selectionEnd = yeniPozisyon;
                        return true;
                    }
                    return false; // Daha fazla aşağı inilemez
                }

                    // İlk işlemi yap
                    asagiOkIslemi();

                    // Uzun basma özelliğini ekle
                    this.uzunBasmaAyarla(event.currentTarget, asagiOkIslemi);
                    return true;


            }

            return false;
        },

        // Tuş basma olayını işle
        handleKeyPress: function (key) {
            const state = window.keyboardState.getState();
            const inputElement = state.currentInput;

            if (!inputElement) return;

            // Yazılan metni başlık bölümünde göster
            if (window.keyboardDisplayText && inputElement) {
                window.keyboardDisplayText.handleKeyPress(key, inputElement);
            }

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
                        if (supportsSelection(inputElement)) {
                            inputElement.select();
                        }
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
            const selection = safelyGetSelection(inputElement);
            const selStart = selection.start;
            const selEnd = selection.end;
            const text = inputElement.value || '';

            inputElement.value = text.slice(0, selStart) + charToInsert + text.slice(selEnd);
            safelySetSelection(inputElement, selStart + charToInsert.length, selStart + charToInsert.length);

            // Input olayını tetikle
            this.triggerInputEvent(inputElement);

            // Saniyenin küçük bir kısmı kadar bekleyip input alanını yeniden odakla
            setTimeout(function () {
                if (inputElement) {
                    inputElement.focus();
                }
            }, 10);
        },

        // Input olayını tetikle
        triggerInputEvent: function (inputElement) {
            try {
                const event = new Event('input', {bubbles: true});
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
})();