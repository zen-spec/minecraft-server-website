/**
 * LUNEXSMP - LOGIKA INTERAKTIF SITUS
 * Standar Craftsmanship Antislop & Impeccable
 * Fitur: Status Telemetri Live, Salin Alamat IP, Cheatsheet Filter, Accordion Aksesibel, Tabs, Navigasi Mobile
 */

document.addEventListener('DOMContentLoaded', () => {
  initServerStatus();
  initCopyHandlers();
  initCommandsFilter();
  initBillingSwitcher();
  initRulesAccordion();
  initPlatformTabs();
  initMobileNavigation();
});

/* ==========================================================================
   1. Status Telemetri Server Live via Public API
   ========================================================================== */
function initServerStatus() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const playerCount = document.getElementById('player-count');
  const capacityFill = document.getElementById('capacity-fill');
  const capacityTrack = document.getElementById('capacity-track');
  const btnRefresh = document.getElementById('btn-refresh-status');
  const iconRefreshSvg = document.getElementById('icon-refresh-svg');
  const pingBadge = document.getElementById('ping-badge');

  const serverHost = 'play.lunexsmp.my.id';
  const REFRESH_INTERVAL_MS = 30000;
  let refreshTimer = null;
  let isFetching = false;

  fetchServerStatus();

  refreshTimer = setInterval(() => {
    fetchServerStatus();
  }, REFRESH_INTERVAL_MS);

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      if (isFetching) return;
      if (refreshTimer) clearInterval(refreshTimer);
      fetchServerStatus();
      refreshTimer = setInterval(() => {
        fetchServerStatus();
      }, REFRESH_INTERVAL_MS);
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchServerStatus();
    }
  });

  async function fetchServerStatus() {
    isFetching = true;
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
      isFetching = false;
    }
  }

  async function fetchBestResult() {
    const primaryUrl = `https://api.mcstatus.io/v2/status/java/${serverHost}`;
    const fallbackUrl = `https://api.mcsrvstat.us/3/${serverHost}`;

    const normalize = (data, isFallback) => {
      if (!data) return null;
      if (isFallback) {
        return {
          online: Boolean(data.online),
          players: {
            online: data.players ? data.players.online : 0,
            max: data.players ? data.players.max : 100
          }
        };
      }
      return {
        online: Boolean(data.online),
        players: {
          online: data.players ? data.players.online : 0,
          max: data.players ? data.players.max : 100
        }
      };
    };

    const tryFetch = async (url, isFallback) => {
      const data = await fetchWithTimeout(url, 4500);
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
      if (spinning) iconRefreshSvg.classList.add('is-spinning');
      else iconRefreshSvg.classList.remove('is-spinning');
    }
    if (btnRefresh) {
      btnRefresh.disabled = spinning;
    }
  }

  function setOnlineState(data) {
    if (statusDot) {
      statusDot.className = 'status-indicator status-online';
    }
    if (statusText) statusText.textContent = 'Server Online & Siap Dimainkan';

    const online = (data.players && typeof data.players.online === 'number') ? data.players.online : 0;
    const max = (data.players && typeof data.players.max === 'number') ? data.players.max : 150;

    if (playerCount) {
      playerCount.textContent = `${online} / ${max} Pemain`;
    }

    if (capacityFill) {
      const percentage = Math.min(100, Math.max(4, Math.round((online / (max || 1)) * 100)));
      capacityFill.style.width = `${percentage}%`;
    }

    if (capacityTrack) {
      capacityTrack.setAttribute('aria-valuenow', online.toString());
      capacityTrack.setAttribute('aria-valuemax', max.toString());
    }

    if (pingBadge) {
      pingBadge.textContent = '20 TPS Stable';
      pingBadge.style.color = '#86efac';
    }
  }

  function setOfflineState() {
    if (statusDot) {
      statusDot.className = 'status-indicator status-offline';
    }
    if (statusText) statusText.textContent = 'Server Sedang Pemeliharaan / Offline';
    if (playerCount) playerCount.textContent = '0 Pemain Terhubung';
    if (capacityFill) capacityFill.style.width = '0%';
    if (pingBadge) {
      pingBadge.textContent = 'Offline';
      pingBadge.style.color = '#fca5a5';
    }
  }
}

/* ==========================================================================
   2. Fungsionalitas Salin IP & Perintah dengan Feedback Nyata
   ========================================================================== */
function initCopyHandlers() {
  const toast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  // Tombol Salin IP Utama
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-clipboard');
      if (!textToCopy) return;

      copyToClipboard(textToCopy)
        .then(() => {
          showButtonFeedback(btn, 'Tersalin!');
          showToast(`Alamat "${textToCopy}" berhasil disalin ke clipboard!`);
        })
        .catch(() => {
          showToast(`Salin alamat ini secara manual: ${textToCopy}`);
        });
    });
  });

  // Tombol Salin Perintah Cepat
  const copyCmdButtons = document.querySelectorAll('.btn-copy-cmd');
  copyCmdButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmdToCopy = btn.getAttribute('data-clipboard');
      if (!cmdToCopy) return;

      copyToClipboard(cmdToCopy)
        .then(() => {
          showToast(`Perintah "${cmdToCopy}" berhasil disalin!`);
        })
        .catch(() => {
          showToast(`Perintah: ${cmdToCopy}`);
        });
    });
  });

  function copyToClipboard(text) {
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
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (ok) resolve();
        else reject(new Error('Gagal menyalin'));
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function showButtonFeedback(btn, message) {
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }, 2000);
  }

  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

/* ==========================================================================
   3. Filter Kategori Perintah In-Game
   ========================================================================== */
function initCommandsFilter() {
  const filterButtons = document.querySelectorAll('.cmd-filter-btn');
  const commandItems = document.querySelectorAll('.cmd-item');

  if (!filterButtons.length || !commandItems.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetFilter = btn.getAttribute('data-filter');

      // Update state tombol filter
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Saring elemen perintah
      commandItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');
        if (targetFilter === 'all' || itemCategory === targetFilter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. Billing Switcher: Permanen vs Bulanan
   ========================================================================== */
function initBillingSwitcher() {
  const permBtn = document.getElementById('billing-perm-btn');
  const monthBtn = document.getElementById('billing-month-btn');
  const caption = document.getElementById('billing-period-caption');
  const priceElements = document.querySelectorAll('.rank-price');
  const cycleElements = document.querySelectorAll('.rank-cycle');

  if (!permBtn || !monthBtn) return;

  permBtn.addEventListener('click', () => {
    setBillingMode('permanent');
  });

  monthBtn.addEventListener('click', () => {
    setBillingMode('monthly');
  });

  function setBillingMode(mode) {
    if (mode === 'permanent') {
      permBtn.classList.add('active');
      permBtn.setAttribute('aria-selected', 'true');
      monthBtn.classList.remove('active');
      monthBtn.setAttribute('aria-selected', 'false');

      if (caption) {
        caption.innerHTML = 'Menampilkan tarif <strong>Permanen</strong>: bayar sekali dan nikmati keuntungan selamanya tanpa biaya perpanjangan.';
      }

      priceElements.forEach((el) => {
        const permPrice = el.getAttribute('data-perm');
        if (permPrice) el.textContent = permPrice;
      });

      cycleElements.forEach((el) => {
        const permCycle = el.getAttribute('data-perm') || '';
        el.textContent = permCycle;
      });
    } else {
      monthBtn.classList.add('active');
      monthBtn.setAttribute('aria-selected', 'true');
      permBtn.classList.remove('active');
      permBtn.setAttribute('aria-selected', 'false');

      if (caption) {
        caption.innerHTML = 'Menampilkan tarif <strong>Bulanan</strong>: berlaku selama 30 hari kalender sejak aktivasi pembelian.';
      }

      priceElements.forEach((el) => {
        const monthPrice = el.getAttribute('data-month');
        if (monthPrice) el.textContent = monthPrice;
      });

      cycleElements.forEach((el) => {
        const monthCycle = el.getAttribute('data-month') || '/bulan';
        el.textContent = monthCycle;
      });
    }
  }
}

/* ==========================================================================
   5. Accordion Aturan Server (Keyboard & ARIA Accessible)
   ========================================================================== */
function initRulesAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      if (!panel) return;

      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });

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
   6. Tab Panduan Koneksi (Java vs Bedrock)
   ========================================================================== */
function initPlatformTabs() {
  const tabs = document.querySelectorAll('.platform-tab-btn');
  const panels = document.querySelectorAll('.platform-panel');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      switchPlatformTab(tab);
    });

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
        switchPlatformTab(tabs[targetIndex]);
      }
    });
  });

  function switchPlatformTab(activeTab) {
    tabs.forEach((tab) => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    panels.forEach((panel) => {
      panel.classList.remove('active');
      panel.hidden = true;
    });

    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');

    const panelId = activeTab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.hidden = false;
    }
  }
}

/* ==========================================================================
   7. Navigasi Mobile Drawer
   ========================================================================== */
function initMobileNavigation() {
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

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!primaryNav.contains(e.target) && !menuToggle.contains(e.target)) {
      if (primaryNav.classList.contains('is-open')) {
        closeMenu();
      }
    }
  });
}
