(() => {
  "use strict";

  const STORAGE_KEY = "webModeEnabled";
  const toggle = document.getElementById("webModeToggle");
  const statusText = document.getElementById("statusText");
  const helperText = document.getElementById("helperText");

  if (!toggle || !statusText || !helperText) {
    return;
  }

  function setStatus(isEnabled) {
    toggle.checked = isEnabled;
    statusText.textContent = isEnabled ? "AI araması devre dışı" : "AI araması açık";
    helperText.textContent = isEnabled
      ? "Google aramaları Web sonuçlarında açılır."
      : "AI aramasını devre dışı bırakmak için tıklayın.";
    document.body.dataset.enabled = String(isEnabled);
  }

  function getStorageSync() {
    if (typeof chrome === "undefined" || !chrome.storage?.sync) {
      return null;
    }

    return chrome.storage.sync;
  }

  function readSetting() {
    try {
      const storage = getStorageSync();

      if (!storage) {
        setStatus(true);
        return;
      }

      storage.get({ [STORAGE_KEY]: true }, (items) => {
        if (chrome.runtime.lastError) {
          setStatus(true);
          return;
        }

        setStatus(items[STORAGE_KEY] !== false);
      });
    } catch {
      setStatus(true);
    }
  }

  function saveSetting(isEnabled) {
    try {
      const storage = getStorageSync();

      if (!storage) {
        setStatus(isEnabled);
        return;
      }

      setStatus(isEnabled);

      storage.set({ [STORAGE_KEY]: isEnabled }, () => {
        if (chrome.runtime.lastError) {
          setStatus(!isEnabled);
        }
      });
    } catch {
      setStatus(!isEnabled);
    }
  }

  toggle.addEventListener("change", () => {
    saveSetting(toggle.checked);
  });

  readSetting();
})();
