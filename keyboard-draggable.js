// keyboard-draggable.js - Türkçe Web Klavyesi - Sürüklenebilir Klavye Modülü
// manifest.json dosyasına bu dosyayı ekleyin, "js" dizisine: "keyboard-draggable.js"
(function() {
    // Klavyeyi sürüklenebilir yapan fonksiyonlar
    const keyboardDrag = {
        // Elementi sürüklenebilir yap
        makeDraggable: function(element) {
            if (!element) return;

            // Sürükleme iptal edildi - sürükleme sorunu nedeniyle.
            // Sadece başlık çubuğunu ekle, taşıma özelliği olmadan
            let handleElement = element.querySelector('.keyboard-header');
            if (!handleElement) {
                handleElement = this.createDragHandle(element);
            }

            // Element için statik sınıfını ekle
            element.classList.add('non-draggable');

            // Handle elementi sadece gösterge için ayarla
            handleElement.style.cursor = 'default';
            handleElement.style.userSelect = 'none';
        },

        // Sürükleme için tutma kolu (handle) oluştur
        createDragHandle: function(element) {
            // Başlık çubuğu oluştur
            const headerElement = document.createElement('div');
            headerElement.className = 'keyboard-header';

            // Başlık
            const titleElement = document.createElement('div');
            titleElement.className = 'keyboard-title';
            titleElement.textContent = 'Türkçe Klavye';
            titleElement.id = 'keyboard-display-text';

            // Başlık ve düğmeleri header'a ekle
            headerElement.appendChild(titleElement);

            // Artık butonlar olmadığından özel click event'leri de kaldırıldı

            // Başlık çubuğunu elementin başına ekle
            const keyboard = element.querySelector('.turkish-keyboard');
            if (keyboard) {
                element.insertBefore(headerElement, keyboard);
            } else {
                element.appendChild(headerElement);
            }

            return headerElement;
        }
    };

    // Sürüklenebilir klavye modülünü global alana aktar
    window.keyboardDrag = keyboardDrag;
})();