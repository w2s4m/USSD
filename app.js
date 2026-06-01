// =============================
// USSD Pay v3.0 - App Logic
// =============================

const APP_VERSION = '3.0';
const CACHE_VERSION = 'ussd-pay-v3.0';
let selectedService = 'jawwal';
let currentUSSD = '';
let historyExpanded = false;
let deferredPrompt = null;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadTheme();
    loadReceivers();
    loadHistory();
    loadLastAmount();
    detectDevice();
    updateClock();
    setupServiceWorkerUpdate();
    setupNetworkListener();
    setupServiceButtons();
    setupInstallPrompt();
    setupIOSDetection();
    
    setInterval(updateClock, 1000);
    
    setTimeout(() => {
        const splash = document.getElementById('splash');
        if (splash) splash.style.display = 'none';
    }, 2500);
}

// ===== Theme Management =====
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcon();
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
    showToast('تم تغيير المظهر');
    vibrate(25);
}

function updateThemeIcon() {
    const icon = document.querySelector('.btn-icon i');
    if (icon) {
        const isLight = document.body.classList.contains('light-theme');
        icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== Notifications =====
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

// ===== Vibration (Haptic Feedback) =====
function vibrate(ms = 25) {
    if (navigator.vibrate) {
        navigator.vibrate(ms);
    }
}

// ===== Device Detection =====
function detectDevice() {
    const ua = navigator.userAgent;
    let device = 'جهاز';
    
    if (/iPhone/i.test(ua)) device = 'iPhone';
    else if (/iPad/i.test(ua)) device = 'iPad';
    else if (/Samsung/i.test(ua)) device = 'Samsung';
    else if (/Xiaomi|Redmi|Mi/i.test(ua)) device = 'Xiaomi';
    else if (/Huawei/i.test(ua)) device = 'Huawei';
    else if (/Realme/i.test(ua)) device = 'Realme';
    else if (/OPPO/i.test(ua)) device = 'OPPO';
    else if (/Vivo/i.test(ua)) device = 'Vivo';
    else if (/Android/i.test(ua)) device = 'Android';
    else if (/Mac/i.test(ua)) device = 'Mac';
    else if (/Windows/i.test(ua)) device = 'Windows';
    
    const el = document.getElementById('deviceName');
    if (el) el.textContent = device;
    
    return device;
}

// ===== Clock =====
function updateClock() {
    const now = new Date();
    
    const timeStr = now.toLocaleTimeString('ar-PS', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateStr = now.toLocaleDateString('ar-PS', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const timeEl = document.getElementById('timeText');
    const dateEl = document.getElementById('dateText');
    
    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
}

// ===== Network Status =====
function setupNetworkListener() {
    const updateStatus = () => {
        const statusEl = document.getElementById('networkStatus');
        if (!statusEl) return;
        
        if (navigator.onLine) {
            statusEl.innerHTML = '<i class="fas fa-wifi"></i> متصل';
            statusEl.className = 'info-item status-online';
        } else {
            statusEl.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
            statusEl.className = 'info-item status-offline';
        }
    };
    
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

// ===== Service Selection =====
function setupServiceButtons() {
    const buttons = document.querySelectorAll('.service-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedService = btn.dataset.service;
            vibrate(20);
        });
    });
}

// ===== Storage Management =====
function getReceivers() {
    return JSON.parse(localStorage.getItem('receivers') || '[]');
}

function saveReceivers(data) {
    localStorage.setItem('receivers', JSON.stringify(data));
}

function loadReceivers() {
    const receivers = getReceivers();
    const hasFavorites = receivers.some(r => r.favorite);
    
    if (hasFavorites) {
        const section = document.getElementById('favoritesSection');
        if (section) section.style.display = 'block';
        loadFavorites();
    }
}

function loadFavorites() {
    const receivers = getReceivers();
    const list = document.getElementById('favoritesList');
    if (!list) return;
    
    list.innerHTML = '';
    receivers.filter(r => r.favorite).forEach(receiver => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <div class="favorite-avatar">${receiver.name.charAt(0)}</div>
            <div class="favorite-name">${receiver.name}</div>
            <div class="favorite-phone">${receiver.phone}</div>
        `;
        item.onclick = () => selectReceiver(receiver);
        list.appendChild(item);
    });
}

function selectReceiver(receiver) {
    document.getElementById('receiverName').value = receiver.name;
    document.getElementById('phone').value = receiver.phone;
    vibrate(20);
}

function saveReceiver() {
    vibrate(25);
    
    const name = document.getElementById('receiverName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!name || !phone) {
        showToast('أدخل الاسم والرقم');
        return;
    }
    
    const receivers = getReceivers();
    
    if (receivers.some(r => r.phone === phone)) {
        showToast('الرقم محفوظ مسبقاً');
        return;
    }
    
    receivers.push({
        id: Date.now(),
        name,
        phone,
        favorite: false,
        added: new Date().toISOString()
    });
    
    saveReceivers(receivers);
    loadReceivers();
    showToast('✓ تم حفظ المستلم');
}

// ===== History Management =====
function getHistory() {
    return JSON.parse(localStorage.getItem('history') || '[]');
}

function saveHistory(data) {
    localStorage.setItem('history', JSON.stringify(data.slice(-50)));
}

function loadHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;
    
    const history = getHistory().reverse();
    const displayed = historyExpanded ? history : history.slice(0, 3);
    
    container.innerHTML = '';
    
    if (displayed.length === 0) {
        container.innerHTML = '<div class="history-empty">لا توجد تحويلات بعد</div>';
        return;
    }
    
    displayed.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-item-info">
                <div class="history-item-name">${item.name}</div>
                <div class="history-item-phone">${item.phone}</div>
                <div class="history-item-date">${item.date}</div>
            </div>
            <div class="history-item-amount">${item.amount} ₪</div>
        `;
        container.appendChild(div);
    });
    
    const btn = document.getElementById('showMoreBtn');
    if (btn) {
        if (history.length > 3) {
            btn.style.display = 'block';
            btn.textContent = historyExpanded ? 'إخفاء' : 'عرض المزيد';
        } else {
            btn.style.display = 'none';
        }
    }
}

function toggleHistory() {
    historyExpanded = !historyExpanded;
    loadHistory();
}

function loadLastAmount() {
    const amount = localStorage.getItem('lastAmount');
    if (amount) {
        document.getElementById('amount').value = amount;
    }
}

// ===== Password Management =====
function getPassword() {
    let password = localStorage.getItem('ussd_password');
    if (!password) {
        password = prompt('أدخل كلمة السر لجوال باي:');
        if (password) {
            localStorage.setItem('ussd_password', password);
        }
    }
    return password;
}

function clearPassword() {
    localStorage.removeItem('ussd_password');
    showToast('تم حذف كلمة السر');
}

// ===== USSD Generation =====
function generateUSSD() {
    vibrate(30);
    
    const name = document.getElementById('receiverName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const amount = document.getElementById('amount').value.trim();
    
    if (!phone || !amount) {
        showToast('أدخل الرقم والمبلغ');
        return;
    }
    
    showLoader(true);
    
    setTimeout(() => {
        localStorage.setItem('lastAmount', amount);
        
        if (selectedService === 'jawwal') {
            const password = getPassword();
            if (!password) {
                showLoader(false);
                return;
            }
            currentUSSD = `*110*1*${password}*${phone}*${amount}*1#`;
        } else {
            currentUSSD = `*370*1*1*${phone}*${amount}#`;
        }
        
        showLoader(false);
        openUSSDModal();
        
        // Save to history
        const history = getHistory();
        history.push({
            name: name || phone,
            phone,
            amount,
            service: selectedService,
            date: new Date().toLocaleString('ar-PS')
        });
        
        saveHistory(history);
        loadHistory();
        
    }, 500);
}

// ===== USSD Modal =====
function openUSSDModal() {
    vibrate(20);
    const modal = document.getElementById('ussdModal');
    const preview = document.getElementById('ussdPreview');
    if (modal && preview) {
        preview.value = currentUSSD;
        modal.classList.add('show');
    }
}

function closeUSSDModal() {
    const modal = document.getElementById('ussdModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function copyUSSD() {
    navigator.clipboard.writeText(currentUSSD).then(() => {
        showToast('✓ تم النسخ');
        vibrate(15);
        closeUSSDModal();
    });
}

function callUSSD() {
    vibrate(30);
    const encoded = encodeURIComponent(currentUSSD);
    closeUSSDModal();
    window.location.href = `tel:${encoded}`;
}

// ===== Install Prompt =====
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const banner = document.getElementById('installBanner');
        if (banner) banner.classList.add('show');
    });
    
    window.addEventListener('appinstalled', () => {
        showToast('✓ تم تثبيت التطبيق');
        deferredPrompt = null;
    });
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') {
                deferredPrompt = null;
                dismissInstall();
            }
        });
    }
}

function dismissInstall() {
    const banner = document.getElementById('installBanner');
    if (banner) banner.classList.remove('show');
}

// ===== iOS Detection =====
function setupIOSDetection() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('ios_install_dismissed');
    
    if (isIOS && !isStandalone && !dismissed) {
        setTimeout(() => {
            const modal = document.getElementById('iosModal');
            if (modal) modal.classList.add('show');
        }, 3000);
    }
}

function closeIOSGuide() {
    const modal = document.getElementById('iosModal');
    if (modal) modal.classList.remove('show');
    localStorage.setItem('ios_install_dismissed', 'true');
}

// ===== Service Worker Update =====
function setupServiceWorkerUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            showToast('✓ تم تحديث التطبيق');
        });
    }
}

// ===== Backup/Restore =====
function exportBackup() {
    const data = {
        version: APP_VERSION,
        receivers: getReceivers(),
        history: getHistory(),
        theme: localStorage.getItem('theme'),
        exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ussd-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ تم تصدير النسخة');
}

function importBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.receivers) saveReceivers(data.receivers);
            if (data.history) saveHistory(data.history);
            if (data.theme) {
                localStorage.setItem('theme', data.theme);
                loadTheme();
            }
            loadReceivers();
            loadHistory();
            showToast('✓ تم الاستيراد بنجاح');
        } catch {
            showToast('✗ ملف غير صالح');
        }
    };
    reader.readAsText(file);
}

function resetApp() {
    if (confirm('سيتم حذف جميع البيانات. هل أنت متأكد؟')) {
        localStorage.clear();
        location.reload();
    }
}

// ===== Settings Page Navigation =====
function openSettings() {
    window.location.href = 'settings.html';
}

// Export for settings page
window.APP = {
    exportBackup,
    importBackup,
    resetApp,
    clearPassword,
    getReceivers,
    saveReceivers,
    getHistory,
    saveHistory,
    showToast,
    vibrate
};
