// Türkçe Web Klavyesi - Yazılanları Gösterme Modülü
(function() {
    // Yazılan metni başlık bölümünde gösterme fonksiyonları
    const keyboardDisplayText = {
        // Takip edilen girdi metni
        inputText: '',
        maxDisplayLength: 100, // Gösterilecek maksimum karakter sayısı

        // Başlık metnini güncelle
        updateDisplayText: function(text) {
            const displayElement = document.getElementById('keyboard-display-text');
            if (!displayElement) return;

            // Varsayılan başlığı kaydet (ilk kez)
            if (!displayElement.getAttribute('data-default-text')) {
                displayElement.setAttribute('data-default-text', displayElement.textContent);
            }

            // Yeni metni göster
            displayElement.textContent = text || '';
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

            // Eğer metin çok uzunsa, kırp ve "..." ekle
            let displayText = this.inputText;
            if (displayText.length > this.maxDisplayLength) {
                displayText = "..." + displayText.substring(displayText.length - this.maxDisplayLength);
            }

            // Display metni güncelle
            this.updateDisplayText(displayText || '');
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
                case 'Tab':
                case 'Enter':
                case 'Boşluk':
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'ArrowUp':
                case 'ArrowDown':
                    // Pozisyon veya içerik değişebilir, güncel metni göster
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

            const defaultText = displayElement.getAttribute('data-default-text') || 'Türkçe Klavye';
            displayElement.textContent = defaultText;
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

            // Ctrl+X, Ctrl+V gibi işlemleri yakalamak için
            document.addEventListener('keydown', (e) => {
                const state = window.keyboardState.getState();
                if (state && state.currentInput) {
                    // Biraz bekle ve metni güncelle
                    setTimeout(() => this.updateInputText(state.currentInput), 50);
                }
            }, true);

            // Focus olayını da izle - input alanına odaklandığında mevcut metni göster
            document.addEventListener('focus', (e) => {
                if (e.target.matches('input, textarea')) {
                    const state = window.keyboardState.getState();
                    if (state) {
                        // Input'a odaklandığında state henüz set edilmemiş olabilir
                        // Bu sebeple bir anlık gecikme ekleyelim
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