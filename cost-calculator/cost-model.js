/* Cost formula for the public calculator - a port of Entity-CostCalculator_finance/lib/Calculator.php
   (and its JS mirror assets/js/costmodel.js). Pure functions, no DOM: the page (calculator.js) and the
   PHP-parity check both call it. Keep the arithmetic identical to the PHP; the only differences are
   what is left out on purpose for a public page: no discount and no pass-through cost input.

   cost per line:  flat      hours = base_hours * qty
                   tiered    hours = max(0, qty - tiered_free) * base_hours   (training sessions)
                   estimated hours = qty * base_hours                         (qty is the hour estimate)
                   cost = hours * rate_<currency>   (fixed per-currency rates, never converted)
   surcharges:     documentation % always; AI % if AI-assisted; rush % if the requested delivery days
                   are > 0 and <= half the effective estimated days (estimated days are halved with AI);
                   all applied to the feature subtotal.
   total:          features + surcharges + one-time support fee. Monthly / hourly support are shown
                   separately, never added in. */
(function (root) {
    'use strict';

    function rateOf(svc, currency) {
        return currency === 'PKR' ? svc.rate_pkr : svc.rate_usd;
    }

    function supportAmountOf(opt, field, currency) {
        var v = opt[field + (currency === 'PKR' ? '_pkr' : '_usd')];
        return typeof v === 'number' ? v : 0;
    }

    function lineCost(svc, qty, currency) {
        var hours;
        if (svc.pricing_model === 'tiered') {
            var free = svc.tiered_free != null ? svc.tiered_free : 2;
            hours = Math.max(0, qty - free) * svc.base_hours;
        } else if (svc.pricing_model === 'estimated') {
            hours = qty * svc.base_hours;
        } else {
            hours = svc.base_hours * qty;
        }
        var rate = rateOf(svc, currency);
        return { hours: hours, cost: hours * rate, rate: rate };
    }

    function computeSurcharges(baseHours, requestedDays, aiUsed, config) {
        var whpd = config.working_hours_per_day > 0 ? config.working_hours_per_day : 8;
        var baseDays = baseHours / whpd;
        var effectiveDays = aiUsed ? baseDays / 2 : baseDays;
        var rushThreshold = effectiveDays / 2;
        var rushApplied = requestedDays > 0 && requestedDays <= rushThreshold;
        var docPct = config.documentation_surcharge_pct != null ? config.documentation_surcharge_pct : 5;
        var rushPct = rushApplied ? (config.rush_surcharge_pct != null ? config.rush_surcharge_pct : 20) : 0;
        var aiPct = aiUsed ? (config.ai_surcharge_pct != null ? config.ai_surcharge_pct : 10) : 0;
        return {
            baseDays: baseDays, effectiveDays: effectiveDays, rushThreshold: rushThreshold,
            rushApplied: rushApplied, aiApplied: !!aiUsed,
            docPct: docPct, rushPct: rushPct, aiPct: aiPct,
            totalPct: docPct + rushPct + aiPct
        };
    }

    /**
     * @param pricing  window.COST_PRICING (generated pricing-data.js)
     * @param state    { selections: {id: {checked, qty}}, requestedDeliveryDays, aiUsed, supportOptionId }
     * @param currency 'USD' | 'PKR'
     */
    function calculate(pricing, state, currency) {
        currency = currency === 'PKR' ? 'PKR' : 'USD';
        var lines = [];
        var featureSubtotal = 0, totalHours = 0;

        pricing.services.forEach(function (svc) {
            var sel = state.selections[svc.id];
            if (!sel || !sel.checked || !(sel.qty > 0)) return;
            var lc = lineCost(svc, sel.qty, currency);
            featureSubtotal += lc.cost;
            totalHours += lc.hours;
            lines.push({ id: svc.id, name: svc.name, unit: svc.unit_label, qty: sel.qty, hours: lc.hours, cost: lc.cost });
        });

        var s = computeSurcharges(totalHours, Number(state.requestedDeliveryDays) || 0, !!state.aiUsed, pricing.config);
        var surchargeAmount = featureSubtotal * (s.totalPct / 100);

        var opt = pricing.supportOptions.filter(function (o) { return o.id === state.supportOptionId; })[0];
        var onetime = 0, monthly = 0, hourly = null;
        if (opt) {
            if (opt.type === 'onetime') onetime = supportAmountOf(opt, 'fee', currency);
            else if (opt.type === 'monthly') monthly = supportAmountOf(opt, 'rate', currency);
            else if (opt.type === 'hourly') hourly = supportAmountOf(opt, 'rate', currency);
        }

        return {
            currency: currency,
            lines: lines,
            totalHours: totalHours,
            featureSubtotal: featureSubtotal,
            surcharges: s,
            docAmount: featureSubtotal * s.docPct / 100,
            rushAmount: featureSubtotal * s.rushPct / 100,
            aiAmount: featureSubtotal * s.aiPct / 100,
            surchargeAmount: surchargeAmount,
            support: { option: opt || null, onetime: onetime, monthly: monthly, hourly: hourly },
            grandTotal: featureSubtotal + surchargeAmount + onetime
        };
    }

    var api = { rateOf: rateOf, lineCost: lineCost, computeSurcharges: computeSurcharges, calculate: calculate };
    root.CostModel = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
