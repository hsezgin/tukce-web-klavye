// Türkçe Web Klavyesi - Karakter Haritaları
(function() {
    // Shift ile yazılabilen karakterleri getir
    function getShiftChar(char) {
        const shiftMap = {
            '1': '!',
            '2': '\'',
            '3': '^',
            '4': '+',
            '5': '%',
            '6': '&',
            '7': '/',
            '8': '(',
            '9': ')',
            '0': '=',
            '*': '?',
            '-': '_',
            ',': ';',
            '.': ':',
            'i': 'İ'
        };
        return shiftMap[char] || '';
    }

    // AltGr ile yazılabilen karakterleri getir
    function getAltGrChar(char) {
        const altGrMap = {
            '3': '#',
            '4': '$',
            '7': '{',
            '8': '[',
            '9': ']',
            '0': '}',
            'q': '@',
            'e': '€',
            'ü': '~',
            'ğ': '¨',
            ',': '`',
            'z': '<',
            'x': '>',
            '-': '|',
            '*': '\\',
        };
        return altGrMap[char] || '';
    }

    // Global değişkenlere erişim sağla
    window.turkishKeyboardCharMaps = {
        getShiftChar: getShiftChar,
        getAltGrChar: getAltGrChar
    };
})();