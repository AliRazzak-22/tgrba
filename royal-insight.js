/* =========================================================================
   مركز الزبائن — تحليل قراءة فقط لطبقة الجوال.
   يقرأ localData عبر جسر app.js (window.royalDataRead) ولا يكتب أي شيء إطلاقاً.
   كل قاعدة CSS تبدأ بـ html.is-mobile، وكل عنصر يُركّب داخل #admin-customers
   أو على body (ورقة الزبون) — نسخة الكمبيوتر لا تراه ولا تتأثر به.
   ========================================================================= */
(function () {
    'use strict';

    const root = document.documentElement;
    if (!root.classList.contains('is-mobile')) return;

    const SEC_ID = 'admin-customers';
    const REDUCED = (() => {
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
    })();

    const SERIES = ['var(--rg-accent)', '#8b9dff', '#3ddc97', '#ffd166', '#ff86b3', '#38e1f0'];
    const TIER_COLORS = { elite: 'var(--rg-accent)', loyal: '#8b9dff', fresh: '#3ddc97', casual: '#ffd166' };
    const PERIODS = [
        { k: 'today', label: 'اليوم', days: 1 },
        { k: '7', label: '٧ أيام', days: 7 },
        { k: '30', label: '٣٠ يوماً', days: 30 },
        { k: 'all', label: 'الكل', days: 0 }
    ];
    const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const state = {
        period: '30',
        query: '',
        filter: 'all',
        svcMode: 'rev',
        dirSort: 'spend',
        dirLimit: 40,
        rendered: false,
        signature: '',
        timer: 0,
        sheetCustomer: null
    };

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
    function fmt(n) { return Math.round(num(n)).toLocaleString('en-US'); }
    function money(n) { return fmt(n) + ' د.ع'; }
    function visitsWord(n) {
        const v = Math.round(num(n));
        if (v === 2) return 'زيارتان';
        if (v >= 3 && v <= 10) return fmt(v) + ' زيارات';
        return fmt(v) + ' زيارة';
    }
    function pct(v, total) { return total > 0 ? Math.round((v / total) * 100) : 0; }
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    function motionOff() {
        if (REDUCED) return true;
        if (document.body.classList.contains('rm-motion-off')) return true;
        return false;
    }
    function motionSoft() {
        return document.body.classList.contains('rm-motion-soft');
    }

    /* ---------------- التاريخ والوقت ---------------- */
    function tsOf(inv) {
        const t = num(inv && inv.timestamp);
        if (t > 0) return t;
        const s = inv && inv.date ? String(inv.date) : '';
        const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
        if (p) return new Date(+p[1], +p[2] - 1, +p[3], 12, 0, 0).getTime();
        return 0;
    }
    function dateOfMs(ms) {
        const d = new Date(ms);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function prettyDay(ms) {
        const d = new Date(ms);
        const today = new Date();
        const same = d.toDateString() === today.toDateString();
        if (same) return 'اليوم';
        return d.getDate() + ' ' + ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'][d.getMonth()];
    }
    function shortMonth(m) {
        return ['ك2', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'ت1', 'ت2', 'ك1'][m];
    }
    function monthsLabel(n) {
        if (n === 1) return 'شهر واحد';
        if (n === 2) return 'شهرين';
        return n + ' أشهر';
    }
    function weekdayIdx(ms) {
        const d = new Date(ms);
        return d.getDay();
    }
    function hourOf(inv) {
        const s = String((inv && inv.time) || '');
        const m = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|ص|م)?/i.exec(s);
        if (!m) return 12;
        let h = parseInt(m[1], 10);
        const ap = (m[4] || '').toUpperCase();
        if (ap === 'PM' || ap === 'م') { if (h < 12) h += 12; }
        else if (ap === 'AM' || ap === 'ص') { if (h === 12) h = 0; }
        return clamp(h, 0, 23);
    }
    function nowLabel() {
        const d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    /* ---------------- البيانات ---------------- */
    function readData() {
        try {
            const d = typeof window.royalDataRead === 'function' ? window.royalDataRead() : null;
            if (!d) return null;
            return {
                invoices: Array.isArray(d.invoices) ? d.invoices : [],
                payments: Array.isArray(d.payments) ? d.payments : [],
                debts: Array.isArray(d.debts) ? d.debts : []
            };
        } catch (e) { return null; }
    }
    function isNamed(inv) {
        const n = inv && inv.customer && inv.customer.name ? String(inv.customer.name).trim() : '';
        return n !== '' && n !== 'عميل نقدي' && n !== 'عميل نقدي ';
    }
    function periodStart(days) {
        if (!days) return 0;
        const today = typeof window.royalTodayKey === 'function' ? window.royalTodayKey() : dateOfMs(Date.now());
        const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(today));
        const base = p ? new Date(+p[1], +p[2] - 1, +p[3], 0, 0, 0).getTime() : Date.now();
        return base - (days - 1) * 86400000;
    }
    function previousStart(days) {
        if (!days) return 0;
        return periodStart(days) - days * 86400000;
    }

    function build(periodDays) {
        const data = readData();
        if (!data) return null;
        const start = periodStart(periodDays);
        const prevStart = previousStart(periodDays);
        const all = data.invoices.filter((i) => i && i.id);
        const firstSeen = {};
        /* سجل حياة الزبون عبر كل الفواتير لا الفترة المختارة: سؤال «من غاب؟»
           يخص الزبون نفسه، فلا يتغير بتغيير الفلتر. */
        const life = {};
        all.forEach((inv) => {
            const name = isNamed(inv) ? String(inv.customer.name).trim() : '';
            if (!name) return;
            const t = tsOf(inv);
            if (!firstSeen[name] || t < firstSeen[name]) firstSeen[name] = t;
            const lc = life[name] || (life[name] = { name, visits: 0, spent: 0, lastTs: 0 });
            lc.visits += 1;
            lc.spent += num(inv.total);
            if (t > lc.lastTs) lc.lastTs = t;
        });

        const inPeriod = all.filter((i) => !start || tsOf(i) >= start);
        const inPrev = periodDays ? all.filter((i) => { const t = tsOf(i); return t >= prevStart && t < start; }) : [];

        const map = {};
        inPeriod.forEach((inv) => {
            if (!isNamed(inv)) return;
            const name = String(inv.customer.name).trim();
            let c = map[name];
            if (!c) {
                c = map[name] = {
                    name,
                    phone: '',
                    visits: 0,
                    spent: 0,
                    pieces: 0,
                    items: {},
                    invoices: [],
                    firstTs: firstSeen[name] || tsOf(inv),
                    lastTs: 0
                };
            }
            const ph = inv.customer.phone ? String(inv.customer.phone).trim() : '';
            if (ph && !c.phone) c.phone = ph;
            c.visits += 1;
            c.spent += num(inv.total);
            c.invoices.push(inv);
            const t = tsOf(inv);
            if (t > c.lastTs) c.lastTs = t;
            (Array.isArray(inv.items) ? inv.items : []).forEach((it) => {
                const q = num(it.qty) || 1;
                c.pieces += q;
                const key = String(it.serviceName || it.name || 'خدمة').trim();
                if (!c.items[key]) c.items[key] = { qty: 0, rev: 0 };
                c.items[key].qty += q;
                c.items[key].rev += num(it.price) * q;
            });
        });

        const customers = Object.values(map).map((c) => {
            const fav = Object.keys(c.items).sort((a, b) => c.items[b].qty - c.items[a].qty)[0] || '';
            return Object.assign(c, {
                avg: c.visits ? c.spent / c.visits : 0,
                fav,
                isNew: start ? (c.firstTs >= start) : (Date.now() - c.firstTs <= 30 * 86400000),
                debt: 0
            });
        });

        const debtsByName = {};
        data.debts.forEach((d) => {
            if (!d || num(d.remaining) <= 0) return;
            const n = String(d.name || '').trim();
            if (!n) return;
            debtsByName[n] = (debtsByName[n] || 0) + num(d.remaining);
        });
        Object.keys(map).forEach((n) => {
            if (debtsByName[n]) map[n].debt = debtsByName[n];
        });

        /* الفترات السابقة للمقارنة */
        const prevNames = {};
        inPrev.forEach((inv) => { if (isNamed(inv)) prevNames[String(inv.customer.name).trim()] = 1; });
        const prevCount = Object.keys(prevNames).length;
        let prevBilled = 0;
        inPrev.forEach((inv) => { prevBilled += num(inv.total); });
        const prevNew = Object.keys(prevNames).filter((name) => {
            const f = firstSeen[name];
            return f && f >= prevStart && f < start;
        }).length;
        /* نافذة سابقة بنفس الطول تنتهي عند بداية الفترة — تُحسب من كل الفواتير
           لا من الدفعات، تماماً مثل قيمة الطلبات الحالية. والاحتفاظ = من زبائن
           النافذة السابقة من عاد وسجّل فاتورة هنا. */
        const retained = Object.keys(prevNames).filter((n) => map[n]).length;
        const prev = periodDays ? {
            billed: prevBilled,
            visits: inPrev.length,
            customers: prevCount,
            newCount: prevNew,
            retained: retained
        } : null;

        /* المال: قيمة الطلبات + المستلَم وفق نفس مسارات النظام (بلا تكرار) */
        let billed = 0;
        inPeriod.forEach((inv) => { billed += num(inv.total); });

        const payTypes = {
            'تسديد دين': 1, 'اشتراك VIP': 1, 'تجديد VIP': 1, 'ترقية VIP': 1,
            'دفع كاش (متبقي طلب)': 1, 'دفع مختلط (VIP + كاش)': 1
        };
        /* المتبقي عند التسليم يُحتسب من سجل الدفعات وحده (وسم «دفع كاش (متبقي
           طلب)») كما في صندوق اليوم والتقرير الشهري. جمعه هنا أيضاً كان
           يضاعف الكاش المسلَّم بعد أن صار للتسليم دفعة مستقلة. */
        let cash = 0, electronic = 0;
        inPeriod.forEach((inv) => {
            const c = inv.customer || {};
            if (inv.type === 'active' || inv.type === 'archived') cash += num(c.paid);
            if (inv.type === 'cash') cash += num(inv.total);
            if (inv.type === 'electronic') electronic += num(inv.total);
        });
        data.payments.forEach((p) => {
            const t = num(p && p.timestamp);
            if (start && t < start) return;
            const ty = String((p && p.type) || '');
            if (ty === 'إلغاء اشتراك VIP') { cash -= num(p.amount); return; }
            if (ty === 'دفع إلكتروني (متبقي طلب)') { electronic += num(p.amount); return; }
            if (payTypes[ty]) cash += num(p.amount);
        });
        const collected = cash + electronic;

        const debtsTotal = Object.keys(debtsByName).reduce((s, k) => s + debtsByName[k], 0);

        /* الشرائح: النخبة = أعلى 10% إنفاقاً (زبون واحد على الأقل) */
        const sortedBySpend = customers.slice().sort((a, b) => b.spent - a.spent);
        const eliteCut = Math.max(1, Math.ceil(sortedBySpend.length * 0.1));
        const eliteSet = new Set(sortedBySpend.slice(0, eliteCut).map((c) => c.name));
        const tiers = { elite: [], loyal: [], fresh: [], casual: [] };
        customers.forEach((c) => {
            if (eliteSet.has(c.name) && c.spent > 0) tiers.elite.push(c);
            else if (c.visits >= 3) tiers.loyal.push(c);
            else if (c.isNew) tiers.fresh.push(c);
            else tiers.casual.push(c);
        });

        /* منحنى 14 يوماً */
        const days = [];
        const dayMap = {};
        const todayKey = typeof window.royalTodayKey === 'function' ? window.royalTodayKey() : dateOfMs(Date.now());
        const todayParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(todayKey));
        const todayMs = todayParts ? new Date(+todayParts[1], +todayParts[2] - 1, +todayParts[3], 12, 0, 0).getTime() : Date.now();
        for (let i = 13; i >= 0; i--) {
            const ms = todayMs - i * 86400000;
            const key = dateOfMs(ms);
            days.push({ key, ms, value: 0, count: 0 });
            dayMap[key] = days[days.length - 1];
        }
        all.forEach((inv) => {
            const t = tsOf(inv);
            if (!t) return;
            const key = dateOfMs(t);
            if (dayMap[key]) { dayMap[key].value += num(inv.total); dayMap[key].count += 1; }
        });

        /* الخدمات */
        const services = {};
        inPeriod.forEach((inv) => {
            (Array.isArray(inv.items) ? inv.items : []).forEach((it) => {
                const key = String(it.serviceName || it.name || 'خدمة').trim();
                const q = num(it.qty) || 1;
                if (!services[key]) services[key] = { name: key, qty: 0, rev: 0 };
                services[key].qty += q;
                services[key].rev += num(it.price) * q;
            });
        });
        const topServices = Object.values(services).sort((a, b) => b.rev - a.rev).slice(0, 6);
        const topServicesQty = Object.values(services).sort((a, b) => b.qty - a.qty || b.rev - a.rev).slice(0, 6);

        /* خريطة الأوقات */
        const heat = [];
        for (let d = 0; d < 7; d++) heat.push([0, 0, 0, 0]);
        inPeriod.forEach((inv) => {
            const h = hourOf(inv);
            const b = h < 9 ? 0 : (h < 13 ? 1 : (h < 17 ? 2 : 3));
            heat[weekdayIdx(tsOf(inv))][b] += 1;
        });
        const heatMax = Math.max(1, ...heat.reduce((a, r) => a.concat(r), []));

        /* إيقاع الأسبوع: متوسط قيمة الطلبات لكل يوم أسبوع. نجمع ثم نقسم على
           عدد مرات ظهور اليوم في النافذة لا على عدد الفواتير، كي لا يُظلم يوم
           تكرر أربع مرات مقابل يوم تكرر خمساً. واليوم الجاري يُستثنى كلياً:
           نصف يوم لا يمثّل يوم عمل كامل، واحتسابه يخفض متوسط يومه بلا سبب. */
        const todayStartMs = new Date(new Date(todayMs).getFullYear(), new Date(todayMs).getMonth(), new Date(todayMs).getDate()).getTime();
        const wdDone = inPeriod.filter((inv) => { const t = tsOf(inv); return t > 0 && t < todayStartMs; });
        const wd = WEEKDAYS.map((label, i) => ({ i, label, total: 0, bills: 0, days: 0, avg: 0 }));
        wdDone.forEach((inv) => {
            const d = wd[weekdayIdx(tsOf(inv))];
            d.total += num(inv.total);
            d.bills += 1;
        });
        let wdStart = start;
        if (!wdStart) {
            all.forEach((inv) => { const t = tsOf(inv); if (t && t < todayStartMs && (!wdStart || t < wdStart)) wdStart = t; });
            if (wdStart) { const f = new Date(wdStart); wdStart = new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime(); }
        }
        if (wdStart && wdStart < todayStartMs) {
            const cur = new Date(wdStart);
            const lastDay = new Date(todayStartMs - 1);
            let guard = 0;
            while (cur.getTime() <= lastDay.getTime() && guard < 4200) {
                wd[cur.getDay()].days += 1;
                cur.setDate(cur.getDate() + 1);
                guard += 1;
            }
        }
        let wdBest = -1, wdWorst = -1;
        wd.forEach((d) => {
            d.avg = d.days ? d.total / d.days : 0;
            if (!d.days) return;
            if (wdBest < 0 || d.avg > wd[wdBest].avg) wdBest = d.i;
            if (wdWorst < 0 || d.avg < wd[wdWorst].avg) wdWorst = d.i;
        });

        /* توزيع حجم الطلبات: يعدّ الفواتير لا المال، ليجيب هل الزبائن يطلبون
           قطعاً قليلة متكررة أم طلبات كبيرة. الوسيط أصدق من المتوسط حين تجرّ
           فاتورة واحدة الذيل، ولذلك يُعرض بجانب التوزيع. */
        const ovalCuts = [5000, 10000, 25000];
        const oval = { n: 0, buckets: [0, 0, 0, 0], totals: [0, 0, 0, 0], median: 0, max: 0 };
        const ovalVals = [];
        inPeriod.forEach((inv) => {
            const v = num(inv.total);
            if (v <= 0) return;
            let b = 0;
            if (v >= ovalCuts[2]) b = 3;
            else if (v >= ovalCuts[1]) b = 2;
            else if (v >= ovalCuts[0]) b = 1;
            oval.buckets[b] += 1;
            oval.totals[b] += v;
            oval.n += 1;
            ovalVals.push(v);
        });
        ovalVals.sort((a, b) => a - b);
        if (oval.n) {
            oval.median = oval.n % 2
                ? ovalVals[(oval.n - 1) / 2]
                : (ovalVals[oval.n / 2 - 1] + ovalVals[oval.n / 2]) / 2;
            oval.max = ovalVals[oval.n - 1];
        }

        /* غائب = زبون زار مرتين فأكثر ولم تُسجَّل له فاتورة منذ ٢١ يوماً.
           نُفرّق من تجاوز الشهر عن الذي ما زال في مهلة العودة. */
        const absent = Object.values(life)
            .filter((c) => c.visits >= 2 && c.lastTs)
            .map((c) => Object.assign({}, c, { days: Math.floor((todayMs - c.lastTs) / 86400000) }))
            .filter((c) => c.days >= 21)
            .sort((a, b) => b.spent - a.spent);
        const absentWarn = absent.filter((c) => c.days < 30).length;
        const absentSpend = absent.reduce((s, c) => s + c.spent, 0);

        /* جدد مقابل عائدين شهرياً: آخر ستة أشهر من كل الفواتير لا من الفترة،
           والزبون يُحسب في الشهر مرة واحدة؛ «جديد» إذا كانت أول فاتورة له في
           ذلك الشهر نفسه. قراءة فقط. */
        const months = [];
        const monthMap = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(todayMs);
            const first = new Date(d.getFullYear(), d.getMonth() - i, 1, 0, 0, 0);
            const key = first.getFullYear() + '-' + String(first.getMonth() + 1).padStart(2, '0');
            const mo = { key, label: shortMonth(first.getMonth()), start: first.getTime(), fresh: 0, back: 0, total: 0, seen: {} };
            months.push(mo);
            monthMap[key] = mo;
        }
        all.forEach((inv) => {
            if (!isNamed(inv)) return;
            const t = tsOf(inv);
            if (!t) return;
            const mo = monthMap[dateOfMs(t).slice(0, 7)];
            if (!mo) return;
            const name = String(inv.customer.name).trim();
            if (mo.seen[name]) return;
            mo.seen[name] = 1;
            if ((firstSeen[name] || t) >= mo.start) mo.fresh += 1;
            else mo.back += 1;
        });
        months.forEach((m) => { delete m.seen; m.total = m.fresh + m.back; });
        /* لا نعرض أشهراً فارغة قبل بداية السجل: نبدأ من أول شهر فيه بيانات،
           ونُبقي شهرين على الأقل كي يبقى للعمود سياق زمني. */
        let firstData = months.findIndex((m) => m.total > 0);
        if (firstData === -1) firstData = months.length - 2;
        months.splice(0, Math.min(firstData, months.length - 2));

        /* مدرّج الولاء */
        const ladder = [
            { label: 'زيارة واحدة', n: 0, cls: 'l1' },
            { label: 'زيارتان', n: 0, cls: 'l2' },
            { label: '٣ – ٥', n: 0, cls: 'l3' },
            { label: '٦ – ١٠', n: 0, cls: 'l4' },
            { label: 'أكثر من ١٠', n: 0, cls: 'l5' }
        ];
        customers.forEach((c) => {
            if (c.visits <= 1) ladder[0].n++;
            else if (c.visits === 2) ladder[1].n++;
            else if (c.visits <= 5) ladder[2].n++;
            else if (c.visits <= 10) ladder[3].n++;
            else ladder[4].n++;
        });

        const pieces = customers.reduce((s, c) => s + c.pieces, 0);
        const visits = customers.reduce((s, c) => s + c.visits, 0);
        const newCount = customers.filter((c) => c.isNew).length;
        const returning = customers.filter((c) => c.visits >= 2).length;
        const avgTicket = visits ? billed / visits : 0;
        const topSpender = sortedBySpend[0] || null;

        return {
            customers,
            sortedBySpend,
            tiers,
            services: topServices,
            servicesByQty: topServicesQty,
            heat,
            heatMax,
            weekday: { list: wd, best: wdBest, worst: wdWorst },
            orderValue: oval,
            ladder,
            absent,
            absentWarn,
            absentSpend,
            days,
            months,
            billed,
            collected,
            cash,
            electronic,
            debtsTotal,
            pieces,
            visits,
            newCount,
            returning,
            avgTicket,
            topSpender,
            prevCount,
            prev,
            debtByName: debtsByName
        };
    }

    /* ---------------- SVG ---------------- */
    function areaChart(days) {
        const W = 320, H = 120, P = 6;
        const max = Math.max(1, ...days.map((d) => d.value));
        const step = (W - P * 2) / (days.length - 1);
        const pts = days.map((d, i) => {
            /* الأقدم يميناً والأحدث يساراً كي يطابق اتجاه القراءة العربي */
            const x = P + (days.length - 1 - i) * step;
            const y = H - P - (d.value / max) * (H - P * 2 - 14);
            return [x, y];
        });
        let line = '';
        pts.forEach((p, i) => {
            if (i === 0) { line += 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); return; }
            const prev = pts[i - 1];
            const cx = (prev[0] + p[0]) / 2;
            line += ' C' + cx.toFixed(1) + ' ' + prev[1].toFixed(1) + ' ' + cx.toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
        });
        const area = line + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (H - P) + ' L' + pts[0][0].toFixed(1) + ' ' + (H - P) + ' Z';
        const dots = pts.map((p, i) => {
            if (i !== pts.length - 1 && days[i].value === 0) return '';
            return '<circle class="ri-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === pts.length - 1 ? 3.2 : 2.2) + '"></circle>';
        }).join('');
        const labels = [0, 7, 13].map((i) => '<span>' + esc(prettyDay(days[i].ms)) + '</span>').join('');
        return '' +
            '<div class="ri-chart-wrap">' +
                '<div class="ri-chart-max">' + money(max) + '</div>' +
                '<svg class="ri-area" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
                    '<defs><linearGradient id="riFill" x1="0" y1="0" x2="0" y2="1">' +
                        '<stop offset="0%" stop-color="var(--rg-accent)" stop-opacity=".42"></stop>' +
                        '<stop offset="100%" stop-color="var(--rg-accent)" stop-opacity="0"></stop>' +
                    '</linearGradient></defs>' +
                    '<path class="ri-area-fill" d="' + area + '" fill="url(#riFill)"></path>' +
                    '<path class="ri-area-line" pathLength="1" d="' + line + '"></path>' +
                    dots +
                '</svg>' +
                '<div class="ri-chart-days">' + labels + '</div>' +
            '</div>';
    }

    function donut(tiers) {
        const parts = [
            { k: 'elite', label: 'النخبة', color: TIER_COLORS.elite, n: tiers.elite.length },
            { k: 'loyal', label: 'دائمون', color: TIER_COLORS.loyal, n: tiers.loyal.length },
            { k: 'fresh', label: 'جدد', color: TIER_COLORS.fresh, n: tiers.fresh.length },
            { k: 'casual', label: 'عابرون', color: TIER_COLORS.casual, n: tiers.casual.length }
        ];
        const total = parts.reduce((s, p) => s + p.n, 0) || 1;
        const R = 54, C = 2 * Math.PI * R;
        let offset = 0;
        const rings = parts.map((p) => {
            if (!p.n) return '';
            const len = (p.n / total) * C;
            const seg = '<circle class="ri-dseg" r="' + R + '" cx="75" cy="75" fill="none" stroke="' + p.color + '" stroke-width="14" ' +
                'stroke-linecap="butt" stroke-dasharray="' + Math.max(0, len - 2.5) + ' ' + (C - len + 2.5) + '" ' +
                'stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 75 75)"></circle>';
            offset += len;
            return seg;
        }).join('');
        const legend = parts.map((p) =>
            '<div class="ri-leg"><span class="ri-leg-dot" style="--c:' + p.color + '"></span>' +
            '<span class="ri-leg-l">' + p.label + '</span><span class="ri-leg-n">' + p.n + '</span>' +
            '<small>' + pct(p.n, total) + '%</small></div>'
        ).join('');
        return '' +
            '<div class="ri-donut-wrap">' +
                '<div class="ri-donut">' +
                    '<svg viewBox="0 0 150 150" aria-hidden="true">' +
                        '<circle r="' + R + '" cx="75" cy="75" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="14"></circle>' +
                        rings +
                    '</svg>' +
                    '<div class="ri-donut-mid"><strong>' + total + '</strong><span>زبون</span></div>' +
                '</div>' +
                '<div class="ri-legend">' + legend + '</div>' +
            '</div>';
    }

    function heatmap(heat, heatMax) {
        const buckets = ['قبل ٩', '٩ – ١٣', '١٣ – ١٧', 'بعد ١٧'];
        let cells = '<div class="ri-heat-row ri-heat-head"><span></span>' + buckets.map((b) => '<span>' + b + '</span>').join('') + '</div>';
        for (let d = 0; d < 7; d++) {
            cells += '<div class="ri-heat-row"><span class="ri-heat-day">' + WEEKDAYS[d] + '</span>' +
                heat[d].map((n) => {
                    const a = n === 0 ? 0 : 0.12 + (n / heatMax) * 0.7;
                    const dark = a > 0.46;
                    return '<span class="ri-heat-cell' + (dark ? ' strong' : '') + '" style="--a:' + a.toFixed(2) + '" title="' + n + ' طلب">' + (n || '') + '</span>';
                }).join('') + '</div>';
        }
        return '<div class="ri-heat">' + cells + '</div>';
    }

    const PEAK_BUCKETS = ['قبل ٩ صباحاً', '٩ صباحاً – ١ ظهراً', '١ – ٥ عصراً', 'بعد ٥ مساءً'];
    function peakLine(heat) {
        let total = 0, max = 0;
        heat.forEach((row) => row.forEach((n) => { total += n; if (n > max) max = n; }));
        if (!total || !max) return '';
        let ties = 0, pd = 0, pb = 0, found = false;
        heat.forEach((row, d) => row.forEach((n, b) => {
            if (n !== max) return;
            ties += 1;
            if (!found) { found = true; pd = d; pb = b; }
        }));
        const share = Math.round((max / total) * 100);
        return '<div class="ri-heat-peak"><i class="fa-solid fa-bullseye"></i><span>أكثر الأوقات ازدحاماً: <b>' +
            esc(WEEKDAYS[pd] + ' · ' + PEAK_BUCKETS[pb]) + '</b> — <b>' + fmt(max) + '</b> طلباً (' + share + '% من طلبات الفترة)' +
            (ties > 1 ? ' · بالتساوي مع ' + fmt(ties - 1) + ' وقت آخر' : '') + '</span></div>';
    }

    /* توزيع حجم الطلبات: شريط مقسّم + وسيط. الحدود 5/10/25 ألف تفصل
       الواقع الحالي (وسيط 5,000) بلا أن تجمع كل شيء في خانة واحدة. */
    const OVAL_BUCKETS = [
        { l: 'أقل من <span dir="ltr">5,000</span>', c: '#8b9dff' },
        { l: '<span dir="ltr">5,000 – 9,999</span>', c: '#3ddc97' },
        { l: '<span dir="ltr">10,000 – 24,999</span>', c: '#ffd166' },
        { l: '<span dir="ltr">25,000</span> وأكثر', c: 'var(--rg-accent)' }
    ];
    function orderValueCard(ov) {
        if (!ov || !ov.n) return emptyMini('لا فواتير في هذه الفترة بعد');
        const segs = ov.buckets.map((n, i) => {
            if (!n) return '';
            const w = (n / ov.n) * 100;
            return '<i style="--w:' + w.toFixed(2) + '%;--c:' + OVAL_BUCKETS[i].c + ';--i:' + i + '"></i>';
        }).join('');
        const rows = ov.buckets.map((n, i) => {
            const p = Math.round((n / ov.n) * 100);
            return '<div class="ri-ov-row">' +
                '<i class="ri-ov-dot" style="--c:' + OVAL_BUCKETS[i].c + '"></i>' +
                '<span class="ri-ov-l">' + OVAL_BUCKETS[i].l + '</span>' +
                '<b class="ri-ov-n">' + fmt(n) + '</b>' +
                '<span class="ri-ov-p" dir="ltr">' + p + '%</span>' +
            '</div>';
        }).join('');
        return '<div class="ri-ov-bar" role="img" aria-label="توزيع الفواتير حسب قيمتها">' + segs + '</div>' +
            '<div class="ri-ov-legend">' + rows + '</div>' +
            '<div class="ri-ov-foot">' +
                '<span><i class="fa-solid fa-scale-balanced"></i> وسيط الفاتورة: <b>' + money(ov.median) + '</b> — نصف الطلبات أقل منه</span>' +
                '<small>أكبر فاتورة: <b>' + money(ov.max) + '</b> من أصل <b>' + fmt(ov.n) + '</b> فاتورة</small>' +
            '</div>';
    }

    /* أعمدة أيام الأسبوع: متوسط قيمة الطلبات في اليوم الواحد، لا مجموعها،
       لأن بعض الأيام تكرر في الفترة أكثر من غيره. الأفضل مميز بلون واحد. */
    function weekdayChart(wd) {
        if (!wd || !wd.list || !wd.list.some((d) => d.bills)) return emptyMini('لا فواتير مكتملة في هذه الفترة بعد');
        if (!wd.list.some((d) => d.days)) return emptyMini('نحتاج يوماً مكتملاً واحداً على الأقل لرسم إيقاع الأسبوع');
        const max = Math.max(1, ...wd.list.map((d) => d.avg));
        const cols = wd.list.map((d) => {
            const h = d.avg > 0 ? clamp((d.avg / max) * 100, 5, 100) : 0;
            const tip = d.label + ': متوسط ' + money(d.avg) + ' · ' + fmt(d.bills) + ' فاتورة على ' + fmt(d.days) + (d.days === 1 ? ' يوم' : ' أيام');
            return '<div class="ri-wd' + (d.i === wd.best ? ' best' : '') + '" style="--i:' + d.i + '" title="' + esc(tip) + '">' +
                '<div class="ri-wd-col"><i style="--h:' + h.toFixed(1) + '%"></i></div>' +
                '<span class="ri-wd-l">' + esc(d.label) + '</span>' +
            '</div>';
        }).join('');
        const best = wd.best >= 0 ? wd.list[wd.best] : null;
        const worst = wd.worst >= 0 ? wd.list[wd.worst] : null;
        return '<div class="ri-wd-plot" role="img" aria-label="متوسط قيمة الطلبات حسب أيام الأسبوع">' + cols + '</div>' +
            (best
                ? '<div class="ri-wd-foot">' +
                    '<span class="ri-wd-best"><i class="fa-solid fa-crown"></i> أفضل يوم: <b>' + esc(best.label) + '</b> — متوسط <b>' + money(best.avg) + '</b></span>' +
                    (worst && worst.i !== best.i
                        ? '<span class="ri-wd-worst"><i class="fa-solid fa-arrow-down-long"></i> أضعف يوم: <b>' + esc(worst.label) + '</b> — <b>' + money(worst.avg) + '</b></span>'
                        : '') +
                    '<small class="ri-wd-note">الأيام المكتملة فقط — اليوم الجاري لا يُحتسب</small>' +
                  '</div>'
                : '');
    }

    /* ترتيب الخدمات: بالقيمة أو بعدد القطع («أكثر القطع سحباً») — نفس
       البطاقة، والتبديل يعيد الرسم من نفس اللقطة بلا قراءة بيانات جديدة. */
    function bars(list, mode) {
        if (!list.length) return emptyMini('لا توجد خدمات مسجّلة في هذه الفترة');
        const qtyMode = mode === 'qty';
        const max = Math.max(1, ...list.map((s) => qtyMode ? s.qty : s.rev));
        return '<div class="ri-bars">' + list.map((s, i) => {
            const v = qtyMode ? s.qty : s.rev;
            const w = clamp((v / max) * 100, 2, 100);
            return '<div class="ri-bar-row">' +
                '<div class="ri-bar-top"><span class="ri-bar-name">' + esc(s.name) + '</span><span class="ri-bar-val">' + (qtyMode ? fmt(s.qty) + ' قطعة' : money(s.rev)) + '</span></div>' +
                '<div class="ri-bar-track"><i style="--w:' + w.toFixed(1) + '%;--c:' + SERIES[i % SERIES.length] + '"></i></div>' +
                '<div class="ri-bar-sub">' + (qtyMode ? money(s.rev) : fmt(s.qty) + ' قطعة') + '</div>' +
            '</div>';
        }).join('') + '</div>';
    }

    function ladderHTML(ladder) {
        const max = Math.max(1, ...ladder.map((l) => l.n));
        return '<div class="ri-ladder">' + ladder.map((l, i) => {
            const w = clamp((l.n / max) * 100, l.n ? 3 : 0, 100);
            return '<div class="ri-lad-row">' +
                '<span class="ri-lad-l">' + l.label + '</span>' +
                '<span class="ri-lad-track"><i style="--w:' + w.toFixed(1) + '%;--c:' + SERIES[i % SERIES.length] + '"></i></span>' +
                '<span class="ri-lad-n">' + l.n + '</span>' +
            '</div>';
        }).join('') + '</div>';
    }

    /* أعمدة شهرية مزدوجة: الأخضر لجدد والأزرق لعائدين، الأقدم يميناً كبقية
       المخططات، والارتفاع نسبي إلى أعلى عمود في الأشهر الستة. */
    function monthlyChart(months) {
        if (!months || !months.length) return emptyMini('لا بيانات شهرية بعد');
        const max = Math.max(1, ...months.map((m) => Math.max(m.fresh, m.back)));
        const latest = months[months.length - 1];
        const cols = months.map((m, i) => {
            const hF = m.fresh ? clamp((m.fresh / max) * 100, 6, 100) : 0;
            const hB = m.back ? clamp((m.back / max) * 100, 6, 100) : 0;
            const tip = m.label + ': ' + m.fresh + ' جديد · ' + m.back + ' عائد';
            return '<div class="ri-mo" style="--i:' + i + '" title="' + esc(tip) + '">' +
                '<span class="ri-mo-total">' + m.total + '</span>' +
                '<div class="ri-mo-col">' +
                    '<i class="ri-mo-b fresh" style="--h:' + hF.toFixed(1) + '%"></i>' +
                    '<i class="ri-mo-b back" style="--h:' + hB.toFixed(1) + '%"></i>' +
                '</div>' +
                '<span class="ri-mo-l">' + m.label + '</span>' +
            '</div>';
        }).join('');
        return '<div class="ri-months" role="img" aria-label="زبائن جدد مقابل عائدين خلال آخر ستة أشهر">' +
                '<div class="ri-mo-plot">' + cols + '</div>' +
            '</div>' +
            '<div class="ri-mo-foot">' +
                '<span class="ri-mo-key"><i class="fresh"></i> جدد ' + latest.fresh + '</span>' +
                '<span class="ri-mo-key"><i class="back"></i> عائدون ' + latest.back + '</span>' +
                '<small>هذا الشهر</small>' +
            '</div>';
    }

    function emptyMini(text) {
        return '<div class="ri-empty-mini"><i class="fa-solid fa-chart-simple"></i><span>' + esc(text) + '</span></div>';
    }

    function rankRows(list, mode) {
        if (!list.length) return emptyMini('لا يوجد زبائن مسجّلون بعد');
        return '<div class="ri-ranks">' + list.slice(0, 5).map((c, i) => {
            const val = mode === 'visits' ? (c.visits + ' زيارة') : money(c.spent);
            const sub = mode === 'visits'
                ? (fmt(c.pieces) + ' قطعة · ' + money(c.avg) + ' متوسط')
                : (c.visits + ' زيارة · ' + fmt(c.pieces) + ' قطعة');
            return '<button type="button" class="ri-rank" data-customer="' + esc(c.name) + '">' +
                '<span class="ri-rank-n">' + (i + 1) + '</span>' +
                '<span class="ri-av">' + esc(initial(c.name)) + '</span>' +
                '<span class="ri-rank-body"><strong>' + esc(c.name) + '</strong><small>' + sub + '</small></span>' +
                '<span class="ri-rank-v">' + val + '</span>' +
            '</button>';
        }).join('') + '</div>';
    }

    function absentRows(list) {
        return '<div class="ri-absent-list">' + list.slice(0, 5).map((c) =>
            '<button type="button" class="ri-absent-row" data-customer="' + esc(c.name) + '" data-alltime="1">' +
                '<span class="ri-av">' + esc(initial(c.name)) + '</span>' +
                '<span class="ri-absent-body"><strong>' + esc(c.name) + '</strong>' +
                    '<small><i class="fa-solid fa-hourglass-half"></i> غاب ' + fmt(c.days) + ' يوماً · ' + visitsWord(c.visits) + '</small></span>' +
                '<span class="ri-absent-v">' + money(c.spent) + '</span>' +
            '</button>'
        ).join('') + '</div>';
    }

    function initial(name) {
        const s = String(name || '').trim();
        return s ? s.slice(0, 1) : '؟';
    }

    function directory(customers, filter, query, allTime, sort, limit) {
        let list = customers.slice().sort((a, b) => {
            if (sort === 'visits') return b.visits - a.visits || b.spent - a.spent;
            if (sort === 'recent') return (b.lastTs || 0) - (a.lastTs || 0) || b.spent - a.spent;
            return b.spent - a.spent;
        });
        if (filter === 'elite') list = list.filter((c) => c.visits >= 3 || c.spent > 0).slice(0, Math.max(3, Math.ceil(list.length * 0.2)));
        if (filter === 'debt') list = list.filter((c) => c.debt > 0);
        if (filter === 'new') list = list.filter((c) => c.isNew);
        const q = String(query || '').trim().toLowerCase();
        if (q) list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q));
        if (!list.length) return emptyMini(q ? 'لا نتائج لهذا البحث' : 'لا يوجد زبائن في هذه الفئة');
        const cap = Math.max(40, Number(limit) || 40);
        const shown = list.slice(0, cap);
        const scope = allTime ? ' data-alltime="1"' : '';
        return '<div class="ri-dir">' + shown.map((c) =>
            '<button type="button" class="ri-dir-row" data-customer="' + esc(c.name) + '"' + scope + '>' +
                '<span class="ri-av">' + esc(initial(c.name)) + '</span>' +
                '<span class="ri-dir-body"><strong>' + esc(c.name) + (c.isNew ? '<i class="ri-badge-new">جديد</i>' : '') + '</strong>' +
                '<small>' + (c.phone ? esc(c.phone) : 'بلا رقم') + ' · ' + c.visits + ' زيارة · ' + fmt(c.pieces) + ' قطعة</small></span>' +
                '<span class="ri-dir-end"><strong>' + money(c.spent) + '</strong>' +
                (c.debt > 0 ? '<small class="ri-debt">دين ' + money(c.debt) + '</small>' : '<small>' + esc(c.fav || '') + '</small>') + '</span>' +
            '</button>'
        ).join('') + (list.length > shown.length
            ? '<button type="button" class="ri-dir-more" data-dir-more="1"><i class="fa-solid fa-chevron-down"></i> عرض المزيد · المتبقي ' + fmt(list.length - shown.length) + '</button>'
            : (list.length > 40 ? '<div class="ri-more-note">عُرض كل الزبائن · ' + fmt(list.length) + '</div>' : '')) + '</div>';
    }

    /* ---------------- الهيكل ---------------- */
    function kpi(icon, label, value, sub, tone) {
        return '<div class="ri-kpi" style="--tone:' + (tone || 'var(--rg-accent)') + '">' +
            '<span class="ri-kpi-i"><i class="fa-solid ' + icon + '"></i></span>' +
            '<span class="ri-kpi-l">' + label + '</span>' +
            '<strong class="ri-kpi-v" data-count="' + num(value) + '">' + value + '</strong>' +
            '<small class="ri-kpi-s">' + sub + '</small>' +
        '</div>';
    }

    let cachedVm = null;

    function cmpDelta(now, was) {
        if (!was) {
            return now > 0
                ? '<span class="ri-cmp-d up"><i class="fa-solid fa-arrow-trend-up"></i> جديد</span>'
                : '<span class="ri-cmp-d flat">—</span>';
        }
        const d = Math.round(((now - was) / was) * 100);
        const cls = d > 0 ? 'up' : (d < 0 ? 'down' : 'flat');
        return '<span class="ri-cmp-d ' + cls + '"><i class="fa-solid fa-arrow-trend-' + (d < 0 ? 'down' : 'up') + '"></i> ' +
            '<span dir="ltr">' + (d > 0 ? '+' : '') + d + '%</span></span>';
    }

    function cmpRow(label, now, was, isMoney) {
        const max = Math.max(now, was, 1);
        return '<div class="ri-cmp-row">' +
            '<div class="ri-cmp-top"><span class="ri-cmp-l">' + label + '</span>' + cmpDelta(now, was) + '</div>' +
            '<div class="ri-cmp-nums"><strong>' + (isMoney ? money(now) : fmt(now)) + '</strong>' +
                '<small>سابقاً <b>' + (isMoney ? money(was) : fmt(was)) + '</b></small></div>' +
            '<div class="ri-cmp-bars" aria-hidden="true">' +
                '<span class="ri-cmp-bar was"><i style="--w:' + Math.round((was / max) * 100) + '%"></i></span>' +
                '<span class="ri-cmp-bar now"><i style="--w:' + Math.round((now / max) * 100) + '%"></i></span>' +
            '</div>' +
        '</div>';
    }

    function compareCard(vm) {
        if (!vm.prev) return '';
        const period = PERIODS.find((p) => p.k === state.period) || PERIODS[2];
        const span = period.days === 1 ? 'مقابل أمس' : 'مقابل ' + period.label + ' قبلها';
        const was = vm.prev;
        const ret = was.customers ? Math.round((was.retained / was.customers) * 100) : 0;
        return '<div class="ri-card ri-card-cmp">' +
            '<div class="ri-card-head"><h3><i class="fa-solid fa-code-compare"></i> مقارنة بالفترة السابقة</h3><span>' + span + '</span></div>' +
            '<div class="ri-cmp">' +
                cmpRow('قيمة الطلبات', vm.billed, was.billed, true) +
                cmpRow('الفواتير', vm.visits, was.visits, false) +
                cmpRow('الزبائن', vm.customers.length, was.customers, false) +
                cmpRow('زبائن جدد', vm.newCount, was.newCount, false) +
            '</div>' +
            '<div class="ri-cmp-ret">' +
                '<div class="ri-cmp-ret-top"><span><i class="fa-solid fa-arrow-rotate-left"></i> احتفاظ الزبائن</span><strong>' + ret + '%</strong></div>' +
                '<div class="ri-cmp-ret-bar" aria-hidden="true"><i style="--w:' + ret + '%"></i></div>' +
                '<small>عاد <b>' + fmt(was.retained) + '</b> من أصل <b>' + fmt(was.customers) + '</b> من زبائن الفترة السابقة وسجّلوا فواتير في هذه الفترة.</small>' +
            '</div>' +
        '</div>';
    }

    function renderRoot(root, vm) {
        cachedVm = vm;
        const period = PERIODS.find((p) => p.k === state.period) || PERIODS[2];
        const delta = vm.prevCount > 0 ? Math.round(((vm.customers.length - vm.prevCount) / vm.prevCount) * 100) : null;
        const deltaCls = delta == null ? 'flat' : (delta >= 0 ? 'up' : 'down');
        const deltaTxt = delta == null ? 'لا مقارنة' : (delta >= 0 ? '+' + delta + '%' : delta + '%');
        const topShare = vm.topSpender && vm.billed > 0 ? Math.round((vm.topSpender.spent / vm.billed) * 100) : 0;
        const maxSpender = vm.sortedBySpend[0] || null;
        /* البحث في الدليل يتجاوز الفترة المختارة: من يبحث عن زبون قديم يجب أن
           يجده ولو لم يزر هذا الشهر؛ الافتراضي بلا بحث يبقى زبائن الفترة. */
        const searchAll = !!String(state.query || '').trim();
        const dirSeed = searchAll ? build(0) : null;

        root.innerHTML =
        '<div class="ri-sheet-top">' +
            '<div class="ri-hero">' +
                '<div class="ri-hero-top">' +
                    '<div>' +
                        '<span class="ri-kicker"><i class="fa-solid fa-chart-line"></i> تحليل حيّ</span>' +
                        '<h2 class="ri-title">مركز الزبائن</h2>' +
                        '<p class="ri-sub">قراءة بصرية لسلوك زبائن المكوى — من فواتيرك، بلا أي تعديل.</p>' +
                    '</div>' +
                    '<button type="button" class="ri-export" id="ri-export" aria-label="تصدير الزبائن CSV"><i class="fa-solid fa-file-csv"></i></button>' +
                '</div>' +
                '<div class="ri-chips" role="tablist">' +
                    PERIODS.map((p) => '<button type="button" role="tab" aria-selected="' + (p.k === state.period) + '" class="' + (p.k === state.period ? 'on' : '') + '" data-period="' + p.k + '">' + p.label + '</button>').join('') +
                '</div>' +
                '<div class="ri-hero-mid">' +
                    '<div class="ri-hero-num"><strong data-count="' + vm.customers.length + '">' + fmt(vm.customers.length) + '</strong><span>زبوناً في ' + period.label + '</span></div>' +
                    '<span class="ri-delta ' + deltaCls + '"><i class="fa-solid fa-arrow-trend-' + (delta != null && delta < 0 ? 'down' : 'up') + '"></i> ' + deltaTxt + '</span>' +
                '</div>' +
                '<div class="ri-hero-foot"><i class="fa-solid fa-crown"></i> ' +
                    (maxSpender ? 'الأكثر إنفاقاً: <b>' + esc(maxSpender.name) + '</b> — ' + money(maxSpender.spent) + ' (' + topShare + '% من قيمة الطلبات)' : 'ستظهر هنا نخبة زبائنك بعد أول فاتورة.') +
                '</div>' +
            '</div>' +

            '<div class="ri-kpis">' +
                kpi('fa-user-plus', 'زبائن جدد', fmt(vm.newCount), 'أول زيارة ضمن الفترة', 'var(--rg-accent)') +
                kpi('fa-rotate', 'عائدون', fmt(vm.returning), 'أكثر من زيارة', '#8b9dff') +
                kpi('fa-receipt', 'متوسط الفاتورة', money(vm.avgTicket), fmt(vm.visits) + ' فاتورة', '#3ddc97') +
                kpi('fa-shirt', 'القطع المعالجة', fmt(vm.pieces), 'مجموع القطع', '#ffd166') +
            '</div>' +

            '<div class="ri-money">' +
                '<div class="ri-money-i"><span>قيمة الطلبات</span><strong>' + money(vm.billed) + '</strong></div>' +
                '<div class="ri-money-i"><span>المستلَم</span><strong>' + money(vm.collected) + '</strong><small>عربون + دفعات</small></div>' +
                '<div class="ri-money-i warn"><span>ذمم قائمة</span><strong>' + money(vm.debtsTotal) + '</strong><small>كل الفترات</small></div>' +
            '</div>' +

            compareCard(vm) +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-wave-square"></i> حركة الإيراد</h3><span>آخر ١٤ يوماً</span></div>' +
                areaChart(vm.days) +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-scale-balanced"></i> حجم الطلبات</h3><span>قيمة الفاتورة</span></div>' +
                orderValueCard(vm.orderValue) +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-chart-pie"></i> شرائح الزبائن</h3><span>حسب السلوك</span></div>' +
                donut(vm.tiers) +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-chart-column"></i> جدد مقابل عائدين</h3><span>آخر ' + monthsLabel(vm.months.length) + '</span></div>' +
                monthlyChart(vm.months) +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head ri-card-head-seg"><h3><i class="fa-solid fa-layer-group"></i> أعلى الخدمات</h3>' +
                    '<div class="ri-svc-seg" role="group" aria-label="ترتيب الخدمات">' +
                        '<button type="button" data-svc="rev" aria-pressed="' + (state.svcMode !== 'qty') + '" class="' + (state.svcMode !== 'qty' ? 'on' : '') + '">قيمة</button>' +
                        '<button type="button" data-svc="qty" aria-pressed="' + (state.svcMode === 'qty') + '" class="' + (state.svcMode === 'qty' ? 'on' : '') + '">قطع</button>' +
                    '</div>' +
                '</div>' +
                '<div id="ri-svc-host">' + bars(state.svcMode === 'qty' ? vm.servicesByQty : vm.services, state.svcMode) + '</div>' +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-fire"></i> أوقات الذروة</h3><span>عدد الطلبات</span></div>' +
                heatmap(vm.heat, vm.heatMax) +
                peakLine(vm.heat) +
            '</div>' +

            (period.days !== 1
                ? '<div class="ri-card">' +
                    '<div class="ri-card-head"><h3><i class="fa-solid fa-calendar-week"></i> إيقاع الأسبوع</h3><span>متوسط اليوم</span></div>' +
                    weekdayChart(vm.weekday) +
                  '</div>'
                : '') +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-stairs"></i> مدرّج الولاء</h3><span>عدد الزيارات</span></div>' +
                ladderHTML(vm.ladder) +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-user-clock"></i> زبائن غائبون</h3><span>٢١ يوماً بلا زيارة</span></div>' +
                (vm.absent.length
                    ? '<div class="ri-absent-note">' +
                        '<span><b>' + fmt(vm.absent.length) + '</b> من الزبائن غابوا ٢١ يوماً أو أكثر' +
                            (vm.absent.length - vm.absentWarn > 0 ? ' — <b>' + fmt(vm.absent.length - vm.absentWarn) + '</b> غيابهم تجاوز الشهر' : '') +
                            ' · إنفاقهم التاريخي <b>' + money(vm.absentSpend) + '</b></span>' +
                        '<span class="ri-absent-meter" aria-hidden="true"><i class="hot" style="width:' + pct(vm.absent.length - vm.absentWarn, vm.absent.length) + '%"></i><i class="warm"></i></span>' +
                      '</div>' + absentRows(vm.absent)
                    : emptyMini('لا غائبين — كل من زار مرتين عاد خلال ٢١ يوماً')) +
                (vm.absent.length > 5 ? '<div class="ri-absent-more">و' + fmt(vm.absent.length - 5) + ' آخرون — افتح دليل الزبائن للبحث بالاسم</div>' : '') +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-sack-dollar"></i> قائمة النخبة</h3><span>أعلى إنفاقاً</span></div>' +
                rankRows(vm.sortedBySpend, 'spend') +
            '</div>' +

            '<div class="ri-card">' +
                '<div class="ri-card-head"><h3><i class="fa-solid fa-shoe-prints"></i> الأكثر ولاءً</h3><span>أكثر زيارة</span></div>' +
                rankRows(vm.customers.slice().sort((a, b) => b.visits - a.visits), 'visits') +
            '</div>' +

            '<div class="ri-card ri-card-dir">' +
                '<div class="ri-card-head ri-card-head-seg"><h3><i class="fa-solid fa-address-book"></i> دليل الزبائن</h3>' +
                    '<div class="ri-dir-tools"><span class="ri-dir-count">' + fmt(vm.customers.length) + '</span>' +
                        '<div class="ri-svc-seg ri-dir-seg" role="group" aria-label="ترتيب الدليل">' +
                            '<button type="button" data-dirsort="spend" aria-pressed="' + (state.dirSort === 'spend') + '" class="' + (state.dirSort === 'spend' ? 'on' : '') + '">إنفاق</button>' +
                            '<button type="button" data-dirsort="visits" aria-pressed="' + (state.dirSort === 'visits') + '" class="' + (state.dirSort === 'visits' ? 'on' : '') + '">زيارات</button>' +
                            '<button type="button" data-dirsort="recent" aria-pressed="' + (state.dirSort === 'recent') + '" class="' + (state.dirSort === 'recent' ? 'on' : '') + '">الأحدث</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="ri-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="ri-search" placeholder="ابحث باسم الزبون أو رقمه…" value="' + esc(state.query) + '"></div>' +
                '<div class="ri-search-scope" id="ri-search-scope"' + (searchAll ? '' : ' hidden') + '><i class="fa-solid fa-clock-rotate-left"></i> البحث يشمل كل الفترات</div>' +
                '<div class="ri-filters">' +
                    '<button type="button" data-filter="all" class="' + (state.filter === 'all' ? 'on' : '') + '">الكل</button>' +
                    '<button type="button" data-filter="elite" class="' + (state.filter === 'elite' ? 'on' : '') + '">النخبة</button>' +
                    '<button type="button" data-filter="debt" class="' + (state.filter === 'debt' ? 'on' : '') + '">مدينون</button>' +
                    '<button type="button" data-filter="new" class="' + (state.filter === 'new' ? 'on' : '') + '">جدد</button>' +
                '</div>' +
                '<div id="ri-dir-host">' + directory((dirSeed || vm).customers, state.filter, state.query, searchAll, state.dirSort, state.dirLimit) + '</div>' +
            '</div>' +

            '<div class="ri-foot"><i class="fa-solid fa-shield-halved"></i> أرقام من الفواتير المسجلة فقط — قراءة لا تعديل · آخر تحديث ' + nowLabel() + '</div>' +
        '</div>';

        const host = root;
        [...host.children].forEach((el, i) => {
            el.style.setProperty('--ri-k', String(i));
            el.classList.add('ri-in');
        });
        if (motionOff()) host.classList.add('ri-no-motion');
        countUpAll(host);
        bindRoot(host);
    }

    function countUpAll(host) {
        if (motionOff()) return;
        host.querySelectorAll('[data-count]').forEach((el) => {
            const end = num(el.getAttribute('data-count'));
            if (!end) return;
            const isMoney = false;
            const start = 0;
            const t0 = performance.now();
            const dur = motionSoft() ? 450 : 760;
            const step = (t) => {
                const k = clamp((t - t0) / dur, 0, 1);
                const e = 1 - Math.pow(1 - k, 3);
                el.textContent = isMoney ? money(start + (end - start) * e) : fmt(start + (end - start) * e);
                if (k < 1) requestAnimationFrame(step);
                else el.textContent = isMoney ? money(end) : fmt(end);
            };
            requestAnimationFrame(step);
        });
    }

    /* ---------------- التفاعل ---------------- */
    function bindRoot(host) {
        if (host.dataset.riBound === '1') return;
        host.dataset.riBound = '1';
        const paintDir = () => {
            const searching = !!String(state.query || '').trim();
            const vm = searching ? build(0) : cachedVm;
            if (!vm) return;
            const dirHost = document.getElementById('ri-dir-host');
            if (dirHost) dirHost.innerHTML = directory(vm.customers, state.filter, state.query, searching, state.dirSort, state.dirLimit);
        };
        host.addEventListener('click', (e) => {
            const period = e.target.closest('[data-period]');
            if (period) {
                const k = period.getAttribute('data-period');
                if (k === state.period) return;
                state.period = k;
                state.dirLimit = 40;
                draw(true);
                return;
            }
            const filter = e.target.closest('[data-filter]');
            if (filter) {
                state.filter = filter.getAttribute('data-filter');
                state.dirLimit = 40;
                paintDir();
                host.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('on', b.getAttribute('data-filter') === state.filter));
                return;
            }
            const sortBtn = e.target.closest('[data-dirsort]');
            if (sortBtn) {
                const k = sortBtn.getAttribute('data-dirsort');
                if (k === state.dirSort) return;
                state.dirSort = k;
                state.dirLimit = 40;
                paintDir();
                host.querySelectorAll('[data-dirsort]').forEach((b) => {
                    const on = b.getAttribute('data-dirsort') === state.dirSort;
                    b.classList.toggle('on', on);
                    b.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
                return;
            }
            if (e.target.closest('[data-dir-more]')) {
                state.dirLimit += 40;
                paintDir();
                return;
            }
            if (e.target.closest('#ri-export')) { exportCSV(); return; }
            const svc = e.target.closest('[data-svc]');
            if (svc) {
                const mode = svc.getAttribute('data-svc');
                if ((mode === 'qty' ? 'qty' : 'rev') === state.svcMode || !cachedVm) return;
                state.svcMode = mode === 'qty' ? 'qty' : 'rev';
                const svcHost = document.getElementById('ri-svc-host');
                if (svcHost) {
                    svcHost.innerHTML = bars(state.svcMode === 'qty' ? cachedVm.servicesByQty : cachedVm.services, state.svcMode);
                    svcHost.classList.remove('ri-svc-pop');
                    void svcHost.offsetWidth;
                    svcHost.classList.add('ri-svc-pop');
                }
                host.querySelectorAll('[data-svc]').forEach((b) => {
                    const on = b.getAttribute('data-svc') === state.svcMode;
                    b.classList.toggle('on', on);
                    b.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
                return;
            }
            const cust = e.target.closest('[data-customer]');
            if (cust) openCustomer(cust.getAttribute('data-customer'), cust.getAttribute('data-alltime') === '1');
        });

        host.addEventListener('input', (e) => {
            if (!e.target || e.target.id !== 'ri-search') return;
            state.query = e.target.value;
            state.dirLimit = 40;
            paintDir();
            const searching = !!state.query.trim();
            const scope = document.getElementById('ri-search-scope');
            if (scope) scope.hidden = !searching;
        });
    }

    function periodDays() {
        const p = PERIODS.find((x) => x.k === state.period) || PERIODS[2];
        return p.days;
    }

    /* ---------------- ورقة الزبون ---------------- */
    function closeSheet() {
        const sheet = document.querySelector('.ri-sheet');
        if (!sheet) return;
        sheet.classList.add('out');
        document.body.classList.remove('ri-sheet-open');
        setTimeout(() => sheet.remove(), 320);
        state.sheetCustomer = null;
    }

    function telDigits(raw) {
        return String(raw || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    }

    /* الرقم المحلي العراقي 07… لا يفتح واتساب؛ نحوّله إلى 9647… */
    function waNumber(raw) {
        let d = String(raw || '').replace(/\D/g, '');
        if (!d) return '';
        if (d.indexOf('00') === 0) d = d.slice(2);
        if (d.indexOf('964') === 0) return d;
        if (d.charAt(0) === '0') return '964' + d.slice(1);
        if (d.length === 10 && d.charAt(0) === '7') return '964' + d;
        return d;
    }

    function copyPlain(text) {
        const fallback = () => new Promise((resolve, reject) => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:-1000px;left:0;opacity:0;';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            if (ok) resolve(); else reject(new Error('copy'));
        });
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text).catch(fallback);
            }
        } catch (e) {}
        return fallback();
    }

    function openCustomer(name, allTime) {
        const vm = build(allTime ? 0 : periodDays());
        if (!vm) return;
        const c = vm.customers.find((x) => x.name === name);
        if (!c) return;
        state.sheetCustomer = name;
        const existing = document.querySelector('.ri-sheet');
        if (existing) existing.remove();
        const list = c.invoices.slice().sort((a, b) => tsOf(b) - tsOf(a)).slice(0, 12);
        const favs = Object.keys(c.items).sort((a, b) => c.items[b].qty - c.items[a].qty).slice(0, 4)
            .map((k) => '<span class="ri-chip">' + esc(k) + ' · ' + c.items[k].qty + '</span>').join('');

        /* ملف الزبون يحكي قصته كاملة: إجمالي مدى الحياة وحركة آخر ستة أشهر
           محسوبان من كل فواتيره لا من فترة التبويب، لأن الفتح من قائمة
           «النخبة» أو «الغائبين» لا يعني أن هذه هي كل زياراته. */
        const allInv = (readData() || { invoices: [] }).invoices;
        const mine = allInv.filter((i) => isNamed(i) && String(i.customer.name).trim() === name);
        let lifeSpent = 0, lifePieces = 0;
        mine.forEach((inv) => {
            lifeSpent += num(inv.total);
            (Array.isArray(inv.items) ? inv.items : []).forEach((it) => { lifePieces += num(it.qty) || 1; });
        });
        const tk = typeof window.royalTodayKey === 'function' ? window.royalTodayKey() : dateOfMs(Date.now());
        const tp = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(tk));
        const baseDay = tp ? new Date(+tp[1], +tp[2] - 1, +tp[3], 12) : new Date();
        const cm = [];
        for (let i = 5; i >= 0; i--) {
            const f = new Date(baseDay.getFullYear(), baseDay.getMonth() - i, 1, 0, 0, 0);
            cm.push({ key: f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0'), label: shortMonth(f.getMonth()), spent: 0, visits: 0 });
        }
        const cmMap = {};
        cm.forEach((m) => { cmMap[m.key] = m; });
        mine.forEach((inv) => {
            const t = tsOf(inv);
            if (!t) return;
            const m = cmMap[dateOfMs(t).slice(0, 7)];
            if (!m) return;
            m.spent += num(inv.total);
            m.visits += 1;
        });
        /* نعرض الأشهر الستة كاملة حتى لو غاب الزبون: الفراغ نفسه معلومة. */
        const cMonths = cm;
        const cmMax = Math.max(1, ...cMonths.map((m) => m.spent));
        const cmNow = dateOfMs(baseDay.getTime()).slice(0, 7);
        const cmVisits = cMonths.reduce((s, m) => s + m.visits, 0);
        const cmSpent = cMonths.reduce((s, m) => s + m.spent, 0);
        const monthsHTML = cmVisits
            ? '<div class="ri-cm-bars">' + cMonths.map((m, k) =>
                '<span class="ri-cm' + (m.key === cmNow ? ' on' : '') + '">' +
                    '<span class="ri-cm-track"><i style="--h:' + Math.round((m.spent / cmMax) * 100) + '%;--d:' + (k * 0.04).toFixed(2) + 's"></i></span>' +
                    '<small>' + m.label + '</small>' +
                '</span>').join('') + '</div>' +
                '<p class="ri-cm-sum">مجموع ٦ أشهر: <b>' + money(cmSpent) + '</b> · ' + fmt(cmVisits) + ' زيارة</p>'
            : '<div class="ri-cm-empty">لا فواتير خلال الأشهر الستة الأخيرة</div>';
        const lifeStrip = allTime ? '' :
            '<div class="ri-cust-life"><i class="fa-solid fa-infinity"></i><span>مدى الحياة: <b>' + fmt(mine.length) + '</b> زيارة · <b>' + fmt(lifePieces) + '</b> قطعة · <b>' + money(lifeSpent) + '</b></span></div>';
        const rows = list.length ? list.map((inv) => {
            const st = inv.type === 'active' ? 'قيد العمل' : (inv.paymentType === 'credit' ? 'آجل' : 'مكتمل');
            return '<div class="ri-inv">' +
                '<span class="ri-inv-n">#' + esc(inv.dailyNumber || inv.id) + '</span>' +
                '<span class="ri-inv-d">' + esc(inv.date || '') + '</span>' +
                '<span class="ri-inv-t">' + money(inv.total) + '</span>' +
                '<span class="ri-inv-s">' + st + '</span>' +
            '</div>';
        }).join('') : emptyMini('لا فواتير لهذا الزبون ضمن الفترة المحددة');

        const sheet = document.createElement('div');
        sheet.className = 'ri-sheet';
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-label', 'ملف الزبون ' + name);
        const tel = telDigits(c.phone);
        const wa = waNumber(c.phone);
        const actions = tel ? '<div class="ri-cust-act">' +
            '<a class="ri-act-call" href="tel:' + esc(tel) + '"><i class="fa-solid fa-phone"></i><span>اتصال</span></a>' +
            (wa ? '<a class="ri-act-wa" href="https://wa.me/' + esc(wa) + '" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i><span>واتساب</span></a>' : '') +
            '<button type="button" class="ri-act-copy" data-copy-phone="' + esc(String(c.phone || '')) + '"><i class="fa-solid fa-copy"></i><span>نسخ الرقم</span></button>' +
        '</div>' : '';
        sheet.innerHTML =
            '<div class="ri-sheet-scrim" data-close></div>' +
            '<div class="ri-sheet-card">' +
                '<div class="ri-sheet-grip"></div>' +
                '<button type="button" class="ri-sheet-x" data-close aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>' +
                '<div class="ri-cust-head">' +
                    '<span class="ri-av big">' + esc(initial(c.name)) + '</span>' +
                    '<div><h3>' + esc(c.name) + '</h3>' +
                    '<p>' + (c.phone ? '<a href="tel:' + esc(tel) + '"><i class="fa-solid fa-phone"></i> ' + esc(c.phone) + '</a>' : 'بلا رقم هاتف') + '</p></div>' +
                '</div>' +
                actions +
                '<div class="ri-cust-stats">' +
                    '<div><strong>' + money(c.spent) + '</strong><span>قيمة الطلبات</span></div>' +
                    '<div><strong>' + c.visits + '</strong><span>زيارة</span></div>' +
                    '<div><strong>' + fmt(c.pieces) + '</strong><span>قطعة</span></div>' +
                    '<div><strong>' + money(c.avg) + '</strong><span>متوسط الفاتورة</span></div>' +
                '</div>' +
                (c.debt > 0 ? '<div class="ri-cust-debt"><i class="fa-solid fa-triangle-exclamation"></i> دين قائم: <b>' + money(c.debt) + '</b></div>' : '') +
                lifeStrip +
                '<div class="ri-cust-trend">' +
                    '<h4><span>حركة الشراء</span><small>آخر ٦ أشهر</small></h4>' +
                    monthsHTML +
                '</div>' +
                '<div class="ri-cust-meta">' +
                    '<span><i class="fa-solid fa-calendar-plus"></i> أول زيارة: ' + esc(prettyDay(c.firstTs)) + '</span>' +
                    '<span><i class="fa-solid fa-clock-rotate-left"></i> آخر زيارة: ' + (c.lastTs ? esc(prettyDay(c.lastTs)) : '—') + '</span>' +
                    '<span><i class="fa-solid fa-star"></i> الأكثر طلباً: ' + esc(c.fav || '—') + '</span>' +
                '</div>' +
                (favs ? '<div class="ri-cust-chips">' + favs + '</div>' : '') +
                '<div class="ri-cust-inv"><h4>آخر الفواتير</h4>' + rows + '</div>' +
            '</div>';
        document.body.appendChild(sheet);
        document.body.classList.add('ri-sheet-open');
        requestAnimationFrame(() => sheet.classList.add('on'));
        sheet.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('[data-copy-phone]');
            if (copyBtn) {
                const label = copyBtn.querySelector('span');
                copyPlain(copyBtn.getAttribute('data-copy-phone') || '').then(() => {
                    copyBtn.classList.add('ok');
                    if (label) label.textContent = 'تم النسخ';
                    setTimeout(() => {
                        copyBtn.classList.remove('ok');
                        if (label) label.textContent = 'نسخ الرقم';
                    }, 1600);
                }).catch(() => {
                    copyBtn.classList.add('bad');
                    if (label) label.textContent = 'تعذّر النسخ';
                    setTimeout(() => {
                        copyBtn.classList.remove('bad');
                        if (label) label.textContent = 'نسخ الرقم';
                    }, 1600);
                });
                return;
            }
            if (e.target.closest('[data-close]')) closeSheet();
        });
    }

    /* ---------------- التصدير ---------------- */
    function exportCSV() {
        const vm = build(periodDays());
        if (!vm) return;
        const head = ['الاسم', 'الهاتف', 'الزيارات', 'القطع', 'قيمة الطلبات', 'متوسط الفاتورة', 'أول زيارة', 'آخر زيارة', 'الدين القائم'];
        const rows = vm.customers.slice().sort((a, b) => b.spent - a.spent).map((c) => [
            c.name, c.phone || '', c.visits, c.pieces, Math.round(c.spent), Math.round(c.avg),
            dateOfMs(c.firstTs), c.lastTs ? dateOfMs(c.lastTs) : '', Math.round(c.debt)
        ]);
        const csv = '\ufeff' + [head].concat(rows).map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        try {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'royal-customers-' + dateOfMs(Date.now()) + '.csv';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        } catch (e) {}
    }

    /* ---------------- دورة الرسم ---------------- */
    function signature() {
        const d = readData();
        if (!d) return '';
        const lastTs = d.invoices.reduce((m, i) => Math.max(m, tsOf(i)), 0);
        return [d.invoices.length, lastTs, d.payments.length, d.debts.length].join(':');
    }

    function draw(force) {
        const sec = document.getElementById(SEC_ID);
        if (!sec) return;
        let host = sec.querySelector('.ri-root');
        if (!host) {
            host = document.createElement('div');
            host.className = 'ri-root';
            sec.insertBefore(host, sec.firstChild);
        }
        if (!sec.classList.contains('ri-on')) sec.classList.add('ri-on');
        const sig = signature();
        if (!force && state.rendered && sig === state.signature) return;
        const vm = build(periodDays());
        if (!vm) return;
        state.signature = sig;
        state.rendered = true;
        const scroll = sec.scrollTop;
        const active = document.activeElement;
        const focusSearch = active && active.id === 'ri-search';
        const caret = focusSearch ? active.selectionStart : null;
        renderRoot(host, vm);
        if (scroll) sec.scrollTop = scroll;
        if (focusSearch) {
            const s = host.querySelector('#ri-search');
            if (s) { s.focus({ preventScroll: true }); try { s.setSelectionRange(caret, caret); } catch (e) {} }
        }
    }

    function ensureHook() {
        const sec = document.getElementById(SEC_ID);
        if (!sec || sec.dataset.riObs === '1') return;
        sec.dataset.riObs = '1';
        new MutationObserver(() => {
            if (!sec.classList.contains('active')) { closeSheet(); return; }
            draw(false);
        }).observe(sec, { attributes: true, attributeFilter: ['class'] });
        if (sec.classList.contains('active')) draw(false);
    }

    function tick() {
        const sec = document.getElementById(SEC_ID);
        if (!sec || !sec.classList.contains('active') || document.hidden) return;
        draw(false);
    }

    function boot() {
        ensureHook();
        setInterval(ensureHook, 1200);
        setInterval(tick, 4000);
        window.addEventListener('online', () => draw(true), { passive: true });
        window.addEventListener('focus', () => { if (document.getElementById(SEC_ID)?.classList.contains('active')) draw(false); });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && document.getElementById(SEC_ID)?.classList.contains('active')) draw(false);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
    window.RoyalInsight = {
        refresh: () => draw(true),
        state,
        /* البحث السريع يفتح ملف الزبون من أي فترة، لا من الفترة المعروضة وحدها */
        openCustomer: (name) => openCustomer(String(name == null ? '' : name), true)
    };

    /* ---------------- الأنماط ---------------- */
    const CSS = `
html.is-mobile #admin-customers.ri-on > *:not(.ri-root) { display: none !important; }
html.is-mobile .ri-root {
    --ri-card: rgba(var(--rg-glass-rgb), var(--rg-glass-a));
    --ri-line: var(--m-hair);
    color: var(--m-text);
    padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));
}
html.is-mobile body.rg-light .ri-root { --ri-card: rgba(255,255,255,.78); }
html.is-mobile .ri-root * { box-sizing: border-box; }
html.is-mobile .ri-root button { font-family: inherit; -webkit-tap-highlight-color: transparent; }

html.is-mobile .ri-hero {
    position: relative;
    overflow: hidden;
    border-radius: var(--m-radius-card);
    border: 1px solid var(--m-edge);
    background:
        radial-gradient(120% 100% at 88% -20%, rgba(var(--rg-accent-rgb), .34), transparent 62%),
        radial-gradient(100% 80% at 0% 110%, rgba(139,157,255,.20), transparent 64%),
        linear-gradient(152deg, rgba(255,255,255,.14), rgba(255,255,255,.02) 46%, rgba(255,255,255,.07)),
        var(--ri-card);
    box-shadow: var(--m-lift);
    padding: 18px 16px 14px;
    margin-bottom: 12px;
    isolation: isolate;
}
html.is-mobile body.rg-light .ri-hero {
    background:
        radial-gradient(120% 100% at 88% -20%, rgba(var(--rg-accent-rgb), .18), transparent 62%),
        radial-gradient(100% 80% at 0% 110%, rgba(139,157,255,.12), transparent 64%),
        linear-gradient(152deg, rgba(255,255,255,.98), rgba(255,255,255,.62)),
        var(--ri-card);
}
html.is-mobile .ri-hero::after {
    content: "";
    position: absolute; inset: -60% -30% auto -30%;
    height: 120%;
    background: radial-gradient(60% 50% at 60% 0%, rgba(255,255,255,.16), transparent 70%);
    pointer-events: none; z-index: -1;
}
html.is-mobile .ri-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
html.is-mobile .ri-kicker {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10.5px; font-weight: 900; letter-spacing: .6px;
    color: var(--m-accent2);
}
html.is-mobile .ri-title { margin: 4px 0 3px; font-size: 26px; font-weight: 900; letter-spacing: -.2px; color: var(--m-text); }
html.is-mobile .ri-sub { margin: 0; font-size: 11.5px; line-height: 1.6; font-weight: 600; color: var(--m-muted); max-width: 240px; }
html.is-mobile .ri-export {
    flex: none;
    width: 38px; height: 38px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 12px;
    border: 1px solid var(--m-edge);
    background: rgba(var(--rg-glass-rgb), calc(var(--rg-glass-a) * .9));
    color: var(--m-accent2);
    font-size: 15px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22);
}
html.is-mobile .ri-export:active { transform: scale(.94); }
html.is-mobile .ri-chips {
    display: flex; gap: 5px; margin: 14px 0 12px;
    padding: 4px; border-radius: 14px;
    background: rgba(0,0,0,.16);
    border: 1px solid var(--ri-line);
}
html.is-mobile body.rg-light .ri-chips { background: rgba(30,70,120,.06); }
html.is-mobile .ri-chips button {
    flex: 1; min-height: 32px;
    border: none; border-radius: 10px;
    background: transparent; color: var(--m-muted);
    font-size: 11.5px; font-weight: 800;
    transition: background .25s var(--m-ease), color .25s var(--m-ease), transform .16s var(--m-ease);
}
html.is-mobile .ri-chips button.on {
    color: #fff;
    background: linear-gradient(140deg, var(--rg-accent), #2a4b8f);
    box-shadow: 0 6px 16px rgba(var(--rg-accent-rgb), .32), inset 0 1px 0 rgba(255,255,255,.3);
}
html.is-mobile .ri-chips button:active { transform: scale(.96); }
html.is-mobile .ri-hero-mid { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
html.is-mobile .ri-hero-num { display: flex; flex-direction: column; }
html.is-mobile .ri-hero-num strong {
    font-size: 46px; line-height: 1; font-weight: 900; letter-spacing: -1.4px;
    color: var(--m-text);
    font-variant-numeric: tabular-nums;
    text-shadow: 0 10px 30px rgba(var(--rg-accent-rgb), .25);
}
html.is-mobile .ri-hero-num span { font-size: 11.5px; font-weight: 700; color: var(--m-muted); margin-top: 5px; }
html.is-mobile .ri-delta {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11.5px; font-weight: 900;
    padding: 6px 10px; border-radius: 99px;
    direction: ltr;
    background: rgba(61,220,151,.12);
    color: #3ddc97;
    border: 1px solid rgba(61,220,151,.25);
}
html.is-mobile .ri-delta.down { background: rgba(255,93,108,.12); color: #ff7b87; border-color: rgba(255,93,108,.28); }
html.is-mobile .ri-delta.flat { background: rgba(255,255,255,.06); color: var(--m-muted); border-color: var(--ri-line); }
html.is-mobile body.rg-light .ri-delta.up { color: #0d7a52; background: rgba(13,122,82,.10); border-color: rgba(13,122,82,.2); }
html.is-mobile body.rg-light .ri-delta.down { color: #b32b3a; }
html.is-mobile .ri-hero-foot {
    margin-top: 12px; padding-top: 11px;
    border-top: 1px solid var(--ri-line);
    font-size: 11px; line-height: 1.6; font-weight: 600; color: var(--m-muted);
}
html.is-mobile .ri-hero-foot i { color: var(--rg-accent); margin-inline-end: 4px; }
html.is-mobile .ri-hero-foot b { color: var(--m-text); }

html.is-mobile .ri-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 12px; }
html.is-mobile .ri-kpi {
    position: relative;
    display: flex; flex-direction: column; gap: 3px;
    padding: 14px 13px 13px;
    border-radius: 18px;
    border: 1px solid var(--m-edge);
    background:
        linear-gradient(150deg, rgba(255,255,255,.12), rgba(255,255,255,.01) 50%, rgba(255,255,255,.06)),
        var(--ri-card);
    box-shadow: var(--m-lift);
    overflow: hidden;
}
html.is-mobile .ri-kpi::before {
    content: ""; position: absolute; inset: auto -30% -60% -30%; height: 80%;
    background: radial-gradient(50% 60% at 50% 100%, color-mix(in srgb, var(--tone) 22%, transparent), transparent 70%);
    pointer-events: none;
}
html.is-mobile .ri-kpi-i {
    width: 30px; height: 30px; border-radius: 9px;
    display: inline-flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--tone) 16%, transparent);
    color: var(--tone); font-size: 12px;
    margin-bottom: 4px;
}
html.is-mobile .ri-kpi-l { font-size: 11px; font-weight: 800; color: var(--m-muted); }
html.is-mobile .ri-kpi-v {
    font-size: 22px; font-weight: 900; color: var(--m-text);
    font-variant-numeric: tabular-nums; letter-spacing: -.3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
html.is-mobile .ri-kpi-s { font-size: 9.5px; font-weight: 700; color: var(--m-faint); }
html.is-mobile body.rg-light .ri-kpi-v { color: #0e2138; }
html.is-mobile body.rg-light .ri-kpi { background: linear-gradient(150deg, rgba(255,255,255,.98), rgba(255,255,255,.66)), var(--ri-card); }

html.is-mobile .ri-money {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
    margin-bottom: 12px;
}
html.is-mobile .ri-money-i {
    padding: 11px 10px;
    border-radius: 15px;
    border: 1px solid var(--m-edge);
    background: var(--ri-card);
    box-shadow: var(--m-lift);
    display: flex; flex-direction: column; gap: 3px;
    min-width: 0;
}
html.is-mobile .ri-money-i span { font-size: 9.5px; font-weight: 800; color: var(--m-muted); }
html.is-mobile .ri-money-i strong {
    font-size: 12.5px; font-weight: 900; color: var(--m-text);
    font-variant-numeric: tabular-nums; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
}
html.is-mobile .ri-money-i small { font-size: 8.5px; font-weight: 700; color: var(--m-faint); }
html.is-mobile .ri-money-i.warn strong { color: #ff8f99; }
html.is-mobile body.rg-light .ri-money-i strong { color: #0e2138; }
html.is-mobile body.rg-light .ri-money-i span { color: #33507a; }
html.is-mobile body.rg-light .ri-money-i small { color: #5b7191; }
html.is-mobile body.rg-light .ri-money-i.warn strong { color: #b32b3a; }

/* مقارنة بالفترة السابقة */
html.is-mobile .ri-cmp { display: flex; flex-direction: column; gap: 15px; }
html.is-mobile .ri-cmp-row { display: flex; flex-direction: column; gap: 6px; }
html.is-mobile .ri-cmp-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
html.is-mobile .ri-cmp-l { font-size: 11px; font-weight: 800; color: var(--m-muted); }
html.is-mobile .ri-cmp-d {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9.5px; font-weight: 900; padding: 3px 8px; border-radius: 99px;
    direction: ltr;
    background: rgba(61,220,151,.12); color: #3ddc97;
    border: 1px solid rgba(61,220,151,.25);
    font-variant-numeric: tabular-nums;
}
html.is-mobile .ri-cmp-d i { font-size: 8.5px; }
html.is-mobile .ri-cmp-d.down { background: rgba(255,93,108,.12); color: #ff7b87; border-color: rgba(255,93,108,.28); }
html.is-mobile .ri-cmp-d.flat { background: rgba(255,255,255,.06); color: var(--m-muted); border-color: var(--ri-line); }
html.is-mobile .ri-cmp-nums { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
html.is-mobile .ri-cmp-nums strong {
    font-size: 16px; font-weight: 900; color: var(--m-text);
    font-variant-numeric: tabular-nums; letter-spacing: -.2px;
}
html.is-mobile .ri-cmp-nums small { font-size: 9.5px; font-weight: 700; color: var(--m-faint); white-space: nowrap; }
html.is-mobile .ri-cmp-nums small b { font-weight: 800; color: var(--m-muted); font-variant-numeric: tabular-nums; }
html.is-mobile .ri-cmp-bars { display: flex; flex-direction: column; gap: 3px; }
html.is-mobile .ri-cmp-bar { display: block; height: 4px; border-radius: 99px; background: rgba(255,255,255,.06); overflow: hidden; }
html.is-mobile .ri-cmp-bar i { display: block; height: 100%; width: var(--w, 0%); border-radius: inherit; }
html.is-mobile .ri-cmp-bar.was i { background: rgba(255,255,255,.22); }
html.is-mobile .ri-cmp-bar.now i {
    background: linear-gradient(90deg, var(--rg-accent), color-mix(in srgb, var(--rg-accent) 55%, #fff));
    box-shadow: 0 0 10px rgba(var(--rg-accent-rgb), .35);
}
html.is-mobile .ri-in .ri-cmp-bar i { animation: riCmpGrow .8s var(--m-ease-out) both; animation-delay: calc(min(var(--ri-k, 0), 9) * 46ms + 160ms); }
html.is-mobile .ri-root.ri-no-motion .ri-cmp-bar i { animation: none; }
@keyframes riCmpGrow { from { width: 0; } to { width: var(--w, 0%); } }
html.is-mobile body.rg-light .ri-cmp-l { color: #33507a; }
html.is-mobile body.rg-light .ri-cmp-nums strong { color: #0e2138; }
html.is-mobile body.rg-light .ri-cmp-nums small { color: #5b7191; }
html.is-mobile body.rg-light .ri-cmp-nums small b { color: #33507a; }
html.is-mobile body.rg-light .ri-cmp-bar { background: rgba(30,70,120,.10); }
html.is-mobile body.rg-light .ri-cmp-bar.was i { background: rgba(30,70,120,.30); }
html.is-mobile body.rg-light .ri-cmp-d.up { background: rgba(13,122,82,.10); color: #0d7a52; border-color: rgba(13,122,82,.2); }
html.is-mobile body.rg-light .ri-cmp-d.down { color: #b32b3a; }
html.is-mobile body.rg-light .ri-cmp-d.flat { background: rgba(30,70,120,.06); color: #5b7191; border-color: rgba(30,70,120,.12); }

html.is-mobile .ri-cmp-ret { margin-top: 15px; padding-top: 13px; border-top: 1px solid var(--ri-line); display: flex; flex-direction: column; gap: 7px; }
html.is-mobile .ri-cmp-ret-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
html.is-mobile .ri-cmp-ret-top span { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 800; color: var(--m-muted); }
html.is-mobile .ri-cmp-ret-top span i { font-size: 9px; color: var(--rg-accent); }
html.is-mobile .ri-cmp-ret-top strong { font-size: 14px; font-weight: 900; color: var(--m-text); font-variant-numeric: tabular-nums; }
html.is-mobile .ri-cmp-ret-bar { height: 5px; border-radius: 99px; background: rgba(255,255,255,.06); overflow: hidden; }
html.is-mobile .ri-cmp-ret-bar i {
    display: block; height: 100%; width: var(--w, 0%); border-radius: inherit;
    background: linear-gradient(90deg, var(--rg-accent), color-mix(in srgb, var(--rg-accent) 45%, #3ddc97));
    box-shadow: 0 0 10px rgba(var(--rg-accent-rgb), .3);
}
html.is-mobile .ri-in .ri-cmp-ret-bar i { animation: riCmpGrow .8s var(--m-ease-out) both; animation-delay: calc(min(var(--ri-k, 0), 9) * 46ms + 420ms); }
html.is-mobile .ri-root.ri-no-motion .ri-cmp-ret-bar i { animation: none; }
html.is-mobile .ri-cmp-ret small { font-size: 9.5px; line-height: 1.65; font-weight: 700; color: var(--m-faint); }
html.is-mobile .ri-cmp-ret small b { color: var(--m-muted); font-weight: 800; font-variant-numeric: tabular-nums; }
html.is-mobile body.rg-light .ri-cmp-ret-top span { color: #33507a; }
html.is-mobile body.rg-light .ri-cmp-ret-top strong { color: #0e2138; }
html.is-mobile body.rg-light .ri-cmp-ret-bar { background: rgba(30,70,120,.10); }
html.is-mobile body.rg-light .ri-cmp-ret small { color: #5b7191; }
html.is-mobile body.rg-light .ri-cmp-ret small b { color: #33507a; }

html.is-mobile .ri-card {
    position: relative;
    border-radius: var(--m-radius-card);
    border: 1px solid var(--m-edge);
    background:
        linear-gradient(150deg, rgba(255,255,255,.10), rgba(255,255,255,.012) 46%, rgba(255,255,255,.055)),
        var(--ri-card);
    box-shadow: var(--m-lift);
    padding: 15px 14px 14px;
    margin-bottom: 12px;
    overflow: hidden;
}
html.is-mobile body.rg-light .ri-card { background: linear-gradient(150deg, rgba(255,255,255,.98), rgba(255,255,255,.7)), var(--ri-card); }
html.is-mobile .ri-card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
html.is-mobile .ri-card-head h3 { margin: 0; font-size: 13.5px; font-weight: 900; color: var(--m-text); display: flex; align-items: center; gap: 7px; }
html.is-mobile .ri-card-head h3 i { color: var(--m-accent2); font-size: 11.5px; }
html.is-mobile .ri-card-head > span { font-size: 10px; font-weight: 800; color: var(--m-faint); }
html.is-mobile .ri-card-head-seg { align-items: center; flex-wrap: wrap; row-gap: 6px; }
html.is-mobile .ri-svc-seg {
    display: inline-flex; gap: 3px; padding: 3px;
    border-radius: 10px;
    background: rgba(0,0,0,.18);
    border: 1px solid var(--ri-line);
}
html.is-mobile body.rg-light .ri-svc-seg { background: rgba(30,70,120,.06); }
html.is-mobile .ri-svc-seg button {
    border: 0; appearance: none;
    background: transparent; color: var(--m-muted);
    font-family: inherit; font-size: 10px; font-weight: 900;
    padding: 4px 9px; border-radius: 7px;
    cursor: pointer; -webkit-tap-highlight-color: transparent;
    transition: background .2s var(--m-ease), color .2s var(--m-ease), transform .14s var(--m-ease);
}
html.is-mobile .ri-svc-seg button.on {
    color: #fff;
    background: linear-gradient(140deg, var(--rg-accent), #2a4b8f);
    box-shadow: 0 4px 10px rgba(var(--rg-accent-rgb), .3), inset 0 1px 0 rgba(255,255,255,.28);
}
html.is-mobile .ri-svc-seg button:active { transform: scale(.94); }
html.is-mobile .ri-svc-seg button:focus-visible { outline: none; box-shadow: inset 0 0 0 2px rgba(var(--rg-accent-rgb), .75); }
html.is-mobile .ri-svc-pop { animation: riSvcPop .32s var(--m-ease-out) both; }
@keyframes riSvcPop { from { opacity: 0; transform: translate3d(0, 6px, 0); } to { opacity: 1; transform: none; } }

html.is-mobile .ri-chart-wrap { position: relative; padding-top: 6px; }
html.is-mobile .ri-chart-max {
    position: absolute; inset-inline-start: 4px; top: 0;
    font-size: 9.5px; font-weight: 800; color: var(--m-faint); direction: ltr;
}
html.is-mobile .ri-area { display: block; width: 100%; height: 118px; overflow: visible; }
html.is-mobile .ri-area-fill { opacity: .9; }
html.is-mobile .ri-area-line {
    fill: none; stroke: var(--rg-accent); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;
    stroke-dasharray: 1; stroke-dashoffset: 1;
    animation: riDraw 1.2s var(--m-ease-out) .15s forwards;
    vector-effect: non-scaling-stroke;
    filter: drop-shadow(0 3px 8px rgba(var(--rg-accent-rgb), .45));
}
html.is-mobile .ri-dot { fill: #fff; stroke: var(--rg-accent); stroke-width: 1.6; }
html.is-mobile .ri-chart-days { display: flex; justify-content: space-between; margin-top: 4px; font-size: 9px; font-weight: 700; color: var(--m-faint); }
@keyframes riDraw { to { stroke-dashoffset: 0; } }

html.is-mobile .ri-donut-wrap { display: flex; align-items: center; gap: 16px; }
html.is-mobile .ri-donut { position: relative; width: 132px; height: 132px; flex: none; }
html.is-mobile .ri-donut svg { width: 100%; height: 100%; display: block; }
html.is-mobile .ri-dseg { transition: stroke-dasharray 1s var(--m-ease-out); }
html.is-mobile .ri-donut-mid {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    pointer-events: none;
}
html.is-mobile .ri-donut-mid strong { font-size: 25px; font-weight: 900; color: var(--m-text); line-height: 1; font-variant-numeric: tabular-nums; }
html.is-mobile .ri-donut-mid span { font-size: 9.5px; font-weight: 800; color: var(--m-muted); margin-top: 3px; }
html.is-mobile .ri-legend { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px; }
html.is-mobile .ri-leg { display: grid; grid-template-columns: 8px 1fr auto auto; align-items: center; gap: 6px; font-size: 10.5px; }
html.is-mobile .ri-leg-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
html.is-mobile .ri-leg-l { font-weight: 800; color: var(--m-muted); }
html.is-mobile .ri-leg-n { font-weight: 900; color: var(--m-text); font-variant-numeric: tabular-nums; }
html.is-mobile .ri-leg small { font-size: 9px; font-weight: 700; color: var(--m-faint); direction: ltr; }

html.is-mobile .ri-bars { display: flex; flex-direction: column; gap: 11px; }
html.is-mobile .ri-bar-row { display: flex; flex-direction: column; gap: 5px; }
html.is-mobile .ri-bar-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
html.is-mobile .ri-bar-name { font-size: 11.5px; font-weight: 800; color: var(--m-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .ri-bar-val { font-size: 10.5px; font-weight: 900; color: var(--m-accent2); direction: ltr; font-variant-numeric: tabular-nums; }
html.is-mobile body.rg-light .ri-bar-val { color: #1b5aa8; }
html.is-mobile body.rg-light .ri-kicker { color: #1e5aa8; }
html.is-mobile .ri-bar-track { height: 7px; border-radius: 99px; background: rgba(255,255,255,.06); overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,.28); }
html.is-mobile body.rg-light .ri-bar-track { background: rgba(30,70,120,.09); box-shadow: none; }
html.is-mobile .ri-bar-track i {
    display: block; height: 100%; width: var(--w); border-radius: 99px;
    background: linear-gradient(90deg, color-mix(in srgb, var(--c) 58%, transparent), var(--c));
    box-shadow: 0 0 10px color-mix(in srgb, var(--c) 42%, transparent);
    transform-origin: right center;
}
html.is-mobile .ri-bar-sub { font-size: 9px; font-weight: 700; color: var(--m-faint); }

html.is-mobile .ri-mo-plot { display: flex; justify-content: center; align-items: stretch; gap: 10px; height: 112px; }
html.is-mobile .ri-mo { flex: 0 1 96px; min-width: 0; display: flex; flex-direction: column; align-items: center; }
html.is-mobile .ri-mo-total {
    min-height: 12px; line-height: 1;
    font-size: 10px; font-weight: 900; color: var(--m-muted);
    font-variant-numeric: tabular-nums;
}
html.is-mobile .ri-mo-col {
    flex: 1; width: 100%;
    display: flex; align-items: flex-end; justify-content: center; gap: 3px;
    padding-bottom: 1px;
    border-bottom: 1px solid var(--ri-line);
}
html.is-mobile .ri-mo-b {
    display: block;
    width: 34%;
    min-width: 7px;
    max-width: 30px;
    height: var(--h, 0%);
    border-radius: 4px 4px 2px 2px;
    transform: scaleY(0);
    transform-origin: bottom center;
    animation: riGrow .72s var(--m-ease-out) forwards;
    animation-delay: calc(180ms + var(--i, 0) * 55ms);
}
html.is-mobile .ri-mo-b.fresh {
    background: linear-gradient(180deg, #55e8ab, #24b97c);
    box-shadow: 0 0 10px rgba(61,220,151,.22);
}
html.is-mobile .ri-mo-b.back {
    background: linear-gradient(180deg, color-mix(in srgb, var(--rg-accent) 76%, #fff), var(--rg-accent));
    box-shadow: 0 0 10px rgba(var(--rg-accent-rgb), .26);
}
html.is-mobile .ri-mo-l { margin-top: 5px; font-size: 9px; font-weight: 800; color: var(--m-faint); white-space: nowrap; }
html.is-mobile .ri-mo-foot {
    display: flex; align-items: center; gap: 12px;
    margin-top: 10px; padding-top: 9px;
    border-top: 1px solid var(--ri-line);
    font-size: 10px; font-weight: 800; color: var(--m-muted);
}
html.is-mobile .ri-mo-key { display: inline-flex; align-items: center; gap: 5px; font-variant-numeric: tabular-nums; }
html.is-mobile .ri-mo-key i { width: 8px; height: 8px; border-radius: 3px; }
html.is-mobile .ri-mo-key i.fresh { background: #3ddc97; box-shadow: 0 0 7px rgba(61,220,151,.5); }
html.is-mobile .ri-mo-key i.back { background: var(--rg-accent); box-shadow: 0 0 7px rgba(var(--rg-accent-rgb), .5); }
html.is-mobile .ri-mo-foot small { margin-inline-start: auto; font-size: 9px; font-weight: 700; color: var(--m-faint); }
html.is-mobile body.rg-light .ri-mo-total { color: #33507a; }
html.is-mobile body.rg-light .ri-mo-l { color: #5b7191; }
html.is-mobile body.rg-light .ri-mo-col { border-bottom-color: rgba(30,70,120,.12); }
html.is-mobile body.rg-light .ri-mo-foot { color: #33507a; border-top-color: rgba(30,70,120,.10); }
html.is-mobile body.rg-light .ri-mo-foot small { color: #5b7191; }
@keyframes riGrow { to { transform: scaleY(1); } }

html.is-mobile .ri-heat { display: flex; flex-direction: column; gap: 4px; }
html.is-mobile .ri-heat-row { display: grid; grid-template-columns: 54px repeat(4, 1fr); gap: 4px; align-items: center; }
html.is-mobile .ri-heat-head span { font-size: 8.5px; font-weight: 800; color: var(--m-faint); text-align: center; }
html.is-mobile .ri-heat-day { font-size: 9.5px; font-weight: 800; color: var(--m-muted); white-space: nowrap; }
html.is-mobile .ri-heat-cell {
    height: 25px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 9.5px; font-weight: 900; color: var(--m-text);
    background: rgba(var(--rg-accent-rgb), var(--a));
    border: 1px solid rgba(255,255,255,.04);
}
html.is-mobile .ri-heat-cell.strong { color: #fff; text-shadow: 0 1px 2px rgba(0,10,30,.5); }
html.is-mobile body.rg-light .ri-heat-cell { color: #0e2138; }
html.is-mobile body.rg-light .ri-heat-cell.strong { color: #fff; }
html.is-mobile .ri-heat-peak {
    display: flex; align-items: flex-start; gap: 7px;
    margin-top: 9px; padding-top: 9px;
    border-top: 1px solid var(--ri-line);
    font-size: 10px; font-weight: 700; line-height: 1.65;
    color: var(--m-muted);
}
html.is-mobile .ri-heat-peak i { font-size: 9.5px; color: var(--m-accent2); margin-top: 4px; flex: none; }
html.is-mobile .ri-heat-peak b { color: var(--m-text); font-weight: 900; }
html.is-mobile body.rg-light .ri-heat-peak { color: #4c5d75; }
html.is-mobile body.rg-light .ri-heat-peak b { color: #0e2138; }

html.is-mobile .ri-wd-plot {
    display: flex; align-items: flex-end; gap: 5px;
    height: 118px; padding-top: 4px;
}
html.is-mobile .ri-wd { flex: 1 1 0; min-width: 0; height: 100%; display: flex; flex-direction: column; align-items: center; }
html.is-mobile .ri-wd-col {
    flex: 1; width: 100%;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 1px;
    border-bottom: 1px solid var(--ri-line);
}
html.is-mobile .ri-wd-col i {
    display: block; width: 74%; max-width: 26px; height: var(--h, 0%);
    border-radius: 5px 5px 2px 2px;
    background: linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,.10));
    border: 1px solid rgba(255,255,255,.11);
    transform: scaleY(0); transform-origin: bottom center;
    animation: riGrow .72s var(--m-ease-out) forwards;
    animation-delay: calc(180ms + var(--i, 0) * 55ms);
}
html.is-mobile .ri-wd.best .ri-wd-col i {
    background: linear-gradient(180deg, color-mix(in srgb, var(--rg-accent) 72%, #fff), var(--rg-accent));
    border-color: transparent;
    box-shadow: 0 0 12px rgba(var(--rg-accent-rgb), .34);
}
html.is-mobile .ri-wd-l { margin-top: 5px; font-size: 8.5px; font-weight: 800; color: var(--m-faint); white-space: nowrap; }
html.is-mobile .ri-wd.best .ri-wd-l { color: var(--m-accent2); }
html.is-mobile body.rg-light .ri-wd-col { border-bottom-color: rgba(30,70,120,.12); }
html.is-mobile body.rg-light .ri-wd-col i { background: linear-gradient(180deg, #cfe0f5, #aac6e8); border-color: rgba(30,70,120,.12); }
html.is-mobile body.rg-light .ri-wd.best .ri-wd-col i { background: linear-gradient(180deg, #74adf2, #2f6fd0); border-color: transparent; }
html.is-mobile body.rg-light .ri-wd-l { color: #5b7191; }
html.is-mobile body.rg-light .ri-wd.best .ri-wd-l { color: #1b5aa8; }
html.is-mobile .ri-wd-foot {
    display: flex; flex-direction: column; gap: 5px;
    margin-top: 10px; padding-top: 9px;
    border-top: 1px solid var(--ri-line);
    font-size: 10px; font-weight: 700; line-height: 1.55;
    color: var(--m-muted);
}
html.is-mobile .ri-wd-foot b { color: var(--m-text); font-weight: 900; }
html.is-mobile .ri-wd-best i { color: var(--m-accent2); margin-inline-end: 3px; }
html.is-mobile .ri-wd-worst { color: var(--m-faint); }
html.is-mobile .ri-wd-worst i { margin-inline-end: 3px; }
html.is-mobile .ri-wd-note { font-size: 9px; font-weight: 700; color: var(--m-faint); }
html.is-mobile body.rg-light .ri-wd-foot { color: #4c5d75; border-top-color: rgba(30,70,120,.10); }
html.is-mobile body.rg-light .ri-wd-foot b { color: #0e2138; }
html.is-mobile body.rg-light .ri-wd-best i { color: #1b5aa8; }
html.is-mobile body.rg-light .ri-wd-worst,
html.is-mobile body.rg-light .ri-wd-note { color: #5b7191; }

html.is-mobile .ri-ov-bar {
    display: flex; gap: 2px;
    height: 14px; border-radius: 99px;
    background: rgba(255,255,255,.05);
    overflow: hidden;
}
html.is-mobile .ri-ov-bar i {
    display: block; height: 100%; width: var(--w);
    background: linear-gradient(180deg, color-mix(in srgb, var(--c) 74%, #fff), var(--c));
    transform: scaleX(0); transform-origin: right center;
    animation: riSegGrow .7s var(--m-ease-out) forwards;
    animation-delay: calc(160ms + var(--i, 0) * 70ms);
}
html.is-mobile body.rg-light .ri-ov-bar { background: rgba(30,70,120,.08); }
html.is-mobile .ri-ov-legend { display: flex; flex-direction: column; gap: 6px; margin-top: 11px; }
html.is-mobile .ri-ov-row { display: grid; grid-template-columns: 9px 1fr auto 36px; align-items: center; gap: 8px; }
html.is-mobile .ri-ov-dot {
    width: 9px; height: 9px; border-radius: 3px;
    background: var(--c);
    box-shadow: 0 0 8px color-mix(in srgb, var(--c) 45%, transparent);
}
html.is-mobile .ri-ov-l { font-size: 10px; font-weight: 800; color: var(--m-muted); }
html.is-mobile .ri-ov-n { font-size: 10.5px; font-weight: 900; color: var(--m-text); font-variant-numeric: tabular-nums; }
html.is-mobile .ri-ov-p { font-size: 10px; font-weight: 800; color: var(--m-faint); text-align: end; font-variant-numeric: tabular-nums; }
html.is-mobile .ri-ov-foot {
    display: flex; flex-direction: column; gap: 4px;
    margin-top: 10px; padding-top: 9px;
    border-top: 1px solid var(--ri-line);
    font-size: 10px; font-weight: 700; line-height: 1.55;
    color: var(--m-muted);
}
html.is-mobile .ri-ov-foot b { color: var(--m-text); font-weight: 900; }
html.is-mobile .ri-ov-foot i { color: var(--m-accent2); margin-inline-end: 3px; }
html.is-mobile .ri-ov-foot small { font-size: 9px; font-weight: 700; color: var(--m-faint); }
html.is-mobile body.rg-light .ri-ov-l { color: #4c5d75; }
html.is-mobile body.rg-light .ri-ov-n { color: #0e2138; }
html.is-mobile body.rg-light .ri-ov-p { color: #5b7191; }
html.is-mobile body.rg-light .ri-ov-foot { color: #4c5d75; border-top-color: rgba(30,70,120,.10); }
html.is-mobile body.rg-light .ri-ov-foot b { color: #0e2138; }
html.is-mobile body.rg-light .ri-ov-foot i { color: #1b5aa8; }
html.is-mobile body.rg-light .ri-ov-foot small { color: #5b7191; }
@keyframes riSegGrow { to { transform: scaleX(1); } }

html.is-mobile .ri-ladder { display: flex; flex-direction: column; gap: 9px; }
html.is-mobile .ri-lad-row { display: grid; grid-template-columns: 64px 1fr 28px; align-items: center; gap: 8px; }
html.is-mobile .ri-lad-l { font-size: 10px; font-weight: 800; color: var(--m-muted); }
html.is-mobile .ri-lad-track { height: 8px; border-radius: 99px; background: rgba(255,255,255,.06); overflow: hidden; }
html.is-mobile body.rg-light .ri-lad-track { background: rgba(30,70,120,.09); }
html.is-mobile .ri-lad-track i {
    display: block; height: 100%; width: var(--w); border-radius: 99px;
    background: linear-gradient(90deg, color-mix(in srgb, var(--c) 45%, transparent), var(--c));
}
html.is-mobile .ri-lad-n { font-size: 11px; font-weight: 900; color: var(--m-text); text-align: end; font-variant-numeric: tabular-nums; }

html.is-mobile .ri-ranks { display: flex; flex-direction: column; gap: 6px; }
html.is-mobile .ri-rank {
    display: flex; align-items: center; gap: 9px;
    width: 100%; text-align: start;
    padding: 9px 8px;
    border-radius: 13px;
    border: 1px solid transparent;
    background: rgba(255,255,255,.035);
    color: var(--m-text);
    transition: background .2s var(--m-ease), transform .15s var(--m-ease), border-color .2s;
}
html.is-mobile body.rg-light .ri-rank { background: rgba(30,70,120,.05); }
html.is-mobile .ri-rank:active { transform: scale(.985); background: rgba(var(--rg-accent-rgb), .10); }
html.is-mobile .ri-rank-n {
    width: 20px; height: 20px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 7px;
    font-size: 10px; font-weight: 900;
    background: rgba(255,255,255,.07); color: var(--m-muted);
}
html.is-mobile .ri-rank:nth-child(1) .ri-rank-n { background: linear-gradient(140deg, #ffd166, #e0a52a); color: #3a2a00; }
html.is-mobile .ri-rank:nth-child(2) .ri-rank-n { background: linear-gradient(140deg, #dfe9f5, #a9bdd4); color: #24344a; }
html.is-mobile .ri-rank:nth-child(3) .ri-rank-n { background: linear-gradient(140deg, #e3b48a, #b97b4a); color: #3a2109; }
html.is-mobile .ri-av {
    width: 32px; height: 32px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 11px;
    background: linear-gradient(150deg, rgba(var(--rg-accent-rgb), .38), rgba(var(--rg-accent-rgb), .10));
    border: 1px solid rgba(var(--rg-accent-rgb), .28);
    color: var(--m-text);
    font-size: 13px; font-weight: 900;
}
html.is-mobile .ri-av.big { width: 52px; height: 52px; border-radius: 17px; font-size: 21px; }
html.is-mobile .ri-rank-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
html.is-mobile .ri-rank-body strong { font-size: 11.5px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .ri-rank-body small { font-size: 9px; font-weight: 700; color: var(--m-faint); }
html.is-mobile .ri-rank-v { font-size: 10.5px; font-weight: 900; color: var(--m-accent2); direction: ltr; font-variant-numeric: tabular-nums; white-space: nowrap; }

html.is-mobile .ri-absent-note {
    display: flex; flex-direction: column; gap: 7px;
    padding: 10px 11px; margin-bottom: 9px;
    border-radius: 13px;
    border: 1px solid rgba(255,209,102,.20);
    background: linear-gradient(150deg, rgba(255,209,102,.12), rgba(255,209,102,.03));
    font-size: 10px; line-height: 1.7; font-weight: 700; color: var(--m-muted);
}
html.is-mobile .ri-absent-note b { color: #ffd166; font-weight: 900; font-variant-numeric: tabular-nums; }
html.is-mobile .ri-absent-meter { display: flex; height: 6px; border-radius: 99px; overflow: hidden; background: rgba(255,255,255,.07); }
html.is-mobile .ri-absent-meter i { display: block; height: 100%; }
html.is-mobile .ri-absent-meter i.hot { background: linear-gradient(90deg, #ff5d6c, #ff8a9a); }
html.is-mobile .ri-absent-meter i.warm { flex: 1; background: linear-gradient(90deg, #e0a52a, #ffd166); }
html.is-mobile .ri-absent-list { display: flex; flex-direction: column; gap: 6px; }
html.is-mobile .ri-absent-row {
    display: flex; align-items: center; gap: 9px;
    width: 100%; text-align: start;
    padding: 9px 8px;
    border-radius: 13px;
    border: 1px solid rgba(255,209,102,.10);
    background: rgba(255,255,255,.035);
    color: var(--m-text);
    font-family: inherit;
    transition: background .2s var(--m-ease), transform .15s var(--m-ease), border-color .2s;
}
html.is-mobile .ri-absent-row:active { transform: scale(.985); background: rgba(255,209,102,.10); border-color: rgba(255,209,102,.24); }
html.is-mobile .ri-absent-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
html.is-mobile .ri-absent-body strong { font-size: 11.5px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .ri-absent-body small { display: flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; color: var(--m-faint); }
html.is-mobile .ri-absent-body small i { font-size: 9px; color: #e0a52a; }
html.is-mobile .ri-absent-v { font-size: 10.5px; font-weight: 900; color: #ffd166; direction: ltr; font-variant-numeric: tabular-nums; white-space: nowrap; }
html.is-mobile .ri-absent-more { text-align: center; font-size: 9.5px; font-weight: 800; color: var(--m-faint); padding: 8px 0 2px; }
html.is-mobile body.rg-light .ri-absent-note { background: linear-gradient(150deg, rgba(160,110,10,.10), rgba(160,110,10,.02)); border-color: rgba(160,110,10,.20); color: #4c5d75; }
html.is-mobile body.rg-light .ri-absent-note b { color: #8a6a1f; }
html.is-mobile body.rg-light .ri-absent-row { background: rgba(30,70,120,.05); border-color: rgba(160,110,10,.10); }
html.is-mobile body.rg-light .ri-absent-v { color: #8a6a1f; }
html.is-mobile body.rg-light .ri-absent-meter { background: rgba(30,70,120,.10); }

html.is-mobile .ri-search { position: relative; margin-bottom: 8px; }
html.is-mobile .ri-search i { position: absolute; inset-inline-start: 12px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--m-faint); }
html.is-mobile .ri-search input {
    width: 100%; height: 40px;
    border-radius: 13px;
    border: 1px solid var(--ri-line);
    background: rgba(0,0,0,.18);
    color: var(--m-text);
    padding: 0 34px 0 12px;
    font-family: inherit; font-size: 12px; font-weight: 600;
    outline: none;
}
html.is-mobile body.rg-light .ri-search input { background: rgba(255,255,255,.8); }
html.is-mobile .ri-search input::placeholder { color: var(--m-faint); }
html.is-mobile .ri-search-scope {
    display: flex; align-items: center; gap: 6px;
    margin: -2px 2px 8px;
    font-size: 9.5px; font-weight: 800; color: var(--m-accent2);
}
html.is-mobile .ri-search-scope[hidden] { display: none; }
html.is-mobile .ri-search-scope i { font-size: 9px; }
html.is-mobile body.rg-light .ri-search-scope { color: #24466f; }
html.is-mobile .ri-search input:focus { border-color: rgba(var(--rg-accent-rgb), .5); box-shadow: 0 0 0 3px rgba(var(--rg-accent-rgb), .12); }
html.is-mobile .ri-filters { display: flex; gap: 5px; margin-bottom: 9px; flex-wrap: wrap; }
html.is-mobile .ri-filters button {
    min-height: 28px; padding: 0 10px;
    border-radius: 99px;
    border: 1px solid var(--ri-line);
    background: transparent;
    color: var(--m-muted);
    font-size: 10px; font-weight: 800;
}
html.is-mobile .ri-filters button.on {
    background: rgba(var(--rg-accent-rgb), .16);
    border-color: rgba(var(--rg-accent-rgb), .38);
    color: var(--m-accent2);
}
html.is-mobile .ri-dir-tools { display: inline-flex; align-items: center; gap: 8px; }
html.is-mobile .ri-dir-count { font-size: 10px; font-weight: 800; color: var(--m-faint); font-variant-numeric: tabular-nums; }
html.is-mobile .ri-dir-seg button { padding: 4px 8px; }
html.is-mobile .ri-dir-more {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; margin-top: 7px; padding: 11px 10px;
    border-radius: 12px;
    border: 1px solid var(--ri-line);
    background: rgba(255,255,255,.05);
    color: var(--m-text);
    font-family: inherit; font-size: 10.5px; font-weight: 900;
    cursor: pointer; -webkit-tap-highlight-color: transparent;
    transition: background .2s var(--m-ease), transform .14s var(--m-ease);
}
html.is-mobile .ri-dir-more i { font-size: 9px; color: var(--rg-accent); }
html.is-mobile .ri-dir-more:active { transform: scale(.985); background: rgba(255,255,255,.09); }
html.is-mobile body.rg-light .ri-dir-more { background: rgba(30,70,120,.05); color: #0e2138; }
html.is-mobile body.rg-light .ri-dir-count { color: #5b7191; }
html.is-mobile .ri-dir { display: flex; flex-direction: column; gap: 5px; }
html.is-mobile .ri-dir-row {
    display: flex; align-items: center; gap: 9px;
    width: 100%; text-align: start;
    padding: 9px 8px;
    border-radius: 13px;
    border: 1px solid transparent;
    background: rgba(255,255,255,.03);
    color: var(--m-text);
}
html.is-mobile body.rg-light .ri-dir-row { background: rgba(30,70,120,.045); }
html.is-mobile .ri-dir-row:active { background: rgba(var(--rg-accent-rgb), .10); }
html.is-mobile .ri-dir-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
html.is-mobile .ri-dir-body strong { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .ri-dir-body small { font-size: 9px; font-weight: 700; color: var(--m-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html.is-mobile .ri-badge-new {
    font-style: normal; font-size: 8px; font-weight: 900;
    padding: 2px 5px; border-radius: 5px;
    background: rgba(61,220,151,.16); color: #3ddc97;
    border: 1px solid rgba(61,220,151,.3);
}
html.is-mobile body.rg-light .ri-badge-new { color: #0d7a52; }
html.is-mobile .ri-dir-end { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex: none; max-width: 42%; }
html.is-mobile .ri-dir-end strong { font-size: 10.5px; font-weight: 900; color: var(--m-text); direction: ltr; font-variant-numeric: tabular-nums; }
html.is-mobile .ri-dir-end small { font-size: 8.5px; font-weight: 700; color: var(--m-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
html.is-mobile .ri-dir-end .ri-debt { color: #ff8f99; }
html.is-mobile body.rg-light .ri-dir-end .ri-debt { color: #b32b3a; }
html.is-mobile .ri-more-note { text-align: center; font-size: 9.5px; font-weight: 700; color: var(--m-faint); padding: 8px 0 2px; }

html.is-mobile .ri-empty-mini {
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    padding: 18px 10px;
    color: var(--m-faint);
    font-size: 10.5px; font-weight: 700;
    text-align: center;
}
html.is-mobile .ri-empty-mini i { font-size: 18px; opacity: .5; }
html.is-mobile .ri-foot {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 9.5px; font-weight: 700; color: var(--m-faint);
    padding: 8px 0 16px; text-align: center;
}
html.is-mobile .ri-foot i { color: var(--m-accent2); }

/* الدخول المتدرج */
html.is-mobile .ri-in { animation: riRise .62s var(--m-ease-out) both; animation-delay: calc(min(var(--ri-k, 0), 9) * 46ms); }
html.is-mobile .ri-root.ri-no-motion .ri-in,
html.is-mobile .ri-root.ri-no-motion .ri-svc-pop { animation: none; }
@keyframes riRise { from { opacity: 0; transform: translate3d(0, 16px, 0); } to { opacity: 1; transform: none; } }

/* ورقة الزبون */
html.is-mobile .ri-sheet { position: fixed; inset: 0; z-index: 9700; display: flex; align-items: flex-end; }
html.is-mobile .ri-sheet-scrim { position: absolute; inset: 0; background: radial-gradient(90% 60% at 50% 100%, rgba(6,14,28,.55), rgba(2,6,14,.78)); opacity: 0; transition: opacity .3s var(--m-ease); }
html.is-mobile .ri-sheet.on .ri-sheet-scrim { opacity: 1; }
html.is-mobile .ri-sheet-card {
    position: relative;
    width: 100%;
    max-height: 88vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    border-radius: 26px 26px 0 0;
    border: 1px solid var(--m-edge);
    border-bottom: none;
    background:
        linear-gradient(160deg, rgba(255,255,255,.16), rgba(255,255,255,.02) 46%, rgba(255,255,255,.08)),
        rgba(var(--rg-glass-rgb), .988);
    box-shadow: 0 -24px 60px rgba(0,4,14,.55), inset 0 1px 0 rgba(255,255,255,.35);
    padding: 8px 16px calc(20px + env(safe-area-inset-bottom, 0px));
    transform: translate3d(0, 104%, 0);
    transition: transform .42s var(--m-ease-out);
    color: var(--m-text);
}
html.is-mobile body.rg-light .ri-sheet-card { background: linear-gradient(160deg, rgba(255,255,255,.98), rgba(255,255,255,.9)); }
html.is-mobile .ri-sheet.on .ri-sheet-card { transform: none; }
html.is-mobile .ri-sheet.out .ri-sheet-card { transform: translate3d(0, 104%, 0); }
html.is-mobile .ri-sheet.out .ri-sheet-scrim { opacity: 0; }
html.is-mobile .ri-sheet-grip { width: 42px; height: 5px; border-radius: 99px; background: rgba(255,255,255,.25); margin: 2px auto 12px; }
html.is-mobile body.rg-light .ri-sheet-grip { background: rgba(20,60,110,.2); }
html.is-mobile .ri-sheet-x {
    position: absolute; top: 12px; inset-inline-end: 14px; z-index: 2;
    width: 32px; height: 32px; border-radius: 10px;
    border: 1px solid var(--m-edge);
    background: rgba(255,255,255,.12);
    color: var(--m-muted); font-size: 13px;
}
html.is-mobile .ri-cust-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
html.is-mobile .ri-cust-head h3 { margin: 0 0 3px; font-size: 19px; font-weight: 900; color: var(--m-text); }
html.is-mobile .ri-cust-head p { margin: 0; font-size: 11px; font-weight: 700; color: var(--m-muted); }
html.is-mobile .ri-cust-head a { color: var(--m-accent2); text-decoration: none; }
html.is-mobile .ri-cust-act { display: flex; gap: 7px; margin: -2px 0 11px; }
html.is-mobile .ri-cust-act > * {
    flex: 1; min-height: 40px;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border-radius: 12px;
    border: 1px solid var(--ri-line);
    background: rgba(255,255,255,.05);
    color: var(--m-text);
    font-family: inherit; font-size: 10.5px; font-weight: 900;
    text-decoration: none; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform .14s var(--m-ease), background .2s var(--m-ease), border-color .2s var(--m-ease);
}
html.is-mobile .ri-cust-act > *:active { transform: scale(.97); }
html.is-mobile .ri-cust-act i { font-size: 11px; }
html.is-mobile .ri-act-call { color: var(--m-accent2); border-color: rgba(var(--rg-accent-rgb), .34); background: rgba(var(--rg-accent-rgb), .12); }
html.is-mobile .ri-act-wa i { color: #4fd07a; }
html.is-mobile .ri-act-copy.ok { border-color: rgba(63,190,120,.45); }
html.is-mobile .ri-act-copy.ok i { color: #58d18d; }
html.is-mobile .ri-act-copy.bad { border-color: rgba(255,93,108,.42); }
html.is-mobile .ri-act-copy.bad i { color: #ff8a95; }
html.is-mobile body.rg-light .ri-cust-act > * { background: rgba(30,70,120,.05); color: #0e2138; }
html.is-mobile body.rg-light .ri-act-call { color: #175d97; border-color: rgba(30,110,190,.26); background: rgba(30,110,190,.08); }
html.is-mobile .ri-cust-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
html.is-mobile .ri-cust-stats > div {
    padding: 10px 12px; border-radius: 14px;
    border: 1px solid var(--m-edge);
    background: rgba(255,255,255,.05);
    display: flex; flex-direction: column; gap: 2px;
}
html.is-mobile body.rg-light .ri-cust-stats > div { background: rgba(30,70,120,.05); }
html.is-mobile .ri-cust-stats strong { font-size: 14px; font-weight: 900; color: var(--m-text); direction: ltr; }
html.is-mobile .ri-cust-stats span { font-size: 9px; font-weight: 800; color: var(--m-muted); }
html.is-mobile body.rg-light .ri-sheet-x { background: rgba(20,60,110,.07); color: #33507a; }
html.is-mobile .ri-cust-debt {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 12px; border-radius: 13px; margin-bottom: 10px;
    background: rgba(255,93,108,.10);
    border: 1px solid rgba(255,93,108,.25);
    color: #ff8f99; font-size: 11px; font-weight: 700;
}
html.is-mobile body.rg-light .ri-cust-debt { color: #b32b3a; }
html.is-mobile .ri-cust-life {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; border-radius: 13px; margin-bottom: 12px;
    background: rgba(255,255,255,.05);
    border: 1px solid var(--ri-line);
    font-size: 9.5px; font-weight: 700; color: var(--m-muted); line-height: 1.6;
}
html.is-mobile .ri-cust-life i { color: var(--rg-accent); font-size: 10px; }
html.is-mobile .ri-cust-life b { color: var(--m-text); font-weight: 900; font-variant-numeric: tabular-nums; }
html.is-mobile .ri-cust-trend { margin-bottom: 13px; }
html.is-mobile .ri-cust-trend h4 {
    display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
    margin: 0 0 8px; font-size: 12px; font-weight: 900; color: var(--m-text);
}
html.is-mobile .ri-cust-trend h4 small { font-size: 8.5px; font-weight: 800; color: var(--m-faint); }
html.is-mobile .ri-cm-bars {
    display: flex; align-items: stretch; gap: 8px;
    height: 98px; padding: 10px 9px 7px;
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--ri-line);
}
html.is-mobile .ri-cm { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; height: 100%; }
html.is-mobile .ri-cm-track { flex: 1; display: flex; align-items: flex-end; width: 100%; }
html.is-mobile .ri-cm-track i {
    display: block; width: 100%; height: var(--h, 0%); min-height: 2px;
    border-radius: 6px 6px 2px 2px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--rg-accent) 65%, #fff), var(--rg-accent));
    opacity: .5;
}
html.is-mobile .ri-cm.on .ri-cm-track i { opacity: 1; box-shadow: 0 0 12px rgba(var(--rg-accent-rgb), .35); }
html.is-mobile .ri-cm small { text-align: center; font-size: 8.5px; font-weight: 800; color: var(--m-faint); white-space: nowrap; }
html.is-mobile .ri-cm.on small { color: var(--m-text); }
html.is-mobile .ri-sheet.on .ri-cm-track i { animation: riCmGrow .65s var(--m-ease-out) both; animation-delay: calc(var(--d, 0s) + 140ms); }
html.is-mobile body.rm-motion-off .ri-sheet.on .ri-cm-track i { animation: none; }
@keyframes riCmGrow { from { height: 0; } to { height: var(--h, 0%); } }
html.is-mobile .ri-cm-sum { margin: 7px 2px 0; font-size: 8.5px; font-weight: 700; color: var(--m-faint); text-align: center; }
html.is-mobile .ri-cm-sum b { color: var(--m-muted); font-weight: 900; font-variant-numeric: tabular-nums; }
html.is-mobile .ri-cm-empty {
    padding: 16px 10px; text-align: center;
    font-size: 10px; font-weight: 700; color: var(--m-faint);
    background: rgba(255,255,255,.04);
    border: 1px dashed var(--ri-line); border-radius: 13px;
}
html.is-mobile body.rg-light .ri-cust-life { background: rgba(30,70,120,.05); border-color: rgba(30,70,120,.12); color: #4c5d75; }
html.is-mobile body.rg-light .ri-cust-life b { color: #0e2138; }
html.is-mobile body.rg-light .ri-cm-bars { background: rgba(30,70,120,.04); }
html.is-mobile body.rg-light .ri-cm small { color: #5b7191; }
html.is-mobile body.rg-light .ri-cm.on small { color: #0e2138; }
html.is-mobile body.rg-light .ri-cm-sum { color: #5b7191; }
html.is-mobile body.rg-light .ri-cm-sum b { color: #33507a; }
html.is-mobile body.rg-light .ri-cm-empty { background: rgba(30,70,120,.04); color: #5b7191; }
html.is-mobile .ri-cust-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
html.is-mobile .ri-cust-meta span { display: flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 700; color: var(--m-muted); }
html.is-mobile .ri-cust-meta i { color: var(--m-accent2); font-size: 10px; width: 14px; text-align: center; }
html.is-mobile .ri-cust-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
html.is-mobile .ri-chip { padding: 5px 9px; border-radius: 99px; font-size: 9.5px; font-weight: 800; color: var(--m-muted); background: rgba(255,255,255,.06); border: 1px solid var(--ri-line); }
html.is-mobile .ri-cust-inv h4 { margin: 4px 0 8px; font-size: 12px; font-weight: 900; color: var(--m-text); }
html.is-mobile .ri-inv {
    display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: 11px; margin-bottom: 5px;
    background: rgba(255,255,255,.04);
    font-size: 10px; font-weight: 700; color: var(--m-muted);
}
html.is-mobile body.rg-light .ri-inv { background: rgba(30,70,120,.05); }
html.is-mobile .ri-inv-n { font-weight: 900; color: var(--m-accent2); direction: ltr; }
html.is-mobile .ri-inv-t { font-weight: 900; color: var(--m-text); direction: ltr; }
html.is-mobile .ri-inv-s { font-size: 8.5px; padding: 2px 6px; border-radius: 6px; background: rgba(255,255,255,.06); }
body.ri-sheet-open #admin-screen .admin-section { pointer-events: none; }
body.ri-sheet-open #mobile-bottom-nav { opacity: .35; pointer-events: none; transition: opacity .3s; }

@media (prefers-reduced-motion: reduce) {
    html.is-mobile .ri-in { animation: none !important; }
    html.is-mobile .ri-area-line { animation: none !important; stroke-dashoffset: 0 !important; }
    html.is-mobile .ri-mo-b { animation: none !important; transform: none !important; }
    html.is-mobile .ri-sheet-card { transition: none !important; }
    html.is-mobile .ri-cm-track i { animation: none !important; }
}
`;

    const style = document.createElement('style');
    style.id = 'royal-insight-style';
    style.textContent = CSS;
    document.head.appendChild(style);
})();
