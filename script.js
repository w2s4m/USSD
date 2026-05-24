// =====================
// USSD Pay v2
// =====================

let selectedService = "jawwal";

let currentUSSD = "";

// =====================
// Splash Screen
// =====================

window.addEventListener(
"load",

()=>{

    loadTheme();

    loadReceivers();

    loadHistory();

    loadLastAmount();

    setTimeout(()=>{

        const splash =
        document.getElementById(
            "splash"
        );

        if(splash){

            splash.style.display =
            "none";

        }

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

    if(!toast) return;

    toast.textContent =
    message;

    toast.classList.add(
        "show"
    );

    setTimeout(()=>{

        toast.classList.remove(
            "show"
        );

    },2500);

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

    const receivers =
    getReceivers();

    receivers.forEach(

    (receiver,index)=>{

        const option =

        document.createElement(
            "option"
        );

        option.value =
        index;

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

        receivers[
            this.value
        ];

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
// المفضلة
// =====================

function toggleFavorite(index){

    const receivers =

    getReceivers();

    receivers[index]
    .favorite =

    !receivers[index]
    .favorite;

    saveReceivers(
        receivers
    );

    loadReceivers();

    showToast(
        "تم تحديث المفضلة"
    );

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
    getHistory();

    history
    .slice()
    .reverse()
    .forEach(item=>{

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

        container.appendChild(
            div
        );

    });

}

// =====================
// توليد USSD
// =====================

function generateUSSD(){

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

        loadHistory();

    },700);

}

// =====================
// نافذة المراجعة
// =====================

function openUSSDModal(){

    const modal =

    document.getElementById(
        "ussdModal"
    );

    const preview =

    document.getElementById(
        "ussdPreview"
    );

    preview.value =
    currentUSSD;

    modal.style.display =
    "flex";

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

    haptic();

}

// =====================
// الاتصال
// =====================

function callUSSD(){

    const encoded =

    currentUSSD.replace(
        "#",
        "%23"
    );

    window.location.href =

    `tel:${encoded}`;

}

// =====================
// إغلاق النافذة
// =====================

window.addEventListener(
"click",

(event)=>{

    const modal =

    document.getElementById(
        "ussdModal"
    );

    if(
        event.target ===
        modal
    ){

        closeUSSDModal();

    }

});

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