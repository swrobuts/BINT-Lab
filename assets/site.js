/* Shared browser helpers. Keep language and progress keys stable across renames. */
(function () {
  'use strict';

  function getLanguage() {
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested === 'de' || requested === 'en') return requested;
    try {
      if (localStorage.getItem('bi-lang') === 'en') return 'en';
    } catch (error) { /* Storage may be disabled. */ }
    return 'de';
  }

  function setLanguage(lang) {
    if (lang !== 'de' && lang !== 'en') return;
    try { localStorage.setItem('bi-lang', lang); } catch (error) {}
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    try { window.history.replaceState(null, '', url); } catch (error) {}
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) { /* Try the fallback when clipboard permission is denied. */ }
    const previousFocus = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(field);
    try {
      field.select();
      return document.execCommand('copy');
    } catch (error) {
      return false;
    } finally {
      field.remove();
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    }
  }

  window.BINTLab = { getLanguage, setLanguage, copyText };
})();
