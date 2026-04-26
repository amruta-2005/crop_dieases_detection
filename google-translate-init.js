(function () {
  const CONFIG = {
    selectedLanguageKey: 'selectedLanguage',
    selectors: {
      translatable: '[data-translate], [data-key]',
      trigger: '[data-translate-trigger]'
    },
    excludedSelectors: [
      'script',
      'style',
      'noscript',
      'iframe',
      'code',
      'pre',
      '.language-selector',
      '#google_translate_element',
      '[data-translate-ignore]'
    ].join(', '),
    autoTranslateSelectors: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'a',
      'button',
      'label',
      'span',
      'li',
      'dt',
      'dd',
      'small',
      'strong',
      'em',
      'figcaption',
      'blockquote',
      'td',
      'th',
      '.btn',
      '.card-title',
      '.card-text',
      '.section-title',
      '.section-subtitle'
    ].join(', ')
  };

  const LANGUAGE_LABELS = {
    en: 'EN',
    hi: 'हिंदी',
    mr: 'मराठी',
    ta: 'தமிழ்'
  };

  let currentLanguage = localStorage.getItem(CONFIG.selectedLanguageKey) || 'en';

  function isExcludedElement(element) {
    return !!(element && (element.matches(CONFIG.excludedSelectors) || element.closest(CONFIG.excludedSelectors)));
  }

  function normalizeText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function shouldAutoTranslateElement(element) {
    if (!element || element.hasAttribute('data-translate-ignore') || element.hasAttribute('data-key')) {
      return false;
    }

    if (isExcludedElement(element) || !element.matches(CONFIG.autoTranslateSelectors)) {
      return false;
    }

    if (element.children.length > 0 || element.closest('svg')) {
      return false;
    }

    return normalizeText(element.textContent).length > 0;
  }

  function registerTextElement(element) {
    if (!shouldAutoTranslateElement(element) || element.hasAttribute('data-translate')) {
      return;
    }

    element.setAttribute('data-translate', '');
    element.dataset.sourceText = normalizeText(element.textContent);
  }

  function scanPageForTranslatableContent() {
    document.querySelectorAll(CONFIG.autoTranslateSelectors).forEach(registerTextElement);
  }

  function setLanguageUi(language) {
    const langDisplay = document.getElementById('langDisplay');
    if (langDisplay) {
      langDisplay.textContent = LANGUAGE_LABELS[language] || 'EN';
    }

    document.querySelectorAll('.lang-option').forEach(function (option) {
      const isActive = option.getAttribute('data-lang') === language;
      option.classList.toggle('active', isActive);
      option.classList.toggle('active-lang', isActive);
    });
  }

  function getElementSourceText(element) {
    if (!element.dataset.sourceText) {
      element.dataset.sourceText = normalizeText(element.textContent);
    }

    return element.dataset.sourceText;
  }

  function getTranslatableElements() {
    return Array.from(document.querySelectorAll(CONFIG.selectors.translatable))
      .map(function (element) {
        const sourceText = getElementSourceText(element);
        return sourceText ? { element: element, sourceText: sourceText } : null;
      })
      .filter(Boolean);
  }

  function restoreOriginalText() {
    getTranslatableElements().forEach(function (item) {
      item.element.textContent = item.sourceText;
    });
  }

  function applyLocalPageTranslations(language) {
    let applied = false;
    const pageTranslations = window.pageTranslations || null;

    if (pageTranslations && pageTranslations[language]) {
      document.querySelectorAll('[data-key]').forEach(function (element) {
        const key = element.getAttribute('data-key');
        const translatedValue = pageTranslations[language][key];

        if (typeof translatedValue !== 'string') {
          return;
        }

        element.innerHTML = translatedValue;
        applied = true;
      });
    }

    if (typeof window.translateDynamicContent === 'function') {
      window.translateDynamicContent(language);
      applied = true;
    }

    return applied;
  }

  function applyPageLanguageHandler(language) {
    if (typeof window.changeLanguage !== 'function' || window.changeLanguage === translatePage) {
      return false;
    }

    window.changeLanguage(language);
    return true;
  }

  function translatePage(language) {
    currentLanguage = language || 'en';
    localStorage.setItem(CONFIG.selectedLanguageKey, currentLanguage);
    setLanguageUi(currentLanguage);
    scanPageForTranslatableContent();

    if (applyPageLanguageHandler(currentLanguage)) {
      return;
    }

    if (currentLanguage === 'en') {
      restoreOriginalText();
      return;
    }

    if (!applyLocalPageTranslations(currentLanguage)) {
      restoreOriginalText();
    }
  }

  function bindLanguageOptions() {
    document.querySelectorAll('.lang-option').forEach(function (option) {
      if (option.dataset.translationBound === 'true') {
        return;
      }

      option.dataset.translationBound = 'true';
      option.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const language = option.getAttribute('data-lang') || 'en';
        translatePage(language);

        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
          dropdown.classList.remove('active');
        }
      }, true);
    });
  }

  function bindTranslateTriggers() {
    document.querySelectorAll(CONFIG.selectors.trigger).forEach(function (button) {
      if (button.dataset.translationBound === 'true') {
        return;
      }

      button.dataset.translationBound = 'true';
      button.addEventListener('click', function () {
        const language = button.getAttribute('data-target-lang') || currentLanguage || 'en';
        translatePage(language);
      });
    });
  }

  function init() {
    scanPageForTranslatableContent();
    setLanguageUi(currentLanguage);
    bindLanguageOptions();
    bindTranslateTriggers();
    translatePage(currentLanguage);
  }

  window.translationManager = {
    translatePage: translatePage,
    translateText: function (text) {
      return Promise.resolve(text);
    },
    restoreOriginalText: restoreOriginalText
  };

  window.refreshGoogleTranslation = function () {
    scanPageForTranslatableContent();
    translatePage(currentLanguage);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
