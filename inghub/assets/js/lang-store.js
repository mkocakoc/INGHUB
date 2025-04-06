import { translations as importedTranslations } from './localization.js';
class LangStore {
  constructor() {
    this.lang = 'en'; 
    this.listeners = [];
    this.translations = importedTranslations; 
  }

  getLang() {
    return this.lang;
  }

  setLang(newLang) {
    if (newLang !== this.lang) {
      this.lang = newLang;
      this.notify();
    }
  }

  t(key) {
    const langTranslations = this.translations?.[this.lang] || this.translations?.['en'] || {};
    return langTranslations[key] || key;
  }
  

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.lang));
  }
  createRenderRoot() {
    return this;
  }
}

export const langStore = new LangStore();