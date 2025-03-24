// Türkçe Web Klavyesi - Görünüm Yönetimi Modülü
(function() {
    // Klavye görünümü için fonksiyonlar
    const keyboardDisplay = {
        // Tuşların görünümünü güncelle
        updateKeyDisplay: function() {
            try {
                const state = window.keyboardState.getState();
                const charMaps = window.turkishKeyboardCharMaps || {};

                if (!state) {
                    console.warn('Klavye durumu alınamadı');
                    return;
                }

                // Shift, Caps ve diğer tuşların aktif durumlarını güncelle
                const capsKey = document.querySelector('.keyboard-key[data-key="Caps"]');
                const altGrKey = document.querySelector('.keyboard-key[data-key="AltGr"]');
                const controlKey = document.querySelector('.keyboard-key[data-key="Control"]');

                // Tüm Shift tuşlarını güncelle
                const shiftKeys = document.querySelectorAll('.keyboard-key[data-key="Shift"]');
                if (shiftKeys) {
                    shiftKeys.forEach(key => {
                        try {
                            if (state.isShiftActive) {
                                key.classList.add('keyboard-active');
                            } else {
                                key.classList.remove('keyboard-active');
                            }
                        } catch (e) {
                            console.warn(`Tuş içeriği güncellenirken hata: ${e.message}`);
                        }
                    });
                }

                if (capsKey) {
                    if (state.isCapsActive) {
                        capsKey.classList.add('keyboard-active');
                        capsKey.textContent = 'CAPS';
                    } else {
                        capsKey.classList.remove('keyboard-active');
                        capsKey.textContent = 'caps';
                    }
                }

                if (altGrKey) {
                    if (state.isAltGrActive) {
                        altGrKey.classList.add('keyboard-active');
                    } else {
                        altGrKey.classList.remove('keyboard-active');
                    }
                }

                if (controlKey) {
                    if (state.isControlActive) {
                        controlKey.classList.add('keyboard-active');
                    } else {
                        controlKey.classList.remove('keyboard-active');
                    }
                }

                // Klavye container'ına durum sınıflarını ekle
                if (state.keyboardElement) {
                    // Shift durumu
                    if (state.isShiftActive) {
                        state.keyboardElement.classList.add('shift-active');
                    } else {
                        state.keyboardElement.classList.remove('shift-active');
                    }

                    // Caps Lock durumu
                    if (state.isCapsActive) {
                        state.keyboardElement.classList.add('caps-active');
                    } else {
                        state.keyboardElement.classList.remove('caps-active');
                    }

                    // AltGr durumu
                    if (state.isAltGrActive) {
                        state.keyboardElement.classList.add('altgr-active');
                    } else {
                        state.keyboardElement.classList.remove('altgr-active');
                    }

                    // Control durumu
                    if (state.isControlActive) {
                        state.keyboardElement.classList.add('control-active');
                    } else {
                        state.keyboardElement.classList.remove('control-active');
                    }
                }

                // Control tuşu aktifken özel tuşları vurgula
                const zKey = document.querySelector('.keyboard-key[data-key="z"]');
                const xKey = document.querySelector('.keyboard-key[data-key="x"]');
                const cKey = document.querySelector('.keyboard-key[data-key="c"]');
                const aKey = document.querySelector('.keyboard-key[data-key="a"]');
                const vKey = document.querySelector('.keyboard-key[data-key="v"]');

                // Control aktifse vurgula
                if (state.isControlActive) {
                    if (zKey) zKey.classList.add('control-key-highlight');
                    if (xKey) xKey.classList.add('control-key-highlight');
                    if (cKey) cKey.classList.add('control-key-highlight');
                    if (aKey) aKey.classList.add('control-key-highlight');
                    if (vKey) vKey.classList.add('control-key-highlight');
                } else {
                    // Control aktif değilse vurguyu kaldır
                    if (zKey) zKey.classList.remove('control-key-highlight');
                    if (xKey) xKey.classList.remove('control-key-highlight');
                    if (cKey) cKey.classList.remove('control-key-highlight');
                    if (aKey) aKey.classList.remove('control-key-highlight');
                    if (vKey) vKey.classList.remove('control-key-highlight');
                }

                // Tüm tuşları kontrol et
                const keys = document.querySelectorAll('.keyboard-key');
                if (!keys || keys.length === 0) {
                    console.warn('Klavye tuşları bulunamadı');
                    return;
                }

                keys.forEach(key => {
                    const originalKey = key.getAttribute('data-key');
                    if (!originalKey) return;

                    // Özel tuşları atla
                    if (['Sil', 'Shift', 'Caps', 'Tab', 'Enter', 'AltGr', 'Boşluk', 'Kapat', 'Control', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(originalKey)) {
                        return;
                    }

                    // Ok tuşlarını atla
                    if (key.hasAttribute('data-arrow-key')) {
                        return;
                    }

                    try {
                        // Her zaman tuşun içeriğini temizle ve normal duruma getir - bu önemli!
                        key.classList.remove('shift-char-active', 'altgr-char-active');
                        key.innerHTML = '';

                        // Ardından ilgili durumlara göre içeriği ayarla
                        if (state.isAltGrActive) {
                            const altGrChar = charMaps.getAltGrChar(originalKey);
                            if (altGrChar) {
                                // Ana içeriği AltGr karakteri olarak değiştir
                                // Yeni bir span ile aktif karakteri göster
                                const activeCharSpan = document.createElement('span');
                                activeCharSpan.className = 'active-char';
                                activeCharSpan.textContent = altGrChar;
                                activeCharSpan.style.color = '#aaffaa';  // Yeşil renk
                                activeCharSpan.style.fontSize = '24px';
                                // kalın stil kaldırıldı
                                activeCharSpan.style.textShadow = '0 0 3px rgba(170, 255, 170, 0.5)';

                                key.appendChild(activeCharSpan);
                                key.classList.add('altgr-char-active');
                            } else {
                                // AltGr karakteri yoksa normal karakteri göster
                                key.textContent = originalKey.toLowerCase();
                            }
                        }
                        // Shift aktifken
                        else if (state.isShiftActive) {
                            // Rakamları ve noktalama işaretlerini güncelle
                            if ('1234567890*-,.'.includes(originalKey)) {
                                const shiftChar = charMaps.getShiftChar(originalKey);
                                if (shiftChar) {
                                    // Yeni bir span ile aktif karakteri göster
                                    const activeCharSpan = document.createElement('span');
                                    activeCharSpan.className = 'active-char';
                                    activeCharSpan.textContent = shiftChar;
                                    activeCharSpan.style.color = '#ffcc00';  // Sarı renk
                                    activeCharSpan.style.fontSize = '24px';
                                    // kalın stil kaldırıldı
                                    activeCharSpan.style.textShadow = '0 0 3px rgba(255, 204, 0, 0.5)';

                                    key.appendChild(activeCharSpan);
                                    key.classList.add('shift-char-active');
                                }
                            }
                            // Harfler için büyük/küçük harfi düzenle
                            else if (originalKey.match(/[a-zçğıöşü]/i)) {
                                if (state.isCapsActive) {
                                    // Türkçe i/I karakteri kontrolü
                                    if (originalKey.toLowerCase() === 'i') {
                                        key.textContent = 'i';
                                    } else if (originalKey.toLowerCase() === 'ı') {
                                        key.textContent = 'ı';
                                    } else {
                                        key.textContent = originalKey.toLowerCase();
                                    }
                                } else {
                                    // Türkçe i/I karakteri kontrolü
                                    if (originalKey.toLowerCase() === 'i') {
                                        key.textContent = 'İ';
                                    } else if (originalKey.toLowerCase() === 'ı') {
                                        key.textContent = 'I';
                                    } else {
                                        key.textContent = originalKey.toUpperCase();
                                    }
                                }
                            } else {
                                // Diğer karakterler için normal görünüm
                                key.textContent = originalKey;
                            }
                        }
                        // Normal durum veya Caps Lock
                        else {
                            // Ana karakteri ekle
                            const mainText = document.createTextNode(
                                state.isCapsActive && originalKey.match(/[a-zçğıöşü]/i)
                                    ? (originalKey.toLowerCase() === 'i'
                                        ? 'İ'
                                        : (originalKey.toLowerCase() === 'ı'
                                            ? 'I'
                                            : originalKey.toUpperCase()))
                                    : originalKey.toLowerCase()
                            );

                            key.appendChild(mainText);

                            // Shift karakterini ekle
                            if ('1234567890*-,.'.includes(originalKey)) {
                                const shiftChar = charMaps.getShiftChar(originalKey);
                                if (shiftChar) {
                                    const newShiftCharSpan = document.createElement('span');
                                    newShiftCharSpan.className = 'key-shift-char';
                                    newShiftCharSpan.textContent = shiftChar;
                                    key.appendChild(newShiftCharSpan);
                                }
                            }

                            // AltGr karakterini ekle
                            const altGrChar = charMaps.getAltGrChar(originalKey);
                            if (altGrChar) {
                                const newAltGrCharSpan = document.createElement('span');
                                newAltGrCharSpan.className = 'key-altgr-char';
                                newAltGrCharSpan.textContent = altGrChar;
                                key.appendChild(newAltGrCharSpan);
                            }
                        }
                    } catch (err) {
                        console.warn(`Tuş güncellenirken hata: ${err.message}`);
                    }
                });

            } catch (e) {
                console.error(`Klavye görünümü güncellenirken hata: ${e.message}`);
            }
        },

        // Klavyeyi göster
        showKeyboard: function() {
            try {
                const state = window.keyboardState.getState();
                if (!state) {
                    console.warn('Klavye durumu alınamadı');
                    return;
                }

                // Klavye elementi var mı kontrol et
                if (!state.keyboardElement) {
                    try {
                        state.keyboardElement = this.createKeyboard();
                        if (!state.keyboardElement) {
                            console.error('Klavye oluşturulamadı');
                            return;
                        }
                    } catch (e) {
                        console.error(`Klavye oluşturulurken hata: ${e.message}`);
                        return;
                    }
                }

                state.lastKeyboardOpenTime = Date.now();
            
            // Görüntüleme metni için başlığı güncelle (varsa)
            if (window.keyboardDisplayText && state.currentInput) {
                try {
                    window.keyboardDisplayText.updateInputText(state.currentInput);
                    console.log('Başlık metni güncellendi - Kısa süre içinde görünecek');
                } catch (e) {
                    console.error('Başlık metni güncellenirken hata:', e);
                }
            }

                // Eğer klavye manuel olarak konumlandırılmışsa, bu konumu koru ve sadece görünür yap
                if (state.keyboardElement.hasAttribute('data-manually-positioned')) {
                    // Klavyeyi görünür yap ancak pozisyonunu değiştirme
                    state.keyboardElement.style.display = 'block';
                    state.keyboardElement.style.opacity = '1';
                    state.keyboardElement.style.visibility = 'visible';
                    window.keyboardState.setKeyboardVisibility(true);
                } else {
                    // Klavyeyi otomatik konumlandır
                    if (window.keyboardUI && window.keyboardUI.positionKeyboard) {
                        window.keyboardUI.positionKeyboard(state.keyboardElement, state.currentInput);
                        state.keyboardElement.style.display = 'block';
                        window.keyboardState.setKeyboardVisibility(true);
                    } else {
                        console.warn('keyboardUI.positionKeyboard bulunamadı');
                        state.keyboardElement.style.display = 'block';
                        window.keyboardState.setKeyboardVisibility(true);
                    }
                }

                // Tuşların görünümünü güncelle
                this.updateKeyDisplay();

                if (!state.documentClickListener) {
                    state.documentClickListener = this.handleDocumentClick.bind(this);
                    // 100ms gecikme ekleyerek, klavyenin açılmasıyla tıklama arasında bir tampon oluştur
                    setTimeout(() => {
                        document.addEventListener('click', state.documentClickListener);

                        // Başlık metnini son kez güncelle - herhangi bir sorunu gidermek için
                        if (window.keyboardDisplayText && state.currentInput) {
                            try {
                                window.keyboardDisplayText.updateInputText(state.currentInput);
                            } catch (e) {
                                console.error('Başlık metni güncellenirken son hata:', e);
                            }
                        }
                }, 100);
                }

                // Input alanı var mı kontrol et
                if (!state.currentInput) {
                    console.warn('Aktif input elementi bulunamadı');
                    return;
                }
                
                // Klavye açılmadan önce input alanının yerini kaydet
                try {
                    const inputRect = state.currentInput.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const scrollPos = window.scrollY || window.pageYOffset;

                    // Önce klavyeyi görünür yap
                    if (window.keyboardUI && window.keyboardUI.positionKeyboard) {
                        window.keyboardUI.positionKeyboard(state.keyboardElement, state.currentInput);
                    }
                    state.keyboardElement.style.display = 'block';
                    window.keyboardState.setKeyboardVisibility(true);

                    // Klavye açılma zamanını kaydet
                    state.lastKeyboardOpenTime = Date.now();

                    // Daha uzun bir gecikme ile klavyenin konumunu kontrol et ve gerekirse ayarla
                    setTimeout(() => {
                        try {
                            // Ekranın alt sınırını kontrol et
                            const keyboardRect = state.keyboardElement.getBoundingClientRect();
                            const keyboardBottom = keyboardRect.top + keyboardRect.height;
                            const isKeyboardOutOfView = keyboardBottom > viewportHeight;

                            // Eğer klavye ekranın dışına taşıyorsa veya input ile çakışıyorsa
                            if (isKeyboardOutOfView || keyboardRect.top < inputRect.bottom) {
                                // İnput alanının ne kadar görünür olacağını belirle (en az 20px)
                                const visibleInputHeight = Math.min(inputRect.height, 30);
                                const targetTop = Math.max(visibleInputHeight, inputRect.top - 300); // Input alanından yukarıda yer ayır

                                // Sayfayı input alanının üstüne kaydır
                                window.scrollTo({
                                    top: targetTop + scrollPos,
                                    behavior: 'smooth'
                                });

                                // Klavyeyi yeniden konumlandır
                                if (window.keyboardUI && window.keyboardUI.positionKeyboard) {
                                    window.keyboardUI.positionKeyboard(state.keyboardElement, state.currentInput);
                                }
                            }
                        } catch (innerError) {
                            console.warn(`Klavye konumu ayarlanırken hata: ${innerError.message}`);
                        }
                    }, 150); // Daha uzun gecikme süresi
                } catch (e) {
                    console.warn(`Klavye konumlandırılırken hata: ${e.message}`);
                }
            } catch (e) {
                console.error(`Klavye gösterme işleminde hata: ${e.message}`);
            }
        },

        // Klavyeyi gizle
        hideKeyboard: function() {
            try {
                const state = window.keyboardState.getState();
                if (!state) {
                    console.warn('Klavye durumu alınamadı');
                    return;
                }

                if (state.keyboardElement) {
                    // Klavyeyi gizle ama DOM'dan kaldırma
                    state.keyboardElement.style.display = 'none';
                    window.keyboardState.setKeyboardVisibility(false);

                    // Düzenleme menüsünü kapat
                    if (window.keyboardEditMenu && window.keyboardEditMenu.hideEditMenu) {
                        window.keyboardEditMenu.hideEditMenu();
                    }

                    // Klavye kapandığında Shift, Caps ve AltGr durumlarını sıfırla
                    window.keyboardState.resetModifierKeys();
                    
                    try {
                        this.updateKeyDisplay();
                    } catch (updateError) {
                        console.warn(`Klavye kapatılırken görünüm güncellenemedi: ${updateError.message}`);
                    }

                    // Belgeye tıklama olayı dinleyicisini kaldır
                    if (state.documentClickListener) {
                        try {
                            document.removeEventListener('click', state.documentClickListener);
                            state.documentClickListener = null;
                        } catch (e) {
                            console.warn(`Event listener temizlenirken hata: ${e.message}`);
                        }
                    }
                }
            } catch (e) {
                console.error(`Klavye gizleme işleminde hata: ${e.message}`);
            }
        },

        // Klavyeyi oluştur
        createKeyboard: function() {
            try {
                // Klavye oluşturma işlevselliğini UI modülüne devreder
                if (window.keyboardUI && window.keyboardUI.createKeyboardElement) {
                    return window.keyboardUI.createKeyboardElement();
                } else {
                    console.error('keyboardUI.createKeyboardElement bulunamadı');
                    return null;
                }
            } catch (e) {
                console.error(`Klavye oluşturulurken hata: ${e.message}`);
                return null;
            }
        },

        // Belgeye tıklama olayını ele al
        handleDocumentClick: function(e) {
            try {
                const state = window.keyboardState.getState();
                
                if (!state) {
                    console.warn('Klavye durumu alınamadı');
                    return;
                }

                // Eğer klavye görünürse ve klavye veya mevcut input alanı dışına tıklandıysa
                if (state.isKeyboardVisible && state.keyboardElement) {
                    // Klavye açıldıktan sonra hemen kapanmasını engellemek için zamanlayıcı ekle
                    if (Date.now() - state.lastKeyboardOpenTime < 300) {
                        return; // Klavye açıldıktan hemen sonra tıklamaları yoksay
                    }

                    // Tıklama hedefinin klavye içinde olup olmadığını kontrol et
                    const isClickInsideKeyboard = state.keyboardElement.contains(e.target);

                    // Tıklama hedefinin input içinde olup olmadığını kontrol et
                    const isClickInsideInput = state.currentInput && (state.currentInput === e.target || state.currentInput.contains(e.target));

                    // Tıklamanın bir form elemanı olup olmadığını kontrol et
                    const isFormElement = e.target.matches('input, textarea, select, button, label');

                    // Hem klavye hem de input dışına tıklandıysa ve form elemanı değilse klavyeyi kapat
                    if (!isClickInsideKeyboard && !isClickInsideInput && !isFormElement) {
                        this.hideKeyboard();
                    }
                }
            } catch (e) {
                console.error(`Belge tıklama olayı işlenirken hata: ${e.message}`);
            }
        }
    };

    // Görünüm modülünü global alana aktar
    window.keyboardDisplay = keyboardDisplay;
})();