// keyboard-display-module.js dosyası için gelişmiş imleç desteği

// Türkçe Web Klavyesi - Yazılanları Gösterme Modülü
(function() {
    // Yazılan metni başlık bölümünde gösterme fonksiyonları
    const keyboardDisplayText = {
        // Takip edilen girdi metni
        inputText: '',
        maxDisplayLength: 100, // Gösterilecek maksimum karakter sayısı
        cursorPosition: 0,     // İmleç pozisyonu (kaçıncı karakterden sonra)
        
        // Son işlemleri takip eden değişkenler
        lastUpdateTime: 0,     // Son güncelleme zamanı
        updateThrottle: 100,   // Güncellemeler arası minimum süre (ms)
        pendingUpdate: false,  // Bekleyen güncelleme var mı?
        
        // İmleç hareketi doğrudan klavye tarafından mı yönetiliyor?
        directCursorControl: false,

        // CSS stil ekleyen yardımcı fonksiyon
        addCursorStyle: function() {
            // Eğer daha önce eklenmediyse ekle
            if (!document.getElementById('keyboard-cursor-style')) {
                const style = document.createElement('style');
                style.id = 'keyboard-cursor-style';
                style.textContent = `
                    /* Yanıp sönen imleç animasyonu */
                    @keyframes blink {
                        0% { opacity: 1; }
                        50% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                    
                    /* İmleç stili */
                    .keyboard-cursor {
                        display: inline-block;
                        width: 2px;
                        height: 16px;
                        background-color: #fff;
                        vertical-align: middle;
                        margin: 0 2px;
                        animation: blink 1s infinite;
                    }
                    
                    /* Boşluk görünürleştirici stil */
                    .keyboard-space-highlight {
                        text-decoration: underline;
                        text-decoration-color: #ffcc00;
                        text-decoration-style: dotted;
                    }
                    
                    /* Boşluk karakter belirteci - arka plan rengi ile aynı yapılıyor */
                    .space-mark {
                        display: inline-block;
                        width: 8px;
                        height: 3px;
                        margin: 0 2px;
                        vertical-align: middle;
                        /* Görünmez yap - transparan */
                        background-color: transparent;
                    }
                    
                    /* Metin seçim stili */
                    .selected-text {
                        background-color: #3a6a8f;
                        color: white;
                        border-radius: 2px;
                    }
                `;
                document.head.appendChild(style);
            }
        },

        // Başlık metnini güncelle
        // Boşlukları görünür hale getir
        makeSpacesVisible: function(text) {
            // Boşlukları değiştirmek yerine, doğrudan span elementi kullanacağız
            // Bu nedenle sadece orjinal metni döndür
            return text;
        },
        
        // Metni HTML olarak işleyip boşlukları görünür yap
        renderTextWithVisibleSpaces: function(container, text, isSelected) {
            // Metni karakter karakter işle
            if (!text) return;
            
            // Önce container'i temizle
            container.innerHTML = '';
            
            // Eğer tüm metin seçiliyse
            if (isSelected === true) {
                const selectedSpan = document.createElement('span');
                selectedSpan.className = 'selected-text';
                
                // Metin içerisindeki boşlukları görünür yap
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    
                    if (char === ' ') {
                        // Boşluk yerine özel stil elementi koy
                        const spaceSpan = document.createElement('span');
                        spaceSpan.className = 'space-mark';
                        selectedSpan.appendChild(spaceSpan);
                    } else {
                        // Normal karakter
                        const charNode = document.createTextNode(char);
                        selectedSpan.appendChild(charNode);
                    }
                }
                
                container.appendChild(selectedSpan);
                return;
            }
            
            // Her karakter için
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                
                if (char === ' ') {
                    // Boşluk yerine özel stil elementi koy
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = 'space-mark';
                    container.appendChild(spaceSpan);
                } else {
                    // Normal karakter
                    const charNode = document.createTextNode(char);
                    container.appendChild(charNode);
                }
            }
        },

        updateDisplayText: function(text, hasSelection, selectionStart, selectionEnd) {
            const displayElement = document.getElementById('keyboard-display-text');
            if (!displayElement) return;

            // Varsayılan başlığı sadece ilk seferinde ayarla (boş metin olacak)
            if (!displayElement.getAttribute('data-default-text')) {
                displayElement.setAttribute('data-default-text', '');
            }

            // İmleç için CSS ekle
            this.addCursorStyle();
            
            // Parametrelerin varsayılan değerlerini ayarla
            hasSelection = hasSelection || false;
            selectionStart = selectionStart || 0;
            selectionEnd = selectionEnd || 0;

            // Metni ve imleci göster
            if (text) {
                // Eğer seçilmiş metin varsa, farklı işle
                if (hasSelection) {
                    // Seçim bilgisine göre metni parçala
                    const beforeSelection = text.substring(0, selectionStart);
                    const selection = text.substring(selectionStart, selectionEnd);
                    const afterSelection = text.substring(selectionEnd);
                    
                    // Tüm HTML içeriğini temizle
                    displayElement.textContent = '';
                    
                    // Seçim öncesi metni ekle
                    if (beforeSelection) {
                        const beforeDiv = document.createElement('span');
                        this.renderTextWithVisibleSpaces(beforeDiv, beforeSelection, false);
                        displayElement.appendChild(beforeDiv);
                    }
                    
                    // Seçilen metni ekle
                    if (selection) {
                        const selectionDiv = document.createElement('span');
                        this.renderTextWithVisibleSpaces(selectionDiv, selection, true);
                        displayElement.appendChild(selectionDiv);
                    }
                    
                    // Seçim sonrası metni ekle
                    if (afterSelection) {
                        const afterDiv = document.createElement('span');
                        this.renderTextWithVisibleSpaces(afterDiv, afterSelection, false);
                        displayElement.appendChild(afterDiv);
                    }
                    
                    // İmleçi ekle - seçim sonunda göster
                    const cursor = document.createElement('span');
                    cursor.className = 'keyboard-cursor';
                    
                    // İmleci seçim sonuna yerleştir
                    const lastElement = displayElement.lastChild;
                    if (lastElement && lastElement.tagName === 'SPAN' && lastElement.className === 'selected-text') {
                        // İmleci seçimin sonuna ekle
                        displayElement.appendChild(cursor);
                    } else {
                        // Seçimin sonrasına işaret eden imleci ekle
                        displayElement.appendChild(cursor);
                    }
                    
                    return;
                }
                // Metin varsa, imlecin pozisyonuna göre parçalara böl
                let prefix = '';
                let suffix = '';

                // İmleç pozisyonunu metinin uzunluğuna göre sınırla
                this.cursorPosition = Math.min(this.cursorPosition, text.length);

                if (text.length > this.maxDisplayLength) {
                    // Metinin uzunluğuna göre görüntülenecek kısmı belirle
                    let startIndex = 0;
                    let endIndex = text.length;
                    let displayedText = text;

                    // İmleç pozisyonuna göre görüntüleme penceresini ayarla
                    if (this.cursorPosition > this.maxDisplayLength / 2) {
                        // İmleç ortadan ilerdeyse, imleci görünür alanda tut
                        startIndex = this.cursorPosition - Math.floor(this.maxDisplayLength / 3);
                        endIndex = startIndex + this.maxDisplayLength;

                        // Sınırları kontrol et
                        if (endIndex > text.length) {
                            endIndex = text.length;
                            startIndex = Math.max(0, endIndex - this.maxDisplayLength);
                        }

                        displayedText = text.substring(startIndex, endIndex);
                        if (startIndex > 0) displayedText = "..." + displayedText;
                        if (endIndex < text.length) displayedText = displayedText + "...";

                        // Gösterilen metindeki imleç konumunu ayarla
                        const adjustedCursorPos = this.cursorPosition - startIndex;
                        if (startIndex > 0) {
                            prefix = displayedText.substring(0, adjustedCursorPos + 3); // +3 for "..."
                            suffix = displayedText.substring(adjustedCursorPos + 3);
                        } else {
                            prefix = displayedText.substring(0, adjustedCursorPos);
                            suffix = displayedText.substring(adjustedCursorPos);
                        }
                    } else {
                        // İmleç başlardaysa
                        displayedText = text.substring(0, this.maxDisplayLength) + "...";
                        prefix = displayedText.substring(0, this.cursorPosition);
                        suffix = displayedText.substring(this.cursorPosition);
                    }
                } else {
                    // Metin kısa olduğu için tamamını göster
                    prefix = text.substring(0, this.cursorPosition);
                    suffix = text.substring(this.cursorPosition);
                }

                // Tüm HTML içeriğini temizle
                displayElement.textContent = '';

                // İlk kısmı ekle
                if (prefix) {
                    // Boşlukları görünür yapan div
                    const prefixDiv = document.createElement('span');
                    this.renderTextWithVisibleSpaces(prefixDiv, prefix, false);
                    displayElement.appendChild(prefixDiv);
                }

                // İmleç ekle
                const cursor = document.createElement('span');
                cursor.className = 'keyboard-cursor';
                displayElement.appendChild(cursor);

                // Son kısmı ekle
                if (suffix) {
                    // Boşlukları görünür yapan div
                    const suffixDiv = document.createElement('span');
                    this.renderTextWithVisibleSpaces(suffixDiv, suffix, false);
                    displayElement.appendChild(suffixDiv);
                }
            } else {
                // Boş metin durumunda sadece imleç
                displayElement.textContent = '';

                // İmleç ekle
                const cursor = document.createElement('span');
                cursor.className = 'keyboard-cursor';
                displayElement.appendChild(cursor);

                // İmleç pozisyonunu sıfırla
                this.cursorPosition = 0;
            }
        },

        // İmleç pozisyonunu ayarla - doğrudan modül tarafından kontrol edilen
        setCursorPosition: function(position, inputElement) {
            if (!inputElement) return;

            // Mevcut metnin uzunluğuna göre imleç pozisyonunu sınırla
            const maxPos = inputElement.value ? inputElement.value.length : 0;
            position = Math.max(0, Math.min(position, maxPos));

            // Cursor pozisyonunu sadece gösterilen metinde güncelle - input'a dokunma
            this.cursorPosition = position;

            // Display metnini güncelle
            this.updateDisplayText(this.inputText || '');
        },

        // Girdi metnini güncelle ve göster (ana güncelleme fonksiyonu)
        updateInputText: function(inputElement) {
            if (!inputElement) return;
            
            // Tarayıcıdaki imleç ile daima hizalı kal
            let hasSelection = false;
            let selectionStart = 0;
            let selectionEnd = 0;
            
            if (inputElement.selectionStart !== undefined) {
                try {
                    selectionStart = inputElement.selectionStart;
                    selectionEnd = inputElement.selectionEnd;
                    this.cursorPosition = selectionEnd; // İmleç pozisyonunu seçimin sonu olarak ayarla
                    
                    // Seçim var mı kontrol et
                    hasSelection = (selectionStart !== selectionEnd);
                } catch (e) {
                    console.warn("selectionStart/selectionEnd okunamadı:", e);
                }
            }

            // Eğer input type="password" ise, metin gösterme
            if (inputElement.type === 'password') {
                this.updateDisplayText('********');
                return;
            }

            // Mevcut texti al
            this.inputText = inputElement.value || '';
            
            // Display metnini güncelle - seçim bilgisini gönder
            this.updateDisplayText(this.inputText || '', hasSelection, selectionStart, selectionEnd);
        },

        // Yeni API - Ok tuşlarıyla imleç hareketi için 
        // Bu fonksiyon input'taki imleç hareketinden bağımsızdır
        moveCursor: function(direction, inputElement) {
            if (!inputElement) return;
            
            // İmleç pozisyonunu hesapla
            let newPosition = this.cursorPosition;
            const text = inputElement.value || '';
            
            // Doğrudan kontrol modunu aktifleştir
            this.directCursorControl = true;
            
            switch (direction) {
                case 'left':
                    newPosition = Math.max(0, this.cursorPosition - 1);
                    break;
                    
                case 'right':
                    newPosition = Math.min(text.length, this.cursorPosition + 1);
                    break;
                    
                // Diğer yön tuşları burada eklenebilir...
            }
            
            // Pozisyonu güncelle - sadece görüntüleme metni için
            this.setCursorPosition(newPosition, inputElement);
            
            // 500ms sonra doğrudan kontrol modunu kapat
            setTimeout(() => {
                this.directCursorControl = false;
            }, 500);
        },

        // Yazılan karakteri işle
        handleKeyPress: function(key, inputElement) {
            if (!inputElement) return;

            // Şifre alanları için özel işlem, ama doğrudan güncelleriz
            if (inputElement.type === 'password') {
                this.updateDisplayText('**** Şifre Yazılıyor ****');

                // Silme tuşu için parola alanında özel hizalama işlemi
                if (key === 'Sil') {
                    // Silme tuşu için doğrudan güncelle
                    this.updateInputText(inputElement);
                }
                
                return;
            }
            
            // Özel tuşları işle - boşluk için özel durum
            if (key === 'Boşluk') {
                // Boşluk tuşu için hemen güncelleme yap
                this.updateInputText(inputElement);
                console.log('Boşluk tuşu işlendi', inputElement.value);
                return;
            }

            // Basitçe input metnini güncelle - imleç browser'dakiyle sürekli senkronize kalacak
            // Diğer tüm tuşlar için doğrudan güncelleme yap
            this.updateInputText(inputElement);
        },

        // Varsayılan metne dön
        resetDisplayText: function() {
            const displayElement = document.getElementById('keyboard-display-text');
            if (!displayElement) return;

            // Boş metin + imleç göster
            this.updateDisplayText('');
            this.cursorPosition = 0;
        },

        // Kullanıcı arayüzü başlangıcı
        initialize: function() {
            // Input olaylarını dinle - daha az sıklıkla güncelleme yap
            document.addEventListener('input', (e) => {
                const state = window.keyboardState.getState();
                if (state && state.currentInput === e.target) {
                    // Eğer doğrudan kontrol modundaysak, güncellemeyi atla
                    if (!this.directCursorControl) {
                        this.updateInputText(e.target);
                    }
                }
            }, true);

            // Selection değişikliklerini izle - daha az sıklıkla
            document.addEventListener('selectionchange', () => {
                // Bu olayda yapılacak bir işlem yok, tamamen pasif olarak bırakıyoruz
                // bu sayede ok tuşu işlemleri sırasında çift güncelleme olmayacak
            });

            // Ctrl+X, Ctrl+V gibi işlemleri yakalamak için
            document.addEventListener('keydown', (e) => {
                const state = window.keyboardState.getState();
                if (state && state.currentInput) {
                    // Eğer doğrudan kontrol modunda değilsek, güncellemeyi yap
                    if (!this.directCursorControl) {
                        setTimeout(() => this.updateInputText(state.currentInput), 50);
                    }
                }
            }, true);

            // Focus olayını da izle
            document.addEventListener('focus', (e) => {
                if (e.target.matches('input, textarea')) {
                    const state = window.keyboardState.getState();
                    if (state) {
                        setTimeout(() => {
                            const currentState = window.keyboardState.getState();
                            if (currentState && currentState.currentInput === e.target) {
                                this.updateInputText(e.target);
                            }
                        }, 100);
                    }
                }
            }, true);
        },
    };

    // Modülü başlat
    keyboardDisplayText.initialize();

    // Modülü global alana aktar
    window.keyboardDisplayText = keyboardDisplayText;
})();