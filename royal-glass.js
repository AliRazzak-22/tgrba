/* =========================================================================
   استوديو المظهر — طبقة جوال فقط.
   لا تُحمَّل ولا تعمل إطلاقاً على الكمبيوتر: كل قاعدة CSS تبدأ بـ html.is-mobile،
   وكل عنصر يُضاف داخل #admin-screen أو #modal-admin-login فقط.
   لا تلمس أي منطق أعمال ولا أي بيانات — قراءة تفضيلات محلية وحفظها فقط.
   ========================================================================= */
(function () {
    'use strict';

    const root = document.documentElement;
    if (!root.classList.contains('is-mobile')) return;

    const KEY = 'royal_glass_v1';
    const REDUCED = (() => {
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
    })();

    const PRESETS = {
        royal:   { name: 'ملكي',  a: '#5aa8ff' },
        gold:    { name: 'ذهبي',  a: '#eec26a' },
        emerald: { name: 'زمردي', a: '#3ddc97' },
        rose:    { name: 'وردي',  a: '#ff86b3' },
        violet:  { name: 'بنفسجي', a: '#a98bff' },
        cyan:    { name: 'فيروزي', a: '#38e1f0' }
    };

    const DEFAULTS = {
        mode: 'dark',
        accent: 'royal',
        density: 0.50,
        blur: 26,
        motion: REDUCED ? 'soft' : 'full',
        haptics: true
    };

    /* ---------------- أدوات لون ---------------- */
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    function rgbOf(hex) {
        const h = hex.replace('#', '');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    function hexOf(c) {
        return '#' + c.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
    }
    function mix(c1, c2, t) {
        const a = typeof c1 === 'string' ? rgbOf(c1) : c1;
        const b = typeof c2 === 'string' ? rgbOf(c2) : c2;
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    function lighten(hex, t) { return hexOf(mix(hex, '#ffffff', t)); }
    function darken(hex, t) { return hexOf(mix(hex, '#000000', t)); }
    function rgba(hex, a) { const c = rgbOf(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
    function rgbTriplet(hex) { const c = rgbOf(hex); return c[0] + ',' + c[1] + ',' + c[2]; }

    /* ---------------- تفضيلات ---------------- */
    let prefs = Object.assign({}, DEFAULTS);
    try {
        const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
        if (saved && typeof saved === 'object') prefs = Object.assign(prefs, saved);
    } catch (e) {}
    if (!PRESETS[prefs.accent]) prefs.accent = DEFAULTS.accent;
    prefs.density = clamp(Number(prefs.density) || DEFAULTS.density, 0.30, 0.74);
    prefs.blur = clamp(Number(prefs.blur) || DEFAULTS.blur, 0, 40);
    if (!/^(dark|light|auto)$/.test(prefs.mode)) prefs.mode = 'dark';
    if (!/^(full|soft|off)$/.test(prefs.motion)) prefs.motion = DEFAULTS.motion;

    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {}
    }

    function resolvedMode() {
        if (prefs.mode !== 'auto') return prefs.mode;
        const h = new Date().getHours();
        return (h >= 7 && h < 19) ? 'light' : 'dark';
    }

    /* ---------------- تطبيق الهوية ---------------- */
    function apply(animate) {
        const p = PRESETS[prefs.accent];
        const accent = p.a;
        const light = resolvedMode() === 'light';
        const s = root.style;

        s.setProperty('--rg-accent', accent);
        s.setProperty('--rg-accent-rgb', rgbTriplet(accent));
        s.setProperty('--rg-glass-a', String(prefs.density));
        s.setProperty('--rg-blur', prefs.blur + 'px');
        s.setProperty('--m-accent', accent);
        s.setProperty('--m-accent2', lighten(accent, 0.38));
        s.setProperty('--m-gold', accent);
        s.setProperty('--gold', accent);
        s.setProperty('--gold-gradient', 'linear-gradient(135deg, ' + lighten(accent, 0.34) + ' 0%, ' + accent + ' 48%, ' + darken(accent, 0.30) + ' 100%)');
        s.setProperty('--blue-electronic', lighten(accent, 0.36));
        s.setProperty('--m-lk-blur', Math.round(prefs.blur * 0.9) + 'px');

        if (!light) {
            const glassBase = hexOf(mix('#16305e', accent, 0.16));
            s.setProperty('--m-bg', hexOf(mix('#03060c', accent, 0.05)));
            s.setProperty('--black-bg', hexOf(mix('#03060c', accent, 0.05)));
            s.setProperty('--m-card', hexOf(mix('#0a1424', accent, 0.10)));
            s.setProperty('--m-card2', hexOf(mix('#101d33', accent, 0.12)));
            s.setProperty('--dark-gray', hexOf(mix('#0a1424', accent, 0.10)));
            s.setProperty('--m-deep', darken(accent, 0.42));
            s.setProperty('--m-indigo', hexOf(mix(accent, '#5b6bff', 0.35)));
            s.setProperty('--rg-glass-rgb', rgbTriplet(glassBase));
            s.setProperty('--m-glass-bg', rgba(glassBase, prefs.density));
            s.setProperty('--m-glass', 'linear-gradient(160deg, ' + rgba(lighten(accent, 0.55), 0.12) + ' 0%, ' + rgba(accent, 0.025) + ' 46%, ' + rgba(lighten(accent, 0.38), 0.08) + ' 100%)');
            s.setProperty('--m-sheen', 'radial-gradient(130% 62% at 50% -14%, ' + rgba(lighten(accent, 0.62), 0.30) + ', ' + rgba(accent, 0) + ' 64%)');
            s.setProperty('--m-edge', rgba(lighten(accent, 0.52), 0.28));
            s.setProperty('--m-edge-hi', rgba(lighten(accent, 0.74), 0.50));
            s.setProperty('--m-lift', '0 18px 38px rgba(1,6,16,.50), inset 0 1px 0 ' + rgba(lighten(accent, 0.80), 0.36) + ', inset 0 0 0 1px ' + rgba(accent, 0.10));
            s.setProperty('--m-rim', 'inset 0 1px 0 ' + rgba(lighten(accent, 0.78), 0.40) + ', inset 0 -1px 0 rgba(10,26,52,.45), inset 0 0 0 1px ' + rgba(accent, 0.11));
            s.setProperty('--m-line', rgba(lighten(accent, 0.30), 0.16));
            s.setProperty('--m-hair', rgba(lighten(accent, 0.40), 0.090));
            s.setProperty('--m-text', '#eaf3ff');
            s.setProperty('--m-ink', '#eaf3ff');
            s.setProperty('--m-muted', hexOf(mix('#94aac6', accent, 0.10)));
            s.setProperty('--m-faint', hexOf(mix('#647c99', accent, 0.08)));
            s.setProperty('--text-white', '#eef5ff');
            s.setProperty('--text-gray', '#94aac6');
            s.setProperty('--light-gray', hexOf(mix('#223a5c', accent, 0.12)));
            s.setProperty('--rg-accent-ink', accent);
        } else {
            const glassBase = hexOf(mix('#ffffff', accent, 0.045));
            s.setProperty('--m-bg', hexOf(mix('#e9f1fa', accent, 0.05)));
            s.setProperty('--black-bg', hexOf(mix('#e9f1fa', accent, 0.05)));
            s.setProperty('--m-card', rgba('#ffffff', 0.72));
            s.setProperty('--m-card2', rgba('#ffffff', 0.86));
            s.setProperty('--dark-gray', rgba('#ffffff', 0.66));
            s.setProperty('--m-deep', darken(accent, 0.28));
            s.setProperty('--m-indigo', hexOf(mix(accent, '#5b6bff', 0.35)));
            s.setProperty('--rg-glass-rgb', rgbTriplet(glassBase));
            s.setProperty('--m-glass-bg', 'rgba(255,255,255,' + clamp(prefs.density + 0.16, 0.42, 0.92) + ')');
            s.setProperty('--m-glass', 'linear-gradient(160deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.42) 46%, rgba(255,255,255,.78) 100%)');
            s.setProperty('--m-sheen', 'radial-gradient(130% 62% at 50% -14%, rgba(255,255,255,.9), rgba(255,255,255,0) 64%)');
            s.setProperty('--m-edge', 'rgba(255,255,255,.88)');
            s.setProperty('--m-edge-hi', 'rgba(255,255,255,.98)');
            s.setProperty('--m-lift', '0 16px 34px rgba(28,62,110,.16), inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px ' + rgba(accent, 0.10));
            s.setProperty('--m-rim', 'inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(30,70,120,.08), inset 0 0 0 1px ' + rgba(accent, 0.10));
            s.setProperty('--m-line', rgba(darken(accent, 0.42), 0.14));
            s.setProperty('--m-hair', rgba(darken(accent, 0.42), 0.08));
            s.setProperty('--m-text', '#0e2138');
            s.setProperty('--m-ink', '#0e2138');
            s.setProperty('--m-muted', '#4d6a8a');
            s.setProperty('--m-faint', '#5e7b9d');
            s.setProperty('--text-white', '#0e2138');
            s.setProperty('--text-gray', '#5b7591');
            s.setProperty('--light-gray', 'rgba(30,80,140,.16)');
            /* على الأسطح الفاتحة لا يصلح اللون الفاتح: --gold تُستهلك سطرياً
               بـ !important في index.html، فلا يمكن تجاوزها إلا بتعتيم المتغيّر نفسه. */
            s.setProperty('--gold', darken(accent, 0.26));
            s.setProperty('--gold-gradient', 'linear-gradient(135deg, ' + darken(accent, 0.02) + ' 0%, ' + darken(accent, 0.28) + ' 100%)');
            s.setProperty('--rg-accent-ink', darken(accent, 0.34));
        }

        document.body.classList.toggle('rg-light', light);
        document.body.classList.toggle('rg-dark', !light);
        document.body.classList.toggle('rm-motion-soft', prefs.motion === 'soft');
        document.body.classList.toggle('rm-motion-off', prefs.motion === 'off');
        document.body.dataset.rgAccent = prefs.accent;

        const btn = document.querySelector('.rg-mode-btn i');
        if (btn) btn.className = 'fa-solid ' + (light ? 'fa-moon' : 'fa-sun');
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', light ? '#eaf2fb' : '#05080f');

        if (animate) {
            const host = document.getElementById('admin-screen') || document.body;
            host.classList.remove('rg-flash');
            void host.offsetWidth;
            host.classList.add('rg-flash');
        }
    }

    /* ---------------- الأنماط ---------------- */
    const CSS = `
/* ====== زجاج v2: جسم أنقى، حافة أصفى، ولمعان مائل ====== */
html.is-mobile body #admin-screen .stat-card,
html.is-mobile body #admin-screen .cart-table tr,
html.is-mobile body #admin-screen .invoices-table tr,
html.is-mobile body .m-today,
html.is-mobile body .m-exp-sum,
html.is-mobile body .monthly-strip {
    background:
        linear-gradient(148deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.015) 38%, rgba(255,255,255,.065) 72%, rgba(255,255,255,.12) 100%),
        radial-gradient(130% 90% at 50% -10%, rgba(var(--rg-accent-rgb), .14), transparent 62%),
        var(--m-glass),
        rgba(var(--rg-glass-rgb), var(--rg-glass-a)) !important;
    border: 1px solid var(--m-edge) !important;
    box-shadow: var(--m-lift) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
}
html.is-mobile body.rg-light #admin-screen .stat-card,
html.is-mobile body.rg-light #admin-screen .cart-table tr,
html.is-mobile body.rg-light #admin-screen .invoices-table tr,
html.is-mobile body.rg-light .m-today,
html.is-mobile body.rg-light .m-exp-sum,
html.is-mobile body.rg-light .monthly-strip {
    background:
        linear-gradient(148deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.55) 42%, rgba(255,255,255,.82) 100%),
        radial-gradient(130% 90% at 50% -10%, rgba(var(--rg-accent-rgb), .07), transparent 64%),
        rgba(255,255,255,var(--rg-glass-a)) !important;
    border-color: rgba(255,255,255,.92) !important;
}

/* لمعة حافة عليا + خيط سفلي دقيق على كل بطاقة */
html.is-mobile #admin-screen .stat-card::before {
    background:
        radial-gradient(130% 62% at 50% -14%, rgba(255,255,255,.38), rgba(255,255,255,0) 64%),
        linear-gradient(105deg, transparent 30%, rgba(255,255,255,.10) 46%, transparent 60%) !important;
}
html.is-mobile body.rg-light #admin-screen .stat-card::before {
    background:
        radial-gradient(130% 62% at 50% -14%, rgba(255,255,255,.95), rgba(255,255,255,0) 64%),
        linear-gradient(105deg, transparent 32%, rgba(255,255,255,.85) 48%, transparent 62%) !important;
}

/* زر تبديل الوضع في الرأس */
html.is-mobile .rg-mode-btn {
    margin-inline-start: auto;
    flex: none;
    width: 34px; height: 34px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--m-edge);
    background: linear-gradient(160deg, rgba(255,255,255,.16), rgba(255,255,255,.03)), rgba(var(--rg-glass-rgb), calc(var(--rg-glass-a) * .8));
    color: var(--m-accent2);
    font-size: 14px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.28), 0 6px 16px rgba(0,4,14,.28);
    transition: transform .18s var(--m-ease), background .3s var(--m-ease), color .3s var(--m-ease);
}
html.is-mobile .rg-mode-btn:active { transform: scale(.92); }
html.is-mobile .rg-mode-btn i { pointer-events: none; }

/* ====== استوديو المظهر ====== */
html.is-mobile .rg-studio {
    position: relative;
    margin: 0 0 18px;
    padding: 18px 16px 16px;
    border-radius: var(--m-radius-card);
    border: 1px solid var(--m-edge);
    background:
        linear-gradient(152deg, rgba(255,255,255,.16), rgba(255,255,255,.02) 46%, rgba(255,255,255,.08)),
        var(--m-glass),
        rgba(var(--rg-glass-rgb), var(--rg-glass-a));
    box-shadow: var(--m-lift);
    overflow: hidden;
    isolation: isolate;
}
html.is-mobile body.rg-light .rg-studio {
    background:
        linear-gradient(152deg, rgba(255,255,255,.96), rgba(255,255,255,.55) 52%, rgba(255,255,255,.86)),
        rgba(255,255,255,var(--rg-glass-a));
}
html.is-mobile .rg-studio::before {
    content: "";
    position: absolute; inset: -40% -20% auto -20%;
    height: 120%;
    background: radial-gradient(60% 50% at 80% 0%, rgba(var(--rg-accent-rgb), .22), transparent 70%);
    pointer-events: none; z-index: -1;
}
html.is-mobile .rg-st-head { margin-bottom: 14px; }
html.is-mobile .rg-st-kicker {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10.5px; font-weight: 900; letter-spacing: .8px;
    color: var(--m-accent2);
    text-transform: uppercase;
}
html.is-mobile .rg-st-kicker i { font-size: 10px; }
html.is-mobile .rg-st-head h3 {
    margin: 6px 0 4px !important;
    padding: 0 !important;
    border: none !important;
    font-size: 19px !important;
    color: var(--m-text) !important;
    letter-spacing: .2px;
}
html.is-mobile .rg-st-head p {
    margin: 0;
    font-size: 12px;
    line-height: 1.65;
    color: var(--m-muted);
    font-weight: 600;
}
html.is-mobile .rg-row {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 13px 0;
    border-top: 1px solid var(--m-hair);
}
html.is-mobile .rg-row-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px;
}
html.is-mobile .rg-label {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12.5px; font-weight: 800; color: var(--m-muted);
}
html.is-mobile .rg-label i { font-size: 11px; color: var(--m-accent2); opacity: .9; }
html.is-mobile .rg-value {
    font-size: 11px; font-weight: 800; color: var(--m-accent2);
    direction: ltr; font-variant-numeric: tabular-nums;
}
html.is-mobile .rg-seg {
    display: flex; gap: 4px; padding: 4px;
    border-radius: 14px;
    background: rgba(0,0,0,.18);
    border: 1px solid var(--m-hair);
}
html.is-mobile body.rg-light .rg-seg { background: rgba(30,70,120,.06); }
html.is-mobile .rg-seg button {
    flex: 1;
    min-height: 34px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--m-muted);
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    transition: background .25s var(--m-ease), color .25s var(--m-ease), transform .16s var(--m-ease), box-shadow .25s var(--m-ease);
}
html.is-mobile .rg-seg button:active { transform: scale(.96); }
html.is-mobile .rg-seg button.on {
    color: #fff;
    background: linear-gradient(140deg, var(--rg-accent), #223f78);
    background: linear-gradient(140deg, var(--rg-accent), color-mix(in srgb, var(--rg-accent) 62%, #1a2f66));
    box-shadow: 0 6px 16px rgba(var(--rg-accent-rgb), .34), inset 0 1px 0 rgba(255,255,255,.35);
}
html.is-mobile body.rg-light .rg-seg button.on {
    color: #fff;
    background: linear-gradient(140deg, color-mix(in srgb, var(--rg-accent) 82%, #12325e), var(--rg-accent));
}
html.is-mobile .rg-swatch {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    direction: rtl;
}
html.is-mobile .rg-swatch button {
    position: relative;
    flex: 1;
    height: 38px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.22);
    background: linear-gradient(150deg, rgba(255,255,255,.32), transparent 62%), var(--sw, #5aa8ff);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 5px 12px rgba(0,4,14,.22);
    transition: transform .18s var(--m-ease), box-shadow .25s var(--m-ease);
}
html.is-mobile body.rg-light .rg-swatch button { border-color: rgba(20,60,110,.16); }
html.is-mobile .rg-swatch button:active { transform: scale(.94); }
html.is-mobile .rg-swatch button.on::after {
    content: "\\f00c";
    font-family: "Font Awesome 6 Free", "Font Awesome 6 Pro", FontAwesome;
    font-weight: 900;
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 13px;
    text-shadow: 0 1px 3px rgba(0,0,0,.45);
}
html.is-mobile .rg-swatch button.on { box-shadow: 0 0 0 2px rgba(255,255,255,.85), 0 8px 20px rgba(var(--rg-accent-rgb), .4); transform: translateY(-1px); }
html.is-mobile .rg-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 26px;
    background: transparent;
    direction: ltr;
}
html.is-mobile .rg-range::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 99px;
    background: linear-gradient(90deg, rgba(var(--rg-accent-rgb), .75), rgba(var(--rg-accent-rgb), .18));
    box-shadow: inset 0 1px 3px rgba(0,0,0,.35);
}
html.is-mobile body.rg-light .rg-range::-webkit-slider-runnable-track { box-shadow: inset 0 1px 2px rgba(20,60,110,.22); }
html.is-mobile .rg-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px; height: 22px;
    margin-top: -8px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,.9);
    background: var(--rg-accent);
    box-shadow: 0 4px 12px rgba(var(--rg-accent-rgb), .5), inset 0 1px 2px rgba(255,255,255,.5);
}
html.is-mobile .rg-toggle {
    position: relative;
    width: 46px; height: 27px;
    border-radius: 99px;
    border: 1px solid var(--m-edge);
    background: rgba(0,0,0,.22);
    transition: background .3s var(--m-ease), border-color .3s var(--m-ease);
}
html.is-mobile body.rg-light .rg-toggle { background: rgba(30,70,120,.10); }
html.is-mobile .rg-toggle::after {
    content: "";
    position: absolute; top: 3px; left: 3px;
    width: 19px; height: 19px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,4,14,.35);
    transition: transform .32s var(--m-ease);
}
html.is-mobile .rg-toggle.on { background: linear-gradient(140deg, var(--rg-accent), color-mix(in srgb, var(--rg-accent) 60%, #16305e)); border-color: transparent; }
html.is-mobile .rg-toggle.on::after { transform: translateX(19px); }
html.is-mobile .rg-preview {
    margin-top: 14px;
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid var(--m-edge);
    background:
        linear-gradient(148deg, rgba(255,255,255,.14), transparent 46%, rgba(255,255,255,.07)),
        radial-gradient(120% 120% at 100% 0%, rgba(var(--rg-accent-rgb), .22), transparent 66%),
        rgba(var(--rg-glass-rgb), var(--rg-glass-a));
    box-shadow: var(--m-lift);
}
html.is-mobile body.rg-light .rg-preview { background: linear-gradient(148deg, rgba(255,255,255,.98), rgba(255,255,255,.6)), rgba(255,255,255,.8); }
html.is-mobile .rg-preview-mark {
    width: 40px; height: 40px; flex: none;
    display: flex; align-items: center; justify-content: center;
    clip-path: var(--m-plate);
    background: linear-gradient(150deg, rgba(255,255,255,.34), rgba(var(--rg-accent-rgb), .25));
    color: #fff; font-size: 16px;
    text-shadow: 0 1px 4px rgba(0,10,30,.4);
}
html.is-mobile .rg-preview-body { min-width: 0; flex: 1; }
html.is-mobile .rg-preview-t { font-size: 12px; font-weight: 900; color: var(--m-text); }
html.is-mobile .rg-preview-s { font-size: 10.5px; font-weight: 700; color: var(--m-muted); margin-top: 2px; }
html.is-mobile .rg-preview-n {
    font-size: 17px; font-weight: 900; color: var(--rg-accent);
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 18px rgba(var(--rg-accent-rgb), .35);
}
html.is-mobile .rg-flash .admin-section.active,
html.is-mobile .rg-flash .m-head,
html.is-mobile .rg-flash #mobile-bottom-nav { animation: rgFlash .55s var(--m-ease-out); }
@keyframes rgFlash {
    0% { filter: brightness(1); }
    22% { filter: brightness(1.14) saturate(1.06); }
    100% { filter: brightness(1); }
}

/* ====== الوضع النهاري: أسطح فاتحة، نص داكن، نفس هندسة الزجاج ====== */
html.is-mobile body.rg-light { color: var(--m-text); }
html.is-mobile body.rg-light::before {
    background:
        radial-gradient(58% 38% at 84% 4%, rgba(var(--rg-accent-rgb), .30), transparent 70%),
        radial-gradient(64% 42% at 8% 30%, rgba(255,255,255,.85), transparent 74%),
        radial-gradient(44% 30% at 34% 62%, rgba(var(--rg-accent-rgb), .12), transparent 76%),
        radial-gradient(94% 52% at 50% 112%, rgba(var(--rg-accent-rgb), .20), transparent 72%),
        linear-gradient(175deg, #f4f8fd 0%, #e8f0f9 48%, #dfeaf6 100%);
}
html.is-mobile body.rg-light::after {
    background:
        linear-gradient(104deg, transparent 34%, rgba(255,255,255,.65) 45%, rgba(var(--rg-accent-rgb), .16) 50%, rgba(255,255,255,.55) 55%, transparent 66%),
        radial-gradient(52% 26% at 72% 22%, rgba(var(--rg-accent-rgb), .14), transparent 70%),
        radial-gradient(40% 22% at 18% 78%, rgba(255,255,255,.6), transparent 72%);
    opacity: .8;
}
html.is-mobile body.rg-light .m-head {
    background:
        linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.52) 70%),
        radial-gradient(120% 160% at 50% -60%, rgba(var(--rg-accent-rgb), .18), transparent 64%);
    border-bottom-color: rgba(255,255,255,.9);
    box-shadow: 0 12px 30px rgba(28,62,110,.10), inset 0 1px 0 rgba(255,255,255,.95);
}
html.is-mobile body.rg-light .m-head::after {
    background: linear-gradient(90deg, transparent, rgba(var(--rg-accent-rgb), .55), transparent);
}
html.is-mobile body.rg-light .m-brand { color: #0e2138; text-shadow: none; }
html.is-mobile body.rg-light .m-conn { color: #3f5d7c; }
html.is-mobile body.rg-light .m-time { color: #24425f; }
html.is-mobile body.rg-light #admin-screen .admin-section h2 { color: #0e2138 !important; text-shadow: none !important; }
html.is-mobile body.rg-light #admin-screen .admin-section h3 { color: #16324f !important; }
html.is-mobile body.rg-light .stat-title { color: #4d6a8a !important; }
html.is-mobile body.rg-light .stat-value { color: #0e2138 !important; text-shadow: none !important; }
html.is-mobile body.rg-light .stat-icon {
    color: #0e2138 !important;
    background: linear-gradient(152deg, rgba(255,255,255,.95) 0%, rgba(var(--rg-accent-rgb), .10) 46%, rgba(255,255,255,.75) 100%), rgba(255,255,255,.6) !important;
    text-shadow: none;
}
html.is-mobile body.rg-light #admin-screen .cart-table tr,
html.is-mobile body.rg-light #admin-screen .invoices-table tr { color: #16324f; }
html.is-mobile body.rg-light #admin-screen .cart-table td,
html.is-mobile body.rg-light #admin-screen .invoices-table td { color: #16324f; }
html.is-mobile body.rg-light #admin-screen .cart-table td[style*="color:#fff"],
html.is-mobile body.rg-light #admin-screen .cart-table td[style*="color: #fff"],
html.is-mobile body.rg-light #admin-screen .cart-table span[style*="color:#fff"],
html.is-mobile body.rg-light #admin-screen .cart-table span[style*="color: #fff"] { color: #0e2138 !important; }
html.is-mobile body.rg-light #admin-screen [style*="color:#fff"]:not(button):not(.btn):not(.btn-royal-action):not(.btn-confirm),
html.is-mobile body.rg-light #admin-screen [style*="color: #fff"]:not(button):not(.btn):not(.btn-royal-action):not(.btn-confirm),
html.is-mobile body.rg-light #admin-screen [style*="color:white"]:not(button):not(.btn):not(.btn-royal-action):not(.btn-confirm) { color: #0e2138 !important; }
html.is-mobile body.rg-light #admin-screen [style*="background: linear-gradient"] { background: linear-gradient(148deg, rgba(255,255,255,.96), rgba(255,255,255,.62)) !important; }
html.is-mobile body.rg-light #mobile-bottom-nav {
    background:
        linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.66) 58%),
        radial-gradient(120% 150% at 50% -20%, rgba(var(--rg-accent-rgb), .18), transparent 64%);
    border-color: rgba(255,255,255,.95);
    box-shadow: 0 20px 44px rgba(28,62,110,.18), var(--m-rim);
}
html.is-mobile body.rg-light .bottom-nav-btn { color: #5b7591; }
html.is-mobile body.rg-light .bottom-nav-btn.m-hi { color: #0e2138; }
html.is-mobile body.rg-light .bottom-nav-btn.active:not(.m-hi) { color: #5b7591; }
html.is-mobile body.rg-light .modal-overlay:not(.m-lock-screen) .modal-content {
    background: linear-gradient(160deg, rgba(255,255,255,.97), rgba(255,255,255,.88)) !important;
    color: #0e2138 !important;
    border-color: rgba(255,255,255,.9) !important;
    box-shadow: 0 30px 70px rgba(28,62,110,.25) !important;
}
html.is-mobile body.rg-light .modal-overlay:not(.m-lock-screen) .modal-title { color: #0e2138 !important; }
html.is-mobile body.rg-light .note-input,
html.is-mobile body.rg-light input:not(.m-otp-input),
html.is-mobile body.rg-light select,
html.is-mobile body.rg-light textarea {
    background: rgba(255,255,255,.72) !important;
    color: #0e2138 !important;
    border-color: rgba(30,80,140,.18) !important;
}
html.is-mobile body.rg-light .toast-msg {
    background: rgba(255,255,255,.92) !important;
    color: #0e2138 !important;
    border-color: rgba(30,80,140,.16) !important;
}
html.is-mobile body.rg-light .m-today,
html.is-mobile body.rg-light .m-exp-sum,
html.is-mobile body.rg-light .monthly-strip { color: #16324f; }
html.is-mobile body.rg-light .monthly-strip-item { color: #4d6a8a !important; }
html.is-mobile body.rg-light .monthly-strip strong { color: #0e2138 !important; }
html.is-mobile body.rg-light .m-splash { background: rgba(255,255,255,.72); }
html.is-mobile body.rg-light .m-offline {
    background: rgba(255,255,255,.9) !important;
    color: #7a4a00 !important;
    border-color: rgba(200,140,40,.35) !important;
}

/* ====== الوضع النهاري: تفاصيل اليوم والبطاقة البطلة والرأس ====== */
html.is-mobile body.rg-light { color-scheme: light; }
html.is-mobile body.rg-light .m-brand { color: #0e2138 !important; -webkit-text-fill-color: #0e2138 !important; }
html.is-mobile body.rg-light .m-head .m-conn .m-dot { box-shadow: 0 0 0 3px rgba(61,180,120,.14); }
html.is-mobile body.rg-light #admin-screen #bento-current-pieces { color: #0e2138 !important; text-shadow: none !important; }
html.is-mobile body.rg-light #admin-daily-report .bento-hero {
    background:
        radial-gradient(120% 96% at 88% -14%, rgba(var(--rg-accent-rgb), .20), transparent 62%),
        radial-gradient(110% 86% at -4% 110%, rgba(var(--rg-accent-rgb), .12), transparent 64%),
        linear-gradient(152deg, rgba(255,255,255,.98), rgba(255,255,255,.62) 48%, rgba(255,255,255,.86)) !important;
    border-color: rgba(255,255,255,.98) !important;
    box-shadow: 0 24px 46px rgba(28,62,110,.18), inset 0 1px 0 rgba(255,255,255,1) !important;
}
html.is-mobile body.rg-light #admin-daily-report .bento-hero::after {
    background: linear-gradient(100deg, transparent, rgba(255,255,255,.85), transparent);
}
html.is-mobile body.rg-light #admin-daily-report .bento-hero .stat-title { color: var(--rg-accent-ink) !important; }
html.is-mobile body.rg-light .monthly-strip-item strong { color: #0e2138 !important; text-shadow: none !important; }
html.is-mobile body.rg-light .m-today-head { color: #16324f !important; }
html.is-mobile body.rg-light .m-today-head i { text-shadow: none !important; }
html.is-mobile body.rg-light .m-today-date { color: #5b7591 !important; }
html.is-mobile body.rg-light .m-today-meta > span { color: #4d6a8a !important; }
html.is-mobile body.rg-light .m-today-row > i {
    color: var(--rg-accent-ink) !important;
    background: linear-gradient(160deg, rgba(255,255,255,.96), rgba(var(--rg-accent-rgb), .10) 55%, rgba(255,255,255,.7)), rgba(255,255,255,.72) !important;
    text-shadow: none !important;
}
html.is-mobile body.rg-light .m-today-row { border-bottom-color: rgba(30,80,140,.10) !important; }
html.is-mobile body.rg-light .m-today-val { color: #16324f !important; text-shadow: none !important; }
html.is-mobile body.rg-light .m-today-row.up .m-today-val { color: #0d7a52 !important; }
html.is-mobile body.rg-light .m-today-row.down .m-today-val,
html.is-mobile body.rg-light .m-today-row.neg .m-today-val { color: #b32b3a !important; }
html.is-mobile body.rg-light .m-today-row.sum { background: linear-gradient(90deg, rgba(var(--rg-accent-rgb), .10), transparent) !important; }
html.is-mobile body.rg-light .m-today-row.sum .m-today-val { color: #0e2138 !important; }
html.is-mobile body.rg-light .m-today-row.up > i { color: #0d7a52 !important; }
html.is-mobile body.rg-light .m-today-row.down > i { color: #b32b3a !important; }
html.is-mobile body.rg-light .m-today-bar { background: rgba(30,80,140,.10) !important; box-shadow: none !important; }
html.is-mobile body.rg-light .m-viewbtn,
html.is-mobile body.rg-light .m-offline { background: rgba(255,255,255,.88) !important; color: #24425f !important; border-color: rgba(30,80,140,.16) !important; }
html.is-mobile body.rg-light .admin-section .m-anim .m-today-bar i { box-shadow: none; }

/* ====== الحركة: مخففة / بدون ====== */
html.is-mobile body.rm-motion-soft::before,
html.is-mobile body.rm-motion-soft::after,
html.is-mobile body.rm-motion-soft .m-lk-scene i,
html.is-mobile body.rm-motion-soft .m-sp-aura i,
html.is-mobile body.rm-motion-soft .m-sp-card::after { animation: none !important; }
html.is-mobile body.rm-motion-soft .admin-section .m-anim,
html.is-mobile body.rm-motion-soft .admin-section .m-anim * { animation-duration: .5s !important; animation-delay: 0ms !important; }
html.is-mobile body.rm-motion-off *,
html.is-mobile body.rm-motion-off *::before,
html.is-mobile body.rm-motion-off *::after {
    animation-duration: .001ms !important;
    animation-delay: 0ms !important;
    transition-duration: .001ms !important;
}
html.is-mobile body.rm-motion-off::before,
html.is-mobile body.rm-motion-off::after { animation: none !important; }

@media (prefers-reduced-motion: reduce) {
    html.is-mobile .rg-studio::before { animation: none !important; }
}
`;

    function injectCSS() {
        if (document.getElementById('royal-glass-style')) return;
        const style = document.createElement('style');
        style.id = 'royal-glass-style';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    /* أنماط الطبقة يجب أن تأتي بعد أنماط mobile-shell (التي تُحقن عند فتح الأدمن)
       حتى تتقدّم عليها عند نفس التحديد. نُعيد إلحاقها في النهاية عند أول ظهور. */
    function keepStyleLast() {
        const style = document.getElementById('royal-glass-style');
        if (style && style.nextSibling) document.head.appendChild(style);
    }

    /* ---------------- زر الرأس ---------------- */
    function buildHeaderButton() {
        const head = document.querySelector('#admin-screen .m-head');
        if (!head || head.querySelector('.rg-mode-btn')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rg-mode-btn';
        btn.setAttribute('aria-label', 'تبديل الوضع الليلي والنهاري');
        btn.innerHTML = '<i class="fa-solid ' + (resolvedMode() === 'light' ? 'fa-moon' : 'fa-sun') + '"></i>';
        btn.addEventListener('click', () => {
            const next = resolvedMode() === 'light' ? 'dark' : 'light';
            prefs.mode = next;
            save(); apply(true); syncStudio();
        });
        head.appendChild(btn);
    }

    /* ---------------- استوديو المظهر ---------------- */
    function studioHTML() {
        const swatches = Object.keys(PRESETS).map((k) =>
            '<button type="button" data-accent="' + k + '" aria-label="' + PRESETS[k].name + '" style="--sw:' + PRESETS[k].a + '"></button>'
        ).join('');
        return '' +
            '<div class="rg-st-head">' +
                '<span class="rg-st-kicker"><i class="fa-solid fa-wand-magic-sparkles"></i> استوديو المظهر</span>' +
                '<h3>مزاج الواجهة</h3>' +
                '<p>كل تغيير يظهر فوراً ويُحفظ على هذا الجهاز. لا يمسّ بيانات المكوى.</p>' +
            '</div>' +
            '<div class="rg-row"><div class="rg-row-top"><span class="rg-label"><i class="fa-solid fa-circle-half-stroke"></i> الوضع</span></div>' +
                '<div class="rg-seg" data-seg="mode">' +
                    '<button type="button" data-val="dark">ليلي</button>' +
                    '<button type="button" data-val="light">نهاري</button>' +
                    '<button type="button" data-val="auto">تلقائي</button>' +
                '</div></div>' +
            '<div class="rg-row"><div class="rg-row-top"><span class="rg-label"><i class="fa-solid fa-palette"></i> لون الهوية</span></div>' +
                '<div class="rg-swatch" data-swatch>' + swatches + '</div></div>' +
            '<div class="rg-row"><div class="rg-row-top"><span class="rg-label"><i class="fa-solid fa-droplet"></i> شفافية الزجاج</span><span class="rg-value" data-out="density"></span></div>' +
                '<input class="rg-range" type="range" min="30" max="74" step="1" data-range="density"></div>' +
            '<div class="rg-row"><div class="rg-row-top"><span class="rg-label"><i class="fa-solid fa-glasses"></i> ضباب شاشة القفل والنوافذ</span><span class="rg-value" data-out="blur"></span></div>' +
                '<input class="rg-range" type="range" min="0" max="40" step="1" data-range="blur"></div>' +
            '<div class="rg-row"><div class="rg-row-top"><span class="rg-label"><i class="fa-solid fa-wave-square"></i> الحركة</span></div>' +
                '<div class="rg-seg" data-seg="motion">' +
                    '<button type="button" data-val="full">كاملة</button>' +
                    '<button type="button" data-val="soft">مخففة</button>' +
                    '<button type="button" data-val="off">بدون</button>' +
                '</div></div>' +
            '<div class="rg-row"><div class="rg-row-top"><span class="rg-label"><i class="fa-solid fa-mobile-screen-button"></i> اهتزاز اللمس</span>' +
                '<button type="button" class="rg-toggle" data-toggle="haptics" aria-label="اهتزاز اللمس"></button></div></div>' +
            '<div class="rg-preview">' +
                '<span class="rg-preview-mark"><i class="fa-solid fa-shirt"></i></span>' +
                '<div class="rg-preview-body"><div class="rg-preview-t">معاينة حيّة</div><div class="rg-preview-s">الزجاج يتبدّل أمامك</div></div>' +
                '<div class="rg-preview-n" data-preview-n>59</div>' +
            '</div>';
    }

    function buildStudio() {
        const page = document.getElementById('admin-settings');
        if (!page || page.querySelector('.rg-studio')) return;
        const box = document.createElement('div');
        box.className = 'rg-studio';
        box.id = 'rg-studio';
        box.innerHTML = studioHTML();
        page.insertBefore(box, page.firstChild);

        box.addEventListener('click', (e) => {
            const seg = e.target.closest('[data-seg] button');
            if (seg) {
                const key = seg.closest('[data-seg]').getAttribute('data-seg');
                prefs[key] = seg.getAttribute('data-val');
                save(); apply(true); syncStudio();
                return;
            }
            const sw = e.target.closest('[data-accent]');
            if (sw) {
                prefs.accent = sw.getAttribute('data-accent');
                save(); apply(true); syncStudio();
                return;
            }
            const tg = e.target.closest('[data-toggle]');
            if (tg) {
                const key = tg.getAttribute('data-toggle');
                prefs[key] = !prefs[key];
                save(); syncHaptics(); syncStudio();
            }
        });
        box.addEventListener('input', (e) => {
            const r = e.target.closest('[data-range]');
            if (!r) return;
            const key = r.getAttribute('data-range');
            const v = Number(r.value);
            prefs[key] = key === 'density' ? v / 100 : v;
            save(); apply(false); syncStudio();
        });
        syncStudio();
    }

    function syncStudio() {
        const box = document.getElementById('rg-studio');
        if (!box) return;
        box.querySelectorAll('[data-seg]').forEach((seg) => {
            const key = seg.getAttribute('data-seg');
            seg.querySelectorAll('button').forEach((b) => {
                b.classList.toggle('on', b.getAttribute('data-val') === prefs[key]);
            });
        });
        box.querySelectorAll('[data-accent]').forEach((b) => {
            b.classList.toggle('on', b.getAttribute('data-accent') === prefs.accent);
        });
        box.querySelectorAll('[data-toggle]').forEach((b) => {
            const key = b.getAttribute('data-toggle');
            b.classList.toggle('on', !!prefs[key]);
            b.setAttribute('aria-pressed', String(!!prefs[key]));
        });
        const dr = box.querySelector('[data-range="density"]');
        if (dr) dr.value = String(Math.round(prefs.density * 100));
        const br = box.querySelector('[data-range="blur"]');
        if (br) br.value = String(Math.round(prefs.blur));
        const od = box.querySelector('[data-out="density"]');
        if (od) od.textContent = Math.round(prefs.density * 100) + '%';
        const ob = box.querySelector('[data-out="blur"]');
        if (ob) ob.textContent = Math.round(prefs.blur) + 'px';
    }

    /* ---------------- الاهتزاز ---------------- */
    let vibrateOrigin = null;
    function syncHaptics() {
        if (!navigator.vibrate) return;
        if (!vibrateOrigin) vibrateOrigin = navigator.vibrate.bind(navigator);
        navigator.vibrate = prefs.haptics ? vibrateOrigin : function () { return false; };
    }

    /* ---------------- دورة الحياة ---------------- */
    injectCSS();
    apply(false);

    let mounted = false;
    function mountUI() {
        const admin = document.getElementById('admin-screen');
        if (!admin) return;
        buildHeaderButton();
        buildStudio();
        if (!mounted) { mounted = true; keepStyleLast(); }
    }

    const admin = document.getElementById('admin-screen');
    if (admin) {
        new MutationObserver((list) => {
            for (const m of list) {
                if (m.attributeName === 'class') mountUI();
            }
        }).observe(admin, { attributes: true, attributeFilter: ['class'] });

        const content = admin.querySelector('.admin-content');
        if (content) {
            new MutationObserver(() => {
                if (document.getElementById('admin-settings') && !document.getElementById('rg-studio')) {
                    buildStudio(); syncStudio();
                }
                buildHeaderButton();
            }).observe(content, { childList: true, subtree: true });
        }
    }

    setInterval(() => {
        if (prefs.mode !== 'auto') return;
        const light = resolvedMode() === 'light';
        if (document.body.classList.contains('rg-light') !== light) { apply(false); syncStudio(); }
    }, 60000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden || prefs.mode !== 'auto') return;
        const light = resolvedMode() === 'light';
        if (document.body.classList.contains('rg-light') !== light) { apply(false); syncStudio(); }
    });

    syncHaptics();
    setTimeout(mountUI, 900);
    setTimeout(() => { buildHeaderButton(); buildStudio(); }, 2400);

    window.RoyalGlass = {
        prefs: () => Object.assign({}, prefs),
        set: (patch) => {
            Object.assign(prefs, patch || {});
            prefs.density = clamp(Number(prefs.density) || DEFAULTS.density, 0.30, 0.74);
            prefs.blur = clamp(Number(prefs.blur) || 0, 0, 40);
            save(); apply(true); syncHaptics(); syncStudio();
        },
        mode: resolvedMode
    };
})();
