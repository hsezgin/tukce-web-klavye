// Türkçe Web Klavyesi - Tarihçe Yönetimi Modülü
(function() {
    // Tarihçe yönetimi fonksiyonları
    const keyboardHistory = {
        // Input elemanını izlemeye başla
        setupInputChangeListener: function(inputElement) {
            if (!inputElement || inputElement.getAttribute('data-history-setup')) {
                return; // Zaten kurulu veya geçersiz eleman
            }

            const state = window.keyboardState.getState();
            const inputId = inputElement.id || 'anonymous-' + Math.random().toString(36).substr(2, 9);

            // Başlangıç durumunu kaydet
            const initialState = {
                text: inputElement.value,
                selectionStart: inputElement.selectionStart || 0,
                selectionEnd: inputElement.selectionEnd || 0,
                timestamp: Date.now()
            };

            const history = window.keyboardState.getOrCreateInputHistory(inputId);
            history.states = [initialState];
            history.currentIndex = 0;

            // Input olayını dinle
            inputElement.addEventListener('input', function(e) {
                // Yeni durum
                const newState = {
                    text: inputElement.value,
                    selectionStart: inputElement.selectionStart || 0,
                    selectionEnd: inputElement.selectionEnd || 0,
                    timestamp: Date.now()
                };

                window.keyboardState.addHistoryState(inputId, newState);
            });

            // Bu input için kurulumun tamamlandığını işaretle
            inputElement.setAttribute('data-history-setup', 'true');
        },

        // Geri alma (Undo) fonksiyonu
        performUndo: function(inputElement) {
            if (!inputElement) return false;

            const state = window.keyboardState.getState();
            const inputId = inputElement.id || 'anonymous-input';
            const history = state.inputHistory[inputId];

            if (!history || history.currentIndex <= 0) {
                return false; // Tarihçe yok veya ilk durumdayız
            }

            history.currentIndex--;
            const previousState = history.states[history.currentIndex];

            // Önceki durumu geri yükle
            inputElement.value = previousState.text;
            inputElement.selectionStart = previousState.selectionStart;
            inputElement.selectionEnd = previousState.selectionEnd;

            return true;
        },

        // İleri alma (Redo) fonksiyonu
        performRedo: function(inputElement) {
            if (!inputElement) return false;

            const state = window.keyboardState.getState();
            const inputId = inputElement.id || 'anonymous-input';
            const history = state.inputHistory[inputId];

            if (!history || history.currentIndex >= history.states.length - 1) {
                return false; // Tarihçe yok veya son durumdayız
            }

            history.currentIndex++;
            const nextState = history.states[history.currentIndex];

            // Sonraki durumu yükle
            inputElement.value = nextState.text;
            inputElement.selectionStart = nextState.selectionStart;
            inputElement.selectionEnd = nextState.selectionEnd;

            return true;
        },

        // Control+Z işlemi
        handleControlZ: function(inputElement) {
            try {
                // Odağı kontrol et
                inputElement.focus();

                // Önce tarayıcının kendi undo fonksiyonunu dene
                let result = document.execCommand('undo');

                // Başarısız olduysa kendi undo sistemimizi kullan
                if (!result) {
                    result = this.performUndo(inputElement);

                    if (result) {
                        // Input olayını tetikle
                        const event = new Event('input', { bubbles: true });
                        inputElement.dispatchEvent(event);
                    }
                }
            } catch (e) {
                console.error('Geri alma hatası:', e);

                // Hata durumunda kendi undo sistemimizi dene
                const undoResult = this.performUndo(inputElement);

                if (undoResult) {
                    // Input olayını tetikle
                    const event = new Event('input', { bubbles: true });
                    inputElement.dispatchEvent(event);
                }
            }

            return true;
        },

        // Control+Y işlemi
        handleControlY: function(inputElement) {
            try {
                inputElement.focus();

                // Tarayıcının redo komutunu dene
                let result = document.execCommand('redo');

                // Başarısız olduysa kendi redo sistemimizi kullan
                if (!result) {
                    result = this.performRedo(inputElement);

                    if (result) {
                        // Input olayını tetikle
                        const event = new Event('input', { bubbles: true });
                        inputElement.dispatchEvent(event);
                    }
                }
            } catch (e) {
                console.error('İleri alma hatası:', e);

                // Hata durumunda kendi redo sistemimizi dene
                const redoResult = this.performRedo(inputElement);

                if (redoResult) {
                    // Input olayını tetikle
                    const event = new Event('input', { bubbles: true });
                    inputElement.dispatchEvent(event);
                }
            }

            return true;
        }
    };

    // Tarihçe modülünü global alana aktar
    window.keyboardHistory = keyboardHistory;
})();