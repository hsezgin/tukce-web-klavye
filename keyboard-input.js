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
    // Türkçe karakter dönüşüm fonksiyonları
    const turkceKarakter = {
        // Küçük harften büyük harfe dönüşüm (Türkçe kurallarına göre)
        buyukHarf: function(karakter) {
            const turkceKucukBuyuk = {
                'i': 'İ',
                'ı': 'I'
            };

            // Eğer karakter Türkçe'ye özgü ise ona göre dönüştür
            if (turkceKucukBuyuk[karakter]) {
                return turkceKucukBuyuk[karakter];
            }

            // Değilse JavaScript'in standart dönüşümünü kullan
            return karakter.toUpperCase();
        },

        // Büyük harften küçük harfe dönüşüm (Türkçe kurallarına göre)
        kucukHarf: function(karakter) {
            const turkceBuyukKucuk = {
                'İ': 'i',
                'I': 'ı'
            };

            // Eğer karakter Türkçe'ye özgü ise ona göre dönüştür
            if (turkceBuyukKucuk[karakter]) {
                return turkceBuyukKucuk[karakter];
            }

            // Değilse JavaScript'in standart dönüşümünü kullan
            return karakter.toLowerCase();
        },

        // Bir metinde büyük/küçük harf dönüşümünü Türkçe'ye uygun yapar
        buyukMetin: function(metin) {
            if (!metin) return '';
            let sonuc = '';
            for (let i = 0; i < metin.length; i++) {
                sonuc += this.buyukHarf(metin[i]);
            }
            return sonuc;
        },

        kucukMetin: function(metin) {
            if (!metin) return '';
            let sonuc = '';
            for (let i = 0; i < metin.length; i++) {
                sonuc += this.kucukHarf(metin[i]);
            }
            return sonuc;
        },

        // Bir metnin ilk harfini büyütür (Türkçe'ye uygun)
        basHarfBuyut: function(metin) {
            if (!metin || metin.length === 0) return '';
            return this.buyukHarf(metin[0]) + metin.slice(1);
        }
    };


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

        // Çift tepkiyi önlerken uzun basılmayı destekleyen genel tuş işleyici
        handleKeyWithLongPress: function(key, inputElement, actionFunction, event) {
            // Çift tepki önleme flag dizisini oluştur
            this._preventDoubleAction = this._preventDoubleAction || {};
            
            // Özel tuşa özel flag'i kontrol et
            if (!this._preventDoubleAction[key]) {
                // Flag'i aktif et
                this._preventDoubleAction[key] = true;
                
                // Ana işlevi çağır
                actionFunction(inputElement);
                
                // Flag'i sıfırla
                setTimeout(() => {
                    this._preventDoubleAction[key] = false;
                }, 150);
                
                // Uzun basma için tuşu ayarla
                const targetKey = event ? event.currentTarget : null;
                if (targetKey && !targetKey.getAttribute('data-long-press-setup')) {
                    // Uzun basma kurulumu yap
                    this.setupLongPress(targetKey, inputElement, () => actionFunction(inputElement), 80, 350);
                    
                    // Tuşun uzun basma kurulumunun yapıldığını işaretle
                    targetKey.setAttribute('data-long-press-setup', 'true');
                }
            }
            
            return true;
        },

        // Focus olayı
        onFocus: function (e) {
            // Mevcut input alanını kaydet
            window.keyboardState.setCurrentInput(e.target);

            // Bu input için tarihçe izlemeyi kur
            window.keyboardHistory.setupInputChangeListener(e.target);

            // Klavyeyi göster
            window.keyboardDisplay.showKeyboard();

            // Input metni hemen göster
            if (window.keyboardDisplayText) {
                // Kısa bir gecikme ile updateInputText metodunu çağır
                setTimeout(() => {
                    window.keyboardDisplayText.updateInputText(e.target);
                }, 10);
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
            
            let newPos = selStart;

            switch (direction) {
                // sol/sağ ok tuşları için artık farklı bir yöntem kullanıyoruz
                
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
                    newPos = prevLineStart + Math.min(columnPos, prevLineLength - 1);

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
                    newPos = nextLineStart + Math.min(columnPosDown, nextLineLength);

                    safelySetSelection(inputElement, newPos, newPos);
                    break;
            }

            // Görüntüleme metnini güncellemek için displayText'i kullan
            if (window.keyboardDisplayText) {
                // İmleç pozisyonunu bildirmek için doğrudan güncelleme kullan
                window.keyboardDisplayText.updateInputText(inputElement);
            }
        },

        // Uzun basma işlevi için basitleştirilmiş yardımcı fonksiyon
        setupLongPress: function(key, inputElement, actionFunction, interval = 80, delay = 300) {
            if (!key || !inputElement || !actionFunction) return;
            
            // Parola alanı için daha hızlı parametreler
            if (inputElement.type === 'password') {
                interval = 50;  // Daha hızlı tekrarlama süresi
                delay = 200;    // Daha kısa başlangıç gecikmesi
            }
            
            // Bu tuşa uzun basma ayarlandığını işaretle
            key.setAttribute('data-long-press-setup', 'true');
            
            // Mouse down - basma başladığında
            const handleMouseDown = function(e) {
                // Uzun basılı tutma durumunda belirli bir gecikme sonrası tekrar başlat
                key.longPressTimer = setTimeout(function() {
                    key.interval = setInterval(function() {
                        actionFunction(inputElement);
                    }, interval); // Belirlenen aralıklarla çalıştır (ms)
                }, delay); // Belirlenen gecikme sonrası başlat (ms)
                
                // Tuşu basılı tutma görünümü için class ekle
                key.classList.add('keyboard-key-pressed');
            };
            
            // Temizleme fonksiyonu
            const clearTimers = function() {
                // Basılı tutma görünümünü kaldır
                key.classList.remove('keyboard-key-pressed');
                
                // Zamanlayıcıları temizle
                clearTimeout(key.longPressTimer);
                clearInterval(key.interval);
                key.longPressTimer = null;
                key.interval = null;
            };
            
            // Mevcut dinleyicileri temizle ve yenilerini ekle
            key.removeEventListener('mousedown', key.oldMouseDownHandler);
            key.removeEventListener('mouseup', key.oldMouseUpHandler);
            key.removeEventListener('mouseleave', key.oldMouseLeaveHandler);
            key.removeEventListener('touchstart', key.oldTouchStartHandler);
            key.removeEventListener('touchend', key.oldTouchEndHandler);
            key.removeEventListener('touchcancel', key.oldTouchCancelHandler);
            
            // Yeni dinleyicileri kaydet
            key.oldMouseDownHandler = handleMouseDown;
            key.oldMouseUpHandler = clearTimers;
            key.oldMouseLeaveHandler = clearTimers;
            key.oldTouchStartHandler = handleMouseDown;
            key.oldTouchEndHandler = clearTimers;
            key.oldTouchCancelHandler = clearTimers;
            
            // Yeni dinleyicileri ekle
            key.addEventListener('mousedown', handleMouseDown);
            key.addEventListener('mouseup', clearTimers);
            key.addEventListener('mouseleave', clearTimers);
            key.addEventListener('touchstart', handleMouseDown);
            key.addEventListener('touchend', clearTimers);
            key.addEventListener('touchcancel', clearTimers);
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
                    const silmeIslemi = (inputElem) => {
                        const text = inputElem.value;
                        const selStart = inputElem.selectionStart;
                        const selEnd = inputElem.selectionEnd;
                        
                        // Şifre alanı için ekstra hızlı işlem - ön bellekleme
                        if (inputElem.type === 'password' && this._lastPasswordLength !== undefined) {
                            // Eğer bir önceki uzunluğu biliyorsak, doğrudan yeni uzunluğa geçebiliriz
                            const currentLength = text.length;
                            if (currentLength > 0 && currentLength === this._lastPasswordLength) {
                                inputElem.value = text.slice(0, -1); // Son karakteri sil
                                inputElem.selectionStart = inputElem.selectionEnd = currentLength - 1;
                                
                                // Input olayını tetikle
                                const event = new Event('input', {bubbles: true});
                                inputElem.dispatchEvent(event);
                                
                                // Yeni uzunluğu kaydet
                                this._lastPasswordLength = currentLength - 1;
                                
                                // Görüntülemeyi güncelle
                                if (window.keyboardDisplayText) {
                                    window.keyboardDisplayText.updateInputText(inputElem);
                                }
                                
                                return; // Hızlı yoldan işlemi tamamla
                            }
                        }
                        
                        // Yeni değeri önceden hesapla
                        let newValue;

                        if (selStart === selEnd) {
                            if (selStart > 0) {
                                newValue = text.slice(0, selStart - 1) + text.slice(selEnd);
                                
                                // Mevcut değerden farklıysa güncelle
                                if (newValue !== inputElem.value) {
                                    // Değeri değiştir ve imleci konumlandır
                                    inputElem.value = newValue;
                                    inputElem.selectionStart = inputElem.selectionEnd = selStart - 1;
                                    
                                    // Şifre alanı için uzunluğu kaydet
                                    if (inputElem.type === 'password') {
                                        this._lastPasswordLength = newValue.length;
                                    }
                                    
                                    // Görüntülemeyi güncelle - şifre alanı için de güncellemeyi zorla
                                    if (window.keyboardDisplayText) {
                                        window.keyboardDisplayText.updateInputText(inputElem);
                                    }
                                    
                                    // Input olayını tetikle
                                    const event = new Event('input', {bubbles: true});
                                    inputElem.dispatchEvent(event);
                                }
                            }
                        } else {
                            // Seçili metni sil
                            newValue = text.slice(0, selStart) + text.slice(selEnd);
                            
                            // Mevcut değerden farklıysa güncelle
                            if (newValue !== inputElem.value) {
                                inputElem.value = newValue;
                                inputElem.selectionStart = inputElem.selectionEnd = selStart;
                                
                                // Şifre alanı için uzunluğu kaydet
                                if (inputElem.type === 'password') {
                                    this._lastPasswordLength = newValue.length;
                                }
                                
                                // Görüntülemeyi güncelle
                                if (window.keyboardDisplayText) {
                                    window.keyboardDisplayText.updateInputText(inputElem);
                                }
                                
                                // Input olayını tetikle
                                const event = new Event('input', {bubbles: true});
                                inputElem.dispatchEvent(event);
                            }
                        }
                    };
                    
                    // Silme işlevini çağır
                    silmeIslemi(inputElement);
                    
                    // Uzun basma için tuşu ayarla - özellikle parola alanları için hızlı olmalı
                    const silKey = event ? event.currentTarget : null;
                    if (silKey && !silKey.hasAttribute('data-long-press-setup')) {
                        // Parola alanı için özel bir hızlı ayar kullan
                        if (inputElement.type === 'password') {
                            this.setupLongPress(silKey, inputElement, silmeIslemi, 30, 150); // Çok daha hızlı
                        } else {
                            this.setupLongPress(silKey, inputElement, silmeIslemi);
                        }
                    }
                    
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
                    
                    // Input event'ini tetikle
                    this.triggerInputEvent(inputElement);
                    
                    // Değişiklikleri göstermek için keyboardDisplayText'i hemen güncelle
                    if (window.keyboardDisplayText) {
                        window.keyboardDisplayText.updateInputText(inputElement);
                        console.log('Boşluk tuşu basıldı ve metin güncellendi');
                    }
                    
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
                    const solOkIslemi = (inputElem) => {
                        const selStart = inputElem.selectionStart;
                        const selEnd = inputElem.selectionEnd;
                        const state = window.keyboardState.getState();
                        
                        // Shift basılı durumu kontrolü
                        if (state.isShiftActive) {
                            // İlk seçimde anchor noktasını başlat
                            if (typeof this._selectionAnchor === 'undefined') {
                                this._selectionAnchor = selEnd;
                                this._selectionDirection = 'none';
                                console.log('Anchor başlatıldı:', this._selectionAnchor);
                            }
                            
                            // Sola doğru hareket için imleç pozisyonu kontrolü
                            if (selStart > 0) {                    
                                if (selStart === selEnd) {
                                    // Henüz seçim başlamadı - sola doğru seçime başla
                                    this._selectionDirection = 'left';
                                    inputElem.selectionStart = selStart - 1;
                                    inputElem.selectionEnd = this._selectionAnchor;
                                } else if (this._selectionDirection === 'left' || selStart < this._selectionAnchor) {
                                    // Sola doğru seçim devam ediyor - genişlet
                                    this._selectionDirection = 'left';
                                    inputElem.selectionStart = selStart - 1;
                                    inputElem.selectionEnd = this._selectionAnchor;
                                } else if (this._selectionDirection === 'right' || selEnd > this._selectionAnchor) {
                                    // Sağa doğru seçim vardı - daralt
                                    this._selectionDirection = 'right';
                                    
                                    // Seçimi daralt
                                    if (selEnd > this._selectionAnchor) {
                                        inputElem.selectionStart = selStart;
                                        inputElem.selectionEnd = selEnd - 1;
                                        
                                        // Son karakter kaldığında seçimi kaldırmadan devam et
                                        if (selEnd - 1 === this._selectionAnchor) {
                                            console.log('Seçim minimum noktaya ulaştı, anchor:', this._selectionAnchor);
                                        }
                                    }
                                }
                            }
                        } else {
                            // Shift basılı değilse, normal imleç hareketi
                            if (selStart > 0) {
                            // Eğer seçim varsa, her zaman seçimi iptal et ve imleç hareketi yap
                            if (selStart !== selEnd) {
                            // Shift bırakıldıktan sonra, seçim iptal edilmeli
                                inputElem.selectionStart = inputElem.selectionEnd = selStart;
                            } else {
                            // Normal sol hareket
                                inputElem.selectionStart = inputElem.selectionEnd = selStart - 1;
                                }
                        }
                            
                            // Seçim anchor'unu sıfırla
                            this._selectionAnchor = undefined;
                            this._selectionDirection = 'none';
                        }
                        
                        // Görüntüleme metnini güncelle
                        if (window.keyboardDisplayText) {
                            window.keyboardDisplayText.updateInputText(inputElem);
                        }
                    };
                    
                    // İşlevi çağır
                    solOkIslemi(inputElement);
                    
                    // Uzun basma için tuşu ayarla - sadece Shift basılı değilse
                    const solKey = event ? event.currentTarget : null;
                    if (solKey && !solKey.hasAttribute('data-long-press-setup') && !window.keyboardState.getState().isShiftActive) {
                        this.setupLongPress(solKey, inputElement, solOkIslemi);
                    }
                    
                    return true;

                case 'ArrowRight':
                    // Sağ ok işlevi
                    const sagOkIslemi = (inputElem) => {
                        const text = inputElem.value;
                        const selStart = inputElem.selectionStart;
                        const selEnd = inputElem.selectionEnd;
                        const state = window.keyboardState.getState();
                        
                        // Shift basılı durumu kontrolü
                        if (state.isShiftActive) {
                            // İlk seçimde anchor noktasını başlat
                            if (typeof this._selectionAnchor === 'undefined') {
                                this._selectionAnchor = selStart;
                                this._selectionDirection = 'none';
                                console.log('Anchor başlatıldı:', this._selectionAnchor);
                            }
                            
                            // Sağa doğru hareket için imleç pozisyonu kontrolü
                            if (selEnd < text.length) {                    
                                if (selStart === selEnd) {
                                    // Henüz seçim başlamadı - sağa doğru seçime başla
                                    this._selectionDirection = 'right';
                                    inputElem.selectionStart = this._selectionAnchor;
                                    inputElem.selectionEnd = selEnd + 1;
                                } else if (this._selectionDirection === 'right' || selEnd > this._selectionAnchor) {
                                    // Sağa doğru seçim devam ediyor - genişlet
                                    this._selectionDirection = 'right';
                                    inputElem.selectionStart = this._selectionAnchor;
                                    inputElem.selectionEnd = selEnd + 1;
                                } else if (this._selectionDirection === 'left' || selStart < this._selectionAnchor) {
                                    // Sola doğru seçim vardı - daralt
                                    this._selectionDirection = 'left';
                                    
                                    // Seçimi daralt
                                    if (selStart < this._selectionAnchor) {
                                        inputElem.selectionStart = selStart + 1;
                                        inputElem.selectionEnd = this._selectionAnchor;
                                        
                                        // Son karakter kaldığında seçimi kaldırmadan devam et
                                        if (selStart + 1 === this._selectionAnchor) {
                                            console.log('Seçim minimum noktaya ulaştı, anchor:', this._selectionAnchor);
                                        }
                                    }
                                }
                            }
                        } else {
                            // Shift basılı değilse, normal imleç hareketi
                            if (selEnd < text.length) {
                            // Eğer seçim varsa, her zaman seçimi iptal et ve imleç hareketi yap
                            if (selStart !== selEnd) {
                            // Shift bırakıldıktan sonra, seçim iptal edilmeli
                                inputElem.selectionStart = inputElem.selectionEnd = selEnd;
                            } else {
                            // Normal sağ hareket
                                inputElem.selectionStart = inputElem.selectionEnd = selEnd + 1;
                                }
                        }
                            
                            // Seçim anchor'unu sıfırla
                            this._selectionAnchor = undefined;
                            this._selectionDirection = 'none';
                        }
                        
                        // Görüntüleme metnini güncelle
                        if (window.keyboardDisplayText) {
                            window.keyboardDisplayText.updateInputText(inputElem);
                        }
                    };
                    
                    // İşlevi çağır
                    sagOkIslemi(inputElement);
                    
                    // Uzun basma için tuşu ayarla - Shift basılı değilse
                    const sagKey = event ? event.currentTarget : null;
                    if (sagKey && !sagKey.hasAttribute('data-long-press-setup') && !window.keyboardState.getState().isShiftActive) {
                        this.setupLongPress(sagKey, inputElement, sagOkIslemi);
                    }
                    
                    return true;

                case 'ArrowUp':
                    // Yukarı ok işlevi
                    const yukariOkIslemi = (inputElem) => {
                        const text = inputElem.value;
                        const selStart = inputElem.selectionStart;

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
                            inputElem.selectionStart = inputElem.selectionEnd = yeniPozisyon;
                            
                            // Görüntüleme metnini güncelle
                            if (window.keyboardDisplayText) {
                                window.keyboardDisplayText.updateInputText(inputElem);
                            }
                        }
                    };
                    
                    // İşlevi çağır
                    yukariOkIslemi(inputElement);
                    
                    // Uzun basma için tuşu ayarla
                    const yukariKey = event ? event.currentTarget : null;
                    if (yukariKey && !yukariKey.hasAttribute('data-long-press-setup')) {
                        this.setupLongPress(yukariKey, inputElement, yukariOkIslemi);
                    }
                    
                    return true;

                case 'ArrowDown':
                    // Aşağı ok işlevi
                    const asagiOkIslemi = (inputElem) => {
                        const text = inputElem.value;
                        const selStart = inputElem.selectionStart;

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
                            inputElem.selectionStart = inputElem.selectionEnd = yeniPozisyon;
                            
                            // Görüntüleme metnini güncelle
                            if (window.keyboardDisplayText) {
                                window.keyboardDisplayText.updateInputText(inputElem);
                            }
                        }
                    };
                    
                    // İşlevi çağır
                    asagiOkIslemi(inputElement);
                    
                    // Uzun basma için tuşu ayarla
                    const asagiKey = event ? event.currentTarget : null;
                    if (asagiKey && !asagiKey.hasAttribute('data-long-press-setup')) {
                        this.setupLongPress(asagiKey, inputElement, asagiOkIslemi);
                    }
                    
                    return true;

                // Büyük-küçük harf dönüşümü için
                case 'CapsLock':
                    // CapsLock durumunu değiştir
                    const capsLockActive = !window.keyboardState.isCapsLockActive();
                    window.keyboardState.setCapsLockActive(capsLockActive);

                    // Klavye tuşlarının görünümünü güncelle
                    window.keyboardDisplay.updateKeysDisplay();
                    return true;


            }

            return false;
        },

        // Tuş basma olayını işle
        handleKeyPress: function (key) {
            const state = window.keyboardState.getState();
            const inputElement = state.currentInput;

            if (!inputElement) return;
            
            // Son basılan tuşu ve zamanı kaydet - çift işlemi engellemek için
            // Aynı tuşa 200ms içinde tekrar basılırsa işlemi engelle
            const now = Date.now();
            if (this.lastProcessedKey === key && (now - this.lastKeyPressTime) < 200) {
                // Çok hızlı çift tuş basmasını engelle
                return;
            }
            // İşlem tamamlandıktan sonra son tuş ve zamanı güncelle
            this.lastProcessedKey = key;
            this.lastKeyPressTime = now;

            // Özel tuşlar için ek kontrol
            if (key === 'Sil' || key === 'ArrowLeft' || key === 'ArrowRight' || 
                key === 'ArrowUp' || key === 'ArrowDown') {
                // Özel tuşlar için daha uzun bekleme süresi
                if ((now - this.lastSpecialKeyTime) < 250) {
                    return;
                }
                this.lastSpecialKeyTime = now;
            }

            // Yazılan metni başlık bölümünde göster
            if (window.keyboardDisplayText && inputElement) {
                // Güvenli bir şekilde görüntüleme modulunu çağır
                try {
                    window.keyboardDisplayText.handleKeyPress(key, inputElement);
                    // Ekstra güvenlik için, bir süre sonra metni zorla güncelle
                    setTimeout(() => {
                        if (window.keyboardDisplayText) {
                            window.keyboardDisplayText.updateInputText(inputElement);
                        }
                    }, 30);
                } catch (e) {
                    console.error('Görüntüleme hatası:', e);
                    // Hata durumunda geri yükleme çözümü
                    setTimeout(() => {
                        if (window.keyboardDisplayText) {
                            window.keyboardDisplayText.updateInputText(inputElement);
                        }
                    }, 50);
                }
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
                
                // Shift durumunu değiştir
                const newShiftState = window.keyboardState.toggleShiftActive();
                
                // Eğer shift kapatılıyorsa, seçim anchor'unu sıfırla ve seçimi iptal et
                if (!newShiftState) {  // Shift kapatıldığında
                    // Seçim anchor'unu sıfırla
                    this._selectionAnchor = undefined;
                    this._selectionDirection = 'none';
                    
                    // Eğer aktif bir seçim varsa, iptal et
                    const inputElement = state.currentInput;
                    if (inputElement && inputElement.selectionStart !== inputElement.selectionEnd) {
                        // Seçimi kaldır - sadece imleç bırak
                        const cursorPos = inputElement.selectionEnd;
                        inputElement.selectionStart = inputElement.selectionEnd = cursorPos;
                        
                        // Görüntüleme metnini güncelle
                        if (window.keyboardDisplayText) {
                            window.keyboardDisplayText.updateInputText(inputElement);
                        }
                    }
                    
                    console.log('Shift kapatıldı, anchor sıfırlandı, seçim iptal edildi');
                }
                
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

            // Sadece handleSpecialKey aracılığıyla ok tuşlarını yönlendir
            if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
                this.handleSpecialKey(key, inputElement); // Bu özel tuş, daha önce kontrol edilen handleSpecialKey içinde işlenecek
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
                            // Tüm metni seç
                            inputElement.select();
                            
                            // Seçim anchor'unu güncelle - tam seçim için başlangıç ve bitiş noktalarını ayarla
                            this._selectionAnchor = 0; // Başlangıç noktası metinin başı
                            this._selectionDirection = 'right'; // Sağa doğru seçim
                            
                            // Görüntüleme metnini hemen güncelle
                            if (window.keyboardDisplayText) {
                                // Seçim görünürlüğünü sağlamak için hemen güncelle
                                window.keyboardDisplayText.updateInputText(inputElement);
                            }
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
                        // Türkçe karakter kontrolü
                        if (key.toLowerCase() === 'i') {
                            charToInsert = 'i';  // Küçük i
                        } else if (key.toLowerCase() === 'ı') {
                            charToInsert = 'ı';  // Küçük ı
                        } else {
                            charToInsert = key.toLowerCase();
                        }
                    } else {
                        // Caps Lock kapalıyken Shift'e basılırsa büyük harf yaz
                        // Türkçe karakter kontrolü
                        if (key.toLowerCase() === 'i') {
                            charToInsert = 'İ';  // Büyük İ
                        } else if (key.toLowerCase() === 'ı') {
                            charToInsert = 'I';  // Büyük I
                        } else {
                            charToInsert = key.toUpperCase();
                        }
                    }
                }

                // Shift kullanıldığında devre dışı bırak
                window.keyboardState.toggleShiftActive();
                window.keyboardDisplay.updateKeyDisplay();
            }
            // Caps Lock aktifken harfler
            else if (state.isCapsActive && key.match(/[a-zçğıöşü]/i)) {
                // Caps Lock açıkken harfler her zaman büyük
                // Türkçe karakter kontrolü
                if (key.toLowerCase() === 'i') {
                    charToInsert = 'İ';  // Büyük İ
                } else if (key.toLowerCase() === 'ı') {
                    charToInsert = 'I';  // Büyük I
                } else {
                    charToInsert = key.toUpperCase();
                }
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
            
            // Klavye görüntüleme metnini hemen güncelle
            if (window.keyboardDisplayText) {
                // Her karakter için hemen güncellemeyi sağla
                window.keyboardDisplayText.updateInputText(inputElement);
                
                // Boşluk karakteri için console log ekleyelim
                if (charToInsert === ' ') {
                    console.log('Boşluk karakteri eklendi:', inputElement.value);
                }
            }

            // Saniyenin küçük bir kısmı kadar bekleyip input alanını yeniden odakla
            setTimeout(function () {
                if (inputElement) {
                    inputElement.focus();
                }
            }, 10);
        },

        // Input olayını tetikle
        triggerInputEvent: function (inputElement) {
            if (!inputElement) return;
            
            try {
                const event = new Event('input', {bubbles: true});
                inputElement.dispatchEvent(event);
            } catch (e) {
                // Eski tarayıcılar için alternatif
                try {
                    if (typeof document.createEvent === 'function') {
                        const event = document.createEvent('HTMLEvents');
                        event.initEvent('input', true, false);
                        inputElement.dispatchEvent(event);
                    }
                } catch (innerError) {
                    console.warn(`Event oluşturulurken hata: ${innerError.message}`);
                }
            }
        },
        
        // Yıkım fonksiyonu - temizleme işlemleri
        destroy: function() {
            this.cleanupEventListeners();
        }
    };
})();