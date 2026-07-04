(() => {
  "use strict";

  const STORAGE_KEY = "webModeEnabled";
  const WEB_MODE_VALUE = "14";
  const SUPPORTED_GOOGLE_HOSTS = new Set([
    "google.com",
    "www.google.com",
    "google.com.tr",
    "www.google.com.tr",
    "google.co.uk",
    "www.google.co.uk",
    "google.ca",
    "www.google.ca",
    "google.com.au",
    "www.google.com.au",
    "google.de",
    "www.google.de",
    "google.fr",
    "www.google.fr",
    "google.es",
    "www.google.es",
    "google.it",
    "www.google.it",
    "google.nl",
    "www.google.nl",
    "google.be",
    "www.google.be",
    "google.ch",
    "www.google.ch",
    "google.at",
    "www.google.at",
    "google.se",
    "www.google.se",
    "google.no",
    "www.google.no",
    "google.dk",
    "www.google.dk",
    "google.fi",
    "www.google.fi",
    "google.pl",
    "www.google.pl",
    "google.com.br",
    "www.google.com.br",
    "google.com.mx",
    "www.google.com.mx",
    "google.co.in",
    "www.google.co.in",
    "google.co.jp",
    "www.google.co.jp",
    "google.co.kr",
    "www.google.co.kr"
  ]);

  function isGoogleSearchUrl(url) {
    return (
      url.protocol === "https:" &&
      SUPPORTED_GOOGLE_HOSTS.has(url.hostname.toLowerCase()) &&
      url.pathname === "/search"
    );
  }

  function shouldRedirectToWebMode(url) {
    return isGoogleSearchUrl(url) && url.searchParams.get("udm") !== WEB_MODE_VALUE;
  }

  function buildWebModeUrl(url) {
    const nextUrl = new URL(url.toString());
    nextUrl.searchParams.set("udm", WEB_MODE_VALUE);
    return nextUrl;
  }

  function redirectToWebModeIfNeeded() {
    const currentUrl = new URL(window.location.href);

    if (!shouldRedirectToWebMode(currentUrl)) {
      return;
    }

    const webModeUrl = buildWebModeUrl(currentUrl);
    window.location.replace(webModeUrl.toString());
  }

  function getStorageSync() {
    if (typeof chrome === "undefined" || !chrome.storage?.sync) {
      return null;
    }

    return chrome.storage.sync;
  }

  function readEnabledSetting(callback) {
    const storage = getStorageSync();

    if (!storage) {
      callback(true);
      return;
    }

    storage.get({ [STORAGE_KEY]: true }, (items) => {
      if (chrome.runtime.lastError) {
        callback(true);
        return;
      }

      callback(items[STORAGE_KEY] !== false);
    });
  }

  try {
    readEnabledSetting((isEnabled) => {
      try {
        if (isEnabled) {
          redirectToWebModeIfNeeded();
        }
      } catch {
        // Ignore navigation errors so Google Search keeps working normally.
      }
    });
  } catch {
    // Ignore extension runtime errors on pages where Chrome APIs are unavailable.
  }
})();
