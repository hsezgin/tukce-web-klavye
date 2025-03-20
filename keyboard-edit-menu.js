// keyboard-edit-menu.js modülünde yapılacak değişiklikler

// Modülü temel bir yapıya dönüştürün, çünkü artık Control tuşu bu işlevleri üstlenecek
(function() {
    // Dışa aktarılacak düzenleme menüsü fonksiyonları
    const keyboardEditMenu = {
        createEditMenu,
        hideEditMenu
    };

    // Boş bir düzenleme menüsü oluştur (artık gerekli değil, sadece uyumluluk için)
    function createEditMenu() {
        // Boş bir div döndür - artık kullanılmayacak
        const emptyDiv = document.createElement('div');
        emptyDiv.style.display = 'none';
        return emptyDiv;
    }

    // Düzenleme menüsünü gizle (artık gerekli değil, sadece uyumluluk için)
    function hideEditMenu() {
        // Artık bir şey yapmaya gerek yok
        return;
    }

    // Klavye düzenleme menüsü modülünü globale aktar
    window.keyboardEditMenu = keyboardEditMenu;
})();