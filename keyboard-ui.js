// Türkçe Web Klavyesi - Arayüz İşlemleri
(function() {
    // Dışa aktarılacak UI fonksiyonları
    const keyboardUI = {
        createKeyboardElement,
        positionKeyboard
    };

    // Klavyeyi oluştur
    function createKeyboardElement() {
        // Karakter haritaları modülünü kullan
        const charMaps = window.turkishKeyboardCharMaps || {};

        // Ana klavye konteyneri
        const keyboardElement = document.createElement('div');
        keyboardElement.id = 'turkish-web-keyboard';
        keyboardElement.className = 'turkish-keyboard-container';

        // Klavye düzeni
        const rows = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '-', 'Sil'],
            ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
            ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i',',', 'Enter'],
            ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', '.']
        ];

        const keyboard = document.createElement('div');
        keyboard.className = 'turkish-keyboard';

        // Satırları ve tuşları oluştur
        rows.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';

            row.forEach(keyText => {
                const keyElement = document.createElement('button');
                keyElement.className = 'keyboard-key';
                keyElement.textContent = keyText;
                keyElement.setAttribute('data-key', keyText);
                keyElement.type = 'button';

                // Özel tuşlar için sınıf ekle
                if (['Sil', 'Shift', 'Caps', 'Tab', 'Enter'].includes(keyText)) {
                    keyElement.classList.add('keyboard-special-key');

                    if (keyText === 'Tab') {
                        keyElement.classList.add('keyboard-tab-btn');
                    }

                    if (keyText === 'Enter') {
                        keyElement.classList.add('keyboard-enter-btn');
                    }

                    if (keyText === 'Shift') {
                        keyElement.classList.add('keyboard-shift-btn');
                    }
                    if (keyText === 'Caps') {
                        keyElement.textContent = 'caps'; // Her zaman küçük harfle başlasın
                    } else {
                        keyElement.textContent = keyText;
                    }
                    keyElement.setAttribute('data-key', keyText);
                    keyElement.type = 'button';
                }

                // Shift karakterlerini ekle
                if (keyText.length === 1 && '1234567890*-,.'.includes(keyText)) {
                    const shiftChar = charMaps.getShiftChar(keyText);
                    if (shiftChar) {
                        const shiftCharSpan = document.createElement('span');
                        shiftCharSpan.className = 'key-shift-char';
                        shiftCharSpan.textContent = shiftChar;
                        keyElement.appendChild(shiftCharSpan);
                    }
                }

                // AltGr karakterlerini ekle - tüm tuşlar için
                if (keyText.length === 1) {
                    const altGrChar = charMaps.getAltGrChar(keyText);
                    if (altGrChar) {
                        const altGrCharSpan = document.createElement('span');
                        altGrCharSpan.className = 'key-altgr-char';
                        altGrCharSpan.textContent = altGrChar;
                        keyElement.appendChild(altGrCharSpan);
                    }
                }

                // Tuş tıklama olayına olay yayılmasını durdurma özelliği ekle
                keyElement.addEventListener('click', function(e) {
                    e.stopPropagation(); // Tıklama olayının belgeye ulaşmasını engelle
                    window.keyboardInput.handleKeyPress(keyText);

                });

                rowElement.appendChild(keyElement);
            });

            // Sağ Shift ekle - 4. satır (indeks 3) için
            if (rowIndex === 3) {
                const rightShiftElement = document.createElement('button');
                rightShiftElement.className = 'keyboard-key keyboard-special-key keyboard-shift-btn';
                rightShiftElement.textContent = 'Shift';
                rightShiftElement.setAttribute('data-key', 'Shift');
                rightShiftElement.type = 'button';
                rightShiftElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    window.keyboardCore.handleKeyPress('Shift');
                });
                rowElement.appendChild(rightShiftElement);
            }

            keyboard.appendChild(rowElement);
        });

        // Son satırı oluştur - Control, yön tuşları, boşluk, altgr ve kapat tuşları
        const lastRowElement = document.createElement('div');
        lastRowElement.className = 'keyboard-row keyboard-last-row';

        // Control tuşu - sol tarafta
        const controlContainer = document.createElement('div');
        controlContainer.className = 'keyboard-control-container';

        const controlButton = document.createElement('button');
        controlButton.className = 'keyboard-key keyboard-special-key keyboard-control-btn';
        controlButton.textContent = 'Ctrl';
        controlButton.setAttribute('data-key', 'Control');
        controlButton.setAttribute('data-ignore-transforms', 'true');
        controlButton.type = 'button';
        controlButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.handleKeyPress('Control');
        });

        controlContainer.appendChild(controlButton);

        // Sol ok tuşu
        const leftArrowContainer = document.createElement('div');
        leftArrowContainer.className = 'keyboard-arrow-container';

        const leftArrow = document.createElement('button');
        leftArrow.className = 'keyboard-key keyboard-special-key keyboard-arrow-key';
        leftArrow.innerHTML = '&#9668;'; // Unicode sol ok
        leftArrow.setAttribute('data-arrow-key', 'ArrowLeft');
        leftArrow.setAttribute('data-ignore-transforms', 'true');
        leftArrow.type = 'button';
        leftArrow.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.handleKeyPress('ArrowLeft');
        });

        leftArrowContainer.appendChild(leftArrow);

        // Aşağı ok tuşu
        const downArrowContainer = document.createElement('div');
        downArrowContainer.className = 'keyboard-arrow-container';

        const downArrow = document.createElement('button');
        downArrow.className = 'keyboard-key keyboard-special-key keyboard-arrow-key';
        downArrow.innerHTML = '&#9660;'; // Unicode aşağı ok
        downArrow.setAttribute('data-arrow-key', 'ArrowDown');
        downArrow.setAttribute('data-ignore-transforms', 'true');
        downArrow.type = 'button';
        downArrow.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.handleKeyPress('ArrowDown');
        });

        downArrowContainer.appendChild(downArrow);

        // Yukarı ok tuşu
        const upArrowContainer = document.createElement('div');
        upArrowContainer.className = 'keyboard-arrow-container';

        const upArrow = document.createElement('button');
        upArrow.className = 'keyboard-key keyboard-special-key keyboard-arrow-key';
        upArrow.innerHTML = '&#9650;'; // Unicode yukarı ok
        upArrow.setAttribute('data-arrow-key', 'ArrowUp');
        upArrow.setAttribute('data-ignore-transforms', 'true');
        upArrow.type = 'button';
        upArrow.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.handleKeyPress('ArrowUp');
        });

        upArrowContainer.appendChild(upArrow);

        // Sağ ok tuşu
        const rightArrowContainer = document.createElement('div');
        rightArrowContainer.className = 'keyboard-arrow-container';

        const rightArrow = document.createElement('button');
        rightArrow.className = 'keyboard-key keyboard-special-key keyboard-arrow-key';
        rightArrow.innerHTML = '&#9658;'; // Unicode sağ ok
        rightArrow.setAttribute('data-arrow-key', 'ArrowRight');
        rightArrow.setAttribute('data-ignore-transforms', 'true');
        rightArrow.type = 'button';
        rightArrow.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.handleKeyPress('ArrowRight');
        });

        rightArrowContainer.appendChild(rightArrow);

        // Boşluk tuşu - ortada
        const spaceContainer = document.createElement('div');
        spaceContainer.className = 'keyboard-space-container';

        const spaceButton = document.createElement('button');
        spaceButton.className = 'keyboard-key keyboard-special-key keyboard-space-btn';
        spaceButton.textContent = 'Boşluk';
        spaceButton.setAttribute('data-key', 'Boşluk');
        spaceButton.type = 'button';
        spaceButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.handleKeyPress('Boşluk');
        });

        spaceContainer.appendChild(spaceButton);

        // AltGr tuşu - sağ tarafta
        const altGrContainer = document.createElement('div');
        altGrContainer.className = 'keyboard-altgr-container';

        const altGrButton = document.createElement('button');
        altGrButton.className = 'keyboard-key keyboard-special-key keyboard-altgr-btn';
        altGrButton.textContent = 'AltGr';
        altGrButton.setAttribute('data-key', 'AltGr');
        altGrButton.type = 'button';
        altGrButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.handleKeyPress('AltGr');
        });

        altGrContainer.appendChild(altGrButton);

        // Kapat tuşu - en sağda
        const closeButtonContainer = document.createElement('div');
        closeButtonContainer.className = 'keyboard-close-container';

        const closeButton = document.createElement('button');
        closeButton.className = 'keyboard-key keyboard-special-key keyboard-close-btn';
        closeButton.textContent = 'Kapat';
        closeButton.setAttribute('data-key', 'Kapat');
        closeButton.type = 'button';
        closeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.keyboardCore.hideKeyboard();
        });

        closeButtonContainer.appendChild(closeButton);

        // Elemanları sıraya ekle
        lastRowElement.appendChild(controlContainer);
        lastRowElement.appendChild(leftArrowContainer);
        lastRowElement.appendChild(downArrowContainer);
        lastRowElement.appendChild(upArrowContainer);
        lastRowElement.appendChild(rightArrowContainer);
        lastRowElement.appendChild(spaceContainer);
        lastRowElement.appendChild(altGrContainer);
        lastRowElement.appendChild(closeButtonContainer);

        keyboard.appendChild(lastRowElement);

        // Düzenleme menüsünü oluştur
        const editMenuElement = window.keyboardEditMenu.createEditMenu();
        keyboard.appendChild(editMenuElement);

        keyboardElement.appendChild(keyboard);

        // Klavye içine tıklandığında olayın belgeye yayılmasını engelle
        keyboardElement.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        document.body.appendChild(keyboardElement);

        // Klavye oluşturulduktan sonra özel karakterlerin doğru görünmesini sağla
        setTimeout(function() {
            // Eğer main.js'de tanımlı ise bu fonksiyonu çağır
            if (typeof window.createShiftAndAltGrChars === 'function') {
                window.createShiftAndAltGrChars();
            }
        }, 50);

        // Pencere yeniden boyutlandırıldığında klavyeyi yeniden konumlandır
        window.addEventListener('resize', function() {
            const keyboardState = window.keyboardCore.getState();
            if (keyboardState.isKeyboardVisible && keyboardState.currentInput) {
                positionKeyboard(keyboardState.keyboardElement, keyboardState.currentInput);
            }
        });

        // Klavye oluşturuldu, UI ve Düzenleme menüsü modüllerine erişim için referansları kaydet
        const state = window.keyboardCore.getState();
        state.keyboardElement = keyboardElement;
        state.editRowElement = editMenuElement;

        return keyboardElement;
    }

    // Klavyeyi konumlandır
    function positionKeyboard(keyboardElement, inputElement) {
        if (!keyboardElement || !inputElement) return;

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Klavye boyutlarını al
        const keyboardHeight = keyboardElement.offsetHeight || 320;
        const keyboardWidth = keyboardElement.offsetWidth || 900;

        // Input alanının konumunu al
        const rect = inputElement.getBoundingClientRect();

        // Mobil cihaz kontrolü
        const isMobile = window.innerWidth <= 900 || 'ontouchstart' in window;

        if (isMobile) {
            // Mobil cihazlarda klavye ekranın en altında olsun
            keyboardElement.style.position = 'fixed';
            keyboardElement.style.top = 'auto';
            keyboardElement.style.bottom = '0';
            keyboardElement.style.left = '0';
            keyboardElement.style.right = '0';
            keyboardElement.style.width = '100%';
            keyboardElement.style.transform = 'none';
            keyboardElement.style.maxHeight = `${viewportHeight * 0.5}px`;

            // Form alanı görünür olsun diye sayfayı kaydır
            setTimeout(() => {
                const scrollAmount = Math.max(0, rect.top - 100);
                window.scrollTo({
                    top: scrollAmount,
                    behavior: 'smooth'
                });
            }, 50);

            return;
        }

        // Klavyenin ekranın alt kısmına sığıp sığmayacağını kontrol et
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Input alanının görünür durumda olması için minimum boşluk
        const minInputVisibility = 30; // px

        // Ekranın altında yeterli alan yoksa, klavyeyi üstte konumlandır
        if (spaceBelow < keyboardHeight && spaceAbove > keyboardHeight) {
            // Input alanının üstüne konumlandır
            keyboardElement.style.position = 'fixed';
            keyboardElement.style.bottom = `${viewportHeight - rect.top + 10}px`;
            keyboardElement.style.top = 'auto';
        }
        // Ekranın altında yeterli alan varsa veya üstte de yeterli alan yoksa
        else {
            // Input alanının altına konumlandır, ancak ekranın dışına taşmasını engelle
            keyboardElement.style.position = 'fixed';

            // Klavyenin üst pozisyonunu, ekranın dışına taşmadan ayarla
            const topPosition = Math.min(rect.bottom + 10, viewportHeight - keyboardHeight - 10);
            keyboardElement.style.top = `${topPosition}px`;
            keyboardElement.style.bottom = 'auto';

            // Input alanı görünür değilse, sayfayı kaydır
            if (rect.bottom + minInputVisibility > topPosition) {
                setTimeout(() => {
                    const scrollAmount = window.scrollY + rect.top - minInputVisibility;
                    window.scrollTo({
                        top: scrollAmount,
                        behavior: 'smooth'
                    });
                }, 50);
            }
        }

        // Yatayda merkeze hizala, ancak ekrandan taşmasını engelle
        const leftPos = Math.max(10, Math.min(
            rect.left + (rect.width / 2) - (keyboardWidth / 2),
            viewportWidth - keyboardWidth - 10
        ));
        keyboardElement.style.left = `${leftPos}px`;

        // Ekran çok küçükse klavyeyi küçült
        if (viewportHeight < 600 || viewportWidth < 800) {
            keyboardElement.style.transform = 'scale(0.85)';
            keyboardElement.style.transformOrigin = 'center bottom';
        } else {
            keyboardElement.style.transform = 'none';
        }
    }

    // Klavye UI modülünü globale aktar
    window.keyboardUI = keyboardUI;
})();