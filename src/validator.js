import ru from './locales.js';

export function validateUrl(url) {
  if (!url || url.trim() === '') {
    return { isValid: false, error: ru.notEmpty };
  }
  
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { isValid: false, error: ru.invalidUrl };
    }
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: ru.invalidUrl };
  }
}

export function validateRSSContent(xmlText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return { isValid: false, error: ru.noValidRSS };
    }
    
    const channel = xmlDoc.querySelector('channel');
    if (!channel) {
      return { isValid: false, error: ru.noValidRSS };
    }
    
    return { isValid: true, error: null, xmlDoc };
  } catch {
    return { isValid: false, error: ru.noValidRSS };
  }
}