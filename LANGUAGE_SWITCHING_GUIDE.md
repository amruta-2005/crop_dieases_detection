# 🌐 Language Switching Implementation Guide

## Overview
Your website now supports **4 languages** with instant content switching:
- 🇬🇧 English (EN)
- 🇮🇳 Hindi (हिंदी)
- 🇮🇳 Marathi (मराठी)
- 🇮🇳 Tamil (தமிழ்)

## Files Involved

### 1. **language-switcher.js** ✨ (NEW - Main Language Module)
Complete modular language switching system with:
- All 4 language translations
- Click handler for language buttons
- localStorage support (remembers your language choice)
- Automatic content updates when language changes

### 2. **index.html**
The HTML structure with:
- Language selector dropdown in navigation
- `data-i18n` attributes for translatable content
- Language button that toggles dropdown menu

## How It Works

### Step 1: User Clicks on Language
When you click on a language option (e.g., "मराठी"):
```html
<li><a href="#" class="lang-option" data-lang="mr">मराठी (Marathi)</a></li>
```

### Step 2: JavaScript Handles the Click
The `language-switcher.js` file:
1. Detects the click on the language option
2. Gets the language code (`mr` for Marathi)
3. Calls `applyLanguage()` function
4. Updates all content on the page to the selected language
5. Saves preference to browser localStorage

### Step 3: Content Updates
All these elements update automatically:
- Navigation links (Home, About, Yojana, Contact)
- Hero section heading
- Descriptions and paragraphs
- Button text (Log In, Try AI Detector, Learn how it works)
- Image labels

## Usage in HTML

### Using data-i18n Attribute (Optional)
To add more translatable content anywhere in your HTML:

```html
<!-- Simple text element -->
<p data-i18n="myKey">Default English Text</p>

<!-- With HTML content -->
<p data-i18n="myKey" data-i18n-html="true">Default <strong>formatted</strong> text</p>
```

Then add to translations in `language-switcher.js`:
```javascript
translations.en.myKey = "Default English Text";
translations.hi.myKey = "डिफ़ॉल्ट हिंदी पाठ";
translations.mr.myKey = "डिफॉल्ट मराठी मजकूर";
translations.ta.myKey = "இயல்பு தமிழ் உரை";
```

## API Reference

### LanguageSwitcher Object
All functions exposed in window scope:

```javascript
// Apply a specific language
LanguageSwitcher.applyLanguage('hi');  // Switch to Hindi

// Get current language
LanguageSwitcher.getCurrentLanguage();  // Returns: 'hi', 'en', 'mr', 'ta'

// Get translation for a key
LanguageSwitcher.getTranslation('mainHeading', 'hi');  // Get Hindi translation

// Add new translation
LanguageSwitcher.addTranslation('hi', 'newKey', 'हिंदी टेक्स्ट');

// Manually toggle dropdown
LanguageSwitcher.toggleDropdown();

// Update all elements with data-i18n
LanguageSwitcher.updateElementsWithI18n('hi');
```

## Translation Keys Available

| Key | English | Hindi | Marathi | Tamil |
|-----|---------|-------|---------|-------|
| home | Home | होम | होम | முகப்பு |
| about | About Us | हमारे बारे में | आमच्याबद्दल | எங்களைப் பற்றி |
| detect | Yojana | योजना | योजना | திட்டம் |
| contact | Contact Us | हमसे संपर्क करें | आमच्याशी संपर्क करा | எங்களைத் தொடர்பு கொள்ளுங்கள் |
| mainHeading | Detect crop disease | फसल रोग का पता लगाएं | पीक रोग शोधा | பயிர் நோய்களைக் கண்டறியுங்கள் |

... and many more! See `language-switcher.js` for complete list.

## localStorage
- **Key**: `selectedLanguage`
- **Values**: `'en'`, `'hi'`, `'mr'`, `'ta'`
- **Automatically saves** when you switch language
- **Auto-loads** on page refresh

## Browser Compatibility
✅ Works on all modern browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers

## Features
✨ Features included:
- ✅ Instant content switching (no page reload)
- ✅ Language preference saved
- ✅ Smooth dropdown animation
- ✅ Active language indicator
- ✅ Modular and maintainable code
- ✅ Easy to add more languages
- ✅ Support for special characters (Devanagari, Tamil scripts)

## Troubleshooting

### Language not switching?
1. Check console for errors: F12 → Console
2. Ensure `language-switcher.js` is loaded
3. Verify HTML structure matches expected IDs

### Lost language after page refresh?
1. Check if localStorage is enabled in browser
2. Try clearing cache and reload
3. Check browser's privacy/incognito mode

### Want to add more languages?
1. Add new object in `translations` (language-switcher.js)
2. Add language option in HTML (`<li><a href="#" class="lang-option" data-lang="kn">ಕನ್ನಡ</a></li>`)
3. Add language display code in `langCodes` object
4. Done! It will work automatically

## Example: Adding Kannada (ಕನ್ನಡ)

**In language-switcher.js:**
```javascript
const langCodes = {
    en: 'EN',
    hi: 'हिंदी',
    mr: 'मराठी',
    ta: 'தமிழ்',
    kn: 'ಕನ್ನಡ'  // Add this
};

translations.kn = {
    home: 'ಮುಖ್ಯ ಪುಟ',
    about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    // ... add more translations
};
```

**In index.html:**
```html
<li><a href="#" class="lang-option" data-lang="kn">ಕನ್ನಡ (Kannada)</a></li>
```

Done! Kannada language will now work.

## Support
For issues or enhancements, check:
- Inspect Element (F12) and check console logs
- Verify all files are in the same directory
- Check that script tags are properly included in HTML

---

**Created**: 2024  
**Language Switcher Version**: 1.0  
**Supported Languages**: 4 (English, Hindi, Marathi, Tamil)
