// Applies assets/js/apps-data.js to every element with data-app="<slug>":
// - playUrl set    -> the disabled "Coming soon to Google Play" badge becomes a live Play link.
// - testingUrl set -> every .app-test-link gets it as href; empty -> .app-test-link / .app-test-help
//                     are removed, and so is a .beta-item row; #beta-test hides when no row is left.
// Also points every .play-dev-link at window.ENTITY_PLAY_DEVELOPER_URL (the Google Play developer page).
(function () {
    var dev = (window.ENTITY_PLAY_DEVELOPER_URL || '').trim();
    if (dev) document.querySelectorAll('.play-dev-link').forEach(function (a) { a.href = dev; });
    var apps = window.ENTITY_APPS || {};
    document.querySelectorAll('[data-app]').forEach(function (el) {
        var app = apps[el.getAttribute('data-app')] || {};
        var test = (app.testingUrl || '').trim();
        if (test) {
            el.querySelectorAll('.app-test-link').forEach(function (a) { a.href = test; });
        } else if (el.classList.contains('beta-item')) {
            el.remove();
        } else {
            el.querySelectorAll('.app-test-link, .app-test-help').forEach(function (a) { a.remove(); });
        }
        var url = (app.playUrl || '').trim();
        var badge = el.querySelector('.app-store-badge:not(.app-test-link)');
        if (!url || !badge) return;
        var link = document.createElement('a');
        link.className = badge.className + ' is-live';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.innerHTML = '<i class="fab fa-google-play"></i> Get it on Google Play';
        badge.replaceWith(link);
    });
    var help = document.getElementById('beta-test');
    if (help && !help.querySelector('.beta-item')) help.hidden = true;
})();
