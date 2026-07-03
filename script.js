document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            // Toggle hamburger animation
            const spans = menuToggle.querySelectorAll('span');
            if (nav.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Active page highlighting
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === pageName || (pageName === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Simple scroll header effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
                header.style.padding = '0.8rem 2rem';
                header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            } else {
                header.classList.remove('scrolled');
                header.style.padding = '1.2rem 2rem';
                header.style.boxShadow = 'none';
            }
        });
    }

    // Console easter egg for recruiter
    console.log(
        "%c안녕하세요! 이수하의 포트폴리오에 오신 것을 환영합니다. 🚀\n%c포기하지 않는 긍정적인 인재, 이수하의 코드와 프로젝트를 검토해주셔서 감사합니다.",
        "color: #00f2fe; font-size: 16px; font-weight: bold;",
        "color: #94a3b8; font-size: 14px;"
    );

    // ==========================================
    // Theme Toggle Logic (Dark / Light Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
        });
    }

    // ==========================================
    // Admin Modal Logic
    // ==========================================
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminModal = document.getElementById('adminModal');
    const closeModal = document.getElementById('closeModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const loginSuccess = document.getElementById('loginSuccess');
    const adminBanner = document.getElementById('adminBanner');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // Load admin state on startup
    if (localStorage.getItem('adminMode') === 'true') {
        document.body.classList.add('admin-active');
        if (adminBanner) adminBanner.classList.add('active');
    }

    if (adminLoginBtn && adminModal) {
        adminLoginBtn.addEventListener('click', () => {
            adminModal.classList.add('open');
            adminPasswordInput.value = '';
            loginError.style.display = 'none';
            loginSuccess.style.display = 'none';
            adminLoginForm.style.display = 'block';
            adminPasswordInput.focus();
        });
    }

    if (closeModal && adminModal) {
        closeModal.addEventListener('click', () => {
            adminModal.classList.remove('open');
        });
    }

    // Close on clicking outside modal-content
    window.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('open');
        }
    });

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = adminPasswordInput.value;

            // Simple mock validation (e.g. admin123)
            if (password === 'admin123') {
                loginError.style.display = 'none';
                adminLoginForm.style.display = 'none';
                loginSuccess.style.display = 'block';

                // Activate admin mode
                localStorage.setItem('adminMode', 'true');
                document.body.classList.add('admin-active');
                if (adminBanner) adminBanner.classList.add('active');
                toggleEditability(true);

                // Close modal after success animation
                setTimeout(() => {
                    adminModal.classList.remove('open');
                }, 1500);
            } else {
                loginError.style.display = 'block';
                adminPasswordInput.select();
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminMode');
            document.body.classList.remove('admin-active');
            if (adminBanner) adminBanner.classList.remove('active');
            toggleEditability(false);
        });
    }
    // ==========================================
    // Custom Background Controls (Image & RGB Color)
    // ==========================================
    const adminBgPanelToggleBtn = document.getElementById('adminBgPanelToggleBtn');
    const adminBgPanel = document.getElementById('adminBgPanel');
    const adminBgUploadBtn = document.getElementById('adminBgUploadBtn');
    const adminBgResetBtn = document.getElementById('adminBgResetBtn');
    const adminBgInput = document.getElementById('adminBgInput');
    
    // RGB Control Elements
    const rRange = document.getElementById('rRange');
    const gRange = document.getElementById('gRange');
    const bRange = document.getElementById('bRange');
    const rVal = document.getElementById('rVal');
    const gVal = document.getElementById('gVal');
    const bVal = document.getElementById('bVal');
    const colorPicker = document.getElementById('colorPicker');

    // Toggle Floating Panel
    if (adminBgPanelToggleBtn && adminBgPanel) {
        adminBgPanelToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            adminBgPanel.classList.toggle('open');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (adminBgPanel.classList.contains('open') && !adminBgPanel.contains(e.target) && e.target !== adminBgPanelToggleBtn) {
                adminBgPanel.classList.remove('open');
            }
        });
        
        adminBgPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    function applyBackground() {
        const customBg = localStorage.getItem('adminCustomBg');
        const customBgColor = localStorage.getItem('adminCustomBgColor');
        const isLightMode = document.body.classList.contains('light-mode');
        
        // 1. Apply custom color if set
        if (customBgColor) {
            document.body.style.backgroundColor = customBgColor;
        } else {
            document.body.style.backgroundColor = '';
        }

        // 2. Apply custom image if set, overlayed on top of color
        if (customBg) {
            const overlay = isLightMode 
                ? 'linear-gradient(rgba(248, 250, 252, 0.88), rgba(248, 250, 252, 0.88))'
                : 'linear-gradient(rgba(11, 15, 25, 0.88), rgba(11, 15, 25, 0.88))';
            document.body.style.backgroundImage = `${overlay}, url(${customBg})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundRepeat = 'no-repeat';
        } else {
            // If color is set but no image, clear image
            if (customBgColor) {
                document.body.style.backgroundImage = 'none'; // Overwrites the theme gradients
            } else {
                document.body.style.backgroundImage = ''; // Resets to CSS defaults
            }
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundAttachment = '';
            document.body.style.backgroundRepeat = '';
        }

        // 3. Show/hide reset button
        const hasCustom = customBg || customBgColor;
        if (adminBgResetBtn) {
            adminBgResetBtn.style.display = hasCustom ? 'block' : 'none';
        }
    }

    // Load initial background settings to panel controls
    function initPanelControls() {
        const customBgColor = localStorage.getItem('adminCustomBgColor');
        let r = 11, g = 15, b = 25; // Default dark theme background colors
        
        if (customBgColor) {
            // Parse 'rgb(r, g, b)' or 'rgba(r, g, b, a)'
            const match = customBgColor.match(/\d+/g);
            if (match && match.length >= 3) {
                r = parseInt(match[0]);
                g = parseInt(match[1]);
                b = parseInt(match[2]);
            }
        } else if (document.body.classList.contains('light-mode')) {
            r = 248; g = 250; b = 252; // Default light theme background colors
        }

        if (rRange && gRange && bRange) {
            rRange.value = r;
            gRange.value = g;
            bRange.value = b;
            updateRangeLabels();
            updateColorPickerFromRGB(r, g, b);
        }
    }

    function updateRangeLabels() {
        if (rVal) rVal.textContent = rRange.value;
        if (gVal) gVal.textContent = gRange.value;
        if (bVal) bVal.textContent = bRange.value;
    }

    function updateColorPickerFromRGB(r, g, b) {
        if (colorPicker) {
            const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            colorPicker.value = hex;
        }
    }

    function handleRGBChange() {
        const r = parseInt(rRange.value);
        const g = parseInt(gRange.value);
        const b = parseInt(bRange.value);
        
        updateRangeLabels();
        updateColorPickerFromRGB(r, g, b);
        
        const rgbColor = `rgb(${r}, ${g}, ${b})`;
        localStorage.setItem('adminCustomBgColor', rgbColor);
        applyBackground();
    }

    // Hook RGB Sliders events
    if (rRange && gRange && bRange) {
        [rRange, gRange, bRange].forEach(slider => {
            slider.addEventListener('input', handleRGBChange);
        });
    }

    // Hook Color Picker event
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            const hex = e.target.value;
            // Convert Hex to RGB
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            
            rRange.value = r;
            gRange.value = g;
            bRange.value = b;
            updateRangeLabels();
            
            const rgbColor = `rgb(${r}, ${g}, ${b})`;
            localStorage.setItem('adminCustomBgColor', rgbColor);
            applyBackground();
        });
    }

    // Initialize
    applyBackground();
    initPanelControls();

    // Re-apply background when theme is toggled to match dark/light theme overlay
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(() => {
                applyBackground();
                // Re-initialize controls to default light/dark colors if custom color is not set
                if (!localStorage.getItem('adminCustomBgColor')) {
                    initPanelControls();
                }
            }, 50);
        });
    }

    if (adminBgUploadBtn && adminBgInput) {
        adminBgUploadBtn.addEventListener('click', () => {
            adminBgInput.click();
        });

        adminBgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Limit file size to 3.5MB to stay safely under localstorage quota (usually 5MB total)
                if (file.size > 3.5 * 1024 * 1024) {
                    alert('이미지 파일 크기는 3.5MB 이하여야 합니다.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    try {
                        localStorage.setItem('adminCustomBg', dataUrl);
                        applyBackground();
                    } catch (error) {
                        alert('이미지 용량이 브라우저 저장 한도를 초과했습니다. 더 작은 해상도나 용량의 이미지를 선택해주세요.');
                        console.error('Failed to save image to localStorage:', error);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (adminBgResetBtn) {
        adminBgResetBtn.addEventListener('click', () => {
            if (confirm('모든 배경화면, 프로필 이미지, 텍스트 및 이미지 수정 사항을 원본으로 완전히 초기화하시겠습니까?')) {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('edit_text_') || key.startsWith('edit_img_') || key === 'adminCustomBg' || key === 'adminCustomBgColor' || key === 'adminProfileImage')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
                window.location.reload();
            }
        });
    }

    // ==========================================
    // Custom Profile Image Changer
    // ==========================================
    const profileImage = document.getElementById('profileImage');
    const profileImageBadge = document.getElementById('profileImageBadge');
    const adminProfileImageInput = document.getElementById('adminProfileImageInput');

    function applyProfileImage() {
        if (profileImage) {
            const savedProfileImg = localStorage.getItem('adminProfileImage');
            if (savedProfileImg) {
                profileImage.src = savedProfileImg;
            } else {
                profileImage.src = 'img/img2.jpg';
            }
        }
    }

    applyProfileImage();

    if (profileImageBadge && adminProfileImageInput) {
        profileImageBadge.addEventListener('click', () => {
            adminProfileImageInput.click();
        });

        adminProfileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 3.5 * 1024 * 1024) {
                    alert('프로필 사진 파일 크기는 3.5MB 이하여야 합니다.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    try {
                        localStorage.setItem('adminProfileImage', dataUrl);
                        applyProfileImage();
                    } catch (error) {
                        alert('이미지 용량이 브라우저 저장 한도를 초과했습니다. 더 작은 크기의 사진을 선택해주세요.');
                        console.error('Failed to save profile image:', error);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ==========================================
    // Dynamic In-place CMS Content Editor (Texts & Images)
    // Excludes the Gacha Simulator Page and specific admin controls
    // ==========================================
    function getEditableElements() {
        const textElements = Array.from(document.querySelectorAll(
            'main h1, main h2, main h3, main h4, main h5, main p, main span:not(.logo-dot), main strong, main li, main a.btn, main .interest-tag, main .activity-tag, main .cert-item-title, main .edu-title, main .edu-desc'
        ));

        // Filter out admin controls and gacha components
        return textElements.filter(el => {
            if (el.closest('.gacha-container') || el.closest('#adminModal') || el.closest('#adminBanner') || el.closest('.admin-bg-panel') || el.closest('.modal-content') || el.closest('.summon-overlay') || el.closest('.summon-multi-overlay')) {
                return false;
            }
            // Skip empty elements or SVGs
            if (el.querySelector('svg') && el.childNodes.length === 1) {
                return false;
            }
            return true;
        });
    }

    function toggleEditability(isAdmin) {
        const elements = getEditableElements();
        elements.forEach(el => {
            el.contentEditable = isAdmin ? 'true' : 'inherit';
        });
    }

    function initDynamicContentEditor() {
        // 1. Setup text elements
        const elements = getEditableElements();
        elements.forEach((el, index) => {
            const pageName = window.location.pathname.split('/').pop() || 'index.html';
            const key = `edit_text_${pageName}_${index}`;
            
            // Load saved content
            const savedText = localStorage.getItem(key);
            if (savedText !== null) {
                el.innerHTML = savedText;
            }

            // Set initial contenteditable attribute
            const isAdmin = localStorage.getItem('adminMode') === 'true';
            el.contentEditable = isAdmin ? 'true' : 'inherit';

            // Auto-save on blur
            el.addEventListener('blur', () => {
                if (localStorage.getItem('adminMode') === 'true') {
                    localStorage.setItem(key, el.innerHTML);
                }
            });
        });

        // 2. Setup images (excluding gacha elements and profile picture)
        const imgElements = Array.from(document.querySelectorAll('main img'));
        const filteredImgElements = imgElements.filter(img => {
            if (img.closest('.gacha-container') || img.id === 'profileImage') {
                return false;
            }
            return true;
        });

        // Create a single hidden input on the body if not exists
        let imgInput = document.getElementById('adminDynamicImgInput');
        if (!imgInput) {
            imgInput = document.createElement('input');
            imgInput.type = 'file';
            imgInput.id = 'adminDynamicImgInput';
            imgInput.accept = 'image/*';
            imgInput.style.display = 'none';
            document.body.appendChild(imgInput);
        }

        let activeImg = null;
        let activeImgKey = null;

        // Load saved images
        filteredImgElements.forEach((img, index) => {
            const pageName = window.location.pathname.split('/').pop() || 'index.html';
            const key = `edit_img_${pageName}_${index}`;
            
            const savedSrc = localStorage.getItem(key);
            if (savedSrc !== null) {
                img.src = savedSrc;
            }

            // Click handler in admin mode
            img.addEventListener('click', () => {
                if (localStorage.getItem('adminMode') === 'true') {
                    activeImg = img;
                    activeImgKey = key;
                    imgInput.click();
                }
            });
        });

        // Single file input change handler
        imgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && activeImg && activeImgKey) {
                if (file.size > 3.5 * 1024 * 1024) {
                    alert('이미지 파일 크기는 3.5MB 이하여야 합니다.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    try {
                        localStorage.setItem(activeImgKey, dataUrl);
                        activeImg.src = dataUrl;
                    } catch (error) {
                        alert('이미지 용량이 브라우저 저장 한도를 초과했습니다. 더 작은 해상도의 이미지를 선택해주세요.');
                        console.error('Failed to save dynamic image:', error);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Initialize content editor on load
    initDynamicContentEditor();

    // Define globally to allow login/logout handlers to access it
    window.toggleEditability = toggleEditability;
});
