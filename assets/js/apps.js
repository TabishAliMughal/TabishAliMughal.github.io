// Turns the disabled "Coming soon to Google Play" badge into a live link for every
// element with data-app="<slug>" whose URL is set in assets/js/apps-data.js.
// Also points every .play-dev-link at window.ENTITY_PLAY_DEVELOPER_URL (the Google Play developer page).
(function () {
    var dev = (window.ENTITY_PLAY_DEVELOPER_URL || '').trim();
    if (dev) document.querySelectorAll('.play-dev-link').forEach(function (a) { a.href = dev; });
    var urls = window.ENTITY_PLAY_URLS || {};
    document.querySelectorAll('[data-app]').forEach(function (el) {
        var url = (urls[el.getAttribute('data-app')] || '').trim();
        var badge = el.querySelector('.app-store-badge');
        if (!url || !badge) return;
        var link = document.createElement('a');
        link.className = badge.className + ' is-live';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.innerHTML = '<i class="fab fa-google-play"></i> Get it on Google Play';
        badge.replaceWith(link);
    });
})();
