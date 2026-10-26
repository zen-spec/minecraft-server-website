/**
 * LUNEXSMP - LOGIKA INTERAKTIF SITUS
 * Standar Craftsmanship Antislop (R-01 s/d R-38)
 * Fitur: Salin IP, Status Live API, Accordion Aksesibel, Tabs, Navigasi Keyboard.
 */

document.addEventListener('DOMContentLoaded', () => {
  initServerStatus();
  initCopyButtons();
  initRulesAccordion();
  initJoinTabs();
  initMobileMenu();
  initBillingSwitcher();
});

/* 1. Status Server Live via Public API dengan Auto-Refresh Periodik */
function initServerStatus() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const playerCount = document.getElementById('player-count');
  const btnRefresh = document.getElementById('btn-refresh-status');
  const iconRefreshSvg = document.getElementById('icon-refresh-svg');

  const serverHost = 'play.lunexsmp.my.id';
  const REFRESH_INTERVAL_MS = 30000;
  let refreshTimer = null;
  let hasLoadedOnce = false;

  fetchServerStatus(false);

  refreshTimer = setInterval(() => {
    fetchServerStatus(false);
  }, REFRESH_INTERVAL_MS);

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      if (refreshTimer) clearInterval(refreshTimer);
      fetchServerStatus(true);
      refreshTimer = setInterval(() => {
        fetchServerStatus(false);
      }, REFRESH_INTERVAL_MS);
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchServerStatus(false);
    }
  });

  async function fetchServerStatus(isManual) {
    if (!hasLoadedOnce) {
      setLoadingState();
    }
    setSpinning(true);

    try {
      const data = await fetchBestResult();
      if (data && data.online) {
        setOnlineState(data);
      } else {
        setOfflineState();
      }
    } catch {
      setOfflineState();
    } finally {
      setSpinning(false);
      hasLoadedOnce = true;
    }
  }

  async function fetchBestResult() {
    const primaryUrl = `https://api.mcstatus.io/v2/status/java/${serverHost}`;
    const fallbackUrl = `https://api.mcsrvstat.us/3/${serverHost}`;

    const normalize = (data, isFallback) => {
      if (!data) return null;
      if (isFallback) {
        return {
          online: data.online,
          players: data.players,
          version: { name_clean: data.version }
        };
      }
      return data;
    };

    const tryFetch = async (url, isFallback) => {
      const data = await fetchWithTimeout(url, 4000);
      const norm = normalize(data, isFallback);
      if (norm && norm.online) return norm;
      throw new Error('offline');
    };

    return Promise.any([
      tryFetch(primaryUrl, false),
      tryFetch(fallbackUrl, true)
    ]).catch(() => ({ online: false }));
  }

  async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function setSpinning(spinning) {
    if (iconRefreshSvg) {
      if (spinning) {
        iconRefreshSvg.classList.add('is-spinning');
      } else {
        iconRefreshSvg.classList.remove('is-spinning');
      }
    }
    if (btnRefresh) {
      btnRefresh.disabled = spinning;
    }
  }


  function setLoadingState() {
    if (statusDot) {
      statusDot.className = 'status-dot status-loading';
    }
    if (statusText) statusText.textContent = 'Memeriksa status server...';
    if (playerCount) playerCount.textContent = 'Memuat...';
  }

  function setOnlineState(data) {
    if (statusDot) {
      statusDot.className = 'status-dot status-online';
    }
    if (statusText) statusText.textContent = 'Server Online';

    const online = (data.players && typeof data.players.online === 'number') ? data.players.online : 0;
    const max = (data.players && typeof data.players.max === 'number') ? data.players.max : 100;

    if (playerCount) {
      playerCount.textContent = `${online} / ${max} Pemain Online`;
    }

  }


  function setOfflineState() {
    if (statusDot) {
      statusDot.className = 'status-dot status-offline';
    }
    if (statusText) statusText.textContent = 'Server Sedang Pemeliharaan / Offline';
    if (playerCount) playerCount.textContent = '0 Pemain';
  }
}

/* ==========================================================================
   2. Fungsionalitas Salin IP dengan Feedback Nyata (R-26 & R-35)
   ========================================================================== */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.btn-copy');
  const toast = document.getElementById('copy-toast');
  let toastTimeout = null;

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-clipboard');
      if (!textToCopy) return;

      copyTextToClipboard(textToCopy)
        .then(() => {
          showFeedback(btn, textToCopy);
        })
        .catch(() => {
          // Fallback sederhana jika izin clipboard gagal
          showToast(`Salin alamat ini: ${textToCopy}`);
        });
    });
  });

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) resolve();
        else reject(new Error('Salin gagal'));
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function showFeedback(btn, copiedText) {
    const originalContent = btn.innerHTML;
    
    // Ganti isi tombol sementara dengan tanda centang
    btn.innerHTML = `
      <svg class="icon icon-check" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span class="btn-text">Tersalin!</span>
    `;
    btn.classList.add('btn-copied');

    showToast(`Alamat IP "${copiedText}" berhasil disalin ke clipboard.`);

    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.classList.remove('btn-copied');
    }, 2000);
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* ==========================================================================
   3. Accordion Aturan Server (Aksesibel Keyboard & ARIA - R-26 & R-32)
   ========================================================================== */
function initRulesAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      if (!panel) return;

      // Toggle status panel terpilih
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });

    // Keyboard support: Escape untuk menutup panel saat fokus di trigger
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          trigger.setAttribute('aria-expanded', 'false');
          const panelId = trigger.getAttribute('aria-controls');
          const panel = document.getElementById(panelId);
          if (panel) panel.hidden = true;
        }
      }
    });
  });
}

/* ==========================================================================
   4. Tab Switcher Panduan Join (Aksesibel Keyboard - R-26 & R-32)
   ========================================================================== */
function initJoinTabs() {
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      switchTab(tab);
    });

    // Dukungan navigasi tombol panah kiri/kanan antar tab
    tab.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        tabs[targetIndex].focus();
        switchTab(tabs[targetIndex]);
      }
    });
  });

  function switchTab(activeTab) {
    // Nonaktifkan semua tab
    tabs.forEach((tab) => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    // Sembunyikan semua panel
    panels.forEach((panel) => {
      panel.classList.remove('active');
      panel.hidden = true;
    });

    // Aktifkan tab yang dipilih
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');

    // Tampilkan panel terkait
    const targetPanelId = activeTab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.hidden = false;
    }
  }
}

/* ==========================================================================
   5. Navigasi Mobile Hamburger (R-03 & R-32)
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuToggle || !primaryNav) return;

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  function openMenu() {
    menuToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('is-open');
  }

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
  }

  // Tutup menu saat tautan diklik
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Tutup menu saat menekan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (primaryNav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    }
  });

  // Tutup menu saat klik di luar area navigasi
  document.addEventListener('click', (e) => {
    if (!primaryNav.contains(e.target) && !menuToggle.contains(e.target)) {
      if (primaryNav.classList.contains('is-open')) {
        closeMenu();
      }
    }
  });
}

/* ==========================================================================
   6. Pengubah Periode Langganan Rank: Permanen vs Bulanan (R-26 & R-32)
   ========================================================================== */
function initBillingSwitcher() {
  const permBtn = document.getElementById('billing-perm-btn');
  const monthBtn = document.getElementById('billing-month-btn');
  const caption = document.getElementById('billing-period-caption');
  const priceAmounts = document.querySelectorAll('.price-amount');
  const pricePeriods = document.querySelectorAll('.price-period');

  if (!permBtn || !monthBtn) return;

  permBtn.addEventListener('click', () => {
    setBillingPeriod('permanent');
  });

  monthBtn.addEventListener('click', () => {
    setBillingPeriod('monthly');
  });

  function setBillingPeriod(period) {
    if (period === 'permanent') {
      permBtn.classList.add('active');
      permBtn.setAttribute('aria-selected', 'true');
      monthBtn.classList.remove('active');
      monthBtn.setAttribute('aria-selected', 'false');

      if (caption) {
        caption.innerHTML = 'Menampilkan harga <strong>Permanen</strong> (berlaku selamanya selama server beroperasi).';
      }

      priceAmounts.forEach((el) => {
        const permPrice = el.getAttribute('data-perm');
        if (permPrice) el.textContent = permPrice;
      });

      pricePeriods.forEach((el) => {
        const permPeriod = el.getAttribute('data-perm') || '';
        el.textContent = permPeriod;
      });
    } else {
      monthBtn.classList.add('active');
      monthBtn.setAttribute('aria-selected', 'true');
      permBtn.classList.remove('active');
      permBtn.setAttribute('aria-selected', 'false');

      if (caption) {
        caption.innerHTML = 'Menampilkan harga <strong>Bulanan</strong> (berlaku selama 30 hari kalender setelah pembelian).';
      }

      priceAmounts.forEach((el) => {
        const monthPrice = el.getAttribute('data-month');
        if (monthPrice) el.textContent = monthPrice;
      });

      pricePeriods.forEach((el) => {
        const monthPeriod = el.getAttribute('data-month') || '/bulan';
        el.textContent = monthPeriod;
      });
    }
  }
}

