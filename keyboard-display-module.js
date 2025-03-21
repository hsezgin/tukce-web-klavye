// keyboard-display-module.js dosyası için gelişmiş imleç desteği

// Türkçe Web Klavyesi - Yazılanları Gösterme Modülü
(function() {
    // Yazılan metni başlık bölümünde gösterme fonksiyonları
    const keyboardDisplayText = {
        // Takip edilen girdi metni
        inputText: '',
        maxDisplayLength: 100, // Gösterilecek maksimum karakter sayısı
        cursorPosition: 0,     // İmleç pozisyonu (kaçıncı karakterden sonra)

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
                `;
                document.head.appendChild(style);
            }
        },

        // Başlık metnini güncelle
        updateDisplayText: function(text) {
            const displayElement = document.getElementById('keyboard-display-text');
            if (!displayElement) return;

            // Varsayılan başlığı sadece ilk seferinde ayarla (boş metin olacak)
            if (!displayElement.getAttribute('data-default-text')) {
                displayElement.setAttribute('data-default-text', '');
            }

            // İmleç için CSS ekle
            this.addCursorStyle();

            // Metni ve imleci göster
            if (text) {
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
                    const prefixNode = document.createTextNode(prefix);
                    displayElement.appendChild(prefixNode);
                }

                // İmleç ekle
                const cursor = document.createElement('span');
                cursor.className = 'keyboard-cursor';
                displayElement.appendChild(cursor);

                // Son kısmı ekle
                if (suffix) {
                    const suffixNode = document.createTextNode(suffix);
                    displayElement.appendChild(suffixNode);
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

        // İmleç pozisyonunu ayarla
        setCursorPosition: function(position, inputElement) {
            if (!inputElement) return;

            // Mevcut metnin uzunluğuna göre imleç pozisyonunu sınırla
            const maxPos = inputElement.value ? inputElement.value.length : 0;
            position = Math.max(0, Math.min(position, maxPos));

            this.cursorPosition = position;

            // Input elementinin imleç pozisyonunu güncelle
            if (inputElement.setSelectionRange) {
                try {
                    inputElement.setSelectionRange(position, position);
                } catch (e) {
                    console.warn("Seçim aralığı ayarlanamadı:", e);
                }
            }

            // Display metnini güncelle
            this.updateInputText(inputElement);
        },

        // İmleci sola hareket ettir
        moveCursorLeft: function(inputElement) {
            if (!inputElement) return;

            // İmleç pozisyonunu bir sola kaydır (0'dan küçük olamaz)
            const newPosition = Math.max(0, this.cursorPosition - 1);
            this.setCursorPosition(newPosition, inputElement);
        },

        // İmleci sağa hareket ettir
        moveCursorRight: function(inputElement) {
            if (!inputElement) return;

            // İmleç pozisyonunu bir sağa kaydır (metin uzunluğundan büyük olamaz)
            const maxPos = inputElement.value ? inputElement.value.length : 0;
            const newPosition = Math.min(maxPos, this.cursorPosition + 1);
            this.setCursorPosition(newPosition, inputElement);
        },

        // Girdi metnini güncelle ve göster
        updateInputText: function(inputElement) {
            if (!inputElement) return;

            // Eğer input type="password" ise, metin gösterme
            if (inputElement.type === 'password') {
                this.updateDisplayText('********');
                return;
            }

            // Mevcut texti al
            this.inputText = inputElement.value || '';

            // İmleç pozisyonunu güncelle
            if (inputElement.selectionStart !== undefined) {
                try {
                    this.cursorPosition = inputElement.selectionStart;
                } catch (e) {
                    console.warn("selectionStart okunamadı:", e);
                }
            }

            // Display metnini güncelle
            this.updateDisplayText(this.inputText || '');
        },

        // Yeni karakter ekle
        addCharacter: function(char, inputElement) {
            if (!inputElement) return;

            // Metni güncelle
            this.updateInputText(inputElement);
        },

        // Karakter sil
        removeCharacter: function(inputElement) {
            if (!inputElement) return;

            // Metni güncelle
            this.updateInputText(inputElement);
        },

        // Yazılan karakteri işle
        handleKeyPress: function(key, inputElement) {
            if (!inputElement) return;

            // Şifre alanları için özel işlem
            if (inputElement.type === 'password') {
                this.updateDisplayText('**** Şifre Yazılıyor ****');
                return;
            }

            // Özel tuşları işle
            switch (key) {
                case 'Sil':
                    // Pozisyon veya içerik değişebilir, güncel metni göster
                    setTimeout(() => this.updateInputText(inputElement), 50);
                    break;

                case 'ArrowLeft':
                    // İmleci sola hareket ettir
                    this.moveCursorLeft(inputElement);
                    break;

                case 'ArrowRight':
                    // İmleci sağa hareket ettir
                    this.moveCursorRight(inputElement);
                    break;

                case 'Tab':
                case 'Enter':
                case 'Boşluk':
                case 'ArrowUp':
                case 'ArrowDown':
                    // Diğer özel tuşlar için mevcut metni göster
                    setTimeout(() => this.updateInputText(inputElement), 50);
                    break;

                case 'Shift':
                case 'Caps':
                case 'AltGr':
                case 'Control':
                case 'Kapat':
                    // Bu tuşlar metni değiştirmez, bir şey yapma
                    break;

                default:
                    // Normal karakter, bir süre bekle ve güncel metni göster (yazılması için)
                    setTimeout(() => this.updateInputText(inputElement), 50);
            }
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
            // Input olaylarını dinle
            document.addEventListener('input', (e) => {
                const state = window.keyboardState.getState();
                if (state && state.currentInput === e.target) {
                    this.updateInputText(e.target);
                }
            }, true);

            // Selection değişikliklerini izle
            document.addEventListener('selectionchange', () => {
                const state = window.keyboardState.getState();
                if (state && state.currentInput && document.activeElement === state.currentInput) {
                    this.updateInputText(state.currentInput);
                }
            });

            // Ctrl+X, Ctrl+V gibi işlemleri yakalamak için
            document.addEventListener('keydown', (e) => {
                const state = window.keyboardState.getState();
                if (state && state.currentInput) {
                    setTimeout(() => this.updateInputText(state.currentInput), 50);
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