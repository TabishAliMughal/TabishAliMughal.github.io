/* Cost calculator page (/cost-calculator/). Data: pricing-data.js (generated from the private
   Entity-CostCalculator_finance project, never hand-edited). Formula: cost-model.js. This file only
   builds the form and the summary with DOM APIs (textContent, no HTML strings). Nothing is stored or
   sent anywhere: "Contact me" opens the visitor's own email app via mailto. */
(function () {
    'use strict';

    var P = window.COST_PRICING;
    var M = window.CostModel;
    if (!P || !M) return;

    var EMAIL = 'tabishalimughal@gmail.com';
    var PAGE_URL = 'https://tabishalimughal.github.io/cost-calculator/';
    var USD_NOTE = 'USD prices are higher than PKR prices because of the time-zone difference: work for USD clients is done outside my regular local working hours (Pakistan, UTC+5).';

    var byId = {};
    P.services.forEach(function (s) { byId[s.id] = s; });
    // Sections come from the catalog's `category` flag (data/services.php: 'core' | 'addon').
    var GROUPS = [['core', 'Core features'], ['addon', 'Add-ons and extras']];
    function groupOf(id) { return byId[id].category === 'core' ? 'core' : 'addon'; }

    function $(id) { return document.getElementById(id); }
    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    // ---- state -----------------------------------------------------------
    function defaultCurrency() {
        try {
            var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            return tz === 'Asia/Karachi' ? 'PKR' : 'USD';
        } catch (e) { return 'USD'; }
    }

    var state;
    function freshState() {
        var sel = {};
        P.services.forEach(function (s) { sel[s.id] = { checked: false, qty: s.default_qty }; });
        return { selections: sel, requestedDeliveryDays: 0, aiUsed: false, supportOptionId: 'none', templateId: '', variance: {} };
    }
    var currency = defaultCurrency();

    // ---- formatting ------------------------------------------------------
    function money(n) {
        if (currency === 'PKR') return 'Rs ' + Math.round(n || 0).toLocaleString('en-US');
        return '$' + (Math.round((n || 0) * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function num(n) { return (Math.round(n * 100) / 100).toLocaleString('en-US'); }
    function amountOf(opt, field) { return opt[field + (currency === 'PKR' ? '_pkr' : '_usd')]; }
    function supportPrice(opt) {
        if (opt.type === 'monthly') return money(amountOf(opt, 'rate')) + ' per month after launch';
        if (opt.type === 'onetime') return money(amountOf(opt, 'fee')) + ' one-time, covers ' + opt.window_days + ' days after launch';
        if (opt.type === 'hourly') return money(amountOf(opt, 'rate')) + ' per hour, billed only when used';
        return 'You can add support later.';
    }
    function supportLabel(opt) {
        return { none: 'No support package', monthly: 'Monthly support', onetime: 'Post-launch package', hourly: 'Hourly, as needed' }[opt.type] || opt.label;
    }

    // ---- build the form --------------------------------------------------
    var rows = {};

    function buildTemplates() {
        var sel = $('template');
        sel.appendChild(new Option('Custom: choose features yourself', ''));
        P.templates.forEach(function (t) { sel.appendChild(new Option(t.name, t.id)); });
        sel.addEventListener('change', function () { applyTemplate(sel.value); });
    }

    function buildVariance() {
        var wrap = $('variance');
        wrap.textContent = '';
        var t = P.templates.filter(function (x) { return x.id === state.templateId; })[0];
        if (!t) return;
        t.variance_inputs.forEach(function (vi, i) {
            var label = el('label', 'field');
            label.appendChild(el('span', null, vi.label + ' (' + vi.baseline_included + ' included)'));
            var input = el('input', 'calc-input');
            input.type = 'number';
            input.min = String(vi.baseline_included);
            input.step = '1';
            input.inputMode = 'numeric';
            var saved = (state.variance[t.id] || [])[i];
            input.value = saved != null ? saved : vi.baseline_included;
            input.addEventListener('input', function () {
                var v = parseFloat(input.value) || 0;
                (state.variance[t.id] = state.variance[t.id] || [])[i] = v;
                // Same rule as the PHP tool: values at/below the baseline keep the baseline.
                var qty = Math.max(vi.baseline_included, v);
                vi.target_service_ids.forEach(function (sid) {
                    state.selections[sid].checked = true;
                    state.selections[sid].qty = qty;
                });
                syncRows();
                update();
            });
            label.appendChild(input);
            wrap.appendChild(label);
        });
    }

    function svcNote(s) {
        if (s.pricing_model === 'tiered') return 'The first ' + (s.tiered_free != null ? s.tiered_free : 2) + ' sessions are free.';
        if (s.pricing_model === 'estimated') return 'Enter the number of hours you expect it to take.';
        return s.pass_through_note || '';
    }

    function buildServices() {
        GROUPS.forEach(function (g) {
            var ul = $('svc-' + g[0]);
            P.services.filter(function (s) { return s.category === g[0]; }).forEach(function (s) {
                var li = el('li', 'svc');
                var lab = el('label', 'check');
                var chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.id = 'svc-' + s.id;
                lab.appendChild(chk);
                lab.appendChild(el('span', 'svc-name', s.name));
                li.appendChild(lab);

                var q = el('div', 'svc-qty');
                var qty = el('input', 'calc-input');
                qty.type = 'number';
                qty.min = '0';
                qty.step = s.pricing_model === 'estimated' ? '0.5' : '1';
                qty.inputMode = s.pricing_model === 'estimated' ? 'decimal' : 'numeric';
                qty.setAttribute('aria-label', s.name + ': ' + s.unit_label.toLowerCase());
                q.appendChild(qty);
                q.appendChild(el('span', 'svc-unit', s.unit_label));
                li.appendChild(q);

                var cost = el('span', 'svc-cost');
                li.appendChild(cost);
                var note = svcNote(s);
                if (note) li.appendChild(el('p', 'svc-note', note));

                chk.addEventListener('change', function () {
                    var sel = state.selections[s.id];
                    sel.checked = chk.checked;
                    if (chk.checked && !(sel.qty > 0)) sel.qty = Math.max(1, s.default_qty);
                    syncRows();
                    update();
                });
                qty.addEventListener('input', function () {
                    var v = parseFloat(qty.value);
                    var sel = state.selections[s.id];
                    sel.qty = v > 0 ? v : 0;
                    sel.checked = sel.qty > 0;
                    chk.checked = sel.checked;
                    li.classList.toggle('is-on', sel.checked);
                    update();
                });

                rows[s.id] = { li: li, chk: chk, qty: qty, cost: cost };
                ul.appendChild(li);
            });
        });
    }

    function buildSupport() {
        var ul = $('support');
        P.supportOptions.forEach(function (o) {
            var li = el('li');
            var lab = el('label', 'check');
            var r = document.createElement('input');
            r.type = 'radio';
            r.name = 'support';
            r.value = o.id;
            r.id = 'support-' + o.id;
            r.addEventListener('change', function () { state.supportOptionId = o.id; update(); });
            lab.appendChild(r);
            var txt = el('span', null, supportLabel(o));
            var price = el('span', 'support-price');
            price.setAttribute('data-support', o.id);
            txt.appendChild(price);
            lab.appendChild(txt);
            li.appendChild(lab);
            ul.appendChild(li);
        });
    }

    function syncRows() {
        P.services.forEach(function (s) {
            var r = rows[s.id], sel = state.selections[s.id];
            r.chk.checked = !!sel.checked;
            r.qty.value = sel.qty;
            r.li.classList.toggle('is-on', !!sel.checked);
        });
    }

    function syncControls() {
        $('cur-usd').checked = currency === 'USD';
        $('cur-pkr').checked = currency === 'PKR';
        $('template').value = state.templateId;
        $('days').value = state.requestedDeliveryDays > 0 ? state.requestedDeliveryDays : '';
        $('ai').checked = state.aiUsed;
        var r = $('support-' + state.supportOptionId);
        if (r) r.checked = true;
        buildVariance();
        syncRows();
    }

    function applyTemplate(id) {
        // Unlike the private tool (which adds to the current ticks), a project type here starts the
        // feature list over from that type's set, so the estimate always matches the label.
        state.templateId = id;
        P.services.forEach(function (s) { state.selections[s.id] = { checked: false, qty: s.default_qty }; });
        var t = P.templates.filter(function (x) { return x.id === id; })[0];
        if (t) t.mapped_service_ids.forEach(function (sid) { state.selections[sid].checked = true; });
        buildVariance();
        syncRows();
        update();
    }

    // ---- summary ---------------------------------------------------------
    var last;

    function row(tbody, label, value, cls) {
        var tr = el('tr', cls);
        tr.appendChild(el('th', null, label)).setAttribute('scope', 'row');
        tr.appendChild(el('td', null, value));
        tbody.appendChild(tr);
    }

    function templateName() {
        var t = P.templates.filter(function (x) { return x.id === state.templateId; })[0];
        return t ? t.name : 'Custom';
    }

    // Display-only split of the model's result by section; every amount still comes from CostModel.
    function breakdown(r) {
        var b = { core: 0, addon: 0, coreN: 0, addonN: 0 };
        r.lines.forEach(function (l) {
            var g = groupOf(l.id);
            b[g] += l.cost;
            b[g + 'N'] += 1;
        });
        b.options = r.surchargeAmount;
        return b;
    }

    function update() {
        var r = last = M.calculate(P, state, currency);
        var b = breakdown(r);
        var cfg = P.config, s = r.surcharges;
        var usd = currency === 'USD';
        $('usd-note').hidden = !usd;
        $('usd-note-summary').hidden = !usd;

        // per-row costs + option prices in the current currency
        P.services.forEach(function (svc) {
            var sel = state.selections[svc.id];
            rows[svc.id].cost.textContent = money(M.lineCost(svc, sel.qty > 0 ? sel.qty : 0, currency).cost);
        });
        P.supportOptions.forEach(function (o) {
            document.querySelector('[data-support="' + o.id + '"]').textContent = supportPrice(o);
        });
        $('ai-price').textContent = 'Roughly halves the build time; adds ' + cfg.ai_surcharge_pct + '% to the feature cost.';
        $('doc-detail').textContent = 'Always included; adds ' + s.docPct + '% to the feature cost.';
        $('sub-core').textContent = b.coreN + ' selected · ' + money(b.core);
        $('sub-addon').textContent = b.addonN + ' selected · ' + money(b.addon);
        $('sub-options').textContent = '+' + s.totalPct + '% · ' + money(b.options);
        var so = r.support.option;
        $('sub-support').textContent = !so || so.type === 'none' ? 'None' : (so.type === 'onetime' ? money(r.support.onetime) : 'Billed separately');

        var days = s.effectiveDays;
        $('rush-hint').textContent = r.totalHours > 0
            ? 'A deadline of ' + num(s.rushThreshold) + ' days or less counts as rush delivery and adds ' + cfg.rush_surcharge_pct + '%.' + (s.rushApplied ? ' Your deadline is in that range.' : '')
            : 'A deadline under half the estimated build time counts as rush delivery and adds ' + cfg.rush_surcharge_pct + '%.';

        // effort
        var effort = $('effort');
        effort.textContent = '';
        if (r.totalHours > 0) {
            effort.appendChild(document.createTextNode('Estimated effort: '));
            effort.appendChild(el('strong', null, num(r.totalHours) + ' hours'));
            effort.appendChild(document.createTextNode(' (about ' + num(days) + ' working days' + (state.aiUsed ? ' with AI assistance' : '') + ')'));
        }

        // lines
        var host = $('sum-lines');
        host.textContent = '';
        if (!r.lines.length) {
            host.appendChild(el('p', 'sum-empty', 'Pick a project type or tick a feature to see your estimate.'));
        }
        GROUPS.forEach(function (g) {
            var lines = r.lines.filter(function (l) { return groupOf(l.id) === g[0]; });
            if (!lines.length) return;
            host.appendChild(el('h3', 'sum-group is-' + g[0], g[1]));
            var ul = el('ul');
            lines.forEach(function (l) {
                var li = el('li');
                li.appendChild(el('span', null, l.name + (l.qty !== 1 ? ' × ' + num(l.qty) : '')));
                li.appendChild(el('span', null, money(l.cost)));
                ul.appendChild(li);
            });
            host.appendChild(ul);
        });

        // totals
        var tb = $('sum-table');
        tb.textContent = '';
        row(tb, 'Core features', money(b.core), 'is-sub is-core');
        row(tb, 'Add-ons and extras', money(b.addon), 'is-sub is-addon');
        row(tb, 'Delivery options', money(b.options), 'is-sub is-options');
        row(tb, 'Documentation (' + s.docPct + '%)', money(r.docAmount), 'is-part');
        if (s.aiApplied) row(tb, 'AI-assisted development (' + s.aiPct + '%)', money(r.aiAmount), 'is-part');
        if (s.rushApplied) row(tb, 'Rush delivery (' + s.rushPct + '%)', money(r.rushAmount), 'is-part');
        row(tb, 'Support (one-time)', money(r.support.onetime), 'is-sub is-support');
        row(tb, 'Estimated total', money(r.grandTotal), 'is-total');
        $('dock-total').textContent = money(r.grandTotal);

        // extras: ongoing support, payment schedule, third-party costs
        var ex = $('sum-extra');
        ex.textContent = '';
        function extra(label, text) {
            var p = el('p', 'sum-extra');
            p.appendChild(el('strong', null, label + ' '));
            p.appendChild(document.createTextNode(text));
            ex.appendChild(p);
        }
        if (r.support.monthly) extra('Plus monthly support:', money(r.support.monthly) + ' per month after launch.');
        if (r.support.hourly != null) extra('Support after launch:', money(r.support.hourly) + ' per hour, only when used.');
        if (r.grandTotal > 0) {
            var sp = cfg.payment_schedule_pct || [40, 30, 30];
            extra('Payment:', sp[0] + '% advance (' + money(r.grandTotal * sp[0] / 100) + '), ' + sp[1] + '% mid-project, ' + sp[2] + '% on delivery.');
        }
        var third = r.lines.filter(function (l) { return byId[l.id].pass_through_note; });
        if (third.length) extra('Not included:', 'third-party costs such as domain, hosting or API subscriptions are paid at cost; the prices above are for the work only.');

        $('mail').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Project estimate: ' + templateName() + ' (' + money(r.grandTotal) + ')') + '&body=' + encodeURIComponent(summaryText(r));
        $('copy-status').textContent = '';
    }

    function summaryText(r) {
        var s = r.surcharges, L = [];
        L.push('Hi Tabish,', '', "I'd like to discuss a project. Here is the estimate from your cost calculator:", '');
        L.push('Project type: ' + templateName());
        L.push('Currency: ' + currency);
        GROUPS.forEach(function (g) {
            var lines = r.lines.filter(function (l) { return groupOf(l.id) === g[0]; });
            if (!lines.length) return;
            L.push('', g[1] + ':');
            lines.forEach(function (l) { L.push('- ' + l.name + ' x ' + num(l.qty) + ' (' + l.unit + '): ' + money(l.cost)); });
        });
        L.push('');
        if (r.totalHours > 0) L.push('Estimated effort: ' + num(r.totalHours) + ' hours (about ' + num(s.effectiveDays) + ' working days)');
        L.push('Delivery needed within: ' + (state.requestedDeliveryDays > 0 ? num(state.requestedDeliveryDays) + ' days' : 'flexible'));
        L.push('AI-assisted development: ' + (state.aiUsed ? 'yes' : 'no'));
        var b = breakdown(r);
        L.push('', 'Core features: ' + money(b.core));
        L.push('Add-ons and extras: ' + money(b.addon));
        L.push('Delivery options: ' + money(b.options));
        L.push('  Documentation (' + s.docPct + '%): ' + money(r.docAmount));
        if (s.aiApplied) L.push('  AI-assisted development (' + s.aiPct + '%): ' + money(r.aiAmount));
        if (s.rushApplied) L.push('  Rush delivery (' + s.rushPct + '%): ' + money(r.rushAmount));
        L.push('Support (one-time): ' + money(r.support.onetime));
        var o = r.support.option;
        if (o && o.type !== 'none') L.push('Support chosen: ' + supportLabel(o) + ', ' + supportPrice(o));
        L.push('Estimated total: ' + money(r.grandTotal));
        if (currency === 'USD') L.push('', 'Note: ' + USD_NOTE);
        L.push('', 'Estimate from ' + PAGE_URL + ' (indicative, not a binding quote).', '', 'My name:', 'About the project:', '');
        return L.join('\n');
    }

    // ---- wire up ---------------------------------------------------------
    function init() {
        state = freshState();
        buildTemplates();
        buildServices();
        buildSupport();

        Array.prototype.forEach.call(document.querySelectorAll('input[name="currency"]'), function (r) {
            r.addEventListener('change', function () { currency = r.value === 'PKR' ? 'PKR' : 'USD'; update(); });
        });
        $('days').addEventListener('input', function () {
            var v = parseFloat($('days').value);
            state.requestedDeliveryDays = v > 0 ? v : 0;
            update();
        });
        $('ai').addEventListener('change', function () { state.aiUsed = $('ai').checked; update(); });
        $('calc-form').addEventListener('submit', function (e) { e.preventDefault(); });
        $('reset').addEventListener('click', function () {
            state = freshState();
            syncControls();
            update();
        });
        $('copy').addEventListener('click', function () {
            var text = summaryText(last);
            function done(ok) { $('copy-status').textContent = ok ? 'Estimate copied. Paste it into an email or message to me.' : 'Copy failed; please select and copy the summary manually.'; }
            function fallback() {
                var ta = el('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.className = 'visually-hidden';
                document.body.appendChild(ta);
                ta.select();
                var ok = false;
                try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
                document.body.removeChild(ta);
                done(ok);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
            } else {
                fallback();
            }
        });

        // Phones: hide the total bar while the full summary is on screen (it would cover its buttons).
        var dock = document.querySelector('.calc-dock');
        if (dock && 'IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                dock.classList.toggle('is-hidden', entries[0].isIntersecting);
            }).observe($('summary'));
        }

        syncControls();
        update();
    }

    init();
})();
