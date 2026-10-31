/* =========================================================================
   طبقة عرض للجوال فقط — لا تُحمَّل ولا تعمل إطلاقاً على الكمبيوتر
   تعتمد على صنف html.is-mobile الذي يحدده سكريبت الكشف في رأس الصفحة.
   لا تغيّر منطق الأعمال: تستدعي دوال النظام الحالية كما هي.
   ========================================================================= */
(function () {
    'use strict';

    const root = document.documentElement;
    if (!root.classList.contains('is-mobile')) return;

    const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const BAR_SELECTOR = '#mobile-bottom-nav';
    const ADMIN_ID = 'admin-screen';
    const SETTINGS_BACKUP_VIEW = 'desktop';

/* ------------------------- هوية الزجاج: أزرق · أسود · رصاصي · أبيض -------------------------
   كل قاعدة تبدأ بـ html.is-mobile: لا يصل شيء منها إلى نسخة الكمبيوتر.
   متغيرات النظام (--gold وغيرها) تُعاد تعريفها هنا على وسم html، فتتلوّن كل
   reference في index.html و style.css تلقائياً بلا لمس أي ملف مشترك.            */
    const CSS = `
html.is-mobile {
    --m-bg: #03060c;
    --m-card: #0a1424;
    --m-card2: #101d33;
    --m-text: #eaf3ff;
    --m-ink: #eaf3ff;
    --m-muted: #94aac6;
    --m-faint: #647c99;
    --m-line: rgba(130,185,255,.15);
    --m-hair: rgba(150,200,255,.085);
    --m-accent: #5aa8ff;
    --m-accent2: #93d6ff;
    --m-indigo: #5b6bff;
    --m-deep: #2148a8;
    /* زجاج ياقوتي بنفس كثافة شاشة القفل: جسم مائل للأزرق أفتح، وضوء علوي
       سماوي، وحافة داخلية ساطعة. كل الألوان زرقاء — لا تدرّج أبيض إلى أزرق. */
    /* كثافة أعلى قليلاً: شبكة المشهد المحفورة كانت تنفذ عبر البطاقة فتُقرأ
       كخطوط قطرية تقطعها. الآن التعبئة نظيفة والخطوط تبقى في الفراغ بينها. */
    --m-glass-bg: rgba(22,47,94,.68);
    --m-glass: linear-gradient(160deg, rgba(170,214,255,.20) 0%, rgba(90,140,226,.045) 46%, rgba(128,184,255,.14) 100%);
    --m-sheen: radial-gradient(130% 62% at 50% -14%, rgba(160,210,255,.32), rgba(160,210,255,0) 64%);
    --m-edge: rgba(162,212,255,.26);
    --m-edge-hi: rgba(214,238,255,.48);
    --m-lift: 0 18px 38px rgba(1,6,16,.50), inset 0 1px 0 rgba(208,236,255,.38), inset 0 0 0 1px rgba(150,200,255,.10);
    --m-rim: inset 0 1px 0 rgba(212,238,255,.40), inset 0 -1px 0 rgba(10,26,52,.45), inset 0 0 0 1px rgba(150,200,255,.11);
    /* الهندسة: وجه مشطوف للوحات الكبيرة، وصحن ثماني للأيقونات، وخدش زجاجي مائل */
    --m-facet: polygon(22px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 22px);
    --m-facet-xl: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px);
    --m-facet-sm: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
    --m-plate: polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%);
    --m-gold: #5aa8ff;
    --m-gold-soft: rgba(90,168,255,.14);
    --m-green: #3ddc97;
    --m-red: #ff5d6c;
    --m-blue: #5aa8ff;
    --m-radius-card: 20px;
    --m-radius-sheet: 26px;
    --m-radius-bar: 26px;
    --m-radius-pill: 19px;
    --m-radius-grain: 99px;
    --m-ease: cubic-bezier(.22,.9,.24,1);
    --m-ease-out: cubic-bezier(.16,1,.3,1);
    --m-bar-h: 64px;
    --m-kb: 0px;
    --m-n: 1;
    color-scheme: dark;

    --gold: #5aa8ff;
    /* لا أبيض في أي تدرّج: الملكي أزرق ياقوتي إلى نيلي. */
    --gold-gradient: linear-gradient(135deg, #79c4ff 0%, #3b8bf0 48%, #3646d6 100%);
    --black-bg: #03060c;
    --dark-gray: #0a1424;
    --light-gray: #223a5c;
    --text-white: #eef5ff;
    --text-gray: #94aac6;
    --blue-electronic: #93d6ff;
    --green-success: #3ddc97;
    --red-danger: #ff5d6c;
}

html.is-mobile { height: 100%; overflow: hidden; overscroll-behavior: none; background: #04070f; }

/* المستند مثبّت لا يُتمرَّر: في safari هذا هو السبب الوحيد الذي يحرّك العناصر
   المثبتة — المستند يرتد بالمط عند نهاية السحب وشريط العنوان ينكمش فيعيد حساب
   الأسفل. بتثبيت body يبقى الشريط في مكانه، وكل تمرير يحدث داخل اللوحات وحدها.
   جسم الصفحة شفاف: كان يطلي #03060c فوق المشهد، فبدت الشاشة كلها سوداء ولا
   يظهر من الخلفية الهندسية شيء. اللون الأساسي على html، والمشهد فوقه. */
html.is-mobile body {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
    background: transparent;
    color: var(--m-text);
    font-family: -apple-system, "SF Arabic", "Segoe UI", Cairo, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    margin: 0;
}

/* مشهد الخلفية: أسود مزرق تسبح فيه سحب نيلي وأزرق ياقوتي. أُزيلت الشبكة
   المحفورة بالميلين: خطوطها الرفيعة كانت تنفذ عبر الزجاج فتُقرأ كخدوش تقطع
   البطاقات. كل الحركة transform على طبقتين مثبّتَين فقط — لا background-position
   ولا blur: الطبقتان تُرسمان مرة واحدة ثم تنزلقان على معالج الرسوم.
   ما يشبه البلور في البطاقات أعلاه هو ضوء وحواف، لا فلتر. */
html.is-mobile body::before {
    content: "";
    position: fixed;
    inset: -6%;
    z-index: -2;
    pointer-events: none;
    will-change: transform;
    background:
        radial-gradient(58% 38% at 84% 4%, rgba(96,104,255,.60), transparent 70%),
        radial-gradient(64% 42% at 8% 34%, rgba(34,128,255,.50), transparent 72%),
        radial-gradient(44% 30% at 34% 62%, rgba(74,62,226,.32), transparent 76%),
        radial-gradient(94% 52% at 50% 112%, rgba(46,102,236,.58), transparent 72%),
        linear-gradient(175deg, #081022 0%, #040812 46%, #0a1430 100%);
    animation: mFieldDrift 38s ease-in-out infinite alternate;
}
/* حزام ضوء ينزلق على الحقل ببطء: انكسار زجاجي، لا إشعاع */
html.is-mobile body::after {
    content: "";
    position: fixed;
    inset: -22%;
    z-index: -1;
    pointer-events: none;
    opacity: .92;
    will-change: transform;
    background:
        linear-gradient(104deg,
            transparent 34%,
            rgba(96,160,255,.10) 45%,
            rgba(180,222,255,.20) 50%,
            rgba(96,160,255,.10) 55%,
            transparent 66%),
        radial-gradient(52% 26% at 72% 22%, rgba(99,110,255,.26), transparent 70%),
        radial-gradient(40% 22% at 18% 78%, rgba(56,189,248,.16), transparent 72%);
    animation: mSilk 26s var(--m-ease) infinite alternate;
}
@keyframes mFieldDrift {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to   { transform: translate3d(-2.4%, 1.8%, 0) scale(1.07); }
}
@keyframes mSilk { from { transform: translate3d(-13%, -7%, 0); } to { transform: translate3d(13%, 7%, 0); } }

html.is-mobile .screen { height: 100%; }
html.is-mobile #pos-screen.active-screen,
html.is-mobile #main-screen.active-screen {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
}

html.is-mobile #admin-screen.active-screen {
    display: flex;
    flex-direction: column;
    position: fixed;
    inset: 0;
    width: 100%;
    max-width: 720px !important;
    margin-inline: auto;
    height: 100%;
    overflow: hidden;
    padding-top: env(safe-area-inset-top);
    /* style.css يطلي الشاشة بـ var(--black-bg)؛ هنا نتخلّى عن الطلاء كي يظهر
       المشهد المتحرك في الفجوات وخلف الزجاج — وهو أصل «لا أرى فرقاً». */
    background: transparent !important;
}
html.is-mobile #admin-screen .admin-content,
html.is-mobile #admin-screen .admin-layout,
html.is-mobile #admin-screen .admin-section { background: transparent !important; }

html.is-mobile .admin-sidebar { display: none; }

/* الارتفاع يُقسم بعد الترويسة: لو بقيت الحاوية على 100% من الشاشة فإن آخر الصفحة
   يقع تحت الشريط السفلي ولا يصل إليه التمرير (سبب نقص صفحة المزيد). */
html.is-mobile .admin-layout {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    height: auto;
}
html.is-mobile .admin-content {
    position: relative;
    flex: 1;
    min-height: 0;
    height: auto;
    padding: 0;
    overflow: hidden;
}

/* ------------------------- الترويسة: زجاج مثبت -------------------------
   بلا backdrop-filter: الشريط ثابت فوق محتوى يتحرك، وblur فوقه يعني إعادة رسم
   كامل الشريط كل إطار. الزجاج هنا طبقات ضوء وحواف فقط — نفس إحساس شاشة القفل. */
html.is-mobile .m-head {
    position: relative;
    z-index: 6;
    flex: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 16px 10px;
    border-bottom: 1px solid rgba(170,215,255,.22);
    background:
        linear-gradient(180deg, rgba(160,208,255,.18), rgba(132,186,255,.02) 70%),
        radial-gradient(120% 160% at 50% -60%, rgba(70,130,235,.36), transparent 64%),
        rgba(8,18,38,.52);
    box-shadow: 0 12px 30px rgba(0,4,12,.36), inset 0 1px 0 rgba(208,236,255,.16);
    /* الترويسة مثبتة: السحب عليها لا يحرك المستند */
    touch-action: none;
}
html.is-mobile .m-head:empty { display: none; }
html.is-mobile .m-head::after {
    content: "";
    position: absolute;
    left: 0; right: 0; bottom: -1px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(160,215,255,.46), transparent);
}
/* الاسم: ثلجي صافٍ بلا أي تدرّج. gradient-text مع clip يُختفي على آيفون أثناء
   التمرير، وفوق ذلك كان أبيضَ إلى أزرق — وهو التدرّج المرفوض. */
.m-brand {
    font-size: 21px;
    font-weight: 900;
    letter-spacing: .3px;
    color: #eaf4ff;
    -webkit-text-fill-color: #eaf4ff;
    background: none;
    text-shadow: 0 1px 0 rgba(0,0,0,.45), 0 0 14px rgba(90,168,255,.20);
    transition: font-size .26s var(--m-ease), letter-spacing .26s var(--m-ease);
}
.m-conn { margin-inline-start: auto; display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--m-muted); }
/* نقطة الاتصال: قرينة صلبة بحلقة ضوئية رفيعة بدل الهالة */
.m-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--m-green); box-shadow: inset 0 0 0 1px rgba(255,255,255,.45), 0 0 0 3px rgba(61,220,151,.14); }
.m-dot.off { background: var(--m-red); box-shadow: inset 0 0 0 1px rgba(255,255,255,.45), 0 0 0 3px rgba(255,93,108,.16); }
.m-time {
    font-size: 12px; color: var(--m-muted); font-variant-numeric: tabular-nums; min-width: 46px; text-align: end;
    padding: 3px 8px; border-radius: 99px; border: 1px solid var(--m-hair); background: rgba(255,255,255,.04);
    transition: font-size .26s var(--m-ease);
}
/* خيط تقدّم أسفل الترويسة: يمتلئ من جهة القراءة مع تمرير اللوحة الطويلة،
   فتعرف أين أنت بلا شريط تمرير يقتحم الزجاج. transform فقط، بلا تخطيط. */
html.is-mobile .m-head-prog {
    position: absolute;
    left: 0; right: 0; bottom: -1px;
    height: 2px;
    pointer-events: none;
    background: linear-gradient(90deg, rgba(120,190,255,.30), rgba(150,222,255,.95));
    transform: scaleX(var(--m-prog, 0));
    transform-origin: right center;
    opacity: 0;
    transition: opacity .28s var(--m-ease);
}
html.is-mobile .m-head.m-scrolled .m-head-prog { opacity: 1; }
/* بعد أول تمرير يعمق الزجاج قليلاً: فصل بصري بين الترويسة والمحتوى المتحرك */
html.is-mobile .m-head { transition: background .3s var(--m-ease), box-shadow .3s var(--m-ease), padding .26s var(--m-ease); }
/* انكماش الترويسة عند النزول: شريط أرفع للقراءة الطويلة، يعود كاملاً عند
   الرجوع لبداية اللوحة. عتبة الانكماش (110) أعلى من عتبة العودة (40) فتمنع
   الرفرفة عند الحد. تغيير واحد لكل إطار، والارتفاع وحده يتغيّر. */
html.is-mobile .m-head.m-compact {
    padding: 5px 14px 5px;
}
html.is-mobile .m-head.m-compact .m-brand {
    font-size: 16px;
    letter-spacing: .2px;
}
html.is-mobile .m-head.m-compact .m-time { font-size: 11px; }
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-head,
    html.is-mobile .m-brand,
    html.is-mobile .m-time { transition: none; }
}
html.is-mobile .m-head.m-scrolled {
    background:
        linear-gradient(180deg, rgba(160,208,255,.24), rgba(132,186,255,.04) 70%),
        radial-gradient(120% 160% at 50% -60%, rgba(70,130,235,.40), transparent 64%),
        rgba(6,14,30,.66);
    box-shadow: 0 16px 34px rgba(0,4,12,.46), inset 0 1px 0 rgba(208,236,255,.18);
}
html.is-mobile body.rg-light .m-head.m-scrolled {
    background:
        linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.72) 70%),
        radial-gradient(120% 160% at 50% -60%, rgba(var(--rg-accent-rgb), .20), transparent 64%);
    box-shadow: 0 16px 34px rgba(28,62,110,.14), inset 0 1px 0 rgba(255,255,255,.98);
}
html.is-mobile body.rg-light .m-head-prog {
    background: linear-gradient(90deg, rgba(47,127,208,.30), rgba(24,102,180,.92));
}

/* ------------------- شريط الشبكة: حجز مساحة لا تغطية -------------------
   مصدره قناة فايربيس الحقيقية وعدّاد الصندوق الأسود، فيسرد آخر مزامنة فعلية
   وكم حركة تنتظر الرفع. يوضع بين الترويسة والمحتوى فيدفع الصفحة بدل أن يغطيها. */
html.is-mobile .m-conn {
    cursor: pointer; user-select: none; -webkit-user-select: none;
    padding: 3px 8px; margin-inline-start: auto; margin-inline-end: -2px;
    border-radius: 99px; transition: color .3s var(--m-ease), background .3s var(--m-ease);
}
html.is-mobile .m-conn:active { opacity: .6; }
html.is-mobile .m-conn[data-net="offline"] { color: #ffb3bd; }
html.is-mobile .m-conn[data-net="pending"] { color: #f3cd86; }
html.is-mobile body.rg-light .m-conn[data-net="offline"] { color: #a11f34; }
html.is-mobile body.rg-light .m-conn[data-net="pending"] { color: #8a5a10; }
.m-dot.sync {
    background: #f2b33d;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.45), 0 0 0 3px rgba(242,179,61,.18);
    animation: mDotWait 1.5s var(--m-ease) infinite;
}
@keyframes mDotWait {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .5; transform: scale(.68); }
}

html.is-mobile .m-netbar {
    flex: none;
    display: flex; align-items: center; gap: 10px;
    max-height: 0; opacity: 0; overflow: hidden;
    margin: 0 12px; padding: 0 12px;
    border: 0 solid transparent; border-radius: 16px;
    transform: translateY(-6px);
    transition: max-height .4s var(--m-ease), opacity .32s var(--m-ease),
                margin .4s var(--m-ease), padding .4s var(--m-ease),
                transform .4s var(--m-ease), background .3s var(--m-ease),
                border-color .3s var(--m-ease), box-shadow .3s var(--m-ease);
    pointer-events: none;
}
html.is-mobile .m-netbar.m-show {
    max-height: 112px; opacity: 1;
    margin: 8px 12px 2px; padding: 9px 11px;
    border-width: 1px;
    transform: none;
    pointer-events: auto;
}
html.is-mobile .m-netbar-ico {
    flex: none; width: 30px; height: 30px; border-radius: 50%;
    display: grid; place-items: center; font-size: 13px;
    background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);
}
html.is-mobile .m-netbar-body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
html.is-mobile .m-netbar-body b { font-size: 12.5px; font-weight: 800; line-height: 1.3; }
html.is-mobile .m-netbar-body small {
    font-size: 11px; opacity: .86; line-height: 1.35;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
}
html.is-mobile .m-netbar-act {
    flex: none; font-family: inherit; font-size: 11.5px; font-weight: 800;
    color: inherit; background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.22); border-radius: 11px;
    padding: 7px 10px; cursor: pointer;
    transition: transform .2s var(--m-ease), background .3s var(--m-ease);
}
html.is-mobile .m-netbar-act:active { transform: scale(.93); }
html.is-mobile .m-netbar-act[hidden] { display: none; }

html.is-mobile .m-netbar[data-state="offline"] {
    color: #ffe1e5;
    background: linear-gradient(160deg, rgba(255,93,108,.20), rgba(255,93,108,.05) 62%), rgba(16,10,20,.80);
    border-color: rgba(255,93,108,.36);
    box-shadow: 0 12px 26px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.10);
}
html.is-mobile .m-netbar[data-state="pending"] {
    color: #ffe6bd;
    background: linear-gradient(160deg, rgba(242,179,61,.20), rgba(242,179,61,.05) 62%), rgba(20,14,6,.80);
    border-color: rgba(242,179,61,.34);
    box-shadow: 0 12px 26px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.10);
}
html.is-mobile .m-netbar[data-state="syncing"] {
    color: #d6ebff;
    background: linear-gradient(160deg, rgba(96,166,255,.22), rgba(96,166,255,.05) 62%), rgba(8,16,30,.82);
    border-color: rgba(120,190,255,.34);
    box-shadow: 0 12px 26px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.10);
}
html.is-mobile .m-netbar[data-state="back"] {
    color: #d3ffe9;
    background: linear-gradient(160deg, rgba(61,220,151,.18), rgba(61,220,151,.04) 62%), rgba(6,18,14,.80);
    border-color: rgba(61,220,151,.32);
    box-shadow: 0 12px 26px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.10);
}
html.is-mobile .m-netbar[data-state="info"] {
    color: #e3f1ff;
    background: linear-gradient(160deg, rgba(120,190,255,.16), rgba(120,190,255,.04) 62%), rgba(9,17,31,.78);
    border-color: rgba(150,205,255,.28);
    box-shadow: 0 12px 26px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.10);
}
html.is-mobile .m-netbar[data-state="syncing"] .m-netbar-ico i { animation: mNetSpin 1s linear infinite; }
@keyframes mNetSpin { to { transform: rotate(360deg); } }

html.is-mobile body.rg-light .m-netbar-ico { background: rgba(255,255,255,.74); border-color: rgba(28,62,110,.14); }
html.is-mobile body.rg-light .m-netbar-act { background: rgba(255,255,255,.86); border-color: rgba(28,62,110,.18); }
html.is-mobile body.rg-light .m-netbar[data-state="offline"] {
    color: #7c1f2c;
    background: linear-gradient(160deg, rgba(255,255,255,.98), rgba(255,240,242,.92));
    border-color: rgba(190,35,60,.28);
    box-shadow: 0 12px 26px rgba(28,62,110,.12), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-netbar[data-state="pending"] {
    color: #7a4b06;
    background: linear-gradient(160deg, rgba(255,255,255,.98), rgba(255,247,231,.94));
    border-color: rgba(190,132,26,.30);
    box-shadow: 0 12px 26px rgba(28,62,110,.12), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-netbar[data-state="syncing"] {
    color: #17457c;
    background: linear-gradient(160deg, rgba(255,255,255,.98), rgba(238,246,255,.94));
    border-color: rgba(42,95,158,.26);
    box-shadow: 0 12px 26px rgba(28,62,110,.12), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-netbar[data-state="back"] {
    color: #0b5c3f;
    background: linear-gradient(160deg, rgba(255,255,255,.98), rgba(236,252,245,.94));
    border-color: rgba(13,107,73,.26);
    box-shadow: 0 12px 26px rgba(28,62,110,.12), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-netbar[data-state="info"] {
    color: #1c4a7e;
    background: linear-gradient(160deg, rgba(255,255,255,.98), rgba(241,247,255,.94));
    border-color: rgba(42,95,158,.22);
    box-shadow: 0 12px 26px rgba(28,62,110,.12), inset 0 1px 0 #fff;
}
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-netbar { transition: none; }
    .m-dot.sync, html.is-mobile .m-netbar[data-state="syncing"] .m-netbar-ico i { animation: none; }
}

/* ------------------------- اللوحات (كاروسيل هندسي) -------------------------
   الموضع أثناء الحركة وحدها: الإصبع والنابض يكتبان transform سطرياً، وعند
   السكون يُمسح تماماً. لوحة التمرير المتحوّلة دائماً هي أشهر سببين في WebKit:
   محتوى يختفي عشوائياً أثناء التمرير، وطبقة رسم دائمة تستهلك الذاكرة.
   بلا contain كذلك: الحاوية تُمرَّر بالمحتوى الكامل، وهذا ما يشعرك بخفة
   تطبيقات الدردشة — التمرير لا يمرّ بأي قصّ أو حوسبة إضافية. */
html.is-mobile .admin-section {
    --m-d: calc(var(--m-i, 0) - var(--m-p, 0));
    --m-ad: max(var(--m-d), calc(var(--m-d) * -1));
    display: none;
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: none;
    padding: 16px 13px calc(var(--m-bar-h) + 84px + env(safe-area-inset-bottom));
    scrollbar-width: none;
    transform: none;
    opacity: 1;
}
html.is-mobile .admin-section::-webkit-scrollbar { display: none; }
html.is-mobile .admin-section.m-seen { display: block; }
/* بوابة العرض النهائية: صفحة بلا m-seen لا تُرسم أبداً مهما كان display في
   style.css أو طغت قاعدة #id. كانت «المزيد» تبقى flex تحت كل الصفحات وتطل
   من بين الزجاج — وهذا سبب المعلومات التي تظهر وتختفي عشوائياً. */
html.is-mobile #admin-screen .admin-section:not(.m-seen) { display: none !important; }
html.is-mobile .m-calc-probe {
    position: absolute; visibility: hidden; pointer-events: none;
    transform: translate3d(calc((2 - var(--m-q, 0)) * 10px), 0, 0);
}
html.is-mobile .admin-section.m-seen:not(.m-cur):not(.active),
html.is-mobile body.m-dragging .admin-section { pointer-events: none; }
html.is-mobile body.m-dragging #admin-screen,
html.is-mobile body.m-dragging #admin-screen * { transition: none !important; }
/* الزجاج الحقيقي يُترك للمثبت فقط: أي blur فوق لوحة تتحرك يعيد رسم الشاشة كاملة
   كل إطار على الآيفون، وهو سبب التقطيع الذي ظهر في الجولات السابقة. */
html.is-mobile #admin-screen .admin-section,
html.is-mobile #admin-screen .admin-section * {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}

/* ------------------------- الحركة التدريجية للدخول -------------------------
   كلها في CSS لأن سفاري الآيفون يُهمل الأنيميشن المُولَّد بجافاسكريبت لحظياً.
   البطاقة ترتفع، أيقونتها تنبثق، ثم يُمسح العنوان والرقم تدريجياً من جهة
   القراءة، ويُملأ شريط التلوين أسفلها. التأخيرات تُحسب من --m-k لكل عنصر. */
@keyframes mRise {
    0%   { opacity: 0; transform: translate3d(0, 30px, 0) scale(.955); }
    62%  { opacity: 1; transform: translate3d(0, -3px, 0) scale(1.005); }
    100% { opacity: 1; transform: none; }
}
@keyframes mPop {
    0%   { opacity: 0; transform: translate3d(0,-12px,0) scale(.70); }
    60%  { opacity: 1; transform: translate3d(0,2px,0) scale(1.055); }
    100% { opacity: 1; transform: none; }
}
/* mWipe لم تعد تقصّ بـ clip-path: القصّ المتحرك على خلايا داخل حاوية تمرير
   كان يجعل النص يختفي عشوائياً على آيفون، ويرسم طبقة إضافية لكل خلية. */
@keyframes mWipe {
    from { opacity: 0; transform: translate3d(0,8px,0); }
    to   { opacity: 1; transform: none; }
}
@keyframes mGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
/* تعبئة الأشرطة تنمو من جهة القراءة بلا لمس العرض: scaleX على المعالج فقط */
@keyframes mFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* لا تلاشي على مستوى الصفحة: طبقة opacity لحاوية كاملة تضم ثلاثين زجاجة
   تُجبر المعالج على إعادة رسم الشجرة كلها كل إطار — كان هذا سبب الإطارات
   الـ 66م.س. البطاقات نفسها تتلاشى وتتحرك، وهي الطبقات المطلوبة فقط. */
/* التدرّج بطيء ومقصود: 88م.س بين الأصناف، والحركة نفسها تقارب الثانية */
html.is-mobile .admin-section .m-anim {
    animation: mRise .96s var(--m-ease-out) both;
    animation-delay: calc(60ms + min(var(--m-k, 0), 11) * 88ms);
}
html.is-mobile .admin-section .m-anim > .stat-icon {
    animation: mPop .78s var(--m-ease-out) both;
    animation-delay: calc(180ms + min(var(--m-k, 0), 11) * 88ms);
}
html.is-mobile .admin-section .m-anim .stat-title {
    animation: mWipe .8s var(--m-ease-out) both;
    animation-delay: calc(330ms + min(var(--m-k, 0), 11) * 88ms);
}
html.is-mobile .admin-section .m-anim .stat-value {
    animation: mWipe .9s var(--m-ease-out) both;
    animation-delay: calc(430ms + min(var(--m-k, 0), 11) * 88ms);
}
html.is-mobile .admin-section .m-anim > tr,
html.is-mobile .admin-section tr.m-anim {
    animation: mRise .8s var(--m-ease-out) both;
    animation-delay: calc(240ms + min(var(--m-k, 0), 14) * 58ms);
}
/* الخلايا لا تُحرَّك منفردة: صف واحد متحرك فيه أربع خلايا كان يعني مئة طبقة
   إضافية في الجدول الواحد. الصف كتلة واحدة يرتفع، والنص بداخله يظهر معه. */
html.is-mobile .admin-section .m-anim .m-today-bar i,
html.is-mobile .admin-section .m-anim .customer-stat-bar-fill {
    transform-origin: right center;
    animation: mFill 1.05s var(--m-ease-out) both;
    animation-delay: calc(520ms + min(var(--m-k, 0), 11) * 88ms + var(--m-r, 0) * 90ms);
}

html.is-mobile .admin-section h2 {
    font-size: 19px !important; font-weight: 900; margin: 4px 2px 16px !important;
    text-align: start !important; letter-spacing: .2px;
    color: #dbeaff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,.55);
}
html.is-mobile .admin-section h2 i { color: var(--m-accent2); margin-inline-end: 6px; }
html.is-mobile .admin-section h3 {
    color: #cfe3ff !important; font-size: 15px !important; font-weight: 900 !important;
    border-bottom: 1px solid var(--m-line) !important;
}

/* ------------------------- وصفة الزجاج المشتركة -------------------------
   أربع طبقات: انعكاس علوي مائل، خطوط محفورة بشعرية خفيفة، جسم زجاجي داكن،
   وحافة عليا مضيئة 1px. الظلّ أسود فقط — لا توهّج ملوّن حول البطاقات. */
html.is-mobile #admin-screen .stat-card,
html.is-mobile #admin-screen .cart-table tr,
html.is-mobile #admin-screen .invoices-table tr,
html.is-mobile .m-today,
html.is-mobile .m-exp-sum,
html.is-mobile .monthly-strip {
    position: relative;
    background:
        linear-gradient(152deg, rgba(198,230,255,.13) 0%, rgba(120,172,240,.02) 42%, rgba(150,200,255,.08) 100%),
        radial-gradient(120% 90% at 50% 0%, rgba(96,160,255,.20), transparent 62%),
        var(--m-glass),
        var(--m-glass-bg) !important;
    border: 1px solid var(--m-edge) !important;
    box-shadow: var(--m-lift) !important;
}
html.is-mobile #admin-screen .stat-card::before,
html.is-mobile .m-today::before,
html.is-mobile .monthly-strip::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    pointer-events: none;
    background: var(--m-sheen);
}
/* المحتوى فوق طبقة اللمعان: بلا z-index سالب — السالب داخل حاوية مقصوصة كان
   يرسم البطاقة وحدها ويترك الأيقونة والنص خارج القصّ على آيفون. */
html.is-mobile #admin-screen .stat-card > *,
html.is-mobile .m-today > *,
html.is-mobile .monthly-strip > * { position: relative; z-index: 1; }
/* اللوحات الكبيرة: استدارة كاملة بدل القطع الهندسي. clip-path على بطاقة
   تدخل بأنيميشن transform كان على WebKit يفصل الزجاج عن محتواه (عنوان مقصوص
   وأيقونة تطفو فوق البطاقة). الاستدارة آمنة وبنفس الفخامة. */
html.is-mobile .m-today,
html.is-mobile .monthly-strip {
    border-radius: var(--m-radius-card) !important;
    clip-path: none !important;
    border: 1px solid var(--m-edge) !important;
    box-shadow: var(--m-lift) !important;
    overflow: hidden;
}
/* شريط التلوين الذي يمتلئ أسفل البطاقة عند الدخول: بلاتين مصقول بدل النيون */
html.is-mobile #admin-screen .stat-card::after {
    content: "";
    position: absolute;
    left: 14px; right: 14px; bottom: 8px;
    height: 2px;
    border-radius: 99px;
    background: linear-gradient(90deg, rgba(170,220,255,.62), rgba(90,150,230,.08));
    box-shadow: none;
    transform-origin: right center;
    opacity: .45;
}
html.is-mobile .admin-section .m-anim.stat-card::after,
html.is-mobile .admin-section .m-anim .stat-card::after {
    animation: mGrow 1.05s var(--m-ease-out) both;
    animation-delay: calc(520ms + min(var(--m-k, 0), 11) * 88ms);
}

/* بطاقات بدل الجداول */
html.is-mobile #admin-screen .cart-table,
html.is-mobile #admin-screen .invoices-table { display: block !important; width: 100% !important; border: none !important; background: transparent !important; }
html.is-mobile #admin-screen .cart-table thead,
html.is-mobile #admin-screen .invoices-table thead { display: none !important; }
html.is-mobile #admin-screen .cart-table tbody,
html.is-mobile #admin-screen .invoices-table tbody { display: block !important; width: 100% !important; }

html.is-mobile #admin-screen .cart-table tr,
html.is-mobile #admin-screen .invoices-table tr {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-rows: none !important;
    align-items: center;
    gap: 4px 10px;
    border-radius: var(--m-radius-card) !important;
    margin-bottom: 10px !important;
    padding: 12px 13px !important;
}
html.is-mobile #admin-screen .cart-table tr::after,
html.is-mobile #admin-screen .invoices-table tr::after { content: none !important; }
html.is-mobile #admin-screen .cart-table tr::before,
html.is-mobile #admin-screen .invoices-table tr::before {
    content: "";
    position: absolute;
    inset-inline-start: 0; top: 12px; bottom: 12px; width: 2px;
    border-radius: 0;
    background: linear-gradient(180deg, rgba(160,215,255,.80), rgba(80,140,220,.14));
    opacity: .75;
}

/* مواضع الخلايا مكتوبة بـ !important على tr > td: ورقة أنماط المتجر ترسل الخلية
   قبل الأخيرة إلى العمود الثاني بكود مشدّد، وكتابة الموضع على tr > td تعطي
   الطبقة خصوصية أعلى فتلغي قواعد المتجر مهما كان ترتيبها. */
html.is-mobile #admin-screen .cart-table tr > td,
html.is-mobile #admin-screen .invoices-table tr > td {
    display: block !important;
    grid-column: 1 !important;
    grid-row: auto !important;
    align-self: auto !important;
    border: none !important;
    border-top: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    padding: 1px 0 !important;
    margin: 0 !important;
    text-align: start !important;
    white-space: normal !important;
    overflow: visible !important;
    min-width: 0 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: var(--m-text) !important;
    line-height: 1.45 !important;
}
html.is-mobile #admin-screen .cart-table tr > td:first-child,
html.is-mobile #admin-screen .invoices-table tr > td:first-child {
    grid-column: 1 / -1 !important;
    font-size: 12.5px !important;
    font-weight: 800 !important;
    color: var(--m-muted) !important;
    margin-bottom: 3px !important;
    letter-spacing: .2px;
}
html.is-mobile #admin-screen .cart-table tr > td:nth-child(2),
html.is-mobile #admin-screen .invoices-table tr > td:nth-child(2) {
    grid-column: 1 !important;
    font-size: 18px !important;
    font-weight: 900 !important;
    color: #e8f3ff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,.55);
}
html.is-mobile #admin-screen .cart-table tr > td:nth-child(n+3),
html.is-mobile #admin-screen .invoices-table tr > td:nth-child(n+3) { grid-column: 1 !important; font-size: 13px !important; font-weight: 600 !important; }
html.is-mobile #admin-screen .cart-table tr > td:last-child:not(:first-child),
html.is-mobile #admin-screen .invoices-table tr > td:last-child:not(:first-child) {
    display: flex !important;
    grid-column: 2 !important;
    grid-row: 2 / span 4 !important;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    padding-top: 0 !important;
    margin-top: 0 !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    color: var(--m-accent) !important;
}
html.is-mobile #admin-screen td:last-child .top-bar-btn,
html.is-mobile #admin-screen td:last-child .action-icon {
    min-width: 42px;
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px !important;
    padding: 8px 10px !important;
    border-radius: var(--m-radius-pill) !important;
    background:
        linear-gradient(180deg, rgba(146,200,255,.10), rgba(146,200,255,.015) 60%),
        rgba(12,23,42,.48) !important;
    border: 1px solid var(--m-edge) !important;
    color: #cfe6ff !important;
    margin: 0 !important;
    box-shadow: inset 0 1px 0 rgba(178,220,255,.16);
}
html.is-mobile #admin-screen td:last-child .action-icon:active { background: rgba(77,163,255,.22) !important; }

/* ------------------------- شبكة البطاقات ------------------------- */
html.is-mobile .stats-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 12px !important; margin-bottom: 18px !important; }
html.is-mobile .stat-card {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    border-radius: var(--m-radius-card) !important;
    padding: 20px 12px 22px !important;
    overflow: hidden;
}
html.is-mobile .stat-card:hover { transform: none !important; }
html.is-mobile .stat-card:active { transform: scale(.985) !important; }
/* صحن الأيقونة: مُثمَّن هندسي من الزجاج المصنفر بحلقة داخلية وظلّ أسود تحته.
   الحفر داخل الخلفية نفسها لا في ::before — فـ Font Awesome يرسم الرمز نفسه
   في ::before، وكانت طبقتنا تمحوه فتظهر أطباق فارغة بلا أيقونات. */
html.is-mobile .stat-icon {
    position: relative;
    display: flex !important;
    width: 54px !important; height: 54px !important;
    margin: 0 auto 12px !important;
    align-self: center !important;
    flex: none;
    justify-content: center; align-items: center;
    border-radius: 0 !important;
    border: none !important;
    clip-path: var(--m-plate);
    font-size: 21px !important;
    line-height: 1;
    color: #f2faff !important;
    background:
        linear-gradient(152deg, rgba(180,220,255,.34) 0%, rgba(120,165,235,.10) 46%, rgba(140,190,255,.20) 100%),
        rgba(22,44,80,.60) !important;
    box-shadow: none;
    text-shadow: 0 1px 3px rgba(0,10,30,.62);
    filter: none;
}
/* البرتقالي المكتوب سطرياً في صفحة المزيد يُرجع البطاقة خارج الهوية */
html.is-mobile #admin-screen [style*="#f39c12"] { border-color: var(--m-edge) !important; }
html.is-mobile #admin-screen [style*="#f39c12"] .stat-icon,
html.is-mobile #admin-screen .stat-icon[style*="#f39c12"] { color: #eaf4ff !important; }
html.is-mobile .stat-title { font-size: 12px !important; color: var(--m-muted) !important; margin: 0 0 4px !important; font-weight: 800 !important; letter-spacing: .1px; }
/* الرقم: أبيض ثلجي عالي المقابلة، محفور بظلّ أسود رفيع بدل أي هالة ملوّنة */
html.is-mobile .stat-value {
    font-size: 19px !important; font-weight: 900 !important; color: #f7fbff !important;
    letter-spacing: -.2px; font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 2px rgba(0,0,0,.6);
}
/* أرقام اللوحات لا تنبض: النظام يكتب transform=scale(1.1) سطرياً عند كل رسم.
   القفلة للعرض فقط، القيم نفسها تُحسب وتُكتب كما هي. */
html.is-mobile .stat-value,
html.is-mobile .bento-num,
html.is-mobile [id^="bento-"] {
    transform: none !important;
    transition: none !important;
    -webkit-transform: none !important;
}
/* البطاقة العريضة صارت عموداً: في الصف كانت الأيقونة والرقم يزاحمان عنواناً
   عربياً طويلاً على شاشة 390px فيُسحق إلى ثلاثة أسطر وينفلت من بطاقته. */
html.is-mobile .stat-card[style*="grid-column: span 2"] {
    grid-column: span 2 !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-end !important;
    text-align: start !important;
    gap: 2px;
    padding: 20px 20px 22px !important;
}
html.is-mobile .stat-card[style*="grid-column: span 2"] .stat-icon { margin: 0 0 12px !important; flex: none !important; }
html.is-mobile .stat-card[style*="grid-column: span 2"] .stat-title { margin: 0 0 2px !important; max-width: 100%; }
html.is-mobile .stat-card[style*="grid-column: span 2"] .stat-value { line-height: 1.05 !important; }

/* البطاقة البطلة في اليومية: أشبع قطعة زجاج في الشاشة — توهّج نيلي/أزرق داخلي،
   حافة سماوية سميكة، ومسحة ضوء تمرّ عليها كبطاقة شاشة القفل. */
html.is-mobile #admin-daily-report .bento-hero {
    position: relative;
    border-radius: 24px !important;
    clip-path: none !important;
    border: 1px solid rgba(184,224,255,.32) !important;
    padding: 20px 20px 22px !important;
    background:
        radial-gradient(120% 96% at 88% -14%, rgba(122,104,255,.42), transparent 62%),
        radial-gradient(110% 86% at -4% 110%, rgba(44,134,255,.36), transparent 64%),
        linear-gradient(152deg, rgba(206,234,255,.16), rgba(120,172,240,.03) 48%, rgba(150,200,255,.10) 100%),
        rgba(18,40,80,.70) !important;
    box-shadow:
        0 26px 54px rgba(1,6,16,.56),
        inset 0 1px 0 rgba(222,242,255,.42),
        inset 0 -18px 40px rgba(24,80,180,.16),
        inset 0 0 0 1px rgba(150,200,255,.12) !important;
    overflow: hidden;
}
html.is-mobile #admin-daily-report .bento-hero::before { background: none; }
html.is-mobile #admin-daily-report .bento-hero::after {
    content: "";
    position: absolute;
    top: -70%; bottom: -70%; left: -45%;
    width: 46%;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(100deg, transparent, rgba(206,236,255,.16), transparent);
    transform: rotate(14deg) translate3d(-30%, 0, 0);
    animation: mHeroSheen 8s ease-in-out infinite alternate;
}
@keyframes mHeroSheen {
    to { transform: rotate(14deg) translate3d(320%, 0, 0); opacity: .35; }
}
html.is-mobile #admin-daily-report .bento-hero > * { position: relative; z-index: 1; }
html.is-mobile #admin-daily-report .bento-hero .stat-title {
    color: #cfe6ff !important;
    font-size: 14.5px !important;
    font-weight: 800 !important;
    line-height: 1.45 !important;
    letter-spacing: 0 !important;
}
html.is-mobile #admin-daily-report .bento-hero .stat-icon {
    width: 46px !important; height: 46px !important;
    font-size: 19px !important;
    margin: 0 0 10px !important;
    align-self: flex-start !important;
}
html.is-mobile #bento-current-pieces {
    color: #ffffff !important;
    font-size: 50px !important;
    line-height: 1.02 !important;
    letter-spacing: -1px;
    text-shadow: 0 2px 14px rgba(70,150,255,.40), 0 1px 2px rgba(0,0,0,.55);
}
/* بطاقتا اليوم: أيقونة أصغر ورقم أوضح بلا أنماط سطرية تفرض 45px/26px */
html.is-mobile .bento-box-container > .stat-card:not(.bento-hero) {
    min-height: 128px;
    justify-content: center !important;
    gap: 0;
}
html.is-mobile .bento-box-container > .stat-card:not(.bento-hero) .stat-icon {
    width: 46px !important; height: 46px !important;
    font-size: 18px !important;
    margin: 0 0 10px !important;
}
html.is-mobile .bento-box-container > .stat-card:not(.bento-hero) .stat-value {
    font-size: 27px !important;
    margin-top: 2px;
}
html.is-mobile .monthly-strip {
    border-radius: var(--m-radius-card) !important;
    padding: 14px 12px !important;
    gap: 6px;
    flex-wrap: wrap;
}
html.is-mobile .monthly-strip-item { color: var(--m-muted) !important; font-size: 11.5px !important; }
html.is-mobile .monthly-strip-item strong { color: #eaf4ff !important; text-shadow: 0 1px 2px rgba(0,0,0,.55); }

/* ------------------------- لوحة تفاصيل اليوم ------------------------- */
html.is-mobile .m-today {
    border-radius: var(--m-radius-card) !important;
    margin: 4px 0 22px !important;
    padding: 14px 14px 6px !important;
    overflow: hidden;
}
html.is-mobile .m-today-head {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 900; color: #dbeaff;
    padding-bottom: 10px; margin-bottom: 4px;
    border-bottom: 1px solid var(--m-hair);
}
html.is-mobile .m-today-head i { color: var(--m-accent2); text-shadow: 0 1px 2px rgba(0,0,0,.55); }
html.is-mobile .m-today-date {
    margin-inline-start: auto; font-size: 10.5px; font-weight: 700; color: var(--m-muted);
    padding: 3px 9px; border-radius: 99px; border: 1px solid var(--m-hair); background: rgba(255,255,255,.04);
}
html.is-mobile .m-today-rows { display: block; }
html.is-mobile .m-today-row {
    display: grid;
    grid-template-columns: 34px minmax(0,1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 11px 2px;
    border-bottom: 1px solid rgba(255,255,255,.045);
}
html.is-mobile .m-today-row:last-child { border-bottom: none; }
html.is-mobile .m-today-row > i {
    width: 34px; height: 34px;
    clip-path: var(--m-plate);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: #dceaf8;
    background:
        linear-gradient(160deg, rgba(150,200,255,.15), rgba(120,165,235,.03) 55%, rgba(130,175,255,.08)),
        rgba(14,25,44,.62);
    border: none;
    filter: none;
    text-shadow: 0 1px 2px rgba(0,0,0,.55);
}
html.is-mobile .m-today-meta { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
html.is-mobile .m-today-meta > span { font-size: 12.5px; font-weight: 800; color: var(--m-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .m-today-bar {
    display: block; height: 4px; border-radius: 0; overflow: hidden;
    background: rgba(255,255,255,.05);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.05);
}
/* التعبئة التدريجي: سكة معدنية تُسحب، لا خيط نيون */
html.is-mobile .m-today-bar i {
    display: block; height: 100%; width: 0;
    background: linear-gradient(90deg, rgba(70,130,220,.35), rgba(150,215,255,.95));
    transition: width 1.1s var(--m-ease-out);
}
html.is-mobile .m-today-val {
    font-size: 15px; font-weight: 900; color: #eef5ff; white-space: nowrap;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 2px rgba(0,0,0,.55);
}
html.is-mobile .m-today-row.down > i { color: #ffd7dc; }
html.is-mobile .m-today-row.down .m-today-bar i { background: linear-gradient(90deg, rgba(158,64,76,.35), rgba(255,142,154,.92)); }
html.is-mobile .m-today-row.down .m-today-val { color: #ffc9d0; text-shadow: 0 1px 2px rgba(0,0,0,.55); }
html.is-mobile .m-today-row.up > i { color: #c6f6de; }
html.is-mobile .m-today-row.up .m-today-bar i { background: linear-gradient(90deg, rgba(52,150,106,.35), rgba(154,240,204,.92)); }
html.is-mobile .m-today-row.up .m-today-val { color: #d6ffe9; text-shadow: 0 1px 2px rgba(0,0,0,.55); }
html.is-mobile .m-today-row.neg .m-today-val { color: #ffc9d0; }
html.is-mobile .m-today-row.sum { background: linear-gradient(90deg, rgba(198,226,250,.10), transparent); }
html.is-mobile .m-today-row.sum .m-today-val { font-size: 17px; color: #ffffff; }
/* نبض التشغيل: ثلاثة عدّادات حيّة للطلبات المفتوحة — قيد التنفيذ، موعد
   استلام اليوم، والمتأخرة عن موعدها. قراءة فقط من الفواتير نفسها. */
html.is-mobile .m-pulse {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    margin-top: 6px; padding: 12px 0 10px;
    border-top: 1px solid var(--m-hair);
}
html.is-mobile .m-pulse-i {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 9px 6px 8px;
    clip-path: var(--m-plate);
    background:
        linear-gradient(160deg, rgba(150,200,255,.13), rgba(120,165,235,.02) 60%, rgba(130,175,255,.07)),
        rgba(12,22,40,.50);
    text-align: center;
    border: 0; appearance: none;
    font-family: inherit; color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform .16s var(--m-ease);
}
html.is-mobile .m-pulse-i:active { transform: scale(.965); }
html.is-mobile .m-pulse-i:focus-visible { outline: none; box-shadow: inset 0 0 0 2px rgba(var(--rg-accent-rgb), .75); }
html.is-mobile .m-pulse-n {
    font-size: 19px; font-weight: 900; color: #eef5ff; line-height: 1.1;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 2px rgba(0,0,0,.5);
    transition: color .3s var(--m-ease);
}
html.is-mobile .m-pulse-i small {
    font-size: 10px; font-weight: 800; color: var(--m-muted);
    display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
}
html.is-mobile .m-pulse-i small i { font-size: 9.5px; color: var(--m-accent2); }
html.is-mobile .m-pulse-i.due .m-pulse-n { color: #ffe0a6; }
html.is-mobile .m-pulse-i.late .m-pulse-n { color: #ffc9d0; }
html.is-mobile .m-pulse-i.late.zero .m-pulse-n { color: rgba(238,245,255,.56); }
html.is-mobile body.rg-light .m-pulse { border-top-color: rgba(30,80,140,.10); }
html.is-mobile body.rg-light .m-pulse-i {
    background:
        linear-gradient(160deg, rgba(255,255,255,.98), rgba(var(--rg-accent-rgb), .10) 60%, rgba(255,255,255,.72)),
        rgba(255,255,255,.72);
}
html.is-mobile body.rg-light .m-pulse-n { color: #16324f; text-shadow: none; }
html.is-mobile body.rg-light .m-pulse-i.due .m-pulse-n { color: #8a5a00; }
html.is-mobile body.rg-light .m-pulse-i.late .m-pulse-n { color: #b32b3a; }
html.is-mobile body.rg-light .m-pulse-i.late.zero .m-pulse-n { color: #7e93a8; }
html.is-mobile body.rg-light .m-pulse-i small { color: #4d6a8a; }
html.is-mobile body.rg-light .m-pulse-i small i { color: var(--rg-accent-ink); }
html.is-mobile .admin-section .m-anim .m-today .m-pulse,
html.is-mobile .m-today.m-anim .m-pulse {
    animation: mWipe .82s var(--m-ease-out) both;
    animation-delay: calc(330ms + min(var(--m-k, 0), 11) * 88ms + 500ms);
}
html.is-mobile .admin-section .m-anim.m-today .m-today-row,
html.is-mobile .m-today.m-anim .m-today-row {
    animation: mWipe .82s var(--m-ease-out) both;
    animation-delay: calc(330ms + min(var(--m-k, 0), 11) * 88ms + var(--m-r, 0) * 90ms);
}

/* ------------------------- ورقة نبض التشغيل -------------------------
   بطاقة سفلية زجاجية تُفتح من عدّادات «تفاصيل اليوم» وتعرض الطلبات المفتوحة
   نفسها التي عُدّت: الأقدم أولاً، بلا أي إجراء يكتب على البيانات. */
html.is-mobile .m-pulse-sheet { position: fixed; inset: 0; z-index: 9660; display: flex; align-items: flex-end; }
html.is-mobile .m-pulse-scrim {
    position: absolute; inset: 0;
    background: radial-gradient(90% 60% at 50% 100%, rgba(6,14,28,.52), rgba(2,6,14,.76));
    opacity: 0; transition: opacity .3s var(--m-ease);
}
html.is-mobile .m-pulse-sheet.on .m-pulse-scrim { opacity: 1; }
html.is-mobile .m-pulse-card {
    position: relative;
    width: 100%;
    max-height: 76vh;
    display: flex; flex-direction: column;
    border-radius: 26px 26px 0 0;
    border: 1px solid var(--m-edge);
    border-bottom: none;
    background:
        linear-gradient(160deg, rgba(255,255,255,.16), rgba(255,255,255,.02) 46%, rgba(255,255,255,.08)),
        rgba(var(--rg-glass-rgb), .988);
    box-shadow: 0 -24px 60px rgba(0,4,14,.55), inset 0 1px 0 rgba(255,255,255,.35);
    padding: 8px 14px calc(14px + env(safe-area-inset-bottom, 0px));
    transform: translate3d(0, 104%, 0);
    transition: transform .42s var(--m-ease-out);
    color: var(--m-text);
}
html.is-mobile body.rg-light .m-pulse-card { background: linear-gradient(160deg, rgba(255,255,255,.98), rgba(255,255,255,.9)); }
html.is-mobile .m-pulse-sheet.on .m-pulse-card { transform: none; }
html.is-mobile .m-pulse-sheet.out .m-pulse-card { transform: translate3d(0, 104%, 0); }
html.is-mobile .m-pulse-sheet.out .m-pulse-scrim { opacity: 0; }
html.is-mobile .m-pulse-grip { width: 42px; height: 5px; border-radius: 99px; background: rgba(255,255,255,.25); margin: 2px auto 10px; }
html.is-mobile body.rg-light .m-pulse-grip { background: rgba(20,60,110,.18); }
html.is-mobile .m-pulse-head {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 0 2px 10px;
    border-bottom: 1px solid var(--m-hair);
}
html.is-mobile .m-pulse-head h3 { margin: 0; font-size: 15px; font-weight: 900; display: flex; align-items: center; gap: 7px; }
html.is-mobile .m-pulse-head h3 i { color: var(--m-accent2); font-size: 12px; }
html.is-mobile .m-pulse-head small { display: block; margin-top: 3px; font-size: 10px; font-weight: 700; color: var(--m-muted); }
html.is-mobile .m-pulse-x {
    flex: none; width: 32px; height: 32px;
    border-radius: 10px;
    border: 1px solid var(--m-edge);
    background: rgba(255,255,255,.08);
    color: var(--m-muted); font-size: 13px;
}
html.is-mobile body.rg-light .m-pulse-x { background: rgba(20,60,110,.06); color: #33507a; }
html.is-mobile .m-pulse-list {
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding: 10px 0 4px;
    display: flex; flex-direction: column; gap: 6px;
}
html.is-mobile .m-po {
    display: flex; align-items: center; gap: 9px;
    padding: 10px 9px;
    border-radius: 13px;
    border: 1px solid transparent;
    background: rgba(255,255,255,.04);
}
html.is-mobile body.rg-light .m-po { background: rgba(30,70,120,.045); }
html.is-mobile .m-po-av {
    width: 34px; height: 34px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 11px;
    background: linear-gradient(150deg, rgba(var(--rg-accent-rgb), .38), rgba(var(--rg-accent-rgb), .10));
    border: 1px solid rgba(var(--rg-accent-rgb), .28);
    font-size: 13px; font-weight: 900;
}
html.is-mobile .m-po-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
html.is-mobile .m-po-body strong { font-size: 12px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .m-po-body small { font-size: 9.5px; font-weight: 700; color: var(--m-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .m-po-end { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
html.is-mobile .m-po-end b { font-size: 11.5px; font-weight: 900; font-variant-numeric: tabular-nums; }
html.is-mobile .m-po-age {
    font-size: 8.5px; font-weight: 900;
    padding: 2px 6px; border-radius: 6px;
    background: rgba(255,255,255,.07); color: var(--m-muted);
}
html.is-mobile .m-po-age.hot { background: rgba(255,93,108,.14); color: #ffa9b2; }
html.is-mobile body.rg-light .m-po-age { background: rgba(30,70,120,.07); color: #4d6a8a; }
html.is-mobile body.rg-light .m-po-age.hot { background: rgba(190,35,60,.09); color: #b32b3a; }
html.is-mobile .m-po-empty {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 34px 10px 26px;
    color: var(--m-faint);
    font-size: 11.5px; font-weight: 800;
    text-align: center;
}
html.is-mobile .m-po-empty i { font-size: 24px; opacity: .5; }
html.is-mobile .m-po { animation: mPoIn .42s var(--m-ease-out) both; animation-delay: calc(var(--m-po, 0) * 32ms); }
@keyframes mPoIn { from { opacity: 0; transform: translate3d(0, 10px, 0); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-pulse-i { transition: none; }
    html.is-mobile .m-pulse-card { transition: none; }
    html.is-mobile .m-pulse-scrim { transition: none; }
    html.is-mobile .m-po { animation: none !important; }
}

/* ------------------------- المحفظة: إجراءات وكشف الأرصدة -------------------------
   التبويب كان بطاقتين ثم جدول فارغ يُقرأ كفراغ طويل. الآن: شريط إجراءات زجاجي،
   وحالة فارغة مصممة تحل مكان الجدول الفارغ، وورقة «كشف الأرصدة» تشرح كيف
   تكوّن الرقم من المبيعات والمصروفات والتكاليف وحركات الشريكين. قراءة فقط. */
html.is-mobile .m-wb-bar {
    display: flex; gap: 9px;
    margin: 0 0 18px;
    animation: mWbRise .5s var(--m-ease-out) both;
}
html.is-mobile .m-wb-act {
    flex: 1 1 0; min-width: 0;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 46px; padding: 0 12px;
    border-radius: 15px;
    border: 1px solid var(--m-edge);
    background:
        linear-gradient(155deg, rgba(255,255,255,.10), rgba(255,255,255,.015) 48%, rgba(255,255,255,.06)),
        rgba(var(--rg-glass-rgb), .74);
    box-shadow: var(--m-lift);
    color: var(--m-text);
    font-family: inherit; font-size: 12.5px; font-weight: 900; letter-spacing: .1px;
    -webkit-tap-highlight-color: transparent;
    transition: transform .16s var(--m-ease), background .22s var(--m-ease);
}
html.is-mobile .m-wb-act i { font-size: 13px; color: var(--m-accent2); }
html.is-mobile .m-wb-act.prime {
    border-color: rgba(var(--rg-accent-rgb), .40);
    background:
        linear-gradient(150deg, rgba(var(--rg-accent-rgb), .30), rgba(var(--rg-accent-rgb), .05) 72%),
        rgba(var(--rg-glass-rgb), .82);
}
html.is-mobile .m-wb-act:active { transform: scale(.965); }
html.is-mobile body.rg-light .m-wb-act {
    background: linear-gradient(155deg, rgba(255,255,255,.92), rgba(255,255,255,.58)), rgba(234,242,252,.86);
    border-color: rgba(47,127,208,.22);
    color: #1d3557;
}
html.is-mobile body.rg-light .m-wb-act i { color: #2f7fd0; }

html.is-mobile .m-wb-empty {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: 7px;
    padding: 30px 22px 26px;
    margin: 4px 0 8px;
    border-radius: var(--m-radius-card);
    border: 1px dashed rgba(162,212,255,.30);
    background:
        linear-gradient(160deg, rgba(255,255,255,.06), rgba(255,255,255,.012) 55%, rgba(255,255,255,.035)),
        rgba(var(--rg-glass-rgb), .52);
    animation: mWbEmpty .5s var(--m-ease-out) both;
}
html.is-mobile .m-wb-empty-orb {
    width: 54px; height: 54px; border-radius: 17px;
    display: inline-flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
    background: linear-gradient(150deg, rgba(var(--rg-accent-rgb), .30), rgba(var(--rg-accent-rgb), .06));
    border: 1px solid rgba(var(--rg-accent-rgb), .30);
    box-shadow: 0 10px 24px rgba(1,8,22,.35), inset 0 1px 0 rgba(220,240,255,.30);
}
html.is-mobile .m-wb-empty-orb i { font-size: 20px; color: var(--m-accent2); }
html.is-mobile .m-wb-empty b { font-size: 14px; font-weight: 900; color: var(--m-text); }
html.is-mobile .m-wb-empty p {
    margin: 0; max-width: 250px;
    font-size: 11.5px; font-weight: 700; line-height: 1.8;
    color: var(--m-muted);
}
html.is-mobile .m-wb-empty small {
    margin-top: 2px;
    font-size: 10px; font-weight: 800; letter-spacing: .2px;
    color: var(--m-faint);
}
@keyframes mWbRise { from { opacity: 0; transform: translate3d(0, 10px, 0); } to { opacity: 1; transform: none; } }
@keyframes mWbEmpty { from { opacity: 0; transform: translate3d(0, 12px, 0) scale(.985); } to { opacity: 1; transform: none; } }
html.is-mobile body.rg-light .m-wb-empty {
    border-color: rgba(47,127,208,.26);
    background: linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.55)), rgba(234,242,252,.6);
}
html.is-mobile body.rg-light .m-wb-empty b { color: #16324f; }
html.is-mobile body.rg-light .m-wb-empty p { color: #4a6a8d; }
html.is-mobile body.rg-light .m-wb-empty small { color: #6f8bab; }

/* ورقة كشف الأرصدة */
html.is-mobile .m-wb-sheet { position: fixed; inset: 0; z-index: 9660; display: flex; align-items: flex-end; }
html.is-mobile .m-wb-scrim {
    position: absolute; inset: 0;
    background: radial-gradient(90% 60% at 50% 100%, rgba(6,14,28,.52), rgba(2,6,14,.78));
    opacity: 0; transition: opacity .3s var(--m-ease);
}
html.is-mobile .m-wb-sheet.on .m-wb-scrim { opacity: 1; }
html.is-mobile .m-wb-card {
    position: relative;
    width: 100%; max-height: 78vh;
    display: flex; flex-direction: column;
    border-radius: var(--m-radius-sheet) var(--m-radius-sheet) 0 0;
    border: 1px solid var(--m-edge);
    border-bottom: none;
    background:
        linear-gradient(160deg, rgba(255,255,255,.16), rgba(255,255,255,.02) 46%, rgba(255,255,255,.08)),
        rgba(var(--rg-glass-rgb), .992);
    box-shadow: 0 -24px 60px rgba(0,4,14,.55), inset 0 1px 0 rgba(255,255,255,.35);
    padding: 8px 14px calc(14px + env(safe-area-inset-bottom, 0px));
    transform: translate3d(0, 104%, 0);
    transition: transform .42s var(--m-ease-out);
    color: var(--m-text);
}
html.is-mobile body.rg-light .m-wb-card { background: linear-gradient(160deg, rgba(255,255,255,.985), rgba(255,255,255,.92)); }
html.is-mobile .m-wb-sheet.on .m-wb-card { transform: none; }
html.is-mobile .m-wb-sheet.out .m-wb-card { transform: translate3d(0, 104%, 0); }
html.is-mobile .m-wb-sheet.out .m-wb-scrim { opacity: 0; }
html.is-mobile .m-wb-grip { width: 42px; height: 5px; border-radius: 99px; background: rgba(255,255,255,.25); margin: 2px auto 10px; }
html.is-mobile body.rg-light .m-wb-grip { background: rgba(20,60,110,.18); }
html.is-mobile .m-wb-head {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 0 2px 11px;
    border-bottom: 1px solid var(--m-hair);
}
html.is-mobile .m-wb-head h3 { margin: 0; font-size: 15px; font-weight: 900; display: flex; align-items: center; gap: 7px; }
html.is-mobile .m-wb-head h3 i { color: var(--m-accent2); font-size: 12px; }
html.is-mobile .m-wb-head small { display: block; margin-top: 3px; font-size: 10px; font-weight: 700; color: var(--m-muted); }
html.is-mobile .m-wb-x {
    flex: none; width: 32px; height: 32px;
    border-radius: 10px;
    border: 1px solid var(--m-edge);
    background: rgba(255,255,255,.08);
    color: var(--m-muted); font-size: 13px;
}
html.is-mobile body.rg-light .m-wb-x { background: rgba(20,60,110,.06); color: #33507a; }
html.is-mobile .m-wb-body {
    overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
    padding: 12px 2px 6px;
    display: flex; flex-direction: column; gap: 7px;
}
html.is-mobile .m-wb-sec {
    margin: 7px 5px 1px;
    font-size: 10px; font-weight: 900; letter-spacing: .3px;
    color: var(--m-faint);
}
html.is-mobile .m-wb-row {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 9px 11px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: rgba(255,255,255,.035);
    font-size: 12px; font-weight: 800;
    color: var(--m-text);
}
html.is-mobile .m-wb-row > span { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
html.is-mobile .m-wb-row > span i { width: 16px; text-align: center; font-size: 11px; color: var(--m-muted); }
html.is-mobile .m-wb-row > b { direction: ltr; font-size: 12.5px; font-weight: 900; font-variant-numeric: tabular-nums; text-align: end; white-space: nowrap; }
html.is-mobile .m-wb-row > b.pos { color: var(--m-green); }
html.is-mobile .m-wb-row > b.neg { color: var(--m-red); }
html.is-mobile .m-wb-row.total {
    background: rgba(var(--rg-accent-rgb), .12);
    border-color: rgba(var(--rg-accent-rgb), .22);
}
html.is-mobile .m-wb-row.total > b { font-size: 13.5px; }
html.is-mobile .m-wb-acc {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    margin: 7px 0 0;
    padding: 11px 12px;
    border-radius: 14px;
    border: 1px solid var(--m-edge);
    background: linear-gradient(155deg, rgba(255,255,255,.07), rgba(255,255,255,.015));
}
html.is-mobile .m-wb-acc-l { display: flex; align-items: center; gap: 9px; min-width: 0; }
html.is-mobile .m-wb-acc-av {
    width: 32px; height: 32px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 10px;
    background: linear-gradient(150deg, rgba(var(--rg-accent-rgb), .32), rgba(var(--rg-accent-rgb), .08));
    border: 1px solid rgba(var(--rg-accent-rgb), .26);
    font-size: 12px; color: var(--m-accent2);
}
html.is-mobile .m-wb-acc-t { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
html.is-mobile .m-wb-acc-t b { font-size: 12px; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .m-wb-acc-t small { font-size: 9.5px; font-weight: 700; color: var(--m-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .m-wb-acc-v { direction: ltr; flex: none; font-size: 13px; font-weight: 900; font-variant-numeric: tabular-nums; }
html.is-mobile .m-wb-acc-v.neg { color: var(--m-red); }
html.is-mobile .m-wb-acc-v.pos { color: var(--m-green); }
html.is-mobile .m-wb-note {
    margin: 7px 5px 2px;
    font-size: 9.5px; font-weight: 700; line-height: 1.9;
    color: var(--m-faint);
}
html.is-mobile body.rg-light .m-wb-row { background: rgba(30,70,120,.05); }
html.is-mobile body.rg-light .m-wb-row > span i { color: #5a7899; }
html.is-mobile body.rg-light .m-wb-row.total { background: rgba(47,127,208,.09); border-color: rgba(47,127,208,.18); }
html.is-mobile body.rg-light .m-wb-acc {
    background: linear-gradient(155deg, rgba(255,255,255,.9), rgba(255,255,255,.5));
    border-color: rgba(47,127,208,.2);
}
html.is-mobile .m-wb-empty-go {
    flex: none; width: auto;
    min-height: 40px; padding: 0 18px;
    margin-top: 8px;
    font-size: 12px;
}
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-wb-bar, html.is-mobile .m-wb-empty { animation: none !important; }
    html.is-mobile .m-wb-card, html.is-mobile .m-wb-scrim { transition: none; }
}

/* ------------------------- سجل الحركات: فلاتر وعرض متدرّج -------------------------
   993 حركة تُبنى كبطاقات زجاجية = تمرير ثقيل وفراغ طويل. البحث كان ينضغط إلى
   55px لأن نمطاً سطرياً يفرض flex:2. الآن الفلاتر صفوف واضحة، ونطاقات سريعة،
   والسجل يعرض ٤٠ بطاقة ثم زر «عرض المزيد» من عقد محفوظة بلا إعادة قراءة. */
/* حقول البحث ذات flex:2 كانت تنضغط إلى 55px في كل النوافذ (سجل الفواتير،
   مستودع الاستلام، المشتركون) وليس السجل وحده، فيبقى الإصلاح عاماً. */
html.is-mobile .admin-filters > input[style*="flex: 2"] { flex: 1 1 100% !important; }
html.is-mobile #modal-invoices .admin-filters > input[type="date"] { flex: 1 1 100% !important; }

/* صفا التاريخ بعنوانيهما ثم البحث صفاً كاملاً بزر مسح: «من» و«إلى» يمنعان
   قراءة الحقلين بالمقلوب، والمسح يوفّر حذف النص حرفاً حرفاً على الجوال. */
html.is-mobile #admin-logs .m-logs-dates { display: flex; gap: 8px; flex: 1 1 100% !important; min-width: 0; }
html.is-mobile #admin-logs .m-logs-field { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
html.is-mobile #admin-logs .m-logs-field > span { padding: 0 3px; font-size: 10px; font-weight: 900; letter-spacing: .3px; color: var(--m-faint); }
html.is-mobile #admin-logs .m-logs-field > input { width: 100%; min-width: 0; }
html.is-mobile #admin-logs .m-logs-search { position: relative; flex: 1 1 100% !important; min-width: 0; }
html.is-mobile #admin-logs .m-logs-search > input { width: 100%; padding-left: 40px !important; }
html.is-mobile #admin-logs .m-logs-clear {
    position: absolute; left: 7px; top: 50%;
    transform: translateY(-50%);
    display: none; align-items: center; justify-content: center;
    width: 28px; min-width: 0; max-width: 28px; height: 28px; padding: 0;
    flex: none;
    border-radius: 50%;
    border: 1px solid var(--m-edge);
    background: rgba(var(--rg-glass-rgb), .72);
    color: var(--m-muted);
    font-size: 12px; line-height: 1;
    -webkit-tap-highlight-color: transparent;
    transition: transform .15s var(--m-ease), color .2s var(--m-ease);
}
html.is-mobile #admin-logs .m-logs-clear.on { display: flex; }
html.is-mobile #admin-logs .m-logs-clear:active { transform: translateY(-50%) scale(.9); }
html.is-mobile body.rg-light #admin-logs .m-logs-clear {
    background: rgba(255,255,255,.85);
    border-color: rgba(47,127,208,.22);
    color: #4a6a8d;
}

html.is-mobile .m-logs-ranges {
    display: flex; gap: 7px;
    margin: 0 0 11px;
    animation: mWbRise .45s var(--m-ease-out) both;
}
html.is-mobile .m-logs-ranges button {
    flex: 1 1 0; min-width: 0;
    min-height: 36px; padding: 0 6px;
    border-radius: 12px;
    border: 1px solid var(--m-edge);
    background:
        linear-gradient(155deg, rgba(255,255,255,.08), rgba(255,255,255,.015) 60%),
        rgba(var(--rg-glass-rgb), .62);
    color: var(--m-muted);
    font-family: inherit; font-size: 11px; font-weight: 900;
    -webkit-tap-highlight-color: transparent;
    transition: transform .15s var(--m-ease), color .2s var(--m-ease), background .25s var(--m-ease), border-color .2s var(--m-ease);
}
html.is-mobile .m-logs-ranges button.on {
    color: var(--m-text);
    border-color: rgba(var(--rg-accent-rgb), .42);
    background:
        linear-gradient(150deg, rgba(var(--rg-accent-rgb), .28), rgba(var(--rg-accent-rgb), .05) 75%),
        rgba(var(--rg-glass-rgb), .78);
}
html.is-mobile .m-logs-ranges button:active { transform: scale(.96); }
html.is-mobile body.rg-light .m-logs-ranges button {
    background: linear-gradient(155deg, rgba(255,255,255,.9), rgba(255,255,255,.55));
    border-color: rgba(47,127,208,.2);
    color: #4a6a8d;
}
html.is-mobile body.rg-light .m-logs-ranges button.on {
    color: #16324f;
    border-color: rgba(47,127,208,.36);
    background: linear-gradient(150deg, rgba(47,127,208,.16), rgba(47,127,208,.04)), rgba(255,255,255,.8);
}

html.is-mobile .m-logs-foot {
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    padding: 6px 0 4px;
}
html.is-mobile .m-logs-more { flex: none; width: auto; min-width: 190px; min-height: 42px; }
html.is-mobile .m-logs-count {
    font-size: 10px; font-weight: 800; letter-spacing: .2px;
    color: var(--m-faint);
}
html.is-mobile .m-logs-empty { margin: 2px 0 8px; }
html.is-mobile .m-logs-all { flex: none; width: auto; min-height: 40px; padding: 0 18px; margin-top: 8px; font-size: 12px; }
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-logs-ranges { animation: none !important; }
}

/* ------------------------- صفحة المزيد -------------------------
   البطاقات تملأ ارتفاع اللوحة: لا تصعد الأيقونات تحت الترويسة ولا فراغ أسفلها. */
html.is-mobile #admin-more-menu { padding-top: 8px !important; display: none; flex-direction: column; }
html.is-mobile #admin-more-menu.m-seen { display: flex; }
html.is-mobile #admin-more-menu > h2 { margin-bottom: 14px !important; }
html.is-mobile #admin-more-menu > div[style*="grid-template-columns"] {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0,1fr)) !important;
    grid-auto-rows: minmax(124px, 1fr) !important;
    gap: 12px !important;
    flex: 1 1 auto;
    align-content: stretch;
    padding-bottom: 4px;
}
html.is-mobile #admin-more-menu .stat-card { padding: 16px 10px 20px !important; }
html.is-mobile #admin-more-menu .stat-card .stat-icon { width: 56px !important; height: 56px !important; margin-bottom: 14px !important; }
html.is-mobile #admin-more-menu .stat-card .stat-title { font-size: 12.5px !important; color: #dceaff !important; }

/* ------------------------- مركز النشاط -------------------------
   خط زمني واحد لكل ما يتحرك في المكوى: فواتير داخلة ودفعات مستلمة.
   شريط رفيع في صفحة المزيد يفتحه، فلا يزاحم الترويسة ولا شبكة البطاقات.
   قراءة فقط من الحالة الحيّة؛ لا يكتب شيئاً ولا يغيّر أي رقم. */
html.is-mobile .m-act-bar {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    margin: 0 0 12px;
    padding: 9px 12px;
    border-radius: 18px;
    border: 1px solid rgba(160,205,255,.20);
    background:
        linear-gradient(160deg, rgba(190,222,255,.12), rgba(120,172,240,.02) 55%, rgba(160,205,255,.07)),
        rgba(9,19,37,.46);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    backdrop-filter: blur(18px) saturate(140%);
    color: #e8f2ff;
    text-align: start;
    font-family: inherit;
    box-shadow: inset 0 1px 0 rgba(210,240,255,.16), 0 10px 24px rgba(0,4,14,.20);
    transition: transform .16s var(--m-ease), background .3s var(--m-ease), border-color .3s var(--m-ease);
}
html.is-mobile .m-act-bar:active { transform: scale(.985); }
html.is-mobile .m-act-bar-orb {
    position: relative;
    flex: none;
    width: 36px; height: 36px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 1px solid rgba(214,190,120,.34);
    background: linear-gradient(160deg, rgba(255,231,170,.18), rgba(255,196,64,.04));
    color: var(--gold, #e6c46a);
    font-size: 14px;
    box-shadow: inset 0 1px 0 rgba(255,244,210,.22);
}
html.is-mobile .m-act-bar-orb::after {
    content: "";
    position: absolute;
    top: 6px; inset-inline-end: 6px;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #6bf0b6;
    box-shadow: 0 0 0 3px rgba(107,240,182,.14), 0 0 10px rgba(107,240,182,.65);
    animation: mActPulse 2.6s ease-in-out infinite;
}
@keyframes mActPulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(107,240,182,.12), 0 0 6px rgba(107,240,182,.45); }
    50%      { box-shadow: 0 0 0 5px rgba(107,240,182,.06), 0 0 14px rgba(107,240,182,.85); }
}
html.is-mobile .m-act-bar-txt { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
html.is-mobile .m-act-bar-txt b { font-size: 13px; font-weight: 900; letter-spacing: .1px; }
html.is-mobile .m-act-bar-txt small {
    font-size: 10.5px;
    font-weight: 600;
    color: rgba(172,200,232,.68);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
html.is-mobile .m-act-bar-n {
    flex: none;
    min-width: 24px;
    height: 22px;
    padding: 0 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    background: rgba(140,195,255,.12);
    border: 1px solid rgba(160,210,255,.20);
    color: #cfe6ff;
    font-size: 11px;
    font-weight: 900;
}
html.is-mobile .m-act-bar-go { flex: none; color: rgba(165,200,240,.48); font-size: 10px; }
html.is-mobile body.rg-light .m-act-bar {
    border-color: rgba(255,255,255,.95);
    background: linear-gradient(160deg, rgba(255,255,255,.94), rgba(255,255,255,.70));
    color: #16324f;
    box-shadow: 0 8px 20px rgba(28,62,110,.10), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-act-bar-txt small { color: rgba(70,100,135,.66); }
html.is-mobile body.rg-light .m-act-bar-n { background: rgba(47,127,208,.08); border-color: rgba(47,127,208,.20); color: #2f6ea8; }
html.is-mobile body.rg-light .m-act-bar-go { color: rgba(47,127,208,.42); }

/* الطبقة: تحت نوافذ النظام (9560+) كي يفتح تفاصيل الفاتورة فوقها،
   وفوق شريط التبويبات حتى لا يظهر تحته. */
html.is-mobile .m-act {
    position: fixed;
    inset: 0;
    z-index: 9540;
    visibility: hidden;
    pointer-events: none;
}
html.is-mobile .m-act.on { visibility: visible; pointer-events: auto; }
html.is-mobile .m-act-scrim {
    position: absolute;
    inset: 0;
    background: rgba(3,8,18,.50);
    -webkit-backdrop-filter: blur(8px) saturate(130%);
    backdrop-filter: blur(8px) saturate(130%);
    opacity: 0;
    transition: opacity .3s var(--m-ease);
}
html.is-mobile .m-act.on .m-act-scrim { opacity: 1; }
html.is-mobile .m-act-card {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    max-height: calc(88vh - env(safe-area-inset-bottom, 0px) - var(--m-kb, 0px) * .55);
    display: flex;
    flex-direction: column;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-radius: 26px 26px 0 0;
    border: 1px solid rgba(170,215,255,.22);
    border-bottom: 0;
    background:
        linear-gradient(180deg, rgba(190,222,255,.13), rgba(120,172,240,.02) 42%, rgba(9,19,37,.55)),
        rgba(9,19,37,.90);
    -webkit-backdrop-filter: blur(26px) saturate(155%);
    backdrop-filter: blur(26px) saturate(155%);
    box-shadow: 0 -26px 60px rgba(0,6,18,.55), inset 0 1px 0 rgba(210,240,255,.22);
    overflow: hidden;
    transform: translate3d(0, 100%, 0);
    transition: transform .46s cubic-bezier(.16,1,.3,1);
}
html.is-mobile .m-act.on .m-act-card { transform: none; }
html.is-mobile .m-act.closing .m-act-card {
    transform: translate3d(0, 100%, 0);
    transition: transform .24s ease-in;
}
html.is-mobile .m-act.closing .m-act-scrim { opacity: 0; transition-duration: .2s; }
html.is-mobile .m-act-head {
    flex: none;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 15px 16px 11px;
}
html.is-mobile .m-act-head-orb {
    flex: none;
    width: 38px; height: 38px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    border: 1px solid rgba(214,190,120,.34);
    background: linear-gradient(160deg, rgba(255,231,170,.18), rgba(255,196,64,.04));
    color: var(--gold, #e6c46a);
    font-size: 15px;
    box-shadow: inset 0 1px 0 rgba(255,244,210,.22);
}
html.is-mobile .m-act-hd { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
html.is-mobile .m-act-hd b { font-size: 16px; font-weight: 900; color: #eef6ff; letter-spacing: .1px; }
html.is-mobile .m-act-hd small { font-size: 10.5px; color: rgba(170,198,230,.62); }
html.is-mobile .m-act-x {
    flex: none;
    width: 32px; height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(160,205,255,.20);
    background: rgba(255,255,255,.05);
    color: #cfe4ff;
    font-size: 13px;
}
html.is-mobile .m-act-x:active { transform: scale(.92); }
html.is-mobile .m-act-sum {
    flex: none;
    display: flex;
    gap: 8px;
    padding: 0 16px 11px;
}
html.is-mobile .m-act-chip {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 9px 10px;
    border-radius: 14px;
    border: 1px solid rgba(150,200,255,.14);
    background: rgba(255,255,255,.045);
}
html.is-mobile .m-act-chip b {
    font-size: 14px;
    font-weight: 900;
    color: #eaf4ff;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
html.is-mobile .m-act-chip small { font-size: 9.5px; font-weight: 700; color: rgba(168,198,232,.60); }
html.is-mobile .m-act-chip.inv b { color: #ffe6a8; }
html.is-mobile .m-act-chip.pay b { color: #a9dcff; }
html.is-mobile .m-act-chip.val b { color: #f2d489; }
html.is-mobile .m-act-tabs {
    flex: none;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 16px 10px;
    border-bottom: 1px solid rgba(150,200,255,.10);
}
html.is-mobile .m-act-seg {
    appearance: none;
    padding: 7px 13px;
    border-radius: 12px;
    border: 1px solid rgba(160,205,255,.16);
    background: rgba(255,255,255,.035);
    color: rgba(190,214,240,.80);
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 800;
    transition: background .2s var(--m-ease), border-color .2s var(--m-ease), color .2s var(--m-ease);
}
html.is-mobile .m-act-seg.sel {
    background: linear-gradient(160deg, rgba(120,180,255,.18), rgba(60,110,190,.06));
    border-color: rgba(150,205,255,.30);
    color: #eaf4ff;
    box-shadow: inset 0 1px 0 rgba(210,240,255,.16);
}
html.is-mobile .m-act-seg:active { transform: scale(.97); }
html.is-mobile .m-act-live {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 9.5px;
    font-weight: 700;
    color: rgba(160,190,225,.46);
}
html.is-mobile .m-act-live i {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #6bf0b6;
    box-shadow: 0 0 8px rgba(107,240,182,.7);
}
html.is-mobile .m-act-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding: 2px 10px 12px;
}
html.is-mobile .m-act-day {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 8px 7px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .5px;
    color: rgba(168,198,232,.62);
    background: linear-gradient(180deg, rgba(12,24,44,.94), rgba(12,24,44,.78) 70%, transparent);
}
html.is-mobile .m-act-day::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(150,200,255,.18), transparent);
}
html.is-mobile .m-act-day em {
    font-style: normal;
    font-weight: 700;
    color: rgba(150,185,222,.42);
}
html.is-mobile .m-act-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: 15px;
    border: 1px solid transparent;
    background: none;
    color: #e8f2ff;
    text-align: start;
    font-family: inherit;
    transition: background .16s ease, border-color .16s ease, transform .14s ease;
}
html.is-mobile .m-act-row:active {
    transform: scale(.985);
    background: rgba(120,180,255,.07);
    border-color: rgba(150,205,255,.16);
}
html.is-mobile .m-act.on .m-act-row,
html.is-mobile .m-act.on .m-act-day {
    animation: mActIn .42s var(--m-ease-out) both;
    animation-delay: calc(min(var(--i, 0), 14) * 24ms);
}
@keyframes mActIn {
    from { opacity: 0; transform: translate3d(0, 9px, 0); }
    to   { opacity: 1; transform: none; }
}
html.is-mobile .m-act-ic {
    flex: none;
    width: 34px; height: 34px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    font-size: 13px;
}
html.is-mobile .m-act-ic.inv {
    border: 1px solid rgba(214,190,120,.26);
    background: linear-gradient(160deg, rgba(255,231,170,.14), rgba(255,196,64,.03));
    color: #f2d489;
}
html.is-mobile .m-act-ic.pay {
    border: 1px solid rgba(120,180,255,.26);
    background: linear-gradient(160deg, rgba(150,205,255,.14), rgba(70,130,220,.03));
    color: #a9d6ff;
}
html.is-mobile .m-act-txt { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
html.is-mobile .m-act-txt b {
    font-size: 12.5px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
html.is-mobile .m-act-txt small {
    font-size: 10px;
    color: rgba(170,198,230,.62);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
html.is-mobile .m-act-amt {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    font-size: 12px;
    font-weight: 900;
    color: #eaf4ff;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
html.is-mobile .m-act-amt em {
    font-style: normal;
    font-size: 8.5px;
    font-weight: 700;
    color: rgba(160,190,225,.46);
}
html.is-mobile .m-act-amt.inv { color: #ffe6a8; }
html.is-mobile .m-act-amt.pay { color: #a9dcff; }
html.is-mobile .m-act-empty {
    padding: 34px 20px 44px;
    text-align: center;
}
html.is-mobile .m-act-empty i { display: block; font-size: 24px; color: rgba(150,195,245,.42); margin-bottom: 10px; }
html.is-mobile .m-act-empty b { display: block; font-size: 13px; font-weight: 800; color: #dbe9fb; margin-bottom: 4px; }
html.is-mobile .m-act-empty span { font-size: 11px; color: rgba(160,190,225,.55); }
html.is-mobile .m-act-more {
    display: block;
    margin: 8px auto 2px;
    padding: 9px 18px;
    border-radius: 13px;
    border: 1px solid rgba(160,205,255,.18);
    background: rgba(255,255,255,.045);
    color: #cfe4ff;
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 800;
}
html.is-mobile body.rg-light .m-act-scrim { background: rgba(232,240,250,.55); }
html.is-mobile body.rg-light .m-act-card {
    border-color: rgba(255,255,255,.96);
    background: linear-gradient(180deg, rgba(255,255,255,.97), rgba(247,251,255,.92));
    box-shadow: 0 -24px 60px rgba(24,54,100,.22), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-act-hd b { color: #142c47; }
html.is-mobile body.rg-light .m-act-hd small { color: rgba(60,90,125,.62); }
html.is-mobile body.rg-light .m-act-x { border-color: rgba(30,70,120,.14); background: rgba(30,70,120,.06); color: #24466f; }
html.is-mobile body.rg-light .m-act-chip { border-color: rgba(30,70,120,.10); background: rgba(30,70,120,.045); }
html.is-mobile body.rg-light .m-act-chip b { color: #142c47; }
html.is-mobile body.rg-light .m-act-chip small { color: rgba(60,90,125,.60); }
html.is-mobile body.rg-light .m-act-chip.inv b { color: #8a6316; }
html.is-mobile body.rg-light .m-act-chip.pay b { color: #1f5f9e; }
html.is-mobile body.rg-light .m-act-chip.val b { color: #9a7018; }
html.is-mobile body.rg-light .m-act-tabs { border-bottom-color: rgba(30,70,120,.09); }
html.is-mobile body.rg-light .m-act-seg { border-color: rgba(30,70,120,.12); background: rgba(30,70,120,.03); color: rgba(50,80,115,.80); }
html.is-mobile body.rg-light .m-act-seg.sel {
    background: linear-gradient(160deg, rgba(47,127,208,.13), rgba(47,127,208,.04));
    border-color: rgba(47,127,208,.26);
    color: #17395e;
    box-shadow: inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-act-live { color: rgba(60,90,125,.48); }
html.is-mobile body.rg-light .m-act-day {
    color: rgba(60,90,125,.62);
    background: linear-gradient(180deg, rgba(250,253,255,.97), rgba(250,253,255,.82) 70%, transparent);
}
html.is-mobile body.rg-light .m-act-day::after { background: linear-gradient(90deg, rgba(47,127,208,.18), transparent); }
html.is-mobile body.rg-light .m-act-day em { color: rgba(60,90,125,.45); }
html.is-mobile body.rg-light .m-act-row { color: #16324f; }
html.is-mobile body.rg-light .m-act-row:active { background: rgba(47,127,208,.06); border-color: rgba(47,127,208,.16); }
html.is-mobile body.rg-light .m-act-ic.inv { border-color: rgba(190,150,60,.30); background: linear-gradient(160deg, rgba(255,231,170,.35), rgba(255,214,120,.10)); color: #9a7018; }
html.is-mobile body.rg-light .m-act-ic.pay { border-color: rgba(47,127,208,.24); background: linear-gradient(160deg, rgba(150,205,255,.30), rgba(120,180,255,.08)); color: #1f5f9e; }
html.is-mobile body.rg-light .m-act-txt small { color: rgba(60,90,125,.62); }
html.is-mobile body.rg-light .m-act-amt { color: #142c47; }
html.is-mobile body.rg-light .m-act-amt.inv { color: #8a6316; }
html.is-mobile body.rg-light .m-act-amt.pay { color: #1f5f9e; }
html.is-mobile body.rg-light .m-act-amt em { color: rgba(60,90,125,.48); }
html.is-mobile body.rg-light .m-act-empty b { color: #24466f; }
html.is-mobile body.rg-light .m-act-empty span { color: rgba(60,90,125,.55); }
html.is-mobile body.rg-light .m-act-more { border-color: rgba(47,127,208,.20); background: rgba(47,127,208,.06); color: #1f5f9e; }
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-act-card,
    html.is-mobile .m-act-scrim,
    html.is-mobile .m-act.on .m-act-row,
    html.is-mobile .m-act.on .m-act-day,
    html.is-mobile .m-act-bar-orb::after { transition: none; animation: none; }
}

/* ------------------------- قفل الجلسة التلقائي -------------------------
   خيار في التخصيصات لا يفرض نفسه: متوقف حتى يختاره صاحب المكوى. عند
   تفعيله يعود النظام لشاشة الرمز بعد خمول حقيقي، وينبّه قبل القفل
   بثلاثين ثانية مع زر «ابقَ» كي لا يضيع عمل من ترك الجهاز لحظة. */
html.is-mobile .m-idle-card {
    margin-top: 14px;
    padding: 15px 14px 13px;
    border-radius: 20px;
    border: 1px solid rgba(160,205,255,.18);
    background:
        linear-gradient(160deg, rgba(190,222,255,.10), rgba(120,172,240,.02) 55%, rgba(160,205,255,.06)),
        rgba(9,19,37,.42);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    backdrop-filter: blur(18px) saturate(140%);
    box-shadow: inset 0 1px 0 rgba(210,240,255,.14), 0 10px 24px rgba(0,4,14,.18);
}
html.is-mobile .m-idle-head { display: flex; align-items: center; gap: 10px; }
html.is-mobile .m-idle-orb {
    flex: none;
    width: 36px; height: 36px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 1px solid rgba(214,190,120,.32);
    background: linear-gradient(160deg, rgba(255,231,170,.16), rgba(255,196,64,.04));
    color: var(--gold, #e6c46a);
    font-size: 14px;
    box-shadow: inset 0 1px 0 rgba(255,244,210,.20);
}
html.is-mobile .m-idle-hd { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
html.is-mobile .m-idle-hd b { font-size: 13.5px; font-weight: 900; color: #eaf3ff; }
html.is-mobile .m-idle-hd small { font-size: 10.5px; font-weight: 600; line-height: 1.65; color: rgba(170,198,230,.60); }
html.is-mobile .m-idle-seg { display: flex; gap: 6px; margin-top: 12px; }
html.is-mobile .m-idle-seg button {
    flex: 1 1 0;
    min-width: 0;
    padding: 9px 4px;
    border-radius: 12px;
    border: 1px solid rgba(160,205,255,.14);
    background: rgba(255,255,255,.035);
    color: rgba(190,214,240,.78);
    font-family: inherit;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition: background .2s var(--m-ease), border-color .2s var(--m-ease), color .2s var(--m-ease);
}
html.is-mobile .m-idle-seg button:active { transform: scale(.97); }
html.is-mobile .m-idle-seg button.on {
    background: linear-gradient(160deg, rgba(255,231,170,.20), rgba(255,196,64,.05));
    border-color: rgba(226,196,120,.42);
    color: #ffe9bf;
    box-shadow: inset 0 1px 0 rgba(255,244,210,.20);
}
html.is-mobile .m-idle-note {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 10px;
    font-size: 10px;
    font-weight: 700;
    color: rgba(168,198,232,.58);
}
html.is-mobile .m-idle-note i { font-size: 7px; color: #6bf0b6; }
html.is-mobile .m-idle-note.off i { color: rgba(150,180,215,.35); }
html.is-mobile body.rg-light .m-idle-card {
    border-color: rgba(255,255,255,.95);
    background: linear-gradient(160deg, rgba(255,255,255,.93), rgba(255,255,255,.70));
    box-shadow: 0 8px 20px rgba(28,62,110,.10), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-idle-hd b { color: #142c47; }
html.is-mobile body.rg-light .m-idle-hd small { color: rgba(60,90,125,.62); }
html.is-mobile body.rg-light .m-idle-seg button { border-color: rgba(30,70,120,.12); background: rgba(30,70,120,.03); color: rgba(50,80,115,.78); }
html.is-mobile body.rg-light .m-idle-seg button.on {
    background: linear-gradient(160deg, rgba(255,231,170,.50), rgba(255,214,120,.16));
    border-color: rgba(190,150,60,.40);
    color: #7d5a12;
    box-shadow: inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-idle-note { color: rgba(60,90,125,.60); }

html.is-mobile .m-idle-warn {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 66px);
    left: 50%;
    z-index: 9530;
    display: flex;
    align-items: center;
    gap: 9px;
    max-width: calc(100vw - 24px);
    padding: 8px 8px 8px 12px;
    border-radius: 16px;
    border: 1px solid rgba(255,214,140,.34);
    background:
        linear-gradient(160deg, rgba(255,231,170,.16), rgba(255,196,64,.04)),
        rgba(24,20,10,.74);
    -webkit-backdrop-filter: blur(18px) saturate(150%);
    backdrop-filter: blur(18px) saturate(150%);
    color: #ffe9bf;
    font-size: 11.5px;
    font-weight: 800;
    box-shadow: 0 16px 34px rgba(0,4,14,.44), inset 0 1px 0 rgba(255,244,210,.20);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translate(-50%, -8px);
    transition: opacity .25s var(--m-ease), transform .3s var(--m-ease-out), visibility .25s;
}
html.is-mobile .m-idle-warn.on {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translate(-50%, 0);
}
html.is-mobile .m-idle-warn > i { color: #ffd27a; font-size: 12px; }
html.is-mobile .m-idle-warn-t { white-space: nowrap; }
html.is-mobile .m-idle-warn-t b { font-variant-numeric: tabular-nums; color: #fff3d6; }
html.is-mobile .m-idle-warn-b {
    flex: none;
    padding: 6px 11px;
    border-radius: 11px;
    border: 1px solid rgba(255,225,160,.36);
    background: rgba(255,225,160,.14);
    color: #fff3d6;
    font-family: inherit;
    font-size: 11px;
    font-weight: 900;
}
html.is-mobile .m-idle-warn-b:active { transform: scale(.95); }
html.is-mobile body.rg-light .m-idle-warn {
    border-color: rgba(190,150,60,.36);
    background: linear-gradient(160deg, rgba(255,255,255,.96), rgba(255,249,235,.90));
    color: #7d5a12;
    box-shadow: 0 16px 34px rgba(60,44,10,.16), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-idle-warn > i { color: #a87a18; }
html.is-mobile body.rg-light .m-idle-warn-t b { color: #5f430c; }
html.is-mobile body.rg-light .m-idle-warn-b { border-color: rgba(190,150,60,.36); background: rgba(255,231,170,.45); color: #6a4b0e; }
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-idle-warn,
    html.is-mobile .m-idle-seg button { transition: none; }
}

/* إمكانية الوصول: حلقة تركيز ظاهرة للمفاتيح والأجهزة المساعدة */
html.is-mobile :focus-visible {
    outline: 2px solid rgba(255,222,150,.9);
    outline-offset: 2px;
    border-radius: 10px;
}
html.is-mobile body.rg-light :focus-visible {
    outline-color: rgba(150,100,20,.9);
}

/* زر عائم للعودة إلى أعلى القسم الطويل */
html.is-mobile .m-fab {
    position: fixed;
    z-index: 9450;
    inset-inline-end: 14px;
    bottom: calc(9px + env(safe-area-inset-bottom) * .45 + var(--m-bar-h) + 12px);
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    border: 1px solid rgba(214,190,120,.30);
    background:
        linear-gradient(160deg, rgba(255,231,170,.14), rgba(255,196,64,.03)),
        rgba(9,19,37,.62);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
    backdrop-filter: blur(16px) saturate(150%);
    color: var(--gold, #e6c46a);
    font-size: 15px;
    box-shadow: inset 0 1px 0 rgba(255,244,210,.16), 0 10px 24px rgba(0,4,14,.30);
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px) scale(.94);
    pointer-events: none;
    transition: opacity .22s var(--m-ease), transform .28s var(--m-ease-out), visibility .22s;
}
html.is-mobile .m-fab.on {
    opacity: 1;
    visibility: visible;
    transform: none;
    pointer-events: auto;
}
html.is-mobile .m-fab:active { transform: scale(.93); }
html.is-mobile body:not(.m-admin) .m-fab { display: none; }
html.is-mobile body.rg-light .m-fab {
    border-color: rgba(190,150,60,.30);
    background: linear-gradient(160deg, rgba(255,255,255,.94), rgba(255,250,238,.82));
    color: #8a6418;
    box-shadow: 0 10px 24px rgba(60,44,10,.16), inset 0 1px 0 #fff;
}
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-fab { transition: none; }
}

/* ------------------------- اللوحاتControl والفلاتر ------------------------- */
html.is-mobile .admin-control-panel { display: flex !important; flex-direction: column !important; align-items: stretch !important; gap: 10px !important; margin-bottom: 14px !important; }
html.is-mobile .admin-control-panel h2 { margin: 0 2px !important; }
html.is-mobile .admin-filters { display: flex !important; flex-wrap: wrap !important; gap: 8px !important; width: 100% !important; }
html.is-mobile .admin-filters > * { flex: 1 1 132px; min-width: 0; }

/* ------------------------- الحقول ------------------------- */
html.is-mobile input, html.is-mobile select, html.is-mobile textarea, html.is-mobile button { font-family: inherit; }
html.is-mobile .note-input,
html.is-mobile .input-group input,
html.is-mobile .input-group select {
    font-size: 16px !important;
    background:
        linear-gradient(180deg, rgba(146,200,255,.06), rgba(146,200,255,.01) 60%),
        rgba(9,18,33,.50) !important;
    border: 1px solid rgba(146,200,255,.20) !important;
    border-radius: 14px !important;
    color: var(--m-text) !important;
    padding: 11px 12px !important;
    width: 100% !important;
    min-height: 46px;
    box-shadow: inset 0 1px 2px rgba(0,0,0,.34);
}
html.is-mobile .input-group label { color: var(--m-muted) !important; font-size: 12px !important; font-weight: 800 !important; }
html.is-mobile input:focus, html.is-mobile select:focus, html.is-mobile textarea:focus {
    outline: none;
    border-color: rgba(102,178,255,.68) !important;
    box-shadow: 0 0 0 3px rgba(74,150,255,.18), inset 0 1px 2px rgba(0,0,0,.34) !important;
    background: rgba(74,150,255,.09) !important;
}

/* ------------------------- الأزرار والشارات -------------------------
   زرّ زجاجي واحد في كل النظام: جسم شفاف مائل للأزرق، حافة مضيئة 1px،
   وانضغاط صغير عند اللمس بنفس إحساس أزرار شاشة القفل. لا تدرّج أبيض. */
html.is-mobile #admin-screen .btn,
html.is-mobile #pos-screen .btn,
html.is-mobile #main-screen .btn,
html.is-mobile .modal-overlay:not(#modal-admin-login) .btn,
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-actions button,
html.is-mobile .btn-royal-action,
html.is-mobile .btn-save,
html.is-mobile .btn-cancel,
html.is-mobile .btn-confirm {
    min-height: 46px;
    border-radius: 16px !important;
    font-weight: 800 !important;
    letter-spacing: .2px;
    border: 1px solid rgba(170,216,255,.30) !important;
    background:
        linear-gradient(180deg, rgba(186,224,255,.20), rgba(146,200,255,.03) 55%),
        rgba(18,40,78,.46) !important;
    color: #eef7ff !important;
    box-shadow: inset 0 1px 0 rgba(216,240,255,.34), 0 10px 22px rgba(0,6,18,.36) !important;
    text-shadow: 0 1px 2px rgba(0,0,0,.40);
    transition: transform .15s var(--m-ease), filter .15s linear, opacity .15s linear;
    -webkit-tap-highlight-color: transparent;
}
/* الأساسي: ياقوتي زجاجي — أزرق أعمق وحافة أسطع، وما زال شفافاً */
html.is-mobile #admin-screen .btn-confirm,
html.is-mobile #admin-screen .btn-cash,
html.is-mobile #pos-screen .btn-confirm,
html.is-mobile #pos-screen .btn-cash,
html.is-mobile #pos-screen .btn-electronic,
html.is-mobile .modal-overlay:not(#modal-admin-login) .btn-confirm,
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-actions .btn-confirm,
html.is-mobile .btn-save {
    border-color: rgba(160,215,255,.36) !important;
    background:
        linear-gradient(180deg, rgba(186,226,255,.22), rgba(186,226,255,0) 48%),
        linear-gradient(160deg, rgba(88,160,255,.30), rgba(40,72,148,.24)) !important;
    color: #f2faff !important;
    box-shadow:
        inset 0 1px 0 rgba(205,238,255,.36),
        inset 0 -1px 0 rgba(4,12,26,.40),
        0 12px 26px rgba(6,20,48,.45) !important;
}
html.is-mobile #admin-screen .btn-cancel,
html.is-mobile .modal-overlay:not(#modal-admin-login) .btn-cancel,
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-actions .btn-cancel {
    background:
        linear-gradient(180deg, rgba(146,200,255,.06), rgba(146,200,255,.01) 55%),
        rgba(10,19,35,.46) !important;
    border-color: rgba(146,200,255,.18) !important;
    color: #cddff5 !important;
    box-shadow: inset 0 1px 0 rgba(178,220,255,.14), 0 6px 14px rgba(0,0,0,.26) !important;
}
/* لمسة الزر: تنضغط فعلياً وتلمع قليلاً — لا تذوب إلى نصف شفافة كما كان */
html.is-mobile .btn:active,
html.is-mobile .btn-confirm:active,
html.is-mobile .btn-cash:active,
html.is-mobile .btn-cancel:active,
html.is-mobile .top-bar-btn:active,
html.is-mobile .action-icon:active,
html.is-mobile .m-sheet-x:active,
html.is-mobile .m-viewbtn:active,
html.is-mobile .bottom-nav-btn:active {
    transform: scale(.965);
    filter: brightness(1.10);
    opacity: .96;
}
html.is-mobile .bottom-nav-btn:active i { transform: translateY(0) scale(.90); }
html.is-mobile a:active, html.is-mobile .stat-card:active { opacity: .94; }
/* بطاقات البيانات القابلة للفتح: تنضغط ككتلة واحدة تحت الإصبع، فتأكيد ملموس
   أن اللمسة وصلت قبل أن تنزلق النافذة */
html.is-mobile #admin-screen .cart-table tr[onclick]:active,
html.is-mobile #admin-screen .invoices-table tr[onclick]:active,
html.is-mobile #admin-screen tr[data-inv-id]:active {
    transform: scale(.982);
    filter: brightness(1.07);
}
/* الشارات: رقاقة زجاجية بحافة شعرية وحفر داخلي — بلا هالة */
html.is-mobile .badge, html.is-mobile .stat-badge, html.is-mobile .pill {
    border: 1px solid rgba(160,210,255,.24) !important;
    background: linear-gradient(180deg, rgba(146,200,255,.13), rgba(146,200,255,.03)), rgba(14,26,46,.58) !important;
    color: #e6f2ff !important;
    border-radius: 99px !important;
    box-shadow: inset 0 1px 0 rgba(190,228,255,.20), 0 4px 10px rgba(0,0,0,.30);
    font-variant-numeric: tabular-nums;
}

/* ------------------------- شريط التبويبات: غيمة سائلة -------------------------
   ثابت في body، وموضعه لا يقرأ لوحة المفاتيح ولا ارتفاع الشاشة المتغير، والسحب
   عليه ممنوع (touch-action:none) فلا يحرّك المستند ولا يرتفع ولا يهبط. */
html.is-mobile #mobile-bottom-nav {
    display: none;
    position: fixed;
    width: auto !important;
    left: 10px; right: 10px;
    bottom: calc(9px + env(safe-area-inset-bottom) * 0.45);
    height: var(--m-bar-h);
    z-index: 9500;
    padding: 6px;
    border-radius: var(--m-radius-bar);
    /* زجاج حقيقي بلا فلتر: الشفافية تُظهر المشهد المتحرك خلف الشريط مباشرة */
    /* قاعدة أغمق من البطاقات: الشريط يطفو فوق محتوى ساطع، والزجاج الشفاف
       جداً يذيب أسماء التبويبات في الأرقام الكبيرة تحته. */
    background:
        linear-gradient(180deg, rgba(186,224,255,.22), rgba(118,180,255,.03) 58%),
        radial-gradient(120% 150% at 50% -20%, rgba(96,150,255,.28), transparent 64%),
        rgba(6,15,32,.88);
    border: 1px solid rgba(184,224,255,.34);
    box-shadow: 0 20px 44px rgba(0,4,14,.55), var(--m-rim);
    justify-content: space-around;
    align-items: stretch;
    overflow: hidden;
    pointer-events: auto;
    touch-action: none;
    isolation: isolate;
}
html.is-mobile body.m-admin #mobile-bottom-nav { display: flex; }
/* لا فلتر خلفي على أي سطح متحرك: القاعدة القديمة في style.css تضع blur(15px)
   على الشريط وblur(16px) على النوافذ، وهي تُعاد حوسبتها مع كل إطار تمرير.
   شاشة القفل وحدها تحتفظ بزجاجها الحقيقي (m-lk) وهي مجمّدة. */
html.is-mobile #mobile-bottom-nav,
html.is-mobile .modal-overlay:not(#modal-admin-login),
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-content,
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-header-sticky,
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-footer-sticky,
html.is-mobile .toast-msg,
html.is-mobile .hamburger-dropdown {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}
html.is-mobile #mobile-bottom-nav::before {
    content: "";
    position: absolute;
    left: 18%; right: 18%; top: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(190,230,255,.75), transparent);
}

html.is-mobile .bottom-nav-btn {
    position: relative;
    z-index: 2;
    flex: 1 1 calc(100% / var(--m-n));
    min-width: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    background: transparent; border: none; color: #a3bcdb;
    padding: 4px 2px;
    transition: color .30s var(--m-ease), transform .18s var(--m-ease);
}
html.is-mobile .bottom-nav-btn i { font-size: 18px; line-height: 1; transition: transform .34s var(--m-ease), filter .34s var(--m-ease), color .22s var(--m-ease), text-shadow .30s var(--m-ease); }
html.is-mobile .bottom-nav-btn span {
    font-size: 10.5px; font-weight: 800; max-width: 100%; letter-spacing: .1px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    opacity: .75; transition: opacity .34s var(--m-ease);
}
/* التوهّج البصري كله من m-hi وحده: هو الذي يتبع الإصبع والمؤشر لحظة بلحظة.
   active في style.css تُلبس الأيقونة لون --gold الأزرق وتكبّرها وتضيف هالة،
   وتبقى على التبويب السابق حتى ينتهي نابض الالتزام — فلا توهّجين ولا تبويب
   قديم متوهج بعد رفع الإصبع. نُبطل أثر active ما دام ليس الوجهة الحالية. */
html.is-mobile .bottom-nav-btn.m-hi { color: #eaf5ff; }
html.is-mobile .bottom-nav-btn.m-hi i {
    color: var(--gold);
    text-shadow: 0 5px 12px rgba(90,168,255,.55);
    transform: translateY(-2px) scale(1.10); filter: none;
}
html.is-mobile .bottom-nav-btn.m-hi span { opacity: 1; }
html.is-mobile .bottom-nav-btn.active:not(.m-hi) { color: #a3bcdb; }
html.is-mobile .bottom-nav-btn.active:not(.m-hi) i { color: inherit; transform: none; filter: none; text-shadow: none; }
html.is-mobile .bottom-nav-btn.active:not(.m-hi) span { opacity: .75; }

/* الكتلة السائلة: تتبع الإصبع بنبضة متأخرة، تنضغط في اتجاه الحركة، تتكتّل ثم تستقر */
html.is-mobile .m-ind {
    position: absolute; z-index: 1;
    top: 6px; bottom: 6px;
    left: 0; width: 0;
    transform-origin: center center;
    border-radius: calc(22px + var(--m-sq, 0) * 16px) calc(30px - var(--m-sq, 0) * 10px)
                   calc(22px + var(--m-sq, 0) * 12px) calc(30px - var(--m-sq, 0) * 8px) / 62% 58% 62% 58%;
    background:
        radial-gradient(80% 120% at 50% 118%, rgba(118,190,255,.34), transparent 70%),
        radial-gradient(120% 150% at 50% -18%, rgba(188,226,255,.24), transparent 64%),
        linear-gradient(180deg, rgba(96,168,255,.30), rgba(40,80,160,.18));
    box-shadow:
        inset 0 1px 0 rgba(200,235,255,.44),
        inset 0 0 0 1px rgba(120,180,255,.18),
        0 6px 18px rgba(16,48,120,.32);
    opacity: .95;
    will-change: transform;
    transition: border-radius .42s var(--m-ease-out), opacity .3s linear;
}
html.is-mobile .m-ind::after {
    content: "";
    position: absolute;
    left: 24%; right: 24%; bottom: 4px; height: 2px; border-radius: 99px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.92), transparent);
    box-shadow: 0 1px 1px rgba(0,0,0,.35);
}
html.is-mobile .bottom-nav-btn.active + .m-ind, html.is-mobile .m-ind { pointer-events: none; }

/* ------------------------- نوافذ النظام غير المنزلاقة ------------------------- */
/* النافذة فوق الشريط: ورقة المتجر تعطي المنبثقة 2000 والشريط مثبت فوقها، فيظهر
   الشريط على نافذة مليئة الشاشة ويغطي زر الإغلاق في أسفلها. */
html.is-mobile .modal-overlay { z-index: 9550; }
html.is-mobile .modal-overlay:not(.m-sheet):not(.m-lock-screen) {
    align-items: center !important;
    justify-content: center !important;
    padding: calc(env(safe-area-inset-top) + 10px) 10px calc(env(safe-area-inset-bottom) + 10px) !important;
}
html.is-mobile .modal-overlay:not(.m-sheet) .modal-content {
    width: 100% !important;
    max-width: 720px !important;
    height: auto !important;
    max-height: calc(100% - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 20px) !important;
    margin: 0 auto !important;
    border-radius: var(--m-radius-sheet) !important;
    border: 1px solid rgba(168,216,255,.26) !important;
    background:
        radial-gradient(140% 90% at 88% -12%, rgba(110,104,255,.26), transparent 60%),
        linear-gradient(180deg, rgba(168,212,255,.15), rgba(146,200,255,.02) 42%),
        rgba(17,36,68,.90) !important;
    box-shadow: 0 26px 70px rgba(0,4,14,.62), inset 0 1px 0 rgba(206,236,255,.34) !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}
/* رأس/جسم/تذييل النوافذ كانت سوداء مربعة فوق الزجاج الجديد (style.css يطليها
   rgba(20,20,20,.95)). نزيل الطلاء الأسود ونترك نفس زجاج اللوحة. */
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-header-sticky,
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-footer-sticky {
    background:
        linear-gradient(180deg, rgba(160,206,255,.13), rgba(160,206,255,.02) 70%),
        rgba(16,34,64,.86) !important;
    border-color: rgba(160,210,255,.20) !important;
}
html.is-mobile .modal-overlay:not(#modal-admin-login) .modal-body-scrollable {
    background: rgba(12,26,50,.46) !important;
}

/* ------------------------- النوافذ السفلية ------------------------- */
html.is-mobile .modal-overlay.m-sheet {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 9560 !important;
    align-items: flex-end !important;
    justify-content: center !important;
    padding: 0 !important;
    /* ستارة داكنة مزرقة بدل blur: فتح أي نافذة كان يطلب من المعالج ضبابية
       الشاشة كاملة فوق المحتوى — وهذا أبطأ لحظة في التطبيق */
    background:
        radial-gradient(120% 70% at 50% 0%, rgba(30,62,132,.26), transparent 62%),
        rgba(2,5,11,.64);
    opacity: 0;
    pointer-events: none;
    transition: opacity .28s var(--m-ease);
}
html.is-mobile .modal-overlay.m-sheet.m-on { opacity: 1; pointer-events: auto; }
/* الدخول والخروج حركات CSS لا انتقالات: النظام يُخفي النافذة بـ display:none
   والانتقال لا يعمل عبر الإخفاء — فكانت تختفي فجأة أو تهبط ثم تصعد. */
@keyframes mSheetIn { from { transform: translateY(105%); } to { transform: translateY(0); } }
@keyframes mSheetOut {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    12% { transform: translateY(14px) scale(.998); opacity: 1; }
    100% { transform: translateY(104%) scale(.985); opacity: .88; }
}
@keyframes mScrimIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes mScrimOut { from { opacity: 1; } to { opacity: 0; } }
/* بناء تدريجي لمحتوى النوافذ: البطاقة تنبثق بعد التي قبلها بلا أي خصائص تخطيط.
   التأخير الأساسي يترك الورقة تصل أولاً، ثم يبدأ المحتوى يتركّب أمام العين. */
@keyframes mRise {
    from { opacity: 0; transform: translateY(22px) scale(.975); }
    to { opacity: 1; transform: none; }
}
html.is-mobile .m-rise {
    animation: mRise .70s cubic-bezier(.2,.78,.22,1) both;
    animation-delay: calc(220ms + var(--i, 0) * 62ms);
}
/* تفكيك عند الإغلاق: البطاقات تنسحب من الأسفل إلى الأعلى بينما الورقة تتراجع */
@keyframes mSink {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(16px) scale(.984); }
}
html.is-mobile .modal-overlay.m-sheet.m-closing .m-exp-sum,
html.is-mobile .modal-overlay.m-sheet.m-closing .m-exp-card,
html.is-mobile .modal-overlay.m-sheet.m-closing #drill-transactions-body tr,
html.is-mobile .modal-overlay.m-sheet.m-closing #drill-cart-info,
html.is-mobile .modal-overlay.m-sheet.m-closing #drill-cart-items-body tr {
    animation: mSink .46s cubic-bezier(.35,.6,.3,1) both;
    animation-delay: calc(var(--j, 0) * 26ms);
}
/* حركات بناء الصفحة خلف النافذة تتجمّد أثناء فتحها: هي خلف ستارة معتمة أصلاً،
   وترك عشرات الحركات تدور هناك ينافس الورقة على المعالج والرسّام فيظهر
   فتح النافذة متقطعاً على الجوال. تستأنف من حيث توقفت لحظة الإغلاق. */
html.is-mobile body.m-sheet-open .admin-section .m-anim,
html.is-mobile body.m-sheet-open .admin-section .m-anim *,
html.is-mobile body.m-sheet-open .admin-section tr.m-anim {
    animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-rise,
    html.is-mobile .modal-overlay.m-sheet.m-closing .m-exp-sum,
    html.is-mobile .modal-overlay.m-sheet.m-closing .m-exp-card,
    html.is-mobile .modal-overlay.m-sheet.m-closing #drill-transactions-body tr,
    html.is-mobile .modal-overlay.m-sheet.m-closing #drill-cart-info,
    html.is-mobile .modal-overlay.m-sheet.m-closing #drill-cart-items-body tr { animation: none !important; }
}
html.is-mobile .modal-overlay.m-sheet .modal-content { animation: none; }
html.is-mobile .modal-overlay.m-sheet.m-on { animation: mScrimIn .28s linear both; }
html.is-mobile .modal-overlay.m-sheet.m-in .modal-content { animation: mSheetIn .52s cubic-bezier(.16,.9,.24,1) both; }
html.is-mobile .modal-overlay.m-sheet.m-closing {
    display: flex !important;
    pointer-events: none;
    animation: mScrimOut .56s cubic-bezier(.4,0,.6,1) both;
}
html.is-mobile .modal-overlay.m-sheet.m-closing .modal-content { animation: mSheetOut .62s cubic-bezier(.5,.04,.72,.22) both; }
html.is-mobile .modal-overlay.m-sheet .modal-content {
    position: relative;
    width: 100% !important;
    max-width: 720px !important;
    height: auto !important;
    max-height: 92% !important;
    margin: 0 !important;
    border-radius: var(--m-radius-sheet) var(--m-radius-sheet) 0 0 !important;
    border: 1px solid rgba(172,218,255,.28) !important;
    border-bottom: none !important;
    background:
        radial-gradient(150% 90% at 84% -14%, rgba(112,104,255,.32), transparent 62%),
        radial-gradient(120% 80% at 0% 106%, rgba(52,132,255,.22), transparent 66%),
        linear-gradient(180deg, rgba(170,213,255,.16), rgba(146,200,255,.02) 40%),
        rgba(21,44,84,.92) !important;
    box-shadow: 0 -18px 60px rgba(0,4,14,.62), inset 0 1px 0 rgba(210,238,255,.36) !important;
    padding: 6px 14px calc(14px + env(safe-area-inset-bottom)) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior: none;
    transform: translateY(105%);
    transition: transform .36s var(--m-ease-out);
}
html.is-mobile .modal-overlay .modal-content.mobile-sticky-modal {
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    padding: 0 !important;
}
html.is-mobile .modal-content.mobile-sticky-modal .modal-body-scrollable {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: auto !important;
    overscroll-behavior: none;
    padding: 0 14px 10px !important;
}
html.is-mobile .modal-overlay .modal-content.mobile-sticky-modal .m-sheet-x { top: 12px; }
html.is-mobile .modal-overlay .modal-content.mobile-sticky-modal .modal-actions { margin: 0 14px calc(12px + env(safe-area-inset-bottom)); }
html.is-mobile .modal-overlay.m-sheet.m-on .modal-content { transform: translateY(0); }
html.is-mobile .modal-overlay.m-sheet .modal-title {
    position: sticky; top: -6px; z-index: 3;
    margin: 0 -14px 10px;
    padding: 14px 14px 12px;
    background:
        linear-gradient(180deg, rgba(160,206,255,.14), rgba(146,200,255,.02) 74%),
        rgba(18,38,72,.72);
    border-bottom: 1px solid rgba(160,210,255,.20);
    border-radius: var(--m-radius-sheet) var(--m-radius-sheet) 0 0;
    font-size: 16.5px;
    font-weight: 900;
    color: #e8f2ff;
    padding-inline-end: 62px;
}
html.is-mobile .modal-overlay.m-sheet .modal-actions {
    position: sticky; bottom: 0; padding-top: 10px;
    background: linear-gradient(to top, rgba(15,32,62,.96) 38%, rgba(15,32,62,0));
}
/* لا تحديد نص ولا قائمة ضغط مطوّل داخل النوافذ: لمسة التمرير كانت تظلّل النص أزرق */
html.is-mobile .modal-overlay.m-sheet .modal-content {
    -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
}
html.is-mobile .modal-overlay.m-sheet input,
html.is-mobile .modal-overlay.m-sheet textarea,
html.is-mobile .modal-overlay.m-sheet [contenteditable="true"] {
    -webkit-user-select: text; user-select: text;
}
html.is-mobile .modal-overlay:not(#modal-admin-login) .input-group label { color: #bad5f1 !important; }
html.is-mobile .modal-overlay:not(#modal-admin-login) input::placeholder,
html.is-mobile .modal-overlay:not(#modal-admin-login) textarea::placeholder {
    color: rgba(178,206,238,.55) !important;
}
html.is-mobile .m-sheet-x {
    position: absolute; top: 11px; inset-inline-end: 12px; z-index: 12;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    clip-path: var(--m-plate);
    border: none;
    background:
        linear-gradient(160deg, rgba(170,216,255,.22), rgba(120,165,235,.04) 50%, rgba(130,175,255,.14)),
        rgba(22,46,88,.82);
    color: #e8f2ff; font-size: 20px; line-height: 1;
    box-shadow: inset 0 1px 0 rgba(196,230,255,.30);
    text-shadow: 0 1px 2px rgba(0,0,0,.6);
    filter: drop-shadow(0 6px 12px rgba(0,0,0,.5));
}
html.is-mobile .m-sheet-x:active { background: linear-gradient(160deg, rgba(214,236,255,.34), rgba(20,34,54,.92)); }

/* ------------------------- نافذة تفاصيل الصرفيات ------------------------- */
/* الورقة ثابتة: لا تُسحب ولا تُغلق إلا بالزر أو ×. الرقم هو الأساس، والملاحظة
   داخل صندوق حاجز لا تخرج منه: تُقصّ بأسطر ويتصغّر خطّها كلما طال النص. */
html.is-mobile .modal-overlay .modal-content.m-exp-modal {
    height: 92% !important;
    max-height: 92% !important;
}
html.is-mobile .m-exp-modal .modal-title {
    position: static;
    margin: 0;
    padding: 14px 56px 12px 16px;
    background:
        linear-gradient(180deg, rgba(160,206,255,.14), rgba(146,200,255,.02) 78%),
        rgba(18,38,72,.72);
    border-bottom: 1px solid rgba(160,210,255,.18);
    border-radius: var(--m-radius-sheet) var(--m-radius-sheet) 0 0;
    font-size: 15.5px;
    font-weight: 900;
    color: #eef6ff;
}
html.is-mobile .m-exp-sum {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    margin: 10px 14px 12px;
    padding: 11px 13px;
    clip-path: var(--m-facet-sm);
    background:
        linear-gradient(150deg, rgba(255,150,165,.12), rgba(160,206,255,.04) 46%, rgba(120,170,255,.10)),
        rgba(14,30,58,.74);
    box-shadow: inset 0 1px 0 rgba(196,232,255,.20), inset 0 0 0 1px rgba(140,190,255,.10);
}
html.is-mobile .m-exp-sum-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
html.is-mobile .m-exp-sum-main > span { font-size: 10px; font-weight: 800; color: var(--m-faint); letter-spacing: .2px; }
html.is-mobile .m-exp-sum b {
    font-size: 19px; font-weight: 900; color: #ffd2d9;
    font-variant-numeric: tabular-nums; line-height: 1.1;
    text-shadow: 0 1px 2px rgba(0,0,0,.5);
}
html.is-mobile .m-exp-sum b em { font-style: normal; font-size: 10.5px; color: var(--m-muted); margin-inline-start: 3px; }
html.is-mobile .m-exp-sum-meta {
    display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
    font-size: 10.5px; font-weight: 800; color: var(--m-muted);
}
html.is-mobile .m-exp-sum-meta i { color: #8fc6ff; margin-inline-end: 4px; }
html.is-mobile .m-exp-count { font-size: 10px; color: var(--m-faint); }

html.is-mobile .m-exp-modal .m-exp-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
    padding: 0 14px 12px !important;
    background: transparent !important;
}
html.is-mobile .m-exp-list { display: flex; flex-direction: column; gap: 9px; }
html.is-mobile .m-exp-card {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0,1fr) auto;
    gap: 8px 12px;
    padding: 12px 14px 13px;
    border-radius: 16px;
    border: 1px solid rgba(158,206,255,.16);
    background:
        radial-gradient(120% 140% at 96% -18%, rgba(255,126,146,.10), transparent 62%),
        linear-gradient(158deg, rgba(196,226,255,.11), rgba(122,172,240,.02) 46%, rgba(150,200,255,.06)),
        rgba(17,36,68,.66);
    box-shadow: inset 0 1px 0 rgba(196,232,255,.16), 0 8px 20px rgba(0,6,18,.18);
    overflow: hidden;
}
html.is-mobile .m-exp-card::before {
    content: "";
    position: absolute;
    inset-inline-start: 0; top: 14px; bottom: 14px; width: 2px;
    border-radius: 2px;
    background: linear-gradient(180deg, rgba(255,140,158,0), rgba(255,140,158,.55) 40%, rgba(255,140,158,0));
}
html.is-mobile .m-exp-amt {
    grid-column: 1; grid-row: 1;
    justify-self: start;
    display: flex; align-items: baseline; gap: 4px;
}
html.is-mobile .m-exp-amt span {
    font-size: 22px; font-weight: 900; color: #ffd2d9;
    font-variant-numeric: tabular-nums; line-height: 1;
    text-shadow: 0 1px 2px rgba(0,0,0,.5);
}
html.is-mobile .m-exp-amt em { font-style: normal; font-size: 10.5px; font-weight: 800; color: var(--m-faint); }
html.is-mobile .m-exp-when {
    grid-column: 2; grid-row: 1;
    display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
    min-width: 0;
}
html.is-mobile .m-exp-date {
    font-size: 11px; font-weight: 800; color: #d7e7fb;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}
html.is-mobile .m-exp-sub {
    display: flex; align-items: center; gap: 6px;
    font-size: 10.5px; font-weight: 700; color: var(--m-muted);
    white-space: nowrap;
}
html.is-mobile .m-exp-sub i { width: 3px; height: 3px; border-radius: 50%; background: rgba(180,214,255,.5); }
html.is-mobile .m-exp-note {
    grid-column: 1 / 3; grid-row: 2;
    margin-top: 2px;
    padding: 7px 10px 8px;
    height: 58px;
    border-radius: 11px;
    background: rgba(5,15,32,.34);
    border: 1px solid rgba(150,200,255,.10);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
    overflow: hidden;
    display: flex; flex-direction: column; gap: 2px;
}
html.is-mobile .m-exp-note-t { font-size: 9px; font-weight: 900; letter-spacing: .3px; color: rgba(170,205,245,.6); }
html.is-mobile .m-exp-note-x {
    margin: 0;
    font-size: 12.5px; line-height: 1.42; font-weight: 650; color: #dceafc;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
    overflow: hidden; word-break: break-word; overflow-wrap: anywhere;
}
html.is-mobile .m-exp-note-x.m-note-2 { font-size: 11.5px; }
html.is-mobile .m-exp-note-x.m-note-3 { font-size: 10.5px; line-height: 1.32; -webkit-line-clamp: 3; }
html.is-mobile .m-exp-empty {
    display: none;
    flex-direction: column; align-items: center; gap: 10px;
    padding: 34px 0 26px;
    color: var(--m-faint); font-size: 13px; font-weight: 800;
}
html.is-mobile .m-exp-empty i { font-size: 30px; opacity: .5; }

/* ------------------------- كشف اليوم: بطاقات بدل جدول مسحوب ------------------------- */
html.is-mobile .modal-overlay .modal-content.m-day-modal {
    height: 92% !important;
    max-height: 92% !important;
}
html.is-mobile .m-day-modal .modal-header-sticky {
    flex: none;
    padding: 12px 14px 10px !important;
    background:
        linear-gradient(180deg, rgba(160,206,255,.13), rgba(16,34,64,.92)) !important;
    border-bottom: 1px solid rgba(160,210,255,.16) !important;
    border-radius: var(--m-radius-sheet) var(--m-radius-sheet) 0 0;
}
html.is-mobile .m-day-modal .modal-title {
    position: static !important;
    margin: 0 0 8px !important;
    padding: 0 0 0 52px !important;
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    font-size: 15px !important;
    font-weight: 900 !important;
    color: #eef6ff !important;
    text-align: center !important;
}
html.is-mobile .m-day-modal .modal-header-sticky > div {
    margin-bottom: 0 !important;
    gap: 8px !important;
}
html.is-mobile .m-day-modal .modal-header-sticky > div > span {
    padding: 6px 10px !important;
    border-radius: 10px !important;
    background: rgba(8,22,44,.5) !important;
    border-width: 1px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07);
}
html.is-mobile .m-day-hint {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 8px;
    font-size: 10.5px; font-weight: 800; color: rgba(170,205,245,.55);
}
html.is-mobile #modal-daily-transactions .modal-body-scrollable {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
    padding: 10px 14px 12px !important;
    background: transparent !important;
}
html.is-mobile #modal-daily-transactions .invoices-table {
    display: block !important;
    width: 100% !important;
    border: none !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;
    white-space: normal !important;
    background: transparent !important;
}
html.is-mobile #modal-daily-transactions .invoices-table thead { display: none !important; }
html.is-mobile #modal-daily-transactions .invoices-table tbody { display: block !important; width: 100% !important; }
html.is-mobile #modal-daily-transactions .invoices-table tbody tr {
    display: grid !important;
    grid-template-columns: minmax(0,1.25fr) minmax(0,1fr) !important;
    grid-template-rows: auto auto auto auto !important;
    gap: 7px 10px !important;
    margin: 0 0 9px !important;
    padding: 12px 13px !important;
    border-radius: 15px !important;
    border: 1px solid rgba(158,206,255,.16) !important;
    background:
        linear-gradient(158deg, rgba(196,226,255,.10), rgba(122,172,240,.02) 46%, rgba(150,200,255,.05)),
        rgba(17,36,68,.64) !important;
    box-shadow: inset 0 1px 0 rgba(196,232,255,.15), 0 8px 18px rgba(0,6,18,.16) !important;
    white-space: normal !important;
}
html.is-mobile #modal-daily-transactions .invoices-table tbody td {
    display: block !important;
    min-width: 0 !important;
    padding: 0 !important;
    border: none !important;
    text-align: right !important;
    white-space: normal !important;
    background: transparent !important;
    font-size: 12px !important;
    line-height: 1.35 !important;
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(1) {
    grid-column: 1 !important; grid-row: 1 !important;
    justify-self: start;
    padding: 2px 8px !important;
    border-radius: 8px !important;
    background: rgba(255,255,255,.06) !important;
    font-size: 11px !important;
    font-weight: 800 !important;
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(2) {
    grid-column: 2 !important; grid-row: 2 !important;
    justify-self: start;
    color: var(--m-faint) !important;
    font-size: 10.5px !important;
    font-weight: 800 !important;
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(2)::before {
    content: "#"; opacity: .6; margin-inline-end: 1px;
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(3) {
    grid-column: 1 !important; grid-row: 2 !important;
    font-size: 13px !important;
    font-weight: 800 !important;
    color: #eaf3ff !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(4) {
    grid-column: 2 !important; grid-row: 1 !important;
    justify-self: end;
    color: var(--m-muted) !important;
    font-size: 10.5px !important;
    font-weight: 700 !important;
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(n+5) {
    font-size: 12.5px !important;
    font-weight: 900 !important;
    font-variant-numeric: tabular-nums;
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(n+5)::before {
    display: block;
    margin-bottom: 2px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .2px;
    color: rgba(170,205,245,.52);
}
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(5) { grid-column: 1 !important; grid-row: 3 !important; }
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(6) { grid-column: 2 !important; grid-row: 4 !important; display: block !important; }
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(7) { grid-column: 2 !important; grid-row: 3 !important; }
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(8) { grid-column: 1 !important; grid-row: 4 !important; }
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(5)::before { content: "المجموع"; }
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(6)::before { content: "الخصم"; }
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(7)::before { content: "المدفوع"; }
html.is-mobile #modal-daily-transactions .invoices-table td:nth-child(8)::before { content: "الحالة"; }
html.is-mobile .m-day-empty {
    display: none;
    flex-direction: column; align-items: center; gap: 10px;
    padding: 40px 0 30px;
    color: var(--m-faint); font-size: 13px; font-weight: 800;
}
html.is-mobile .m-day-empty i { font-size: 30px; opacity: .5; }

/* ------------------------- تفاصيل القائمة: نافذة وسطية ثابتة ------------------------- */
html.is-mobile .modal-overlay.m-sheet.m-center {
    align-items: center !important;
    justify-content: center !important;
    padding: max(14px, env(safe-area-inset-top)) 12px max(14px, env(safe-area-inset-bottom)) !important;
}
html.is-mobile .modal-overlay.m-sheet.m-center .modal-content {
    width: 100% !important;
    max-width: 560px !important;
    height: auto !important;
    max-height: 86% !important;
    margin: 0 auto !important;
    border-radius: 22px !important;
    border: 1px solid rgba(172,218,255,.28) !important;
    padding: 0 !important;
    animation: none !important;
    transform: translateY(14px) scale(.94);
    opacity: 0;
    transition: transform .36s cubic-bezier(.16,.9,.26,1), opacity .26s linear;
}
html.is-mobile .modal-overlay.m-sheet.m-center.m-on .modal-content { transform: none; opacity: 1; }
/* الإغلاق حركة مفتاحية لا انتقال: التطبيق يخفي الطبقة قبل أن نعيد كشفها،
   والانتقال لا يبدأ على عنصر كان مخفياً فتختفي النافذة فجأة. حركة مفتاحية
   تبدأ من أول إطار مع إعادة الكشف وتتدرج حتى التلاشي. */
@keyframes mTxOut {
    0% { transform: none; opacity: 1; }
    100% { transform: translateY(22px) scale(.955); opacity: 0; }
}
html.is-mobile .modal-overlay.m-sheet.m-center.m-closing .modal-content {
    transform: translateY(22px) scale(.955);
    opacity: 0;
    animation: mTxOut .52s cubic-bezier(.45,.06,.62,.2) both !important;
}
html.is-mobile .m-tx-modal .modal-header-sticky {
    flex: none;
    padding: 14px 54px 6px 16px !important;
    background: none !important;
    border: none !important;
    border-radius: 22px 22px 0 0;
}
html.is-mobile .m-tx-modal .modal-title {
    position: static !important;
    margin: 0 !important;
    padding: 0 !important;
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    font-size: 15.5px !important;
    font-weight: 900 !important;
    color: #eaf3ff !important;
    text-align: right !important;
}
html.is-mobile .m-tx-modal .modal-body-scrollable {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
    padding: 2px 14px 10px !important;
    background: transparent !important;
}
html.is-mobile #drill-cart-info {
    background:
        linear-gradient(158deg, rgba(196,226,255,.10), rgba(150,200,255,.02)),
        rgba(17,36,68,.62) !important;
    border: 1px solid rgba(158,206,255,.18) !important;
    border-radius: 14px !important;
    padding: 12px 13px !important;
    margin-bottom: 12px !important;
    font-size: 12.5px !important;
    line-height: 1.55 !important;
    color: #dbe9ff !important;
}
html.is-mobile #drill-cart-info > div { border-bottom-color: rgba(160,210,255,.22) !important; }
html.is-mobile #drill-cart-info p { margin: 4px 0 !important; }
html.is-mobile #modal-transaction-details .cart-table {
    display: block !important;
    width: 100% !important;
    border: none !important;
    border-collapse: separate !important;
    white-space: normal !important;
    margin: 0 !important;
    background: transparent !important;
}
html.is-mobile #modal-transaction-details .cart-table thead { display: none !important; }
html.is-mobile #modal-transaction-details .cart-table tbody { display: block !important; width: 100% !important; }
html.is-mobile #modal-transaction-details .cart-table tbody tr {
    display: grid !important;
    grid-template-columns: minmax(0,1fr) auto !important;
    grid-template-rows: auto auto !important;
    gap: 4px 10px !important;
    margin: 0 0 7px !important;
    padding: 10px 12px !important;
    border: 1px solid rgba(158,206,255,.14) !important;
    border-radius: 12px !important;
    background: linear-gradient(160deg, rgba(196,226,255,.08), rgba(150,200,255,.02)) !important;
    box-shadow: inset 0 1px 0 rgba(196,232,255,.10) !important;
}
html.is-mobile #modal-transaction-details .cart-table tbody td {
    display: block !important;
    min-width: 0 !important;
    padding: 0 !important;
    border: none !important;
    text-align: right !important;
    background: transparent !important;
    font-size: 12.5px !important;
    line-height: 1.35 !important;
}
html.is-mobile #modal-transaction-details .cart-table td:nth-child(1) {
    grid-column: 1 !important; grid-row: 1 !important;
    font-weight: 800 !important;
    color: #eef6ff !important;
}
html.is-mobile #modal-transaction-details .cart-table td:nth-child(2) {
    grid-column: 1 !important; grid-row: 2 !important;
    font-size: 10.5px !important;
    color: var(--m-muted) !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
html.is-mobile #modal-transaction-details .cart-table td:nth-child(3) {
    grid-column: 2 !important; grid-row: 1 !important;
    justify-self: end;
    font-weight: 900 !important;
}
html.is-mobile #modal-transaction-details .cart-table td:nth-child(3)::before {
    content: "×"; margin-inline-end: 2px; font-size: 10px; opacity: .7;
}
html.is-mobile #modal-transaction-details .cart-table td:nth-child(4) {
    grid-column: 2 !important; grid-row: 2 !important;
    justify-self: end;
    font-weight: 900 !important;
    color: #eaf3ff !important;
    font-variant-numeric: tabular-nums;
}
html.is-mobile #modal-transaction-details .cart-table td:nth-child(4)::after {
    content: " د.ع"; font-size: 10px; font-weight: 700; color: var(--m-muted);
}
html.is-mobile .m-tx-empty {
    display: none;
    flex-direction: column; align-items: center; gap: 10px;
    padding: 26px 0 20px;
    color: var(--m-faint); font-size: 12.5px; font-weight: 800;
}
html.is-mobile .m-tx-empty i { font-size: 26px; opacity: .5; }

/* أزرار الإغلاق داخل هذه النوافذ: ثابتة في التذييل، ولا تُغطى بحافة الشاشة */
html.is-mobile .modal-overlay .modal-content.m-exp-modal .modal-actions,
html.is-mobile .modal-overlay .modal-content.m-day-modal .modal-actions,
html.is-mobile .modal-overlay .modal-content.m-tx-modal .modal-actions {
    flex: none;
    margin: 0 !important;
    padding: 10px 14px calc(12px + env(safe-area-inset-bottom)) !important;
    border-top: 1px solid rgba(160,210,255,.14) !important;
    background: linear-gradient(to top, rgba(15,32,62,.97) 42%, rgba(15,32,62,0)) !important;
}
html.is-mobile .m-tx-modal .modal-actions { padding-bottom: 14px !important; }
/* شرائط التمرير الذهبية/الزرقاء القديمة تظهر كخط غريب على حافة الورقة */
html.is-mobile .m-exp-body,
html.is-mobile .m-exp-modal .modal-content,
html.is-mobile #modal-daily-transactions .modal-body-scrollable,
html.is-mobile .m-day-modal .modal-content,
html.is-mobile .m-tx-modal .modal-body-scrollable,
html.is-mobile .m-tx-modal .modal-content {
    scrollbar-width: none;
}
html.is-mobile .m-exp-body::-webkit-scrollbar,
html.is-mobile .m-exp-modal .modal-content::-webkit-scrollbar,
html.is-mobile #modal-daily-transactions .modal-body-scrollable::-webkit-scrollbar,
html.is-mobile .m-day-modal .modal-content::-webkit-scrollbar,
html.is-mobile .m-tx-modal .modal-body-scrollable::-webkit-scrollbar,
html.is-mobile .m-tx-modal .modal-content::-webkit-scrollbar {
    width: 0; height: 0; display: none;
}

/* ------------------------- شاشة الدخول والقفل ------------------------- */
html.is-mobile {
    --m-blue-1: #4da3ff;
    --m-blue-2: #38bdf8;
    --m-cyan: #22d3ee;
    --m-green-1: #22c55e;
    --m-green-2: #4ade80;
    --m-red-1: #fb7185;
    --m-lk-glass: rgba(255,255,255,.045);
    --m-lk-rim-inset: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(255,255,255,.035);
    --m-lk-num: "Outfit", "Cairo", -apple-system, "Segoe UI", system-ui, sans-serif;
    --m-lk-neon-a: #38bdf8;
    --m-lk-neon-b: #4da3ff;
    --m-lk-neon-speed: 5s;
    --m-lk-bg-speed: 22s;
    /* 18px لا 26px: كل بكسل زائد فيBlur يُدفع كل إطار لأن المشهد خلف البطاقة يتحرك */
    --m-lk-blur: 18px;
    --m-lk-flow: 6.5s;
    --m-lk-blue-flow: linear-gradient(112deg, #4da3ff, #38bdf8 24%, #22d3ee 44%, #7dd3fc 62%, #4da3ff 82%, #38bdf8);
    --m-lk-go-flow: linear-gradient(115deg, #2b7fd0, #38bdf8 20%, #67e8f9 40%, #4da3ff 58%, #22d3ee 76%, #2b7fd0);
}
html.is-mobile #modal-admin-login.m-lock-screen {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9800;
    align-items: center;
    justify-content: center;
    padding: max(12px, env(safe-area-inset-top)) 14px max(12px, env(safe-area-inset-bottom));
    overflow: hidden;
    touch-action: manipulation;
    background: #02040a;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}
html.is-mobile #modal-admin-login.m-lock-screen .modal-content {
    position: relative;
    width: 100% !important;
    max-width: none !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    animation: none !important;
}
/* أثناء المؤثر: البطاقة الحقيقية ومشهدها كلاهما مرئي بلا طائل. الطبقتان
   المتحركتان معاً هما ما يُسقط اللقطة عند الرقم الرابع، فنُخفي الأصل
   visibility لا display: التخطيط يبقى صحيحاً لكل من يقيسه. */
html.is-mobile body.m-lk-busy #modal-admin-login .m-lk-shell,
html.is-mobile body.m-lk-busy #modal-admin-login .m-lk-scene { visibility: hidden; }
/* الشاشة التي تُبنى خلف الستار لا يراها أحد: نوقف رسمها ولا نوقف قياسها */
html.is-mobile body.m-lk-busy .admin-section,
html.is-mobile body.m-lk-busy .m-head,
html.is-mobile body.m-lk-busy #mobile-bottom-nav { visibility: hidden; }

html.is-mobile .m-lk-scene {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    background:
        radial-gradient(90% 55% at 50% 110%, rgba(11,42,92,.20), transparent 68%),
        linear-gradient(160deg, #02040a, #030712 58%, #02040a);
}
html.is-mobile .m-lk-scene i {
    position: absolute;
    display: block;
    pointer-events: none;
}
html.is-mobile .m-lk-scene i:nth-child(1) {
    left: -42%; top: -18%; width: 125%; height: 72%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(10,26,58,.88), rgba(6,18,38,.28) 48%, transparent 72%);
    animation: mLkDrift1 var(--m-lk-bg-speed) ease-in-out infinite alternate;
}
html.is-mobile .m-lk-scene i:nth-child(2) {
    right: -48%; top: 20%; width: 130%; height: 74%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(11,42,92,.52), rgba(6,18,38,.16) 50%, transparent 72%);
    animation: mLkDrift2 calc(var(--m-lk-bg-speed) * 1.27) ease-in-out infinite alternate;
}
html.is-mobile .m-lk-scene i:nth-child(3) {
    left: -26%; bottom: -34%; width: 128%; height: 70%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(8,31,68,.58), rgba(4,12,28,.12) 52%, transparent 74%);
    animation: mLkDrift3 calc(var(--m-lk-bg-speed) * .82) ease-in-out infinite alternate;
}
html.is-mobile .m-lk-scene i:nth-child(4) {
    inset: -12%;
    background:
        radial-gradient(70% 24% at 18% 42%, rgba(56,189,248,.07), transparent 68%),
        radial-gradient(58% 20% at 82% 68%, rgba(77,163,255,.065), transparent 70%);
    animation: mLkBreathe calc(var(--m-lk-bg-speed) * .64) ease-in-out infinite alternate;
}
html.is-mobile .m-lk-scene i:nth-child(5) {
    left: -48%; top: 6%; width: 196%; height: 88%;
    background:
        linear-gradient(112deg, transparent 26%, rgba(255,255,255,.018) 34%, rgba(56,189,248,.12) 35%, rgba(255,255,255,.20) 35.3%, rgba(11,42,92,.10) 36%, transparent 44%),
        linear-gradient(112deg, transparent 48%, rgba(255,255,255,.025) 55%, rgba(56,189,248,.10) 56%, rgba(255,255,255,.15) 56.3%, transparent 64%),
        linear-gradient(112deg, transparent 66%, rgba(255,255,255,.018) 72%, rgba(77,163,255,.08) 73%, transparent 82%);
    animation: mLkRibbon calc(var(--m-lk-bg-speed) * 1.15) ease-in-out infinite alternate;
}
html.is-mobile .m-lk-scene i:nth-child(6) {
    left: -36%; top: -20%; width: 172%; height: 140%;
    background:
        repeating-linear-gradient(118deg, transparent 0 72px, rgba(255,255,255,.018) 73px, transparent 74px 116px),
        repeating-linear-gradient(62deg, transparent 0 148px, rgba(56,189,248,.032) 149px, transparent 150px 240px);
    animation: mLkGridDrift calc(var(--m-lk-bg-speed) * 1.4) ease-in-out infinite alternate;
}
html.is-mobile .m-lk-scene::after,
html.is-mobile .m-lk-card::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: .034;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}
html.is-mobile .m-lk-card::after { z-index: 0; border-radius: inherit; }
@keyframes mLkDrift1 { to { transform: translate3d(9%, 7%, 0) scale(1.08); } }
@keyframes mLkDrift2 { to { transform: translate3d(-11%, -6%, 0) scale(.94); } }
@keyframes mLkDrift3 { to { transform: translate3d(8%, -9%, 0) scale(1.1); } }
@keyframes mLkGridDrift { to { transform: translate3d(18px, -14px, 0); } }
@keyframes mLkRibbon { to { transform: translate3d(-3%, 2%, 0) rotate(1.5deg); } }
@keyframes mLkBreathe { from { opacity: .55; } to { opacity: 1; } }
@keyframes mLkSpin { to { transform: rotate(360deg); } }
@keyframes mCaret { 0%, 100% { opacity: 1; } 50% { opacity: .12; } }

/* تحيّة الوقت: سطر واحد هادئ فوق العنوان */
html.is-mobile .m-lk-hello {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin: 0 0 7px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .1px;
    color: rgba(186,220,250,.55);
    animation: mLkHelloIn .75s cubic-bezier(.2,.8,.3,1) .5s both;
}
html.is-mobile .m-lk-hello i {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(238,194,106,.9);
    box-shadow: 0 0 8px rgba(238,194,106,.55);
}
@keyframes mLkHelloIn { from { opacity: 0; transform: translate3d(0,7px,0); } to { opacity: 1; transform: none; } }

/* ذرّات ضوء صاعدة ببطء خلف البطاقة: عناصر 3px بلا blur، حركة transform وحدها */
html.is-mobile .m-lk-motes { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
html.is-mobile .m-lk-motes b {
    position: absolute;
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(186,230,255,.55);
    box-shadow: 0 0 9px rgba(125,211,252,.35);
    opacity: 0;
    animation: mLkMote 16s linear infinite;
}
html.is-mobile .m-lk-motes b:nth-child(1) { left: 9%;  top: 78%; animation-delay: -1s;  animation-duration: 17s; }
html.is-mobile .m-lk-motes b:nth-child(2) { left: 22%; top: 64%; animation-delay: -6s;  animation-duration: 19s; width: 2px; height: 2px; }
html.is-mobile .m-lk-motes b:nth-child(3) { left: 78%; top: 72%; animation-delay: -3s;  animation-duration: 16s; }
html.is-mobile .m-lk-motes b:nth-child(4) { left: 88%; top: 56%; animation-delay: -9s;  animation-duration: 21s; width: 2px; height: 2px; }
html.is-mobile .m-lk-motes b:nth-child(5) { left: 66%; top: 84%; animation-delay: -12s; animation-duration: 18s; }
html.is-mobile .m-lk-motes b:nth-child(6) { left: 34%; top: 88%; animation-delay: -5s;  animation-duration: 20s; width: 4px; height: 4px; }
html.is-mobile .m-lk-motes b:nth-child(7) { left: 52%; top: 92%; animation-delay: -14s; animation-duration: 22s; width: 2px; height: 2px; }
@keyframes mLkMote {
    0%   { transform: translate3d(0, 24px, 0) scale(.65); opacity: 0; }
    10%  { opacity: .5; }
    55%  { opacity: .7; transform: translate3d(9px, -46vh, 0) scale(1); }
    90%  { opacity: 0; }
    100% { transform: translate3d(-8px, -92vh, 0) scale(.8); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-lk-hello { animation: none; }
    html.is-mobile .m-lk-motes { display: none; }
}

html.is-mobile .m-lk-shell {
    position: relative;
    z-index: 2;
    width: min(90vw, 360px);
    margin: 0 auto;
    border-radius: 26px;
    box-shadow: 0 28px 70px rgba(0,0,0,.58), 0 4px 18px rgba(0,0,0,.34);
}
html.is-mobile .m-lk-card {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 18px 22px 20px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 26px;
    text-align: center;
    background:
        linear-gradient(135deg, rgba(255,255,255,.065), rgba(255,255,255,.018) 48%, rgba(255,255,255,.035)),
        var(--m-lk-glass);
    -webkit-backdrop-filter: blur(var(--m-lk-blur)) saturate(180%);
    backdrop-filter: blur(var(--m-lk-blur)) saturate(180%);
    box-shadow: var(--m-lk-rim-inset), inset 0 0 0 1px rgba(255,255,255,.025);
}
html.is-mobile .m-lk-card::before {
    content: "";
    position: absolute;
    z-index: 0;
    top: -80%;
    bottom: -80%;
    left: -65%;
    width: 48%;
    pointer-events: none;
    opacity: .42;
    transform: rotate(18deg);
    /* طبقته الخاصة: بلا هذا السطر يُرسم وجه البطاقة كله في كل إطار لمسه */
    will-change: transform;
    backface-visibility: hidden;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.075), transparent);
    animation: mLkSheen calc(var(--m-lk-bg-speed) * .72) ease-in-out infinite alternate;
}
@keyframes mLkSheen { to { transform: translate3d(310%, 0, 0) rotate(18deg); opacity: .2; } }
html.is-mobile .m-lk-card > * { position: relative; z-index: 1; }

html.is-mobile .m-lk-neon,
html.is-mobile .m-otp-neon,
html.is-mobile .m-lk-core-neon {
    position: absolute;
    inset: -1px;
    z-index: 4;
    padding: 1.5px;
    border-radius: inherit;
    pointer-events: none;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}
html.is-mobile .m-lk-neon::before,
html.is-mobile .m-otp-neon::before,
html.is-mobile .m-lk-core-neon::before {
    content: "";
    position: absolute;
    /* -60% لا -120%: تكفي لتغطية أركان البطاقة أثناء الدوران، وتختصر
       مساحة التدرّج المخروطي المرسومة في كل إطار إلى النصف تقريباً */
    inset: -60%;
    background: conic-gradient(from 0deg, transparent 0deg 268deg, color-mix(in srgb, var(--m-lk-neon-a) 12%, transparent) 282deg, var(--m-lk-neon-a) 318deg, var(--m-lk-neon-b) 334deg, transparent 350deg 360deg);
    animation: mLkSpin var(--m-lk-neon-speed) linear infinite;
}
html.is-mobile .m-lk-neon { border-radius: 27px; opacity: .9; }

html.is-mobile .m-lk-chip {
    width: 46px;
    height: 46px;
    margin-bottom: 7px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    background: rgba(255,255,255,.045);
    box-shadow: var(--m-lk-rim-inset), inset 0 0 18px rgba(56,189,248,.035);
}
html.is-mobile .m-lk-chip svg { width: 21px; height: 21px; display: block; overflow: visible; }
html.is-mobile .m-lk-chip svg path,
html.is-mobile .m-lk-chip svg circle { fill: none; stroke: #f5f9ff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
html.is-mobile .m-lk-chip .m-shield { display: none; }
html.is-mobile .m-lk-card .modal-title {
    display: block;
    margin: 0 0 6px !important;
    padding: 0 !important;
    font-size: 22px !important;
    font-weight: 700 !important;
    line-height: 1.4;
    color: #f4f8ff;
    text-shadow: 0 1px 2px rgba(0,0,0,.48);
    transition: opacity .3s ease;
}
html.is-mobile .m-lk-card .modal-title > i { display: none; }
html.is-mobile .m-lk-word { display: inline-block; }
/* التدرّج الجري: صورة أعرض من الكلام ونزحلقها بمقدار صورتها تماماً، فلا قفزة
   عند نهاية الدورة. أول اللون وآخره واحد، والممسوحة على النص وحدها تُرسم. */
html.is-mobile .m-lk-key {
    background-image: var(--m-lk-blue-flow);
    background-size: 260% 100%;
    background-repeat: repeat;
    animation: mLkKeyFlow var(--m-lk-flow) linear infinite;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    text-shadow: none !important;
}
html.is-mobile .m-lk-key.ok {
    background-image: linear-gradient(100deg, #86efac, #22c55e 26%, #4ade80 52%, #22c55e 78%, #86efac);
}
@keyframes mLkKeyFlow { to { background-position: -260% 50%; } }
html.is-mobile .m-lk-sub {
    margin: 0 0 22px !important;
    font-size: 12.5px;
    line-height: 1.65;
    font-weight: 400;
    color: rgba(213,227,245,.62);
    transition: opacity .3s ease, transform .42s cubic-bezier(.2,.8,.3,1);
}
html.is-mobile .m-lk-live { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); }
html.is-mobile .m-lk-err {
    min-height: 18px;
    margin: 7px 0 0;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--m-red-1);
    opacity: 0;
    transition: opacity .24s ease;
}
html.is-mobile .m-lk-err.on { opacity: 1; }
/* سطر العدّاد: نفس الشريط المحجوز، بلا أي قفزة في التخطيط */
html.is-mobile .m-lk-err.cool {
    color: #fcd34d;
    text-shadow: 0 0 12px rgba(251,191,36,.28);
}

html.is-mobile .m-lk-card .input-group { width: 100%; margin: 0 !important; position: relative; }
html.is-mobile .m-lk-card .input-group label { display: none; }
html.is-mobile .m-otp {
    position: relative;
    direction: ltr;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 56px));
    width: fit-content;
    margin: 0 auto;
    gap: 12px;
    z-index: 1;
}
html.is-mobile .m-otp b {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 58px;
    aspect-ratio: 1 / 1.04;
    margin: 0;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 18px;
    font-family: var(--m-lk-num);
    font-size: 26px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    color: #ffffff;
    background: rgba(255,255,255,.042);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.17), inset 0 -10px 22px rgba(3,10,22,.10);
}
html.is-mobile .m-lk-fx .m-otp b { will-change: transform, opacity; }
html.is-mobile .m-otp b u { display: block; text-decoration: none; text-shadow: 0 0 16px rgba(255,255,255,.16); }
/* حلقة الرقم الداخل: طبقة شفافة تتوسّع وتخبو. transform وopacity وحدهما،
   فلا إعادة رسم لمربع ولا قفل للخيّاط في إطاره. */
html.is-mobile .m-otp b::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1.5px solid rgba(125,211,252,.8);
    opacity: 0;
    pointer-events: none;
}
/* اسمان يتبادلانه:إعادة تشغيل الحركة بلا قراءة تخطيط تُجبر المتصفح على الحساب */
html.is-mobile .m-otp b.pa::after,
html.is-mobile .m-otp b.pb::after { animation: mLkRing 520ms var(--m-ease-out) both; }
@keyframes mLkRing {
    from { opacity: .6; transform: scale(.9); }
    to { opacity: 0; transform: scale(1.34); }
}
/* الهالة خلف المربّع: ضوء مُعدّ سلفاً في gradient، لا blur ولا box-shadow
   متحرّك — يبقى الرسم على طبقة واحدة ويمشي الخيّاط على transform وحده */
html.is-mobile .m-otp-glow {
    position: absolute;
    inset: -11px;
    z-index: -1;
    border-radius: 28px;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(closest-side,
        rgba(125,211,252,.42), rgba(56,189,248,.18) 54%, rgba(56,189,248,0) 76%);
    will-change: transform, opacity;
}
html.is-mobile .m-otp b.filled { background: rgba(255,255,255,.068); border-color: rgba(255,255,255,.20); }
html.is-mobile .m-otp b.bad { --m-lk-neon-a: #fb7185; --m-lk-neon-b: #f43f5e; border-color: rgba(251,113,133,.72); }
html.is-mobile .m-otp-glide {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 3;
    border-radius: 18px;
    pointer-events: none;
    will-change: transform, opacity;
    transition: opacity .24s ease;
}
html.is-mobile .m-otp-glide.off { opacity: 0; }
html.is-mobile .m-otp-neon { inset: 0; border-radius: 18px; }
html.is-mobile .m-otp-caret {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 1.5px;
    height: 25px;
    margin: -12.5px 0 0 -.75px;
    border-radius: 2px;
    background: #dff5ff;
    box-shadow: 0 0 9px rgba(56,189,248,.65);
    animation: mCaret 1s ease-in-out infinite;
}
html.is-mobile .m-otp-glide.hide-caret .m-otp-caret { opacity: 0; }
html.is-mobile .input-group .m-otp-input {
    position: absolute !important;
    left: 0 !important; right: 0 !important; top: 0 !important; bottom: 0 !important;
    width: 100% !important; height: 100% !important;
    min-height: 0 !important;
    padding: 0 !important; margin: 0 !important;
    border: none !important;
    border-radius: 18px !important;
    background: transparent !important;
    box-shadow: none !important;
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
    caret-color: transparent !important;
    direction: ltr;
    font-size: 16px !important;
    z-index: 4;
}

html.is-mobile .m-pad {
    position: relative;
    z-index: 1;
    direction: ltr;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    width: 100%;
    max-width: 272px;
    margin: 13px auto 0;
}
html.is-mobile .m-pad button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: clamp(43px, 6.1vh, 52px);
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.11);
    border-radius: 18px;
    font-family: var(--m-lk-num);
    font-size: 23px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    color: #f8fbff;
    background: rgba(255,255,255,.038);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.15), inset 0 -10px 20px rgba(2,8,18,.09);
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
    cursor: pointer;
    transition: color .32s ease, border-color .32s ease, background-color .32s ease;
}
html.is-mobile .m-pad button > span {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}
html.is-mobile .m-pad button::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    background: radial-gradient(90% 90% at 50% 20%, rgba(74,222,128,.32), rgba(34,197,94,.10) 62%, transparent);
    transition: opacity .46s ease;
}
html.is-mobile .m-pad button.on {
    z-index: 3;
    color: #dcfce7;
    border-color: rgba(74,222,128,.92);
    text-shadow: 0 0 13px rgba(74,222,128,.82);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.30), 0 0 18px rgba(34,197,94,.16);
    transition: none;
}
html.is-mobile .m-pad button.on::before { opacity: 1; transition: opacity .04s linear; }
html.is-mobile .m-pad button.fn { font-size: 13px; color: rgba(213,227,245,.66); }
html.is-mobile .m-pad button.fn svg { width: 23px; height: 23px; display: block; }
html.is-mobile .m-pad button.fn::before { background: radial-gradient(90% 90% at 50% 20%, rgba(56,189,248,.30), rgba(77,163,255,.09) 62%, transparent); }
html.is-mobile .m-pad button.fn.on { color: #e0f2fe; border-color: rgba(56,189,248,.92); text-shadow: 0 0 12px rgba(56,189,248,.8); }
html.is-mobile .m-pad .m-rp {
    position: absolute;
    z-index: 1;
    width: 150%;
    aspect-ratio: 1;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255,255,255,.34), transparent 64%);
}
/* بعد سحب زر المسح يبقى الصفر في الوسط وعلامة الحذف في موضعها السابق،
   وتلميح المصباح يأخذ الخلية الشاغبة إلى جواره */
html.is-mobile .m-pad button[data-k="0"] { grid-column: 2; }
html.is-mobile .m-pad button[data-k="del"] { grid-column: 3; }
html.is-mobile .m-pad button[data-k="hint"] { grid-column: 1; }
html.is-mobile .m-pad button.bulb {
    color: rgba(196,213,236,.34);
    border-color: rgba(255,255,255,.07);
}
html.is-mobile .m-pad button.bulb::before {
    background: radial-gradient(90% 90% at 50% 20%, rgba(251,191,36,.30), rgba(245,158,11,.09) 62%, transparent);
}
/* اللمبة مطفأة: هالة شاحبة لا تُلمس. تتقدّ من تلقاء نفسها حين تتكاثر الأخطاء */
html.is-mobile .m-pad button.bulb::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(62% 62% at 50% 34%, rgba(251,191,36,.26), transparent 72%);
}
html.is-mobile .m-pad button.bulb.lit {
    color: rgba(253,224,171,.9);
    border-color: rgba(251,191,36,.34);
}
html.is-mobile .m-pad button.bulb.lit::after {
    opacity: 1;
    animation: mLkBulbPulse 2.6s ease-in-out infinite;
}
html.is-mobile .m-pad button.bulb.on {
    color: #fef3c7;
    border-color: rgba(251,191,36,.9);
    text-shadow: 0 0 12px rgba(251,191,36,.75);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.28), 0 0 18px rgba(251,191,36,.18);
}
/* وهجة الاشتعال: طبقة واحدة داخل الزر تُنسخ مرة وتُحرك، لا ظل متحرك */
html.is-mobile .m-pad .m-bulb-flare {
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(58% 58% at 50% 40%, rgba(253,224,171,.92), rgba(251,191,36,.34) 58%, transparent 78%);
}
@keyframes mLkBulbPulse {
    0%, 100% { opacity: .34; }
    50% { opacity: .9; }
}
/* اللوحة خاملة والعدّاد جارٍ: الأرقام مُطفأة واللمبة وحدها حيّة */
html.is-mobile .m-pad.cooling button:not(.bulb) {
    opacity: .34;
    transition: opacity .26s ease;
}
html.is-mobile .m-pad.cooling button.bulb:not(.lit) {
    opacity: .5;
}

/* فقاعة التلميح تقف فوق مربّعات الرقم — الممرّ تحتها صار للعدّاد وحده.
   موضعها مطلق داخل صفّ المربّعات (position:relative) فلا يزيح سطراً ولا
   يعيد قياس، وسطر الشرح يُطفأ أثناء ظهورها حتى لا يقف نصّ خلفها. */
html.is-mobile .m-lk-tip {
    position: absolute;
    bottom: calc(100% + 13px);
    left: 50%;
    z-index: 6;
    direction: rtl;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 100%;
    padding: 10px 18px 11px;
    border-radius: 18px;
    border: 1px solid rgba(251,191,36,.34);
    background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 46%), rgba(26,18,6,.66);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 12px 26px rgba(2,8,18,.52), 0 0 20px rgba(251,191,36,.14);
    color: #fde68a;
    font-size: 19px;
    line-height: 1.25;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    overflow: hidden;
    transform: translate3d(-50%, 10px, 0) scale(.9);
    /* منحنى يتجاوز الهدف ثم يرتد: الفقاعة تُقذف إلى عينك لا تنزلق */
    transition: opacity .26s ease, transform .5s cubic-bezier(.16,1.16,.3,1);
}
html.is-mobile .m-lk-tip.on {
    opacity: 1;
    transform: translate3d(-50%, 0, 0) scale(1);
}
/* مسحة ضوء تمرّ على الفقاعة مرة واحدة عند إقلاعها: داخل حدودها المغلقة
   فلا شريط ضوء يمشي فوق اللوحة */
html.is-mobile .m-lk-tip::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    background: linear-gradient(100deg, transparent 38%, rgba(255,244,214,.30) 50%, transparent 62%);
}
html.is-mobile .m-lk-tip.on::after { animation: mLkTipSweep 900ms cubic-bezier(.3,.7,.3,1) 140ms both; }
@keyframes mLkTipSweep {
    from { opacity: .9; transform: translate3d(-108%,0,0); }
    to { opacity: 0; transform: translate3d(108%,0,0); }
}
/* لا نصّ خلف الفقاعة: الشرح يَنطفئ وهي ظاهرة، ويرجع بهدوء بعدها.
   «!important» لأن حركة الإقلاع تترك على العنصر شفّية مضمّنة في
   style السطر، والكلاس وحده لا يرفعها */
html.is-mobile .m-lk-card.tip-live .m-lk-sub { opacity: 0 !important; transform: translate3d(0,-4px,0) !important; }
/* strong لا b: الفقاعة صارت داخل صفّ المربّعات، و«b» كانت تُحسب مربعاً خامساً */
html.is-mobile .m-lk-tip strong { font-weight: 800; color: #fff4d1; }
html.is-mobile .m-lk-tip .m-lk-tip-tag {
    font-size: 13px;
    font-weight: 800;
    padding: 4px 11px 5px;
    border-radius: 10px;
    background: rgba(251,191,36,.15);
    border: 1px solid rgba(251,191,36,.28);
    color: #fcd34d;
}

html.is-mobile .m-lk-card .modal-actions {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 14px;
    padding: 0 !important;
    position: static !important;
    background: none !important;
}
/* زر الدخول: زجاج فوق تدرّج أزرق جارٍ ومسحة ضوء تدور عليه. الحركة كلها في
   الطبقتين الشبهيتين، والزر نفسه لا يُلمس تخطيطياً. لاBlur فوق البطاقة
   المزجّجة: blur داخل blur هو أغلى ما في الشاشة على معالج الرسوم. */
html.is-mobile .m-lk-card .modal-actions .btn-confirm {
    position: relative;
    isolation: isolate;
    flex: 0 0 auto;
    width: min(100%, 200px);
    min-height: 46px;
    margin: 0;
    padding: 0 16px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(148,220,255,.34) !important;
    border-radius: 17px !important;
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 800;
    letter-spacing: .3px;
    color: #f4fdff !important;
    background: linear-gradient(180deg, rgba(255,255,255,.24), rgba(255,255,255,0) 44%), rgba(9,19,33,.5) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.34), inset 0 -1px 0 rgba(255,255,255,.05), 0 12px 26px rgba(2,8,18,.5), 0 0 20px rgba(56,189,248,.12) !important;
    text-shadow: 0 1px 2px rgba(3,12,24,.55);
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    cursor: pointer;
    transition: transform .2s var(--m-ease-out), border-color .3s ease, box-shadow .3s ease, opacity .3s ease;
}
html.is-mobile .m-lk-card .modal-actions .btn-confirm::after {
    content: "";
    position: absolute;
    z-index: 0;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background-image: var(--m-lk-go-flow);
    background-size: 300% 100%;
    opacity: .58;
    animation: mLkGoFlow var(--m-lk-flow) linear infinite;
    transition: opacity .34s ease;
}
html.is-mobile .m-lk-card .modal-actions .btn-confirm::before {
    content: "";
    position: absolute;
    z-index: 1;
    top: -70%;
    bottom: -70%;
    left: -30%;
    width: 30%;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.26), rgba(190,238,255,.4), rgba(255,255,255,.1), transparent);
    transform: translate3d(-160%, 0, 0) rotate(14deg);
    will-change: transform;
    animation: mLkGoSweep 4.2s cubic-bezier(.45, 0, .55, 1) infinite;
}
html.is-mobile .m-lk-card .modal-actions .btn-confirm > span { position: relative; z-index: 2; }
@keyframes mLkGoFlow { to { background-position: -300% 50%; } }
@keyframes mLkGoSweep {
    0%, 52% { transform: translate3d(-160%, 0, 0) rotate(14deg); }
    100% { transform: translate3d(560%, 0, 0) rotate(14deg); }
}
html.is-mobile .m-lk-card .modal-actions .btn-confirm.armed {
    border-color: rgba(186,240,255,.6) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.42), 0 14px 30px rgba(2,8,18,.52), 0 0 26px rgba(56,189,248,.22) !important;
}
html.is-mobile .m-lk-card .modal-actions .btn-confirm.armed::after { opacity: .92; }
html.is-mobile .m-lk-card .modal-actions .btn-confirm:active { opacity: 1; transform: scale(.962); }
html.is-mobile .m-lk-card .modal-actions button:disabled { opacity: .45; }
/* والانتظار يُهدّئ الزرّ: تدرّجه ومسحة ضوئه يتوقفان — وهما أغلى ما يرسم
   كل إطار في الشاشة — ويمرّ فوقهما شريط ينقص حتى ينفد الوقت */
html.is-mobile .m-lk-card .modal-actions .btn-confirm.cool {
    opacity: .66;
    border-color: rgba(148,220,255,.18) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 8px 18px rgba(2,8,18,.42) !important;
}
html.is-mobile .m-lk-card .modal-actions .btn-confirm.cool::before,
html.is-mobile .m-lk-card .modal-actions .btn-confirm.cool::after {
    animation-play-state: paused;
    opacity: .16;
}
html.is-mobile .m-lk-cool-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    z-index: 2;
    pointer-events: none;
    transform-origin: right center;
    background: linear-gradient(90deg, rgba(34,211,238,.1), rgba(56,189,248,.85) 40%, rgba(125,211,252,.95));
    box-shadow: 0 0 12px rgba(56,189,248,.5);
    will-change: transform;
}
html.is-mobile .m-lk-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin: 7px 0 0;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .2px;
    color: rgba(213,227,245,.38);
}
html.is-mobile .m-lk-hint i { font-size: 10px; display: inline-block; color: rgba(56,189,248,.58); }

html.is-mobile .m-lk-fx {
    position: fixed;
    inset: 0;
    z-index: 12000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: max(12px, env(safe-area-inset-top)) 14px max(12px, env(safe-area-inset-bottom));
    overflow: hidden;
    pointer-events: none;
    background: #02040a;
    opacity: 1;
    transition: opacity .42s ease;
}
html.is-mobile .m-lk-fx.gone { opacity: 0; }
html.is-mobile .m-lk-fx canvas { position: fixed; pointer-events: none; z-index: 8; }
html.is-mobile .m-lk-stage-hidden { display: none !important; }
/* المسرح: ما يُكلّف رسماً في كل إطار يُطفأ أثناء الانتقالات. الخلفية معتمة
   وراء البطاقة، فالBlur لا يعطي فيها شيئاً غير الثمن. والحلقة الدوّارة
   أغلى عنصر في الشاشة: مساحتها كانت أضعاف البطاقة مرات. */
html.is-mobile .m-lk-fx .m-lk-card {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    contain: layout paint;
    background: linear-gradient(135deg, rgba(255,255,255,.075), rgba(255,255,255,.02) 48%, rgba(255,255,255,.042)), rgba(6,12,22,.74) !important;
}
html.is-mobile .m-lk-fx .m-lk-card::before,
html.is-mobile .m-lk-fx .m-lk-neon { display: none; }
/* هالة اللمبة النابضة لا تُورَّث للمسرح: إطار الاستلام أغلى ما في الحركة */
html.is-mobile .m-lk-fx .m-pad button.bulb::after { animation: none; opacity: .5; }
html.is-mobile .m-lk-fx .m-lk-shell.compact .m-lk-card { height: 100%; }
html.is-mobile .m-lk-fx .m-lk-shell.compact .modal-title {
    position: absolute;
    top: 38px;
    left: 16px;
    right: 16px;
    margin: 0 !important;
    font-size: 21px !important;
}
html.is-mobile .m-lk-fx .input-group.m-lk-stage-group { position: absolute; inset: 0; width: 100%; height: 100%; }
html.is-mobile .m-lk-fx .m-otp.m-lk-stage-row { position: absolute; inset: 0; display: block; width: 100%; height: 100%; margin: 0; }
html.is-mobile .m-lk-fx .m-otp b.m-lk-stage-cell { position: absolute; left: 0; top: 0; min-height: 0; aspect-ratio: auto; margin: 0; animation: none; }
html.is-mobile .m-lk-net { position: absolute; inset: 0; z-index: 4; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
html.is-mobile .m-lk-net path { fill: none; stroke: rgba(56,189,248,.82); stroke-width: 1.25; stroke-linecap: round; stroke-linejoin: round; }
html.is-mobile .m-lk-net circle { fill: #bae6fd; opacity: 0; }
html.is-mobile .m-lk-core {
    --m-lk-core-y: 52%;
    position: absolute;
    left: 50%;
    top: var(--m-lk-core-y);
    width: 56px;
    height: 56px;
    margin: -28px 0 0 -28px;
    z-index: 6;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 19px;
    background: rgba(255,255,255,.055);
    box-shadow: var(--m-lk-rim-inset), 0 10px 28px rgba(0,0,0,.26);
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
}
html.is-mobile .m-lk-core.ok { --m-lk-neon-a: #4ade80; --m-lk-neon-b: #22c55e; background: rgba(34,197,94,.075); border-color: rgba(74,222,128,.30); }
html.is-mobile .m-lk-core.bad { --m-lk-neon-a: #fb7185; --m-lk-neon-b: #f43f5e; background: rgba(244,63,94,.075); border-color: rgba(251,113,133,.36); }
html.is-mobile .m-lk-core-neon { inset: -1px; border-radius: 19px; }
html.is-mobile .m-lk-core svg { width: 29px; height: 29px; overflow: visible; }
html.is-mobile .m-lk-core .m-spin { fill: none; stroke: #bae6fd; stroke-width: 1.8; stroke-linecap: round; }
html.is-mobile .m-lk-core .m-tick { fill: none; stroke: #ecfdf5; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
html.is-mobile .m-lk-ring {
    position: absolute;
    left: 50%;
    top: var(--m-lk-core-y, 52%);
    width: 56px;
    height: 56px;
    margin: -28px 0 0 -28px;
    z-index: 5;
    border-radius: 19px;
    border: 1px solid rgba(74,222,128,.72);
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
}
html.is-mobile .m-lk-pill {
    position: absolute;
    left: 50%;
    bottom: 34px;
    z-index: 6;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border: 1px solid rgba(74,222,128,.26);
    border-radius: 99px;
    font-size: 11.5px;
    font-weight: 700;
    white-space: nowrap;
    color: #86efac;
    background: rgba(34,197,94,.055);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
    transform: translate3d(-50%, 10px, 0);
}
html.is-mobile .m-lk-pill svg { width: 13px; height: 13px; }
html.is-mobile .m-lk-pill svg path { fill: none; stroke: #4ade80; stroke-width: 2; stroke-linecap: round; }

@media (max-height: 700px) {
    html.is-mobile .m-lk-shell { width: min(88vw, 340px); }
    html.is-mobile .m-lk-card { padding: 13px 18px 13px; }
    html.is-mobile .m-lk-chip { width: 36px; height: 36px; margin-bottom: 4px; border-radius: 14px; }
    html.is-mobile .m-lk-card .modal-title { font-size: 19px !important; margin-bottom: 13px !important; }
    html.is-mobile .m-lk-sub { display: none; }
    html.is-mobile .m-otp { grid-template-columns: repeat(4, minmax(0, 50px)); gap: 10px; }
    html.is-mobile .m-otp b { min-height: 50px; border-radius: 16px; font-size: 23px; }
    html.is-mobile .m-otp-glide, html.is-mobile .m-otp-neon { border-radius: 16px; }
    html.is-mobile .m-pad { gap: 7px; margin-top: 10px; max-width: 252px; }
    html.is-mobile .m-pad button { height: 40px; border-radius: 15px; font-size: 20px; }
    html.is-mobile .m-lk-tip { font-size: 16px; padding: 7px 13px 8px; bottom: calc(100% + 9px); border-radius: 15px; }
    /* في هذا المقاس لا مساحة فوق المربّعات تكفي فقاعة وشروحها: العنوان يَنطفئ معها */
    html.is-mobile .m-lk-card.tip-live .modal-title { opacity: 0 !important; }
    html.is-mobile .m-lk-card .modal-actions { margin-top: 10px; }
    html.is-mobile .m-lk-card .modal-actions .btn-confirm { min-height: 40px; width: min(100%, 184px); }
    html.is-mobile .m-lk-hint { margin-top: 4px; }
}
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-lk-scene i,
    html.is-mobile .m-lk-card::before,
    html.is-mobile .m-lk-key,
    html.is-mobile .m-lk-card .modal-actions .btn-confirm::before,
    html.is-mobile .m-lk-card .modal-actions .btn-confirm::after,
    html.is-mobile .m-lk-neon::before,
    html.is-mobile .m-pad button.bulb.lit::after,
    html.is-mobile .m-otp-neon::before,
    html.is-mobile .m-lk-tip.on::after,
    html.is-mobile .m-lk-core-neon::before { animation: none !important; }
    html.is-mobile .m-otp-caret { animation: none; }
    html.is-mobile .m-lk-card .modal-actions .btn-confirm::before { opacity: 0; }
}

/* ====== شاشة القفل في الوضع النهاري: لؤلؤة فوق زرقة فاتحة ======
   كل سطر هنا تحت body.rg-light وحده: المشهد الليلي لا يُمَس بحرف. */
html.is-mobile body.rg-light #modal-admin-login.m-lock-screen { background: #e9f1fa; }
html.is-mobile body.rg-light .m-lk-scene {
    background:
        radial-gradient(90% 55% at 50% 110%, rgba(var(--rg-accent-rgb), .20), transparent 68%),
        linear-gradient(160deg, #f8fbff, #e7f0fa 58%, #f3f8fd);
}
html.is-mobile body.rg-light .m-lk-scene::after { opacity: .05; }
html.is-mobile body.rg-light .m-lk-scene i:nth-child(1) {
    background: radial-gradient(ellipse, rgba(255,255,255,.96), rgba(255,255,255,.34) 48%, transparent 72%);
}
html.is-mobile body.rg-light .m-lk-scene i:nth-child(2) {
    background: radial-gradient(ellipse, rgba(var(--rg-accent-rgb), .17), rgba(var(--rg-accent-rgb), .05) 50%, transparent 72%);
}
html.is-mobile body.rg-light .m-lk-scene i:nth-child(3) {
    background: radial-gradient(ellipse, rgba(var(--rg-accent-rgb), .13), rgba(255,255,255,.30) 52%, transparent 74%);
}
html.is-mobile body.rg-light .m-lk-scene i:nth-child(4) {
    background:
        radial-gradient(70% 24% at 18% 42%, rgba(var(--rg-accent-rgb), .10), transparent 68%),
        radial-gradient(58% 20% at 82% 68%, rgba(255,255,255,.60), transparent 70%);
}
html.is-mobile body.rg-light .m-lk-scene i:nth-child(5) {
    background:
        linear-gradient(112deg, transparent 26%, rgba(255,255,255,.55) 34%, rgba(var(--rg-accent-rgb), .18) 35%, rgba(255,255,255,.9) 35.3%, rgba(var(--rg-accent-rgb), .07) 36%, transparent 44%),
        linear-gradient(112deg, transparent 48%, rgba(255,255,255,.55) 55%, rgba(var(--rg-accent-rgb), .14) 56%, rgba(255,255,255,.85) 56.3%, transparent 64%),
        linear-gradient(112deg, transparent 66%, rgba(255,255,255,.45) 72%, rgba(var(--rg-accent-rgb), .10) 73%, transparent 82%);
}
html.is-mobile body.rg-light .m-lk-scene i:nth-child(6) {
    background:
        repeating-linear-gradient(118deg, transparent 0 72px, rgba(30,70,120,.05) 73px, transparent 74px 116px),
        repeating-linear-gradient(62deg, transparent 0 148px, rgba(var(--rg-accent-rgb), .08) 149px, transparent 150px 240px);
}
/* غبار ضوء أزرق أعمق: الذرّات الفاتحة تختفي على اللؤلؤ */
html.is-mobile body.rg-light .m-lk-motes b {
    background: rgba(47,127,208,.32);
    box-shadow: 0 0 8px rgba(47,127,208,.22);
}
html.is-mobile body.rg-light .m-lk-shell {
    box-shadow: 0 30px 70px rgba(28,62,110,.20), 0 4px 18px rgba(28,62,110,.10);
}
html.is-mobile body.rg-light .m-lk-card {
    border-color: rgba(255,255,255,.94);
    background:
        linear-gradient(135deg, rgba(255,255,255,.80), rgba(255,255,255,.42) 48%, rgba(255,255,255,.64)),
        rgba(255,255,255,.36);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.98), inset 0 0 0 1px rgba(255,255,255,.50), 0 0 0 1px rgba(30,70,120,.05);
}
html.is-mobile body.rg-light .m-lk-card::after { opacity: .025; }
html.is-mobile body.rg-light .m-lk-card::before {
    opacity: .62;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent);
}
html.is-mobile body.rg-light .m-lk-hello { color: rgba(38,78,128,.62); }
html.is-mobile body.rg-light .m-lk-card .modal-title { color: #0e2138; text-shadow: none; }
html.is-mobile body.rg-light .m-lk-key {
    background-image: linear-gradient(112deg, #1f5fae, #2f7fd0 24%, #1f8fb5 44%, #3a86c8 62%, #1f5fae 82%, #2f7fd0);
}
html.is-mobile body.rg-light .m-lk-sub { color: #47688c; }
html.is-mobile body.rg-light .m-lk-chip {
    border-color: rgba(30,70,120,.14);
    background: linear-gradient(160deg, rgba(255,255,255,.95), rgba(255,255,255,.62));
    box-shadow: inset 0 1px 0 #fff, 0 6px 16px rgba(28,62,110,.10);
}
html.is-mobile body.rg-light .m-lk-chip svg path,
html.is-mobile body.rg-light .m-lk-chip svg circle { stroke: #24466f; }
html.is-mobile body.rg-light .m-otp b {
    color: #13345e;
    background: rgba(255,255,255,.66);
    border-color: rgba(30,70,120,.16);
    box-shadow: inset 0 1px 0 #fff, inset 0 -10px 22px rgba(30,70,120,.05);
}
html.is-mobile body.rg-light .m-otp b u { text-shadow: none; }
html.is-mobile body.rg-light .m-otp b.filled { background: rgba(255,255,255,.92); border-color: rgba(30,90,160,.30); }
html.is-mobile body.rg-light .m-otp b.bad { color: #b91c3c; border-color: rgba(225,29,72,.60); }
html.is-mobile body.rg-light .m-otp-caret { background: #1a5fae; box-shadow: 0 0 9px rgba(56,189,248,.45); }
html.is-mobile body.rg-light .m-pad button {
    color: #16355c;
    border-color: rgba(30,70,120,.13);
    background: rgba(255,255,255,.58);
    box-shadow: inset 0 1px 0 #fff, inset 0 -10px 20px rgba(30,70,120,.05);
}
html.is-mobile body.rg-light .m-pad button.on {
    color: #0f5132;
    border-color: rgba(34,197,94,.85);
    text-shadow: none;
    box-shadow: inset 0 1px 0 #fff, 0 0 18px rgba(34,197,94,.18);
}
html.is-mobile body.rg-light .m-pad button.on::before {
    background: radial-gradient(90% 90% at 50% 20%, rgba(74,222,128,.24), rgba(34,197,94,.07) 62%, transparent);
}
html.is-mobile body.rg-light .m-pad button.fn { color: #5b7591; }
html.is-mobile body.rg-light .m-pad button.fn.on { color: #0b4a73; border-color: rgba(56,189,248,.85); text-shadow: none; }
html.is-mobile body.rg-light .m-pad button.fn::before {
    background: radial-gradient(90% 90% at 50% 20%, rgba(56,189,248,.20), rgba(77,163,255,.06) 62%, transparent);
}
html.is-mobile body.rg-light .m-pad button.bulb { color: rgba(60,95,135,.38); border-color: rgba(30,70,120,.09); }
html.is-mobile body.rg-light .m-pad button.bulb.lit { color: rgba(146,86,7,.9); border-color: rgba(245,158,11,.40); }
html.is-mobile body.rg-light .m-pad button.bulb.on {
    color: #7c4a03;
    border-color: rgba(245,158,11,.80);
    text-shadow: none;
    box-shadow: inset 0 1px 0 #fff, 0 0 18px rgba(245,158,11,.18);
}
html.is-mobile body.rg-light .m-lk-err { color: #cf3352; }
html.is-mobile body.rg-light .m-lk-err.cool { color: #a16207; text-shadow: none; }
html.is-mobile body.rg-light .m-lk-hint { color: rgba(58,92,132,.55); }
html.is-mobile body.rg-light .m-lk-hint i { color: rgba(30,110,180,.70); }
html.is-mobile body.rg-light .m-lk-card .modal-actions .btn-confirm {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.30), 0 12px 26px rgba(28,62,110,.28), 0 0 20px rgba(56,189,248,.12) !important;
}
html.is-mobile body.rg-light .m-lk-tip {
    border-color: rgba(217,152,20,.45);
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,249,235,.94));
    box-shadow: 0 12px 26px rgba(146,96,7,.18), inset 0 1px 0 #fff;
    color: #8a5a06;
}
html.is-mobile body.rg-light .m-lk-tip strong { color: #6b4400; }
html.is-mobile body.rg-light .m-lk-tip .m-lk-tip-tag {
    background: rgba(251,191,36,.22);
    border-color: rgba(217,152,20,.35);
    color: #8a5a06;
}
html.is-mobile body.rg-light .m-lk-tip::after {
    background: linear-gradient(100deg, transparent 38%, rgba(255,255,255,.90) 50%, transparent 62%);
}
/* مسرح النجاح والخطأ يستنسخ البطاقة نفسها: خلفيته الفاتحة تكفي ليبقى الانتقال
   بلا وميض ليلي، ونصوصه ترث قواعد الوضع النهاري أعلاه */
html.is-mobile body.rg-light .m-lk-fx {
    background:
        radial-gradient(90% 55% at 50% 110%, rgba(var(--rg-accent-rgb), .16), transparent 68%),
        linear-gradient(160deg, #f8fbff, #e7f0fa 58%, #f3f8fd);
}
html.is-mobile body.rg-light .m-lk-fx .m-lk-card {
    border-color: rgba(255,255,255,.95) !important;
    background: linear-gradient(135deg, rgba(255,255,255,.90), rgba(255,255,255,.60) 48%, rgba(255,255,255,.80)) !important;
    box-shadow: 0 26px 60px rgba(28,62,110,.22) !important;
}
html.is-mobile body.rg-light .m-lk-core {
    background: rgba(255,255,255,.75);
    border-color: rgba(30,70,120,.18);
    box-shadow: inset 0 1px 0 #fff, 0 10px 28px rgba(28,62,110,.16);
}
html.is-mobile body.rg-light .m-lk-core.ok { background: rgba(34,197,94,.14); border-color: rgba(34,197,94,.50); }
html.is-mobile body.rg-light .m-lk-core.bad { background: rgba(244,63,94,.12); border-color: rgba(244,63,94,.50); }
html.is-mobile body.rg-light .m-lk-core .m-spin { stroke: #2f7fd0; }
html.is-mobile body.rg-light .m-lk-core .m-tick { stroke: #0f5132; }
html.is-mobile body.rg-light .m-lk-net path { stroke: rgba(40,130,200,.72); }
html.is-mobile body.rg-light .m-lk-net circle { fill: #2f7fd0; }
html.is-mobile body.rg-light .m-lk-ring { border-color: rgba(34,197,94,.85); }
html.is-mobile body.rg-light .m-lk-pill {
    color: #15803d;
    border-color: rgba(34,197,94,.38);
    background: rgba(255,255,255,.72);
    box-shadow: inset 0 1px 0 #fff, 0 8px 20px rgba(28,62,110,.12);
}
html.is-mobile body.rg-light .m-lk-pill svg path { stroke: #16a34a; }

/* ------------------------- سحب للتحديث -------------------------
   حارس المطّ يمنع التمرير الأصلي عند الحدّ الأعلوي، فالشدّة كلها لنا:
   قرص زجاجي يهبط مع الإصبع وحلقة تقدّم، ثم يدور عند الإفلات. */
html.is-mobile .m-ptr {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 64px);
    left: 50%;
    z-index: 9400;
    width: 46px;
    height: 46px;
    margin-left: -23px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.16);
    background:
        linear-gradient(165deg, rgba(255,255,255,.18), rgba(255,255,255,.03) 52%),
        rgba(9,22,45,.58);
    -webkit-backdrop-filter: blur(14px) saturate(170%);
    backdrop-filter: blur(14px) saturate(170%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.30), 0 12px 30px rgba(0,6,16,.38);
    pointer-events: none;
    opacity: 0;
    transform: translate3d(0, -16px, 0) scale(.7);
    transition: opacity .2s ease, transform .36s var(--m-ease-out);
}
/* طبقة تركيب تُطلب عند الظهور فقط: قرص ثابت مخفي لا يستحق طبقة دائمة */
html.is-mobile .m-ptr.on { opacity: 1; will-change: transform, opacity; }
html.is-mobile .m-ptr.drag { transition: none; }
html.is-mobile .m-ptr svg { width: 22px; height: 22px; overflow: visible; }
html.is-mobile .m-ptr-ring {
    fill: none;
    stroke: rgba(125,211,252,.9);
    stroke-width: 2;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
}
html.is-mobile .m-ptr-arrow {
    fill: none;
    stroke: #e8f6ff;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}
html.is-mobile .m-ptr-ok {
    display: none;
    fill: none;
    stroke: #86efac;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
}
html.is-mobile .m-ptr.busy .m-ptr-ring { animation: mPtrSpin .8s linear infinite; }
html.is-mobile .m-ptr.busy .m-ptr-arrow { opacity: .25; }
html.is-mobile .m-ptr.ok { border-color: rgba(74,222,128,.5); }
html.is-mobile .m-ptr.ok .m-ptr-ring { stroke: rgba(74,222,128,.95); }
html.is-mobile .m-ptr.ok .m-ptr-arrow { display: none; }
html.is-mobile .m-ptr.ok .m-ptr-ok { display: block; }
html.is-mobile .m-ptr-label {
    position: absolute;
    top: 52px;
    left: 50%;
    transform: translate3d(-50%, -4px, 0);
    padding: 3px 9px 4px;
    border-radius: 99px;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: .2px;
    white-space: nowrap;
    color: rgba(226,241,255,.82);
    background: rgba(8,20,40,.55);
    border: 1px solid rgba(255,255,255,.10);
    opacity: 0;
    transition: opacity .18s ease, transform .3s var(--m-ease-out);
}
html.is-mobile .m-ptr.on .m-ptr-label { opacity: 1; transform: translate3d(-50%, 0, 0); }
@keyframes mPtrSpin { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }
html.is-mobile body.rg-light .m-ptr {
    border-color: rgba(255,255,255,.92);
    background: linear-gradient(165deg, rgba(255,255,255,.94), rgba(255,255,255,.64));
    box-shadow: inset 0 1px 0 #fff, 0 12px 28px rgba(28,62,110,.20);
}
html.is-mobile body.rg-light .m-ptr-arrow { stroke: #1c4a7a; }
html.is-mobile body.rg-light .m-ptr-ring { stroke: rgba(30,110,180,.8); }
html.is-mobile body.rg-light .m-ptr-label {
    color: #33526f;
    background: rgba(255,255,255,.92);
    border-color: rgba(30,70,120,.12);
    box-shadow: 0 6px 14px rgba(28,62,110,.10);
}
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-ptr { transition: none; }
    html.is-mobile .m-ptr.busy .m-ptr-ring { animation: none; }
}

/* ------------------------- لوحة الأوامر: بحث سريع -------------------------
   بحث واحد يصل إلى الأقسام والزبائن والفواتير والإجراءات. تُبنى عند أول فتح،
   وتُقرأ بياناتها من الجسر عند كل فتح، ولا تكتب شيئاً في قاعدة البيانات. */
html.is-mobile .m-head-search {
    flex: none;
    width: 32px; height: 32px;
    margin-inline-start: 2px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--m-edge);
    background: linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.02)), rgba(9,18,34,.42);
    color: var(--m-accent2);
    font-size: 13px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22);
    transition: transform .18s var(--m-ease), background .3s var(--m-ease);
}
html.is-mobile .m-head-search:active { transform: scale(.92); }
html.is-mobile .m-head-search i { pointer-events: none; }
html.is-mobile body.rg-light .m-head-search {
    border-color: rgba(255,255,255,.95);
    background: linear-gradient(160deg, rgba(255,255,255,.96), rgba(255,255,255,.70));
    color: #1c4a7a;
    box-shadow: 0 6px 14px rgba(28,62,110,.10), inset 0 1px 0 #fff;
}

html.is-mobile .m-cmd {
    position: fixed;
    inset: 0;
    z-index: 9650;
    visibility: hidden;
    pointer-events: none;
}
html.is-mobile .m-cmd.on { visibility: visible; pointer-events: auto; }
html.is-mobile .m-cmd-scrim {
    position: absolute; inset: 0;
    background: rgba(3,8,18,.52);
    -webkit-backdrop-filter: blur(9px) saturate(130%);
    backdrop-filter: blur(9px) saturate(130%);
    opacity: 0;
    transition: opacity .26s var(--m-ease);
}
html.is-mobile .m-cmd.on .m-cmd-scrim { opacity: 1; }
html.is-mobile .m-cmd-card {
    position: absolute;
    top: calc(env(safe-area-inset-top, 0px) + 12px);
    left: 10px; right: 10px;
    max-width: 560px;
    margin-inline: auto;
    max-height: calc(100vh - var(--m-kb, 0px) - env(safe-area-inset-top, 0px) - 74px);
    display: flex;
    flex-direction: column;
    border-radius: 24px;
    border: 1px solid rgba(170,215,255,.22);
    background:
        linear-gradient(158deg, rgba(190,222,255,.14), rgba(120,172,240,.02) 46%, rgba(160,205,255,.08)),
        rgba(9,19,37,.86);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    backdrop-filter: blur(24px) saturate(150%);
    box-shadow: 0 30px 70px rgba(0,4,14,.60), inset 0 1px 0 rgba(210,240,255,.22);
    overflow: hidden;
    transform: translate3d(0, -14px, 0) scale(.985);
    opacity: 0;
    transition: transform .34s var(--m-ease-out), opacity .24s var(--m-ease);
}
html.is-mobile .m-cmd.on .m-cmd-card { transform: none; opacity: 1; }
html.is-mobile .m-cmd.closing .m-cmd-card {
    transform: translate3d(0, -10px, 0) scale(.99);
    opacity: 0;
    transition: transform .18s ease, opacity .16s ease;
}
html.is-mobile .m-cmd.closing .m-cmd-scrim { opacity: 0; transition-duration: .18s; }
html.is-mobile .m-cmd-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px 12px 14px;
    border-bottom: 1px solid rgba(150,200,255,.14);
    flex: none;
}
html.is-mobile .m-cmd-bar > i.fa-magnifying-glass { color: var(--m-accent2); font-size: 15px; flex: none; }
html.is-mobile .m-cmd-input {
    flex: 1;
    min-width: 0;
    background: none;
    border: 0;
    outline: none;
    color: #eaf4ff;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    padding: 4px 0;
}
html.is-mobile .m-cmd-input::placeholder { color: rgba(178,205,238,.55); font-weight: 600; }
html.is-mobile .m-cmd-x {
    flex: none;
    width: 30px; height: 30px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(160,205,255,.18);
    background: rgba(255,255,255,.06);
    color: #cfe4ff;
    font-size: 12px;
}
html.is-mobile .m-cmd-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4px 8px 8px;
    overscroll-behavior: contain;
}
html.is-mobile .m-cmd-grp {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 10px 6px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .6px;
    color: rgba(168,198,232,.62);
}
html.is-mobile .m-cmd-grp::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(150,200,255,.18), transparent);
}
html.is-mobile .m-cmd-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: 14px;
    border: 1px solid transparent;
    background: none;
    color: #e8f2ff;
    text-align: start;
    font-family: inherit;
    transition: background .16s ease, border-color .16s ease, transform .14s ease;
}
html.is-mobile .m-cmd.on .m-cmd-row {
    animation: mCmdRow .36s var(--m-ease-out) both;
    animation-delay: calc(min(var(--i, 0), 10) * 26ms);
}
@keyframes mCmdRow {
    from { opacity: 0; transform: translate3d(0, 7px, 0); }
    to   { opacity: 1; transform: none; }
}
html.is-mobile .m-cmd-row.sel {
    background: linear-gradient(160deg, rgba(120,180,255,.16), rgba(60,110,190,.06));
    border-color: rgba(150,205,255,.26);
}
html.is-mobile .m-cmd-row:active { transform: scale(.985); }
html.is-mobile .m-cmd-ic {
    flex: none;
    width: 32px; height: 32px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: rgba(140,195,255,.10);
    border: 1px solid rgba(150,205,255,.18);
    color: var(--m-accent2);
    font-size: 13px;
}
html.is-mobile .m-cmd-txt { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
html.is-mobile .m-cmd-txt b {
    font-size: 13.5px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
html.is-mobile .m-cmd-txt small {
    font-size: 10.5px;
    color: rgba(170,198,230,.68);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
html.is-mobile .m-cmd-go { flex: none; color: rgba(160,200,245,.38); font-size: 10px; }
html.is-mobile .m-cmd-empty { padding: 30px 18px 34px; text-align: center; }
html.is-mobile .m-cmd-empty i { display: block; font-size: 22px; color: rgba(150,195,245,.5); margin-bottom: 10px; }
html.is-mobile .m-cmd-empty b { display: block; font-size: 13px; font-weight: 800; color: #dbe9fb; margin-bottom: 4px; }
html.is-mobile .m-cmd-empty span { font-size: 11px; color: var(--m-muted); }
html.is-mobile .m-cmd-hint {
    flex: none;
    padding: 8px 14px calc(10px + env(safe-area-inset-bottom, 0px) * .3);
    border-top: 1px solid rgba(150,200,255,.10);
    font-size: 9.5px;
    letter-spacing: .2px;
    color: rgba(160,190,225,.50);
    text-align: center;
}
html.is-mobile body.rg-light .m-cmd-scrim { background: rgba(232,240,250,.55); }
html.is-mobile body.rg-light .m-cmd-card {
    border-color: rgba(255,255,255,.95);
    background: linear-gradient(158deg, rgba(255,255,255,.97), rgba(255,255,255,.88));
    box-shadow: 0 30px 70px rgba(24,54,100,.24), inset 0 1px 0 #fff;
}
html.is-mobile body.rg-light .m-cmd-bar { border-bottom-color: rgba(30,70,120,.10); }
html.is-mobile body.rg-light .m-cmd-bar > i.fa-magnifying-glass { color: #2f7fd0; }
html.is-mobile body.rg-light .m-cmd-input { color: #0e2138; }
html.is-mobile body.rg-light .m-cmd-input::placeholder { color: rgba(70,100,135,.55); }
html.is-mobile body.rg-light .m-cmd-x { border-color: rgba(30,70,120,.14); background: rgba(30,70,120,.06); color: #24466f; }
html.is-mobile body.rg-light .m-cmd-grp { color: rgba(60,90,125,.62); }
html.is-mobile body.rg-light .m-cmd-grp::after { background: linear-gradient(90deg, rgba(47,127,208,.20), transparent); }
html.is-mobile body.rg-light .m-cmd-row { color: #16324f; }
html.is-mobile body.rg-light .m-cmd-row.sel {
    background: linear-gradient(160deg, rgba(47,127,208,.12), rgba(47,127,208,.04));
    border-color: rgba(47,127,208,.22);
}
html.is-mobile body.rg-light .m-cmd-ic {
    background: rgba(47,127,208,.08);
    border-color: rgba(47,127,208,.18);
    color: #2f7fd0;
}
html.is-mobile body.rg-light .m-cmd-txt small { color: rgba(70,100,135,.70); }
html.is-mobile body.rg-light .m-cmd-go { color: rgba(47,127,208,.40); }
html.is-mobile body.rg-light .m-cmd-empty b { color: #24466f; }
html.is-mobile body.rg-light .m-cmd-hint { border-top-color: rgba(30,70,120,.08); color: rgba(70,100,135,.55); }
@media (prefers-reduced-motion: reduce) {
    html.is-mobile .m-cmd-card,
    html.is-mobile .m-cmd.on .m-cmd-row { transition: none; animation: none; }
    html.is-mobile .m-cmd-scrim { transition: none; }
}

/* ------------------------- التنبيهات والعناصر الصغيرة ------------------------- */
html.is-mobile #toast-container {
    top: auto !important; left: 12px !important; right: 12px !important;
    bottom: calc(var(--m-bar-h) + 26px + env(safe-area-inset-bottom) + var(--m-kb)) !important;
    z-index: 9600 !important;
    display: flex; flex-direction: column; gap: 8px; align-items: stretch;
}
html.is-mobile .toast-msg {
    border-radius: 16px !important;
    border: 1px solid rgba(150,205,255,.22) !important;
    background:
        linear-gradient(180deg, rgba(146,200,255,.12), rgba(146,200,255,.02)),
        rgba(9,17,31,.94) !important;
    box-shadow: 0 16px 40px rgba(0,0,0,.52), inset 0 1px 0 rgba(186,226,255,.20) !important;
    max-width: none !important;
}

html.is-mobile .m-offline {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #ffd7dc;
    background: rgba(255,93,108,.10);
    border: 1px solid rgba(255,93,108,.28);
    border-radius: 14px; padding: 9px 11px; margin-bottom: 12px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

/* شاشة فتح تتعامل كطبقة زجاجية: قرص رمزي يلمع مرة، حلقات تتنفس، اسم
   المكوى يصعد، ثم خيط تقدم يكتمل لحظة الجهوزية ويُخرج الشاشة بتلاشٍ
   قصير مع بناء الصفحة في اللحظة نفسها. */
html.is-mobile .m-splash {
    position: fixed;
    inset: 0;
    z-index: 9700;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    --m-spl-bg:
        radial-gradient(58% 42% at 50% 38%, rgba(var(--rg-accent-rgb), .20), transparent 70%),
        radial-gradient(80% 60% at 50% 115%, rgba(90,168,255,.10), transparent 66%),
        linear-gradient(180deg, #050a13, #03060b);
    background: var(--m-spl-bg);
    opacity: 1;
    transition: opacity .5s var(--m-ease-out, ease);
}
/* خروج كتفكّك زجاجي: نصفان يحملان الخلفية نفسها ينزلقان عن المركز
   فيظهر التطبيق من الشقّ، بينما القرص والاسم يرتفعان ويتلاشيان. */
html.is-mobile .m-splash::before,
html.is-mobile .m-splash::after {
    content: "";
    position: absolute;
    inset: -1px;
    z-index: 0;
    background: var(--m-spl-bg);
    transition: transform .62s cubic-bezier(.6,.05,.7,.2), opacity .6s ease;
    will-change: transform;
    pointer-events: none;
}
html.is-mobile .m-splash::before { clip-path: inset(0 0 50% 0); }
html.is-mobile .m-splash::after { clip-path: inset(50% 0 0 0); }
html.is-mobile .m-splash.m-off2 { opacity: 1; pointer-events: none; background: transparent; }
html.is-mobile .m-splash.m-off2::before { transform: translate3d(0, -104%, 0); }
html.is-mobile .m-splash.m-off2::after { transform: translate3d(0, 104%, 0); }
html.is-mobile .m-splash-orb {
    position: absolute;
    width: 270px; height: 270px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--rg-accent-rgb), .30), transparent 68%);
    filter: blur(18px);
    z-index: 1;
    animation: mSplOrb 3.4s ease-in-out infinite alternate;
    transition: opacity .38s ease;
}
html.is-mobile .m-splash.m-off2 .m-splash-orb { opacity: 0; }
@keyframes mSplOrb { from { transform: scale(.86); opacity: .45; } to { transform: scale(1.12); opacity: .82; } }
html.is-mobile .m-splash-core {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 28px;
    text-align: center;
    transition: transform .5s var(--m-ease-out, ease), opacity .42s ease;
}
html.is-mobile .m-splash.m-off2 .m-splash-core { transform: translate3d(0, -12px, 0) scale(1.04); opacity: 0; }
html.is-mobile .m-splash-mark { position: relative; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; }
html.is-mobile .m-splash-plate {
    position: relative;
    width: 96px; height: 96px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 30px;
    background:
        linear-gradient(152deg, rgba(255,255,255,.20), rgba(255,255,255,.02) 58%, rgba(var(--rg-accent-rgb), .14)),
        rgba(14,26,46,.72);
    border: 1px solid rgba(255,255,255,.16);
    box-shadow:
        0 24px 60px rgba(0,0,0,.5),
        0 10px 30px rgba(var(--rg-accent-rgb), .22),
        inset 0 1px 0 rgba(255,255,255,.30);
    overflow: hidden;
    transform: scale(.84);
    opacity: 0;
}
html.is-mobile .m-splash.on .m-splash-plate { animation: mSplPlate .72s cubic-bezier(.16,1.12,.3,1) .06s forwards; }
@keyframes mSplPlate { to { transform: scale(1); opacity: 1; } }
html.is-mobile .m-splash-plate i {
    font-size: 38px;
    color: var(--m-accent2, #9cc6ff);
    filter: drop-shadow(0 6px 16px rgba(var(--rg-accent-rgb), .45));
}
html.is-mobile .m-splash-sheen {
    position: absolute;
    inset: -40% -60%;
    background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,.5) 50%, transparent 58%);
    opacity: 0;
    pointer-events: none;
}
html.is-mobile .m-splash.on .m-splash-sheen { animation: mSplSheen 1.1s ease .45s; }
@keyframes mSplSheen {
    0% { transform: translateX(-72%); opacity: 0; }
    16% { opacity: .9; }
    100% { transform: translateX(72%); opacity: 0; }
}
html.is-mobile .m-splash-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(var(--rg-accent-rgb), .5);
    opacity: 0;
    pointer-events: none;
}
html.is-mobile .m-splash.on .m-splash-ring { animation: mSplRing 2.2s cubic-bezier(.16,.8,.3,1) .2s infinite; }
html.is-mobile .m-splash.on .m-splash-ring.r2 { animation-delay: .9s; }
@keyframes mSplRing {
    0% { transform: scale(.86); opacity: 0; }
    22% { opacity: .5; }
    100% { transform: scale(2.15); opacity: 0; }
}
html.is-mobile .m-splash-brand {
    margin-top: 22px;
    font-size: 21px;
    font-weight: 900;
    letter-spacing: .2px;
    color: #eef5ff;
    text-shadow: 0 8px 26px rgba(var(--rg-accent-rgb), .35);
    opacity: 0;
    transform: translateY(7px);
}
html.is-mobile .m-splash.on .m-splash-brand { animation: mSplText .6s var(--m-ease-out, ease) .24s forwards; }
html.is-mobile .m-splash-sub {
    margin-top: 7px;
    font-size: 11.5px;
    font-weight: 700;
    color: rgba(238,245,255,.58);
    opacity: 0;
    transform: translateY(6px);
}
html.is-mobile .m-splash.on .m-splash-sub { animation: mSplText .6s var(--m-ease-out, ease) .36s forwards; }
@keyframes mSplText { to { opacity: 1; transform: none; } }
html.is-mobile .m-splash-track {
    margin-top: 20px;
    width: 144px;
    height: 3px;
    border-radius: 99px;
    background: rgba(255,255,255,.09);
    box-shadow: inset 0 1px 2px rgba(0,0,0,.4);
    overflow: hidden;
    opacity: 0;
}
html.is-mobile .m-splash.on .m-splash-track { opacity: 1; transition: opacity .3s ease .4s; }
html.is-mobile .m-splash-track i {
    display: block;
    width: 8%;
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, rgba(var(--rg-accent-rgb), .55), rgb(var(--rg-accent-rgb)));
    box-shadow: 0 0 12px rgba(var(--rg-accent-rgb), .65);
}
html.is-mobile .m-splash.on .m-splash-track i { width: 82%; transition: width .62s cubic-bezier(.2,.75,.25,1) .3s; }
html.is-mobile .m-splash.m-done .m-splash-track i { width: 100%; transition: width .2s ease; }
html.is-mobile .m-splash-grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: .5;
    z-index: 1;
    transition: opacity .34s ease;
    background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 3px 3px;
    -webkit-mask-image: radial-gradient(70% 60% at 50% 45%, #000, transparent 78%);
    mask-image: radial-gradient(70% 60% at 50% 45%, #000, transparent 78%);
}
html.is-mobile .m-splash.is-light {
    --m-spl-bg:
        radial-gradient(58% 42% at 50% 38%, rgba(var(--rg-accent-rgb), .16), transparent 70%),
        radial-gradient(80% 60% at 50% 115%, rgba(90,168,255,.14), transparent 66%),
        linear-gradient(180deg, #f4f8fd, #e7eff8);
}
html.is-mobile .m-splash.is-light .m-splash-orb { opacity: .5; }
html.is-mobile .m-splash.is-light .m-splash-plate {
    background:
        linear-gradient(152deg, rgba(255,255,255,.96), rgba(255,255,255,.55) 58%, rgba(var(--rg-accent-rgb), .10)),
        rgba(255,255,255,.7);
    border-color: rgba(255,255,255,.9);
    box-shadow:
        0 24px 56px rgba(30,80,140,.18),
        0 10px 26px rgba(var(--rg-accent-rgb), .16),
        inset 0 1px 0 #fff;
}
html.is-mobile .m-splash.is-light .m-splash-plate i { color: var(--rg-accent, #2a6fc9); filter: none; }
html.is-mobile .m-splash.is-light .m-splash-ring { border-color: rgba(var(--rg-accent-rgb), .38); }
html.is-mobile .m-splash.is-light .m-splash-brand { color: #102a45; text-shadow: none; }
html.is-mobile .m-splash.is-light .m-splash-sub { color: #4d6a8a; }
html.is-mobile .m-splash.is-light .m-splash-track { background: rgba(30,80,140,.12); box-shadow: none; }
html.is-mobile .m-splash.is-light .m-splash-grain { background-image: radial-gradient(rgba(30,80,140,.06) 1px, transparent 1px); }
html.is-mobile body.rm-motion-off .m-splash *,
html.is-mobile body.rm-motion-off .m-splash *::before,
html.is-mobile body.rm-motion-off .m-splash *::after {
    animation: none !important;
    animation-delay: 0ms !important;
    transition-duration: .001ms !important;
    transition-delay: 0ms !important;
}

html.is-mobile .m-viewbtn {
    width: 100%; margin-top: 16px;
    min-height: 48px;
    border-radius: 16px;
    border: 1px solid var(--m-edge);
    background:
        linear-gradient(160deg, rgba(146,200,255,.12), rgba(146,200,255,.02)),
        rgba(12,23,42,.46);
    color: #dceaff;
    font-size: 15px; font-weight: 800;
    box-shadow: inset 0 1px 0 rgba(178,220,255,.18);
}

/* الخلفية تتجمّد باللمس لا بتغيير overflow: تغييرها في سفاري يصفّر موضع التمرير  */
html.is-mobile body.m-lock .admin-section { pointer-events: none; }

/* اللوحة التي لا تحتاج تمريراً لا تُمرَّر أصلاً: لا مطّ ولا قفز */
html.is-mobile .admin-section.m-noflow { overflow-y: hidden; }

/* --------------------- مواجهة !important الورشة: لا هالات ولا ذهب ---------------------
   ورقة المتجر تكتب التوهّج والذهبي بـ !important، فلا يُلغيها إلا !important
   بخصوصية أعلى. وهذه تحديداً الهالات التي يرفضها المستخدم بعينه. */

/* رقم القطع في البطاقة البطلة: style.css:1323 يكتب حوله هالة ذهبية !important */
html.is-mobile #bento-current-pieces {
    color: #ffffff !important;
    letter-spacing: -.5px;
    text-shadow: 0 1px 2px rgba(0,0,0,.62) !important;
}
/* صحن الأيقونة: المتجر يضيف ظلاً ذهبياً !important حول كل أيقونة */
html.is-mobile #admin-screen .stat-icon { box-shadow: none !important; text-shadow: none !important; }
html.is-mobile .stat-card[onclick*="costs"] .stat-icon,
html.is-mobile .stat-card[onclick*="logs"] .stat-icon {
    background:
        linear-gradient(152deg, rgba(150,200,255,.16) 0%, rgba(120,165,235,.04) 44%, rgba(130,175,255,.09) 100%),
        rgba(14,25,44,.62) !important;
    border-color: transparent !important;
}

/* بطاقات الأيام: جدولها يحمل صنف cart-table، فقواعد الخلايا العامة في هذه الطبقة
   أعلى خصوصية من قواعد الورشة. الختم بمعرفَين (#admin-screen + التوبودي) هو الوحيد
   الذي يسبق كليهما، وهو ما يلغي الإطار الذهبي وهالة الدخل الصافي. */
html.is-mobile #admin-screen #admin-daily-reports-body tr {
    background:
        linear-gradient(180deg, rgba(146,198,255,.15), rgba(146,198,255,0) 28%),
        var(--m-glass),
        rgba(9,17,31,.62) !important;
    border: none !important;
    border-radius: 0 !important;
    clip-path: var(--m-facet);
    box-shadow: inset 0 1px 0 rgba(170,214,255,.20), inset 0 0 0 1px rgba(138,190,255,.07) !important;
    padding: 15px 14px !important;
    margin-bottom: 12px !important;
}
html.is-mobile #admin-screen #admin-daily-reports-body tr > td:nth-child(3),
html.is-mobile #admin-screen #admin-daily-reports-body tr > td:nth-child(4) {
    border-radius: 0 !important;
    padding: 8px 9px !important;
    clip-path: var(--m-facet-sm);
    font-size: 13.5px !important;
    font-weight: 800 !important;
    font-variant-numeric: tabular-nums;
}
html.is-mobile #admin-screen #admin-daily-reports-body tr > td:nth-child(3) {
    background: linear-gradient(165deg, rgba(154,240,204,.14), rgba(255,255,255,.02)) !important;
    color: #d6ffe9 !important;
}
html.is-mobile #admin-screen #admin-daily-reports-body tr > td:nth-child(4) {
    background: linear-gradient(165deg, rgba(255,142,154,.14), rgba(255,255,255,.02)) !important;
    color: #ffc9d0 !important;
}
/* الدخل الصافي: رقم محفور أبيض، لا ذهب ولا هالة */
html.is-mobile #admin-screen #admin-daily-reports-body tr > td:nth-child(6) {
    color: #f7fbff !important;
    font-size: 21px !important;
    text-shadow: 0 1px 3px rgba(0,0,0,.66) !important;
    font-variant-numeric: tabular-nums;
}
html.is-mobile #admin-screen #admin-daily-reports-body tr > td:nth-child(6)::before {
    color: rgba(226,240,255,.58) !important;
    font-weight: 800 !important;
    letter-spacing: .2px;
}

/* اللمس في آيفون يُبقي :hover عالقاً بعد الرفع: المتجر يكتب على السطر المُحوَّم
   خلفية ذهبية و scale(1.02) بـ !important — وهذا بالضبط «تكبّر وتصغّر الأرقام»
   الذي شكا منه المستخدم، فتلغى وتُستبدل بلمعة بلاتينية بلا حركة. */
html.is-mobile .interactive-row:hover,
html.is-mobile .interactive-table tr:hover {
    transform: none !important;
    -webkit-transform: none !important;
    background:
        linear-gradient(180deg, rgba(146,198,255,.16), rgba(146,198,255,.02) 30%),
        var(--m-glass),
        rgba(11,21,38,.72) !important;
    border-color: var(--m-edge-hi) !important;
    box-shadow: var(--m-lift) !important;
}

/* رفعُ الوقوف عند المتجر (translateY/scale) لا يزول على اللمس: البطاقات تبقى
   مرفوعة بعد كل نقرة. الإلغاء يشمل البطاقات والصفوف وخلايا المخطط. */
html.is-mobile .stat-card:hover,
html.is-mobile .item-cell:hover,
html.is-mobile .tx-deposit-card:hover,
html.is-mobile .tx-withdraw-card:hover,
html.is-mobile #admin-screen .cart-table tbody tr:hover,
html.is-mobile #admin-screen .invoices-table tbody tr:hover {
    transform: none !important;
    -webkit-transform: none !important;
}
html.is-mobile .stat-card:hover {
    border-color: var(--m-edge-hi) !important;
    box-shadow: var(--m-lift) !important;
}
html.is-mobile #admin-screen .cart-table tbody tr:hover,
html.is-mobile #admin-screen .invoices-table tbody tr:hover {
    background:
        linear-gradient(180deg, rgba(146,198,255,.18), rgba(146,198,255,.02) 30%),
        var(--m-glass),
        rgba(10,20,36,.76) !important;
}
/* أزرار التنقل القديمة إن بقي منها شيء في الجوال: توهّج ذهبي لصيق */
html.is-mobile .admin-nav-btn:hover,
html.is-mobile .admin-nav-btn.active {
    background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.02)) !important;
    color: #eaf4ff !important;
    border-right-color: rgba(226,240,255,.5) !important;
}

/* رؤوس وأذيال النوافذ الثابتة: بلاتين بدل الذهبي، وسطح زجاجي بدل الرمادي المسطّح */
html.is-mobile .modal-header-sticky {
    background: linear-gradient(180deg, rgba(19,34,58,.97), rgba(10,19,34,.97)) !important;
    border-bottom: 1px solid rgba(150,200,255,.12) !important;
}
html.is-mobile .modal-footer-sticky {
    background: linear-gradient(0deg, rgba(19,34,58,.97), rgba(10,19,34,.97)) !important;
    border-top: 1px solid rgba(150,200,255,.12) !important;
}

/* ================= الوضع النهاري: تصحيح التباين =================
   لوحات الأدمن بُنيت للزجاج الليلي، فبقيت نصوصها البيضاء وأسطح أزرارها
   الداكنة فوق الصفحات الفاتحة. كل ما هنا تحت body.rg-light وحده:
   المشهد الليلي وواجهة الكمبيوتر لا يُمَسّان بحرف. */

/* «المزيد»: العنوان كان #dceaff فوق بطاقة بيضاء (1.1:1) */
html.is-mobile body.rg-light #admin-more-menu .stat-card .stat-title {
    color: #16324f !important;
    text-shadow: none !important;
}
/* صحن الأيقونة كان أبيض على زجاج فاتح، وقاعدة #f39c12 تُبقيه أبيض */
html.is-mobile body.rg-light #admin-more-menu .stat-card .stat-icon {
    color: #1d3f66 !important;
    background:
        linear-gradient(152deg, rgba(255,255,255,.98) 0%, rgba(var(--rg-accent-rgb), .12) 52%, rgba(255,255,255,.86) 100%) !important;
    text-shadow: none !important;
    box-shadow: none !important;
}
html.is-mobile body.rg-light #admin-more-menu .stat-card::after {
    background: linear-gradient(90deg, rgba(var(--rg-accent-rgb), .45), rgba(var(--rg-accent-rgb), .06));
    opacity: .6;
}

/* الأزرار: الزجاج الداكن الشفاف يذوب رمادياً فوق الأبيض، ونصّه الأبيض
   يصبح 2.6:1. السطوح الفاتحة هنا تحمل حبراً داكناً، والأساسي صبغة أوضح. */
html.is-mobile body.rg-light #admin-screen .btn,
html.is-mobile body.rg-light #pos-screen .btn,
html.is-mobile body.rg-light #main-screen .btn,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .btn,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-actions button,
html.is-mobile body.rg-light .btn-royal-action,
html.is-mobile body.rg-light .btn-save,
html.is-mobile body.rg-light .btn-cancel,
html.is-mobile body.rg-light #admin-screen .btn-confirm,
html.is-mobile body.rg-light #pos-screen .btn-confirm,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .btn-confirm,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-actions .btn-confirm {
    background:
        linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.55) 62%),
        rgba(var(--rg-accent-rgb), .08) !important;
    border-color: rgba(var(--rg-accent-rgb), .26) !important;
    color: #24466f !important;
    box-shadow: inset 0 1px 0 #fff, 0 8px 18px rgba(28,62,110,.10) !important;
    text-shadow: none !important;
}
html.is-mobile body.rg-light #admin-screen .btn-confirm,
html.is-mobile body.rg-light #pos-screen .btn-confirm,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .btn-confirm,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-actions .btn-confirm,
html.is-mobile body.rg-light .btn-save {
    background:
        linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.12) 60%),
        linear-gradient(160deg, rgba(var(--rg-accent-rgb), .32), rgba(var(--rg-accent-rgb), .16)) !important;
    border-color: rgba(var(--rg-accent-rgb), .48) !important;
    color: var(--rg-accent-ink) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 10px 22px rgba(28,62,110,.14) !important;
}
/* الأزرار التي تحمل دلالة حمراء/خضراء سطرياً تحتفظ بلونها بدل أن تزرقّ */
html.is-mobile body.rg-light #admin-screen .btn-confirm[style*="red-danger"],
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .btn-confirm[style*="red-danger"] {
    background:
        linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.10) 60%),
        linear-gradient(160deg, rgba(220,50,75,.24), rgba(220,50,75,.10)) !important;
    border-color: rgba(190,35,60,.45) !important;
    color: #a11f34 !important;
}
html.is-mobile body.rg-light #admin-screen .btn-confirm[style*="green-success"],
html.is-mobile body.rg-light #admin-screen .btn-royal-action[style*="green-success"],
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .btn-confirm[style*="green-success"] {
    background:
        linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.10) 60%),
        linear-gradient(160deg, rgba(16,160,105,.24), rgba(16,160,105,.10)) !important;
    border-color: rgba(13,122,82,.42) !important;
    color: #0d6b49 !important;
}

/* جداول البطاقات: الخلية الثانية كانت #e8f3ff دائماً، والمال كان أزرق فاتحاً */
html.is-mobile body.rg-light #admin-screen .cart-table tr > td:nth-child(2),
html.is-mobile body.rg-light #admin-screen .invoices-table tr > td:nth-child(2) {
    color: #16324f !important;
    text-shadow: none !important;
}
html.is-mobile body.rg-light #admin-screen .cart-table tr > td:last-child:not(:first-child),
html.is-mobile body.rg-light #admin-screen .invoices-table tr > td:last-child:not(:first-child) {
    color: var(--rg-accent-ink) !important;
}
/* بطاقة إدخال التكلفة: حافة وظل خفيفان يفصلانها عن الخلفية الفاتحة */
html.is-mobile body.rg-light #admin-costs > div {
    background: rgba(255,255,255,.74) !important;
    border: 1px solid rgba(255,255,255,.92);
    box-shadow: 0 12px 26px rgba(28,62,110,.08);
}
html.is-mobile body.rg-light #admin-screen #costs-table-body tr > td:nth-child(2) {
    color: #16324f !important;
    text-shadow: none !important;
}
html.is-mobile body.rg-light #admin-screen #costs-table-body tr > td:nth-child(3) {
    color: #a8342c !important;
}

/* السجل: الشارة كانت أخضر نيون متوهجاً فوق أبيض، وزر العين زجاجاً داكناً */
html.is-mobile body.rg-light .log-type {
    background: rgba(var(--rg-accent-rgb), .08) !important;
    text-shadow: none !important;
}
html.is-mobile body.rg-light .log-add {
    color: #0d6b49 !important;
    border-color: rgba(13,107,73,.38) !important;
    background: rgba(34,197,94,.10) !important;
}
html.is-mobile body.rg-light .log-edit {
    color: #1f5f9e !important;
    border-color: rgba(31,95,158,.38) !important;
    background: rgba(90,168,255,.10) !important;
}
html.is-mobile body.rg-light .log-delete {
    color: #a11f34 !important;
    border-color: rgba(161,31,52,.38) !important;
    background: rgba(220,50,75,.08) !important;
}
html.is-mobile body.rg-light #admin-screen td:last-child .top-bar-btn,
html.is-mobile body.rg-light #admin-screen td:last-child .action-icon {
    background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.7)) !important;
    border-color: rgba(var(--rg-accent-rgb), .28) !important;
    color: var(--rg-accent-ink) !important;
    box-shadow: inset 0 1px 0 #fff, 0 5px 12px rgba(28,62,110,.10) !important;
}

/* صفحات الزبائن والاستوديو: الشارات كانت accent2 الفاتح فوق أبيض */
html.is-mobile body.rg-light .ri-export {
    background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.62)) !important;
    border-color: rgba(var(--rg-accent-rgb), .28) !important;
    color: var(--rg-accent-ink) !important;
    box-shadow: inset 0 1px 0 #fff, 0 6px 14px rgba(28,62,110,.10) !important;
}
html.is-mobile body.rg-light .ri-kicker,
html.is-mobile body.rg-light .rg-st-kicker { color: var(--rg-accent-ink) !important; }
html.is-mobile body.rg-light .rg-value { color: var(--rg-accent-ink) !important; }
html.is-mobile body.rg-light .rg-label i { color: var(--rg-accent-ink) !important; opacity: .85; }
html.is-mobile body.rg-light .rg-mode-btn { color: var(--rg-accent-ink); }

/* تحليلات الزبائن: قيم الرُتب والفلاتر كانت accent2 الفاتح فوق أبيض */
html.is-mobile body.rg-light .ri-rank-v,
html.is-mobile body.rg-light .ri-filters button.on,
html.is-mobile body.rg-light .ri-card-head h3 i,
html.is-mobile body.rg-light .ri-foot i,
html.is-mobile body.rg-light .ri-cust-head a,
html.is-mobile body.rg-light .ri-cust-meta i,
html.is-mobile body.rg-light .ri-inv-n {
    color: var(--rg-accent-ink) !important;
}
html.is-mobile body.rg-light .ri-heat-cell.strong {
    color: #0a2947 !important;
    text-shadow: none !important;
}
html.is-mobile body.rg-light .admin-section h2 i,
html.is-mobile body.rg-light .m-today-head i { color: var(--rg-accent-ink) !important; }
html.is-mobile body.rg-light #admin-screen .btn-confirm,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .btn-confirm,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-actions .btn-confirm {
    color: #2a5f9e !important;
}

/* جداول النوافذ: ورقة المتجر ترسم صفوفها فحماً داكناً بنصوص فاتحة، وبعد
   تفعيل الوضع النهاري صارت النصوص داكنة فوق الفحم — أسطح فاتحة الآن. */
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .invoices-table tr,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .cart-table tr {
    background: linear-gradient(150deg, rgba(255,255,255,.97), rgba(255,255,255,.74)) !important;
    border: 1px solid rgba(var(--rg-accent-rgb), .20) !important;
    border-right: 4px solid rgba(var(--rg-accent-rgb), .48) !important;
    box-shadow: 0 8px 20px rgba(28,62,110,.10) !important;
}
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .invoices-table tr {
    border-right-color: rgba(190,35,60,.48) !important;
}
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .invoices-table td,
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .cart-table td {
    color: #16324f !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    text-align: start !important;
}
/* خلايا جدول الفواتير داخل النوافذ كانت تتكدس فوق بعضها: المواصفات القديمة
   تضع الرقم والنوع في الخلية نفسها. شبكة صريحة: التاريخ والرقم يميناً،
   النوع والمبلغ يساراً، والأزرار في صفّ مستقل. */
html.is-mobile body.rg-light #modal-invoices .invoices-table tr {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-rows: auto auto auto !important;
    column-gap: 12px !important;
    row-gap: 5px !important;
    align-items: center !important;
}
html.is-mobile body.rg-light #modal-invoices .invoices-table td:nth-child(1) {
    grid-area: 1 / 1 / 2 / 2 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    color: #5e7b9d !important;
}
html.is-mobile body.rg-light #modal-invoices .invoices-table td:nth-child(2) {
    grid-area: 2 / 1 / 3 / 2 !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    color: #0e2138 !important;
}
html.is-mobile body.rg-light #modal-invoices .invoices-table td:nth-child(3) {
    grid-area: 1 / 2 / 2 / 3 !important;
    justify-self: end !important;
    font-size: 11.5px !important;
    font-weight: 700 !important;
    color: #4d6a8a !important;
}
html.is-mobile body.rg-light #modal-invoices .invoices-table td:nth-last-child(2) {
    grid-area: 2 / 2 / 3 / 3 !important;
    justify-self: end !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    color: #2a5f9e !important;
}
html.is-mobile body.rg-light #modal-invoices .invoices-table td:last-child {
    grid-area: 3 / 1 / 4 / 3 !important;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 10px !important;
    margin-top: 2px !important;
    padding-top: 8px !important;
    border-top: 1px solid rgba(28,62,110,.10) !important;
}
/* النسخة الليلية من الشبكة نفسها: كانت مواضع الخلايا تأتي من بطاقات أقسام
   الإدارة العامة، فتنزل «النوع» فوق رقم الفاتورة. المواضع هنا صريحة. */
html.is-mobile body:not(.rg-light) #modal-invoices .invoices-table tr {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-rows: auto auto auto !important;
    column-gap: 12px !important;
    row-gap: 5px !important;
    align-items: center !important;
}
html.is-mobile body:not(.rg-light) #modal-invoices .invoices-table td {
    display: block !important;
    grid-column: auto !important;
    grid-row: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    background: transparent !important;
    text-align: start !important;
    align-self: center !important;
    justify-content: flex-start !important;
    white-space: normal !important;
}
html.is-mobile body:not(.rg-light) #modal-invoices .invoices-table td:nth-child(1) {
    grid-area: 1 / 1 / 2 / 2 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    color: var(--m-muted) !important;
    letter-spacing: .2px;
}
html.is-mobile body:not(.rg-light) #modal-invoices .invoices-table td:nth-child(2) {
    grid-area: 2 / 1 / 3 / 2 !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    color: #eaf4ff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,.5);
    white-space: nowrap !important;
}
html.is-mobile body:not(.rg-light) #modal-invoices .invoices-table td:nth-child(3) {
    grid-area: 1 / 2 / 2 / 3 !important;
    justify-self: end !important;
    text-align: end !important;
    font-size: 11.5px !important;
    font-weight: 700 !important;
    color: var(--m-muted) !important;
}
html.is-mobile body:not(.rg-light) #modal-invoices .invoices-table td:nth-last-child(2) {
    grid-area: 2 / 2 / 3 / 3 !important;
    justify-self: end !important;
    text-align: end !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    color: #d9ecff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,.5);
    white-space: nowrap !important;
}
html.is-mobile body:not(.rg-light) #modal-invoices .invoices-table td:last-child {
    grid-area: 3 / 1 / 4 / 3 !important;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 10px !important;
    margin-top: 2px !important;
    padding-top: 8px !important;
    border-top: 1px solid rgba(255,255,255,.10) !important;
}
/* كشف اليوم: خلاياه تستمد ألوانها من قواعده الخاصة، فتُصحَّح وحدها هنا */
html.is-mobile body.rg-light #modal-daily-transactions .invoices-table td:nth-child(1) {
    background: rgba(var(--rg-accent-rgb), .12) !important;
    color: #1b5aa8 !important;
}
html.is-mobile body.rg-light #modal-daily-transactions .invoices-table td:nth-child(3) {
    color: #0e2138 !important;
}
html.is-mobile body.rg-light #modal-daily-transactions .invoices-table td:nth-child(n+5)::before {
    color: #5e7b9d !important;
}
html.is-mobile body.rg-light .m-day-empty { color: #4d6a8a !important; }
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .invoices-table td[style*="red-danger"],
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .invoices-table td[style*=" color: var(--red-danger)"],
html.is-mobile body.rg-light .modal-overlay:not(#modal-admin-login) .modal-content .invoices-table td[style*="var(--red-danger)"] {
    color: #a11f34 !important;
}

@media (prefers-reduced-motion: reduce) {
    html.is-mobile *, html.is-mobile *::before, html.is-mobile *::after {
        transition-duration: .001ms !important;
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
    }
    html.is-mobile body::before,
    html.is-mobile body::after,
    html.is-mobile .m-lk-scene i { animation: none !important; }
    /* حركة الطبقة تُخفَّف ولا تُلغى: إلغاؤها الكامل هو ما جعل المستخدم يقول
       «الموشن لم يعمل» حين تكون خاصية تقليل الحركة مفعّلة في الجهاز */
    html.is-mobile .admin-section .m-anim,
    html.is-mobile .admin-section .m-anim *,
    html.is-mobile .modal-overlay.m-sheet,
    html.is-mobile .modal-overlay.m-sheet .modal-content {
        transition-duration: .16s !important;
        animation-duration: .16s !important;
        animation-delay: 0s !important;
    }
}
`;

    /* ============================ أدوات ============================ */
    const qsa = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    const esc = (v) => (window.escapeHTML ? window.escapeHTML(String(v == null ? '' : v)) : String(v == null ? '' : v));
    const store = {
        get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
    };

    /* موضع المحور: التبويب التالي يظهر من اليسار في RTL */
    const dirSign = () => (root.getAttribute('dir') || document.dir || 'rtl').toLowerCase() === 'rtl' ? -1 : 1;

    const state = {
        keys: [],
        pages: [],
        barKeys: [],
        barBtns: [],
        barW: 0,
        cell: 0,
        n: 1,
        index: 0,
        width: 1,
        busy: false,
        pendingRepaint: false,
        started: false,
        kb: 0,
        jumping: null,
        swipeHi: 0,
        todayTimer: 0
    };

    /* ================== حدود السحب والموضع الوهمية ==================
       لوحات الشريط الخمس هي مدى السحب. اللوحات التي تُفتح من «المزيد» لا تُعرض
       في المسار: تُوضع في خانة وهمية واحدة بعد المزيد، فيسحب المستخدم من أيٍّ
       منها إلى المزيد رجوعاً فقط، ولا يفتح تبويباً مخفياً بالسحب. */
    function vpos(i) { return i <= state.swipeHi ? i : state.swipeHi + 1; }

    function bounds() {
        const sub = state.index > state.swipeHi;
        return sub ? [state.swipeHi, state.swipeHi + 1] : [0, state.swipeHi];
    }

    /* موضع وهمي إلى رقم لوحة: الخانة التي بعد المزيد تعني اللوحة الجارية نفسها */
    function pageForPos(v) {
        const r = clamp(Math.round(v), 0, state.n - 1);
        if (r <= state.swipeHi) return r;
        return state.index > state.swipeHi ? state.index : state.swipeHi;
    }

    /* ================== ترتيب التبويبات ديناميكياً ==================
       نفس مصدر الترتيب الحالي: أزرار شريط الجوال أولاً ثم بقية اللوحات. */
    function readTabsOrder() {
        const order = [];
        const add = (k) => { if (k && order.indexOf(k) === -1) order.push(k); };
        qsa(BAR_SELECTOR + ' .bottom-nav-btn').forEach((btn) => {
            const m = /switchAdminTab\(\s*['"]([^'"]+)['"]/.exec(btn.getAttribute('onclick') || '');
            if (m) add(m[1]);
        });
        qsa('.admin-section').forEach((sec) => add(sec.id.replace(/^admin-/, '')));
        return order;
    }

    /* ==================== حقن الأنماط والهيكل ==================== */
    function injectChrome() {
        const style = document.createElement('style');
        style.id = 'royal-mobile-style';
        style.textContent = CSS;
        document.head.appendChild(style);

        const admin = document.getElementById(ADMIN_ID);
        if (!admin) return;

        const head = document.createElement('header');
        head.className = 'm-head';
        head.innerHTML =
            '<span class="m-brand">' + esc(brandName()) + '</span>' +
            '<span class="m-conn"><i class="m-dot"></i><span class="m-conn-text">متصل</span></span>' +
            '<span class="m-time">--:--</span>' +
            '<button type="button" class="m-head-search" aria-label="بحث سريع في النظام"><i class="fa-solid fa-magnifying-glass"></i></button>' +
            '<i class="m-head-prog" aria-hidden="true"></i>';
        admin.insertBefore(head, admin.firstChild);
        headRef = head;

        const netbar = document.createElement('div');
        netbar.className = 'm-netbar';
        netbar.setAttribute('role', 'status');
        netbar.setAttribute('aria-live', 'polite');
        netbar.innerHTML =
            '<span class="m-netbar-ico"><i class="fa-solid fa-wifi"></i></span>' +
            '<span class="m-netbar-body"><b class="m-netbar-title"></b><small class="m-netbar-sub"></small></span>' +
            '<button class="m-netbar-act" type="button" hidden></button>';
        head.insertAdjacentElement('afterend', netbar);
        netRef = netbar;
        netbar.querySelector('.m-netbar-act').addEventListener('click', netAction);

        const conn = head.querySelector('.m-conn');
        if (conn) {
            conn.setAttribute('role', 'button');
            conn.setAttribute('tabindex', '0');
            conn.addEventListener('click', netPillTap);
            conn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); netPillTap(); }
            });
        }

        const fab = document.createElement('button');
        fab.type = 'button';
        fab.className = 'm-fab';
        fab.setAttribute('aria-label', 'العودة إلى أعلى القسم');
        fab.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        document.body.appendChild(fab);
        fabRef = fab;
        fab.addEventListener('click', () => {
            const page = state.pages[state.index];
            if (!page) return;
            const noMotion = REDUCED || document.body.classList.contains('rm-motion-off');
            try { page.scrollTo({ top: 0, behavior: noMotion ? 'auto' : 'smooth' }); }
            catch (e) { page.scrollTop = 0; }
        });

        const indicator = document.createElement('div');
        indicator.className = 'm-ind';
        const bar = document.querySelector(BAR_SELECTOR);
        if (bar) bar.appendChild(indicator);
    }
    let headRef = null;
    let fabRef = null;

    function syncFab() {
        if (!fabRef) return;
        const page = state.pages[state.index];
        fabRef.classList.toggle('on', !!page && page.scrollTop > 480);
    }

    function brandName() {
        const t = (document.title || '').split('-')[0].trim();
        return t || 'إدارة رويال';
    }

    /* ================== حالة الاتصال وآخر مزامنة ==================
       app.js يبثّ royal-net (قناة فايربيس)، royal-queue (عدّاد الصندوق الأسود)،
       royal-sync (آخر دفعة وصلت). هنا نعرضها بوضوح بدل تخمين navigator.onLine. */
    const NET_ICON = {
        offline: 'fa-wifi',
        pending: 'fa-cloud-arrow-up',
        syncing: 'fa-circle-notch',
        back: 'fa-circle-check',
        info: 'fa-signal'
    };
    let netRef = null;
    let netManual = false;
    let netTimer = 0;
    let netPrevOnline = null;
    let netBootAt = 0;
    let netSeenLive = false;
    let netBootOffline = false;
    let netSawOffline = false;

    function netReadout() {
        const n = window.royalNet || {};
        const online = (typeof n.online === 'boolean') ? n.online : (navigator.onLine !== false);
        let queue = 0;
        try {
            queue = typeof window.royalQueueLen === 'function' ? window.royalQueueLen() : (window.royalQueue || 0);
        } catch (e) { queue = 0; }
        return { online, queue, last: window.royalLastSync || 0 };
    }

    function hm(ts) {
        const d = new Date(ts);
        const p = (v) => (v < 10 ? '0' + v : '' + v);
        return p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function lastLine(st) {
        return st.last ? 'آخر مزامنة ' + hm(st.last) : 'لم تتم مزامنة بعد';
    }

    function netSummary(st) {
        return lastLine(st) + ' · ' + (st.queue > 0 ? moves(st.queue) + ' بانتظار الرفع' : 'كل الحركات مرفوعة');
    }

    function moves(n) {
        return (n >= 3 && n <= 10) ? n + ' حركات' : n + ' حركة';
    }

    function paintPill(st, connecting) {
        if (!headRef) return;
        const conn = headRef.querySelector('.m-conn');
        const dot = headRef.querySelector('.m-dot');
        const txt = headRef.querySelector('.m-conn-text');
        if (!conn || !dot || !txt) return;
        dot.classList.toggle('off', !st.online && !connecting);
        dot.classList.toggle('sync', connecting || (st.online && st.queue > 0));
        txt.textContent = connecting ? 'اتصال…' : (!st.online ? 'أوفلاين' : (st.queue > 0 ? 'مزامنة ' + st.queue : 'متصل'));
        conn.dataset.net = connecting ? 'pending' : (!st.online ? 'offline' : (st.queue > 0 ? 'pending' : 'ok'));
        conn.setAttribute('aria-label', 'حالة الاتصال: ' + txt.textContent + ' — ' + netSummary(st));
        conn.setAttribute('title', 'اضغط لتفاصيل الاتصال والمزامنة');
    }

    function paintNet(state, title, sub, actLabel) {
        const bar = netRef;
        if (!bar) return;
        bar.dataset.state = state;
        const ico = bar.querySelector('.m-netbar-ico i');
        const t = bar.querySelector('.m-netbar-title');
        const s = bar.querySelector('.m-netbar-sub');
        const btn = bar.querySelector('.m-netbar-act');
        if (ico) ico.className = 'fa-solid ' + (NET_ICON[state] || 'fa-circle-info');
        if (t) t.textContent = title;
        if (s) s.textContent = sub || '';
        if (btn) {
            btn.hidden = !actLabel;
            if (actLabel) btn.textContent = actLabel;
        }
        bar.classList.add('m-show');
    }

    function hideNet() {
        if (netRef) netRef.classList.remove('m-show');
    }

    function netFlash(state, title, sub, ms, actLabel) {
        netManual = true;
        paintNet(state, title, sub, actLabel);
        clearTimeout(netTimer);
        if (ms) netTimer = setTimeout(() => { netManual = false; renderNet(); }, ms);
    }

    function renderNet() {
        if (!headRef || !netRef) return;
        const st = netReadout();
        const liveNow = !!(window.royalNet && window.royalNet.live);
        /* أول ثوان بعد الإقلاع ليست انقطاعاً: قناة فايربيس لم تُفتح بعد.
           نعرضها «جارٍ الاتصال» لا شريطاً أحمر يُفزع بلا سبب، وبعد مهلة
           قصيرة نصدُق ونعلن الانقطاع بدل التظاهر الأبدي بالانتظار. */
        const connecting = (navigator.onLine !== false) && !liveNow && !netSeenLive &&
            (Date.now() - netBootAt < 12000);
        paintPill(st, connecting);
        if (netManual) return;
        if (connecting) {
            paintNet('syncing', 'جارٍ الاتصال بالسحابة…', 'التحقق من قناة المزامنة', '');
        } else if (!st.online) {
            netSawOffline = true;
            paintNet('offline', 'لا يوجد اتصال', netSummary(st), 'إعادة المحاولة');
        } else if (st.queue > 0) {
            paintNet('pending', 'بانتظار الرفع — ' + moves(st.queue), lastLine(st), 'مزامنة الآن');
        } else {
            hideNet();
        }
    }

    function netChanged() {
        const st = netReadout();
        const liveNow = !!(window.royalNet && window.royalNet.live);
        /* لا نعلن «عاد الاتصال» في أول اتصال طبيعي بعد فتح التطبيق،
           بل فقط بعد انقطاع رآه المستخدم أو إقلاع بلا شبكة. */
        if (netPrevOnline === false && st.online && (netSeenLive || netBootOffline || netSawOffline)) {
            if (st.queue > 0) {
                netFlash('syncing', 'عاد الاتصال — جاري رفع ' + moves(st.queue), lastLine(st), 15000);
            } else {
                netFlash('back', 'عاد الاتصال', 'كل شيء متزامن · ' + lastLine(st), 4200);
            }
        }
        if (liveNow) {
            netSeenLive = true;
            netSawOffline = false;
        }
        netPrevOnline = st.online;
        renderNet();
    }

    function mirrorConnection() { netChanged(); }

    function netAction() {
        if (!navigator.onLine) {
            if (window.showAlert) window.showAlert('لا يزال الاتصال منقطعاً — حركاتك محفوظة وستُرفع تلقائياً عند عودته.', 'warning');
            return;
        }
        if (typeof window.processBlackBox !== 'function') {
            if (window.showAlert) window.showAlert('محرك المزامنة لم يكتمل تحميله بعد.', 'warning');
            return;
        }
        const n = netReadout().queue;
        if (!n) { netManual = false; renderNet(); return; }
        netFlash('syncing', 'جاري رفع ' + moves(n) + ' إلى السحابة…', 'اترك التطبيق مفتوحاً لحظات', 0);
        window.processBlackBox();
    }

    function netPillTap() {
        const st = netReadout();
        if (!st.online) netFlash('offline', 'لا يوجد اتصال', netSummary(st), 4600, 'إعادة المحاولة');
        else if (st.queue > 0) netFlash('pending', 'بانتظار الرفع — ' + moves(st.queue), lastLine(st), 4600, 'مزامنة الآن');
        else netFlash('back', 'الاتصال سليم', netSummary(st), 4200);
    }

    /* وقت بغداد الحيّ للترويسة. كانت الخانة تبقى «--:--» حتى أول تحديث بيانات
       ثم تتجمد على لحظته، وكانت تقرأ منطقة الجهاز لا منطقة العمل. */
    function headClockText() {
        try {
            const d = (typeof window.getRealTime === 'function' ? window.getRealTime().obj : null) || new Date();
            const s = d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Baghdad', hour: '2-digit', minute: '2-digit', hour12: false });
            if (s) return s;
        } catch (e) { /* احتياط محلي أدناه */ }
        const d = new Date();
        const p = (v) => (v < 10 ? '0' + v : '' + v);
        return p(d.getHours()) + ':' + p(d.getMinutes());
    }
    function markSyncTime() {
        if (!headRef) return;
        const el = headRef.querySelector('.m-time');
        if (el) el.textContent = headClockText();
    }
    function bindHeadClock() {
        if (!headRef) return;
        const el = headRef.querySelector('.m-time');
        if (!el) return;
        const tick = () => {
            const s = headClockText();
            if (s && s !== el.textContent) el.textContent = s;
        };
        tick();
        setInterval(tick, 20000);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) tick();
        });
    }

    /* ==================== مواضع التمرير والحركات ==================== */
    /* العرض يقاس من الحاوية: الصفحة المخفية clientWidth لها صفر، والتبويب المستعاد قد لا يكون مفعّلاً بعد */
    function cacheWidth() {
        const host = document.querySelector('#' + ADMIN_ID + ' .admin-content') || document.getElementById(ADMIN_ID);
        const page = state.pages[state.index];
        const w = (page && page.clientWidth) || (host && host.clientWidth) || window.innerWidth;
        state.width = Math.max(1, w);
        root.style.setProperty('--m-w', state.width + 'px');
    }

    /* كل لوحة تحمل رقمها --m-i داخل ورقة أنماط مستقلة، فلا يمسحها style.cssText = '' */
    function paintPageIndexes() {
        let el = document.getElementById('royal-mobile-geo');
        if (!el) {
            el = document.createElement('style');
            el.id = 'royal-mobile-geo';
            document.head.appendChild(el);
        }
        let css = '';
        for (let i = 0; i < state.pages.length; i++) {
            const p = state.pages[i];
            if (p && p.id) css += '#' + ADMIN_ID + ' #' + p.id + '{--m-i:' + vpos(i) + '}';
        }
        css += 'html.is-mobile{--m-dir:' + dirSign() + '}';
        if (el.textContent !== css) el.textContent = css;
    }

    /* المصدر الوحيد للظهور والحالة الجارية */
    let calcOk = true;
    /* رسم مباشر أثناء الحركة فقط. حين يكون مفتوحاً لا نكتب --m-p على وسم html:
       متغيّر موروث على الجذر يُبطل حساب الأنماط للشجرة كلها في كل إطار — وهو
       ثِقل السحب نفسه. عند السكون يُغلق ويعود الحساب لورقة الأنماط كما كان. */
    let motionDirect = false;
    let paintQueued = 0;

    /* يدقّ بعد حقن الأنماط: يتأكد أن translate3d(calc(var)) يُحسب فعلاً في هذا المتصفح */
    function probeCalc() {
        const host = document.getElementById(ADMIN_ID) || document.body;
        const probe = document.createElement('div');
        probe.className = 'm-calc-probe';
        host.appendChild(probe);
        let shift = 0;
        try {
            const t = getComputedStyle(probe).transform;
            shift = t && t !== 'none' ? new DOMMatrix(t).e : 0;
        } catch (e) { shift = 0; }
        probe.remove();
        calcOk = shift === 20;
    }

    function paintTransforms() {
        if (!motionDirect) root.style.setProperty('--m-p', phys.P.toFixed(4));
        const P = phys.P;
        /* أثناء السحب وحده تُعرض اللوحة الجارية وجارتها القريبة (بفاصل أقل من
           وحدة كاملة). busy ليس حركة: كان يترك لوحة مجاورة معروضة بعد الإقلاع
           وبعد أي إعادة رسم، فكانت «المالية» تطل تحت اليومية بلا سبب. */
        const live = motionDirect || phys.touching;
        for (let i = 0; i < state.pages.length; i++) {
            const el = state.pages[i];
            if (!el) continue;
            /* اللوحات التي تشترك الخانة الوهمية نفسها لا تُعرض معاً: الجارية وحدها */
            const v = vpos(i);
            const seen = live
                ? Math.abs(v - P) <= 0.999 && (v <= state.swipeHi || i === state.index)
                : i === state.index;
            if (seen !== el.classList.contains('m-seen')) {
                el.classList.toggle('m-seen', seen);
                /* الوجهة تُصفَّر لحظة ظهورها، في المهمة نفسها وقبل أي رسم:
                   لا يراها المستخدم منزلقة وهي عند أسفلها ثم تقفز */
                if (seen) resetScrollOnReveal(el);
            }
            const cur = i === state.index;
            if (cur !== el.classList.contains('m-cur')) el.classList.toggle('m-cur', cur);
            if (seen && state.keys[i] === 'invoice-designer') ensureStudioFonts();
            if (!calcOk || motionDirect) {
                const d = v - P;
                el.style.transform = seen
                    ? 'translate3d(' + (dirSign() * d * state.width).toFixed(2) + 'px,0,0)'
                    : '';
                el.style.opacity = seen ? String(1 - Math.min(1, Math.abs(d)) * 0.2) : '';
            }
        }
        /* للمؤشّر دورته النابضة الخاصة: نداؤه كل إطار من هنا يجعله يرسم مرتين */
        if (!ind.raf) paintIndicator();
    }

    /* إقفال الرسم المباشر: تُكتب النهاية في --m-p أولاً ثم تُمسح الأنماط المضمّنة،
       وكلاهما في المهمة نفسها فلا يرى المستخدم لحظة انتقال بين الطريقتين */
    function settleDirect() {
        if (!motionDirect) return;
        motionDirect = false;
        root.style.setProperty('--m-p', phys.P.toFixed(4));
        for (let i = 0; i < state.pages.length; i++) {
            const el = state.pages[i];
            if (!el) continue;
            el.style.removeProperty('transform');
            el.style.removeProperty('opacity');
            /* عند السكون لا تبقى إلا اللوحة الجارية معروضة */
            const cur = i === state.index;
            if (cur !== el.classList.contains('m-cur')) el.classList.toggle('m-cur', cur);
            if (!cur && el.classList.contains('m-seen')) el.classList.remove('m-seen');
        }
    }

    /* إزاحة لوحة واحدة سطرياً فوق حساب الشريط: الحساب يبقى في ورقة الأنماط لبقية اللوحات */
    function setOffset(el, d) {
        if (!el) return;
        el.style.setProperty('--m-d', d.toFixed(4));
        el.style.transform = 'translate3d(' + (dirSign() * d * state.width).toFixed(2) + 'px,0,0)';
        el.style.opacity = String(1 - Math.min(1, Math.abs(d)) * 0.2);
    }

    function clearOffsets() {
        for (let i = 0; i < state.pages.length; i++) {
            const el = state.pages[i];
            if (!el) continue;
            el.style.removeProperty('--m-d');
            el.style.removeProperty('transform');
            el.style.removeProperty('opacity');
        }
    }

    /* خطوط الاستوديو تُنزَّل أول مرة تدخل لوحة الاستوديو المدى — لا قبل فتح الإدارة */
    function ensureStudioFonts() {
        if (window.__mStudioFonts || !window.ROYAL_STUDIO_FONTS) return;
        window.__mStudioFonts = true;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = window.ROYAL_STUDIO_FONTS;
        document.head.appendChild(link);
    }

    /* المؤشر يتحرك من نفس الموضع العشري للصفحات.
       قياس الشريط محفوظ: قراءة clientWidth داخل كل إطار تُجبر المتصفح على تخطيط كامل
       وهو ما كان يُظهر التأخير في بداية السحب. */
    /* المؤشر كتلة سائل: تلاحق الإصبع بثابت زمني قصير (~55م.س)، تنضغط في اتجاه
       الحركة، وتستقر مع الصفحة نفسها. النابض السابق كان يتأخر عن الوجهة نحو
       نصف ثانية بعد توقف الإصبع — وهو التأخير الذي وصفه المستخدم. */
    const ind = { pos: 0, vel: 0, raf: 0, init: false, at: 0 };

    function paintIndicator() {
        const el = document.querySelector('.m-ind');
        const bar = document.querySelector(BAR_SELECTOR);
        if (!el || !bar) return;
        const M = Math.max(1, state.barBtns.length);
        const pad = 5;
        if (!state.cell) {
            const w = bar.clientWidth;
            if (!w) return;
            state.barW = w;
            state.cell = (w - pad * 2) / M;
        }
        const target = clamp(barPosFor(phys.P), 0, M - 1);
        const t = now();
        if (!ind.init) {
            ind.init = true;
            ind.pos = target;
            ind.vel = 0;
            ind.at = t;
        } else {
            const dt = ind.at ? clamp(t - ind.at, 1, 64) : 16;
            const k = 1 - Math.exp(-dt / 55);
            const prev = ind.pos;
            ind.pos += (target - ind.pos) * k;
            ind.vel = (ind.pos - prev) / dt;
            ind.at = t;
        }
        const cell = state.cell;
        const left = dirSign() < 0 ? (state.barW - pad - (ind.pos + 1) * cell) : (pad + ind.pos * cell);
        const sq = Math.min(0.24, Math.abs(ind.vel) * 55);
        el.style.width = cell + 'px';
        el.style.transform = 'translate3d(' + left.toFixed(2) + 'px,0,0) scale(' +
            (1 + sq).toFixed(3) + ',' + (1 - sq * 0.5).toFixed(3) + ')';
        el.style.setProperty('--m-sq', sq.toFixed(3));
        /* توهّج الأيقونة يتبع أقرب تبويب لنسبة السحب نفسها، لا الوجهة النهائية */
        const bi = clamp(Math.round(target), 0, M - 1);
        state.barBtns.forEach((b, i) => b.classList.toggle('m-hi', i === bi));
        if (Math.abs(target - ind.pos) > 0.0012) {
            if (!ind.raf) ind.raf = requestAnimationFrame(() => { ind.raf = 0; paintIndicator(); });
        } else {
            ind.pos = target;
            ind.vel = 0;
            if (ind.raf) { cancelAnimationFrame(ind.raf); ind.raf = 0; }
        }
    }

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    function barIndexOfPage(pageIdx) {
        const key = state.keys[pageIdx];
        let i = state.barKeys.indexOf(key);
        if (i === -1) i = state.barKeys.indexOf('more-menu');
        if (i === -1) i = 0;
        return i;
    }

    function barPosFor(P) {
        const lo = clamp(Math.floor(P), 0, state.n - 1);
        const hi = clamp(lo + 1, 0, state.n - 1);
        const frac = clamp(P - lo, 0, 1);
        return barIndexOfPage(lo) + (barIndexOfPage(hi) - barIndexOfPage(lo)) * frac;
    }

    /* ====================== محرك السحب الفيزيائي ====================== */
    const phys = {
        touching: false,
        axis: 'none',
        startX: 0, startY: 0,
        P0: 0, P: 0,
        samples: [],
        raf: 0
    };

    const OMEGA = 15;

    function rubber(v) {
        const x = Math.abs(v);
        return (1 - 1 / (x * 0.55 + 1)) * Math.sign(v);
    }

    function onPointerStart(e) {
        if (!state.started || document.body.classList.contains('m-sheet-open')) return;
        const touches = e.touches;
        if (touches && touches.length > 1) {
            /* pinch أو إصبعان: نوقف السحب ونثبت أقرب موضع بدون قفزة */
            if (phys.touching || phys.raf) {
                phys.touching = false;
                phys.axis = 'none';
                document.body.classList.remove('m-dragging');
                springTo(Math.round(phys.P), velocity());
            }
            return;
        }
        const admin = document.getElementById(ADMIN_ID);
        if (!admin || !admin.classList.contains('active-screen')) return;
        if (e.target.closest('.m-ind, .modal-overlay, #workspace-container, [data-m-no-drag]')) return;

        cacheWidth();
        stopSpring();
        phys.touching = true;
        phys.axis = 'none';
        phys.startX = touches ? touches[0].clientX : e.clientX;
        phys.startY = touches ? touches[0].clientY : e.clientY;
        phys.P0 = phys.P;
        phys.samples = [{ t: now(), x: phys.P }];
        setBusy(true);
    }

    function onPointerMove(e) {
        if (!phys.touching) return;
        if (e.touches && e.touches.length > 1) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = x - phys.startX;
        const dy = y - phys.startY;

        if (phys.axis === 'none') {
            if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
            if (Math.abs(dy) > Math.abs(dx)) { abortGesture(); return; }
            if (blocksHorizontalScroll(e.target, dx)) { abortGesture(); return; }
                  phys.axis = 'x';
            motionDirect = true;
            document.body.classList.add('m-dragging');
            setBusy(true);
            /* اللوحة المجاورة بدأت تُكشف: تبدأ بطاقاتها تُبنى من هذه اللحظة،
               فتُرى وهي تتكوّن أثناء السحب بدل أن تظهر كاملة ثم تُعاد */
            const base = Math.round(phys.P0);
            const dP = (dirSign() < 0 ? dx : -dx) / state.width;
            const want = base + (dP > 0 ? 1 : -1);
            if (want >= 0 && want <= state.swipeHi) {
                const ni = pageForPos(want);
                if (ni !== state.index && vpos(ni) === want) {
                    enterAnimate(state.pages[ni]);
                }
            }
        }

        /* 1:1 مع الإصبع + مرونة عند الحدود — والحد هنا هو مدى الشريط لا كل اللوحات */
        const lim = bounds();
        const step = dx / state.width;
        let raw = dirSign() < 0 ? phys.P0 + step : phys.P0 - step;
        let over = 0;
        if (raw < lim[0]) { over = raw - lim[0]; raw = lim[0]; }
        if (raw > lim[1]) { over = raw - lim[1]; raw = lim[1]; }
        phys.P = clamp(raw + rubber(over), lim[0] - 0.5, lim[1] + 0.5);
        phys.samples.push({ t: now(), x: phys.P });
        while (phys.samples.length > 2 && now() - phys.samples[0].t > 100) phys.samples.shift();
        /* لمسة واحدة تُطلق مئات الأحداث في الثانية على شاشة ١٢٠هرتز: رسم واحد
           لكل إطار كافٍ، والزائد رسم مكرّر لنفس الإصبع */
        requestPaint();
    }

    function requestPaint() {
        if (paintQueued) return;
        paintQueued = requestAnimationFrame(() => { paintQueued = 0; paintTransforms(); });
    }

    function cancelPaint() {
        if (!paintQueued) return;
        cancelAnimationFrame(paintQueued);
        paintQueued = 0;
    }

    /* لا نبدأ سحب التبويبات إذا بدأت اللمسة داخل منطقة تمرير أفقي ولم تصل لحافتها */
    function blocksHorizontalScroll(target, dx) {
        const scroller = target && target.closest ? target.closest('table, .cart-table, .invoices-table, [style*="overflow"], .admin-filters, .icon-picker-grid, #workspace-container') : null;
        if (!scroller) return false;
        if (scroller.scrollWidth <= scroller.clientWidth + 1) return false;
        const atStart = scroller.scrollLeft <= 0;
        const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;
        const goingForward = dx < 0;
        if (dirSign() < 0) return goingForward ? !atStart : !atEnd;
        return goingForward ? !atEnd : !atStart;
    }

    function onPointerEnd(e) {
        /* إصبع ما زال على الشاشة: لا نهتم بتحرير الحركة */
        if (e && e.touches && e.touches.length > 0) return;
       if (!phys.touching) {
            if (state.busy) { setBusy(false); setTimeout(flushRepaint, 600); }
            return;
        }
        phys.touching = false;
        document.body.classList.remove('m-dragging');
        if (phys.axis !== 'x') { finishGesture(); return; }

        const v = velocity();
        const lim = bounds();
        let target = Math.round(phys.P + v * 0.2);
        target = clamp(target, phys.P0 - 1, phys.P0 + 1);
        target = clamp(target, lim[0], lim[1]);
        springTo(target, v);
    }

    function velocity() {
        const t = now();
        const last = phys.samples[phys.samples.length - 1];
        if (!last || t - last.t > 90) return 0;
        let i = phys.samples.length - 1;
        while (i > 0 && t - phys.samples[i].t < 100) i--;
        const a = phys.samples[i];
        const dt = (last.t - a.t) / 1000;
        if (dt <= 0.008) return 0;
        return (last.x - a.x) / dt;
    }

    /* نابض مثبّت حرجاً: x(s) = t + (A + B·s)·e^(−ω·s) */
    function springTo(t, v0) {
        stopSpring();
        const A = phys.P - t;
        const B = v0 + OMEGA * A;
        const s0 = now();
        let done = false;
        const step = () => {
            const s = (now() - s0) / 1000;
            const e = Math.exp(-OMEGA * s);
            const x = t + (A + B * s) * e;
            const v = e * (B - OMEGA * (A + B * s));
            phys.P = x;
            paintTransforms();
            if (Math.abs(x - t) < 0.0005 && Math.abs(v) < 0.01 || s > 1.5) {
                phys.P = t;
                paintTransforms();
                done = true;
                commit(t);
                return;
            }
            phys.raf = requestAnimationFrame(step);
        };
        phys.raf = requestAnimationFrame(step);
    }

    function stopSpring() { if (phys.raf) { cancelAnimationFrame(phys.raf); phys.raf = 0; } }

      function abortGesture() {
        const moved = Math.abs(phys.P - Math.round(phys.P)) > 0.001;
        phys.touching = false;
        phys.axis = 'none';
        document.body.classList.remove('m-dragging');
        /* سحب عمودي عادي: لا نابض ولا commit ولا حركة دخول */
        if (moved) { springTo(Math.round(phys.P), 0); return; }
        phys.P = Math.round(phys.P);
        settleDirect();
        paintTransforms();
    }

    function finishGesture() { setBusy(false); setTimeout(flushRepaint, 260); }

    function commit(vPos) {
        const i = pageForPos(vPos);
        phys.P = vpos(i);
        state.index = i;
        cancelPaint();
        paintTransforms();
        settleDirect();
        document.body.classList.remove('m-dragging');
        const key = state.keys[i];
        if (key && key !== currentTabKey()) routeOriginal(key);
        syncA11y();
        onArrive(key);
        setBusy(false);
        /* التكوين بدأ لحظة كشف اللوحة أثناء السحب — لا نعيده هنا حتى لا تهتز
           الصفحة كاملة ثم تُبنى. اللوحات الأخرى (ومنها التي رجعنا عنها)
           تُنظَّف لتُبنى من جديد في زيارتها القادمة. */
        resetOtherEntrances(state.pages[i]);
        setTimeout(() => { flushRepaint(); syncFlow(); }, 520);
    }

    /* نستدعي دالة التوجيه الأصلية مباشرة: التفاف الطبقة يفعّل الحركة، والسحب هنا يفعّلها بنفسه */
    function routeOriginal(key) {
        const fn = window.switchAdminTab;
        if (typeof fn !== 'function') return;
        (fn.__mOriginal || fn).call(window, key, 'none');
    }

    function currentTabKey() {
        const el = document.querySelector('.admin-section.active');
        return (el ? el.id.replace(/^admin-/, '') : null) || store.get('admin_tab') || state.keys[0];
    }

    function setBusy(v) {
        state.busy = v;
        document.body.classList.toggle('m-dragging', v && phys.axis === 'x');
        const lo = clamp(Math.floor(phys.P) - 1, 0, state.n - 1);
        const hi = clamp(Math.ceil(phys.P) + 1, 0, state.n - 1);
        for (let i = lo; i <= hi; i++) {
                        if (state.pages[i]) state.pages[i].style.willChange = (v && phys.axis === 'x') ? 'transform' : 'auto';
        }
    }

    const now = () => (window.performance && performance.now ? performance.now() : Date.now());

    function bindGestures() {
        const admin = document.getElementById(ADMIN_ID);
        if (!admin) return;
        admin.addEventListener('touchstart', onPointerStart, { passive: true });
        admin.addEventListener('touchmove', onPointerMove, { passive: true });
        admin.addEventListener('touchend', onPointerEnd, { passive: true });
        admin.addEventListener('touchcancel', onPointerEnd, { passive: true });
        /* دعم القلم/الماوس على التابلت دون المساس بلمسة الهاتف */
        admin.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') onPointerStart(e); }, { passive: true });
        admin.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch' && phys.touching) onPointerMove(e); }, { passive: true });
        admin.addEventListener('pointerup', (e) => { if (e.pointerType !== 'touch') onPointerEnd(); }, { passive: true });
        admin.addEventListener('pointercancel', () => { if (phys.touching) onPointerEnd(); }, { passive: true });
    }

    /* ================== منع المطّ داخل اللوحات ==================
       آيفون يمدّ المحتوى عند طرف التمرير ثم يردّه ارتجاجاً، فتقفز الصفحة مع كل
       نزول وصعود. المنع يكون بلمسة واحدة غير سلبية عند الحدّ فقط: حركة رأسية
       أسوأ من أن تُنتج تمريراً فعلياً. ولا تُمسّ حركة السحب الأفقي بين التبويبات. */
    function bindBounceGuard() {
        let sy = 0, sx = 0, sc = null, armed = false;
        /* صندوق التمرير الفعلي في النوافذ ذات الرأس/التذييل الثابت هو جسم النافذة
           لا إطارها: الإطار مثبّت بلا تمرير، وقياسه كان يمنع كل سحب رأسي. */
        const scrollBoxOf = (t) => {
            if (!t || !t.closest) return null;
            const sticky = t.closest('.modal-content.mobile-sticky-modal');
            const sheetBody = sticky ? sticky.querySelector('.modal-body-scrollable') : null;
            if (sheetBody) return sheetBody;
            return t.closest('.modal-body-scrollable') || t.closest('.admin-section, .modal-content');
        };
        document.addEventListener('touchstart', (e) => {
            armed = false;
            if (!e.touches || e.touches.length !== 1) return;
            const t = e.target;
            const box = scrollBoxOf(t);
            if (!box) return;
            sy = e.touches[0].clientY; sx = e.touches[0].clientX;
            sc = box; armed = true;
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            if (!armed || !sc || !e.touches || e.touches.length !== 1) return;
            const dy = e.touches[0].clientY - sy;
            const dx = e.touches[0].clientX - sx;
            if (Math.abs(dy) <= Math.abs(dx)) return;
            const max = sc.scrollHeight - sc.clientHeight;
            if (max <= 1) { e.preventDefault(); return; }
            const atTop = sc.scrollTop <= 0;
            const atEnd = sc.scrollTop >= max - 1;
            if ((dy > 0 && atTop) || (dy < 0 && atEnd)) e.preventDefault();
        }, { passive: false });
        document.addEventListener('touchend', () => { armed = false; }, { passive: true });
        document.addEventListener('touchcancel', () => { armed = false; }, { passive: true });
    }

    /* ================== معاينة سريعة بالضغط المستمر ==================
       ضغط مطوّل على حركة في كشف اليوم يفتح تفاصيلها مؤقتاً، ورفع الإصبع
       يعيدها بانسحاب ناعم. أي سحب يلغي المعاينة كي لا يعطّل التمرير. */
    let peekArm = false;
    function bindQuickPeek() {
        const S = { timer: 0, row: null, x: 0, y: 0, opened: false, el: null };
        const SLOP = 12;
        const MS = 360;
        const clear = () => { clearTimeout(S.timer); S.timer = 0; };
        const close = () => {
            const el = S.el;
            S.opened = false;
            S.el = null;
            if (el) requestSheetClose(el);
        };
        const suppressNextClick = () => {
            const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
            document.addEventListener('click', stop, true);
            setTimeout(() => document.removeEventListener('click', stop, true), 420);
        };
        document.addEventListener('touchstart', (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            const t = e.target;
            const row = t && t.closest ? t.closest('#drill-transactions-body tr') : null;
            if (!row) return;
            if (document.querySelector('#modal-transaction-details.m-sheet.m-on')) return;
            clear();
            S.row = row;
            S.x = e.touches[0].clientX;
            S.y = e.touches[0].clientY;
            S.opened = false;
            S.el = null;
            S.timer = setTimeout(() => {
                if (!S.row || !S.row.isConnected) return;
                S.opened = true;
                peekArm = true;
                setTimeout(() => { peekArm = false; }, 600);
                try { S.row.click(); } catch (err) {}
                S.el = document.getElementById('modal-transaction-details');
            }, MS);
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            if (!S.row || !e.touches || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - S.x;
            const dy = e.touches[0].clientY - S.y;
            if (Math.abs(dx) <= SLOP && Math.abs(dy) <= SLOP) return;
            clear();
            if (S.opened) { suppressNextClick(); close(); }
            S.row = null;
        }, { passive: true });
        const end = () => {
            clear();
            if (S.opened) {
                suppressNextClick();
                close();
            }
            S.row = null;
        };
        document.addEventListener('touchend', end, { passive: true });
        document.addEventListener('touchcancel', end, { passive: true });
    }

    /* ================== سحب للتحديث ==================
       واجهة الشدّ عديمة الأثر على المنطق: عند الإفلات يُعاد رسم اللوحة النشطة
       من الحالة الحية نفسها التي تُحدّثها onValue، فلا كتابة ولا طلب زائد. */
    function bindPullRefresh() {
        const admin = document.getElementById(ADMIN_ID);
        const content = admin && admin.querySelector('.admin-content');
        if (!admin || !content || document.querySelector('.m-ptr')) return;
        const el = document.createElement('div');
        el.className = 'm-ptr';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '<svg viewBox="0 0 24 24">'
            + '<circle class="m-ptr-ring" cx="12" cy="12" r="10.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"></circle>'
            + '<path class="m-ptr-arrow" d="M12 5.5v10.5M8.4 12.4 12 16l3.6-3.6"></path>'
            + '<path class="m-ptr-ok" d="m7.6 12.4 3 3 5.8-6.2"></path>'
            + '</svg><span class="m-ptr-label">اسحب للتحديث</span>';
        document.body.appendChild(el);
        const ring = el.querySelector('.m-ptr-ring');
        const arrow = el.querySelector('.m-ptr-arrow');
        const label = el.querySelector('.m-ptr-label');
        const TH = 62;
        const S = { x: 0, y: 0, sec: null, on: false, armed: false, busy: false, hold: 0 };
        const cancel = () => {
            clearTimeout(S.hold);
            el.classList.remove('on', 'drag', 'busy', 'ok');
            el.style.transform = '';
            ring.setAttribute('stroke-dasharray', '100');
            ring.setAttribute('stroke-dashoffset', '100');
            arrow.style.transform = '';
            label.textContent = 'اسحب للتحديث';
            S.on = false;
            S.armed = false;
            S.sec = null;
        };
        const finish = () => {
            S.busy = false;
            el.classList.remove('busy');
            el.classList.add('ok');
            label.textContent = 'تم التحديث';
            ring.setAttribute('stroke-dasharray', '100');
            ring.setAttribute('stroke-dashoffset', '0');
            S.hold = setTimeout(() => {
                el.classList.remove('ok', 'on');
                el.style.transform = '';
                ring.setAttribute('stroke-dashoffset', '100');
                label.textContent = 'اسحب للتحديث';
            }, 950);
        };
        const refresh = () => {
            S.busy = true;
            clearTimeout(S.hold);
            el.classList.remove('ok', 'drag');
            el.classList.add('on', 'busy');
            el.style.transform = 'translate3d(0, 4px, 0) scale(1)';
            label.textContent = 'جارٍ التحديث…';
            ring.setAttribute('stroke-dasharray', '22 100');
            ring.setAttribute('stroke-dashoffset', '0');
            if (typeof haptic === 'function') haptic(10);
            S.hold = setTimeout(() => {
                try {
                    if (typeof window.updateAdminDashboard === 'function') window.updateAdminDashboard();
                    const sec = admin.querySelector('.admin-section.active');
                    const id = sec ? sec.id : '';
                    if (id === 'admin-logs' && typeof window.renderLogs === 'function') window.renderLogs();
                    else if (id === 'admin-subscriptions' && typeof window.renderAdminSubs === 'function') window.renderAdminSubs();
                } catch (e) {}
                setTimeout(finish, 420);
            }, 200);
        };
        document.addEventListener('touchstart', (e) => {
            if (S.busy || !e.touches || e.touches.length !== 1) return;
            if (!admin.classList.contains('active-screen') || !document.body.classList.contains('m-admin')) return;
            if (document.body.classList.contains('m-sheet-open') || document.querySelector('.m-lk-fx')) return;
            const t = e.target;
            const sec = t && t.closest ? t.closest('#admin-screen .admin-section') : null;
            if (!sec || !sec.classList.contains('active') || sec.scrollTop > 0) return;
            S.x = e.touches[0].clientX;
            S.y = e.touches[0].clientY;
            S.sec = sec;
            S.on = false;
            S.armed = false;
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            if (!S.sec || S.busy || !e.touches || e.touches.length !== 1) return;
            const dy = e.touches[0].clientY - S.y;
            const dx = e.touches[0].clientX - S.x;
            if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || S.sec.scrollTop > 0) {
                if (S.on) cancel();
                S.sec = null;
                return;
            }
            if (dy < 6) return;
            const d = 104 * (1 - Math.exp(-dy / 150));
            const p = Math.min(1, d / TH);
            S.on = true;
            el.classList.add('on', 'drag');
            el.style.transform = 'translate3d(0, ' + (d - 16) + 'px, 0) scale(' + (0.7 + 0.3 * p) + ')';
            ring.setAttribute('stroke-dashoffset', String(Math.round(100 - 100 * p)));
            arrow.style.transform = 'rotate(' + Math.round(p * 180) + 'deg)';
            const nowArmed = p >= 1;
            if (nowArmed !== S.armed) {
                S.armed = nowArmed;
                if (nowArmed && typeof haptic === 'function') haptic(6);
                label.textContent = nowArmed ? 'أفلت للتحديث' : 'اسحب للتحديث';
            }
        }, { passive: true });
        const end = () => {
            if (!S.sec) return;
            const go = S.on && S.armed && !S.busy;
            S.sec = null;
            if (go) refresh(); else if (S.on) { el.classList.remove('drag'); cancel(); }
            S.on = false;
            S.armed = false;
        };
        document.addEventListener('touchend', end, { passive: true });
        document.addEventListener('touchcancel', end, { passive: true });
    }

    /* ================== خيط تقدّم التمرير ==================
       القراءة مرة واحدة في كل إطار تمرير فقط، والكتابة متغيّر واحد على الترويسة.
       لا يلمس التخطيط: scaleX على عنصر مطلق. */
    let syncProgress = () => {};
    function bindScrollProgress() {
        if (!headRef) return;
        let queued = 0;
        const update = () => {
            const page = state.pages[state.index];
            if (!page || !headRef) return;
            const max = page.scrollHeight - page.clientHeight;
            const p = max > 1 ? clamp(page.scrollTop / max, 0, 1) : 0;
            headRef.style.setProperty('--m-prog', p.toFixed(4));
            const y = page.scrollTop;
            headRef.classList.toggle('m-scrolled', y > 6);
            headRef.classList.toggle('m-compact', headRef.classList.contains('m-compact') ? y > 40 : y > 110);
            syncFab();
        };
        syncProgress = update;
        const schedule = () => {
            if (queued) return;
            queued = requestAnimationFrame(() => { queued = 0; update(); });
        };
        state.pages.forEach((p) => { if (p) p.addEventListener('scroll', schedule, { passive: true }); });
        window.addEventListener('resize', schedule, { passive: true });
        update();
    }

    /* ================== لوحة الأوامر: بحث سريع ==================
       قراءة فقط من الجسر. الأسماء تُفكّ ثم تُرمّز قبل الحقن، وتبقى نسخة خام
       للمطابقة مع مفاتيح مركز الزبائن نفسه. */
    const CMD_MAX = 8;
    let cmdEl = null, cmdInput = null, cmdList = null, cmdRows = [], cmdSel = 0, cmdOpen = false, cmdCloseTimer = 0;

    function cmdDecode(v) {
        const s = String(v == null ? '' : v);
        return typeof window.decodeText === 'function' ? window.decodeText(s) : s;
    }
    function cmdNorm(v) {
        return cmdDecode(v).toLowerCase()
            .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
            .replace(/\s+/g, ' ')
            .trim();
    }
    function cmdNum(v) { const n = Number(v); return isFinite(n) ? n : 0; }
    function cmdMoney(n) { return Math.round(cmdNum(n)).toLocaleString('en-US'); }
    function cmdTs(inv) {
        const t = cmdNum(inv && inv.timestamp);
        if (t > 0) return t;
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String((inv && inv.date) || ''));
        return m ? new Date(+m[1], +m[2] - 1, +m[3], 12).getTime() : 0;
    }
    function cmdDay(ms) {
        if (!ms) return '';
        const d = new Date(ms);
        const t = new Date();
        if (d.toDateString() === t.toDateString()) return 'اليوم';
        if (d.toDateString() === new Date(t.getTime() - 86400000).toDateString()) return 'أمس';
        return d.getDate() + '/' + (d.getMonth() + 1);
    }

    function cmdSnapshot() {
        const data = (typeof window.royalDataRead === 'function' && window.royalDataRead()) || {};
        const invoices = Array.isArray(data.invoices) ? data.invoices : [];
        const byId = new Map();
        const customers = new Map();
        invoices.forEach((inv) => {
            if (!inv || !inv.id || byId.has(inv.id)) return;
            byId.set(inv.id, inv);
            const cust = inv.customer || {};
            const name = String(cust.name || '').trim();
            if (!name || name === 'عميل نقدي') return;
            let c = customers.get(name);
            if (!c) customers.set(name, c = { name, phone: '', visits: 0, spent: 0, last: 0, debt: 0 });
            const ph = String(cust.phone || '').trim();
            if (ph && !c.phone) c.phone = ph;
            c.visits += 1;
            c.spent += cmdNum(inv.total);
            c.last = Math.max(c.last, cmdTs(inv));
        });
        (Array.isArray(data.debts) ? data.debts : []).forEach((d) => {
            if (!d) return;
            const name = String(d.name || '').trim();
            const rem = cmdNum(d.remaining);
            if (!name || rem <= 0) return;
            const c = customers.get(name);
            if (c) c.debt += rem;
        });
        return {
            invoices: Array.from(byId.values()).sort((a, b) => cmdTs(b) - cmdTs(a)),
            customers: Array.from(customers.values()).sort((a, b) => b.last - a.last)
        };
    }

    /* عناوين نظيفة للصفحات المخفية: بعض عناوين h2 تجمع شظايا واجهة
       («الاستوديو الفاتورة تقرير الشفت…»)، فالاسم الثابت أصدق هنا. */
    const CMD_LABELS = {
        'invoice-designer': 'مصمم الفاتورة',
        'costs': 'التكاليف التشغيلية',
        'debts': 'سجل الديون',
        'logs': 'سجل الحركات والمراقبة',
        'subscriptions': 'إدارة الاشتراكات',
        'settings': 'تخصيصات النظام'
    };

    function cmdSections() {
        return state.keys.map((k, i) => {
            const page = state.pages[i];
            const bi = state.barKeys ? state.barKeys.indexOf(k) : -1;
            const btn = bi >= 0 ? state.barBtns[bi] : null;
            const span = btn && btn.querySelector('span');
            let label = span ? span.textContent.trim() : '';
            if (!label && CMD_LABELS[k]) label = CMD_LABELS[k];
            if (!label && page) {
                const h = page.querySelector('h2');
                if (h) label = h.textContent.replace(/\s+/g, ' ').trim();
            }
            if (!label) label = k;
            if (label.length > 28) label = label.slice(0, 27).trim() + '…';
            const icon = btn && btn.querySelector('i') ? btn.querySelector('i').className : 'fa-solid fa-layer-group';
            return { key: k, label, icon };
        });
    }

    function cmdActions() {
        const light = document.body.classList.contains('rg-light');
        const act = [];
        if (window.RoyalGlass && typeof window.RoyalGlass.set === 'function') {
            act.push({
                id: 'theme',
                label: light ? 'الوضع الليلي' : 'الوضع النهاري',
                icon: 'fa-solid ' + (light ? 'fa-moon' : 'fa-sun'),
                hint: 'تبديل فوري يُحفظ على هذا الجهاز',
                run: () => window.RoyalGlass.set({ mode: light ? 'dark' : 'light' })
            });
        }
        act.push({
            id: 'refresh',
            label: 'تحديث اللوحة',
            icon: 'fa-solid fa-rotate',
            hint: 'إعادة الرسم من البيانات الحيّة',
            run: () => { if (typeof window.updateAdminDashboard === 'function') window.updateAdminDashboard(); }
        });
        act.push({
            id: 'csv',
            label: 'تصدير الزبائن CSV',
            icon: 'fa-solid fa-file-csv',
            hint: 'ملف يُنزَّل من تبويب الزبائن',
            run: () => {
                window.switchAdminTab('customers', 'none');
                setTimeout(() => {
                    const b = document.getElementById('ri-export');
                    if (b) b.click();
                }, 520);
            }
        });
        return act;
    }

    function cmdResults(q) {
        const n = cmdNorm(q);
        const secs = cmdSections();
        const acts = cmdActions();
        const secRow = (s) => ({ kind: 'tab', key: s.key, label: s.label, icon: s.icon, hint: 'انتقال إلى القسم' });
        const actRow = (a) => ({ kind: 'act', id: a.id, label: a.label, icon: a.icon, hint: a.hint });
        if (!n) {
            return [['الأقسام', secs.map(secRow)], ['إجراءات سريعة', acts.map(actRow)]];
        }
        const snap = cmdSnapshot();
        const hit = (v) => cmdNorm(v).indexOf(n) !== -1;
        const cRows = [];
        snap.customers.forEach((c) => {
            if (cRows.length >= CMD_MAX) return;
            if (!hit(c.name) && !hit(c.phone)) return;
            const meta = [c.visits + ' زيارة', c.phone || '', c.debt > 0 ? 'دين ' + cmdMoney(c.debt) + ' د.ع' : ''].filter(Boolean).join(' · ');
            cRows.push({ kind: 'cust', name: c.name, label: cmdDecode(c.name), icon: 'fa-solid fa-user', hint: meta });
        });
        const iRows = [];
        snap.invoices.forEach((inv) => {
            if (iRows.length >= CMD_MAX) return;
            const cust = inv.customer || {};
            const name = String(cust.name || '').trim();
            const dn = String(inv.dailyNumber || '').trim();
            const id = String(inv.id);
            if (!(hit(id) || hit(dn) || hit(name) || hit(cust.phone))) return;
            const short = dn || id.slice(-6);
            iRows.push({
                kind: 'inv',
                id,
                label: name ? cmdDecode(name) : 'عميل نقدي',
                icon: 'fa-solid fa-receipt',
                hint: '#' + cmdDecode(short) + ' · ' + cmdMoney(inv.total) + ' د.ع · ' + cmdDay(cmdTs(inv))
            });
        });
        return [
            ['زبائن', cRows],
            ['فواتير', iRows],
            ['أقسام', secs.filter((s) => hit(s.label) || hit(s.key)).map(secRow)],
            ['إجراءات', acts.filter((a) => hit(a.label)).map(actRow)]
        ];
    }

    function cmdPaintSel() {
        const nodes = cmdList ? cmdList.querySelectorAll('.m-cmd-row') : [];
        for (let i = 0; i < nodes.length; i++) {
            const on = i === cmdSel;
            nodes[i].classList.toggle('sel', on);
            if (on) nodes[i].setAttribute('aria-selected', 'true');
            else nodes[i].removeAttribute('aria-selected');
        }
        const cur = nodes[cmdSel];
        if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    }

    function cmdDraw() {
        if (!cmdList) return;
        const groups = cmdResults(cmdInput.value || '');
        let html = '';
        let i = 0;
        cmdRows = [];
        groups.forEach((g) => {
            const rows = g[1];
            if (!rows.length) return;
            html += '<div class="m-cmd-grp">' + esc(g[0]) + '</div>';
            rows.forEach((r) => {
                let attrs = ' data-kind="' + esc(r.kind) + '"';
                if (r.kind === 'tab') attrs += ' data-key="' + esc(r.key) + '"';
                if (r.kind === 'cust') attrs += ' data-name="' + esc(r.name) + '"';
                if (r.kind === 'inv') attrs += ' data-id="' + esc(r.id) + '"';
                if (r.kind === 'act') attrs += ' data-act="' + esc(r.id) + '"';
                html += '<button type="button" class="m-cmd-row" style="--i:' + i + '"' + attrs + '>'
                    + '<span class="m-cmd-ic"><i class="' + esc(r.icon) + '"></i></span>'
                    + '<span class="m-cmd-txt"><b>' + esc(r.label) + '</b><small>' + esc(r.hint) + '</small></span>'
                    + '<i class="fa-solid fa-chevron-left m-cmd-go"></i></button>';
                cmdRows.push(r);
                i += 1;
            });
        });
        if (!html) html = '<div class="m-cmd-empty"><i class="fa-solid fa-magnifying-glass"></i><b>لا نتائج مطابقة</b><span>جرّب اسماً أو رقم هاتف أو رقم فاتورة</span></div>';
        cmdList.innerHTML = html;
        cmdSel = 0;
        cmdPaintSel();
    }

    function cmdRun(row) {
        if (!row) return;
        closeCmd();
        if (row.kind === 'tab') { setTimeout(() => window.switchAdminTab(row.key, 'none'), 60); return; }
        if (row.kind === 'act') {
            const a = cmdActions().find((x) => x.id === row.id);
            if (a) setTimeout(a.run, 60);
            return;
        }
        if (row.kind === 'inv') {
            setTimeout(() => {
                if (typeof window.viewTransactionDetails === 'function') window.viewTransactionDetails(row.id);
            }, 150);
            return;
        }
        if (row.kind === 'cust') {
            setTimeout(() => {
                let opened = false;
                if (window.RoyalInsight && typeof window.RoyalInsight.openCustomer === 'function') {
                    try { window.RoyalInsight.openCustomer(row.name); opened = !!document.querySelector('.ri-sheet'); } catch (e) { opened = false; }
                }
                if (opened) return;
                window.switchAdminTab('customers', 'none');
                setTimeout(() => {
                    const sec = document.getElementById('admin-customers');
                    const allBtn = sec && sec.querySelector('[data-period="all"]');
                    if (allBtn) allBtn.click();
                    const inp = document.getElementById('ri-search');
                    if (inp) {
                        inp.value = cmdDecode(row.name);
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, 420);
            }, 130);
        }
    }

    function cmdBuild() {
        if (cmdEl) return;
        cmdEl = document.createElement('div');
        cmdEl.className = 'm-cmd';
        cmdEl.setAttribute('aria-hidden', 'true');
        cmdEl.innerHTML =
            '<div class="m-cmd-scrim" data-cmd-close></div>' +
            '<div class="m-cmd-card" role="dialog" aria-modal="true" aria-label="بحث سريع">' +
                '<div class="m-cmd-bar">' +
                    '<i class="fa-solid fa-magnifying-glass"></i>' +
                    '<input class="m-cmd-input" type="search" placeholder="زبون، فاتورة، قسم أو إجراء…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label="بحث سريع">' +
                    '<button type="button" class="m-cmd-x" data-cmd-close aria-label="إغلاق البحث"><i class="fa-solid fa-xmark"></i></button>' +
                '</div>' +
                '<div class="m-cmd-list" role="listbox" aria-label="النتائج"></div>' +
                '<div class="m-cmd-hint">اكتب للتصفية · Esc للإغلاق</div>' +
            '</div>';
        document.body.appendChild(cmdEl);
        cmdInput = cmdEl.querySelector('.m-cmd-input');
        cmdList = cmdEl.querySelector('.m-cmd-list');
        cmdEl.addEventListener('click', (e) => {
            if (e.target.closest('[data-cmd-close]')) { closeCmd(); return; }
            const btn = e.target.closest('.m-cmd-row');
            if (!btn) return;
            const all = cmdList.querySelectorAll('.m-cmd-row');
            cmdRun(cmdRows[Array.prototype.indexOf.call(all, btn)]);
        });
        cmdInput.addEventListener('input', cmdDraw);
        cmdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { e.preventDefault(); closeCmd(); return; }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (!cmdRows.length) return;
                cmdSel = (cmdSel + (e.key === 'ArrowDown' ? 1 : cmdRows.length - 1)) % cmdRows.length;
                cmdPaintSel();
                return;
            }
            if (e.key === 'Enter') { e.preventDefault(); cmdRun(cmdRows[cmdSel]); }
        });
    }

    function openCmd() {
        if (!state.started || cmdOpen) return;
        if (!document.body.classList.contains('m-admin')) return;
        if (document.body.classList.contains('m-sheet-open')) return;
        if (document.querySelector('.m-lk-fx')) return;
        actClose();
        cmdBuild();
        cmdOpen = true;
        clearTimeout(cmdCloseTimer);
        cmdEl.classList.remove('closing');
        cmdEl.classList.add('on');
        cmdEl.setAttribute('aria-hidden', 'false');
        cmdInput.value = '';
        cmdDraw();
        setTimeout(() => {
            if (!cmdOpen) return;
            try { cmdInput.focus({ preventScroll: true }); } catch (e) { cmdInput.focus(); }
        }, REDUCED ? 0 : 200);
    }

    function closeCmd() {
        if (!cmdOpen || !cmdEl) return;
        cmdOpen = false;
        try { cmdInput.blur(); } catch (e) {}
        cmdEl.classList.add('closing');
        cmdEl.setAttribute('aria-hidden', 'true');
        clearTimeout(cmdCloseTimer);
        cmdCloseTimer = setTimeout(() => { cmdEl.classList.remove('on', 'closing'); }, REDUCED ? 0 : 200);
    }

    function bindCommandPalette() {
        if (headRef && headRef.dataset.mCmdBound !== '1') {
            headRef.dataset.mCmdBound = '1';
            headRef.addEventListener('click', (e) => {
                if (e.target.closest('.m-head-search')) openCmd();
            });
        }
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                if (!document.body.classList.contains('m-admin')) return;
                e.preventDefault();
                openCmd();
            }
        });
    }

    /* ================= مركز النشاط (قراءة فقط) =================
       يقرأ من نفس الجسر الذي تقرأ منه الطبقة: royalDataRead. لا كتابة،
       ولا تعديل لأي سجل. الفواتير والدفعات تُدمج خطاً زمنياً واحداً. */
    const ACT_STEP = 50;
    const ACT_FA = {
        inv: 'fa-receipt',
        pay: 'fa-hand-holding-dollar'
    };
    let actEl = null, actList = null, actOpen = false, actFilter = 'all', actLimit = ACT_STEP;
    let actCloseTimer = 0, actLastFocus = null, actBarEl = null;

    function actNum(v) {
        const n = Number(v);
        return isFinite(n) ? n : 0;
    }

    function actPad(n) { return (n < 10 ? '0' : '') + n; }

    function actMoney(n) { return actNum(n).toLocaleString('en-US'); }

    function actClock(ms) {
        const d = new Date(ms);
        return actPad(d.getHours()) + ':' + actPad(d.getMinutes());
    }

    function actDayKey(ms) {
        const d = new Date(ms);
        return d.getFullYear() + '-' + actPad(d.getMonth() + 1) + '-' + actPad(d.getDate());
    }

    function actEventStamp(e) {
        if (!e) return NaN;
        const t = Number(e.timestamp);
        if (isFinite(t) && t > 1e11) return t;
        if (isFinite(t) && t > 1e9) return t * 1000;
        const d = /^\d{4}-\d{2}-\d{2}$/.test(String(e.date || '')) ? String(e.date) : '';
        const tm = /^\d{1,2}:\d{2}/.test(String(e.time || '')) ? String(e.time).slice(0, 5) : '00:00';
        const ms = d ? Date.parse(d + 'T' + tm + ':00') : NaN;
        return isFinite(ms) ? ms : NaN;
    }

    function actEventDay(e, ts) {
        const d = String((e && e.date) || '');
        return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : actDayKey(ts);
    }

    function actPayLabel(v) {
        const k = String(v == null ? '' : v).toLowerCase();
        if (k === 'cash') return 'كاش';
        if (k === 'electronic') return 'إلكتروني';
        return String(v == null ? '' : v);
    }

    function actDayLabel(key) {
        const today = actDayKey(Date.now());
        const yest = actDayKey(Date.now() - 864e5);
        if (key === today) return 'اليوم';
        if (key === yest) return 'أمس';
        const p = key.split('-');
        const y = Number(p[0]), m = Number(p[1]), d = Number(p[2]);
        const wd = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][new Date(y, m - 1, d).getDay()];
        return wd + ' · ' + d + '/' + m + (y === new Date().getFullYear() ? '' : '/' + y);
    }

    function actSnapshot() {
        const data = window.royalDataRead ? window.royalDataRead() : null;
        const list = [];
        const invs = data && Array.isArray(data.invoices) ? data.invoices : [];
        const pays = data && Array.isArray(data.payments) ? data.payments : [];
        invs.forEach((inv) => {
            const ts = actEventStamp(inv);
            if (!isFinite(ts)) return;
            const no = inv.dailyNumber || String(inv.id || '').slice(-6);
            list.push({
                kind: 'inv',
                ts,
                day: actEventDay(inv, ts),
                id: String(inv.id || ''),
                title: (inv.customer && inv.customer.name) ? inv.customer.name : 'عميل نقدي',
                sub: 'فاتورة #' + no + ' · ' + actClock(ts) + (inv.paymentType ? ' · ' + actPayLabel(inv.paymentType) : ''),
                amount: actNum(inv.total)
            });
        });
        pays.forEach((p) => {
            const ts = actEventStamp(p);
            if (!isFinite(ts)) return;
            list.push({
                kind: 'pay',
                ts,
                day: actEventDay(p, ts),
                id: String(p.id || ''),
                title: p.type || 'دفعة',
                sub: actClock(ts) + (p.details ? ' · ' + String(p.details) : ''),
                amount: actNum(p.amount)
            });
        });
        list.sort((a, b) => b.ts - a.ts);
        return list;
    }

    function actTodayTotals(all) {
        const today = actDayKey(Date.now());
        let inv = 0, pay = 0, value = 0;
        all.forEach((ev) => {
            if (ev.day !== today) return;
            if (ev.kind === 'inv') { inv++; value += ev.amount; }
            else { pay++; }
        });
        return { inv: inv, pay: pay, value: value };
    }

    function actSafe(v) {
        return window.plainText ? window.plainText(v) : esc(v);
    }

    function actRow(ev, i) {
        const inv = ev.kind === 'inv';
        return '<button type="button" class="m-act-row" style="--i:' + i + '"' +
            (inv ? ' data-act-inv="' + esc(ev.id) + '" aria-label="فتح تفاصيل الفاتورة في النظام"' : ' data-act-pay="1" aria-label="فتح الملخص المالي"') + '>' +
            '<span class="m-act-ic ' + (inv ? 'inv' : 'pay') + '"><i class="fa-solid ' + ACT_FA[ev.kind] + '"></i></span>' +
            '<span class="m-act-txt"><b>' + actSafe(ev.title) + '</b><small>' + actSafe(ev.sub) + '</small></span>' +
            '<span class="m-act-amt ' + (inv ? 'inv' : 'pay') + '">' + actMoney(ev.amount) + '<em>د.ع</em></span>' +
            '</button>';
    }

    function actDraw(keepScroll) {
        if (!actEl || !actList) return;
        const top = keepScroll ? actList.scrollTop : 0;
        const all = actSnapshot();
        const t = actTodayTotals(all);
        const chips = actEl.querySelectorAll('.m-act-chip b');
        if (chips[0]) chips[0].textContent = String(t.inv);
        if (chips[1]) chips[1].textContent = String(t.pay);
        if (chips[2]) chips[2].textContent = actMoney(t.value);

        const list = actFilter === 'all' ? all : all.filter((ev) => ev.kind === actFilter);
        if (!list.length) {
            actList.innerHTML = '<div class="m-act-empty"><i class="fa-regular fa-circle-check"></i><b>' +
                (all.length ? 'لا عناصر في هذا التصنيف' : 'لا حركة مسجلة بعد') + '</b><span>' +
                (all.length ? 'جرّب تصنيفاً آخر' : 'ستظهر هنا الفواتير والدفعات لحظة تسجيلها') + '</span></div>';
            return;
        }
        const dayCount = {};
        list.forEach((ev) => { dayCount[ev.day] = (dayCount[ev.day] || 0) + 1; });
        const html = [];
        let lastDay = '', shown = 0, i = 0;
        for (let x = 0; x < list.length; x++) {
            if (shown >= actLimit) break;
            const ev = list[x];
            if (ev.day !== lastDay) {
                lastDay = ev.day;
                html.push('<div class="m-act-day" style="--i:' + i + '"><span>' + actDayLabel(ev.day) + '</span><em>' +
                    dayCount[ev.day] + ' عمليات</em></div>');
                i++;
            }
            html.push(actRow(ev, i));
            i++;
            shown++;
        }
        if (list.length > actLimit) {
            html.push('<button type="button" class="m-act-more">عرض المزيد · ' + (list.length - actLimit) + '</button>');
        }
        actList.innerHTML = html.join('');
        actList.scrollTop = top;
    }

    function actRenderBar() {
        if (!actBarEl) return;
        const all = actSnapshot();
        const t = actTodayTotals(all);
        const sub = actBarEl.querySelector('.m-act-bar-txt small');
        const badge = actBarEl.querySelector('.m-act-bar-n');
        if (!all.length) {
            sub.textContent = 'لا حركة مسجلة بعد';
        } else if (t.inv || t.pay) {
            sub.textContent = t.inv + ' فواتير · ' + t.pay + ' دفعات اليوم';
        } else {
            sub.textContent = 'آخر حركة: ' + actDayLabel(all[0].day) + ' · ' + actClock(all[0].ts);
        }
        const n = t.inv + t.pay;
        badge.textContent = n > 99 ? '99+' : String(n);
        badge.style.display = n ? '' : 'none';
    }

    function syncActivity() {
        if (!actBarEl) return;
        actRenderBar();
        if (actOpen) actDraw(true);
    }

    function actBuild() {
        if (actEl) return;
        actEl = document.createElement('div');
        actEl.className = 'm-act';
        actEl.setAttribute('aria-hidden', 'true');
        actEl.innerHTML =
            '<div class="m-act-scrim" data-act-close></div>' +
            '<div class="m-act-card" role="dialog" aria-modal="true" aria-label="مركز النشاط">' +
                '<div class="m-act-head">' +
                    '<span class="m-act-head-orb"><i class="fa-solid fa-wave-square"></i></span>' +
                    '<span class="m-act-hd"><b>مركز النشاط</b><small>حيّ من بيانات المكوى · قراءة فقط</small></span>' +
                    '<button type="button" class="m-act-x" data-act-close aria-label="إغلاق مركز النشاط"><i class="fa-solid fa-xmark"></i></button>' +
                '</div>' +
                '<div class="m-act-sum">' +
                    '<span class="m-act-chip inv"><b>0</b><small>فواتير اليوم</small></span>' +
                    '<span class="m-act-chip pay"><b>0</b><small>دفعات اليوم</small></span>' +
                    '<span class="m-act-chip val"><b>0</b><small>قيمة فواتير اليوم</small></span>' +
                '</div>' +
                '<div class="m-act-tabs">' +
                    '<button type="button" class="m-act-seg sel" data-act-filter="all">الكل</button>' +
                    '<button type="button" class="m-act-seg" data-act-filter="inv">فواتير</button>' +
                    '<button type="button" class="m-act-seg" data-act-filter="pay">دفعات</button>' +
                    '<span class="m-act-live"><i></i>مباشر</span>' +
                '</div>' +
                '<div class="m-act-list" role="list"></div>' +
            '</div>';
        document.body.appendChild(actEl);
        actList = actEl.querySelector('.m-act-list');
        actEl.addEventListener('click', (e) => {
            if (e.target.closest('[data-act-close]')) { actClose(); return; }
            const seg = e.target.closest('.m-act-seg');
            if (seg) {
                actFilter = seg.getAttribute('data-act-filter') || 'all';
                actLimit = ACT_STEP;
                qsa('.m-act-seg', actEl).forEach((b) => b.classList.toggle('sel', b === seg));
                actDraw();
                return;
            }
            if (e.target.closest('.m-act-more')) { actLimit += ACT_STEP; actDraw(true); return; }
            const invRow = e.target.closest('[data-act-inv]');
            if (invRow) {
                const id = invRow.getAttribute('data-act-inv');
                if (id && typeof window.viewTransactionDetails === 'function') window.viewTransactionDetails(id);
                return;
            }
            if (e.target.closest('[data-act-pay]')) {
                actClose();
                setTimeout(() => {
                    if (typeof window.switchAdminTab === 'function') window.switchAdminTab('finance', 'none');
                }, 300);
            }
        });
    }

    function actOpenSheet() {
        if (actOpen || !state.started) return;
        if (!document.body.classList.contains('m-admin')) return;
        if (document.querySelector('.m-lk-fx')) return;
        actBuild();
        actOpen = true;
        actFilter = 'all';
        actLimit = ACT_STEP;
        qsa('.m-act-seg', actEl).forEach((b) => b.classList.toggle('sel', b.getAttribute('data-act-filter') === 'all'));
        clearTimeout(actCloseTimer);
        actEl.classList.remove('closing');
        actDraw();
        actEl.classList.add('on');
        actEl.setAttribute('aria-hidden', 'false');
        actLastFocus = document.activeElement;
        setTimeout(() => {
            const x = actEl.querySelector('.m-act-x');
            if (!x || !actOpen) return;
            try { x.focus({ preventScroll: true }); } catch (err) { x.focus(); }
        }, REDUCED ? 0 : 300);
    }

    function actClose() {
        if (!actOpen || !actEl) return;
        actOpen = false;
        actEl.classList.add('closing');
        actEl.setAttribute('aria-hidden', 'true');
        clearTimeout(actCloseTimer);
        actCloseTimer = setTimeout(() => {
            if (!actOpen) actEl.classList.remove('on', 'closing');
        }, REDUCED ? 0 : 240);
        /* اللمس على الويب لا يمنح الزر تركيزاً دائماً، فنرجع إلى شريط مركز النشاط */
        const back = (actLastFocus && actLastFocus !== document.body) ? actLastFocus : actBarEl;
        if (back && typeof back.focus === 'function') {
            try { back.focus({ preventScroll: true }); } catch (err) {}
        }
        actLastFocus = null;
    }

    function injectActivityBar() {
        const more = document.getElementById('admin-more-menu');
        if (!more || more.querySelector('.m-act-bar')) return;
        const bar = document.createElement('button');
        bar.type = 'button';
        bar.className = 'm-act-bar';
        bar.setAttribute('aria-label', 'مركز النشاط: فواتير ودفعات');
        bar.setAttribute('aria-haspopup', 'dialog');
        bar.innerHTML =
            '<span class="m-act-bar-orb"><i class="fa-solid fa-wave-square"></i></span>' +
            '<span class="m-act-bar-txt"><b>مركز النشاط</b><small>—</small></span>' +
            '<span class="m-act-bar-n">0</span>' +
            '<i class="fa-solid fa-chevron-left m-act-bar-go"></i>';
        const h2 = more.querySelector(':scope > h2');
        if (h2 && h2.parentElement === more) h2.insertAdjacentElement('afterend', bar);
        else more.insertBefore(bar, more.firstChild);
        actBarEl = bar;
        bar.addEventListener('click', actOpenSheet);
        actRenderBar();
    }

    function bindActivity() {
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || !actOpen) return;
            /* نافذة النظام فوق النشاط تستهلك Escape لنفسها */
            if (document.body.classList.contains('m-sheet-open')) return;
            e.preventDefault();
            actClose();
        });
    }

    /* ================= قفل الجلسة التلقائي =================
       لا يفرض نفسه: يبقى متوقفاً حتى يختاره صاحب المكوى من التخصيصات.
       اللمس والكتابة يصفّران العدّاد، والخمول وحده هو ما يقفل. */
    const IDLE_KEY = 'royal.lock.min.v1';
    const IDLE_WARN_MS = 30000;
    let idleMin = 0;
    let idleLast = Date.now();
    let idleTimer = 0;
    let idleWarnEl = null;

    function idleLoad() {
        let v = NaN;
        try { v = Number(localStorage.getItem(IDLE_KEY)); } catch (e) {}
        idleMin = isFinite(v) && v > 0 ? Math.min(v, 720) : 0;
    }

    function idleSave() {
        try { localStorage.setItem(IDLE_KEY, String(idleMin)); } catch (e) {}
    }

    function idleMark() {
        idleLast = Date.now();
        idleHideWarn();
    }

    function idleWarnBuild() {
        idleWarnEl = document.createElement('div');
        idleWarnEl.className = 'm-idle-warn';
        idleWarnEl.setAttribute('role', 'status');
        idleWarnEl.innerHTML =
            '<i class="fa-solid fa-lock"></i>' +
            '<span class="m-idle-warn-t">سيُقفل النظام خلال <b>30</b> ثانية</span>' +
            '<button type="button" class="m-idle-warn-b">ابقَ</button>';
        document.body.appendChild(idleWarnEl);
        idleWarnEl.querySelector('.m-idle-warn-b').addEventListener('click', idleMark);
    }

    function idleShowWarn(left) {
        if (!idleWarnEl) idleWarnBuild();
        const sec = Math.max(1, Math.ceil(left / 1000));
        const b = idleWarnEl.querySelector('.m-idle-warn-t b');
        if (b && b.textContent !== String(sec)) b.textContent = String(sec);
        idleWarnEl.classList.add('on');
    }

    function idleHideWarn() {
        if (idleWarnEl) idleWarnEl.classList.remove('on');
    }

    function idleLock() {
        if (!idleMin) return;
        if (!document.body.classList.contains('m-admin')) return;
        if (document.querySelector('.m-lk-fx')) return;
        idleHideWarn();
        idleLast = Date.now();
        try { window.exitToMain(); } catch (e) {}
    }

    function idleCheck() {
        if (!idleMin) { idleHideWarn(); return; }
        if (document.hidden) return;
        /* خارج لوحة الإدارة أو أمام شاشة القفل: لا عدّاد معلّق */
        if (!document.body.classList.contains('m-admin') || document.querySelector('.m-lk-fx')) {
            idleLast = Date.now();
            idleHideWarn();
            return;
        }
        const limit = idleMin * 60000;
        const left = limit - (Date.now() - idleLast);
        if (left <= 0) { idleLock(); return; }
        if (left <= Math.min(IDLE_WARN_MS, limit * .5)) idleShowWarn(left);
        else idleHideWarn();
    }

    function syncIdleCard() {
        const card = document.querySelector('.m-idle-card');
        if (!card) return;
        card.querySelectorAll('[data-idle-min]').forEach((b) => {
            const on = Number(b.getAttribute('data-idle-min')) === idleMin;
            b.classList.toggle('on', on);
            b.setAttribute('aria-pressed', String(on));
        });
        const note = card.querySelector('.m-idle-note');
        if (note) {
            note.classList.toggle('off', !idleMin);
            note.innerHTML = '<i class="fa-solid fa-circle"></i>' +
                (idleMin ? 'مفعّل · يُقفل بعد ' + idleMin + ' دقيقة خمول، ويعود لشاشة الرمز' : 'متوقف · لن يُقفل تلقائياً');
        }
    }

    function buildIdleCard() {
        const page = document.getElementById('admin-settings');
        if (!page || page.querySelector('.m-idle-card')) return;
        const card = document.createElement('div');
        card.className = 'm-idle-card';
        card.innerHTML =
            '<div class="m-idle-head">' +
                '<span class="m-idle-orb"><i class="fa-solid fa-shield-halved"></i></span>' +
                '<span class="m-idle-hd"><b>قفل الجلسة</b><small>إذا تُرك الجهاز بلا لمس، يعود النظام إلى شاشة الرمز.</small></span>' +
            '</div>' +
            '<div class="m-idle-seg" role="group" aria-label="مدة الخمول قبل القفل">' +
                '<button type="button" data-idle-min="0" aria-pressed="false">متوقف</button>' +
                '<button type="button" data-idle-min="5" aria-pressed="false">5 دقائق</button>' +
                '<button type="button" data-idle-min="15" aria-pressed="false">15 دقيقة</button>' +
                '<button type="button" data-idle-min="30" aria-pressed="false">30 دقيقة</button>' +
            '</div>' +
            '<div class="m-idle-note off"><i class="fa-solid fa-circle"></i>متوقف · لن يُقفل تلقائياً</div>';
        page.appendChild(card);
        card.addEventListener('click', (e) => {
            const b = e.target.closest('[data-idle-min]');
            if (!b) return;
            const m = Number(b.getAttribute('data-idle-min')) || 0;
            window.RoyalLock.set(m);
            if (window.showAlert) {
                window.showAlert(m ? 'سيُقفل النظام بعد ' + m + ' دقيقة خمول' : 'قفل الجلسة التلقائي متوقف', 'success');
            }
        });
        syncIdleCard();
    }

    function bindIdleLock() {
        idleLoad();
        if (idleTimer) return;
        const mark = (e) => {
            const t = e && e.target;
            if (t && t.closest && t.closest('.m-idle-warn')) return;
            idleMark();
        };
        ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach((type) => {
            document.addEventListener(type, mark, { capture: true, passive: true });
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden || !idleMin) return;
            if (!document.body.classList.contains('m-admin')) return;
            if (document.querySelector('.m-lk-fx')) return;
            if (Date.now() - idleLast >= idleMin * 60000) idleLock();
        });
        idleTimer = setInterval(idleCheck, 1000);
        buildIdleCard();
    }

    /* واجهة صغيرة للطبقات الأخرى: قراءة المدة، ضبطها، وتصفير العدّاد */
    window.RoyalLock = {
        minutes: () => idleMin,
        remaining: () => (idleMin ? Math.max(0, idleMin * 60000 - (Date.now() - idleLast)) : 0),
        set: (m) => {
            const v = Number(m);
            idleMin = isFinite(v) && v > 0 ? Math.min(v, 720) : 0;
            idleLast = Date.now();
            idleSave();
            syncIdleCard();
            idleHideWarn();
        },
        reset: idleMark,
        lockNow: idleLock
    };

    /* ================= إعادة الرسم المنظمة (debounce + إرجاء) ================= */
    const RENDERERS = ['updateAdminDashboard', 'renderLogs', 'renderAdminSubs'];
    const originals = {};
    let repaintTimer = 0;
    function setPending() { state.pendingRepaint = true; }

    function scheduleRepaint() {
        if (!state.started) return;
        if (state.busy) { setPending(); return; }
        if (repaintTimer) return;
        repaintTimer = setTimeout(() => {
            repaintTimer = 0;
            runRepaint();
        }, 150);
    }

    /* استدعاء الدوال الأصلية مباشرة: الطبقة لا تُعيد نفسها في حلقة رسم */
    function callOriginal(name) {
        const fn = originals[name] || window[name];
        if (typeof fn === 'function') fn.call(window);
    }

    /* اللوحة الظاهرة التي لا تمرّ تُقفل عنها حركة التمرير: آيفون حينئذٍ لا يبني
       لها طبقة تمرير يمدّها ويرتجّ عندها، فيسقط سبب الارتجاج من أصله.
       القياس للظاهرة وحدها: المخفية عرضها صفر، فقياسها يقفل التمرير بالغلط. */
    function syncFlow() {
        const cur = state.pages[state.index];
        state.pages.forEach((p) => { if (p && p !== cur) p.classList.remove('m-noflow'); });
        if (!cur || !cur.classList.contains('m-seen')) return;
        cur.classList.toggle('m-noflow', cur.scrollHeight - cur.clientHeight <= 1);
    }

    function runRepaint() {
        const page = state.pages[state.index];
        const top = page ? page.scrollTop : 0;
        const openSheets = qsa('.modal-overlay.m-sheet.m-on .modal-content');
        const sheetTops = openSheets.map((c) => c.scrollTop);
        try {
            callOriginal('updateAdminDashboard');
            const k = state.keys[state.index];
            if (k === 'logs') { callOriginal('renderLogs'); trimLogs(); }
            if (k === 'subscriptions') callOriginal('renderAdminSubs');
            if (k === 'more-menu' || actOpen) syncActivity();
        } catch (err) { console.warn('mobile repaint:', err); }
        markSyncTime();
        paintToday();
        syncWallet();
        syncProgress();
        if (page && Math.abs(page.scrollTop - top) > 2) page.scrollTop = top;
        openSheets.forEach((c, i) => { if (Math.abs(c.scrollTop - sheetTops[i]) > 2) c.scrollTop = sheetTops[i]; });
        syncFlow();
    }

    function flushRepaint() {
        if (!state.pendingRepaint) return;
        state.pendingRepaint = false;
        runRepaint();
    }

    function wrapRepainters() {
        RENDERERS.forEach((name) => {
            const original = window[name];
            if (typeof original !== 'function' || original.__mWrapped) return;
            originals[name] = original;
            const wrapped = function () {
                if (!originals[name]) return original.apply(window, arguments);
                scheduleRepaint();
                setPending();
            };
            wrapped.__mWrapped = true;
            wrapped.__mOriginal = original;
            window[name] = wrapped;
        });
    }

    function unwrapRepainters() {
        RENDERERS.forEach((name) => {
            const fn = window[name];
            if (fn && fn.__mOriginal) window[name] = fn.__mOriginal;
            delete originals[name];
        });
    }

    /* عند الوصول لتبويب: رسم فوري من نفس دوال النظام */
    function onArrive(key) {
        if (!key) return;
        /* التبويب يفتح دائماً من أعلاه مهما كان موضع تمريره السابق */
        const page = pageOf(key);
        resetPageTop(page);
        setPending();
        if (state.busy) return;
        flushRepaint();
    }

    /* المتصفح يعيد موضع تمرير اللوحة المخفية لحظة ظهورها. الضبط قبل الظهور لا
       يُحتسب، فنفرض التخطيط بعد إظهارها ونصفّر في المهمة نفسها: أول إطار
       يُرسم للمستخدم يبدأ من الأعلى، لا من الموضع القديم ثم قفزة. */
    function resetScrollOnReveal(page) {
        if (!page) return;
        page.scrollTop = 0;
        if (page.scrollLeft) page.scrollLeft = 0;
        void page.offsetHeight;
        page.scrollTop = 0;
        if (page.scrollLeft) page.scrollLeft = 0;
        requestAnimationFrame(() => {
            if (!page.classList.contains('m-seen')) return;
            if (page.scrollTop) page.scrollTop = 0;
            if (page.scrollLeft) page.scrollLeft = 0;
        });
    }

    function resetPageTop(page) {
        resetScrollOnReveal(page);
    }

    function pageOf(key) { return document.getElementById('admin-' + key); }

    /* ================== النوافذ السفلية فوق المنبثقات ================== */
    const sheetStack = [];
    let pushing = false;

    function sheetExempt(el) {
        return el.id === 'modal-admin-login' || el.id === 'modal-ota-update' || el.id === 'update-modal' || el.id === 'modal-shift-report';
    }

    function observeSheets() {
        qsa('.modal-overlay').forEach((el) => {
            if (el.dataset.mSheetObs === '1') return;
            el.dataset.mSheetObs = '1';
            new MutationObserver(() => syncSheet(el)).observe(el, { attributes: true, attributeFilter: ['style'] });
            syncSheet(el);
        });
        window.addEventListener('popstate', onPop);
    }

    function syncSheet(el) {
        if (sheetExempt(el)) return;
        const open = /(^|;)\s*display:\s*flex/.test(el.getAttribute('style') || '');
        const known = el.classList.contains('m-sheet');
        if (open && !known) openSheet(el);
        else if (!open && known) closeSheet(el);
    }

    function openSheet(el) {
        el.classList.remove('m-closing');
        el.classList.add('m-sheet');
        document.body.classList.add('m-sheet-open');
        /* النافذة فوق شريط التبويبات دائماً، وكل ورقة تُفتح فوق ما قبلها */
        el.style.setProperty('z-index', String(9560 + sheetStack.length), 'important');
        const content = el.querySelector('.modal-content');
        if (content) {
            el.style.removeProperty('padding-bottom');
            content.style.removeProperty('height');
            content.style.removeProperty('max-height');
            content.style.removeProperty('transform');
        }
        addCloseButton(el, content);
        decorateSheet(el, content);
        lockBackground();
        if (content) meterSheets(content);
        sheetStack.push(el);
        /* معاينة سريعة: بلا خطوة سجل كي لا يتغيّر سلوك زر الرجوع */
        if (peekArm && el.id === 'modal-transaction-details') {
            el.__mPeek = true;
            peekArm = false;
        }
        if (!el.__mPeek && !pushing) {
            pushing = true;
            try { history.pushState({ royalSheet: el.id }, ''); } catch (e) {}
            pushing = false;
        }
        /* قراءة تخطيط واحدة لتثبيت الوضع الأول ثم التحريك، بلا انتظار إطار رسم */
        void el.offsetHeight;
        el.classList.add('m-on', 'm-in');
        prepSheetMotion(content);
        armSheetRise(el);
        /* مدّة الدخول 520م.س: الإزالة قبلها كانت تقصّ الحركة في اللحظة الأخيرة */
        setTimeout(() => el.classList.remove('m-in'), 540);
    }

    function addCloseButton(el, content) {
        if (!content || el.querySelector('.m-sheet-x')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'm-sheet-x';
        btn.setAttribute('aria-label', 'إغلاق');
        btn.textContent = '×';
        btn.addEventListener('click', () => requestSheetClose(el));
        content.insertBefore(btn, content.firstChild);
    }

    /* ================== تفصيل نافذة بعينها بعد فتحها ==================
       النوافذ كلها تُبنى من ملف النظام، والطبقة تُعيد بناء عرضها في الجوال فقط:
       بطاقات صرفيات، كشف يوم بالبطاقات، ونافذة تفاصيل وسطية ثابتة. */
    function decorateSheet(el, content) {
        if (!content) return;
        if (el.id === 'modal-admin-expenses') decorateExpenses(el, content);
        else if (el.id === 'modal-daily-transactions') decorateDay(el, content);
        else if (el.id === 'modal-transaction-details') decorateTx(el, content);
    }

    const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    function escHTML(v) {
        if (window.escapeHTML) return window.escapeHTML(String(v == null ? '' : v));
        return String(v == null ? '' : v).replace(/[&<>"]/g,
            (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    function dateParts(value) {
        const s = String(value || '').trim();
        let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
        if (m) return { y: +m[1], mo: +m[2], d: +m[3] };
        m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(s);
        if (m) return { y: +m[3], mo: +m[2], d: +m[1] };
        return null;
    }

    function prettyDate(value) {
        const p = dateParts(value);
        if (!p) return String(value || '');
        return p.d + ' ' + (AR_MONTHS[p.mo - 1] || '') + ' ' + p.y;
    }

    function monthTitle(value) {
        const m = /^(\d{4})-(\d{1,2})$/.exec(String(value || ''));
        if (!m) return 'كل الفترات';
        return (AR_MONTHS[Number(m[2]) - 1] || '') + ' ' + m[1];
    }

    function monthOf(ts) {
        const t = Number(ts);
        if (!t) return '';
        const d = new Date(t);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }

    /* بناء Intl.DateTimeFormat مكلف ويُدفع مرة لكل صف؛ نخزّن المنسّقين
       فتُفتح قوائم الصرفيات الطويلة بلا عشرات المللي ثانية من التهيئة. */
    let clockFmt = null;
    let weekdayFmt = null;

    function clockOf(ts) {
        const t = Number(ts);
        if (!t) return '';
        try {
            clockFmt = clockFmt || new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Baghdad', hour: '2-digit', minute: '2-digit', hour12: false
            });
            return clockFmt.format(new Date(t));
        } catch (e) {
            const d = new Date(t);
            return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        }
    }

    function weekdayOf(ts) {
        const t = Number(ts);
        if (!t) return '';
        try {
            weekdayFmt = weekdayFmt || new Intl.DateTimeFormat('ar-IQ', { weekday: 'long' });
            return weekdayFmt.format(new Date(t));
        } catch (e) { return ''; }
    }

    /* ================== حركة محتوى النوافذ ==================
       البطاقات تُبنى بعد أن تصل الورقة لا وهي مخفية أو منزلقة (كانت الحركة
       تنتهي قبل أن تُرى، فيظهر المحتوى جاهزاً أو سريعاً بلا سبب). armSheetRise
       يُستدعى بعد إظهار النافذة، ويتقبّل صفوفاً تُرسم بعد أول لحظة. */
    const RISE_SELECTOR = {
        'modal-admin-expenses': '.m-exp-sum, .m-exp-card',
        'modal-daily-transactions': '#drill-transactions-body tr',
        'modal-transaction-details': '#drill-cart-info, #drill-cart-items-body tr'
    };

    function prepSheetMotion(content) {
        if (!content) return;
        qsa('.m-rise, .m-sink', content).forEach((n) => {
            n.classList.remove('m-rise', 'm-sink');
            n.style.removeProperty('--i');
            n.style.removeProperty('--j');
        });
        void content.offsetWidth;
    }

    function armSheetRise(el) {
        const content = el.querySelector('.modal-content');
        const sel = RISE_SELECTOR[el.id];
        if (!content || !sel) return;
        const run = () => {
            if (!el.classList.contains('m-sheet') || !el.classList.contains('m-on')) return;
            const all = qsa(sel, content);
            let n = 0;
            for (let i = 0; i < all.length; i++) {
                const node = all[i];
                if (node.classList.contains('m-rise') || node.classList.contains('m-sink')) { n++; continue; }
                if (n >= 10) break;
                node.style.setProperty('--i', String(Math.min(n, 9)));
                node.classList.add('m-rise');
                n++;
            }
        };
        run();
        setTimeout(run, 220);
        setTimeout(run, 700);
    }

    /* تفكيك الإغلاق: آخر بطاقة تنسحب أولاً بينما الورقة تتراجع */
    function prepSheetExit(content) {
        if (!content) return;
        qsa('.m-rise', content).forEach((n) => n.classList.remove('m-rise'));
        const nodes = qsa('.m-exp-sum, .m-exp-card, #drill-transactions-body tr, #drill-cart-info, #drill-cart-items-body tr', content);
        const cap = Math.min(nodes.length, 10);
        for (let i = 0; i < cap; i++) {
            const n = nodes[i];
            n.style.setProperty('--j', String(Math.min(8, cap - 1 - i)));
            n.classList.add('m-sink');
        }
    }

    function stripSheetMotion(content) {
        if (!content) return;
        qsa('.m-sink', content).forEach((n) => {
            n.classList.remove('m-sink');
            n.style.removeProperty('--j');
        });
    }

    function decorateExpenses(el, content) {
        content.classList.add('mobile-sticky-modal', 'm-exp-modal');
        const monthEl = document.getElementById('admin-month-filter');
        const month = monthEl && monthEl.value ? monthEl.value : 'all';

        /* البيانات الحيّة من جسر app.js تحمل الوقت، وإن غاب الجسر نقرأ ما رسمه النظام */
        let items = [];
        let live = false;
        try {
            if (typeof window.getExpensesForMobile === 'function') {
                items = window.getExpensesForMobile() || [];
                live = true;
            }
        } catch (e) { items = []; }

        if (!live) {
            items = qsa('#admin-expenses-detail-body tr').map((tr) => {
                const td = qsa('td', tr);
                if (td.length < 4) return null;
                return {
                    date: td[0].textContent.trim(),
                    day: td[1].textContent.trim(),
                    detail: td[2].textContent.trim(),
                    amount: num(td[3].textContent),
                    timestamp: 0
                };
            }).filter(Boolean);
        }

        if (live && month && month !== 'all') {
            items = items.filter((x) => x.timestamp && monthOf(x.timestamp) === month);
        }
        items = items.slice().sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
        const total = items.reduce((s, x) => s + (Number(x.amount) || 0), 0);

        const table = content.querySelector('table');
        if (table) table.style.setProperty('display', 'none', 'important');

        const title = content.querySelector('.modal-title');
        if (title) title.textContent = 'تفاصيل الصرفيات';

        let body = content.querySelector('.m-exp-body');
        if (!body) {
            body = document.createElement('div');
            body.className = 'modal-body-scrollable m-exp-body';
            const actions = content.querySelector('.modal-actions');
            content.insertBefore(body, actions || null);
        }

        let chip = content.querySelector('.m-exp-sum');
        if (!chip) {
            chip = document.createElement('div');
            chip.className = 'm-exp-sum';
            if (title) title.insertAdjacentElement('afterend', chip);
            else content.insertBefore(chip, body);
        }
        chip.innerHTML =
            '<div class="m-exp-sum-main">' +
                '<span>إجمالي صرفيات هذه الفترة</span>' +
                '<b>' + money(total) + ' <em>د.ع</em></b>' +
            '</div>' +
            '<div class="m-exp-sum-meta">' +
                '<span><i class="fa-regular fa-calendar"></i>' + escHTML(month !== 'all' ? monthTitle(month) : 'كل الفترات') + '</span>' +
                '<span class="m-exp-count">' + items.length + ' حركة</span>' +
            '</div>';

        /* البطاقات تُركّب بعد إطارين: أول رسمة للورقة (رأس + رقاقة) تبقى خفيفة
           فتنطلق حركة الانزلاق على compositor، ثم يُبنى المتن وهو يتحرك. البناء
           المتزامن كان يخطف أول إطار من حركة الفتح فيظهر لاقاً على الجوال.
           armSheetRise يلتقطها في محاولته 220م.س، أو 700م.س إن تأخر الجهاز. */
        const mount = () => {
            const cards = items.map((exp) => {
                const ts = Number(exp.timestamp) || 0;
                const note = String(exp.detail || '').trim();
                const tier = note.length > 150 ? ' m-note-3' : note.length > 80 ? ' m-note-2' : '';
                const day = weekdayOf(ts) || exp.day || '';
                const clock = clockOf(ts);
                const sub = (day ? '<span>' + escHTML(day) + '</span>' : '') +
                    (clock ? (day ? '<i></i>' : '') + '<span dir="ltr">' + clock + '</span>' : '');
                return '<article class="m-exp-card">' +
                    '<div class="m-exp-amt"><span>' + money(Number(exp.amount) || 0) + '</span><em>د.ع</em></div>' +
                    '<div class="m-exp-when">' +
                        '<span class="m-exp-date">' + escHTML(prettyDate(exp.date)) + '</span>' +
                        (sub ? '<span class="m-exp-sub">' + sub + '</span>' : '') +
                    '</div>' +
                    (note ? '<div class="m-exp-note">' +
                        '<span class="m-exp-note-t">ملاحظة</span>' +
                        '<p class="m-exp-note-x' + tier + '">' + escHTML(note) + '</p>' +
                    '</div>' : '') +
                '</article>';
            }).join('');

            body.innerHTML = '<div class="m-exp-list">' + cards + '</div>' +
                '<div class="m-exp-empty"><i class="fa-solid fa-inbox"></i><span>لا صرفيات في هذه الفترة</span></div>';
            body.querySelector('.m-exp-empty').style.display = items.length ? 'none' : 'flex';
            /* البطاقات وُلدت بعد أن مرّت armSheetRise الأولى: نلبسها حركة البناء
               الآن كي لا تظهر جاهزة لحظة ثم تعود للصفر عند المحاولة التالية */
            const fresh = qsa('.m-exp-sum, .m-exp-card', content).slice(0, 10);
            for (let i = 0; i < fresh.length; i++) {
                if (fresh[i].classList.contains('m-rise')) continue;
                fresh[i].style.setProperty('--i', String(i));
                fresh[i].classList.add('m-rise');
            }
        };
        requestAnimationFrame(() => requestAnimationFrame(mount));
        el.dataset.mExpTotal = String(total);
        el.dataset.mExpCount = String(items.length);
    }

    function decorateDay(el, content) {
        content.classList.add('mobile-sticky-modal', 'm-day-modal');
        const label = document.getElementById('drill-day-title');
        if (label) {
            const raw = label.textContent.trim();
            const p = dateParts(raw);
            if (p) {
                let day = '';
                try {
                    day = new Intl.DateTimeFormat('ar-IQ', { weekday: 'long' })
                        .format(new Date(p.y, p.mo - 1, p.d));
                } catch (e) {}
                label.textContent = (day ? day + ' ' : '') + prettyDate(raw);
            }
        }
        const body = content.querySelector('.modal-body-scrollable');
        if (body) body.style.removeProperty('overflow-x');
        const head = content.querySelector('.modal-header-sticky');
        if (head && !head.querySelector('.m-day-hint')) {
            const hint = document.createElement('div');
            hint.className = 'm-day-hint';
            hint.innerHTML = '<i class="fa-solid fa-hand-pointer"></i><span>اضغط على أي قائمة لعرض تفاصيلها</span>';
            head.appendChild(hint);
        }
        const rows = qsa('#drill-transactions-body tr');
        let empty = content.querySelector('.m-day-empty');
        if (!empty && body) {
            empty = document.createElement('div');
            empty.className = 'm-day-empty';
            empty.innerHTML = '<i class="fa-solid fa-moon"></i><span>لا حركات مسجّلة في هذا اليوم</span>';
            body.appendChild(empty);
        }
        if (empty) empty.style.display = rows.length ? 'none' : 'flex';
    }

    function decorateTx(el, content) {
        el.classList.add('m-center');
        content.classList.add('mobile-sticky-modal', 'm-tx-modal');
        const body = content.querySelector('.modal-body-scrollable');
        if (body) body.style.removeProperty('overflow-x');
        const rows = qsa('#drill-cart-items-body tr');
        let empty = content.querySelector('.m-tx-empty');
        if (!empty && body) {
            empty = document.createElement('div');
            empty.className = 'm-tx-empty';
            empty.innerHTML = '<i class="fa-solid fa-box-open"></i><span>لا قطع في هذه القائمة</span>';
            body.appendChild(empty);
        }
        if (empty) empty.style.display = rows.length ? 'none' : 'flex';
    }

    function requestSheetClose(el) {
        /* نمرّر عبر زر الإلغاء الرسمي للنافذة نفسها إن وُجد، ولا نغلق بقية النوافذ */
        const cancel = el.querySelector('.btn-cancel[onclick*="close"], .modal-actions [onclick*="close"]');
        if (cancel) { cancel.click(); return; }
        el.style.display = 'none';
        syncSheet(el);
    }

    /* لحظة الإغلاق: تُثبَّت أبعاد النافذة على آخر ما قيست وهي ظاهرة. النظام يُخفي
       النافذة قبل أن تصلنا المراقبة، فلا يُمكن قياسها في تلك اللحظة، وبقاء ارتفاع
       لوحة المفاتيح مثبّتاً هو ما يمنع النافذة من الهبوط ثم الصعود ثم الاختفاء. */
    let sheetMeter = null;
    function meterSheets(content) {
        if (!window.ResizeObserver) return;
        if (!sheetMeter) {
            sheetMeter = new ResizeObserver((entries) => {
                for (let i = 0; i < entries.length; i++) {
                    const e = entries[i];
                    const bb = e.borderBoxSize;
                    const h = bb && bb[0] ? Math.round(bb[0].blockSize) : Math.round(e.contentRect.height);
                    if (!h) continue;
                    const ov = e.target.closest('.modal-overlay');
                    if (!ov || ov.classList.contains('m-closing')) continue;
                    ov.__mH = h;
                }
            });
        }
        sheetMeter.observe(content);
    }

    function freezeSheet(el) {
        const content = el.querySelector('.modal-content');
        if (!content) return;
        const live = content.offsetHeight;
        const h = live || el.__mH || 0;
        if (!h) return;
        /* السطر المكتوب على النافذة نفسها يُقرأ حتى وهي مخفية، فلا حاجة لقياسها */
        const pad = Math.round(parseFloat(el.style.paddingBottom) || 0);
        el.style.setProperty('padding-bottom', pad + 'px', 'important');
        content.style.setProperty('height', h + 'px', 'important');
        content.style.setProperty('max-height', 'none', 'important');
        setTimeout(() => {
            el.style.removeProperty('padding-bottom');
            content.style.removeProperty('height');
            content.style.removeProperty('max-height');
        }, 720);
    }

    function closeSheet(el, skipHistory, instant) {
        if (el.classList.contains('m-closing')) return;
        const wasPeek = !!el.__mPeek;
        if (wasPeek) delete el.__mPeek;
        const content = el.querySelector('.modal-content');
        if (instant) {
            /* التنقل لا ينتظر الانزلاق: اللوحة الجديدة تصعد خلف هذه النافذة،
               فأي حركة خروج تبقى فوقها تُرى كنافذة معلّقة. */
            el.classList.remove('m-on', 'm-sheet', 'm-in');
            stripSheetMotion(content);
        } else {
            freezeSheet(el);
            el.classList.remove('m-on');
            el.classList.add('m-closing');
            /* محتوى النافذة ينسحب متدرجاً من الأسفل إلى الأعلى مع تراجع الورقة.
               حركة البناء تُزال أولاً كي لا تعاد من الصفر لحظة الإخفاء. */
            prepSheetExit(content);
            setTimeout(() => {
                if (el.classList.contains('m-on')) return;
                /* نبقي m-sheet علامةً على النافذة المفتوحة، فإزالتها هنا تجعل إعادة الفتح تعمل */
                el.classList.remove('m-closing', 'm-sheet', 'm-in');
                stripSheetMotion(content);
            }, 700);
        }
        const i = sheetStack.lastIndexOf(el);
        if (i > -1) sheetStack.splice(i, 1);
        if (!sheetStack.length) {
            document.body.classList.remove('m-sheet-open');
            unlockBackground();
        }
        if (!pushing && !skipHistory && !wasPeek && !sheetStack.length && history.state && history.state.royalSheet) {
            pushing = true;
            try { history.back(); } catch (e) {}
            setTimeout(() => { pushing = false; }, 250);
        }
    }

    /* التنقل إلى تبويب آخر يُغلق كل نافذة مفتوحة في نفس اللحظة، بمسار إغلاق النظام
       نفسه، وبلا انزلاق خروج. لا يبقى شيء معلّق فوق اللوحة الجديدة. */
    function closeOpenSheets() {
        if (!sheetStack.length) return;
        const list = sheetStack.slice();
        sheetStack.length = 0;
        document.body.classList.remove('m-sheet-open');
        unlockBackground();
        pushing = true;
        for (let i = 0; i < list.length; i++) {
            const el = list[i];
            const cancel = el.querySelector('.btn-cancel[onclick*="close"], .modal-actions [onclick*="close"]');
            if (cancel) cancel.click();
            else el.style.display = 'none';
            closeSheet(el, true, true);
        }
        setTimeout(() => { pushing = false; }, 260);
        if (history.state && history.state.royalSheet) {
            try { history.back(); } catch (e) {}
        }
    }

    function onPop() {
        if (pushing) return;
        const el = sheetStack[sheetStack.length - 1];
        if (el) { requestSheetClose(el); return; }
        if (typeof window.exitToMain === 'function' && document.getElementById(ADMIN_ID).classList.contains('active-screen')) return;
    }

    /* تجميد الخلفية باللمس فقط، لا بتغيير overflow: تغييرها في سفاري يصفّر موضع
       التمرير إلى الصفر ثم نستعيده، فتقفل النافذة بصفحة تهبط وتصعد. */
    function lockBackground() {
        document.body.classList.add('m-lock');
    }
    function unlockBackground() {
        document.body.classList.remove('m-lock');
    }

    /* سحب النافذة للأسفل للإغلاق */
    /* النوافذ ثابتة بالكامل: لا سحب للإغلاق ولا إغلاق بالنقر على الستارة.
       الإغلاق حصراً من زر الإغلاق الرسمي أو × في الركن. */

    /* لوحة المفاتيح: لا تغطي النافذة الحقل النشط.
       الآيفون يغيّر visualViewport كلما صعد شريط العنوان أو انزلقت الصفحة، فلو حسبنا
       كل فرقٍ لوحة مفاتيح لتحرك شريط التبويبات مع التمرير. لذلك لا يُعتد بالفرق إلا
       مع حقل كتابة مُركّز عليه، وبمقدار يشبه لوحة مفاتيح فعلية. */
    function isEditing() {
        const a = document.activeElement;
        if (!a || !a.tagName) return false;
        if (!/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false;
        const t = (a.type || '').toLowerCase();
        return t !== 'checkbox' && t !== 'radio' && t !== 'range' && t !== 'file' && t !== 'button';
    }

    /* رفع النافذة فوق لوحة المفاتيح: القيم تُكتب على النافذة نفسها لا على متغيّر
       عام، فلا تتغير أبعاد نافذة إلا حين يتغيّر وضعها هي. */
    function raiseSheet(el, kb) {
        const content = el.querySelector('.modal-content');
        if (!content) return;
        if (kb > 0) {
            el.style.setProperty('padding-bottom', kb + 'px', 'important');
            content.style.setProperty('max-height', Math.max(160, Math.round(window.innerHeight * .92) - kb) + 'px', 'important');
        } else {
            el.style.removeProperty('padding-bottom');
            content.style.removeProperty('max-height');
        }
    }

    /* المستند مُثبّت، فالآيفون لم يعد يمرّر تلقائياً لإظهار الحقل خلف لوحة المفاتيح.
       الرفع يشمل كل منبثقة فيها حقل نشط لا النوافذ المنزلاقة وحدها: شاشة كلمة
       المرور مثلاً وسَطية ومُستثناة من الانزلاق، فبدون هذا تبقى تحت اللوحة. */
    /* حقل داخل لوحة بلا منبثقة: المستند مثبّت، فالنظام لم يعد يمرّر تلقائياً لإظهار
       الحقل خلف لوحة المفاتيح. نُوسّع أسفل اللوحة ثم نزيحها بقدر يُظهر الحقل فوقها. */
    let kbPadEl = null;
    function revealInPage(field, kb) {
        const sec = kb > 0 && field && field.closest ? field.closest('.admin-section') : null;
        if (kbPadEl && kbPadEl !== sec) {
            kbPadEl.style.removeProperty('padding-bottom');
            kbPadEl = null;
        }
        if (!sec) return;
        const limit = window.innerHeight - kb - 18;
        const bottom = field.getBoundingClientRect().bottom;
        if (bottom <= limit) return;
        /* التوسيع مرة واحدة للوحة نفسها: تكراره مع كل حقل يزيد أسفل الصفحة بلا داعٍ */
        if (kbPadEl !== sec) {
            sec.style.setProperty('padding-bottom',
                Math.round(parseFloat(getComputedStyle(sec).paddingBottom) + kb) + 'px', 'important');
            kbPadEl = sec;
        }
        sec.scrollTop += Math.round(bottom - limit);
    }

    function bindKeyboard() {
        if (!window.visualViewport) return;
        const apply = () => {
            let kb = 0;
            let host = null;
            if (isEditing()) {
                const a = document.activeElement;
                host = a && a.closest ? a.closest('.modal-overlay') : null;
                const gap = Math.round(window.innerHeight - visualViewport.height - visualViewport.offsetTop);
                if (gap >= 90) kb = gap;
            }
            if (state.kb !== kb) {
                state.kb = kb;
                root.style.setProperty('--m-kb', kb + 'px');
            }
            /* لا يرتفع إلا الوعاء الذي فيه الحقل، والنوافذ المنزلاقة تُترك كما هي:
               تغيير أبعادها أثناء الخروج هو ما يجعلها تهبط ثم تصعد ثم تختفي */
            qsa('.modal-overlay').forEach((s) => {
                if (s.classList.contains('m-closing')) return;
                if (host !== s && !/display:\s*flex/.test(s.getAttribute('style') || '')) return;
                raiseSheet(s, kb > 0 && s === host ? kb : 0);
            });
            /* حقل داخل لوحة بلا منبثقة: المستند مثبّت، فالنظام لم يعد يمرّر إليه من
               تلقاء نفسه. نُوسّع أسفل اللوحة ثم نزيحها بقدر يُظهر الحقل فوق اللوحة،
               ونعيد ما وسّعناه حين تنزل. */
            revealInPage(kb > 0 && !host ? document.activeElement : null, kb > 0 && !host ? kb : 0);
        };
        visualViewport.addEventListener('resize', apply, { passive: true });
        visualViewport.addEventListener('scroll', apply, { passive: true });
        document.addEventListener('focusin', apply, { passive: true });
        document.addEventListener('focusout', apply, { passive: true });
        apply();
    }

    /* ================== لوحة «تفاصيل اليوم» ==================
       عرض فقط: الأرقام تُقرأ من سطر اليوم في جدول التقارير اليومية الذي يبنيه
       النظام نفسه، فلا يُحسب مبلغ ولا تُلمس قاعدة بيانات. الرابع (قيمة الطلبات
       المسجلة) يأتي من دالة قراءة إضافية في النظام تُرجع المجموع من نفس المصدر. */
    const TODAY_LINES = [
        ['sales', 'fa-money-bill-trend-up', 'المبيعات اليومية', 'up'],
        ['orders', 'fa-receipt', 'مبلغ الطلبات المسجلة', 'info'],
        ['expenses', 'fa-money-bill-transfer', 'الصرفيات', 'down'],
        ['net', 'fa-scale-balanced', 'الدخل الصافي', 'sum']
    ];
    let todayEl = null;

    function num(txt) {
        let s = String(txt == null ? '' : txt);
        s = s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
             .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
        const m = /-?\d[\d,.]*/.exec(s.replace(/[^\d.,-]/g, ''));
        if (!m) return 0;
        const n = parseFloat(m[0].replace(/[,.]/g, ''));
        return isFinite(n) ? Math.round(n) : 0;
    }

    function money(n) {
        const el = document.createElement('span');
        el.textContent = (n || 0).toLocaleString();
        return el.textContent;
    }

    function buildTodayPanel() {
        const page = pageOf('daily-report');
        if (!page || page.querySelector('.m-today')) return;
        const wrap = document.createElement('section');
        wrap.className = 'm-today';
        wrap.innerHTML =
            '<div class="m-today-head"><i class="fa-solid fa-sun"></i><span>تفاصيل اليوم</span>' +
            '<b class="m-today-date"></b></div><div class="m-today-rows">' +
            TODAY_LINES.map((l, k) =>
                '<div class="m-today-row ' + l[3] + '" data-k="' + l[0] + '" style="--m-r:' + k + '">' +
                '<i class="fa-solid ' + l[1] + '"></i>' +
                '<div class="m-today-meta"><span>' + l[2] + '</span><em class="m-today-bar"><i></i></em></div>' +
                '<b class="m-today-val">0</b></div>'
            ).join('') + '</div>' +
            '<div class="m-pulse">' +
                '<button type="button" class="m-pulse-i" data-p="active" aria-haspopup="dialog"><b class="m-pulse-n" data-p="active">0</b><small><i class="fa-solid fa-shirt"></i> قيد التنفيذ</small></button>' +
                '<button type="button" class="m-pulse-i due" data-p="due" aria-haspopup="dialog"><b class="m-pulse-n" data-p="due">0</b><small><i class="fa-solid fa-calendar-check"></i> موعدها اليوم</small></button>' +
                '<button type="button" class="m-pulse-i late zero" data-p="late" aria-haspopup="dialog"><b class="m-pulse-n" data-p="late">0</b><small><i class="fa-solid fa-hourglass-half"></i> أقدم من ٧ أيام</small></button>' +
            '</div>';
        page.appendChild(wrap);
        todayEl = wrap;
        wrap.querySelectorAll('.m-pulse-i').forEach((btn) => {
            btn.addEventListener('click', () => openPulseSheet(btn.getAttribute('data-p')));
        });
    }

    function todayRow() {
        const body = document.getElementById('admin-daily-reports-body');
        if (!body) return null;
        let key = '';
        try { key = typeof window.royalTodayKey === 'function' ? String(window.royalTodayKey()) : ''; } catch (e) { key = ''; }
        if (!key) return null;
        const rows = qsa('tr', body);
        for (let i = 0; i < rows.length; i++) {
            const td = qsa('td', rows[i]);
            if (td.length >= 6 && (td[0].textContent || '').trim() === key) return td;
        }
        return null;
    }

    /* الطلبات المفتوحة مرة واحدة للعدّ والقائمة معاً. قراءة فقط من الفواتير،
       والعمر من وقت فايربيس الموثوق لا ساعة الجهاز. */
    function collectActiveOrders() {
        let nowMs = Date.now();
        try { if (typeof window.getRealTime === 'function') nowMs = Number(window.getRealTime().timestamp) || nowMs; } catch (e) {}
        let key = '';
        try { key = typeof window.royalTodayKey === 'function' ? String(window.royalTodayKey()) : ''; } catch (e) { key = ''; }
        const out = [];
        try {
            const data = typeof window.royalDataRead === 'function' ? window.royalDataRead() : null;
            const list = (data && Array.isArray(data.invoices)) ? data.invoices : [];
            list.forEach((inv) => {
                if (!inv || inv.type !== 'active') return;
                const pd = inv.customer && inv.customer.pickupDate ? String(inv.customer.pickupDate).trim().slice(0, 10) : '';
                let ts = Number(inv.timestamp);
                if (!isFinite(ts) || ts <= 0) {
                    const ds = inv.date && /^\d{4}-\d{2}-\d{2}$/.test(String(inv.date)) ? String(inv.date) : '';
                    ts = ds ? Date.parse(ds + 'T12:00:00+03:00') : 0;
                } else if (ts < 1e12) {
                    ts *= 1000;
                }
                out.push({
                    inv,
                    ts,
                    due: !!(key && /^\d{4}-\d{2}-\d{2}$/.test(pd) && pd === key),
                    late: ts > 0 && nowMs - ts >= 7 * 86400000,
                    age: ts > 0 ? Math.max(0, Math.floor((nowMs - ts) / 86400000)) : -1
                });
            });
        } catch (e) { /* تُعرض آخر قراءة سليمة */ }
        out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
        return out;
    }

    let pulseEscBound = null;
    function closePulseSheet() {
        const sheet = document.querySelector('.m-pulse-sheet');
        if (!sheet) return;
        sheet.classList.add('out');
        if (pulseEscBound) { document.removeEventListener('keydown', pulseEscBound, true); pulseEscBound = null; }
        setTimeout(() => { if (sheet.parentNode) sheet.parentNode.removeChild(sheet); }, 360);
    }
    function pulseCountLabel(n) {
        if (n === 0) return 'لا طلبات';
        if (n === 1) return 'طلب واحد';
        if (n === 2) return 'طلبان';
        if (n >= 3 && n <= 10) return n + ' طلبات';
        return n + ' طلباً';
    }
    function pulseRow(o, i) {
        const inv = o.inv || {};
        const c = inv.customer || {};
        const name = String(c.name || '').trim() || 'طلب بلا اسم';
        const phone = String(c.phone || '').trim();
        const num = String(inv.dailyNumber || inv.id || '').trim();
        const d = String(inv.date || '');
        const bits = [];
        if (num) bits.push('#' + num);
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) bits.push(d.slice(8, 10) + '/' + d.slice(5, 7));
        if (phone) bits.push(phone);
        const age = o.age < 0 ? '' : (o.age === 0 ? 'اليوم' : o.age + ' يوم');
        return '<div class="m-po" style="--m-po:' + i + '">' +
            '<span class="m-po-av">' + esc(name.slice(0, 1)) + '</span>' +
            '<span class="m-po-body"><strong>' + esc(name) + '</strong><small>' + esc(bits.join(' · ')) + '</small></span>' +
            '<span class="m-po-end"><b>' + money(Number(inv.total) || 0) + ' د.ع</b>' +
                (age ? '<span class="m-po-age' + (o.late ? ' hot' : '') + '">' + esc(age) + '</span>' : '') +
            '</span>' +
        '</div>';
    }
    function openPulseSheet(kind) {
        const meta = {
            active: { title: 'الطلبات قيد التنفيذ', hint: 'كل الطلبات المفتوحة، الأقدم أولاً', icon: 'fa-shirt' },
            due: { title: 'موعد استلامها اليوم', hint: 'طلبات حدّد الزبون استلامها اليوم', icon: 'fa-calendar-check' },
            late: { title: 'أقدم من ٧ أيام', hint: 'طلبات مفتوحة تجاوزت أسبوعاً بلا تسليم', icon: 'fa-hourglass-half' }
        }[kind];
        if (!meta) return;
        const orders = collectActiveOrders();
        const list = kind === 'active' ? orders : orders.filter((o) => (kind === 'due' ? o.due : o.late));
        closePulseSheet();
        const sheet = document.createElement('div');
        sheet.className = 'm-pulse-sheet';
        sheet.innerHTML =
            '<div class="m-pulse-scrim"></div>' +
            '<div class="m-pulse-card" role="dialog" aria-modal="true" aria-label="' + esc(meta.title) + '">' +
                '<div class="m-pulse-grip"></div>' +
                '<div class="m-pulse-head">' +
                    '<div><h3><i class="fa-solid ' + meta.icon + '"></i> ' + esc(meta.title) + '</h3>' +
                    '<small>' + esc(pulseCountLabel(list.length) + ' · ' + meta.hint) + '</small></div>' +
                    '<button type="button" class="m-pulse-x" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>' +
                '</div>' +
                '<div class="m-pulse-list">' +
                    (list.length ? list.map(pulseRow).join('') : '<div class="m-po-empty"><i class="fa-solid fa-circle-check"></i><span>لا توجد طلبات في هذه الحالة الآن</span></div>') +
                '</div>' +
            '</div>';
        document.body.appendChild(sheet);
        requestAnimationFrame(() => sheet.classList.add('on'));
        sheet.addEventListener('click', (e) => {
            if (e.target.closest('.m-pulse-x') || e.target.classList.contains('m-pulse-scrim')) closePulseSheet();
        });
        pulseEscBound = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); closePulseSheet(); }
        };
        document.addEventListener('keydown', pulseEscBound, true);
        const x = sheet.querySelector('.m-pulse-x');
        if (x) setTimeout(() => { try { x.focus({ preventScroll: true }); } catch (e) {} }, 60);
        const listEl = sheet.querySelector('.m-pulse-list');
        if (listEl) listEl.scrollTop = 0;
    }

    /* ==================== المحفظة: إجراءات وكشف وحالة فارغة ====================
       كل ما هنا قراءة من جسر royalDataRead نفسه الذي ترسم منه بطاقتا الشريكين،
       وبالمعادلة نفسها حرفياً في app.js — لا حساب موازٍ يخالف الأرقام المعروضة. */
    const WB_ACCOUNTS = ['أحمد رزاق العامري', 'أحمد شاكر شبع'];
    let wbEscBound = null;

    function walletFigures() {
        const data = (typeof window.royalDataRead === 'function' && window.royalDataRead()) || {};
        const num = (v) => { const n = Number(v); return isFinite(n) ? n : 0; };
        let sales = 0, expenses = 0, costs = 0;
        (data.invoices || []).forEach((inv) => {
            if (!inv) return;
            if (inv.type === 'active' || inv.type === 'archived') sales += num(inv.customer && inv.customer.paid);
            else if (inv.type === 'cash' || inv.type === 'electronic') sales += num(inv.total);
        });
        (data.payments || []).forEach((p) => {
            if (!p) return;
            if (p.type === 'إلغاء اشتراك VIP') sales -= num(p.amount);
            else sales += num(p.amount);
        });
        (data.expenses || []).forEach((e) => { if (e) expenses += num(e.amount); });
        (data.operatingCosts || []).forEach((c) => { if (c) costs += num(c.amount); });
        const net = sales - expenses - costs;
        const share = net / 2;
        const acc = {};
        WB_ACCOUNTS.forEach((name) => { acc[name] = { dep: 0, wd: 0, n: 0 }; });
        (data.partnerTx || []).forEach((t) => {
            const a = t && acc[t.account];
            if (!a) return;
            if (t.type === 'إيداع') a.dep += num(t.amount); else a.wd += num(t.amount);
            a.n += 1;
        });
        return { sales, expenses, costs, net, share, acc };
    }

    function wbMoney(v) {
        return v < 0 ? '− ' + money(Math.abs(v)) : money(v);
    }
    function wbSign(v) { return v < 0 ? 'neg' : 'pos'; }

    function wbRow(icon, label, value, cls, total) {
        return '<div class="m-wb-row' + (total ? ' total' : '') + '">' +
            '<span><i class="fa-solid ' + icon + '"></i>' + esc(label) + '</span>' +
            '<b class="' + (cls || '') + '">' + value + '</b></div>';
    }

    function wbAccRow(name, f) {
        const a = f.acc[name];
        const bal = f.share + a.dep - a.wd;
        const hint = a.n === 0
            ? 'لا حركات مسجّلة · يبدأ من نصف الربح'
            : 'إيداع ' + money(a.dep) + ' · سحب ' + money(a.wd) + ' · ' + a.n + (a.n === 1 ? ' حركة' : ' حركات');
        return '<div class="m-wb-acc">' +
            '<div class="m-wb-acc-l">' +
                '<span class="m-wb-acc-av"><i class="fa-solid fa-user-tie"></i></span>' +
                '<div class="m-wb-acc-t"><b>' + esc(name) + '</b><small>' + esc(hint) + '</small></div>' +
            '</div>' +
            '<b class="m-wb-acc-v ' + wbSign(bal) + '">' + wbMoney(bal) + ' د.ع</b>' +
        '</div>';
    }

    function closeWalletSheet() {
        const sheet = document.querySelector('.m-wb-sheet');
        if (!sheet) return;
        sheet.classList.add('out');
        if (wbEscBound) { document.removeEventListener('keydown', wbEscBound, true); wbEscBound = null; }
        setTimeout(() => { if (sheet.parentNode) sheet.parentNode.removeChild(sheet); }, 360);
    }

    function openWalletSheet() {
        closeWalletSheet();
        const f = walletFigures();
        try { if (typeof haptic === 'function') haptic(8); } catch (e) {}
        const sheet = document.createElement('div');
        sheet.className = 'm-wb-sheet';
        sheet.innerHTML =
            '<div class="m-wb-scrim"></div>' +
            '<div class="m-wb-card" role="dialog" aria-modal="true" aria-label="كشف الأرصدة">' +
                '<div class="m-wb-grip"></div>' +
                '<div class="m-wb-head">' +
                    '<div><h3><i class="fa-solid fa-scale-balanced"></i> كشف الأرصدة</h3>' +
                    '<small>كيف تكوّن رقم كل شريك</small></div>' +
                    '<button type="button" class="m-wb-x" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>' +
                '</div>' +
                '<div class="m-wb-body">' +
                    '<div class="m-wb-sec">من أين يأتي الرصيد</div>' +
                    wbRow('fa-arrow-trend-up', 'صافي المبيعات التراكمي', money(f.sales), '') +
                    wbRow('fa-arrow-trend-down', 'المصروفات التراكمية', '− ' + money(f.expenses), 'neg') +
                    wbRow('fa-gears', 'التكاليف التشغيلية', '− ' + money(f.costs), 'neg') +
                    wbRow('fa-scale-balanced', 'صافي الربح التراكمي', wbMoney(f.net), wbSign(f.net), true) +
                    wbRow('fa-divide', 'حصّة كل شريك من الربح', wbMoney(f.share), wbSign(f.share)) +
                    '<div class="m-wb-sec">أرصدة الشريكين</div>' +
                    wbAccRow(WB_ACCOUNTS[0], f) +
                    wbAccRow(WB_ACCOUNTS[1], f) +
                    '<div class="m-wb-note">الرصيد الفعلي = نصف صافي الربح التراكمي + الإيداعات − السحوبات. ' +
                    'الأرقام تُقرأ من نفس بيانات السحابة التي ترسم منها البطاقات أعلاه، بلا أي كتابة.</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(sheet);
        requestAnimationFrame(() => sheet.classList.add('on'));
        sheet.addEventListener('click', (e) => {
            if (e.target.closest('.m-wb-x') || e.target.classList.contains('m-wb-scrim')) closeWalletSheet();
        });
        wbEscBound = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); closeWalletSheet(); }
        };
        document.addEventListener('keydown', wbEscBound, true);
        const x = sheet.querySelector('.m-wb-x');
        if (x) setTimeout(() => { try { x.focus({ preventScroll: true }); } catch (e) {} }, 60);
    }

    function openVault() {
        if (typeof window.openPartnerTxModal === 'function') window.openPartnerTxModal();
    }

    /* الشريط والحالة الفارغة يُبنيان مرة واحدة ثم يُصحَّح ظهورهما مع كل رسم:
       عند وصول أول حركة يختفي نصّ الفراغ، وعند مسحها يعود. */
    function syncWallet() {
        const sec = document.getElementById('admin-wallet');
        if (!sec) return;
        const h2 = sec.querySelector('h2');
        const tbody = document.getElementById('wallet-transactions-body');
        const table = tbody ? tbody.closest('table') : null;
        if (!h2 || !table) return;
        if (!sec.querySelector('.m-wb-bar')) {
            const bar = document.createElement('div');
            bar.className = 'm-wb-bar';
            bar.innerHTML =
                '<button type="button" class="m-wb-act prime" data-wb="tx"><i class="fa-solid fa-vault"></i><span>سحب / إيداع</span></button>' +
                '<button type="button" class="m-wb-act" data-wb="calc"><i class="fa-solid fa-scale-balanced"></i><span>كشف الأرصدة</span></button>';
            h2.insertAdjacentElement('afterend', bar);
            bar.addEventListener('click', (e) => {
                const b = e.target.closest('[data-wb]');
                if (!b) return;
                if (b.getAttribute('data-wb') === 'tx') openVault(); else openWalletSheet();
            });
        }
        const hasRows = !!(tbody && tbody.children.length);
        let loaded = false;
        try {
            const d = typeof window.royalDataRead === 'function' ? window.royalDataRead() : null;
            loaded = !!(d && typeof d === 'object');
        } catch (e) { loaded = false; }
        const empty = sec.querySelector('.m-wb-empty');
        if (loaded && !hasRows && !empty) {
            const card = document.createElement('div');
            card.className = 'm-wb-empty';
            card.setAttribute('role', 'note');
            card.innerHTML =
                '<span class="m-wb-empty-orb"><i class="fa-solid fa-vault"></i></span>' +
                '<b>لا توجد حركات سحب أو إيداع</b>' +
                '<p>كل حركة بين الشريكين تُسجَّل هنا مع رصيد الحساب بعدها، ويظهر أثرها فوراً في بطاقتي الرصيد أعلاه.</p>' +
                '<small>الأرصدة الحالية محسوبة من صافي الربح التراكمي فقط</small>' +
                '<button type="button" class="m-wb-act prime m-wb-empty-go"><i class="fa-solid fa-plus"></i><span>سجّل أول حركة</span></button>';
            const title = table.previousElementSibling;
            (title || table).insertAdjacentElement('afterend', card);
            card.querySelector('.m-wb-empty-go').addEventListener('click', openVault);
        } else if (hasRows && empty) {
            empty.parentNode.removeChild(empty);
        }
    }

    /* ==================== سجل الحركات: نطاقات وعرض متدرّج ====================
       لا نغيّر منطق renderLogs المشترك: نطاقاتنا تملأ نفس حقلي التاريخ، والقصّ
       يزيل الصفوف الزائدة من الـDOM فقط ويحتفظ بها لزر «عرض المزيد». */
    const LOGS_PAGE = 40;
    let logsStash = [];
    const pad2 = (n) => (n < 10 ? '0' + n : String(n));
    const isoOf = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    const isoDay = (off) => {
        const n = new Date();
        return isoOf(new Date(n.getFullYear(), n.getMonth(), n.getDate() + off));
    };

    function logsEarliest() {
        let min = '';
        try {
            const d = typeof window.royalDataRead === 'function' ? window.royalDataRead() : null;
            ((d && d.logs) || []).forEach((l) => {
                const s = l && /^\d{4}-\d{2}-\d{2}$/.test(String(l.date || '')) ? String(l.date) : '';
                if (s && (!min || s < min)) min = s;
            });
        } catch (e) {}
        return min;
    }

    function syncLogsRanges() {
        const wrap = document.querySelector('#admin-logs .m-logs-ranges');
        if (!wrap) return;
        const fromEl = document.getElementById('log-date-from');
        const toEl = document.getElementById('log-date-to');
        const from = (fromEl && fromEl.value) || '';
        const to = (toEl && toEl.value) || '';
        const today = isoDay(0);
        let on = '';
        if (from === today && to === today) on = 'today';
        else if (from === isoDay(-1) && to === isoDay(-1)) on = 'yday';
        else if (from === isoDay(-6) && to === today) on = 'week';
        else if (from === (logsEarliest() || '2000-01-01') && to === today) on = 'all';
        wrap.querySelectorAll('[data-r]').forEach((b) => {
            const is = b.getAttribute('data-r') === on;
            b.classList.toggle('on', is);
            b.setAttribute('aria-pressed', String(is));
        });
    }

    function setLogsRange(r) {
        const from = document.getElementById('log-date-from');
        const to = document.getElementById('log-date-to');
        if (!from || !to) return;
        if (r === 'all') {
            from.value = logsEarliest() || '2000-01-01';
            to.value = isoDay(0);
        } else if (r === 'week') {
            from.value = isoDay(-6); to.value = isoDay(0);
        } else if (r === 'yday') {
            from.value = isoDay(-1); to.value = isoDay(-1);
        } else {
            from.value = isoDay(0); to.value = isoDay(0);
        }
        try { if (typeof haptic === 'function') haptic(6); } catch (e) {}
        syncLogsRanges();
        if (typeof window.renderLogs === 'function') window.renderLogs();
    }

    function buildLogsRanges() {
        const sec = document.getElementById('admin-logs');
        if (!sec || sec.querySelector('.m-logs-ranges')) return;
        const h2 = sec.querySelector('h2');
        if (!h2) return;
        const wrap = document.createElement('div');
        wrap.className = 'm-logs-ranges';
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'نطاق سجل الحركات');
        wrap.innerHTML =
            '<button type="button" data-r="today" aria-pressed="false">اليوم</button>' +
            '<button type="button" data-r="yday" aria-pressed="false">أمس</button>' +
            '<button type="button" data-r="week" aria-pressed="false">٧ أيام</button>' +
            '<button type="button" data-r="all" aria-pressed="false">الكل</button>';
        h2.insertAdjacentElement('afterend', wrap);
        wrap.addEventListener('click', (e) => {
            const b = e.target.closest('[data-r]');
            if (b) setLogsRange(b.getAttribute('data-r'));
        });
    }

    function paintLogsFoot(total) {
        const sec = document.getElementById('admin-logs');
        const table = sec && sec.querySelector('.cart-table');
        if (!sec || !table) return;
        const remaining = logsStash.length;
        let foot = sec.querySelector('.m-logs-foot');
        if (!total) { if (foot) foot.remove(); return; }
        if (!foot) {
            foot = document.createElement('div');
            foot.className = 'm-logs-foot';
            foot.innerHTML = '<button type="button" class="m-wb-act prime m-logs-more"><i class="fa-solid fa-angles-down"></i><span>عرض المزيد</span></button>' +
                '<small class="m-logs-count"></small>';
            table.insertAdjacentElement('afterend', foot);
            foot.querySelector('.m-logs-more').addEventListener('click', () => {
                const body = document.getElementById('logs-table-body');
                if (!body || !logsStash.length) return;
                const frag = document.createDocumentFragment();
                logsStash.splice(0, LOGS_PAGE).forEach((r) => frag.appendChild(r));
                body.appendChild(frag);
                try { if (typeof haptic === 'function') haptic(6); } catch (e) {}
                paintLogsFoot(body.children.length + logsStash.length);
            });
        }
        const btn = foot.querySelector('.m-logs-more');
        const cnt = foot.querySelector('.m-logs-count');
        const shown = Math.max(0, total - remaining);
        btn.style.display = remaining ? '' : 'none';
        if (remaining) {
            btn.querySelector('span').textContent = 'عرض المزيد · المتبقي ' + remaining;
            cnt.textContent = 'عرض ' + shown + ' من ' + total + ' حركة';
        } else {
            cnt.textContent = 'تم عرض كل الحركات · ' + total;
        }
    }

    function paintLogsEmpty(count) {
        const sec = document.getElementById('admin-logs');
        const table = sec && sec.querySelector('.cart-table');
        if (!sec || !table) return;
        const old = sec.querySelector('.m-logs-empty');
        let loaded = false;
        try {
            const d = typeof window.royalDataRead === 'function' ? window.royalDataRead() : null;
            loaded = !!(d && typeof d === 'object');
        } catch (e) { loaded = false; }
        if (!loaded || count > 0) { if (old) old.remove(); return; }
        if (old) return;
        const card = document.createElement('div');
        card.className = 'm-wb-empty m-logs-empty';
        card.setAttribute('role', 'note');
        card.innerHTML =
            '<span class="m-wb-empty-orb"><i class="fa-solid fa-clock-rotate-left"></i></span>' +
            '<b>لا حركات في هذا النطاق</b>' +
            '<p>جرّب «٧ أيام» أو «الكل»، أو امسح كلمة البحث.</p>' +
            '<button type="button" class="m-wb-act prime m-logs-all"><i class="fa-solid fa-arrow-left"></i><span>عرض كل الحركات</span></button>';
        table.insertAdjacentElement('afterend', card);
        card.querySelector('.m-logs-all').addEventListener('click', () => {
            /* البحث كلمة قديمة تُبقي النتيجة صفراً حتى بعد «الكل»
               فنمسحه مع توسيع النطاق وإلا بقيت البطاقة تعرض نفسها */
            const search = document.getElementById('log-search-text');
            if (search && search.value) { search.value = ''; }
            setLogsRange('all');
        });
    }

    function trimLogs() {
        const body = document.getElementById('logs-table-body');
        if (!body) return;
        const rows = Array.prototype.slice.call(body.children);
        logsStash = rows.slice(LOGS_PAGE);
        logsStash.forEach((r) => r.remove());
        paintLogsFoot(rows.length);
        paintLogsEmpty(rows.length);
        syncLogsRanges();
    }

    /* الحقول تُغلَّف مرة واحدة فقط؛ التفكيك في dispose يعيدها لأبويها الأصلي
       كي لا تفقد شاشة سطح المكتب فلاترها إن أُزيلت طبقة الجوال */
    function buildLogsFilters() {
        const filters = document.querySelector('#admin-logs .admin-filters');
        if (!filters || filters.dataset.mLogsFilters === '1') return;
        const from = document.getElementById('log-date-from');
        const to = document.getElementById('log-date-to');
        const search = document.getElementById('log-search-text');
        if (!from || !to || !search) return;
        const dates = document.createElement('div');
        dates.className = 'm-logs-dates';
        const field = (input, label) => {
            const box = document.createElement('label');
            box.className = 'm-logs-field';
            const tag = document.createElement('span');
            tag.textContent = label;
            box.appendChild(tag);
            box.appendChild(input);
            return box;
        };
        dates.appendChild(field(from, 'من'));
        dates.appendChild(field(to, 'إلى'));
        filters.insertBefore(dates, search);
        const wrap = document.createElement('div');
        wrap.className = 'm-logs-search';
        filters.insertBefore(wrap, search);
        wrap.appendChild(search);
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'm-logs-clear';
        clear.setAttribute('aria-label', 'مسح البحث');
        clear.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        wrap.appendChild(clear);
        const syncClear = () => clear.classList.toggle('on', !!search.value);
        search.addEventListener('input', syncClear);
        search.addEventListener('keyup', syncClear);
        clear.addEventListener('click', () => {
            search.value = '';
            syncClear();
            try { if (typeof haptic === 'function') haptic(6); } catch (e) {}
            if (typeof window.renderLogs === 'function') window.renderLogs();
            try { search.focus({ preventScroll: true }); } catch (e) {}
        });
        filters.dataset.mLogsFilters = '1';
        syncClear();
    }

    function unwrapLogsFilters() {
        const filters = document.querySelector('#admin-logs .admin-filters');
        if (!filters || filters.dataset.mLogsFilters !== '1') return;
        const from = document.getElementById('log-date-from');
        const to = document.getElementById('log-date-to');
        const search = document.getElementById('log-search-text');
        const dates = filters.querySelector('.m-logs-dates');
        const wrap = filters.querySelector('.m-logs-search');
        if (dates) {
            if (from) filters.insertBefore(from, dates);
            if (to) filters.insertBefore(to, dates);
            dates.remove();
        }
        if (wrap) {
            if (search) filters.insertBefore(search, wrap);
            wrap.remove();
        }
        delete filters.dataset.mLogsFilters;
    }

    /* الوصول لآخر القائمة يحمّل الدفعة التالية بلا لمسة إضافية. الزر يبقى
       للوصولية ولمن يريد التحكم، والتحميل التلقائي يستدعيه نفسه. */
    function bindLogsAuto() {
        const sec = document.getElementById('admin-logs');
        if (!sec || sec.dataset.mLogsAuto === '1') return;
        sec.dataset.mLogsAuto = '1';
        let raf = 0;
        sec.addEventListener('scroll', () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                if (!document.body.classList.contains('m-admin')) return;
                if (state.busy || phys.touching) return;
                if (sec.scrollHeight - sec.scrollTop - sec.clientHeight > 380) return;
                const btn = sec.querySelector('.m-logs-more');
                if (btn && btn.style.display !== 'none' && logsStash.length) btn.click();
            });
        }, { passive: true });
    }

    function initLogsChrome() {
        buildLogsFilters();
        buildLogsRanges();
        bindLogsAuto();
        const from = document.getElementById('log-date-from');
        const to = document.getElementById('log-date-to');
        if (from && to && !from.value && !to.value) {
            from.value = isoDay(0);
            to.value = isoDay(0);
            if (typeof window.renderLogs === 'function') window.renderLogs();
        }
        syncLogsRanges();
    }

    function paintToday() {
        if (!todayEl) buildTodayPanel();
        if (!todayEl) return;
        let key = '';
        try { key = typeof window.royalTodayKey === 'function' ? String(window.royalTodayKey()) : ''; } catch (e) {}
        const td = todayRow();
        const sales = td ? num(td[2].textContent) : 0;
        const expenses = td ? num(td[3].textContent) : 0;
        let orders = 0;
        try { orders = num(typeof window.royalTodayOrdersValue === 'function' ? window.royalTodayOrdersValue() : 0); } catch (e) { orders = 0; }
        const net = td && td.length > 5 ? num(td[5].textContent) : sales - expenses;
        const vals = { sales: sales, orders: orders, expenses: expenses, net: net };
        const peak = Math.max(sales, orders, expenses, 1);
        TODAY_LINES.forEach((l) => {
            const row = todayEl.querySelector('[data-k="' + l[0] + '"]');
            if (!row) return;
            const v = vals[l[0]];
            const cell = row.querySelector('.m-today-val');
            const text = money(v) + ' د.ع';
            if (cell.textContent !== text) cell.textContent = text;
            row.classList.toggle('neg', v < 0);
            const fill = row.querySelector('.m-today-bar i');
            const pct = Math.max(4, Math.min(100, Math.round(Math.abs(v) / peak * 100)));
            const w = pct + '%';
            if (fill.style.width !== w) fill.style.width = w;
        });
        /* نبض التشغيل: قراءة فقط من الفواتير — الطلبات المفتوحة، منها ما موعده
           اليوم، وما تجاوز سبعة أيام بلا تسليم. لا يمسّ أي رقم مالي.
           العدّ والقائمة يقرآن من collectActiveOrders نفسها فلا يختلفان. */
        const openOrders = collectActiveOrders();
        const pulse = {
            active: openOrders.length,
            due: openOrders.filter((o) => o.due).length,
            late: openOrders.filter((o) => o.late).length
        };
        Object.keys(pulse).forEach((k) => {
            const n = todayEl.querySelector('.m-pulse-n[data-p="' + k + '"]');
            if (!n) return;
            const t = money(pulse[k]);
            if (n.textContent !== t) n.textContent = t;
        });
        const lateItem = todayEl.querySelector('.m-pulse-i.late');
        if (lateItem) lateItem.classList.toggle('zero', pulse.late === 0);
        const d = todayEl.querySelector('.m-today-date');
        const label = key ? new Intl.DateTimeFormat('ar-IQ', { weekday: 'long', day: 'numeric', month: 'long' })
            .format(new Date(key + 'T12:00:00')) : '';
        if (label && d.textContent !== label) d.textContent = label;
    }

    function bindTodayPanel() {
        buildTodayPanel();
        paintToday();
        if (state.todayTimer) return;
        /* يتحدث وحده كل دقيقة طالما الإدارة مفتوحة: يوم جديد يدخل بلا إعادة تحميل */
        state.todayTimer = setInterval(() => {
            if (!document.getElementById(ADMIN_ID).classList.contains('active-screen')) return;
            if (document.hidden) return;
            paintToday();
        }, 60000);
    }

    /* ================== شاشة الدخول والقفل ================== */
    const LOGIN_ID = 'modal-admin-login';
    const OTP_LEN = 4;
    const OTP_GAP = 12;
    const MASK_DIGITS = false;
    const MASK_AFTER = 400;
    const VERDICT_MS = 6500;
    const ENTRANCE_SPEED = 1;
    const FX_SLOTS = [[0, 0], [1, 0], [0, 1], [1, 1]];
    /* النقر الرابع يرجع فوراً وتُترك للوحة فرصة ترسم الرقم؛ المسرح يبدأ بعد
       مهلة قصيرة. بلا هذه المهلة يُبنى المسرح داخل نفس المهمة فلا يظهر رقم. */
    const SUBMIT_HOLD = 200;
    const POP_IN = 340;
    /* نزول الرقم: هَبْطة واحدة تستقر بلا رجّات — المربّع يغوص مليماً وينضغط
       انضغاطاً خفيفاً، وحلقة ضوء تتّسع حوله. رقم واحد يمسك كل المقادير */
    const LAND_SINK = 1.5;
    const LAND_SQUASH = .05;
    const LAND_MS = 470;
    const GLOW_MS = 640;
    const TIP_TAG = 'مقترح';
    const TIP_TEXT = 'مواليد';
    const TIP_MS = 5200;

    /* ==================== حرّاس الرمز ====================
       ثلاث محاولات بلا انتظار، وكل واحدة بعدها تركب سلّماً يطول: 20 ثانية،
       ثم دقيقة، ثم ثلاث، ثم خمس وتقف. لا قفل أبدي يُضيّع صاحبه، ولا باب
       مفتوح للتخمين: خمس ثوانٍ لكل محاولة = 288 محاولة في اليوم، وأرقامها
       العشرة الآلاف تعني أسبوعين من النقر المتواصل بلا طائل.
       العدّاد في الصفحة ونسخته في localStorage: إعادة التحميل لا تمسحه. */
    const GUARD_FREE = 3;
    const GUARD_WAIT = [20, 60, 180, 300];
    const GUARD_FORGET = 15 * 60 * 1000;
    const GUARD_KEY = 'royal.lk.guard.v1';
    const guard = { n: 0, until: 0 };

    function guardLoad() {
        guard.n = 0;
        guard.until = 0;
        try {
            const j = JSON.parse(localStorage.getItem(GUARD_KEY) || '{}') || {};
            const now = Date.now();
            if (typeof j.n === 'number' && now - (j.at || 0) < GUARD_FORGET) guard.n = Math.max(0, Math.floor(j.n));
            if (typeof j.until === 'number' && j.until > now) guard.until = j.until;
        } catch (e) {}
    }
    function guardSave() {
        try { localStorage.setItem(GUARD_KEY, JSON.stringify({ n: guard.n, until: guard.until, at: Date.now() })); } catch (e) {}
    }
    function guardLeft() {
        return guard.until > Date.now() ? Math.ceil((guard.until - Date.now()) / 1000) : 0;
    }
    /* اللمبة تُفتح حيث يُفتح الأمل وحده: بعد أن دخل صاحب الجهاز في المتاهة */
    function guardTipOpen() {
        return guard.n > GUARD_FREE;
    }
    function guardFail() {
        guard.n += 1;
        const step = guard.n - GUARD_FREE;
        const sec = step > 0 ? GUARD_WAIT[Math.min(step, GUARD_WAIT.length) - 1] : 0;
        guard.until = sec ? Date.now() + sec * 1000 : 0;
        guardSave();
        return sec;
    }
    function guardPass() {
        guard.n = 0;
        guard.until = 0;
        guardSave();
    }

    function lkRefs() {
        const modal = document.getElementById(LOGIN_ID);
        const shell = modal && modal.querySelector('.m-lk-shell');
        if (!shell) return null;
        return {
            shell,
            card: shell.querySelector('.m-lk-card'),
            pad: shell.querySelector('.m-pad'),
            bulb: shell.querySelector('[data-k="hint"]'),
            btn: shell.querySelector('.modal-actions .btn-confirm'),
            err: shell.querySelector('.m-lk-err'),
            tip: shell.querySelector('.m-lk-tip')
        };
    }
    function syncBulb() {
        const r = lkRefs();
        if (!r || !r.bulb) return;
        const open = guardTipOpen();
        const was = r.bulb.classList.contains('lit');
        r.bulb.classList.toggle('lit', open);
        if (!open && r.tip) {
            r.tip.classList.remove('on');
            if (r.card) r.card.classList.remove('tip-live');
        }
        /* الاشتعال مرة واحدة عند انتقال الحالة لا في كل استدعاء: وإلا ومضت
           اللمبة مع كل نقرة وهو مطفأ أصلاً */
        if (open && !was) bulbIgnite(r.bulb);
    }
    /* اللمبة تُشعل من داخلها: وهجة تتّسع وتخبو داخل حدّ الزر، والمربع ينكمش
       ويتمدّد انكماش الإضاءة الأولى. transform وopacity، بلا إعادة رسم. */
    function bulbIgnite(btn) {
        if (REDUCED || !btn.animate) return;
        const f = document.createElement('i');
        f.className = 'm-bulb-flare';
        f.setAttribute('aria-hidden', 'true');
        btn.appendChild(f);
        const a = f.animate([
            { opacity: 0, transform: 'scale(.5)' },
            { opacity: .95, transform: 'scale(1.04)', offset: .26 },
            { opacity: 0, transform: 'scale(1.9)' }
        ], { duration: 760, easing: 'cubic-bezier(.2,.8,.3,1)' });
        a.onfinish = () => f.remove();
        a.oncancel = () => f.remove();
        btn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.13)', offset: .22 },
            { transform: 'scale(.975)', offset: .56 },
            { transform: 'scale(1)' }
        ], { duration: 560, easing: 'cubic-bezier(.2,.8,.3,1)' });
    }
    function fmtWait(sec) {
        return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
    }
    let coolTick = 0;
    let coolBar = null;
    let coolAnim = null;
    let coolQuiet = 0;
    function coolPaint(r, sec) {
        if (!r || !r.err) return;
        if (Date.now() < coolQuiet) return;
        r.err.textContent = 'انتظر ' + fmtWait(sec) + ' للمحاولة التالية';
        r.err.classList.add('on', 'cool');
        r.err.classList.remove('bad');
    }
    function coolStop(keepErr) {
        if (coolTick) { clearInterval(coolTick); coolTick = 0; }
        if (coolAnim) { try { coolAnim.cancel(); } catch (e) {} coolAnim = null; }
        if (coolBar) { coolBar.remove(); coolBar = null; }
        coolQuiet = 0;
        const r = lkRefs();
        if (!r) return;
        if (r.pad) r.pad.classList.remove('cooling');
        if (r.btn) { r.btn.classList.remove('cool'); r.btn.disabled = false; }
        if (r.err && !keepErr && r.err.classList.contains('cool')) {
            r.err.classList.remove('on', 'cool');
            r.err.textContent = '';
        }
    }
    function coolStart(sec, quietMs) {
        const r = lkRefs();
        if (!r || !r.btn) return;
        coolStop(true);
        r.pad && r.pad.classList.add('cooling');
        r.btn.classList.remove('armed');
        r.btn.classList.add('cool');
        r.btn.disabled = true;
        coolBar = document.createElement('i');
        coolBar.className = 'm-lk-cool-bar';
        r.btn.appendChild(coolBar);
        if (REDUCED || !coolBar.animate) {
            coolBar.style.transform = 'scaleX(0)';
        } else {
            coolAnim = coolBar.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
                { duration: sec * 1000, easing: 'linear', fill: 'forwards' });
        }
        coolQuiet = Date.now() + (quietMs || 0);
        coolPaint(r, sec);
        announce('انتظر ' + fmtWait(sec) + ' قبل المحاولة التالية');
        coolTick = setInterval(() => {
            const left = guardLeft();
            if (left <= 0) {
                coolStop();
                announce('تفضّل، يمكنك المحاولة الآن');
                return;
            }
            coolPaint(lkRefs(), left);
        }, 1000);
    }

    const LK_SVG = {
        lock: '<svg class="m-lock" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.4 9.2V6.8a4.6 4.6 0 0 1 9.2 0v2.4"/><path d="M3.6 9.2h12.8a1.4 1.4 0 0 1 1.4 1.4v6a1.6 1.6 0 0 1-1.6 1.6H3.8a1.6 1.6 0 0 1-1.6-1.6v-6a1.4 1.4 0 0 1 1.4-1.4z"/><circle cx="10" cy="13.6" r="1.2"/></svg>',
        core: '<svg viewBox="0 0 26 26" aria-hidden="true"><circle class="m-spin" cx="13" cy="13" r="9" stroke-dasharray="34 100"/><path class="m-tick" d="M6.4 13.6 11 18.2 19.8 8.2" opacity="0"/></svg>',
        pill: '<svg viewBox="0 0 13 14" aria-hidden="true"><path d="M3.4 6.2V4.4a3.1 3.1 0 0 1 6.2 0v1.8"/><path d="M2.2 6.2h8.6a1.2 1.2 0 0 1 1.2 1.2v4.4a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 11.8V7.4a1.2 1.2 0 0 1 1.2-1.2z"/></svg>'
    };

    function makeClock() {
        let t = 0, prev = 0, raf = 0, on = false;
        const jobs = [];
        function step(now) {
            if (!on) return;
            if (!prev) prev = now;
            const dt = Math.min(50, now - prev);
            prev = now;
            if (!document.hidden) {
                t += dt;
                const due = jobs.filter((j) => j.at <= t).sort((a, b) => a.at - b.at);
                for (let i = jobs.length - 1; i >= 0; i--) if (jobs[i].at <= t) jobs.splice(i, 1);
                due.forEach((j) => j.fn());
            }
            raf = requestAnimationFrame(step);
        }
        return {
            after(ms, fn) { jobs.push({ at: t + ms, fn }); },
            start() { if (!on) { on = true; prev = 0; raf = requestAnimationFrame(step); } },
            stop() { on = false; if (raf) cancelAnimationFrame(raf); jobs.length = 0; }
        };
    }

    function springTrack(o) {
        o = o || {};
        if (REDUCED) return { steps: [0, 1], ms: 160 };
        const k = o.stiffness || 210, c = o.damping || 22, m = o.mass || 1;
        const rest = o.rest || 0.0012, dt = 1 / 64;
        let x = 0, v = 0, t = 0;
        const steps = [0];
        const cap = o.maxMs || 1500;
        while (t * 1000 < cap) {
            v += ((-k * (x - 1) - c * v) / m) * dt;
            x += v * dt;
            t += dt;
            steps.push(x);
            if (Math.abs(1 - x) < rest && Math.abs(v) < rest) break;
        }
        steps[steps.length - 1] = 1;
        return { steps: steps, ms: Math.max(130, Math.round(t * 1000)) / (o.speed || 1) };
    }

    function spring(el, build, o, keep, commit) {
        if (!el) return null;
        o = o || {};
        if (!el.animate) {
            const f = build(1);
            Object.keys(f).forEach((k) => { el.style[k] = f[k]; });
            return null;
        }
        const tr = springTrack(o);
        const frames = tr.steps.map((p) => build(p));
        const last = build(1);
        frames.push(last);
        if (commit) Object.keys(last).forEach((k) => { el.style[k] = last[k]; });
        const a = el.animate(frames, {
            duration: tr.ms,
            delay: o.delay || 0,
            easing: 'linear',
            fill: commit ? (o.delay ? 'backwards' : 'none') : 'forwards'
        });
        if (keep) keep.push(a);
        return a;
    }

    const xf = (x, y, s) => ({ transform: 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')' });
    const mix = (a, b, p) => a + (b - a) * p;

    let lkRowW = 0;
    function slotX(i) {
        if (!lkRowW) {
            const row = document.querySelector('#' + LOGIN_ID + ' .m-otp');
            lkRowW = row ? row.clientWidth : 0;
        }
        if (!lkRowW) return { w: 0, x: 0 };
        const w = (lkRowW - OTP_GAP * (OTP_LEN - 1)) / OTP_LEN;
        return { w: w, x: i * (w + OTP_GAP) };
    }

    function cellsIn(ctx) { return qsa('.m-otp b', ctx || document); }
    function glideIn(ctx) { return (ctx || document).querySelector('.m-otp-glide'); }
    function lockCard() { return document.querySelector('#' + LOGIN_ID + ' .m-lk-card'); }

    function paintGlide(input, shell) {
        const g = glideIn(shell);
        if (!g) return;
        const len = input ? (input.value || '').length : 0;
        const s = slotX(Math.min(len, OTP_LEN - 1));
        if (!s.w) return;
        const shown = document.activeElement === input && len < OTP_LEN;
        if (g.style.width !== s.w + 'px') g.style.width = s.w + 'px';
        g.classList.toggle('off', !shown);
        g.classList.toggle('hide-caret', !shown);
        const now = 'translate3d(' + s.x.toFixed(2) + 'px,0,0)';
        if (g.dataset.x !== now) {
            const hadPosition = !!g.dataset.x;
            g.dataset.x = now;
            if (hadPosition) spring(g, () => ({ transform: now }), { stiffness: 320, damping: 26 }, null, true);
            else g.style.transform = now;
        }
    }

    let popFlip = 0;
    /* الرقم لا يُكتب بل يهبط إلى موضعه ثم يستقر — لغة المحو نفسها معكوسة:
       المحو يصعد ويذوب، والدخول يصعد من تحته ويظهر. */
    /* الهَبْطة بدل الاهتزاز: غوصة مليمتين وانضغاط خفيف، ثم نَفَسان يخفتان
       حتى السكون. بلا دوران وبلا رجّة على المحور الأفقي — العين ترتاح لها.
       transform خالص: لا قراءة تخطيط، ولا إعادة رسم للمربّع. */
    function cellLand(cell) {
        if (!cell.animate) return;
        if (cell._land) { try { cell._land.cancel(); } catch (e) {} }
        if (!REDUCED) {
            const y = LAND_SINK, s = LAND_SQUASH;
            cell._land = cell.animate([
                { transform: 'translate3d(0,0,0) scale(1,1)', offset: 0 },
                { transform: 'translate3d(0,' + y.toFixed(2) + 'px,0) scale(' + (1 + s).toFixed(3) + ',' + (1 - s).toFixed(3) + ')', offset: .18 },
                { transform: 'translate3d(0,' + (-y * .5).toFixed(2) + 'px,0) scale(' + (1 - s * .42).toFixed(3) + ',' + (1 + s * .42).toFixed(3) + ')', offset: .46 },
                { transform: 'translate3d(0,' + (y * .14).toFixed(2) + 'px,0) scale(' + (1 + s * .14).toFixed(3) + ',' + (1 - s * .14).toFixed(3) + ')', offset: .72 },
                { transform: 'translate3d(0,0,0) scale(1,1)', offset: 1 }
            ], { duration: LAND_MS, easing: 'cubic-bezier(.22,.86,.24,1)' });
        }
        /* ضوء يتّسع خلف المربّع ويطفئ: الطبقة مُعدّة مسبقاً بـ radial-gradient
           فلا blur متحرك ولا ظل يتغيّر إطاراً تلو الآخر */
        if (REDUCED || !cell.animate) return;
        if (cell._glow && cell._glow.parentNode) cell._glow.parentNode.removeChild(cell._glow);
        const glow = document.createElement('i');
        glow.className = 'm-otp-glow';
        glow.setAttribute('aria-hidden', 'true');
        cell.appendChild(glow);
        cell._glow = glow;
        const a = glow.animate([
            { opacity: 0, transform: 'scale(.66)' },
            { opacity: .95, transform: 'scale(1)', offset: .2 },
            { opacity: 0, transform: 'scale(1.55)' }
        ], { duration: GLOW_MS, easing: 'cubic-bezier(.16,.84,.3,1)' });
        a.onfinish = () => {
            if (cell._glow === glow) cell._glow = null;
            if (glow.parentNode) glow.parentNode.removeChild(glow);
        };
    }

    function popCell(cell, dir, seen) {
        const u = cell.firstElementChild;
        if (dir > 0) {
            popFlip ^= 1;
            cell.classList.toggle('pa', popFlip === 0);
            cell.classList.toggle('pb', popFlip === 1);
        }
        if (dir > 0) cellLand(cell);
        if (!u || REDUCED || !u.animate) return;
        /* الحذف ثم الكتابة في أقل من رمشة: لو تُركت حركة المحو تعمل لسحبت
           الرقم الجديد معها عند انتهائها، فيُلغى أولًا */
        if (u._pop) { try { u._pop.cancel(); } catch (e) {} u._pop = null; }
        if (dir > 0) {
            /* الرقم يظهر وهو يُضبط: ضباب خفيف يزول في أول ثلث — كعدسة تقَع
               على الهدف، لا كحرف يُطبع */
            u._pop = u.animate([
                { transform: 'translate3d(0,12px,0) scale(.72)', opacity: 0, filter: 'blur(2.2px)' },
                { transform: 'translate3d(0,-1.4px,0) scale(1.05)', opacity: 1, filter: 'blur(0px)', offset: .3 },
                { transform: 'translate3d(0,.6px,0) scale(.992)', opacity: 1, filter: 'blur(0px)', offset: .62 },
                { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, filter: 'blur(0px)' }
            ], { duration: POP_IN, easing: 'cubic-bezier(.2,.85,.25,1)' });
        } else if (seen) {
            u.textContent = seen;
            const a = u.animate([
                { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
                { transform: 'translate3d(0,-9px,0) scale(.6)', opacity: 0 }
            ], { duration: 165, easing: 'cubic-bezier(.4,0,.75,.25)' });
            a.onfinish = () => { u.textContent = ''; u._pop = null; };
            u._pop = a;
        }
    }

    const maskTimers = [];
    function paintOtp(input, shell) {
        const host = shell || document.getElementById(LOGIN_ID);
        if (!host) return;
        const v = input.value || '';
        while (maskTimers.length) clearTimeout(maskTimers.pop());
        cellsIn(host).forEach((c, i) => {
            const raw = v[i] || '';
            const u = c.firstElementChild || c;
            const seen = c.dataset.d || '';
            if (u.textContent !== raw) u.textContent = raw;
            if (raw !== seen) { c.dataset.d = raw; popCell(c, raw ? 1 : -1, seen); }
            c.classList.toggle('filled', !!raw);
            c.classList.toggle('cur', i === Math.min(v.length, OTP_LEN - 1));
            if (MASK_DIGITS && raw) {
                maskTimers.push(setTimeout(() => {
                    if ((input.value || '')[i] === raw) u.textContent = '•';
                }, MASK_AFTER + i * 40));
            }
        });
        const go = host.querySelector && host.querySelector('.modal-actions .btn-confirm');
        if (go) go.classList.toggle('armed', v.length === OTP_LEN);
        paintGlide(input, host);
    }

    function playEntrance(shell) {
        if (shell.dataset.entered === '1') return;
        shell.dataset.entered = '1';
        const scene = shell.parentElement && shell.parentElement.querySelector('.m-lk-scene');
        if (scene && scene.animate) {
            scene.animate([{ opacity: 0 }, { opacity: 1 }], { duration: REDUCED ? 120 : 300 / ENTRANCE_SPEED, fill: 'backwards' });
        }
        const enter = (el, delay, y, scale, maxMs) => {
            if (!el) return;
            spring(el, (p) => ({
                opacity: Math.min(1, p * 1.3).toFixed(3),
                transform: 'translate3d(0,' + (y * (1 - p)).toFixed(2) + 'px,0) scale(' + (scale + (1 - scale) * p).toFixed(4) + ')'
            }), { stiffness: 190, damping: 22, maxMs: maxMs || 560, delay: REDUCED ? 0 : delay / ENTRANCE_SPEED, speed: ENTRANCE_SPEED }, null, true);
        };
        enter(shell, 90, 22, .94, 660);
        enter(shell.querySelector('.m-lk-chip'), 330, 10, .86, 480);
        qsa('.m-lk-word', shell).forEach((n, i) => enter(n, 410 + i * 70, 10, .96, 460));
        enter(shell.querySelector('.m-lk-sub'), 640, 8, .98, 440);
        cellsIn(shell).forEach((n, i) => enter(n, 700 + i * 105, 15, .86, 520));
        /* اللوحة تدخل ككتلة واحدة: أحد عشر عنصراً متحركاً في لحظة فتح
           النافذة هو ثمن طبقات لا يرى المستخدم منها فرقاً */
        enter(shell.querySelector('.m-pad'), 860, 12, .95, 500);
        enter(shell.querySelector('.modal-actions'), 1000, 10, .97, 460);
        enter(shell.querySelector('.m-lk-hint'), 1090, 6, .99, 420);
    }

    let fxPending = null;

    function watchUnlock() {
        const admin = document.getElementById(ADMIN_ID);
        const toasts = document.getElementById('toast-container');
        if (!window.MutationObserver) return;
        if (admin) {
            new MutationObserver(() => {
                if (!fxPending || fxPending.done) return;
                if (admin.classList.contains('active-screen') && !fxPending.admin0) fxPending.verdict('ok');
            }).observe(admin, { attributes: true, attributeFilter: ['class'] });
        }
        if (toasts) {
            new MutationObserver(() => {
                if (!fxPending || fxPending.done) return;
                const t = toasts.lastElementChild;
                if (t && t !== fxPending.toast0 && t.classList.contains('toast-error')) fxPending.verdict('bad');
            }).observe(toasts, { childList: true });
        }
    }

    function makeStage(digits) {
        const modal = document.getElementById(LOGIN_ID);
        const real = modal && modal.querySelector('.m-lk-shell');
        if (!real) return null;
        const stage = document.createElement('div');
        stage.className = 'm-lk-fx';
        stage.setAttribute('aria-hidden', 'true');
        const scene = modal.querySelector('.m-lk-scene');
        if (scene) {
            const copy = scene.cloneNode(true);
            /* شريط الضوء والشبكة أضخم طبقتين في المشهد وأولاهم كلفةً في
               إطار الاستلام الأول؛ حذفهما من المسرح يرفع اللقطة ولا يُفقد
               شيئاً يرى المستخدم: البطاقة وكل ما يتحرك فوقها يبقى كما هو */
            for (let i = copy.children.length - 1; i >= 4; i--) copy.children[i].remove();
            stage.appendChild(copy);
        }
        /* التلميح كلمة تُقرأ ثم تُمحى: يُطفأ قبل النسخ حتى لا يصل المسرحَ
           وهو يحمل الفقاعة معه */
        qsa('.m-lk-tip', real).forEach((t) => t.classList.remove('on'));
        qsa('.m-lk-card', real).forEach((c) => c.classList.remove('tip-live'));
        const shell = real.cloneNode(true);
        shell.removeAttribute('data-entered');
        const dup = shell.querySelector('.m-otp-input');
        if (dup) dup.remove();
        qsa('.modal-actions button', shell).forEach((b) => { b.disabled = true; b.removeAttribute('onclick'); });
        cellsIn(shell).forEach((c, i) => {
            c.style.animation = 'none';
            c.classList.remove('bad');
            /* الحلقة والخوارية كانا في منتصف كتابتهما على الشاشة الأصلية؛
               المسرح يستلمهما ساكنتَين لا من نصف الطريق */
            c.classList.remove('pa', 'pb');
            c.dataset.d = digits[i] || '';
            c.classList.toggle('filled', !!digits[i]);
            const u = c.firstElementChild || c;
            u.textContent = digits[i] || '';
        });
        qsa('.m-pad button', shell).forEach((b) => { b.style.animation = 'none'; });
        const g = glideIn(shell);
        if (g) { g.classList.add('off'); g.style.transform = ''; }
        const err = shell.querySelector('.m-lk-err');
        if (err) err.classList.remove('on');
        stage.appendChild(shell);
        document.body.appendChild(stage);
        document.body.classList.add('m-lk-busy');
        return {
            stage: stage,
            shell: shell,
            card: shell.querySelector('.m-lk-card'),
            group: shell.querySelector('.input-group'),
            cells: cellsIn(shell),
            row: shell.querySelector('.m-otp')
        };
    }

    function netOverlay(shell, w, h) {
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'm-lk-net');
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        const path = document.createElementNS(NS, 'path');
        svg.appendChild(path);
        const dots = [];
        for (let i = 0; i < OTP_LEN; i++) {
            const c = document.createElementNS(NS, 'circle');
            c.setAttribute('r', '2.4');
            svg.appendChild(c);
            dots.push(c);
        }
        shell.appendChild(svg);
        return { svg: svg, path: path, dots: dots };
    }

    const SPR = 32;
    const sprCache = {};
    /* صورة مصغّرة جاهزة لكل لون، تُرسم مرة واحدة ويُستنسخ منها في كل إطار.
       shadowBlur لكل جسيمة كان يجعل لحظة النجاح هي أثقل لحظة في الشاشة. */
    function spriteOf(hex) {
        if (sprCache[hex]) return sprCache[hex];
        const cv = document.createElement('canvas');
        cv.width = cv.height = SPR;
        const g = cv.getContext('2d');
        const n = parseInt(hex.slice(1), 16);
        const rgb = ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
        const grad = g.createRadialGradient(SPR / 2, SPR / 2, 0, SPR / 2, SPR / 2, SPR / 2);
        grad.addColorStop(0, 'rgba(' + rgb + ',1)');
        grad.addColorStop(.4, 'rgba(' + rgb + ',.55)');
        grad.addColorStop(1, 'rgba(' + rgb + ',0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, SPR, SPR);
        sprCache[hex] = cv;
        return cv;
    }

    function burst(host, cx, cy) {
        if (REDUCED || !host || !host.getContext) return null;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = host.clientWidth, h = host.clientHeight;
        host.width = Math.round(w * dpr);
        host.height = Math.round(h * dpr);
        const ctx = host.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.globalCompositeOperation = 'lighter';
        const cols = ['#22c55e', '#4ade80', '#38bdf8', '#4da3ff', '#e0f2fe'];
        const parts = [];
        for (let i = 0; i < 56; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 150 + Math.random() * 360;
            parts.push({
                x: cx, y: cy,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp - 75,
                r: 2 + Math.random() * 6,
                sq: Math.random() < .36,
                rot: Math.random() * Math.PI,
                spin: (Math.random() - .5) * 9,
                life: 1 + Math.random() * .8,
                age: 0,
                c: cols[i % cols.length]
            });
        }
        const sp2 = {};
        cols.forEach((c) => { sp2[c] = spriteOf(c); });
        let prev = 0, raf = 0, dead = false;
        function frame(now) {
            if (dead) return;
            const dt = prev ? Math.min(.05, (now - prev) / 1000) : .016;
            prev = now;
            ctx.clearRect(0, 0, w, h);
            let alive = 0;
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i];
                if (p.age > p.life) continue;
                alive++;
                p.age += dt;
                p.vy += 620 * dt;
                const drag = Math.max(0, 1 - 1.8 * dt);
                p.vx *= drag;
                p.vy *= drag;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.rot += p.spin * dt;
                const k = Math.max(0, 1 - p.age / p.life);
                ctx.globalAlpha = k * k;
                if (p.sq) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = p.c;
                    ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
                    ctx.restore();
                } else {
                    const s = p.r * 3;
                    ctx.drawImage(sp2[p.c], p.x - s / 2, p.y - s / 2, s, s);
                }
            }
            ctx.globalAlpha = 1;
            if (alive) raf = requestAnimationFrame(frame);
            else ctx.clearRect(0, 0, w, h);
        }
        raf = requestAnimationFrame(frame);
        return () => { dead = true; if (raf) cancelAnimationFrame(raf); };
    }

    function haptic(pattern) {
        if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
    }

    function announce(msg) {
        const live = document.querySelector('#' + LOGIN_ID + ' .m-lk-live');
        if (live) live.textContent = msg;
    }

    function runUnlockFx(input, digits) {
        const st = makeStage(digits);
        if (!st || !st.row || !st.group || st.cells.length !== OTP_LEN) return false;
        const clock = makeClock();
        const keep = [];
        let net = null, stopPix = null, verdict = null, timer = 0, torn = false, spinAnim = null;
        const shellRect = st.shell.getBoundingClientRect();
        const startHeight = shellRect.height;
        const compactH = Math.min(340, Math.max(292, window.innerHeight - 80));
        const base = st.cells.map((c) => {
            const r = c.getBoundingClientRect();
            return { x: r.left - shellRect.left, y: r.top - shellRect.top, w: r.width, h: r.height };
        });
        let grid = [], center = [];

        const fx = {
            done: false,
            verdict(kind) {
                if (verdict || torn) return;
                verdict = kind;
            },
            dispose() {
                if (torn) return;
                torn = true;
                clock.stop();
                if (timer) clearTimeout(timer);
                if (stopPix) stopPix();
                keep.forEach((a) => { try { a.cancel(); } catch (e) {} });
                window.removeEventListener('resize', onShape);
                document.body.classList.remove('m-lk-busy');
                st.stage.remove();
                if (fxPending === fx) fxPending = null;
            }
        };
        const admin = document.getElementById(ADMIN_ID);
        fx.toast0 = (document.getElementById('toast-container') || {}).lastElementChild || null;
        fx.admin0 = !!(admin && admin.classList.contains('active-screen'));
        fxPending = fx;
        timer = setTimeout(() => fx.verdict(!verdict && !fx.admin0 && admin && admin.classList.contains('active-screen') ? 'ok' : 'net'), VERDICT_MS);

        function onShape() {
            if (fx.done || torn) return;
            fx.dispose();
            input.value = '';
            paintOtp(input);
            announce('أعد إدخال الرمز بعد تغيير اتجاه الشاشة');
        }
        window.addEventListener('resize', onShape, { passive: true });

        const fadeA = qsa('.m-lk-chip, .modal-title, .m-lk-sub, .m-lk-hint, .modal-actions, .m-lk-err, .m-pad', st.shell);
        fadeA.forEach((n) => spring(n, (p) => ({ opacity: (1 - p).toFixed(3) }), { stiffness: 210, damping: 28, maxMs: 420 }, keep, true));
        clock.start();

        clock.after(380, () => {
            fadeA.forEach((n) => n.classList.add('m-lk-stage-hidden'));
            st.shell.classList.add('compact');
            st.shell.style.height = startHeight + 'px';
            st.card.style.height = '100%';
            st.group.classList.add('m-lk-stage-group');
            st.row.classList.add('m-lk-stage-row');

            const s = .78;
            const cw = base[0].w * s, ch = base[0].h * s;
            const left = shellRect.width / 2 - cw - OTP_GAP / 2;
            const top = compactH * .52 - ch - OTP_GAP / 2;
            grid = base.map((b, i) => {
                const cx = left + FX_SLOTS[i][0] * (cw + OTP_GAP) + cw / 2;
                const cy = top + FX_SLOTS[i][1] * (ch + OTP_GAP) + ch / 2;
                return { x: cx - b.w / 2, y: cy - b.h / 2, s: s, cx: cx, cy: cy };
            });
            center = base.map((b) => ({ x: shellRect.width / 2 - b.w / 2, y: compactH * .52 - b.h / 2, s: .28 }));

            st.cells.forEach((c, i) => {
                c.style.width = base[i].w + 'px';
                c.style.height = base[i].h + 'px';
                c.classList.add('m-lk-stage-cell');
                spring(c, (p) => xf(mix(base[i].x, grid[i].x, p), mix(base[i].y, grid[i].y, p), mix(1, s, p)),
                    { stiffness: 190, damping: 21, maxMs: 720 }, keep, true);
            });
            spring(st.shell, (p) => ({ height: mix(startHeight, compactH, p).toFixed(2) + 'px' }),
                { stiffness: 180, damping: 24, maxMs: 700 }, keep, true);
        });

        clock.after(1180, () => {
            if (!grid.length) return;
            net = netOverlay(st.shell, shellRect.width, compactH);
            const order = [0, 1, 3, 2];
            let d = '';
            order.forEach((idx, i) => {
                const p = grid[idx];
                d += (i ? 'L' : 'M') + p.cx.toFixed(1) + ' ' + p.cy.toFixed(1);
            });
            net.path.setAttribute('d', d + 'Z');
            const len = net.path.getTotalLength ? net.path.getTotalLength() : 400;
            net.len = len;
            net.path.style.strokeDasharray = len + ' ' + len;
            if (net.path.animate) {
                keep.push(net.path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
                    { duration: REDUCED ? 160 : 500, easing: 'cubic-bezier(.22,.9,.24,1)', fill: 'forwards' }));
            }
            grid.forEach((p, i) => {
                net.dots[i].setAttribute('cx', p.cx.toFixed(1));
                net.dots[i].setAttribute('cy', p.cy.toFixed(1));
                clock.after(300 + i * 45, () => spring(net.dots[i], (q) => ({ opacity: q.toFixed(3) }),
                    { stiffness: 260, damping: 22, maxMs: 360 }, keep, true));
            });
        });

        const core = document.createElement('div');
        core.className = 'm-lk-core';
        core.innerHTML = '<i class="m-lk-core-neon"></i>' + LK_SVG.core;
        const ring = document.createElement('div');
        ring.className = 'm-lk-ring';
        clock.after(1880, () => {
            st.shell.appendChild(core);
            st.shell.appendChild(ring);
            const spin = core.querySelector('svg');
            if (spin && spin.animate) {
                spinAnim = spin.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
                    { duration: 900, easing: 'linear', iterations: Infinity });
                keep.push(spinAnim);
            }
            st.cells.forEach((c, i) => {
                spring(c, (p) => ({
                    transform: xf(mix(grid[i].x, center[i].x, p), mix(grid[i].y, center[i].y, p), mix(grid[i].s, center[i].s, p)).transform,
                    opacity: (1 - p).toFixed(3)
                }), { stiffness: 220, damping: 24, maxMs: 600 }, keep, true);
            });
            if (net) spring(net.svg, (p) => ({ opacity: (1 - p).toFixed(3) }), { stiffness: 240, damping: 30, maxMs: 400 }, keep, true);
            spring(core, (p) => ({ opacity: p.toFixed(3), transform: 'scale(' + (.55 + .45 * p).toFixed(3) + ')' }),
                { stiffness: 230, damping: 21, maxMs: 560 }, keep, true);
        });

        clock.after(2440, () => {
            const poll = () => {
                if (torn) return;
                if (!verdict) { clock.after(90, poll); return; }
                fx.done = true;
                if (verdict === 'ok') verified();
                else rejected(verdict === 'net' ? 'تعذّر التحقق: لا يوجد اتصال بالخدمة' : 'رمز الدخول خاطئ', verdict);
            };
            poll();
        });

        function verified() {
            /* الرمز الصحيح يمحو سجل التخمين: العدّاد للصفرد واللمبة تنطفئ */
            guardPass();
            coolStop();
            syncBulb();
            const title = st.shell.querySelector('.modal-title');
            announce('تم التحقق بنجاح');
            if (title) {
                title.innerHTML = 'تم التحقق <span class="m-lk-key ok">بنجاح</span>';
                title.classList.remove('m-lk-stage-hidden');
                spring(title, (p) => ({ opacity: p.toFixed(3), transform: 'translate3d(0,' + (10 * (1 - p)).toFixed(2) + 'px,0)' }),
                    { stiffness: 220, damping: 24, maxMs: 520, delay: REDUCED ? 0 : 180 }, keep, true);
            }
            core.classList.add('ok');
            const rect = st.shell.getBoundingClientRect();
            const cv = document.createElement('canvas');
            cv.style.width = (rect.width + 240) + 'px';
            cv.style.height = (rect.height + 240) + 'px';
            cv.style.left = (rect.left - 120) + 'px';
            cv.style.top = (rect.top - 120) + 'px';
            st.stage.appendChild(cv);
            stopPix = burst(cv, 120 + rect.width / 2, 120 + rect.height * .52);
            haptic([12, 30, 12]);

            if (spinAnim) { try { spinAnim.cancel(); } catch (e) {} spinAnim = null; }
            const disc = core.querySelector('.m-spin');
            const tick = core.querySelector('.m-tick');
            if (disc) disc.style.opacity = '0';
            if (tick && tick.animate) {
                const len = tick.getTotalLength ? tick.getTotalLength() : 30;
                tick.style.opacity = '1';
                tick.style.strokeDasharray = len + ' ' + len;
                keep.push(tick.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
                    { duration: REDUCED ? 160 : 340, easing: 'cubic-bezier(.22,.9,.24,1)', fill: 'forwards', delay: REDUCED ? 0 : 100 }));
            }
            spring(core, (p) => ({ transform: 'scale(' + (1 + .16 * p).toFixed(3) + ')' }),
                { stiffness: 260, damping: 18, maxMs: 540 }, keep, true);
            if (ring.animate) {
                keep.push(ring.animate([{ transform: 'scale(.7)', opacity: .85 }, { transform: 'scale(2.8)', opacity: 0 }],
                    { duration: REDUCED ? 160 : 620, easing: 'cubic-bezier(.16,1,.3,1)' }));
            }
            const pill = document.createElement('div');
            pill.className = 'm-lk-pill';
            pill.innerHTML = LK_SVG.pill + '<span>تم التحقق — الاتصال آمن</span>';
            st.shell.appendChild(pill);
            spring(pill, (p) => ({ opacity: p.toFixed(3), transform: 'translate3d(-50%,' + (10 * (1 - p)).toFixed(2) + 'px,0)' }),
                { stiffness: 220, damping: 23, maxMs: 520, delay: REDUCED ? 0 : 360 }, keep, true);
            clock.after(1700, () => {
                st.stage.classList.add('gone');
                /* الكشف: المسرح يتلاشى والصفحة تُبنى في اللحظة نفسها */
                if (state.started && document.getElementById(ADMIN_ID).classList.contains('active-screen')) {
                    enterAnimate(state.pages[state.index]);
                }
                clock.after(440, () => fx.dispose());
            });
        }

        /* ===== الرفض: تراجعٌ لا شاشة سوداء =====
           ما بُني بالعكس يُهدَم بالعكس، ويبقى المسرح ظاهراً طول الوقت: لا
           يسودّ بياض ولا تُقلب شاشة على أثرها. القرص ينطفئ، والشبكة تنكمش
           من حيث مدت، والمربّعات ترجع من مربّعها الصغير إلى صفّها، والارتفاع
           يمتلئ، والعناصر التي أُخفيت تُفتح في مواضعها — ولا يبدأ الذوبان إلا
           والبطاقتان متطابقتين، فيمرّ الذوبان بلا أن يُرى. */
        let handed = false;
        function handoff() {
            if (handed) return;
            handed = true;
            /* الإطار الواحد: تُرفع كل أصناف المسرح دفعة واحدة، ويؤخذ قبلها
               موضع المربّعات. إن بقي فرق بين الموضعين صحّحه نَبْض FLIP قصير
               بدل أن يقفز حرف */
            const before = st.cells.map((c) => c.getBoundingClientRect());
            st.shell.classList.remove('compact');
            st.shell.style.height = '';
            st.card.style.height = '';
            st.group.classList.remove('m-lk-stage-group');
            st.row.classList.remove('m-lk-stage-row');
            st.cells.forEach((c) => {
                c.classList.remove('m-lk-stage-cell', 'bad', 'pa', 'pb');
                c.style.transform = '';
                c.style.width = '';
                c.style.height = '';
                c.style.opacity = '';
            });
            const stErr = st.shell.querySelector('.m-lk-err');
            fadeA.forEach((n) => {
                n.classList.remove('m-lk-stage-hidden');
                /* سطر الغلط يُقاد بالكلاس لا بالنَبْض: يُمسح عنه الصفر المضمّن
                   ليأخذ طوله المحجوز وموضعه، ثم يُشعل حين يصل الخبر */
                if (n === stErr) { n.style.opacity = ''; return; }
                n.style.opacity = '0';
            });
            st.cells.forEach((c, i) => {
                const b = c.getBoundingClientRect();
                const dx = before[i].left - b.left, dy = before[i].top - b.top;
                if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
                spring(c, (p) => ({ transform: 'translate3d(' + (dx * (1 - p)).toFixed(2) + 'px,' + (dy * (1 - p)).toFixed(2) + 'px,0)' }),
                    { stiffness: 250, damping: 27, maxMs: 420 }, keep, true);
            });
            fadeA.forEach((n, i) => {
                if (n === stErr) return;
                spring(n, (p) => ({ opacity: p.toFixed(3) }),
                    { stiffness: 230, damping: 27, maxMs: 460, delay: REDUCED ? 0 : 26 + i * 30 }, keep, true);
            });
        }

        function eraseStage() {
            /* المحو بلغة الحذف نفسها التي يعرفها المالك: الرقم يصعد ويذوب،
               وآخر رقم يُمحى أولاً */
            st.cells.forEach((c, i) => {
                const u = c.firstElementChild || c;
                c.dataset.d = '';
                if (REDUCED || !u.animate) { u.textContent = ''; return; }
                const k = OTP_LEN - 1 - i;
                const a = u.animate([
                    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
                    { transform: 'translate3d(0,-9px,0) scale(.6)', opacity: 0 }
                ], { duration: 165, delay: k * 55, easing: 'cubic-bezier(.4,0,.75,.25)' });
                a.onfinish = () => { u.textContent = ''; };
                keep.push(a);
            });
        }

        function rejected(msg, kind) {
            const late = !grid.length;
            announce(msg);
            core.classList.add('bad');
            haptic([26, 36, 26]);
            if (spinAnim) { try { spinAnim.cancel(); } catch (e) {} spinAnim = null; }

            /* ١ — القرص والحلقة والشبكة: تُطفأ وتُنسحب من حيث جاءت */
            spring(core, (p) => ({ opacity: (1 - p).toFixed(3), transform: 'scale(' + (1 - .2 * p).toFixed(3) + ')' }),
                { stiffness: 250, damping: 27, maxMs: 380 }, keep, true);
            if (ring.parentNode) {
                spring(ring, (p) => ({ opacity: (1 - p).toFixed(3) }), { stiffness: 300, damping: 30, maxMs: 300 }, keep, true);
            }
            if (net) {
                const svg = net.svg, len = net.len || 400;
                if (net.path.animate) {
                    keep.push(net.path.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: len }],
                        { duration: REDUCED ? 120 : 420, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }));
                }
                net.dots.forEach((d, i) => {
                    spring(d, (p) => ({ opacity: (1 - p).toFixed(3) }),
                        { stiffness: 300, damping: 30, maxMs: 260, delay: REDUCED ? 0 : (OTP_LEN - 1 - i) * 40 }, keep, true);
                });
                clock.after(REDUCED ? 140 : 480, () => { if (svg.parentNode) svg.parentNode.removeChild(svg); });
            }

            /* ٢ — المربّعات ترجع من مركزها إلى مربّعها الصغير */
            if (!late) {
                st.cells.forEach((c, i) => {
                    spring(c, (p) => ({
                        transform: xf(mix(center[i].x, grid[i].x, p), mix(center[i].y, grid[i].y, p), mix(center[i].s, grid[i].s, p)).transform,
                        opacity: p.toFixed(3)
                    }), { stiffness: 240, damping: 24, maxMs: 460, delay: REDUCED ? 0 : 110 }, keep, true);
                });
            }
            clock.after(REDUCED ? 60 : 180, () => {
                if (!st.row.animate) return;
                const frames = [];
                for (let i = 0; i <= 26; i++) {
                    const p = i / 26;
                    frames.push({ transform: 'translate3d(' + (Math.exp(-4.2 * p) * Math.sin(p * Math.PI * 5.2) * 10).toFixed(2) + 'px,0,0)' });
                }
                frames.push({ transform: 'translate3d(0,0,0)' });
                keep.push(st.row.animate(frames, { duration: REDUCED ? 160 : 450, easing: 'linear' }));
            });

            /* ٣ — الصفّ يكتمل والارتفاع يمتلئ معاً */
            const backMs = late ? 0 : 480;
            if (!late) {
                clock.after(backMs, () => {
                    st.cells.forEach((c, i) => {
                        spring(c, (p) => xf(mix(grid[i].x, base[i].x, p), mix(grid[i].y, base[i].y, p), mix(grid[i].s, 1, p)),
                            { stiffness: 210, damping: 24, maxMs: 520, delay: REDUCED ? 0 : (OTP_LEN - 1 - i) * 36 }, keep, true);
                    });
                    spring(st.shell, (p) => ({ height: mix(compactH, startHeight, p).toFixed(2) + 'px' }),
                        { stiffness: 205, damping: 26, maxMs: 540 }, keep, true);
                });
            }

            /* ٤ — كل شيء لمحله، والرمز الخاطئ يُمحى أمامك */
            const settleMs = late ? 120 : backMs + 660;
            clock.after(settleMs, () => {
                handoff();
                /* رفع الستار عن الشاشة الحقيقية قبل الذوبان: المسرح كان يُخفي
                   الأصل بـ«m-lk-busy»، فلو بقي مخفياً صار الذوبان إلى سواد
                   لا إلى البطاقة نفسها — وهذا بالضبط ما رفضه المالك */
                document.body.classList.remove('m-lk-busy');
                eraseStage();
                input.value = '';
                paintOtp(input);
            });

            /* ٥ — سطر الغلط، ثم ذوبان لا يُرى */
            clock.after(settleMs + (REDUCED ? 160 : 420), () => {
                const stErr = st.shell.querySelector('.m-lk-err');
                if (stErr) { stErr.textContent = msg; stErr.classList.add('on', 'bad'); }
                const realErr = document.querySelector('#' + LOGIN_ID + ' .m-lk-err');
                if (realErr) { realErr.textContent = msg; realErr.classList.add('on', 'bad'); }
            });
            clock.after(settleMs + (REDUCED ? 220 : 470), () => {
                st.stage.classList.add('gone');
            });
            clock.after(settleMs + (REDUCED ? 420 : 900), () => {
                fx.dispose();
                /* المحاولة الخاطئة تُحسب هنا لا قبلها: وقت الحركة لا يُحاسب */
                if (kind === 'bad') {
                    const sec = guardFail();
                    syncBulb();
                    if (sec) coolStart(sec, 1400);
                }
                try { input.focus({ preventScroll: true }); } catch (e) {}
            });
        }
        return true;
    }

    let submitting = false;
    function lockSubmit(input) {
        if (fxPending || submitting) return;
        const v = input.value || '';
        if (v.length < OTP_LEN) return;
        input.blur();
        haptic(8);
        announce('جارٍ التحقق…');
        const digits = v.slice(0, OTP_LEN).split('');
        submitting = true;
        setTimeout(() => {
            submitting = false;
            const modal = document.getElementById(LOGIN_ID);
            /* النقر الرابع لا يبني المسرح في نفس المهمة: الرقم يُرسم أولاً،
               ثم إن أُغلقت النافذة في هذا الأثناء لا نُنزِل ستاراً فوق فراغ */
            if (!modal || !/display:\s*(flex|block)/.test(modal.getAttribute('style') || '')) return;
            if (runUnlockFx(input, digits) && typeof window.checkAdminPassword === 'function') window.checkAdminPassword();
        }, REDUCED ? 60 : SUBMIT_HOLD);
    }

    function buildLockScreen() {
        const modal = document.getElementById(LOGIN_ID);
        if (!modal || modal.dataset.mLock === '1') return;
        const input = document.getElementById('admin-password');
        const content = modal.querySelector('.modal-content');
        const oldTitle = content.querySelector('.modal-title');
        const group = content.querySelector('.input-group');
        const actions = content.querySelector('.modal-actions');
        if (!input || !content || !group) return;
        modal.dataset.mLock = '1';
        modal.classList.add('m-lock-screen');

        const scene = document.createElement('div');
        scene.className = 'm-lk-scene';
        scene.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>' +
            '<span class="m-lk-motes" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b><b></b><b></b></span>';
        content.insertBefore(scene, content.firstChild);

        const shell = document.createElement('div');
        shell.className = 'm-lk-shell';
        shell.innerHTML = '<div class="m-lk-neon"></div>';
        const card = document.createElement('div');
        card.className = 'm-lk-card';
        card.innerHTML =
            '<div class="m-lk-chip">' + LK_SVG.lock + '</div>' +
            '<p class="m-lk-err" role="alert"></p>' +
            '<p class="m-lk-hint"></p>' +
            '<p class="m-lk-live" aria-live="polite" role="status"></p>';
        shell.appendChild(card);
        content.appendChild(shell);

        const anchor = card.querySelector('.m-lk-err');
        if (oldTitle) {
            const crown = oldTitle.querySelector('i');
            const words = (oldTitle.textContent || '').trim().split(/\s+/).filter(Boolean);
            /* آخر كلمتين — «إدارة رويال» — في غلاف واحد: التدرّج يمرّ بينهما
               شريطاً واحداً، لا منصلاً على كل كلمة على حدة */
            const cut = Math.max(0, words.length - 2);
            const parts = words.slice(0, cut).map((w) => '<span class="m-lk-word">' + esc(w) + '</span>');
            if (words.length > cut) parts.push('<span class="m-lk-word m-lk-key">' + words.slice(cut).map(esc).join(' ') + '</span>');
            oldTitle.innerHTML = parts.join(' ');
            card.insertBefore(oldTitle, anchor);
            const hint = card.querySelector('.m-lk-hint');
            if (crown && hint) hint.appendChild(crown);
            if (hint) hint.insertAdjacentHTML('beforeend', '<span>مكوى رويال — دخول الإدارة</span>');
        }
        /* تحيّة بحسب الساعة ويوم عربي كامل: لمسة شخصية بلا أي طلب بيانات */
        const hello = document.createElement('p');
        hello.className = 'm-lk-hello';
        (function fillHello() {
            const now = new Date();
            const h = now.getHours();
            const greet = h < 5 ? 'سهرة مباركة' : (h < 12 ? 'صباح الخير' : (h < 17 ? 'طاب يومك' : (h < 21 ? 'مساء الخير' : 'ليلة هادئة')));
            let day = '';
            try {
                day = new Intl.DateTimeFormat('ar-IQ', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
            } catch (e) {
                const months = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
                day = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()];
            }
            hello.innerHTML = '<span>' + escHTML(greet) + '</span><i></i><span>' + escHTML(day) + '</span>';
        })();
        if (oldTitle) card.insertBefore(hello, oldTitle); else card.insertBefore(hello, anchor);

        const sub = document.createElement('p');
        sub.className = 'm-lk-sub';
        sub.textContent = 'أدخل الرمز المكوّن من أربعة أرقام للمتابعة.\nيتحقّق تلقائياً بمجرد اكتماله.';
        sub.style.whiteSpace = 'pre-line';
        card.insertBefore(sub, anchor);
        card.insertBefore(group, anchor);

        const boxes = document.createElement('div');
        boxes.className = 'm-otp';
        let cells = '';
        for (let i = 0; i < OTP_LEN; i++) cells += '<b><u></u></b>';
        boxes.innerHTML = cells + '<span class="m-otp-glide"><i class="m-otp-neon"></i><i class="m-otp-caret"></i></span>';
        group.insertBefore(boxes, input);
        input.classList.add('m-otp-input');
        input.setAttribute('inputmode', 'none');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('maxlength', String(OTP_LEN));
        input.setAttribute('aria-label', 'رمز دخول الإدارة');
        input.removeAttribute('placeholder');
        input.removeAttribute('onkeyup');
        input.readOnly = true;
        boxes.setAttribute('aria-hidden', 'true');

        /* نسخة الجوال لا تعرف إلغاءً ولا «نسيت الرمز»: بقى زر واحد في الوسط */
        const cancel = actions && actions.querySelector('.btn-cancel');
        if (cancel) cancel.remove();
        const enter = actions && actions.querySelector('.btn-confirm');
        if (enter) {
            enter.removeAttribute('onclick');
            enter.innerHTML = '<span>' + esc((enter.textContent || '').trim()) + '</span>';
        }
        if (actions) card.insertBefore(actions, card.querySelector('.m-lk-hint'));

        let lastLen = 0;
        const onType = () => {
            const d = (input.value || '').replace(/\D/g, '').slice(0, OTP_LEN);
            if (d !== input.value) input.value = d;
            if (d.length < lastLen) haptic(6);
            lastLen = d.length;
            const err = card.querySelector('.m-lk-err');
            if (err) err.classList.remove('on');
            paintOtp(input);
            if (d.length === OTP_LEN) lockSubmit(input);
        };
        input.addEventListener('input', onType);
        input.addEventListener('paste', () => setTimeout(onType, 0));
        input.addEventListener('keyup', (e) => { if (e.key === 'Enter') trySubmit(); });
        input.addEventListener('focus', () => paintOtp(input));
        input.addEventListener('blur', () => paintOtp(input));
        boxes.addEventListener('pointerdown', (e) => { e.preventDefault(); try { input.focus({ preventScroll: true }); } catch (err) {} });

        const pad = document.createElement('div');
        pad.className = 'm-pad';
        pad.setAttribute('role', 'group');
        pad.setAttribute('aria-label', 'لوحة أرقام الرمز');
        const DEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z"/><path d="m12.5 9.5 5 5m0-5-5 5"/></svg>';
        const BULB_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2a5.8 5.8 0 0 0-3.5 10.4c.6.5.9 1.2 1 1.9l.1.5h4.8l.1-.5c.1-.7.4-1.4 1-1.9A5.8 5.8 0 0 0 12 3.2z"/><path d="M9.8 19h4.4M10.7 21.4h2.6"/></svg>';
        /* بلا زر مسح: الحذف بالإكس وحده، والصفر في وسط الصف الرابع، وإلى
           جانبه مصباح التلميح — لمبة لا رقم، تُرى ولا تُكتب */
        pad.innerHTML = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'hint', '0', 'del'].map((k) => {
            const isFn = k === 'del';
            const isTip = k === 'hint';
            const label = isTip ? BULB_SVG : (isFn ? DEL_SVG : k);
            const aria = isTip ? 'تلميح الرمز' : (isFn ? 'حذف آخر رقم' : 'الرقم ' + k);
            const cls = isTip ? 'fn bulb' : (isFn ? 'fn' : '');
            return '<button type="button" data-k="' + k + '" class="' + cls + '" aria-label="' + aria + '"><span>' + label + '</span></button>';
        }).join('');
        /* الفقاعة تُبنى فوق مربّعات الرقم، لا فوق اللوحة: الممرّ تحت المربّعات
           صار للعدّاد وحده، فلا يقف تلميحٌ فوق انتظار */
        const tip = document.createElement('span');
        tip.className = 'm-lk-tip';
        tip.setAttribute('aria-hidden', 'true');
        tip.innerHTML = '<span class="m-lk-tip-tag">' + TIP_TAG + '</span><strong>' + TIP_TEXT + '</strong>';
        boxes.appendChild(tip);
        let tipTimer = null;
        function setTip(live) {
            tip.classList.toggle('on', live);
            card.classList.toggle('tip-live', live);
        }
        function hideTip() {
            if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; }
            if (tip) setTip(false);
        }
        function showTip() {
            if (!tip) return;
            if (tipTimer) clearTimeout(tipTimer);
            setTip(true);
            haptic(8);
            announce(TIP_TAG + ': ' + TIP_TEXT);
            tipTimer = setTimeout(() => { tipTimer = null; setTip(false); }, TIP_MS);
        }
        card.insertBefore(pad, actions || card.querySelector('.m-lk-hint'));

        function padFlash(btn, x, y) {
            btn.classList.add('on');
            clearTimeout(btn._offT);
            btn._offT = setTimeout(() => btn.classList.remove('on'), 420);
            if (REDUCED || !btn.animate) return;
            btn.animate([
                { transform: 'scale(1) rotate(0deg)' },
                { transform: 'scale(1.28) rotate(-5deg)', offset: .20 },
                { transform: 'scale(1.23) rotate(5deg)', offset: .38 },
                { transform: 'scale(1.18) rotate(-3deg)', offset: .56 },
                { transform: 'scale(1.09) rotate(1.5deg)', offset: .76 },
                { transform: 'scale(1) rotate(0deg)' }
            ], { duration: 540, easing: 'cubic-bezier(.2,.8,.3,1)' });
            const r = btn.getBoundingClientRect();
            const px = typeof x === 'number' ? x - r.left : r.width / 2;
            const py = typeof y === 'number' ? y - r.top : r.height / 2;
            const rp = document.createElement('i');
            rp.className = 'm-rp';
            rp.style.left = px + 'px';
            rp.style.top = py + 'px';
            btn.insertBefore(rp, btn.firstChild);
            const a = rp.animate([
                { transform: 'translate(-50%,-50%) scale(.1)', opacity: .85 },
                { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }
            ], { duration: 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
            a.onfinish = () => rp.remove();
            a.oncancel = () => rp.remove();
        }

        function padHit(btn, x, y) {
            if (fxPending || submitting) return;
            const k = btn.dataset.k;
            if (k === 'hint') {
                if (!guardTipOpen()) { shakeBulb(btn); return; }
                padFlash(btn, x, y);
                showTip();
                return;
            }
            if (guardLeft() > 0) { coolFlash(); return; }
            padFlash(btn, x, y);
            const cur = input.value || '';
            let next = cur;
            if (k === 'del') next = cur.slice(0, -1);
            else if (cur.length < OTP_LEN) next = cur + k;
            else return;
            if (next === cur) return;
            if (/^\d$/.test(k)) haptic(10);
            input.value = next;
            onType();
        }

        pad.addEventListener('pointerdown', (e) => {
            const btn = e.target.closest && e.target.closest('button[data-k]');
            if (!btn) return;
            e.preventDefault();
            btn._pd = Date.now();
            padHit(btn, e.clientX, e.clientY);
        });
        pad.addEventListener('click', (e) => {
            const btn = e.target.closest && e.target.closest('button[data-k]');
            if (!btn || Date.now() - (btn._pd || 0) < 800) return;
            padHit(btn);
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => pad.addEventListener(type, (e) => {
            const btn = e.target.closest && e.target.closest('button[data-k]');
            if (!btn) return;
            clearTimeout(btn._offT);
            btn._offT = setTimeout(() => btn.classList.remove('on'), 130);
        }));

        input.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            let k = null;
            if (/^[0-9]$/.test(e.key)) k = e.key;
            else if (/^[\u0660-\u0669]$/.test(e.key)) k = String(e.key.charCodeAt(0) - 0x660);
            else if (e.key === 'Backspace') k = 'del';
            if (!k) return;
            e.preventDefault();
            const btn = pad.querySelector('[data-k="' + k + '"]');
            if (btn) padHit(btn);
        });

        /* اللمبة مطفأة: تنفضّ نفضة خفيفة ولا تُلمس — لا كلمة تُقال مجاناً */
        function shakeBulb(btn) {
            haptic(4);
            announce('التلميح مطفأ');
            if (REDUCED || !btn.animate) return;
            const frames = [];
            for (let i = 0; i <= 12; i++) {
                const p = i / 12;
                frames.push({ transform: 'translate3d(' + (Math.exp(-5 * p) * Math.sin(p * Math.PI * 3) * 4).toFixed(2) + 'px,0,0)' });
            }
            frames.push({ transform: 'translate3d(0,0,0)' });
            btn.animate(frames, { duration: 260, easing: 'linear' });
        }
        /* من نقر وهو في الانتظار: سطر العدّاد يومض، ولا رقم يُكتب */
        function coolFlash() {
            announce('انتظر ' + fmtWait(guardLeft()) + ' قبل المحاولة التالية');
            const err = card.querySelector('.m-lk-err');
            if (!err || REDUCED || !err.animate) return;
            err.animate([{ opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
        }

        /* استعجل أحدٌ الدخول قبل أربع أرقام: نُنّب الصف ولا نُنزِل ستاراً */
        function nudge() {
            announce('أكمل الأرقام الأربعة أولاً');
            if (REDUCED || !boxes.animate) return;
            const frames = [];
            for (let i = 0; i <= 18; i++) {
                const p = i / 18;
                frames.push({ transform: 'translate3d(' + (Math.exp(-4.6 * p) * Math.sin(p * Math.PI * 4) * 7).toFixed(2) + 'px,0,0)' });
            }
            frames.push({ transform: 'translate3d(0,0,0)' });
            boxes.animate(frames, { duration: 340, easing: 'linear' });
        }

        const trySubmit = () => {
            if (guardLeft() > 0) { coolFlash(); return; }
            if ((input.value || '').length < OTP_LEN) { nudge(); return; }
            lockSubmit(input);
        };

        if (enter) enter.addEventListener('click', (e) => { e.preventDefault(); trySubmit(); });

        if (window.MutationObserver) {
            let wasOpen = false;
            new MutationObserver(() => {
                const open = /display:\s*(flex|block)/.test(modal.getAttribute('style') || '');
                if (open && !wasOpen) {
                    lkRowW = 0;
                    shell.dataset.entered = '0';
                    /* ذاكرة كل مربع من الجولة السابقة تُصفَّر: وإلا رجع الرقم
                       خاطفاً وهو يتلاشى حين يفتح الشاشة من جديد */
                    cellsIn(shell).forEach((c) => { c.dataset.d = ''; });
                    hideTip();
                    /* العدّاد يسبق الشاشة: إغلاقها وفتحها لا يمحو ما فات */
                    guardLoad();
                    syncBulb();
                    const resting = guardLeft();
                    if (resting > 0) coolStart(resting, 0); else coolStop();
                    paintOtp(input);
                    requestAnimationFrame(() => playEntrance(shell));
                    setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (err) {} }, 90);
                }
                if (!open && wasOpen && fxPending) {
                    const admin = document.getElementById(ADMIN_ID);
                    const successClose = admin && admin.classList.contains('active-screen') && !fxPending.admin0;
                    if (!successClose) fxPending.dispose();
                }
                wasOpen = open;
            }).observe(modal, { attributes: true, attributeFilter: ['style'] });
        }
        /* رجوع الجهاز من الخلفية: المؤقتات تتعطّل فيها، والوقت نفسه لا يتوقف */
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            const left = guardLeft();
            if (left > 0) coolPaint(lkRefs(), left);
            else if (coolTick) coolStop();
        });
        window.addEventListener('resize', () => { lkRowW = 0; }, { passive: true });
        paintOtp(input);
    }

    /* ================== التبديل اليدوي بين النسختين ================== */
    function openDesktopView() {
        store.set('royal_view_override', SETTINGS_BACKUP_VIEW);
        const url = new URL(window.location.href);
        url.searchParams.set('view', SETTINGS_BACKUP_VIEW);
        window.location.replace(url.toString());
    }

    function addViewToggle() {
        const page = pageOf('settings');
        if (!page || page.querySelector('.m-viewbtn')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'm-viewbtn';
        btn.textContent = 'عرض نسخة الكمبيوتر';
        btn.addEventListener('click', () => {
            const msg = 'سيتم فتح نسخة الكمبيوتر على هذا الهاتف. للرجوع لنسخة الجوال أضف آخر الرابط ?view=auto';
            if (typeof window.showConfirm === 'function') {
                window.showConfirm(msg, openDesktopView, 'نسخة الكمبيوتر', 'نعم، افتحها');
            } else {
                openDesktopView();
            }
        });
        page.appendChild(btn);
    }

    /* ================== إعادة تقييم البيئة عند التدوير ==================
       لا نلمس الاختيار اليدوي، ولا نبدّل أثناء سحب أو نافذة مفتوحة أو إدخال. */
    function detectMobile() {
        const mm = (q) => { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch (e) { return false; } };
        const appShell = (typeof require !== 'undefined') || window.location.protocol === 'file:';
        const touchCapable = mm('(pointer: coarse)') || mm('(hover: none)') || (navigator.maxTouchPoints || 0) > 0;
        const smallScreen = Math.min(window.innerWidth, window.screen ? window.screen.width : window.innerWidth) <= 820;
        const uaPhone = /iPhone|Android|iPad|webOS/i.test(navigator.userAgent);
        return !appShell && touchCapable && (smallScreen || uaPhone);
    }

    function reevaluateLater() {
        setTimeout(() => {
            if (store.get('royal_view_override')) return;
            if (state.busy || phys.touching || document.body.classList.contains('m-sheet-open')) return;
            const a = document.activeElement;
            if (a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) return;
            if (detectMobile()) return;
            const url = new URL(window.location.href);
            url.searchParams.set('view', 'auto');
            window.location.replace(url.toString());
        }, 800);
    }

    /* ================== الدخول المتتالي للبطاقات ==================
       الحركة كلها في CSS (@keyframes mRise) لأن سفاري الآيفون يُهمل الأنيميشن
       المُولَّد بكل نقرة. تُجمَّع عناصر اللوحة بالترتيب — عناصر الشبكات نفسها لا
       الحاويات — ويُرقَّم كل عنصر بـ --m-k ليأخر انطلاقه خطوة. */
    function enterNodes(page) {
        const out = [];
        qsa(':scope > *', page).forEach((c) => {
            const kids = qsa(':scope > *', c);
            const allCards = kids.length > 1 && kids.every((k) => k.classList.contains('stat-card'));
            const grid = c.classList.contains('bento-box-container') || c.classList.contains('stats-grid') || allCards;
            if (grid && kids.length) { kids.forEach((k) => out.push(k)); }
            else { out.push(c); }
        });
        return out;
    }

    /* صفوف الجداول تُرقَّم بنفسها، من صفر لكل جدول: البطاقة تدخل أولاً ثم تُملأ
       خلاياها سطراً سطراً. هذا هو «التدرّج في بيانات الزبائن» ولا علاقة له
       بإعادة الرسم: الصفوف الجديدة المُولَّدة بعد الحركة تبقى ساكنة.
       ما تحت الشاشة لا يُحرَّك: صفوف الجدول الطويل كانت تُشغّل مئات الحركات
       دفعة واحدة لحظة الدخول، ولا يراها أحد. */
    function enterRows(page) {
        const out = [];
        const limit = page.clientHeight * 1.05;
        const base = page.getBoundingClientRect().top;
        qsa('tbody tr', page).forEach((r) => {
            /* 12 صفاً تكفي ما يظهر فوق الطية؛ الباقي يبقى ساكناً في الظل */
            if (out.length >= 12) return;
            if (r.getBoundingClientRect().top - base > limit) return;
            out.push(r);
        });
        return out;
    }

    /* كل دخول يبدأ من اللحظة الأولى للانتقال — قبل أن تُرسم اللوحة —
       فنراها تُبنى وهي تدخل، بدل أن تظهر كاملة ثم تختفي وتُبنى (الوميض
       الذي كان يزعج المستخدم). السجل يمنع إعادة التشغيل عند الوصول. */
    const entered = new Map();

    function clearEnter(page) {
        if (!page) return;
        const rec = entered.get(page);
        if (!rec) return;
        clearTimeout(rec.timer);
        rec.nodes.forEach((n) => n.classList.remove('m-anim'));
        rec.rows.forEach((r) => r.classList.remove('m-anim'));
        entered.delete(page);
    }

    function enterAnimate(page) {
        if (!page) return;
        clearEnter(page);
        const nodes = enterNodes(page);
        const rows = enterRows(page);
        nodes.forEach((n, i) => n.style.setProperty('--m-k', String(i)));
        rows.forEach((r, i) => r.style.setProperty('--m-k', String(i)));
        void page.offsetWidth;
        nodes.forEach((n) => n.classList.add('m-anim'));
        rows.forEach((r) => r.classList.add('m-anim'));
        const rec = { nodes, rows, timer: 0 };
        /* عمر أطول حركة (آخر صنف + مدته) حتى لا تُمسح الأصناف في منتصفها */
        rec.timer = setTimeout(() => {
            nodes.forEach((n) => n.classList.remove('m-anim'));
            rows.forEach((r) => r.classList.remove('m-anim'));
            if (entered.get(page) === rec) entered.delete(page);
        }, 2600);
        entered.set(page, rec);
    }

    function resetOtherEntrances(current) {
        entered.forEach((rec, p) => { if (p !== current) clearEnter(p); });
    }

    /* ================== تجاوز switchAdminTab (عرض فقط) ================== */
    function wrapRouter() {
        const original = window.switchAdminTab;
        if (typeof original !== 'function' || original.__mWrapped) return;
        const wrapped = function (tab, animationType) {
            closeOpenSheets();
            /* المنع من أول السطر: دوال الرسم الأصلية تُستدعى داخل switchAdminTab،
               ولو مرّت وهي غير ممنوعة تُجدول رسماً بعد 150م.س. يقع في منتصف
               الانزلاق فتظهر اللوحة وتختفي لحظة — وهو الغلتش الذي وصفه المستخدم. */
            setBusy(true);
            original.call(window, tab, 'none');
            if (state.started) { goTo(tab); } else { setBusy(false); }
        };
        wrapped.__mWrapped = true;
        wrapped.__mOriginal = original;
        window.switchAdminTab = wrapped;
    }

    function goTo(tab) {
        const i = state.keys.indexOf(tab);
        if (i === -1) return;
        showAdminChrome();
        const from = clamp(state.index, 0, state.n - 1);
        if (i === from) {
            const page = state.pages[i];
            /* switchAdminTab استُدعي والأصل أعاد جدولة الرسم، وbusy رُفع قبله:
               الخروج هنا دون رفعه يترك كل رسم لاحق معلّقاً (فلاتر السجل مثلاً) */
            setBusy(false);
            flushRepaint();
            if (page) page.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
            return;
        }
        stopSpring();
        settleDirect();
        clearOffsets();
        const src = state.pages[from];
        const dst = state.pages[i];
        const vfrom = vpos(from), vto = vpos(i);
        state.index = i;
        phys.P = vto;
        setBusy(true);
        /* لوحتان في الخانة الوهمية نفسها (من تبويب مخفي إلى آخر): لا مسافة بينهما
           فلا انزلاق — الهدف يحلّ مكانها بحركة دخوله الخاصة. */
        if (vfrom === vto) {
            if (src) src.style.willChange = 'auto';
            /* بناء المحتوى قبل الظهور: من دون طلب صريح تصل لوحة السجل
               فارغة في أول زيارة لأن الرسم كان مشروطاً بوجود طلب معلّق */
            setPending();
            flushRepaint();
            /* البناء قبل الظهور: تُرسم اللوحة أول مرة وهي في حالتها الابتدائية */
            enterAnimate(dst);
            paintTransforms();
            resetPageTop(dst);
            syncA11y();
            syncProgress();
            setBusy(false);
            resetOtherEntrances(dst);
            setTimeout(() => { flushRepaint(); syncFlow(); }, 520);
            return;
        }
        const s = vto > vfrom ? 1 : -1;
        /* الرسم الثقيل قبل الحركة والهدف ما زال خارج الشاشة: تحديث اللوحات يعيد
           بناء الجداول بأكملها، ولو جرى والانزلاق جارٍ انقطعت الحركة واختفت
           اللوحة ربع ثانية ثم رجعت. والطلب صريح هنا: لوحة السجل لا تُرسم عند
           الوصول إلا بطلب معلّق، فتصل فارغة إن لم نطلبه. */
        setPending();
        flushRepaint();
        /* الحركة تبدأ الآن لا عند الوصول: تظهر اللوحة وهي تُبنى */
        enterAnimate(dst);
        paintTransforms();
        if (src) { src.classList.add('m-seen'); src.style.willChange = 'transform'; }
        if (dst) { dst.style.willChange = 'transform'; }
        setOffset(src, 0);
        setOffset(dst, s);
        const s0 = now();
        const dur = 320;
        const step = () => {
            const k = clamp((now() - s0) / dur, 0, 1);
            const e = 1 - Math.pow(1 - k, 3);
            setOffset(src, -s * e);
            setOffset(dst, s * (1 - e));
            phys.P = vfrom + (vto - vfrom) * e;
            paintIndicator();
            if (k < 1) { phys.raf = requestAnimationFrame(step); return; }
            phys.P = vto;
            state.index = i;
            if (src) src.style.willChange = 'auto';
            if (dst) dst.style.willChange = 'auto';
            clearOffsets();
            /* قبل الرسم: paintTransforms يقرأ state.busy ليعرف أن الحركة انتهت،
               فبقاء busy يترك اللوحة السابقة معروضة فوق الجديدة بلا إزاحة */
            setBusy(false);
            paintTransforms();
            resetPageTop(dst);
            syncA11y();
            syncProgress();
            resetOtherEntrances(dst);
            /* ما استجد أثناء الحركة يُرسم بعد اكتمال الدخول، لا فوقه */
            setTimeout(() => { flushRepaint(); syncFlow(); }, 520);
        };
        phys.raf = requestAnimationFrame(step);
    }

    function showAdminChrome() {
        const wasAdmin = document.body.classList.contains('m-admin');
        document.body.classList.add('m-admin');
        /* الشريط يصبح ظاهراً الآن: خانته تُقاس من جديد، والمؤشر يثبت في مكانه */
        if (!wasAdmin) { state.cell = 0; ind.init = false; ind.at = 0; }
        /* الشريط كان مخفياً عند التركيب: نعيد قياس الخانة والمؤشر بعد إظهاره */
        if (state.started) paintTransforms();
    }

    /* ================== إمكانية الوصول ================== */
    function decorateBar() {
        const bar = document.querySelector(BAR_SELECTOR);
        if (!bar) return;
        bar.setAttribute('role', 'tablist');
        bar.setAttribute('aria-label', 'أقسام الإدارة');
        state.barBtns.forEach((b) => {
            b.setAttribute('role', 'tab');
            const label = b.querySelector('span');
            if (label) b.setAttribute('aria-label', label.textContent.trim());
        });
        state.pages.forEach((p) => { if (p) p.setAttribute('role', 'tabpanel'); });
        if (bar.dataset.mKeysBound !== '1') {
            bar.dataset.mKeysBound = '1';
            bar.addEventListener('keydown', onBarKeys);
        }
        syncA11y();
    }

    function onBarKeys(e) {
        const s = dirSign();
        let forward = null;
        if (e.key === 'ArrowLeft') forward = s < 0;
        else if (e.key === 'ArrowRight') forward = s > 0;
        else return;
        const i = clamp(pageForPos(vpos(state.index) + (forward ? 1 : -1)), 0, state.n - 1);
        if (i === state.index) return;
        e.preventDefault();
        window.switchAdminTab(state.keys[i], 'none');
        const btn = state.barBtns[barIndexOfPage(i)];
        if (btn) btn.focus();
    }

    function syncA11y() {
        const activeBar = barIndexOfPage(state.index);
        state.barBtns.forEach((b, i) => b.setAttribute('aria-selected', String(i === activeBar)));
    }

    /* مراقبة فتح شاشة الأدمن (بعد التحقق من كلمة المرور) لإطلاق الطبقة */
    function watchAdminOpen() {
        const admin = document.getElementById(ADMIN_ID);
        if (!admin) return;
        const sync = () => {
            if (admin.classList.contains('active-screen')) {
                if (!state.started) mount();
                showAdminChrome();
                addViewToggle();
                idleMark();
            } else {
                document.body.classList.remove('m-admin');
                closeCmd();
                actClose();
                idleHideWarn();
            }
        };
        new MutationObserver(sync).observe(admin, { attributes: true, attributeFilter: ['class'] });
        sync();
    }

    /* ================== التركيب ================== */
    /* أنماط index.html السطرية على بطاقات اليومية تحمل !important فتسبق أي
       قاعدة في ورقة الأنماط، ولا سبيل لتصغير عنوان البطاقة أو رقمها معها.
       نزيلها مرة واحدة عند التركيب (عمود الشبكة يبقى)، وتتولى الطبقة الباقي. */
    function unstyleBento() {
        const box = document.querySelector('#admin-daily-report .bento-box-container');
        if (!box) return;
        const dropCard = ['font-size', 'font-weight', 'color', 'text-shadow', 'border', 'border-color', 'background', 'background-color', 'padding', 'box-shadow', 'height', 'min-height', 'width'];
        const dropInner = ['font-size', 'font-weight', 'color', 'text-shadow', 'letter-spacing', 'line-height', 'margin', 'padding', 'background', 'background-color', 'border', 'border-color', 'box-shadow', 'width', 'height'];
        qsa('.stat-card', box).forEach((card) => {
            dropCard.forEach((p) => card.style.removeProperty(p));
            qsa('.stat-icon, .stat-title, .stat-value', card).forEach((el) => {
                dropInner.forEach((p) => el.style.removeProperty(p));
            });
        });
        const strip = box.querySelector('.monthly-strip');
        if (strip) ['display', 'justify-content', 'background', 'background-color', 'padding', 'border', 'border-radius'].forEach((p) => strip.style.removeProperty(p));
    }

    function mount() {
        splash();
        /* الشريط إلى body مباشرة: لا حاوية متحوّلة أو مقصوصة تبقى فوقه،
           فلا تتحرك خانته ولا شبر واحد مهما تمرّر المحتوى أو فُتحت نافذة. */
        const nav = document.querySelector(BAR_SELECTOR);
        if (nav && nav.parentNode !== document.body) document.body.appendChild(nav);
        /* التلفيف هنا لا في boot: هذا الملف قد يُنفَّذ قبل app.js،
           وعند فتح الأدمن تكون دوال النظام معرّفة بالكامل. */
        wrapRepainters();
        wrapRouter();
        /* «المزيد» مكتوب خارج .admin-content في index.html، فخانته تبدأ من أعلى
           الشاشة ويختفي عنوانه تحت الرأس بينما بقية اللوحات تبدأ تحته. نعيده
           جاراً لبقية اللوحات على الجوال وحده؛ الكمبيوتر لا يعرضه أصلاً. */
        const more = document.getElementById('admin-more-menu');
        const content = document.querySelector('#admin-screen .admin-content');
        if (more && content && more.parentElement !== content) content.appendChild(more);
        injectActivityBar();
        unstyleBento();
        const order = readTabsOrder();
        if (!order.length) return;
        state.keys = order;
        state.n = order.length;
        root.style.setProperty('--m-n', String(state.n));
        /* نفس ترتيب المفاتيح حرفياً: خانة فارغة إن نقص لوح، فلا يزيح بقية التبويبات */
        state.pages = order.map(pageOf);
        if (!state.pages.some(Boolean)) return;

        const bar = document.querySelector(BAR_SELECTOR);
        state.barBtns = bar ? qsa('.bottom-nav-btn', bar) : [];
        state.barKeys = state.barBtns.map((b) => {
            const m = /switchAdminTab\(\s*['"]([^'"]+)['"]/.exec(b.getAttribute('onclick') || '');
            return m ? m[1] : '';
        });
        /* أزرار الشريط تأتي أولاً في الترتيب، فآخرها هو سقف السحب */
        state.swipeHi = clamp((state.barKeys.filter(Boolean).length || state.n) - 1, 0, state.n - 1);

        state.index = clamp(order.indexOf(currentTabKey()), 0, state.n - 1);
        phys.P = vpos(state.index);
        decorateBar();
        paintPageIndexes();
        probeCalc();
        cacheWidth();
        paintTransforms();
        bindGestures();
        bindBounceGuard();
        bindQuickPeek();
        bindPullRefresh();
        bindScrollProgress();
        bindHeadClock();
        bindCommandPalette();
        bindActivity();
        bindIdleLock();
        observeSheets();
        bindKeyboard();
        bindTodayPanel();
        syncWallet();
        initLogsChrome();
        mirrorConnection();
        state.started = true;
        flushRepaint();
        /* أثناء مسرح فتح الرمز لا نُشغّل البناء خلفه عبثاً: الكشف يشغّله
           في اللحظة التي يبدأ فيها المسرح بالتلاشي */
        if (!document.querySelector('.m-lk-fx')) enterAnimate(state.pages[state.index]);
    }

    /* شاشة تحميل تختفي بتلاشٍ .6s عند جهوزية الهيكل */
    function splash() {
        if (REDUCED || document.querySelector('.m-splash')) return;
        let light = false;
        try {
            const saved = JSON.parse(localStorage.getItem('royal_glass_v1') || '{}');
            let mode = saved && saved.mode ? saved.mode : 'dark';
            if (mode === 'auto') {
                const h = new Date().getHours();
                mode = (h >= 7 && h < 19) ? 'light' : 'dark';
            }
            light = mode === 'light';
        } catch (e) {}
        const el = document.createElement('div');
        el.className = 'm-splash' + (light ? ' is-light' : '');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-label', 'جارٍ فتح لوحة مكوى رويال');
        el.innerHTML =
            '<div class="m-splash-orb" aria-hidden="true"></div>' +
            '<div class="m-splash-core">' +
                '<div class="m-splash-mark" aria-hidden="true">' +
                    '<span class="m-splash-ring"></span>' +
                    '<span class="m-splash-ring r2"></span>' +
                    '<div class="m-splash-plate"><i class="fa-solid fa-shirt"></i><span class="m-splash-sheen"></span></div>' +
                '</div>' +
                '<div class="m-splash-brand">مكوى رويال</div>' +
                '<div class="m-splash-sub">جارٍ تجهيز لوحة اليوم</div>' +
                '<div class="m-splash-track" aria-hidden="true"><i></i></div>' +
            '</div>' +
            '<div class="m-splash-grain" aria-hidden="true"></div>';
        document.body.appendChild(el);

        const born = performance.now();
        let lifted = false;
        let shown = false;
        const lift = () => {
            if (lifted) return;
            lifted = true;
            el.classList.add('m-done');
            try {
                if (state.started && document.getElementById(ADMIN_ID) &&
                    document.getElementById(ADMIN_ID).classList.contains('active-screen')) {
                    enterAnimate(state.pages[state.index]);
                }
            } catch (e) {}
            setTimeout(() => el.classList.add('m-off2'), 150);
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 760);
        };
        const show = () => {
            if (shown) return;
            shown = true;
            el.classList.add('on');
            setTimeout(lift, 640);
        };
        /* مسرح النجاح يعيش فوق شاشة التحميل؛ ننتظر بدء تلاشيه (gone) ثم
           نعرض. سقف 4.5s حارس إن لم يظهر مسرح أصلاً أو بقي معلّقاً. */
        const tick = () => {
            const stage = document.querySelector('.m-lk-fx');
            const deadline = performance.now() - born > 4500;
            if (stage && !stage.classList.contains('gone') && !deadline) {
                setTimeout(tick, 110);
                return;
            }
            show();
        };
        tick();
        /* حارس نهائي ضد أصفار الحركة أو تبويب مخفي: لا تبقى الشاشة للأبد */
        setTimeout(lift, 6500);
    }

    function onResize() {
        if (!state.started) return;
        state.cell = 0;
        cacheWidth();
        paintTransforms();
        setTimeout(syncFlow, 220);
        reevaluateLater();
    }

    function boot() {
        injectChrome();
        buildLockScreen();
        watchUnlock();
        watchAdminOpen();
        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('orientationchange', () => setTimeout(onResize, 260), { passive: true });
        window.addEventListener('online', mirrorConnection, { passive: true });
        window.addEventListener('offline', mirrorConnection, { passive: true });
        window.addEventListener('royal-net', netChanged);
        window.addEventListener('royal-queue', renderNet);
        window.addEventListener('royal-sync', renderNet);
        window.addEventListener('royal-drain-start', (e) => {
            const n = e && typeof e.detail === 'number' ? e.detail : netReadout().queue;
            netFlash('syncing', 'جاري رفع ' + moves(n) + ' إلى السحابة…', 'اترك التطبيق مفتوحاً لحظات', 15000);
        });
        window.addEventListener('royal-drained', (e) => {
            netManual = false;
            const n = e && typeof e.detail === 'number' ? e.detail : 0;
            netFlash('back', n > 0 ? 'تمت مزامنة ' + moves(n) : 'تمت المزامنة', 'وصلت إلى السحابة · ' + lastLine(netReadout()), 4200);
        });
        window.addEventListener('storage', (e) => { if (e.key === 'royal_offline_queue') renderNet(); });
        netBootAt = Date.now();
        netBootOffline = navigator.onLine === false;
        netSeenLive = !!(window.royalNet && window.royalNet.live);
        netPrevOnline = netReadout().online;
        renderNet();
        setTimeout(() => { if (!netSeenLive) renderNet(); }, 12500);
        const syncText = document.getElementById('sync-text');
        if (syncText && window.MutationObserver) {
            new MutationObserver(mirrorConnection).observe(syncText, { childList: true, characterData: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    window.RoyalMobileShell = {
        state: state,
        tabs: () => state.keys.slice(),
        goTo: (k) => window.switchAdminTab(k, 'none'),
        dispose() {
            state.started = false;
            unwrapRepainters();
            const o = window.switchAdminTab;
            if (o && o.__mOriginal) window.switchAdminTab = o.__mOriginal;
            const st = document.getElementById('royal-mobile-style');
            if (st) st.remove();
            const wbBar = document.querySelector('#admin-wallet .m-wb-bar');
            if (wbBar) wbBar.remove();
            const wbEmpty = document.querySelector('#admin-wallet .m-wb-empty');
            if (wbEmpty) wbEmpty.remove();
            closeWalletSheet();
            unwrapLogsFilters();
            ['#admin-logs .m-logs-ranges', '#admin-logs .m-logs-foot', '#admin-logs .m-logs-empty'].forEach((sel) => {
                const el = document.querySelector(sel);
                if (el) el.remove();
            });
            logsStash = [];
            document.body.classList.remove('m-admin', 'm-sheet-open', 'm-lock', 'm-dragging');
        }
    };
})();
