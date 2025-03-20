// Türkçe Web Klavyesi - Durum Yönetimi Modülü
(function() {
    // Global durum nesnesi
    const state = {
        currentInput: null,
        keyboardElement: null,
        isKeyboardVisible: false,
        isShiftActive: false,
        isCapsActive: false,
        isAltGrActive: false,
        isControlActive: false,
        isEditMenuVisible: false,
        editRowElement: null,
        rightDiv: null,
        documentClickListener: null,
        lastKeyboardOpenTime: 0,
        inputHistory: {},
        maxHistoryLength: 20, // Her input alanı için maksimum tarihçe uzunluğu
        undoEnabled: true // Geri al özelliğini açıp kapatmak için
    };

    // Dışa aktarılacak durum API'si
    const keyboardState = {
        getState: function() {
            return state;
        },
        setCurrentInput: function(input) {
            state.currentInput = input;
        },
        setKeyboardElement: function(element) {
            state.keyboardElement = element;
        },
        setKeyboardVisibility: function(isVisible) {
            state.isKeyboardVisible = isVisible;
        },
        toggleShiftActive: function() {
            state.isShiftActive = !state.isShiftActive;
            return state.isShiftActive;
        },
        toggleCapsActive: function() {
            state.isCapsActive = !state.isCapsActive;
            return state.isCapsActive;
        },
        toggleAltGrActive: function() {
            state.isAltGrActive = !state.isAltGrActive;
            return state.isAltGrActive;
        },
        toggleControlActive: function() {
            state.isControlActive = !state.isControlActive;
            return state.isControlActive;
        },
        resetModifierKeys: function() {
            state.isShiftActive = false;
            state.isAltGrActive = false;
            state.isControlActive = false;
        },
        // Input tarihçesi ile ilgili API
        getOrCreateInputHistory: function(inputId) {
            if (!state.inputHistory[inputId]) {
                state.inputHistory[inputId] = {
                    states: [],
                    currentIndex: -1
                };
            }
            return state.inputHistory[inputId];
        },
        addHistoryState: function(inputId, newState) {
            if (!state.undoEnabled) return;

            const history = this.getOrCreateInputHistory(inputId);

            // Aynı değişikliği arka arkaya kaydetmeyi önle
            const lastState = history.states[history.currentIndex];
            if (lastState && lastState.text === newState.text) {
                return;
            }

            // Eğer tarihçede ileri geri yapıldıysa, o noktadan sonrasını sil
            if (history.currentIndex < history.states.length - 1) {
                history.states = history.states.slice(0, history.currentIndex + 1);
            }

            // Yeni durumu ekle
            history.states.push(newState);
            history.currentIndex = history.states.length - 1;

            // Tarihçenin maksimum uzunluğunu aşmamasını sağla
            if (history.states.length > state.maxHistoryLength) {
                history.states.shift();
                history.currentIndex--;
            }
        }
    };

    // Keyboard durum modülünü global alana aktar
    window.keyboardState = keyboardState;
})();