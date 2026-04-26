/**
 * ═══════════════════════════════════════════════════════════════
 * LANGUAGE SWITCHER MODULE
 * ═══════════════════════════════════════════════════════════════
 * Features:
 * - Supports 4 languages: English, Marathi, Hindi, Tamil
 * - Click on language button to switch content immediately
 * - Language preference saved to localStorage
 * - Easy to add new translatable content using data-i18n attributes
 * ═══════════════════════════════════════════════════════════════
 */

const LanguageSwitcher = (() => {
    // Translation data for all 4 languages
    const translations = {
        en: {
            home: 'Home',
            about: 'About Us',
            detect: 'Yojana',
            contact: 'Contact Us',
            login: 'Log In',
            tryDetector: 'Try AI Detector',
            learnHow: 'Learn how it works',
            mainHeading: 'Detect crop disease',
            description: 'Crop Disease Detection helps farmers identify plant diseases at an early stage. Using image processing and machine learning, crop health is analyzed accurately. Early detection reduces crop loss and improves agricultural productivity. This system supports farmers in making timely and effective treatment decisions.',
            secondaryDesc: 'This system helps farmers find crop diseases quickly and easily. It uses images and machine learning to check plant health. Early detection protects crops from serious damage. Farmers can take the right action at the right time.',
            tomatoLabel: 'AI highlights affected areas',
            cornLabel: 'Real-time analysis',
            cassavaLabel: 'Live AI • 92%',
            wheatLabel: 'Accurate diagnosis'
        },
        mr: {
            home: 'होम',
            about: 'आमच्याबद्दल',
            detect: 'योजना',
            contact: 'आमच्याशी संपर्क करा',
            login: 'लॉगिन करा',
            tryDetector: 'AI डिटेक्टर वापरून पहा',
            learnHow: 'हे कसे कार्य करते हे जाणून घ्या',
            mainHeading: 'पीक रोग शोधा',
            description: 'पीक रोग शोधणे शेतकऱ्यांना प्रारंभिक टप्प्यात वनस्पती रोग ओळखण्यास मदत करते. प्रतिमा प्रक्रिया आणि मशीन लर्निंग वापरून, पीक आरोग्य अचूकपणे विश्लेषित केले जाते. प्रारंभिक शोध पीक नुकसान कमी करतो आणि कृषी उत्पादकता सुधारतो. ही प्रणाली शेतकऱ्यांना वेळेवर आणि प्रभावी उपचार निर्णय घेण्यास समर्थन करते.',
            secondaryDesc: 'ही प्रणाली शेतकऱ्यांना पीक रोग द्रुतपणे आणि सहजपणे शोधण्यास मदत करते. हे प्रतिमा आणि मशीन लर्निंग वापरून वनस्पती आरोग्य तपासते. प्रारंभिक शोध पीकांना गंभीर नुकसानापासून संरक्षित करते. शेतकरी योग्य वेळी योग्य कृती करू शकतात.',
            tomatoLabel: 'AI प्रभावित क्षेत्र हाइलाइट करते',
            cornLabel: 'रिअल-टाइम विश्लेषण',
            cassavaLabel: 'लाइव्ह AI • 92%',
            wheatLabel: 'अचूक निदान'
        },
        hi: {
            home: 'होम',
            about: 'हमारे बारे में',
            detect: 'योजना',
            contact: 'हमसे संपर्क करें',
            login: 'लॉगिन करें',
            tryDetector: 'AI डिटेक्टर आजमाएं',
            learnHow: 'यह कैसे काम करता है जानें',
            mainHeading: 'फसल रोग का पता लगाएं',
            description: 'फसल रोग पहचान किसानों को शुरुआती चरण में पौधों के रोगों की पहचान करने में मदद करता है। छवि प्रसंस्करण और मशीन लर्निंग का उपयोग करके, फसल स्वास्थ्य का सटीक विश्लेषण किया जाता है। प्रारंभिक पहचान फसल हानि को कम करती है और कृषि उत्पादकता में सुधार करती है। यह प्रणाली किसानों को समय पर और प्रभावी उपचार निर्णय लेने में सहायता करती है।',
            secondaryDesc: 'यह प्रणाली किसानों को फसल के रोगों का पता लगाने में मदद करती है। यह छवियों और मशीन लर्निंग का उपयोग करके पौधों के स्वास्थ्य की जांच करता है। प्रारंभिक पहचान फसलों को गंभीर नुकसान से बचाती है। किसान सही समय पर सही कार्रवाई कर सकते हैं।',
            tomatoLabel: 'AI प्रभावित क्षेत्रों को हाइलाइट करता है',
            cornLabel: 'रीयल-टाइम विश्लेषण',
            cassavaLabel: 'लाइव AI • 92%',
            wheatLabel: 'सटीक निदान'
        },
        ta: {
            home: 'முகப்பு',
            about: 'எங்களைப் பற்றி',
            detect: 'திட்டம்',
            contact: 'எங்களைத் தொடர்பு கொள்ளுங்கள்',
            login: 'உள்நுழையவும்',
            tryDetector: 'AI கண்டறிதல் முயற்சிக்கவும்',
            learnHow: 'இது எவ்வாறு செயல்படுகிறது என்பதை அறிக',
            mainHeading: 'பயிர் நோய்களைக் கண்டறியுங்கள்',
            description: 'பயிர் நோய் கண்டறிதல் விவசாயிகளுக்கு ஆரம்ப கட்டத்தில் தாவர நோய்களை அடையாளம் காண உதவுகிறது. பட செயலாக்கம் மற்றும் இயந்திர கற்றல் பயன்படுத்தி, பயிர் ஆரோக்கியம் துல்லியமாக பகுப்பாய்வு செய்யப்படுகிறது. ஆரம்ப கண்டறிதல் பயிர் இழப்பை குறைக்கிறது மற்றும் வேளாண் உற்பத்தியை மேம்படுத்துகிறது. இந்த அமைப்பு விவசாயிகளுக்கு நேரத்திற்குள் மற்றும் திறமையான சிகிச்சை முடிவுகளை எடுக்க உதவுகிறது.',
            secondaryDesc: 'இந்த அமைப்பு விவசாயிகளை பயிர் நோய்களை விரைவாக மற்றும் எளிதாக கண்டறிய உதவுகிறது. இது படங்கள் மற்றும் இயந்திர கற்றல் பயன்படுத்தி தாவர ஆரோக்கியத்தை சரிபார்க்கிறது. ஆரம்ப கண்டறிதல் பயிர்களை கடுமையான சேதத்திலிருந்து பாதுகாக்கிறது. விவசாயிகள் சரியான நேரத்தில் சரியான நடவடிக்கை எடுக்க முடியும்.',
            tomatoLabel: 'AI பாதிக்கப்பட்ட பகுதிகளை முன்னிலைப்படுத்துகிறது',
            cornLabel: 'நிகழ்நேர பகுப்பாய்வு',
            cassavaLabel: 'நேரடி AI • 92%',
            wheatLabel: 'துல்லிய கண்டறிதல்'
        }
    };

    // Language codes display
    const langCodes = {
        en: 'EN',
        mr: 'मराठी',
        hi: 'हिंदी',
        ta: 'தமிழ்'
    };

    // Current language (default: English)
    let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

    /**
     * Initialize language switcher on page load
     */
    function init() {
        // Set up language button click handler
        const languageBtn = document.getElementById('languageBtn');
        if (languageBtn) {
            languageBtn.addEventListener('click', toggleDropdown);
        }

        // Set up language option click handlers
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', handleLanguageSelection);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', closeDropdownOnOutsideClick);

        // Apply saved language on page load
        applyLanguage(currentLanguage);
    }

    /**
     * Toggle the language dropdown
     */
    function toggleDropdown(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    /**
     * Handle language selection when user clicks on a language option
     */
    function handleLanguageSelection(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        const selectedLang = this.getAttribute('data-lang');
        if (selectedLang) {
            applyLanguage(selectedLang);
            
            // Update active state on language options
            document.querySelectorAll('.lang-option').forEach(option => {
                option.classList.remove('active');
            });
            this.classList.add('active');

            // Close dropdown
            const dropdown = document.getElementById('languageDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }
    }

    /**
     * Close dropdown when clicking outside the language selector
     */
    function closeDropdownOnOutsideClick(e) {
        if (!e.target.closest('.language-selector')) {
            const dropdown = document.getElementById('languageDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }
    }

    /**
     * Apply language to all content on the page
     */
    function applyLanguage(lang) {
        currentLanguage = lang;
        const t = translations[lang] || translations.en;

        // Update language display
        const langDisplay = document.getElementById('langDisplay');
        if (langDisplay) {
            langDisplay.textContent = langCodes[lang] || 'EN';
        }

        // Update navigation links
        updateNavigationLinks(t);

        // Update hero section
        updateHeroSection(t);

        // Update buttons
        updateButtons(t);

        // Update image labels
        updateImageLabels(t);

        // Update any elements with data-i18n attribute
        updateElementsWithI18n(lang);

        // Save language preference
        localStorage.setItem('selectedLanguage', lang);
    }

    /**
     * Update navigation links
     */
    function updateNavigationLinks(t) {
        const navLinks = document.querySelectorAll('.nav-links a');
        const keys = ['home', 'about', 'detect', 'contact'];
        
        navLinks.forEach((link, index) => {
            if (keys[index] && t[keys[index]]) {
                link.textContent = t[keys[index]];
            }
        });
    }

    /**
     * Update hero section content
     */
    function updateHeroSection(t) {
        const heading = document.querySelector('.hero-content h1');
        if (heading) {
            heading.textContent = t.mainHeading || heading.textContent;
        }

        const mainDesc = document.getElementById('mainDesc');
        if (mainDesc) {
            mainDesc.textContent = t.description || mainDesc.textContent;
        }

        const secondaryDesc = document.getElementById('secondaryDesc');
        if (secondaryDesc) {
            secondaryDesc.textContent = t.secondaryDesc || secondaryDesc.textContent;
        }
    }

    /**
     * Update buttons
     */
    function updateButtons(t) {
        // Primary button
        const primaryBtn = document.querySelector('.btn-primary');
        if (primaryBtn) {
            primaryBtn.textContent = t.tryDetector || primaryBtn.textContent;
        }

        // Secondary button
        const secondaryBtn = document.querySelector('.btn-secondary');
        if (secondaryBtn) {
            secondaryBtn.textContent = t.learnHow || secondaryBtn.textContent;
        }

        // Nav buttons
        const navLoginBtn = document.getElementById('navLoginBtn');
        if (navLoginBtn) {
            navLoginBtn.textContent = t.login || navLoginBtn.textContent;
        }

        const navDetectorBtn = document.getElementById('navDetectorBtn');
        if (navDetectorBtn) {
            navDetectorBtn.textContent = t.tryDetector || navDetectorBtn.textContent;
        }
    }

    /**
     * Update image labels
     */
    function updateImageLabels(t) {
        const labels = document.querySelectorAll('.image-label');
        
        if (labels[0]) {
            labels[0].innerHTML = t.tomatoLabel || labels[0].innerHTML;
        }
        if (labels[1]) {
            labels[1].innerHTML = t.cornLabel || labels[1].innerHTML;
        }
        if (labels[2]) {
            labels[2].innerHTML = `<span class="ai-badge">${t.cassavaLabel}</span>`;
        }
        if (labels[3]) {
            labels[3].innerHTML = t.wheatLabel || labels[3].innerHTML;
        }
    }

    /**
     * Update elements with data-i18n attribute
     * Usage: <p data-i18n="myKey">Default text</p>
     */
    function updateElementsWithI18n(lang) {
        const t = translations[lang] || translations.en;
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (t[key]) {
                if (element.hasAttribute('data-i18n-html')) {
                    element.innerHTML = t[key];
                } else {
                    element.textContent = t[key];
                }
            }
        });
    }

    /**
     * Get current language
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Add new translation
     */
    function addTranslation(lang, key, value) {
        if (translations[lang]) {
            translations[lang][key] = value;
        }
    }

    /**
     * Get translation for a specific key and language
     */
    function getTranslation(key, lang = null) {
        const language = lang || currentLanguage;
        const t = translations[language] || translations.en;
        return t[key] || key;
    }

    // Public API
    return {
        init,
        applyLanguage,
        getCurrentLanguage,
        addTranslation,
        getTranslation,
        toggleDropdown,
        updateElementsWithI18n
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', LanguageSwitcher.init);
