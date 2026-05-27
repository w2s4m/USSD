// =====================
// USSD Pay v2.8
// =====================

const APP_VERSION = "2.8";

const VERSION_URL =

"/USSD/version.json";

const savedVersion =
localStorage.getItem(
    "appVersion"
);

if(
    savedVersion !== APP_VERSION
){

    localStorage.clear();

    localStorage.setItem(
        "appVersion",
        APP_VERSION
    );

}

let selectedService = "jawwal";

let currentUSSD = "";

let historyExpanded = false;

// =====================
// Splash Screen
// =====================

window.addEventListener("load",()=>{

    loadTheme();
    loadReceivers();
    loadHistory();
    loadLastAmount();

    detectDevice();
    updateClock();

    setTimeout(()=>{
        const splash = document.getElementById("splash");
        if(splash) splash.style.display = "none";
    },2500);

});

// =====================
// Toast
// =====================

function showToast(message){

    const toast =
    document.getElementById(
        "toast"
    );

    toast.textContent =
    message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        window.toastTimer
    );

    window.toastTimer =
    setTimeout(()=>{

        toast.classList.remove(
            "show"
        );

    },2000);

}

// =====================
// Loader
// =====================

function showLoader(){

    const loader =
    document.getElementById(
        "loader"
    );

    if(loader){

        loader.style.display =
        "flex";

    }

}

function hideLoader(){

    const loader =
    document.getElementById(
        "loader"
    );

    if(loader){

        loader.style.display =
        "none";

    }

}

// =====================
// Haptic
// =====================

function haptic(){

    if(
        navigator.vibrate
    ){

        navigator.vibrate(
            25
        );

    }

}

function detectDevice(){

    const ua = navigator.userAgent;

    let device = "Mobile";

    if(/iPhone/i.test(ua))
        device = "iPhone";

    else if(/iPad/i.test(ua))
        device = "iPad";

    else if(/Samsung/i.test(ua))
        device = "Samsung";

    else if(/Xiaomi|Redmi|Mi/i.test(ua))
        device = "Xiaomi";

    else if(/Huawei/i.test(ua))
        device = "Huawei";

    else if(/Realme/i.test(ua))
        device = "Realme";

    else if(/OPPO/i.test(ua))
        device = "OPPO";

    else if(/Vivo/i.test(ua))
        device = "Vivo";

    else if(/Android/i.test(ua))
        device = "Android";

    else if(/Mac/i.test(ua))
        device = "Mac";

    else if(/Windows/i.test(ua))
        device = "Windows";

    window.deviceName = device;

    const el =
    document.getElementById(
        "deviceName"
    );

    if(el){

        el.textContent =
        device;

    }

}

// =====================
// Clock
// =====================

function updateClock(){

    const now = new Date();

    const time =
    now.toLocaleTimeString(
        "en-US",
        {
            hour:"numeric",
            minute:"2-digit",
            second:"2-digit",
            hour12:true
        }
    );

    const date =
    `${String(now.getDate()).padStart(2,"0")}/${
    String(now.getMonth()+1).padStart(2,"0")
    }/${now.getFullYear()}`;

    document.getElementById(
        "currentTime"
    ).textContent = time;

    document.getElementById(
        "currentDate"
    ).textContent = date;

    document.getElementById(
        "deviceName"
    ).textContent =
    window.deviceName || "";

}

updateClock();

setInterval(
    updateClock,
    1000
);

// =====================
// Theme
// =====================

function loadTheme(){

    const theme =

    localStorage.getItem(
        "theme"
    );

    if(
        theme === "light"
    ){

        document.body.classList.add(
            "light"
        );

    }

}

function toggleTheme(){

    document.body.classList.toggle(
        "light"
    );

    const isLight =

    document.body.classList.contains(
        "light"
    );

    localStorage.setItem(

        "theme",

        isLight
        ? "light"
        : "dark"

    );

    showToast(
        "تم تغيير المظهر"
    );

}
// =====================
// اختيار الخدمة
// =====================

const serviceButtons =

document.querySelectorAll(
".service"
);

serviceButtons.forEach(

button=>{

    button.addEventListener(
    "click",

    ()=>{

        serviceButtons.forEach(
        btn=>{

            btn.classList.remove(
                "active"
            );

        });

        button.classList.add(
            "active"
        );

        selectedService =
        button.dataset.service;

        haptic();

    });

});

// =====================
// كلمة السر
// =====================

function getPassword(){

    let password =

    localStorage.getItem(
        "ussd_password"
    );

    if(!password){

        password = prompt(
            "أدخل كلمة سر جوال باي"
        );

        if(password){

            localStorage.setItem(

                "ussd_password",

                password

            );

        }

    }

    return password;

}

function clearPassword(){

    localStorage.removeItem(
        "ussd_password"
    );

    showToast(
        "تم حذف كلمة السر"
    );

}

// =====================
// آخر مبلغ
// =====================

function loadLastAmount(){

    const amount =

    localStorage.getItem(
        "lastAmount"
    );

    const field =

    document.getElementById(
        "amount"
    );

    if(
        field &&
        amount
    ){

        field.value =
        amount;

    }

}
// =====================
// المستلمين
// =====================

function getReceivers(){

    return JSON.parse(

        localStorage.getItem(
            "receivers"
        ) || "[]"

    );

}

function saveReceivers(data){

    localStorage.setItem(

        "receivers",

        JSON.stringify(data)

    );

}

function loadReceivers(){

    const receivers =
    getReceivers();

    const counter =
    document.getElementById(
        "receiverCount"
    );

    if(counter){

        counter.textContent =
        `${receivers.length} مستلم`;

    }

    const select =
    document.getElementById(
        "savedUsers"
    );

    const favorites =
    document.getElementById(
        "favoritesList"
    );

    if(!select) return;

    select.innerHTML =

    `
    <option value="">
    اختر مستلم
    </option>
    `;

    if(favorites){

        favorites.innerHTML = "";

    }

    receivers.forEach(

    (receiver,index)=>{

        const option =

        document.createElement(
            "option"
        );

        option.value = receiver.id;

        option.textContent =

        receiver.favorite
        ? `⭐ ${receiver.name}`
        : receiver.name;

        select.appendChild(
            option
        );

        if(
            receiver.favorite &&
            favorites
        ){

            const item =

            document.createElement(
                "div"
            );

            item.className =
            "favorite-item";

            item.innerHTML =

            `
            <div class="avatar">
            ${receiver.name.charAt(0)}
            </div>
            
            <strong>
            ${receiver.name}
            </strong>
            
            <br>
            
            ${receiver.phone}
            `;

            item.onclick = ()=>{

                document
                .getElementById(
                    "receiverName"
                )
                .value =
                receiver.name;

                document
                .getElementById(
                    "phone"
                )
                .value =
                receiver.phone;

            };

            favorites.appendChild(
                item
            );

        }

    });

}

function saveReceiver(){

    haptic();

    const name =

    document
    .getElementById(
        "receiverName"
    )
    .value
    .trim();

    const phone =

    document
    .getElementById(
        "phone"
    )
    .value
    .trim();

    if(
        !name ||
        !phone
    ){

        showToast(
            "أدخل الاسم والرقم"
        );

        return;

    }

    const receivers =
    getReceivers();

    const exists =

    receivers.some(

        r =>

        r.phone === phone

    );

    if(exists){

        showToast(
            "الرقم محفوظ مسبقاً"
        );

        return;

    }

    receivers.push({

        id:Date.now(),

        name:name,

        phone:phone,

        favorite:false

    });

    saveReceivers(
        receivers
    );

    loadReceivers();

    showToast(
        "تم حفظ المستلم"
    );

    haptic();

}

const savedUsers =

document.getElementById(
    "savedUsers"
);

if(savedUsers){

    savedUsers.addEventListener(
    "change",
    function(){

        const receivers =
        getReceivers();

        const receiver =
        receivers.find(
            r => r.id == this.value
        );

        if(!receiver){
            return;
        }

        document
        .getElementById("receiverName")
        .value =
        receiver.name;

        document
        .getElementById("phone")
        .value =
        receiver.phone;

    });

}
// =====================
// البحث
// =====================

const searchInput =

document.getElementById(
    "searchReceiver"
);

if(searchInput){

    searchInput.addEventListener(

    "input",

    function(){

        const keyword =

        this.value
        .toLowerCase();

        const select =

        document.getElementById(
            "savedUsers"
        );

        const receivers =
        getReceivers();

        select.innerHTML =

        `
        <option value="">
        اختر مستلم
        </option>
        `;

        receivers.forEach(

        (receiver,index)=>{

            if(

                receiver.name
                .toLowerCase()
                .includes(keyword)

            ){

                const option =

                document.createElement(
                    "option"
                );

                option.value =
                index;

                option.textContent =
                receiver.name;

                select.appendChild(
                    option
                );

            }

        });

    });

}
    
// =====================
// سجل التحويلات
// =====================

function getHistory(){

    return JSON.parse(

        localStorage.getItem(
            "history"
        ) || "[]"

    );

}

function saveHistory(data){

    localStorage.setItem(

        "history",

        JSON.stringify(data)

    );

}

function loadHistory(){

    const container =
    document.getElementById(
        "historyList"
    );

    if(!container){
        return;
    }

    container.innerHTML = "";

    const history =
    getHistory()
    .slice()
    .reverse();

    const displayedHistory =
    historyExpanded
    ? history
    : history.slice(0,3);

    displayedHistory.forEach(item=>{

        const div =
        document.createElement(
            "div"
        );

        div.className =
        "history-item";

        div.innerHTML =

        `
        <strong>${item.name}</strong>
        <br>
        ${item.phone}
        <br>
        ${item.amount} ₪
        <br>
        <small>${item.date}</small>
        `;

        container.appendChild(div);

    });

    if(history.length > 3){

        const btn =
        document.createElement(
            "button"
        );

        btn.className =
        "secondary-btn";

        btn.textContent =

        historyExpanded
        ? "إخفاء التحويلات"
        : "عرض المزيد";

        btn.onclick = ()=>{

            historyExpanded =
            !historyExpanded;

            loadHistory();

        };

        container.appendChild(btn);

    }

}

// =====================
// توليد USSD
// =====================

function generateUSSD(){

    haptic();

    const name =

    document
    .getElementById(
        "receiverName"
    )
    .value
    .trim();

    const phone =

    document
    .getElementById(
        "phone"
    )
    .value
    .trim();

    const amount =

    document
    .getElementById(
        "amount"
    )
    .value
    .trim();

    if(
        !phone ||
        !amount
    ){

        showToast(
            "أدخل الرقم والمبلغ"
        );

        return;

    }

    showLoader();

    setTimeout(()=>{

        localStorage.setItem(
            "lastAmount",
            amount
        );

        if(
            selectedService ===
            "jawwal"
        ){

            const password =
            getPassword();

            if(!password){

                hideLoader();
                return;

            }

            currentUSSD =

            `*110*1*${password}*${phone}*${amount}*1#`;

        }

        else{

            currentUSSD =

            `*370*1*1*${phone}*${amount}#`;

        }

        hideLoader();

        openUSSDModal();

        const history =
        getHistory();

        history.push({

            name:
            name || phone,

            phone,

            amount,

            date:
            new Date()
            .toLocaleString(
                "ar"
            )

        });

        saveHistory(
            history
        );
        localStorage.setItem("lastPhone", phone);
        localStorage.setItem("lastName", name);

        loadHistory();

    },700);

}

// =====================
// نافذة المراجعة
// =====================

function openUSSDModal(){

    haptic();

    const modal = document.getElementById("ussdModal");
    const preview = document.getElementById("ussdPreview");

    preview.value = currentUSSD;

    modal.style.display = "flex";
}

function closeUSSDModal(){

    const modal =

    document.getElementById(
        "ussdModal"
    );

    modal.style.display =
    "none";

}

// =====================
// نسخ الكود
// =====================

function copyUSSD(){

    navigator.clipboard
    .writeText(
        currentUSSD
    );

    showToast(
        "تم نسخ الكود"
    );

    closeUSSDModal();

    haptic();

}

// =====================
// الاتصال
// =====================

function callUSSD(){

    haptic();

    let code = currentUSSD;

    // تحسين التوافق
    code = encodeURIComponent(code);

    closeUSSDModal();

    window.location.href = `tel:${code}`;
}

// =====================
// إغلاق النافذة
// =====================

function closeUSSDModal(){

    const modal =
    document.getElementById(
        "ussdModal"
    );

    modal.style.display =
    "none";

    showToast(
        "تم إغلاق النافذة"
    );

}

// =====================
// نسخة احتياطية
// =====================

function exportBackup(){

    const data = {

        receivers:
        getReceivers(),

        history:
        getHistory(),

        password:
        localStorage.getItem(
            "ussd_password"
        ),

        theme:
        localStorage.getItem(
            "theme"
        )

    };

    const blob =

    new Blob(

        [
            JSON.stringify(
                data,
                null,
                2
            )
        ],

        {
            type:
            "application/json"
        }

    );

    const url =

    URL.createObjectURL(
        blob
    );

    const a =

    document.createElement(
        "a"
    );

    a.href = url;

    a.download =
    "backup.json";

    a.click();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "تم تصدير النسخة"
    );

}

// =====================
// استيراد نسخة
// =====================

function importBackup(file){

    const reader =
    new FileReader();

    reader.onload =

    function(e){

        try{

            const data =

            JSON.parse(
                e.target.result
            );

            if(
                data.receivers
            ){

                localStorage.setItem(

                    "receivers",

                    JSON.stringify(
                        data.receivers
                    )

                );

            }

            if(
                data.history
            ){

                localStorage.setItem(

                    "history",

                    JSON.stringify(
                        data.history
                    )

                );

            }

            if(
                data.password
            ){

                localStorage.setItem(

                    "ussd_password",

                    data.password

                );

            }

            if(
                data.theme
            ){

                localStorage.setItem(

                    "theme",

                    data.theme

                );

            }

            loadReceivers();

            loadHistory();

            showToast(
                "تم الاستيراد بنجاح"
            );

        }

        catch{

            showToast(
                "ملف غير صالح"
            );

        }

    };

    reader.readAsText(
        file
    );

}

function loadLastReceiver(){

    const phone = localStorage.getItem("lastPhone");
    const name = localStorage.getItem("lastName");

    if(phone){
        document.getElementById("phone").value = phone;
    }

    if(name){
        document.getElementById("receiverName").value = name;
    }
}

// =====================
// إعادة ضبط التطبيق
// =====================

function resetApp(){

    const ok = confirm(

        "سيتم حذف جميع البيانات"

    );

    if(!ok){

        return;

    }

    localStorage.clear();

    location.reload();

}

// =====================
// PWA Install
// =====================

let deferredPrompt;

const installBanner =
document.getElementById(
    "installBanner"
);

const installBtn =
document.getElementById(
    "installBtn"
);

window.addEventListener(
"beforeinstallprompt",

(e)=>{

    e.preventDefault();

    deferredPrompt = e;

    if(installBanner){

        installBanner.style.display =
        "flex";

    }

});

if(installBtn){

    installBtn.addEventListener(

    "click",

    async()=>{

        if(!deferredPrompt){

            return;

        }

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        installBanner.style.display =
        "none";

        deferredPrompt = null;

    });

}

window.addEventListener(
"appinstalled",

()=>{

    showToast(
        "تم تثبيت التطبيق"
    );

    if(installBanner){

        installBanner.style.display =
        "none";

    }

});

// =====================
// iPhone Install Modal
// =====================

function closeIOSInstall(){

    document
    .getElementById(
        "iosInstallModal"
    )
    .style.display =
    "none";

    localStorage.setItem(
        "iosInstallHint",
        "1"
    );

}

const isIOS =

/iPad|iPhone|iPod/.test(
navigator.userAgent
);

const isStandalone =

window.matchMedia(
"(display-mode: standalone)"
).matches;

const hintShown =

localStorage.getItem(
    "iosInstallHint"
);

window.addEventListener(
"load",

()=>{

    if(

        isIOS &&
        !isStandalone &&
        !hintShown

    ){

        setTimeout(()=>{

            document
            .getElementById(
                "iosInstallModal"
            )
            .style.display =
            "flex";

        },2500);

    }

});

function deleteReceiver(id){

    let receivers =
    getReceivers();

    receivers =
    receivers.filter(

    r=>

    r.id !== id

    );

    saveReceivers(
        receivers
    );

    loadReceivers();

    showToast(
        "تم الحذف"
    );

}

function editReceiver(id){

    const receivers =
    getReceivers();

    const receiver =
    receivers.find(
        r=>r.id===id
    );

    if(!receiver){
        return;
    }

    document
    .getElementById(
        "receiverName"
    )
    .value =
    receiver.name;

    document
    .getElementById(
        "phone"
    )
    .value =
    receiver.phone;

}

function reTransfer(
phone,
amount
){

    document
    .getElementById(
        "phone"
    )
    .value =
    phone;

    document
    .getElementById(
        "amount"
    )
    .value =
    amount;

    showToast(
        "تم تعبئة البيانات"
    );

}

async function loadBattery(){

    if(
        !navigator.getBattery
    ){
        return;
    }

    const battery =
    await navigator.getBattery();

    document
    .getElementById(
        "batteryInfo"
    )
    .textContent =

    `🔋 ${
    Math.round(
    battery.level*100
    )
    }%`;

}

loadBattery();

function updateNetwork(){

    const el =
    document.getElementById(
        "networkStatus"
    );

    if(!el) return;

    if(
        navigator.onLine
    ){

        el.innerHTML =
        "🟢 متصل";

    }

    else{

        el.innerHTML =
        "🔴 غير متصل";

    }

}

window.addEventListener(
"online",
updateNetwork
);

window.addEventListener(
"offline",
updateNetwork
);

updateNetwork();

if(

localStorage.getItem(
"lastVersion"
)

!==

APP_VERSION

){

showToast(
`تم التحديث للإصدار ${APP_VERSION}`
);

localStorage.setItem(
"lastVersion",
APP_VERSION
);

}

async function checkForUpdates(){

    if(!navigator.onLine){
        return;
    }

    try{

        const response =
        await fetch(
            VERSION_URL +
            "?t=" +
            Date.now()
        );

        const data =
        await response.json();

        if(
            data.version !==
            APP_VERSION
        ){

            const update =
            confirm(
            `يتوفر إصدار جديد (${data.version}) هل تريد التحديث؟`
            );

            if(update){

                if(
                    "caches" in window
                ){

                    const keys =
                    await caches.keys();

                    await Promise.all(
                        keys.map(
                            key =>
                            caches.delete(key)
                        )
                    );

                }

                location.reload(true);

            }

        }

    }

    catch(error){

        console.log(
        "تعذر التحقق من التحديثات"
        );

    }

}

window.addEventListener(
"load",
checkForUpdates
);