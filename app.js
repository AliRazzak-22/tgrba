// ================= المتغيرات العامة =================
let selectedAccount = '';
let selectedGender = '';

// ================= دوال شاشة تسجيل الدخول =================

function openPasswordModal(accountName) {
    selectedAccount = accountName;
    document.getElementById('login-account-name').innerText = 'مرحباً، ' + accountName;
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').innerText = '';
    document.getElementById('password-modal').classList.add('active');
    document.getElementById('login-password').focus();
}

function openAddAccountModal() {
    selectedGender = '';
    document.querySelectorAll('.gender-logo').forEach(el => el.classList.remove('selected'));
    document.getElementById('new-account-name').value = '';
    document.getElementById('new-account-password').value = '';
    document.getElementById('add-account-modal').classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

function selectGender(gender) {
    selectedGender = gender;
    document.querySelectorAll('.gender-logo').forEach(el => el.classList.remove('selected'));
    document.getElementById(`gender-${gender}`).classList.add('selected', gender);
}

// زر الانتر في الباسورد
document.getElementById('login-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});

// اختصار Ctrl+S للبيع الكاش
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // منع حفظ الصفحة في المتصفح
        // هنا يتم استدعاء دالة البيع كاش
        if(document.getElementById('main-screen').classList.contains('active')) {
            alert('تم تنفيذ البيع كاش!');
        }
    }
});

// ================= تسجيل الدخول وإدارة الجلسة =================

function login() {
    const pass = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    // برمجة حساب علي رزاق (الآدمن)
    if (selectedAccount === 'علي رزاق') {
        if (pass === '2005') {
            closeModals();
            enterSystem('علي رزاق');
        } else {
            errorMsg.innerText = 'كلمة المرور غير صحيحة';
        }
    } else {
        // حسابات أخرى مستقبلاً
        errorMsg.innerText = 'هذا الحساب قيد التطوير';
    }
}

function enterSystem(userName) {
    // تبديل الشاشات
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    
    // تعيين اسم المستخدم
    document.getElementById('logged-in-user').innerText = userName;
    
    // تشغيل الساعة
    startClock();
}

function createAccount() {
    const name = document.getElementById('new-account-name').value;
    const pass = document.getElementById('new-account-password').value;

    if (!selectedGender || !name || !pass) {
        alert('يرجى تحديد الجنس واسم الحساب وكلمة المرور');
        return;
    }

    // هنا مستقبلاً كود رفع بيانات الحساب للفايربيس وإضافته للشاشة
    alert('تم إنشاء الحساب برمجياً بنجاح! سيتم ربطه بقاعدة البيانات لاحقاً.');
    closeModals();
}

// ================= تحديث الوقت والتاريخ =================

function startClock() {
    const timeDisplay = document.getElementById('current-date-time');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    setInterval(() => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-IQ', options);
        const timeStr = now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second:'2-digit' });
        timeDisplay.innerText = `${dateStr} | ${timeStr}`;
    }, 1000);
}
